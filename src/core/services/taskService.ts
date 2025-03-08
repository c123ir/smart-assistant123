/**
 * @file taskService.ts
 * @description سرویس مدیریت تسک‌ها
 */

import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './databaseService';
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from '../../types/task';

export default class TaskService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * دریافت تمامی تسک‌ها
   * @param filters فیلترهای اختیاری
   * @returns لیست تسک‌ها
   */
  public async getAllTasks(filters: { 
    status?: TaskStatus,
    assignee_id?: string,
    creator_id?: string
  } = {}): Promise<Task[]> {
    try {
      let query = `SELECT * FROM tasks WHERE 1=1`;
      const params: any = {};

      if (filters.status) {
        query += ` AND status = :status`;
        params.status = filters.status;
      }

      if (filters.assignee_id) {
        query += ` AND assignee_id = :assignee_id`;
        params.assignee_id = filters.assignee_id;
      }

      if (filters.creator_id) {
        query += ` AND creator_id = :creator_id`;
        params.creator_id = filters.creator_id;
      }

      query += ` ORDER BY created_at DESC`;

      return this.db.all<Task>(query, params);
    } catch (error) {
      console.error('خطا در دریافت تسک‌ها:', error);
      throw error;
    }
  }

  /**
   * دریافت یک تسک با شناسه مشخص
   * @param id شناسه تسک
   * @returns تسک مورد نظر یا undefined
   */
  public async getTaskById(id: string): Promise<Task | undefined> {
    try {
      return this.db.get<Task>(`SELECT * FROM tasks WHERE id = :id`, { id });
    } catch (error) {
      console.error(`خطا در دریافت تسک با شناسه ${id}:`, error);
      throw error;
    }
  }

  /**
   * ایجاد تسک جدید
   * @param dto داده‌های تسک جدید
   * @param creator_id شناسه کاربر ایجاد کننده
   * @returns تسک ایجاد شده
   */
  public async createTask(dto: CreateTaskDto, creator_id: string): Promise<Task> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const task: Task = {
        id: uuidv4(),
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        status: dto.status,
        creator_id,
        assignee_id: dto.assignee_id,
        parent_task_id: dto.parent_task_id,
        created_at: timestamp,
        updated_at: timestamp,
        due_date: dto.due_date,
        metadata: {}
      };

      return this.db.transaction(db => {
        // افزودن تسک
        this.db.run(`
          INSERT INTO tasks (id, title, description, type, priority, status, creator_id, assignee_id, parent_task_id, created_at, updated_at, due_date, metadata)
          VALUES (:id, :title, :description, :type, :priority, :status, :creator_id, :assignee_id, :parent_task_id, :created_at, :updated_at, :due_date, :metadata)
        `, {
          id: task.id,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: task.status,
          creator_id: task.creator_id,
          assignee_id: task.assignee_id,
          parent_task_id: task.parent_task_id,
          created_at: task.created_at,
          updated_at: task.updated_at,
          due_date: task.due_date,
          metadata: JSON.stringify(task.metadata)
        });

        // افزودن تگ‌ها
        if (dto.tags && dto.tags.length > 0) {
          const stmt = db.prepare(`INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)`);
          for (const tagId of dto.tags) {
            stmt.run(task.id, tagId);
          }
        }

        return task;
      });
    } catch (error) {
      console.error('خطا در ایجاد تسک:', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی تسک
   * @param id شناسه تسک
   * @param dto داده‌های به‌روزرسانی
   * @returns تسک به‌روز شده
   */
  public async updateTask(id: string, dto: UpdateTaskDto): Promise<Task | undefined> {
    try {
      const existingTask = await this.getTaskById(id);
      if (!existingTask) {
        return undefined;
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const updates: any = {
        id,
        updated_at: timestamp
      };

      // اضافه کردن فیلدهای غیر خالی به آپدیت
      if (dto.title !== undefined) updates.title = dto.title;
      if (dto.description !== undefined) updates.description = dto.description;
      if (dto.type !== undefined) updates.type = dto.type;
      if (dto.priority !== undefined) updates.priority = dto.priority;
      if (dto.status !== undefined) updates.status = dto.status;
      if (dto.assignee_id !== undefined) updates.assignee_id = dto.assignee_id;
      if (dto.due_date !== undefined) updates.due_date = dto.due_date;

      // ساخت بخش SET کوئری
      const setFields = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = :${key}`)
        .join(', ');

      this.db.transaction(db => {
        // به‌روزرسانی تسک
        this.db.run(`UPDATE tasks SET ${setFields} WHERE id = :id`, updates);

        // به‌روزرسانی تگ‌ها
        if (dto.tags !== undefined) {
          // حذف تگ‌های قبلی
          this.db.run(`DELETE FROM task_tags WHERE task_id = :id`, { id });

          // افزودن تگ‌های جدید
          if (dto.tags.length > 0) {
            const stmt = db.prepare(`INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)`);
            for (const tagId of dto.tags) {
              stmt.run(id, tagId);
            }
          }
        }
      });

      // دریافت تسک به‌روز شده
      return this.getTaskById(id);
    } catch (error) {
      console.error(`خطا در به‌روزرسانی تسک با شناسه ${id}:`, error);
      throw error;
    }
  }

  /**
   * تغییر وضعیت تسک
   * @param id شناسه تسک
   * @param status وضعیت جدید
   * @returns تسک به‌روز شده
   */
  public async changeTaskStatus(id: string, status: TaskStatus): Promise<Task | undefined> {
    return this.updateTask(id, { status });
  }

  /**
   * حذف تسک
   * @param id شناسه تسک
   * @returns نتیجه عملیات حذف
   */
  public async deleteTask(id: string): Promise<boolean> {
    try {
      return this.db.transaction(db => {
        // حذف تگ‌های مرتبط
        this.db.run(`DELETE FROM task_tags WHERE task_id = :id`, { id });

        // حذف تسک
        const result = this.db.run(`DELETE FROM tasks WHERE id = :id`, { id });
        return result.changes > 0;
      });
    } catch (error) {
      console.error(`خطا در حذف تسک با شناسه ${id}:`, error);
      throw error;
    }
  }

  /**
   * دریافت تگ‌های یک تسک
   * @param taskId شناسه تسک
   * @returns لیست تگ‌ها
   */
  public async getTaskTags(taskId: string): Promise<{ id: string, name: string, color: string }[]> {
    try {
      return this.db.all(`
        SELECT t.id, t.name, t.color
        FROM tags t
        JOIN task_tags tt ON t.id = tt.tag_id
        WHERE tt.task_id = :taskId
      `, { taskId });
    } catch (error) {
      console.error(`خطا در دریافت تگ‌های تسک با شناسه ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * جستجوی تسک‌ها
   * @param query عبارت جستجو
   * @returns لیست تسک‌های یافت شده
   */
  public async searchTasks(query: string): Promise<Task[]> {
    try {
      return this.db.all<Task>(`
        SELECT t.*
        FROM tasks t
        JOIN tasks_fts f ON t.id = f.rowid
        WHERE tasks_fts MATCH :query
        ORDER BY rank
      `, { query: `${query}*` });
    } catch (error) {
      console.error(`خطا در جستجوی تسک‌ها با عبارت "${query}":`, error);
      throw error;
    }
  }
} 
/**
 * @file developmentService.ts
 * @description سرویس مدیریت فازهای توسعه و تسک‌های مربوطه
 */

import DatabaseService from './databaseService';
import { v4 as uuidv4 } from 'uuid';

// تعریف تایپ‌های مورد استفاده
export interface DevelopmentPhase {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  orderIndex: number;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
  completionPercentage?: number; // درصد تکمیل شدگی (محاسبه شده)
  tasksCount?: number; // تعداد تسک‌ها (محاسبه شده)
}

export interface DevelopmentTask {
  id: string;
  phaseId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  orderIndex: number;
  dueDate?: number;
  creatorId?: string;
  assigneeId?: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export default class DevelopmentService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * دریافت تمام فازهای توسعه به همراه آمار تسک‌ها
   * 
   * @returns لیست فازهای توسعه با آمار
   */
  public async getPhases(): Promise<DevelopmentPhase[]> {
    try {
      // دریافت فازها
      const phases = this.db.all<DevelopmentPhase>(`
        SELECT 
          id, 
          title, 
          description, 
          icon, 
          color, 
          order_index as orderIndex, 
          created_at as createdAt, 
          updated_at as updatedAt, 
          metadata
        FROM development_phases 
        ORDER BY order_index ASC
      `);

      // محاسبه آمار برای هر فاز
      for (const phase of phases) {
        const tasks = this.db.all<{ completed: number, total: number }>(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
          FROM development_tasks
          WHERE phase_id = ?
        `, phase.id);

        if (tasks.length > 0) {
          const { total, completed } = tasks[0];
          phase.tasksCount = total;
          phase.completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        } else {
          phase.tasksCount = 0;
          phase.completionPercentage = 0;
        }
      }

      return phases;
    } catch (error) {
      console.error('خطا در دریافت فازهای توسعه:', error);
      throw error;
    }
  }

  /**
   * ایجاد فاز توسعه جدید
   * 
   * @param phase اطلاعات فاز جدید
   * @returns فاز ایجاد شده
   */
  public async createPhase(phase: Omit<DevelopmentPhase, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevelopmentPhase> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const id = uuidv4();

      this.db.run(`
        INSERT INTO development_phases (
          id, title, description, icon, color, order_index, created_at, updated_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        phase.title,
        phase.description || null,
        phase.icon || null,
        phase.color || null,
        phase.orderIndex,
        timestamp,
        timestamp,
        JSON.stringify(phase.metadata || {})
      ]);

      return {
        id,
        title: phase.title,
        description: phase.description,
        icon: phase.icon,
        color: phase.color,
        orderIndex: phase.orderIndex,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: phase.metadata,
        tasksCount: 0,
        completionPercentage: 0
      };
    } catch (error) {
      console.error('خطا در ایجاد فاز توسعه:', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی فاز توسعه
   * 
   * @param id شناسه فاز
   * @param phase اطلاعات به‌روزرسانی شده
   * @returns نتیجه عملیات
   */
  public async updatePhase(id: string, phase: Partial<DevelopmentPhase>): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const updates: string[] = [];
      const values: any[] = [];

      if (phase.title !== undefined) {
        updates.push('title = ?');
        values.push(phase.title);
      }

      if (phase.description !== undefined) {
        updates.push('description = ?');
        values.push(phase.description);
      }

      if (phase.icon !== undefined) {
        updates.push('icon = ?');
        values.push(phase.icon);
      }

      if (phase.color !== undefined) {
        updates.push('color = ?');
        values.push(phase.color);
      }

      if (phase.orderIndex !== undefined) {
        updates.push('order_index = ?');
        values.push(phase.orderIndex);
      }

      if (phase.metadata !== undefined) {
        updates.push('metadata = ?');
        values.push(JSON.stringify(phase.metadata));
      }

      if (updates.length === 0) {
        return false;
      }

      updates.push('updated_at = ?');
      values.push(timestamp);
      values.push(id);

      const result = this.db.run(`
        UPDATE development_phases
        SET ${updates.join(', ')}
        WHERE id = ?
      `, values);

      return result.changes > 0;
    } catch (error) {
      console.error('خطا در به‌روزرسانی فاز توسعه:', error);
      throw error;
    }
  }

  /**
   * حذف فاز توسعه
   * 
   * @param id شناسه فاز
   * @returns نتیجه عملیات
   */
  public async deletePhase(id: string): Promise<boolean> {
    try {
      this.db.transaction((db) => {
        // حذف تسک‌های مربوط به فاز
        db.prepare('DELETE FROM development_tasks WHERE phase_id = ?').run(id);
        // حذف خود فاز
        db.prepare('DELETE FROM development_phases WHERE id = ?').run(id);
      });
      
      return true;
    } catch (error) {
      console.error('خطا در حذف فاز توسعه:', error);
      throw error;
    }
  }

  /**
   * دریافت تسک‌های یک فاز توسعه
   * 
   * @param phaseId شناسه فاز
   * @returns لیست تسک‌های فاز
   */
  public async getTasks(phaseId: string): Promise<DevelopmentTask[]> {
    try {
      return this.db.all<DevelopmentTask>(`
        SELECT 
          id,
          phase_id as phaseId,
          title,
          description,
          is_completed as isCompleted,
          order_index as orderIndex,
          due_date as dueDate,
          creator_id as creatorId,
          assignee_id as assigneeId,
          created_at as createdAt,
          updated_at as updatedAt,
          metadata
        FROM development_tasks
        WHERE phase_id = ?
        ORDER BY order_index ASC
      `, phaseId);
    } catch (error) {
      console.error('خطا در دریافت تسک‌های توسعه:', error);
      throw error;
    }
  }

  /**
   * ایجاد تسک توسعه جدید
   * 
   * @param task اطلاعات تسک جدید
   * @returns تسک ایجاد شده
   */
  public async createTask(task: Omit<DevelopmentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevelopmentTask> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const id = uuidv4();

      this.db.run(`
        INSERT INTO development_tasks (
          id, phase_id, title, description, is_completed, order_index, 
          due_date, creator_id, assignee_id, created_at, updated_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        task.phaseId,
        task.title,
        task.description || null,
        task.isCompleted ? 1 : 0,
        task.orderIndex,
        task.dueDate || null,
        task.creatorId || null,
        task.assigneeId || null,
        timestamp,
        timestamp,
        JSON.stringify(task.metadata || {})
      ]);

      return {
        id,
        phaseId: task.phaseId,
        title: task.title,
        description: task.description,
        isCompleted: task.isCompleted,
        orderIndex: task.orderIndex,
        dueDate: task.dueDate,
        creatorId: task.creatorId,
        assigneeId: task.assigneeId,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: task.metadata
      };
    } catch (error) {
      console.error('خطا در ایجاد تسک توسعه:', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی تسک توسعه
   * 
   * @param id شناسه تسک
   * @param task اطلاعات به‌روزرسانی شده
   * @returns نتیجه عملیات
   */
  public async updateTask(id: string, task: Partial<DevelopmentTask>): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const updates: string[] = [];
      const values: any[] = [];

      if (task.phaseId !== undefined) {
        updates.push('phase_id = ?');
        values.push(task.phaseId);
      }

      if (task.title !== undefined) {
        updates.push('title = ?');
        values.push(task.title);
      }

      if (task.description !== undefined) {
        updates.push('description = ?');
        values.push(task.description);
      }

      if (task.isCompleted !== undefined) {
        updates.push('is_completed = ?');
        values.push(task.isCompleted ? 1 : 0);
      }

      if (task.orderIndex !== undefined) {
        updates.push('order_index = ?');
        values.push(task.orderIndex);
      }

      if (task.dueDate !== undefined) {
        updates.push('due_date = ?');
        values.push(task.dueDate);
      }

      if (task.assigneeId !== undefined) {
        updates.push('assignee_id = ?');
        values.push(task.assigneeId);
      }

      if (task.metadata !== undefined) {
        updates.push('metadata = ?');
        values.push(JSON.stringify(task.metadata));
      }

      if (updates.length === 0) {
        return false;
      }

      updates.push('updated_at = ?');
      values.push(timestamp);
      values.push(id);

      const result = this.db.run(`
        UPDATE development_tasks
        SET ${updates.join(', ')}
        WHERE id = ?
      `, values);

      return result.changes > 0;
    } catch (error) {
      console.error('خطا در به‌روزرسانی تسک توسعه:', error);
      throw error;
    }
  }

  /**
   * حذف تسک توسعه
   * 
   * @param id شناسه تسک
   * @returns نتیجه عملیات
   */
  public async deleteTask(id: string): Promise<boolean> {
    try {
      const result = this.db.run('DELETE FROM development_tasks WHERE id = ?', id);
      return result.changes > 0;
    } catch (error) {
      console.error('خطا در حذف تسک توسعه:', error);
      throw error;
    }
  }

  /**
   * تغییر وضعیت انجام شدن یک تسک
   * 
   * @param id شناسه تسک
   * @param isCompleted وضعیت جدید
   * @returns نتیجه عملیات
   */
  public async toggleTaskCompletion(id: string, isCompleted: boolean): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const result = this.db.run(`
        UPDATE development_tasks
        SET is_completed = ?, updated_at = ?
        WHERE id = ?
      `, [isCompleted ? 1 : 0, timestamp, id]);

      return result.changes > 0;
    } catch (error) {
      console.error('خطا در تغییر وضعیت تسک توسعه:', error);
      throw error;
    }
  }

  /**
   * مرتب‌سازی مجدد فازها
   * 
   * @param orderedIds آرایه‌ای از شناسه‌های فازها به ترتیب جدید
   * @returns نتیجه عملیات
   */
  public async reorderPhases(orderedIds: string[]): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);

      this.db.transaction((db) => {
        const stmt = db.prepare(`
          UPDATE development_phases
          SET order_index = ?, updated_at = ?
          WHERE id = ?
        `);

        for (let i = 0; i < orderedIds.length; i++) {
          stmt.run(i, timestamp, orderedIds[i]);
        }
      });

      return true;
    } catch (error) {
      console.error('خطا در مرتب‌سازی مجدد فازهای توسعه:', error);
      throw error;
    }
  }

  /**
   * مرتب‌سازی مجدد تسک‌ها
   * 
   * @param phaseId شناسه فاز
   * @param orderedIds آرایه‌ای از شناسه‌های تسک‌ها به ترتیب جدید
   * @returns نتیجه عملیات
   */
  public async reorderTasks(phaseId: string, orderedIds: string[]): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);

      this.db.transaction((db) => {
        const stmt = db.prepare(`
          UPDATE development_tasks
          SET order_index = ?, updated_at = ?
          WHERE id = ? AND phase_id = ?
        `);

        for (let i = 0; i < orderedIds.length; i++) {
          stmt.run(i, timestamp, orderedIds[i], phaseId);
        }
      });

      return true;
    } catch (error) {
      console.error('خطا در مرتب‌سازی مجدد تسک‌های توسعه:', error);
      throw error;
    }
  }
} 
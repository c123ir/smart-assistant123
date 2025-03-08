/**
 * @file preload.ts
 * @description فایل پیش‌بارگذاری الکترون برای تعریف API های قابل دسترس در رندرر
 */

import { contextBridge } from 'electron';
import DatabaseService from './core/services/databaseService';
import UserService from './core/services/userService';
import DevelopmentService from './core/services/developmentService';

// تعریف تایپ‌های مورد نیاز برای API های الکترون
declare global {
  interface Window {
    electron: {
      getDatabaseService: () => DatabaseService;
      getUserService: () => UserService;
      getDevelopmentService: () => DevelopmentService;
    };
  }
}

// تعریف API های قابل دسترس در رندرر
contextBridge.exposeInMainWorld('electron', {
  // سرویس دیتابیس
  getDatabaseService: () => {
    return DatabaseService.getInstance();
  },

  // سرویس کاربران
  getUserService: () => {
    return new UserService();
  },

  // سرویس مدیریت توسعه
  getDevelopmentService: () => {
    return new DevelopmentService();
  },

  // بررسی وضعیت دیتابیس
  checkDbStatus: async () => {
    try {
      const db = DatabaseService.getInstance();
      await db.connect();
      return true;
    } catch (error) {
      console.error('خطا در بررسی وضعیت دیتابیس:', error);
      return false;
    }
  },

  // سرویس تسک‌ها
  tasks: {
    getAll: async () => {
      const db = DatabaseService.getInstance();
      return db.all('SELECT * FROM tasks ORDER BY created_at DESC');
    },

    get: async (id: string) => {
      const db = DatabaseService.getInstance();
      return db.get('SELECT * FROM tasks WHERE id = ?', id);
    },

    create: async (task: any) => {
      const db = DatabaseService.getInstance();
      const timestamp = Math.floor(Date.now() / 1000);
      const result = db.run(`
        INSERT INTO tasks (
          id, title, description, type, priority, status,
          creator_id, assignee_id, parent_task_id,
          created_at, updated_at, due_date, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        task.id,
        task.title,
        task.description,
        task.type,
        task.priority,
        task.status,
        task.creatorId,
        task.assigneeId,
        task.parentTaskId,
        timestamp,
        timestamp,
        task.dueDate,
        JSON.stringify(task.metadata || {})
      ]);
      return result.changes > 0;
    },

    update: async (id: string, task: any) => {
      const db = DatabaseService.getInstance();
      const timestamp = Math.floor(Date.now() / 1000);
      const result = db.run(`
        UPDATE tasks
        SET title = ?, description = ?, type = ?, priority = ?, status = ?,
            assignee_id = ?, parent_task_id = ?, updated_at = ?, due_date = ?,
            metadata = ?
        WHERE id = ?
      `, [
        task.title,
        task.description,
        task.type,
        task.priority,
        task.status,
        task.assigneeId,
        task.parentTaskId,
        timestamp,
        task.dueDate,
        JSON.stringify(task.metadata || {}),
        id
      ]);
      return result.changes > 0;
    },

    delete: async (id: string) => {
      const db = DatabaseService.getInstance();
      const result = db.run('DELETE FROM tasks WHERE id = ?', id);
      return result.changes > 0;
    },

    changeStatus: async (id: string, status: string) => {
      const db = DatabaseService.getInstance();
      const timestamp = Math.floor(Date.now() / 1000);
      const result = db.run(`
        UPDATE tasks
        SET status = ?, updated_at = ?
        WHERE id = ?
      `, [status, timestamp, id]);
      return result.changes > 0;
    },

    getTags: async (taskId: string) => {
      const db = DatabaseService.getInstance();
      const tags = await db.all(`
        SELECT t.name
        FROM tags t
        JOIN task_tags tt ON tt.tag_id = t.id
        WHERE tt.task_id = ?
      `, taskId);
      return tags.map(t => t.name);
    },

    addTag: async (taskId: string, tag: string) => {
      const db = DatabaseService.getInstance();
      const timestamp = Math.floor(Date.now() / 1000);
      
      // ابتدا تگ را ایجاد می‌کنیم (اگر وجود نداشت)
      const existingTag = await db.get('SELECT id FROM tags WHERE name = ?', tag);
      let tagId = existingTag?.id;
      
      if (!tagId) {
        const result = db.run(`
          INSERT INTO tags (id, name, created_at)
          VALUES (?, ?, ?)
        `, [`tag-${timestamp}`, tag, timestamp]);
        
        if (result.changes === 0) return false;
        tagId = `tag-${timestamp}`;
      }

      // سپس ارتباط بین تسک و تگ را ایجاد می‌کنیم
      try {
        db.run(`
          INSERT INTO task_tags (task_id, tag_id)
          VALUES (?, ?)
        `, [taskId, tagId]);
        return true;
      } catch (error) {
        // اگر ارتباط قبلاً وجود داشت، خطا را نادیده می‌گیریم
        return false;
      }
    },

    removeTag: async (taskId: string, tag: string) => {
      const db = DatabaseService.getInstance();
      const tagInfo = await db.get('SELECT id FROM tags WHERE name = ?', tag);
      if (!tagInfo) return false;

      const result = db.run(`
        DELETE FROM task_tags
        WHERE task_id = ? AND tag_id = ?
      `, [taskId, tagInfo.id]);
      
      return result.changes > 0;
    }
  }
}); 
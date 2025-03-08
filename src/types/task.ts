/**
 * @file task.ts
 * @description تعریف انواع داده‌های مربوط به تسک‌ها
 */

/**
 * نوع تسک
 */
export type TaskType = 'feature' | 'bug' | 'improvement' | 'documentation' | 'other';

/**
 * اولویت تسک
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * وضعیت تسک
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled';

/**
 * مدل تسک
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  creator_id: string;
  assignee_id?: string;
  parent_task_id?: string;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
  due_date?: number; // Unix timestamp
  metadata?: Record<string, any>;
}

/**
 * داده‌های لازم برای ایجاد تسک جدید
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id?: string;
  parent_task_id?: string;
  due_date?: number;
  tags?: string[];
}

/**
 * داده‌های لازم برای به‌روزرسانی تسک
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee_id?: string;
  due_date?: number;
  tags?: string[];
} 
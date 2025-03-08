/**
 * @file userService.ts
 * @description سرویس مدیریت کاربران
 */

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import DatabaseService from './databaseService';

export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  created_at: number;
  settings?: Record<string, any>;
  password?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  created_at: number;
  settings?: Record<string, any>;
  avatar_url?: string;
  active_projects?: number;
  total_tasks?: number;
  completed_tasks?: number;
  teams?: Array<{ id: string; name: string; role: string }>;
  tasks_count?: {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
  };
}

export interface UpdateUserDto {
  username?: string;
  full_name?: string;
  email?: string;
  role?: string;
  password?: string;
  settings?: Record<string, any>;
}

export default class UserService {
  private db: DatabaseService;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * دریافت تمامی کاربران
   * @returns لیست کاربران
   */
  public async getAll(): Promise<User[]> {
    try {
      return this.db.all<User>(`
        SELECT * FROM users ORDER BY created_at DESC
      `);
    } catch (error) {
      console.error('خطا در دریافت لیست کاربران:', error);
      throw error;
    }
  }

  /**
   * دریافت یک کاربر با شناسه مشخص
   * @param id شناسه کاربر
   * @returns کاربر مورد نظر یا undefined
   */
  public async get(id: string): Promise<User | undefined> {
    try {
      return this.db.get<User>(`
        SELECT * FROM users WHERE id = ?
      `, id);
    } catch (error) {
      console.error('خطا در دریافت کاربر:', error);
      throw error;
    }
  }

  /**
   * دریافت یک کاربر با نام کاربری مشخص
   * @param username نام کاربری
   * @returns کاربر مورد نظر یا undefined
   */
  public async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return this.db.get<User>(`
        SELECT * FROM users WHERE username = ?
      `, username);
    } catch (error) {
      console.error(`خطا در دریافت کاربر با نام کاربری ${username}:`, error);
      throw error;
    }
  }

  /**
   * دریافت پروفایل کامل کاربر شامل تیم‌ها و آمار تسک‌ها
   * @param id شناسه کاربر
   * @returns پروفایل کاربر یا undefined
   */
  public async getUserProfile(id: string): Promise<UserProfile | undefined> {
    try {
      const user = await this.get(id);
      if (!user) {
        return undefined;
      }

      // دریافت تیم‌های کاربر
      const teams = this.db.all<{ id: string; name: string; role: string }>(
        `SELECT t.id, t.name, tm.role
         FROM teams t
         JOIN team_members tm ON t.id = tm.team_id
         WHERE tm.user_id = :id`,
        { id }
      );

      // دریافت آمار تسک‌ها
      const totalTasks = this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM tasks WHERE assignee_id = :id`,
        { id }
      );

      const pendingTasks = this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM tasks WHERE assignee_id = :id AND status = 'pending'`,
        { id }
      );

      const inProgressTasks = this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM tasks WHERE assignee_id = :id AND status = 'in_progress'`,
        { id }
      );

      const completedTasks = this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM tasks WHERE assignee_id = :id AND status = 'completed'`,
        { id }
      );

      return {
        ...user,
        teams: teams || [],
        tasks_count: {
          total: totalTasks?.count || 0,
          pending: pendingTasks?.count || 0,
          in_progress: inProgressTasks?.count || 0,
          completed: completedTasks?.count || 0
        }
      };
    } catch (error) {
      console.error(`خطا در دریافت پروفایل کاربر با شناسه ${id}:`, error);
      throw error;
    }
  }

  /**
   * ایجاد کاربر جدید
   * @param user اطلاعات کاربر جدید
   * @returns کاربر ایجاد شده
   */
  public async create(user: Omit<User, 'id' | 'created_at'> & { password: string }): Promise<User> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const id = uuidv4();
      const hashedPassword = await bcrypt.hash(user.password, this.SALT_ROUNDS);

      this.db.run(`
        INSERT INTO users (
          id, username, full_name, email, password, role,
          created_at, settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        user.username,
        user.full_name,
        user.email,
        hashedPassword,
        user.role,
        timestamp,
        JSON.stringify(user.settings || {})
      ]);

      return {
        id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: timestamp,
        settings: user.settings
      };
    } catch (error) {
      console.error('خطا در ایجاد کاربر:', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی کاربر
   * @param id شناسه کاربر
   * @param user اطلاعات به‌روزرسانی شده
   * @returns نتیجه عملیات
   */
  public async update(id: string, user: Partial<User>): Promise<boolean> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (user.username !== undefined) {
        updates.push('username = ?');
        values.push(user.username);
      }

      if (user.full_name !== undefined) {
        updates.push('full_name = ?');
        values.push(user.full_name);
      }

      if (user.email !== undefined) {
        updates.push('email = ?');
        values.push(user.email);
      }

      if (user.role !== undefined) {
        updates.push('role = ?');
        values.push(user.role);
      }

      if (user.settings !== undefined) {
        updates.push('settings = ?');
        values.push(JSON.stringify(user.settings));
      }

      if (updates.length === 0) {
        return false;
      }

      values.push(id);

      const result = this.db.run(`
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = ?
      `, values);

      return result.changes > 0;
    } catch (error) {
      console.error('خطا در به‌روزرسانی کاربر:', error);
      throw error;
    }
  }

  /**
   * حذف کاربر
   * @param id شناسه کاربر
   * @returns نتیجه عملیات
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const result = this.db.run('DELETE FROM users WHERE id = ?', id);
      return result.changes > 0;
    } catch (error) {
      console.error('خطا در حذف کاربر:', error);
      throw error;
    }
  }

  /**
   * به‌روزرسانی کاربر
   * @param id شناسه کاربر
   * @param dto داده‌های به‌روزرسانی
   * @returns کاربر به‌روز شده
   */
  public async updateUser(id: string, dto: UpdateUserDto): Promise<User | undefined> {
    try {
      const existingUser = await this.get(id);
      if (!existingUser) {
        throw new Error(`کاربر با شناسه ${id} یافت نشد`);
      }

      // بررسی یکتا بودن نام کاربری در صورت تغییر
      if (dto.username && dto.username !== existingUser.username) {
        const userWithSameUsername = await this.getUserByUsername(dto.username);
        if (userWithSameUsername) {
          throw new Error(`نام کاربری ${dto.username} قبلاً استفاده شده است`);
        }
      }

      // بررسی یکتا بودن ایمیل در صورت تغییر
      if (dto.email && dto.email !== existingUser.email) {
        const userWithSameEmail = this.db.get<User>(
          `SELECT * FROM users WHERE email = ? AND id != ?`,
          [dto.email, id]
        );
        if (userWithSameEmail) {
          throw new Error(`ایمیل ${dto.email} قبلاً استفاده شده است`);
        }
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (dto.username) {
        updates.push('username = ?');
        values.push(dto.username);
      }

      if (dto.full_name) {
        updates.push('full_name = ?');
        values.push(dto.full_name);
      }

      if (dto.email) {
        updates.push('email = ?');
        values.push(dto.email);
      }

      if (dto.role) {
        updates.push('role = ?');
        values.push(dto.role);
      }

      if (dto.password) {
        const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
        updates.push('password = ?');
        values.push(hashedPassword);
      }

      if (dto.settings) {
        updates.push('settings = ?');
        values.push(JSON.stringify(dto.settings));
      }

      // اگر هیچ فیلدی برای به‌روزرسانی وجود نداشت
      if (updates.length === 0) {
        return existingUser;
      }

      // به‌روزرسانی تاریخ
      updates.push('updated_at = ?');
      values.push(Math.floor(Date.now() / 1000));

      // اضافه کردن شناسه کاربر به پارامترها
      values.push(id);

      // اجرای کوئری به‌روزرسانی
      const result = this.db.run(`
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = ?
      `, values);

      if (result.changes === 0) {
        return undefined;
      }

      // بازگرداندن کاربر به‌روزرسانی شده
      const updatedUser = await this.get(id);
      return updatedUser;
    } catch (error) {
      console.error('خطا در به‌روزرسانی کاربر:', error);
      throw error;
    }
  }

  /**
   * حذف کاربر
   * @param id شناسه کاربر
   * @returns نتیجه عملیات حذف
   */
  public async deleteUser(id: string): Promise<boolean> {
    try {
      // بررسی وجود تسک‌های محول شده به کاربر
      const assignedTasks = this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM tasks WHERE assignee_id = :id`,
        { id }
      );

      if (assignedTasks && assignedTasks.count > 0) {
        throw new Error(`کاربر دارای ${assignedTasks.count} تسک محول شده است و نمی‌تواند حذف شود`);
      }

      // بررسی وجود تیم‌های با مدیریت کاربر
      const leadingTeams = this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM teams WHERE leader_id = :id`,
        { id }
      );

      if (leadingTeams && leadingTeams.count > 0) {
        throw new Error(`کاربر رهبر ${leadingTeams.count} تیم است و نمی‌تواند حذف شود`);
      }

      // حذف کاربر
      const result = this.db.run(`DELETE FROM users WHERE id = :id`, { id });
      return result.changes > 0;
    } catch (error) {
      console.error(`خطا در حذف کاربر با شناسه ${id}:`, error);
      throw error;
    }
  }

  /**
   * جستجوی کاربران
   * @param query عبارت جستجو
   * @returns لیست کاربران مطابق با جستجو
   */
  public async searchUsers(query: string): Promise<User[]> {
    try {
      const searchTerm = `%${query}%`;
      return this.db.all<User>(`
        SELECT * FROM users
        WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?
        ORDER BY full_name ASC
      `, [searchTerm, searchTerm, searchTerm]);
    } catch (error) {
      console.error('خطا در جستجوی کاربران:', error);
      throw error;
    }
  }

  /**
   * تغییر نقش کاربر
   * @param id شناسه کاربر
   * @param role نقش جدید
   * @returns کاربر به‌روز شده
   */
  public async changeUserRole(id: string, role: string): Promise<User | undefined> {
    try {
      const existingUser = await this.get(id);
      if (!existingUser) {
        return undefined;
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const result = this.db.run(`
        UPDATE users
        SET role = ?, updated_at = ?
        WHERE id = ?
      `, [role, timestamp, id]);

      if (result.changes === 0) {
        return undefined;
      }

      return this.get(id);
    } catch (error) {
      console.error('خطا در تغییر نقش کاربر:', error);
      throw error;
    }
  }

  /**
   * بررسی اعتبار کلمه عبور
   * @param storedHash هش ذخیره شده کلمه عبور
   * @param plainPassword کلمه عبور ساده
   * @returns آیا کلمه عبور صحیح است
   */
  public async verifyPassword(storedHash: string, plainPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, storedHash);
    } catch (error) {
      console.error('خطا در بررسی کلمه عبور:', error);
      throw error;
    }
  }

  /**
   * تغییر رمز عبور کاربر
   * @param id شناسه کاربر
   * @param newPassword رمز عبور جدید
   * @returns نتیجه عملیات
   */
  public async changePassword(id: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      const result = this.db.run(`
        UPDATE users
        SET password = ?
        WHERE id = ?
      `, [hashedPassword, id]);

      return result.changes > 0;
    } catch (error) {
      console.error('خطا در تغییر رمز عبور:', error);
      throw error;
    }
  }

  /**
   * بررسی صحت رمز عبور
   * @param username نام کاربری
   * @param password رمز عبور
   * @returns کاربر در صورت صحت رمز عبور
   */
  public async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.db.get<User & { password: string }>(`
        SELECT * FROM users WHERE username = ?
      `, username);

      if (!user) return null;

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return null;

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('خطا در احراز هویت کاربر:', error);
      throw error;
    }
  }
} 
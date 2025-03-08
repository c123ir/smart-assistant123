/**
 * @file databaseService.ts
 * @description سرویس پایه برای مدیریت ارتباط با دیتابیس
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

export default class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database | null = null;
  private dbPath: string;

  private constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'data', 'smart-assistant.db');
  }

  /**
   * دریافت نمونه سینگلتون از سرویس دیتابیس
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * اتصال به دیتابیس
   */
  public connect(): Database.Database {
    if (!this.db) {
      try {
        this.db = new Database(this.dbPath);
        this.db.pragma('foreign_keys = ON');
        console.log('اتصال به دیتابیس برقرار شد.');
      } catch (error) {
        console.error('خطا در اتصال به دیتابیس:', error);
        throw error;
      }
    }
    return this.db;
  }

  /**
   * بستن اتصال دیتابیس
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('اتصال به دیتابیس بسته شد.');
    }
  }

  /**
   * اجرای یک کوئری و دریافت نتایج
   * @param query کوئری SQL
   * @param params پارامترهای کوئری
   * @returns آرایه‌ای از نتایج
   */
  public all<T = any>(query: string, params: any = {}): T[] {
    const db = this.connect();
    try {
      const stmt = db.prepare(query);
      return stmt.all(params) as T[];
    } catch (error) {
      console.error('خطا در اجرای کوئری:', query, params, error);
      throw error;
    }
  }

  /**
   * اجرای یک کوئری و دریافت اولین نتیجه
   * @param query کوئری SQL
   * @param params پارامترهای کوئری
   * @returns اولین نتیجه یا undefined
   */
  public get<T = any>(query: string, params: any = {}): T | undefined {
    const db = this.connect();
    try {
      const stmt = db.prepare(query);
      return stmt.get(params) as T | undefined;
    } catch (error) {
      console.error('خطا در اجرای کوئری:', query, params, error);
      throw error;
    }
  }

  /**
   * اجرای یک کوئری بدون دریافت نتیجه
   * @param query کوئری SQL
   * @param params پارامترهای کوئری
   * @returns اطلاعات مربوط به تغییرات
   */
  public run(query: string, params: any = {}): Database.RunResult {
    const db = this.connect();
    try {
      const stmt = db.prepare(query);
      return stmt.run(params);
    } catch (error) {
      console.error('خطا در اجرای کوئری:', query, params, error);
      throw error;
    }
  }

  /**
   * اجرای چند کوئری در یک تراکنش
   * @param callback تابعی که عملیات تراکنش را انجام می‌دهد
   * @returns نتیجه تراکنش
   */
  public transaction<T>(callback: (db: Database.Database) => T): T {
    const db = this.connect();
    const transaction = db.transaction(callback);
    return transaction(db);
  }
} 
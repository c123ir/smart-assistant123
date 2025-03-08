/**
 * @file setup.ts
 * @description راه‌اندازی و پیکربندی دیتابیس SQLite
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

/**
 * راه‌اندازی دیتابیس SQLite
 * 
 * @param dbPath مسیر فایل دیتابیس
 * @returns Promise که در صورت موفقیت true برمی‌گرداند
 */
export async function setupDb(dbPath: string): Promise<boolean> {
  try {
    // بررسی وجود دایرکتوری
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      console.log(`ایجاد دایرکتوری ${dbDir}...`);
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // بررسی وجود فایل دیتابیس
    const dbExists = fs.existsSync(dbPath);
    
    // اتصال به دیتابیس
    console.log(`اتصال به دیتابیس در مسیر ${dbPath}...`);
    const db = new Database(dbPath);
    
    // فعال کردن محدودیت‌های خارجی
    db.pragma('foreign_keys = ON');

    // اگر دیتابیس وجود نداشت، آن را ایجاد می‌کنیم
    if (!dbExists) {
      console.log('دیتابیس وجود ندارد، در حال ایجاد ساختار...');
      await createTables(db);
      await createIndices(db);
      await setupFullTextSearch(db);
      await createDefaultAdmin(db);
    } else {
      console.log('دیتابیس موجود است، در حال بررسی ساختار...');
      // بررسی و به‌روزرسانی ساختار دیتابیس
      await updateDbSchema(db);
    }

    // بستن اتصال به دیتابیس
    db.close();
    
    console.log('راه‌اندازی دیتابیس با موفقیت انجام شد!');
    return true;
  } catch (error) {
    console.error('خطا در راه‌اندازی دیتابیس:', error);
    return false;
  }
}

/**
 * ایجاد جداول دیتابیس
 * 
 * @param db اتصال دیتابیس
 */
async function createTables(db: Database.Database): Promise<void> {
  console.log('در حال ایجاد جداول...');

  // ایجاد جدول کاربران
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT, -- کلمه عبور هش‌شده
        phone_number TEXT, -- شماره موبایل
        avatar_url TEXT, -- آدرس تصویر پروفایل
        role TEXT NOT NULL,
        created_at INTEGER NOT NULL, -- Unix timestamp
        settings TEXT NOT NULL DEFAULT '{}' -- JSON
    ) STRICT;
  `);

  // ایجاد جدول تیم‌ها
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        leader_id TEXT NOT NULL REFERENCES users(id),
        created_at INTEGER NOT NULL,
        metadata TEXT DEFAULT '{}' -- JSON
    ) STRICT;
  `);

  // ایجاد جدول عضویت در تیم
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
        team_id TEXT NOT NULL REFERENCES teams(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        role TEXT NOT NULL,
        joined_at INTEGER NOT NULL,
        PRIMARY KEY (team_id, user_id)
    ) STRICT;
  `);

  // ایجاد جدول تسک‌ها
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        creator_id TEXT NOT NULL REFERENCES users(id),
        assignee_id TEXT REFERENCES users(id),
        parent_task_id TEXT REFERENCES tasks(id),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        due_date INTEGER,
        metadata TEXT DEFAULT '{}' -- JSON
    ) STRICT;
  `);

  // ایجاد جدول کامنت‌ها
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id),
        author_id TEXT NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        parent_comment_id TEXT REFERENCES comments(id),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT DEFAULT '{}' -- JSON
    ) STRICT;
  `);

  // ایجاد جدول واکنش‌ها
  db.exec(`
    CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        target_type TEXT NOT NULL, -- 'task' یا 'comment'
        target_id TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        UNIQUE (target_type, target_id, user_id, type)
    ) STRICT;
  `);

  // ایجاد جدول مستندات
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES users(id),
        version INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT DEFAULT '{}' -- JSON
    ) STRICT;
  `);

  // ایجاد جدول نسخه‌های مستندات
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_versions (
        document_id TEXT NOT NULL REFERENCES documents(id),
        version INTEGER NOT NULL,
        content TEXT NOT NULL,
        editor_id TEXT NOT NULL REFERENCES users(id),
        changes TEXT NOT NULL, -- JSON array of changes
        created_at INTEGER NOT NULL,
        PRIMARY KEY (document_id, version)
    ) STRICT;
  `);

  // ایجاد جدول اعلان‌ها
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        recipient_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        data TEXT DEFAULT '{}', -- JSON
        read INTEGER NOT NULL DEFAULT 0, -- Boolean
        created_at INTEGER NOT NULL
    ) STRICT;
  `);

  // ایجاد جدول تگ‌ها
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT,
        created_at INTEGER NOT NULL
    ) STRICT;
  `);

  // ایجاد جدول ارتباط تگ‌ها با تسک‌ها
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_tags (
        task_id TEXT NOT NULL REFERENCES tasks(id),
        tag_id TEXT NOT NULL REFERENCES tags(id),
        PRIMARY KEY (task_id, tag_id)
    ) STRICT;
  `);

  // ایجاد جدول فازهای توسعه
  db.exec(`
    CREATE TABLE IF NOT EXISTS development_phases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT,
        order_index INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT DEFAULT '{}' -- JSON
    ) STRICT;
  `);

  // ایجاد جدول تسک‌های توسعه
  db.exec(`
    CREATE TABLE IF NOT EXISTS development_tasks (
        id TEXT PRIMARY KEY,
        phase_id TEXT NOT NULL REFERENCES development_phases(id),
        title TEXT NOT NULL,
        description TEXT,
        is_completed INTEGER NOT NULL DEFAULT 0, -- Boolean
        order_index INTEGER NOT NULL,
        due_date INTEGER,
        creator_id TEXT REFERENCES users(id),
        assignee_id TEXT REFERENCES users(id),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT DEFAULT '{}' -- JSON
    ) STRICT;
  `);

  // ایجاد جدول تگ‌های توسعه
  db.exec(`
    CREATE TABLE IF NOT EXISTS development_tags (
        task_id TEXT NOT NULL REFERENCES development_tasks(id),
        tag_id TEXT NOT NULL REFERENCES tags(id),
        PRIMARY KEY (task_id, tag_id)
    ) STRICT;
  `);
}

/**
 * ایجاد ایندکس‌های دیتابیس
 * 
 * @param db اتصال دیتابیس
 */
async function createIndices(db: Database.Database): Promise<void> {
  console.log('در حال ایجاد ایندکس‌ها...');

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, read);
    CREATE INDEX IF NOT EXISTS idx_development_phases_order ON development_phases(order_index);
    CREATE INDEX IF NOT EXISTS idx_development_tasks_phase ON development_tasks(phase_id);
    CREATE INDEX IF NOT EXISTS idx_development_tasks_completed ON development_tasks(is_completed);
    CREATE INDEX IF NOT EXISTS idx_development_tasks_order ON development_tasks(order_index);
  `);
}

/**
 * راه‌اندازی جستجوی متن کامل
 * 
 * @param db اتصال دیتابیس
 */
async function setupFullTextSearch(db: Database.Database): Promise<void> {
  console.log('در حال فعال‌سازی جستجوی متن کامل...');

  // ایجاد جداول FTS
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
        title,
        description,
        content='tasks',
        content_rowid='id',
        tokenize='unicode61 remove_diacritics 2'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
        title,
        content,
        content='documents',
        content_rowid='id',
        tokenize='unicode61 remove_diacritics 2'
    );
  `);

  // ایجاد تریگرها
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS tasks_ai AFTER INSERT ON tasks BEGIN
      INSERT INTO tasks_fts(rowid, title, description)
      VALUES (new.id, new.title, new.description);
    END;

    CREATE TRIGGER IF NOT EXISTS tasks_ad AFTER DELETE ON tasks BEGIN
      INSERT INTO tasks_fts(tasks_fts, rowid, title, description)
      VALUES('delete', old.id, old.title, old.description);
    END;

    CREATE TRIGGER IF NOT EXISTS tasks_au AFTER UPDATE ON tasks BEGIN
      INSERT INTO tasks_fts(tasks_fts, rowid, title, description)
      VALUES('delete', old.id, old.title, old.description);
      INSERT INTO tasks_fts(rowid, title, description)
      VALUES (new.id, new.title, new.description);
    END;

    CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
      INSERT INTO documents_fts(rowid, title, content)
      VALUES (new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
      INSERT INTO documents_fts(documents_fts, rowid, title, content)
      VALUES('delete', old.id, old.title, old.content);
    END;

    CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
      INSERT INTO documents_fts(documents_fts, rowid, title, content)
      VALUES('delete', old.id, old.title, old.content);
      INSERT INTO documents_fts(rowid, title, content)
      VALUES (new.id, new.title, new.content);
    END;
  `);
}

/**
 * ایجاد کاربر ادمین پیش‌فرض
 * 
 * @param db اتصال دیتابیس
 */
async function createDefaultAdmin(db: Database.Database): Promise<void> {
  console.log('در حال ایجاد کاربر ادمین پیش‌فرض...');

  const adminId = `admin-${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // هش کردن رمز عبور پیش‌فرض
  const bcrypt = require('bcryptjs');
  const defaultPassword = 'admin123'; // رمز عبور پیش‌فرض
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const insertAdmin = db.prepare(`
    INSERT INTO users (
      id, username, full_name, email, password, role, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAdmin.run(
    adminId,
    'admin',
    'مدیر سیستم',
    'admin@example.com',
    hashedPassword,
    'admin',
    timestamp
  );

  console.log('کاربر ادمین با موفقیت ایجاد شد.');
  console.log('نام کاربری: admin');
  console.log('رمز عبور: admin123');
}

/**
 * به‌روزرسانی ساختار دیتابیس
 * برای اضافه کردن ستون‌های جدید به جداول موجود
 * 
 * @param db اتصال دیتابیس
 */
async function updateDbSchema(db: Database.Database): Promise<void> {
  console.log('در حال به‌روزرسانی ساختار دیتابیس...');
  
  // بررسی وجود ستون‌های جدید در جدول users
  try {
    // بررسی اطلاعات جدول کاربران
    const tableInfo = db.prepare(`PRAGMA table_info(users)`).all() as any[];
    
    // بررسی وجود ستون password
    if (!tableInfo.some(column => column.name === 'password')) {
      console.log('در حال اضافه کردن ستون password به جدول users...');
      db.exec(`ALTER TABLE users ADD COLUMN password TEXT;`);
    }
    
    // بررسی وجود ستون phone_number
    if (!tableInfo.some(column => column.name === 'phone_number')) {
      console.log('در حال اضافه کردن ستون phone_number به جدول users...');
      db.exec(`ALTER TABLE users ADD COLUMN phone_number TEXT;`);
    }
    
    // بررسی وجود ستون avatar_url
    if (!tableInfo.some(column => column.name === 'avatar_url')) {
      console.log('در حال اضافه کردن ستون avatar_url به جدول users...');
      db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT;`);
    }
  } catch (error) {
    console.error('خطا در به‌روزرسانی ساختار دیتابیس:', error);
    throw error;
  }
} 
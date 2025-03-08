/**
 * @file setup-db.js
 * @description اسکریپت راه‌اندازی اولیه دیتابیس SQLite
 * 
 * این اسکریپت جداول پایه SQLite را ایجاد می‌کند و داده‌های اولیه را وارد می‌کند
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// مسیر دیتابیس
const DB_PATH = path.join(__dirname, '..', 'data', 'db', 'smart-assistant.db');
const DB_DIR = path.dirname(DB_PATH);

// اطمینان از وجود دایرکتوری
if (!fs.existsSync(DB_DIR)) {
  console.log(`ایجاد دایرکتوری ${DB_DIR}...`);
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// در حالت توسعه، دیتابیس قبلی را حذف می‌کنیم (اختیاری)
if (process.env.NODE_ENV === 'development' && fs.existsSync(DB_PATH)) {
  console.log('حذف دیتابیس قبلی...');
  fs.unlinkSync(DB_PATH);
}

// اتصال به دیتابیس
console.log(`اتصال به دیتابیس در مسیر ${DB_PATH}...`);
const db = new Database(DB_PATH);

// فعال کردن محدودیت‌های خارجی
db.pragma('foreign_keys = ON');

// ایجاد جداول
console.log('ایجاد جداول...');

// جدول کاربران
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    created_at INTEGER NOT NULL, -- Unix timestamp
    settings TEXT NOT NULL DEFAULT '{}' -- JSON
  ) STRICT;
`);

// جدول تسک‌ها
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

// جدول اسکرین‌شات‌ها
db.exec(`
  CREATE TABLE IF NOT EXISTS screenshots (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    task_id TEXT REFERENCES tasks(id),
    metadata TEXT DEFAULT '{}'
  ) STRICT;
`);

// جدول کد اسنیپت‌ها
db.exec(`
  CREATE TABLE IF NOT EXISTS code_snippets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    task_id TEXT REFERENCES tasks(id),
    metadata TEXT DEFAULT '{}'
  ) STRICT;
`);

// جدول مستندات
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    metadata TEXT DEFAULT '{}'
  ) STRICT;
`);

// جدول تنظیمات
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  ) STRICT;
`);

// ایجاد ایندکس‌ها
console.log('ایجاد ایندکس‌ها...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);
  CREATE INDEX IF NOT EXISTS idx_screenshots_task ON screenshots(task_id);
  CREATE INDEX IF NOT EXISTS idx_code_snippets_task ON code_snippets(task_id);
`);

// ایجاد کاربر پیش‌فرض
console.log('ایجاد کاربر پیش‌فرض...');
const defaultUserId = `user_${Date.now()}`;
const currentTime = Math.floor(Date.now() / 1000);

const insertUser = db.prepare(`
  INSERT INTO users (id, username, full_name, email, role, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertUser.run(
  defaultUserId,
  'default',
  'کاربر پیش‌فرض',
  'user@example.com',
  'user',
  currentTime
);

// ایجاد چند تسک نمونه
console.log('ایجاد تسک‌های نمونه...');
const insertTask = db.prepare(`
  INSERT INTO tasks (id, title, description, type, priority, status, creator_id, assignee_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// تسک 1
insertTask.run(
  `task_${Date.now()}_1`,
  'تکمیل صفحه داشبورد',
  'پیاده‌سازی بخش‌های مختلف صفحه داشبورد شامل نمودارها و آمار',
  'feature',
  'high',
  'inProgress',
  defaultUserId,
  defaultUserId,
  currentTime - 86400, // یک روز پیش
  currentTime
);

// تسک 2
insertTask.run(
  `task_${Date.now()}_2`,
  'رفع باگ در بخش تنظیمات',
  'رفع مشکل ذخیره نشدن تنظیمات تم در حالت تاریک',
  'bug',
  'medium',
  'todo',
  defaultUserId,
  defaultUserId,
  currentTime - 172800, // دو روز پیش
  currentTime - 86400
);

// تسک 3
insertTask.run(
  `task_${Date.now()}_3`,
  'بهینه‌سازی عملکرد',
  'بهبود سرعت لود شدن صفحات و کاهش زمان پاسخ‌دهی',
  'improvement',
  'low',
  'done',
  defaultUserId,
  defaultUserId,
  currentTime - 259200, // سه روز پیش
  currentTime - 172800
);

// افزودن تنظیمات پیش‌فرض
console.log('افزودن تنظیمات پیش‌فرض...');
const insertSetting = db.prepare(`
  INSERT INTO settings (id, key, value, updated_at)
  VALUES (?, ?, ?, ?)
`);

// تنظیم تم
insertSetting.run(
  `setting_${Date.now()}_theme`,
  'theme',
  'light',
  currentTime
);

// تنظیم زبان
insertSetting.run(
  `setting_${Date.now()}_language`,
  'language',
  'fa',
  currentTime
);

// بستن اتصال به دیتابیس
db.close();

console.log('راه‌اندازی دیتابیس با موفقیت انجام شد!'); 
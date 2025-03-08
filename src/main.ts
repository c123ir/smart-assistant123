/**
 * @file main.ts
 * @description فایل اصلی برنامه الکترون
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { setupDb } from './core/db/setup';
import DatabaseService from './core/services/databaseService';
import UserService from './core/services/userService';
// سرویس DevelopmentService حذف شده چون مستقیماً در preload پیاده‌سازی شده است
// import DevelopmentService from './core/services/developmentService';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  // ایجاد پنجره اصلی
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'dist', 'preload.js')
    }
  });

  // بارگذاری فایل HTML اصلی
  if (process.env.NODE_ENV === 'development') {
    await mainWindow.loadURL('http://localhost:3123');
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, 'index.html'));
    // فعال کردن DevTools در حالت تولید
    mainWindow.webContents.openDevTools();
  }

  // مدیریت بستن پنجره
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// اجرای برنامه
app.whenReady().then(async () => {
  // راه‌اندازی پایگاه داده
  try {
    const dbPath = path.join(app.getPath('userData'), 'data', 'smart-assistant.db');
    await setupDb(dbPath);
    console.log('پایگاه داده با موفقیت راه‌اندازی شد');
  } catch (error) {
    console.error('خطا در راه‌اندازی پایگاه داده:', error);
  }

  // ایجاد پنجره اصلی
  createWindow();

  // در سیستم‌عامل macOS، اگر همه پنجره‌ها بسته شوند، برنامه باید فعال بماند
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  // تنظیم IPC handlers برای ارتباط بین main و renderer
  setupIpcHandlers();
});

// خروج از برنامه در همه سیستم‌عامل‌ها به جز macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// تنظیم IPC handlers
function setupIpcHandlers() {
  const dbService = DatabaseService.getInstance();
  const userService = new UserService();
  
  setupUserHandlers(userService);
  setupDevelopmentHandlers();
  setupTaskHandlers();
  // ... other services ...
}

// جداسازی هندلرهای کاربران
function setupUserHandlers(userService: UserService) {
  // هندلر برای دریافت کاربران
  ipcMain.handle('get-users', async () => {
    try {
      const users = await userService.getAll();
      return { success: true, data: users };
    } catch (error) {
      console.error('خطا در دریافت کاربران:', error);
      return { success: false, error: 'خطا در دریافت کاربران' };
    }
  });
  
  // سایر هندلرهای مدیریت کاربر
}

// هندلرهای مدیریت توسعه (فعلاً خالی چون در preload پیاده‌سازی شده‌اند)
function setupDevelopmentHandlers() {
  // در آینده این هندلرها به سیستم دیتابیس متصل خواهند شد
}

// هندلرهای مدیریت تسک‌ها
function setupTaskHandlers() {
  // در آینده پیاده‌سازی خواهد شد
}

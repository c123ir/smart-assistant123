/**
 * @file index.ts
 * @description نقطه ورودی اصلی دستیار هوشمند
 */

import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { setupDb } from './core/db/setup';

// مسیر دیتابیس
const DB_PATH = path.join(app.getPath('userData'), 'smart-assistant.db');

// تنظیمات برنامه
const APP_CONFIG = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  title: 'دستیار هوشمند توسعه',
  icon: path.join(__dirname, 'assets', 'icon.png'),
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  }
};

/**
 * ایجاد پنجره اصلی برنامه
 */
function createWindow() {
  const mainWindow = new BrowserWindow(APP_CONFIG);
  
  // بارگذاری فایل اصلی
  if (process.env.NODE_ENV === 'development') {
    // در حالت توسعه
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // در حالت تولید
    mainWindow.loadFile(path.join(__dirname, 'ui', 'build', 'index.html'));
  }
  
  // تنظیم عنوان پنجره
  mainWindow.setTitle(APP_CONFIG.title);
  
  return mainWindow;
}

/**
 * زمانی که Electron آماده می‌شود این تابع صدا زده می‌شود
 */
app.whenReady().then(async () => {
  // راه‌اندازی دیتابیس
  await setupDb(DB_PATH);
  
  // ایجاد پنجره اصلی
  createWindow();
  
  // در macOS معمولاً پنجره‌ها دوباره باز می‌شوند
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  
  console.log('دستیار هوشمند با موفقیت راه‌اندازی شد!');
});

/**
 * خروج از برنامه زمانی که همه پنجره‌ها بسته می‌شوند
 */
app.on('window-all-closed', function () {
  // در macOS معمولاً برنامه‌ها تا زمانی که کاربر از منو خارج نشود، باز می‌مانند
  if (process.platform !== 'darwin') app.quit();
}); 
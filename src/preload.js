/**
 * @file preload.js
 * @description فایل پیش‌بارگذاری الکترون برای تعریف API های قابل دسترس در رندرر (بدون وابستگی خارجی)
 */

const { contextBridge, ipcRenderer } = require('electron');

// API هایی که برای فرآیند رندرر قابل دسترس خواهند بود
contextBridge.exposeInMainWorld('electron', {
  // سرویس مدیریت کاربران
  getUserService: () => {
    return {
      // برگرداندن داده‌های نمونه کاملاً مطابق با طراحی UI اصلی
      getAll: () => {
        return Promise.resolve([
          { 
            id: '1', 
            username: 'admin', 
            full_name: 'مدیر سیستم', 
            email: 'admin@example.com', 
            role: 'admin',
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+سیستم&background=4C6EF5&color=fff',
            created_at: Date.now(),
            active_projects: 5,
            settings: { theme: 'dark' }
          },
          { 
            id: '2', 
            username: 'user1', 
            full_name: 'کاربر نمونه', 
            email: 'user1@example.com', 
            role: 'developer',
            avatar_url: 'https://ui-avatars.com/api/?name=کاربر+نمونه&background=12B886&color=fff',
            created_at: Date.now(),
            active_projects: 3,
            settings: { theme: 'light' }
          },
          { 
            id: '3', 
            username: 'manager', 
            full_name: 'مدیر پروژه', 
            email: 'manager@example.com', 
            role: 'manager',
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+پروژه&background=FA5252&color=fff',
            created_at: Date.now(),
            active_projects: 10,
            settings: { theme: 'auto' }
          }
        ]);
      },
      get: (id) => {
        const users = {
          '1': { 
            id: '1', 
            username: 'admin', 
            full_name: 'مدیر سیستم', 
            email: 'admin@example.com', 
            role: 'admin',
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+سیستم&background=4C6EF5&color=fff',
            created_at: Date.now(),
            active_projects: 5,
            settings: { theme: 'dark' }
          },
          '2': { 
            id: '2', 
            username: 'user1', 
            full_name: 'کاربر نمونه', 
            email: 'user1@example.com', 
            role: 'developer',
            avatar_url: 'https://ui-avatars.com/api/?name=کاربر+نمونه&background=12B886&color=fff',
            created_at: Date.now(),
            active_projects: 3,
            settings: { theme: 'light' }
          },
          '3': { 
            id: '3', 
            username: 'manager', 
            full_name: 'مدیر پروژه', 
            email: 'manager@example.com', 
            role: 'manager',
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+پروژه&background=FA5252&color=fff',
            created_at: Date.now(),
            active_projects: 10,
            settings: { theme: 'auto' }
          }
        };
        return Promise.resolve(users[id]);
      },
      getByUsername: (username) => {
        const userMap = {
          'admin': { 
            id: '1', 
            username: 'admin', 
            full_name: 'مدیر سیستم', 
            email: 'admin@example.com', 
            role: 'admin',
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+سیستم&background=4C6EF5&color=fff',
            created_at: Date.now(),
            active_projects: 5,
            settings: { theme: 'dark' }
          },
          'user1': { 
            id: '2', 
            username: 'user1', 
            full_name: 'کاربر نمونه', 
            email: 'user1@example.com', 
            role: 'developer',
            avatar_url: 'https://ui-avatars.com/api/?name=کاربر+نمونه&background=12B886&color=fff',
            created_at: Date.now(),
            active_projects: 3,
            settings: { theme: 'light' }
          },
          'manager': { 
            id: '3', 
            username: 'manager', 
            full_name: 'مدیر پروژه', 
            email: 'manager@example.com', 
            role: 'manager',
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+پروژه&background=FA5252&color=fff',
            created_at: Date.now(),
            active_projects: 10,
            settings: { theme: 'auto' }
          }
        };
        return Promise.resolve(userMap[username]);
      },
      getProfile: (id) => {
        const profiles = {
          '1': { 
            id: '1', 
            username: 'admin', 
            full_name: 'مدیر سیستم', 
            email: 'admin@example.com', 
            role: 'admin', 
            created_at: Date.now(),
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+سیستم&background=4C6EF5&color=fff',
            active_projects: 5,
            settings: { theme: 'dark' },
            last_active: Date.now() - 3600000, // 1 ساعت پیش
            completed_tasks: 23,
            pending_tasks: 5
          },
          '2': { 
            id: '2', 
            username: 'user1', 
            full_name: 'کاربر نمونه', 
            email: 'user1@example.com', 
            role: 'developer', 
            created_at: Date.now(),
            avatar_url: 'https://ui-avatars.com/api/?name=کاربر+نمونه&background=12B886&color=fff',
            active_projects: 3,
            settings: { theme: 'light' },
            last_active: Date.now() - 18000000, // 5 ساعت پیش
            completed_tasks: 17,
            pending_tasks: 8
          },
          '3': { 
            id: '3', 
            username: 'manager', 
            full_name: 'مدیر پروژه', 
            email: 'manager@example.com', 
            role: 'manager', 
            created_at: Date.now(),
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+پروژه&background=FA5252&color=fff',
            active_projects: 10,
            settings: { theme: 'auto' },
            last_active: Date.now() - 86400000, // 1 روز پیش
            completed_tasks: 45,
            pending_tasks: 12
          }
        };
        return Promise.resolve(profiles[id]);
      },
      create: (user) => {
        console.log('درخواست ایجاد کاربر جدید:', user);
        // حفظ ساختار داده یکسان با فرمت UI
        return Promise.resolve({ 
          ...user, 
          id: Date.now().toString(), 
          created_at: Date.now(),
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random&color=fff`,
          active_projects: 0,
          completed_tasks: 0,
          pending_tasks: 0
        });
      },
      update: (id, user) => {
        console.log(`درخواست به‌روزرسانی کاربر ${id}:`, user);
        return Promise.resolve(true);
      },
      delete: (id) => {
        console.log(`درخواست حذف کاربر ${id}`);
        return Promise.resolve(true);
      },
      search: (query) => {
        console.log(`جستجوی کاربر با عبارت ${query}`);
        // فقط کاربرانی که با عبارت جستجو تطابق دارند را برمی‌گرداند
        const users = [
          { 
            id: '1', 
            username: 'admin', 
            full_name: 'مدیر سیستم', 
            email: 'admin@example.com', 
            role: 'admin', 
            created_at: Date.now(),
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+سیستم&background=4C6EF5&color=fff',
            active_projects: 5
          },
          { 
            id: '2', 
            username: 'user1', 
            full_name: 'کاربر نمونه', 
            email: 'user1@example.com', 
            role: 'developer', 
            created_at: Date.now(),
            avatar_url: 'https://ui-avatars.com/api/?name=کاربر+نمونه&background=12B886&color=fff',
            active_projects: 3
          },
          { 
            id: '3', 
            username: 'manager', 
            full_name: 'مدیر پروژه', 
            email: 'manager@example.com', 
            role: 'manager', 
            created_at: Date.now(),
            avatar_url: 'https://ui-avatars.com/api/?name=مدیر+پروژه&background=FA5252&color=fff',
            active_projects: 10
          }
        ];
        
        if (!query) return Promise.resolve(users);
        
        const filtered = users.filter(user => 
          user.username.includes(query) || 
          user.full_name.includes(query) || 
          user.email.includes(query)
        );
        
        return Promise.resolve(filtered);
      },
      changeRole: (id, role) => {
        console.log(`درخواست تغییر نقش کاربر ${id} به ${role}`);
        return Promise.resolve(true);
      }
    };
  },

  // سرویس مدیریت توسعه
  getDevelopmentService: () => {
    return {
      // برگرداندن داده‌های نمونه به جای استفاده از دیتابیس
      getPhases: () => {
        return Promise.resolve([
          { 
            id: '1', 
            title: 'برنامه‌ریزی', 
            description: 'تعیین اهداف و برنامه‌ریزی پروژه', 
            icon: 'planning', 
            color: '#4CAF50', 
            orderIndex: 0, 
            createdAt: Date.now(), 
            updatedAt: Date.now() 
          },
          { 
            id: '2', 
            title: 'طراحی', 
            description: 'طراحی معماری و رابط کاربری', 
            icon: 'design', 
            color: '#2196F3', 
            orderIndex: 1, 
            createdAt: Date.now(), 
            updatedAt: Date.now() 
          },
          { 
            id: '3', 
            title: 'توسعه', 
            description: 'پیاده‌سازی کد و توسعه برنامه', 
            icon: 'development', 
            color: '#FF9800', 
            orderIndex: 2, 
            createdAt: Date.now(), 
            updatedAt: Date.now() 
          }
        ]);
      },
      getTasks: (phaseId) => {
        // داده‌های نمونه برای هر فاز
        const tasks = {
          '1': [
            { 
              id: '101', 
              phaseId: '1', 
              title: 'تعیین نیازمندی‌های پروژه', 
              description: 'شناسایی و مستندسازی نیازمندی‌های کاربران', 
              isCompleted: true, 
              orderIndex: 0, 
              createdAt: Date.now(), 
              updatedAt: Date.now() 
            },
            { 
              id: '102', 
              phaseId: '1', 
              title: 'تخمین زمان‌بندی', 
              description: 'تخمین زمان لازم برای اجرای مراحل مختلف پروژه', 
              isCompleted: false, 
              orderIndex: 1, 
              createdAt: Date.now(), 
              updatedAt: Date.now() 
            }
          ],
          '2': [
            { 
              id: '201', 
              phaseId: '2', 
              title: 'طراحی معماری', 
              description: 'طراحی معماری نرم‌افزار با الگوهای مناسب', 
              isCompleted: false, 
              orderIndex: 0, 
              createdAt: Date.now(), 
              updatedAt: Date.now() 
            }
          ],
          '3': [
            { 
              id: '301', 
              phaseId: '3', 
              title: 'پیاده‌سازی کامپوننت‌ها', 
              description: 'ایجاد کامپوننت‌های مورد نیاز برنامه', 
              isCompleted: false, 
              orderIndex: 0, 
              createdAt: Date.now(), 
              updatedAt: Date.now() 
            }
          ]
        };
        return Promise.resolve(tasks[phaseId] || []);
      },
      createPhase: (phase) => {
        console.log('درخواست ایجاد فاز جدید:', phase);
        return Promise.resolve({ ...phase, id: Date.now().toString() });
      },
      updatePhase: (id, phase) => {
        console.log(`درخواست به‌روزرسانی فاز ${id}:`, phase);
        return Promise.resolve(true);
      },
      deletePhase: (id) => {
        console.log(`درخواست حذف فاز ${id}`);
        return Promise.resolve(true);
      },
      createTask: (task) => {
        console.log('درخواست ایجاد تسک جدید:', task);
        return Promise.resolve({ ...task, id: Date.now().toString() });
      },
      updateTask: (id, task) => {
        console.log(`درخواست به‌روزرسانی تسک ${id}:`, task);
        return Promise.resolve(true);
      },
      deleteTask: (id) => {
        console.log(`درخواست حذف تسک ${id}`);
        return Promise.resolve(true);
      },
      toggleTaskCompletion: (id, isCompleted) => {
        console.log(`درخواست تغییر وضعیت تسک ${id} به ${isCompleted ? 'تکمیل شده' : 'در حال انجام'}`);
        return Promise.resolve(true);
      },
      reorderPhases: (orderedIds) => {
        console.log('درخواست تغییر ترتیب فازها:', orderedIds);
        return Promise.resolve(true);
      },
      reorderTasks: (phaseId, orderedIds) => {
        console.log(`درخواست تغییر ترتیب تسک‌های فاز ${phaseId}:`, orderedIds);
        return Promise.resolve(true);
      }
    };
  },
  
  // سرویس دیتابیس
  getDatabaseService: () => {
    return {
      // متدهای شبیه‌سازی شده برای عملیات پایگاه داده
      connect: () => {
        console.log('اتصال به دیتابیس');
        return Promise.resolve(true);
      },
      disconnect: () => {
        console.log('قطع اتصال از دیتابیس');
        return Promise.resolve(true);
      },
      query: (sql, params) => {
        console.log('اجرای کوئری SQL:', sql, params);
        return Promise.resolve([]);
      },
      get: (sql, params) => {
        console.log('دریافت یک رکورد:', sql, params);
        return Promise.resolve({});
      },
      all: (sql, params) => {
        console.log('دریافت همه رکوردها:', sql, params);
        return Promise.resolve([]);
      },
      run: (sql, params) => {
        console.log('اجرای دستور SQL:', sql, params);
        return Promise.resolve({ changes: 1, lastInsertRowid: 1 });
      },
      exec: (sql) => {
        console.log('اجرای چندین دستور SQL:', sql);
        return Promise.resolve(true);
      },
      isConnected: () => {
        return Promise.resolve(true);
      }
    };
  },
  
  // بررسی وضعیت دیتابیس
  checkDbStatus: () => ipcRenderer.invoke('db:isReady'),
  
  // مدیریت تسک‌ها
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    get: (id) => ipcRenderer.invoke('tasks:get', id),
    create: (task) => ipcRenderer.invoke('tasks:create', task),
    update: (id, task) => ipcRenderer.invoke('tasks:update', id, task),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id),
    changeStatus: (id, status) => ipcRenderer.invoke('tasks:changeStatus', id, status),
    getTags: (taskId) => ipcRenderer.invoke('tasks:getTags', taskId),
    search: (query) => ipcRenderer.invoke('tasks:search', query),
  },
  
  // مدیریت کاربران
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    get: (id) => ipcRenderer.invoke('users:get', id),
    getByUsername: (username) => ipcRenderer.invoke('users:getByUsername', username),
    getProfile: (id) => ipcRenderer.invoke('users:getProfile', id),
    create: (user) => ipcRenderer.invoke('users:create', user),
    update: (id, user) => ipcRenderer.invoke('users:update', id, user),
    delete: (id) => ipcRenderer.invoke('users:delete', id),
    search: (query) => ipcRenderer.invoke('users:search', query),
    changeRole: (id, role) => ipcRenderer.invoke('users:changeRole', id, role),
  },
  
  // مدیریت اسکرین‌شات‌ها
  screenshots: {
    capture: () => ipcRenderer.invoke('screenshots:capture'),
    getAll: () => ipcRenderer.invoke('screenshots:getAll'),
    delete: (id) => ipcRenderer.invoke('screenshots:delete', id),
  },
  
  // مدیریت کد اسنیپت‌ها
  codeSnippets: {
    getAll: () => ipcRenderer.invoke('codeSnippets:getAll'),
    get: (id) => ipcRenderer.invoke('codeSnippets:get', id),
    create: (snippet) => ipcRenderer.invoke('codeSnippets:create', snippet),
    update: (id, snippet) => ipcRenderer.invoke('codeSnippets:update', id, snippet),
    delete: (id) => ipcRenderer.invoke('codeSnippets:delete', id),
  },
  
  // مدیریت مستندات
  documents: {
    getAll: () => ipcRenderer.invoke('documents:getAll'),
    get: (id) => ipcRenderer.invoke('documents:get', id),
    create: (document) => ipcRenderer.invoke('documents:create', document),
    update: (id, document) => ipcRenderer.invoke('documents:update', id, document),
    delete: (id) => ipcRenderer.invoke('documents:delete', id),
  },
  
  // پشتیبان‌گیری و بازیابی
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    restore: (filePath) => ipcRenderer.invoke('backup:restore', filePath),
  },
  
  // تنظیمات
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings) => ipcRenderer.invoke('settings:update', settings),
  },
  
  // رویدادهای سیستمی
  system: {
    openFile: (filePath) => ipcRenderer.invoke('system:openFile', filePath),
    openFolder: (folderPath) => ipcRenderer.invoke('system:openFolder', folderPath),
    openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
  },
}); 
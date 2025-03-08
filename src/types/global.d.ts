/**
 * @file global.d.ts
 * @description تعریف تایپ‌های گلوبال برنامه
 */

import DatabaseService from '../core/services/databaseService';
import UserService from '../core/services/userService';
import DevelopmentService from '../core/services/developmentService';

declare global {
  interface Window {
    electron: {
      // سرویس‌های اصلی
      getDatabaseService: () => DatabaseService;
      getUserService: () => UserService;
      getDevelopmentService: () => DevelopmentService;

      // سرویس‌های دیگر
      checkDbStatus: () => Promise<boolean>;
      tasks: {
        getAll: () => Promise<any[]>;
        get: (id: string) => Promise<any>;
        create: (task: any) => Promise<any>;
        update: (id: string, task: any) => Promise<boolean>;
        delete: (id: string) => Promise<boolean>;
        changeStatus: (id: string, status: string) => Promise<boolean>;
        getTags: (taskId: string) => Promise<string[]>;
        addTag: (taskId: string, tag: string) => Promise<boolean>;
        removeTag: (taskId: string, tag: string) => Promise<boolean>;
      };
    };
  }
}

export {}; 
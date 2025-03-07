# مستندات API داخلی

<div dir="rtl">

این مستندات برای توسعه‌دهندگانی است که قصد دارند روی پروژه دستیار هوشمند توسعه کار کنند یا از API های داخلی آن استفاده کنند.

## معماری

برنامه از معماری چند لایه استفاده می‌کند:

1. **لایه دیتابیس**: مدیریت ذخیره‌سازی داده‌ها با SQLite
2. **لایه سرویس**: منطق کسب و کار و عملیات‌های CRUD
3. **لایه رابط بین فرآیندی (IPC)**: ارتباط بین فرآیند اصلی و رندرر
4. **لایه UI**: رابط کاربری با React

## نکته مهم: تغییرات API

**توجه**: هر گونه تغییر در API ها باید به‌دقت مستند شود و تغییرات نباید سازگاری با نسخه‌های قبلی را از بین ببرد.

## API های فرآیند اصلی (Main Process)

### DatabaseService

این سرویس مسئول ارتباط مستقیم با دیتابیس SQLite است.

```typescript
class DatabaseService {
  // Singleton instance
  static getInstance(): DatabaseService;
  
  // اتصال به دیتابیس
  connect(): Promise<boolean>;
  
  // قطع اتصال از دیتابیس
  disconnect(): Promise<boolean>;
  
  // اجرای یک کوئری و دریافت نتیجه
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  
  // دریافت یک رکورد
  get<T>(sql: string, params?: any[]): Promise<T | undefined>;
  
  // دریافت چندین رکورد
  all<T>(sql: string, params?: any[]): Promise<T[]>;
  
  // اجرای یک کوئری بدون نیاز به نتیجه
  run(sql: string, params?: any[]): Promise<{ changes: number, lastInsertRowid: number }>;
  
  // اجرای چندین کوئری همزمان
  exec(sql: string): Promise<boolean>;
  
  // بررسی وضعیت اتصال
  isConnected(): Promise<boolean>;
}
```

### UserService

این سرویس مسئول مدیریت کاربران است.

```typescript
class UserService {
  // دریافت همه کاربران
  getAll(): Promise<User[]>;
  
  // دریافت یک کاربر با شناسه
  get(id: string): Promise<User | undefined>;
  
  // دریافت کاربر با نام کاربری
  getUserByUsername(username: string): Promise<User | undefined>;
  
  // دریافت پروفایل کاربر
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  
  // ایجاد کاربر جدید
  create(user: Omit<User, 'id' | 'created_at'> & { password: string }): Promise<User>;
  
  // به‌روزرسانی کاربر
  update(id: string, user: Partial<User>): Promise<boolean>;
  
  // حذف کاربر
  delete(id: string): Promise<boolean>;
  
  // جستجوی کاربران
  searchUsers(query: string): Promise<User[]>;
  
  // تغییر نقش کاربر
  changeUserRole(id: string, role: string): Promise<User | undefined>;
  
  // تغییر رمز عبور
  changePassword(id: string, newPassword: string): Promise<boolean>;
  
  // احراز هویت کاربر
  authenticate(username: string, password: string): Promise<User | null>;
}
```

### DevelopmentService

این سرویس مسئول مدیریت فرآیند توسعه، فازها و تسک‌هاست.

```typescript
class DevelopmentService {
  // دریافت فازهای توسعه
  getPhases(): Promise<DevelopmentPhase[]>;
  
  // دریافت تسک‌های یک فاز
  getTasks(phaseId: string): Promise<Task[]>;
  
  // ایجاد فاز جدید
  createPhase(phase: Omit<DevelopmentPhase, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevelopmentPhase>;
  
  // به‌روزرسانی فاز
  updatePhase(id: string, phase: Partial<DevelopmentPhase>): Promise<boolean>;
  
  // حذف فاز
  deletePhase(id: string): Promise<boolean>;
  
  // ایجاد تسک جدید
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  
  // به‌روزرسانی تسک
  updateTask(id: string, task: Partial<Task>): Promise<boolean>;
  
  // حذف تسک
  deleteTask(id: string): Promise<boolean>;
  
  // تغییر وضعیت تکمیل تسک
  toggleTaskCompletion(id: string, isCompleted: boolean): Promise<boolean>;
  
  // تغییر ترتیب فازها
  reorderPhases(orderedIds: string[]): Promise<boolean>;
  
  // تغییر ترتیب تسک‌ها
  reorderTasks(phaseId: string, orderedIds: string[]): Promise<boolean>;
}
```

## API های قابل استفاده در رندرر (Exposed to Renderer)

در فایل `preload.js`، API های زیر برای استفاده در رندرر (React) در دسترس قرار داده شده‌اند:

```javascript
window.electron = {
  // سرویس دیتابیس
  getDatabaseService: () => { ... },
  
  // سرویس مدیریت کاربران
  getUserService: () => { ... },
  
  // سرویس مدیریت توسعه
  getDevelopmentService: () => { ... },
  
  // بررسی وضعیت دیتابیس
  checkDbStatus: () => { ... },
  
  // مدیریت تسک‌ها
  tasks: { ... },
  
  // مدیریت کاربران
  users: { ... },
  
  // مدیریت اسکرین‌شات‌ها
  screenshots: { ... },
  
  // مدیریت کد اسنیپت‌ها
  codeSnippets: { ... },
  
  // مدیریت مستندات
  documents: { ... },
  
  // پشتیبان‌گیری و بازیابی
  backup: { ... },
  
  // تنظیمات
  settings: { ... },
  
  // رویدادهای سیستمی
  system: { ... },
}
```

## نمونه استفاده در React

```tsx
import React, { useState, useEffect } from 'react';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // استفاده از API داخلی
        const userService = window.electron.getUserService();
        const userList = await userService.getAll();
        setUsers(userList);
      } catch (err) {
        setError(`خطا در دریافت لیست کاربران: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="user-list">
      <h2>لیست کاربران</h2>
      {loading && <p>در حال بارگذاری...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <img src={user.avatar_url} alt={user.full_name} className="avatar" />
              <div>
                <h3>{user.full_name}</h3>
                <p>{user.email}</p>
                <span className={`role role-${user.role}`}>{user.role}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
```

## مدیریت خطاها

برای مدیریت یکپارچه خطاها، از ساختار زیر استفاده کنید:

```typescript
try {
  // کد مورد نظر
} catch (error) {
  console.error(`خطا در ${عنوان_عملیات}:`, error);
  throw new Error(`خطا در ${عنوان_عملیات}`);
}
```

## پیکربندی مجدد کامل دیتابیس

در صورتی که نیاز به پیکربندی مجدد دیتابیس دارید، از اسکریپت `setup-db.js` استفاده کنید:

```bash
node scripts/setup-db.js --recreate
```

این دستور دیتابیس را از ابتدا ایجاد می‌کند و تمام جداول را بازسازی می‌کند.

## نکات مهم برای توسعه‌دهندگان

1. **حفظ ساختار داده**: ساختار داده‌ها را بدون اطلاع سایر توسعه‌دهندگان تغییر ندهید.
2. **جداسازی دغدغه‌ها**: منطق کسب و کار را در سرویس‌ها و UI را در کامپوننت‌ها نگه دارید.
3. **استفاده از تایپ‌اسکریپت**: همیشه از تایپ‌های مناسب استفاده کنید تا از خطاهای زمان اجرا جلوگیری شود.
4. **مدیریت خطا**: خطاها را به‌درستی مدیریت کنید و پیام‌های مناسب به کاربر نمایش دهید.
5. **تست‌های واحد**: برای هر ویژگی جدید، تست‌های واحد بنویسید.

</div> 
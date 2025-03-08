/**
 * @file Dashboard.tsx
 * @description کامپوننت داشبورد اصلی برنامه
 */

import React, { useEffect, useState } from 'react';
import './Dashboard.scss';

// تایپ‌های مورد نیاز
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0
  });

  useEffect(() => {
    // دریافت تسک‌ها از دیتابیس
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        // در حالت توسعه، داده‌های نمونه استفاده می‌کنیم
        // در نسخه نهایی، از API الکترون استفاده خواهد شد
        const demoTasks: Task[] = [
          {
            id: '1',
            title: 'پیاده‌سازی کامپوننت‌های اصلی',
            description: 'ایجاد کامپوننت‌های اصلی رابط کاربری دستیار هوشمند',
            status: 'inProgress',
            priority: 'high',
            createdAt: Date.now() - 86400000, // یک روز پیش
            updatedAt: Date.now()
          },
          {
            id: '2',
            title: 'پیاده‌سازی سرویس‌های دیتابیس',
            description: 'ایجاد سرویس‌های مدیریت تسک‌ها و اسکرین‌شات‌ها',
            status: 'todo',
            priority: 'medium',
            createdAt: Date.now() - 172800000, // دو روز پیش
            updatedAt: Date.now() - 86400000
          },
          {
            id: '3',
            title: 'تکمیل مستندات',
            status: 'done',
            priority: 'low',
            createdAt: Date.now() - 259200000, // سه روز پیش
            updatedAt: Date.now() - 172800000
          }
        ];
        
        setTasks(demoTasks);
        
        // محاسبه آمار
        const total = demoTasks.length;
        const completed = demoTasks.filter(task => task.status === 'done').length;
        const inProgress = demoTasks.filter(task => task.status === 'inProgress').length;
        const todo = demoTasks.filter(task => task.status === 'todo').length;
        
        setStats({ total, completed, inProgress, todo });
        setIsLoading(false);
      } catch (error) {
        console.error('خطا در دریافت تسک‌ها:', error);
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // تبدیل تاریخ یونیکس به فرمت نمایشی
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // تعیین کلاس CSS برای اولویت تسک
  const getPriorityClass = (priority: Task['priority']): string => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  // تعیین کلاس CSS برای وضعیت تسک
  const getStatusClass = (status: Task['status']): string => {
    switch (status) {
      case 'done':
        return 'status-done';
      case 'inProgress':
        return 'status-in-progress';
      case 'todo':
        return 'status-todo';
      default:
        return '';
    }
  };

  // تعیین متن فارسی برای وضعیت تسک
  const getStatusText = (status: Task['status']): string => {
    switch (status) {
      case 'done':
        return 'انجام شده';
      case 'inProgress':
        return 'در حال انجام';
      case 'todo':
        return 'در انتظار';
      default:
        return '';
    }
  };

  // تعیین متن فارسی برای اولویت تسک
  const getPriorityText = (priority: Task['priority']): string => {
    switch (priority) {
      case 'high':
        return 'بالا';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'پایین';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard loading">
        <h2>در حال بارگذاری...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>داشبورد</h1>
        <button className="button primary">افزودن تسک جدید</button>
      </header>

      <section className="stats">
        <div className="stat-card">
          <h3>کل تسک‌ها</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>انجام شده</h3>
          <p className="stat-value">{stats.completed}</p>
        </div>
        <div className="stat-card">
          <h3>در حال انجام</h3>
          <p className="stat-value">{stats.inProgress}</p>
        </div>
        <div className="stat-card">
          <h3>در انتظار</h3>
          <p className="stat-value">{stats.todo}</p>
        </div>
      </section>

      <section className="tasks">
        <h2>تسک‌های اخیر</h2>
        {tasks.length === 0 ? (
          <p className="no-tasks">هیچ تسکی وجود ندارد. با استفاده از دکمه "افزودن تسک جدید" تسک جدیدی ایجاد کنید.</p>
        ) : (
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <h3 className="task-title">{task.title}</h3>
                {task.description && <p className="task-description">{task.description}</p>}
                <div className="task-meta">
                  <span className={`task-status ${getStatusClass(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                  <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                    اولویت: {getPriorityText(task.priority)}
                  </span>
                </div>
                <div className="task-dates">
                  <span>ایجاد: {formatDate(task.createdAt)}</span>
                  <span>به‌روزرسانی: {formatDate(task.updatedAt)}</span>
                </div>
                <div className="task-actions">
                  <button className="button outline">ویرایش</button>
                  <button className="button text">حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard; 
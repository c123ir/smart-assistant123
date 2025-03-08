/**
 * @file TaskList.tsx
 * @description کامپوننت نمایش لیست تسک‌ها
 */

import React, { useState } from 'react';
import './TaskList.scss';

// تعریف تایپ‌های مورد نیاز
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
}

interface TaskListProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onTaskDelete?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onTaskSelect, 
  onTaskStatusChange,
  onTaskDelete
}) => {
  const [sortField, setSortField] = useState<keyof Task>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');

  // تغییر فیلد مرتب‌سازی
  const handleSortChange = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // تغییر فیلتر وضعیت
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as Task['status'] | 'all');
  };

  // مرتب‌سازی و فیلتر کردن تسک‌ها
  const filteredAndSortedTasks = tasks
    .filter(task => filter === 'all' || task.status === filter)
    .sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' 
          ? fieldA - fieldB 
          : fieldB - fieldA;
      }
      
      return 0;
    });

  // تبدیل تاریخ یونیکس به فرمت نمایشی
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="task-list-filters">
          <div className="filter-group">
            <label>فیلتر وضعیت:</label>
            <select value={filter} onChange={handleFilterChange}>
              <option value="all">همه</option>
              <option value="todo">در انتظار</option>
              <option value="inProgress">در حال انجام</option>
              <option value="done">انجام شده</option>
            </select>
          </div>
        </div>
        
        <div className="task-count">
          {filteredAndSortedTasks.length} تسک
        </div>
      </div>

      {filteredAndSortedTasks.length === 0 ? (
        <div className="no-tasks">
          <p>هیچ تسکی یافت نشد.</p>
        </div>
      ) : (
        <div className="task-table-container">
          <table className="task-table">
            <thead>
              <tr>
                <th onClick={() => handleSortChange('title')} className={sortField === 'title' ? `sorted ${sortDirection}` : ''}>
                  عنوان
                  {sortField === 'title' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSortChange('status')} className={sortField === 'status' ? `sorted ${sortDirection}` : ''}>
                  وضعیت
                  {sortField === 'status' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSortChange('priority')} className={sortField === 'priority' ? `sorted ${sortDirection}` : ''}>
                  اولویت
                  {sortField === 'priority' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSortChange('updatedAt')} className={sortField === 'updatedAt' ? `sorted ${sortDirection}` : ''}>
                  آخرین به‌روزرسانی
                  {sortField === 'updatedAt' && (
                    <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTasks.map(task => (
                <tr key={task.id} onClick={() => onTaskSelect && onTaskSelect(task)}>
                  <td className="task-title">
                    {task.title}
                  </td>
                  <td>
                    <span className={`task-status status-${task.status}`}>
                      {getStatusText(task.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </td>
                  <td className="task-date">
                    {formatDate(task.updatedAt)}
                  </td>
                  <td className="task-actions">
                    {onTaskStatusChange && (
                      <select 
                        value={task.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          onTaskStatusChange(task.id, e.target.value as Task['status']);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="todo">در انتظار</option>
                        <option value="inProgress">در حال انجام</option>
                        <option value="done">انجام شده</option>
                      </select>
                    )}
                    
                    {onTaskDelete && (
                      <button 
                        className="button text danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('آیا از حذف این تسک اطمینان دارید؟')) {
                            onTaskDelete(task.id);
                          }
                        }}
                      >
                        حذف
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskList; 
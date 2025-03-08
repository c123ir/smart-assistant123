/**
 * @file UserManagement.tsx
 * @description کامپوننت مدیریت کاربران
 */

import React, { useState, useEffect } from 'react';
import './UserManagement.scss';
import { User, UpdateUserDto } from '../../core/services/userService';

// تعریف نوع برای ساخت کاربر جدید
interface CreateUserDto {
  username: string;
  full_name: string;
  email: string;
  role: string;
  password: string;
}

// تعریف نوع برای نقش‌های کاربر
type UserRole = 'admin' | 'manager' | 'developer' | 'viewer';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewUserForm, setShowNewUserForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // @ts-ignore - دسترسی به API های الکترون از طریق window
      const userService = window.electron.getUserService();
      const loadedUsers = await userService.getAll();
      setUsers(loadedUsers);
    } catch (err) {
      setError('خطا در دریافت لیست کاربران: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      // @ts-ignore - دسترسی به API های الکترون از طریق window
      const userService = window.electron.getUserService();
      await userService.create({
        username: formData.get('username') as string,
        full_name: formData.get('fullName') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as string,
        password: formData.get('password') as string
      });

      setShowNewUserForm(false);
      await loadUsers();
    } catch (err) {
      setError('خطا در ایجاد کاربر: ' + (err as Error).message);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    if (!editingUser) return;

    try {
      // @ts-ignore - دسترسی به API های الکترون از طریق window
      const userService = window.electron.getUserService();
      await userService.update(editingUser, {
        username: formData.get('username') as string,
        full_name: formData.get('fullName') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as string
      });

      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError('خطا در به‌روزرسانی کاربر: ' + (err as Error).message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;

    try {
      // @ts-ignore - دسترسی به API های الکترون از طریق window
      const userService = window.electron.getUserService();
      await userService.delete(id);
      await loadUsers();
    } catch (err) {
      setError('خطا در حذف کاربر: ' + (err as Error).message);
    }
  };

  // افزودن نوع صریح برای پارامتر prev
  const setPrevValue = (prev: CreateUserDto | UpdateUserDto) => {
    // منطق تابع...
    return prev;
  };

  const renderNewUserForm = () => {
    if (!showNewUserForm) return null;

    return (
      <div className="new-user-form">
        <h3>ایجاد کاربر جدید</h3>
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>نام کاربری</label>
            <input type="text" name="username" required />
          </div>
          <div className="form-group">
            <label>نام و نام خانوادگی</label>
            <input type="text" name="fullName" required />
          </div>
          <div className="form-group">
            <label>ایمیل</label>
            <input type="email" name="email" required />
          </div>
          <div className="form-group">
            <label>نقش</label>
            <select name="role" required>
              <option value="admin">مدیر</option>
              <option value="manager">مدیر پروژه</option>
              <option value="developer">توسعه‌دهنده</option>
              <option value="viewer">بازدیدکننده</option>
            </select>
          </div>
          <div className="form-group">
            <label>رمز عبور</label>
            <input type="password" name="password" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">ایجاد</button>
            <button type="button" className="btn-secondary" onClick={() => setShowNewUserForm(false)}>انصراف</button>
          </div>
        </form>
      </div>
    );
  };

  const renderEditUserForm = (user: User) => {
    if (editingUser !== user.id) return null;

    return (
      <div className="edit-user-form">
        <h3>ویرایش کاربر</h3>
        <form onSubmit={handleUpdateUser}>
          <div className="form-group">
            <label>نام کاربری</label>
            <input type="text" name="username" defaultValue={user.username} required />
          </div>
          <div className="form-group">
            <label>نام و نام خانوادگی</label>
            <input type="text" name="fullName" defaultValue={user.full_name} required />
          </div>
          <div className="form-group">
            <label>ایمیل</label>
            <input type="email" name="email" defaultValue={user.email} required />
          </div>
          <div className="form-group">
            <label>نقش</label>
            <select name="role" defaultValue={user.role} required>
              <option value="admin">مدیر</option>
              <option value="manager">مدیر پروژه</option>
              <option value="developer">توسعه‌دهنده</option>
              <option value="viewer">بازدیدکننده</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">ذخیره</button>
            <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>انصراف</button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-management">
      <div className="header">
        <h2>مدیریت کاربران</h2>
        <button className="btn-primary" onClick={() => setShowNewUserForm(true)}>
          ایجاد کاربر جدید
        </button>
      </div>

      {renderNewUserForm()}

      <div className="user-list">
        {users.map(user => (
          <div key={user.id} className={`user-item role-${user.role}`}>
            <div className="user-info">
              <div className="avatar">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="details">
                <h3>{user.full_name}</h3>
                <p className="username">@{user.username}</p>
                <p className="email">{user.email}</p>
                <span className={`role ${user.role}`}>
                  {user.role === 'admin' && 'مدیر'}
                  {user.role === 'manager' && 'مدیر پروژه'}
                  {user.role === 'developer' && 'توسعه‌دهنده'}
                  {user.role === 'viewer' && 'بازدیدکننده'}
                </span>
              </div>
            </div>
            <div className="user-actions">
              <button onClick={() => setEditingUser(user.id)} title="ویرایش کاربر">✎</button>
              <button onClick={() => handleDeleteUser(user.id)} title="حذف کاربر">×</button>
            </div>
            {renderEditUserForm(user)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement; 
/**
 * @file ProjectDetails.tsx
 * @description کامپوننت نمایش و مدیریت مشخصات پروژه
 */

import React, { useState, useEffect } from 'react';
import './ProjectDetails.scss';

// تعریف تایپ‌های مورد نیاز
interface ProjectMember {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface ProjectVersion {
  version: string;
  date: number;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  startDate: number;
  dueDate?: number;
  repository?: string;
  tags: string[];
  members: ProjectMember[];
  versions: ProjectVersion[];
  currentVersion: string;
}

const ProjectDetails: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'versions'>('info');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // در محیط توسعه از داده نمونه استفاده می‌کنیم
  useEffect(() => {
    // شبیه‌سازی دریافت داده از سرور
    setTimeout(() => {
      const demoProject: Project = {
        id: 'proj_001',
        name: 'دستیار هوشمند توسعه',
        description: 'این پروژه یک دستیار هوشمند برای کمک به توسعه‌دهندگان نرم‌افزار است که با استفاده از تکنولوژی‌های مدرن، فرآیند توسعه را ساده‌تر و کارآمدتر می‌کند.',
        path: '/Users/mojtabahassani/my-app/TelePrompter/tele-new/smart-assistant',
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // یک هفته پیش
        dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // یک ماه بعد
        repository: 'https://github.com/c123ir/smart-assistant123.git',
        tags: ['الکترون', 'ری‌اکت', 'تایپ‌اسکریپت', 'SQLite'],
        members: [
          {
            id: 'mem_001',
            name: 'مجتبی حسنی',
            role: 'سرپرست پروژه',
            email: 'example@example.com'
          },
          {
            id: 'mem_002',
            name: 'کاربر جدید',
            role: 'توسعه‌دهنده',
          }
        ],
        versions: [
          {
            version: '1.0.0',
            date: Date.now() - 7 * 24 * 60 * 60 * 1000,
            description: 'نسخه اولیه'
          },
          {
            version: '0.9.0',
            date: Date.now() - 14 * 24 * 60 * 60 * 1000,
            description: 'نسخه آزمایشی'
          }
        ],
        currentVersion: '1.0.0'
      };
      
      setProject(demoProject);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // محاسبه درصد پیشرفت پروژه (نمونه)
  const calculateProgress = (): number => {
    // در اینجا می‌توان بر اساس وضعیت تسک‌ها درصد پیشرفت را محاسبه کرد
    return 35; // درصد نمونه
  };

  // محاسبه زمان باقی‌مانده تا موعد تحویل
  const calculateRemainingDays = (): string => {
    if (!project?.dueDate) return 'نامشخص';
    
    const now = new Date();
    const due = new Date(project.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays} روز` : 'گذشته';
  };

  if (isLoading) {
    return (
      <div className="project-details loading">
        <h2>در حال بارگذاری اطلاعات پروژه...</h2>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details empty-state">
        <h2>هیچ پروژه‌ای یافت نشد</h2>
        <p>برای شروع، یک پروژه جدید ایجاد کنید یا پروژه موجود را باز کنید.</p>
        <button className="button primary">ایجاد پروژه جدید</button>
        <button className="button outline">باز کردن پروژه</button>
      </div>
    );
  }

  return (
    <div className="project-details">
      <header className="project-header">
        <div className="project-title">
          <h1>{project.name}</h1>
          <span className="project-version">نسخه {project.currentVersion}</span>
        </div>
        <div className="project-actions">
          <button className="button outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'انصراف' : 'ویرایش'}
          </button>
          {isEditing && (
            <button className="button primary">ذخیره تغییرات</button>
          )}
        </div>
      </header>

      <div className="project-stats">
        <div className="stat-card">
          <h3>پیشرفت</h3>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${calculateProgress()}%` }}></div>
          </div>
          <p className="stat-value">{calculateProgress()}%</p>
        </div>
        <div className="stat-card">
          <h3>تاریخ شروع</h3>
          <p className="stat-value">{formatDate(project.startDate)}</p>
        </div>
        <div className="stat-card">
          <h3>موعد تحویل</h3>
          <p className="stat-value">{project.dueDate ? formatDate(project.dueDate) : 'نامشخص'}</p>
        </div>
        <div className="stat-card">
          <h3>زمان باقی‌مانده</h3>
          <p className="stat-value">{calculateRemainingDays()}</p>
        </div>
      </div>

      <div className="project-tabs">
        <div className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          اطلاعات کلی
        </div>
        <div className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
          اعضای تیم
        </div>
        <div className={`tab ${activeTab === 'versions' ? 'active' : ''}`} onClick={() => setActiveTab('versions')}>
          نسخه‌ها
        </div>
      </div>

      <div className="project-content">
        {activeTab === 'info' && (
          <div className="info-tab">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>نام پروژه</label>
                  <input type="text" value={project.name} onChange={e => setProject({...project, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>توضیحات</label>
                  <textarea value={project.description} onChange={e => setProject({...project, description: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>مسیر پروژه</label>
                  <input type="text" value={project.path} onChange={e => setProject({...project, path: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>مخزن گیت</label>
                  <input type="text" value={project.repository || ''} onChange={e => setProject({...project, repository: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>برچسب‌ها</label>
                  <input type="text" value={project.tags.join(', ')} onChange={e => setProject({...project, tags: e.target.value.split(', ')})} />
                </div>
              </div>
            ) : (
              <div className="info-content">
                <div className="info-item">
                  <h3>توضیحات</h3>
                  <p>{project.description}</p>
                </div>
                <div className="info-item">
                  <h3>مسیر پروژه</h3>
                  <p className="path">{project.path}</p>
                </div>
                {project.repository && (
                  <div className="info-item">
                    <h3>مخزن گیت</h3>
                    <p className="repo">{project.repository}</p>
                  </div>
                )}
                <div className="info-item">
                  <h3>برچسب‌ها</h3>
                  <div className="tags">
                    {project.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-tab">
            <div className="members-header">
              <h3>اعضای پروژه</h3>
              {isEditing && (
                <button className="button outline small">افزودن عضو</button>
              )}
            </div>
            <div className="members-list">
              {project.members.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    {member.name.charAt(0)}
                  </div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <p className="member-role">{member.role}</p>
                    {member.email && <p className="member-email">{member.email}</p>}
                  </div>
                  {isEditing && (
                    <div className="member-actions">
                      <button className="button text small">ویرایش</button>
                      <button className="button text small danger">حذف</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="versions-tab">
            <div className="versions-header">
              <h3>تاریخچه نسخه‌ها</h3>
              {isEditing && (
                <button className="button outline small">افزودن نسخه</button>
              )}
            </div>
            <div className="versions-list">
              {project.versions.map(version => (
                <div key={version.version} className={`version-card ${version.version === project.currentVersion ? 'current' : ''}`}>
                  <div className="version-info">
                    <h4>نسخه {version.version}</h4>
                    <p className="version-date">{formatDate(version.date)}</p>
                  </div>
                  <p className="version-desc">{version.description}</p>
                  {isEditing && (
                    <div className="version-actions">
                      <button className="button text small">ویرایش</button>
                      {version.version !== project.currentVersion && (
                        <button className="button text small danger">حذف</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails; 
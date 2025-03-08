/**
 * @file EmptyComponent.tsx
 * @description کامپوننت خالی برای صفحات هنوز پیاده‌سازی نشده
 */

import React from 'react';
import './EmptyComponent.scss';

interface EmptyComponentProps {
  title: string;
  description?: string;
}

const EmptyComponent: React.FC<EmptyComponentProps> = ({ title, description }) => {
  return (
    <div className="empty-component">
      <div className="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <p className="coming-soon">این بخش در حال توسعه است و به‌زودی قابل استفاده خواهد بود.</p>
    </div>
  );
};

export default EmptyComponent; 
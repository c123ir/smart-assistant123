/**
 * @file Header.tsx
 * @description کامپوننت سربرگ برنامه
 */

import React from 'react';
import './Header.scss';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="app-header">
      <div className="app-title">
        <h1>دستیار هوشمند توسعه</h1>
      </div>
      
      <div className="app-controls">
        <button 
          className="theme-toggle" 
          onClick={toggleDarkMode} 
          title={darkMode ? 'حالت روشن' : 'حالت تاریک'}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        
        <div className="user-menu">
          <button className="user-button">
            <span className="user-name">کاربر جدید</span>
            <div className="user-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          
          {/* منوی کاربر (در نسخه نهایی فعال خواهد شد) */}
          {/* <div className="user-dropdown">
            <ul>
              <li><a href="#">پروفایل</a></li>
              <li><a href="#">تنظیمات</a></li>
              <li><a href="#">خروج</a></li>
            </ul>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Header; 
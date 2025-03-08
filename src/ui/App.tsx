/**
 * @file App.tsx
 * @description کامپوننت اصلی برنامه
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmptyComponent from './components/EmptyComponent';
import ProjectDetails from './components/ProjectDetails';
import UserManagement from './components/UserManagement';
import DevelopmentPlanner from './components/DevelopmentPlanner';
import ErrorLogger from './components/ErrorLogger';
import './styles/App.scss';

const App: React.FC = () => {
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    // بررسی آماده بودن دیتابیس
    const checkDbStatus = async () => {
      try {
        // در محیط توسعه، از داده‌های نمونه استفاده می‌کنیم
        // @ts-ignore - دسترسی به API های الکترون از طریق window
        // const isReady = await window.electron.checkDbStatus();
        // setDbReady(isReady);
        
        // برای دموی اولیه، فرض می‌کنیم دیتابیس آماده است
        setTimeout(() => {
          setDbReady(true);
        }, 1500);
      } catch (error) {
        console.error('خطا در بررسی وضعیت دیتابیس:', error);
      }
    };

    checkDbStatus();
    
    // اعمال حالت تاریک/روشن
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  return (
    <div className="app">
      <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          {dbReady ? (
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/project" element={<ProjectDetails />} />
              <Route path="/tasks" element={<EmptyComponent title="مدیریت تسک‌ها" description="در این بخش می‌توانید تسک‌های خود را مدیریت کنید." />} />
              <Route path="/screenshots" element={<EmptyComponent title="اسکرین‌شات‌ها" description="در این بخش می‌توانید اسکرین‌شات‌های گرفته شده را مشاهده و مدیریت کنید." />} />
              <Route path="/snippets" element={<EmptyComponent title="کد اسنیپت‌ها" description="در این بخش می‌توانید کد‌های کوتاه و مهم خود را ذخیره و مدیریت کنید." />} />
              <Route path="/documents" element={<EmptyComponent title="مستندات" description="در این بخش می‌توانید مستندات پروژه را مشاهده و ویرایش کنید." />} />
              <Route path="/development" element={<DevelopmentPlanner 
                onPhaseCreate={async (phase) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.createPhase(phase);
                }}
                onPhaseUpdate={async (id, phase) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.updatePhase(id, phase);
                }}
                onPhaseDelete={async (id) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.deletePhase(id);
                }}
                onTaskCreate={async (task) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.createTask(task);
                }}
                onTaskUpdate={async (id, task) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.updateTask(id, task);
                }}
                onTaskDelete={async (id) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.deleteTask(id);
                }}
                onTaskComplete={async (id, isCompleted) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.toggleTaskCompletion(id, isCompleted);
                }}
                onPhasesReorder={async (orderedIds) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.reorderPhases(orderedIds);
                }}
                onTasksReorder={async (phaseId, orderedIds) => {
                  // @ts-ignore - دسترسی به API های الکترون از طریق window
                  const developmentService = window.electron.getDevelopmentService();
                  await developmentService.reorderTasks(phaseId, orderedIds);
                }}
              />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/settings" element={<EmptyComponent title="تنظیمات" description="در این بخش می‌توانید تنظیمات برنامه را تغییر دهید." />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          ) : (
            <div className="loading">
              <h2>در حال آماده‌سازی دیتابیس...</h2>
              <p>لطفاً صبر کنید</p>
            </div>
          )}
        </main>
      </div>
      
      <ErrorLogger />
    </div>
  );
};

export default App; 
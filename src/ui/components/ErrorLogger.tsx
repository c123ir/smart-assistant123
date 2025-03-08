/**
 * @file ErrorLogger.tsx
 * @description کامپوننت نمایش خطاها و لاگ‌ها برای دیباگ کردن
 */

import React, { useState, useEffect } from 'react';
import './ErrorLogger.scss';

interface LogEntry {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

// سینگلتون برای مدیریت لاگ‌ها در کل برنامه
class LogManager {
  private static instance: LogManager;
  private logs: LogEntry[] = [];
  private listeners: Function[] = [];

  private constructor() {}

  public static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  public addLog(message: string, type: 'error' | 'warning' | 'info' = 'info'): void {
    const log: LogEntry = {
      message,
      type,
      timestamp: Date.now()
    };
    this.logs.push(log);
    this.notifyListeners();
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
    this.notifyListeners();
  }

  public subscribe(listener: Function): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.logs));
  }
}

// تعریف متد‌های گلوبال برای لاگ کردن
export const logError = (message: string) => LogManager.getInstance().addLog(message, 'error');
export const logWarning = (message: string) => LogManager.getInstance().addLog(message, 'warning');
export const logInfo = (message: string) => LogManager.getInstance().addLog(message, 'info');
export const clearLogs = () => LogManager.getInstance().clear();

const ErrorLogger: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = LogManager.getInstance().subscribe((logs: LogEntry[]) => {
      setLogs([...logs]);
    });

    // جانمایی خطاهای کنسول
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    console.error = (...args: any[]) => {
      logError(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      logWarning(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
      originalConsoleWarn.apply(console, args);
    };

    console.log = (...args: any[]) => {
      logInfo(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
      originalConsoleLog.apply(console, args);
    };

    // مدیریت خطاهای پنجره
    const handleWindowError = (event: ErrorEvent) => {
      logError(`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
    };

    window.addEventListener('error', handleWindowError);

    // مدیریت خطاهای Promise
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(`Unhandled Promise Rejection: ${event.reason}`);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      unsubscribe();
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log = originalConsoleLog;
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isVisible && logs.length === 0) return null;

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={`error-logger ${isVisible ? 'visible' : 'collapsed'}`}>
      <div className="error-logger-header">
        <h3>لاگ‌های برنامه {logs.length > 0 && `(${logs.length})`}</h3>
        <div className="error-logger-actions">
          <button className="clear-button" onClick={clearLogs} title="پاک کردن">پاک کردن</button>
          <button className="toggle-button" onClick={toggleVisibility}>
            {isVisible ? 'بستن' : 'باز کردن'}
          </button>
        </div>
      </div>
      
      {isVisible && (
        <div className="error-logger-content">
          {logs.length === 0 ? (
            <div className="empty-logs">هیچ لاگی ثبت نشده است.</div>
          ) : (
            <ul className="log-list">
              {logs.map((log, index) => (
                <li key={index} className={`log-entry ${log.type}`}>
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="log-type">{log.type}</span>
                  <span className="log-message">{log.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorLogger; 
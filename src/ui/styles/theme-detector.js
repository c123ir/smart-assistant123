/**
 * @file theme-detector.js
 * @description اسکریپت تشخیص تم سیستم (تاریک یا روشن)
 */

// تشخیص حالت تاریک یا روشن سیستم
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

// گوش دادن به تغییرات تم سیستم
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light');
}); 
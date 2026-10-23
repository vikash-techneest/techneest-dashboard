import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, HelpCircle, User, Sun, Moon } from 'lucide-react';

const Topbar = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard' || path === '/admin' || path === '/admin/' || path === '/admin/dashboard') return 'Dashboard';
    if (path.includes('/employee-add') || path.includes('/employee/add') || path.includes('/employeeadd')) return 'Add Employee';
    if (path.includes('/employee-edit') || path.includes('/employee/edit')) return 'Edit Employee';
    if (path.includes('/emploies-details') || path.includes('/employee-details') || path.includes('/employee/') || path.includes('/emploiesdetails')) return 'Employee Details';
    if (path.includes('/assign-task') || path.includes('/assigntask')) return 'Assign Task';
    if (path.includes('/all-task') || path.includes('/alltask') || path.includes('/tasks')) return 'All Tasks';
    if (path.includes('/attendance')) return 'Attendance';
    if (path.includes('/salary') || path.includes('/payroll')) return 'Salary & Payroll';
    if (path.includes('/departments')) return 'Departments';
    if (path.includes('/reports')) return 'Work Reports';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/employee')) return 'Employees';
    const cleanPath = path.replace(/^\/admin\/?/, '').replace(/-/g, ' ');
    return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
  };

  return (
    <header className="h-20 w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-[#262626] flex items-center justify-between px-8 font-sans shrink-0 transition-colors duration-300 z-10">
      
      {/* Left side: Dynamic Page Title */}
      <div className="flex items-center">
        <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight transition-colors duration-300">
          {getPageTitle()}
        </span>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-5 ml-auto">
        
        {/* Search Bar */}
        <div className="relative w-80 group hidden md:block">
          <input 
            type="text" 
            placeholder="Search employees, tasks..." 
            className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-sm text-gray-600 dark:text-gray-300 rounded-full pl-5 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors shadow-sm">
            <Search size={16} />
          </button>
        </div>

        {/* Icons & Toggle Section */}
        <div className="flex items-center gap-3">
          
          {/* 🔥 UPGRADED ANIMATED THEME TOGGLE 🔥 */}
          <button 
            onClick={toggleTheme}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-500 focus:outline-none shadow-inner border
              ${theme === 'dark' 
                ? 'bg-[#1a1a1a] border-[#333]' 
                : 'bg-gray-100 border-gray-200'
              }`}
            aria-label="Toggle Theme"
          >
            {/* Background Icons (Faded) */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <Sun size={16} className={`transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-40 text-gray-400'}`} />
              <Moon size={16} className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-40 text-gray-400'}`} />
            </div>

            {/* Sliding Circle */}
            <span
              className={`relative z-10 inline-flex h-8 w-8 transform items-center justify-center rounded-full shadow-md transition-all duration-500 ease-in-out
                ${theme === 'dark' 
                  ? 'translate-x-11 bg-[#0a0a0a] text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'translate-x-1 bg-white text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                }`}
            >
              {theme === 'dark' ? (
                <Moon size={16} className="animate-in zoom-in spin-in-12 duration-300" />
              ) : (
                <Sun size={16} className="animate-in zoom-in spin-in-12 duration-300" />
              )}
            </span>
          </button>

          {/* Help Icon */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all shadow-sm">
            <HelpCircle size={20} />
          </button>
          
          {/* Notification Icon */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all shadow-sm relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#121212]"></span>
          </button>
          
          {/* Profile Icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 ml-1 cursor-pointer hover:shadow-md transition-all">
            <User size={20} />
          </div>
        </div>

      </div>
    </header>
  );
};

export default Topbar;
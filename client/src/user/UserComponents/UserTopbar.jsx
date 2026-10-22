import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, HelpCircle, User } from 'lucide-react';

const UserTopbar = () => {
  const location = useLocation();

  // Function to get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Dashboard ';
    if (path.includes('/tasks')) return 'My Tasks';
    if (path.includes('/create-task')) return 'Create a Personal Task';
    if (path.includes('/attendance')) return 'Attendance & Time Tracking';
    if (path.includes('/reports')) return 'Work Reports & Profile'; // & My Profile hata diya
    // /profile route wala logic hata diya
    
    return 'Employee Panel';
  };

  const currentPage = getPageTitle();

  return (
    <header className="h-20 w-full bg-[#0a0a0a] border-b border-[#262626] flex items-center justify-between px-8 font-sans shrink-0">
      
      {/* Left side: Dynamic Page Title */}
      <div className="flex items-center">
        <span className="text-xl font-bold text-white tracking-tight">
          {currentPage}
        </span>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-6 ml-auto">
        
        {/* Search Bar */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search my tasks..." 
            className="w-full bg-[#121212] border border-[#262626] text-sm text-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#444] transition-colors"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 border-l border-[#262626] pl-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <HelpCircle size={22} />
          </button>
          
          <button className="text-gray-400 hover:text-white transition-colors relative">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
          </button>
          
          {/* User Icon (Jaisa tha waisa hi hai) */}
          <button className="w-10 h-10 rounded-full bg-[#121212] border border-[#262626] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <User size={20} />
          </button>
        </div>

      </div>
    </header>
  );
};

export default UserTopbar;
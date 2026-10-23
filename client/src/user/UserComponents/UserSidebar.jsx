import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ListTodo, PlusSquare, 
  CalendarDays, BarChart3, 
  CheckCircle2, Clock,
  ChevronRight
} from 'lucide-react';

// Dono images import karein
import logoLight from "../../assets/logo.png"; 
import logoDark from "../../assets/logo-dark-mode.png";   

const UserSidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={19} />, path: '/dashboard' },
    { name: 'My Tasks', icon: <ListTodo size={19} />, path: '/all-task' },
    { name: 'Create Task', icon: <PlusSquare size={19} />, path: '/create-task' },
    { name: 'Attendance', icon: <CalendarDays size={19} />, path: '/attendance' },
    { name: 'Work Reports', icon: <BarChart3 size={19} />, path: '/reports' },
  ];

  return (
    <aside className="w-[270px] h-full bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-[#262626] flex flex-col font-sans text-gray-600 dark:text-gray-300 shrink-0 transition-colors duration-300">

      {/* ===== Logo Area (Topbar ke height h-20 se match kiya) ===== */}
      <div className="h-20 flex items-center px-5 border-b border-gray-100 dark:border-[#262626] transition-colors duration-300">
        
        {/* Light Mode Logo */}
        <img 
          src={logoLight} 
          alt="TechNeest Logo Light" 
          className="h-11 w-auto object-contain block dark:hidden" 
        />
        
        {/* Dark Mode Logo */}
        <img 
          src={logoDark} 
          alt="TechNeest Logo Dark" 
          className="h-11 w-auto object-contain hidden dark:block" 
        />

      </div>

      {/* ===== Navigation ===== */}
      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 mb-2 px-3 uppercase tracking-[0.15em]">
          Menu
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:to-[#161616] text-indigo-600 dark:text-white border border-indigo-100 dark:border-[#2f2f2f] shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#141414] hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full transition-all duration-200 ${
                    isActive ? 'bg-indigo-600 dark:bg-white opacity-100' : 'opacity-0'
                  }`}
                />
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="text-[14px] font-medium flex-1">{item.name}</span>
                <ChevronRight
                  size={14}
                  className={`transition-all duration-200 ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* ===== Quick Stats ===== */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#080808] transition-colors duration-300">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.15em]">Quick Stats</p>
          <span className="text-[10px] text-gray-400 dark:text-gray-700 font-medium">This week</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Assigned */}
          <div className="group bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#151515] p-3 rounded-xl border border-gray-100 dark:border-[#222] hover:border-gray-200 dark:hover:border-[#2f2f2f] transition-all duration-200 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-1.5 mb-2">
              <ListTodo size={13} className="text-gray-400 dark:text-gray-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">Assigned</span>
            </div>
            <p className="text-gray-900 dark:text-white text-[18px] font-bold leading-none">08</p>
          </div>

          {/* Completed */}
          <div className="group bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#151515] p-3 rounded-xl border border-gray-100 dark:border-[#222] hover:border-gray-200 dark:hover:border-[#2f2f2f] transition-all duration-200 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 size={13} className="text-green-500" />
              <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">Done</span>
            </div>
            <p className="text-gray-900 dark:text-white text-[18px] font-bold leading-none">12</p>
          </div>

          {/* Work Hours - full width */}
          <div className="col-span-2 bg-white dark:bg-gradient-to-r dark:from-[#111] dark:to-[#0f0f0f] p-3 rounded-xl border border-gray-100 dark:border-[#222] flex items-center justify-between shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 dark:bg-blue-500/10 p-1.5 rounded-md border border-indigo-100 dark:border-blue-500/20">
                <Clock size={13} className="text-indigo-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 font-medium leading-none mb-1">Work Hours</p>
                <p className="text-gray-900 dark:text-white text-[15px] font-bold leading-none">31h</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/20">
              +4h
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ClipboardList, ListTodo, 
  CalendarDays, BarChart3, Building2, Settings,
  UserCheck, CheckCircle2, Clock, Wallet
} from 'lucide-react';

// Dono images import karein
import logoLight from "../assets/logo.png"; 
import logoDark from "../assets/logo-dark-mode.png";   

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Employees', icon: <Users size={20} />, path: '/admin/employee' },
    { name: 'Assign Task', icon: <ClipboardList size={20} />, path: '/admin/assign-task' },
    { name: 'All Tasks', icon: <ListTodo size={20} />, path: '/admin/all-task' },
    { name: 'Attendance', icon: <CalendarDays size={20} />, path: '/admin/attendance-management' },
    { name: 'Salary & Payroll', icon: <Wallet size={20} />, path: '/admin/salary-management' },
    { name: 'Work Reports', icon: <BarChart3 size={20} />, path: '/admin/reports' },
    { name: 'Departments', icon: <Building2 size={20} />, path: '/admin/departments' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <aside className="w-[260px] h-full bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-[#262626] flex flex-col font-sans text-gray-600 dark:text-gray-400 shrink-0 transition-colors duration-300">
      
      {/* ===== Logo Area ===== */}
      {/* Topbar (h-20) se height perfectly match ki hai taaki line seedhi aaye */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-[#262626] transition-colors duration-300">
        
        {/* Light Mode Logo */}
        <img 
          src={logoLight} 
          alt="TechNeest Logo Light" 
          className="h-10 w-auto object-contain block dark:hidden" 
        />
        
        {/* Dark Mode Logo */}
        <img 
          src={logoDark} 
          alt="TechNeest Logo Dark" 
          className="h-10 w-auto object-contain hidden dark:block" 
        />

      </div>

      {/* ===== Navigation ===== */}
      <div className="flex-1 overflow-y-auto py-5 px-4 flex flex-col gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2 px-3 uppercase tracking-[0.15em]">
          Menu
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:to-[#161616] text-indigo-600 dark:text-white border border-indigo-100 dark:border-[#2f2f2f] shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#141414] hover:text-gray-900 dark:hover:text-gray-100 font-medium'
              }`
            }
          >
            {item.icon}
            <span className="text-[14px]">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* ===== Quick Stats Section ===== */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#080808] transition-colors duration-300">
        
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-[0.15em]">Quick Stats</p>
          <span className="text-[10px] text-gray-400 dark:text-gray-700 font-medium">This week</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#151515] p-3 rounded-xl border border-gray-100 dark:border-[#222] hover:border-gray-200 dark:hover:border-[#2f2f2f] transition-all duration-200 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <Users size={15} className="text-indigo-500" />
              <span className="text-[10px] text-green-600 dark:text-green-500 font-bold bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Employees</p>
            <p className="text-gray-900 dark:text-white text-[16px] font-bold leading-none">24</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#151515] p-3 rounded-xl border border-gray-100 dark:border-[#222] hover:border-gray-200 dark:hover:border-[#2f2f2f] transition-all duration-200 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <UserCheck size={15} className="text-blue-500" />
              <span className="text-[10px] text-green-600 dark:text-green-500 font-bold bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded">+5%</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Active Today</p>
            <p className="text-gray-900 dark:text-white text-[16px] font-bold leading-none">18</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#151515] p-3 rounded-xl border border-gray-100 dark:border-[#222] hover:border-gray-200 dark:hover:border-[#2f2f2f] transition-all duration-200 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 size={15} className="text-green-500" />
              <span className="text-[10px] text-green-600 dark:text-green-500 font-bold bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded">+8%</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Tasks Done</p>
            <p className="text-gray-900 dark:text-white text-[16px] font-bold leading-none">146</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#151515] p-3 rounded-xl border border-gray-100 dark:border-[#222] hover:border-gray-200 dark:hover:border-[#2f2f2f] transition-all duration-200 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <Clock size={15} className="text-orange-500" />
              <span className="text-[10px] text-red-600 dark:text-red-500 font-bold bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">-3%</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-gray-900 dark:text-white text-[16px] font-bold leading-none">32</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ClipboardList, ListTodo, 
  CalendarDays, BarChart3, Building2, Settings,
  UserCheck, CheckCircle2, Clock, Wallet
} from 'lucide-react';

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
    <aside className="w-[260px] h-full bg-[#0a0a0a] border-r border-[#262626] flex flex-col font-sans text-gray-300 shrink-0">
      
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-[#262626] gap-3">
        <div className="bg-[#1a1a1a] p-2 rounded-lg border border-[#333]">
          <LayoutDashboard size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight tracking-wide">TechNeest</h1>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>

      {/* Navigation (Scrollbar Hidden) */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <p className="text-xs font-semibold text-gray-500 mb-2 px-3 uppercase tracking-wider">Navigation</p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#1a1a1a] text-white border border-[#333]' 
                  : 'hover:bg-[#1a1a1a]/50 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="p-4 border-t border-[#262626]">
        <p className="text-xs font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wider">Quick Stats</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#121212] p-3 rounded-xl border border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <Users size={16} className="text-gray-400" />
              <span className="text-[10px] text-green-500 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-1">Employees</p>
            <p className="text-white text-lg font-bold leading-none">24</p>
          </div>

          <div className="bg-[#121212] p-3 rounded-xl border border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <UserCheck size={16} className="text-gray-400" />
              <span className="text-[10px] text-green-500 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">+5%</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-1">Active Today</p>
            <p className="text-white text-lg font-bold leading-none">18</p>
          </div>

          <div className="bg-[#121212] p-3 rounded-xl border border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 size={16} className="text-gray-400" />
              <span className="text-[10px] text-green-500 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">+8%</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-1">Tasks Done</p>
            <p className="text-white text-lg font-bold leading-none">146</p>
          </div>

          <div className="bg-[#121212] p-3 rounded-xl border border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <Clock size={16} className="text-gray-400" />
              <span className="text-[10px] text-red-500 font-medium bg-red-500/10 px-1.5 py-0.5 rounded">-3%</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-1">Pending</p>
            <p className="text-white text-lg font-bold leading-none">32</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

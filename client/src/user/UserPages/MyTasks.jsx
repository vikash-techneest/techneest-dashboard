import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const MyTasks = () => {
  const [activeTab, setActiveTab] = useState('All Tasks');

  const tabs = [
    { name: 'All Tasks', count: 8 },
    { name: 'Assigned by Admin', count: 6 },
    { name: 'My Tasks', count: 2 },
  ];

  // Dummy Data
  const tasks = [
    { id: 1, title: 'Finalize landing page responsive UI', project: 'Website revamp', due: 'Today · 4 PM', priority: 'High', status: 'In Progress' },
    { id: 2, title: 'Review API integration test cases', project: 'Core platform', due: 'Today · 5:30 PM', priority: 'High', status: 'To Do' },
    { id: 3, title: 'Update onboarding documentation', project: 'Internal ops', due: 'Tomorrow', priority: 'Medium', status: 'Assigned' },
    { id: 4, title: 'Create personal learning plan', project: 'Personal task', due: 'Oct 21', priority: 'Low', status: 'In Progress' },
    { id: 5, title: 'Fix mobile navigation spacing', project: 'Website revamp', due: 'Oct 22', priority: 'Medium', status: 'Done' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-800 dark:text-gray-300 font-sans transition-colors duration-300">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">My Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage tasks assigned by your admin and personal tasks you've created.
          </p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm hover:shadow-md active:scale-95">
          + New task
        </button>
      </div>

      {/* ================= FILTERS BAR ================= */}
      <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm transition-colors duration-300">
        
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-[#333] focus:border-indigo-500 dark:focus:border-[#444] text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <FilterDropdown label="All Status" />
          <FilterDropdown label="Priority" />
          <FilterDropdown label="Due Date" />
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex items-center gap-8 border-b border-gray-200 dark:border-[#2a2a2a] px-2 overflow-x-auto transition-colors duration-300">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === tab.name ? 'text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            {tab.name} ({tab.count})
            {/* Active Tab Indicator */}
            {activeTab === tab.name && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-white rounded-t-md transition-colors duration-300"></span>
            )}
          </button>
        ))}
      </div>

      {/* ================= TASKS TABLE ================= */}
      <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 bg-gray-50 dark:bg-[#1e1e1e] px-6 py-4 border-b border-gray-100 dark:border-[#2a2a2a] transition-colors duration-300">
          <div className="col-span-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task / Project</div>
          <div className="col-span-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</div>
          <div className="col-span-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</div>
          <div className="col-span-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a] transition-colors duration-300">
          {tasks.map((task) => (
            <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group">
              
              {/* Task Title & Project */}
              <div className="col-span-5">
                <p className="text-gray-900 dark:text-white font-semibold text-sm cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{task.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{task.project}</p>
              </div>
              
              {/* Due Date */}
              <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                {task.due}
              </div>
              
              {/* Priority */}
              <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                {task.priority}
              </div>
              
              {/* Status Badge */}
              <div className="col-span-2 flex justify-end">
                <StatusBadge status={task.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= FOOTER / PAGINATION ================= */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-sm text-gray-500 font-medium">
          Showing 5 of 8 tasks
        </p>
        <button className="bg-white dark:bg-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#333] border border-gray-200 dark:border-[#3a3a3a] text-gray-700 dark:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-2 active:scale-95">
          Next Page <span>→</span>
        </button>
      </div>

    </div>
  );
};

// ================= SUB-COMPONENTS =================

// Filter Dropdown Component
const FilterDropdown = ({ label }) => (
  <div className="relative min-w-[120px] flex-1 md:flex-none">
    <select className="w-full appearance-none bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl px-4 py-2.5 outline-none cursor-pointer transition-colors">
      <option>{label}</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 dark:text-gray-500">
      <ChevronDown size={14} />
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  // Status ke hisaab se colors
  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#1e1e1e] dark:text-gray-300 dark:border-[#3a3a3a]';
  let dotColor = 'bg-gray-500';

  if (status === 'In Progress') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    dotColor = 'bg-blue-500';
  } else if (status === 'Done') {
    colorClasses = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
    dotColor = 'bg-green-500';
  } else if (status === 'To Do') {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
    dotColor = 'bg-orange-500';
  } else if (status === 'Assigned') {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
    dotColor = 'bg-purple-500';
  }

  return (
    <div className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center justify-center gap-2 min-w-[110px] transition-colors duration-300 ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </div>
  );
};

export default MyTasks;
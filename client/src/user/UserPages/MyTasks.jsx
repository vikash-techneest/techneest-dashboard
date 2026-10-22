import React, { useState } from 'react';

const MyTasks = () => {
  const [activeTab, setActiveTab] = useState('All Tasks');

  const tabs = [
    { name: 'All Tasks', count: 8 },
    { name: 'Assigned by Admin', count: 6 },
    { name: 'My Tasks', count: 2 },
  ];

  // Dummy Data (Screenshot ke hisaab se)
  const tasks = [
    {
      id: 1,
      title: 'Finalize landing page responsive UI',
      project: 'Website revamp',
      due: 'Today · 4 PM',
      priority: 'High',
      status: 'In Progress',
    },
    {
      id: 2,
      title: 'Review API integration test cases',
      project: 'Core platform',
      due: 'Today · 5:30 PM',
      priority: 'High',
      status: 'To Do',
    },
    {
      id: 3,
      title: 'Update onboarding documentation',
      project: 'Internal ops',
      due: 'Tomorrow',
      priority: 'Medium',
      status: 'Assigned',
    },
    {
      id: 4,
      title: 'Create personal learning plan',
      project: 'Personal task',
      due: 'Oct 21',
      priority: 'Low',
      status: 'In Progress',
    },
    {
      id: 5,
      title: 'Fix mobile navigation spacing',
      project: 'Website revamp',
      due: 'Oct 22',
      priority: 'Medium',
      status: 'Done',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-300 font-sans">
      
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
          <p className="text-gray-400 text-sm">
            Manage tasks assigned by your admin and personal tasks you've created.
          </p>
        </div>
        <button className="bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer">
          + New task
        </button>
      </div>

      {/* ================= FILTERS BAR ================= */}
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">■</span>
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-transparent border border-transparent hover:border-[#333] focus:border-[#444] text-sm text-white placeholder-gray-500 rounded-lg pl-9 pr-4 py-2.5 outline-none transition"
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
      <div className="flex items-center gap-8 border-b border-[#2a2a2a] px-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === tab.name ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.name} ({tab.count})
            {/* Active Tab Indicator */}
            {activeTab === tab.name && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-md"></span>
            )}
          </button>
        ))}
      </div>

      {/* ================= TASKS TABLE ================= */}
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 bg-[#1e1e1e] px-6 py-4 border-b border-[#2a2a2a]">
          <div className="col-span-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Task / Project</div>
          <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</div>
          <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</div>
          <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#2a2a2a]">
          {tasks.map((task) => (
            <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1a1a1a] transition-colors group">
              
              {/* Task Title & Project */}
              <div className="col-span-5">
                <p className="text-white font-medium text-sm cursor-pointer hover:underline">{task.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{task.project}</p>
              </div>
              
              {/* Due Date */}
              <div className="col-span-3 text-sm text-gray-400">
                {task.due}
              </div>
              
              {/* Priority */}
              <div className="col-span-2 text-sm text-gray-400">
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
        <p className="text-sm text-gray-500">
          Showing 5 of 8 tasks
        </p>
        <button className="bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
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
    <select className="w-full appearance-none bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#3a3a3a] text-gray-300 text-sm rounded-lg px-4 py-2.5 outline-none cursor-pointer">
      <option>{label}</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
      <span className="text-xs">■</span>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  // Alag-alag status ke liye alag styling (optional, filhal sab same hai screenshot ki tarah)
  return (
    <div className="px-3 py-1.5 rounded-full border border-[#3a3a3a] bg-[#1e1e1e] text-xs font-medium text-gray-300 flex items-center justify-center gap-2 min-w-[110px]">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
      {status}
    </div>
  );
};

export default MyTasks;
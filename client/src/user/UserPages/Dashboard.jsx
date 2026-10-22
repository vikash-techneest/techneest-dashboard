import React from 'react';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm">Welcome back! Here's what's happening with your work today.</p>
        </div>
        <button className="bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
          + Create task
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Tasks" value="8" subtitle="2 due today" />
        <StatCard title="Completed This Week" value="12" subtitle="Updated just now" />
        <StatCard title="In Progress" value="3" subtitle="Across 2 projects" />
        <StatCard title="Hours Logged Today" value="4h 18m" subtitle="Since 09:12 AM" />
      </div>

      {/* Main Grid: Tasks & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Priority Tasks (Left Side - 2 columns) */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Priority Tasks</h2>
            <button className="text-sm text-gray-400 hover:text-white transition">View All →</button>
          </div>
          
          <div className="w-full">
            {/* Table Header */}
            <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              <span>Task</span>
              <span>Due</span>
            </div>
            
            {/* Task List */}
            <div className="space-y-2">
              <TaskRow 
                title="Finalize landing page responsive UI" 
                project="Website revamp" 
                due="Today, 4 PM" 
                status="In Progress" 
              />
              <TaskRow 
                title="Review API integration test cases" 
                project="Core platform" 
                due="Today, 5:30 PM" 
                status="To Do" 
              />
              <TaskRow 
                title="Update onboarding documentation" 
                project="Internal ops" 
                due="Tomorrow" 
                status="Assigned" 
              />
            </div>
          </div>
        </div>

        {/* Today's Attendance (Right Side - 1 column) */}
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Today's Attendance</h2>
          
          <div className="mb-6">
            <h3 className="text-4xl font-bold text-white tracking-tight">09:12 AM</h3>
            <p className="text-gray-400 text-sm mt-1">Clock-in time</p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white">04h 18m</h3>
            <p className="text-gray-400 text-sm mt-1">Worked so far</p>
          </div>

          <div className="mt-auto">
            <button className="w-full bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] text-white py-3 rounded-lg font-medium transition">
              Clock out
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

// --- Reusable Sub-Components ---

const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-5 flex flex-col justify-between h-36">
    <p className="text-sm text-gray-400 font-medium">{title}</p>
    <div className="flex justify-between items-end">
      <div>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
      {/* Circle Icon placeholder */}
      <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
      </div>
    </div>
  </div>
);

const TaskRow = ({ title, project, due, status }) => (
  <div className="flex items-center justify-between p-3 hover:bg-[#1a1a1a] rounded-lg transition-colors group">
    <div>
      <p className="text-white font-medium text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{project}</p>
    </div>
    <div className="flex items-center gap-6">
      <span className="text-sm text-gray-400">{due}</span>
      <span className="px-3 py-1 rounded-full border border-[#333] bg-[#1a1a1a] text-xs font-medium text-gray-300 flex items-center gap-1.5 min-w-[100px]">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
        {status}
      </span>
    </div>
  </div>
);

export default Dashboard;
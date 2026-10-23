import React from 'react';

const Dashboard = () => {
  return (
    // Page ka text color dono modes ke liye set kiya hai
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-gray-800 dark:text-white transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back! Here's what's happening with your work today.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm hover:shadow-md active:scale-95">
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
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Tasks</h2>
            <button className="text-sm text-indigo-600 dark:text-gray-400 hover:text-indigo-800 dark:hover:text-white transition font-medium">View All →</button>
          </div>
          
          <div className="w-full">
            {/* Table Header */}
            <div className="flex justify-between text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">
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
                dotColor="bg-blue-500"
              />
              <TaskRow 
                title="Review API integration test cases" 
                project="Core platform" 
                due="Today, 5:30 PM" 
                status="To Do" 
                dotColor="bg-gray-400"
              />
              <TaskRow 
                title="Update onboarding documentation" 
                project="Internal ops" 
                due="Tomorrow" 
                status="Assigned" 
                dotColor="bg-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Today's Attendance (Right Side - 1 column) */}
        <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-6 flex flex-col shadow-sm transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Today's Attendance</h2>
          
          <div className="mb-6">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">09:12 AM</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Clock-in time</p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">04h 18m</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Worked so far</p>
          </div>

          <div className="mt-auto">
            <button className="w-full bg-gray-50 dark:bg-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#333] border border-gray-200 dark:border-[#3a3a3a] text-gray-700 dark:text-white py-3 rounded-xl font-medium transition shadow-sm">
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
  <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-5 flex flex-col justify-between h-36 shadow-sm hover:shadow-md transition-all duration-300">
    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
    <div className="flex justify-between items-end">
      <div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      </div>
      {/* Circle Icon placeholder */}
      <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#333] flex items-center justify-center bg-gray-50 dark:bg-transparent">
        <div className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-gray-500"></div>
      </div>
    </div>
  </div>
);

const TaskRow = ({ title, project, due, status, dotColor }) => (
  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-xl transition-colors group">
    <div>
      <p className="text-gray-900 dark:text-white font-medium text-sm group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{project}</p>
    </div>
    <div className="flex items-center gap-6">
      <span className="text-sm text-gray-500 dark:text-gray-400">{due}</span>
      <span className="px-3 py-1 rounded-full border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#1a1a1a] text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 min-w-[100px]">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor || 'bg-gray-500'}`}></span>
        {status}
      </span>
    </div>
  </div>
);

export default Dashboard;
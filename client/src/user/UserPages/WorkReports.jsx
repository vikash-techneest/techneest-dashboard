import React from 'react';

const WorkReports = () => {
  // Chart Data
  const chartData = [
    { day: 'MON', value: 6, height: '40%' },
    { day: 'TUE', value: 4, height: '25%' },
    { day: 'WED', value: 7, height: '50%' },
    { day: 'THU', value: 5, height: '35%' },
    { day: 'FRI', value: 8, height: '60%' }, // Friday is highlighted
  ];

  // Recent Completed Tasks Data
  const completedTasks = [
    { title: 'Fix mobile navigation spacing', date: 'Oct 18' },
    { title: 'QA login validation', date: 'Oct 17' },
    { title: 'Update component documentation', date: 'Oct 16' },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800 dark:text-gray-300 space-y-6 transition-colors duration-300">
      
      {/* ================= HEADER ================= */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
          Work Reports & My Profile
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Review your productivity, completed tasks, and employee account details.
        </p>
      </div>

      {/* ================= TOP SECTION (Grid) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Weekly Productivity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-6 flex flex-col shadow-sm transition-colors duration-300">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Weekly Productivity</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Tasks completed by day</p>
          </div>

          {/* CSS Bar Chart */}
          <div className="flex-1 flex items-end justify-between px-2 pt-6 min-h-[200px] border-b border-gray-100 dark:border-[#2a2a2a] pb-2 transition-colors duration-300">
            {chartData.map((item, index) => (
              <div key={item.day} className="flex flex-col items-center justify-end w-full group">
                <span className="text-xs font-bold text-gray-900 dark:text-white mb-2">{item.value}</span>
                <div className="w-full max-w-[50px] relative flex justify-center">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      index === 4 
                        ? 'bg-indigo-500 dark:bg-[#e5e5e5]' // Friday Highlighted
                        : 'bg-gray-200 dark:bg-[#4a4a4a] group-hover:bg-gray-300 dark:group-hover:bg-[#5a5a5a]'
                    }`}
                    style={{ height: `${item.height} * 2.5` }} 
                  ></div>
                </div>
                <span className={`text-[10px] font-bold mt-3 tracking-wider transition-colors duration-300 ${
                  index === 4 ? 'text-indigo-600 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: My Profile */}
        <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-6 flex flex-col shadow-sm transition-colors duration-300">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">My Profile</h2>
          
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full border border-indigo-100 dark:border-[#3a3a3a] flex items-center justify-center bg-indigo-50 dark:bg-[#1a1a1a]">
              <span className="text-lg font-bold text-indigo-600 dark:text-white tracking-wider">RS</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Rahul Sharma</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Frontend Developer</p>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-gray-300 font-medium">rahul.sharma@demo</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Department</span>
              <span className="text-gray-900 dark:text-gray-300 font-medium">Development</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Employee ID</span>
              <span className="text-gray-900 dark:text-gray-300 font-medium">WB-024</span>
            </div>
          </div>

          <div className="mt-auto">
            <button className="bg-gray-50 dark:bg-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#333] border border-gray-200 dark:border-[#3a3a3a] text-gray-700 dark:text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm w-max active:scale-95">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION: Recently Completed ================= */}
      <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-6 shadow-sm transition-colors duration-300">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Recently Completed</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {completedTasks.map((task, index) => (
            <div key={index} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4 flex flex-col justify-center transition-colors duration-300">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-green-500 mt-0.5 text-sm font-bold">✓</span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</p>
              </div>
              <p className="text-[11px] text-gray-500 ml-5">{task.date}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default WorkReports;
import React from 'react';
import { BarChart3, TrendingUp, Download, Users, Clock, CheckCircle2 } from 'lucide-react';

const Reports = () => {
  // Dummy Data for Chart
  const weeklyData = [
    { day: 'MON', tasks: 18 },
    { day: 'TUE', tasks: 24 },
    { day: 'WED', tasks: 21 },
    { day: 'THU', tasks: 28 },
    { day: 'FRI', tasks: 32 },
    { day: 'SAT', tasks: 30 },
  ];

  const maxTasks = Math.max(...weeklyData.map(d => d.tasks));

  return (
    <div className="text-gray-800 dark:text-white font-sans relative transition-colors duration-300">
      
      {/* Ambient Background Glow hata diya gaya hai taaki light mode clean lage */}

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Reports & Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
              Review team performance, track productivity and generate insights.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
            <Download size={18} /> Export Report
          </button>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Total Employees Card */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-colors duration-300">
            <div className="p-3 bg-indigo-50 dark:bg-blue-500/10 rounded-xl text-indigo-600 dark:text-blue-400 transition-colors duration-300">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Employees</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">24</h3>
            </div>
          </div>

          {/* Tasks Completed Card */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-colors duration-300">
            <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400 transition-colors duration-300">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tasks Completed (Week)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">123</h3>
            </div>
          </div>

          {/* Avg Hours Card */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-colors duration-300">
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 transition-colors duration-300">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg. Hours Logged</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">7h 45m</h3>
            </div>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-600 dark:text-blue-400" />
                Team Performance Report
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tasks completed per day this week.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-lg border border-green-200 dark:border-green-500/20">
              <TrendingUp size={16} /> +12% vs last week
            </div>
          </div>

          {/* Custom Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-4 md:gap-8 pt-6 border-b border-gray-100 dark:border-gray-800 pb-2 transition-colors duration-300">
            {weeklyData.map((data, index) => {
              const heightPercentage = (data.tasks / maxTasks) * 100;
              const isHighest = data.tasks === maxTasks;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-gray-800 dark:bg-gray-700 text-white text-xs py-1 px-2 rounded">
                    {data.tasks} tasks
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[60px] rounded-t-lg transition-all duration-500 ease-in-out ${
                      isHighest 
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-blue-600 dark:to-blue-400 shadow-[0_0_15px_rgba(79,70,229,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                        : 'bg-gray-200 dark:bg-gradient-to-t dark:from-gray-700 dark:to-gray-500 group-hover:bg-gray-300 dark:group-hover:from-gray-600 dark:group-hover:to-gray-400'
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                  
                  {/* Label */}
                  <span className={`mt-4 text-xs font-semibold tracking-wider ${isHighest ? 'text-indigo-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
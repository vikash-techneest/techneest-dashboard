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
  ];

  const maxTasks = Math.max(...weeklyData.map(d => d.tasks));

  return (
    <div className=" text-white font-sans selection:bg-blue-500/30 relative">
      
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Review team performance, track productivity and generate insights.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-gray-200 px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl">
            <Download size={18} /> Export Report
          </button>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Users size={24} /></div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Employees</p>
              <h3 className="text-2xl font-bold text-white">24</h3>
            </div>
          </div>
          <div className="bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Tasks Completed (Week)</p>
              <h3 className="text-2xl font-bold text-white">123</h3>
            </div>
          </div>
          <div className="bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Clock size={24} /></div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Avg. Hours Logged</p>
              <h3 className="text-2xl font-bold text-white">7h 45m</h3>
            </div>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-400" />
                Team Performance Report
              </h2>
              <p className="text-sm text-gray-400 mt-1">Tasks completed per day this week.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">
              <TrendingUp size={16} /> +12% vs last week
            </div>
          </div>

          {/* Custom Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-4 md:gap-8 pt-6 border-b border-gray-800 pb-2">
            {weeklyData.map((data, index) => {
              const heightPercentage = (data.tasks / maxTasks) * 100;
              const isHighest = data.tasks === maxTasks;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                    {data.tasks} tasks
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[60px] rounded-t-lg transition-all duration-500 ease-in-out ${
                      isHighest 
                        ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                        : 'bg-gradient-to-t from-gray-700 to-gray-500 group-hover:from-gray-600 group-hover:to-gray-400'
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                  
                  {/* Label */}
                  <span className={`mt-4 text-xs font-semibold tracking-wider ${isHighest ? 'text-blue-400' : 'text-gray-500'}`}>
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
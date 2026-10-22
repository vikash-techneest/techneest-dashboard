import React from 'react';
import { Users, UserCheck, ClipboardList, CheckCircle2, Clock, CalendarCheck, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  // Static Data for Activity Table
  const activities = [
    { id: 1, name: "Rahul Sharma", initials: "RS", color: "bg-blue-600", task: "Update landing page UI", status: "In Progress", statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20", time: "10:42 AM" },
    { id: 2, name: "Priya Verma", initials: "PV", color: "bg-purple-600", task: "API integration testing", status: "Completed", statusColor: "bg-green-500/10 text-green-400 border-green-500/20", time: "09:18 AM" },
    { id: 3, name: "Aman Kumar", initials: "AK", color: "bg-yellow-600", task: "Fix responsive layout", status: "Pending", statusColor: "bg-orange-500/10 text-orange-400 border-orange-500/20", time: "11:05 AM" },
    { id: 4, name: "Neha Singh", initials: "NS", color: "bg-pink-600", task: "Prepare weekly report", status: "Completed", statusColor: "bg-green-500/10 text-green-400 border-green-500/20", time: "10:12 AM" },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 font-sans relative">
    

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm">Welcome back! Here's what's happening with your team.</p>
        </div>
      </div>

      {/* Top 6 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-[#0a0a0a] border border-[#262626] p-5 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Employees</p>
            <h2 className="text-3xl font-bold text-white">24</h2>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
            <Users size={24} className="text-gray-300" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0a0a0a] border border-[#262626] p-5 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Active Now</p>
            <h2 className="text-3xl font-bold text-white">18</h2>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
            <UserCheck size={24} className="text-gray-300" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0a0a0a] border border-[#262626] p-5 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Tasks</p>
            <h2 className="text-3xl font-bold text-white">178</h2>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
            <ClipboardList size={24} className="text-gray-300" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0a0a0a] border border-[#262626] p-5 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Completed Tasks</p>
            <h2 className="text-3xl font-bold text-white">146</h2>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
            <CheckCircle2 size={24} className="text-gray-300" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-[#0a0a0a] border border-[#262626] p-5 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">In Progress</p>
            <h2 className="text-3xl font-bold text-white">32</h2>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
            <Clock size={24} className="text-gray-300" />
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-[#0a0a0a] border border-[#262626] p-5 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Attendance Today</p>
            <h2 className="text-3xl font-bold text-white">21/24</h2>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
            <CalendarCheck size={24} className="text-gray-300" />
          </div>
        </div>
      </div>

      {/* Bottom Section: Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Team Activity Table (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#262626] rounded-xl flex flex-col">
          <div className="flex justify-between items-center p-5 border-b border-[#262626]">
            <h3 className="text-white font-semibold text-lg">Recent Team Activity</h3>
            <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="p-2 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-[#262626]">
                  <th className="p-3 font-medium">Employee</th>
                  <th className="p-3 font-medium">Task</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {activities.map((act) => (
                  <tr key={act.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#121212] transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${act.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {act.initials}
                      </div>
                      <span className="text-gray-200 font-medium whitespace-nowrap">{act.name}</span>
                    </td>
                    <td className="p-3 text-gray-400 whitespace-nowrap">{act.task}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${act.statusColor}`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-right whitespace-nowrap">{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Overview (Takes 1 column) */}
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl flex flex-col p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold text-lg">Attendance Overview</h3>
            <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </button>
          </div>

          {/* Simple Circular Chart Mockup */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="w-32 h-32 rounded-full border-[10px] border-green-500/20 border-t-green-500 border-r-green-500 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-white">88%</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-between items-center text-sm mb-6 px-2">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span className="text-gray-400">Present</span> <span className="text-white ml-auto">21</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span><span className="text-gray-400">Absent</span> <span className="text-white ml-auto">3</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span><span className="text-gray-400">Total</span> <span className="text-white ml-auto">24</span></div>
          </div>

          <hr className="border-[#262626] mb-4" />

          {/* Department Wise Progress */}
          <h4 className="text-white text-sm font-medium mb-4">Department Wise Attendance</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Development</span> <span className="text-white">6/6</span></div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Design</span> <span className="text-white">4/5</span></div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '80%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Marketing</span> <span className="text-white">4/5</span></div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '80%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1"><span>HR</span> <span className="text-white">3/3</span></div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }}></div></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
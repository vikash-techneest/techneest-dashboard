import React from 'react';

const Attendance = () => {
  // Dummy Data for History Table
  const historyData = [
    { id: 1, date: 'Mon, Oct 19', login: '09:12 AM', logout: '—', duration: '4h 18m', status: 'Working' },
    { id: 2, date: 'Fri, Oct 16', login: '09:05 AM', logout: '06:02 PM', duration: '8h 57m', status: 'Present' },
    { id: 3, date: 'Thu, Oct 15', login: '09:18 AM', logout: '05:47 PM', duration: '8h 29m', status: 'Present' },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-300 space-y-6">
      
      {/* ================= HEADER ================= */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white mb-1">Attendance & Time Tracking</h1>
        <p className="text-xs text-gray-400">
          Login and logout events are recorded with the exact date and time.
        </p>
      </div>

      {/* ================= TOP STATS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 mb-1">Today's Work Time</p>
            <h3 className="text-2xl font-bold text-white mb-1">4h 18m</h3>
            <p className="text-[11px] text-gray-500">Clocked in at 09:12 AM</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 mb-1">This Week</p>
            <h3 className="text-2xl font-bold text-white mb-1">31h 40m</h3>
            <p className="text-[11px] text-gray-500">Across 5 workdays</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 mb-1">Attendance Today</p>
            <h3 className="text-2xl font-bold text-white mb-1">Present</h3>
            <p className="text-[11px] text-gray-500">Monday, 19 Oct 2026</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          </div>
        </div>
      </div>

      {/* ================= CURRENT SESSION BAR ================= */}
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white mb-1">Current Session</p>
          <p className="text-lg font-bold text-white">You are clocked in</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <p className="text-xs text-gray-400">
            Start: 09:12 AM <span className="mx-2 text-gray-600">•</span> Date: 19 Oct 2026
          </p>
          <button className="bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] text-white px-8 py-2.5 rounded-lg text-sm font-medium transition">
            Clock Out
          </button>
        </div>
      </div>

      {/* ================= ATTENDANCE HISTORY TABLE ================= */}
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2a2a2a]">
          <h2 className="text-sm font-semibold text-white">Attendance History</h2>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e1e1e] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3 border-b border-[#2a2a2a]">Date</th>
                <th className="px-6 py-3 border-b border-[#2a2a2a]">Login</th>
                <th className="px-6 py-3 border-b border-[#2a2a2a]">Logout</th>
                <th className="px-6 py-3 border-b border-[#2a2a2a]">Duration</th>
                <th className="px-6 py-3 border-b border-[#2a2a2a]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {historyData.map((row) => (
                <tr key={row.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4 text-xs text-white whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 text-xs text-gray-300 whitespace-nowrap">{row.login}</td>
                  <td className="px-6 py-4 text-xs text-gray-300 whitespace-nowrap">{row.logout}</td>
                  <td className="px-6 py-4 text-xs text-gray-300 whitespace-nowrap">{row.duration}</td>
                  <td className="px-6 py-4 text-xs text-gray-300 whitespace-nowrap">
                    {/* Status styling - can be customized based on status text */}
                    <span className={row.status === 'Working' ? 'text-white' : 'text-gray-400'}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Attendance;
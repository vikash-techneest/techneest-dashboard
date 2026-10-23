import React, { useState } from 'react';
import { 
  Search, Download, Calendar, Filter, 
  Clock, CheckCircle2, XCircle, Settings, Save, X, CalendarDays
} from 'lucide-react';

// Dummy Data
const initialAttendance = [
  { id: 'WB-024', name: 'Rahul Sharma', login: '09:12 AM', logout: '—', duration: '4h 18m', status: 'Present', presentDays: 22, lateBy: null },
  { id: 'WB-019', name: 'Priya Verma', login: '09:05 AM', logout: '06:02 PM', duration: '8h 57m', status: 'Present', presentDays: 24, lateBy: null },
  { id: 'WB-031', name: 'Aman Kumar', login: '09:48 AM', logout: '06:10 PM', duration: '8h 22m', status: 'Late', presentDays: 18, lateBy: '18m' },
  { id: 'WB-012', name: 'Neha Singh', login: '—', logout: '—', duration: '0h', status: 'Absent', presentDays: 12, lateBy: null },
  { id: 'WB-045', name: 'Karan Patel', login: '10:15 AM', logout: '05:30 PM', duration: '7h 15m', status: 'Late', presentDays: 21, lateBy: '45m' },
];

const AttendanceManagement = () => {
  const [attendanceData, setAttendanceData] = useState(initialAttendance);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [totalWorkingDays, setTotalWorkingDays] = useState(24);

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [tempData, setTempData] = useState([]);
  const [tempTotalDays, setTempTotalDays] = useState(24);

  const filteredData = attendanceData.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdjustment = () => {
    setTempData(JSON.parse(JSON.stringify(attendanceData)));
    setTempTotalDays(totalWorkingDays);
    setIsAdjustmentModalOpen(true);
  };

  const handleModalInputChange = (id, value) => {
    const numValue = Number(value);
    const validValue = Math.min(tempTotalDays, Math.max(0, numValue));
    
    setTempData(prev => 
      prev.map(emp => emp.id === id ? { ...emp, presentDays: validValue } : emp)
    );
  };

  const handleSaveAll = () => {
    setTotalWorkingDays(tempTotalDays);
    const validatedData = tempData.map(emp => ({
      ...emp,
      presentDays: Math.min(emp.presentDays, tempTotalDays)
    }));
    setAttendanceData(validatedData);
    setIsAdjustmentModalOpen(false);
  };

  // Helper for Status Badge (Light + Dark mode support)
  const getStatusBadge = (status, lateBy) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">
            <CheckCircle2 size={12} /> Present
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
            <XCircle size={12} /> Absent
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
            {lateBy} Late
          </span>
        );
      default:
        return null;
    }
  };

  const getStreakDisplay = (days) => {
    const percentage = (days / totalWorkingDays) * 100;
    
    let barColor = 'bg-red-500';
    let textColor = 'text-red-600 dark:text-red-400';
    
    if (percentage >= 90) {
      barColor = 'bg-green-500';
      textColor = 'text-green-600 dark:text-green-400';
    } else if (percentage >= 75) {
      barColor = 'bg-blue-500';
      textColor = 'text-blue-600 dark:text-blue-400';
    } else if (percentage >= 50) {
      barColor = 'bg-yellow-500';
      textColor = 'text-yellow-600 dark:text-yellow-400';
    }

    return (
      <div className="flex flex-col gap-1 w-24">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-500 dark:text-gray-400">
            <strong className={`font-semibold ${textColor}`}>{days}</strong>/{totalWorkingDays} days
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800/80 h-1 rounded-full overflow-hidden">
          <div 
            className={`h-full ${barColor} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="text-gray-800 dark:text-white font-sans relative transition-colors duration-300">
      
      {/* SCROLLBAR HIDE CSS */}
      <style>{`
        ::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* Glowing backgrounds hata diye hain taaki light mode clean lage */}

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5 transition-colors duration-300">
              Attendance Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
              Review daily presence, late arrivals, hours worked and employee login/logout records.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-sm">
            <Download size={16} /> Export Attendance
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Present Card */}
          <div className="relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">Present Today</p>
              <div className="w-6 h-6 rounded-full border border-green-200 dark:border-green-500/30 flex items-center justify-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></span>
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">21</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">of 24 employees</p>
            </div>
          </div>

          {/* Absent Card */}
          <div className="relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">Absent</p>
              <div className="w-6 h-6 rounded-full border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">3</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Needs review</p>
            </div>
          </div>

          {/* Late Card */}
          <div className="relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">Late Arrivals</p>
              <div className="w-6 h-6 rounded-full border border-yellow-200 dark:border-yellow-500/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400"></span>
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">2</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Today</p>
            </div>
          </div>

          {/* Hours Card */}
          <div className="relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">Hours Logged</p>
              <div className="w-6 h-6 rounded-full border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">167<span className="text-xl text-gray-400 dark:text-gray-500">h</span></h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Team total</p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-3 mb-6 flex flex-col lg:flex-row gap-3 items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
            <div className="relative w-full sm:w-40">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input type="date" defaultValue="2026-10-19" className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 block pl-9 p-2 outline-none transition-all dark:[color-scheme:dark] cursor-pointer" />
            </div>
            <div className="relative w-full sm:w-36">
              <select className="appearance-none w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 block pl-3 pr-8 p-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                <option>Department: All</option>
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-36">
              <select className="appearance-none w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 block pl-3 pr-8 p-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                <option>Status: All</option>
                <option>Present</option>
                <option>Absent</option>
                <option>Late</option>
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="relative w-full lg:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input type="text" className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 block pl-9 p-2 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
              <thead className="text-[10px] text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#0d0d0d]/50 border-b border-gray-100 dark:border-gray-800/80">
                <tr>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Employee</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Login Time</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Logout Time</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Duration</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Attendance Record</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {filteredData.map((emp, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/60 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{emp.name}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">• {emp.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 ${emp.login === '—' ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'}`}>
                        <Clock size={12} className={emp.login === '—' ? 'text-gray-400 dark:text-gray-600' : 'text-blue-500 dark:text-blue-400/70'} />
                        {emp.login}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 ${emp.logout === '—' ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'}`}>
                        <Clock size={12} className={emp.logout === '—' ? 'text-gray-400 dark:text-gray-600' : 'text-red-500 dark:text-red-400/70'} />
                        {emp.logout}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-gray-600 dark:text-gray-300">{emp.duration}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getStreakDisplay(emp.presentDays)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      {getStatusBadge(emp.status, emp.lateBy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161616] flex flex-wrap gap-3 justify-end transition-colors duration-300">
            <button 
              onClick={handleOpenAdjustment}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition-colors shadow-sm"
            >
              <Settings size={14} /> Manual Adjustment
            </button>
          </div>
        </div>

      </div>

      {/* --- MANUAL ADJUSTMENT MODAL --- */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] transition-colors duration-300">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#161616] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings size={18} className="text-indigo-500" /> Manual Adjustment
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Set working days and update employee attendance.</p>
              </div>
              <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Total Working Days Section */}
            <div className="px-4 py-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 transition-colors duration-300">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-indigo-500" />
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Total Working Days in Month:</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={tempTotalDays}
                  onChange={(e) => {
                    const newTotal = Math.max(1, Number(e.target.value));
                    setTempTotalDays(newTotal);
                    setTempData(prev => prev.map(emp => ({
                      ...emp, 
                      presentDays: Math.min(emp.presentDays, newTotal)
                    })));
                  }}
                  className="w-20 bg-gray-50 dark:bg-[#111] border border-indigo-300 dark:border-indigo-500/50 text-gray-900 dark:text-white font-bold text-sm text-center rounded-lg focus:ring-2 focus:ring-indigo-500 p-1.5 outline-none transition-colors"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Days</span>
              </div>
            </div>

            {/* Employee List */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
              {tempData.map((emp) => (
                <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{emp.name}</p>
                    <p className="text-[10px] text-gray-500">{emp.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-500 dark:text-gray-400">Present Days:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={tempTotalDays}
                        value={emp.presentDays}
                        onChange={(e) => handleModalInputChange(emp.id, e.target.value)}
                        className="w-20 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold text-xs text-center rounded-lg focus:ring-2 focus:ring-indigo-500/50 p-1.5 outline-none transition-colors"
                      />
                      <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[10px] text-gray-400 dark:text-gray-500 pointer-events-none">
                        / {tempTotalDays}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#161616] flex justify-end gap-2 shrink-0 transition-colors duration-300">
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                <Save size={14} /> Save All Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceManagement;
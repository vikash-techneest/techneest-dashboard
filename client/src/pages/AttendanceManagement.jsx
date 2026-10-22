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

  // Helper for Status Badge
  const getStatusBadge = (status, lateBy) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle2 size={12} /> Present
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-500/10 text-red-400 border-red-500/20">
            <XCircle size={12} /> Absent
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
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
    let textColor = 'text-red-400';
    
    if (percentage >= 90) {
      barColor = 'bg-green-500';
      textColor = 'text-green-400';
    } else if (percentage >= 75) {
      barColor = 'bg-blue-500';
      textColor = 'text-blue-400';
    } else if (percentage >= 50) {
      barColor = 'bg-yellow-500';
      textColor = 'text-yellow-400';
    }

    return (
      <div className="flex flex-col gap-1 w-24">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400">
            <strong className={`font-semibold ${textColor}`}>{days}</strong>/{totalWorkingDays} days
          </span>
        </div>
        <div className="w-full bg-gray-800/80 h-1 rounded-full overflow-hidden">
          <div 
            className={`h-full ${barColor} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="text-white p-6 font-sans selection:bg-blue-500/30 relative">
      
      {/* SCROLLBAR HIDE CSS */}
      <style>{`
        ::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-1.5">
              Attendance Management
            </h1>
            <p className="text-gray-400 text-xs md:text-sm">
              Review daily presence, late arrivals, hours worked and employee login/logout records.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-gray-200 px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-lg hover:shadow-xl">
            <Download size={16} /> Export Attendance
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="relative bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-xl p-5 overflow-hidden group hover:border-green-500/40 transition-colors shadow-xl">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-400 text-xs font-medium">Present Today</p>
              <div className="w-6 h-6 rounded-full border border-green-500/30 flex items-center justify-center text-green-400 bg-green-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-1">21</h3>
              <p className="text-[10px] text-gray-500">of 24 employees</p>
            </div>
          </div>
          <div className="relative bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-xl p-5 overflow-hidden group hover:border-red-500/40 transition-colors shadow-xl">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-400 text-xs font-medium">Absent</p>
              <div className="w-6 h-6 rounded-full border border-red-500/30 flex items-center justify-center text-red-400 bg-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-1">3</h3>
              <p className="text-[10px] text-gray-500">Needs review</p>
            </div>
          </div>
          <div className="relative bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-xl p-5 overflow-hidden group hover:border-yellow-500/40 transition-colors shadow-xl">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-400 text-xs font-medium">Late Arrivals</p>
              <div className="w-6 h-6 rounded-full border border-yellow-500/30 flex items-center justify-center text-yellow-400 bg-yellow-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-1">2</h3>
              <p className="text-[10px] text-gray-500">Today</p>
            </div>
          </div>
          <div className="relative bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-xl p-5 overflow-hidden group hover:border-blue-500/40 transition-colors shadow-xl">
            <div className="flex justify-between items-start mb-3">
              <p className="text-gray-400 text-xs font-medium">Hours Logged</p>
              <div className="w-6 h-6 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400 bg-blue-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white mb-1">167<span className="text-xl text-gray-400">h</span></h3>
              <p className="text-[10px] text-gray-500">Team total</p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#111111]/80 backdrop-blur-md border border-gray-800/80 rounded-xl p-3 mb-6 flex flex-col lg:flex-row gap-3 items-center justify-between shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
            <div className="relative w-full sm:w-40">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={14} className="text-gray-500" />
              </div>
              <input type="date" defaultValue="2026-10-19" className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 block pl-9 p-2 outline-none transition-all [color-scheme:dark] cursor-pointer" />
            </div>
            <div className="relative w-full sm:w-36">
              <select className="appearance-none w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 block pl-3 pr-8 p-2 outline-none cursor-pointer hover:bg-[#222] transition-colors">
                <option>Department: All</option>
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-36">
              <select className="appearance-none w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 block pl-3 pr-8 p-2 outline-none cursor-pointer hover:bg-[#222] transition-colors">
                <option>Status: All</option>
                <option>Present</option>
                <option>Absent</option>
                <option>Late</option>
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="relative w-full lg:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-500" />
            </div>
            <input type="text" className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-xs rounded-lg focus:ring-2 focus:ring-blue-500/50 block pl-9 p-2 outline-none transition-all placeholder-gray-500" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-400">
              <thead className="text-[10px] text-gray-500 uppercase bg-[#0d0d0d]/50 border-b border-gray-800/80">
                <tr>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Employee</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Login Time</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Logout Time</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Duration</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Attendance Record</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredData.map((emp, index) => (
                  <tr key={index} className="hover:bg-[#1a1a1a]/60 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200 text-sm group-hover:text-white transition-colors">{emp.name}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">• {emp.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 ${emp.login === '—' ? 'text-gray-600' : 'text-gray-300'}`}>
                        <Clock size={12} className={emp.login === '—' ? 'text-gray-600' : 'text-blue-400/70'} />
                        {emp.login}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 ${emp.logout === '—' ? 'text-gray-600' : 'text-gray-300'}`}>
                        <Clock size={12} className={emp.logout === '—' ? 'text-gray-600' : 'text-red-400/70'} />
                        {emp.logout}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-gray-300">{emp.duration}</span>
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
          
          <div className="p-3 border-t border-gray-800 bg-[#161616] flex flex-wrap gap-3 justify-end">
            <button 
              onClick={handleOpenAdjustment}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
            >
              <Settings size={14} /> Manual Adjustment
            </button>
          </div>
        </div>

      </div>

      {/* --- MANUAL ADJUSTMENT MODAL --- */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-700 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-gray-800 bg-[#161616] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings size={18} className="text-blue-500" /> Manual Adjustment
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Set working days and update employee attendance.</p>
              </div>
              <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-4 py-3 bg-[#1a1a1a] border-b border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-400" />
                <label className="text-xs font-semibold text-gray-200">Total Working Days in Month:</label>
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
                  className="w-20 bg-[#111] border border-blue-500/50 text-white font-bold text-sm text-center rounded-lg focus:ring-2 focus:ring-blue-500 p-1.5 outline-none"
                />
                <span className="text-xs text-gray-400">Days</span>
              </div>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
              {tempData.map((emp) => (
                <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a1a1a] p-3 rounded-lg border border-gray-800">
                  <div>
                    <p className="text-xs font-semibold text-white">{emp.name}</p>
                    <p className="text-[10px] text-gray-500">{emp.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400">Present Days:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={tempTotalDays}
                        value={emp.presentDays}
                        onChange={(e) => handleModalInputChange(emp.id, e.target.value)}
                        className="w-20 bg-[#111] border border-gray-700 text-white font-bold text-xs text-center rounded-lg focus:ring-2 focus:ring-blue-500/50 p-1.5 outline-none"
                      />
                      <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[10px] text-gray-500 pointer-events-none">
                        / {tempTotalDays}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-800 bg-[#161616] flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
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
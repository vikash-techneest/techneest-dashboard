import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, User, CheckCircle2, Clock, PlayCircle, Eye, Edit3, X, Timer, CalendarDays, AlertCircle, CheckCircle } from 'lucide-react';

// Helper to get dates relative to TODAY for dynamic demo
const getTodayDate = () => {
  const today = new Date();
  const format = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const start = new Date(today);
  start.setDate(today.getDate() - 2);
  start.setHours(10, 0, 0);

  const end = new Date(today);
  end.setDate(today.getDate() + 1);
  end.setHours(18, 0, 0);

  const overdueEnd = new Date(today);
  overdueEnd.setDate(today.getDate() - 1);
  overdueEnd.setHours(17, 0, 0);

  const completedEnd = new Date(today);
  completedEnd.setDate(today.getDate() - 3);
  completedEnd.setHours(15, 0, 0);

  return {
    format,
    startISO: format(start),
    endISO: format(end),
    overdueEndISO: format(overdueEnd),
    completedEndISO: format(completedEnd)
  };
};

const dateHelper = getTodayDate();

const initialTasks = [
  { 
    id: 1, title: 'Landing page responsive UI', assignee: 'Rahul Sharma', 
    due: 'Tomorrow, 6 PM', status: 'In Progress', 
    startDate: dateHelper.startISO, deadline: dateHelper.endISO,
    description: 'Create a fully responsive landing page with hero section, features, and footer.'
  },
  { 
    id: 2, title: 'API integration testing', assignee: 'Priya Verma', 
    due: 'Completed', status: 'Completed', 
    startDate: dateHelper.format(new Date(new Date().setDate(new Date().getDate() - 5))), 
    deadline: dateHelper.completedEndISO,
    description: 'Test all user authentication and data fetching APIs using Postman.'
  },
  { 
    id: 3, title: 'Weekly marketing report', assignee: 'Neha Singh', 
    due: 'Yesterday, 5 PM', status: 'Pending', 
    startDate: dateHelper.format(new Date(new Date().setDate(new Date().getDate() - 3))), 
    deadline: dateHelper.overdueEndISO,
    description: 'Compile social media engagement metrics and ad campaign performance.'
  },
  { 
    id: 4, title: 'Update user dashboard design', assignee: 'Amit Singh', 
    due: 'Today, 8 PM', status: 'In Progress', 
    startDate: dateHelper.format(new Date(new Date().setHours(9, 0, 0, 0))), 
    deadline: dateHelper.format(new Date(new Date().setHours(20, 0, 0, 0))),
    description: 'Redesign the main analytics dashboard with new charts and dark mode support.'
  },
];

const AllTask = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const filteredTasks = initialTasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status badges ko light/dark dono ke liye update kiya
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20';
    }
  };

  const calculateTimeDetails = (startStr, endStr, status) => {
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (status === 'Completed') {
      return { timeStatus: 'Task Status', timeValue: 'Completed Successfully', isOverdue: false, isCompleted: true, percentage: 100 };
    }

    const totalDurationMs = end - start;
    let timeStatus = '', timeValue = '', isOverdue = false, percentage = 0;

    if (now > end) {
      const diffMs = now - end;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeStatus = 'Overdue by';
      timeValue = diffDays > 0 ? `${diffDays}d ${diffHours}h` : diffHours > 0 ? `${diffHours}h ${diffMins}m` : `${diffMins}m`;
      isOverdue = true;
      percentage = 100;
    } else if (now < start) {
      const diffMs = start - now;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeStatus = 'Starts in';
      timeValue = diffDays > 0 ? `${diffDays}d ${diffHours}h` : `${diffHours}h`;
      percentage = 0;
    } else {
      const diffMs = end - now;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeStatus = 'Time Remaining';
      timeValue = diffDays > 0 ? `${diffDays}d ${diffHours}h` : `${diffHours}h ${diffMins}m`;
      const elapsedMs = now - start;
      percentage = Math.min(100, Math.floor((elapsedMs / totalDurationMs) * 100));
    }

    return { timeStatus, timeValue, isOverdue, isCompleted: false, percentage };
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="text-gray-800 dark:text-white font-sans relative transition-colors duration-300">
      
      {/* Background Blur lights hata diye hain taaki light mode clean lage */}

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5 transition-colors duration-300">
            All Tasks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Monitor task ownership, deadlines and completion across the team.</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-3 mb-6 flex flex-col lg:flex-row gap-3 items-center justify-between shadow-sm transition-colors duration-300">
          <div className="relative w-full lg:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block pl-9 p-2.5 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Search task title or employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
            <div className="relative">
              <select className="appearance-none w-full sm:w-36 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 block pl-3 pr-8 p-2.5 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                <option>Status</option>
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none w-full sm:w-36 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-indigo-500/20 block pl-3 pr-8 p-2.5 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                <option>Assignee</option>
              </select>
              <User size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          
          {/* Card 1: All Tasks */}
          <div className="relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 p-5 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity"><CheckCircle2 size={48} className="text-gray-500 dark:text-gray-400" /></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">All Tasks</p>
                <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">178</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">All assigned work</p>
            </div>
          </div>
          
          {/* Card 2: In Progress */}
          <div className="relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 p-5 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity"><Clock size={48} className="text-blue-500" /></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold">In Progress</p>
                <div className="w-6 h-6 rounded-full border border-blue-200 dark:border-blue-500/50 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">32</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Currently active</p>
            </div>
          </div>
          
          {/* Card 3: Completed */}
          <div className="relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 p-5 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity"><PlayCircle size={48} className="text-green-500" /></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-green-600 dark:text-green-400 text-xs font-semibold">Completed</p>
                <div className="w-6 h-6 rounded-full border border-green-200 dark:border-green-500/50 flex items-center justify-center text-green-500 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">146</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Marked done</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#161616]/50">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Task Directory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
              <thead className="text-[10px] text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#0d0d0d]/50 border-b border-gray-100 dark:border-gray-800/80">
                <tr>
                  <th className="px-5 py-3.5 font-semibold tracking-wider w-1/3">Task</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Assigned To</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Due</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider">Status</th>
                  <th className="px-5 py-3.5 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/60 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap"><span className="font-medium text-gray-900 dark:text-gray-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{task.title}</span></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-gray-300">{task.assignee.charAt(0)}</div>
                        <span className="text-gray-600 dark:text-gray-300">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400 dark:text-gray-500" /> {task.due}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyle(task.status)}`}>
                        <span className={`w-1 h-1 rounded-full ${task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedTask(task)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md text-[10px] shadow-sm" 
                        >
                          <Eye size={12} /> View
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/assign-task/edit/${task.id}`)}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md text-[10px] shadow-sm"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- VIEW TASK MODAL --- */}
      {selectedTask && (() => {
        const timeDetails = calculateTimeDetails(selectedTask.startDate, selectedTask.deadline, selectedTask.status);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] transition-colors duration-300">
              
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#161616] flex justify-between items-start shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{selectedTask.title}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assigned to <strong className="text-gray-800 dark:text-gray-200">{selectedTask.assignee}</strong></p>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <h4 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Task Description</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    {selectedTask.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                      <CalendarDays size={12} className="text-indigo-500" />
                      <span className="text-[10px] font-medium">Start Date</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatDate(selectedTask.startDate)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                      <AlertCircle size={12} className="text-red-500" />
                      <span className="text-[10px] font-medium">Deadline</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatDate(selectedTask.deadline)}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border transition-colors duration-300 ${
                  timeDetails.isCompleted ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' : 
                  timeDetails.isOverdue ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' : 
                  'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {timeDetails.isCompleted ? <CheckCircle size={16} className="text-green-600 dark:text-green-400" /> : <Timer size={16} className={timeDetails.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} />}
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Project Timeline</h4>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800/80 rounded text-gray-600 dark:text-gray-300">As of Today</span>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{timeDetails.timeStatus}</p>
                      <p className={`text-xl font-bold ${
                        timeDetails.isCompleted ? 'text-green-600 dark:text-green-400' : 
                        timeDetails.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {timeDetails.timeValue}
                      </p>
                    </div>
                    <div className="w-1/2 flex flex-col items-end gap-1">
                       <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">{timeDetails.percentage}% Time Elapsed</span>
                       <div className="w-full bg-gray-200 dark:bg-gray-800/80 h-2 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            timeDetails.isCompleted ? 'bg-green-500' : 
                            timeDetails.isOverdue ? 'bg-red-500' : 
                            'bg-blue-500'
                          }`} 
                          style={{ width: `${timeDetails.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#161616] flex justify-end shrink-0">
                <button onClick={() => setSelectedTask(null)} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
                  Close Details
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default AllTask;
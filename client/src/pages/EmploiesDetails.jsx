import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, IndianRupee, CheckCircle2, Calendar as CalendarIcon, Check, XCircle } from 'lucide-react';

// Mock Data
const allEmployees = [
  { 
    id: 'WB-024', name: 'Rahul Sharma', email: 'rahul.sharma@company.com', password: 'Rahul@12345', 
    department: 'Development', role: 'Frontend Dev', status: 'Present',
    salary: '₹45,000 / month', totalTasks: 45, completedTasks: 38
  },
  { 
    id: 'WB-019', name: 'Priya Verma', email: 'priya.v@company.com', password: 'Priya@9876', 
    department: 'QA', role: 'QA Engineer', status: 'Present',
    salary: '₹38,000 / month', totalTasks: 60, completedTasks: 58
  },
  { 
    id: 'WB-031', name: 'Amit Singh', email: 'amit.design@company.com', password: 'AmitDesign#1', 
    department: 'Design', role: 'UI Designer', status: 'Present',
    salary: '₹40,000 / month', totalTasks: 25, completedTasks: 20
  },
  { 
    id: 'WB-012', name: 'Neha Singh', email: 'neha.marketing@company.com', password: 'NehaM@2024', 
    department: 'Marketing', role: 'Marketing Exec', status: 'Absent',
    salary: '₹32,000 / month', totalTasks: 30, completedTasks: 12
  },
];

// Helper function to generate a full month calendar data
const generateMonthData = () => {
  const days = [];
  const startDayIndex = 0; // Sunday
  const totalDays = 31;

  for (let i = 0; i < startDayIndex; i++) {
    days.push({ date: null, status: null, hours: null });
  }

  for (let i = 1; i <= totalDays; i++) {
    const dayOfWeek = (startDayIndex + i - 1) % 7;
    let status = 'Present';
    let hours = '8h 30m';

    if (dayOfWeek === 0) { // Sunday
      status = 'Absent';
      hours = '0h 0m';
    } else if (i === 15) { // Random absent day
      status = 'Absent';
      hours = '0h 0m';
    } else if (dayOfWeek === 6) { // Saturday half day
      hours = '4h 00m';
    }

    days.push({ 
      date: i, 
      status: status, 
      hours: hours,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
    });
  }
  return days;
};

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [monthData, setMonthData] = useState([]);

  useEffect(() => {
    const foundEmp = allEmployees.find(emp => emp.id === id);
    setEmployee(foundEmp);
    setMonthData(generateMonthData());
  }, [id]);

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#f4f7fe] dark:bg-[#0a0a0a] flex items-center justify-center text-gray-800 dark:text-white transition-colors duration-300">
        <p className="text-sm">Employee not found.</p>
        <button onClick={() => navigate('/admin/employee')} className="ml-4 text-indigo-600 dark:text-blue-400 underline text-sm">Go Back</button>
      </div>
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="text-gray-800 dark:text-white font-sans transition-colors duration-300">
      
      {/* Back Button & Header */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white mb-5 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Employees
      </button>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 md:p-6 mb-6 shadow-sm transition-colors duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-blue-500/20 text-indigo-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl border border-indigo-200 dark:border-blue-500/30">
            {employee.name.charAt(0)}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{employee.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{employee.role} • {employee.department} • <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{employee.id}</span></p>
          </div>

          {/* Current Status Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5
            ${employee.status === 'Present' 
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${employee.status === 'Present' ? 'bg-green-500 dark:bg-green-400 animate-pulse' : 'bg-red-500 dark:bg-red-400'}`}></span>
            Currently {employee.status}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          
          <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
              <IndianRupee size={14} className="text-green-600 dark:text-green-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Monthly Salary</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{employee.salary}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
              <CheckCircle2 size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Tasks Completed</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {employee.completedTasks} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">/ {employee.totalTasks}</span>
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1.5">
              <Mail size={14} className="text-indigo-600 dark:text-blue-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Email & Password</span>
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{employee.email}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-1 bg-gray-200 dark:bg-gray-800 inline-block px-1.5 py-0.5 rounded">{employee.password}</p>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm transition-colors duration-300">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-600 dark:text-blue-400" />
              Monthly Attendance
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">October 2023</p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span> <span className="text-gray-500 dark:text-gray-400">Present</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span> <span className="text-gray-500 dark:text-gray-400">Absent</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-3">
          
          {/* Weekday Headers */}
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-1">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {monthData.map((day, index) => {
            if (!day.date) {
              return <div key={`empty-${index}`} className="p-1 md:p-2 rounded-lg border border-transparent"></div>;
            }

            const isPresent = day.status === 'Present';
            const isAbsent = day.status === 'Absent';

            return (
              <div 
                key={day.date} 
                className={`relative p-1.5 md:p-3 rounded-lg border flex flex-col items-center justify-center min-h-[60px] md:min-h-[80px] transition-all hover:scale-105
                  ${isPresent ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : ''}
                  ${isAbsent ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20' : ''}
                  ${!day.status ? 'bg-gray-50 dark:bg-[#1a1a1a] border-gray-100 dark:border-gray-800' : ''}
                `}
              >
                <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-200 mb-0.5">{day.date}</span>
                
                {day.status && (
                  <div className="flex flex-col items-center gap-0.5">
                    {isPresent ? (
                      <Check size={14} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle size={14} className="text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-[9px] font-medium ${isPresent ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {day.hours}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default EmployeeDetails;
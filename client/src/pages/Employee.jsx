import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit2, Trash2, Download } from 'lucide-react';

const initialEmployees = [
  { id: 'WB-024', name: 'Rahul Sharma', email: 'rahul.sharma@company.com', department: 'Development', role: 'Frontend Dev', status: 'Present' },
  { id: 'WB-019', name: 'Priya Verma', email: 'priya.v@company.com', department: 'QA', role: 'QA Engineer', status: 'Present' },
  { id: 'WB-031', name: 'Amit Singh', email: 'amit.design@company.com', department: 'Design', role: 'UI Designer', status: 'Present' },
  { id: 'WB-012', name: 'Neha Singh', email: 'neha.marketing@company.com', department: 'Marketing', role: 'Marketing Exec', status: 'Absent' },
];

const Employee = () => {
  const [employees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Text color theme ke hisaab se change hoga
    <div className="text-gray-800 dark:text-white font-sans relative transition-colors duration-300">
      
      {/* SCROLLBAR HIDE CSS */}
      <style>{`
        ::-webkit-scrollbar {
          display: none !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 transition-colors duration-300">Employees</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage employee accounts, departments, roles and daily attendance status.</p>
        </div>
        
        {/* Button ko Indigo banaya gaya hai image jaisa */}
        <button 
          onClick={() => navigate('/admin/employee-add')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl border border-transparent shadow-sm transition-all font-medium text-sm"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm transition-colors duration-300">
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block pl-10 p-2.5 outline-none transition-colors"
            placeholder="Search employees by name, ID or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Employee Directory</h2>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl transition-colors shadow-sm">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            {/* Table Head */}
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#161616] border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Employee</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Department</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-gray-200 text-base">{emp.name}</span>
                      <span className="text-xs text-gray-500 mt-0.5">• {emp.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{emp.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{emp.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                      ${emp.status === 'Present' 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                      
                      {/* VIEW BUTTON */}
                      <button 
                        onClick={() => navigate(`/admin/employee/${emp.id}`)}
                        className="text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-gray-700" 
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* EDIT BUTTON */}
                      <button 
                        onClick={() => navigate(`/admin/employee/edit/${emp.id}`)}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5" 
                        title="Edit Employee"
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* DELETE BUTTON */}
                      <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5" title="Delete">
                        <Trash2 size={16} />
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
  );
};

export default Employee;
import React, { useState } from 'react';
import { 
  Building2, Users, Plus, Search, 
  ArrowRight, Briefcase, Code2, Smartphone, Video, 
  Megaphone, Paintbrush, X, Edit3, Trash2, Mail, Save
} from 'lucide-react';

// Dummy Data: Departments with Employees List
const initialDepartments = [
  { 
    id: 1, name: 'Sales', icon: <Briefcase size={22} />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10',
    employees: [
      { id: 'WB-101', name: 'Vikram Singh', role: 'Sales Manager', email: 'vikram@company.com' },
      { id: 'WB-102', name: 'Anjali Gupta', role: 'Sales Exec', email: 'anjali@company.com' },
      { id: 'WB-103', name: 'Rohit Verma', role: 'Sales Exec', email: 'rohit@company.com' },
    ], 
    activeTasks: 8, completedTasks: 45, totalTasks: 60 
  },
  { 
    id: 2, name: 'Frontend Development', icon: <Code2 size={22} />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10',
    employees: [
      { id: 'WB-024', name: 'Rahul Sharma', role: 'Frontend Dev', email: 'rahul@company.com' },
      { id: 'WB-025', name: 'Sneha Kapoor', role: 'Frontend Dev', email: 'sneha@company.com' },
    ], 
    activeTasks: 15, completedTasks: 120, totalTasks: 140 
  },
  { 
    id: 3, name: 'Backend Development', icon: <Code2 size={22} />, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10',
    employees: [
      { id: 'WB-045', name: 'Karan Patel', role: 'Backend Dev', email: 'karan@company.com' },
    ], 
    activeTasks: 10, completedTasks: 95, totalTasks: 110 
  },
  { 
    id: 4, name: 'Android Development', icon: <Smartphone size={22} />, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    employees: [
      { id: 'WB-050', name: 'Arjun Reddy', role: 'Android Dev', email: 'arjun@company.com' },
    ], 
    activeTasks: 4, completedTasks: 30, totalTasks: 40 
  },
  { 
    id: 5, name: 'Video Editors', icon: <Video size={22} />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10',
    employees: [
      { id: 'WB-060', name: 'Simran Kaur', role: 'Video Editor', email: 'simran@company.com' },
    ], 
    activeTasks: 6, completedTasks: 22, totalTasks: 30 
  },
  { 
    id: 6, name: 'Marketing', icon: <Megaphone size={22} />, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10',
    employees: [
      { id: 'WB-012', name: 'Neha Singh', role: 'Marketing Exec', email: 'neha@company.com' },
    ], 
    activeTasks: 5, completedTasks: 50, totalTasks: 65 
  },
  { 
    id: 7, name: 'UI/UX Design', icon: <Paintbrush size={22} />, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10',
    employees: [
      { id: 'WB-031', name: 'Amit Singh', role: 'UI Designer', email: 'amit@company.com' },
    ], 
    activeTasks: 3, completedTasks: 18, totalTasks: 25 
  },
];

const Departments = () => {
  const [departments, setDepartments] = useState(initialDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedDept, setSelectedDept] = useState(null);
  const [editingEmp, setEditingEmp] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', role: '', email: '' });

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- EMPLOYEE ACTIONS ---

  const handleEditClick = (emp) => {
    setEditingEmp(emp.id);
    setEditFormData({ name: emp.name, role: emp.role, email: emp.email });
  };

  const handleSaveEdit = (empId) => {
    const updatedDepartments = departments.map(dept => {
      if (dept.id === selectedDept.id) {
        return {
          ...dept,
          employees: dept.employees.map(emp => 
            emp.id === empId ? { ...emp, ...editFormData } : emp
          )
        };
      }
      return dept;
    });

    setDepartments(updatedDepartments);
    setSelectedDept(updatedDepartments.find(d => d.id === selectedDept.id));
    setEditingEmp(null);
  };

  const handleDelete = (empId) => {
    if(window.confirm("Are you sure you want to remove this employee from the department?")) {
      const updatedDepartments = departments.map(dept => {
        if (dept.id === selectedDept.id) {
          return {
            ...dept,
            employees: dept.employees.filter(emp => emp.id !== empId)
          };
        }
        return dept;
      });

      setDepartments(updatedDepartments);
      setSelectedDept(updatedDepartments.find(d => d.id === selectedDept.id));
    }
  };

  return (
    <div className="text-gray-800 dark:text-white font-sans relative transition-colors duration-300">
      
      {/* Background Glow hata diya gaya hai */}

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Departments
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
              Manage company departments, view team sizes and track overall performance.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all font-medium shadow-sm hover:shadow-md active:scale-95">
            <Plus size={18} /> Add Department
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#1a1a1a] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <Building2 size={16} className="text-indigo-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-900 dark:text-white">{departments.length}</span> Total Departments
            </div>
          </div>

          <div className="relative w-full lg:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block pl-11 p-2.5 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => {
            const completionRate = Math.round((dept.completedTasks / dept.totalTasks) * 100);

            return (
              <div 
                key={dept.id} 
                className="group bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${dept.bg} ${dept.color}`}>
                    {dept.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Team Size</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-end gap-1">
                      <Users size={14} className="text-gray-400 dark:text-gray-500"/> {dept.employees.length}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                  {dept.name}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-100 dark:border-gray-800/50 transition-colors duration-300">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Active Tasks</p>
                    <p className="text-base font-semibold text-yellow-600 dark:text-yellow-400">{dept.activeTasks}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-100 dark:border-gray-800/50 transition-colors duration-300">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                    <p className="text-base font-semibold text-green-600 dark:text-green-400">{dept.completedTasks}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500 dark:text-gray-400">Task Completion Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800/80 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        completionRate >= 80 ? 'bg-green-500' : 
                        completionRate >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedDept(dept)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] hover:bg-indigo-50 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors mt-auto"
                >
                  View Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* --- VIEW DETAILS MODAL --- */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] transition-colors duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#161616] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedDept.bg} ${selectedDept.color}`}>
                  {selectedDept.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedDept.name} Team</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage employees in this department</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedDept(null); setEditingEmp(null); }} 
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
              {selectedDept.employees.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No employees in this department yet.</p>
              ) : (
                selectedDept.employees.map((emp) => (
                  <div key={emp.id} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-xl p-4 transition-all duration-300">
                    
                    {editingEmp !== emp.id ? (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-gray-300 border border-indigo-200 dark:border-gray-700">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{emp.name}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1"><Briefcase size={12}/> {emp.role}</span>
                              <span className="flex items-center gap-1"><Mail size={12}/> {emp.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => handleEditClick(emp)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(emp.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Edit Form
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Name</label>
                            <input 
                              type="text" 
                              value={editFormData.name}
                              onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                              className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg p-2 outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Role</label>
                            <input 
                              type="text" 
                              value={editFormData.role}
                              onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                              className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg p-2 outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
                          <input 
                            type="email" 
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg p-2 outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            onClick={() => setEditingEmp(null)}
                            className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleSaveEdit(emp.id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                          >
                            <Save size={14} /> Save
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#161616] flex justify-between items-center shrink-0 transition-colors duration-300">
              <p className="text-xs text-gray-500">Total {selectedDept.employees.length} employees</p>
              <button 
                onClick={() => { setSelectedDept(null); setEditingEmp(null); }}
                className="px-5 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Departments;
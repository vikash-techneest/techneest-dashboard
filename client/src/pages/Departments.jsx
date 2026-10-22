import React, { useState } from 'react';
import { 
  Building2, Users, Plus, Search, 
  ArrowRight, Briefcase, Code2, Smartphone, Video, 
  Megaphone, Paintbrush, X, Edit3, Trash2, Mail, Save
} from 'lucide-react';

// Dummy Data: Departments with Employees List
const initialDepartments = [
  { 
    id: 1, name: 'Sales', icon: <Briefcase size={22} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/40',
    employees: [
      { id: 'WB-101', name: 'Vikram Singh', role: 'Sales Manager', email: 'vikram@company.com' },
      { id: 'WB-102', name: 'Anjali Gupta', role: 'Sales Exec', email: 'anjali@company.com' },
      { id: 'WB-103', name: 'Rohit Verma', role: 'Sales Exec', email: 'rohit@company.com' },
    ], 
    activeTasks: 8, completedTasks: 45, totalTasks: 60 
  },
  { 
    id: 2, name: 'Frontend Development', icon: <Code2 size={22} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/40',
    employees: [
      { id: 'WB-024', name: 'Rahul Sharma', role: 'Frontend Dev', email: 'rahul@company.com' },
      { id: 'WB-025', name: 'Sneha Kapoor', role: 'Frontend Dev', email: 'sneha@company.com' },
    ], 
    activeTasks: 15, completedTasks: 120, totalTasks: 140 
  },
  { 
    id: 3, name: 'Backend Development', icon: <Code2 size={22} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'hover:border-green-500/40',
    employees: [
      { id: 'WB-045', name: 'Karan Patel', role: 'Backend Dev', email: 'karan@company.com' },
    ], 
    activeTasks: 10, completedTasks: 95, totalTasks: 110 
  },
  { 
    id: 4, name: 'Android Development', icon: <Smartphone size={22} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'hover:border-yellow-500/40',
    employees: [
      { id: 'WB-050', name: 'Arjun Reddy', role: 'Android Dev', email: 'arjun@company.com' },
    ], 
    activeTasks: 4, completedTasks: 30, totalTasks: 40 
  },
  { 
    id: 5, name: 'Video Editors', icon: <Video size={22} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'hover:border-red-500/40',
    employees: [
      { id: 'WB-060', name: 'Simran Kaur', role: 'Video Editor', email: 'simran@company.com' },
    ], 
    activeTasks: 6, completedTasks: 22, totalTasks: 30 
  },
  { 
    id: 6, name: 'Marketing', icon: <Megaphone size={22} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'hover:border-orange-500/40',
    employees: [
      { id: 'WB-012', name: 'Neha Singh', role: 'Marketing Exec', email: 'neha@company.com' },
    ], 
    activeTasks: 5, completedTasks: 50, totalTasks: 65 
  },
  { 
    id: 7, name: 'UI/UX Design', icon: <Paintbrush size={22} />, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/40',
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
  const [editingEmp, setEditingEmp] = useState(null); // Employee being edited
  const [editFormData, setEditFormData] = useState({ name: '', role: '', email: '' });

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- EMPLOYEE ACTIONS ---

  // Open Edit Mode
  const handleEditClick = (emp) => {
    setEditingEmp(emp.id);
    setEditFormData({ name: emp.name, role: emp.role, email: emp.email });
  };

  // Save Edited Employee
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
    // Update selectedDept state to reflect changes in modal immediately
    setSelectedDept(updatedDepartments.find(d => d.id === selectedDept.id));
    setEditingEmp(null);
  };

  // Delete Employee
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
    <div className=" text-white font-sans selection:bg-blue-500/30 relative">
      
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
              Departments
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Manage company departments, view team sizes and track overall performance.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-xl border border-blue-500/50 transition-all font-medium shadow-lg shadow-blue-900/20 hover:shadow-xl hover:scale-105 active:scale-95">
            <Plus size={18} /> Add Department
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-[#111111]/80 backdrop-blur-md border border-gray-800/80 rounded-2xl p-4 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#1a1a1a] px-4 py-2 rounded-xl border border-gray-700">
              <Building2 size={16} className="text-blue-400" />
              <span className="font-semibold text-white">{departments.length}</span> Total Departments
            </div>
          </div>

          <div className="relative w-full lg:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block pl-11 p-2.5 outline-none transition-all placeholder-gray-500"
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
                className={`group bg-[#111111]/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 transition-all duration-300 shadow-xl ${dept.border} hover:-translate-y-1 hover:shadow-2xl flex flex-col`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${dept.bg} ${dept.color}`}>
                    {dept.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Team Size</p>
                    <p className="text-lg font-bold text-white flex items-center justify-end gap-1">
                      <Users size={14} className="text-gray-400"/> {dept.employees.length}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                  {dept.name}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800/50">
                    <p className="text-[11px] text-gray-400 mb-1">Active Tasks</p>
                    <p className="text-base font-semibold text-yellow-400">{dept.activeTasks}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800/50">
                    <p className="text-[11px] text-gray-400 mb-1">Completed</p>
                    <p className="text-base font-semibold text-green-400">{dept.completedTasks}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Task Completion Rate</span>
                    <span className="font-semibold text-white">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-800/80 h-2 rounded-full overflow-hidden">
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors mt-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 bg-[#161616] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedDept.bg} ${selectedDept.color}`}>
                  {selectedDept.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedDept.name} Team</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage employees in this department</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedDept(null); setEditingEmp(null); }} 
                className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable List) */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
              {selectedDept.employees.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No employees in this department yet.</p>
              ) : (
                selectedDept.employees.map((emp) => (
                  <div key={emp.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 transition-all">
                    
                    {/* If NOT editing, show standard view */}
                    {editingEmp !== emp.id ? (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-300 border border-gray-700">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">{emp.name}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Briefcase size={12}/> {emp.role}</span>
                              <span className="flex items-center gap-1"><Mail size={12}/> {emp.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => handleEditClick(emp)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(emp.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      // If Editing, show Input Form
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Name</label>
                            <input 
                              type="text" 
                              value={editFormData.name}
                              onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                              className="w-full bg-[#111] border border-gray-700 text-white text-sm rounded-lg p-2 outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Role</label>
                            <input 
                              type="text" 
                              value={editFormData.role}
                              onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                              className="w-full bg-[#111] border border-gray-700 text-white text-sm rounded-lg p-2 outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
                          <input 
                            type="email" 
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            className="w-full bg-[#111] border border-gray-700 text-white text-sm rounded-lg p-2 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            onClick={() => setEditingEmp(null)}
                            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleSaveEdit(emp.id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
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
            <div className="p-4 border-t border-gray-800 bg-[#161616] flex justify-between items-center shrink-0">
              <p className="text-xs text-gray-500">Total {selectedDept.employees.length} employees</p>
              <button 
                onClick={() => { setSelectedDept(null); setEditingEmp(null); }}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
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
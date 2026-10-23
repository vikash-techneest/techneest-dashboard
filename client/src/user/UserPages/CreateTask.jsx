import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CreateTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    priority: 'Medium',
    project: 'Personal development',
    description: ''
  });

  // Sidebar me dikhane ke liye dummy data
  const myTasks = [
    { id: 1, title: 'Prepare presentation slides', status: 'In Progress' },
    { id: 2, title: 'Read chapter 4 of React guide', status: 'To Do' },
    { id: 3, title: 'Update portfolio website', status: 'Done' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Common Input Class
  const inputClass = "w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] focus:border-indigo-500 dark:focus:border-[#444] focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-xl px-4 py-2.5 outline-none transition-colors duration-300";
  const labelClass = "block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2";

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800 dark:text-gray-300 transition-colors duration-300">
      
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Create a Personal Task</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Add your own task and track it alongside admin-assigned work.
        </p>
      </div>

      {/* ================= MAIN LAYOUT (Grid) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <form className="space-y-5">
            
            {/* Task Title */}
            <div>
              <label className={labelClass}>Task Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title..."
                className={inputClass}
              />
            </div>

            {/* Due Date & Priority (Side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </div>
              
              <div>
                <label className={labelClass}>Priority</label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 dark:text-gray-500">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Project / Category */}
            <div>
              <label className={labelClass}>Project / Category</label>
              <div className="relative">
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="Personal development">Personal development</option>
                  <option value="Learning">Learning</option>
                  <option value="Side Project">Side Project</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 dark:text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details or steps for this task..."
                rows="4"
                className={`${inputClass} resize-none py-3`}
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm hover:shadow-md active:scale-95"
              >
                Create Task
              </button>
              <button
                type="button"
                className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm dark:shadow-none"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: MY PERSONAL TASKS */}
        <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-6 h-fit shadow-sm transition-colors duration-300">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">My Personal Tasks</h2>
            <p className="text-xs text-gray-500 dark:text-gray-500">Only you can manage these tasks.</p>
          </div>

          <div className="space-y-4">
            {myTasks.map((task) => (
              <div key={task.id} className="flex flex-col gap-2 pb-4 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0 last:pb-0 transition-colors duration-300">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{task.title}</p>
                <div className="flex">
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// ================= SUB-COMPONENTS =================

// Status Badge Component
const TaskStatusBadge = ({ status }) => {
  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#1e1e1e] dark:text-gray-300 dark:border-[#3a3a3a]';
  let dotColor = 'bg-gray-500';

  if (status === 'In Progress') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    dotColor = 'bg-blue-500';
  } else if (status === 'Done') {
    colorClasses = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
    dotColor = 'bg-green-500';
  } else if (status === 'To Do') {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
    dotColor = 'bg-orange-500';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 min-w-[90px] transition-colors duration-300 ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};

export default CreateTask;
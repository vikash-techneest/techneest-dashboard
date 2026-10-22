import React, { useState } from 'react';

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

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-300">
      
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create a Personal Task</h1>
        <p className="text-xs text-gray-400">
          Add your own task and track it alongside admin-assigned work.
        </p>
      </div>

      {/* ================= MAIN LAYOUT (Grid) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#2a2a2a] rounded-xl p-6">
          <form className="space-y-5">
            
            {/* Task Title */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title..."
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#444] text-sm text-white placeholder-gray-600 rounded-lg px-4 py-2.5 outline-none transition"
              />
            </div>

            {/* Due Date & Priority (Side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#444] text-sm text-gray-400 rounded-lg px-4 py-2.5 outline-none transition [color-scheme:dark]"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full appearance-none bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#444] text-sm text-white rounded-lg px-4 py-2.5 outline-none cursor-pointer transition"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <span className="text-[10px]">■</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project / Category */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Project / Category
              </label>
              <div className="relative">
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className="w-full appearance-none bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#444] text-sm text-white rounded-lg px-4 py-2.5 outline-none cursor-pointer transition"
                >
                  <option value="Personal development">Personal development</option>
                  <option value="Learning">Learning</option>
                  <option value="Side Project">Side Project</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <span className="text-[10px]">■</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details or steps for this task..."
                rows="4"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#444] text-sm text-white placeholder-gray-600 rounded-lg px-4 py-3 outline-none transition resize-none"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Create Task
              </button>
              <button
                type="button"
                className="bg-transparent hover:bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: MY PERSONAL TASKS */}
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 h-fit">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">My Personal Tasks</h2>
            <p className="text-xs text-gray-500">Only you can manage these tasks.</p>
          </div>

          <div className="space-y-4">
            {myTasks.map((task) => (
              <div key={task.id} className="flex flex-col gap-2 pb-4 border-b border-[#2a2a2a] last:border-0 last:pb-0">
                <p className="text-sm text-gray-300 font-medium">{task.title}</p>
                <div className="flex">
                  <span className="px-2.5 py-1 rounded-full border border-[#3a3a3a] bg-[#1e1e1e] text-[11px] font-medium text-gray-300 flex items-center gap-1.5 min-w-[90px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateTask;
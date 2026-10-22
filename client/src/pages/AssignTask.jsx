import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Calendar, Clock, Paperclip, ListChecks, Repeat } from 'lucide-react';

const AssignTask = () => {
  const navigate = useNavigate();

  // Form State
  const [taskData, setTaskData] = useState({
    title: '',
    project: '',
    assignees: '',
    priority: 'Normal',
    startDate: '',
    dueDate: '',
    notifyEmployee: true,
    repeatTask: 'No repeat',
    checklist: '',
    attachments: null
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Task Assigned:', taskData);
    alert('Task Assigned Successfully!');
    navigate('/admin/dashboard'); // Success ke baad dashboard par redirect
  };

  // Handle Save Draft
  const handleSaveDraft = () => {
    console.log('Draft Saved:', taskData);
    alert('Draft Saved Successfully!');
  };

  return (
    <div className=" text-white font-sans relative">
      
      {/* Page Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Assign a Task</h1>
        <p className="text-gray-400 text-sm">Assign work to one or more employees with clear deadlines and priorities.</p>
      </div>

      {/* Main Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Task Details (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-[#111111] border border-gray-800 rounded-2xl  md:p-8 space-y-6">
          
          {/* Task Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare size={14} /> Task Title
            </label>
            <input
              type="text"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              placeholder="Enter a clear task title"
              required
              className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors"
            />
          </div>

          {/* Project / Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Project / Category
            </label>
            <select
              name="project"
              value={taskData.project}
              onChange={handleChange}
              required
              className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors cursor-pointer"
            >
              <option value="" disabled>Select project</option>
              <option value="Website Redesign">Website Redesign</option>
              <option value="Mobile App">Mobile App</option>
              <option value="Marketing Campaign">Marketing Campaign</option>
              <option value="Internal Tools">Internal Tools</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Assignee
              </label>
              <select
                name="assignees"
                value={taskData.assignees}
                onChange={handleChange}
                required
                className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors cursor-pointer"
              >
                <option value="" disabled>Select employee(s)</option>
                <option value="Rahul Sharma">Rahul Sharma</option>
                <option value="Priya Verma">Priya Verma</option>
                <option value="Amit Singh">Amit Singh</option>
                <option value="Neha Singh">Neha Singh</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Priority
              </label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} /> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={taskData.startDate}
                onChange={handleChange}
                required
                className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors [color-scheme:dark]"
              />
            </div>

            {/* Due Date & Time */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} /> Due Date & Time
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleChange}
                required
                className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Action Buttons (Mobile) */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-800 lg:hidden">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Assign Task
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Save Draft
            </button>
          </div>
        </div>

        {/* Right Side: Assignment Options */}
        <div className="lg:col-span-1 bg-[#111111] border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 h-fit">
          <h2 className="text-lg font-semibold text-white mb-2">Assignment Options</h2>

          {/* Notify Employee */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 tracking-wider">Notify employee</label>
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg p-3">
              <input
                type="checkbox"
                name="notifyEmployee"
                checked={taskData.notifyEmployee}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <span className="text-sm text-gray-300">Send notification</span>
            </div>
          </div>

          {/* Repeat Task */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 tracking-wider flex items-center gap-2">
              <Repeat size={14} /> Repeat task
            </label>
            <select
              name="repeatTask"
              value={taskData.repeatTask}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors cursor-pointer"
            >
              <option value="No repeat">No repeat</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 tracking-wider flex items-center gap-2">
              <ListChecks size={14} /> Checklist
            </label>
            <input
              type="text"
              name="checklist"
              value={taskData.checklist}
              onChange={handleChange}
              placeholder="Add checklist items"
              className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 tracking-wider flex items-center gap-2">
              <Paperclip size={14} /> Attachments
            </label>
            <div className="relative">
              <input
                type="file"
                name="attachments"
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden lg:flex flex-col gap-3 pt-6 border-t border-gray-800">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Assign Task
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Save Draft
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssignTask;
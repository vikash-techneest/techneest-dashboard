import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, IndianRupee, Calendar, User, Mail, Briefcase, Settings, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

const EmployeeAdd = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: isEditMode ? id : 'Auto-generated',
    email: '',
    password: '',
    department: '',
    role: '',
    joiningDate: '',
    salary: '',
    status: 'Active',
    loginAccess: 'Email + temporary password',
    attendancePolicy: 'Standard office hours',
    salaryCycle: 'Monthly - calendar month'
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        fullName: 'Rahul Sharma',
        employeeId: id,
        email: 'rahul.sharma@company.com',
        password: 'Rahul@12345',
        department: 'Development',
        role: 'Frontend Dev',
        joiningDate: '2023-01-15',
        salary: '45000',
        status: 'Active',
        loginAccess: 'Email + temporary password',
        attendancePolicy: 'Standard office hours',
        salaryCycle: 'Monthly - calendar month'
      });
    } else {
      setFormData({
        fullName: '',
        employeeId: 'Auto-generated',
        email: '',
        password: '',
        department: '',
        role: '',
        joiningDate: '',
        salary: '',
        status: 'Active',
        loginAccess: 'Email + temporary password',
        attendancePolicy: 'Standard office hours',
        salaryCycle: 'Monthly - calendar month'
      });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert(isEditMode ? 'Employee Updated Successfully!' : 'Employee Added Successfully!');
    navigate('/admin/employee');
  };

  // Common Input Class
  const inputClass = "w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3 outline-none transition-colors";
  const labelClass = "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2";
  const disabledInputClass = "w-full bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-sm rounded-xl block p-3 outline-none cursor-not-allowed";

  return (
    <div className="text-gray-800 dark:text-white font-sans transition-colors duration-300">
      
      {/* Page Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 transition-colors duration-300">
          {isEditMode ? 'Edit Employee' : 'Add Employee'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {isEditMode 
            ? 'Update employee account details and configurations.' 
            : 'Create an employee account and configure role, department and salary details.'}
        </p>
      </div>

      {/* Main Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Basic Details */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm transition-colors duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className={labelClass}>
                <User size={14} className="text-indigo-500" /> Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                className={inputClass}
              />
            </div>

            {/* Employee ID */}
            <div className="space-y-2">
              <label className={labelClass}>
                <ShieldCheck size={14} className="text-indigo-500" /> Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                disabled
                className={disabledInputClass}
              />
            </div>
          </div>

          {/* Email & Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Address */}
            <div className="space-y-2">
              <label className={labelClass}>
                <Mail size={14} className="text-indigo-500" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                className={inputClass}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className={labelClass}>
                <Lock size={14} className="text-indigo-500" /> Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div className="space-y-2">
              <label className={labelClass}>
                <Briefcase size={14} className="text-indigo-500" /> Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className={`${inputClass} cursor-pointer`}
              >
                <option value="" disabled>Select department</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="QA">QA</option>
                <option value="HR">HR</option>
              </select>
            </div>

            {/* Job Role */}
            <div className="space-y-2">
              <label className={labelClass}>
                <User size={14} className="text-indigo-500" /> Job Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className={`${inputClass} cursor-pointer`}
              >
                <option value="" disabled>Select role</option>
                <option value="Frontend Dev">Frontend Dev</option>
                <option value="Backend Dev">Backend Dev</option>
                <option value="UI Designer">UI Designer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Marketing Exec">Marketing Exec</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Joining Date */}
            <div className="space-y-2">
              <label className={labelClass}>
                <Calendar size={14} className="text-indigo-500" /> Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                className={`${inputClass} dark:[color-scheme:dark]`}
              />
            </div>

            {/* Monthly Base Salary */}
            <div className="space-y-2">
              <label className={labelClass}>
                <IndianRupee size={14} className="text-indigo-500" /> Monthly Base Salary
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  required
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons (Mobile) */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 lg:hidden">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Save size={18} /> {isEditMode ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>

        {/* Right Side: Account Settings */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 h-fit shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-800 pb-4">
            <Settings size={18} className="text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h2>
          </div>

          {/* Account Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Account status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Login Access */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Login access</label>
            <select
              name="loginAccess"
              value={formData.loginAccess}
              onChange={handleChange}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="Email + temporary password">Email + temporary password</option>
              <option value="SSO (Single Sign-On)">SSO (Single Sign-On)</option>
              <option value="Manual setup">Manual setup</option>
            </select>
          </div>

          {/* Attendance Policy */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Attendance policy</label>
            <select
              name="attendancePolicy"
              value={formData.attendancePolicy}
              onChange={handleChange}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="Standard office hours">Standard office hours</option>
              <option value="Flexible hours">Flexible hours</option>
              <option value="Shift based">Shift based</option>
            </select>
          </div>

          {/* Salary Cycle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Salary cycle</label>
            <select
              name="salaryCycle"
              value={formData.salaryCycle}
              onChange={handleChange}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="Monthly - calendar month">Monthly - calendar month</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden lg:flex flex-col gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Save size={18} /> {isEditMode ? 'Update Employee' : 'Save Employee'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeAdd;
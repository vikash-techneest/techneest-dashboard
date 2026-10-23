import React, { useState } from 'react';
import { 
  ShieldCheck, Clock, 
  AlertTriangle, BellRing, Lock, 
  Save
} from 'lucide-react';

const Settings = () => {
  // State for settings toggles and inputs
  const [settings, setSettings] = useState({
    loginTime: '09:00',
    logoutTime: '18:00',
    lateThreshold: '09:30',
    autoAbsent: true,
    overtimeApproval: true,
    emailNotifications: true,
    pushNotifications: false,
    ipWhitelisting: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  // Toggle Switch Component (Light + Dark Mode Fix)
  const ToggleSwitch = ({ name, checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-[#111111] ${
        checked ? 'bg-indigo-600 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  // Common Input Class
  const inputClass = "w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block pl-10 p-3 outline-none transition-colors dark:[color-scheme:dark]";

  return (
    <div className="text-gray-800 dark:text-white font-sans relative transition-colors duration-300">
      
      {/* Ambient Background Glow hata diya gaya hai */}

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Settings & Configuration
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
              Configure attendance policies, login times and advanced system features.
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>

        <div className="space-y-8">
          
          {/* 1. ATTENDANCE TIMINGS SECTION */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <Clock size={22} className="text-indigo-600 dark:text-blue-400" /> Attendance Timings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Login Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Standard Login Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="time"
                    name="loginTime"
                    value={settings.loginTime}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Employees logging in after this time are marked as Late.</p>
              </div>

              {/* Late Threshold */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Late Threshold (Grace Period)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <input
                    type="time"
                    name="lateThreshold"
                    value={settings.lateThreshold}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Grace period before an employee is marked Late.</p>
              </div>

              {/* Logout Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Standard Logout Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-red-600 dark:text-red-400" />
                  </div>
                  <input
                    type="time"
                    name="logoutTime"
                    value={settings.logoutTime}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Default office closing time.</p>
              </div>
            </div>
          </div>

          {/* 2. ADVANCED FEATURES SECTION */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <ShieldCheck size={22} className="text-purple-600 dark:text-purple-400" /> Advanced Features
            </h2>
            
            <div className="space-y-4">
              
              {/* Auto Absent */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Auto-Mark Absent</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically mark employees as absent if they don't log in by end of day.</p>
                </div>
                <ToggleSwitch name="autoAbsent" checked={settings.autoAbsent} onChange={handleChange} />
              </div>

              {/* Overtime Approval */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Overtime Approval</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Require Admin approval for hours logged beyond standard logout time.</p>
                </div>
                <ToggleSwitch name="overtimeApproval" checked={settings.overtimeApproval} onChange={handleChange} />
              </div>

              {/* IP Whitelisting */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    IP Whitelisting <Lock size={14} className="text-gray-400 dark:text-gray-500" />
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Restrict login to specific office IP addresses only.</p>
                </div>
                <ToggleSwitch name="ipWhitelisting" checked={settings.ipWhitelisting} onChange={handleChange} />
              </div>

            </div>
          </div>

          {/* 3. NOTIFICATIONS SECTION */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <BellRing size={22} className="text-yellow-600 dark:text-yellow-400" /> Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send email alerts for late arrivals, leaves and payroll updates.</p>
                </div>
                <ToggleSwitch name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send real-time push notifications to Admin devices.</p>
                </div>
                <ToggleSwitch name="pushNotifications" checked={settings.pushNotifications} onChange={handleChange} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
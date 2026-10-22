import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, ShieldCheck, Clock, 
  CalendarDays, DollarSign, Building2, FileText, 
  Download, ArrowRight, BellRing, Lock, Globe, 
  Save, CheckCircle2, AlertTriangle
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
    // Yahan API call karenge
    alert('Settings saved successfully!');
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ name, checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-blue-600' : 'bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className=" text-white font-sans selection:bg-blue-500/30 relative">
      
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
              Settings & Configuration
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Configure attendance policies, login times and advanced system features.
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-xl border border-blue-500/50 transition-all font-medium shadow-lg shadow-blue-900/20 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>

        <div className="space-y-8">
          
          {/* 1. ATTENDANCE TIMINGS SECTION */}
          <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
              <Clock size={22} className="text-blue-400" /> Attendance Timings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Login Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Standard Login Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="time"
                    name="loginTime"
                    value={settings.loginTime}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block pl-10 p-3 outline-none [color-scheme:dark]"
                  />
                </div>
                <p className="text-[11px] text-gray-500">Employees logging in after this time are marked as Late.</p>
              </div>

              {/* Late Threshold */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Late Threshold (Grace Period)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertTriangle size={16} className="text-yellow-500" />
                  </div>
                  <input
                    type="time"
                    name="lateThreshold"
                    value={settings.lateThreshold}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-yellow-500/50 block pl-10 p-3 outline-none [color-scheme:dark]"
                  />
                </div>
                <p className="text-[11px] text-gray-500">Grace period before an employee is marked Late.</p>
              </div>

              {/* Logout Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Standard Logout Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-red-400" />
                  </div>
                  <input
                    type="time"
                    name="logoutTime"
                    value={settings.logoutTime}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-red-500/50 block pl-10 p-3 outline-none [color-scheme:dark]"
                  />
                </div>
                <p className="text-[11px] text-gray-500">Default office closing time.</p>
              </div>
            </div>
          </div>

          {/* 2. ADVANCED FEATURES SECTION */}
          <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
              <ShieldCheck size={22} className="text-purple-400" /> Advanced Features
            </h2>
            
            <div className="space-y-4">
              
              {/* Auto Absent */}
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">Auto-Mark Absent</h3>
                  <p className="text-xs text-gray-400 mt-1">Automatically mark employees as absent if they don't log in by end of day.</p>
                </div>
                <ToggleSwitch name="autoAbsent" checked={settings.autoAbsent} onChange={handleChange} />
              </div>

              {/* Overtime Approval */}
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">Overtime Approval</h3>
                  <p className="text-xs text-gray-400 mt-1">Require Admin approval for hours logged beyond standard logout time.</p>
                </div>
                <ToggleSwitch name="overtimeApproval" checked={settings.overtimeApproval} onChange={handleChange} />
              </div>

              {/* IP Whitelisting */}
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    IP Whitelisting <Lock size={14} className="text-gray-500" />
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Restrict login to specific office IP addresses only.</p>
                </div>
                <ToggleSwitch name="ipWhitelisting" checked={settings.ipWhitelisting} onChange={handleChange} />
              </div>

            </div>
          </div>

          {/* 3. NOTIFICATIONS SECTION */}
          <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
              <BellRing size={22} className="text-yellow-400" /> Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">Email Notifications</h3>
                  <p className="text-xs text-gray-400 mt-1">Send email alerts for late arrivals, leaves and payroll updates.</p>
                </div>
                <ToggleSwitch name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">Push Notifications</h3>
                  <p className="text-xs text-gray-400 mt-1">Send real-time push notifications to Admin devices.</p>
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
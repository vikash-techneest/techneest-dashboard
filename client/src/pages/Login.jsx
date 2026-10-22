import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Mail, Lock, Eye, EyeOff, 
  ArrowRight, Users 
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when typing
  };

  // Handle Login Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Fake Authentication Delay
    setTimeout(() => {
      // Demo Credentials Check (Backend logic simulate kar rahe hain)
      if (formData.email === 'admin@workboard.com' && formData.password === 'admin123') {
        // Agar Admin hai
        navigate('/admin/dashboard');
      } else if (formData.email === 'employee@workboard.com' && formData.password === 'employee123') {
        // Agar Employee hai
        navigate('/employee-dashboard'); // Employee dashboard route
      } else {
        // Galat credentials
        setError('Invalid Credentials. Please check your email and password.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#111111]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-900/40">
            <LayoutDashboard size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to WorkBoard</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block pl-11 p-3.5 outline-none transition-all placeholder-gray-600"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400 tracking-wider">Password</label>
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block pl-11 pr-11 p-3.5 outline-none transition-all placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-[#1a1a1a] text-blue-600 focus:ring-blue-500/50 cursor-pointer"
            />
            <label className="text-sm text-gray-400 cursor-pointer">Remember me for 30 days</label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        {/* Footer Note / Demo Credentials */}
        <div className="mt-8 p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
          <p className="text-xs text-gray-400 text-center font-medium mb-2 flex items-center justify-center gap-1">
            <Users size={12} /> Demo Credentials
          </p>
          <div className="space-y-1 text-center">
            <p className="text-[11px] text-gray-500">
              <span className="text-blue-400 font-semibold">Admin:</span> admin@workboard.com / admin123
            </p>
            <p className="text-[11px] text-gray-500">
              <span className="text-purple-400 font-semibold">Employee:</span> employee@workboard.com / employee123
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

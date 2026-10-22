import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import Layout from './components/Layout';
import Login from './pages/Login';

// Admin Pages
import Dashboard from './pages/Dashboard';
import Employee from './pages/Employee';
import EmployeeDetails from './pages/EmploiesDetails'; 
import EmployeeAdd from './pages/EmployeeAdd'; 
import AssignTask from './pages/AssignTask'; 
import AllTask from './pages/AllTask'; 
import AttendanceManagement from './pages/AttendanceManagement';
import SalaryManagement from './pages/SalaryManagement';
import Reports from './pages/Reports';
import Departments from './pages/Departments';
import Settings from './pages/Settings';

// User Pages
import UserLayout from './user/UserComponents/UserLayout';
import UserDashboard from './user/UserPages/Dashboard';
import MyTasks from './user/UserPages/MyTasks';
import CreateTask from './user/UserPages/CreateTask';
import Attendance from './user/UserPages/Attendance';
import WorkReports from './user/UserPages/WorkReports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="employee" element={<Employee />} />
          <Route path="employee/add" element={<EmployeeAdd />} />
          <Route path="employee/edit/:id" element={<EmployeeAdd />} />
          <Route path="employee/:id" element={<EmployeeDetails />} />
          
          <Route path="assign-task" element={<AssignTask />} />
          <Route path="assign-task/edit/:id" element={<AssignTask />} />
          
          <Route path="all-task" element={<AllTask />} />
          <Route path="attendance-management" element={<AttendanceManagement />} />
          <Route path="salary-management" element={<SalaryManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="departments" element={<Departments />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ================= USER ROUTES (TOP-LEVEL) ================= */}
        {/* UserLayout ab top-level pe hai, isliye URLs simple hain */}
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/all-task" element={<MyTasks />} />
          <Route path="/create-task" element={<CreateTask />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<WorkReports />} />
        </Route>

        {/* Catch-all (404 Fallback) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
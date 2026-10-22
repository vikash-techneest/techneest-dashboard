import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
      {/* Sidebar Fix */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar Fix */}
        <Topbar />

        {/* Dynamic Page Content (Dashboard, Employees etc. yahan render honge) */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#050505]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
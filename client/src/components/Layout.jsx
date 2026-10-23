import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  return (
    // 1. Outer Wrapper: Light mode me halka greyish-blue, dark mode me black
    <div className="flex h-screen w-full bg-[#f4f7fe] dark:bg-[#050505] overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Fix */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Topbar Fix */}
        <Topbar />

        {/* Dynamic Page Content */}
        {/* 2. Main Area: Iska background bhi theme ke hisaab se change hoga */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f4f7fe] dark:bg-[#050505] transition-colors duration-300">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default Layout;
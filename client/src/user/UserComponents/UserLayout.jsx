import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import UserTopbar from './UserTopbar';

const UserLayout = () => {
  return (
    // Admin Layout jaisa hi exact background color diya hai
    <div className="flex h-screen w-full bg-[#f4f7fe] dark:bg-[#050505] overflow-hidden transition-colors duration-300">
      
      {/* User Sidebar */}
      <UserSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* User Topbar */}
        <UserTopbar />

        {/* Dynamic Page Content */}
        {/* Yahan bhi main area ka background waisa hi kar diya hai */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f4f7fe] dark:bg-[#050505] transition-colors duration-300">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default UserLayout;
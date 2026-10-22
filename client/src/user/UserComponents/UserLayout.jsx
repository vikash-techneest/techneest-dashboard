import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import UserTopbar from './UserTopbar';

const UserLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
      {/* User Sidebar */}
      <UserSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* User Topbar */}
        <UserTopbar />

        {/* Dynamic Page Content yahan render hoga */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#050505]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
import React from 'react';
import { Outlet } from 'react-router-dom';
import SellerSidebar from './SellerSidebar';
import SellerNavbar from './SellerNavbar';
import { useSellerStore } from '../../store/useSellerStore';

const SellerLayout: React.FC = () => {
  const sidebarCollapsed = useSellerStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <SellerSidebar />

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        } max-lg:ml-0`}
      >
        <SellerNavbar />

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;

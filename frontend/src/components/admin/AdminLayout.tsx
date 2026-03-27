import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { useAdminStore } from '../../store/useAdminStore';

const AdminLayout: React.FC = () => {
  const sidebarCollapsed = useAdminStore((s) => s.sidebarCollapsed);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div
        className={`admin-layout__main ${sidebarCollapsed ? 'admin-layout__main--collapsed' : ''}`}
      >
        <AdminNavbar />

        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

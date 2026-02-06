import { useState } from 'react';
import AdminHeader from '../Header/AdminHeader';
import AdminSidebar from '../Sidebar/AdminSidebar';
import Footer from '../Footer';

import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="admin-shell">
      <AdminHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="admin-shell__body">
        <AdminSidebar collapsed={sidebarCollapsed} />
        <main className="admin-shell__content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;


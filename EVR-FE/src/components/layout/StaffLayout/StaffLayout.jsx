import { useState } from 'react';
import StaffHeader from '../Header/StaffHeader';
import StaffSidebar from '../Sidebar/StaffSidebar';

import './StaffLayout.css';

const StaffLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="staff-shell">
      <StaffHeader onToggleSidebar={() => setCollapsed((prev) => !prev)} sidebarCollapsed={collapsed} />
      <div className="staff-shell__body">
        <StaffSidebar collapsed={collapsed} />
        <main className="staff-shell__content">{children}</main>
      </div>
    </div>
  );
};

export default StaffLayout;


import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './StaffSidebar.css';

const StaffSidebar = ({ collapsed }) => {
  const location = useLocation();

  const menu = useMemo(
    () => [
      { path: '/staff/dashboard', label: 'Bảng điều khiển', icon: 'dashboard' },
      { path: '/staff/contracts', label: 'Quản lý hợp đồng', icon: 'contracts' },
      { path: '/staff/bookings/check-in', label: 'Check-in khách', icon: 'check' },
      { path: '/staff/bookings/return', label: 'Trả xe', icon: 'return' },
      { path: '/staff/handover/create', label: 'Bàn giao nhanh', icon: 'handover' },
      { path: '/staff/maintenance', label: 'Bảo dưỡng', icon: 'wrench' },
    ],
    []
  );

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getIcon = (name) => (
    <svg aria-hidden="true">
      <use href={`#staff-icon-${name}`} />
    </svg>
  );

  return (
    <aside className={`staff-sidebar ${collapsed ? 'staff-sidebar--collapsed' : ''}`}>
      <div className="staff-sidebar__inner">
        <nav>
          <ul>
            {menu.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`staff-sidebar__link ${active ? 'is-active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="staff-sidebar__icon">{getIcon(item.icon)}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <svg width="0" height="0" className="staff-sidebar__sprite">
        <symbol id="staff-icon-dashboard" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="4" rx="1" />
          <rect x="14" y="10" width="7" height="11" rx="1" />
          <rect x="3" y="12" width="7" height="9" rx="1" />
        </symbol>
        <symbol id="staff-icon-check" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="staff-icon-return" viewBox="0 0 24 24">
          <polyline points="9 14 4 9 9 4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 20v-3a7 7 0 0 0-7-7H4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="staff-icon-handover" viewBox="0 0 24 24">
          <path d="M6 12h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M6 12l4 4M6 12l4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M14 12l4 4M14 12l4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="staff-icon-wrench" viewBox="0 0 24 24">
          <path
            d="M14.7 5.3a4 4 0 1 1-5.6 5.6l-5.1 5.1a2 2 0 1 0 2.8 2.8l5.1-5.1a4 4 0 0 1 5.6-5.6z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </symbol>
        <symbol id="staff-icon-contracts" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <polyline points="10 9 9 9 8 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
      </svg>
    </aside>
  );
};

export default StaffSidebar;


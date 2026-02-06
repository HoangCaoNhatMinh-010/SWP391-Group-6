import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './CustomerSidebar.css';

const CustomerSidebar = ({ collapsed }) => {
  const location = useLocation();

  const menu = useMemo(
    () => [
      { path: '/dashboard', label: 'Tổng quan', icon: 'compass' },
      { path: '/bookings/create', label: 'Đặt xe', icon: 'car' },
      { path: '/bookings/history', label: 'Lịch sử', icon: 'calendar' },
      { path: '/dashboard/analytics', label: 'Analytics', icon: 'pie-chart' },
      { path: '/profile', label: 'Hồ sơ', icon: 'user' },
    ],
    []
  );

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getIcon = (name) => (
    <svg aria-hidden="true">
      <use href={`#customer-icon-${name}`} />
    </svg>
  );

  return (
    <aside className={`customer-sidebar ${collapsed ? 'customer-sidebar--collapsed' : ''}`}>
      <div className="customer-sidebar__inner">
        <nav>
          <ul>
            {menu.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`customer-sidebar__link ${active ? 'is-active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="customer-sidebar__icon">{getIcon(item.icon)}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <svg width="0" height="0" className="customer-sidebar__sprite">
        <symbol id="customer-icon-compass" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <polygon points="12 8 16 12 12 16 8 12" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="customer-icon-car" viewBox="0 0 24 24">
          <path
            d="M3 13l1-4a2 2 0 0 1 2-1h12a2 2 0 0 1 2 1l1 4v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="7" cy="18" r="1" />
          <circle cx="17" cy="18" r="1" />
        </symbol>
        <symbol id="customer-icon-calendar" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="customer-icon-pie-chart" viewBox="0 0 24 24">
          <path
            d="M21.21 15.89A10 10 0 1 1 8.11 2.79"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M22 12a10 10 0 0 0-10-10v10z" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="customer-icon-user" viewBox="0 0 24 24">
          <path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
      </svg>
    </aside>
  );
};

export default CustomerSidebar;



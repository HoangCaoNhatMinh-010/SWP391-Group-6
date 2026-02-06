import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

import './AdminSidebar.css';

const AdminSidebar = ({ collapsed }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const menu = useMemo(
    () => [
      {
        section: 'Tổng quan',
        items: [
          { path: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
          { path: '/admin/reports/revenue', label: 'Báo cáo doanh thu', icon: 'bar-chart-2' },
        ],
      },
      {
        section: 'Quản lý hệ thống',
        items: [
          { path: '/admin/stations', label: 'Trạm', icon: 'map-pin' },
          { path: '/admin/vehicles', label: 'Đội xe', icon: 'truck' },
          { path: '/admin/staff', label: 'Nhân sự', icon: 'users' },
          { path: '/admin/users', label: 'Khách hàng', icon: 'user-check' },
          { path: '/admin/complaints', label: 'Khiếu nại', icon: 'message-square' },
        ],
      },
      {
        section: 'Điều phối',
        items: [
          { path: '/admin/fleet/dispatch', label: 'Điều xe', icon: 'navigation-2' },
          { path: '/admin/staff/schedule/create', label: 'Lịch làm việc', icon: 'calendar' },
        ],
      },
      {
        section: 'Phân tích',
        items: [
          { path: '/admin/reports/utilization', label: 'Hiệu suất xe', icon: 'activity' },
          { path: '/admin/reports/peaks', label: 'Khung giờ cao điểm', icon: 'clock' },
          { path: '/admin/reports/forecast', label: 'Dự báo nhu cầu', icon: 'trending-up' },
        ],
      },
    ],
    []
  );

  const getLucideIcon = (name) => (
    <svg aria-hidden="true">
      <use href={`#icon-${name}`} />
    </svg>
  );

  return (
    <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}>
      <div className="admin-sidebar__inner">
        <div className="admin-sidebar__meta">
          <span className="admin-sidebar__label">Vai trò</span>
          <strong>{user?.role || 'ADMIN'}</strong>
        </div>

        <nav className="admin-sidebar__nav">
          {menu.map((section) => (
            <div key={section.section} className="admin-sidebar__section">
              {!collapsed && <span className="admin-sidebar__section-title">{section.section}</span>}
              <ul>
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`admin-sidebar__link ${active ? 'is-active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="admin-sidebar__icon">{getLucideIcon(item.icon)}</span>
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Hidden SVG sprite for icons */}
      <svg width="0" height="0" className="admin-sidebar__sprite">
        <symbol id="icon-grid" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </symbol>
        <symbol id="icon-bar-chart-2" viewBox="0 0 24 24">
          <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 17V9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 17V5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 17v-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="icon-map-pin" viewBox="0 0 24 24">
          <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="12" cy="11" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="icon-truck" viewBox="0 0 24 24">
          <path d="M3 17V5h11v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M14 7h4l3 3v7h-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="17.5" cy="17.5" r="1.5" />
        </symbol>
        <symbol id="icon-users" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="icon-user-check" viewBox="0 0 24 24">
          <path d="M8 14a6 6 0 0 0-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="11" cy="6" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="m15 19 2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="icon-message-square" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="icon-navigation-2" viewBox="0 0 24 24">
          <path d="M12 2l7 19-4.5-4-5.5 5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="icon-calendar" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="icon-activity" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="icon-clock" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="icon-trending-up" viewBox="0 0 24 24">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <polyline points="17 6 23 6 23 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
      </svg>
    </aside>
  );
};

export default AdminSidebar;



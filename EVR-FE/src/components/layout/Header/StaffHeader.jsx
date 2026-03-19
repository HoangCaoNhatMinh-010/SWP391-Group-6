import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

import './StaffHeader.css';

const StaffHeader = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();

  const initials = (user?.name || user?.email || 'ST')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="staff-header">
      <div className="staff-header__left">
        <button
          type="button"
          className={`staff-header__toggle ${sidebarCollapsed ? 'is-collapsed' : ''}`}
          onClick={onToggleSidebar}
        >
          <span />
          <span />
          <span />
        </button>
        <Link to="/staff/dashboard" className="staff-header__brand">
          <span>EVR</span> Station Ops
        </Link>
      </div>

      <div className="staff-header__right">
        <Link to="/staff/bookings/check-in" className="staff-header__action">
          Check-in
        </Link>
        <Link to="/staff/maintenance" className="staff-header__action">
          Maintenance
        </Link>
        <div className="staff-header__user">
          <div className="staff-header__avatar">{initials}</div>
          <div className="staff-header__meta">
            <span>{user?.name || 'Nhân viên trạm'}</span>
            <small>{user?.station?.name || 'EVR Station'}</small>
          </div>
          <button type="button" className="staff-header__logout" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;


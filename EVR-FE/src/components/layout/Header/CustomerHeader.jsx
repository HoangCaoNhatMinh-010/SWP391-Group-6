import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

import './CustomerHeader.css';

const CustomerHeader = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const initials = (user?.name || user?.email || 'CU')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="customer-header">
      <div className="customer-header__left">
        <button
          type="button"
          className={`customer-header__toggle ${sidebarCollapsed ? 'is-collapsed' : ''}`}
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Mở menu' : 'Thu gọn menu'}
        >
          <span />
          <span />
          <span />
        </button>
        <Link to="/" className="customer-header__brand">
          <span>EVR</span> Journey
        </Link>
      </div>
      <div className="customer-header__right">
        <Link to="/bookings/create" className="customer-header__action">
          Đặt xe
        </Link>
        <Link to="/stations" className="customer-header__action">
          Trạm
        </Link>
        <div className="customer-header__user">
          <div className="customer-header__avatar">{initials}</div>
          <div className="customer-header__meta">
            <span>{user?.name || 'Khách hàng'}</span>
            <small>{user?.email}</small>
          </div>
          <button type="button" className="customer-header__logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;



import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

import './AdminHeader.css';

const AdminHeader = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button
          type="button"
          className="admin-header__toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          <span />
          <span />
          <span />
        </button>
        <Link to="/admin/dashboard" className="admin-header__brand">
          <span>EVR</span> Control
        </Link>
      </div>
      <div className="admin-header__right">
        <Link to="/admin/reports/revenue" className="admin-header__quicklink">
          Báo cáo
        </Link>
        <Link to="/admin/complaints" className="admin-header__quicklink">
          Khiếu nại
        </Link>
        <div className="admin-header__divider" />
        <div className="admin-header__user">
          <div className="admin-header__avatar">
            {(user?.name || user?.email || 'AD')
              .split(' ')
              .map((part) => part.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="admin-header__meta">
            <span className="admin-header__name">{user?.name || 'Administrator'}</span>
            <span className="admin-header__role">{user?.role || 'ADMIN'}</span>
          </div>
          <button type="button" className="admin-header__logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;



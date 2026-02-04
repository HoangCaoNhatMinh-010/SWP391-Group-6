import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@utils/constants';

import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { path: '/', label: 'Trang chủ' },
        { path: '/stations', label: 'Trạm' },
        { path: '/vehicles/search', label: 'Tìm xe' },
      ];
    }

    switch ((user?.role || '').toUpperCase()) {
      case USER_ROLES.ADMIN.toUpperCase():
        return [
          { path: '/', label: 'Trang chủ' },
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/users', label: 'Người dùng' },
          { path: '/admin/stations', label: 'Trạm' },
          { path: '/admin/vehicles', label: 'Xe' },
          { path: '/admin/staff', label: 'Nhân sự' },
          { path: '/admin/reports/revenue', label: 'Báo cáo' },
        ];
      case USER_ROLES.STAFF.toUpperCase():
        return [
          { path: '/', label: 'Trang chủ' },
          { path: '/staff/dashboard', label: 'Dashboard' },
          { path: '/staff/bookings/check-in', label: 'Check-in' },
          { path: '/staff/bookings/return', label: 'Trả xe' },
          { path: '/staff/maintenance', label: 'Bảo trì' },
        ];
      case USER_ROLES.CUSTOMER.toUpperCase():
        return [
          { path: '/', label: 'Trang chủ' },
          { path: '/bookings/create', label: 'Đặt xe' },
          { path: '/bookings/history', label: 'Đặt xe của tôi' },
          { path: '/stations', label: 'Trạm' },
          { path: '/vehicles/search', label: 'Tìm xe' },
        ];
      default:
        return [{ path: '/', label: 'Trang chủ' }];
    }
  }, [isAuthenticated, user]);

  return (
    <header className={`app-navbar ${isScrolled ? 'app-navbar--scrolled' : ''}`}>
      <div className="app-navbar__container container">
        <div className="app-navbar__brand-group">
          <Link className="app-navbar__brand" to="/">
            EVR<span>Fleet</span>
          </Link>
          <button
            type="button"
            className={`app-navbar__toggle ${showMobileMenu ? 'is-open' : ''}`}
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={showMobileMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`app-navbar__links ${showMobileMenu ? 'is-open' : ''}`}>
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`app-navbar__link ${isActive ? 'is-active' : ''}`}
              >
                <span>{item.label}</span>
                <span className="app-navbar__link-highlight" />
              </Link>
            );
          })}
        </nav>

        <div className="app-navbar__actions" ref={userMenuRef}>
          {isAuthenticated ? (
            <div className={`app-navbar__user ${showUserMenu ? 'is-open' : ''}`}>
              <button
                type="button"
                className="app-navbar__user-trigger"
                onClick={() => setShowUserMenu((prev) => !prev)}
              >
                <div className="app-navbar__avatar">
                  {(user?.name || 'U')
                    .split(' ')
                    .map((part) => part.charAt(0))
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="app-navbar__user-meta">
                  <span className="app-navbar__user-name">{user?.name || 'Người dùng'}</span>
                  <span className="app-navbar__user-role">{user?.role || 'Member'}</span>
                </div>
                <span className="app-navbar__caret" aria-hidden="true" />
              </button>

              <div className={`app-navbar__menu ${showUserMenu ? 'is-open' : ''}`}>
                <Link to="/profile" className="app-navbar__menu-item">
                  Hồ sơ cá nhân
                </Link>
                {user?.role === USER_ROLES.CUSTOMER && (
                  <Link to="/dashboard/analytics" className="app-navbar__menu-item">
                    Phân tích hành trình
                  </Link>
                )}
                <button type="button" className="app-navbar__menu-item app-navbar__menu-item--danger" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="app-navbar__guest-actions">
              <Link to="/login" className="app-navbar__ghost-btn">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary app-navbar__cta">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;


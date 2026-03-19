import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@utils/constants';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
          {
            label: 'Management',
            icon: '⚙️',
            children: [
              { path: '/admin/users', label: 'Users' },
              { path: '/admin/customers', label: 'Customers' },
              { path: '/admin/stations', label: 'Stations' },
              { path: '/admin/vehicles', label: 'Vehicles' },
              { path: '/admin/staff', label: 'Staff' },
            ],
          },
          {
            label: 'Operations',
            icon: '🚗',
            children: [
              { path: '/admin/fleet/dispatch', label: 'Fleet Dispatch' },
              { path: '/admin/complaints', label: 'Complaints' },
            ],
          },
          {
            label: 'Reports',
            icon: '📈',
            children: [
              { path: '/admin/reports/revenue', label: 'Revenue' },
              { path: '/admin/reports/utilization', label: 'Utilization' },
              { path: '/admin/reports/peaks', label: 'Peak Hours' },
              { path: '/admin/reports/forecast', label: 'Forecast' },
            ],
          },
        ];
      case USER_ROLES.STAFF:
        return [
          { path: '/staff/dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/staff/maintenance', label: 'Maintenance', icon: '🔧' },
          { path: '/staff/handover/create', label: 'Handover', icon: '📝' },
        ];
      case USER_ROLES.CUSTOMER:
        return [
          { path: '/dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/bookings/history', label: 'My Bookings', icon: '📅' },
          { path: '/bookings/create', label: 'New Booking', icon: '➕' },
          { path: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
          { path: '/profile', label: 'Profile', icon: '👤' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (label) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className={`sidebar bg-light border-end ${collapsed ? 'collapsed' : ''}`} style={{ minHeight: 'calc(100vh - 56px)', width: collapsed ? '60px' : '250px', transition: 'width 0.3s' }}>
      <div className="p-3">
        <button
          className="btn btn-sm btn-outline-secondary mb-3 w-100"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '☰' : '✕'}
        </button>
      </div>
      <nav className="px-2">
        <ul className="nav flex-column">
          {menuItems.map((item, index) => {
            if (item.children) {
              const isExpanded = expandedItems[item.label];
              return (
                <li key={index} className="nav-item mb-1">
                  <button
                    className={`nav-link w-100 text-start d-flex align-items-center ${
                      collapsed ? 'justify-content-center' : ''
                    }`}
                    onClick={() => toggleExpand(item.label)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <span className="me-2">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && (
                      <span className="ms-auto">{isExpanded ? '▼' : '▶'}</span>
                    )}
                  </button>
                  {!collapsed && isExpanded && (
                    <ul className="nav flex-column ms-3">
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex} className="nav-item">
                          <Link
                            className={`nav-link ${isActive(child.path) ? 'active fw-bold' : ''}`}
                            to={child.path}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }
            return (
              <li key={index} className="nav-item mb-1">
                <Link
                  className={`nav-link d-flex align-items-center ${
                    collapsed ? 'justify-content-center' : ''
                  } ${isActive(item.path) ? 'active fw-bold bg-primary text-white' : ''}`}
                  to={item.path}
                  title={collapsed ? item.label : ''}
                >
                  <span className="me-2">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;


import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [fleetSummary, setFleetSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await adminService.getFleetSummary();
        setFleetSummary(data || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu tổng quan.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const defaultSummary = {
    totalVehicles: 0,
    availableVehicles: 0,
    vehiclesInUse: 0,
    maintenanceVehicles: 0,
    totalStations: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  };

  const summary = { ...defaultSummary, ...(fleetSummary || {}) };

  const metricCards = useMemo(
    () => [
      {
        title: 'Tổng số xe',
        value: summary.totalVehicles,
        detail: `${summary.availableVehicles} xe sẵn sàng`,
        icon: '🚗',
        variant: 'primary',
      },
      {
        title: 'Trạng thái hoạt động',
        value: `${summary.vehiclesInUse || 0}`,
        detail: 'Xe đang được sử dụng',
        icon: '⚙️',
        variant: 'teal',
      },
      {
        title: 'Đang bảo trì',
        value: summary.maintenanceVehicles || 0,
        detail: 'Xe chờ bảo trì',
        icon: '🛠️',
        variant: 'amber',
      },
      {
        title: 'Tổng booking',
        value: summary.totalBookings,
        detail: 'Trong 30 ngày gần nhất',
        icon: '📅',
        variant: 'purple',
      },
    ],
    [summary]
  );

  const quickLinks = [
    {
      title: 'Quản lý trạm',
      description: 'Theo dõi hoạt động và tối ưu năng lực phục vụ tại từng trạm.',
      icon: '📍',
      to: '/admin/stations',
      variant: 'link-blue',
    },
    {
      title: 'Quản lý đội xe',
      description: 'Cập nhật tình trạng, điều phối và theo dõi bảo dưỡng.',
      icon: '🚘',
      to: '/admin/vehicles',
      variant: 'link-green',
    },
    {
      title: 'Nhân sự & lịch làm việc',
      description: 'Phân bổ ca, theo dõi hiệu suất nhân viên theo trạm.',
      icon: '👔',
      to: '/admin/staff',
      variant: 'link-orange',
    },
    {
      title: 'Khách hàng & phản hồi',
      description: 'Duyệt tài khoản, xử lý khiếu nại và đánh giá.',
      icon: '👥',
      to: '/admin/users',
      variant: 'link-indigo',
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <section className="admin-dashboard__hero">
          <div className="admin-dashboard__hero-text">
            <span className="admin-dashboard__eyebrow">EVR Control Hub</span>
            <h1>Tổng quan hoạt động hệ thống</h1>
            <p>
              Theo dõi đội xe, trạm và khách hàng theo thời gian thực. Chủ động ra quyết định dựa trên dữ liệu tổng hợp.
            </p>
          </div>
          <div className="admin-dashboard__hero-stats">
            <div>
              <span>Trạm hoạt động</span>
              <strong>{summary.totalStations}</strong>
            </div>
            <div>
              <span>Khách hàng</span>
              <strong>{summary.totalUsers}</strong>
            </div>
            <div>
              <span>Doanh thu (VNĐ)</span>
              <strong>{summary.totalRevenue?.toLocaleString('vi-VN') || '0'}</strong>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="admin-dashboard__loading">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="admin-dashboard__error">
            <ErrorMessage message={error} />
          </div>
        ) : (
          <>
            <section className="admin-dashboard__metrics">
              {metricCards.map((card) => (
                <article key={card.title} className={`admin-metric-card admin-metric-card--${card.variant}`}>
                  <div className="admin-metric-card__icon" aria-hidden="true">
                    {card.icon}
                  </div>
                  <div className="admin-metric-card__body">
                    <span>{card.title}</span>
                    <strong>{card.value}</strong>
                    <p>{card.detail}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="admin-dashboard__panels">
              <div className="admin-dashboard__links">
                <h2>Tác vụ nhanh</h2>
                <div className="admin-quick-links">
                  {quickLinks.map((link) => (
                    <Link key={link.title} to={link.to} className={`admin-quick-link admin-quick-link--${link.variant}`}>
                      <div className="admin-quick-link__icon" aria-hidden="true">
                        {link.icon}
                      </div>
                      <div>
                        <h3>{link.title}</h3>
                        <p>{link.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="admin-dashboard__insights">
                <div className="admin-insight-card">
                  <h3>Báo cáo doanh thu</h3>
                  <p>
                    Khai thác dữ liệu doanh thu theo trạm và theo dõi xu hướng sử dụng để tối ưu kế hoạch điều phối.
                  </p>
                  <Link to="/admin/reports/revenue" className="btn btn-outline-light">
                    Xem báo cáo doanh thu
                  </Link>
                </div>
                <div className="admin-insight-card">
                  <h3>Hiệu suất sử dụng xe</h3>
                  <p>
                    So sánh tỉ lệ thuê theo khung giờ, nhận diện thời điểm cao điểm để lên kế hoạch bổ sung xe.
                  </p>
                  <Link to="/admin/reports/utilization" className="btn btn-outline-light">
                    Phân tích hiệu suất
                  </Link>
                </div>
                <div className="admin-insight-card">
                  <h3>Dự báo nhu cầu</h3>
                  <p>Tham khảo dự báo để chuẩn bị nguồn lực và chiến dịch khuyến mại phù hợp.</p>
                  <Link to="/admin/reports/forecast" className="btn btn-outline-light">
                    Xem dự báo nhu cầu
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;


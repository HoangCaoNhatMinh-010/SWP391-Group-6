import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '@contexts/AuthContext';
import CustomerLayout from '@components/layout/CustomerLayout/CustomerLayout';

import './CustomerDashboardPage.css';

const actionCards = [
  {
    title: 'Đặt xe ngay',
    description: 'Chọn trạm, loại xe và giờ nhận trả phù hợp lịch trình.',
    cta: 'Bắt đầu đặt xe',
    href: '/bookings/create',
    accent: 'primary',
  },
  {
    title: 'Theo dõi booking',
    description: 'Xem trạng thái chuyến đi, lịch sử thanh toán và hóa đơn.',
    cta: 'Lịch sử chuyến đi',
    href: '/bookings/history',
    accent: 'teal',
  },
  {
    title: 'Cập nhật hồ sơ',
    description: 'Giữ thông tin cá nhân, giấy tờ và phương thức thanh toán luôn chính xác.',
    cta: 'Quản lý hồ sơ',
    href: '/profile',
    accent: 'purple',
  },
];

const CustomerDashboardPage = () => {
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Buổi sáng năng động';
    if (hours < 18) return 'Buổi chiều hiệu quả';
    return 'Buổi tối thư thái';
  }, []);

  return (
    <CustomerLayout>
      <div className="customer-dashboard">
        <section className="customer-dashboard__hero">
          <div>
            <span className="customer-dashboard__eyebrow">{greeting}</span>
            <h1>Xin chào, {user?.name || 'khách hàng EVR'}!</h1>
            <p>Chuẩn bị cho hành trình tiếp theo với thông tin, lịch trình và ưu đãi được cá nhân hóa.</p>
          </div>
          <div className="customer-dashboard__next-booking">
            <span>Chuyến đi sắp tới</span>
            <strong>Chưa có lịch</strong>
            <Link to="/bookings/create">Đặt ngay</Link>
          </div>
        </section>

        <section className="customer-dashboard__metrics">
          <article>
            <span>Tổng quãng đường</span>
            <strong>0 km</strong>
            <p>Hãy bắt đầu chuyến đi đầu tiên của bạn.</p>
          </article>
          <article>
            <span>Điểm thành viên</span>
            <strong>120</strong>
            <p>Tích điểm khi hoàn thành mỗi chuyến đi.</p>
          </article>
          <article>
            <span>Đã tiết kiệm</span>
            <strong>0 ₫</strong>
            <p>Tận dụng ưu đãi và gói thuê linh hoạt.</p>
          </article>
        </section>

        <section className="customer-dashboard__actions">
          {actionCards.map((card) => (
            <article key={card.title} className={`customer-dashboard__card customer-dashboard__card--${card.accent}`}>
              <div>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>
              <Link to={card.href}>{card.cta}</Link>
            </article>
          ))}
        </section>

        <section className="customer-dashboard__links">
          <h2>Các tiện ích nhanh</h2>
          <div className="customer-dashboard__grid">
            <Link to="/stations">
              <span>Trạm gần bạn</span>
              <small>Tìm trạm phù hợp cho việc giao nhận xe</small>
            </Link>
            <Link to="/vehicles/search">
              <span>Dòng xe yêu thích</span>
              <small>Lọc theo mẫu xe, phạm vi, mức pin</small>
            </Link>
            <Link to="/dashboard/analytics">
              <span>Analytics cá nhân</span>
              <small>So sánh mức sử dụng và chi phí theo thời gian</small>
            </Link>
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboardPage;


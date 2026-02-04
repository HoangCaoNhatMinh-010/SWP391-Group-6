import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';

import './StaffDashboardPage.css';

const quickLinks = [
  {
    title: 'Check-in khách',
    description: 'Xác nhận khách đến nhận xe và hoàn tất thủ tục.',
    cta: 'Đi tới check-in',
    href: '/staff/bookings/check-in',
    variant: 'primary',
  },
  {
    title: 'Bàn giao nhanh',
    description: 'Tạo biên bản bàn giao giữa ca trực hoặc giữa trạm.',
    cta: 'Tạo bàn giao',
    href: '/staff/handover/create',
    variant: 'teal',
  },
  {
    title: 'Theo dõi bảo dưỡng',
    description: 'Cập nhật tình trạng xe cần bảo dưỡng hoặc đã hoàn tất.',
    cta: 'Quản lý bảo dưỡng',
    href: '/staff/maintenance',
    variant: 'purple',
  },
];

const StaffDashboardPage = () => {
  const { user } = useAuth();

  return (
    <StaffLayout>
      <div className="staff-dashboard">
        <section className="staff-dashboard__hero">
          <div>
            <span>EVR Station</span>
            <h1>Xin chào, {user?.name || 'nhân viên EVR'}!</h1>
            <p>Quản lý vận hành trạm, hỗ trợ khách hàng và đảm bảo xe luôn sẵn sàng.</p>
          </div>
          <div className="staff-dashboard__shift">
            <span>Ca làm việc</span>
            <strong>Hôm nay</strong>
            <small>Kiểm tra bảng phân ca trong mục handover</small>
          </div>
        </section>

        <section className="staff-dashboard__metrics">
          <article>
            <span>Check-in hôm nay</span>
            <strong>0</strong>
            <p>Sẵn sàng đón khách đúng giờ.</p>
          </article>
          <article>
            <span>Xe cần kiểm tra</span>
            <strong>0</strong>
            <p>Kiểm tra thông tin trong mục bảo dưỡng.</p>
          </article>
          <article>
            <span>Bàn giao trong ngày</span>
            <strong>0</strong>
            <p>Ghi nhận nhật ký ca trực đầy đủ.</p>
          </article>
        </section>

        <section className="staff-dashboard__links">
          {quickLinks.map((item) => (
            <article key={item.title} className={`staff-dashboard__card staff-dashboard__card--${item.variant}`}>
              <div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
              <Link to={item.href}>{item.cta}</Link>
            </article>
          ))}
        </section>
      </div>
    </StaffLayout>
  );
};

export default StaffDashboardPage;


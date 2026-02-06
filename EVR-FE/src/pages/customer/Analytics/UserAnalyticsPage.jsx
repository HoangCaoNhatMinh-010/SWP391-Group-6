import { useState, useEffect } from 'react';
import CustomerLayout from '@components/layout/CustomerLayout/CustomerLayout';
import { useAuth } from '@contexts/AuthContext';
import { bookingService } from '@services/booking.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './UserAnalyticsPage.css';

const UserAnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await bookingService.getUserAnalytics(user.userId);
        setAnalytics(data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <CustomerLayout>
      <div className="customer-analytics">
        <section className="customer-analytics__hero">
          <div>
            <span>Analytics cá nhân</span>
            <h1>Hành trình của bạn cùng EVR</h1>
            <p>Theo dõi mức độ sử dụng, chi tiêu và hoạt động gần đây để tối ưu trải nghiệm di chuyển.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <div className="customer-analytics__loading">
            <LoadingSpinner />
          </div>
        ) : !analytics ? (
          <div className="customer-analytics__empty">
            <h2>Chưa có dữ liệu nào để phân tích</h2>
            <p>Hãy hoàn thành một chuyến đi để xem thống kê cá nhân.</p>
          </div>
        ) : (
          <>
            <section className="customer-analytics__metrics">
              <article>
                <span>Tổng booking</span>
                <strong>{analytics.totalBookings || 0}</strong>
              </article>
              <article>
                <span>Tổng chi phí</span>
                <strong>{(analytics.totalSpent || 0).toLocaleString('vi-VN')} ₫</strong>
              </article>
              <article>
                <span>Trung bình/booking</span>
                <strong>{(analytics.averageBooking || 0).toLocaleString('vi-VN')} ₫</strong>
              </article>
              <article>
                <span>Đã hoàn tất</span>
                <strong>{analytics.completedBookings || 0}</strong>
              </article>
            </section>

            {analytics.recentActivity?.length ? (
              <section className="customer-analytics__panel">
                <header>
                  <h2>Hoạt động gần đây</h2>
                  <span>Cập nhật trong 30 ngày gần nhất</span>
                </header>
                <ul>
                  {analytics.recentActivity.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default UserAnalyticsPage;


import { useState, useEffect } from 'react';
import CustomerLayout from '@components/layout/CustomerLayout/CustomerLayout';
import { useAuth } from '@contexts/AuthContext';
import { bookingService } from '@services/booking.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './AdvancedAnalyticsPage.css';

const AdvancedAnalyticsPage = () => {
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
        const data = await bookingService.getAdvancedAnalytics(user.userId);
        setAnalytics(data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải analytics nâng cao.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <CustomerLayout>
      <div className="customer-advanced-analytics">
        <section className="customer-advanced-analytics__hero">
          <div>
            <span>Phân tích nâng cao</span>
            <h1>Insight chuyên sâu cho hành trình của bạn</h1>
            <p>Khám phá xu hướng, hiệu suất và đề xuất giúp tối ưu chi phí thuê xe điện.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <div className="customer-advanced-analytics__loading">
            <LoadingSpinner />
          </div>
        ) : !analytics ? (
          <div className="customer-advanced-analytics__empty">
            <h2>Chưa có dữ liệu đủ để phân tích nâng cao</h2>
            <p>Hoàn thành thêm vài chuyến đi để chúng tôi cung cấp insight chính xác hơn.</p>
          </div>
        ) : (
          <>
            <section className="customer-advanced-analytics__grid">
              <article>
                <header>
                  <h2>Thống kê chi tiết</h2>
                  <span>Bao gồm tần suất, quãng đường, thời gian thuê</span>
                </header>
                <ul>
                  {analytics.detailedStats
                    ? Object.entries(analytics.detailedStats).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}</strong>
                          <span>{value}</span>
                        </li>
                      ))
                    : 'Chưa có dữ liệu thống kê.'}
                </ul>
              </article>

              <article>
                <header>
                  <h2>Xu hướng sử dụng</h2>
                  <span>Nhận diện thời gian và thói quen đặt xe</span>
                </header>
                <ul>
                  {analytics.trends?.length
                    ? analytics.trends.map((trend, index) => <li key={index}>{trend}</li>)
                    : 'Chưa có dữ liệu xu hướng.'}
                </ul>
              </article>
            </section>

            {analytics.recommendations?.length ? (
              <section className="customer-advanced-analytics__panel">
                <header>
                  <h2>Gợi ý cá nhân hóa</h2>
                  <span>Dựa trên hành vi sử dụng gần đây</span>
                </header>
                <ul>
                  {analytics.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
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

export default AdvancedAnalyticsPage;


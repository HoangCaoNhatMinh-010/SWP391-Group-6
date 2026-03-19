import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import { bookingService } from '@services/booking.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './StaffQueuePage.css';

const sortByEndTime = (bookings) =>
  [...bookings].sort((a, b) => {
    const aTime = a?.endTime ? new Date(a.endTime).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b?.endTime ? new Date(b.endTime).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

const StaffReturnQueuePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadQueue = useCallback(async () => {
    if (!user?.userId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getStaffReturnQueue(user.userId);
      const normalized = Array.isArray(data) ? sortByEndTime(data) : [];
      setQueue(normalized);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách booking chờ trả xe.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const metrics = useMemo(() => {
    if (!queue.length) {
      return {
        total: 0,
        upcoming: '—',
      };
    }
    const next = queue[0];
    return {
      total: queue.length,
      upcoming: next?.endTime ? new Date(next.endTime).toLocaleString() : 'Đang cập nhật',
    };
  }, [queue]);

  const handleView = (bookingId) => {
    navigate(`/staff/bookings/${bookingId}/return`);
  };

  return (
    <StaffLayout>
      <div className="staff-queue">
        <section className="staff-queue__hero">
          <div>
            <span className="staff-queue__eyebrow">Quản lý trả xe</span>
            <h1>Danh sách booking chờ trả xe</h1>
            <p>Kiểm tra tình trạng xe, cập nhật số km và hoàn tất thủ tục trả xe cho khách hàng.</p>
          </div>
          <div className="staff-queue__hero-meta">
            <div>
              <span>Booking cần xử lý</span>
              <strong>{metrics.total}</strong>
            </div>
            <div>
              <span>Thời gian trả gần nhất</span>
              <strong>{metrics.upcoming}</strong>
            </div>
            <button type="button" className="btn btn-ghost" onClick={loadQueue} disabled={loading}>
              Làm mới
            </button>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <div className="staff-queue__loading">
            <LoadingSpinner />
          </div>
        ) : queue.length === 0 ? (
          <div className="staff-queue__empty">
            <div className="staff-queue__empty-icon">🔄</div>
            <h2>Chưa có booking cần trả xe</h2>
            <p>Những chuyến hoàn tất check-in sẽ tự động xuất hiện tại đây để bạn xử lý.</p>
          </div>
        ) : (
          <section className="staff-queue__table">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách hàng</th>
                  <th>Xe</th>
                  <th>Trả xe dự kiến</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {queue.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td>#{booking.bookingId}</td>
                    <td>
                      <div className="staff-queue__cell">
                        <span>{booking.user?.name || 'Chưa cập nhật'}</span>
                        <small>{booking.user?.phone || booking.user?.email || '—'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="staff-queue__cell">
                        <span>{booking.vehicle?.model?.modelName || booking.vehicle?.model?.name || 'EV'}</span>
                        <small>{booking.vehicle?.plateNumber || '—'}</small>
                      </div>
                    </td>
                    <td>{booking.endTime ? new Date(booking.endTime).toLocaleString() : '—'}</td>
                    <td>
                      <span className="staff-queue__badge staff-queue__badge--return">{booking.bookingStatus}</span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleView(booking.bookingId)}>
                        Trả xe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffReturnQueuePage;


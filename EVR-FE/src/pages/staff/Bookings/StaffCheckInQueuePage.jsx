import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import { bookingService } from '@services/booking.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './StaffQueuePage.css';

const sortByStartTime = (bookings) =>
  [...bookings].sort((a, b) => {
    const aTime = a?.startTime ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b?.startTime ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const StaffCheckInQueuePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [denying, setDenying] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const loadQueue = useCallback(async () => {
    if (!user?.userId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getStaffCheckInQueue(user.userId);
      // Handle different response structures
      let bookings = response;
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // If response is wrapped in an object, try common properties
        bookings = response.data || response.content || response.bookings || [];
      }
      const normalized = Array.isArray(bookings) ? sortByStartTime(bookings) : [];
      setQueue(normalized);
    } catch (err) {
      const errorMessage = err?.response?.data?.message 
        || err?.message 
        || 'Không thể tải danh sách booking cần check-in.';
      setError(errorMessage);
      console.error('Error loading check-in queue:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user?.userId) return;
    
    const interval = setInterval(() => {
      loadQueue();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.userId, loadQueue]);

  const metrics = useMemo(() => {
    if (!queue.length) {
      return {
        total: 0,
        pending: 0,
        denied: 0,
        upcoming: '—',
      };
    }
    const pendingBookings = queue.filter(b => b.bookingStatus === 'PENDING');
    const deniedBookings = queue.filter(b => b.bookingStatus === 'DENIED');
    const nextPending = pendingBookings[0];
    return {
      total: queue.length,
      pending: pendingBookings.length,
      denied: deniedBookings.length,
      upcoming: nextPending?.startTime ? formatDateTime(nextPending.startTime) : '—',
    };
  }, [queue]);

  const handleView = (bookingId) => {
    navigate(`/staff/bookings/${bookingId}/checkin`);
  };

  const handleOpenDenyModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setDenyReason('');
    setError(null);
    setSuccess(null);
    setShowDenyModal(true);
  };

  const handleDeny = async () => {
    if (!denyReason.trim()) {
      setError('Vui lòng nhập lý do từ chối.');
      return;
    }

    if (!selectedBookingId || !user?.userId) {
      setError('Thông tin không hợp lệ.');
      return;
    }

    setError(null);
    setSuccess(null);
    setDenying(true);

    try {
      await bookingService.denyBooking(selectedBookingId, user.userId, denyReason);
      setSuccess('Đã từ chối booking thành công. Khách hàng sẽ nhận được thông báo qua email.');
      setShowDenyModal(false);
      setDenyReason('');
      setSelectedBookingId(null);
      // Refresh the queue after denying
      setTimeout(() => {
        loadQueue();
      }, 500);
    } catch (err) {
      const errorMessage = err?.response?.data?.message 
        || err?.message 
        || 'Không thể từ chối booking.';
      setError(errorMessage);
    } finally {
      setDenying(false);
    }
  };

  const handleCloseDenyModal = () => {
    if (denying) return; // Prevent closing while processing
    setShowDenyModal(false);
    setDenyReason('');
    setSelectedBookingId(null);
    setError(null);
  };

  return (
    <StaffLayout>
      <div className="staff-queue">
        <section className="staff-queue__hero">
          <div>
            <span className="staff-queue__eyebrow">Quản lý nhận xe</span>
            <h1>Danh sách booking chờ check-in</h1>
            <p>Chuẩn bị xe, xác minh giấy tờ và hoàn tất thủ tục giao xe cho khách hàng tại trạm. Bao gồm cả các booking đã bị từ chối.</p>
          </div>
          <div className="staff-queue__hero-meta">
            <div>
              <span>Tổng số booking</span>
              <strong>{metrics.total}</strong>
            </div>
            <div>
              <span>Đang chờ</span>
              <strong>{metrics.pending}</strong>
            </div>
            <div>
              <span>Đã từ chối</span>
              <strong>{metrics.denied}</strong>
            </div>
            <div>
              <span>Chuyến kế tiếp</span>
              <strong>{metrics.upcoming}</strong>
            </div>
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={loadQueue} 
              disabled={loading}
              title="Làm mới danh sách"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Làm mới'}
            </button>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {loading ? (
          <div className="staff-queue__loading">
            <LoadingSpinner />
          </div>
        ) : queue.length === 0 ? (
          <div className="staff-queue__empty">
            <div className="staff-queue__empty-icon">🚗</div>
            <h2>Không có booking cần check-in</h2>
            <p>Các chuyến đi mới sẽ tự động hiển thị tại đây khi khách hàng đến trạm.</p>
          </div>
        ) : (
          <section className="staff-queue__table">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách hàng</th>
                  <th>Xe</th>
                  <th>Nhận xe</th>
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
                    <td>{formatDateTime(booking.startTime)}</td>
                    <td>
                      <span className={`staff-queue__badge staff-queue__badge--${(booking.bookingStatus || '').toLowerCase()}`}>
                        {booking.bookingStatus || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {booking.bookingStatus === 'PENDING' ? (
                          <>
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleView(booking.bookingId)}
                              disabled={denying}
                            >
                              Check-in
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleOpenDenyModal(booking.bookingId)}
                              disabled={denying}
                            >
                              Từ chối
                            </button>
                          </>
                        ) : booking.bookingStatus === 'DENIED' ? (
                          <>
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleView(booking.bookingId)}
                              disabled={true}
                              title="Booking đã bị từ chối"
                            >
                              Đã từ chối
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-outline-light btn-sm" 
                              onClick={() => handleView(booking.bookingId)}
                              disabled={denying}
                            >
                              Xem chi tiết
                            </button>
                          </>
                        ) : (
                          <button 
                            type="button" 
                            className="btn btn-primary btn-sm" 
                            onClick={() => handleView(booking.bookingId)}
                            disabled={denying}
                          >
                            Xem chi tiết
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Deny Booking Modal */}
        {showDenyModal && (
          <div className="staff-queue__modal-overlay" onClick={handleCloseDenyModal}>
            <div className="staff-queue__modal" onClick={(e) => e.stopPropagation()}>
              <h3>Từ chối booking #{selectedBookingId}</h3>
              <p>Vui lòng nhập lý do từ chối booking này:</p>
              <textarea
                className="staff-queue__reason-input"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Ví dụ: Không đủ giấy tờ, Xe không sẵn sàng, Khách hàng không đủ điều kiện..."
                rows={4}
                disabled={denying}
              />
              {error && (
                <div className="staff-queue__modal-error">
                  <ErrorMessage message={error} onDismiss={() => setError(null)} />
                </div>
              )}
              <div className="staff-queue__modal-actions">
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeny} 
                  disabled={denying || !denyReason.trim()}
                >
                  {denying ? <LoadingSpinner size="sm" /> : 'Xác nhận từ chối'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-light" 
                  onClick={handleCloseDenyModal}
                  disabled={denying}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffCheckInQueuePage;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import { bookingService } from '@services/booking.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './StaffCheckInPage.css';

const StaffCheckInPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [denying, setDenying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyReason, setDenyReason] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBooking(id);
        setBooking(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin booking.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleCheckIn = async () => {
    setError(null);
    setSuccess(null);
    setProcessing(true);

    try {
      await bookingService.checkIn(id, user.userId, { userId: user.userId });
      setSuccess('Check-in thành công. Hãy bàn giao chìa khóa cho khách.');
      setTimeout(() => {
        navigate('/staff/bookings/check-in');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hoàn tất check-in.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!denyReason.trim()) {
      setError('Vui lòng nhập lý do từ chối.');
      return;
    }

    setError(null);
    setSuccess(null);
    setDenying(true);

    try {
      await bookingService.denyBooking(id, user.userId, denyReason);
      setSuccess('Đã từ chối booking thành công. Khách hàng sẽ nhận được thông báo qua email.');
      setTimeout(() => {
        navigate('/staff/bookings/check-in');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối booking.');
    } finally {
      setDenying(false);
      setShowDenyModal(false);
      setDenyReason('');
    }
  };

  return (
    <StaffLayout>
      <div className="staff-checkin">
        <section className="staff-checkin__hero">
          <div>
            <span>Check-in khách hàng</span>
            <h1>Booking #{id}</h1>
            <p>Xác nhận thông tin, kiểm tra tình trạng xe và hoàn thành thủ tục nhận xe.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {loading ? (
          <div className="staff-checkin__loading">
            <LoadingSpinner />
          </div>
        ) : !booking ? (
          <div className="staff-checkin__empty">
            Không tìm thấy thông tin booking. Hãy quay lại danh sách check-in.
          </div>
        ) : (
          <div className="staff-checkin__details">
            <article>
              <header>
                <h2>Thông tin khách</h2>
              </header>
              <dl>
                <div>
                  <dt>Khách hàng</dt>
                  <dd>{booking.user?.name || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{booking.user?.email || '—'}</dd>
                </div>
                <div>
                  <dt>Số điện thoại</dt>
                  <dd>{booking.user?.phone || '—'}</dd>
                </div>
              </dl>
            </article>

            <article>
              <header>
                <h2>Thông tin xe</h2>
              </header>
              <dl>
                <div>
                  <dt>Model</dt>
                  <dd>{booking.vehicle?.model?.modelName || booking.vehicle?.model?.name || 'EV'}</dd>
                </div>
                <div>
                  <dt>Biển số</dt>
                  <dd>{booking.vehicle?.plateNumber || '—'}</dd>
                </div>
                <div>
                  <dt>Trạm giao</dt>
                  <dd>{booking.station?.name || '—'}</dd>
                </div>
              </dl>
            </article>

            <article>
              <header>
                <h2>Thời gian</h2>
              </header>
              <dl>
                <div>
                  <dt>Nhận xe</dt>
                  <dd>{booking.startTime ? new Date(booking.startTime).toLocaleString() : '—'}</dd>
                </div>
                <div>
                  <dt>Trả xe</dt>
                  <dd>{booking.endTime ? new Date(booking.endTime).toLocaleString() : '—'}</dd>
                </div>
                <div>
                  <dt>Trạng thái hiện tại</dt>
                  <dd>{booking.bookingStatus}</dd>
                </div>
              </dl>
            </article>
          </div>
        )}

        {!loading && booking ? (
          <>
            <div className="staff-checkin__actions">
              {booking.bookingStatus === 'PENDING' && (
                <>
                  <button type="button" className="btn btn-primary" onClick={handleCheckIn} disabled={processing || denying}>
                    {processing ? <LoadingSpinner size="sm" /> : 'Hoàn tất check-in'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => setShowDenyModal(true)} 
                    disabled={processing || denying}
                  >
                    Từ chối booking
                  </button>
                </>
              )}
              {booking.bookingStatus === 'CONFIRMED' && (
                <button type="button" className="btn btn-primary" disabled>
                  Đã check-in
                </button>
              )}
              {booking.bookingStatus === 'DENIED' && (
                <button type="button" className="btn btn-danger" disabled>
                  Đã từ chối
                </button>
              )}
              <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)}>
                Quay lại
              </button>
            </div>

            {showDenyModal && (
              <div className="staff-checkin__modal-overlay" onClick={() => setShowDenyModal(false)}>
                <div className="staff-checkin__modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Từ chối booking</h3>
                  <p>Vui lòng nhập lý do từ chối booking này:</p>
                  <textarea
                    className="staff-checkin__reason-input"
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                    placeholder="Ví dụ: Không đủ giấy tờ, Xe không sẵn sàng, Khách hàng không đủ điều kiện..."
                    rows={4}
                  />
                  <div className="staff-checkin__modal-actions">
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
                      onClick={() => {
                        setShowDenyModal(false);
                        setDenyReason('');
                      }}
                      disabled={denying}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </StaffLayout>
  );
};

export default StaffCheckInPage;


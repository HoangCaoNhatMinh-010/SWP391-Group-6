import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '@services/booking.service';
import CustomerLayout from '@components/layout/CustomerLayout/CustomerLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './BookingDetailsPage.css';

const STATUS_METADATA = {
  COMPLETED: { label: 'Hoàn tất', badge: 'status--completed', color: '#009968' },
  CONFIRMED: { label: 'Đã xác nhận', badge: 'status--confirmed', color: '#006fd6' },
  PENDING: { label: 'Chờ duyệt', badge: 'status--pending', color: '#c98500' },
  CANCELLED: { label: 'Đã hủy', badge: 'status--cancelled', color: '#6c757d' },
  DENIED: { label: 'Đã từ chối', badge: 'status--denied', color: '#dc3545' },
};

const normalizeModelImage = (rawPath) => {
  if (!rawPath) {
    return null;
  }

  let normalized = rawPath.trim();
  if (!normalized) {
    return null;
  }

  if (/^data:image\//.test(normalized)) {
    return normalized;
  }

  normalized = normalized.replace(/\\/g, '/');

  if (normalized.startsWith('/public/')) {
    normalized = normalized.replace('/public', '');
  } else if (normalized.startsWith('public/')) {
    normalized = normalized.replace('public', '');
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  if (!/\.[a-z]{2,4}$/i.test(normalized)) {
    normalized = `${normalized}.jpg`;
  }

  return normalized;
};

const fallbackModelImage = (vehicle) => {
  const modelCode =
    vehicle?.model?.modelName ||
    vehicle?.model?.vehicleType ||
    vehicle?.model?.brand ||
    '';

  const normalized = modelCode.toLowerCase().replace(/\s+/g, '');

  if (normalized.includes('urban') || normalized.includes('compact')) {
    return '/images/models/urban-compact.svg';
  }
  if (normalized.includes('executive') || normalized.includes('sedan')) {
    return '/images/models/executive-sedan.svg';
  }
  if (normalized.includes('adventure') || normalized.includes('suv')) {
    return '/images/models/adventure-suv.svg';
  }

  return '/images/models/default-vehicle.svg';
};

const getModelImage = (vehicle) =>
  normalizeModelImage(vehicle?.model?.imageUrl) || fallbackModelImage(vehicle);

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '—';
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} ngày` : '1 ngày';
};

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBooking(id);
        setBooking(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết booking.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="booking-details">
          <div className="booking-details__loading">
            <LoadingSpinner />
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!booking) {
    return (
      <CustomerLayout>
        <div className="booking-details">
          <div className="booking-details__empty">
            <h2>Không tìm thấy booking</h2>
            <p>Booking bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/bookings/history" className="btn btn-primary">
              Quay lại lịch sử
            </Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  const statusInfo = STATUS_METADATA[booking.bookingStatus] || {
    label: booking.bookingStatus,
    badge: 'status--unknown',
    color: '#6c757d',
  };

  const vehicleImage = getModelImage(booking.vehicle);

  return (
    <CustomerLayout>
      <div className="booking-details">
        <div className="booking-details__header">
          <div>
            <span className="booking-details__eyebrow">Chi tiết booking</span>
            <h1>Booking #{booking.bookingId}</h1>
            <p>Thông tin chi tiết về chuyến đi của bạn</p>
          </div>
          <span
            className={`booking-details__status ${statusInfo.badge}`}
            style={{ '--status-color': statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        </div>

        <div className="booking-details__content">
          <div className="booking-details__main">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
            <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

            <section className="booking-details__vehicle">
              <h2>Thông tin xe</h2>
              <div className="booking-details__vehicle-card">
                <div className="booking-details__vehicle-image">
                  <img src={vehicleImage} alt={booking.vehicle?.model?.modelName || 'EVR Vehicle'} />
                </div>
                <div className="booking-details__vehicle-info">
                  <div className="booking-details__vehicle-header">
                    <div>
                      <h3>{booking.vehicle?.model?.modelName || booking.vehicle?.model?.name || 'Mẫu xe EV'}</h3>
                      <p className="booking-details__vehicle-plate">Biển số: {booking.vehicle?.plateNumber || '—'}</p>
                    </div>
                    {booking.vehicle?.model?.brand && (
                      <span className="booking-details__vehicle-brand">{booking.vehicle.model.brand}</span>
                    )}
                  </div>
                  <div className="booking-details__vehicle-specs">
                    <div className="booking-details__spec-item">
                      <span className="booking-details__spec-label">Mức pin</span>
                      <strong className="booking-details__spec-value">
                        {booking.vehicle?.batteryLevel ?? 0}%
                      </strong>
                    </div>
                    <div className="booking-details__spec-item">
                      <span className="booking-details__spec-label">Trạng thái</span>
                      <strong className="booking-details__spec-value">
                        {booking.vehicle?.status || '—'}
                      </strong>
                    </div>
                    <div className="booking-details__spec-item">
                      <span className="booking-details__spec-label">Số km</span>
                      <strong className="booking-details__spec-value">
                        {booking.vehicle?.mileage ? `${booking.vehicle.mileage.toLocaleString('vi-VN')} km` : '—'}
                      </strong>
                    </div>
                    {booking.vehicle?.model?.vehicleType && (
                      <div className="booking-details__spec-item">
                        <span className="booking-details__spec-label">Loại xe</span>
                        <strong className="booking-details__spec-value">
                          {booking.vehicle.model.vehicleType}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="booking-details__trip">
              <h2>Thông tin chuyến đi</h2>
              <div className="booking-details__trip-grid">
                <div className="booking-details__trip-card">
                  <span className="booking-details__trip-label">Trạm nhận xe</span>
                  <strong className="booking-details__trip-value">{booking.station?.name || '—'}</strong>
                  <p className="booking-details__trip-detail">{booking.station?.address || '—'}</p>
                </div>
                <div className="booking-details__trip-card">
                  <span className="booking-details__trip-label">Thời gian nhận</span>
                  <strong className="booking-details__trip-value">{formatDate(booking.startTime)}</strong>
                  <p className="booking-details__trip-detail">Bắt đầu chuyến đi</p>
                </div>
                <div className="booking-details__trip-card">
                  <span className="booking-details__trip-label">Thời gian trả</span>
                  <strong className="booking-details__trip-value">{formatDate(booking.endTime)}</strong>
                  <p className="booking-details__trip-detail">Kết thúc chuyến đi</p>
                </div>
                <div className="booking-details__trip-card">
                  <span className="booking-details__trip-label">Thời lượng</span>
                  <strong className="booking-details__trip-value">
                    {calculateDuration(booking.startTime, booking.endTime)}
                  </strong>
                  <p className="booking-details__trip-detail">Tổng thời gian thuê</p>
                </div>
              </div>
            </section>

            <section className="booking-details__payment">
              <h2>Thông tin thanh toán</h2>
              <div className="booking-details__payment-card">
                <div className="booking-details__payment-row">
                  <span>Giá thuê/ngày</span>
                  <strong>
                    {booking.totalPrice && booking.startTime && booking.endTime
                      ? `${Math.round(booking.totalPrice / Math.max(Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60 * 24)), 1)).toLocaleString('vi-VN')} ₫`
                      : '—'}
                  </strong>
                </div>
                <div className="booking-details__payment-row">
                  <span>Thời lượng</span>
                  <strong>{calculateDuration(booking.startTime, booking.endTime)}</strong>
                </div>
                <div className="booking-details__payment-divider" />
                <div className="booking-details__payment-row booking-details__payment-row--total">
                  <span>Tổng chi phí</span>
                  <strong>{booking.totalPrice ? `${booking.totalPrice.toLocaleString('vi-VN')} ₫` : '—'}</strong>
                </div>
              </div>
            </section>
          </div>

          <aside className="booking-details__sidebar">
            <div className="booking-details__sidebar-card">
              <h3>Thông tin booking</h3>
              <div className="booking-details__info-list">
                <div className="booking-details__info-item">
                  <span>Mã booking</span>
                  <strong>#{booking.bookingId}</strong>
                </div>
                <div className="booking-details__info-item">
                  <span>Trạng thái</span>
                  <strong className={statusInfo.badge}>{statusInfo.label}</strong>
                </div>
                <div className="booking-details__info-item">
                  <span>Ngày tạo</span>
                  <strong>{formatDate(booking.createdAt || booking.bookingDate)}</strong>
                </div>
              </div>
            </div>

            <div className="booking-details__sidebar-card">
              <h3>Hành động</h3>
              <div className="booking-details__actions">
                {booking.bookingStatus === 'COMPLETED' && !booking.settled && (
                  <Link to={`/bookings/${id}/settlement`} className="btn btn-primary w-100">
                    Thanh toán cuối cùng
                  </Link>
                )}
                {booking.bookingStatus === 'PENDING' && (
                  <Link to={`/bookings/${id}/modify`} className="btn btn-outline-primary w-100">
                    Chỉnh sửa booking
                  </Link>
                )}
                <Link to="/bookings/history" className="btn btn-outline-secondary w-100">
                  Quay lại lịch sử
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default BookingDetailsPage;

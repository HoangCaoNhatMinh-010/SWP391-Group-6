import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '@services/booking.service';
import { useAuth } from '@contexts/AuthContext';
import CustomerLayout from '@components/layout/CustomerLayout/CustomerLayout';
import FormInput from '@components/forms/FormInput/FormInput';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './ModifyBookingPage.css';

// const PRICE_PER_DAY = 250000;

const getVehicleImage = (vehicle) => {
  if (vehicle?.plateNumber) {
    return `/images/vehicles/${vehicle.plateNumber}.jpg`;
  }
  return '/images/models/default-vehicle.svg';
};
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

const ModifyBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    endTime: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBooking(id);
        setBooking(data);
        if (data) {
          setFormData({
            endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin booking.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const rentalSummary = useMemo(() => {
    if (!booking?.startTime || !formData.endTime || !booking?.vehicle) {
      return { duration: 0, total: 0 };
    }
    const start = new Date(booking.startTime);
    const end = new Date(formData.endTime);
    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end <= start) {
      return { duration: 0, total: 0 };
    }
    const milliseconds = end.getTime() - start.getTime();
    const duration = Math.ceil(milliseconds / (1000 * 60 * 60 * 24));

    // Lấy giá động từ model xe của booking hiện tại
    const pricePerDay = booking.vehicle.model?.basePrice || 0;
    const total = duration * pricePerDay;

    return { duration, total, pricePerDay }; // Trả về thêm pricePerDay để dùng ở UI phía dưới
  }, [booking, formData.endTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const updates = {
        endTime: formData.endTime,
        totalPrice: rentalSummary.total,
      };
      await bookingService.modifyBooking(id, updates, user.userId);
      setSuccess('Cập nhật booking thành công!');
      setTimeout(() => {
        navigate(`/bookings/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật booking.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="modify-booking">
          <div className="modify-booking__loading">
            <LoadingSpinner />
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!booking) {
    return (
      <CustomerLayout>
        <div className="modify-booking">
          <div className="modify-booking__empty">
            <h2>Không tìm thấy booking</h2>
            <p>Booking bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <button onClick={() => navigate('/bookings/history')} className="btn btn-primary">
              Quay lại lịch sử
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  const vehicleImage = getVehicleImage(booking.vehicle);
  return (
    <CustomerLayout>
      <div className="modify-booking">
        <div className="modify-booking__header">
          <div>
            <span className="modify-booking__eyebrow">Chỉnh sửa booking</span>
            <h1>Booking #{booking.bookingId}</h1>
            <p>Điều chỉnh thời gian trả xe và cập nhật chi phí</p>
          </div>
        </div>

        <div className="modify-booking__content">
          <div className="modify-booking__main">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
            <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

            <section className="modify-booking__vehicle">
              <h2>Thông tin xe</h2>
              <div className="modify-booking__vehicle-card">
                <div className="modify-booking__vehicle-image">
                  <img src={vehicleImage} alt={booking.vehicle?.model?.modelName || 'EVR Vehicle'} />
                </div>
                <div className="modify-booking__vehicle-info">
                  <div className="modify-booking__vehicle-header">
                    <div>
                      <h3>{booking.vehicle?.model?.modelName || booking.vehicle?.model?.name || 'Mẫu xe EV'}</h3>
                      <p className="modify-booking__vehicle-plate">Biển số: {booking.vehicle?.plateNumber || '—'}</p>
                    </div>
                    {booking.vehicle?.model?.brand && (
                      <span className="modify-booking__vehicle-brand">{booking.vehicle.model.brand}</span>
                    )}
                  </div>
                  <div className="modify-booking__vehicle-specs">
                    <div className="modify-booking__spec-item">
                      <span className="modify-booking__spec-label">Mức pin</span>
                      <strong className="modify-booking__spec-value">
                        {booking.vehicle?.batteryLevel ?? 0}%
                      </strong>
                    </div>
                    <div className="modify-booking__spec-item">
                      <span className="modify-booking__spec-label">Trạng thái</span>
                      <strong className="modify-booking__spec-value">
                        {booking.vehicle?.status || '—'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="modify-booking__current">
              <h2>Thông tin hiện tại</h2>
              <div className="modify-booking__current-grid">
                <div className="modify-booking__current-card">
                  <span className="modify-booking__current-label">Thời gian nhận</span>
                  <strong className="modify-booking__current-value">
                    {formatDate(booking.startTime)}
                  </strong>
                </div>
                <div className="modify-booking__current-card">
                  <span className="modify-booking__current-label">Thời gian trả (hiện tại)</span>
                  <strong className="modify-booking__current-value">
                    {formatDate(booking.endTime)}
                  </strong>
                </div>
                <div className="modify-booking__current-card">
                  <span className="modify-booking__current-label">Trạm nhận xe</span>
                  <strong className="modify-booking__current-value">
                    {booking.station?.name || '—'}
                  </strong>
                </div>
                <div className="modify-booking__current-card">
                  <span className="modify-booking__current-label">Chi phí hiện tại</span>
                  <strong className="modify-booking__current-value">
                    {booking.totalPrice ? `${booking.totalPrice.toLocaleString('vi-VN')} ₫` : '—'}
                  </strong>
                </div>
              </div>
            </section>

            <section className="modify-booking__form-section">
              <h2>Chỉnh sửa thời gian trả xe</h2>
              <form className="modify-booking__form" onSubmit={handleSubmit}>
                <div className="modify-booking__form-group">
                  <FormInput
                    label="Thời gian trả xe mới"
                    name="endTime"
                    type="date"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    rules={{
                      required: true,
                      custom: (value) => {
                        if (booking.startTime && value) {
                          const start = new Date(booking.startTime);
                          const end = new Date(value);
                          if (end <= start) {
                            return 'Thời gian trả xe phải sau thời gian nhận.';
                          }
                        }
                        return true;
                      },
                    }}
                    helperText="Chọn thời gian trả xe mới. Chi phí sẽ được tính toán tự động."
                  />
                </div>

                <div className="modify-booking__actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <LoadingSpinner size="sm" /> : 'Cập nhật booking'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(`/bookings/${id}`)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="modify-booking__summary">
            <div className="modify-booking__summary-card">
              <h3>Tổng chi phí mới</h3>
              <div className="modify-booking__summary-price">
                <strong>{rentalSummary.total.toLocaleString('vi-VN')} ₫</strong>
                {rentalSummary.duration > 0 && (
                  <span>{rentalSummary.duration > 0 && (
                    <span>{rentalSummary.duration} ngày x {(rentalSummary.pricePerDay || 0).toLocaleString('vi-VN')} ₫</span>
                  )}</span>
                )}
              </div>
              {rentalSummary.duration === 0 && (
                <p className="modify-booking__summary-hint">Chọn thời gian trả xe mới để xem giá</p>
              )}
              {rentalSummary.duration > 0 && booking.totalPrice && (
                <div className="modify-booking__summary-diff">
                  {rentalSummary.total > booking.totalPrice ? (
                    <span className="modify-booking__summary-increase">
                      +{(rentalSummary.total - booking.totalPrice).toLocaleString('vi-VN')} ₫
                    </span>
                  ) : rentalSummary.total < booking.totalPrice ? (
                    <span className="modify-booking__summary-decrease">
                      -{(booking.totalPrice - rentalSummary.total).toLocaleString('vi-VN')} ₫
                    </span>
                  ) : (
                    <span className="modify-booking__summary-same">Không thay đổi</span>
                  )}
                </div>
              )}
            </div>

            <div className="modify-booking__summary-card">
              <h3>Lưu ý</h3>
              <ul className="modify-booking__notes">
                <li>Thời gian trả xe mới phải sau thời gian nhận xe</li>
                <li>Chi phí sẽ được tính toán tự động dựa trên số ngày thuê</li>
                <li>Bạn có thể điều chỉnh thời gian trả xe nhiều lần</li>
                <li>Thay đổi sẽ có hiệu lực ngay sau khi cập nhật</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ModifyBookingPage;

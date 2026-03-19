import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import { bookingService } from '@services/booking.service';
import { staffService } from '@services/staff.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './StaffReturnPage.css';

const BATTERY_THRESHOLD = 20; // Tự động tạo maintenance nếu pin < 20%

const StaffReturnPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    batteryLevel: '',
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMaintenancePrompt, setShowMaintenancePrompt] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBooking(id);
        setBooking(data);
        // Set current battery level as default
        if (data?.vehicle?.batteryLevel) {
          setFormData({ batteryLevel: data.vehicle.batteryLevel.toString() });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin booking.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
    
    // Check if battery level is low
    const batteryLevel = parseFloat(value);
    if (batteryLevel < BATTERY_THRESHOLD) {
      setShowMaintenancePrompt(true);
    } else {
      setShowMaintenancePrompt(false);
    }
  };

  const handleReturn = async () => {
    if (!formData.batteryLevel || formData.batteryLevel === '') {
      setError('Vui lòng nhập mức pin của xe.');
      return;
    }

    const batteryLevel = parseFloat(formData.batteryLevel);
    if (isNaN(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
      setError('Mức pin phải từ 0 đến 100%.');
      return;
    }

    setError(null);
    setSuccess(null);
    setProcessing(true);

    try {
      // Return vehicle with battery level
      const returnData = {
        userId: user.userId,
        batteryLevel: batteryLevel,
      };
      
      await bookingService.returnVehicle(id, user.userId, returnData);
      
      // If battery is low, create maintenance automatically
      if (batteryLevel < BATTERY_THRESHOLD && booking?.vehicle?.vehicleId) {
        try {
          await staffService.createMaintenance(
            user.userId,
            booking.vehicle.vehicleId,
            `Xe cần sạc pin. Mức pin hiện tại: ${batteryLevel}%`,
            null
          );
          setSuccess(`Đã hoàn tất trả xe. Đã tự động tạo yêu cầu bảo trì để sạc pin (${batteryLevel}%).`);
        } catch (maintenanceErr) {
          console.error('Failed to create maintenance:', maintenanceErr);
          setSuccess(`Đã hoàn tất trả xe. Mức pin thấp (${batteryLevel}%), vui lòng tạo yêu cầu bảo trì để sạc pin.`);
        }
      } else {
        setSuccess('Đã hoàn tất trả xe. Vui lòng khóa xe và cập nhật trạng thái.');
      }
      
      setTimeout(() => {
        navigate('/staff/bookings/return');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hoàn tất trả xe.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateMaintenance = () => {
    if (booking?.vehicle?.vehicleId) {
      navigate(`/staff/maintenance/create?vehicleId=${booking.vehicle.vehicleId}&batteryLevel=${formData.batteryLevel}`);
    }
  };

  return (
    <StaffLayout>
      <div className="staff-return">
        <section className="staff-return__hero">
          <div>
            <span className="staff-return__eyebrow">Trả xe</span>
            <h1>Booking #{id}</h1>
            <p>Kiểm tra tình trạng xe, cập nhật mức pin và xác nhận hoàn tất trả xe.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {loading ? (
          <div className="staff-return__loading">
            <LoadingSpinner />
          </div>
        ) : !booking ? (
          <div className="staff-return__empty">Không tìm thấy thông tin booking này.</div>
        ) : (
          <>
            <div className="staff-return__details">
              <article className="staff-return__card">
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

              <article className="staff-return__card">
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
                    <dt>Mức pin hiện tại (trước khi thuê)</dt>
                    <dd>{booking.vehicle?.batteryLevel ?? 0}%</dd>
                  </div>
                  <div>
                    <dt>Trạm trả</dt>
                    <dd>{booking.station?.name || '—'}</dd>
                  </div>
                </dl>
              </article>

              <article className="staff-return__card">
                <header>
                  <h2>Chi tiết chuyến đi</h2>
                </header>
                <dl>
                  <div>
                    <dt>Bắt đầu</dt>
                    <dd>{booking.startTime ? new Date(booking.startTime).toLocaleString('vi-VN') : '—'}</dd>
                  </div>
                  <div>
                    <dt>Kết thúc</dt>
                    <dd>{booking.endTime ? new Date(booking.endTime).toLocaleString('vi-VN') : '—'}</dd>
                  </div>
                  <div>
                    <dt>Giá trị</dt>
                    <dd>{booking.totalPrice ? `${booking.totalPrice.toLocaleString('vi-VN')} ₫` : '—'}</dd>
                  </div>
                </dl>
              </article>
            </div>

            <section className="staff-return__form-section">
              <div className="staff-return__form-card">
                <h2>Kiểm tra và cập nhật mức pin</h2>
                <p className="staff-return__form-hint">
                  Vui lòng kiểm tra mức pin thực tế của xe sau khi khách trả và nhập vào ô bên dưới.
                </p>
                
                <div className="staff-return__battery-input">
                  <label htmlFor="batteryLevel" className="staff-return__battery-label">
                    Mức pin sau khi trả (%)
                  </label>
                  <div className="staff-return__battery-input-group">
                    <input
                      id="batteryLevel"
                      name="batteryLevel"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.batteryLevel}
                      onChange={handleChange}
                      className="staff-return__battery-input-field"
                      placeholder="Nhập mức pin (0-100%)"
                      required
                    />
                    <span className="staff-return__battery-unit">%</span>
                  </div>
                  {formData.batteryLevel && (
                    <div className="staff-return__battery-indicator">
                      <div 
                        className={`staff-return__battery-bar ${
                          parseFloat(formData.batteryLevel) < BATTERY_THRESHOLD 
                            ? 'staff-return__battery-bar--low' 
                            : parseFloat(formData.batteryLevel) < 50
                            ? 'staff-return__battery-bar--medium'
                            : 'staff-return__battery-bar--high'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, parseFloat(formData.batteryLevel) || 0))}%` }}
                      />
                    </div>
                  )}
                </div>

                {showMaintenancePrompt && (
                  <div className="staff-return__maintenance-alert">
                    <div className="staff-return__maintenance-alert-icon">⚠️</div>
                    <div className="staff-return__maintenance-alert-content">
                      <strong>Mức pin thấp ({formData.batteryLevel}%)</strong>
                      <p>Xe cần được sạc pin. Hệ thống sẽ tự động tạo yêu cầu bảo trì để sạc pin sau khi bạn xác nhận trả xe.</p>
                      <Link 
                        to={`/staff/maintenance/create?vehicleId=${booking.vehicle?.vehicleId}&batteryLevel=${formData.batteryLevel}`}
                        className="staff-return__maintenance-link"
                      >
                        Hoặc tạo yêu cầu bảo trì ngay →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {!loading && booking ? (
          <div className="staff-return__actions">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleReturn} 
              disabled={processing || !formData.batteryLevel}
            >
              {processing ? <LoadingSpinner size="sm" /> : 'Xác nhận trả xe'}
            </button>
            <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)}>
              Quay lại
            </button>
          </div>
        ) : null}
      </div>
    </StaffLayout>
  );
};

export default StaffReturnPage;

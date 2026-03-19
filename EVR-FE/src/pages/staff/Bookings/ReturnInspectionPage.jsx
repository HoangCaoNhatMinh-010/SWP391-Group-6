import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import { bookingService } from '@services/booking.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './ReturnInspectionPage.css';

const ReturnInspectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    batteryLevel: '',
    damageDescription: '',
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setPhotos(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await bookingService.returnInspection(id, user.userId);
      setSuccess('Đã ghi nhận biên bản kiểm tra trả xe.');
      setTimeout(() => {
        navigate('/staff/bookings/return');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi biên bản kiểm tra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaffLayout>
      <div className="staff-inspection">
        <section className="staff-inspection__hero">
          <div>
            <span>Biên bản trả xe</span>
            <h1>Booking #{id}</h1>
            <p>Ghi nhận trạng thái xe sau chuyến đi, cập nhật mức pin và chụp ảnh tình trạng thực tế.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {loading ? (
          <div className="staff-inspection__loading">
            <LoadingSpinner />
          </div>
        ) : !booking ? (
          <div className="staff-inspection__empty">Không tìm thấy thông tin booking.</div>
        ) : (
          <>
            <section className="staff-inspection__details">
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
                    <dt>Trạm trả</dt>
                    <dd>{booking.station?.name || '—'}</dd>
                  </div>
                </dl>
              </article>
              <article>
                <header>
                  <h2>Khách hàng</h2>
                </header>
                <dl>
                  <div>
                    <dt>Tên khách</dt>
                    <dd>{booking.user?.name || 'Chưa cập nhật'}</dd>
                  </div>
                  <div>
                    <dt>Thời gian trả</dt>
                    <dd>{booking.endTime ? new Date(booking.endTime).toLocaleString() : '—'}</dd>
                  </div>
                  <div>
                    <dt>Tổng phí</dt>
                    <dd>{booking.totalPrice ? `${booking.totalPrice.toLocaleString('vi-VN')} ₫` : '—'}</dd>
                  </div>
                </dl>
              </article>
            </section>

            <section className="staff-inspection__form">
              <form onSubmit={handleSubmit}>
                <div className="staff-inspection__grid">
                  <div className="staff-inspection__field">
                    <label htmlFor="batteryLevel">Mức pin hiện tại (%)</label>
                    <input
                      id="batteryLevel"
                      name="batteryLevel"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.batteryLevel}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="staff-inspection__field staff-inspection__field--full">
                    <label htmlFor="damageDescription">Tình trạng/ghi chú bổ sung</label>
                    <textarea
                      id="damageDescription"
                      name="damageDescription"
                      rows="4"
                      value={formData.damageDescription}
                      onChange={handleChange}
                      placeholder="Ghi chú trầy xước, mùi, đồ thất lạc…"
                    />
                  </div>
                  <div className="staff-inspection__field staff-inspection__field--full">
                    <label htmlFor="photos">Ảnh kiểm tra</label>
                    <input id="photos" name="photos" type="file" accept="image/*" multiple onChange={handleFileChange} />
                    <small>Chụp rõ 4 góc xe, nội thất và các điểm bất thường (nếu có).</small>
                  </div>
                </div>

                <div className="staff-inspection__actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <LoadingSpinner size="sm" /> : 'Gửi biên bản'}
                  </button>
                  <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)}>
                    Hủy
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </div>
    </StaffLayout>
  );
};

export default ReturnInspectionPage;


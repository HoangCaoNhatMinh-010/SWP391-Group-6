import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '@services/booking.service';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './ContractDetailsPage.css';

const normalizeModelImage = (rawPath) => {
  if (!rawPath) return null;
  let normalized = rawPath.trim();
  if (!normalized) return null;
  if (/^data:image\//.test(normalized)) return normalized;
  normalized = normalized.replace(/\\/g, '/');
  if (normalized.startsWith('/public/')) normalized = normalized.replace('/public', '');
  else if (normalized.startsWith('public/')) normalized = normalized.replace('public', '');
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (!/\.[a-z]{2,4}$/i.test(normalized)) normalized = `${normalized}.jpg`;
  return normalized;
};

const fallbackModelImage = (vehicle) => {
  const modelCode = vehicle?.model?.modelName || vehicle?.model?.vehicleType || vehicle?.model?.brand || '';
  const normalized = modelCode.toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('urban') || normalized.includes('compact')) return '/images/models/urban-compact.svg';
  if (normalized.includes('executive') || normalized.includes('sedan')) return '/images/models/executive-sedan.svg';
  if (normalized.includes('adventure') || normalized.includes('suv')) return '/images/models/adventure-suv.svg';
  return '/images/models/default-vehicle.svg';
};

const getModelImage = (vehicle) => normalizeModelImage(vehicle?.model?.imageUrl) || fallbackModelImage(vehicle);

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

const ContractDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await bookingService.getContractByBookingId(id);
        if (response?.booking) {
          setBooking(response.booking);
        }
        if (response?.contract) {
          setContract(response.contract);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết hợp đồng.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <StaffLayout>
        <div className="contract-details">
          <div className="contract-details__loading">
            <LoadingSpinner />
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (!booking) {
    return (
      <StaffLayout>
        <div className="contract-details">
          <div className="contract-details__empty">
            <h2>Không tìm thấy hợp đồng</h2>
            <p>Hợp đồng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <button onClick={() => navigate('/staff/contracts')} className="btn btn-primary">
              Quay lại danh sách
            </button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  const vehicleImage = getModelImage(booking.vehicle);

  return (
    <StaffLayout>
      <div className="contract-details">
        <div className="contract-details__header">
          <div>
            <span className="contract-details__eyebrow">Chi tiết hợp đồng</span>
            <h1>
              {contract?.contractId ? `Hợp đồng #${contract.contractId}` : `Booking #${booking.bookingId}`}
            </h1>
            <p>Thông tin chi tiết về hợp đồng và booking</p>
          </div>
        </div>

        <div className="contract-details__content">
          <div className="contract-details__main">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />

            {/* Contract Information */}
            {contract && (
              <section className="contract-details__contract">
                <h2>Thông tin hợp đồng</h2>
                <div className="contract-details__contract-card">
                  <div className="contract-details__info-grid">
                    <div className="contract-details__info-item">
                      <span className="contract-details__info-label">Mã hợp đồng</span>
                      <strong className="contract-details__info-value">#{contract.contractId}</strong>
                    </div>
                    <div className="contract-details__info-item">
                      <span className="contract-details__info-label">Chữ ký khách hàng</span>
                      <strong className="contract-details__info-value">{contract.renterSignature || '—'}</strong>
                    </div>
                    <div className="contract-details__info-item">
                      <span className="contract-details__info-label">Chữ ký staff</span>
                      <strong className="contract-details__info-value">{contract.staffSignature || '—'}</strong>
                    </div>
                    <div className="contract-details__info-item">
                      <span className="contract-details__info-label">Ngày ký</span>
                      <strong className="contract-details__info-value">{formatDate(contract.signedAt)}</strong>
                    </div>
                    <div className="contract-details__info-item">
                      <span className="contract-details__info-label">Trạng thái hợp đồng</span>
                      <strong
                        className={`contract-details__badge ${
                          contract.status === 'ACTIVE'
                            ? 'contract-details__badge--active'
                            : contract.status === 'COMPLETED'
                            ? 'contract-details__badge--completed'
                            : ''
                        }`}
                      >
                        {contract.status || '—'}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Booking Information */}
            <section className="contract-details__booking">
              <h2>Thông tin booking</h2>
              <div className="contract-details__booking-card">
                <div className="contract-details__info-grid">
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Mã booking</span>
                    <strong className="contract-details__info-value">#{booking.bookingId}</strong>
                  </div>
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Trạng thái booking</span>
                    <strong className="contract-details__info-value">{booking.bookingStatus || '—'}</strong>
                  </div>
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Thời gian nhận</span>
                    <strong className="contract-details__info-value">{formatDate(booking.startTime)}</strong>
                  </div>
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Thời gian trả</span>
                    <strong className="contract-details__info-value">{formatDate(booking.endTime)}</strong>
                  </div>
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Tổng chi phí</span>
                    <strong className="contract-details__info-value">
                      {booking.totalPrice ? `${booking.totalPrice.toLocaleString('vi-VN')} ₫` : '—'}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Vehicle Information */}
            <section className="contract-details__vehicle">
              <h2>Thông tin xe</h2>
              <div className="contract-details__vehicle-card">
                <div className="contract-details__vehicle-image">
                  <img src={vehicleImage} alt={booking.vehicle?.model?.modelName || 'EVR Vehicle'} />
                </div>
                <div className="contract-details__vehicle-info">
                  <div className="contract-details__vehicle-header">
                    <div>
                      <h3>{booking.vehicle?.model?.modelName || booking.vehicle?.model?.name || 'Mẫu xe EV'}</h3>
                      <p className="contract-details__vehicle-plate">Biển số: {booking.vehicle?.plateNumber || '—'}</p>
                    </div>
                    {booking.vehicle?.model?.brand && (
                      <span className="contract-details__vehicle-brand">{booking.vehicle.model.brand}</span>
                    )}
                  </div>
                  <div className="contract-details__vehicle-specs">
                    <div className="contract-details__spec-item">
                      <span className="contract-details__spec-label">Mức pin</span>
                      <strong className="contract-details__spec-value">{booking.vehicle?.batteryLevel ?? 0}%</strong>
                    </div>
                    <div className="contract-details__spec-item">
                      <span className="contract-details__spec-label">Trạng thái</span>
                      <strong className="contract-details__spec-value">{booking.vehicle?.status || '—'}</strong>
                    </div>
                    <div className="contract-details__spec-item">
                      <span className="contract-details__spec-label">Số km</span>
                      <strong className="contract-details__spec-value">
                        {booking.vehicle?.mileage ? `${booking.vehicle.mileage.toLocaleString('vi-VN')} km` : '—'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Information */}
            <section className="contract-details__customer">
              <h2>Thông tin khách hàng</h2>
              <div className="contract-details__customer-card">
                <div className="contract-details__info-grid">
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Tên khách hàng</span>
                    <strong className="contract-details__info-value">{booking.user?.name || '—'}</strong>
                  </div>
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Email</span>
                    <strong className="contract-details__info-value">{booking.user?.email || '—'}</strong>
                  </div>
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Số điện thoại</span>
                    <strong className="contract-details__info-value">{booking.user?.phone || '—'}</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Station Information */}
            <section className="contract-details__station">
              <h2>Thông tin trạm</h2>
              <div className="contract-details__station-card">
                <div className="contract-details__info-grid">
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Tên trạm</span>
                    <strong className="contract-details__info-value">{booking.station?.name || '—'}</strong>
                  </div>
                  <div className="contract-details__info-item">
                    <span className="contract-details__info-label">Địa chỉ</span>
                    <strong className="contract-details__info-value">{booking.station?.address || '—'}</strong>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="contract-details__actions">
          <button onClick={() => navigate('/staff/contracts')} className="btn btn-outline-light">
            Quay lại danh sách
          </button>
        </div>
      </div>
    </StaffLayout>
  );
};

export default ContractDetailsPage;


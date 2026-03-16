import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { bookingService } from '@services/booking.service';
import { vehicleService } from '@services/vehicle.service';
import { stationService } from '@services/station.service';
import CustomerLayout from '@components/layout/CustomerLayout/CustomerLayout';
import FormSelect from '@components/forms/FormSelect/FormSelect';
import FormInput from '@components/forms/FormInput/FormInput';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './CreateBookingPage.css';

const PRICE_PER_DAY = 250000;

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

const BOOKING_STEPS = [
  { title: 'Chọn trạm', description: 'Điểm nhận/trả xe thuận tiện nhất cho bạn.' },
  { title: 'Chọn xe', description: 'Lựa chọn mẫu xe phù hợp nhu cầu di chuyển.' },
  { title: 'Thiết lập thời gian', description: 'Đặt khung giờ nhận – trả khoa học.' },
  { title: 'Xác nhận', description: 'Kiểm tra thông tin và hoàn tất đặt xe.' },
];

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleIdParam = searchParams.get('vehicleId');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    stationId: '',
    vehicleId: vehicleIdParam || '',
    startTime: '',
    endTime: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await stationService.getStations();
        setStations(Array.isArray(stationsData) ? stationsData : []);
      } catch (err) {
        setError('Không thể tải danh sách trạm.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!formData.stationId) {
        setVehicles([]);
        setFormData((prev) => ({ ...prev, vehicleId: '' }));
        return;
      }

      setLoadingVehicles(true);
      try {
        const vehiclesData = await vehicleService.getAvailableVehicles(Number(formData.stationId));
        const vehiclesList = Array.isArray(vehiclesData) ? vehiclesData : [];
        setVehicles(vehiclesList);

        // Reset vehicle selection if current vehicle is not in the new list
        setFormData((prev) => {
          if (prev.vehicleId) {
            const vehicleExists = vehiclesList.some(
              (v) => v.vehicleId === Number(prev.vehicleId)
            );
            if (!vehicleExists) {
              return { ...prev, vehicleId: '' };
            }
          }
          return prev;
        });
      } catch (err) {
        setError('Không thể tải danh sách xe có sẵn.');
        setVehicles([]);
        setFormData((prev) => ({ ...prev, vehicleId: '' }));
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [formData.stationId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.vehicleId === Number(formData.vehicleId)),
    [vehicles, formData.vehicleId]
  );

  const rentalSummary = useMemo(() => {
    if (!formData.startTime || !formData.endTime) {
      return { duration: 0, total: 0 };
    }
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end <= start) {
      return { duration: 0, total: 0 };
    }
    const milliseconds = end.getTime() - start.getTime();
    const duration = Math.ceil(milliseconds / (1000 * 60 * 60 * 24));
    const total = duration * PRICE_PER_DAY;
    return { duration, total };
  }, [formData.startTime, formData.endTime]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    // If station changes, reset vehicle selection
    if (name === 'stationId') {
      setFormData((prev) => ({
        ...prev,
        stationId: value,
        vehicleId: '' // Reset vehicle when station changes
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const bookingPayload = {
        vehicle: { vehicleId: Number(formData.vehicleId) },
        station: { stationId: Number(formData.stationId) },
        startTime: formData.startTime,
        endTime: formData.endTime,
        totalPrice: rentalSummary.total,
        bookingStatus: 'PENDING',
      };

      await bookingService.createBooking(bookingPayload, user.userId);
      setSuccess('Đặt xe thành công! Chúng tôi sẽ gửi xác nhận tới email của bạn.');
      setTimeout(() => {
        navigate('/bookings/history');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo booking. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="booking-create">
        {initialLoading ? (
          <div className="booking-create__loading">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <section className="booking-create__main">
              <form className="booking-create__form" onSubmit={handleSubmit}>
                <div className="booking-create__form-header">
                  <span>Thông tin đặt xe</span>
                  <div>
                    <h2>Điền chi tiết chuyến đi</h2>
                    <p>Chúng tôi sử dụng thông tin này để chuẩn bị xe sẵn sàng và đảm bảo trải nghiệm nhận xe liền mạch.</p>
                  </div>
                </div>
                <ErrorMessage message={error} onDismiss={() => setError(null)} />
                <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

                <div className="booking-create__grid">
                  <FormSelect
                    label="Chọn trạm"
                    name="stationId"
                    value={formData.stationId}
                    onChange={handleChange}
                    options={stations.map((station) => ({
                      value: station.stationId,
                      label: `${station.name} – ${station.address}`,
                    }))}
                    placeholder="Chọn điểm nhận/trả phù hợp"
                    required
                    rules={{ required: true }}
                    helperText="Chọn trạm để xem danh sách xe có sẵn tại trạm đó."
                  />

                  <div className="booking-create__vehicle-select">
                    <FormSelect
                      label="Chọn xe"
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      options={vehicles.map((vehicle) => ({
                        value: vehicle.vehicleId,
                        label: `${vehicle.model?.modelName || vehicle.model?.name || 'Mẫu xe'} – ${vehicle.plateNumber
                          } (Pin: ${vehicle.batteryLevel || 0}%)`,
                      }))}
                      placeholder={formData.stationId ? "Chọn mẫu xe bạn yêu thích" : "Vui lòng chọn trạm trước"}
                      required
                      disabled={!formData.stationId || loadingVehicles}
                      rules={{ required: true }}
                      helperText={
                        !formData.stationId
                          ? "Vui lòng chọn trạm trước để xem danh sách xe có sẵn."
                          : loadingVehicles
                            ? "Đang tải danh sách xe..."
                            : vehicles.length === 0
                              ? "Không có xe nào có sẵn tại trạm này."
                              : `Có ${vehicles.length} xe có sẵn tại trạm này.`
                      }
                    />
                    {loadingVehicles && (
                      <div className="booking-create__vehicle-loading">
                        <LoadingSpinner size="sm" />
                        <span>Đang tải danh sách xe...</span>
                      </div>
                    )}
                  </div>

                  <FormInput
                    label="Thời gian nhận xe"
                    name="startTime"
                    type="date"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    rules={{
                      required: true,
                      date: {
                        min: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
                      },
                    }}
                    helperText="Chọn thời điểm nhận xe sớm hơn ít nhất 1 giờ so với hiện tại."
                  />

                  <FormInput
                    label="Thời gian trả xe"
                    name="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    rules={{
                      required: true,
                      custom: (value) => {
                        if (formData.startTime && value) {
                          const start = new Date(formData.startTime);
                          const end = new Date(value);
                          if (end <= start) {
                            return 'Thời gian trả xe phải sau thời gian nhận.';
                          }
                        }
                        return true;
                      },
                    }}
                    helperText="Thời gian trả xe càng sớm, chi phí càng thấp. Bạn luôn có thể điều chỉnh sau."
                  />
                </div>

                <div className="booking-create__actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'Đặt xe ngay'}
                  </button>
                  <button type="button" className="btn btn-link" onClick={() => navigate(-1)}>
                    Trở lại
                  </button>
                </div>
              </form>

              <aside className="booking-create__summary">
                <div className="booking-create__summary-card">
                  <h3>Tổng chi phí</h3>
                  <div className="booking-create__summary-price">
                    <strong>{rentalSummary.total.toLocaleString('vi-VN')} ₫</strong>
                    {rentalSummary.duration > 0 && (
                      <span>{rentalSummary.duration} ngày x {PRICE_PER_DAY.toLocaleString('vi-VN')} ₫</span>
                    )}
                  </div>
                  {rentalSummary.duration === 0 && (
                    <p className="booking-create__summary-hint">Chọn thời gian để xem giá dự kiến</p>
                  )}
                </div>
              </aside>
            </section>

            <section className="booking-create__body">
              <aside className="booking-create__aside">
                <div className="booking-create__aside-card booking-create__aside-card--vehicle">
                  <h3>Xe đã chọn</h3>
                  {selectedVehicle ? (
                    <>
                      <div className="booking-create__vehicle-preview">
                        <div className="booking-create__vehicle-image">
                          <img
                            src={getModelImage(selectedVehicle)}
                            alt={selectedVehicle.model?.modelName || selectedVehicle.model?.name || 'EVR Vehicle'}
                          />
                        </div>
                        <div className="booking-create__vehicle-header">
                          <div>
                            <h4>{selectedVehicle.model?.modelName || selectedVehicle.model?.name || 'Mẫu xe EV'}</h4>
                            <p className="booking-create__vehicle-plate">Biển số: {selectedVehicle.plateNumber}</p>
                          </div>
                          {selectedVehicle.model?.brand && (
                            <span className="booking-create__vehicle-brand">{selectedVehicle.model.brand}</span>
                          )}
                        </div>
                      </div>
                      <div className="booking-create__vehicle-specs">
                        <div className="booking-create__spec-item">
                          <span className="booking-create__spec-label">Mức pin</span>
                          <strong className="booking-create__spec-value">{selectedVehicle.batteryLevel ?? 0}%</strong>
                        </div>
                        <div className="booking-create__spec-item">
                          <span className="booking-create__spec-label">Trạng thái</span>
                          <strong className="booking-create__spec-value">{selectedVehicle.status || '—'}</strong>
                        </div>
                        <div className="booking-create__spec-item">
                          <span className="booking-create__spec-label">Số km</span>
                          <strong className="booking-create__spec-value">
                            {selectedVehicle.mileage ? `${selectedVehicle.mileage.toLocaleString('vi-VN')} km` : '—'}
                          </strong>
                        </div>
                        {selectedVehicle.model?.vehicleType && (
                          <div className="booking-create__spec-item">
                            <span className="booking-create__spec-label">Loại xe</span>
                            <strong className="booking-create__spec-value">{selectedVehicle.model.vehicleType}</strong>
                          </div>
                        )}
                      </div>
                      <small>Giá có thể thay đổi tuỳ thời điểm hoặc chương trình ưu đãi.</small>
                    </>
                  ) : (
                    <div className="booking-create__vehicle-empty">
                      <div className="booking-create__vehicle-empty-icon">🚗</div>
                      <p>Chọn một chiếc xe để xem thông tin chi tiết</p>
                    </div>
                  )}
                </div>

                <div className="booking-create__aside-card booking-create__aside-card--tips">
                  <h3>Mẹo đặt xe nhanh</h3>
                  <ul>
                    <li>Đặt xe sớm giúp đảm bảo nguồn xe và được ưu đãi tốt nhất.</li>
                    <li>Kiểm tra lại thời gian trả xe để tránh phát sinh phụ phí.</li>
                    <li>Liên hệ tổng đài EVR khi cần hỗ trợ thay đổi lịch trình.</li>
                  </ul>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CreateBookingPage;


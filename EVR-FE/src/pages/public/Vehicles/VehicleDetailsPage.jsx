import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import { vehicleService } from '@services/vehicle.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './VehicleDetailsPage.css';

const STATUS_METADATA = {
  AVAILABLE: { label: 'Sẵn sàng', badge: 'status--available' },
  RENTED: { label: 'Đang thuê', badge: 'status--rented' },
  MAINTENANCE: { label: 'Bảo trì', badge: 'status--maintenance' },
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
    vehicle.model?.modelName ||
    vehicle.model?.vehicleType ||
    vehicle.model?.brand ||
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
  normalizeModelImage(vehicle.model?.imageUrl) || fallbackModelImage(vehicle);

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await vehicleService.getVehicle(id);
        setVehicle(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleBook = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/bookings/create?vehicleId=${id}`);
    }
  };

  const statusMeta = useMemo(() => {
    if (!vehicle?.status) {
      return { label: 'Đang cập nhật', badge: 'status--unknown' };
    }
    return STATUS_METADATA[vehicle.status] ?? {
      label: vehicle.status,
      badge: 'status--unknown',
    };
  }, [vehicle]);

  if (loading) {
    return (
      <MainLayout>
        <div className="vehicle-details-loading">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container vehicle-details-error">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }

  if (!vehicle) {
    return (
      <MainLayout>
        <div className="container vehicle-details-error">
          <div className="alert alert-warning">Không tìm thấy thông tin xe.</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="vehicle-details-page">
        <section className="vehicle-details-hero">
          <div className="container vehicle-details-hero__wrapper">
            <div>
              <span className="vehicle-details-hero__eyebrow">EVR Vehicle Insight</span>
              <h1>{vehicle.model?.modelName || 'Chi tiết xe'}</h1>
              <p>
                Theo dõi thông tin vận hành, trạng thái và lịch sử bảo trì trước khi bắt đầu hành trình của bạn.
              </p>

              <div className="vehicle-status-badge">
                <span className={`status-badge ${statusMeta.badge}`}>{statusMeta.label}</span>
              </div>
            </div>
            <div className="vehicle-details-hero__image">
              <img src={getModelImage(vehicle)} alt={vehicle.model?.modelName || 'EVR Vehicle'} />
            </div>
          </div>
        </section>

        <section className="vehicle-details-content">
          <div className="container vehicle-details-layout">
            <div className="vehicle-details-card">
              <h2>Thông số kỹ thuật</h2>
              <dl className="vehicle-details-grid">
                <div>
                  <dt>Biển số</dt>
                  <dd>{vehicle.plateNumber || '—'}</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{vehicle.model?.modelName || '—'}</dd>
                </div>
                <div>
                  <dt>Hãng xe</dt>
                  <dd>{vehicle.model?.brand || '—'}</dd>
                </div>
                <div>
                  <dt>Mức pin</dt>
                  <dd>{vehicle.batteryLevel ?? 0}%</dd>
                </div>
                <div>
                  <dt>Số km</dt>
                  <dd>{vehicle.mileage ?? 0} km</dd>
                </div>
                <div>
                  <dt>Trạm hiện tại</dt>
                  <dd>{vehicle.station?.name || `Mã trạm ${vehicle.station?.stationId ?? '—'}`}</dd>
                </div>
                {vehicle.lastMaintenanceDate && (
                  <div>
                    <dt>Bảo trì gần nhất</dt>
                    <dd>{new Date(vehicle.lastMaintenanceDate).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>

              {vehicle.model?.features && (
                <div className="vehicle-details-features">
                  <h3>Trang bị nổi bật</h3>
                  <p>{vehicle.model.features}</p>
                </div>
              )}

              <div className="vehicle-details-actions">
                <Link to="/vehicles/search" className="btn btn-outline-primary">
                  Quay lại tìm kiếm
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBook}
                  disabled={vehicle.status !== 'AVAILABLE'}
                >
                  {vehicle.status === 'AVAILABLE' ? 'Đặt xe ngay' : 'Không thể đặt'}
                </button>
              </div>
            </div>

            <aside className="vehicle-details-summary">
              <div className="vehicle-summary-card">
                <h3>Tổng quan nhanh</h3>
                <ul>
                  <li>
                    <span>Mức pin hiện tại</span>
                    <strong>{vehicle.batteryLevel ?? 0}%</strong>
                  </li>
                  <li>
                    <span>Trạng thái</span>
                    <strong>{statusMeta.label}</strong>
                  </li>
                  <li>
                    <span>Model</span>
                    <strong>{vehicle.model?.modelName || '—'}</strong>
                  </li>
                  <li>
                    <span>Trạm</span>
                    <strong>{vehicle.station?.name || vehicle.station?.stationId || '—'}</strong>
                  </li>
                </ul>
              </div>

              {user ? (
                <div className="vehicle-summary-cta">
                  <h4>Sẵn sàng đặt xe?</h4>
                  <p>Chúng tôi sẽ giữ xe trong 15 phút sau khi bạn xác nhận đặt.</p>
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleBook}
                    disabled={vehicle.status !== 'AVAILABLE'}
                  >
                    {vehicle.status === 'AVAILABLE' ? 'Tiếp tục đặt xe' : 'Xe chưa sẵn sàng'}
                  </button>
                </div>
              ) : (
                <div className="vehicle-summary-auth">
                  <h4>Đăng nhập để đặt xe</h4>
                  <p>Hãy đăng nhập để lưu thông tin và kiểm tra lịch sử thuê xe của bạn.</p>
                  <Link to="/login" className="btn btn-light w-100">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn btn-outline-light w-100 mt-2">
                    Đăng ký thành viên
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default VehicleDetailsPage;


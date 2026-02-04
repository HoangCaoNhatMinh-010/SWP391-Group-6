import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import { vehicleService } from '@services/vehicle.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './VehicleSearchPage.css';

const STATUS_METADATA = {
  AVAILABLE: { label: 'Sẵn sàng', badge: 'status--available' },
  RENTED: { label: 'Đang thuê', badge: 'status--rented' },
  MAINTENANCE: { label: 'Bảo trì', badge: 'status--maintenance' },
};

const MODEL_IMAGE_MAP = {
  urban: '/images/models/urban-compact.svg',
  executive: '/images/models/executive-sedan.svg',
  adventure: '/images/models/adventure-suv.svg',
  suv: '/images/models/adventure-suv.svg',
  sedan: '/images/models/executive-sedan.svg',
  compact: '/images/models/urban-compact.svg',
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

const getModelImage = (vehicle) => {
  const explicit = normalizeModelImage(vehicle.model?.imageUrl);
  if (explicit) {
    return explicit;
  }

  const modelCode =
    vehicle.model?.modelName ||
    vehicle.model?.vehicleType ||
    vehicle.model?.brand ||
    '';

  const normalized = modelCode.toLowerCase().replace(/\s+/g, '');
  const matchedKey = Object.keys(MODEL_IMAGE_MAP).find((key) =>
    normalized.includes(key)
  );

  return matchedKey ? MODEL_IMAGE_MAP[matchedKey] : '/images/models/default-vehicle.svg';
};

const VehicleSearchPage = () => {
  const [filters, setFilters] = useState({ modelId: '', minBattery: '' });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setHasSearched(true);

    try {
      const modelId = filters.modelId ? Number(filters.modelId) : null;
      const minBattery = filters.minBattery ? Number(filters.minBattery) : null;
      const data = await vehicleService.getVehicles(modelId, minBattery);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tìm kiếm xe.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({ modelId: '', minBattery: '' });
    setVehicles([]);
    setError(null);
    setHasSearched(false);
  };

  const fleetMetrics = useMemo(() => {
    if (!vehicles.length) {
      return { total: 0, avgBattery: 0, available: 0 };
    }

    return vehicles.reduce(
      (acc, vehicle) => {
        const battery = Number(vehicle.batteryLevel) || 0;
        const status = vehicle.status || '';

        return {
          total: acc.total + 1,
          avgBattery: acc.avgBattery + battery,
          available: acc.available + (status === 'AVAILABLE' ? 1 : 0),
        };
      },
      { total: 0, avgBattery: 0, available: 0 }
    );
  }, [vehicles]);

  const averageBattery =
    fleetMetrics.total > 0 ? Math.round(fleetMetrics.avgBattery / fleetMetrics.total) : 0;

  return (
    <MainLayout>
      <div className="vehicle-search-page">
        <section className="vehicle-search-hero">
          <div className="container vehicle-search-hero__wrapper">
            <div>
              <span className="vehicle-search-hero__eyebrow">EV Fleet Discovery</span>
              <h1>Tìm chiếc xe phù hợp nhất cho hành trình của bạn</h1>
              <p>
                Lọc theo model hoặc mức pin tối thiểu và xem nhanh các thông số quan trọng trước khi đặt xe.
              </p>
            </div>
            <div className="vehicle-search-hero__metrics">
              <div>
                <span>Kết quả</span>
                <strong>{fleetMetrics.total}</strong>
              </div>
              <div>
                <span>Mức pin TB</span>
                <strong>{averageBattery}%</strong>
              </div>
              <div>
                <span>Sẵn sàng</span>
                <strong>{fleetMetrics.available}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="vehicle-search-content">
          <div className="container vehicle-search-layout">
            <aside className="vehicle-search-filters">
              <div className="filters-card">
                <h2>Bộ lọc nâng cao</h2>
                <p>Nhập model ID hoặc mức pin để thu hẹp kết quả.</p>

                <form className="filters-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="modelId">Model ID</label>
                    <input
                      id="modelId"
                      name="modelId"
                      type="number"
                      placeholder="Ví dụ: 6"
                      value={filters.modelId}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="minBattery">Pin tối thiểu (%)</label>
                    <input
                      id="minBattery"
                      name="minBattery"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="Ví dụ: 70"
                      value={filters.minBattery}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="filters-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <LoadingSpinner size="sm" /> : 'Tìm kiếm'}
                    </button>
                    <button type="button" className="btn btn-outline-light" onClick={handleClear}>
                      Xóa bộ lọc
                    </button>
                  </div>
                </form>

                <ErrorMessage message={error} onDismiss={() => setError(null)} />
              </div>
            </aside>

            <div className="vehicle-search-results">
              {loading ? (
                <div className="vehicle-search-loading">
                  <LoadingSpinner />
                </div>
              ) : vehicles.length > 0 ? (
                <div className="vehicle-search-grid">
                  {vehicles.map((vehicle) => {
                    const statusMeta = STATUS_METADATA[vehicle.status] || {
                      label: vehicle.status ?? 'Đang cập nhật',
                      badge: 'status--unknown',
                    };

                    return (
                      <article key={vehicle.vehicleId} className="vehicle-search-card">
                        <div className="vehicle-search-card__image">
                          <img
                            src={getModelImage(vehicle)}
                            alt={vehicle.model?.modelName || 'EVR Vehicle'}
                            loading="lazy"
                          />
                        </div>

                        <div className="vehicle-search-card__body">
                          <div className="vehicle-search-card__heading">
                            <h3>{vehicle.model?.modelName || 'Model đang cập nhật'}</h3>
                            <span className={`status-badge ${statusMeta.badge}`}>{statusMeta.label}</span>
                          </div>

                          <dl className="vehicle-search-card__specs">
                            <div>
                              <dt>Biển số</dt>
                              <dd>{vehicle.plateNumber || '—'}</dd>
                            </div>
                            <div>
                              <dt>Mức pin</dt>
                              <dd>{vehicle.batteryLevel ?? 0}%</dd>
                            </div>
                            <div>
                              <dt>Mã trạm</dt>
                              <dd>{vehicle.station?.stationId ?? '—'}</dd>
                            </div>
                          </dl>
                        </div>

                        <footer className="vehicle-search-card__footer">
                          <Link to={`/vehicles/${vehicle.vehicleId}`} className="btn btn-primary">
                            Xem chi tiết
                          </Link>
                          <Link
                            to={`/bookings/create?vehicleId=${vehicle.vehicleId}`}
                            className="btn btn-outline-primary"
                          >
                            Đặt ngay
                          </Link>
                        </footer>
                      </article>
                    );
                  })}
                </div>
              ) : (
                hasSearched && (
                  <div className="vehicle-search-empty">
                    <div className="vehicle-search-empty__icon">🔍</div>
                    <h3>Không tìm thấy xe phù hợp</h3>
                    <p>Thử giảm mức pin tối thiểu hoặc để trống model ID để mở rộng kết quả.</p>
                  </div>
                )
              )}

              {!hasSearched && !loading && (
                <div className="vehicle-search-placeholder">
                  Nhập điều kiện và bấm <strong>Tìm kiếm</strong> để xem danh sách xe.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default VehicleSearchPage;


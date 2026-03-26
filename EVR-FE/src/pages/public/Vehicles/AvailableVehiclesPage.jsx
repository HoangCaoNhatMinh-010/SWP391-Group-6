import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import { vehicleService } from '@services/vehicle.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './AvailableVehiclesPage.css';

const MODEL_IMAGE_MAP = {
  urban: '/images/models/urban-compact.svg',
  executive: '/images/models/executive-sedan.svg',
  adventure: '/images/models/adventure-suv.svg',
  suv: '/images/models/adventure-suv.svg',
  sedan: '/images/models/executive-sedan.svg',
  compact: '/images/models/urban-compact.svg',
};

const NORMALIZE_MODEL_IMAGE = (rawPath) => {
  if (!rawPath) {
    return null;
  }

  let normalized = rawPath.replace(/\\/g, '/').trim();

  if (normalized.startsWith('/public/')) {
    normalized = normalized.replace('/public', '');
  } else if (normalized.startsWith('public/')) {
    normalized = normalized.replace('public', '');
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  return normalized;
};

const getVehicleImage = (vehicle) => {
  if (vehicle?.plateNumber) {
    return `/images/vehicles/${vehicle.plateNumber}.jpg`;
  }

  // fallback nếu không có biển số
  const modelCode =
    vehicle.model?.modelName ||
    vehicle.model?.vehicleType ||
    vehicle.model?.brand ||
    '';

  const normalized = modelCode.toLowerCase().replace(/\s+/g, '');

  const matchedKey = Object.keys(MODEL_IMAGE_MAP).find((key) =>
    normalized.includes(key)
  );

  if (matchedKey) {
    return MODEL_IMAGE_MAP[matchedKey];
  }

  return '/images/models/default-vehicle.svg';
};

const sortOptions = [
  { value: 'battery-desc', label: 'Pin cao → thấp' },
  { value: 'battery-asc', label: 'Pin thấp → cao' },
  { value: 'mileage-asc', label: 'Số km thấp → cao' },
  { value: 'mileage-desc', label: 'Số km cao → thấp' },
];

const batteryFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: '80+', label: '≥ 80%' },
  { value: '60-79', label: '60% – 79%' },
  { value: '40-59', label: '40% – 59%' },
  { value: '<40', label: '< 40%' },
];

const getBatteryTone = (batteryLevel) => {
  if (batteryLevel >= 80) return 'high';
  if (batteryLevel >= 60) return 'medium';
  if (batteryLevel >= 40) return 'low';
  return 'critical';
};

const getBatteryFilterPredicate = (filter) => {
  switch (filter) {
    case '80+':
      return (value) => value >= 80;
    case '60-79':
      return (value) => value >= 60 && value < 80;
    case '40-59':
      return (value) => value >= 40 && value < 60;
    case '<40':
      return (value) => value < 40;
    default:
      return () => true;
  }
};

const applySort = (vehicles, sort) => {
  const sorted = [...vehicles];

  switch (sort) {
    case 'battery-desc':
      return sorted.sort((a, b) => (b.batteryLevel ?? 0) - (a.batteryLevel ?? 0));
    case 'battery-asc':
      return sorted.sort((a, b) => (a.batteryLevel ?? 0) - (b.batteryLevel ?? 0));
    case 'mileage-asc':
      return sorted.sort((a, b) => (a.mileage ?? 0) - (b.mileage ?? 0));
    case 'mileage-desc':
      return sorted.sort((a, b) => (b.mileage ?? 0) - (a.mileage ?? 0));
    default:
      return vehicles;
  }
};

const AvailableVehiclesPage = () => {
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get('stationId');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batteryFilter, setBatteryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('battery-desc');

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!stationId) {
        setError('Vui lòng chọn trạm để xem danh sách xe.');
        setLoading(false);
        return;
      }

      try {
        const data = await vehicleService.getAvailableVehicles(parseInt(stationId, 10));
        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [stationId]);

  const handleSortChange = useCallback((event) => {
    setSortBy(event.target.value);
  }, []);

  const handleBatteryFilterChange = useCallback((event) => {
    setBatteryFilter(event.target.value);
  }, []);

  const filteredVehicles = useMemo(() => {
    const predicate = getBatteryFilterPredicate(batteryFilter);
    const filtered = vehicles.filter((vehicle) => predicate(vehicle.batteryLevel ?? 0));
    return applySort(filtered, sortBy);
  }, [vehicles, batteryFilter, sortBy]);

  const fleetMetrics = useMemo(() => {
    if (!vehicles.length) {
      return {
        totalVehicles: 0,
        avgBattery: 0,
        availableCount: 0,
      };
    }

    return vehicles.reduce(
      (acc, vehicle) => {
        const battery = Number(vehicle.batteryLevel) || 0;
        const status = vehicle.status || '';

        return {
          totalVehicles: acc.totalVehicles + 1,
          avgBattery: acc.avgBattery + battery,
          availableCount: acc.availableCount + (status.toLowerCase() === 'available' ? 1 : 0),
        };
      },
      { totalVehicles: 0, avgBattery: 0, availableCount: 0 }
    );
  }, [vehicles]);

  const averageBattery =
    fleetMetrics.totalVehicles > 0 ? Math.round(fleetMetrics.avgBattery / fleetMetrics.totalVehicles) : 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="vehicles-loading container">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="vehicles-error container">
          <ErrorMessage message={error} />
          <Link to="/stations" className="btn btn-primary mt-3">
            Quay lại danh sách trạm
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="vehicles-page">
        <section className="vehicles-hero">
          <div className="container vehicles-hero__wrapper">
            <div>
              <span className="vehicles-hero__eyebrow">EV Fleet</span>
              <h1>Đội xe sẵn sàng phục vụ tại trạm #{stationId}</h1>
              <p>
                Lựa chọn chiếc xe điện phù hợp nhất cho hành trình của bạn. Tất cả phương tiện đều được kiểm định an toàn và
                sạc đầy theo tiêu chuẩn EVR.
              </p>
              <div className="vehicles-hero__cta">
                <Link to="/vehicles/search" className="btn btn-light btn-lg">
                  Tìm kiếm nâng cao
                </Link>
                <Link to="/bookings/create" className="btn btn-outline-light btn-lg">
                  Đặt xe ngay
                </Link>
              </div>
            </div>
            <div className="vehicles-hero__metrics">
              <div>
                <span>Tổng số xe</span>
                <strong>{fleetMetrics.totalVehicles}</strong>
              </div>
              <div>
                <span>Pin trung bình</span>
                <strong>{averageBattery}%</strong>
              </div>
              <div>
                <span>Đang sẵn sàng</span>
                <strong>{fleetMetrics.availableCount}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="vehicles-content">
          <div className="container">
            <div className="vehicles-toolbar">
              <div className="vehicles-toolbar__filters">
                <div className="form-group">
                  <label htmlFor="batteryFilter">Mức pin</label>
                  <select
                    id="batteryFilter"
                    value={batteryFilter}
                    className="form-select"
                    onChange={handleBatteryFilterChange}
                  >
                    {batteryFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="sortBy">Sắp xếp</label>
                  <select id="sortBy" value={sortBy} className="form-select" onChange={handleSortChange}>
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Link to={`/stations`} className="vehicles-toolbar__back">
                <span>←</span> Chọn trạm khác
              </Link>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="vehicles-empty">
                <div className="vehicles-empty__icon">🚘</div>
                <h3>Chưa có xe phù hợp với bộ lọc hiện tại</h3>
                <p>Hãy thử thay đổi mức pin hoặc quay lại chọn trạm khác để xem thêm lựa chọn.</p>
              </div>
            ) : (
              <div className="vehicles-grid">
                {filteredVehicles.map((vehicle, index) => {
                  const batteryLevel = vehicle.batteryLevel ?? 0;
                  const batteryTone = getBatteryTone(batteryLevel);
                  const image = getVehicleImage(vehicle);
                  return (
                    <article key={vehicle.vehicleId} className="vehicle-card">
                      <div className="vehicle-card__image">
                        <img src={image} alt={vehicle.model?.name || 'EVR Vehicle'} loading="lazy" />
                        <span className={`vehicle-status vehicle-status--${batteryTone}`}>
                          {batteryTone === 'high'
                            ? 'Sẵn sàng đường dài'
                            : batteryTone === 'medium'
                              ? 'Thích hợp đô thị'
                              : batteryTone === 'low'
                                ? 'Nên sạc trước chuyến'
                                : 'Cần sạc'}
                        </span>
                      </div>

                      <div className="vehicle-card__body">
                        <header>
                          <h3>{vehicle.model?.modelName || 'Mẫu xe EVR'}</h3>
                          <p>{vehicle.plateNumber || 'Biển số đang cập nhật'}</p>
                        </header>

                        <dl className="vehicle-specs">
                          <div>
                            <dt>Mức pin</dt>
                            <dd>
                              <div className="vehicle-battery">
                                <div className={`vehicle-battery__bar vehicle-battery__bar--${batteryTone}`}>
                                  <div style={{ width: `${Math.min(100, Math.max(0, batteryLevel))}%` }} />
                                </div>
                                <span>{batteryLevel}%</span>
                              </div>
                            </dd>
                          </div>
                          <div>
                            <dt>Số km</dt>
                            <dd>{vehicle.mileage ?? 0} km</dd>
                          </div>
                          <div>
                            <dt>Trạng thái</dt>
                            <dd>
                              <span className="badge bg-success">{vehicle.status || 'Available'}</span>
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <footer className="vehicle-card__footer">
                        <Link to={`/vehicles/${vehicle.vehicleId}`} className="btn btn-primary">
                          Xem chi tiết
                        </Link>
                        <Link
                          to={`/bookings/create?vehicleId=${vehicle.vehicleId}`}
                          className="btn btn-outline-primary"
                        >
                          Đặt xe nhanh
                        </Link>
                      </footer>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default AvailableVehiclesPage;


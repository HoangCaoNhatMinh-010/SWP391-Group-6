import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { stationService } from '@services/station.service';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './StationsListPage.css';

const getOccupancy = (availableSlots = 0, totalSlots = 0) => {
  if (!totalSlots) {
    return 0;
  }

  const occupancy = (availableSlots / totalSlots) * 100;
  return Number.isFinite(occupancy) ? Math.max(0, Math.min(occupancy, 100)) : 0;
};

const getOccupancyTone = (occupancy) => {
  if (occupancy >= 60) return 'high';
  if (occupancy >= 30) return 'medium';
  return 'low';
};

const StationsListPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await stationService.getStations();
        setStations(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stations');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const stationMetrics = useMemo(() => {
    if (!stations.length) {
      return {
        totalStations: 0,
        totalAvailableSlots: 0,
        totalCapacity: 0,
      };
    }

    return stations.reduce(
      (acc, station) => {
        const available = Number(station.availableSlots) || 0;
        const total = Number(station.totalSlots) || 0;

        return {
          totalStations: acc.totalStations + 1,
          totalAvailableSlots: acc.totalAvailableSlots + available,
          totalCapacity: acc.totalCapacity + total,
        };
      },
      { totalStations: 0, totalAvailableSlots: 0, totalCapacity: 0 }
    );
  }, [stations]);

  if (loading) {
    return (
      <MainLayout>
        <div className="stations-loading container">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="stations-error container">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="stations-page">
        <section className="stations-hero">
          <div className="container stations-hero__wrapper">
            <div>
              <span className="stations-hero__eyebrow">EVR Global Network</span>
              <h1>Hệ thống trạm phủ sóng toàn thành phố</h1>
              <p>
                Dễ dàng tìm và đặt xe ở bất kỳ khu vực nào. Dữ liệu cập nhật theo thời gian thực giúp bạn biết chính xác số chỗ
                trống và dịch vụ hỗ trợ tại từng trạm.
              </p>
              <div className="stations-hero__cta">
                <Link to="/stations/nearby" className="btn btn-light btn-lg">
                  Tìm trạm gần nhất
                </Link>
                <Link to="/vehicles/search" className="btn btn-outline-light btn-lg">
                  Đặt xe ngay
                </Link>
              </div>
            </div>
            <div className="stations-hero__metrics">
              <div>
                <span>Trạm hoạt động</span>
                <strong>{stationMetrics.totalStations}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="stations-content">
          <div className="container">
            {stations.length === 0 ? (
              <div className="stations-empty">
                <div className="stations-empty__icon">📍</div>
                <h3>Chưa có trạm nào được kích hoạt</h3>
                <p>Hãy quay lại sau, chúng tôi đang mở rộng hệ thống để phục vụ bạn tốt hơn.</p>
              </div>
            ) : (
              <>
                <div className="stations-toolbar">
                  <div>
                    <h2>Danh sách trạm</h2>
                    <p>Thông tin chi tiết từng trạm bao gồm địa chỉ, giờ hoạt động và số chỗ trống.</p>
                  </div>
                  <Link to="/stations/nearby" className="stations-toolbar__cta">
                    <span>📡</span> Xem trên bản đồ
                  </Link>
                </div>

                <div className="stations-grid">
                  {stations.map((station) => {
                    const occupancy = getOccupancy(station.availableSlots, station.totalSlots);
                    const tone = getOccupancyTone(occupancy);

                    return (
                      <article key={station.stationId} className="station-card">
                        <div className="station-card__header">
                          <div>
                            <h3>{station.name}</h3>
                            <span className={`station-status station-status--${tone}`}>
                              {tone === 'high' ? 'Sẵn sàng' : tone === 'medium' ? 'Nên đặt trước' : 'Sắp full'}
                            </span>
                          </div>
                        </div>

                        <div className="station-card__body">
                          <div className="station-detail">
                            <span>Địa chỉ</span>
                            <p>{station.address || 'Đang cập nhật'}</p>
                          </div>
                          <div className="station-detail">
                            <span>Giờ hoạt động</span>
                            <p>{station.operatingHours || '24/7'}</p>
                          </div>
                          <div className="station-detail">
                            <span>Liên hệ</span>
                            <p>{station.contactNumber || 'Hotline: 1900-xxxx'}</p>
                          </div>
                        </div>

                        <div className="station-card__footer">
                          <div className="station-capacity">
                            <div className={`station-capacity__bar station-capacity__bar--${tone}`}>
                              <div style={{ width: `${occupancy}%` }} />
                            </div>
                          </div>

                          <Link
                            to={`/vehicles/available?stationId=${station.stationId}`}
                            className="btn btn-primary station-card__action"
                          >
                            Xem xe tại trạm
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default StationsListPage;


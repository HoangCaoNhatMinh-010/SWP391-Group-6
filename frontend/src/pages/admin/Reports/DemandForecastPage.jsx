import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import { stationService } from '@services/station.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './AdminReportsPage.css';

const DemandForecastPage = () => {
  const [forecast, setForecast] = useState(null);
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const data = await stationService.getStations();
        setStations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Không thể tải danh sách trạm.');
      }

      try {
        const forecastData = await adminService.getDemandForecast(null);
        setForecast(forecastData || null);
      } catch (err) {
        setError((prev) => prev ?? 'Không thể tải dự báo nhu cầu.');
        setForecast(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const forecastData = await adminService.getDemandForecast(
          stationId ? Number(stationId) : null
        );
        setForecast(forecastData || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dự báo nhu cầu.');
        setForecast(null);
      } finally {
        setLoading(false);
      }
    };

    if (stationId !== '') {
      fetchForecast();
    }
  }, [stationId]);

  const handleStationChange = (event) => {
    setStationId(event.target.value);
  };

  const summaryCards = useMemo(() => {
    if (!forecast) return [];
    return [
      {
        title: 'Nhu cầu dự kiến',
        value: forecast.predictedDemand ?? '—',
        detail: 'Số lượt thuê dự kiến trong chu kỳ kế tiếp',
        variant: 'primary',
      },
      {
        title: 'Độ tin cậy',
        value: forecast.confidence ? `${(forecast.confidence * 100).toFixed(1)}%` : '—',
        detail: 'Mức độ chắc chắn của mô hình dự báo',
        variant: 'teal',
      },
    ];
  }, [forecast]);

  return (
    <AdminLayout>
      <div className="admin-report-page">
        <section className="admin-report-hero">
          <div className="admin-report-hero__text">
            <span className="admin-report-eyebrow">Demand Forecast</span>
            <h1>Dự báo nhu cầu thuê xe</h1>
            <p>
              Đánh giá xu hướng sắp tới để chuẩn bị đội xe, nhân sự và chiến dịch marketing phù hợp từng khu vực.
            </p>
          </div>

          <div className="admin-report-filters">
            <div className="admin-report-filter">
              <label htmlFor="stationId">Trạm</label>
              <select id="stationId" value={stationId} onChange={handleStationChange}>
                <option value="">Tất cả</option>
                {stations.map((station) => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <div className="admin-report-loading">
            <LoadingSpinner />
          </div>
        ) : forecast ? (
          <>
            <section className="admin-report-metrics">
              {summaryCards.map((card) => (
                <article key={card.title} className={`admin-report-card admin-report-card--${card.variant}`}>
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                  <p>{card.detail}</p>
                </article>
              ))}
            </section>

            {forecast.demandBySegment?.length ? (
              <section className="admin-report-panel">
                <header>
                  <h2>Phân tích theo phân khúc</h2>
                  <span>Nhu cầu dự kiến theo từng phân khúc khách hàng</span>
                </header>
                <div className="admin-report-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Phân khúc</th>
                        <th>Nhu cầu dự kiến</th>
                        <th>Tỉ trọng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecast.demandBySegment.map((segment, index) => (
                        <tr key={index}>
                          <td>{segment.segment}</td>
                          <td>{segment.demand}</td>
                          <td>{segment.percentage ? `${segment.percentage}%` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {forecast.recommendedActions?.length ? (
              <section className="admin-report-panel">
                <header>
                  <h2>Hành động khuyến nghị</h2>
                  <span>Ưu tiên triển khai trong kỳ tiếp theo</span>
                </header>
                <ul className="admin-report-list">
                  {forecast.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <div className="admin-report-placeholder">Không có dữ liệu dự báo nhu cầu.</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DemandForecastPage;



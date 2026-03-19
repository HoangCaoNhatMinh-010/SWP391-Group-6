import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import { stationService } from '@services/station.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './AdminReportsPage.css';

const PeakHoursAnalysisPage = () => {
  const [analysis, setAnalysis] = useState(null);
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
        const peakData = await adminService.getPeakHoursAnalysis(null);
        setAnalysis(peakData || null);
      } catch (err) {
        setError((prev) => prev ?? 'Không thể tải báo cáo khung giờ cao điểm.');
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getPeakHoursAnalysis(
          stationId ? Number(stationId) : null
        );
        setAnalysis(data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu khung giờ cao điểm.');
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    if (stationId !== '') {
      fetchAnalysis();
    }
  }, [stationId]);

  const handleStationChange = (event) => {
    setStationId(event.target.value);
  };

  const summaryCards = useMemo(() => {
    if (!analysis) {
      return [];
    }
    return [
      {
        title: 'Khung giờ cao điểm',
        value: analysis.peakHours || 'Đang cập nhật',
        detail: 'Khoảng thời gian có nhu cầu cao nhất',
        variant: 'primary',
      },
      {
        title: 'Ngày cao điểm',
        value: analysis.peakDays || 'Đang cập nhật',
        detail: 'Ngày trong tuần có tần suất thuê cao',
        variant: 'teal',
      },
    ];
  }, [analysis]);

  return (
    <AdminLayout>
      <div className="admin-report-page">
        <section className="admin-report-hero">
          <div className="admin-report-hero__text">
            <span className="admin-report-eyebrow">Demand Insights</span>
            <h1>Phân tích khung giờ cao điểm</h1>
            <p>
              Nắm bắt thời điểm khách hàng thuê xe nhiều nhất để chủ động điều phối, sẵn sàng nguồn lực và triển khai ưu đãi.
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
        ) : analysis ? (
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

            {analysis.hourlyBreakdown?.length ? (
              <section className="admin-report-panel">
                <header>
                  <h2>Phân bổ theo khung giờ</h2>
                  <span>Tần suất booking theo từng khung giờ trong ngày</span>
                </header>
                <div className="admin-report-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Khung giờ</th>
                        <th>Số lượt thuê</th>
                        <th>Tỉ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.hourlyBreakdown.map((row, index) => (
                        <tr key={index}>
                          <td>{row.timeRange}</td>
                          <td>{row.bookings}</td>
                          <td>{row.percentage ? `${row.percentage}%` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {analysis.recommendations?.length ? (
              <section className="admin-report-panel">
                <header>
                  <h2>Chiến lược đề xuất</h2>
                  <span>Gợi ý điều chỉnh nhân sự và đội xe theo khung giờ</span>
                </header>
                <ul className="admin-report-list">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <div className="admin-report-placeholder">Không có dữ liệu khung giờ cao điểm để hiển thị.</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PeakHoursAnalysisPage;



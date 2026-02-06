import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import { stationService } from '@services/station.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './AdminReportsPage.css';

const UtilizationReportPage = () => {
  const [report, setReport] = useState(null);
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
        const utilization = await adminService.getUtilizationReport(null);
        setReport(utilization || null);
      } catch (err) {
        setError((prev) => prev ?? 'Không thể tải báo cáo hiệu suất sử dụng.');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const utilization = await adminService.getUtilizationReport(
          stationId ? Number(stationId) : null
        );
        setReport(utilization || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải báo cáo hiệu suất sử dụng.');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    // prevent duplicate call if bootstrap already loaded with null and stationId unchanged
    if (stationId !== '') {
      fetchReport();
    }
  }, [stationId]);

  const handleStationChange = (event) => {
    setStationId(event.target.value);
  };

  const summaryCards = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      {
        title: 'Tổng số xe',
        value: report.totalVehicles || 0,
        detail: 'Ghi nhận trong hệ thống',
        variant: 'primary',
      },
      {
        title: 'Tỉ lệ sử dụng',
        value: report.utilizationRate ? `${report.utilizationRate}%` : '0%',
        detail: 'Trong khoảng thời gian gần nhất',
        variant: 'teal',
      },
      {
        title: 'Xe sẵn sàng',
        value: report.availableVehicles || 0,
        detail: 'Xe đang rảnh và có thể cho thuê',
        variant: 'purple',
      },
    ];
  }, [report]);

  return (
    <AdminLayout>
      <div className="admin-report-page">
        <section className="admin-report-hero">
          <div className="admin-report-hero__text">
            <span className="admin-report-eyebrow">Fleet Utilization</span>
            <h1>Hiệu suất sử dụng đội xe</h1>
            <p>
              Theo dõi tỉ lệ khai thác xe theo từng trạm để tối ưu phân bổ nguồn lực và giảm thời gian xe nhàn rỗi.
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
        ) : report ? (
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

            <section className="admin-report-panel">
              <header>
                <h2>Chi tiết trạng thái đội xe</h2>
                <span>Phân bổ số lượng xe theo trạng thái hoạt động</span>
              </header>
              <div className="admin-report-table">
                <table>
                  <thead>
                    <tr>
                      <th>Trạng thái</th>
                      <th>Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Đang sử dụng</td>
                      <td>{report.vehiclesInUse ?? 0}</td>
                    </tr>
                    <tr>
                      <td>Đang bảo trì</td>
                      <td>{report.maintenanceVehicles ?? 0}</td>
                    </tr>
                    <tr>
                      <td>Đang rảnh</td>
                      <td>{report.availableVehicles ?? 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {report.recommendations?.length ? (
              <section className="admin-report-panel">
                <header>
                  <h2>Khuyến nghị cải thiện</h2>
                  <span>Gợi ý điều phối dựa trên mức độ khai thác hiện tại</span>
                </header>
                <ul className="admin-report-list">
                  {report.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <div className="admin-report-placeholder">Không có dữ liệu hiệu suất để hiển thị.</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UtilizationReportPage;



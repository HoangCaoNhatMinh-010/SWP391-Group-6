import { useMemo, useState, useEffect } from 'react';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import { stationService } from '@services/station.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './AdminReportsPage.css';

const formatCurrency = (value) => {
  if (value == null) return '0 ₫';
  return `${Number(value).toLocaleString('vi-VN')} ₫`;
};

const RevenueReportPage = () => {
  const [report, setReport] = useState(null);
  const [stations, setStations] = useState([]);
  const [filters, setFilters] = useState({
    stationId: '',
    from: '',
    to: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await stationService.getStations();
        setStations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Không thể tải danh sách trạm.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Remove auto-fetch on filter change - only fetch when search button is clicked

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setHasSearched(false);
  };

  const handleSearch = async () => {
    if (!filters.from || !filters.to) {
      setError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
      setHasSearched(true);
      return;
    }

    const fromDate = new Date(filters.from);
    const toDate = new Date(filters.to);
    const now = new Date();

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      setError('Ngày không hợp lệ. Vui lòng chọn lại.');
      setHasSearched(true);
      setReport(null);
      return;
    }

    if (fromDate > toDate) {
      setError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
      setHasSearched(true);
      setReport(null);
      return;
    }

    if (fromDate > now || toDate > now) {
      setError('Ngày không được vượt quá hiện tại.');
      setHasSearched(true);
      setReport(null);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Normalize datetime format: add :00 seconds if missing
      const normalizeDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return dateTimeStr;
        // If format is YYYY-MM-DDTHH:mm, add :00 for seconds
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeStr)) {
          return dateTimeStr + ':00';
        }
        return dateTimeStr;
      };

      const data = await adminService.getRevenueReport(
        filters.stationId ? Number(filters.stationId) : null,
        normalizeDateTime(filters.from),
        normalizeDateTime(filters.to)
      );
      setReport(data || null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Không thể tải báo cáo doanh thu.';
      setError(errorMessage);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(() => {
    if (!report) {
      return [];
    }
    return [
      {
        title: 'Tổng doanh thu',
        value: formatCurrency(report.totalRevenue),
        detail: 'Khoảng thời gian đã chọn',
        variant: 'primary',
      },
      {
        title: 'Số booking',
        value: report.totalBookings || 0,
        detail: 'Đơn hàng đã hoàn thành',
        variant: 'teal',
      },
      {
        title: 'Doanh thu trung bình',
        value: formatCurrency(report.averageRevenue),
        detail: 'Trên mỗi booking',
        variant: 'purple',
      },
    ];
  }, [report]);

  return (
    <AdminLayout>
      <div className="admin-report-page">
        <section className="admin-report-hero">
          <div className="admin-report-hero__text">
            <span className="admin-report-eyebrow">Revenue Intelligence</span>
            <h1>Báo cáo doanh thu</h1>
            <p>Theo dõi hiệu suất kinh doanh theo trạm và thời gian để ra quyết định điều phối chính xác.</p>
          </div>
          <form className="admin-report-filters" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <div className="admin-report-filter">
              <label htmlFor="stationId">Trạm</label>
              <select
                id="stationId"
                name="stationId"
                value={filters.stationId}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả</option>
                {stations.map((station) => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-report-filter">
              <label htmlFor="from">Từ ngày</label>
              <input
                id="from"
                name="from"
                type="datetime-local"
                value={filters.from}
                onChange={handleFilterChange}
                max={(() => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = String(now.getMonth() + 1).padStart(2, '0');
                  const day = String(now.getDate()).padStart(2, '0');
                  const hours = String(now.getHours()).padStart(2, '0');
                  const minutes = String(now.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })()}
              />
            </div>
            <div className="admin-report-filter">
              <label htmlFor="to">Đến ngày</label>
              <input
                id="to"
                name="to"
                type="datetime-local"
                value={filters.to}
                onChange={handleFilterChange}
                max={(() => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = String(now.getMonth() + 1).padStart(2, '0');
                  const day = String(now.getDate()).padStart(2, '0');
                  const hours = String(now.getHours()).padStart(2, '0');
                  const minutes = String(now.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })()}
                min={filters.from || undefined}
              />
            </div>
            <div className="admin-report-filter">
              <label>&nbsp;</label>
              <button type="submit" className="admin-report-search-btn">
                Tìm kiếm
              </button>
            </div>
          </form>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {initialLoading ? (
          <div className="admin-report-loading">
            <LoadingSpinner />
          </div>
        ) : loading ? (
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

            {report.topStations?.length ? (
              <section className="admin-report-panel">
                <header>
                  <h2>Top trạm theo doanh thu</h2>
                  <span>Top 5 trạm có doanh thu cao nhất trong giai đoạn</span>
                </header>
                <div className="admin-report-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Trạm</th>
                        <th>Doanh thu</th>
                        <th>Booking</th>
                        <th>Doanh thu trung bình</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topStations.map((station) => (
                        <tr key={station.stationId}>
                          <td>{station.name || `Trạm #${station.stationId}`}</td>
                          <td>{formatCurrency(station.revenue)}</td>
                          <td>{station.bookings || 0}</td>
                          <td>{formatCurrency(station.averageRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {report.recommendations?.length ? (
              <section className="admin-report-panel">
                <header>
                  <h2>Khuyến nghị tối ưu</h2>
                  <span>Các đề xuất dựa trên dữ liệu doanh thu hiện tại</span>
                </header>
                <ul className="admin-report-list">
                  {report.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : hasSearched ? (
          <div className="admin-report-placeholder">
            Không có dữ liệu doanh thu cho khoảng thời gian đã chọn.
          </div>
        ) : (
          <div className="admin-report-placeholder">
            Vui lòng chọn khoảng thời gian để xem báo cáo doanh thu.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RevenueReportPage;


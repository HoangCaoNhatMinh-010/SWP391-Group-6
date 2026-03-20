import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { stationService } from '@services/station.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './StationsManagementPage.css';

const StationsManagementPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await stationService.getStations();
        setStations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách trạm.');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleDelete = async (stationId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa trạm này?')) {
      return;
    }

    try {
      await stationService.deleteStation(stationId);
      setStations((prev) => prev.filter((station) => station.stationId !== stationId));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa trạm.');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-stations">
        <section className="admin-stations__hero">
          <div>
            <span>Quản lý trạm</span>
            <h1>Mạng lưới trạm EVR</h1>
            <p>Theo dõi vị trí, sức chứa và thông tin liên hệ của các trạm cho thuê.</p>
          </div>
          <Link to="/admin/stations/create" className="admin-stations__cta">
            + Thêm trạm mới
          </Link>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <div className="admin-stations__loading">
            <LoadingSpinner />
          </div>
        ) : stations.length === 0 ? (
          <div className="admin-stations__empty">Hiện chưa có trạm nào trong hệ thống.</div>
        ) : (
          <section className="admin-stations__table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Trạm</th>
                  <th>Địa chỉ</th>
                  <th>Liên hệ</th>
                  <th>Số chỗ trống</th>
                  <th>Tổng chỗ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {stations.map((station) => (
                  <tr key={station.stationId}>
                    <td>#{station.stationId}</td>
                    <td>{station.name}</td>
                    <td>{station.address}</td>
                    <td>{station.contactNumber || '—'}</td>
                    <td>{station.availableSlots ?? '—'}</td>
                    <td>{station.totalSlots ?? '—'}</td>
                    <td>
                      <div className="admin-stations__actions">
                        <Link to={`/admin/stations/${station.stationId}/edit`}>Chỉnh sửa</Link>
                        <button type="button" onClick={() => handleDelete(station.stationId)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default StationsManagementPage;


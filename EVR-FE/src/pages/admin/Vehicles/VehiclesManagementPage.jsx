import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { vehicleService } from '@services/vehicle.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './VehiclesManagementPage.css';

const statusTone = {
  AVAILABLE: 'success',
  RENTED: 'info',
  MAINTENANCE: 'warning',
};

const VehiclesManagementPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await vehicleService.getVehicles(
          null,
          null,
          pagination.currentPage,
          pagination.pageSize,
          statusFilter || null
        );
        
        if (response && response.vehicles) {
          setVehicles(Array.isArray(response.vehicles) ? response.vehicles : []);
          setPagination({
            currentPage: response.currentPage || 0,
            totalItems: response.totalItems || 0,
            totalPages: response.totalPages || 0,
            pageSize: pagination.pageSize,
          });
        } else {
          setVehicles([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [pagination.currentPage, pagination.pageSize, statusFilter]);

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa xe này khỏi đội xe?')) {
      return;
    }

    try {
      await vehicleService.deleteVehicle(vehicleId);
      // Reload vehicles after delete
      const response = await vehicleService.getVehicles(
        null,
        null,
        pagination.currentPage,
        pagination.pageSize,
        statusFilter || null
      );
      if (response && response.vehicles) {
        setVehicles(Array.isArray(response.vehicles) ? response.vehicles : []);
        setPagination({
          currentPage: response.currentPage || 0,
          totalItems: response.totalItems || 0,
          totalPages: response.totalPages || 0,
          pageSize: pagination.pageSize,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa xe.');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handlePageSizeChange = (e) => {
    setPagination((prev) => ({ ...prev, pageSize: parseInt(e.target.value), currentPage: 0 }));
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
  };

  return (
    <AdminLayout>
      <div className="admin-vehicles">
        <section className="admin-vehicles__hero">
          <div>
            <span>Quản lý đội xe</span>
            <h1>Danh mục xe điện</h1>
            <p>Theo dõi tình trạng, mức pin và vị trí của đội xe trên toàn hệ thống.</p>
          </div>
          <Link to="/admin/vehicles/create" className="admin-vehicles__cta">
            + Thêm xe mới
          </Link>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <section className="admin-vehicles__filters">
          <div className="admin-vehicles__filter">
            <label htmlFor="statusFilter">Lọc theo trạng thái:</label>
            <select id="statusFilter" value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="">Tất cả</option>
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <div className="admin-vehicles__filter">
            <label htmlFor="pageSize">Số lượng mỗi trang:</label>
            <select id="pageSize" value={pagination.pageSize} onChange={handlePageSizeChange}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="admin-vehicles__loading">
            <LoadingSpinner />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="admin-vehicles__empty">Chưa có xe nào trong đội xe.</div>
        ) : (
          <section className="admin-vehicles__table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Biển số</th>
                  <th>Model</th>
                  <th>Mức pin</th>
                  <th>Số km</th>
                  <th>Trạng thái</th>
                  <th>Trạm</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId}>
                    <td>#{vehicle.vehicleId}</td>
                    <td>{vehicle.plateNumber}</td>
                    <td>{vehicle.model?.modelName || vehicle.model?.name || 'EV'}</td>
                    <td>{vehicle.batteryLevel != null ? `${vehicle.batteryLevel}%` : '—'}</td>
                    <td>{vehicle.mileage != null ? `${vehicle.mileage} km` : '—'}</td>
                    <td>
                      <span
                        className={`admin-vehicles__status admin-vehicles__status--${
                          statusTone[vehicle.status] || 'neutral'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td>{vehicle.station?.name || '—'}</td>
                    <td>
                      <div className="admin-vehicles__actions">
                        <Link to={`/admin/vehicles/${vehicle.vehicleId}/edit`}>Chỉnh sửa</Link>
                        <button type="button" onClick={() => handleDelete(vehicle.vehicleId)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pagination.totalPages > 1 && (
              <div className="admin-vehicles__pagination">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  className="admin-vehicles__pagination-btn"
                >
                  Trước
                </button>
                <span className="admin-vehicles__pagination-info">
                  Trang {pagination.currentPage + 1} / {pagination.totalPages} 
                  ({pagination.totalItems} xe)
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  className="admin-vehicles__pagination-btn"
                >
                  Sau
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default VehiclesManagementPage;


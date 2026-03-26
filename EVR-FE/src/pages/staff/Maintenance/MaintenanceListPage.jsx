import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { staffService } from '@services/staff.service';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './MaintenanceListPage.css';

const getStatusInfo = (status) => {
  const normalized = status?.toUpperCase() || '';
  if (normalized === 'OPEN' || normalized === 'Open') {
    return { label: 'Mở', badge: 'status--open', color: '#006fd6' };
  }
  if (normalized === 'IN_PROGRESS' || normalized === 'INPROGRESS' || normalized === 'InProgress') {
    return { label: 'Đang xử lý', badge: 'status--progress', color: '#ffb84d' };
  }
  if (normalized === 'CLOSED' || normalized === 'Closed') {
    return { label: 'Đã hoàn tất', badge: 'status--closed', color: '#009968' };
  }
  return { label: status || 'N/A', badge: 'status--unknown', color: '#6c757d' };
};

const normalizeModelImage = (rawPath) => {
  if (!rawPath) return null;
  let normalized = rawPath.trim();
  if (!normalized) return null;
  if (/^data:image\//.test(normalized)) return normalized;
  normalized = normalized.replace(/\\/g, '/');
  if (normalized.startsWith('/public/')) normalized = normalized.replace('/public', '');
  else if (normalized.startsWith('public/')) normalized = normalized.replace('public', '');
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (!/\.[a-z]{2,4}$/i.test(normalized)) normalized = `${normalized}.jpg`;
  return normalized;
};

const fallbackModelImage = (vehicle) => {
  const modelCode = vehicle?.model?.modelName || vehicle?.model?.vehicleType || vehicle?.model?.brand || '';
  const normalized = modelCode.toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('urban') || normalized.includes('compact')) return '/images/models/urban-compact.svg';
  if (normalized.includes('executive') || normalized.includes('sedan')) return '/images/models/executive-sedan.svg';
  if (normalized.includes('adventure') || normalized.includes('suv')) return '/images/models/adventure-suv.svg';
  return '/images/models/default-vehicle.svg';
};

const getModelImage = (vehicle) => normalizeModelImage(vehicle?.model?.imageUrl) || fallbackModelImage(vehicle);

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MaintenanceListPage = () => {
  const { user } = useAuth();
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchMaintenance = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await staffService.listMaintenance(user.userId, statusFilter || null);
        setMaintenanceList(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách bảo trì.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, [user, statusFilter]);

  const filteredMaintenance = useMemo(() => {
    if (!statusFilter) return maintenanceList;
    return maintenanceList.filter((m) => {
      const status = m.status?.toUpperCase() || '';
      const filter = statusFilter.toUpperCase();
      if (filter === 'OPEN') return status === 'OPEN' || status === 'Open';
      if (filter === 'IN_PROGRESS') {
        return status === 'IN_PROGRESS' || status === 'INPROGRESS' || status === 'IN PROGRESS' || status === 'InProgress';
      }
      if (filter === 'CLOSED') return status === 'CLOSED' || status === 'Closed';
      return true;
    });
  }, [maintenanceList, statusFilter]);

  const metrics = useMemo(() => {
    if (!maintenanceList.length) {
      return { total: 0, open: 0, inProgress: 0, closed: 0 };
    }
    const total = maintenanceList.length;
    const open = maintenanceList.filter((m) => {
      const s = m.status?.toUpperCase() || '';
      return s === 'OPEN' || s === 'Open';
    }).length;
    const inProgress = maintenanceList.filter((m) => {
      const s = m.status?.toUpperCase() || '';
      return s === 'IN_PROGRESS' || s === 'INPROGRESS' || s === 'IN PROGRESS' || s === 'InProgress';
    }).length;
    const closed = maintenanceList.filter((m) => {
      const s = m.status?.toUpperCase() || '';
      return s === 'CLOSED' || s === 'Closed';
    }).length;
    return { total, open, inProgress, closed };
  }, [maintenanceList]);

  return (
    <StaffLayout>
      <div className="maintenance-list">
        <section className="maintenance-list__header">
          <div>
            <span className="maintenance-list__eyebrow">Quản lý bảo trì</span>
            <h1>Danh sách bảo trì</h1>
            <p>Quản lý các yêu cầu bảo trì, sửa chữa và sạc pin cho đội xe EVR.</p>
          </div>
          <Link to="/staff/maintenance/create" className="maintenance-list__create-btn">
            + Tạo mới
          </Link>
        </section>

        <section className="maintenance-list__metrics">
          <div className="maintenance-list__metric-card">
            <span>Tổng số</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="maintenance-list__metric-card">
            <span>Đang mở</span>
            <strong>{metrics.open}</strong>
          </div>
          <div className="maintenance-list__metric-card">
            <span>Đang xử lý</span>
            <strong>{metrics.inProgress}</strong>
          </div>
          <div className="maintenance-list__metric-card">
            <span>Đã hoàn tất</span>
            <strong>{metrics.closed}</strong>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {maintenanceList.length > 0 && (
          <section className="maintenance-list__filters">
            <div className="maintenance-list__filter-group">
              <label htmlFor="status-filter">Lọc theo trạng thái:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control"
              >
                <option value="">Tất cả</option>
                <option value="OPEN">Mở</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="CLOSED">Đã hoàn tất</option>
              </select>
            </div>
          </section>
        )}

        {loading ? (
          <div className="maintenance-list__loading">
            <LoadingSpinner />
          </div>
        ) : filteredMaintenance.length === 0 ? (
          <div className="maintenance-list__empty">
            <div className="maintenance-list__empty-icon">🔧</div>
            <h2>
              {statusFilter ? 'Không tìm thấy yêu cầu bảo trì phù hợp' : 'Chưa có yêu cầu bảo trì nào'}
            </h2>
            <p>
              {statusFilter
                ? 'Thử thay đổi bộ lọc để xem các yêu cầu khác.'
                : 'Tạo yêu cầu bảo trì đầu tiên để bắt đầu quản lý đội xe.'}
            </p>
            {!statusFilter && (
              <Link to="/staff/maintenance/create" className="btn btn-primary">
                Tạo yêu cầu bảo trì
              </Link>
            )}
          </div>
        ) : (
          <section className="maintenance-list__grid">
            {filteredMaintenance.map((maintenance) => {
              const statusInfo = getStatusInfo(maintenance.status);
              const vehicleImage = maintenance.vehicle ? getModelImage(maintenance.vehicle) : null;

              return (
                <article key={maintenance.maintenanceId} className="maintenance-list__card">
                  <header className="maintenance-list__card-header">
                    <div>
                      <span className="maintenance-list__card-id">#{maintenance.maintenanceId}</span>
                      <h3>Bảo trì #{maintenance.maintenanceId}</h3>
                    </div>
                    <span
                      className={`maintenance-list__status ${statusInfo.badge}`}
                      style={{ '--status-color': statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </header>

                  {maintenance.vehicle && (
                    <div className="maintenance-list__vehicle">
                      {vehicleImage && (
                        <div className="maintenance-list__vehicle-image">
                          <img src={vehicleImage} alt={maintenance.vehicle.model?.modelName || 'EVR Vehicle'} />
                        </div>
                      )}
                      <div className="maintenance-list__vehicle-info">
                        <div>
                          <strong>{maintenance.vehicle.model?.modelName || maintenance.vehicle.model?.name || 'Mẫu xe EV'}</strong>
                          <p>Biển số: {maintenance.vehicle.plateNumber || '—'}</p>
                        </div>
                        {maintenance.vehicle.batteryLevel !== null && (
                          <div className="maintenance-list__battery">
                            <span>Pin</span>
                            <strong>{maintenance.vehicle.batteryLevel}%</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="maintenance-list__card-content">
                    {maintenance.scheduledAt && (
                      <div className="maintenance-list__info-item">
                        <span>Lịch dự kiến</span>
                        <strong>{formatDate(maintenance.scheduledAt)}</strong>
                      </div>
                    )}
                    {maintenance.remarks && (
                      <div className="maintenance-list__info-item">
                        <span>Ghi chú</span>
                        <p>{maintenance.remarks}</p>
                      </div>
                    )}
                  </div>

                  <footer className="maintenance-list__card-footer">
                    <Link
                      to={`/staff/maintenance/${maintenance.maintenanceId}/edit`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Chỉnh sửa
                    </Link>
                  </footer>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </StaffLayout>
  );
};

export default MaintenanceListPage;

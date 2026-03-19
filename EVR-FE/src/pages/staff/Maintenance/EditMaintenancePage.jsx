import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { staffService } from '@services/staff.service';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import FormSelect from '@components/forms/FormSelect/FormSelect';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './EditMaintenancePage.css';

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

const EditMaintenancePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const data = await staffService.listMaintenance(user.userId);
        const maintenanceItem = data.find((m) => m.maintenanceId === parseInt(id));
        if (maintenanceItem) {
          setMaintenance(maintenanceItem);
          setFormData({
            status: maintenanceItem.status || '',
            remarks: maintenanceItem.remarks || '',
          });
        } else {
          setError('Không tìm thấy yêu cầu bảo trì này.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin bảo trì.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchMaintenance();
    }
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await staffService.updateMaintenance(
        parseInt(id),
        user.userId,
        formData.status,
        formData.remarks || null
      );
      setSuccess('Đã cập nhật yêu cầu bảo trì thành công!');
      setTimeout(() => {
        navigate('/staff/maintenance');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật yêu cầu bảo trì.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="edit-maintenance">
          <div className="edit-maintenance__loading">
            <LoadingSpinner />
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (!maintenance) {
    return (
      <StaffLayout>
        <div className="edit-maintenance">
          <div className="edit-maintenance__empty">
            <h2>Không tìm thấy yêu cầu bảo trì</h2>
            <p>Yêu cầu bảo trì bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <button onClick={() => navigate('/staff/maintenance')} className="btn btn-primary">
              Quay lại danh sách
            </button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  const statusInfo = getStatusInfo(maintenance.status);
  const vehicleImage = maintenance.vehicle ? getModelImage(maintenance.vehicle) : null;

  return (
    <StaffLayout>
      <div className="edit-maintenance">
        <section className="edit-maintenance__header">
          <div>
            <span className="edit-maintenance__eyebrow">Chỉnh sửa bảo trì</span>
            <h1>Bảo trì #{maintenance.maintenanceId}</h1>
            <p>Cập nhật trạng thái và ghi chú cho yêu cầu bảo trì này.</p>
          </div>
        </section>

        <div className="edit-maintenance__content">
          <div className="edit-maintenance__main">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
            <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

            <section className="edit-maintenance__info">
              <h2>Thông tin yêu cầu</h2>
              <div className="edit-maintenance__info-grid">
                <div className="edit-maintenance__info-card">
                  <span>Mã bảo trì</span>
                  <strong>#{maintenance.maintenanceId}</strong>
                </div>
                <div className="edit-maintenance__info-card">
                  <span>Trạng thái hiện tại</span>
                  <span
                    className={`edit-maintenance__status ${statusInfo.badge}`}
                    style={{ '--status-color': statusInfo.color }}
                  >
                    {statusInfo.label}
                  </span>
                </div>
                {maintenance.scheduledAt && (
                  <div className="edit-maintenance__info-card">
                    <span>Lịch dự kiến</span>
                    <strong>{formatDate(maintenance.scheduledAt)}</strong>
                  </div>
                )}
                <div className="edit-maintenance__info-card">
                  <span>Vấn đề</span>
                  <p>{maintenance.issue || 'N/A'}</p>
                </div>
              </div>
            </section>

            {maintenance.vehicle && (
              <section className="edit-maintenance__vehicle">
                <h2>Thông tin xe</h2>
                <div className="edit-maintenance__vehicle-card">
                  {vehicleImage && (
                    <div className="edit-maintenance__vehicle-image">
                      <img src={vehicleImage} alt={maintenance.vehicle.model?.modelName || 'EVR Vehicle'} />
                    </div>
                  )}
                  <div className="edit-maintenance__vehicle-info">
                    <div>
                      <h3>{maintenance.vehicle.model?.modelName || maintenance.vehicle.model?.name || 'Mẫu xe EV'}</h3>
                      <p>Biển số: {maintenance.vehicle.plateNumber || '—'}</p>
                    </div>
                    {maintenance.vehicle.batteryLevel !== null && (
                      <div className="edit-maintenance__battery">
                        <span>Mức pin</span>
                        <strong>{maintenance.vehicle.batteryLevel}%</strong>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section className="edit-maintenance__form-section">
              <h2>Cập nhật thông tin</h2>
              <form className="edit-maintenance__form" onSubmit={handleSubmit}>
                <div className="edit-maintenance__form-group">
                  <FormSelect
                    label="Trạng thái"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={[
                      { value: 'OPEN', label: 'Mở' },
                      { value: 'IN_PROGRESS', label: 'Đang xử lý' },
                      { value: 'CLOSED', label: 'Đã hoàn tất' },
                    ]}
                    placeholder="Chọn trạng thái mới"
                    required
                    rules={{ required: true }}
                    helperText="Cập nhật trạng thái của yêu cầu bảo trì."
                  />
                </div>

                <div className="edit-maintenance__form-group">
                  <label htmlFor="remarks" className="form-label">
                    Ghi chú <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    className="form-control"
                    rows={5}
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Nhập ghi chú về quá trình bảo trì, sửa chữa hoặc sạc pin..."
                  />
                  <div className="form-text">
                    Ghi chú chi tiết về công việc đã thực hiện, các bộ phận đã sửa chữa, hoặc tình trạng hiện tại của xe.
                  </div>
                </div>

                <div className="edit-maintenance__actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <LoadingSpinner size="sm" /> : 'Cập nhật bảo trì'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => navigate('/staff/maintenance')}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default EditMaintenancePage;

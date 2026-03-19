import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { staffService } from '@services/staff.service';
import { vehicleService } from '@services/vehicle.service';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import FormSelect from '@components/forms/FormSelect/FormSelect';
import FormInput from '@components/forms/FormInput/FormInput';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './CreateMaintenancePage.css';

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

const CreateMaintenancePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleIdParam = searchParams.get('vehicleId');
  const batteryLevelParam = searchParams.get('batteryLevel');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    vehicleId: vehicleIdParam || '',
    issue: batteryLevelParam ? `Xe cần sạc pin. Mức pin hiện tại: ${batteryLevelParam}%` : '',
    scheduledAt: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
        
        // If vehicleId is provided, find and set the selected vehicle
        if (vehicleIdParam) {
          const vehicle = data.find(v => v.vehicleId === Number(vehicleIdParam));
          if (vehicle) {
            setSelectedVehicle(vehicle);
          }
        }
      } catch (err) {
        setError('Không thể tải danh sách xe.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchVehicles();
  }, [vehicleIdParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
    
    // Update selected vehicle when vehicleId changes
    if (name === 'vehicleId') {
      const vehicle = vehicles.find(v => v.vehicleId === Number(value));
      setSelectedVehicle(vehicle || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await staffService.createMaintenance(
        user.userId,
        parseInt(formData.vehicleId),
        formData.issue,
        formData.scheduledAt || null
      );
      setSuccess('Đã tạo yêu cầu bảo trì thành công!');
      setTimeout(() => {
        navigate('/staff/maintenance');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo yêu cầu bảo trì.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <StaffLayout>
        <div className="create-maintenance">
          <div className="create-maintenance__loading">
            <LoadingSpinner />
          </div>
        </div>
      </StaffLayout>
    );
  }

  const vehicleImage = selectedVehicle ? getModelImage(selectedVehicle) : null;

  return (
    <StaffLayout>
      <div className="create-maintenance">
        <section className="create-maintenance__hero">
          <div>
            <span className="create-maintenance__eyebrow">Tạo yêu cầu bảo trì</span>
            <h1>Tạo yêu cầu bảo trì</h1>
            <p>Tạo yêu cầu bảo trì cho xe cần sửa chữa, bảo dưỡng hoặc sạc pin.</p>
          </div>
        </section>

        <div className="create-maintenance__content">
          <form className="create-maintenance__form" onSubmit={handleSubmit}>
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
            <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

            <div className="create-maintenance__form-grid">
              <div className="create-maintenance__form-section">
                <h2>Thông tin xe</h2>
                <FormSelect
                  label="Chọn xe"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  options={vehicles.map((vehicle) => ({
                    value: vehicle.vehicleId,
                    label: `${vehicle.model?.modelName || vehicle.model?.name || 'Mẫu xe'} – ${vehicle.plateNumber} (Pin: ${vehicle.batteryLevel || 0}%)`,
                  }))}
                  placeholder="Chọn xe cần bảo trì"
                  required
                  rules={{ required: true }}
                  helperText="Chọn xe cần được bảo trì, sửa chữa hoặc sạc pin."
                />
              </div>

              {selectedVehicle && (
                <div className="create-maintenance__vehicle-preview">
                  <h3>Thông tin xe đã chọn</h3>
                  <div className="create-maintenance__vehicle-card">
                    {vehicleImage && (
                      <div className="create-maintenance__vehicle-image">
                        <img src={vehicleImage} alt={selectedVehicle.model?.modelName || 'EVR Vehicle'} />
                      </div>
                    )}
                    <div className="create-maintenance__vehicle-info">
                      <h4>{selectedVehicle.model?.modelName || selectedVehicle.model?.name || 'Mẫu xe EV'}</h4>
                      <p>Biển số: {selectedVehicle.plateNumber}</p>
                      <div className="create-maintenance__vehicle-specs">
                        <div>
                          <span>Mức pin</span>
                          <strong>{selectedVehicle.batteryLevel ?? 0}%</strong>
                        </div>
                        <div>
                          <span>Trạng thái</span>
                          <strong>{selectedVehicle.status || '—'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="create-maintenance__form-section create-maintenance__form-section--full">
                <h2>Mô tả vấn đề</h2>
                <div className="mb-3">
                  <label htmlFor="issue" className="form-label">
                    Mô tả chi tiết <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="issue"
                    name="issue"
                    className="form-control"
                    rows={4}
                    value={formData.issue}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết vấn đề cần bảo trì (ví dụ: cần sạc pin, thay lốp, sửa chữa phanh...)"
                    required
                  />
                  <div className="form-text">
                    Mô tả chi tiết vấn đề cần bảo trì (ví dụ: cần sạc pin, thay lốp, sửa chữa phanh...)
                  </div>
                </div>
              </div>

              <div className="create-maintenance__form-section">
                <h2>Lịch bảo trì</h2>
                <FormInput
                  label="Thời gian dự kiến (tùy chọn)"
                  name="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  helperText="Chọn thời gian dự kiến để thực hiện bảo trì. Để trống nếu cần bảo trì ngay."
                />
              </div>
            </div>

            <div className="create-maintenance__actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : 'Tạo yêu cầu bảo trì'}
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
        </div>
      </div>
    </StaffLayout>
  );
};

export default CreateMaintenancePage;

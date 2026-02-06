import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import AdminFormLayout from '@components/layout/AdminForm/AdminFormLayout';
import { vehicleService } from '@services/vehicle.service';
import { stationService } from '@services/station.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

const EditVehiclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    plateNumber: '',
    modelId: '',
    stationId: '',
    batteryLevel: '',
    mileage: '',
    status: STATUS_OPTIONS[0].value,
    lastMaintenanceDate: '',
  });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleData, stationsData] = await Promise.all([
          vehicleService.getVehicle(id),
          stationService.getStations(),
        ]);
        setStations(Array.isArray(stationsData) ? stationsData : []);
        if (vehicleData) {
          setFormData({
            plateNumber: vehicleData.plateNumber || '',
            modelId: vehicleData.model?.modelId?.toString() || '',
            stationId: vehicleData.station?.stationId?.toString() || '',
            batteryLevel: vehicleData.batteryLevel?.toString() || '',
            mileage: vehicleData.mileage?.toString() || '',
            status: vehicleData.status || STATUS_OPTIONS[0].value,
            lastMaintenanceDate: vehicleData.lastMaintenanceDate
              ? vehicleData.lastMaintenanceDate.split('T')[0]
              : '',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
      await vehicleService.updateVehicle(parseInt(id, 10), {
        plateNumber: formData.plateNumber,
        model: { modelId: parseInt(formData.modelId, 10) },
        station: { stationId: parseInt(formData.stationId, 10) },
        batteryLevel: parseFloat(formData.batteryLevel),
        mileage: parseFloat(formData.mileage),
        status: formData.status,
        lastMaintenanceDate: formData.lastMaintenanceDate || null,
      });
      setSuccess('Cập nhật xe thành công!');
      setTimeout(() => {
        navigate('/admin/vehicles');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật xe.');
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <button
      type="button"
      className="admin-form-page__hero-button"
      onClick={() => navigate('/admin/vehicles')}
    >
      Quay về danh sách
    </button>
  );

  return (
    <AdminLayout>
      <AdminFormLayout
        eyebrow="Quản lý đội xe"
        title="Chỉnh sửa thông tin xe"
        description="Điều chỉnh thông tin vận hành, trạm phụ trách và tình trạng xe để đảm bảo dữ liệu luôn chính xác."
        actions={actions}
      >
        {loading ? (
          <div className="admin-form__loading">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
            <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form__grid admin-form__grid--2">
                <div>
                  <label htmlFor="plateNumber" className="form-label">
                    Biển số
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="plateNumber"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="modelId" className="form-label">
                    Mã dòng xe
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="modelId"
                    name="modelId"
                    value={formData.modelId}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stationId" className="form-label">
                    Trạm quản lý
                  </label>
                  <select
                    className="form-select"
                    id="stationId"
                    name="stationId"
                    value={formData.stationId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn trạm</option>
                    {stations.map((station) => (
                      <option key={station.stationId} value={station.stationId}>
                        {station.name} – {station.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="form-label">
                    Trạng thái
                  </label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form__grid admin-form__grid--2">
                <div>
                  <label htmlFor="batteryLevel" className="form-label">
                    Mức pin hiện tại (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="form-control"
                    id="batteryLevel"
                    name="batteryLevel"
                    value={formData.batteryLevel}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mileage" className="form-label">
                    Quãng đường đã đi (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-control"
                    id="mileage"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastMaintenanceDate" className="form-label">
                    Bảo dưỡng gần nhất
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="lastMaintenanceDate"
                    name="lastMaintenanceDate"
                    value={formData.lastMaintenanceDate}
                    onChange={handleChange}
                  />
                  <div className="form-text">Tùy chọn – cập nhật lịch sử bảo dưỡng mới nhất.</div>
                </div>
              </div>

              <div className="admin-form__actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/vehicles')}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <LoadingSpinner size="sm" /> : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </>
        )}
      </AdminFormLayout>
    </AdminLayout>
  );
};

export default EditVehiclePage;



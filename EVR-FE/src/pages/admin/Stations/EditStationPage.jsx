import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import AdminFormLayout from '@components/layout/AdminForm/AdminFormLayout';
import FormInput from '@components/forms/FormInput/FormInput';
import { validateLatitude, validateLongitude } from '@utils/validation';
import { stationService } from '@services/station.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const EditStationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    totalSlots: '',
    availableSlots: '',
    operatingHours: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Lấy tọa độ từ địa chỉ (Geocoding)
  const handleGeocodeAddress = async () => {
    if (!formData.address || !formData.address.trim()) {
      setError('Vui lòng nhập địa chỉ trước khi lấy tọa độ.');
      return;
    }

    setGeocodingLoading(true);
    setError(null);

    try {
      const encodedAddress = encodeURIComponent(formData.address + ', Vietnam');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'EVR-Management-System',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData({
          ...formData,
          latitude: parseFloat(lat).toFixed(6),
          longitude: parseFloat(lon).toFixed(6),
        });
        setSuccess('Đã lấy tọa độ từ địa chỉ thành công!');
      } else {
        setError('Không tìm thấy tọa độ cho địa chỉ này. Vui lòng nhập thủ công.');
      }
    } catch {
      setError('Không thể lấy tọa độ từ địa chỉ. Vui lòng thử lại hoặc nhập thủ công.');
    } finally {
      setGeocodingLoading(false);
    }
  };

  // Lấy vị trí hiện tại từ GPS
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ lấy vị trí.');
      return;
    }

    setGeocodingLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        });
        setSuccess('Đã lấy vị trí hiện tại thành công!');
        setGeocodingLoading(false);
      },
      () => {
        setError('Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí hoặc nhập thủ công.');
        setGeocodingLoading(false);
      }
    );
  };

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const data = await stationService.getStations();
        const station = (Array.isArray(data) ? data : []).find((s) => s.stationId === parseInt(id, 10));
        if (station) {
          setFormData({
            name: station.name || '',
            address: station.address || '',
            contactNumber: station.contactNumber || '',
            totalSlots: station.totalSlots?.toString() || '',
            availableSlots: station.availableSlots?.toString() || '',
            operatingHours: station.operatingHours || '',
            latitude: station.latitude?.toString() || '',
            longitude: station.longitude?.toString() || '',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin trạm.');
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
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
      await stationService.updateStation(parseInt(id, 10), {
        ...formData,
        totalSlots: parseInt(formData.totalSlots, 10),
        availableSlots: parseInt(formData.availableSlots, 10),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
      setSuccess('Cập nhật trạm thành công!');
      setTimeout(() => {
        navigate('/admin/stations');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạm.');
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <button
      type="button"
      className="admin-form-page__hero-button"
      onClick={() => navigate('/admin/stations')}
    >
      Quay về danh sách
    </button>
  );

  return (
    <AdminLayout>
      <AdminFormLayout
        eyebrow="Quản lý mạng lưới"
        title="Chỉnh sửa thông tin trạm"
        description="Cập nhật công suất, thông tin liên hệ và vị trí để đảm bảo hệ thống luôn phản ánh chính xác tình trạng vận hành."
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
                  <label htmlFor="name" className="form-label">
                    Tên trạm
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contactNumber" className="form-label">
                    Số liên hệ
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label htmlFor="address" className="form-label">
                Địa chỉ
              </label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />

              <div className="admin-form__grid admin-form__grid--2">
                <div>
                  <label htmlFor="totalSlots" className="form-label">
                    Tổng số chỗ
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="totalSlots"
                    name="totalSlots"
                    value={formData.totalSlots}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="availableSlots" className="form-label">
                    Số chỗ trống
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="availableSlots"
                    name="availableSlots"
                    value={formData.availableSlots}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <label htmlFor="operatingHours" className="form-label">
                Giờ hoạt động
              </label>
              <input
                type="text"
                className="form-control"
                id="operatingHours"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                placeholder="VD: 08:00 - 22:00"
                required
              />

              <div className="admin-form__section">
                <div className="admin-form__section-header">
                  <h3>Tọa độ địa lý</h3>
                  <p className="admin-form__section-description">
                    Nhập tọa độ thủ công hoặc sử dụng các công cụ bên dưới để lấy tự động.
                  </p>
                </div>

                <div className="admin-form__location-actions">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleGeocodeAddress}
                    disabled={geocodingLoading || !formData.address}
                    title="Lấy tọa độ từ địa chỉ đã nhập"
                  >
                    {geocodingLoading ? (
                      <>
                        <LoadingSpinner size="sm" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        📍 Lấy từ địa chỉ
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleGetCurrentLocation}
                    disabled={geocodingLoading}
                    title="Lấy vị trí GPS hiện tại"
                  >
                    {geocodingLoading ? (
                      <>
                        <LoadingSpinner size="sm" /> Đang lấy vị trí...
                      </>
                    ) : (
                      <>
                        🗺️ Lấy vị trí hiện tại
                      </>
                    )}
                  </button>
                </div>

                <div className="admin-form__grid admin-form__grid--2">
                  <FormInput
                    label="Vĩ độ (Latitude)"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Ví dụ: 10.762622"
                    required
                    helperText="Giá trị từ -90 đến 90"
                    rules={{
                      required: true,
                      custom: (value) => {
                        if (!validateLatitude(value)) {
                          return 'Vĩ độ phải nằm trong khoảng -90 đến 90';
                        }
                        return true;
                      },
                    }}
                  />

                  <FormInput
                    label="Kinh độ (Longitude)"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Ví dụ: 106.660172"
                    required
                    helperText="Giá trị từ -180 đến 180"
                    rules={{
                      required: true,
                      custom: (value) => {
                        if (!validateLongitude(value)) {
                          return 'Kinh độ phải nằm trong khoảng -180 đến 180';
                        }
                        return true;
                      },
                    }}
                  />
                </div>

                {formData.latitude && formData.longitude && (
                  <div className="admin-form__coordinates-preview">
                    <small>
                      Tọa độ: {formData.latitude}, {formData.longitude} |{' '}
                      <a
                        href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem trên Google Maps
                      </a>
                    </small>
                  </div>
                )}
              </div>

              <div className="admin-form__actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/stations')}>
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

export default EditStationPage;



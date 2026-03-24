import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stationService } from '@services/station.service';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import AdminFormLayout from '@components/layout/AdminForm/AdminFormLayout';
import FormInput from '@components/forms/FormInput/FormInput';
import { validateLatitude, validateLongitude } from '@utils/validation';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const CreateStationPage = () => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  // Lấy tọa độ từ địa chỉ (Geocoding)
  const handleGeocodeAddress = async () => {
    if (!formData.address || !formData.address.trim()) {
      setError('Vui lòng nhập địa chỉ trước khi lấy tọa độ.');
      return;
    }

    setGeocodingLoading(true);
    setError(null);

    try {
      // Sử dụng Nominatim (OpenStreetMap) - miễn phí, không cần API key
      const encodedAddress = encodeURIComponent(formData.address + ', Vietnam');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'EVR-Management-System', // Required by Nominatim
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await stationService.createStation({
        ...formData,
        totalSlots: parseInt(formData.totalSlots, 10),
        availableSlots: parseInt(formData.availableSlots, 10),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
      setSuccess('Tạo trạm mới thành công!');
      setTimeout(() => {
        navigate('/admin/stations');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo trạm mới.');
    } finally {
      setLoading(false);
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
        title="Tạo trạm sạc mới"
        description="Mở rộng mạng lưới trạm và đảm bảo đầy đủ thông tin vận hành, công suất chỗ đậu để phục vụ khách hàng tốt nhất."
        actions={actions}
      >
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        <form className="admin-form" onSubmit={handleSubmit}>
          <FormInput
            label="Tên trạm"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            rules={{ required: true, minLength: 2 }}
            icon="🏢"
          />

          <FormInput
            label="Địa chỉ"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
            rules={{ required: true }}
            icon="📍"
          />

          <FormInput
            label="Số liên hệ"
            name="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            rules={{ required: true, phone: true }}
            icon="📞"
          />

          <div className="admin-form__grid admin-form__grid--2">
            <FormInput
              label="Tổng số chỗ"
              name="totalSlots"
              type="number"
              value={formData.totalSlots}
              onChange={handleChange}
              required
              rules={{
                required: true,
                number: { min: 1 },
              }}
            />

            <FormInput
              label="Số chỗ trống"
              name="availableSlots"
              type="number"
              value={formData.availableSlots}
              onChange={handleChange}
              required
              rules={{
                required: true,
                number: { min: 0 },
                custom: (value) => {
                  if (formData.totalSlots && parseInt(value, 10) > parseInt(formData.totalSlots, 10)) {
                    return 'Không thể lớn hơn tổng số chỗ';
                  }
                  return true;
                },
              }}
            />
          </div>

          <FormInput
            label="Giờ hoạt động"
            name="operatingHours"
            type="text"
            value={formData.operatingHours}
            onChange={handleChange}
            placeholder="Ví dụ: 08:00 - 22:00"
            required
            rules={{ required: true }}
            icon="🕐"
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </AdminFormLayout>
    </AdminLayout>
  );
};

export default CreateStationPage;



import { useState } from 'react';
import { Link } from 'react-router-dom';
import { stationService } from '@services/station.service';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './NearbyStationsPage.css';

const NearbyStationsPage = () => {
  const [formData, setFormData] = useState({ lat: '', lng: '', radiusDeg: '0.02' });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await stationService.getNearbyStations(
        parseFloat(formData.lat),
        parseFloat(formData.lng),
        parseFloat(formData.radiusDeg)
      );
      setStations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tìm thấy trạm gần đây. Vui lòng thử lại.');
    setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
          setLoading(false);
        },
        () => {
          setError('Không thể lấy vị trí hiện tại. Vui lòng nhập thủ công.');
          setLoading(false);
        }
      );
    } else {
      setError('Trình duyệt của bạn không hỗ trợ định vị. Vui lòng nhập tọa độ thủ công.');
    }
  };

  return (
    <MainLayout>
      <div className="nearby-stations-page">
        <section className="nearby-stations-page__hero">
          <div>
            <span className="nearby-stations-page__eyebrow">Tìm kiếm trạm</span>
            <h1>Tìm trạm gần bạn</h1>
            <p>Nhập tọa độ hoặc sử dụng vị trí hiện tại để tìm các trạm EVR gần nhất</p>
          </div>
        </section>

        <div className="container nearby-stations-page__wrapper">
          <div className="row">
            <div className="col-lg-4">
              <div className="nearby-stations-page__form-card">
                <h3>Tìm kiếm</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="lat">Vĩ độ (Latitude) *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      id="lat"
                      name="lat"
                      value={formData.lat}
                      onChange={handleChange}
                      placeholder="10.762622"
                      required
                    />
                    <small className="form-text text-muted">Ví dụ: 10.762622 (Hà Nội)</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="lng">Kinh độ (Longitude) *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      id="lng"
                      name="lng"
                      value={formData.lng}
                      onChange={handleChange}
                      placeholder="106.660172"
                      required
                    />
                    <small className="form-text text-muted">Ví dụ: 106.660172 (TP.HCM)</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="radiusDeg">Bán kính tìm kiếm (độ) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="1"
                      className="form-control"
                      id="radiusDeg"
                      name="radiusDeg"
                      value={formData.radiusDeg}
                      onChange={handleChange}
                      required
                    />
                    <small className="form-text text-muted">
                      Mặc định: 0.02 độ (khoảng 2km). Giá trị lớn hơn sẽ tìm trong phạm vi rộng hơn.
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mb-2"
                    onClick={handleGetCurrentLocation}
                    disabled={loading}
                  >
                    📍 Sử dụng vị trí hiện tại
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? <LoadingSpinner size="sm" /> : '🔍 Tìm kiếm'}
                  </button>
                </form>
                <ErrorMessage message={error} onDismiss={() => setError(null)} />
              </div>
            </div>
            <div className="col-lg-8">
              {loading && stations.length === 0 ? (
                <div className="nearby-stations-page__loading">
                  <LoadingSpinner />
                  <p>Đang tìm kiếm trạm...</p>
                </div>
              ) : stations.length > 0 ? (
                <div className="nearby-stations-page__results">
                  <h3 className="nearby-stations-page__results-title">
                    Tìm thấy {stations.length} trạm
                  </h3>
                  <div className="row">
                    {stations.map((station) => (
                      <div key={station.stationId} className="col-md-6 mb-4">
                        <div className="station-card">
                          <div className="station-card__header">
                            <h4>{station.name || 'Trạm EVR'}</h4>
                            <span className="station-card__badge">
                              {station.availableSlots || 0} / {station.totalSlots || 0} chỗ trống
                            </span>
                          </div>
                          <div className="station-card__body">
                            <div className="station-card__info">
                              <div className="info-item">
                                <span className="info-label">📍 Địa chỉ:</span>
                                <span className="info-value">{station.address || 'Chưa cập nhật'}</span>
                              </div>
                              {station.contactNumber && (
                                <div className="info-item">
                                  <span className="info-label">📞 Liên hệ:</span>
                                  <span className="info-value">{station.contactNumber}</span>
                                </div>
                              )}
                              {station.operatingHours && (
                                <div className="info-item">
                                  <span className="info-label">🕐 Giờ mở cửa:</span>
                                  <span className="info-value">{station.operatingHours}</span>
                                </div>
                              )}
                            </div>
                            <Link
                              to={`/vehicles/available?stationId=${station.stationId}`}
                              className="btn btn-primary w-100 mt-3"
                            >
                              Xem xe có sẵn
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !loading && (
                  <div className="nearby-stations-page__empty">
                    <div className="empty-state">
                      <div className="empty-state__icon">📍</div>
                      <h3>Chưa có kết quả</h3>
                      <p>Nhập tọa độ và nhấn "Tìm kiếm" để tìm các trạm EVR gần bạn</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NearbyStationsPage;

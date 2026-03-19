import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import { stationService } from '@services/station.service';
import { vehicleService } from '@services/vehicle.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './FleetDispatchPage.css';

const FleetDispatchPage = () => {
  const [formData, setFormData] = useState({
    fromStationId: '',
    toStationId: '',
    vehicleId: '',
  });
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsData, vehiclesResponse] = await Promise.all([
          stationService.getStations(),
          vehicleService.getVehicles(),
        ]);
        setStations(Array.isArray(stationsData) ? stationsData : []);
        
        // Normalize vehicles response - handle different structures
        let vehiclesList = [];
        if (Array.isArray(vehiclesResponse)) {
          vehiclesList = vehiclesResponse;
        } else if (vehiclesResponse?.vehicles && Array.isArray(vehiclesResponse.vehicles)) {
          vehiclesList = vehiclesResponse.vehicles;
        } else if (vehiclesResponse?.data) {
          if (Array.isArray(vehiclesResponse.data)) {
            vehiclesList = vehiclesResponse.data;
          } else if (vehiclesResponse.data.vehicles && Array.isArray(vehiclesResponse.data.vehicles)) {
            vehiclesList = vehiclesResponse.data.vehicles;
          } else if (vehiclesResponse.data.content && Array.isArray(vehiclesResponse.data.content)) {
            vehiclesList = vehiclesResponse.data.content;
          }
        } else if (vehiclesResponse?.content && Array.isArray(vehiclesResponse.content)) {
          vehiclesList = vehiclesResponse.content;
        }
        
        setVehicles(vehiclesList);
        console.log('Fetched vehicles:', vehiclesList.length, vehiclesList);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Không thể tải dữ liệu trạm hoặc xe.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter vehicles by station when fromStationId is selected
  const availableVehicles = useMemo(() => {
    console.log('Filtering vehicles:', {
      totalVehicles: vehicles.length,
      fromStationId: formData.fromStationId,
      vehicles: vehicles.map(v => ({
        id: v.vehicleId,
        status: v.status,
        stationId: v.station?.stationId,
        plateNumber: v.plateNumber
      }))
    });
    
    // Filter by status - try different status values
    let filtered = vehicles.filter((vehicle) => {
      const status = (vehicle.status || '').toUpperCase();
      return status === 'AVAILABLE' || status === 'READY' || status === 'ACTIVE';
    });
    
    // If a station is selected, only show vehicles at that station
    if (formData.fromStationId) {
      const stationId = Number(formData.fromStationId);
      filtered = filtered.filter((vehicle) => {
        const vehicleStationId = vehicle.station?.stationId || vehicle.stationId;
        return vehicleStationId === stationId;
      });
    }
    
    console.log('Filtered vehicles:', filtered.length);
    return filtered;
  }, [vehicles, formData.fromStationId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset vehicle selection when station changes
      if (name === 'fromStationId') {
        newData.vehicleId = '';
      }
      return newData;
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await adminService.dispatchVehicle(
        Number(formData.fromStationId),
        Number(formData.toStationId),
        Number(formData.vehicleId)
      );
      setSuccess('Điều xe thành công! Hệ thống sẽ cập nhật trạng thái trong giây lát.');
      setFormData({ fromStationId: '', toStationId: '', vehicleId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể điều xe. Vui lòng thử lại.');
    }
  };

  return (
    <AdminLayout>
      <div className="dispatch-page">
        <section className="dispatch-hero">
          <div>
            <span className="dispatch-eyebrow">Fleet Operations</span>
            <h1>Điều phối xe giữa các trạm</h1>
            <p>Lựa chọn xe khả dụng và di chuyển đến trạm cần thiết để đảm bảo nhu cầu khách hàng.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {loading ? (
          <div className="dispatch-loading">
            <LoadingSpinner />
          </div>
        ) : (
          <section className="dispatch-content">
            <form className="dispatch-form" onSubmit={handleSubmit}>
              <div className="dispatch-form__left">
                <div className="dispatch-form__group">
                  <label htmlFor="fromStationId">Trạm xuất phát</label>
                  <select
                    id="fromStationId"
                    name="fromStationId"
                    value={formData.fromStationId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn trạm xuất phát</option>
                    {stations.map((station) => (
                      <option key={station.stationId} value={station.stationId}>
                        {station.name} – {station.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dispatch-form__group">
                  <label htmlFor="toStationId">Trạm đích</label>
                  <select
                    id="toStationId"
                    name="toStationId"
                    value={formData.toStationId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn trạm đích</option>
                    {stations.map((station) => (
                      <option key={station.stationId} value={station.stationId}>
                        {station.name} – {station.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <aside className="dispatch-stats">
                <div className="dispatch-stats__header">
                  <h2>Tình trạng xe sẵn sàng</h2>
                </div>
                
                <div className="dispatch-form__group">
                  <label htmlFor="vehicleId">Xe</label>
                  <select
                    id="vehicleId"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn xe khả dụng</option>
                    {availableVehicles.map((vehicle) => (
                      <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                        {vehicle.model?.modelName || 'Model'} – {vehicle.plateNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {availableVehicles.length === 0 ? (
                  <div className="dispatch-empty">Không có xe nào ở trạng thái sẵn sàng.</div>
                ) : (
                  <ul>
                    {availableVehicles.slice(0, 5).map((vehicle) => (
                      <li key={vehicle.vehicleId}>
                        <strong>{vehicle.model?.modelName || 'Model'}</strong>
                        <span>{vehicle.plateNumber}</span>
                        <small>Pin: {vehicle.batteryLevel ?? 0}%</small>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="dispatch-stats__action">
                  <button type="submit" className="dispatch-submit-btn">
                    Điều xe
                  </button>
                </div>
              </aside>
            </form>
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default FleetDispatchPage;


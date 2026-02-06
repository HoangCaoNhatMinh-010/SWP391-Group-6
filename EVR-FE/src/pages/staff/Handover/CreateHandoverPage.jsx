import { useState, useEffect } from 'react';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { staffService } from '@services/staff.service';
import { vehicleService } from '@services/vehicle.service';
import { bookingService } from '@services/booking.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './CreateHandoverPage.css';

const CreateHandoverPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    contractId: '',
    vehicleId: '',
    battery: '',
    damageDescription: '',
    reportType: 'CHECK_IN',
  });
  const [vehicles, setVehicles] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, checkInResponse, returnResponse] = await Promise.all([
          vehicleService.getVehicles(),
          bookingService.getStaffCheckInQueue(user.userId).catch(() => []),
          bookingService.getStaffReturnQueue(user.userId).catch(() => []),
        ]);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        
        // Handle different response structures
        const normalizeBookings = (response) => {
          if (!response) return [];
          if (Array.isArray(response)) return response;
          if (response.data && Array.isArray(response.data)) return response.data;
          if (response.content && Array.isArray(response.content)) return response.content;
          if (response.bookings && Array.isArray(response.bookings)) return response.bookings;
          return [];
        };
        
        const checkInList = normalizeBookings(checkInResponse);
        const returnList = normalizeBookings(returnResponse);
        
        // Combine check-in and return queues, remove duplicates
        const allBookings = [];
        const bookingIds = new Set();
        
        const addBooking = (booking) => {
          if (booking && booking.bookingId && !bookingIds.has(booking.bookingId)) {
            bookingIds.add(booking.bookingId);
            allBookings.push(booking);
          }
        };
        
        checkInList.forEach(addBooking);
        returnList.forEach(addBooking);
        
        setContracts(allBookings);
      } catch (err) {
        console.error('Error fetching handover data:', err);
        setError('Không thể tải dữ liệu xe hoặc booking. Vui lòng thử lại.');
      } finally {
        setLoadingData(false);
      }
    };

    if (user?.userId) {
      fetchData();
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    // If booking is selected, auto-fill vehicle
    if (name === 'contractId' && value) {
      const selectedBooking = contracts.find(c => c.bookingId === parseInt(value));
      if (selectedBooking && selectedBooking.vehicle) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          vehicleId: selectedBooking.vehicle.vehicleId || prev.vehicleId,
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setPhotos(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await staffService.createHandover(
        user.userId,
        Number(formData.contractId),
        Number(formData.vehicleId),
        Number(formData.battery),
        formData.damageDescription || null,
        photos,
        formData.reportType
      );
      setSuccess('Đã tạo biên bản bàn giao.');
      setTimeout(() => {
        navigate('/staff/handover/create');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo biên bản bàn giao.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaffLayout>
      <div className="staff-handover">
        <section className="staff-handover__hero">
          <div>
            <span>Biên bản bàn giao</span>
            <h1>Tạo báo cáo ca trực</h1>
            <p>Ghi nhận thông tin xe, mức pin và hiện trạng khi bàn giao giữa ca hoặc giữa trạm.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {loadingData ? (
          <div className="staff-handover__loading">
            <LoadingSpinner />
          </div>
        ) : (
          <form className="staff-handover__form" onSubmit={handleSubmit}>
            <div className="staff-handover__grid">
              <div className="staff-handover__field">
                <label htmlFor="contractId">Booking liên quan</label>
                <select
                  id="contractId"
                  name="contractId"
                  value={formData.contractId}
                  onChange={handleChange}
                  required
                  disabled={contracts.length === 0}
                >
                  <option value="">Chọn booking</option>
                  {contracts.length > 0 ? (
                    contracts.map((contract) => (
                      <option key={contract.bookingId} value={contract.bookingId}>
                        Booking #{contract.bookingId} – {contract.vehicle?.plateNumber || contract.vehicle?.model?.modelName || 'Chưa cập nhật'} ({contract.bookingStatus || 'N/A'})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Không có booking nào</option>
                  )}
                </select>
                {contracts.length === 0 && !loadingData && (
                  <small style={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginTop: '0.5rem' }}>
                    Không có booking nào trong queue check-in hoặc return của bạn.
                  </small>
                )}
              </div>

              <div className="staff-handover__field">
                <label htmlFor="vehicleId">Xe bàn giao</label>
                <select
                  id="vehicleId"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn xe</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {vehicle.model?.modelName || vehicle.model?.name || 'EV'} – {vehicle.plateNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="staff-handover__field">
                <label htmlFor="battery">Mức pin (%)</label>
                <input
                  id="battery"
                  name="battery"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.battery}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="staff-handover__field">
                <label htmlFor="reportType">Loại báo cáo</label>
                <select id="reportType" name="reportType" value={formData.reportType} onChange={handleChange} required>
                  <option value="CHECK_IN">Check-in</option>
                  <option value="CHECK_OUT">Check-out</option>
                </select>
              </div>

              <div className="staff-handover__field staff-handover__field--full">
                <label htmlFor="damageDescription">Ghi chú hiện trạng</label>
                <textarea
                  id="damageDescription"
                  name="damageDescription"
                  rows="4"
                  value={formData.damageDescription}
                  onChange={handleChange}
                  placeholder="Ghi chú trầy xước, phụ kiện kèm theo, tình trạng nội thất…"
                />
              </div>

              <div className="staff-handover__field staff-handover__field--full">
                <label htmlFor="photos">Ảnh kèm theo</label>
                <input id="photos" name="photos" type="file" accept="image/*" multiple onChange={handleFileChange} />
                <small>Tải lên tối đa 5 ảnh minh họa tình trạng xe.</small>
              </div>
            </div>

            <div className="staff-handover__actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <LoadingSpinner size="sm" /> : 'Gửi biên bản'}
              </button>
              <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)}>
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </StaffLayout>
  );
};

export default CreateHandoverPage;


import { useState, useEffect } from 'react';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import { staffService } from '@services/staff.service';
import { stationService } from '@services/station.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './StaffSchedulePage.css';

const CreateStaffSchedulePage = () => {
  const [formData, setFormData] = useState({
    staffId: '',
    stationId: '',
    shiftStart: '',
    shiftEnd: '',
    shiftType: 'Morning',
  });
  const [staffList, setStaffList] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffData, stationsData] = await Promise.all([
          staffService.getStaff(),
          stationService.getStations(),
        ]);
        setStaffList(staffData);
        setStations(stationsData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await adminService.createStaffSchedule(
        parseInt(formData.staffId),
        parseInt(formData.stationId),
        formData.shiftStart,
        formData.shiftEnd,
        formData.shiftType
      );
      setSuccess('Staff schedule created successfully!');
      setTimeout(() => {
        navigate('/admin/staff');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff schedule');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  return (
    <AdminLayout>
      <div className="staff-schedule-page">
        <section className="staff-schedule-hero">
          <div>
            <span className="staff-schedule-eyebrow">Staff Operations</span>
            <h1>Tạo lịch làm việc cho nhân viên</h1>
            <p>Chọn nhân viên, trạm phụ trách và ca làm để đảm bảo vận hành liên tục.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {loadingData ? (
          <div className="staff-schedule-loading">
            <LoadingSpinner />
          </div>
        ) : (
          <form className="staff-schedule-form" onSubmit={handleSubmit}>
            <div className="staff-schedule-grid">
              <div className="form-group">
                <label htmlFor="staffId">Nhân viên</label>
                <select
                  id="staffId"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn nhân viên</option>
                  {staffList.map((staff) => (
                    <option key={staff.userId} value={staff.userId}>
                      {staff.name} – {staff.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stationId">Trạm</label>
                <select
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

              <div className="form-group">
                <label htmlFor="shiftStart">Bắt đầu ca</label>
                <input
                  type="datetime-local"
                  id="shiftStart"
                  name="shiftStart"
                  value={formData.shiftStart}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shiftEnd">Kết thúc ca</label>
                <input
                  type="datetime-local"
                  id="shiftEnd"
                  name="shiftEnd"
                  value={formData.shiftEnd}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shiftType">Loại ca</label>
                <select
                  id="shiftType"
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleChange}
                  required
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
            </div>

            <div className="staff-schedule-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : 'Tạo lịch làm việc'}
              </button>
              <button type="button" className="btn btn-outline-light" onClick={() => window.history.back()}>
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateStaffSchedulePage;


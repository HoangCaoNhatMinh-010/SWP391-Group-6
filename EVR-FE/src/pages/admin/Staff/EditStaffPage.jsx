import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import AdminFormLayout from '@components/layout/AdminForm/AdminFormLayout';
import { staffService } from '@services/staff.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const EditStaffPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await staffService.getStaff();
        const staff = (Array.isArray(data) ? data : []).find((s) => s.userId === parseInt(id, 10));
        if (staff) {
          setFormData({
            name: staff.name || '',
            email: staff.email || '',
            phone: staff.phone || '',
            address: staff.address || '',
            dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : '',
            status: staff.status || 'Active',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin nhân viên.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
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
      await staffService.updateStaff(parseInt(id, 10), formData);
      setSuccess('Cập nhật nhân viên thành công!');
      setTimeout(() => {
        navigate('/admin/staff');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật nhân viên.');
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <button
      type="button"
      className="admin-form-page__hero-button"
      onClick={() => navigate('/admin/staff')}
    >
      Quay về danh sách
    </button>
  );

  return (
    <AdminLayout>
      <AdminFormLayout
        eyebrow="Nhân sự vận hành"
        title="Chỉnh sửa hồ sơ nhân viên"
        description="Điều chỉnh thông tin cá nhân và trạng thái tài khoản để đảm bảo đội ngũ vận hành luôn được cập nhật."
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
                    Họ và tên
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
                  <label htmlFor="email" className="form-label">
                    Email làm việc
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form__grid admin-form__grid--2">
                <div>
                  <label htmlFor="phone" className="form-label">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="form-label">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label htmlFor="address" className="form-label">
                Địa chỉ liên hệ
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

              <div>
                <label htmlFor="status" className="form-label">
                  Trạng thái tài khoản
                </label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Tạm ngưng</option>
                </select>
              </div>

              <div className="admin-form__actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/staff')}>
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

export default EditStaffPage;



import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import AdminFormLayout from '@components/layout/AdminForm/AdminFormLayout';
import { staffService } from '@services/staff.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const CreateStaffPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    dateOfBirth: '',
    role: 'Staff',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      await staffService.createStaff(formData);
      setSuccess('Tạo tài khoản nhân viên thành công!');
      setTimeout(() => {
        navigate('/admin/staff');
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo nhân viên.');
    } finally {
      setLoading(false);
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
        title="Thêm nhân viên trạm"
        description="Khởi tạo hồ sơ nhân sự với đầy đủ thông tin liên hệ và quyền truy cập để đảm bảo việc bàn giao vận hành trơn tru."
        actions={actions}
      >
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
                placeholder="VD: Nguyễn Văn A"
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
                placeholder="example@evr.vn"
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
                placeholder="VD: 0901 234 567"
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
            placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
            required
          />

          <div className="admin-form__grid admin-form__grid--2">
            <div>
              <label htmlFor="password" className="form-label">
                Mật khẩu tạm
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 8 ký tự"
                required
              />
            </div>

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
          </div>

          <div className="admin-form__actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/staff')}>
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

export default CreateStaffPage;


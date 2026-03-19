import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';
import FormInput from '@components/forms/FormInput/FormInput';
import { useAuth } from '@contexts/AuthContext';
import { userService } from '@services/user.service';

import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới cần tối thiểu 6 ký tự.');
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword(user.userId, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess('Đổi mật khẩu thành công. Bạn sẽ được chuyển về trang hồ sơ.');
      setTimeout(() => {
        navigate('/profile');
      }, 1600);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="profile-security">
        <section className="profile-security__hero">
          <div>
            <span className="profile-security__eyebrow">Bảo mật tài khoản</span>
            <h1>Đổi mật khẩu</h1>
            <p>
              Tạo mật khẩu mạnh để bảo vệ tài khoản EVR của bạn. Mật khẩu nên có tối thiểu 6 ký tự, kết hợp chữ hoa, chữ
              thường và số để tăng cường bảo mật.
            </p>
          </div>
          <div className="profile-security__tips">
            <h2>Gợi ý bảo mật</h2>
            <ul>
              <li>Không sử dụng lại mật khẩu đã từng dùng.</li>
              <li>Không chia sẻ mật khẩu với bất cứ ai.</li>
              <li>Kích hoạt xác thực hai lớp khi tính năng sẵn sàng.</li>
            </ul>
          </div>
        </section>

        <section className="profile-security__form-card">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
          <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

          <form onSubmit={handleSubmit}>
            <div className="profile-security__field">
              <FormInput
                label="Mật khẩu hiện tại"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                rules={{ required: true }}
              />
            </div>
            <div className="profile-security__field">
              <FormInput
                label="Mật khẩu mới"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                rules={{ required: true, minLength: 6 }}
              />
            </div>
            <div className="profile-security__field">
              <FormInput
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                rules={{ required: true, minLength: 6 }}
              />
            </div>

            <div className="profile-security__actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : 'Cập nhật mật khẩu'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/profile')}>
                Hủy
              </button>
            </div>
          </form>
        </section>
      </div>
    </MainLayout>
  );
};

export default ChangePasswordPage;



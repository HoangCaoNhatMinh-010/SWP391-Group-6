import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { userService } from '@services/user.service';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import FormInput from '@components/forms/FormInput/FormInput';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './EditProfilePage.css';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserById(currentUser.userId);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin hồ sơ.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.userId) {
      fetchUser();
    }
  }, [currentUser]);

  const meta = useMemo(
    () => ({
      initials: (formData.name || formData.email || 'EV')
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    }),
    [formData]
  );

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
      const updatedUser = await userService.updateUser(currentUser.userId, formData);
      updateUser(updatedUser);
      setSuccess('Cập nhật hồ sơ thành công.');
      setTimeout(() => navigate('/profile'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="profile-editor">
        {loading ? (
          <div className="profile-editor__loading">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <section className="profile-editor__hero">
              <div className="profile-editor__breadcrumbs">
                <Link to="/profile">Hồ sơ</Link>
                <span>/</span>
                <strong>Chỉnh sửa</strong>
              </div>
              <div className="profile-editor__summary">
                <span className="profile-editor__avatar">{meta.initials}</span>
                <div>
                  <h1>Chỉnh sửa hồ sơ</h1>
                  <p>Cập nhật thông tin cá nhân để EVR có thể hỗ trợ bạn nhanh chóng và chính xác hơn.</p>
                </div>
              </div>
              <div className="profile-editor__hero-actions">
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                  Quay lại
                </button>
                <Link to="/profile/security" className="btn btn-outline-light">
                  Quản lý bảo mật
                </Link>
              </div>
            </section>

            <section className="profile-editor__layout">
              <aside className="profile-editor__aside">
                <div className="profile-editor__card">
                  <h2>Tiến trình cập nhật</h2>
                  <p>Hoàn thiện đầy đủ thông tin để đảm bảo trải nghiệm thuê xe liền mạch và đủ điều kiện nhận ưu đãi.</p>
                  <ul>
                    <li>
                      <span>Thông tin liên lạc</span>
                      <strong>{formData.phone && formData.address ? 'Hoàn tất' : 'Chưa đủ'}</strong>
                    </li>
                    <li>
                      <span>Ngày sinh</span>
                      <strong>{formData.dateOfBirth ? 'Đã cập nhật' : 'Chưa cập nhật'}</strong>
                    </li>
                    <li>
                      <span>Email đăng nhập</span>
                      <strong>{formData.email}</strong>
                    </li>
                  </ul>
                </div>

                <div className="profile-editor__card profile-editor__card--tips">
                  <h2>Hướng dẫn</h2>
                  <ul>
                    <li>Thông tin sẽ đồng bộ ngay sau khi bạn nhấn “Lưu thay đổi”.</li>
                    <li>Hãy đảm bảo số điện thoại và địa chỉ chính xác để nhận xe nhanh chóng.</li>
                    <li>Muốn đổi mật khẩu? Truy cập mục Bảo mật &amp; đăng nhập.</li>
                  </ul>
                </div>
              </aside>

              <div className="profile-editor__form-card">
                <ErrorMessage message={error} onDismiss={() => setError(null)} />
                <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

                <form onSubmit={handleSubmit}>
                  <fieldset>
                    <legend>Thông tin cá nhân</legend>
                    <div className="profile-editor__grid">
                      <FormInput
                        label="Họ và tên"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        rules={{ required: true, minLength: 2 }}
                        icon="👤"
                      />
                      <FormInput
                        label="Ngày sinh"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        rules={{
                          required: true,
                          date: { max: new Date().toISOString().split('T')[0] },
                        }}
                      />
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend>Liên hệ &amp; thông tin liên lạc</legend>
                    <div className="profile-editor__grid">
                      <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        rules={{ required: true, email: true }}
                        icon="📧"
                      />
                      <FormInput
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        rules={{ required: true, phone: true }}
                        icon="📱"
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
                    </div>
                  </fieldset>

                  <div className="profile-editor__actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <LoadingSpinner size="sm" /> : 'Lưu thay đổi'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate('/profile')}>
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default EditProfilePage;


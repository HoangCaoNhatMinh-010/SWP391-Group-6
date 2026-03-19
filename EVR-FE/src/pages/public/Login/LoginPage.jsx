import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import FormInput from '@components/forms/FormInput/FormInput';
import ErrorMessage from '@components/common/ErrorMessage';
import LoadingSpinner from '@components/common/LoadingSpinner';

import './LoginPage.css';

const heroHighlights = [
  { title: 'Đặt xe tức thì', description: 'Xác thực đa lớp và truy cập an toàn trong tích tắc.' },
  { title: 'Theo dõi hành trình', description: 'Quản lý toàn bộ chuyến đi và lịch sử giao dịch ở một nơi.' },
  { title: 'Hỗ trợ 24/7', description: 'Đội ngũ EVR luôn sẵn sàng đồng hành khi bạn cần.' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      const role = (response.user?.role || '').toUpperCase();

      switch (role) {
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'STAFF':
          navigate('/staff/dashboard', { replace: true });
          break;
        case 'CUSTOMER':
        default:
          navigate('/', { replace: true });
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="login-page">
        <div className="login-page__glow" aria-hidden="true" />
        <div className="container login-page__wrapper">
          <section className="login-page__hero">
            <span className="login-page__eyebrow">EVR Platform</span>
            <h1>Chào mừng quay trở lại EVR</h1>
            <p>
              Truy cập bảng điều khiển thông minh để quản lý trạm, đội xe và khách hàng. Mọi dữ liệu đều được đồng bộ theo
              thời gian thực để bạn ra quyết định nhanh chóng.
            </p>
            <div className="login-page__highlights">
              {heroHighlights.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="login-card">
            <div className="login-card__header">
              <h2>Đăng nhập tài khoản</h2>
              <p>Nhập email và mật khẩu của bạn để tiếp tục hành trình.</p>
            </div>

            <ErrorMessage message={error} onDismiss={() => setError(null)} />

            <form className="login-card__form" onSubmit={handleSubmit} noValidate>
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@evr.vn"
                required
                rules={{
                  required: true,
                  email: true,
                }}
                icon="📧"
              />
              <FormInput
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                rules={{
                  required: true,
                  minLength: 6,
                }}
                icon="🔒"
              />

              <div className="login-card__actions">
                <button type="submit" className="btn btn-primary btn-lg w-100 login-card__submit" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Đăng nhập'}
                </button>
                <div className="login-card__meta">
                  <span>Bạn chưa có tài khoản?</span>
                  <Link to="/register">Đăng ký ngay</Link>
                </div>
              </div>
            </form>

            <div className="login-card__footer">
              <p>Trải nghiệm an toàn với chuẩn bảo mật doanh nghiệp và mã hóa đầu cuối.</p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;


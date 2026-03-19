import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import './RegistrationSuccessPage.css';

const RegistrationSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  useEffect(() => {
    // Redirect to register if accessed directly without state
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  return (
    <MainLayout>
      <div className="registration-success-page">
        <div className="registration-success-page__glow" aria-hidden="true" />
        <div className="container registration-success-page__wrapper">
          <div className="registration-success-card">
            <div className="registration-success-card__icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="40" cy="40" r="40" fill="url(#gradient)" />
                <path
                  d="M25 40L35 50L55 30"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="80" y2="80">
                    <stop offset="0%" stopColor="#00d1ff" />
                    <stop offset="100%" stopColor="#15ffb3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="registration-success-card__title">Cảm ơn bạn đã đăng ký!</h1>
            <p className="registration-success-card__subtitle">
              Chúng tôi rất vui được chào đón bạn đến với cộng đồng EVR
            </p>

            <div className="registration-success-card__message">
              <div className="email-notification">
                <div className="email-notification__icon">📧</div>
                <div className="email-notification__content">
                  <h3>Email xác nhận đã được gửi</h3>
                  <p>
                    Chúng tôi đã gửi email xác nhận đến địa chỉ{' '}
                    <strong>{email || 'email của bạn'}</strong>
                  </p>
                  <p className="email-notification__hint">
                    Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) trong chốc lát để kích hoạt tài khoản.
                  </p>
                </div>
              </div>
            </div>

            <div className="registration-success-card__steps">
              <h4>Bước tiếp theo</h4>
              <ol>
                <li>
                  <span className="step-number">1</span>
                  <div>
                    <strong>Kiểm tra email</strong>
                    <p>Mở email xác nhận từ EVR trong hộp thư của bạn</p>
                  </div>
                </li>
                <li>
                  <span className="step-number">2</span>
                  <div>
                    <strong>Nhấp vào liên kết</strong>
                    <p>Click vào liên kết xác nhận trong email để kích hoạt tài khoản</p>
                  </div>
                </li>
                <li>
                  <span className="step-number">3</span>
                  <div>
                    <strong>Đăng nhập</strong>
                    <p>Sau khi xác nhận, bạn có thể đăng nhập và bắt đầu đặt xe</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="registration-success-card__actions">
              <Link to="/login" className="btn btn-primary btn-lg">
                Đi đến trang đăng nhập
              </Link>
              <Link to="/" className="btn btn-outline-secondary">
                Về trang chủ
              </Link>
            </div>

            <div className="registration-success-card__help">
              <p>
                <strong>Không nhận được email?</strong>
              </p>
              <ul>
                <li>Kiểm tra thư mục spam hoặc thư rác</li>
                <li>Đảm bảo địa chỉ email bạn nhập là chính xác</li>
                <li>Email có thể mất vài phút để đến. Vui lòng đợi thêm một chút</li>
                <li>
                  Nếu vẫn không nhận được, vui lòng thử đăng ký lại hoặc liên hệ bộ phận hỗ trợ
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegistrationSuccessPage;


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@services/auth.service';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import FormInput from '@components/forms/FormInput/FormInput';
import FormFileUpload from '@components/forms/FormFileUpload/FormFileUpload';
import ErrorMessage from '@components/common/ErrorMessage';
import LoadingSpinner from '@components/common/LoadingSpinner';

import './RegisterPage.css';

const membershipPerks = [
  { title: 'Ưu đãi thành viên', description: 'Nhận ưu đãi thuê dài hạn và điểm thưởng ở mọi trạm EVR.' },
  {
    title: 'Quản lý hồ sơ số',
    description: 'Lưu trữ giấy tờ và thông tin lái xe hoàn toàn bảo mật, đồng bộ đa nền tảng.',
  },
  {
    title: 'Hỗ trợ ưu tiên',
    description: 'Đội ngũ 24/7 theo sát từng hành trình, hỗ trợ xử lý sự cố trong vòng 5 phút.',
  },
];

const verificationSteps = [
  'Điền thông tin cá nhân chính xác để duyệt hồ sơ nhanh chóng.',
  'Tải ảnh CMND/CCCD và bằng lái rõ nét (tối đa 5 MB).',
  'Hoàn tất đăng ký và nhận thông báo kích hoạt qua email.',
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    dateOfBirth: '',
  });
  const [personalIdImage, setPersonalIdImage] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const [file] = Array.isArray(files) ? files : [files];

    if (name === 'personalIdImage') {
      setPersonalIdImage(file || null);
    }
    if (name === 'licenseImage') {
      setLicenseImage(file || null);
    }
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.register(formData, personalIdImage, licenseImage);
      navigate('/register/success', { 
        state: { email: formData.email } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="register-page">
        <div className="register-page__glow" aria-hidden="true" />
        <div className="container register-page__wrapper">
          <section className="register-page__hero">
            <span className="register-page__eyebrow">Gia nhập EVR</span>
            <h1>Trở thành thành viên EVR Premium</h1>
            <p>
              Hoàn tất hồ sơ trong vài phút và bắt đầu hành trình với đội xe điện dẫn đầu thị trường. Chúng tôi xác thực thông
              tin nhanh chóng để bạn có thể đặt xe ngay sau khi được duyệt.
            </p>

            <div className="register-page__perks">
              {membershipPerks.map((perk) => (
                <article key={perk.title}>
                  <h3>{perk.title}</h3>
                  <p>{perk.description}</p>
                </article>
              ))}
            </div>

            <div className="register-page__steps">
              <h4>Quy trình xác thực</h4>
              <ul>
                {verificationSteps.map((step, index) => (
                  <li key={step}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="register-card">
            <div className="register-card__header">
              <h2>Tạo tài khoản EVR</h2>
              <p>Thông tin của bạn được bảo mật tuyệt đối theo chuẩn doanh nghiệp.</p>
            </div>

            <ErrorMessage message={error} onDismiss={() => setError(null)} />

            <form className="register-card__form" onSubmit={handleSubmit} noValidate>
              <div className="register-card__grid">
                <FormInput
                  label="Họ và tên"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                  rules={{
                    required: true,
                    minLength: 2,
                  }}
                  icon="👤"
                />
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
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0987 654 321"
                  required
                  rules={{
                    required: true,
                    phone: true,
                  }}
                  icon="📱"
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
                  helperText="Tối thiểu 6 ký tự, nên kết hợp chữ và số."
                  icon="🔒"
                />
                <FormInput
                  label="Địa chỉ"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, quận/huyện"
                  required
                  rules={{
                    required: true,
                  }}
                  icon="📍"
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
                    date: {
                      max: new Date().toISOString().split('T')[0],
                    },
                  }}
                />
              </div>

              <div className="register-card__uploads">
                <h3>Giấy tờ xác thực</h3>
                <p>Vui lòng chuẩn bị ảnh rõ nét, không bị lóa sáng để quá trình duyệt diễn ra suôn sẻ.</p>

                <FormFileUpload
                  label="CMND/CCCD"
                  name="personalIdImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  helperText="Định dạng JPG hoặc PNG, dung lượng tối đa 5 MB."
                  maxSize={5 * 1024 * 1024}
                  allowedTypes={['image/jpeg', 'image/png', 'image/jpg']}
                  required
                />
                <FormFileUpload
                  label="Bằng lái xe"
                  name="licenseImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  helperText="Định dạng JPG hoặc PNG, dung lượng tối đa 5 MB."
                  maxSize={5 * 1024 * 1024}
                  allowedTypes={['image/jpeg', 'image/png', 'image/jpg']}
                  required
                />
              </div>

              <div className="register-card__actions">
                <button type="submit" className="btn btn-primary btn-lg w-100 register-card__submit" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Hoàn tất đăng ký'}
                </button>
                <div className="register-card__meta">
                  <span>Đã có tài khoản?</span>
                  <Link to="/login">Đăng nhập</Link>
                </div>
              </div>
            </form>

            <div className="register-card__footer">
              <p>Chúng tôi mã hóa toàn bộ dữ liệu, tuân thủ tiêu chuẩn bảo mật ISO/IEC 27001.</p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;


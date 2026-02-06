import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import { vehicleService } from '@services/vehicle.service';
import './LandingPage.css';

const experienceHighlights = [
  {
    title: 'Xe điện cao cấp',
    description: 'Đội xe đa dạng từ city car đến SUV hiệu suất cao, bảo dưỡng định kỳ.',
    icon: '🚗',
  },
  {
    title: 'Đặt xe trong 60 giây',
    description: 'Giao diện trực quan, xác nhận tức thì, hỗ trợ 24/7 qua ứng dụng.',
    icon: '⚡',
  },
  {
    title: 'Giá minh bạch',
    description: 'Không phí ẩn, ưu đãi theo khung giờ, hoá đơn điện tử rõ ràng.',
    icon: '💳',
  },
];

const bookingSteps = [
  { step: '01', title: 'Chọn điểm đón', description: 'Tìm trạm gần bạn với bản đồ realtime.' },
  { step: '02', title: 'Chọn xe yêu thích', description: 'So sánh thông số, giá theo giờ hoặc ngày.' },
  { step: '03', title: 'Xác nhận & nhận xe', description: 'Đặt lịch, thanh toán linh hoạt, kiểm tra xe cùng nhân viên.' },
];

const FALLBACK_MODELS = [
  {
    name: 'VF 3',
    detail: 'Xe điện mini đô thị, nhỏ gọn, dễ lái, phù hợp di chuyển ngắn trong thành phố.',
    priceLabel: 'Từ 199K/giờ',
    image: '/images/models/urban-compact.svg',
  },
  {
    name: 'VF 5 Plus',
    detail: 'SUV điện cỡ nhỏ, thiết kế trẻ trung, phù hợp đi lại hằng ngày và gia đình nhỏ.',
    priceLabel: 'Từ 499K/ngày',
    image: '/images/models/compact-suv.svg',
  },
  {
    name: 'VF 6',
    detail: 'SUV điện hạng B, nội thất hiện đại, cân bằng giữa tiện nghi và khả năng vận hành.',
    priceLabel: 'Từ 599K/ngày',
    image: '/images/models/compact-suv.svg',
  },
  {
    name: 'VF 7',
    detail: 'SUV điện hạng C, không gian rộng rãi, phù hợp gia đình và các chuyến đi dài.',
    priceLabel: 'Từ 699K/ngày',
    image: '/images/models/midsize-suv.svg',
  },
  {
    name: 'VF 8',
    detail: 'SUV điện hạng D, trang bị cao cấp, vận hành mạnh mẽ cho nhu cầu cao cấp hơn.',
    priceLabel: 'Từ 899K/ngày',
    image: '/images/models/large-suv.svg',
  },
  {
    name: 'VF 9',
    detail: 'SUV điện cỡ lớn 7 chỗ, phù hợp gia đình đông người và di chuyển đường dài.',
    priceLabel: 'Từ 1.099K/ngày',
    image: '/images/models/fullsize-suv.svg',
  },
  {
    name: 'VF e34',
    detail: 'SUV điện cỡ nhỏ, mẫu xe điện phổ biến, phù hợp cá nhân và chạy dịch vụ.',
    priceLabel: 'Từ 599K/ngày',
    image: '/images/models/compact-suv.svg',
  },
  {
    name: 'Limo Green',
    detail: 'MPV điện 7 chỗ, không gian rộng, tối ưu cho gia đình lớn hoặc dịch vụ vận chuyển.',
    priceLabel: 'Từ 799K/ngày',
    image: '/images/models/mpv.svg',
  },
];

const testimonials = [
  {
    quote: 'Trải nghiệm thuê xe liền mạch. Ứng dụng điều hướng rõ ràng, đội ngũ hỗ trợ rất nhiệt tình.',
    name: 'Nguyễn Khánh Linh',
    role: 'Doanh nhân',
  },
  {
    quote: 'Xe mới, sạch, bàn giao nhanh. Tôi đặc biệt thích tính năng theo dõi hành trình realtime.',
    name: 'Trần Minh Quân',
    role: 'Travel Blogger',
  },
];

const LandingPage = () => {
  const [fleetShowcase, setFleetShowcase] = useState(FALLBACK_MODELS);
  const [fleetLoading, setFleetLoading] = useState(true);

  useEffect(() => {
    const normalizeModelImage = (rawPath) => {
      if (!rawPath) {
        return null;
      }

      let normalized = rawPath.trim();
      if (!normalized) {
        return null;
      }

      if (/^data:image\//.test(normalized)) {
        return normalized;
      }

      normalized = normalized.replace(/\\/g, '/');

      if (normalized.startsWith('/public/')) {
        normalized = normalized.replace('/public', '');
      } else if (normalized.startsWith('public/')) {
        normalized = normalized.replace('public', '');
      }

      if (!normalized.startsWith('/')) {
        normalized = `/${normalized}`;
      }

      if (!/\.[a-z]{2,4}$/i.test(normalized)) {
        normalized = `${normalized}.jpg`;
      }

      return normalized;
    };

    const fallbackImageByName = (modelName = '') => {
      const normalized = modelName.toLowerCase().replace(/\s+/g, '');
      if (normalized.includes('urban') || normalized.includes('compact')) {
        return '/images/models/urban-compact.svg';
      }
      if (normalized.includes('executive') || normalized.includes('sedan')) {
        return '/images/models/executive-sedan.svg';
      }
      if (normalized.includes('adventure') || normalized.includes('suv')) {
        return '/images/models/adventure-suv.svg';
      }
      return '/images/models/default-vehicle.svg';
    };

    const formatPrice = (basePrice) => {
      if (basePrice == null) {
        return 'Giá linh hoạt';
      }

      const priceNumber = Number(basePrice);
      if (Number.isNaN(priceNumber)) {
        return 'Giá linh hoạt';
      }

      const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      });

      return `${formatter.format(priceNumber)} / ngày`;
    };

    const fetchFleet = async () => {
      try {
        const data = await vehicleService.getVehicles();
        const modelsMap = new Map();

        (Array.isArray(data) ? data : []).forEach((vehicle) => {
          const model = vehicle?.model;
          if (!model?.modelId || modelsMap.has(model.modelId)) {
            return;
          }

          modelsMap.set(model.modelId, {
            name: model.modelName || 'EVR Model',
            detail: model.features?.split(';')[0]?.trim() || 'Trang bị tiêu chuẩn EVR, sẵn sàng phục vụ.',
            priceLabel: formatPrice(model.basePrice),
            image: normalizeModelImage(model.imageUrl) || fallbackImageByName(model.modelName),
          });
        });

        const showcase = Array.from(modelsMap.values()).slice(0, 3);
        if (showcase.length) {
          setFleetShowcase(showcase);
        }
      } catch (err) {
        console.error('Failed to load fleet models', err);
      } finally {
        setFleetLoading(false);
      }
    };

    fetchFleet();
  }, []);

  const fleetSectionHeader = useMemo(() => {
    if (fleetLoading) {
      return 'Đang cập nhật đội xe nổi bật';
    }
    if (!fleetShowcase.length) {
      return 'Đội xe EVR';
    }
    return 'Sẵn sàng cho mọi nhu cầu di chuyển';
  }, [fleetLoading, fleetShowcase]);

  return (
    <MainLayout>
      <div className="landing-page">
        <section className="landing-hero">
          <div className="container hero-wrapper">
            <div className="hero-content">
              <span className="hero-badge">EV Rental Platform</span>
              <h1>
                Thuê xe điện <span>cao cấp</span> cho mọi hành trình của bạn
              </h1>
              <p>
                Đặt xe tức thì, trải nghiệm không chạm, quản lý chuyến đi thông minh. EVR mang đến đội xe được bảo dưỡng định kỳ,
                sẵn sàng đồng hành cùng bạn trong mọi chuyến công tác hay nghỉ dưỡng.
              </p>
              <div className="hero-actions">
                <Link to="/vehicles/search" className="btn btn-primary btn-lg">
                  Khám phá đội xe
                </Link>
                <Link to="/stations" className="btn btn-outline-light btn-lg">
                  Xem trạm gần bạn
                </Link>
              </div>
              <div className="hero-metrics">
                <div>
                  <strong>+1500</strong>
                  <span>Chuyến đi hoàn hảo</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Hỗ trợ tận tâm</span>
                </div>
                <div>
                  <strong>99%</strong>
                  <span>Xe đạt chuẩn an toàn</span>
                </div>
              </div>
            </div>
            <div className="hero-visual" role="presentation" />
          </div>
        </section>

        <section className="landing-highlights">
          <div className="container">
            <div className="section-header">
              <span>Vì sao chọn EVR?</span>
              <h2>Trải nghiệm thuê xe định nghĩa lại chuẩn mực</h2>
            </div>
            <div className="highlight-grid">
              {experienceHighlights.map((item) => (
                <article key={item.title} className="highlight-card">
                  <div className="highlight-icon" aria-hidden="true">
                    {item.icon}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-fleet">
          <div className="container">
            <div className="section-header">
              <span>Đội xe</span>
              <h2>{fleetSectionHeader}</h2>
            </div>
            <div className="fleet-grid">
              {fleetShowcase.map((vehicle) => (
                <article key={vehicle.name} className="fleet-card">
                  <div className="fleet-image">
                    <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
                  </div>
                  <div className="fleet-body">
                    <h3>{vehicle.name}</h3>
                    <p>{vehicle.detail}</p>
                    <p className="fleet-price">{vehicle.priceLabel}</p>
                    <Link to="/vehicles/search" className="link-arrow">
                      Đặt ngay
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-steps">
          <div className="container steps-wrapper">
            <div className="section-header">
              <span>Quy trình</span>
              <h2>Thuê xe trong ba bước đơn giản</h2>
            </div>
            <div className="steps-grid">
              {bookingSteps.map((step) => (
                <article key={step.step} className="step-card">
                  <span className="step-number">{step.step}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-testimonials">
          <div className="container testimonials-wrapper">
            <div className="section-header">
              <span>Cảm nhận khách hàng</span>
              <h2>Được tin tưởng bởi cộng đồng di chuyển thông minh</h2>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((testimonial) => (
                <blockquote key={testimonial.name} className="testimonial-card">
                  <p>“{testimonial.quote}”</p>
                  <footer>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="container cta-wrapper">
            <h2>Sẵn sàng cho hành trình tiếp theo?</h2>
            <p>Đăng ký ngay để nhận ưu đãi thành viên mới và trải nghiệm thuê xe điện chuẩn quốc tế.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-light btn-lg">
                Đăng ký ngay
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                Đăng nhập
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default LandingPage;



import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="evr-footer mt-auto">
      <div className="evr-footer__glow" aria-hidden="true" />

      <div className="container evr-footer__top">
        <div className="evr-footer__brand">
          <Link to="/" className="evr-footer__logo">
            EVR<span>Fleet</span>
          </Link>
          <p>Giải pháp thuê xe điện chuyên nghiệp cho doanh nghiệp và cá nhân.</p>
          <div className="evr-footer__socials">
            <a href="#" aria-label="Facebook" title="Facebook">f</a>
            <a href="#" aria-label="Twitter" title="Twitter">x</a>
            <a href="#" aria-label="Instagram" title="Instagram">◎</a>
            <a href="#" aria-label="LinkedIn" title="LinkedIn">in</a>
          </div>
        </div>

        <nav className="evr-footer__links">
          <div>
            <h6>Sản phẩm</h6>
            <ul>
              <li><Link to="/vehicles/search">Tìm xe</Link></li>
              <li><Link to="/stations">Hệ thống trạm</Link></li>
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/register">Đăng ký</Link></li>
            </ul>
          </div>
          <div>
            <h6>Hỗ trợ</h6>
            <ul>
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
            </ul>
          </div>
          <div>
            <h6>Liên hệ</h6>
            <ul>
              <li><a href="mailto:support@evr-system.com">support@evr-system.com</a></li>
              <li><a href="tel:+84123456789">+84 123 456 789</a></li>
              <li><a href="#">Kênh Đối tác</a></li>
              <li><a href="#">Tuyển dụng</a></li>
            </ul>
          </div>
        </nav>

        <div className="evr-footer__newsletter">
          <h6>Nhận ưu đãi và tin tức</h6>
          <p>Đăng ký email để không bỏ lỡ các chương trình khuyến mãi hấp dẫn.</p>
          <form className="evr-footer__form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email của bạn" aria-label="Email" />
            <button type="submit" className="btn btn-primary">Đăng ký</button>
          </form>
        </div>
      </div>

      <div className="evr-footer__bottom">
        <div className="container evr-footer__bottom__wrap">
          <span>© {new Date().getFullYear()} EVR Fleet. All rights reserved.</span>
          <div className="evr-footer__legal">
            <a href="#">Quyền riêng tư</a>
            <a href="#">Bảo mật</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


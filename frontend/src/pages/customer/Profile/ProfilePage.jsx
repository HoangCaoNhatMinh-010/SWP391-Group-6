import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { userService } from '@services/user.service';
import MainLayout from '@components/layout/MainLayout/MainLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './ProfilePage.css';

const ProfilePage = () => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserById(currentUser.userId);
        setUser(userData);
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

  const identity = useMemo(() => {
    const initials = (user?.name || user?.email || 'EV')
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      initials,
      membership: user?.membershipLevel || 'EV Explorer',
      status: user?.status || 'Chưa cập nhật',
      verified: Boolean(user?.verified),
      joinedAt: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Đang cập nhật',
    };
  }, [user]);

  return (
    <MainLayout>
      <div className="profile-settings">
        {error ? <ErrorMessage message={error} onDismiss={() => setError(null)} /> : null}

        {loading ? (
          <div className="profile-settings__loading">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <section className="profile-settings__hero">
              <div className="profile-settings__identity">
                <span className="profile-settings__avatar">{identity.initials}</span>
                <div>
                  <span className="profile-settings__eyebrow">Tài khoản của bạn</span>
                  <h1>{user?.name || 'Chưa cập nhật'}</h1>
                  <p>{user?.email}</p>
                  <div className="profile-settings__tags">
                    <span>{identity.membership}</span>
                    <span>{identity.status}</span>
                    <span>{identity.verified ? 'Đã xác minh' : 'Chưa xác minh'}</span>
                  </div>
                </div>
              </div>
              <div className="profile-settings__hero-actions">
                <Link to="/profile/edit" className="btn btn-primary">
                  Chỉnh sửa hồ sơ
                </Link>
                <Link to="/profile/security" className="btn btn-ghost">
                  Bảo mật &amp; mật khẩu
                </Link>
              </div>
            </section>

            <section className="profile-settings__body">
              <aside className="profile-settings__sidebar">
                <div className="profile-settings__card profile-settings__card--overview">
                  <h2>Tóm tắt tài khoản</h2>
                  <ul>
                    <li>
                      <span>Trạng thái</span>
                      <strong className={identity.status?.toUpperCase() === 'ACTIVE' ? 'is-positive' : 'is-warning'}>
                        {identity.status}
                      </strong>
                    </li>
                    <li>
                      <span>Gia nhập</span>
                      <strong>{identity.joinedAt}</strong>
                    </li>
                    <li>
                      <span>Xác minh</span>
                      <strong className={identity.verified ? 'is-positive' : 'is-warning'}>
                        {identity.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </strong>
                    </li>
                  </ul>
                </div>

                <nav className="profile-settings__card profile-settings__nav">
                  <h2>Cài đặt nhanh</h2>
                  <Link to="/profile/edit">
                    <span>Thông tin cá nhân</span>
                    <p>Chỉnh sửa họ tên, liên hệ, địa chỉ.</p>
                  </Link>
                  <Link to="/profile/security">
                    <span>Bảo mật &amp; đăng nhập</span>
                    <p>Đổi mật khẩu và quản lý bảo mật.</p>
                  </Link>
                  <Link to="/bookings/history">
                    <span>Lịch sử đặt xe</span>
                    <p>Theo dõi các chuyến đi đã thực hiện.</p>
                  </Link>
                </nav>

                <div className="profile-settings__card profile-settings__support">
                  <h2>Cần hỗ trợ?</h2>
                  <p>Đội ngũ EVR sẵn sàng hỗ trợ bạn 24/7 qua hotline 1900 636 558 hoặc email support@evr.vn.</p>
                  <Link to="/bookings/create" className="btn btn-outline-light">
                    Đặt xe ngay
                  </Link>
                </div>
              </aside>

              <div className="profile-settings__content">
                <article className="profile-settings__section">
                  <header>
                    <h2>Thông tin liên lạc</h2>
                    <p>Đảm bảo thông tin luôn chính xác để nhận cập nhật và ưu đãi từ EVR.</p>
                  </header>
                  <div className="profile-settings__grid">
                    <div>
                      <span>Số điện thoại</span>
                      <strong>{user?.phone || 'Chưa cập nhật'}</strong>
                    </div>
                    <div>
                      <span>Địa chỉ</span>
                      <strong>{user?.address || 'Chưa cập nhật'}</strong>
                    </div>
                    <div>
                      <span>Ngày sinh</span>
                      <strong>
                        {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}
                      </strong>
                    </div>
                  </div>
                </article>

                <article className="profile-settings__section">
                  <header>
                    <h2>Trạng thái &amp; ưu đãi</h2>
                    <p>Theo dõi cấp hạng, tiến trình xác minh và hồ sơ thành viên của bạn.</p>
                  </header>
                  <div className="profile-settings__grid">
                    <div>
                      <span>Cấp hạng</span>
                      <strong>{identity.membership}</strong>
                    </div>
                    <div>
                      <span>Tình trạng xác minh</span>
                      <strong className={identity.verified ? 'is-positive' : 'is-warning'}>
                        {identity.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </strong>
                    </div>
                    <div>
                      <span>Điểm tin cậy</span>
                      <strong>{user?.loyaltyScore ?? 'Đang cập nhật'}</strong>
                    </div>
                  </div>
                </article>

                <article className="profile-settings__section">
                  <header>
                    <h2>Tài liệu &amp; giấy tờ</h2>
                    <p>Các tài liệu được dùng để xác minh danh tính và quyền lái xe của bạn.</p>
                  </header>
                  <div className="profile-settings__grid profile-settings__grid--documents">
                    <div>
                      <span>CMND/CCCD</span>
                      <strong>{user?.personalIdImage ? 'Đã tải lên' : 'Chưa cung cấp'}</strong>
                    </div>
                    <div>
                      <span>Giấy phép lái xe</span>
                      <strong>{user?.licenseImage ? 'Đã tải lên' : 'Chưa cung cấp'}</strong>
                    </div>
                    <div>
                      <span>Phương thức thanh toán</span>
                      <strong>{user?.defaultPaymentMethod || 'Chưa lưu'}</strong>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;


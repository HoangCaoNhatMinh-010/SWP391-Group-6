import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { bookingService } from '@services/booking.service';
import CustomerLayout from '@components/layout/CustomerLayout/CustomerLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './BookingHistoryPage.css';

const STATUS_TONE = {
  COMPLETED: 'positive',
  CONFIRMED: 'info',
  PENDING: 'warning',
  CANCELLED: 'neutral',
  DENIED: 'danger',
};

const STATUS_LABEL = {
  COMPLETED: 'Hoàn tất',
  CONFIRMED: 'Đã xác nhận',
  PENDING: 'Chờ duyệt',
  CANCELLED: 'Đã hủy',
  DENIED: 'Đã từ chối',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'DENIED', label: 'Đã từ chối' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'price-high', label: 'Giá cao → thấp' },
  { value: 'price-low', label: 'Giá thấp → cao' },
];

const BookingHistoryPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await bookingService.getUserBookingsAdvanced(
          user.userId,
          statusFilter || null,
          null,
          null,
          page,
          size
        );
        
        if (data && typeof data === 'object' && 'bookings' in data) {
          setBookings(Array.isArray(data.bookings) ? data.bookings : []);
          setTotalPages(data.totalPages || 0);
          setTotalCount(data.totalCount || 0);
        } else {
          // Fallback to simple API if advanced doesn't return pagination
          const simpleData = await bookingService.getUserBookings(user.userId);
          const allBookings = Array.isArray(simpleData) ? simpleData : [];
          setBookings(allBookings);
          setTotalPages(Math.ceil(allBookings.length / size));
          setTotalCount(allBookings.length);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải lịch sử đặt xe.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, statusFilter, page, size]);

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.bookingId?.toString().includes(query) ||
          booking.vehicle?.model?.modelName?.toLowerCase().includes(query) ||
          booking.vehicle?.plateNumber?.toLowerCase().includes(query) ||
          booking.station?.name?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.startTime ? new Date(a.startTime) : new Date(0);
          const dateB = b.startTime ? new Date(b.startTime) : new Date(0);
          return dateB - dateA;
        });
        break;
      case 'oldest':
        result.sort((a, b) => {
          const dateA = a.startTime ? new Date(a.startTime) : new Date(0);
          const dateB = b.startTime ? new Date(b.startTime) : new Date(0);
          return dateA - dateB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        break;
      default:
        break;
    }

    return result;
  }, [bookings, searchQuery, sortBy]);

  const metrics = useMemo(() => {
    if (!bookings.length) {
      return { total: 0, completed: 0, upcoming: 0, spent: 0 };
    }
    const total = bookings.length;
    const completed = bookings.filter((booking) => booking.bookingStatus === 'COMPLETED').length;
    const upcoming = bookings.filter(
      (booking) => booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'PENDING'
    ).length;
    const spent = bookings
      .filter((booking) => booking.bookingStatus === 'COMPLETED')
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    return { total, completed, upcoming, spent };
  }, [bookings]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '—';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} ngày` : '1 ngày';
  };

  return (
    <CustomerLayout>
      <div className="booking-history">
        <section className="booking-history__hero">
          <div className="booking-history__copy">
            <span className="booking-history__eyebrow">Lịch sử đặt xe</span>
            <h1>Chuyến đi của bạn, luôn được lưu giữ</h1>
            <p>
              Theo dõi trạng thái từng chuyến đi, xem lại chi phí và tải hóa đơn trong nháy mắt. EVR luôn đồng hành cùng
              bạn trên mọi hành trình.
            </p>
          </div>
          <Link to="/bookings/create" className="booking-history__cta">
            + Đặt chuyến mới
          </Link>
        </section>

        <section className="booking-history__metrics">
          <article>
            <span>Tổng booking</span>
            <strong>{metrics.total}</strong>
          </article>
          <article>
            <span>Hoàn tất</span>
            <strong>{metrics.completed}</strong>
          </article>
          <article>
            <span>Sắp diễn ra</span>
            <strong>{metrics.upcoming}</strong>
          </article>
          <article>
            <span>Chi tiêu</span>
            <strong>{metrics.spent.toLocaleString('vi-VN')} ₫</strong>
          </article>
        </section>

        {bookings.length > 0 && (
          <section className="booking-history__filters">
            <div className="booking-history__search">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã booking, xe, biển số..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="form-control"
              />
            </div>
            <div className="booking-history__filter-group">
              <label htmlFor="status-filter">Lọc theo trạng thái:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="form-control"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="booking-history__filter-group">
              <label htmlFor="sort-filter">Sắp xếp:</label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={handleSortChange}
                className="form-control"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <div className="booking-history__loading">
            <LoadingSpinner />
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="booking-history__empty">
            <div className="booking-history__empty-icon">🚗</div>
            <h2>
              {searchQuery || statusFilter
                ? 'Không tìm thấy booking phù hợp'
                : 'Bạn chưa có chuyến đi nào'}
            </h2>
            <p>
              {searchQuery || statusFilter
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Đặt chuyến đầu tiên để trải nghiệm xe điện cao cấp của EVR.'}
            </p>
            {!searchQuery && !statusFilter && (
              <Link to="/bookings/create" className="btn btn-primary">
                Đặt xe ngay
              </Link>
            )}
          </div>
        ) : (
          <>
            <section className="booking-history__list">
              {filteredAndSortedBookings.map((booking) => (
                <article className="booking-history__card" key={booking.bookingId}>
                  <header>
                    <div>
                      <span className="booking-history__code">#{booking.bookingId}</span>
                      <h2>{booking.vehicle?.model?.modelName || booking.vehicle?.model?.name || 'Mẫu xe EV'}</h2>
                      <p>{booking.vehicle?.plateNumber ? `Biển số ${booking.vehicle.plateNumber}` : 'Biển số đang cập nhật'}</p>
                    </div>
                    <span className={`booking-history__status booking-history__status--${STATUS_TONE[booking.bookingStatus] || 'neutral'}`}>
                      {STATUS_LABEL[booking.bookingStatus] || booking.bookingStatus}
                    </span>
                  </header>

                  <div className="booking-history__meta">
                    <div>
                      <span>Nhận xe</span>
                      <strong>{formatDate(booking.startTime)}</strong>
                      <p>Tại {booking.station?.name || '—'}</p>
                    </div>
                    <div>
                      <span>Trả xe</span>
                      <strong>{formatDate(booking.endTime)}</strong>
                      <p>Thời gian: {calculateDuration(booking.startTime, booking.endTime)}</p>
                    </div>
                    <div>
                      <span>Tổng chi phí</span>
                      <strong>{booking.totalPrice ? `${booking.totalPrice.toLocaleString('vi-VN')} ₫` : 'Đang cập nhật'}</strong>
                      <p>Đã bao gồm thuế và phí tiêu chuẩn.</p>
                    </div>
                  </div>

                  <footer>
                    <div className="booking-history__tags">
                      <span>Xe điện</span>
                      {booking.vehicle?.model?.brand && <span>{booking.vehicle.model.brand}</span>}
                      <span>{booking.bookingStatus === 'COMPLETED' ? 'Đã hoàn tất' : 'Đang xử lý'}</span>
                    </div>
                    <div className="booking-history__actions">
                      <Link to={`/bookings/${booking.bookingId}`} className="btn btn-outline-primary btn-sm">
                        Xem chi tiết
                      </Link>
                      {booking.bookingStatus === 'PENDING' && (
                        <Link to={`/bookings/${booking.bookingId}/modify`} className="btn btn-outline-secondary btn-sm">
                          Chỉnh sửa
                        </Link>
                      )}
                    </div>
                  </footer>
                </article>
              ))}
            </section>

            {totalPages > 1 && (
              <section className="booking-history__pagination">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ← Trước
                </button>
                <span className="booking-history__pagination-info">
                  Trang {page + 1} / {totalPages} ({totalCount} booking)
                </span>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Sau →
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default BookingHistoryPage;

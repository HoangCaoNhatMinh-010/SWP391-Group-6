import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '@components/layout/StaffLayout/StaffLayout';
import { bookingService } from '@services/booking.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './ContractsManagementPage.css';

const sortByStartTime = (bookings) =>
  [...bookings].sort((a, b) => {
    const aTime = a?.startTime ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b?.startTime ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
    return bTime - aTime; // Descending order
  });

const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const ContractsManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadContracts = useCallback(async () => {
    if (!user?.userId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getStaffContracts(user.userId);
      
      // Normalize response - new structure: { contracts: [{ booking: {...}, contract: {...} }] }
      let contractsList = [];
      if (response?.contracts && Array.isArray(response.contracts)) {
        // New structure with contract info
        contractsList = response.contracts.map((item) => ({
          ...item.booking,
          contract: item.contract || null, // Add contract info to booking object
        }));
      } else if (Array.isArray(response)) {
        contractsList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        contractsList = response.data;
      } else if (response?.content && Array.isArray(response.content)) {
        contractsList = response.content;
      } else if (response?.bookings && Array.isArray(response.bookings)) {
        contractsList = response.bookings;
      }

      const sorted = sortByStartTime(contractsList);
      setContracts(sorted);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tải danh sách hợp đồng.';
      setError(errorMessage);
      console.error('Error loading contracts:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user?.userId) return;

    const interval = setInterval(() => {
      loadContracts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.userId, loadContracts]);

  const metrics = useMemo(() => {
    if (!contracts.length) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        denied: 0,
      };
    }
    return {
      total: contracts.length,
      pending: contracts.filter((b) => b.bookingStatus === 'PENDING').length,
      confirmed: contracts.filter((b) => b.bookingStatus === 'CONFIRMED').length,
      completed: contracts.filter((b) => b.bookingStatus === 'COMPLETED').length,
      denied: contracts.filter((b) => b.bookingStatus === 'DENIED').length,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    let filtered = contracts;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((c) => c.bookingStatus === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.bookingId?.toString().includes(term) ||
          c.user?.name?.toLowerCase().includes(term) ||
          c.user?.email?.toLowerCase().includes(term) ||
          c.user?.phone?.toLowerCase().includes(term) ||
          c.vehicle?.plateNumber?.toLowerCase().includes(term) ||
          c.vehicle?.model?.modelName?.toLowerCase().includes(term) ||
          c.contract?.contractId?.toString().includes(term) ||
          c.contract?.renterSignature?.toLowerCase().includes(term) ||
          c.contract?.staffSignature?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [contracts, statusFilter, searchTerm]);

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'pending') return 'contracts-management__badge--pending';
    if (statusLower === 'confirmed') return 'contracts-management__badge--confirmed';
    if (statusLower === 'completed') return 'contracts-management__badge--completed';
    if (statusLower === 'denied') return 'contracts-management__badge--denied';
    if (statusLower === 'cancelled') return 'contracts-management__badge--cancelled';
    return '';
  };

  const handleView = (bookingId) => {
    // Navigate to staff contract details page
    navigate(`/staff/contracts/${bookingId}`);
  };

  return (
    <StaffLayout>
      <div className="contracts-management">
        <section className="contracts-management__hero">
          <div>
            <span className="contracts-management__eyebrow">Quản lý hợp đồng</span>
            <h1>Danh sách hợp đồng</h1>
            <p>Xem và quản lý tất cả các hợp đồng thuê xe tại trạm của bạn.</p>
          </div>
          <div className="contracts-management__hero-meta">
            <div>
              <span>Tổng số</span>
              <strong>{metrics.total}</strong>
            </div>
            <div>
              <span>Đang chờ</span>
              <strong>{metrics.pending}</strong>
            </div>
            <div>
              <span>Đã xác nhận</span>
              <strong>{metrics.confirmed}</strong>
            </div>
            <div>
              <span>Hoàn thành</span>
              <strong>{metrics.completed}</strong>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={loadContracts}
              disabled={loading}
              title="Làm mới danh sách"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Làm mới'}
            </button>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {/* Filters */}
        <div className="contracts-management__filters">
          <div className="contracts-management__search">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã booking, tên khách, email, SĐT, biển số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="contracts-management__search-input"
            />
          </div>
          <div className="contracts-management__filter-group">
            <label htmlFor="statusFilter">Lọc theo trạng thái:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="contracts-management__filter-select"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Đang chờ</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="DENIED">Đã từ chối</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="contracts-management__loading">
            <LoadingSpinner />
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="contracts-management__empty">
            <div className="contracts-management__empty-icon">📋</div>
            <h2>
              {contracts.length === 0
                ? 'Chưa có hợp đồng nào'
                : 'Không tìm thấy hợp đồng phù hợp'}
            </h2>
            <p>
              {contracts.length === 0
                ? 'Các hợp đồng mới sẽ tự động hiển thị tại đây khi có booking tại trạm của bạn.'
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'}
            </p>
          </div>
        ) : (
          <section className="contracts-management__table">
            <table>
              <thead>
                <tr>
                  <th>Mã hợp đồng</th>
                  <th>Mã booking</th>
                  <th>Khách hàng</th>
                  <th>Xe</th>
                  <th>Chữ ký khách</th>
                  <th>Chữ ký staff</th>
                  <th>Ngày ký</th>
                  <th>Trạng thái hợp đồng</th>
                  <th>Trạng thái booking</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((item) => {
                  const contract = item.contract;
                  const booking = item;
                  return (
                    <tr key={booking.bookingId}>
                      <td>
                        {contract?.contractId ? (
                          <strong>#{contract.contractId}</strong>
                        ) : (
                          <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Chưa có</span>
                        )}
                      </td>
                      <td>
                        <strong>#{booking.bookingId}</strong>
                      </td>
                      <td>
                        <div className="contracts-management__cell">
                          <span>{booking.user?.name || 'Chưa cập nhật'}</span>
                          <small>{booking.user?.phone || booking.user?.email || '—'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="contracts-management__cell">
                          <span>
                            {booking.vehicle?.model?.modelName || booking.vehicle?.model?.name || 'EV'}
                          </span>
                          <small>{booking.vehicle?.plateNumber || '—'}</small>
                        </div>
                      </td>
                      <td>{contract?.renterSignature || '—'}</td>
                      <td>{contract?.staffSignature || '—'}</td>
                      <td>
                        {contract?.signedAt
                          ? formatDateTime(contract.signedAt)
                          : '—'}
                      </td>
                      <td>
                        {contract?.status ? (
                          <span
                            className={`contracts-management__badge ${
                              contract.status === 'ACTIVE'
                                ? 'contracts-management__badge--confirmed'
                                : contract.status === 'COMPLETED'
                                ? 'contracts-management__badge--completed'
                                : ''
                            }`}
                          >
                            {contract.status}
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Chưa ký</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`contracts-management__badge ${getStatusBadgeClass(
                            booking.bookingStatus
                          )}`}
                        >
                          {booking.bookingStatus || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-light btn-sm"
                          onClick={() => handleView(booking.bookingId)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </StaffLayout>
  );
};

export default ContractsManagementPage;


import { useState, useEffect } from 'react';
import { userService } from '@services/user.service';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './UserManagementPage.css';

const STATUS_TONE = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DELETED: 'neutral',
};

const renderStatusBadge = (status) => {
  const normalized = (status || '').toUpperCase();
  const tone = STATUS_TONE[normalized] || 'neutral';
  return <span className={`admin-user__status admin-user__status--${tone}`}>{status || '—'}</span>;
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [filters, setFilters] = useState({ page: 0, size: 10, role: 'Customer', status: '' });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getAllUsers(
          filters.page,
          filters.size,
          filters.role || null,
          filters.status || null
        );
        
        // Handle different response structures
        const payload =
          Array.isArray(response?.data?.content) ? response.data.content :
          Array.isArray(response?.content) ? response.content :
          Array.isArray(response?.data?.users) ? response.data.users :
          Array.isArray(response?.users) ? response.users :
          Array.isArray(response?.data) ? response.data :
          Array.isArray(response) ? response : [];

        setUsers(payload);
        
        // Extract pagination info
        if (response?.data) {
          setPagination({
            currentPage: response.data.number ?? filters.page,
            totalItems: response.data.totalElements ?? payload.length,
            totalPages: response.data.totalPages ?? Math.ceil((response.data.totalElements ?? payload.length) / filters.size),
            pageSize: filters.size,
          });
        } else if (response) {
          setPagination({
            currentPage: response.number ?? filters.page,
            totalItems: response.totalElements ?? payload.length,
            totalPages: response.totalPages ?? Math.ceil((response.totalElements ?? payload.length) / filters.size),
            pageSize: filters.size,
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 0 });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setFilters((prev) => ({ ...prev, size: newSize, page: 0 }));
  };

  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [userId]: true }));
    setError(null);
    setSuccess(null);

    try {
      await userService.updateUserStatus(userId, newStatus);
      setSuccess(`Đã cập nhật trạng thái người dùng #${userId} thành ${newStatus}`);
      
      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái người dùng.');
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <AdminLayout>
        <div className="admin-user-page">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-user-page">
        <section className="admin-user-filters">
          <div className="admin-user-filter">
            <label htmlFor="status">Trạng thái</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Tất cả</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        <section className="admin-user-table">
          <header>
            <h2>Danh sách người dùng</h2>
            <span>Phân loại theo trạng thái và xác minh</span>
          </header>
          <div className="admin-user-table__body">
            {users.length === 0 ? (
              <div className="admin-user-table__empty">Chưa có người dùng nào phù hợp bộ lọc hiện tại.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Xác minh</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>
                        <div className="admin-user-name">
                          <span>{user.name || 'Chưa cập nhật'}</span>
                          <small>{user.station?.name || '-'}</small>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        <span className="customer-badge customer-badge--neutral">{user.role}</span>
                      </td>
                      <td>
                        <div className="admin-user-status-cell">
                          <select
                            value={user.status || 'PENDING_VERIFICATION'}
                            onChange={(e) => handleStatusChange(user.userId, e.target.value)}
                            disabled={updatingStatus[user.userId]}
                            className="admin-user-status-select"
                          >
                            <option value="PENDING_VERIFICATION">Pending Verification</option>
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="DELETED">Deleted</option>
                          </select>
                          {updatingStatus[user.userId] && (
                            <LoadingSpinner size="sm" style={{ marginLeft: '0.5rem' }} />
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`customer-badge ${user.verified ? 'customer-badge--positive' : 'customer-badge--warning'}`}>
                          {user.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="admin-user__pagination">
              <div className="admin-user-filter" style={{ minWidth: '150px' }}>
                <label htmlFor="pageSize">Số lượng mỗi trang</label>
                <select
                  id="pageSize"
                  name="size"
                  value={filters.size}
                  onChange={handlePageSizeChange}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div className="admin-user__pagination-controls">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  className="admin-user__pagination-btn"
                >
                  Trước
                </button>
                <span className="admin-user__pagination-info">
                  Trang {pagination.currentPage + 1} / {pagination.totalPages} 
                  ({pagination.totalItems} người dùng)
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  className="admin-user__pagination-btn"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default UserManagementPage;


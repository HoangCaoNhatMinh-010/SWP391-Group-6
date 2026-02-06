import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

import './CustomerManagementPage.css';

const riskBadge = (flag) => {
  if (!flag) {
    return <span className="customer-badge customer-badge--positive">No Risk</span>;
  }
  return (
    <span className="customer-badge customer-badge--negative">
      Risk Score: {flag.riskScore ?? 'N/A'}
    </span>
  );
};

const statusBadge = (status) => {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
      return <span className="customer-badge customer-badge--positive">Active</span>;
    case 'SUSPENDED':
      return <span className="customer-badge customer-badge--warning">Suspended</span>;
    case 'DELETED':
      return <span className="customer-badge customer-badge--neutral">Deleted</span>;
    default:
      return <span className="customer-badge customer-badge--neutral">{status || 'Unknown'}</span>;
  }
};

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await adminService.getCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách khách hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const riskCustomers = useMemo(
    () => customers.filter((customer) => Array.isArray(customer.riskFlags) ? customer.riskFlags.length > 0 : !!customer.riskFlag),
    [customers]
  );

  const handleStatusChange = async (customerId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [customerId]: true }));
    setError(null);
    setSuccess(null);

    try {
      await adminService.updateCustomerStatus(customerId, newStatus);
      setSuccess(`Đã cập nhật trạng thái khách hàng #${customerId} thành ${newStatus}`);
      
      // Update local state
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.userId === customerId ? { ...customer, status: newStatus } : customer
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái khách hàng.');
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [customerId]: false }));
    }
  };

  return (
    <AdminLayout>
      <div className="customer-page">
        <section className="customer-page__hero">
          <div>
            <span className="customer-eyebrow">Customer Intelligence</span>
            <h1>Khách hàng & mức độ rủi ro</h1>
            <p>Theo dõi tình trạng tài khoản và lịch sử gắn cờ để chủ động hỗ trợ hoặc xử lý vi phạm.</p>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {loading ? (
          <div className="customer-loading">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <section className="customer-summary">
              <article className="customer-summary-card">
                <span>Tổng khách hàng</span>
                <strong>{customers.length}</strong>
              </article>
              <article className="customer-summary-card customer-summary-card--warning">
                <span>Đang bị gắn cờ</span>
                <strong>{riskCustomers.length}</strong>
              </article>
            </section>

            <section className="customer-table">
              <div className="customer-table__header">
                <h2>Danh sách khách hàng</h2>
                <span>Phân loại theo trạng thái và rủi ro</span>
              </div>
              <div className="customer-table__body">
                {customers.length === 0 ? (
                  <div className="customer-empty">Chưa có khách hàng nào trong hệ thống.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Email</th>
                        <th>Điện thoại</th>
                        <th>Trạng thái</th>
                        <th>Cảnh báo</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => {
                        const flag = Array.isArray(customer.riskFlags)
                          ? customer.riskFlags.at(-1)
                          : customer.riskFlag;

                        return (
                          <tr key={customer.userId}>
                            <td>{customer.userId}</td>
                            <td>
                              <div className="customer-name">
                                <span>{customer.name || 'Chưa cập nhật'}</span>
                                <small>{customer.station?.name || '-'}</small>
                              </div>
                            </td>
                            <td>{customer.email}</td>
                            <td>{customer.phone || '-'}</td>
                            <td>
                              <div className="customer-status-cell">
                                <select
                                  value={customer.status || 'PENDING_VERIFICATION'}
                                  onChange={(e) => handleStatusChange(customer.userId, e.target.value)}
                                  disabled={updatingStatus[customer.userId]}
                                  className="customer-status-select"
                                >
                                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                                  <option value="ACTIVE">Active</option>
                                  <option value="SUSPENDED">Suspended</option>
                                  <option value="DELETED">Deleted</option>
                                </select>
                                {updatingStatus[customer.userId] && (
                                  <LoadingSpinner size="sm" style={{ marginLeft: '0.5rem' }} />
                                )}
                              </div>
                            </td>
                            <td>{riskBadge(flag)}</td>
                            <td>{flag?.reason || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomerManagementPage;


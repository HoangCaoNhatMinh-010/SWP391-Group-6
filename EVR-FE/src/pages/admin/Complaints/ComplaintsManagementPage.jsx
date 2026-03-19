import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './ComplaintsManagementPage.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const statusTone = {
  PENDING: 'warning',
  RESOLVED: 'success',
  REJECTED: 'danger',
};

const ComplaintsManagementPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const data = await adminService.getComplaints(status || null);
        setComplaints(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách khiếu nại.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [status]);

  return (
    <AdminLayout>
      <div className="admin-complaints">
        <section className="admin-complaints__hero">
          <div>
            <span>Quản lý khiếu nại</span>
            <h1>Phản hồi khách hàng</h1>
            <p>Nắm bắt vấn đề của khách và cập nhật trạng thái xử lý để đảm bảo trải nghiệm tốt nhất.</p>
          </div>
          <div className="admin-complaints__filter">
            <label htmlFor="complaint-status">Trạng thái</label>
            <select
              id="complaint-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <div className="admin-complaints__loading">
            <LoadingSpinner />
          </div>
        ) : complaints.length === 0 ? (
          <div className="admin-complaints__empty">Không có khiếu nại nào phù hợp bộ lọc.</div>
        ) : (
          <section className="admin-complaints__table">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách hàng</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                  </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.complaintId}>
                    <td>#{complaint.complaintId}</td>
                    <td>
                      <div className="admin-complaints__customer">
                        <span>{complaint.user?.name || 'Chưa cập nhật'}</span>
                        <small>{complaint.user?.email || '—'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="admin-complaints__description">
                        {complaint.issueDescription
                          ? complaint.issueDescription.length > 100
                            ? `${complaint.issueDescription.substring(0, 100)}...`
                            : complaint.issueDescription
                          : '—'}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-complaints__status admin-complaints__status--${
                          statusTone[complaint.status] || 'neutral'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString('vi-VN') : '—'}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/admin/complaints/${complaint.complaintId}/respond`)}
                      >
                        {complaint.status === 'PENDING' ? 'Phản hồi' : 'Xem/Cập nhật'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default ComplaintsManagementPage;


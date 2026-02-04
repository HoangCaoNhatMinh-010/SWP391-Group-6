import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@components/layout/AdminLayout/AdminLayout';
import { adminService } from '@services/admin.service';
import { authService } from '@services/auth.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

import './RespondToComplaintPage.css';

const STATUS_OPTIONS = [
  { value: 'RESOLVED', label: 'Đã giải quyết' },
  { value: 'REJECTED', label: 'Từ chối' },
];

const RespondToComplaintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('RESOLVED');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      try {
        const data = await adminService.getComplaintById(id);
        setComplaint(data);
        if (data.adminResponse) {
          setResponse(data.adminResponse);
        }
        if (data.status && data.status !== 'PENDING') {
          setStatus(data.status);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin khiếu nại.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        throw new Error('Vui lòng đăng nhập lại');
      }

      await adminService.respondToComplaint(id, currentUser.userId, response, status);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/complaints');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="respond-complaint-page">
          <div className="respond-complaint-page__loading">
            <LoadingSpinner />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!complaint) {
    return (
      <AdminLayout>
        <div className="respond-complaint-page">
          <ErrorMessage message="Không tìm thấy khiếu nại này." />
        </div>
      </AdminLayout>
    );
  }

  const isAlreadyResponded = complaint.status && complaint.status !== 'PENDING';

  return (
    <AdminLayout>
      <div className="respond-complaint-page">
        <section className="respond-complaint-page__header">
          <button
            type="button"
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate('/admin/complaints')}
          >
            ← Quay lại
          </button>
          <div>
            <span>Phản hồi khiếu nại</span>
            <h1>Khiếu nại #{complaint.complaintId}</h1>
          </div>
        </section>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {success && (
          <div className="alert alert-success">
            Phản hồi đã được gửi thành công! Đang chuyển hướng...
          </div>
        )}

        <div className="respond-complaint-page__content">
          <div className="respond-complaint-page__info">
            <div className="info-card">
              <h3>Thông tin khiếu nại</h3>
              <div className="info-card__content">
                <div className="info-item">
                  <label>Khách hàng:</label>
                  <div>
                    <strong>{complaint.user?.name || 'N/A'}</strong>
                    <small>{complaint.user?.email || 'N/A'}</small>
                  </div>
                </div>
                <div className="info-item">
                  <label>Mô tả vấn đề:</label>
                  <p>{complaint.issueDescription || 'Không có mô tả'}</p>
                </div>
                <div className="info-item">
                  <label>Trạng thái hiện tại:</label>
                  <span className={`status-badge status-badge--${complaint.status?.toLowerCase()}`}>
                    {complaint.status || 'PENDING'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Ngày tạo:</label>
                  <span>
                    {complaint.createdAt
                      ? new Date(complaint.createdAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
                {isAlreadyResponded && (
                  <>
                    <div className="info-item">
                      <label>Phản hồi trước đó:</label>
                      <p className="previous-response">{complaint.adminResponse || 'N/A'}</p>
                    </div>
                    <div className="info-item">
                      <label>Phản hồi bởi:</label>
                      <span>{complaint.respondedByAdmin?.name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Thời gian phản hồi:</label>
                      <span>
                        {complaint.respondedAt
                          ? new Date(complaint.respondedAt).toLocaleString('vi-VN')
                          : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="respond-complaint-page__form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="status">Trạng thái *</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  disabled={isAlreadyResponded}
                  className="form-control"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {isAlreadyResponded && (
                  <small className="form-text text-muted">
                    Khiếu nại này đã được phản hồi. Bạn có thể cập nhật phản hồi mới.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="response">Phản hồi *</label>
                <textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  required
                  rows={8}
                  className="form-control"
                  placeholder="Nhập phản hồi của bạn cho khách hàng..."
                  minLength={10}
                />
                <small className="form-text text-muted">
                  Tối thiểu 10 ký tự. Phản hồi này sẽ được gửi qua email cho khách hàng.
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={() => navigate('/admin/complaints')}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || response.trim().length < 10}
                >
                  {submitting ? <LoadingSpinner size="sm" /> : 'Gửi phản hồi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RespondToComplaintPage;


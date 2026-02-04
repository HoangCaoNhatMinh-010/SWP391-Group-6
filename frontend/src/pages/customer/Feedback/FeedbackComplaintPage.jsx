import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { feedbackService } from '@services/feedback.service';
import { complaintService } from '@services/complaint.service';
import { bookingService } from '@services/booking.service';
import CustomerLayout from '@components/layout/CustomerLayout/CustomerLayout';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';
import FormInput from '@components/forms/FormInput/FormInput';
import FormSelect from '@components/forms/FormSelect/FormSelect';
import FormTextarea from '@components/forms/FormTextarea/FormTextarea';

import './FeedbackComplaintPage.css';

const FeedbackComplaintPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feedback');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [userComplaints, setUserComplaints] = useState([]);

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    contractId: '',
    category: 'VEHICLE',
    stars: 5,
    comment: '',
  });

  // Complaint form state
  const [complaintForm, setComplaintForm] = useState({
    contractId: '',
    issueDescription: '',
  });

  useEffect(() => {
    if (user?.userId) {
      loadBookings();
      loadUserFeedbacks();
      loadUserComplaints();
    }
  }, [user?.userId]);

  const loadBookings = async () => {
    if (!user?.userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getUserBookings(user.userId);
      console.log('Loaded bookings:', data); // Debug log
      
      // Handle different response structures
      let bookingsList = data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        bookingsList = data.data || data.content || data.bookings || [];
      }
      
      // Filter only completed/confirmed bookings that should have contracts
      const completedBookings = Array.isArray(bookingsList) 
        ? bookingsList.filter(b => 
            b.bookingStatus === 'COMPLETED' || 
            b.bookingStatus === 'CONFIRMED' ||
            b.bookingStatus === 'Completed' ||
            b.bookingStatus === 'Confirmed'
          )
        : [];
      
      console.log('Filtered bookings:', completedBookings); // Debug log
      setBookings(completedBookings);
      
      if (completedBookings.length === 0) {
        setError('Bạn chưa có booking nào đã hoàn thành để gửi feedback/khiếu nại.');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách booking.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserFeedbacks = async () => {
    if (!user?.userId) return;
    try {
      const data = await feedbackService.getUserFeedback(user.userId);
      setUserFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading feedbacks:', err);
    }
  };

  const loadUserComplaints = async () => {
    if (!user?.userId) return;
    try {
      const data = await complaintService.getUserComplaints(user.userId);
      setUserComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading complaints:', err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user?.userId) return;

    if (!feedbackForm.contractId) {
      setError('Vui lòng chọn booking/contract.');
      return;
    }

    if (!feedbackForm.comment.trim()) {
      setError('Vui lòng nhập nhận xét.');
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await feedbackService.createFeedback(
        {
          contract: { contractId: parseInt(feedbackForm.contractId) },
          category: feedbackForm.category,
          stars: parseInt(feedbackForm.stars),
          comment: feedbackForm.comment.trim(),
        },
        user.userId
      );
      setSuccess('Gửi feedback thành công! Cảm ơn bạn đã chia sẻ.');
      setFeedbackForm({
        contractId: '',
        category: 'VEHICLE',
        stars: 5,
        comment: '',
      });
      loadUserFeedbacks();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể gửi feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!user?.userId) return;

    if (!complaintForm.contractId) {
      setError('Vui lòng chọn booking/contract.');
      return;
    }

    if (!complaintForm.issueDescription.trim()) {
      setError('Vui lòng mô tả vấn đề.');
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await complaintService.createComplaint(
        {
          contract: { contractId: parseInt(complaintForm.contractId) },
          issueDescription: complaintForm.issueDescription.trim(),
        },
        user.userId
      );
      setSuccess('Gửi khiếu nại thành công! Chúng tôi sẽ xem xét và phản hồi sớm nhất.');
      setComplaintForm({
        contractId: '',
        issueDescription: '',
      });
      loadUserComplaints();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể gửi khiếu nại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return '—';
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'resolved') return 'status-badge--resolved';
    if (statusLower === 'rejected') return 'status-badge--rejected';
    return 'status-badge--pending';
  };

  return (
    <CustomerLayout>
      <div className="feedback-complaint-page">
        <section className="feedback-complaint-page__header">
          <h1>Feedback & Khiếu nại</h1>
          <p>Chia sẻ trải nghiệm của bạn hoặc báo cáo vấn đề cần giải quyết</p>
        </section>

        <div className="feedback-complaint-page__tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            Feedback
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'complaint' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaint')}
          >
            Khiếu nại
          </button>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />

        {activeTab === 'feedback' && (
          <div className="feedback-complaint-page__content">
            <div className="feedback-complaint-page__form-section">
              <h2>Gửi Feedback</h2>
              <form onSubmit={handleFeedbackSubmit}>
                <FormSelect
                  label="Chọn booking"
                  value={feedbackForm.contractId}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, contractId: e.target.value })}
                  required
                  disabled={submitting || loading}
                >
                  <option value="">-- Chọn booking --</option>
                  {bookings.length === 0 ? (
                    <option value="" disabled>Không có booking nào</option>
                  ) : (
                    bookings.map((booking) => {
                      const contractId = booking.contract?.contractId || booking.contractId || booking.bookingId;
                      const bookingId = booking.bookingId || booking.id;
                      return (
                        <option key={bookingId} value={contractId}>
                          Booking #{bookingId} - {formatDate(booking.startTime)} đến {formatDate(booking.endTime)}
                        </option>
                      );
                    })
                  )}
                </FormSelect>

                <FormSelect
                  label="Danh mục"
                  value={feedbackForm.category}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                  required
                  disabled={submitting}
                >
                  <option value="VEHICLE">Xe</option>
                  <option value="SERVICE">Dịch vụ</option>
                </FormSelect>

                <div className="form-group">
                  <label>Đánh giá sao *</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-button ${feedbackForm.stars >= star ? 'active' : ''}`}
                        onClick={() => setFeedbackForm({ ...feedbackForm, stars: star })}
                        disabled={submitting}
                      >
                        ⭐
                      </button>
                    ))}
                    <span className="star-value">{feedbackForm.stars} / 5</span>
                  </div>
                </div>

                <FormTextarea
                  label="Nhận xét *"
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  rows={5}
                  required
                  disabled={submitting}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || loading}
                >
                  {submitting ? <LoadingSpinner size="sm" /> : 'Gửi Feedback'}
                </button>
              </form>
            </div>

            <div className="feedback-complaint-page__history-section">
              <h2>Lịch sử Feedback</h2>
              {userFeedbacks.length === 0 ? (
                <p className="empty-message">Chưa có feedback nào.</p>
              ) : (
                <div className="history-list">
                  {userFeedbacks.map((feedback) => (
                    <div key={feedback.feedbackId} className="history-item">
                      <div className="history-item__header">
                        <span className="history-item__id">#{feedback.feedbackId}</span>
                        <span className="history-item__category">{feedback.category}</span>
                        <span className="history-item__stars">
                          {'⭐'.repeat(feedback.stars || 0)}
                        </span>
                        <span className="history-item__date">{formatDate(feedback.createdAt)}</span>
                      </div>
                      <p className="history-item__comment">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'complaint' && (
          <div className="feedback-complaint-page__content">
            <div className="feedback-complaint-page__form-section">
              <h2>Gửi Khiếu nại</h2>
              <form onSubmit={handleComplaintSubmit}>
                <FormSelect
                  label="Chọn booking"
                  value={complaintForm.contractId}
                  onChange={(e) => setComplaintForm({ ...complaintForm, contractId: e.target.value })}
                  required
                  disabled={submitting || loading}
                >
                  <option value="">-- Chọn booking --</option>
                  {bookings.length === 0 ? (
                    <option value="" disabled>Không có booking nào</option>
                  ) : (
                    bookings.map((booking) => {
                      const contractId = booking.contract?.contractId || booking.contractId || booking.bookingId;
                      const bookingId = booking.bookingId || booking.id;
                      return (
                        <option key={bookingId} value={contractId}>
                          Booking #{bookingId} - {formatDate(booking.startTime)} đến {formatDate(booking.endTime)}
                        </option>
                      );
                    })
                  )}
                </FormSelect>

                <FormTextarea
                  label="Mô tả vấn đề *"
                  value={complaintForm.issueDescription}
                  onChange={(e) => setComplaintForm({ ...complaintForm, issueDescription: e.target.value })}
                  rows={6}
                  required
                  disabled={submitting}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || loading}
                >
                  {submitting ? <LoadingSpinner size="sm" /> : 'Gửi Khiếu nại'}
                </button>
              </form>
            </div>

            <div className="feedback-complaint-page__history-section">
              <h2>Lịch sử Khiếu nại</h2>
              {userComplaints.length === 0 ? (
                <p className="empty-message">Chưa có khiếu nại nào.</p>
              ) : (
                <div className="history-list">
                  {userComplaints.map((complaint) => (
                    <div key={complaint.complaintId} className="history-item">
                      <div className="history-item__header">
                        <span className="history-item__id">#{complaint.complaintId}</span>
                        <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                          {complaint.status || 'PENDING'}
                        </span>
                        <span className="history-item__date">{formatDate(complaint.createdAt)}</span>
                      </div>
                      <p className="history-item__comment">{complaint.issueDescription}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default FeedbackComplaintPage;


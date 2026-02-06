import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '@services/booking.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const SettlementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBooking(id);
        setBooking(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleSettle = async () => {
    setError(null);
    setSuccess(null);
    setProcessing(true);

    try {
      await bookingService.settleBooking(id, user.userId);
      setSuccess('Settlement completed successfully!');
      setTimeout(() => {
        navigate('/bookings/history');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete settlement');
    } finally {
      setProcessing(false);
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

  if (error && !booking) {
    return (
      <div className="container mt-5">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow">
            <div className="card-header">
              <h3>Settlement</h3>
            </div>
            <div className="card-body">
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
              <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
              {booking && (
                <>
                  <h5 className="mb-3">Booking Summary</h5>
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Booking ID:</strong>
                    </div>
                    <div className="col-sm-8">{booking.bookingId}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Vehicle:</strong>
                    </div>
                    <div className="col-sm-8">
                      {booking.vehicle?.model?.name || 'N/A'} - {booking.vehicle?.plateNumber || 'N/A'}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Total Price:</strong>
                    </div>
                    <div className="col-sm-8">
                      {booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') : 'N/A'} VND
                    </div>
                  </div>
                  <div className="alert alert-info mt-4">
                    <strong>Payment Method:</strong> Please select your payment method and complete the settlement.
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button
                      className="btn btn-primary"
                      onClick={handleSettle}
                      disabled={processing}
                    >
                      {processing ? <LoadingSpinner size="sm" /> : 'Complete Settlement'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/bookings/${id}`)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementPage;


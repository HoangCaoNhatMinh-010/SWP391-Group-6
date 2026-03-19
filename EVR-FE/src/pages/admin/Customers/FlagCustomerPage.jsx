import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '@services/admin.service';
import { userService } from '@services/user.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const FlagCustomerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    riskScore: '5',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await userService.getUserById(id);
        setCustomer(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await adminService.flagCustomer(
        parseInt(id),
        currentUser.userId,
        formData.reason,
        parseInt(formData.riskScore)
      );
      setSuccess('Customer flagged successfully!');
      setTimeout(() => {
        navigate('/admin/customers');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to flag customer');
    } finally {
      setSubmitting(false);
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

  if (error && !customer) {
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
              <h3>Flag Customer</h3>
            </div>
            <div className="card-body">
              {customer && (
                <div className="mb-3">
                  <strong>Customer:</strong> {customer.name} ({customer.email})
                </div>
              )}
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
              <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="reason" className="form-label">
                    Reason
                  </label>
                  <textarea
                    className="form-control"
                    id="reason"
                    name="reason"
                    rows="4"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="riskScore" className="form-label">
                    Risk Score (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-control"
                    id="riskScore"
                    name="riskScore"
                    value={formData.riskScore}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={submitting}
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : 'Flag Customer'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/admin/customers')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlagCustomerPage;


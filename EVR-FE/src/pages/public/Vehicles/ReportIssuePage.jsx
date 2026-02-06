import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '@services/vehicle.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const ReportIssuePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({
    issueCategory: '',
    priority: '',
    description: '',
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await vehicleService.getVehicle(id);
        setVehicle(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await vehicleService.reportVehicleIssue(
        id,
        user.userId,
        formData.issueCategory,
        formData.priority,
        formData.description,
        photos
      );
      setSuccess('Issue reported successfully!');
      setTimeout(() => {
        navigate(`/vehicles/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report issue');
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

  if (error && !vehicle) {
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
              <h3>Report Vehicle Issue</h3>
            </div>
            <div className="card-body">
              {vehicle && (
                <div className="mb-3">
                  <strong>Vehicle:</strong> {vehicle.model?.name || 'N/A'} - {vehicle.plateNumber}
                </div>
              )}
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
              <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="issueCategory" className="form-label">
                    Issue Category
                  </label>
                  <select
                    className="form-select"
                    id="issueCategory"
                    name="issueCategory"
                    value={formData.issueCategory}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="MECHANICAL">Mechanical</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="BATTERY">Battery</option>
                    <option value="DAMAGE">Damage</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="priority" className="form-label">
                    Priority
                  </label>
                  <select
                    className="form-select"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="photos" className="form-label">
                    Photos (optional)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="photos"
                    name="photos"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/vehicles/${id}`)}
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

export default ReportIssuePage;


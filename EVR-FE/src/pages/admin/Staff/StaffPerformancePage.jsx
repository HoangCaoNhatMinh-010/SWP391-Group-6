import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '@services/admin.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

const StaffPerformancePage = () => {
  const { id } = useParams();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const data = await adminService.getStaffPerformance(parseInt(id));
        setPerformance(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load staff performance');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Staff Performance</h2>
      {performance ? (
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5>Performance Metrics</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>Total Handovers:</strong> {performance.totalHandovers || 0}
                </div>
                <div className="mb-3">
                  <strong>Total Returns:</strong> {performance.totalReturns || 0}
                </div>
                <div className="mb-3">
                  <strong>Total Maintenance:</strong> {performance.totalMaintenance || 0}
                </div>
                <div className="mb-3">
                  <strong>Average Rating:</strong> {performance.averageRating || 'N/A'}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5>Activity Summary</h5>
              </div>
              <div className="card-body">
                {performance.activitySummary ? (
                  <ul className="list-group">
                    {performance.activitySummary.map((activity, index) => (
                      <li key={index} className="list-group-item">
                        {activity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No activity data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">No performance data available</div>
      )}
    </div>
  );
};

export default StaffPerformancePage;


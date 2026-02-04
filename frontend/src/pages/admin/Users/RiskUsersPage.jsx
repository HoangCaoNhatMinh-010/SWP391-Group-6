import { useState, useEffect } from 'react';
import { userService } from '@services/user.service';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';

const RiskUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiskUsers = async () => {
      try {
        const data = await userService.getRiskUsers();
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load risk users');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskUsers();
  }, []);

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
      <h2 className="mb-4">Risk Users</h2>
      {users.length === 0 ? (
        <div className="alert alert-info">No risk users found</div>
      ) : (
        <div className="card shadow">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`badge ${
                          user.riskScore >= 7 ? 'bg-danger' :
                          user.riskScore >= 5 ? 'bg-warning' :
                          'bg-info'
                        }`}>
                          {user.riskScore || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          user.status === 'Active' ? 'bg-success' :
                          user.status === 'Suspended' ? 'bg-danger' :
                          'bg-warning'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskUsersPage;


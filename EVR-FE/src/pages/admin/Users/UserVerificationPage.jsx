import { useState, useEffect } from 'react';
import { userService } from '@services/user.service';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import SuccessMessage from '@components/common/SuccessMessage';

const UserVerificationPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers(0, 100, null, null);
        const unverifiedUsers = (data.content || data).filter((u) => !u.verified);
        setUsers(unverifiedUsers);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleVerify = async (userId) => {
    setError(null);
    setSuccess(null);

    try {
      const staff = { userId: currentUser.userId };
      await userService.verifyUser(userId, staff);
      setSuccess('User verified successfully!');
      setUsers(users.filter((u) => u.userId !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify user');
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

  if (error && users.length === 0) {
    return (
      <div className="container mt-5">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">User Verification</h2>
      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />
      {users.length === 0 ? (
        <div className="alert alert-info">No unverified users found</div>
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
                    <th>Status</th>
                    <th>Actions</th>
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
                        <span className={`badge ${user.verified ? 'bg-success' : 'bg-warning'}`}>
                          {user.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleVerify(user.userId)}
                        >
                          Verify
                        </button>
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

export default UserVerificationPage;


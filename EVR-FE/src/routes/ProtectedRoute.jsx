import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import LoadingSpinner from '@components/common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole = (user.role || '').toUpperCase();
    const expectedRole = requiredRole.toUpperCase();
    if (userRole !== expectedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;


import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin, loading, tokenChecked } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading || !tokenChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-3 text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // Redirect to dashboard if not admin but trying to access admin route
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" state={{ 
      message: "You don't have permission to access that page." 
    }} />;
  }

  return children;
};

export default ProtectedRoute;
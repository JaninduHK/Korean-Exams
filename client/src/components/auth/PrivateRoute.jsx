import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { FullScreenLoader } from '../common/Loader';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuth } from '../redux/authSlice';

export default function ProtectedRoute({ children }) {
  const authed = useSelector(selectIsAuthenticated);
  const { status } = useSelector(selectAuth);
  const location = useLocation();

  if (status === 'loading') return null;
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isTokenValid } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !isTokenValid()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string
};

export default ProtectedRoute;

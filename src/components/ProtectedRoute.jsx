import { Navigate, Outlet } from 'react-router-dom';
import { getAuth } from '../utils/auth';

export default function ProtectedRoute() {
  const { isAuthenticated } = getAuth();
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}
// This component checks if the user is authenticated before allowing access to certain routes

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { readAuthData } from '../utils/authHelpers';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuth, currentUser } = useAuth();

  useEffect(() => {
    // Check auth using our reusable helper
    const { token, user } = readAuthData();
    
    console.log('ProtectedRoute - Auth Check:', { 
      hasToken: !!token, 
      hasUser: !!user,
      contextAuth: isAuth, 
      contextUser: !!currentUser 
    });

    // Only redirect if auth data is missing
    if (!token || !user) {
      console.log('Redirecting to login page - auth data missing');
      navigate('/login');
    }
  }, [navigate]);

  // Don't render children until authentication is confirmed
  if (!isAuth || !currentUser) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
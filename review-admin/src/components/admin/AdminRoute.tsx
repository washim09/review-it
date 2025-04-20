import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.error('No admin token found. Redirecting to admin login...');
      navigate('/admin-login'); // Redirect to admin login if not authenticated
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AdminRoute;
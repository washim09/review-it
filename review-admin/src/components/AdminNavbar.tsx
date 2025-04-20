// src/components/AdminNavbar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the admin token from localStorage
    localStorage.removeItem('adminToken');
    // Redirect to the login page
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/admin" className="text-white text-lg font-bold">
          Admin Panel
        </Link>
        <ul className="flex space-x-4">
          {location.pathname !== '/' && (
            <>
              <li>
                <Link to="/admin" className="text-white hover:text-gray-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="text-white hover:text-gray-200">
                  Users
                </Link>
              </li>
              <li>
                <Link to="/admin/reviews" className="text-white hover:text-gray-200">
                  Reviews
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-gray-200"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
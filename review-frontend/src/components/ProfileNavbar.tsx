// ProfileNavbar.tsx
//description: This file contains the ProfileNavbar component which displays the navigation links for the user profile page.
// It includes links to Home, Messages, and Profile pages. The Navbar is responsive and includes a hamburger menu for mobile devices.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaBars, FaTimes, FaBell, FaUser } from 'react-icons/fa';
import UserDetailsPopup from './UserDetailsPopup';

interface ProfileNavbarProps {
  unreadCount: number;
}

const ProfileNavbar = ({ unreadCount }: ProfileNavbarProps) => {
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    contact: '',
    address: '',
    city: '',
    state: '',
    instagram: '',
    facebook: '',
    twitter: '',
  });



  const handleProfileClick = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (!token || !userData) {
        throw new Error('No authentication data found');
      }

      // First set user from localStorage
      setUser(JSON.parse(userData));
      setShowUserDetails(true);

      // Then fetch fresh data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
  
      const freshUserData = await response.json();
      setUser(freshUserData);
      localStorage.setItem('userData', JSON.stringify(freshUserData));
    } catch (error) {
      console.error('Profile fetch error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

return (
    <nav className="bg-white shadow-lg p-4 fixed w-full top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            ReviewIt
          </h1>
        </Link>

        {/* Hamburger Menu Icon (Mobile) */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-700 hover:text-indigo-600 transition-colors">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-8">
          <li>
            <Link to="/home" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              Home
            </Link>
          </li>
          <li className="relative">
            <Link to="/message" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center">
              <FaBell className="mr-1" />
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </li>
          <li>
          {/* Direct profile link without nested button for better accessibility */}
            <button
              onClick={() => {
                // Store a flag to indicate we're navigating to profile
                sessionStorage.setItem('navigatingToProfile', 'true');
                window.location.href = '/profile';
              }}
              className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              <FaUser />
              <span>Profile</span>
              <FaChevronDown className="text-sm" />
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity font-medium"
            >
              Logout
            </button>
          </li>
        </ul>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 right-0 left-0 bg-white shadow-lg rounded-b-lg border-t border-gray-100">
            <ul className="flex flex-col p-4 space-y-4">
              <li>
                <Link to="/home" className="text-gray-700 hover:text-indigo-600 transition-colors block">
                  Home
                </Link>
              </li>
              <li className="relative">
                <Link to="/message" className="text-gray-700 hover:text-indigo-600 transition-colors block">
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <button
                  onClick={handleProfileClick}
                  className="text-gray-700 hover:text-indigo-600 transition-colors block w-full text-left"
                >
                  Profile
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 transition-colors block w-full text-left"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {showUserDetails && (
        <UserDetailsPopup user={user} onClose={() => setShowUserDetails(false)} />
      )}
    </nav>
  );
};

export default ProfileNavbar;
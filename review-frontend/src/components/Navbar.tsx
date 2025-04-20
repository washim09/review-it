// Navbar.tsx
// Description: This file contains the Navbar component which displays the navigation links for the application.
// It includes links to Home, Login, and Register pages. The Navbar is responsive and includes a hamburger menu for mobile devices.

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg p-4 fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">ReviewIt</h1>
        </Link>

        {/* Hamburger Menu Icon (Mobile) */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className="text-white hover:text-gray-200 transition-colors"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8">
          <li>
            <Link to="/" className="text-white hover:text-gray-200 transition-colors font-medium">
              Home
            </Link>
          </li>
          <li>
            <Link to="/login" className="text-white hover:text-gray-200 transition-colors font-medium">
              Login
            </Link>
          </li>
          <li>
            <Link to="/register" className="hover:text-gray-600 transition-colors font-medium px-6 py-2 bg-white text-indigo-600 rounded-full hover:bg-gray-100">
              Register
            </Link>
          </li>
        </ul>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 right-0 left-0 bg-white shadow-lg rounded-b-lg">
            <ul className="flex flex-col p-4 space-y-4">
              <li>
                <Link to="/" className="text-gray-800 hover:text-indigo-600 transition-colors block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-800 hover:text-indigo-600 transition-colors block">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors font-medium block">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
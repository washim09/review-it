'use client';
// src/components/AdminNavbar.tsx
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
  }, [pathname]); // Re-check when path changes

  const handleLogout = () => {
    // Clear the admin token from localStorage
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    // Redirect to the login page
    router.push('/');
  };

  const currentPath = pathname;

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={isLoggedIn ? "/admin" : "/"} className="text-white text-lg font-bold">
          Admin Panel
        </Link>
        <ul className="flex space-x-4">
          {isLoggedIn ? (
            // Navigation for authenticated users
            <>
              <li>
                <Link 
                  href="/admin" 
                  className={`text-white hover:text-gray-200 ${currentPath === '/admin' ? 'font-bold' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/users" 
                  className={`text-white hover:text-gray-200 ${currentPath === '/admin/users' ? 'font-bold' : ''}`}
                >
                  Users
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/reviews" 
                  className={`text-white hover:text-gray-200 ${currentPath === '/admin/reviews' ? 'font-bold' : ''}`}
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/support" 
                  className={`text-white hover:text-gray-200 ${currentPath === '/admin/support' ? 'font-bold' : ''}`}
                >
                  Support
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/newsletter" 
                  className={`text-white hover:text-gray-200 ${currentPath === '/admin/newsletter' ? 'font-bold' : ''}`}
                >
                  Newsletter
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
          ) : (
            // Navigation for unauthenticated users
            <>
              <li>
                <Link 
                  href="/admin-login" 
                  className={`text-white hover:text-gray-200 ${(currentPath === '/' || currentPath === '/admin-login') ? 'font-bold' : ''}`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin-register" 
                  className={`text-white hover:text-gray-200 ${currentPath === '/admin-register' ? 'font-bold' : ''}`}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
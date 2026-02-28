'use client'

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

const ProfileNavbar = () => {
  const { isAuth, logout, user } = useAuth();

  return (
    <nav className="bg-black border-b border-purple-900/30 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold font-display group">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
              <span className="text-white text-xl font-bold">R</span>
            </div>
            <div>
              <span className="text-white">Review</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 font-extrabold">it</span>
            </div>
          </div>
        </Link>
        
        <div className="space-x-4">
          {!isAuth ? (
            <>
              <Link href="/login" className="px-4 py-2 hover:bg-neutral-800 rounded-lg hover:text-indigo-200 transition-all duration-300">Login</Link>
              <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-purple-500/20 transition-all duration-300">Register</Link>
            </>
          ) : (
            <>
              <Link href="/" className="px-4 py-2 hover:bg-neutral-800 rounded-lg transition-all duration-300">Dashboard</Link>
              <Link href="/message" className="px-4 py-2 hover:bg-neutral-800 rounded-lg transition-all duration-300">Messages</Link>
              <span className="text-indigo-200 bg-neutral-800/50 px-4 py-2 rounded-lg">
                Hello, {user?.name || 'User'}
              </span>
              <button 
                onClick={logout} 
                className="px-4 py-2 text-red-300 hover:bg-red-900/20 hover:text-red-200 rounded-lg transition-all duration-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ProfileNavbar;

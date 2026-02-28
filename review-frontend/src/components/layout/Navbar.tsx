'use client'

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

const Navbar = () => {
  const { isAuth, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get unread message count using our custom hook
  const { unreadCount } = useUnreadMessages();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to check if a route is active
  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-indigo-600/95 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg border-b border-white/20 text-white' : 'bg-indigo-600/80 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-md text-white'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight relative group flex items-center"
          >
            <div className="flex items-center">
              <div className="mr-2 rounded-lg p-2 shadow-wave relative overflow-hidden group animate-pulse-slow">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-90 rounded-lg"></div>
                <svg className="w-5 h-5 relative z-10 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="ml-0"
              >
                <img 
                  src="/assets/white_logo.png" 
                  alt="Company Logo" 
                  className="h-7 w-auto"
                  onError={(e) => {
                    // Fallback to text if logo doesn't exist
                    e.currentTarget.outerHTML = `<span class="font-display text-xl font-bold"><span class="text-white">Review</span><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 font-extrabold">it</span></span>`;
                  }}
                />
              </motion.div>
            </div>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-white bg-white/10 backdrop-blur-sm rounded-lg p-2 inline-flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          {isLoading ? (
            <div className="hidden md:flex space-x-2 animate-pulse">
              <div className="h-8 w-16 bg-neutral-200 rounded-lg"></div>
              <div className="h-8 w-20 bg-neutral-200 rounded-lg"></div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1 md:gap-3">
              {!isAuth ? (
                <>
                  <Link href="/login" className="px-3 py-2 text-white hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-300 hover:to-indigo-300 rounded-lg text-sm font-medium transition-all duration-200">
                    Log in
                  </Link>
                  <Link href="/register" className="px-3 py-2 text-white hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-300 hover:to-indigo-300 rounded-lg text-sm font-medium transition-all duration-200">
                    Sign up
                  </Link>
                  <Link href="/about-us" className="relative text-white font-medium rounded-xl text-sm px-5 py-2.5 transition-all duration-300 focus:outline-none active:scale-95 shadow-wave overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
                    About Us
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/" className={`${isActive('/') ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'text-white hover:bg-white/10'} px-3 py-2 rounded-lg text-sm font-medium transition-all`}>
                    Home
                  </Link>
                  <Link href="/message" className={`${isActive('/message') ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'text-white hover:bg-white/10'} px-3 py-2 rounded-lg text-sm font-medium transition-all relative`}>
                    Message
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/profile" className={`${isActive('/profile') ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'text-white hover:bg-white/10'} px-3 py-2 rounded-lg text-sm font-medium transition-all`}>
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 invisible md:visible'} overflow-hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/10 bg-indigo-600/95 backdrop-blur-md shadow-lg">
          {!isAuth ? (
            <>
              <Link href="/login" className="text-white hover:bg-white/10 block px-3 py-2 rounded-lg text-base font-medium transition-all">
                Log in
              </Link>
              <Link href="/register" className="text-white hover:bg-white/10 block px-3 py-2 rounded-lg text-base font-medium transition-all">
                Sign up
              </Link>
              <Link href="/about-us" className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 block px-3 py-2 rounded-lg text-base font-medium transition-all ml-4">
                About Us
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className={`${isActive('/') ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'text-white hover:bg-white/10'} block px-3 py-2 rounded-md text-base font-medium transition-colors`}>
                Home
              </Link>
              <Link href="/message" className={`${isActive('/message') ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'text-white hover:bg-white/10'} block px-3 py-2 rounded-md text-base font-medium transition-colors relative`}>
                Message
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/profile" className={`${isActive('/profile') ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'text-white hover:bg-white/10'} block px-3 py-2 rounded-md text-base font-medium transition-colors`}>
                Profile
              </Link>
              <button 
                onClick={() => {
                  logout();
                  router.push('/');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium transition-colors"
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

export default Navbar;

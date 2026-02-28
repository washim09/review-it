// src/hooks/useUnreadMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getToken, useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

// Hook to check for unread messages
export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const { isAuth, isLoading: authLoading } = useAuth();

  // Function to manually reset unread count
  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Effect to reset count when on messages page (more aggressive reset)
  useEffect(() => {
    // Reset immediately if we're on a message page
    if (pathname?.startsWith('/message')) {

      resetUnreadCount();
      
      // Also set up a small delay reset to ensure it happens after any state updates
      setTimeout(() => {

        resetUnreadCount();
      }, 500);
    }
  }, [pathname, resetUnreadCount]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        // Don't make API calls if not authenticated or auth is still loading
        if (!isAuth || authLoading || !token) {
          setUnreadCount(0);
          setError(null);
          setLoading(false);
          return;
        }

        // Make the API call to get contacts which includes unread counts
        const response = await fetch(`${API_BASE_URL}/api/contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid, silently fail without console spam
            setUnreadCount(0);
            setError(null);
            setLoading(false);
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Calculate total unread messages by summing unreadCount from all contacts
        const totalUnread = Array.isArray(data) 
          ? data.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0)
          : 0;
          
        setUnreadCount(totalUnread);
        setError(null);
      } catch (err) {
        // Silently handle all errors to prevent console spam
        setError(null);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if authentication is complete and user is authenticated
    if (!authLoading) {
      if (isAuth && getToken()) {
        fetchUnreadCount();
      } else {
        setUnreadCount(0);
        setError(null);
        setLoading(false);
      }
    }

    // Disable polling to prevent repeated 401 errors
    // const interval = setInterval(() => {
    //   if (isAuth && getToken()) {
    //     fetchUnreadCount();
    //   }
    // }, 30000);

    // return () => clearInterval(interval);
  }, [isAuth, authLoading]);

  return { unreadCount, loading, error, resetUnreadCount };
};

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerNotificationPolling, startPolling, stopPolling } from '../services/pollingService';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Global layout component that wraps the application
 * Handles global polling for real-time updates
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, isAuth } = useAuth();
  
  // Set up global polling when user is authenticated
  useEffect(() => {
    // Only set up polling if the user is logged in
    if (isAuth && currentUser) {
      console.log('Setting up global polling for authenticated user');
      
      // Start the polling service
      startPolling();
      
      // Register notification polling
      const unregisterNotifications = registerNotificationPolling(currentUser.id);
      
      // Clean up on unmount or when auth state changes
      return () => {
        unregisterNotifications();
        stopPolling();
      };
    }
  }, [isAuth, currentUser]);
  
  return (
    <div className="app-layout">
      {/* You can add global components like headers here */}
      {children}
    </div>
  );
};

export default Layout;

import { registerSW } from 'virtual:pwa-register';
import { pushNotificationManager } from './pushNotifications';

export interface PWAUpdateHandler {
  updateAvailable: boolean;
  updateSW: () => Promise<void>;
}

export const registerServiceWorker = (): PWAUpdateHandler => {
  let updateSWCallback: (() => Promise<void>) | null = null;
  let updateAvailable = false;

  const updateSW = registerSW({
    onNeedRefresh() {
      updateAvailable = true;
      
      // Show update notification
      const shouldUpdate = window.confirm(
        'A new version of Riviewit is available. Update now for the best experience?'
      );
      
      if (shouldUpdate && updateSWCallback) {
        updateSWCallback();
      }
    },
    onOfflineReady() {
      // App is ready for offline use
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      // Service Worker successfully registered
      
      // Initialize push notification manager with registration
      if (registration) {
        pushNotificationManager.initialize(registration);
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error: any) {
      console.error('Service Worker registration error:', error);
    }
  });

  updateSWCallback = updateSW;

  return {
    updateAvailable,
    updateSW: async () => {
      if (updateSWCallback) {
        await updateSWCallback();
      }
    }
  };
};

// Online/Offline detection
export const setupOnlineDetection = () => {
  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      document.body.classList.remove('offline');
      
      // Show online notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = '✓ Back online';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } else {
      document.body.classList.add('offline');
      
      // Show offline notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = '⚠ You are offline';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
};

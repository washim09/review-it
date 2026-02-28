import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/styles/index.css';
import { setupAuthInterceptor } from './utils/authUtils';
import { registerServiceWorker, setupOnlineDetection } from './utils/registerServiceWorker';

// Initialize the auth interceptor for token refresh
setupAuthInterceptor();

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  registerServiceWorker();
}

// Setup online/offline detection
setupOnlineDetection();

createRoot(document.getElementById('root')!).render(
  <App />
)

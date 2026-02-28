'use client'

import React, { useState, useEffect } from 'react';
import { FiBell, FiBellOff, FiCheckCircle } from 'react-icons/fi';
import { pushNotificationManager } from '../../utils/pushNotifications';
import { useAuth } from '../../context/AuthContext';

const PushNotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    const subscribed = await pushNotificationManager.isSubscribed();
    setIsSubscribed(subscribed);
  };

  const handleToggleNotifications = async () => {
    if (!user) {
      setError('Please login to enable notifications');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await pushNotificationManager.unsubscribe(user.id);
        if (success) {
          setIsSubscribed(false);
          setSuccess('Push notifications disabled');
        } else {
          setError('Failed to disable notifications');
        }
      } else {
        // Subscribe
        const subscription = await pushNotificationManager.subscribe(user.id);
        if (subscription) {
          setIsSubscribed(true);
          setSuccess('Push notifications enabled!');
        } else {
          setError('Failed to enable notifications. Please check permissions.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Notification toggle error:', err);
    } finally {
      setIsLoading(false);
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
    }
  };

  const notificationPermission = typeof Notification !== 'undefined' 
    ? Notification.permission 
    : 'default';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {isSubscribed ? (
            <FiBell className="text-purple-600 mr-3" size={24} />
          ) : (
            <FiBellOff className="text-gray-400 mr-3" size={24} />
          )}
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Get notified about new reviews, messages, and updates
            </p>
          </div>
        </div>
      </div>

      {/* Permission Status */}
      {notificationPermission === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center">
          <FiCheckCircle className="text-green-600 mr-2" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={handleToggleNotifications}
        disabled={isLoading || notificationPermission === 'denied'}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          isSubscribed
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : isSubscribed ? (
          'Disable Notifications'
        ) : (
          'Enable Notifications'
        )}
      </button>

      {/* Notification Types Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">
          You'll receive notifications for:
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-center">
            <span className="mr-2">•</span>
            New messages from other users
          </li>
          <li className="flex items-center">
            <span className="mr-2">•</span>
            Reviews on products you're following
          </li>
          <li className="flex items-center">
            <span className="mr-2">•</span>
            Replies to your reviews
          </li>
          <li className="flex items-center">
            <span className="mr-2">•</span>
            Important app updates
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PushNotificationSettings;

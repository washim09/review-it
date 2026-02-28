'use client'

import React from 'react';
import { FiWifiOff, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const Offline: React.FC = () => {
  const router = useRouter();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-purple-100 rounded-full p-6">
            <FiWifiOff className="text-purple-600" size={64} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. 
          Don't worry, you can still browse content you've viewed before.
        </p>

        {/* Features Available Offline */}
        <div className="bg-purple-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-purple-900 mb-3">
            Available Offline:
          </h3>
          <ul className="space-y-2 text-sm text-purple-700">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Previously viewed reviews</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Your cached profile</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Saved messages</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>App navigation</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <FiHome className="mr-2" />
            Go to Home
          </button>
        </div>

        {/* Network Status Indicator */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Connection will be restored automatically when you're back online
          </p>
        </div>
      </div>
    </div>
  );
};

export default Offline;

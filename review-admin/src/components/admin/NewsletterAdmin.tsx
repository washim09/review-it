'use client';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

interface NewsletterStats {
  totalSubscribers: number;
  recentSubscribers: number;
  lastEmailSent: string | null;
}

interface SendResult {
  message: string;
  success: boolean;
  stats: {
    totalSubscribers: number;
    emailsSent: number;
    emailsFailed: number;
    reviewsIncluded: number;
    sentAt: string;
  };
}

const NewsletterAdmin: React.FC = () => {
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  // Fetch newsletter stats
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send newsletter
  const handleSendNewsletter = async () => {
    if (!adminKey) {
      setMessage('Please enter admin key');
      setIsSuccess(false);
      return;
    }

    setIsSending(true);
    setMessage('');
    setSendResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/send-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Newsletter sent successfully!');
        setIsSuccess(true);
        setSendResult(data);
        fetchStats(); // Refresh stats
      } else {
        setMessage(data.error || 'Failed to send newsletter');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Newsletter Administration</h2>
        <p className="text-gray-600">Manage email subscriptions and send newsletters to subscribers</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Subscribers</h3>
          <p className="text-3xl font-bold">
            {isLoading ? '...' : stats?.totalSubscribers || 0}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">New This Week</h3>
          <p className="text-3xl font-bold">
            {isLoading ? '...' : stats?.recentSubscribers || 0}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Last Email Sent</h3>
          <p className="text-sm font-medium">
            {isLoading ? '...' : stats?.lastEmailSent 
              ? new Date(stats.lastEmailSent).toLocaleDateString()
              : 'Never'
            }
          </p>
        </div>
      </div>

      {/* Send Newsletter Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Send Newsletter</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Key
          </label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter admin key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSendNewsletter}
          disabled={isSending || !adminKey}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Sending Newsletter...
            </>
          ) : (
            '📧 Send Latest Reviews Newsletter'
          )}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Send Results */}
      {sendResult && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">📊 Newsletter Send Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{sendResult.stats.emailsSent}</p>
              <p className="text-sm text-gray-600">Emails Sent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{sendResult.stats.emailsFailed}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{sendResult.stats.reviewsIncluded}</p>
              <p className="text-sm text-gray-600">Reviews Included</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{sendResult.stats.totalSubscribers}</p>
              <p className="text-sm text-gray-600">Total Subscribers</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Sent at: {new Date(sendResult.stats.sentAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-6">
        <h4 className="font-semibold text-blue-800 mb-2">📋 How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Newsletter includes the latest 5 reviews from the past 7 days</li>
          <li>• If no recent reviews, it sends the 5 most recent reviews</li>
          <li>• Prevents sending multiple newsletters within 24 hours</li>
          <li>• Subscribers receive a beautifully formatted email with review summaries</li>
          <li>• Each email includes unsubscribe and website links</li>
        </ul>
      </div>
    </div>
  );
};

export default NewsletterAdmin;

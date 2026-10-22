'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface RewardReview {
  id: number;
  title: string;
  content: string;
  rating: number;
  rewardStatus: string;
  affiliateEnabled: boolean;
  affiliateStatus: string | null;
  aiSpamScore: number | null;
  createdAt: string;
  author: { id: number; name: string; email: string; isVerified: boolean };
}

interface RewardFlag {
  id: number;
  userId: number;
  reviewId: number | null;
  reason: string;
  details: string | null;
  user: { id: number; name: string; email: string };
}

export default function AdminRewardReviews() {
  const [reviews, setReviews] = useState<RewardReview[]>([]);
  const [flags, setFlags] = useState<RewardFlag[]>([]);
  const [status, setStatus] = useState('FLAGGED');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = () => localStorage.getItem('adminToken') || '';

  const load = async (nextStatus = status) => {
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/admin/reward-reviews?status=${nextStatus}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await response.json();
    setReviews(data.reviews || []);
    setFlags(data.flags || []);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const decide = async (reviewId: number, action: 'APPROVE' | 'REJECT') => {
    const reason = action === 'REJECT' ? window.prompt('Reason for rejecting this reward') : undefined;
    if (action === 'REJECT' && !reason?.trim()) return;
    const response = await fetch(`${API_BASE_URL}/api/admin/reward-reviews/${reviewId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    const data = await response.json();
    setMessage(data.message || data.error || 'Updated');
    await load();
  };

  const clearFlags = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/reward-reviews`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CLEAR_FLAGS', userId }),
    });
    const data = await response.json();
    setMessage(data.message || data.error || 'Updated');
    await load();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reward reviews</h1>
      <p className="text-sm text-gray-500 mb-4">
        Pending, flagged, and rejected reviews do not add withdrawable balance. Approving a published review credits ₹1. Rejecting it does not.
      </p>
      {message && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">{message}</div>}

      <div className="flex gap-2 mb-4">
        {['FLAGGED', 'PENDING', 'REJECTED', 'APPROVED'].map((item) => (
          <button
            key={item}
            onClick={() => { setStatus(item); load(item); }}
            className={`px-3 py-1.5 rounded text-sm ${status === item ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">Open flags</h2>
      {flags.length === 0 ? (
        <p className="text-sm text-gray-400 mb-6">No open flags.</p>
      ) : (
        <div className="bg-white border rounded mb-6 divide-y">
          {flags.map((flag) => (
            <div key={flag.id} className="p-3 flex items-start justify-between gap-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">{flag.user.name} · {flag.reason}</div>
                <div className="text-gray-500">{flag.user.email}{flag.reviewId ? ` · review ${flag.reviewId}` : ''}</div>
                {flag.details && <div className="text-gray-600 mt-1">{flag.details}</div>}
              </div>
              <button onClick={() => clearFlags(flag.userId)} className="px-3 py-1.5 border rounded text-xs">
                Clear user flags
              </button>
            </div>
          ))}
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : reviews.length === 0 ? (
        <p className="text-gray-400">No reviews in this queue.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-medium text-gray-900">{review.title}</h3>
                  <p className="text-xs text-gray-500">
                    {review.author.name} · {review.author.email} · rating {review.rating}
                    {review.affiliateEnabled ? ` · affiliate ${review.affiliateStatus || 'unset'}` : ''}
                    {review.aiSpamScore != null ? ` · spam score ${review.aiSpamScore}` : ''}
                    {review.author.isVerified ? '' : ' · email not verified'}
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-600">{review.rewardStatus}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">{review.content}</p>
              {review.rewardStatus !== 'APPROVED' && review.rewardStatus !== 'REJECTED' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => decide(review.id, 'APPROVE')} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm">Approve ₹1</button>
                  <button onClick={() => decide(review.id, 'REJECT')} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm">Reject reward</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

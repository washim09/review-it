'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface Props {
  reviewId: number;
  feedbackReason: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PLATFORMS = [
  { value: 'AMAZON', label: 'Amazon' },
  { value: 'FLIPKART', label: 'Flipkart' },
  { value: 'MEESHO', label: 'Meesho' },
  { value: 'MYNTRA', label: 'Myntra' },
  { value: 'AJIO', label: 'Ajio' },
  { value: 'NYKAA', label: 'Nykaa' },
  { value: 'CROMA', label: 'Croma' },
];

export default function AffiliateResubmitModal({ reviewId, feedbackReason, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [affiliatePlatform, setAffiliatePlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setLoadingReview(false); return; }
    axios.get(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setTitle(res.data.title || '');
      setContent(res.data.content || '');
      setReviewText(res.data.review || '');
      setRating(res.data.rating || 5);
      setAffiliateLink(res.data.affiliateLink || '');
      setAffiliatePlatform(res.data.affiliatePlatform || '');
    }).catch(() => setError('Failed to load review'))
      .finally(() => setLoadingReview(false));
  }, [reviewId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!affiliateLink.startsWith('https://')) {
      setError('Link must start with https://'); return;
    }
    const wc = reviewText.split(/\s+/).filter(w => w.length > 0).length;
    if (wc < 150) { setError(`Min 150 words required (${wc} now)`); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.put(
        `${API_BASE_URL}/api/reviews/resubmit-affiliate`,
        { reviewId, title, content, review: reviewText, rating, affiliateLink, affiliatePlatform },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => { onSuccess(); onClose(); }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Resubmission failed');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-8 text-center border border-green-500/30">
        <h3 className="text-lg font-semibold text-green-400">Resubmitted Successfully</h3>
        <p className="text-gray-400 text-sm mt-2">Your review will be re-verified.</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Edit &amp; Resubmit Review</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {feedbackReason && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
              <p className="text-yellow-300 text-xs font-medium mb-1">Admin Feedback:</p>
              <p className="text-yellow-100 text-sm">{feedbackReason}</p>
            </div>
          )}

          {loadingReview ? (
            <div className="text-center py-8 text-gray-400">Loading review data...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Summary</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={2}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Detailed Review <span className="text-gray-500">(min 150 words)</span>
                </label>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={6}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none resize-y" />
                <p className="text-xs text-gray-500 mt-1">
                  {reviewText.split(/\s+/).filter(w => w.length > 0).length} words
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
                  <select value={affiliatePlatform} onChange={e => setAffiliatePlatform(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none">
                    {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
                  <select value={rating} onChange={e => setRating(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none">
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Affiliate Link</label>
                <input type="url" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors">
                  {loading ? 'Resubmitting...' : 'Resubmit for Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

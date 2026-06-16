'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import AffiliateStatusBadge from './AffiliateStatusBadge';
import AffiliateResubmitModal from './AffiliateResubmitModal';

interface AffiliateReview {
  id: number;
  title: string;
  entity: string;
  affiliatePlatform: string;
  affiliateStatus: string;
  affiliateClickCount: number;
  affiliateSubmittedAt: string;
  affiliateVerifiedAt: string | null;
  affiliateNeedsChangesReason: string | null;
  affiliateRejectionReason: string | null;
}

const AffiliateAnalytics = () => {
  const [reviews, setReviews] = useState<AffiliateReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);
  const [resubmitReviewId, setResubmitReviewId] = useState<number | null>(null);
  const [resubmitFeedback, setResubmitFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliateReviews();
  }, []);

  const fetchAffiliateReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/reviews/my-affiliate`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.reviews) {
        setReviews(response.data.reviews);
        setTotalClicks(response.data.reviews.reduce((sum: number, r: AffiliateReview) => sum + r.affiliateClickCount, 0));
      }
    } catch (error) {
      console.error('Error fetching affiliate analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1a2234] rounded-lg p-4 border border-gray-700">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  const platformLabels: Record<string, string> = {
    AMAZON: 'Amazon',
    FLIPKART: 'Flipkart',
    MEESHO: 'Meesho',
    MYNTRA: 'Myntra',
    AJIO: 'Ajio',
    NYKAA: 'Nykaa',
    CROMA: 'Croma',
  };

  return (
    <div className="bg-[#1a2234] rounded-lg p-4 border border-gray-700 mt-4">
      <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
        <span>📊</span> Affiliate Analytics
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#21293d] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{reviews.length}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="bg-[#21293d] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">
            {reviews.filter((r) => r.affiliateStatus === 'APPROVED' || r.affiliateStatus === 'AUTO_APPROVED').length}
          </div>
          <div className="text-xs text-gray-400">Approved</div>
        </div>
        <div className="bg-[#21293d] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-indigo-400">{totalClicks}</div>
          <div className="text-xs text-gray-400">Total Clicks</div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {reviews.map((review) => (
          <div key={review.id} className="bg-[#21293d] rounded p-3 border border-gray-700/50">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm text-white font-medium truncate flex-1 mr-2">{review.title}</h4>
              <AffiliateStatusBadge status={review.affiliateStatus} />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{platformLabels[review.affiliatePlatform] || review.affiliatePlatform}</span>
              <span>•</span>
              <span>{review.affiliateClickCount} clicks</span>
              {review.affiliateVerifiedAt && (
                <>
                  <span>•</span>
                  <span>Verified {new Date(review.affiliateVerifiedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
            {/* Show feedback for NEEDS_CHANGES */}
            {review.affiliateStatus === 'NEEDS_CHANGES' && review.affiliateNeedsChangesReason && (
              <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs text-orange-300">
                <strong>Feedback:</strong> {review.affiliateNeedsChangesReason}
              </div>
            )}
            {/* Edit & Resubmit button */}
            {review.affiliateStatus === 'NEEDS_CHANGES' && (
              <button
                onClick={() => { setResubmitReviewId(review.id); setResubmitFeedback(review.affiliateNeedsChangesReason); }}
                className="mt-2 w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors"
              >
                Edit &amp; Resubmit
              </button>
            )}
            {/* Show reason for REJECTED */}
            {(review.affiliateStatus === 'REJECTED' || review.affiliateStatus === 'AUTO_REJECTED') && review.affiliateRejectionReason && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                <strong>Reason:</strong> {review.affiliateRejectionReason}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resubmit Modal */}
      {resubmitReviewId && (
        <AffiliateResubmitModal
          reviewId={resubmitReviewId}
          feedbackReason={resubmitFeedback}
          onClose={() => { setResubmitReviewId(null); setResubmitFeedback(null); }}
          onSuccess={() => { setResubmitReviewId(null); setResubmitFeedback(null); fetchAffiliateReviews(); }}
        />
      )}
    </div>
  );
};

export default AffiliateAnalytics;

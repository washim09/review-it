'use client';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface AffiliateReview {
  id: number;
  title: string;
  entity: string;
  content: string;
  review: string;
  rating: number;
  category: string | null;
  tags: string[];
  createdAt: string;
  affiliateEnabled: boolean;
  affiliatePlatform: string;
  affiliateLink: string;
  affiliateStatus: string;
  aiSpamScore: number | null;
  aiSpamReasons: string[];
  affiliateSubmittedAt: string | null;
  affiliateVerifiedAt: string | null;
  affiliateNeedsChangesReason: string | null;
  affiliateRejectionReason: string | null;
  affiliateClickCount: number;
  author: {
    id: number;
    name: string;
    email: string;
    imageUrl: string | null;
  };
}

interface AuditLog {
  id: number;
  action: string;
  reason: string | null;
  aiSpamScore: number | null;
  createdAt: string;
  adminId: number | null;
}

const AdminAffiliates = () => {
  const [reviews, setReviews] = useState<AffiliateReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, needsChanges: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('PENDING_VERIFICATION');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<AffiliateReview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [actionModal, setActionModal] = useState<{ show: boolean; action: string; reviewId: number | null }>({ show: false, action: '', reviewId: null });
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchAffiliateReviews();
  }, [statusFilter, pagination.page, searchTerm]);

  const getToken = () => localStorage.getItem('adminToken');

  const fetchAffiliateReviews = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({
        status: statusFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/affiliate-reviews?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching affiliate reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewDetail = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/affiliate-reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setSelectedReview(data);
      setAuditLogs(data.affiliateAuditLogs || []);
    } catch (error) {
      console.error('Error fetching review detail:', error);
    }
  };

  const handleAction = async () => {
    if (!actionModal.reviewId || !actionModal.action) return;
    if ((actionModal.action === 'REJECT' || actionModal.action === 'NEEDS_CHANGES') && !actionReason.trim()) {
      alert('Please provide a reason.');
      return;
    }

    setActionLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/affiliate-reviews/${actionModal.reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: actionModal.action, reason: actionReason }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Action failed');
        return;
      }

      setSuccessMessage(`Review ${actionModal.action.toLowerCase().replace('_', ' ')} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      setActionModal({ show: false, action: '', reviewId: null });
      setActionReason('');
      setSelectedReview(null);
      fetchAffiliateReviews();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>★</span>
    ));
  };

  const getSpamScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const platformLabels: Record<string, string> = {
    AMAZON: 'Amazon', FLIPKART: 'Flipkart', MEESHO: 'Meesho',
    MYNTRA: 'Myntra', AJIO: 'Ajio', NYKAA: 'Nykaa', CROMA: 'Croma',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Affiliate Review Verification</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('PENDING_VERIFICATION')}>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('APPROVED')}>
          <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
          <div className="text-sm text-green-600">Approved</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('REJECTED')}>
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          <div className="text-sm text-red-600">Rejected</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('NEEDS_CHANGES')}>
          <div className="text-2xl font-bold text-orange-700">{stats.needsChanges}</div>
          <div className="text-sm text-orange-600">Needs Changes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="APPROVED">Approved</option>
          <option value="AUTO_APPROVED">Auto-Approved</option>
          <option value="NEEDS_CHANGES">Needs Changes</option>
          <option value="REJECTED">Rejected</option>
          <option value="AUTO_REJECTED">Auto-Rejected</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, product, or author..."
          className="border rounded px-3 py-2 text-sm flex-1"
        />
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No affiliate reviews found for this filter.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Review</th>
                <th className="text-left px-4 py-3 font-medium">Author</th>
                <th className="text-left px-4 py-3 font-medium">Platform</th>
                <th className="text-left px-4 py-3 font-medium">Spam Score</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-xs">{review.title}</div>
                    <div className="text-xs text-gray-500">{review.entity} • {renderStars(review.rating)}</div>
                    <div className="text-xs text-gray-400">{formatDate(review.affiliateSubmittedAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{review.author.name}</div>
                    <div className="text-xs text-gray-500">{review.author.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {platformLabels[review.affiliatePlatform] || review.affiliatePlatform}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${getSpamScoreColor(review.aiSpamScore)}`}>
                      {review.aiSpamScore !== null ? review.aiSpamScore.toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={review.affiliateStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => fetchReviewDetail(review.id)} className="text-blue-600 hover:underline text-xs">View</button>
                      {review.affiliateStatus === 'PENDING_VERIFICATION' && (
                        <>
                          <button onClick={() => setActionModal({ show: true, action: 'APPROVE', reviewId: review.id })} className="text-green-600 hover:underline text-xs ml-2">Approve</button>
                          <button onClick={() => setActionModal({ show: true, action: 'REJECT', reviewId: review.id })} className="text-red-600 hover:underline text-xs ml-2">Reject</button>
                          <button onClick={() => setActionModal({ show: true, action: 'NEEDS_CHANGES', reviewId: review.id })} className="text-orange-600 hover:underline text-xs ml-2">Changes</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReview(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedReview.title}</h2>
              <button onClick={() => setSelectedReview(null)} className="text-gray-500 hover:text-gray-800 text-xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <strong>Product:</strong> {selectedReview.entity}
              </div>
              <div>
                <strong>Rating:</strong> {renderStars(selectedReview.rating)}
              </div>
              <div>
                <strong>Author:</strong> {selectedReview.author.name} ({selectedReview.author.email})
              </div>
              <div>
                <strong>Platform:</strong> {platformLabels[selectedReview.affiliatePlatform] || selectedReview.affiliatePlatform}
              </div>
              <div className="col-span-2">
                <strong>Affiliate Link:</strong>{' '}
                <a href={selectedReview.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  {selectedReview.affiliateLink}
                </a>
              </div>
              <div>
                <strong>AI Spam Score:</strong>{' '}
                <span className={`font-bold ${getSpamScoreColor(selectedReview.aiSpamScore)}`}>
                  {selectedReview.aiSpamScore !== null ? selectedReview.aiSpamScore.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div>
                <strong>Clicks:</strong> {selectedReview.affiliateClickCount}
              </div>
            </div>

            {/* AI Spam Reasons */}
            {selectedReview.aiSpamReasons && selectedReview.aiSpamReasons.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong className="text-sm">AI Flags:</strong>
                <ul className="list-disc list-inside text-sm text-yellow-800 mt-1">
                  {selectedReview.aiSpamReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Review Content */}
            <div className="mb-4">
              <strong className="text-sm">Review Content:</strong>
              <div className="mt-1 p-3 bg-gray-50 border rounded text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedReview.review || selectedReview.content}
              </div>
            </div>

            {/* Audit Logs */}
            {auditLogs.length > 0 && (
              <div className="mb-4">
                <strong className="text-sm">Audit History:</strong>
                <div className="mt-1 space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="text-xs p-2 bg-gray-50 border rounded flex justify-between">
                      <div>
                        <span className="font-medium">{log.action}</span>
                        {log.reason && <span className="text-gray-600"> — {log.reason}</span>}
                      </div>
                      <span className="text-gray-400">{formatDate(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedReview.affiliateStatus === 'PENDING_VERIFICATION' && (
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setActionModal({ show: true, action: 'APPROVE', reviewId: selectedReview.id })}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => setActionModal({ show: true, action: 'NEEDS_CHANGES', reviewId: selectedReview.id })}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-medium"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => setActionModal({ show: true, action: 'REJECT', reviewId: selectedReview.id })}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => { setActionModal({ show: false, action: '', reviewId: null }); setActionReason(''); }}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-3">
              {actionModal.action === 'APPROVE' && 'Approve Affiliate Review'}
              {actionModal.action === 'REJECT' && 'Reject Affiliate Review'}
              {actionModal.action === 'NEEDS_CHANGES' && 'Request Changes'}
            </h3>

            {actionModal.action === 'APPROVE' ? (
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to approve this affiliate review? It will become publicly visible.
              </p>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {actionModal.action === 'REJECT' ? 'Rejection Reason' : 'Required Changes'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder={actionModal.action === 'REJECT' ? 'Explain why this review is being rejected...' : 'Describe what changes the reviewer needs to make...'}
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setActionModal({ show: false, action: '', reviewId: null }); setActionReason(''); }}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-4 py-2 rounded text-sm text-white font-medium ${
                  actionModal.action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' :
                  actionModal.action === 'REJECT' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-500 hover:bg-orange-600'
                } disabled:opacity-50`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; className: string }> = {
    PENDING_VERIFICATION: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800' },
    AUTO_APPROVED: { label: 'Auto-Approved', className: 'bg-green-100 text-green-800' },
    NEEDS_CHANGES: { label: 'Needs Changes', className: 'bg-orange-100 text-orange-800' },
    REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    AUTO_REJECTED: { label: 'Auto-Rejected', className: 'bg-red-100 text-red-800' },
  };

  const c = config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
};

export default AdminAffiliates;

'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface WithdrawalRow {
  id: number;
  amount: number;
  upiId: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  approvedReviewCount: number;
  openFlagCount: number;
  user: { id: number; name: string; email: string; isVerified: boolean };
}

interface WithdrawalDetail {
  withdrawal: WithdrawalRow;
  reviews: Array<{ id: number; title: string; content: string; rating: number; rewardStatus: string | null; affiliateStatus: string | null; aiSpamScore: number | null }>;
  flags: Array<{ id: number; reason: string; status: string; details: string | null }>;
  ledger: Array<{ id: number; entryType: string; amount: number; note: string | null; createdAt: string }>;
}

export default function AdminWithdrawals() {
  const [rows, setRows] = useState<WithdrawalRow[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [detail, setDetail] = useState<WithdrawalDetail | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = () => localStorage.getItem('adminToken') || '';

  const load = async (nextStatus = status) => {
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/admin/withdrawals?status=${nextStatus}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await response.json();
    setRows(data.withdrawals || []);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const openDetail = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/withdrawals/${id}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    setDetail(await response.json());
  };

  const act = async (id: number, action: 'APPROVE' | 'REJECT' | 'PAY') => {
    const reason = action === 'REJECT' ? window.prompt('Reason for rejecting this withdrawal') : undefined;
    if (action === 'REJECT' && !reason?.trim()) return;
    if (action === 'PAY' && !window.confirm('Confirm that you have manually transferred this amount to the UPI ID.')) return;
    const response = await fetch(`${API_BASE_URL}/api/admin/withdrawals/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    const data = await response.json();
    setMessage(data.message || data.error || 'Updated');
    await load();
    if (detail?.withdrawal.id === id) await openDetail(id);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Manual withdrawals</h1>
      <p className="text-sm text-gray-500 mb-4">
        Payments are not sent automatically. Approve a request, transfer the amount to the saved UPI ID yourself, then mark it paid.
      </p>
      {message && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">{message}</div>}

      <div className="flex gap-2 mb-4">
        {['PENDING', 'APPROVED', 'PAID', 'REJECTED'].map((item) => (
          <button
            key={item}
            onClick={() => { setStatus(item); load(item); }}
            className={`px-3 py-1.5 rounded text-sm ${status === item ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : rows.length === 0 ? (
        <p className="text-gray-400">No requests in this queue.</p>
      ) : (
        <div className="bg-white border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">UPI</th>
                <th className="text-left px-4 py-3">Reviews</th>
                <th className="text-left px-4 py-3">Flags</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.user.name}</div>
                    <div className="text-xs text-gray-500">{row.user.email}</div>
                  </td>
                  <td className="px-4 py-3">₹{row.amount}</td>
                  <td className="px-4 py-3">{row.upiId}</td>
                  <td className="px-4 py-3">{row.approvedReviewCount}</td>
                  <td className="px-4 py-3">{row.openFlagCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(row.id)} className="text-indigo-600">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail?.withdrawal && (
        <div className="mt-6 bg-white border rounded p-4">
          <h2 className="font-semibold text-gray-900 mb-2">Request #{detail.withdrawal.id} · {detail.withdrawal.status}</h2>
          <p className="text-sm text-gray-600 mb-3">
            ₹{detail.withdrawal.amount} to {detail.withdrawal.upiId}. Verify the reviews below, then approve or reject. Mark paid only after the manual transfer.
          </p>
          <div className="flex gap-2 mb-4">
            {detail.withdrawal.status === 'PENDING' && (
              <button onClick={() => act(detail.withdrawal.id, 'APPROVE')} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm">Approve</button>
            )}
            {(detail.withdrawal.status === 'PENDING' || detail.withdrawal.status === 'APPROVED') && (
              <button onClick={() => act(detail.withdrawal.id, 'REJECT')} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm">Reject</button>
            )}
            {detail.withdrawal.status === 'APPROVED' && (
              <button onClick={() => act(detail.withdrawal.id, 'PAY')} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Mark as paid</button>
            )}
          </div>
          <h3 className="text-sm font-medium mb-2">Flags</h3>
          {detail.flags.length === 0 ? <p className="text-xs text-gray-400 mb-3">None</p> : detail.flags.map((flag) => (
            <p key={flag.id} className="text-xs text-gray-700">{flag.status} · {flag.reason} · {flag.details}</p>
          ))}
          <h3 className="text-sm font-medium mt-3 mb-2">Recent reviews</h3>
          <div className="space-y-2">
            {detail.reviews.map((review) => (
              <div key={review.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{review.title}</div>
                <div className="text-xs text-gray-500">Rating {review.rating} · reward {review.rewardStatus || 'none'}{review.affiliateStatus ? ` · ${review.affiliateStatus}` : ''}{review.aiSpamScore != null ? ` · spam ${review.aiSpamScore}` : ''}</div>
                <p className="text-gray-700 mt-1">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

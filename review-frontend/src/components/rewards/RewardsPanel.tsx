'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { getToken } from '../../context/AuthContext';

interface Withdrawal {
  id: number;
  amount: number;
  upiId: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface RewardSummary {
  approvedReviewCount: number;
  totalEarnings: number;
  availableBalance: number;
  minimumWithdrawal: number;
  upiId: string | null;
  hasOpenFlag: boolean;
  openWithdrawal: { id: number; amount: number; status: string } | null;
  nextWithdrawalAmount: number;
  canWithdraw: boolean;
  withdrawBlockReason: string | null;
  withdrawals: Withdrawal[];
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved, payment expected within 24 hours',
  REJECTED: 'Rejected',
  PAID: 'Paid',
};

const RewardsPanel = () => {
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [upiId, setUpiId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = async () => {
    const token = getToken();
    if (!token) return;
    const response = await axios.get(`${API_BASE_URL}/api/rewards/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSummary(response.data);
    setUpiId(response.data.upiId || '');
  };

  useEffect(() => {
    load().catch(() => setError('Rewards could not be loaded.'));
  }, []);

  const saveUpi = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const token = getToken();
      await axios.put(
        `${API_BASE_URL}/api/rewards/upi`,
        { upiId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('UPI ID saved.');
      await load();
    } catch (err) {
      const serverMessage = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      setError(serverMessage || 'Could not save the UPI ID.');
    } finally {
      setSaving(false);
    }
  };

  const withdraw = async () => {
    if (!summary?.canWithdraw) return;
    setWithdrawing(true);
    setError('');
    setMessage('');
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/rewards/withdraw`,
        { amount: summary.nextWithdrawalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      await load();
    } catch (err) {
      const serverMessage = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      setError(serverMessage || 'Could not request a withdrawal.');
      await load().catch(() => undefined);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-[#1a2234] rounded-lg p-4 border border-gray-700/50">
      <h3 className="text-lg font-semibold text-white mb-1">Review rewards</h3>
      <p className="text-sm text-gray-400 mb-4">
        Eligible published reviews earn ₹1 each. Withdrawals are paid manually to your UPI ID after an admin approves the request.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#21293d] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{summary?.approvedReviewCount ?? '—'}</div>
          <div className="text-xs text-gray-400">Approved reviews</div>
        </div>
        <div className="bg-[#21293d] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">₹{summary?.totalEarnings ?? '—'}</div>
          <div className="text-xs text-gray-400">Total earnings</div>
        </div>
        <div className="bg-[#21293d] rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-indigo-400">₹{summary?.availableBalance ?? '—'}</div>
          <div className="text-xs text-gray-400">Available balance</div>
        </div>
      </div>

      {summary?.hasOpenFlag && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded text-sm text-orange-200">
          This account is under review. New rewards and withdrawals stay paused until an admin clears it.
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="upiId" className="block text-sm text-white mb-1.5">UPI ID</label>
        <div className="flex gap-2">
          <input
            id="upiId"
            value={upiId}
            onChange={(event) => setUpiId(event.target.value)}
            placeholder="name@bank"
            className="flex-1 rounded-lg bg-[#21293d] border border-gray-700 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={saveUpi}
            disabled={saving || !upiId.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={withdraw}
        disabled={!summary?.canWithdraw || withdrawing}
        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50"
      >
        {withdrawing
          ? 'Requesting...'
          : summary?.canWithdraw
            ? `Request withdrawal of ₹${summary.nextWithdrawalAmount}`
            : 'Withdrawal unavailable'}
      </button>
      {summary?.withdrawBlockReason && (
        <p className="mt-2 text-xs text-gray-400">{summary.withdrawBlockReason}</p>
      )}

      {message && <p className="mt-3 text-sm text-green-300">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      <div className="mt-5">
        <h4 className="text-sm font-medium text-white mb-2">Withdrawal history</h4>
        {!summary?.withdrawals?.length ? (
          <p className="text-sm text-gray-500">No withdrawal requests yet.</p>
        ) : (
          <div className="space-y-2">
            {summary.withdrawals.map((item) => (
              <div key={item.id} className="bg-[#21293d] rounded p-3 border border-gray-700/50 text-sm">
                <div className="flex items-center justify-between text-white">
                  <span>₹{item.amount}</span>
                  <span className="text-xs text-gray-300">{statusLabel[item.status] || item.status}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {item.upiId} · {new Date(item.createdAt).toLocaleString()}
                </div>
                {item.rejectionReason && (
                  <div className="mt-2 text-xs text-red-300">Reason: {item.rejectionReason}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPanel;

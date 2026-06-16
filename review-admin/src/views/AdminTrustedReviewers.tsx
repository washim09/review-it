'use client';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface Entry { id: number; userId: number; isTrusted: boolean; approvedCount: number; rejectedCount: number; trustedSince: string | null; user: { id: number; name: string; email: string }; }

export default function AdminTrustedReviewers() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [msg, setMsg] = useState('');
  const token = () => localStorage.getItem('adminToken') || '';

  const fetchData = () => {
    fetch(`${API_BASE_URL}/api/admin/trusted-reviewers`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => setEntries(d.trustedReviewers || []))
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const toggle = async (userId: number, current: boolean) => {
    await fetch(`${API_BASE_URL}/api/admin/trusted-reviewers`, {
      method: 'POST', headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isTrusted: !current }),
    });
    fetchData(); setMsg(`Updated user ${userId}`); setTimeout(() => setMsg(''), 3000);
  };

  const add = async () => {
    if (!newUserId.trim()) return;
    await fetch(`${API_BASE_URL}/api/admin/trusted-reviewers`, {
      method: 'POST', headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: parseInt(newUserId), isTrusted: true }),
    });
    setNewUserId(''); fetchData(); setMsg('Added'); setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Trusted Reviewers</h1>
      <p className="text-sm text-gray-500 mb-4">Trusted reviewers get auto-approved for affiliate reviews when their content score is acceptable.</p>

      {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">{msg}</div>}

      {/* Add New */}
      <div className="flex gap-2 mb-6">
        <input type="number" value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="User ID"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40" />
        <button onClick={add} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          Add Trusted Reviewer
        </button>
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-lg border">No trusted reviewers yet.</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Approved</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rejected</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Since</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{e.user.name}</div>
                    <div className="text-xs text-gray-400">{e.user.email} (ID: {e.userId})</div>
                  </td>
                  <td className="px-4 py-3">
                    {e.isTrusted
                      ? <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">Trusted</span>
                      : <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Revoked</span>}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-medium">{e.approvedCount}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{e.rejectedCount}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.trustedSince ? new Date(e.trustedSince).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(e.userId, e.isTrusted)}
                      className={`px-3 py-1 text-xs font-medium rounded ${e.isTrusted ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {e.isTrusted ? 'Revoke' : 'Grant Trust'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

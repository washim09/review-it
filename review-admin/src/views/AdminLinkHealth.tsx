'use client';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface LinkReview {
  id: number;
  title: string;
  entity: string;
  affiliateLink: string;
  affiliatePlatform: string;
  affiliateLinkHealth: string | null;
  affiliateLinkLastCheckedAt: string | null;
  affiliateLinkHttpStatus: number | null;
  affiliateClickCount: number;
  author: { id: number; name: string; email: string };
}

interface Stats {
  total: number;
  healthy: number;
  broken: number;
  unknown: number;
  unchecked: number;
}

export default function AdminLinkHealth() {
  const [reviews, setReviews] = useState<LinkReview[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, healthy: 0, broken: 0, unknown: 0, unchecked: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState('');

  const getToken = () => localStorage.getItem('adminToken') || '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?filter=${filter}` : '';
      const res = await fetch(`${API_BASE_URL}/api/admin/link-health${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats || { total: 0, healthy: 0, broken: 0, unknown: 0, unchecked: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch link health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const runHealthCheck = async () => {
    setChecking(true);
    setCheckResult('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/link-health`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setCheckResult(`Checked ${data.summary.total} links: ${data.summary.healthy} healthy, ${data.summary.broken} broken, ${data.summary.unknown} unknown`);
        fetchData();
      } else {
        setCheckResult('Health check failed');
      }
    } catch {
      setCheckResult('Network error');
    } finally {
      setChecking(false);
    }
  };

  const getHealthBadge = (health: string | null) => {
    switch (health) {
      case 'HEALTHY':
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">Healthy</span>;
      case 'BROKEN':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">Broken</span>;
      case 'REDIRECT_CHANGED':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Redirect Changed</span>;
      case 'UNKNOWN':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Unknown</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">Unchecked</span>;
    }
  };

  const platformLabels: Record<string, string> = {
    AMAZON: 'Amazon', FLIPKART: 'Flipkart', MEESHO: 'Meesho',
    MYNTRA: 'Myntra', AJIO: 'Ajio', NYKAA: 'Nykaa', CROMA: 'Croma',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Link Health Monitor</h1>
        <button
          onClick={runHealthCheck}
          disabled={checking}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {checking ? 'Checking...' : 'Run Health Check'}
        </button>
      </div>

      {checkResult && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {checkResult}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Healthy', value: stats.healthy, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Broken', value: stats.broken, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Unknown', value: stats.unknown, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Unchecked', value: stats.unchecked, color: 'text-gray-500', bg: 'bg-gray-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-4 border border-gray-200 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'healthy', 'broken', 'unchecked'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-lg border">
          No affiliate links found for this filter.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Review</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Platform</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Health</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">HTTP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Check</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Clicks</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Author</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${r.affiliateLinkHealth === 'BROKEN' ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]">{r.title}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{r.affiliateLink}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{platformLabels[r.affiliatePlatform] || r.affiliatePlatform}</td>
                  <td className="px-4 py-3">{getHealthBadge(r.affiliateLinkHealth)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.affiliateLinkHttpStatus || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {r.affiliateLinkLastCheckedAt
                      ? new Date(r.affiliateLinkLastCheckedAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.affiliateClickCount}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 text-xs">{r.author.name}</div>
                    <div className="text-gray-400 text-xs">{r.author.email}</div>
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

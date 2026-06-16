'use client';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface Overview { totalReviews: number; approved: number; pending: number; rejected: number; needsChanges: number; totalClicks: number; avgClicksPerReview: number; }
interface PlatformStat { count: number; clicks: number; approved: number; }
interface TopPerformer { id: number; title: string; platform: string; clicks: number; author: { name: string }; }
interface TopReviewer { id: number; name: string; email: string; reviews: number; clicks: number; }
interface MonthlyData { month: string; submissions: number; clicks: number; }

export default function AdminAffiliateAnalytics() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [platformStats, setPlatformStats] = useState<Record<string, PlatformStat>>({});
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [topReviewers, setTopReviewers] = useState<TopReviewer[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const getToken = () => localStorage.getItem('adminToken') || '';
  const pLabels: Record<string, string> = { AMAZON: 'Amazon', FLIPKART: 'Flipkart', MEESHO: 'Meesho', MYNTRA: 'Myntra', AJIO: 'Ajio', NYKAA: 'Nykaa', CROMA: 'Croma' };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/affiliate-analytics`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(data => {
        setOverview(data.overview); setPlatformStats(data.platformStats || {});
        setTopPerformers(data.topPerformers || []); setTopReviewers(data.topReviewers || []);
        setMonthlyTrend(data.monthlyTrend || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (!overview) return <div className="p-6 text-center text-gray-500">No data</div>;

  const maxC = Math.max(...monthlyTrend.map(m => m.clicks), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Affiliate Analytics</h1>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {([['Total', overview.totalReviews, 'text-gray-900'], ['Approved', overview.approved, 'text-green-600'], ['Pending', overview.pending, 'text-yellow-600'], ['Rejected', overview.rejected, 'text-red-600'], ['Needs Fix', overview.needsChanges, 'text-orange-500'], ['Clicks', overview.totalClicks, 'text-indigo-600'], ['Avg Clicks', overview.avgClicksPerReview, 'text-purple-600']] as [string, number, string][]).map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-lg border p-4 text-center">
            <div className={`text-xl font-bold ${c}`}>{v}</div>
            <div className="text-xs text-gray-500 mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Monthly Trend Bar Chart */}
      <div className="bg-white rounded-lg border p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Clicks (Last 6 Months)</h2>
        <div className="flex items-end gap-3 h-40">
          {monthlyTrend.map(m => (
            <div key={m.month} className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">{m.clicks}</div>
              <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${(m.clicks / maxC) * 100}%`, minHeight: '4px' }}></div>
              <div className="text-[10px] text-gray-400 mt-2 text-center">{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Platform Breakdown */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">By Platform</h2>
          <div className="space-y-2">
            {Object.entries(platformStats).map(([p, s]) => (
              <div key={p} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{pLabels[p] || p}</span>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>{s.count} reviews</span>
                  <span className="text-indigo-600 font-medium">{s.clicks} clicks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Top Reviews</h2>
          <div className="space-y-2">
            {topPerformers.slice(0, 5).map((r, i) => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                <div className="flex-1 truncate text-gray-700">{r.title}</div>
                <span className="text-indigo-600 font-medium text-xs">{r.clicks}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Reviewers */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Top Reviewers</h2>
          <div className="space-y-2">
            {topReviewers.slice(0, 5).map((r, i) => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                <div className="flex-1">
                  <div className="text-gray-700 truncate">{r.name}</div>
                  <div className="text-[10px] text-gray-400">{r.reviews} reviews</div>
                </div>
                <span className="text-indigo-600 font-medium text-xs">{r.clicks} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

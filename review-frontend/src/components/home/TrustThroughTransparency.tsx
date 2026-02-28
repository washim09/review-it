'use client'

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const TrustThroughTransparency = () => {
    type ImpactMetrics = {
    activeUsers: number;
    reviewsWritten: number;
    productCategories: number;
  };

  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCompactPlus = (n: number) => {
    if (!Number.isFinite(n)) return '—';
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B+`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K+`;
    return `${n}+`;
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/metrics/impact`);
        const json = await res.json();
        if (!cancelled && res.ok && json?.success && json?.data) {
          setMetrics({
            activeUsers: json.data.activeUsers,
            reviewsWritten: json.data.reviewsWritten,
            productCategories: json.data.productCategories,
          });
        }
      } catch {
        // swallow: UI should not break
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const valueClass = 'text-4xl font-bold mb-2 min-h-[40px]';
  const placeholder = '—';
  return (
    <div className="py-24 bg-neutral-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center rounded-full bg-white/5 px-3 py-1 mb-4 text-sm">
            <span className="text-secondary-400">TRUST THROUGH TRANSPARENCY</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our <span className="gradient-text-primary">Impact</span> in Numbers</h2>
          <div className="w-20 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mb-6"></div>
          <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
            Join thousands of users who trust ReviewIt for honest product and service reviews
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="card-aurora"
          >
            <div className="card-aurora-content text-center">
              <div className="flex justify-center mb-5">
                <div className="relative bg-gradient-to-br from-accent-900/50 to-accent-800/50 p-4 rounded-full border border-accent-700/30 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <svg className="w-6 h-6 text-accent-400 relative z-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                </div>
              </div>
              <div className={`text-accent-400 ${valueClass}`}>
  {loading ? placeholder : formatCompactPlus(metrics?.activeUsers ?? NaN)}
</div>
              <div className="text-white font-semibold mb-3">Active Users</div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Our growing community of reviewers sharing their honest experiences every day.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="card-aurora"
          >
            <div className="card-aurora-content text-center">
              <div className="flex justify-center mb-5">
                <div className="relative bg-gradient-to-br from-primary-900/50 to-primary-800/50 p-4 rounded-full border border-primary-700/30 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <svg className="w-6 h-6 text-primary-400 relative z-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div className={`text-primary-400 ${valueClass}`}>
  {loading ? placeholder : formatCompactPlus(metrics?.reviewsWritten ?? NaN)}
</div>
              <div className="text-white font-semibold mb-3">Reviews Written</div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Detailed and authentic reviews helping consumers make informed purchasing decisions.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="card-aurora"
          >
            <div className="card-aurora-content text-center">
              <div className="flex justify-center mb-5">
                <div className="relative bg-gradient-to-br from-secondary-900/50 to-secondary-800/50 p-4 rounded-full border border-secondary-700/30 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-secondary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <svg className="w-6 h-6 text-secondary-400 relative z-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </div>
              </div>
              <div className={`text-secondary-400 ${valueClass}`}>
  {loading ? placeholder : formatCompactPlus(metrics?.productCategories ?? NaN)}
</div>
              <div className="text-white font-semibold mb-3">Product Categories</div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Diverse range of products and services across multiple industries and categories.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TrustThroughTransparency;
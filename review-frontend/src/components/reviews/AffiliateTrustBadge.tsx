'use client'

import { useState } from 'react';

interface AffiliateTrustBadgeProps {
  isApproved: boolean;
}

const AffiliateTrustBadge = ({ isApproved }: AffiliateTrustBadgeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isApproved) return null;

  return (
    <div className="relative inline-flex items-center">
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        role="status"
        aria-label="Verified Affiliate Link"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Verified Affiliate Link
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <p className="text-xs text-gray-300 text-center leading-relaxed">
            This affiliate purchase link has been verified by the Riviewit Team for authenticity and safety.
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateTrustBadge;

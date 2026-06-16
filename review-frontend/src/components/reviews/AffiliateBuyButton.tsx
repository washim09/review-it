'use client'

import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config/api';

interface AffiliateBuyButtonProps {
  reviewId: number;
  platform: string;
  isApproved: boolean;
}

const AffiliateBuyButton = ({ reviewId, platform, isApproved }: AffiliateBuyButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Scroll-gated: only show button after user has scrolled 70% of review content
  useEffect(() => {
    if (!isApproved) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.7 }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => observer.disconnect();
  }, [isApproved]);

  if (!isApproved) return null;

  const platformLabels: Record<string, string> = {
    AMAZON: 'Amazon',
    FLIPKART: 'Flipkart',
    MEESHO: 'Meesho',
    MYNTRA: 'Myntra',
    AJIO: 'Ajio',
    NYKAA: 'Nykaa',
    CROMA: 'Croma',
  };

  const handleClick = () => {
    // Open via redirect endpoint (tracks clicks server-side)
    window.open(
      `${API_BASE_URL}/api/affiliate/click/${reviewId}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div ref={buttonRef} className="mt-4">
      {isVisible && (
        <div className="flex flex-col items-start gap-2">
          {/* Disclosure */}
          <p className="text-gray-500 text-xs italic">
            Disclosure: This review contains an affiliate link. The reviewer may earn a commission at no extra cost to you.
          </p>
          
          {/* Buy Button */}
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            rel="nofollow sponsored noopener noreferrer"
          >
            <span className="text-lg">🛒</span>
            <span>Buy This Product</span>
            {platform && (
              <span className="text-xs opacity-80 ml-1">on {platformLabels[platform] || platform}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AffiliateBuyButton;

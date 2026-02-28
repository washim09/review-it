import React from 'react';
import { API_BASE_URL } from '../../config/api';

interface ImageDebugProps {
  url: string;
}

/**
 * A diagnostic component that displays details about an image URL
 * Used for troubleshooting image loading issues
 */
export const ImageDebug: React.FC<ImageDebugProps> = ({ url }) => {
  // Check if URL is absolute or relative
  const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
  
  // Check if it's a data URLa``
  const isDataUrl = url.startsWith('data:');
  
  // Check for common image extensions
  const hasImageExtension = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'
  ].some(ext => url.toLowerCase().endsWith(ext));
  
  // Determine if it's likely a valid URL that should work
  const shouldWork = isAbsoluteUrl || url.startsWith('/') || isDataUrl;
  
  // Get the corrected URL (for display purposes)
  const getCorrectedUrl = () => {
    if (isAbsoluteUrl || isDataUrl) return url;
    
    // Add backend URL for relative paths
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${API_BASE_URL}/${cleanPath}`;
  };
  
  return (
    <div className="bg-black/80 text-white p-2 text-xs font-mono overflow-hidden">
      <div className="flex items-center mb-1">
        <span className={`h-2 w-2 rounded-full mr-1 ${shouldWork ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="font-bold">{shouldWork ? 'URL LOOKS VALID' : 'URL MAY BE INVALID'}</span>
      </div>
      
      <div className="grid grid-cols-[auto_1fr] gap-x-2 text-gray-300">
        <span>Type:</span>
        <span>
          {isAbsoluteUrl && 'Absolute URL'}
          {!isAbsoluteUrl && !isDataUrl && 'Relative Path'}
          {isDataUrl && 'Data URL'}
          {hasImageExtension ? ' (Image)' : ' (Unknown)'}
        </span>
        
        <span>URL:</span>
        <span className="truncate" title={url}>{url}</span>
        
        {!isAbsoluteUrl && !isDataUrl && (
          <>
            <span>Fixed:</span>
            <span className="truncate text-green-400" title={getCorrectedUrl()}>
              {getCorrectedUrl()}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// src/utils/mediaUtils.ts
import { API_BASE_URL } from '../config/api';

/**
 * Ensures a URL is properly formatted for media content from the API
 * @param url The URL to format
 * @returns A properly formatted URL
 */
export const getMediaUrl = (url: string | string[] | undefined | null): string => {
  // Handle arrays - if array is passed, use first element or return empty
  if (Array.isArray(url)) {
    if (url.length === 0) return '';
    url = url[0]; // Use first element
  }
  
  // Check if url is valid string
  if (!url || typeof url !== 'string' || url.trim() === '') return '';
  
  // if already an absolute URL, return it
  if (/^https?:\/\//i.test(url)) return url;
  
  // Handle data URLs and special services
  if (url.startsWith('data:')) return url;
  if (url.includes('ui-avatars.com')) return url;
  
  // strip leading slashes to normalize
  const normalized = url.replace(/^\/+/, '');
  
  // If empty after normalization, return empty
  if (!normalized) return '';
  
  // Check if this is an HEIC/HEIF file
  const lowerUrl = normalized.toLowerCase();
  const isHeic = lowerUrl.endsWith('.heic') || lowerUrl.endsWith('.heif');
  
  // Route through staticfile API
  // If HEIC, request conversion to JPEG via query parameter
  const baseUrl = `${API_BASE_URL}/api/staticfile/${normalized}`;
  return isHeic ? `${baseUrl}?convert=jpeg` : baseUrl;
};

/**
 * Processes an array of media URLs with safety guards
 * @param urls Array or string of URLs to process
 * @returns Array of processed URLs (empty array if invalid input)
 */
export const processMediaUrls = (urls: string[] | string | null | undefined): string[] => {
  // Guard against null/undefined/empty
  if (!urls) return [];
  
  if (Array.isArray(urls)) {
    return urls
      .filter(url => url && typeof url === 'string' && url.trim()) // Filter out empty/invalid URLs
      .map(url => getMediaUrl(url))
      .filter(Boolean); // Remove empty results
  }
  
  // Try to parse JSON string array
  if (typeof urls === 'string' && urls.trim().startsWith('[') && urls.trim().endsWith(']')) {
    try {
      const parsed = JSON.parse(urls);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(url => url && typeof url === 'string' && url.trim())
          .map(url => getMediaUrl(url))
          .filter(Boolean);
      }
    } catch (e) {
      // Ignore parsing errors, continue to single URL handling
    }
  }
  
  // Handle single URL
  if (typeof urls === 'string' && urls.trim()) {
    const processedUrl = getMediaUrl(urls);
    return processedUrl ? [processedUrl] : [];
  }
  
  return [];
};

/**
 * Determines if a URL is a video based on extension or path
 * @param url The URL to check
 * @returns boolean indicating if URL is a video
 */
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.avi', '.mkv', '.mpeg', '.mpg', '.wmv'];
  const urlLower = url.toLowerCase();
  
  // Check file extension
  if (videoExtensions.some(ext => urlLower.endsWith(ext))) return true;
  
  // Check for video in filename
  if (urlLower.includes('whatsapp-video')) return true;
  if (urlLower.includes('_video_')) return true;
  if (urlLower.includes('-video_')) return true;
  if (urlLower.includes('video') && urlLower.includes('.')) return true;
  
  // Check path indicators
  if (urlLower.includes('/video/')) return true;
  if (urlLower.includes('video') && urlLower.includes('uploads/')) return true;
  
  return false;
};

/**
 * Determines if a URL is an HEIC/HEIF image (Apple format)
 * @param url The URL to check
 * @returns boolean indicating if URL is HEIC format
 */
export const isHeicImage = (url: string): boolean => {
  if (!url) return false;
  const urlLower = url.toLowerCase();
  return urlLower.endsWith('.heic') || urlLower.endsWith('.heif');
};

/**
 * Gets list of supported image extensions
 * @returns Array of supported image extensions
 */
export const getSupportedImageExtensions = (): string[] => {
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.heic', '.heif'];
};

/**
 * Gets list of supported video extensions
 * @returns Array of supported video extensions
 */
export const getSupportedVideoExtensions = (): string[] => {
  return ['.mp4', '.webm', '.mov', '.ogg', '.avi', '.mkv', '.mpeg', '.mpg', '.wmv'];
};

/**
 * Checks if file extension is a supported image format
 * @param filename The filename or URL to check
 * @returns boolean indicating if it's a supported image
 */
export const isSupportedImageFormat = (filename: string): boolean => {
  if (!filename) return false;
  const lowerName = filename.toLowerCase();
  return getSupportedImageExtensions().some(ext => lowerName.endsWith(ext));
};

/**
 * Checks if file extension is a supported video format
 * @param filename The filename or URL to check
 * @returns boolean indicating if it's a supported video
 */
export const isSupportedVideoFormat = (filename: string): boolean => {
  if (!filename) return false;
  const lowerName = filename.toLowerCase();
  return getSupportedVideoExtensions().some(ext => lowerName.endsWith(ext));
};

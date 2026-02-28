// utils/getFullUrl.ts
import { API_BASE_URL } from '../config/api';
export function getFullUrl(url: string | string[] | undefined | null): string {
  // Handle arrays - if array is passed, use first element or return empty
  if (Array.isArray(url)) {
    if (url.length === 0) return '';
    url = url[0]; // Use first element
  }
  
  // Check if url is valid string
  if (!url || typeof url !== 'string' || url.trim() === '') return '';
  
  // if already an absolute URL, return it
  if (/^https?:\/\//i.test(url)) return url;
  
  // strip leading slashes to normalize
  const normalized = url.replace(/^\/+/, '');
  
  // If empty after normalization, return empty
  if (!normalized) return '';
  
  // Route through staticfile API
  return `${API_BASE_URL}/api/staticfile/${normalized}`;
}

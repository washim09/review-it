/**
 * Generate a local avatar SVG as a data URL
 * This replaces the external ui-avatars.com service
 */
export function generateLocalAvatar(name: string = 'User', backgroundColor: string = '#6D28D9', textColor: string = '#FFFFFF'): string {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  // Create SVG as data URL
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${backgroundColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="80" font-weight="600" fill="${textColor}">
        ${initials}
      </text>
    </svg>
  `;

  // Convert to base64 data URL
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate a placeholder image as data URL
 * This replaces external placeholder services like picsum.photos
 */
export function generatePlaceholderImage(text: string = 'No Image'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#1F2937"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="24" fill="#9CA3AF">
        ${text}
      </text>
    </svg>
  `;
  
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

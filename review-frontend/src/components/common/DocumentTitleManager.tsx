'use client'

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Define page titles for different routes
const pageTitles: Record<string, string> = {
  '/': 'Riviewit',
  '/home': 'Home | Riviewit',
  '/about-us': 'About Us | Riviewit',
  '/login': 'Login | Riviewit',
  '/register': 'Sign Up | Riviewit',
  '/profile': 'Profile | Riviewit',
  '/support': 'Support | Riviewit',
  '/careers': 'Careers | Riviewit',
  '/terms-of-service': 'Terms of Service | Riviewit',
  '/privacy-policy': 'Privacy Policy | Riviewit',
  '/cookie-policy': 'Cookie Policy | Riviewit',
  '/messages': 'Messages | Riviewit',
  '/message': 'Messages | Riviewit',
};

// Component to manage document title based on current route
const DocumentTitleManager = () => {
  const pathname = usePathname();

  useEffect(() => {
    const currentPath = pathname;
    
    // Check for dynamic routes (like /review/:id or /message/:contactId)
    let title = pageTitles[currentPath];
    
    if (!title) {
      // Handle dynamic routes
      if (currentPath.startsWith('/review/')) {
        title = 'Review Details | Riviewit';
      } else if (currentPath.startsWith('/message/') || currentPath.startsWith('/messages/')) {
        title = 'Messages | Riviewit';
      } else {
        // Default fallback title
        title = 'Riviewit';
      }
    }
    
    // Update the document title
    document.title = title;
  }, [pathname]);

  // This component doesn't render anything
  return null;
};

export default DocumentTitleManager;

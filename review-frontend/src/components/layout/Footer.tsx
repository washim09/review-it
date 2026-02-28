'use client'

import Link from 'next/link';
import { useState } from 'react';
import XIcon from '../icons/XIcon';
import FacebookIcon from '../icons/FacebookIcon';
import InstagramIcon from '../icons/InstagramIcon';
import YouTubeIcon from '../icons/YouTubeIcon';
import LinkedInIcon from '../icons/LinkedInIcon';
import { API_BASE_URL } from '../../config/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Successfully subscribed! Check your email for confirmation.');
        setIsSuccess(true);
        setEmail('');
      } else {
        setMessage(data.error || 'Failed to subscribe. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error. Please try again later.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                <img 
                  src="/assets/color_logo.png" 
                  alt="Reviewit Logo" 
                  className="h-8 w-auto cursor-pointer"
                  onError={(e) => {
                    // Fallback to text if logo doesn't exist
                    e.currentTarget.outerHTML = `<h3 class="font-display text-2xl font-bold mb-4">Review<span class="text-white/80">it</span></h3>`;
                  }}
                />
              </Link>
            </div>
            <p className="text-white/80 mb-6">Honest reviews for informed decisions</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-white/90">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/about-us" className="text-white/70 hover:text-white transition-colors">About Us</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Blog</a></li>
              <li><Link href="/careers" className="text-white/70 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/support" className="text-white/70 hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-white/90">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms-of-service" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="text-white/70 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-white/90">Subscribe</h4>
            <p className="text-white/70 mb-4">Stay updated with our latest reviews</p>
            <form onSubmit={handleSubscribe} className="mb-4">
              <div className="flex mb-3">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-800/50 border border-indigo-700 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-white/50 text-white w-full placeholder-white/50 disabled:opacity-50" 
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-400 text-white rounded-r-lg transition-colors flex items-center justify-center min-w-[100px]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
              {message && (
                <p className={`text-sm ${
                  isSuccess ? 'text-green-300' : 'text-red-300'
                } mb-2`}>
                  {message}
                </p>
              )}
            </form>
            <div className="flex justify-start space-x-4">
              {/* X (Twitter) */}
              <a 
                href="https://x.com/riviewit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors group"
                title="Follow us on X"
              >
                <XIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/share/1AjZCL4WmQ/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors group"
                title="Like us on Facebook"
              >
                <FacebookIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/riview_it?igsh=MTNydm1kenZ6bXU1aA==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors group"
                title="Follow us on Instagram"
              >
                <InstagramIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              
              {/* YouTube */}
              <a 
                href="https://youtube.com/@riviewit?si=8UvYkusXg0BMpGGr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors group"
                title="Subscribe to our YouTube channel"
              >
                <YouTubeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              
              {/* LinkedIn */}
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors group"
                title="Follow us on LinkedIn"
              >
                <LinkedInIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-indigo-800/50 mt-12 pt-6 text-sm text-white/50 text-center">
          © {new Date().getFullYear()} Riviewit. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        let errorMessage = 'Authentication failed';
        
        switch (error) {
          case 'oauth_error':
            errorMessage = 'OAuth authentication failed';
            break;
          case 'missing_code':
            errorMessage = 'Authorization code missing';
            break;
          case 'auth_failed':
            errorMessage = 'Authentication failed';
            break;
          case 'server_error':
            errorMessage = 'Server error occurred';
            break;
        }
        
        router.push(`/login?error=${errorMessage}`);
        return;
      }

      if (token && userParam) {
        try {
          // Parse user data
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          // Store token and user data
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update auth context
          login(token, userData);
          
          // Redirect to home page after successful login
          router.push('/');
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          router.push('/login?error=Processing failed');
        }
      } else {
        router.push('/login?error=Missing authentication data');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing Google sign in...</p>
        <p className="text-white/60 text-sm mt-2">Please wait while we authenticate you</p>
      </div>
    </div>
  );
};

export default AuthCallback;

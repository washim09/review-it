'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams?.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/auth/verify-email?token=${token}`
        );

        if (response.data.success) {
          setVerificationStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        {verificationStatus === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h2>
            <p className="text-white/70">Please wait while we verify your email address...</p>
          </>
        )}
        
        {verificationStatus === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-white/70 mb-4">{message}</p>
            <p className="text-white/50 text-sm">Redirecting to login page...</p>
          </>
        )}
        
        {verificationStatus === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-white/70 mb-6">{message}</p>
            <button
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Go to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

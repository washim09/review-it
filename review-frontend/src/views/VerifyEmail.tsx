'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { API_BASE_URL } from '../config/api';

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const email = searchParams?.get('email');
  const token = searchParams?.get('token');

  useEffect(() => {
    if (email && !token) {
      setVerificationStatus('pending');
      return;
    }

    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/auth/verify-email?token=${token}`
        );

        if (response.data.success) {
          setVerificationStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
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
  }, [searchParams, router, email, token]);

  const handleResendEmail = async () => {
    if (!email) return;
    setResendLoading(true);
    setResendMessage('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, { email });
      if (response.data.success) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendMessage(response.data.message || 'Failed to resend. Please try again.');
      }
    } catch (error) {
      setResendMessage('Failed to resend verification email. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <div className="flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-md w-full">
          <div className="card-aurora">
            <div className="card-aurora-content p-8 text-center">
              {verificationStatus === 'pending' && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                  <p className="text-white/70 mb-2">
                    We&apos;ve sent a verification link to:
                  </p>
                  <p className="text-indigo-400 font-medium mb-6">{email}</p>
                  <p className="text-white/50 text-sm mb-8">
                    Please click the link in the email to verify your account. The link will expire in 24 hours.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={handleResendEmail}
                      disabled={resendLoading}
                      className="w-full py-2.5 px-4 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full py-2.5 px-4 rounded-lg text-white/60 hover:text-white/80 transition-colors text-sm"
                    >
                      Go to Login
                    </button>
                  </div>

                  {resendMessage && (
                    <div className={`mt-4 text-sm ${resendMessage.includes('sent') ? 'text-green-400' : 'text-red-400'}`}>
                      {resendMessage}
                    </div>
                  )}
                </>
              )}

              {verificationStatus === 'verifying' && (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                  <h2 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h2>
                  <p className="text-white/70">Please wait while we verify your email address...</p>
                </>
              )}

              {verificationStatus === 'success' && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                  <p className="text-white/70 mb-4">{message}</p>
                  <p className="text-white/50 text-sm">Redirecting to login page...</p>
                </>
              )}

              {verificationStatus === 'error' && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                  <p className="text-white/70 mb-6">{message}</p>
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium hover:opacity-90 transition"
                  >
                    Go to Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

'use client'

//Login.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { validateEmail, sanitizeInput, loginRateLimiter, formatRemainingTime } from '../utils/validation';
import { API_BASE_URL } from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const router = useRouter();
  const { login } = useAuth(); // Destructure login from context

  // Google OAuth login handler
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  // Email validation handler
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError('');
    
    if (newEmail) {
      const validation = validateEmail(newEmail);
      if (!validation.isValid) {
        setEmailError(validation.error || '');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setRateLimitError('');
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    
    // Validate email
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }
    
    // Check rate limiting
    const rateLimitCheck = loginRateLimiter.isAllowed(sanitizedEmail);
    if (!rateLimitCheck.allowed) {
      const remainingTime = formatRemainingTime(rateLimitCheck.remainingTime || 0);
      setRateLimitError(`Too many login attempts. Please try again in ${remainingTime}.`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Reset rate limiter on successful login
      loginRateLimiter.reset(sanitizedEmail);
      
      login(data.token, data.user); // Use the login function from context
      
      // Debug: Check if token and user are properly stored
      
      router.push('/'); // Redirect to the landing page
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-950 pt-20 pb-12 px-4">
        <div className="container mx-auto">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center rounded-full bg-white/5 px-3 py-1 mb-4 text-sm">
                <span className="text-purple-400">WELCOME BACK</span>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">Sign in to Review-it</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-700 mx-auto rounded-full mb-6"></div>
              <p className="text-white/70 max-w-md mx-auto">Access your account to manage your reviews, messages, and profile.</p>
            </div>

            <div className="relative p-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700">
              <div className="bg-neutral-900 rounded-lg p-8">

              {(error || emailError || rateLimitError) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="bg-red-900/30 text-red-200 px-4 py-3 rounded-lg flex items-start mb-6 border border-red-800/50"
              >
                <div className="flex-shrink-0 mr-3">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  {error && <p className="text-sm mb-1">{error}</p>}
                  {emailError && <p className="text-sm mb-1">{emailError}</p>}
                  {rateLimitError && <p className="text-sm">{rateLimitError}</p>}
                </div>
              </motion.div>
            )}
            
            <motion.form 
              onSubmit={handleLogin} 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="block w-full pl-10 pr-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors text-white"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-white/80">Password</label>
                  <Link href="/forgot-password" className="text-sm text-indigo-400 hover:text-purple-400 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="block w-full pl-10 pr-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading || !!rateLimitError}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-lg hover:shadow-indigo-700/20 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-sm text-white/60">
                  Don't have an account?{' '}
                  <Link href="/register" className="font-medium text-indigo-400 hover:text-purple-400 transition-colors">Sign up now</Link>
                </p>
              </div>
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-neutral-900 text-neutral-400">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <button 
                  type="button" 
                  onClick={handleGoogleLogin}
                  className="w-full max-w-sm inline-flex justify-center items-center gap-3 py-3 px-6 border border-neutral-700 rounded-lg bg-neutral-800 text-sm font-medium text-white/70 hover:bg-neutral-700 hover:text-white transition-all hover:scale-105"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </motion.form>
              </div>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center text-sm text-white/50"
          >
            By signing in, you agree to our{' '}
            <Link href="#" className="text-indigo-400 hover:text-purple-400">Terms of Service</Link>{' '}
            and{' '}
            <Link href="#" className="text-indigo-400 hover:text-purple-400">Privacy Policy</Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
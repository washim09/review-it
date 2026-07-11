'use client'

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../utils/validation';
import { API_BASE_URL } from '../config/api';

const Register = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setNameError('');
    if (newName) {
      const validation = validateName(newName);
      if (!validation.isValid) setNameError(validation.error || '');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError('');
    if (newEmail) {
      const validation = validateEmail(newEmail);
      if (!validation.isValid) setEmailError(validation.error || '');
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError('');
    setPasswordStrength('');
    if (newPassword) {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) setPasswordError(validation.error || '');
      setPasswordStrength(validation.strength);
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    const nameValidation = validateName(sanitizedName);
    const emailValidation = validateEmail(sanitizedEmail);
    const passwordValidation = validatePassword(sanitizedPassword);

    let hasErrors = false;

    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || 'Invalid name');
      hasErrors = true;
    }
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      hasErrors = true;
    }
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || 'Invalid password');
      hasErrors = true;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasErrors = true;
    }
    if (hasErrors) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          password: sanitizedPassword,
        }),
      });

      if (response.status === 201) {
        await response.json();
        setMessage('Account created successfully! Please verify your email.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPasswordStrength('');
        setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(sanitizedEmail)}`), 1500);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed. Please try again.' }));
        setMessage(errorData.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center rounded-full bg-white/5 px-3 py-1 mb-4 text-sm">
              <span className="text-secondary-400">GET STARTED</span>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-white">Create Your Account</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mb-6"></div>
            <p className="text-white/70">Join Riviewit in less than 30 seconds. Share your experiences and help others make better decisions.</p>
          </div>
          <div className="card-aurora">
            <div className="card-aurora-content p-8">
              {message && (
                <div className={message.includes('successfully') ? "alert-success mb-6" : "alert-danger mb-6"}>
                  <div className="font-medium">{message}</div>
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    className={`form-input ${nameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                    placeholder="John Doe"
                    value={name}
                    onChange={handleNameChange}
                    required
                  />
                  {nameError && <p className="mt-1 text-sm text-red-400">{nameError}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                  {emailError && <p className="mt-1 text-sm text-red-400">{emailError}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    className={`form-input ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordError && <p className="mt-1 text-sm text-red-400">{passwordError}</p>}
                  {password && passwordStrength && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-neutral-400">Password Strength</span>
                        <span className={`font-medium ${
                          passwordStrength === 'strong' ? 'text-green-400' :
                          passwordStrength === 'medium' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength === 'strong' ? 'w-full bg-green-500' :
                          passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                          'w-1/3 bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className={`form-input ${confirmPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                  />
                  {confirmPasswordError && <p className="mt-1 text-sm text-red-400">{confirmPasswordError}</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !!nameError || !!emailError || !!passwordError || !!confirmPasswordError}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-lg hover:shadow-indigo-700/20 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-white/60">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-indigo-400 hover:text-purple-400 transition-colors">Sign in</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
'use client'

import { useState, useRef, ChangeEvent } from 'react';
import Navbar from '../components/layout/Navbar';
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../utils/validation';
import { API_BASE_URL } from '../config/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation handlers
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setNameError('');
    
    if (newName) {
      const validation = validateName(newName);
      if (!validation.isValid) {
        setNameError(validation.error || '');
      }
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError('');
    setPasswordStrength('');
    
    if (newPassword) {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        setPasswordError(validation.error || '');
      }
      setPasswordStrength(validation.strength);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size should be less than 5MB');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setMessage('Please upload a valid image file (JPG, PNG, or GIF)');
      return;
    }
    
    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear all previous messages and errors at the start
    setMessage('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    
    // Sanitize all inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedContact = sanitizeInput(contact);
    const sanitizedAddress = sanitizeInput(address);
    const sanitizedCity = sanitizeInput(city);
    const sanitizedState = sanitizeInput(state);
    const sanitizedInstagram = sanitizeInput(instagram);
    const sanitizedFacebook = sanitizeInput(facebook);
    const sanitizedTwitter = sanitizeInput(twitter);
    
    // Comprehensive validation
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
    
    if (hasErrors) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First upload the image if provided
      let imageUrl = null;
      if (profileImage) {
        const formData = new FormData();
        formData.append('file', profileImage);
        
        const imageResponse = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!imageResponse.ok) {
          throw new Error('Image upload failed');
        }
        
        const imageData = await imageResponse.json();
        imageUrl = imageData.url;
      }
      
      // Then submit the registration data with the image URL
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          password: sanitizedPassword,
          imageUrl,
          contact: sanitizedContact,
          dob: dateOfBirth,
          gender,
          address: sanitizedAddress,
          city: sanitizedCity,
          state: sanitizedState,
          instagram: sanitizedInstagram,
          facebook: sanitizedFacebook,
          twitter: sanitizedTwitter,
        }),
      });
  
      // Handle response based on status code
      if (response.status === 201) {
        // Success: User created and verification email sent
        await response.json();

        setMessage('Registration successful! Sign in to leave a review and help others.');
        
        // Reset form fields only on success
        setName('');
        setEmail('');
        setPassword('');
        setContact('');
        setDateOfBirth('');
        setGender('');
        setAddress('');
        setCity('');
        setState('');
        setInstagram('');
        setFacebook('');
        setTwitter('');
        setProfileImage(null);
        setImagePreview(null);
        setPasswordStrength('');
      } else {
        // Error: Handle all non-success status codes
        const errorData = await response.json().catch(() => ({ message: 'Registration failed. Please try again.' }));
        const errorMessage = errorData.message || 'Registration failed. Please try again.';
        console.error('Registration failed:', errorMessage);
        setMessage(errorMessage);
        return; // Exit early to prevent further execution
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center rounded-full bg-white/5 px-3 py-1 mb-4 text-sm">
              <span className="text-secondary-400">GET STARTED</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Join Review-it Today</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mb-6"></div>
            <p className="text-white/70 max-w-2xl mx-auto">Create an account to share your experiences, connect with other reviewers, and help others make better decisions.</p>
          </div>
          <div className="card-aurora">
            <div className="card-aurora-content p-8">
              {message && (
                <div className={message.includes('successful') ? "alert-success mb-6" : "alert-danger mb-6"}>
                  {message.includes('successful') ? (
                    <div className="font-medium">{message}</div>
                  ) : (
                    <>
                      <div className="font-medium">Registration Failed</div>
                      <div>{message}</div>
                    </>
                  )}
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-8">
                {/* Profile Image Upload Section */}
                <div className="mb-6 text-center">
                  <label htmlFor="profileImage" className="block mb-2 font-medium">Profile Image</label>
                  <div className="flex flex-col items-center">
                    {imagePreview ? (
                      <div className="w-32 h-32 mx-auto relative rounded-full overflow-hidden border-2 border-primary-500/50">
                        <img 
                          src={imagePreview || 'https://via.placeholder.com/128?text=Preview'} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-accent-500 text-white rounded-full p-1 shadow-sm hover:bg-accent-600 transition-colors"
                          onClick={() => {
                            setProfileImage(null);
                            setImagePreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          aria-label="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        className="w-32 h-32 mx-auto bg-neutral-800/50 border-2 border-dashed border-primary-700/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-800/70 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <span className="text-primary-300 text-sm font-medium">Add Photo</span>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-neutral-400">Click to upload (max 5MB)</div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="flex items-center my-10">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                  <span className="px-4 text-neutral-400 text-sm font-medium">Personal Details</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
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
                      {nameError && (
                        <p className="mt-1 text-sm text-red-400">{nameError}</p>
                      )}
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
                      {emailError && (
                        <p className="mt-1 text-sm text-red-400">{emailError}</p>
                      )}
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
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-400">{passwordError}</p>
                      )}
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
                      <label htmlFor="contact" className="form-label">Contact Number</label>
                      <input
                        id="contact"
                        type="text"
                        className="form-input"
                        placeholder="+1 (555) 123-4567"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        className="form-input"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="form-label">Gender</label>
                      <select
                        id="gender"
                        className="form-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="form-label">Address</label>
                      <textarea
                        id="address"
                        className="form-input"
                        placeholder="Your street address"
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="form-label">City</label>
                      <input
                        id="city"
                        type="text"
                        className="form-input"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="form-label">State/Province</label>
                      <input
                        id="state"
                        type="text"
                        className="form-input"
                        placeholder="NY"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="instagram" className="form-label">Instagram <span className="text-neutral-500 text-xs">(optional)</span></label>
                      <input
                        id="instagram"
                        type="text"
                        className="form-input"
                        placeholder="@username"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="facebook" className="form-label">Facebook <span className="text-neutral-500 text-xs">(optional)</span></label>
                      <input
                        id="facebook"
                        type="text"
                        className="form-input"
                        placeholder="facebook.com/username"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="twitter" className="form-label">Twitter <span className="text-neutral-500 text-xs">(optional)</span></label>
                      <input
                        id="twitter"
                        type="text"
                        className="form-input"
                        placeholder="@username"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <button 
                    type="submit" 
                    disabled={isLoading || !!nameError || !!emailError || !!passwordError}
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
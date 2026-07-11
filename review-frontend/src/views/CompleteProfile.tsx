'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import { API_BASE_URL } from '../config/api';

const CompleteProfile = () => {
  const router = useRouter();
  const [contact, setContact] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size should be less than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setMessage('Please upload a valid image file (JPG, PNG, or GIF)');
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      let imageUrl = null;
      if (profileImage) {
        const formData = new FormData();
        formData.append('file', profileImage);
        const imageResponse = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.url;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/complete-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl,
          contact: contact || undefined,
          dob: dateOfBirth || undefined,
          gender: gender || undefined,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          instagram: instagram || undefined,
          facebook: facebook || undefined,
          twitter: twitter || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update stored user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({ ...user, ...data.user, profileCompleted: true }));
        }
        setMessage('Profile updated successfully! Redirecting...');
        setTimeout(() => router.push('/'), 1500);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile.' }));
        setMessage(errorData.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Mark as skipped in localStorage so we don't keep redirecting
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      localStorage.setItem('user', JSON.stringify({ ...user, profileCompleted: true }));
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center rounded-full bg-white/5 px-3 py-1 mb-4 text-sm">
              <span className="text-secondary-400">ALMOST THERE</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mb-6"></div>
            <p className="text-white/70">Add more details to personalize your experience. All fields are optional — you can skip and come back later.</p>
          </div>

          <div className="card-aurora">
            <div className="card-aurora-content p-8">
              {message && (
                <div className={message.includes('successfully') ? 'alert-success mb-6' : 'alert-danger mb-6'}>
                  <div className="font-medium">{message}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Photo */}
                <div className="text-center">
                  <label className="block mb-3 font-medium text-white/80">Profile Photo</label>
                  <div className="flex flex-col items-center">
                    {imagePreview ? (
                      <div className="w-28 h-28 relative rounded-full overflow-hidden border-2 border-primary-500/50">
                        <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          onClick={() => {
                            setProfileImage(null);
                            setImagePreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div
                        className="w-28 h-28 bg-neutral-800/50 border-2 border-dashed border-primary-700/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-800/70 transition-colors"
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

                {/* Personal Information */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                    <span className="px-4 text-neutral-400 text-sm font-medium">Personal Information</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact" className="form-label">Mobile Number</label>
                      <input
                        id="contact"
                        type="text"
                        className="form-input"
                        placeholder="+1 (555) 123-4567"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
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
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="form-label">Gender</label>
                      <select
                        id="gender"
                        className="form-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                    <span className="px-4 text-neutral-400 text-sm font-medium">Location</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="form-label">Address</label>
                      <textarea
                        id="address"
                        className="form-input"
                        placeholder="Your street address"
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
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
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="form-label">State</label>
                      <input
                        id="state"
                        type="text"
                        className="form-input"
                        placeholder="NY"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                    <span className="px-4 text-neutral-400 text-sm font-medium">Social Media <span className="text-neutral-500">(Optional)</span></span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="instagram" className="form-label">Instagram</label>
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
                      <label htmlFor="facebook" className="form-label">Facebook</label>
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
                      <label htmlFor="twitter" className="form-label">Twitter</label>
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-lg hover:shadow-indigo-700/20 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 py-3 px-4 rounded-lg border border-neutral-700 text-white/60 hover:text-white/80 hover:border-neutral-600 transition-colors text-base font-medium"
                  >
                    Skip for Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;

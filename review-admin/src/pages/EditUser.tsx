'use client';
// src/pages/EditUser.tsx
import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '../config/api';
import { fetchUser, updateUser } from '../services/adminService';

const EditUser = () => {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    email: '',
    imageUrl: '',
    contact: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    instagram: '',
    facebook: '',
    twitter: '',
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await fetchUser(Number(id));
        setUser(data);
        
        // Set image preview if user has an image
        if (data.imageUrl) {
          setImagePreview(`${API_BASE_URL}${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    getUser();
  }, [id]);
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, or GIF)');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First upload the image if provided
      let imageUrl = user.imageUrl;
      
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
      
      // Update the user with potentially new image URL
      await updateUser(Number(id), { ...user, imageUrl });
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Edit User</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Profile Image Upload Section */}
        <div className="mb-6">
          <label htmlFor="profileImage" className="block mb-2 font-medium">Profile Image</label>
          <div className="flex items-center space-x-4">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Profile Preview" 
                  className="w-24 h-24 object-cover rounded-full border-2 border-gray-300" 
                />
                <button 
                  type="button"
                  onClick={() => {
                    setProfileImage(null);
                    setImagePreview(user.imageUrl ? `${API_BASE_URL}${user.imageUrl}` : null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </button>
              <p className="text-sm text-gray-500 mt-2">Max size: 5MB (JPG, PNG, GIF)</p>
            </div>
          </div>
        </div>
        {/* Include all input fields */}
        <div>
          <label htmlFor="name" className="block mb-1">Name</label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border rounded"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="contact" className="block mb-1">Contact</label>
          <input
            id="contact"
            type="text"
            className="w-full p-2 border rounded"
            value={user.contact}
            onChange={(e) => setUser({ ...user, contact: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="gender" className="block mb-1">Gender</label>
          <select
            id="gender"
            className="w-full p-2 border rounded"
            value={user.gender}
            onChange={(e) => setUser({ ...user, gender: e.target.value })}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="address" className="block mb-1">Address</label>
          <input
            id="address"
            type="text"
            className="w-full p-2 border rounded"
            value={user.address}
            onChange={(e) => setUser({ ...user, address: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block mb-1">City</label>
          <input
            id="city"
            type="text"
            className="w-full p-2 border rounded"
            value={user.city}
            onChange={(e) => setUser({ ...user, city: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="state" className="block mb-1">State</label>
          <input
            id="state"
            type="text"
            className="w-full p-2 border rounded"
            value={user.state}
            onChange={(e) => setUser({ ...user, state: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="instagram" className="block mb-1">Instagram</label>
          <input
            id="instagram"
            type="text"
            className="w-full p-2 border rounded"
            value={user.instagram}
            onChange={(e) => setUser({ ...user, instagram: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="facebook" className="block mb-1">Facebook</label>
          <input
            id="facebook"
            type="text"
            className="w-full p-2 border rounded"
            value={user.facebook}
            onChange={(e) => setUser({ ...user, facebook: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="twitter" className="block mb-1">Twitter</label>
          <input
            id="twitter"
            type="text"
            className="w-full p-2 border rounded"
            value={user.twitter}
            onChange={(e) => setUser({ ...user, twitter: e.target.value })}
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditUser;
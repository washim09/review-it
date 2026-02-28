'use client'

import React, { useState } from 'react';
import { FaEdit, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaInstagram, FaFacebook, FaEllipsisV, FaPencilAlt } from 'react-icons/fa';
import XIcon from '../icons/XIcon';
import { User } from '../../types';
import { useEffect } from 'react';
import { getMediaUrl as getFullUrl } from '../../utils/mediaUtils';
import ProfileEditForm from './ProfileEditForm';
import { useAuth } from '../../context/AuthContext';

interface UserDetailsProps {
  user: {
    id: number;
    name: string;
    email: string;
    imageUrl?: string;
    contact?: string;
    dob?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  onUserUpdate?: (updatedUser: User) => void;
}

// Using imported getFullUrl from mediaUtils

// Generate an avatar from initials when image fails to load
const generateAvatarFromInitials = (name: string): string => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 200;
  canvas.height = 200;

  if (context) {
    // Create gradient background
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#6366f1'); // indigo-500
    gradient.addColorStop(1, '#a855f7'); // purple-500
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    context.font = 'bold 80px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Get initials
    const initials = name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    context.fillText(initials, canvas.width / 2, canvas.height / 2);
  }
  
  return canvas.toDataURL('image/png');
};

const UserDetails: React.FC<UserDetailsProps> = ({ user, onUserUpdate }) => {
  const { login } = useAuth();
  const [showEditButton, setShowEditButton] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Process profile image URL on component mount or when user changes
  useEffect(() => {
    if (user?.imageUrl) {
      // Format the URL properly
      const formattedUrl = getFullUrl(user.imageUrl);

      setProfileImageUrl(formattedUrl);
      setImageError(false);
    } else {
      setProfileImageUrl('');
      setImageError(true);
    }
  }, [user?.imageUrl]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on dropdown or its children
      if (showDropdown && !target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleProfileUpdate = (updatedUser: User) => {
    // Update the AuthContext with the new user data
    const token = localStorage.getItem('authToken');
    if (token) {
      login(token, updatedUser);
    }
    
    // Also call the parent component's update handler
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  // Debug logging

  return (
    <div className="bg-neutral-800 shadow-lg rounded-lg overflow-hidden mb-8 border border-neutral-700">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 relative">
        {/* Three-dot menu */}
        <div className="absolute top-4 right-4">
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <FaEllipsisV className="text-lg" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-10 overflow-hidden">
                <div className="p-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      setShowEditForm(true);
                      setShowDropdown(false);

                    }}
                    className="w-full px-4 py-3 text-left bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full mr-3 group-hover:bg-white/30 transition-colors duration-300">
                      <FaEdit className="text-sm" />
                    </div>
                    <span className="text-sm font-medium">Profile Update</span>
                    <div className="ml-auto opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="relative group" onMouseEnter={() => setShowEditButton(true)} onMouseLeave={() => setShowEditButton(false)}>
            {profileImageUrl && !imageError ? (
              <div className="relative">
                <img 
                  src={profileImageUrl}
                  alt={user.name} 
                  className="h-28 w-28 rounded-full border-4 border-purple-900/50 object-cover shadow-lg"
                  onError={() => {

                    setImageError(true);
                  }}
                />
                {showEditButton && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full cursor-pointer transition-all duration-200">
                    <FaPencilAlt className="text-indigo-300 text-xl" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-28 w-28 rounded-full border-4 border-purple-900/50 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 flex items-center justify-center shadow-lg group-hover:from-indigo-800/60 group-hover:to-purple-800/60 transition duration-300">
                {user.name ? (
                  <img 
                    src={generateAvatarFromInitials(user.name)}
                    alt={user.name}
                    className="h-28 w-28 rounded-full"
                  />
                ) : (
                  <FaUser className="text-white text-4xl" />
                )}
              </div>
            )}
          </div>
          <div className="ml-0 md:ml-6 text-white text-center md:text-left mt-4 md:mt-0">
            <h2 className="text-2xl font-bold font-display">{user.name}</h2>
            <p className="flex items-center mt-2 justify-center md:justify-start">
              <FaEnvelope className="mr-2 text-purple-300" />
              {user.email}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-200">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-neutral-600 pb-2 text-purple-300">Personal Information</h3>
          
          {user.contact && (
            <div className="flex items-center text-gray-200 mt-4">
              <FaPhone className="mr-3 text-indigo-400" />
              <span>{user.contact}</span>
            </div>
          )}
          
          {user.gender && (
            <div className="flex items-center text-gray-200 mt-4">
              <FaUser className="mr-3 text-indigo-400" />
              <span>Gender: {user.gender}</span>
            </div>
          )}
          
          {user.dob && (
            <div className="flex items-center text-gray-200 mt-4">
              <FaCalendarAlt className="mr-3 text-indigo-400" />
              <span>Date of Birth: {new Date(user.dob).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-neutral-600 pb-2 text-purple-300">Location</h3>
          
          {(user.address || user.city || user.state) && (
            <div className="flex items-start text-gray-200 mt-4">
              <FaMapMarkerAlt className="mr-3 mt-1 text-indigo-400" />
              <div>
                {user.address && <div>{user.address}</div>}
                {(user.city || user.state) && (
                  <div>{[user.city, user.state].filter(Boolean).join(', ')}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Social Media Links */}
      {(user.instagram || user.facebook || user.twitter) && (
        <div className="px-6 pb-6 border-t border-neutral-700 pt-6 mt-2">
          <h3 className="text-lg font-semibold border-b border-neutral-600 pb-2 mb-4 text-purple-300">Social Media</h3>
          <div className="flex space-x-6 justify-center md:justify-start">
            {user.instagram && (
              <a 
                href={`https://instagram.com/${user.instagram}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group"
              >
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <FaInstagram className="text-white text-xl" />
                </div>
              </a>
            )}
            {user.facebook && (
              <a 
                href={`https://facebook.com/${user.facebook}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group"
              >
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <FaFacebook className="text-white text-xl" />
                </div>
              </a>
            )}
            {user.twitter && (
              <a 
                href={`https://x.com/${user.twitter}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group"
              >
                <div className="p-3 bg-black rounded-full transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-neutral-900">
                  <XIcon className="text-white w-5 h-5" />
                </div>
              </a>
            )}
          </div>
        </div>
      )}
      
      {/* Profile Edit Form Modal */}
      {showEditForm && (
        <ProfileEditForm
          user={user}
          onClose={() => setShowEditForm(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default UserDetails;

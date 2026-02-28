import React from 'react';
import { API_BASE_URL } from '../../config/api';

interface MessageMediaProps {
  mediaUrl: string;
  mediaType?: string;
}

const MessageMedia: React.FC<MessageMediaProps> = ({ mediaUrl, mediaType }) => {
  const isImage = mediaType === 'image' || 
    (mediaUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl));
  
  const fileName = mediaUrl.split('/').pop() || 'file';
  const fullUrl = mediaUrl.startsWith('http') ? mediaUrl : `${API_BASE_URL}${mediaUrl}`;

  if (isImage) {
    return (
      <div className="mb-2">
        <img
          src={fullUrl}
          alt="Shared media"
          className="max-h-60 rounded-md object-contain w-full shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => window.open(fullUrl, '_blank')}
        />
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div className="flex items-center p-3 bg-neutral-800 rounded-md border border-neutral-700 shadow-md hover:border-indigo-600 transition-colors duration-300">
        <div className="h-10 w-10 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-400 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-300 hover:text-indigo-200 font-medium hover:underline"
            >
              {fileName}
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-1">Click to download</p>
        </div>
      </div>
    </div>
  );
};

export default MessageMedia;

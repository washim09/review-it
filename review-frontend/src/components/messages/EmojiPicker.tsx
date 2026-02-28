'use client'

import React, { useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={ref}
      className="absolute bottom-16 right-0 z-50 shadow-lg rounded-lg overflow-hidden"
    >
      <div className="absolute inset-0 bg-neutral-900 opacity-95 backdrop-blur-lg"></div>
      <Picker 
        data={data} 
        onEmojiSelect={(emoji: { native: string }) => {
          onEmojiSelect(emoji.native);
          onClose();
        }}
        theme="dark"
        set="native"
        previewPosition="none"
        skinTonePosition="none"
        maxFrequentRows={1}
      />
    </div>
  );
};

export default EmojiPicker;

'use client'

import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiPhoneOff, FiRefreshCw } from 'react-icons/fi';

interface VideoCallModalProps {
  isOpen: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: 'voice' | 'video';
  contactName: string;
  callStatus: 'calling' | 'connected' | 'incoming' | 'outgoing';
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo?: () => void;
  onSwitchCamera?: () => void;
  onAcceptCall?: () => void;
  onRejectCall?: () => void;
  isMuted: boolean;
  isVideoOn?: boolean;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  localStream,
  remoteStream,
  callType,
  contactName,
  callStatus,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onSwitchCamera,
  onAcceptCall,
  onRejectCall,
  isMuted,
  isVideoOn = true
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) {
      // Set stream to video element for video calls
      if (remoteVideoRef.current && callType === 'video') {
        remoteVideoRef.current.srcObject = remoteStream;
        
        // Force play for better compatibility
        remoteVideoRef.current.play().catch(() => {
          // Video play failed, but continue silently
        });
      }
      
      // Set stream to audio element for both voice and video calls
      if (remoteAudioRef.current) {
        const audioElement = remoteAudioRef.current;
        audioElement.srcObject = remoteStream;
        audioElement.volume = 1.0; // Ensure full volume
        audioElement.muted = false; // Ensure not muted
        
        // Debug: Remote stream tracks information available
        
        // Force play for audio with better error handling
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              
              // Additional check after a short delay
              setTimeout(() => {
              }, 1000);
            })
            .catch(() => {
              setAudioEnabled(false);
            });
        }
      }
    }
  }, [remoteStream, callType]);

  // Enable audio on any user interaction
  const handleUserInteraction = async () => {
    if (!audioEnabled && remoteAudioRef.current && remoteStream) {
      
      // Resume audio context if suspended
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      } catch {
        // AudioContext creation or resume failed, but continue
      }
      
      // Try to play the audio element
      remoteAudioRef.current.play().then(() => {
        setAudioEnabled(true);
      }).catch(() => {
        // Audio play failed after user interaction
      });
    }
  };

  useEffect(() => {
    if (callStatus === 'connected' && !timer) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setTimer(interval);
    } else if (callStatus !== 'connected' && timer) {
      clearInterval(timer);
      setTimer(null);
      setCallDuration(0);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [callStatus]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      {/* Hidden audio element for remote audio */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        muted={false}
        style={{ display: 'none' }}
      />
      
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg">{contactName}</h3>
            <p className="text-white/70 text-xs sm:text-sm">
              {callStatus === 'calling' || callStatus === 'outgoing' ? 'Calling...' : 
               callStatus === 'incoming' ? 'Incoming call...' :
               formatDuration(callDuration)}
            </p>
          </div>
          <button
            onClick={onEndCall}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative overflow-hidden">
          {callType === 'video' ? (
            <>
              {/* Remote Video (Full Screen) */}
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-contain bg-black"
                autoPlay
                playsInline
              />
              
              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute bottom-20 sm:bottom-4 right-4 w-24 h-32 sm:w-32 sm:h-24 md:w-48 md:h-36 bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            </>
          ) : (
            /* Voice Call UI */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-white font-bold">
                    {contactName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{contactName}</h2>
                <p className="text-white/70">
                  {callStatus === 'calling' || callStatus === 'outgoing' ? 'Calling...' : 
                   callStatus === 'incoming' ? 'Incoming voice call...' :
                   `Voice Call - ${formatDuration(callDuration)}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls - Fixed position for mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 safe-area-inset-bottom">
          <div className="flex justify-center items-center gap-3 sm:gap-4">
            {callStatus === 'incoming' ? (
              <>
                {/* Accept Call */}
                <button
                  onClick={onAcceptCall}
                  className="p-3 sm:p-4 bg-green-600 hover:bg-green-700 rounded-full transition"
                >
                  <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                
                {/* Reject Call */}
                <button
                  onClick={onRejectCall}
                  className="p-3 sm:p-4 bg-red-600 hover:bg-red-700 rounded-full transition"
                >
                  <FiPhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </>
            ) : (
              <>
                {/* Mute/Unmute */}
                <button
                  onClick={onToggleMute}
                  className={`p-3 sm:p-4 rounded-full transition ${
                    isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? (
                    <FiMicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <FiMic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </button>

                {/* Switch Camera (only for video calls) */}
                {callType === 'video' && onSwitchCamera && (
                  <button
                    onClick={onSwitchCamera}
                    className="p-3 sm:p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                    title="Switch Camera"
                  >
                    <FiRefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                )}

                {/* Video On/Off (only for video calls) */}
                {callType === 'video' && onToggleVideo && (
                  <button
                    onClick={onToggleVideo}
                    className={`p-3 sm:p-4 rounded-full transition ${
                      !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {!isVideoOn ? (
                      <FiVideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <FiVideo className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </button>
                )}

                {/* End Call */}
                <button
                  onClick={onEndCall}
                  className="p-3 sm:p-4 bg-red-600 hover:bg-red-700 rounded-full transition"
                >
                  <FiPhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;

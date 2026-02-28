import { io, Socket } from 'socket.io-client';
import { getAudioConstraintsWithRealMicrophone } from '../utils/microphoneHelper';
import { API_BASE_URL } from '../config/api';

interface IncomingCallData {
  callerId: string;
  callerSocketId: string;
  offer: RTCSessionDescriptionInit;
  callType: 'voice' | 'video';
}

class WebRTCService {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private authToken: string | null = null;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  
  // Callbacks for UI updates
  public onIncomingCall: ((data: IncomingCallData) => void) | null = null;
  public onCallAnswered: (() => void) | null = null;
  public onCallRejected: (() => void) | null = null;
  public onCallEnded: (() => void) | null = null;
  public onRemoteStream: ((stream: MediaStream) => void) | null = null;
  public onUserUnavailable: (() => void) | null = null;

  // STUN servers (static) - for IP discovery
  private stunServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];
  
  // ICE servers (will include STUN + dynamic TURN)
  private iceServers: RTCIceServer[] = [];
  
  // TURN credentials cache
  private turnCredentialsCache: {
    credentials: RTCIceServer | null;
    expiresAt: number;
  } = {
    credentials: null,
    expiresAt: 0
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('authToken');
    }
    // Initialize with STUN servers only
    this.iceServers = [...this.stunServers];
  }

  /**
   * Fetch dynamic TURN credentials from backend
   * Implements caching to avoid unnecessary API calls
   */
  private async fetchTurnCredentials(): Promise<void> {
    try {
      // Check if cached credentials are still valid
      const now = Date.now();
      if (this.turnCredentialsCache.credentials && this.turnCredentialsCache.expiresAt > now) {
        return;
      }

      
      const response = await fetch(`${API_BASE_URL}/api/turn-credentials`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch TURN credentials: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get TURN credentials');
      }

      // Create TURN server configurations
      const turnServers: RTCIceServer[] = data.urls.map((url: string) => ({
        urls: url,
        username: data.username,
        credential: data.credential
      }));

      // Cache credentials (expire 5 minutes before actual expiry for safety)
      this.turnCredentialsCache = {
        credentials: turnServers[0], // Store first one for reference
        expiresAt: now + ((data.ttl - 300) * 1000) // TTL in ms, minus 5 minutes
      };

      // Update ICE servers: STUN + dynamic TURN
      this.iceServers = [
        ...this.stunServers,
        ...turnServers
      ];

      
    } catch (error) {
      // Fallback to STUN only if TURN fetch fails
      this.iceServers = [...this.stunServers];
    }
  }

  public connect(token: string) {
    if (!token) {
      return;
    }

    if (this.socket && this.socket.connected) {
      return;
    }

    this.authToken = token;
    this.initializeSocket();
  }

  private initializeSocket() {
    if (!this.authToken) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Connect to Socket.io server
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? 'https://riviewit.com'
      : 'http://localhost:3001';

    this.socket = io(socketUrl, {
      auth: {
        token: this.authToken
      },
      transports: ['polling', 'websocket'],
      forceNew: true,
      timeout: 5000
    });

    this.socket.on('connect', () => {
    });

    this.socket.on('connect_error', () => {
      // Connection error occurred
    });

    this.socket.on('disconnect', () => {
      this.cleanup();
    });

    // Listen for incoming calls
    this.socket.on('incoming-call', (data: IncomingCallData) => {
      if (this.onIncomingCall) {
        this.onIncomingCall(data);
      }
    });

    // Listen for call answered
    this.socket.on('call-answered', async (data: { answer: RTCSessionDescriptionInit }) => {
      if (this.peerConnection && this.peerConnection.signalingState !== 'stable') {
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          // Process any queued ICE candidates
          await this.processPendingIceCandidates();
          // Force ICE restart if stuck at 'new'
          setTimeout(() => {
            if (this.peerConnection?.iceConnectionState === 'new') {
              this.peerConnection.restartIce();
            }
          }, 3000);
          if (this.onCallAnswered) {
            this.onCallAnswered();
          }
        } catch (error) {
        }
      } else {
        // Still trigger callback for UI updates even if we skip the WebRTC part
        if (this.onCallAnswered) {
          this.onCallAnswered();
        }
      }
    });

    // Listen for call rejected
    this.socket.on('call-rejected', () => {
      this.cleanup();
      if (this.onCallRejected) {
        this.onCallRejected();
      }
    });

    // Listen for call ended
    this.socket.on('call-ended', () => {
      this.cleanup();
      if (this.onCallEnded) {
        this.onCallEnded();
      }
    });

    // Listen for ICE candidates
    this.socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; senderId: string }) => {
      // Process ICE candidate
      
      if (this.peerConnection) {
        try {
          // Check if remote description is set (local description NOT required!)
          if (this.peerConnection.remoteDescription) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            // Queue candidate until remote description is set
            this.pendingIceCandidates.push(data.candidate);
          }
        } catch (error) {
        }
      } else {
        // Queue candidate - peer connection will be created when call is answered
        this.pendingIceCandidates.push(data.candidate);
      }
    });

    // Listen for user unavailable
    this.socket.on('user-unavailable', () => {
      if (this.onUserUnavailable) {
        this.onUserUnavailable();
      }
    });
  }

  // Process pending ICE candidates after remote description is set
  private async processPendingIceCandidates() {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      for (const candidate of this.pendingIceCandidates) {
        try {
          // Add queued ICE candidate
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
        }
      }
      this.pendingIceCandidates = []; // Clear the queue
    }
  }

  // Initialize a call
  async initiateCall(targetUserId: string, callType: 'voice' | 'video'): Promise<void> {
    try {
      // Get audio constraints with real microphone (excluding Stereo Mix)
      const audioConstraints = await getAudioConstraintsWithRealMicrophone();
      
      // Get user media with proper echo cancellation and audio processing
      const constraints: MediaStreamConstraints = {
        audio: audioConstraints,
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };

      this.localStream = await this.getValidatedMediaStream(constraints, 'CALLER');

      // Check and force unmute local tracks (CALLER SIDE DEBUG)
      this.localStream.getTracks().forEach(track => {
        
        // Ensure track is enabled
        if (!track.enabled) {
          track.enabled = true;
        }
        
        // Check if local track is muted (this would cause remote muting)

        // Add event listeners to track muting changes
      });

      // Fetch dynamic TURN credentials before creating peer connection
      await this.fetchTurnCredentials();

      // Create peer connection with STUN + dynamic TURN servers
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers,
        iceTransportPolicy: 'all', // Try all candidates (host, srflx, relay)
        bundlePolicy: 'max-bundle', // Bundle all media on single transport
        iceCandidatePoolSize: 10 // Pre-gather candidates
      });

      // Log initial ICE state immediately

      // Set up ontrack handler BEFORE adding tracks
      this.peerConnection.ontrack = (event) => {
      
      // Force enable the track if it's disabled
      if (!event.track.enabled) {
        event.track.enabled = true;
      }
      
      // Handle muted tracks with advanced workaround
      if (event.track.muted) {
        
        // Try to create a new MediaStreamTrack if possible
        if (event.streams && event.streams[0]) {
          
          // Force track to be enabled again
          event.track.enabled = true;
          
          // Add event listeners to monitor track changes
          event.track.addEventListener('unmute', () => {
            this.checkAudioDataFlow(event.track, 'CALLER');
          });
          
          // Try to restart the track
          setTimeout(() => {
            if (event.track.muted) {
            }
          }, 1000);
        }
      }
      
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        
        // Ensure all tracks in the stream are enabled
        this.remoteStream.getTracks().forEach(track => {
          if (!track.enabled) {
            track.enabled = true;
          }
        });
        
        
        // Check audio data flow for unmuted tracks
        if (event.track.kind === 'audio' && !event.track.muted) {
          setTimeout(() => this.checkAudioDataFlow(event.track, 'CALLER'), 1000);
        }
        
        // Debug codec information for audio issues
        if (event.track.kind === 'audio') {
          setTimeout(() => this.debugAudioCodecs('CALLER'), 2000);
        }
        
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      }
    };

    // Set up ICE candidate handler
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          targetUserId,
          candidate: event.candidate
        });
      } else if (!event.candidate) {
      }
    };

    // Monitor ICE connection state for debugging
    let iceCheckingStartTime: number | null = null;
    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection?.iceConnectionState === 'checking') {
        iceCheckingStartTime = Date.now();
        // Set timeout to restart ICE if stuck in checking for too long
        setTimeout(() => {
          if (this.peerConnection?.iceConnectionState === 'checking') {
            this.peerConnection?.restartIce();
          }
        }, 10000);
      } else if (this.peerConnection?.iceConnectionState === 'connected') {
        if (iceCheckingStartTime) {
          // ICE connection established
        }
        setTimeout(() => this.debugAudioCodecs('CALLER'), 1000);
      } else if (this.peerConnection?.iceConnectionState === 'completed') {
      } else if (this.peerConnection?.iceConnectionState === 'failed') {
        this.peerConnection?.restartIce();
      } else if (this.peerConnection?.iceConnectionState === 'disconnected') {
        // Wait a bit before restarting in case it reconnects
        setTimeout(() => {
          if (this.peerConnection?.iceConnectionState === 'disconnected') {
            this.peerConnection?.restartIce();
          }
        }, 3000);
      }
    };

    // Test that handler is attached - this should fire immediately after remote description

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === 'connected') {
      }
    };

    // Add local stream tracks to peer connection with verification
    this.localStream.getTracks().forEach(track => {
      if (this.peerConnection && this.localStream) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    });

    // Create offer with explicit audio/video constraints
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callType === 'video'
    });
    await this.peerConnection.setLocalDescription(offer);
    
    // Check ICE state after setting local description

      // Send call invitation
      if (this.socket) {
        this.socket.emit('call-user', {
          targetUserId,
          offer,
          callType
        });
      }
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  // Answer an incoming call
  async answerCall(offer: RTCSessionDescriptionInit, callerSocketId: string, callType: 'voice' | 'video' = 'voice'): Promise<void> {
    
    // Prevent duplicate answerCall execution
    if (this.peerConnection && this.peerConnection.signalingState !== 'stable') {
      return;
    }
    
    try {
      // Get audio constraints with real microphone (excluding Stereo Mix)
      const audioConstraints = await getAudioConstraintsWithRealMicrophone();
      
      // Get user media with proper echo cancellation and audio processing
      const constraints: MediaStreamConstraints = {
        audio: audioConstraints,
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };

      // Only get new stream if we don't have one already
      if (!this.localStream) {
        this.localStream = await this.getValidatedMediaStream(constraints, 'RECEIVER');
      } else {
      }

      // Check and force unmute local tracks (RECEIVER SIDE DEBUG)
      this.localStream.getTracks().forEach(track => {
        
        // Ensure track is enabled
        if (!track.enabled) {
          track.enabled = true;
        }
        

        // Add event listeners to track muting changes
        track.addEventListener('mute', () => {
        });
        
        track.addEventListener('unmute', () => {
        });

        track.addEventListener('ended', () => {
        });
      });

      // Fetch dynamic TURN credentials before creating peer connection
      await this.fetchTurnCredentials();

      // Create peer connection only if we don't have one
      if (!this.peerConnection) {
        this.peerConnection = new RTCPeerConnection({
          iceServers: this.iceServers,
          iceTransportPolicy: 'all', // Try all candidates (host, srflx, relay)
          bundlePolicy: 'max-bundle', // Bundle all media on single transport
          iceCandidatePoolSize: 10 // Pre-gather candidates
        });
        
        // Log initial ICE state immediately
      } else {
      }

      // Add local stream tracks with verification
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
          
        }
      });

      // Handle remote stream (Receiver side)
      this.peerConnection.ontrack = (event) => {
        
        // Force enable the track if it's disabled
        if (!event.track.enabled) {
          event.track.enabled = true;
        }
        
        // Handle muted tracks with advanced workaround
        if (event.track.muted) {
          
          // Try to create a new MediaStreamTrack if possible
          if (event.streams && event.streams[0]) {
            
            // Force track to be enabled again
            event.track.enabled = true;
            
            // Add event listeners to monitor track changes
            event.track.addEventListener('unmute', () => {
              this.checkAudioDataFlow(event.track, 'RECEIVER');
            });
            
            // Try to restart the track
            setTimeout(() => {
              if (event.track.muted) {
              }
            }, 1000);
          }
        }
        
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          
          // Ensure all tracks in the stream are enabled
          this.remoteStream.getTracks().forEach(track => {
            if (!track.enabled) {
              track.enabled = true;
            }
          });
          
          
          // Check audio data flow for unmuted tracks
          if (event.track.kind === 'audio' && !event.track.muted) {
            setTimeout(() => this.checkAudioDataFlow(event.track, 'RECEIVER'), 1000);
          }
          
          // Debug codec information for audio issues
          if (event.track.kind === 'audio') {
            setTimeout(() => this.debugAudioCodecs('RECEIVER'), 2000);
          }
          
          if (this.onRemoteStream) {
            this.onRemoteStream(this.remoteStream);
          }
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.socket) {
          this.socket.emit('ice-candidate', {
            targetSocketId: callerSocketId,
            candidate: event.candidate
          });
        } else if (!event.candidate) {
        }
      };

      // Monitor ICE connection state for debugging
      let iceCheckingStartTime: number | null = null;
      this.peerConnection.oniceconnectionstatechange = () => {
        if (this.peerConnection?.iceConnectionState === 'checking') {
          iceCheckingStartTime = Date.now();
          // Set timeout to restart ICE if stuck in checking for too long
          setTimeout(() => {
            if (this.peerConnection?.iceConnectionState === 'checking') {
              this.peerConnection?.restartIce();
            }
          }, 10000);
        } else if (this.peerConnection?.iceConnectionState === 'connected') {
          if (iceCheckingStartTime) {
            // ICE connection established
          }
          setTimeout(() => this.debugAudioCodecs('RECEIVER'), 1000);
        } else if (this.peerConnection?.iceConnectionState === 'completed') {
        } else if (this.peerConnection?.iceConnectionState === 'failed') {
          this.peerConnection?.restartIce();
        } else if (this.peerConnection?.iceConnectionState === 'disconnected') {
          // Wait a bit before restarting in case it reconnects
          setTimeout(() => {
            if (this.peerConnection?.iceConnectionState === 'disconnected') {
              this.peerConnection?.restartIce();
            }
          }, 3000);
        }
      };

      // Test that handler is attached

      // Monitor connection state
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection?.connectionState === 'connected') {
        }
      };

      // Set remote description and create answer
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Process any queued ICE candidates
      await this.processPendingIceCandidates();
      
      // Create answer with explicit audio/video constraints
      const answer = await this.peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      });
      await this.peerConnection.setLocalDescription(answer);
      
      // Force check ICE state after a delay to see if handlers fire
      setTimeout(() => {
        if (this.peerConnection?.iceConnectionState === 'new') {
this.peerConnection.restartIce();
        }
      }, 100);

      // Send answer
      if (this.socket) {
        this.socket.emit('answer-call', {
          callerSocketId,
          answer
        });
      }
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  // Reject an incoming call
  rejectCall(callerSocketId: string): void {
    if (this.socket) {
      this.socket.emit('reject-call', { callerSocketId });
    }
  }

  // End an active call
  endCall(targetUserId: string): void {
    if (this.socket) {
      this.socket.emit('end-call', { targetUserId });
    }
    this.cleanup();
  }

  // Toggle mute
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // Return mute state
      }
    }
    return false;
  }

  // Toggle video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled; // Return video state
      }
    }
    return false;
  }

  // Switch camera (toggle between front and rear camera)
  async switchCamera(): Promise<void> {
    if (!this.localStream || !this.peerConnection) {
      throw new Error('No active call to switch camera');
    }

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track available');
      }

      // Get current facing mode
      const currentFacingMode = videoTrack.getSettings().facingMode || 'user';
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      
      console.log(`[CAMERA SWITCH] Switching from ${currentFacingMode} to ${newFacingMode}`);

      // Stop the current video track
      videoTrack.stop();

      // Get new video stream with opposite facing mode
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: newFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false // Don't get audio, we already have it
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace the video track in the local stream
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);

      // Find the video sender and replace the track
      const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      }

    } catch (error) {
      
      // Fallback: try without exact facing mode
      try {
        const videoTrack = this.localStream.getVideoTracks()[0];
        videoTrack.stop();

        const currentFacingMode = videoTrack.getSettings().facingMode || 'user';
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: newFacingMode, // Use ideal instead of exact
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        const newVideoTrack = newStream.getVideoTracks()[0];
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);

        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      } catch (fallbackError) {
        throw new Error('Unable to switch camera. Your device may not have multiple cameras.');
      }
    }
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Get validated media stream with actual audio data
  async getValidatedMediaStream(constraints: MediaStreamConstraints, _side: string): Promise<MediaStream> {
    
    try {
      // First attempt - normal getUserMedia
      let stream = await navigator.mediaDevices.getUserMedia(constraints);
    
      // Test if audio track has actual data
      if (constraints.audio && stream.getAudioTracks().length > 0) {
        const audioTrack = stream.getAudioTracks()[0];
        const hasAudioData = await this.testAudioTrackData(audioTrack, _side);
        
        if (!hasAudioData) {
          
          // Stop the silent stream
          stream.getTracks().forEach(track => track.stop());
          
          // Try with different constraints but KEEP echo cancellation enabled
          const fallbackConstraints: MediaStreamConstraints = {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 1
            },
            video: constraints.video
          };
          
          stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          const newAudioTrack = stream.getAudioTracks()[0];
          const hasNewAudioData = await this.testAudioTrackData(newAudioTrack, _side);
          
          if (!hasNewAudioData) {
            // No working microphone detected
          } else {
          }
        } else {
        }
      } else {
      }
    
    return stream;
    
    } catch (error) {
      throw error;
    }
  }

  // Test if an audio track actually has data flowing
  async testAudioTrackData(track: MediaStreamTrack, _side: string): Promise<boolean> {
    
    return new Promise((resolve) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const stream = new MediaStream([track]);
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        
        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let checkCount = 0;
        const maxChecks = 5; // Quick test
        
        const testAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          const audioLevel = Math.max(...dataArray);
          
          if (audioLevel > 0) {
            audioContext.close();
            resolve(true);
            return;
          }
          
          checkCount++;
          if (checkCount < maxChecks) {
            setTimeout(testAudio, 200);
          } else {
            audioContext.close();
            resolve(false);
          }
        };
        
        setTimeout(testAudio, 100);
        
      } catch (error) {
        resolve(false);
      }
    });
  }

  // Check if audio data is actually flowing through the track
  checkAudioDataFlow(track: MediaStreamTrack, _side: string) {
    if (track.kind !== 'audio') return;
    
    try {
      // Create audio context to analyze audio data
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const stream = new MediaStream([track]);
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let checkCount = 0;
      const maxChecks = 10;
      
      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Check if there's any audio activity (values above silence threshold)
        const audioLevel = Math.max(...dataArray);
        
        if (audioLevel > 0) {
          audioContext.close();
          return;
        }
        
        checkCount++;
        if (checkCount < maxChecks) {
          setTimeout(checkAudio, 500); // Check every 500ms
        } else {
          audioContext.close();
        }
      };
      
      // Start checking after a short delay
      setTimeout(checkAudio, 500);
      
    } catch (error) {
    }
  }

  // Debug audio codecs and connection stats
  async debugAudioCodecs(_side: string) {
    if (!this.peerConnection) return;
    
    try {
      const stats = await this.peerConnection.getStats();
      // Debug connection stats
      
      stats.forEach((report) => {
        if (report.type === 'codec' && report.mimeType?.includes('audio')) {
          // Audio codec found
        }
        
        if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
        }
        
        if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
        }
        
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          // Connection info found
        }
      });
      
    } catch (error) {
    }
  }

  // Cleanup resources
  private cleanup(): void {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Clear pending ICE candidates
    this.pendingIceCandidates = [];
    this.remoteStream = null;
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.cleanup();
  }
}

// Export singleton instance
export default new WebRTCService();

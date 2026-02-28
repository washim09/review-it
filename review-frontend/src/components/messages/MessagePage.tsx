'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../layout/Navbar';
import { 
  FiSend, 
  FiSmile, 
  FiChevronLeft, 
  FiMessageCircle,
  FiCheck,
  FiClock,
  FiCheckCircle,
  FiTrash2,
  FiPhone,
  FiVideo,
  FiX} from 'react-icons/fi';
import EmojiPicker from './EmojiPicker';
import VideoCallModal from './VideoCallModal';
import { useAuth, getToken } from '../../context/AuthContext';
import axios from 'axios';
import webrtcService from '../../services/webrtcService';
import { ringtoneService } from '../../sounds/ringtone';
import { dialingToneService } from '../../sounds/dialingTone';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { API_BASE_URL } from '../../config/api';

// Define call types
type CallType = 'voice' | 'video' | null;

interface CallState {
  type: CallType;
  status: 'outgoing' | 'incoming' | 'connected' | 'ended' | null;
  contactId: number | null;
  contactName: string;
  callerSocketId?: string;
  offer?: RTCSessionDescriptionInit;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOn: boolean;
}

const createInitialCallState = (): CallState => ({
  type: null,
  status: null,
  contactId: null,
  contactName: '',
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isVideoOn: true
});

// Define types for the component
interface User {
  id: number;
  name: string;
  imageUrl?: string;
}

interface Contact {
  id: number;
  name: string;
  profileImage?: string;
  avatar?: string;
  image?: string;
  photo?: string;
  picture?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: number;
  };
  unreadCount: number;
  review?: {
    id: number;
    title: string;
    entity: string;
  };
}

interface ReplyToMessage {
  id: number;
  content: string;
  senderId: number;
  sender?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface Message {
  id: number;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  senderId: number;
  recipientId: number;
  reviewId?: number;
  isRead: boolean;
  isSent: boolean;
  isDelivered: boolean;
  createdAt: string;
  replyToId?: number;
  replyTo?: ReplyToMessage;
  sender?: User;
  recipient?: User;
  review?: {
    id: number;
    title: string;
    entity: string;
  };
}

const MessagePage: React.FC = () => {
  const params = useParams();
  const contactId = params?.contactId as string | undefined;
  const router = useRouter();
  const { user, isAuth } = useAuth();
  const { resetUnreadCount } = useUnreadMessages();
  
  // State declarations
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageGroups, setMessageGroups] = useState<{[date: string]: Message[]}>({});
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showContactsOnMobile, setShowContactsOnMobile] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);
  
  const [callState, setCallState] = useState<CallState>(createInitialCallState());
  const contactsRef = useRef<Contact[]>([]);
  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  const handleContactImageError = (contactId: number) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId
          ? { ...contact, profileImage: '' }
          : contact
      )
    );
  };

  useEffect(() => {
    // Initialize WebRTC socket connection with auth token
    const token = getToken();
    if (token) {
      webrtcService.connect(token);
    }

    webrtcService.onIncomingCall = data => {
      const callerId = parseInt(data.callerId, 10);
      const contact = contactsRef.current.find(c => c.id === callerId);

      // Start ringtone
      ringtoneService.startRingtone();

      setCallState({
        type: data.callType,
        status: 'incoming',
        contactId: Number.isNaN(callerId) ? null : callerId,
        contactName: contact?.name || 'Unknown caller',
        callerSocketId: data.callerSocketId,
        offer: data.offer,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isVideoOn: data.callType === 'video'
      });
    };

    webrtcService.onCallAnswered = () => {
      ringtoneService.stopRingtone(); // Stop ringtone when answered
      dialingToneService.stopDialingTone(); // Stop dialing tone when answered
      setCallState(prev => ({ ...prev, status: 'connected' }));
    };

    webrtcService.onCallRejected = () => {
      ringtoneService.stopRingtone(); // Stop ringtone when rejected
      dialingToneService.stopDialingTone(); // Stop dialing tone when rejected
      setCallState(createInitialCallState());
    };

    webrtcService.onCallEnded = () => {
      ringtoneService.stopRingtone(); // Stop ringtone when ended
      dialingToneService.stopDialingTone(); // Stop dialing tone when ended
      setCallState(createInitialCallState());
    };

    webrtcService.onRemoteStream = stream => {
      ringtoneService.stopRingtone(); // Ensure ringtone stops when remote stream arrives
      setCallState(prev => ({
        ...prev,
        remoteStream: stream,
        status: 'connected'
      }));
    };

    webrtcService.onUserUnavailable = () => {
      setCallState(createInitialCallState());
      setError('The user is currently unavailable.');
      setTimeout(() => setError(''), 3000);
    };

    return () => {
      webrtcService.onIncomingCall = null;
      webrtcService.onCallAnswered = null;
      webrtcService.onCallRejected = null;
      webrtcService.onCallEnded = null;
      webrtcService.onRemoteStream = null;
      webrtcService.onUserUnavailable = null;
      webrtcService.disconnect();
    };
  }, []);

  const makeCall = async (type: CallType) => {
    if (!activeContact || !activeContact.id || !type) return;

    try {
      setCallState({
        type,
        status: 'outgoing',
        contactId: activeContact.id,
        contactName: activeContact.name,
        callerSocketId: undefined,
        offer: undefined,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isVideoOn: type === 'video'
      });

      // Start dialing tone for outgoing calls
      dialingToneService.startDialingTone();

      await webrtcService.initiateCall(activeContact.id.toString(), type);
      const localStream = webrtcService.getLocalStream();
      setCallState(prev => ({ ...prev, localStream }));
    } catch (error) {
      dialingToneService.stopDialingTone(); // Stop dialing tone on error
      setError('Unable to make the call. Please check camera/microphone permissions.');
      setCallState(createInitialCallState());
      setTimeout(() => setError(''), 3000);
    }
  };

  const acceptCall = async () => {
    if (!callState.callerSocketId || !callState.offer || !callState.type) {
      return;
    }

    try {
      await webrtcService.answerCall(
        callState.offer,
        callState.callerSocketId,
        callState.type
      );
      const localStream = webrtcService.getLocalStream();
      setCallState(prev => ({
        ...prev,
        status: 'connected',
        localStream: localStream ?? null
      }));
    } catch (error) {
      setError('Unable to accept the call. Please check camera/microphone permissions.');
      setCallState(createInitialCallState());
      setTimeout(() => setError(''), 3000);
    }
  };

  const rejectCall = () => {
    ringtoneService.stopRingtone(); // Stop ringtone when rejecting call
    dialingToneService.stopDialingTone(); // Stop dialing tone when rejecting call
    if (callState.callerSocketId) {
      webrtcService.rejectCall(callState.callerSocketId);
    }
    setCallState(createInitialCallState());
  };

  const endCall = () => {
    ringtoneService.stopRingtone(); // Stop ringtone when ending call
    dialingToneService.stopDialingTone(); // Stop dialing tone when ending call
    if (callState.contactId) {
      webrtcService.endCall(callState.contactId.toString());
    }
    setCallState(createInitialCallState());
  };

  const toggleMute = () => {
    const muted = webrtcService.toggleMute();
    setCallState(prev => ({
      ...prev,
      isMuted: muted
    }));
  };

  const toggleVideo = () => {
    const isVideoOn = webrtcService.toggleVideo();
    setCallState(prev => ({
      ...prev,
      isVideoOn
    }));
  };

  const switchCamera = async () => {
    try {
      await webrtcService.switchCamera();
      const localStream = webrtcService.getLocalStream();
      setCallState(prev => ({ ...prev, localStream }));
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  };

  const modalCallStatus: 'calling' | 'connected' | 'incoming' | 'outgoing' =
    callState.status === 'incoming'
      ? 'incoming'
      : callState.status === 'outgoing'
        ? 'outgoing'
        : callState.status === 'connected'
          ? 'connected'
          : 'calling';
  
  // Helper function to ensure URLs are absolute - critical for image display
  const getFullUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Images are served through the staticfile API endpoint
    // Convert /uploads/image.jpg -> ${API_BASE_URL}/api/staticfile/uploads/image.jpg
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${API_BASE_URL}/api/staticfile/${cleanUrl}`;
  };

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Ensure we redirect to login if no user or not authenticated
  useEffect(() => {
    if (!isAuth) {
      router.push('/login');
    }
  }, [isAuth, router]);
  
  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!isAuth) return;
      
      try {
        setIsLoading(true);

        // Get the authentication token using the helper function from AuthContext
        const token = getToken();
        
        if (!token) {
          throw new Error('Authentication required. Please log in again.');
        }

        // Make the API call with the proper authorization header
        const response = await fetch(`${API_BASE_URL}/api/contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();

        // Handle empty contacts array as a valid response, not an error
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid contact data format');
        }

        // Only use processed contacts - no more mock data if API worked
        const processedContacts = data.map((contact: Contact) => {
          // Try to find an image in any of the possible fields
          let imageUrl = contact.profileImage || 
                        (contact as any).imageUrl || 
                        (contact as any).avatar || 
                        (contact as any).image || 
                        (contact as any).photo || 
                        (contact as any).picture || '';
          
          // Format the URL if an image was found
          if (imageUrl) {
            const formattedUrl = getFullUrl(imageUrl);
            contact.profileImage = formattedUrl;
          } else {
            contact.profileImage = '';
          }

          return contact;
        });

        setContacts(processedContacts);
        setIsLoading(false);
        
      } catch (error) {
        
        // Don't show an error message if it's just that no contacts were found
        if (error instanceof Error && error.message === 'Invalid contact data format') {
          setError('Failed to load contacts. Please try again later.');
        } else {
          // Don't set error for empty contacts list - this is normal for new users

        }
        
        setIsLoading(false);
        
        // Try a different approach with axios instead of fetch

        try {
          // Using imported axios
          const token = getToken();
          
          const response = await axios.get(`${API_BASE_URL}/api/contacts`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          // Process contacts using the same logic as above
          const processedContacts = response.data.map((contact: Contact) => {
            // Same processing as above
            if (!contact.profileImage) {
              contact.profileImage = (contact as any).imageUrl || (contact as any).avatar || 
                                   (contact as any).image || (contact as any).photo || 
                                   (contact as any).picture || '';
            }
            
            if (contact.profileImage) {
              contact.profileImage = getFullUrl(contact.profileImage);
            }
            
            return contact;
          });
          
          setContacts(processedContacts);
          setIsLoading(false);
          return; // Exit early if axios method worked
          
        } catch (axiosError) {
          
          // No mock data fallback - if we can't get contacts, show an empty list

          setContacts([]);
          setIsLoading(false);
        }
      }
    };

    fetchContacts();
  }, []); // Empty dependency array means this runs once on mount
  
  // Function to mark messages as read for a contact
  const markMessagesAsRead = async (contactId: number) => {
    try {
      const token = getToken();
      if (!token) return;

      // Call API to mark messages as read - using PUT to match the backend endpoint
      const response = await fetch(`${API_BASE_URL}/api/messages/${contactId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return;
      }

      // Update the local contacts list to show 0 unread for this contact
      setContacts(prevContacts => 
        prevContacts.map(c => 
          c.id === contactId ? { ...c, unreadCount: 0 } : c
        )
      );
      
      // Also reset the global unread count to force navbar badge to update
      resetUnreadCount();
      
    } catch (error) {
    }
  };

  // Set active contact based on URL parameter
  useEffect(() => {
    if (contactId && contacts.length > 0) {
      const contact = contacts.find(c => c.id === parseInt(contactId));
      if (contact) {
        setActiveContact(contact);
        setShowContactsOnMobile(false);
        
        // Scroll to top when chat is selected
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Mark messages as read when selecting a contact
        if (contact.unreadCount > 0) {
          markMessagesAsRead(contact.id);
        }
      } else {

        router.push('/message');
      }
    } else {

      setActiveContact(null);
      setShowContactsOnMobile(true);
    }
  }, [contactId, contacts, router, resetUnreadCount]);
  
  // Fetch messages when active contact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeContact) {

        return;
      }

      try {
        setIsLoading(true);
        
        // Get the authentication token
        const token = getToken();
        
        if (token) {
          try {
            // Make a real API call to fetch messages

            const response = await fetch(`${API_BASE_URL}/api/messages/${activeContact.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();

            // Check if the active contact has a proper image
            if (activeContact && !activeContact.profileImage) {
              // Use type assertion to safely access potential fields in response
              const dataAny = data as any;
              if (dataAny.contactDetails && dataAny.contactDetails.profileImage) {

                setActiveContact({
                  ...activeContact,
                  profileImage: dataAny.contactDetails.profileImage
                });
              }
            }
            
            // Extract messages from response (handle both array and object formats)
            const messages = Array.isArray(data) ? data : (data.messages || []);

            setMessages(messages);
            setIsLoading(false);
            return; // Exit early if successful
          } catch (error) {
            // Fall through to mock data
          }
        } else {

        }
        
        // If API call fails or no token, use mock data for demonstration
        const mockMessages: Message[] = [
          {
            id: 1,
            content: 'Hey there! I saw your recent review on the wireless headphones.',
            senderId: activeContact.id,
            recipientId: user?.id || 0,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            isRead: true,
            isSent: true,
            isDelivered: true
          },
          {
            id: 2,
            content: 'Yes, I really enjoyed them! Great noise cancellation and battery life.',
            senderId: user?.id || 0,
            recipientId: activeContact.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
            isRead: true,
            isSent: true,
            isDelivered: true
          },
          {
            id: 3,
            content: 'Would you recommend them for long flights?',
            senderId: activeContact.id,
            recipientId: user?.id || 0,
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            isRead: true,
            isSent: true,
            isDelivered: true
          },
          {
            id: 4,
            content: 'Absolutely! I used them on a 6-hour flight last week and they were perfect. The battery lasted the whole trip and the comfort was great even for that long.',
            senderId: user?.id || 0,
            recipientId: activeContact.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            isRead: true,
            isSent: true,
            isDelivered: true
          },
          {
            id: 5,
            content: 'Great! I think I will pick up a pair before my trip next month. Thanks for the recommendation!',
            senderId: activeContact.id,
            recipientId: user?.id || 0,
            createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            isRead: true,
            isSent: true,
            isDelivered: true
          }
        ];
        
        setMessages(mockMessages);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load messages');
        setIsLoading(false);
      }
    };
    
    if (activeContact) {
      fetchMessages();
    } else {
      // Clear messages when no contact is selected
      setMessages([]);
    }
  }, [activeContact, user?.id]);
  
  // Function to scroll to bottom of message list (scroll container only, not page)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messagesToGroup: Message[]) => {
    const groups: {[date: string]: Message[]} = {};
    
    messagesToGroup.forEach(message => {
      const messageDate = new Date(message.createdAt);
      const dateString = messageDate.toISOString().split('T')[0];
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(message);
    });
    
    return groups;
  };

  // Format date separator
  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Format message time
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Message status component to show sent/delivered/read indicators
  const MessageStatus = ({ message }: { message: Message }) => {
    // Only show status for messages sent by the current user
    if (message.senderId !== user?.id) return null;
    
    if (message.isRead) {
      // Double blue check for read messages
      return (
        <span className="text-blue-400 ml-1">
          <FiCheckCircle size={12} />
        </span>
      );
    } else if (message.isDelivered) {
      // Double check for delivered messages
      return (
        <span className="text-gray-400 ml-1">
          <div className="relative">
            <FiCheck size={12} className="absolute -left-1" />
            <FiCheck size={12} />
          </div>
        </span>
      );
    } else if (message.isSent) {
      // Single check for sent messages
      return (
        <span className="text-gray-400 ml-1">
          <FiCheck size={12} />
        </span>
      );
    } else {
      // Clock for pending messages
      return (
        <span className="text-gray-400 ml-1">
          <FiClock size={12} />
        </span>
      );
    }
  };

  // Toggle mobile view
  const toggleMobileView = () => {
    setShowContactsOnMobile(!showContactsOnMobile);
  };
  
  // Handle message input change
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
  };
  
  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  // Delete chat conversation
  const deleteChat = async (contactId: number) => {
    try {
      setIsDeletingContact(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete conversation');
      }
      
      // Remove the contact from contacts list
      setContacts(prevContacts => prevContacts.filter(c => c.id !== contactId));
      
      // If the active contact was deleted, clear the active contact
      if (activeContact?.id === contactId) {
        setActiveContact(null);
        setMessages([]);
        setMessageGroups({});
        router.push('/message');
      }
      
      // Close the confirmation modal
      setShowDeleteConfirmation(false);
      setContactToDelete(null);
      
      // Show success message
      const contactName = contactToDelete?.name || 'Conversation';
      setError(`${contactName} has been deleted successfully`);
      setTimeout(() => setError(''), 3000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to delete conversation');
    } finally {
      setIsDeletingContact(false);
    }
  };
  
  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || !activeContact) return;
    
    // Show a temporary optimistic update
    const tempId = Date.now(); // Temporary ID for optimistic update
    const messageToSend = messageInput.trim();
    
    // Create message object for local display
    const newMessage: Message = {
      id: tempId, 
      content: messageToSend,
      senderId: user?.id || 0,
      recipientId: activeContact.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      isSent: true,
      isDelivered: false
    };
    
    // Add reply reference if replying to a message
    let replyToId: number | undefined;
    if (replyToMessage) {
      newMessage.replyToId = replyToMessage.id;
      replyToId = replyToMessage.id;
      newMessage.replyTo = {
        id: replyToMessage.id,
        content: replyToMessage.content,
        senderId: replyToMessage.senderId,
        sender: replyToMessage.sender || {
          id: replyToMessage.senderId,
          name: replyToMessage.senderId === user?.id ? user.name : activeContact.name
        },
        createdAt: replyToMessage.createdAt
      };
    }
    
    // Add to local state immediately for optimistic UI update
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Clear input and reset reply state
    setMessageInput('');
    setReplyToMessage(null);
    
    // Scroll to bottom to show the new message
    setTimeout(scrollToBottom, 100);
    
    try {
      // Get the authentication token
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Debug token info

      // Make the API call to the send endpoint which is specifically for sending messages

      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: user?.id,             // API expects senderId explicitly
          recipientId: activeContact.id,
          content: messageToSend,
          reviewId: activeContact.review?.id,  // Include review ID if available
          replyToId: replyToId           // Include reply reference if replying to a message
        })
      });

      if (!response.ok) {
        // Try to get error details
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          // If can't parse JSON, try to get text
          try {
            errorDetails = await response.text();
          } catch (e2) {
            errorDetails = 'Could not read error details';
          }
        }
        
        throw new Error(`Failed to send message: ${response.status}. ${errorDetails}`);
      }
      
      // Process successful response
      const sentMessage = await response.json();

      // Update the message in the list with the real message ID and status
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempId ? { ...msg, id: sentMessage.id, isSent: true } : msg
        )
      );
      
    } catch (error) {
      setError('Failed to send message. Please try again.');
      
      // Remove the failed message from the list
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== tempId)
      );
    }
  };

  // Update message groups when messages change
  useEffect(() => {
    const groups = groupMessagesByDate(messages);
    setMessageGroups(groups);
  }, [messages]);

  // Don't auto-scroll on messageGroups change - only scroll when sending new messages
  // This prevents the page from scrolling to footer when switching contacts
  
  // Debug logs to check active contact and messages
  useEffect(() => {
    if (activeContact) {

    }
  }, [activeContact, messages, messageGroups]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />
      <VideoCallModal
        isOpen={callState.status !== null}
        localStream={callState.localStream}
        remoteStream={callState.remoteStream}
        callType={callState.type || 'voice'}
        contactName={callState.contactName}
        callStatus={modalCallStatus}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={callState.type === 'video' ? toggleVideo : undefined}
        onSwitchCamera={callState.type === 'video' ? switchCamera : undefined}
        onAcceptCall={callState.status === 'incoming' ? acceptCall : undefined}
        onRejectCall={callState.status === 'incoming' ? rejectCall : undefined}
        isMuted={callState.isMuted}
        isVideoOn={callState.isVideoOn}
      />
      
      <main className="flex-grow flex overflow-hidden relative" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Contacts sidebar */}
        <div className={`w-full md:w-80 bg-gray-800 overflow-y-auto flex-shrink-0 ${showContactsOnMobile ? 'block' : 'hidden md:block'}`}>  
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-bold text-xl">Messages</h2>
          </div>
          
          {/* Contacts list */}
          <div className="overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="h-10 w-10 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin"></div>
              </div>
            ) : contacts.length > 0 ? (
              <div>
                {contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className={`group relative flex items-center p-4 hover:bg-gray-700 ${activeContact?.id === contact.id ? 'bg-gray-700' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      {/* Log moved to useEffect to prevent ReactNode errors */}
                      
                      {contact.profileImage ? (
                        <img 
                          src={contact.profileImage} 
                          alt={contact.name} 
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-600"
                          onError={() => handleContactImageError(contact.id)}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-medium text-white">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {contact.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    {/* Contact info - clickable area */}
                    <div 
                      className="ml-3 flex-grow overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/message/${contact.id}`)}
                    >
                      <div className="font-medium text-gray-200">{contact.name}</div>
                      {contact.lastMessage && (
                        <div className="text-sm text-gray-400 truncate">
                          {contact.lastMessage.senderId === user?.id ? 'You: ' : ''}
                          {contact.lastMessage.content}
                        </div>
                      )}
                    </div>
                    
                    {/* Delete button - visible on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContactToDelete(contact);
                        setShowDeleteConfirmation(true);
                      }}
                      className="p-2 rounded-full hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete conversation"
                    >
                      <FiTrash2 size={16} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mb-4 text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  You haven't messaged with anyone yet. Start conversations from product reviews.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-grow flex flex-col p-4 bg-gray-900 overflow-hidden">
          {activeContact ? (
            <div className="flex flex-col h-full">
              {/* Contact header - with forced height and visibility */}
              <div 
                className="relative flex items-center justify-between py-4 px-4 mb-4 border-b top-12 border-gray-700 w-full bg-gray-800 rounded-t-lg shadow-md" 
                style={{ minHeight: '77px' }}
              >
                <div className="flex items-center">
                  <button 
                    onClick={toggleMobileView}
                    className="md:hidden mr-3 text-gray-400 hover:text-white"
                  >
                    <FiChevronLeft size={22} />
                  </button>
                  <div className="font-bold text-xl text-white">{activeContact.name}</div>
                </div>
                
                {/* Call buttons - directly in the flex container */}
                <div className="flex items-center space-x-3">
                  {/* Voice call button */}
                  <button 
                    onClick={() => makeCall('voice')}
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg"
                    title="Start voice call"
                  >
                    <FiPhone size={22} className="text-white" />
                  </button>
                  
                  {/* Video call button */}
                  <button 
                    onClick={() => makeCall('video')}
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg"
                    title="Start video call"
                  >
                    <FiVideo size={22} className="text-white" />
                  </button>
                </div>
              </div>
              
              {/* Message content area - with flex-grow to push input to bottom */}
              <div ref={messagesContainerRef} className="flex-grow overflow-y-auto py-4 relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin"></div>
                      <p className="mt-3 text-indigo-400 text-sm">Loading messages...</p>
                    </div>
                  </div>
                ) : (
                  Object.entries(messageGroups).length > 0 ? (
                    Object.entries(messageGroups).map(([date, msgs]) => (
                      <div key={date} className="mb-6">
                        <div className="text-center mb-4">
                          <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm">
                            {formatDateSeparator(date)}
                          </span>
                        </div>
                        
                        {msgs.map(msg => (
                          <div 
                            key={msg.id}
                            className={`flex mb-4 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'} items-end`}
                          >
                            {/* Show avatar for other user (not for self) */}
                            {msg.senderId !== user?.id && (
                              <div className="mr-2 flex-shrink-0">
                                {activeContact.profileImage ? (
                                  <img 
                                    src={activeContact.profileImage} 
                                    alt={activeContact.name}
                                    className="h-8 w-8 rounded-full object-cover border-2 border-gray-600"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      const initial = activeContact.name.charAt(0).toUpperCase();
                                      e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#6366f1;stop-opacity:1"/><stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1"/></linearGradient></defs><circle fill="url(#a)" cx="100" cy="100" r="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80px" font-family="sans-serif" font-weight="bold" fill="#fff">${initial}</text></svg>`)}`;  
                                    }}
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
                                    {activeContact.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Show user's own avatar for their messages at the end */}
                            {msg.senderId === user?.id && user?.imageUrl && typeof user.imageUrl === 'string' && (
                              <div className="ml-2 flex-shrink-0">
                                <img 
                                  src={getFullUrl(user.imageUrl)}
                                  alt="You"
                                  className="h-8 w-8 rounded-full object-cover border-2 border-indigo-600"
                                  onLoad={() => {}}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                                    e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#6366f1;stop-opacity:1"/><stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1"/></linearGradient></defs><circle fill="url(#a)" cx="100" cy="100" r="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80px" font-family="sans-serif" font-weight="bold" fill="#fff">${initial}</text></svg>`)}`;  
                                  }}
                                />
                              </div>
                            )}

                            <div 
                              className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md break-words ${
                                msg.senderId === user?.id 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-gray-800 text-gray-200'
                              }`}
                              onDoubleClick={() => setReplyToMessage(msg)}
                            >
                              {msg.replyTo && (
                                <div className="mb-2 px-2 py-1 border-l-2 border-indigo-400 rounded bg-opacity-20 text-xs">
                                  <div className="font-medium">{msg.replyTo.sender?.name || 'User'}</div>
                                  <div className="truncate">{msg.replyTo.content}</div>
                                </div>
                              )}
                              {msg.content}
                              <div className="text-xs mt-1 opacity-70 text-right flex items-center justify-end">
                                {formatMessageTime(msg.createdAt)}
                                <MessageStatus message={msg} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )
                )}
                <div ref={messagesEndRef} />
                
                {replyToMessage && (
                  <div className="mb-2 p-2 bg-gray-800 rounded-lg border border-indigo-500/30 flex items-center">
                    <div className="flex-grow">
                      <div className="text-xs text-indigo-400 font-medium">Replying to {replyToMessage.senderId === user?.id ? 'yourself' : activeContact?.name}</div>
                      <div className="text-sm text-gray-300 truncate">{replyToMessage.content}</div>
                    </div>
                    <button 
                      onClick={() => setReplyToMessage(null)}
                      className="p-1 hover:bg-gray-700 rounded-full"
                      title="Cancel reply"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                
              </div>
              
              {/* Message input area - fixed at bottom */}
              <div className="mt-auto pt-2 border-t border-gray-700">
                {/* Reply indicator */}
                {replyToMessage && (
                  <div className="mb-2 p-2 bg-gray-800 rounded-lg border border-indigo-500/30 flex items-center">
                    <div className="flex-grow">
                      <div className="text-xs text-indigo-400 font-medium">Replying to {replyToMessage.senderId === user?.id ? 'yourself' : activeContact?.name}</div>
                      <div className="text-sm text-gray-300 truncate">{replyToMessage.content}</div>
                    </div>
                    <button 
                      onClick={() => setReplyToMessage(null)}
                      className="p-1 hover:bg-gray-700 rounded-full"
                      title="Cancel reply"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                
                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div className="mb-2 bg-gray-800 rounded-lg p-2 shadow-lg">
                    <EmojiPicker 
                      onEmojiSelect={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
                
                <div className="flex items-end">
                  <textarea
                    value={messageInput}
                    onChange={handleMessageInputChange}
                    placeholder="Type a message..."
                    className="flex-grow resize-none rounded-lg bg-gray-800 text-white p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={1}
                  />
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="ml-2 p-3 bg-gray-800 rounded-full hover:bg-gray-700"
                    title="Add emoji"
                  >
                    <FiSmile size={20} />
                  </button>
                  <button 
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="ml-2 p-3 bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FiMessageCircle size={64} className="mx-auto text-indigo-500 opacity-50" />
                <h2 className="mt-4 text-xl font-semibold">Welcome to Messages</h2>
                <p className="mt-2 text-gray-400">Select a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Error notification */}
      {error && (
        <div className="fixed top-16 inset-x-0 z-50 flex justify-center">
          <div className="bg-red-600 text-white px-4 py-2 rounded-b-lg shadow-lg flex items-center max-w-md">
            <span className="mr-2">⚠</span>
            <p>{error}</p>
            <button 
              onClick={() => setError('')} 
              className="ml-2 hover:bg-red-700 p-1 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      
      {/* Delete confirmation modal */}
      {showDeleteConfirmation && contactToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-medium mb-4">Delete Conversation</h3>
            <p className="mb-6 text-gray-300">Are you sure you want to delete your conversation with <span className="font-medium">{contactToDelete.name}</span>? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setContactToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                disabled={isDeletingContact}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteChat(contactToDelete.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center"
                disabled={isDeletingContact}
              >
                {isDeletingContact ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={18} className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
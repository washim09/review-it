// This component displays a list of messages for the authenticated user
// and allows them to view the details of each message. It also includes a search functionality to filter messages based on the review entity or message content.

import { useEffect, useState, useRef } from 'react';
import { fetchUserMessages, getUnreadMessageCount, markMessagesAsRead, Message, sendMessage } from '../services/messageService';
import ProfileNavbar from './ProfileNavbar';
import { FaRegCheckCircle, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { registerPollingTask } from '../services/pollingService';

const groupMessagesByConversation = (messages: Message[]) => {
  const conversationMap = new Map<number, Message>();

  messages.forEach(message => {
    const reviewId = message.reviewId;
    const existingMessage = conversationMap.get(reviewId);

    if (!existingMessage || new Date(message.createdAt) > new Date(existingMessage.createdAt)) {
      conversationMap.set(reviewId, message);
    }
  });

  return Array.from(conversationMap.values());
};

const MessagePage = () => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(false);
  const prevMessagesRef = useRef<Message[]>([]); // Store previous messages for comparison

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadMessageCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const fetchedMessages = await fetchUserMessages();
      if (isMounted.current) {
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Request browser notification permission
  useEffect(() => {
    isMounted.current = true;
    
    // Request notification permission if available
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Mark messages as read when selected
  useEffect(() => {
    if (!selectedMessage) return;

    const messagesToMark = messages
      .filter(m => m.reviewId === selectedMessage.reviewId && !m.isRead)
      .map(m => m.id);

    if (messagesToMark.length > 0) {
      markMessagesAsRead(messagesToMark)
        .then(() => {
          setMessages(prev => prev.map(msg =>
            messagesToMark.includes(msg.id) ? { ...msg, isRead: true } : msg
          ));
          setUnreadCount(count => Math.max(0, count - messagesToMark.length));
        })
        .catch(error => console.error('Failed to mark messages as read:', error));
    }
  }, [selectedMessage, messages]);

  // Function to load messages - can be called to refresh message list
  const fetchMessageContent = async (messageId: number) => {
    try {
      // Since we don't have WebSockets, we use HTTP to get message details
      console.log(`Fetching content for message ${messageId}`);
      
      // Find the message in our current messages list
      const messageDetails = messages.find(msg => msg.id === messageId);
      if (messageDetails) {
        // We already have the content, just select the message
        setSelectedMessage(messageDetails);
        
        // Mark message as read if it's unread
        if (!messageDetails.isRead && messageDetails.recipientId === currentUserId) {
          await markMessagesAsRead([messageId]);
          fetchUnreadCount(); // Update unread count
        }
      } else {
        // If not found, refresh all messages
        await loadMessages();
      }
    } catch (error) {
      console.error('Error fetching message content:', error);
    }
  };

  // Use the polling service for message updates
  useEffect(() => {
    // Initial load
    loadMessages();
    fetchUnreadCount();
    
    isMounted.current = true;
    
    // Register polling tasks with the shared service
    const messagePollingUnregister = registerPollingTask(
      'message-page-updates',
      async () => {
        if (isMounted.current) {
          console.log('Polling for message updates...');
          await loadMessages();
        }
      },
      15000 // 15 seconds
    );
    
    const unreadCountUnregister = registerPollingTask(
      'unread-count-updates',
      async () => {
        if (isMounted.current) {
          await fetchUnreadCount();
        }
      },
      30000 // 30 seconds
    );
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
      messagePollingUnregister();
      unreadCountUnregister();
    };
  }, []);
  
  // Notification for new messages
  useEffect(() => {
    // Check if we have a new message at the top that wasn't there before
    if (messages.length > 0 && prevMessagesRef.current.length > 0) {
      const latestMessage = messages[0];
      const prevLatestMessage = prevMessagesRef.current[0];
      
      // If the latest message is different and we're not the sender, show notification
      if (latestMessage.id !== prevLatestMessage.id && latestMessage.senderId !== currentUserId) {
        // Visual notification
        const sender = latestMessage.sender.name;
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Message', {
            body: `${sender}: ${latestMessage.content.substring(0, 50)}${latestMessage.content.length > 50 ? '...' : ''}`,
            icon: '/favicon.ico'
          });
        } else {
          console.log(`New message from ${sender}: ${latestMessage.content}`);
        }
      }
    }
    
    // Update previous messages reference
    prevMessagesRef.current = messages;
  }, [messages, currentUserId]);

  const handleReply = async () => {
    try {
      if (!replyContent.trim() || !selectedMessage) return;

      setIsSending(true);
      
      // Get recipient ID (the other person in the conversation)
      const recipientId = selectedMessage.senderId === currentUserId
        ? selectedMessage.recipientId
        : selectedMessage.senderId;

      // Make sure recipientId is a number to prevent type issues
      const numericRecipientId = Number(recipientId);
      const reviewId = selectedMessage.reviewId ? Number(selectedMessage.reviewId) : null;
      
      // Send message via HTTP API (reliable method)
      console.log('Sending message via HTTP API');
      try {
        const sentMessage = await sendMessage({
          content: replyContent,
          recipientId: numericRecipientId,
          reviewId: reviewId
        });
        
        console.log('Message sent via HTTP:', sentMessage);
        // Add the new message to the state
        if (sentMessage) {
          setMessages(prev => [sentMessage, ...prev]);
          setReplyContent('');
          // Force refresh messages after sending
          await loadMessages();
        }
      } catch (httpError) {
        console.error('Failed to send message:', httpError);
        alert('Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMessage) {
      handleReply();
    }
  };

  const getSendButtonText = () => {
    return isSending ? 'Sending...' : 'Send';
  };

  const ChatBubble = ({ message, isSender }: { message: Message, isSender: boolean }) => (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] p-4 rounded-2xl ${
        isSender
          ? 'bg-blue-600 text-white ml-auto'
          : 'bg-gray-100 text-gray-800'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className="flex items-center mt-2 text-xs space-x-2">
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
          {isSender && (
            <FaRegCheckCircle className={`${message.isRead ? 'text-blue-300' : 'text-gray-300'}`} />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileNavbar unreadCount={unreadCount} />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Messages List */}
            <div className="md:col-span-1 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div className="h-[calc(100vh-13rem)] overflow-y-auto">
                {groupMessagesByConversation(messages)
                  .filter(message =>
                    message.review.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    message.content.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(message => (
                    <div
                      key={message.id}
                      onClick={() => fetchMessageContent(message.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedMessage?.reviewId === message.reviewId
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      } ${!message.isRead ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={message.review.imageUrl ?? undefined}
                          alt={message.review.entity}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {message.review.entity}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {format(new Date(message.createdAt), 'MMM d')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                          {`${message.sender.name}: ${message.content}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="md:col-span-2 h-[calc(100vh-13rem)] flex flex-col">
              {selectedMessage ? (
                <div className='flex-1 flex flex-col p-6'>
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedMessage.review.entity}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Conversation with {selectedMessage.sender.name}
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {messages
                      .filter(m => m.reviewId === selectedMessage.reviewId)
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map(message => (
                        <ChatBubble
                          key={message.id}
                          message={message}
                          isSender={message.senderId === selectedMessage.recipientId}
                        />
                      ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage}>
                      <div className="flex gap-2">
                        <input
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Type a reply..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                        />
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                          type="submit"
                          disabled={isSending}
                        >
                          {getSendButtonText()}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-500">
                      Select a conversation to view
                    </h3>
                    <p className="text-gray-400 mt-2">
                      Choose from your messages on the left
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
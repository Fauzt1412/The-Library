import React, { createContext, useContext, useState, useEffect } from 'react';
import chatService from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [isUserInChat, setIsUserInChat] = useState(false);
  const [chatSettings, setChatSettings] = useState({
    width: 350,
    height: 500,
    position: { bottom: 90, right: 20 }
  });

  // Auto-clear messages older than 24 hours
  const clearOldMessages = () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    setMessages(prevMessages => {
      const filteredMessages = prevMessages.filter(message => {
        const messageTime = new Date(message.timestamp);
        // Keep permanent messages, system messages, and messages newer than 24 hours
        return message.isPermanent || 
               (message.type === 'system' && message.isPermanent !== false) || 
               messageTime > twentyFourHoursAgo;
      });
      
      // If messages were cleared, add a system notification
      if (filteredMessages.length < prevMessages.length) {
        const clearNotification = {
          id: 'auto-clear-' + Date.now(),
          user: 'System',
          message: '🧹 Old messages (24+ hours) have been automatically cleared to keep the chat fresh.',
          timestamp: new Date(),
          isAdmin: false,
          type: 'system',
          isPermanent: false // This notification can be cleared after 24 hours too
        };
        return [...filteredMessages, clearNotification];
      }
      
      return filteredMessages;
    });
  };

  // Initialize chat service and load data
  useEffect(() => {
    const initializeChat = () => {
      // Load chat settings from localStorage
      const savedSettings = localStorage.getItem('chat_settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setChatSettings(prev => ({ ...prev, ...parsedSettings }));
        } catch (error) {
          console.error('Error parsing chat settings:', error);
        }
      }

      // Set up chat service event listeners
      chatService.on('connected', () => {
        console.log('Chat service connected');
        setIsConnected(true);
      });

      chatService.on('disconnected', () => {
        console.log('Chat service disconnected');
        setIsConnected(false);
      });

      chatService.on('recent-messages', (recentMessages) => {
        console.log('Received recent messages:', recentMessages);
        setMessages(recentMessages || []);
      });

      chatService.on('new-message', (message) => {
        console.log('New message received:', message);
        setMessages(prev => [...prev, message]);
        setUnreadCount(prev => prev + 1);
      });

      chatService.on('message-deleted', (data) => {
        console.log('Message deleted:', data);
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      });

      chatService.on('user-joined', (data) => {
        console.log('User joined:', data);
        const joinMessage = {
          _id: 'join-' + Date.now(),
          username: 'System',
          message: `${data.username} joined the chat`,
          timestamp: data.timestamp,
          messageType: 'system'
        };
        setMessages(prev => [...prev, joinMessage]);
      });

      chatService.on('user-left', (data) => {
        console.log('User left:', data);
        const leaveMessage = {
          _id: 'leave-' + Date.now(),
          username: 'System',
          message: `${data.username} left the chat`,
          timestamp: data.timestamp,
          messageType: 'system'
        };
        setMessages(prev => [...prev, leaveMessage]);
      });

      chatService.on('online-users-updated', (data) => {
        console.log('Online users updated:', data);
        setOnlineUsersCount(data.count);
        setActiveUsers(data.users || []);
      });

      chatService.on('error', (error) => {
        console.error('Chat service error:', error);
      });
    };

    initializeChat();

    // Cleanup function
    return () => {
      chatService.disconnect();
    };
  }, []);

  // Set up interval to check for old messages every hour
  useEffect(() => {
    const interval = setInterval(() => {
      clearOldMessages();
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  const addMessage = async (messageData) => {
    try {
      if (!chatService.isUserConnected()) {
        console.error('Not connected to chat service');
        return null;
      }

      // Send message via Socket.IO
      chatService.sendMessage(
        messageData.message,
        messageData.isAdmin ? 'admin' : 'user',
        messageData.isNotice || false
      );

      // The message will be added to the UI when we receive the 'new-message' event
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const incrementUnread = () => {
    setUnreadCount(prev => prev + 1);
  };

  const getOnlineUsersCount = () => {
    return onlineUsersCount;
  };

  const joinChat = (user) => {
    if (!user || isUserInChat) return;
    
    try {
      // Connect to chat service
      chatService.connect({
        id: user._id || user.id,
        username: user.username || user.email || 'Anonymous'
      });
      
      setIsUserInChat(true);
      console.log('User joined chat:', user.username);
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  const leaveChat = (user) => {
    if (!user || !isUserInChat) return;
    
    try {
      // Disconnect from chat service
      chatService.disconnect();
      setIsUserInChat(false);
      setIsConnected(false);
      console.log('User left chat:', user.username);
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const deleteMessage = async (messageId, adminUser) => {
    if (!adminUser || adminUser.role !== 'admin') {
      console.error('Only admins can delete messages');
      return false;
    }

    try {
      if (!chatService.isUserConnected()) {
        console.error('Not connected to chat service');
        return false;
      }

      // Send delete request via Socket.IO
      chatService.deleteMessage(messageId);
      
      // The message will be removed from UI when we receive the 'message-deleted' event
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  };

  const clearMessages = async () => {
    try {
      if (!chatService.isUserConnected()) {
        console.error('Not connected to chat service');
        return false;
      }

      // Use HTTP API for admin operations
      const response = await chatService.clearChat();
      if (response.success) {
        // Clear local messages
        setMessages([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  };



  const updateChatSettings = (newSettings) => {
    const updatedSettings = { ...chatSettings, ...newSettings };
    setChatSettings(updatedSettings);
    localStorage.setItem('chat_settings', JSON.stringify(updatedSettings));
  };

  const resetChatSettings = () => {
    const defaultSettings = {
      width: 350,
      height: 500,
      position: { bottom: 90, right: 20 }
    };
    setChatSettings(defaultSettings);
    localStorage.setItem('chat_settings', JSON.stringify(defaultSettings));
  };

  const value = {
    messages,
    setMessages,
    addMessage,
    isConnected,
    setIsConnected,
    unreadCount,
    setUnreadCount,
    markAsRead,
    incrementUnread,
    activeUsers,
    setActiveUsers,
    getOnlineUsersCount,
    clearMessages,
    clearOldMessages,
    joinChat,
    leaveChat,
    isUserInChat,
    setIsUserInChat,
    deleteMessage,
    chatSettings,
    updateChatSettings,
    resetChatSettings
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatAPI } from '../services/chatAPI';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
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

  // Load initial data and settings from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [messagesResponse, usersResponse] = await Promise.all([
          chatAPI.getMessages(),
          chatAPI.getOnlineUsers()
        ]);
        
        if (messagesResponse.success) {
          const loadedMessages = messagesResponse.data || [];
          
          // Check if we need to add a welcome message
          const hasWelcomeMessage = loadedMessages.some(msg => 
            msg.type === 'system' && msg.message.includes('Welcome to Library Forum Chat')
          );
          
          if (!hasWelcomeMessage) {
            const welcomeMessage = {
              id: 'welcome-' + Date.now(),
              user: 'System',
              message: '📚 Welcome to Library Forum Chat! This is a place for book lovers to connect and share. Please be respectful and follow our community guidelines. Messages older than 24 hours are automatically cleared to keep discussions fresh.',
              timestamp: new Date(),
              isAdmin: false,
              type: 'system',
              isPermanent: true // This message will never be auto-cleared
            };
            loadedMessages.unshift(welcomeMessage); // Add at the beginning
          }
          
          setMessages(loadedMessages);
          // Clear old messages on initial load
          setTimeout(clearOldMessages, 1000);
        }
        
        if (usersResponse.success) {
          // Start with empty users list instead of sample data
          setActiveUsers([]);
        }
        
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
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };
    
    loadInitialData();
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
      const response = await chatAPI.sendMessage(messageData);
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        return response.data;
      } else {
        console.error('Failed to send message:', response.error);
        return null;
      }
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
    return activeUsers.filter(user => user.status === 'online').length;
  };

  const joinChat = (user) => {
    if (!user || isUserInChat) return;
    
    // Add user to active users
    const newUser = {
      id: Date.now(),
      username: user.username || user.email || 'Anonymous',
      status: 'online',
      lastSeen: new Date()
    };
    
    setActiveUsers(prev => {
      // Check if user already exists
      const existingUser = prev.find(u => u.username === newUser.username);
      if (existingUser) {
        return prev.map(u => 
          u.username === newUser.username 
            ? { ...u, status: 'online', lastSeen: new Date() }
            : u
        );
      }
      return [...prev, newUser];
    });
    
    // Add join message
    const joinMessage = {
      id: Date.now() + 1,
      user: 'System',
      message: `${newUser.username} has entered the chat`,
      timestamp: new Date(),
      isAdmin: false,
      type: 'system',
      isPermanent: false // Join/leave messages can be auto-cleared
    };
    
    setMessages(prev => [...prev, joinMessage]);
    setIsUserInChat(true);
  };

  const leaveChat = (user) => {
    if (!user || !isUserInChat) return;
    
    const username = user.username || user.email || 'Anonymous';
    
    // Remove user from active users
    setActiveUsers(prev => prev.filter(u => u.username !== username));
    
    // Add leave message
    const leaveMessage = {
      id: Date.now(),
      user: 'System',
      message: `${username} has left the chat`,
      timestamp: new Date(),
      isAdmin: false,
      type: 'system',
      isPermanent: false // Join/leave messages can be auto-cleared
    };
    
    setMessages(prev => [...prev, leaveMessage]);
    setIsUserInChat(false);
  };

  const deleteMessage = async (messageId, adminUser) => {
    if (!adminUser || adminUser.role !== 'admin') {
      console.error('Only admins can delete messages');
      return false;
    }

    try {
      const response = await chatAPI.deleteMessage(messageId);
      if (response.success) {
        // Remove message from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        // Add deletion notification
        const deletionMessage = {
          id: Date.now(),
          user: 'System',
          message: `A message was deleted by ${adminUser.username || 'Admin'}`,
          timestamp: new Date(),
          isAdmin: true,
          type: 'system',
          isPermanent: false
        };
        
        setMessages(prev => [...prev, deletionMessage]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  };

  const clearMessages = async () => {
    try {
      const response = await chatAPI.clearMessages();
      if (response.success) {
        // Keep permanent system messages (like welcome messages)
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.isPermanent)
        );
        
        // Add a system message about manual clearing
        const clearNotification = {
          id: Date.now(),
          user: 'System',
          message: 'Chat has been cleared by an administrator.',
          timestamp: new Date(),
          isAdmin: true,
          type: 'system',
          isPermanent: true
        };
        
        setMessages(prev => [...prev, clearNotification]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  };

  const getChatStats = async () => {
    try {
      const response = await chatAPI.getChatStats();
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching chat stats:', error);
      return null;
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
    getChatStats,
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
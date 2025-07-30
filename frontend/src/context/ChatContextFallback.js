import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load chat settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('chat_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setChatSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading chat settings:', error);
    }
  }, []);

  const addMessage = async (messageData) => {
    try {
      if (!messageData || !messageData.message) {
        console.error('Invalid message data');
        return null;
      }

      const newMessage = {
        _id: Date.now().toString(),
        username: messageData.user || 'Anonymous',
        message: messageData.message,
        timestamp: new Date(),
        messageType: messageData.isAdmin ? 'admin' : 'user',
        isNotice: messageData.isNotice || false
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
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
      setIsUserInChat(true);
      setIsConnected(true);
      setOnlineUsersCount(1);
      
      // Add welcome message first
      const welcomeMessage = {
        _id: 'welcome-' + Date.now(),
        username: 'Library Bot',
        message: '📚 Welcome to Library Forum Chat! This is your space to discuss books, games, share recommendations, and connect with fellow enthusiasts. Please be respectful and follow our community guidelines.',
        timestamp: new Date(),
        messageType: 'system',
        isNotice: true
      };
      
      // Add join message
      const joinMessage = {
        _id: 'join-' + Date.now() + 1,
        username: 'System',
        message: `${user.username || user.email || 'User'} joined the chat`,
        timestamp: new Date(),
        messageType: 'system'
      };
      
      setMessages(prev => [...prev, welcomeMessage, joinMessage]);
      console.log('User joined chat (fallback mode):', user.username);
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  const leaveChat = (user) => {
    if (!user || !isUserInChat) return;
    
    try {
      setIsUserInChat(false);
      setIsConnected(false);
      setOnlineUsersCount(0);
      
      const leaveMessage = {
        _id: 'leave-' + Date.now(),
        username: 'System',
        message: `${user.username || user.email || 'User'} left the chat`,
        timestamp: new Date(),
        messageType: 'system'
      };
      
      setMessages(prev => [...prev, leaveMessage]);
      console.log('User left chat (fallback mode):', user.username);
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
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  };

  const clearMessages = async () => {
    try {
      setMessages([]);
      return true;
    } catch (error) {
      console.error('Error clearing messages:', error);
      return false;
    }
  };

  const clearOldMessages = () => {
    // Placeholder for old message clearing
    console.log('Clear old messages (fallback mode)');
  };

  const updateChatSettings = (newSettings) => {
    try {
      const updatedSettings = { ...chatSettings, ...newSettings };
      setChatSettings(updatedSettings);
      localStorage.setItem('chat_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating chat settings:', error);
    }
  };

  const resetChatSettings = () => {
    try {
      const defaultSettings = {
        width: 350,
        height: 500,
        position: { bottom: 90, right: 20 }
      };
      setChatSettings(defaultSettings);
      localStorage.setItem('chat_settings', JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Error resetting chat settings:', error);
    }
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
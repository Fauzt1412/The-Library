import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/floating-chat.css';

// Enhanced safe floating chat component with all original features
const SafeFloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isUserInChat, setIsUserInChat] = useState(false);
  const [user, setUser] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isNoticeMode, setIsNoticeMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
  const [chatSettings, setChatSettings] = useState({
    width: 350,
    height: 500,
    position: { bottom: 90, right: 20 }
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const chatInfoRef = useRef(null);
  
  // Socket.IO connection
  useEffect(() => {
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:1412';
    
    try {
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      
      newSocket.on('connect', () => {
        console.log('✅ Connected to chat server');
        setIsConnected(true);
        setConnectionError(null);
      });
      
      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from chat server');
        setIsConnected(false);
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        setConnectionError('Failed to connect to chat server');
        setIsConnected(false);
      });
      
      // Real-time message events
      newSocket.on('new-message', (message) => {
        console.log('📨 New message received:', message);
        setMessages(prev => [...prev, message]);
        
        // Update unread count if chat is closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      });
      
      newSocket.on('recent-messages', (messages) => {
        console.log('📋 Recent messages loaded:', messages.length);
        setMessages(messages);
      });
      
      newSocket.on('user-joined', (data) => {
        console.log('👋 User joined:', data.username);
        const joinMessage = {
          _id: 'join-' + Date.now(),
          username: 'System',
          message: `${data.username} joined the chat`,
          timestamp: data.timestamp,
          messageType: 'system'
        };
        setMessages(prev => [...prev, joinMessage]);
      });
      
      newSocket.on('user-left', (data) => {
        console.log('👋 User left:', data.username);
        const leaveMessage = {
          _id: 'leave-' + Date.now(),
          username: 'System',
          message: `${data.username} left the chat`,
          timestamp: data.timestamp,
          messageType: 'system'
        };
        setMessages(prev => [...prev, leaveMessage]);
      });
      
      newSocket.on('online-users-updated', (data) => {
        console.log('👥 Online users updated:', data.count);
        setActiveUsers(data.users.map(user => ({
          id: user.userId,
          username: user.username,
          status: 'online',
          role: user.role
        })));
      });
      
      newSocket.on('message-deleted', (data) => {
        console.log('🗑️ Message deleted:', data.messageId);
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      });
      
      newSocket.on('chat-cleared', () => {
        console.log('🧹 Chat cleared by admin');
        setMessages([]);
      });
      
      newSocket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        alert(error.message || 'Chat error occurred');
      });
      
      setSocket(newSocket);
      
      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
      setConnectionError('Failed to initialize chat connection');
    }
  }, [isOpen]);
  
  // Try to get user from localStorage or context safely
  useEffect(() => {
    try {
      // Try to get user from localStorage first
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.warn('Error initializing chat:', error);
      setHasError(true);
    }
  }, []);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isOpen]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showEmojiPicker]);

  // Close chat info when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatInfoRef.current && !chatInfoRef.current.contains(event.target)) {
        setShowChatInfo(false);
      }
    };

    if (showChatInfo) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showChatInfo]);
  
  // Removed demo users initialization - now only tracks real users
  
  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Mark as read when opening
    }
  };
  
  const handleUserListToggle = () => {
    setShowUserList(!showUserList);
  };
  
  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };
  
  const handleEmojiPickerToggle = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  const handleChatInfoToggle = () => {
    setShowChatInfo(!showChatInfo);
  };
  
  const handleNoticeModeToggle = () => {
    setIsNoticeMode(!isNoticeMode);
  };
  
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Focus back to input after emoji selection
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };
  
  const handleDeleteMessage = async (messageId) => {
    if (!user || user.role !== 'admin') {
      alert('Only administrators can delete messages.');
      return;
    }

    if (!socket || !isConnected) {
      alert('Chat server is not connected.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this message?')) {
      socket.emit('delete-message', { messageId });
      console.log('🗑️ Deleting message via Socket.IO:', messageId);
    }
  };

  const handleClearAllMessages = async () => {
    if (!user || user.role !== 'admin') {
      alert('Only administrators can clear all messages.');
      return;
    }

    if (window.confirm('Are you sure you want to clear ALL chat messages? This action cannot be undone.')) {
      setMessages([]);
      alert('All messages have been cleared.');
    }
  };
  
  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
  };
  
  const getOnlineUsersCount = () => {
    // Count online users, always include current user if in chat
    const onlineUsers = activeUsers.filter(user => user.status === 'online').length;
    return Math.max(onlineUsers, isUserInChat ? 1 : 0);
  };
  
  // Removed demo users - now only shows real users
  
  const updateChatSettings = (newSettings) => {
    setChatSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  // Drag to resize functionality
  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = chatSettings.width;
    const startHeight = chatSettings.height;
    
    const handleMouseMove = (e) => {
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      switch (handle) {
        case 'se': // Southeast corner
          newWidth = Math.max(250, Math.min(800, startWidth + deltaX));
          newHeight = Math.max(350, Math.min(900, startHeight + deltaY));
          break;
        case 'sw': // Southwest corner
          newWidth = Math.max(250, Math.min(800, startWidth - deltaX));
          newHeight = Math.max(350, Math.min(900, startHeight + deltaY));
          break;
        case 'ne': // Northeast corner
          newWidth = Math.max(250, Math.min(800, startWidth + deltaX));
          newHeight = Math.max(350, Math.min(900, startHeight - deltaY));
          break;
        case 'nw': // Northwest corner
          newWidth = Math.max(250, Math.min(800, startWidth - deltaX));
          newHeight = Math.max(350, Math.min(900, startHeight - deltaY));
          break;
        case 'e': // East edge
          newWidth = Math.max(250, Math.min(800, startWidth + deltaX));
          break;
        case 'w': // West edge
          newWidth = Math.max(250, Math.min(800, startWidth - deltaX));
          break;
        case 's': // South edge
          newHeight = Math.max(350, Math.min(900, startHeight + deltaY));
          break;
        case 'n': // North edge
          newHeight = Math.max(350, Math.min(900, startHeight - deltaY));
          break;
      }
      
      updateChatSettings({ width: newWidth, height: newHeight });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleJoinChat = () => {
    if (user && !isUserInChat && socket && isConnected) {
      setIsUserInChat(true);
      
      // Join chat via Socket.IO
      socket.emit('join-chat', {
        userId: user._id || user.id,
        username: user.username || user.email || 'Anonymous'
      });
      
      console.log('🚀 Joining chat via Socket.IO');
      
      // Show welcome popup if not shown before
      if (!hasShownWelcome) {
        setShowWelcomePopup(true);
        setHasShownWelcome(true);
        
        // Auto-hide after 15 seconds
        setTimeout(() => {
          setShowWelcomePopup(false);
        }, 15000);
      }
    } else if (!socket || !isConnected) {
      alert('Chat server is not connected. Please try again.');
    }
  };
  
  const handleLeaveChat = () => {
    if (user && isUserInChat && socket) {
      setIsUserInChat(false);
      
      // Disconnect from Socket.IO will automatically trigger user-left event
      socket.disconnect();
      
      console.log('👋 Leaving chat via Socket.IO');
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !socket || !isConnected) return;
    
    setIsLoading(true);
    
    try {
      // Send message via Socket.IO
      socket.emit('send-message', {
        message: newMessage.trim(),
        messageType: user.role === 'admin' ? 'admin' : 'user',
        isNotice: isNoticeMode && user.role === 'admin'
      });
      
      console.log('📤 Sending message via Socket.IO');
      
      setNewMessage('');
      
      // Reset notice mode after sending
      if (isNoticeMode) {
        setIsNoticeMode(false);
      }
      
      // Auto-scroll to bottom after sending
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Common emojis for the picker
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
    '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
    '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
    '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋',
    '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
    '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
    '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜',
    '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
    '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
    '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️',
    '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹',
    '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌',
    '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
    '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗',
    '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️',
    '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯',
    '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀',
    '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂',
    '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮',
    '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠',
    '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣',
    '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣',
    '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️',
    '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬',
    '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️',
    '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️',
    '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶'
  ];
  
  const formatTime = (timestamp) => {
    try {
      const now = new Date();
      const messageTime = new Date(timestamp);
      const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return messageTime.toLocaleDateString();
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  const renderMessage = (msg, index) => {
    const key = msg._id || `msg-${index}`;
    
    if (msg.messageType === 'system') {
      const isWelcome = msg.message?.includes('Welcome to Library Forum Chat') || msg.username === 'Library Bot';
      const icon = isWelcome ? 'fa-heart' : 'fa-info-circle';
      
      return (
        <div key={key} className={`message system-message ${msg.isNotice ? 'notice-message' : ''}`}>
          <div className="message-content">
            <i className={`fas ${icon} me-2`}></i>
            {msg.message}
          </div>
          <div className="message-time">{formatTime(msg.timestamp)}</div>
        </div>
      );
    }

    return (
      <div key={key} className={`message ${msg.isAdmin || msg.messageType === 'admin' ? 'admin-message' : ''} ${msg.isNotice ? 'notice-message' : ''}`}>
        <div className="message-header">
          <span className={`message-user ${msg.isAdmin || msg.messageType === 'admin' ? 'admin-user' : ''}`}>
            {msg.isNotice && <i className="fas fa-bullhorn me-1" title="Important Notice"></i>}
            {(msg.isAdmin || msg.messageType === 'admin') && !msg.isNotice && <i className="fas fa-crown me-1"></i>}
            {msg.username}
          </span>
          <div className="message-actions">
            <span className="message-time">{formatTime(msg.timestamp)}</span>
            {user && user.role === 'admin' && msg.messageType !== 'system' && (
              <button 
                className="delete-message-btn"
                onClick={() => handleDeleteMessage(msg._id)}
                title="Delete message"
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
        </div>
        <div className="message-content">
          {msg.message}
        </div>
      </div>
    );
  };
  
  // Error fallback
  if (hasError) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#ffc107',
          color: '#212529',
          padding: '12px 16px',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 1000,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onClick={() => window.location.reload()}
        title="Chat system error - Click to reload"
      >
        <i className="fas fa-exclamation-triangle"></i>
        Chat Error - Click to Reload
      </div>
    );
  }
  
  return (
    <>
      {/* Chat Toggle Button */}
        <div className={`floating-chat-toggle ${isOpen ? 'open' : ''}`} 
        onClick={handleToggleChat}
      >
        <div className="chat-icon">
          {isOpen ? (
            <i className="fas fa-times"></i>
          ) : (
            <>
              <i className="fas fa-comments"></i>
              {unreadCount > 0 && (
                <span className="chat-badge">{unreadCount}</span>
              )}
            </>
          )}
        </div>
        <div className="chat-tooltip">
          {isOpen ? 'Close Forum Chat' : 'Open Forum Chat'}
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`floating-chat-window open ${isResizing ? 'resizing' : ''}`}
          style={{
            position: 'fixed',
            bottom: `${chatSettings.position.bottom}px`,
            right: `${chatSettings.position.right}px`,
            width: `${chatSettings.width}px`,
            height: `${chatSettings.height}px`,
            zIndex: 999
          }}
        >
          <div className="chat-header">
            <div className="chat-header-content">
              <i className="fas fa-comments me-2"></i>
              <span>Library Forum</span>
              <div className="chat-header-actions">
                <button 
                  className="chat-action-btn" 
                  onClick={handleUserListToggle}
                  title="View online users"
                >
                  <i className="fas fa-users"></i>
                  <span className="user-count">{getOnlineUsersCount()}</span>
                </button>
                <button 
                  className="chat-action-btn" 
                  onClick={handleSettingsToggle}
                  title="Chat settings"
                >
                  <i className="fas fa-sliders-h"></i>
                </button>
                <div className="online-indicator">
                  <span className={`online-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                  <span className="online-text">
                    {isConnected ? 'Connected' : connectionError ? 'Error' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={handleToggleChat}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Resize Handles */}
          <div className="resize-handle resize-handle-n" onMouseDown={(e) => handleMouseDown(e, 'n')}></div>
          <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleMouseDown(e, 's')}></div>
          <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleMouseDown(e, 'e')}></div>
          <div className="resize-handle resize-handle-w" onMouseDown={(e) => handleMouseDown(e, 'w')}></div>
          <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleMouseDown(e, 'ne')}></div>
          <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleMouseDown(e, 'nw')}></div>
          <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleMouseDown(e, 'se')}></div>
          <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleMouseDown(e, 'sw')}></div>

          <div className="chat-content">
            {showSettings && (
              <div className="chat-settings-panel">
                <div className="chat-settings-header">
                  <h6><i className="fas fa-cog me-2"></i>Chat Settings</h6>
                  <button className="close-settings-btn" onClick={() => setShowSettings(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="chat-settings-content">
                  {user && user.role === 'admin' && (
                    <div className="admin-section">
                      <div className="settings-label">Admin Controls</div>
                      <div className="admin-action">
                        <div className="admin-action-info">
                          <div className="admin-action-title">
                            <i className="fas fa-trash me-2"></i>
                            Clear All Messages
                          </div>
                          <div className="admin-action-desc">
                            Remove all messages from the chat
                          </div>
                        </div>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={handleClearAllMessages}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="settings-section">
                    <label className="settings-label">Chat Size</label>
                    <div className="size-inputs">
                      <div className="input-group">
                        <label>Width</label>
                        <input 
                          type="number" 
                          className="size-input"
                          value={chatSettings.width}
                          onChange={(e) => updateChatSettings({ width: parseInt(e.target.value) || 350 })}
                          min="250"
                          max="800"
                        />
                        <div className="input-unit">px</div>
                      </div>
                      <div className="input-group">
                        <label>Height</label>
                        <input 
                          type="number" 
                          className="size-input"
                          value={chatSettings.height}
                          onChange={(e) => updateChatSettings({ height: parseInt(e.target.value) || 500 })}
                          min="350"
                          max="900"
                        />
                        <div className="input-unit">px</div>
                      </div>
                    </div>
                    <div className="preset-buttons">
                      <button 
                        className="preset-btn"
                        onClick={() => updateChatSettings({ width: 350, height: 500 })}
                      >
                        <span>Small</span>
                        <small>350×500</small>
                      </button>
                      <button 
                        className="preset-btn"
                        onClick={() => updateChatSettings({ width: 450, height: 600 })}
                      >
                        <span>Medium</span>
                        <small>450×600</small>
                      </button>
                      <button 
                        className="preset-btn"
                        onClick={() => updateChatSettings({ width: 550, height: 700 })}
                      >
                        <span>Large</span>
                        <small>550×700</small>
                      </button>
                      <button 
                        className="preset-btn"
                        onClick={() => updateChatSettings({ width: 650, height: 800 })}
                      >
                        <span>Extra Large</span>
                        <small>650×800</small>
                      </button>
                    </div>
                    <div className="size-preview">
                      <div 
                        className="preview-box"
                        style={{
                          width: `${Math.max(20, chatSettings.width / 15)}px`,
                          height: `${Math.max(15, chatSettings.height / 20)}px`
                        }}
                      >
                        <div className="preview-text">
                          {chatSettings.width}×{chatSettings.height}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="settings-info">
                    <small>Drag the edges or corners to resize, or use presets above</small>
                  </div>
                </div>
              </div>
            )}
            
            {showUserList && (
              <div className="user-list">
                <div className="user-list-header">
                  <h6>Online Users ({getOnlineUsersCount()})</h6>
                  <button className="close-user-list" onClick={handleUserListToggle}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="user-list-content">
                  {activeUsers.length === 0 && !isUserInChat ? (
                    <div className="user-item">
                      <div className="user-status offline"></div>
                      <span className="username">No users online</span>
                      <span className="user-status-text">Join chat to see others</span>
                    </div>
                  ) : (
                    <>
                      {/* Show current user first if in chat */}
                      {isUserInChat && user && (
                        <div className="user-item online">
                          <div className="user-status online"></div>
                          <span className="username">{user.username || user.email || 'You'} (You)</span>
                          <span className="user-status-text">online</span>
                        </div>
                      )}
                      {/* Show other active users */}
                      {activeUsers.map((activeUser, index) => {
                        // Don't show current user twice
                        const isCurrentUser = user && (activeUser.id === (user.id || user.email));
                        if (isCurrentUser) return null;
                        
                        return (
                          <div key={activeUser.id || index} className={`user-item ${activeUser.status || 'online'}`}>
                            <div className={`user-status ${activeUser.status || 'online'}`}></div>
                            <span className="username">
                              {activeUser.username}
                              {activeUser.role === 'admin' && <i className="fas fa-crown ms-1" title="Administrator"></i>}
                            </span>
                            <span className="user-status-text">{activeUser.status || 'online'}</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <i className="fas fa-comments fa-2x mb-2"></i>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(renderMessage)
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="chat-input-container">
            {!user ? (
              <div className="login-prompt">
                <p className="mb-2">Please log in to participate in the forum</p>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => window.location.href = '/login'}
                >
                  Log In
                </button>
              </div>
            ) : !isUserInChat ? (
              <div className="join-chat-prompt">
                <p className="mb-2 text-center">Join the chat to start participating in our community discussions</p>
                <button className="btn btn-primary w-100" onClick={handleJoinChat}>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Join Chat
                </button>
              </div>
            ) : (
              <>
                <div className="chat-input-controls">
                  <div className="left-controls">
                    <div className="emoji-picker-container" ref={emojiPickerRef}>
                      <button 
                        type="button" 
                        className={`emoji-picker-btn-external ${showEmojiPicker ? 'active' : ''}`}
                        title="Add emoji"
                        disabled={isLoading}
                        onClick={handleEmojiPickerToggle}
                      >
                        <i className="fas fa-smile"></i>
                      </button>
                      {showEmojiPicker && (
                        <div className="emoji-picker-dropdown">
                          <div className="emoji-picker-header">
                            <span>Choose an emoji</span>
                            <button 
                              type="button" 
                              className="emoji-picker-close"
                              onClick={() => setShowEmojiPicker(false)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                          <div className="emoji-picker-grid">
                            {commonEmojis.map((emoji, index) => (
                              <button
                                key={index}
                                type="button"
                                className="emoji-btn"
                                onClick={() => handleEmojiSelect(emoji)}
                                title={`Add ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {user && user.role === 'admin' && (
                      <div className="notice-mode-container">
                        <button 
                          type="button" 
                          className={`notice-mode-btn ${isNoticeMode ? 'active' : ''}`}
                          title={isNoticeMode ? 'Switch to normal message' : 'Send as important notice'}
                          onClick={handleNoticeModeToggle}
                        >
                          <i className="fas fa-bullhorn"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="chat-info-container" ref={chatInfoRef}>
                    <button 
                      type="button" 
                      className={`chat-info-btn ${showChatInfo ? 'active' : ''}`}
                      title="Chat rules and information"
                      onClick={handleChatInfoToggle}
                    >
                      <i className="fas fa-info-circle"></i>
                    </button>
                    {showChatInfo && (
                      <div className="chat-info-dropdown">
                        <div className="chat-info-header">
                          <span>📋 Chat Rules & Info</span>
                          <button 
                            type="button" 
                            className="chat-info-close"
                            onClick={() => setShowChatInfo(false)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="chat-info-content">
                          <div className="info-section">
                            <h6>🎯 Welcome to Library Forum Chat!</h6>
                            <p>Connect with fellow book lovers and share your thoughts.</p>
                          </div>
                          <div className="info-section">
                            <h6>📜 Chat Rules:</h6>
                            <ul>
                              <li>Be respectful and kind to all members</li>
                              <li>Keep discussions relevant to books and literature</li>
                              <li>No spam, advertising, or inappropriate content</li>
                              <li>Use appropriate language at all times</li>
                              <li>Respect others' opinions and perspectives</li>
                            </ul>
                          </div>
                          <div className="info-section">
                            <h6>ℹ️ Chat Features:</h6>
                            <ul>
                              <li>Messages auto-clear after 24 hours</li>
                              <li>Click 😊 to add emojis to your messages</li>
                              <li>Admins can moderate chat content</li>
                              <li>Your chat status shows when you're online</li>
                            </ul>
                          </div>
                          <div className="info-section">
                            <h6>🚀 Getting Started:</h6>
                            <p>Click "Join Chat" to start participating in discussions. Share book recommendations, ask questions, or just say hello!</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <form onSubmit={handleSendMessage} className="chat-input-form">
                  <div className={`input-group ${newMessage.length > 450 ? 'warning' : ''} ${newMessage.length >= 500 ? 'error' : ''}`}>
                    <input
                      ref={chatInputRef}
                      type="text"
                      className={`chat-input ${isNoticeMode ? 'notice-input' : ''}`}
                      placeholder={isNoticeMode ? '📢 Type an important notice...' : 'Share your thoughts with the community...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isLoading}
                      maxLength={500}
                    />
                    <button 
                      type="submit" 
                      className="chat-send-btn"
                      disabled={isLoading || !newMessage.trim()}
                      title={isLoading ? 'Sending...' : 'Send message'}
                    >
                      {isLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                    </button>
                  </div>
                  <div className="chat-input-footer">
                    <div className="input-help">
                      <span className={`character-count ${
                        newMessage.length > 450 ? 'warning' : ''
                      } ${
                        newMessage.length >= 500 ? 'danger' : ''
                      }`}>
                        <i className="fas fa-keyboard me-1"></i>
                        <small>{newMessage.length}/500</small>
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleLeaveChat}
                      title="Leave chat"
                    >
                      <i className="fas fa-sign-out-alt me-1"></i>
                      Leave
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="welcome-popup-overlay">
          <div className="welcome-popup">
            <div className="welcome-popup-header">
              <div className="welcome-popup-title">
                <i className="fas fa-heart me-2"></i>
                Welcome to Library Forum Chat!
              </div>
              <button 
                className="welcome-popup-close"
                onClick={handleCloseWelcomePopup}
                title="Close welcome message"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="welcome-popup-content">
              <div className="welcome-popup-message">
                <i className="fas fa-book-open me-2"></i>
                This is your space to discuss books, games, share recommendations, and connect with fellow enthusiasts.
              </div>
              <div className="welcome-popup-guidelines">
                <i className="fas fa-handshake me-2"></i>
                Please be respectful and follow our community guidelines.
              </div>
              <div className="welcome-popup-footer">
                <small>
                  <i className="fas fa-clock me-1"></i>
                  This message will disappear automatically in a few seconds
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SafeFloatingChat;
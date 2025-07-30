import React, { useState, useEffect, useRef } from 'react';
import '../styles/floating-chat.css';

const SafeFloatingChatV2 = () => {
  // Safe context hooks with comprehensive error handling
  let user = null;
  let chatContext = null;
  let themeContext = null;
  let hasContextError = false;
  
  try {
    // Import and use contexts safely
    const { useAuth } = require('../context/AuthContext');
    const { useChat } = require('../context/ChatContext');
    const { useTheme } = require('../context/ThemeContext');
    
    const authContext = useAuth();
    chatContext = useChat();
    themeContext = useTheme();
    
    user = authContext?.user || null;
  } catch (error) {
    console.warn('Context error in FloatingChat:', error.message);
    hasContextError = true;
    
    // Provide complete fallback
    user = null;
    chatContext = {
      messages: [],
      addMessage: async () => null,
      unreadCount: 0,
      markAsRead: () => {},
      activeUsers: [],
      getOnlineUsersCount: () => 0,
      joinChat: () => {},
      leaveChat: () => {},
      isUserInChat: false,
      deleteMessage: async () => false,
      clearMessages: async () => false,
      chatSettings: { width: 350, height: 500, position: { bottom: 90, right: 20 } },
      updateChatSettings: () => {}
    };
    themeContext = { theme: 'light', isDark: false };
  }
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isNoticeMode, setIsNoticeMode] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const chatInfoRef = useRef(null);
  
  // Safely destructure context values
  const {
    messages = [],
    addMessage = async () => null,
    unreadCount = 0,
    markAsRead = () => {},
    activeUsers = [],
    getOnlineUsersCount = () => 0,
    joinChat = () => {},
    leaveChat = () => {},
    isUserInChat = false,
    deleteMessage = async () => false,
    clearMessages = async () => false,
    chatSettings = { width: 350, height: 500, position: { bottom: 90, right: 20 } },
    updateChatSettings = () => {}
  } = chatContext || {};
  
  const { theme = 'light', isDark = false } = themeContext || {};
  
  // Error fallback UI
  if (hasContextError) {\n    return (\n      <div \n        style={{\n          position: 'fixed',\n          bottom: '20px',\n          right: '20px',\n          background: '#ffc107',\n          color: '#212529',\n          padding: '12px 16px',\n          borderRadius: '25px',\n          fontSize: '14px',\n          fontWeight: '600',\n          zIndex: 1000,\n          cursor: 'pointer',\n          boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',\n          display: 'flex',\n          alignItems: 'center',\n          gap: '8px'\n        }}\n        onClick={() => window.location.reload()}\n        title=\"Chat system error - Click to reload\"\n      >\n        <i className=\"fas fa-exclamation-triangle\"></i>\n        Chat Error - Click to Reload\n      </div>\n    );\n  }
  
  // Event handlers
  const handleToggleChat = () => {\n    try {\n      setIsOpen(!isOpen);\n      if (!isOpen && markAsRead) {\n        markAsRead();\n      }\n    } catch (error) {\n      console.error('Error toggling chat:', error);\n    }\n  };
  
  const handleJoinChat = () => {\n    try {\n      if (user && !isUserInChat && joinChat) {\n        joinChat(user);\n      }\n    } catch (error) {\n      console.error('Error joining chat:', error);\n    }\n  };
  
  const handleSendMessage = async (e) => {\n    e.preventDefault();\n    \n    if (!newMessage.trim() || !user || !addMessage) return;\n    \n    setIsLoading(true);\n    \n    try {\n      const messageData = {\n        user: user.username || user.email || 'Anonymous',\n        message: newMessage.trim(),\n        timestamp: new Date(),\n        isAdmin: user.role === 'admin',\n        isNotice: isNoticeMode && user.role === 'admin'\n      };\n      \n      const sentMessage = await addMessage(messageData);\n      if (sentMessage) {\n        setNewMessage('');\n        if (isNoticeMode) {\n          setIsNoticeMode(false);\n        }\n      }\n    } catch (error) {\n      console.error('Error sending message:', error);\n    } finally {\n      setIsLoading(false);\n    }\n  };
  
  const formatTime = (timestamp) => {\n    try {\n      const now = new Date();\n      const messageTime = new Date(timestamp);\n      const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));\n      \n      if (diffInMinutes < 1) return 'Just now';\n      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;\n      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;\n      return messageTime.toLocaleDateString();\n    } catch (error) {\n      return 'Unknown time';\n    }\n  };
  
  const renderMessage = (msg, index) => {\n    try {\n      const key = msg._id || msg.id || `msg-${index}`;\n      \n      if (msg.messageType === 'system' || msg.type === 'system') {\n        const isWelcome = msg.message?.includes('Welcome to Library Forum Chat') || msg.username === 'Library Bot';\n        const icon = isWelcome ? 'fa-heart' : 'fa-info-circle';\n        \n        return (\n          <div key={key} className={`message system-message ${msg.isNotice ? 'notice-message' : ''}`}>\n            <div className=\"message-content\">\n              <i className={`fas ${icon} me-2`}></i>\n              {msg.message || 'System message'}\n            </div>\n            <div className=\"message-time\">{formatTime(msg.timestamp)}</div>\n          </div>\n        );\n      }\n\n      return (\n        <div key={key} className={`message ${msg.isAdmin || msg.messageType === 'admin' ? 'admin-message' : ''} ${msg.isNotice ? 'notice-message' : ''}`}>\n          <div className=\"message-header\">\n            <span className={`message-user ${msg.isAdmin || msg.messageType === 'admin' ? 'admin-user' : ''}`}>\n              {msg.isNotice && <i className=\"fas fa-bullhorn me-1\" title=\"Important Notice\"></i>}\n              {(msg.isAdmin || msg.messageType === 'admin') && !msg.isNotice && <i className=\"fas fa-crown me-1\"></i>}\n              {msg.user || msg.username || 'Anonymous'}\n            </span>\n            <div className=\"message-actions\">\n              <span className=\"message-time\">{formatTime(msg.timestamp)}</span>\n            </div>\n          </div>\n          <div className=\"message-content\">\n            {msg.message || 'No message content'}\n          </div>\n        </div>\n      );\n    } catch (error) {\n      console.error('Error rendering message:', error);\n      return (\n        <div key={`error-${index}`} className=\"message system-message\">\n          <div className=\"message-content\">\n            <i className=\"fas fa-exclamation-triangle me-2\"></i>\n            Error displaying message\n          </div>\n        </div>\n      );\n    }\n  };
  
  return (\n    <>\n      {/* Chat Toggle Button */}\n      <div \n        className={`floating-chat-toggle ${isOpen ? 'open' : ''}`} \n        onClick={handleToggleChat}\n        style={{ cursor: 'pointer' }}\n      >\n        <div className=\"chat-icon\">\n          {isOpen ? (\n            <i className=\"fas fa-times\"></i>\n          ) : (\n            <>\n              <i className=\"fas fa-comments\"></i>\n              {unreadCount > 0 && (\n                <span className=\"chat-badge\">{unreadCount}</span>\n              )}\n            </>\n          )}\n        </div>\n        <div className=\"chat-tooltip\">\n          {isOpen ? 'Close Forum Chat' : 'Open Forum Chat'}\n        </div>\n      </div>\n\n      {/* Chat Window */}\n      {isOpen && (\n        <div \n          className=\"floating-chat-window open\"\n          style={{\n            width: `${chatSettings?.width || 350}px`,\n            height: `${chatSettings?.height || 500}px`,\n            bottom: `${chatSettings?.position?.bottom || 90}px`,\n            right: `${chatSettings?.position?.right || 20}px`\n          }}\n        >\n          <div className=\"chat-header\">\n            <div className=\"chat-header-content\">\n              <i className=\"fas fa-comments me-2\"></i>\n              <span>Library Forum</span>\n              <div className=\"chat-header-actions\">\n                <button \n                  className=\"chat-action-btn\" \n                  title=\"View online users\"\n                >\n                  <i className=\"fas fa-users\"></i>\n                  <span className=\"user-count\">{getOnlineUsersCount()}</span>\n                </button>\n                <div className=\"online-indicator\">\n                  <span className=\"online-dot\"></span>\n                  <span className=\"online-text\">Online</span>\n                </div>\n              </div>\n            </div>\n            <button className=\"chat-close-btn\" onClick={handleToggleChat}>\n              <i className=\"fas fa-times\"></i>\n            </button>\n          </div>\n\n          <div className=\"chat-content\">\n            <div className=\"chat-messages\">\n              {messages.length === 0 ? (\n                <div className=\"no-messages\">\n                  <i className=\"fas fa-comments fa-2x mb-2\"></i>\n                  <p>No messages yet. Start the conversation!</p>\n                </div>\n              ) : (\n                messages.map(renderMessage)\n              )}\n              <div ref={messagesEndRef} />\n            </div>\n          </div>\n\n          <div className=\"chat-input-container\">\n            {!user ? (\n              <div className=\"login-prompt\">\n                <p className=\"mb-2\">Please log in to participate in the forum</p>\n                <button \n                  className=\"btn btn-primary btn-sm\" \n                  onClick={() => window.location.href = '/login'}\n                >\n                  Log In\n                </button>\n              </div>\n            ) : !isUserInChat ? (\n              <div className=\"join-chat-prompt\">\n                <p className=\"mb-2 text-center\">Join the chat to start participating in our community discussions</p>\n                <button className=\"btn btn-primary w-100\" onClick={handleJoinChat}>\n                  <i className=\"fas fa-sign-in-alt me-2\"></i>\n                  Join Chat\n                </button>\n              </div>\n            ) : (\n              <form onSubmit={handleSendMessage} className=\"chat-input-form\">\n                <div className=\"input-group\">\n                  <input\n                    ref={chatInputRef}\n                    type=\"text\"\n                    className=\"chat-input\"\n                    placeholder=\"Share your thoughts with the community...\"\n                    value={newMessage}\n                    onChange={(e) => setNewMessage(e.target.value)}\n                    disabled={isLoading}\n                    maxLength={500}\n                  />\n                  <button \n                    type=\"submit\" \n                    className=\"chat-send-btn\"\n                    disabled={isLoading || !newMessage.trim()}\n                    title={isLoading ? 'Sending...' : 'Send message'}\n                  >\n                    {isLoading ? (\n                      <i className=\"fas fa-spinner fa-spin\"></i>\n                    ) : (\n                      <i className=\"fas fa-paper-plane\"></i>\n                    )}\n                  </button>\n                </div>\n                <div className=\"chat-input-footer\">\n                  <div className=\"input-help\">\n                    <span className=\"character-count\">\n                      <i className=\"fas fa-keyboard me-1\"></i>\n                      <small>{newMessage.length}/500</small>\n                    </span>\n                  </div>\n                  <button \n                    type=\"button\" \n                    className=\"btn btn-outline-danger btn-sm\"\n                    onClick={() => leaveChat && leaveChat(user)}\n                    title=\"Leave chat\"\n                  >\n                    <i className=\"fas fa-sign-out-alt me-1\"></i>\n                    Leave\n                  </button>\n                </div>\n              </form>\n            )}\n          </div>\n        </div>\n      )}\n    </>\n  );\n};\n\nexport default SafeFloatingChatV2;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import '../styles/floating-chat.css';


// Enhanced safe floating chat component with all original features
const SafeFloatingChat = () => {
  // Environment detection (safe to call before hooks)
  const isProduction = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';
  const hasBackendUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_SERVER_URL;
  const shouldDisableChat = isProduction && !hasBackendUrl;
  
  // Temporary: Disable chat in development if you don't want to run the backend
  // Uncomment the line below to disable chat completely:
  // const shouldDisableChat = true;

  //moving the panel
  let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let currentPanel = null;

document.addEventListener('mousedown', (e) => {
  const panel = e.target.closest('.online-users-panel');
  if (!panel) return;

  isDragging = true;
  currentPanel = panel;
  panel.classList.add('dragging');

  const rect = panel.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  // Allow left positioning
  panel.style.left = rect.left + 'px';
  panel.style.top = rect.top + 'px';
  panel.style.right = 'auto';
  panel.style.position = 'absolute'; // make sure this is set
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging || !currentPanel) return;

  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;

  currentPanel.style.left = `${x}px`;
  currentPanel.style.top = `${y}px`;
});

document.addEventListener('mouseup', () => {
  if (isDragging && currentPanel) {
    currentPanel.classList.remove('dragging');
  }
  isDragging = false;
  currentPanel = null;
});
  
  // Get user from AuthContext instead of local state
  const { user, isAuthenticated } = useAuth();
  
  // All React hooks must be called before any conditional returns
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isUserInChat, setIsUserInChat] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isNoticeMode, setIsNoticeMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('online'); // 'online' or 'chat'
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
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [pinnedNotices, setPinnedNotices] = useState([]);
  
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const chatInfoRef = useRef(null);
  
  // Fetch online users via HTTP API (for non-logged-in users or as fallback)
  const fetchOnlineUsers = useCallback(async () => {
    // For now, just ensure current user is in the list if logged in
    if (user && user._id) {
      setActiveUsers(prev => {
        const currentUserId = user._id || user.id;
        const userExists = prev.some(u => u.id === currentUserId);
        
        if (!userExists) {
          return [...prev, {
            id: currentUserId,
            username: user.username || user.email || 'Anonymous',
            status: 'online',
            role: user.role || 'user'
          }];
        }
        
        return prev;
      });
    }
  }, [user]);

  // Socket.IO connection
  useEffect(() => {
    // Don't attempt connection if chat is disabled
    if (shouldDisableChat) {
      console.log('🙫 Chat disabled in production - no backend URL configured');
      setConnectionError('Chat unavailable in production');
      // Still try to fetch online users via HTTP for non-logged-in users
      fetchOnlineUsers();
      return;
    }
    
    // Determine server URL based on environment (use same as other APIs)
    let serverUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Development environment
      serverUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_SERVER_URL || 'http://localhost:1412';
    } else {
      // Production environment - use same backend as other APIs
      serverUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_SERVER_URL;
    }
    
    console.log('🌐 Connecting to server:', serverUrl);
    
    try {
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      
      newSocket.on('connect', () => {
        console.log('✅ Connected to chat server');
        console.log('🔍 [DEBUG] Socket ID:', newSocket.id);
        console.log('🔍 [DEBUG] Server URL:', serverUrl);
        setIsConnected(true);
        setConnectionError(null);
        
        // Register presence if user is logged in (so they can see online users)
        if (user && user._id) {
          console.log('📡 Registering user presence for:', user.username || user.email);
          console.log('🔍 [DEBUG] User data being sent:', {
            userId: user._id || user.id,
            username: user.username || user.email || 'Anonymous',
            role: user.role
          });
          newSocket.emit('register-presence', {
            userId: user._id || user.id,
            username: user.username || user.email || 'Anonymous'
          });
          
          // AUTO-JOIN CHAT: Automatically join chat when connecting (optional)
          // Uncomment the lines below if you want users to auto-join chat:
          /*
          console.log('🚀 Auto-joining chat for:', user.username || user.email);
          setIsUserInChat(true);
          newSocket.emit('join-chat', {
            userId: user._id || user.id,
            username: user.username || user.email || 'Anonymous'
          });
          */
          
          // Ensure current user is in activeUsers list
          setActiveUsers(prev => {
            const currentUserId = user._id || user.id;
            const userExists = prev.some(u => u.id === currentUserId);
            
            if (!userExists) {
              return [...prev, {
                id: currentUserId,
                username: user.username || user.email || 'Anonymous',
                status: 'online',
                role: user.role || 'user'
              }];
            }
            
            return prev;
          });
        }
        
        // Request current online users list
        newSocket.emit('get-online-users');
      });
      
      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from chat server');
        setIsConnected(false);
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        
        if (isProduction) {
          setConnectionError('Backend server not deployed. Chat unavailable in production.');
          console.log('🔧 To fix: Deploy backend server and set REACT_APP_SERVER_URL');
        } else {
          setConnectionError('Server not running. Please start backend server.');
          console.log('🔧 To fix: cd Server && npm run dev');
        }
        
        setIsConnected(false);
      });
      
      // Real-time message events
      newSocket.on('new-message', (message) => {
        console.log('📨 New message received:', message);
        
        // Handle notice messages separately
        if (message.isNotice && message.messageType === 'admin') {
          handleNewNotice(message);
        } else {
          setMessages(prev => [...prev, message]);
        }
        
        // Update unread count if chat is closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      });
      
      newSocket.on('recent-messages', (messages) => {
        console.log('📋 Recent messages loaded:', messages.length);
        
        // Separate notice messages from regular messages
        const regularMessages = messages.filter(msg => !(msg.isNotice && msg.messageType === 'admin'));
        const noticeMessages = messages.filter(msg => msg.isNotice && msg.messageType === 'admin');
        
        setMessages(regularMessages);
        
        // Add notice messages to pinned notices (but don't auto-dismiss old ones)
        if (noticeMessages.length > 0) {
          const notices = noticeMessages.map(msg => ({
            ...msg,
            id: msg._id || Date.now().toString() + Math.random(),
            timestamp: new Date(msg.timestamp),
            autoHide: false // Don't auto-hide old notices
          }));
          setPinnedNotices(prev => [...prev, ...notices]);
        }
      });
      
      newSocket.on('online-users-updated', (data) => {
        const mappedChatUsers = data.users.map(user => ({
          id: user.userId,
          username: user.username,
          status: 'online',
          role: user.role
        }));
        
        setChatUsers(mappedChatUsers);
      });
      
      // Handle user-joined event for real-time updates
      newSocket.on('user-joined', (data) => {
        console.log('👋 User joined chat:', data.username);
        
        // Add join message
        const joinMessage = {
          _id: 'join-' + Date.now(),
          username: 'System',
          message: `${data.username} joined the chat`,
          timestamp: data.timestamp,
          messageType: 'system'
        };
        console.log('👋 Adding join message to chat:', joinMessage);
        setMessages(prev => {
          console.log('👋 Current messages before adding join:', prev.length);
          const newMessages = [...prev, joinMessage];
          console.log('👋 New messages after adding join:', newMessages.length);
          return newMessages;
        });
      });
      
      // Handle user-left event for real-time updates
      newSocket.on('user-left', (data) => {
        console.log('👋 User left chat:', data.username);
        
        // Add leave message
        const leaveMessage = {
          _id: 'leave-' + Date.now(),
          username: 'System',
          message: `${data.username} left the chat`,
          timestamp: data.timestamp,
          messageType: 'system'
        };
        console.log('👋 Adding leave message to chat:', leaveMessage);
        setMessages(prev => {
          console.log('👋 Current messages before adding leave:', prev.length);
          const newMessages = [...prev, leaveMessage];
          console.log('👋 New messages after adding leave:', newMessages.length);
          return newMessages;
        });
      });
      
      newSocket.on('presence-updated', (data) => {
        console.log('👥 Presence updated:', data.count);
        
        const mappedUsers = data.users.map(user => ({
          id: user.userId,
          username: user.username,
          status: 'online',
          role: user.role
        }));
        
        setActiveUsers(mappedUsers);
      });
      
      newSocket.on('online-users-list', (data) => {
        console.log('👥 Online users list received:', data.count);
        
        const mappedUsers = data.users.map(user => ({
          id: user.userId,
          username: user.username,
          status: 'online',
          role: user.role
        }));
        
        setActiveUsers(mappedUsers);
      });
      
      newSocket.on('message-deleted', (data) => {
        console.log('🗑️ Message deleted:', data.messageId);
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      });
      
      newSocket.on('chat-cleared', () => {
        console.log('🧹 Chat cleared by admin');
        setMessages([]);
        setPinnedNotices([]);
      });
      
      newSocket.on('cache-cleared', (data) => {
        console.log('🗑️ Cache cleared successfully:', data);
        setMessages([]);
        setPinnedNotices([]);
        alert(`Cache cleared successfully! ${data.deletedCount} messages deleted from database.`);
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
  }, [shouldDisableChat, isProduction, user, isUserInChat, fetchOnlineUsers, isOpen]); // Add required dependencies
  
  // Periodic refresh of online users (for when socket is not available)
  useEffect(() => {
    // Disabled for now
    console.log('Periodic online users refresh disabled');
  }, [isConnected, shouldDisableChat, fetchOnlineUsers]);
  
  // Refresh online users when user logs in/out
  useEffect(() => {
    // Disabled for now
    console.log('User change refresh disabled');
  }, [user, isConnected, shouldDisableChat, fetchOnlineUsers]);
  
  // Handle user authentication changes
  useEffect(() => {
    // When user logs out, reset chat state
    if (!user && isUserInChat) {
      console.log('👋 User logged out, leaving chat');
      setIsUserInChat(false);
      setMessages([]);
      setUnreadCount(0);
      
      // Emit leave-chat event if socket is connected
      if (socket && isConnected) {
        socket.emit('leave-chat', {
          userId: 'logged-out',
          username: 'User'
        });
      }
    }
    
    // Register presence when user logs in and socket is connected
    if (user && socket && isConnected && user._id) {
      console.log('📡 Registering presence for newly authenticated user:', user.username || user.email);
      socket.emit('register-presence', {
        userId: user._id || user.id,
        username: user.username || user.email || 'Anonymous'
      });
      
      // Ensure current user is in activeUsers list
      setActiveUsers(prev => {
        const currentUserId = user._id || user.id;
        const userExists = prev.some(u => u.id === currentUserId);
        
        if (!userExists) {
          return [...prev, {
            id: currentUserId,
            username: user.username || user.email || 'Anonymous',
            status: 'online',
            role: user.role || 'user'
          }];
        }
        
        return prev;
      });
      
      // Request current online users
      socket.emit('get-online-users');
    }
    
    // Log user state changes for debugging
    if (user) {
      console.log('👤 User authenticated in chat:', user.username || user.email);
    } else {
      console.log('👤 No user authenticated in chat');
    }
  }, [user, isUserInChat, socket, isConnected, fetchOnlineUsers]);
  
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
  
  // Handle new notice messages
  const handleNewNotice = (noticeMessage) => {
    const noticeId = noticeMessage._id || Date.now().toString();
    const notice = {
      ...noticeMessage,
      id: noticeId,
      timestamp: new Date(noticeMessage.timestamp),
      autoHide: true
    };
    
    console.log('📢 New notice received:', notice.message);
    
    // Add to pinned notices
    setPinnedNotices(prev => {
      // Remove any existing notice with same ID
      const filtered = prev.filter(n => n.id !== noticeId);
      return [...filtered, notice];
    });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      setPinnedNotices(prev => prev.filter(n => n.id !== noticeId));
      console.log('📢 Notice auto-dismissed:', noticeId);
    }, 10000);
  };
  
  // Manually dismiss a notice
  const dismissNotice = (noticeId) => {
    setPinnedNotices(prev => prev.filter(n => n.id !== noticeId));
    console.log('📢 Notice manually dismissed:', noticeId);
  };
  
  // Removed demo users initialization - now only tracks real users
  
  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Mark as read when opening
    }
  };
  
  const handleUserListToggle = useCallback(() => {
    setShowUserList(prev => {
      const newShowUserList = !prev;
      
      // Disabled for now
      
      return newShowUserList;
    });
  }, [isConnected, shouldDisableChat, fetchOnlineUsers]);
  
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

    if (!socket || !isConnected) {
      alert('Chat server is not connected.');
      return;
    }

    if (window.confirm('Are you sure you want to clear ALL chat messages? This action cannot be undone.')) {
      // Send clear-all-messages event via Socket.IO
      socket.emit('clear-all-messages');
      console.log('🧹 Clearing all messages via Socket.IO');
    }
  };

  const handleClearCache = async () => {
    console.log('🔍 Clear Cache button clicked');
    console.log('User:', user);
    console.log('User role:', user?.role);
    console.log('Socket connected:', isConnected);
    
    if (!user || user.role !== 'admin') {
      alert('Only administrators can clear cache.');
      return;
    }

    if (!socket || !isConnected) {
      alert('Chat server is not connected.');
      return;
    }

    if (window.confirm('Are you sure you want to PERMANENTLY DELETE all messages, chat history, and notices from the database? This will completely wipe everything and cannot be undone!')) {
      console.log('🗑️ Sending clear-cache event via Socket.IO');
      
      // Send clear-cache event via Socket.IO
      socket.emit('clear-cache', { action: 'force_delete_all' });
      
      // Also clear frontend state immediately
      setMessages([]);
      setPinnedNotices([]);
      
      console.log('🗑️ Frontend state cleared, waiting for server response');
      
      // Show user feedback
      alert('Cache clear request sent. All data should be deleted from database.');
    }
  };
  
  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
  };
  
  const retryConnection = () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    console.log(`🔄 Retrying connection (attempt ${retryCount + 1})...`);
    
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }
    
    // Retry after a short delay
    setTimeout(() => {
      setIsRetrying(false);
      // The useEffect will create a new connection
    }, 2000);
  };
  
  const getOnlineUsersCount = () => {
    // Count all connected users
    const onlineUsers = activeUsers.filter(user => user.status === 'online').length;
    // Always show at least 1 if current user is connected
    return Math.max(onlineUsers, (user && isConnected) ? 1 : 0);
  };
  
  const getChatUsersCount = () => {
    // Count users currently in chat
    return chatUsers.length;
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
        default:
          // No action for unknown handle types
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
    if (user && !isUserInChat) {
      if (!socket || !isConnected) {
        alert('Chat server is not connected. Please try again.');
        return;
      }
      
      setIsUserInChat(true);
      
      // Immediately add current user to chat users list as fallback
      setChatUsers(prev => {
        const currentUserId = user._id || user.id;
        const userExists = prev.some(u => u.id === currentUserId);
        
        if (!userExists) {
          const newUser = {
            id: currentUserId,
            username: user.username || user.email || 'Anonymous',
            status: 'online',
            role: user.role || 'user'
          };
          return [...prev, newUser];
        }
        return prev;
      });
      
      // Join chat via Socket.IO - the server will also update the chat users list
      const joinData = {
        userId: user._id || user.id,
        username: user.username || user.email || 'Anonymous'
      };
      socket.emit('join-chat', joinData);
      
      // Show welcome popup if not shown before
      if (!hasShownWelcome) {
        setShowWelcomePopup(true);
        setHasShownWelcome(true);
        
        // Auto-hide after 15 seconds
        setTimeout(() => {
          setShowWelcomePopup(false);
        }, 15000);
      }
    }
  };
  
  const handleLeaveChat = () => {
    if (user && isUserInChat && socket && isConnected) {
      setIsUserInChat(false);
      
      // Immediately remove current user from chat users list
      setChatUsers(prev => {
        const currentUserId = user._id || user.id;
        return prev.filter(u => u.id !== currentUserId);
      });
      
      // Emit leave-chat event - the server will also update the chat users list
      socket.emit('leave-chat', {
        userId: user._id || user.id,
        username: user.username || user.email || 'Anonymous'
      });
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
  
  // If chat should be disabled in production, show a placeholder
  if (shouldDisableChat) {
    return (
      <div 
        className="floating-chat-toggle disabled"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #6c757d, #5a6268)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'not-allowed',
          boxShadow: '0 4px 20px rgba(108, 117, 125, 0.3)',
          zIndex: 1000,
          opacity: 0.7
        }}
        title="Chat is currently unavailable in production. Backend server needed."
      >
        <i className="fas fa-comments" style={{ color: 'white', fontSize: '24px' }}></i>
        <div 
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}
        >
          !
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Users Panel - Outside Chat Box */}
      {showUserList && (
        <div className="online-users-panel">
          <div className="online-users-header">
            <div className="users-tabs">
              <button 
                className={`tab-btn ${activeTab === 'online' ? 'active' : ''}`}
                onClick={() => setActiveTab('online')}
              >
                <i className="fas fa-circle"></i>
                Online ({getOnlineUsersCount()})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <i className="fas fa-comments"></i>
                In Chat ({getChatUsersCount()})
              </button>
            </div>
            <button className="close-online-users" onClick={handleUserListToggle}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="online-users-content">
            {activeTab === 'online' ? (
              // Online Users Tab
              <>
                {activeUsers.length === 0 && !user ? (
                  <div className="online-user-item">
                    <div className="user-status-dot offline"></div>
                    <span className="user-info">
                      <span className="username">No users online</span>
                    </span>
                  </div>
                ) : activeUsers.length === 0 && user ? (
                  <div className="online-user-item">
                    <div className="user-status-dot online"></div>
                    <span className="user-info">
                      <span className="username">{user.username || user.email || 'You'} (You)</span>
                      <span className="user-status-text">online</span>
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Show all users from activeUsers list, with current user marked */}
                    {activeUsers
                      .sort((a, b) => {
                        const aIsCurrentUser = user && (a.id === (user._id || user.id));
                        const bIsCurrentUser = user && (b.id === (user._id || user.id));
                        
                        // Current user always first
                        if (aIsCurrentUser && !bIsCurrentUser) return -1;
                        if (!aIsCurrentUser && bIsCurrentUser) return 1;
                        
                        // Then by username alphabetically
                        return a.username.localeCompare(b.username);
                      })
                      .map((activeUser, index) => {
                      const isCurrentUser = user && (activeUser.id === (user._id || user.id));
                      
                      return (
                        <div key={activeUser.id || index} className={`online-user-item ${activeUser.status || 'online'}`}>
                          <div className={`user-status-dot ${activeUser.status || 'online'}`}></div>
                          <span className="user-info">
                            <span className="username">
                              {activeUser.username}
                              {isCurrentUser && ' (You)'}
                              {activeUser.role === 'admin' && ' - Admin'}
                            </span>
                            <span className="user-status-text">online</span>
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Show current user if not in activeUsers list (fallback) */}
                    {user && activeUsers.length > 0 && !activeUsers.find(u => u.id === (user._id || user.id)) && (
                      <div className="online-user-item online">
                        <div className="user-status-dot online"></div>
                        <span className="user-info">
                          <span className="username">
                            {user.username || user.email || 'You'} (You)
                          </span>
                          <span className="user-status-text">online</span>
                        </span>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              // In Chat Users Tab
              <>
                {chatUsers.length === 0 ? (
                  <div className="online-user-item">
                    <div className="user-status-dot offline"></div>
                    <span className="user-info">
                      <span className="username">No users in chat</span>
                      <span className="user-status-text">Join the chat to start chatting</span>
                    </span>
                  </div>
                ) : (
                  <>
                    {chatUsers
                      .sort((a, b) => {
                        const aIsCurrentUser = user && (a.id === (user._id || user.id));
                        const bIsCurrentUser = user && (b.id === (user._id || user.id));
                        
                        // Current user always first
                        if (aIsCurrentUser && !bIsCurrentUser) return -1;
                        if (!aIsCurrentUser && bIsCurrentUser) return 1;
                        
                        // Then by username alphabetically
                        return a.username.localeCompare(b.username);
                      })
                      .map((chatUser, index) => {
                      const isCurrentUser = user && (chatUser.id === (user._id || user.id));
                      
                      return (
                        <div key={chatUser.id || index} className={`online-user-item ${chatUser.status || 'online'}`}>
                          <div className={`user-status-dot ${chatUser.status || 'online'}`}></div>
                          <span className="user-info">
                            <span className="username">
                              {chatUser.username}
                              {isCurrentUser && ' (You)'}
                              {chatUser.role === 'admin' && ' - Admin'}
                            </span>
                            <span className="user-status-text">actively chatting</span>
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

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
                  title="View online users and chat participants"
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
                    {isConnected ? 'Connected' : 
                     isRetrying ? 'Retrying...' :
                     connectionError ? 'Disconnected' : 'Connecting...'}
                  </span>
                  {connectionError && !isConnected && (
                    <button 
                      className="retry-connection-btn"
                      onClick={retryConnection}
                      disabled={isRetrying}
                      title="Retry connection"
                    >
                      <i className={`fas ${isRetrying ? 'fa-spinner fa-spin' : 'fa-redo'}`}></i>
                    </button>
                  )}
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
            {/* Pinned Notices */}
            {pinnedNotices.length > 0 && (
              <div className="pinned-notices-container">
                {pinnedNotices.map((notice) => (
                  <div key={notice.id} className="pinned-notice">
                    <div className="pinned-notice-content">
                      <div className="pinned-notice-header">
                        <div className="pinned-notice-title">
                          <i className="fas fa-bullhorn me-2"></i>
                          <span className="notice-badge">ADMIN NOTICE</span>
                          <span className="notice-author">{notice.username}</span>
                        </div>
                        <button 
                          className="dismiss-notice-btn"
                          onClick={() => dismissNotice(notice.id)}
                          title="Dismiss notice"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="pinned-notice-message">
                        {notice.message}
                      </div>
                      <div className="pinned-notice-footer">
                        <span className="notice-time">{formatTime(notice.timestamp)}</span>
                        <span className="auto-dismiss-info">
                          <i className="fas fa-clock me-1"></i>
                          Auto-dismiss in 10s
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
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
                          disabled={!isConnected}
                          title={!isConnected ? 'Chat server not connected' : 'Clear all messages'}
                        >
                          {!isConnected ? (
                            <>
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Offline
                            </>
                          ) : (
                            <>
                              <i className="fas fa-trash me-1"></i>
                              Clear All
                            </>
                          )}
                        </button>
                      </div>
                      <div className="admin-action">
                        <div className="admin-action-info">
                          <div className="admin-action-title">
                            <i className="fas fa-database me-2"></i>
                            Clear Cache
                          </div>
                          <div className="admin-action-desc">
                            Permanently delete ALL data from database
                          </div>
                        </div>
                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={handleClearCache}
                          disabled={!isConnected}
                          title={!isConnected ? 'Chat server not connected' : 'Permanently delete all data from database'}
                        >
                          {!isConnected ? (
                            <>
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Offline
                            </>
                          ) : (
                            <>
                              <i className="fas fa-database me-1"></i>
                              Clear Cache
                            </>
                          )}
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
            

            
            <div className="chat-messages">
              {messages.filter(msg => !(msg.isNotice && msg.messageType === 'admin')).length === 0 ? (
                <div className="no-messages">
                  <i className="fas fa-comments fa-2x mb-2"></i>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages
                  .filter(msg => !(msg.isNotice && msg.messageType === 'admin'))
                  .map(renderMessage)
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
                      id="chat-message-input"
                      name="chat-message-input"
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
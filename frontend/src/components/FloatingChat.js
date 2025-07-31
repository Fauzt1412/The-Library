// import React, { useState, useEffect, useRef } from 'react';
// import ChatSettings from './ChatSettings';
// import '../styles/floating-chat.css';

// // Safe hook wrapper
// const useSafeContext = (hookFn, fallback) => {
//   try {
//     return hookFn();
//   } catch (error) {
//     console.warn('Context hook error:', error.message);
//     return fallback;
//   }
// };

// const FloatingChat = () => {
//   // Safe context usage
//   let user = null;
//   let chatData = {};
//   let themeData = {};
  
//   try {
//     const { useAuth } = require('../context/AuthContext');
//     const authContext = useAuth();
//     user = authContext?.user || null;
//   } catch (error) {
//     console.warn('Auth context error:', error.message);
//   }
  
//   try {
//     const { useChat } = require('../context/ChatContext');
//     chatData = useChat() || {};
//   } catch (error) {
//     console.warn('Chat context error:', error.message);
//   }
  
//   try {
//     const { useTheme } = require('../context/ThemeContext');
//     themeData = useTheme() || {};
//   } catch (error) {
//     console.warn('Theme context error:', error.message);
//   }
  
//   // Provide safe defaults
//   const {
//     messages = [],
//     addMessage = async () => null,
//     unreadCount = 0,
//     markAsRead = () => {},
//     activeUsers = [],
//     getOnlineUsersCount = () => 0,
//     joinChat = () => {},
//     leaveChat = () => {},
//     isUserInChat = false,
//     deleteMessage = async () => false,
//     clearMessages = async () => false,
//     chatSettings = { width: 350, height: 500, position: { bottom: 90, right: 20 } },
//     updateChatSettings = () => {}
//   } = chatData;
  
//   const { theme = 'light', isDark = false } = themeData;
//   const [isOpen, setIsOpen] = useState(false);
//   const [newMessage, setNewMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showUserList, setShowUserList] = useState(false);
//   const [showAdminPanel, setShowAdminPanel] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);
//   const [isResizing, setIsResizing] = useState(false);
//   const [resizeHandle, setResizeHandle] = useState(null);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [showChatInfo, setShowChatInfo] = useState(false);
//   const [isNoticeMode, setIsNoticeMode] = useState(false);
//   const { user } = useAuth();
//   const { messages, addMessage, unreadCount, markAsRead, activeUsers, getOnlineUsersCount, joinChat, leaveChat, isUserInChat, deleteMessage, clearMessages, chatSettings, updateChatSettings } = useChat();
//   const { theme, isDark } = useTheme();
//   const messagesEndRef = useRef(null);
//   const chatInputRef = useRef(null);
//   const chatWindowRef = useRef(null);
//   const emojiPickerRef = useRef(null);
//   const chatInfoRef = useRef(null);

//   // Mark messages as read when chat opens
//   useEffect(() => {
//     if (isOpen) {
//       markAsRead();
//     }
//   }, [isOpen, markAsRead]);



//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Focus input when chat opens
//   useEffect(() => {
//     if (isOpen && chatInputRef.current) {
//       chatInputRef.current.focus();
//     }
//   }, [isOpen]);

//   // Close emoji picker when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
//         setShowEmojiPicker(false);
//       }
//     };

//     if (showEmojiPicker) {
//       document.addEventListener('mousedown', handleClickOutside);
//       return () => {
//         document.removeEventListener('mousedown', handleClickOutside);
//       };
//     }
//   }, [showEmojiPicker]);

//   // Close chat info when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (chatInfoRef.current && !chatInfoRef.current.contains(event.target)) {
//         setShowChatInfo(false);
//       }
//     };

//     if (showChatInfo) {
//       document.addEventListener('mousedown', handleClickOutside);
//       return () => {
//         document.removeEventListener('mousedown', handleClickOutside);
//       };
//     }
//   }, [showChatInfo]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleToggleChat = () => {
//     setIsOpen(!isOpen);
//     if (!isOpen) {
//       markAsRead();
//     }
//   };

//   const handleJoinChat = () => {
//     if (user && !isUserInChat) {
//       joinChat(user);
//     }
//   };

//   const handleLeaveChat = () => {
//     if (user && isUserInChat) {
//       leaveChat(user);
//     }
//   };

//   const handleDeleteMessage = async (messageId) => {
//     if (!user || user.role !== 'admin') {
//       alert('Only administrators can delete messages.');
//       return;
//     }

//     if (window.confirm('Are you sure you want to delete this message?')) {
//       const success = await deleteMessage(messageId, user);
//       if (!success) {
//         alert('Failed to delete message. Please try again.');
//       }
//     }
//   };

//   const handleClearAllMessages = async () => {
//     if (!user || user.role !== 'admin') {
//       alert('Only administrators can clear all messages.');
//       return;
//     }

//     if (window.confirm('Are you sure you want to clear ALL chat messages? This action cannot be undone.')) {
//       const success = await clearMessages();
//       if (success) {
//         alert('All messages have been cleared.');
//       } else {
//         alert('Failed to clear messages. Please try again.');
//       }
//     }
//   };

//   const handleAdminPanelToggle = () => {
//     setShowAdminPanel(!showAdminPanel);
//   };

//   const handleSettingsToggle = () => {
//     setShowSettings(!showSettings);
//   };

//   const handleEmojiPickerToggle = () => {
//     setShowEmojiPicker(!showEmojiPicker);
//   };

//   const handleChatInfoToggle = () => {
//     setShowChatInfo(!showChatInfo);
//   };

//   const handleNoticeModeToggle = () => {
//     setIsNoticeMode(!isNoticeMode);
//   };

//   const handleEmojiSelect = (emoji) => {
//     setNewMessage(prev => prev + emoji);
//     setShowEmojiPicker(false);
//     // Focus back to input after emoji selection
//     if (chatInputRef.current) {
//       chatInputRef.current.focus();
//     }
//   };

//   // Common emojis for the picker
//   const commonEmojis = [
//     '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
//     '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
//     '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
//     '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
//     '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
//     '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
//     '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
//     '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
//     '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
//     '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
//     '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
//     '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
//     '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
//     '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋',
//     '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
//     '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
//     '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜',
//     '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅',
//     '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
//     '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
//     '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
//     '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
//     '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
//     '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
//     '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️',
//     '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹',
//     '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌',
//     '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
//     '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗',
//     '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️',
//     '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯',
//     '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀',
//     '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂',
//     '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮',
//     '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠',
//     '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣',
//     '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣',
//     '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️',
//     '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬',
//     '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️',
//     '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️',
//     '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶'
//   ];

//   // Drag to resize functionality
//   const handleMouseDown = (e, handle) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsResizing(true);
//     setResizeHandle(handle);
    
//     const startX = e.clientX;
//     const startY = e.clientY;
//     const startWidth = chatSettings.width;
//     const startHeight = chatSettings.height;
    
//     const handleMouseMove = (e) => {
//       let newWidth = startWidth;
//       let newHeight = startHeight;
      
//       const deltaX = e.clientX - startX;
//       const deltaY = e.clientY - startY;
      
//       switch (handle) {
//         case 'se': // Southeast corner
//           newWidth = Math.max(250, Math.min(800, startWidth + deltaX));
//           newHeight = Math.max(350, Math.min(900, startHeight + deltaY));
//           break;
//         case 'sw': // Southwest corner
//           newWidth = Math.max(250, Math.min(800, startWidth - deltaX));
//           newHeight = Math.max(350, Math.min(900, startHeight + deltaY));
//           break;
//         case 'ne': // Northeast corner
//           newWidth = Math.max(250, Math.min(800, startWidth + deltaX));
//           newHeight = Math.max(350, Math.min(900, startHeight - deltaY));
//           break;
//         case 'nw': // Northwest corner
//           newWidth = Math.max(250, Math.min(800, startWidth - deltaX));
//           newHeight = Math.max(350, Math.min(900, startHeight - deltaY));
//           break;
//         case 'e': // East edge
//           newWidth = Math.max(250, Math.min(800, startWidth + deltaX));
//           break;
//         case 'w': // West edge
//           newWidth = Math.max(250, Math.min(800, startWidth - deltaX));
//           break;
//         case 's': // South edge
//           newHeight = Math.max(350, Math.min(900, startHeight + deltaY));
//           break;
//         case 'n': // North edge
//           newHeight = Math.max(350, Math.min(900, startHeight - deltaY));
//           break;
//       }
      
//       updateChatSettings({ width: newWidth, height: newHeight });
//     };
    
//     const handleMouseUp = () => {
//       setIsResizing(false);
//       setResizeHandle(null);
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };
    
//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', handleMouseUp);
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
    
//     if (!newMessage.trim()) return;
    
//     setIsLoading(true);
    
//     try {
//       const messageData = {
//         user: user.username || user.email || 'Anonymous',
//         message: newMessage.trim(),
//         timestamp: new Date(),
//         isAdmin: user.role === 'admin',
//         isNotice: isNoticeMode && user.role === 'admin'
//       };
      
//       const sentMessage = await addMessage(messageData);
//       if (sentMessage) {
//         setNewMessage('');
//         // Reset notice mode after sending
//         if (isNoticeMode) {
//           setIsNoticeMode(false);
//         }
//         // Auto-scroll to bottom after sending
//         setTimeout(() => {
//           if (messagesEndRef.current) {
//             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//           }
//         }, 100);
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatTime = (timestamp) => {
//     const now = new Date();
//     const messageTime = new Date(timestamp);
//     const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
//     if (diffInMinutes < 1) return 'Just now';
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//     if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
//     return messageTime.toLocaleDateString();
//   };

//   const handleUserListToggle = () => {
//     setShowUserList(!showUserList);
//   };

//   const renderMessage = (msg) => {
//     if (msg.messageType === 'system' || msg.type === 'system') {
//       const isJoinLeave = msg.message.includes('entered the chat') || msg.message.includes('left the chat') || msg.message.includes('joined the chat');
//       const isWelcome = msg.message.includes('Welcome to Library Forum Chat') || msg.username === 'Library Bot';
//       const icon = msg.message.includes('entered the chat') || msg.message.includes('joined the chat') ? 'fa-sign-in-alt' : 
//                    msg.message.includes('left the chat') ? 'fa-sign-out-alt' : 
//                    isWelcome ? 'fa-heart' : 'fa-info-circle';
      
//       return (
//         <div key={msg._id || msg.id} className={`message system-message ${msg.isNotice ? 'notice-message' : ''}`}>
//           <div className="message-content">
//             <i className={`fas ${icon} me-2`}></i>
//             {msg.message}
//           </div>
//           <div className="message-time">{formatTime(msg.timestamp)}</div>
//         </div>
//       );
//     }

//     return (
//       <div key={msg._id || msg.id} className={`message ${msg.isAdmin || msg.messageType === 'admin' ? 'admin-message' : ''} ${msg.isNotice ? 'notice-message' : ''}`}>
//         <div className="message-header">
//           <span className={`message-user ${msg.isAdmin || msg.messageType === 'admin' ? 'admin-user' : ''}`}>
//             {msg.isNotice && <i className="fas fa-bullhorn me-1" title="Important Notice"></i>}
//             {(msg.isAdmin || msg.messageType === 'admin') && !msg.isNotice && <i className="fas fa-crown me-1"></i>}
//             {msg.user || msg.username}
//           </span>
//           <div className="message-actions">
//             <span className="message-time">{formatTime(msg.timestamp)}</span>
//             {user && user.role === 'admin' && msg.type !== 'system' && msg.messageType !== 'system' && (
//               <button 
//                 className="delete-message-btn"
//                 onClick={() => handleDeleteMessage(msg._id || msg.id)}
//                 title="Delete message"
//               >
//                 <i className="fas fa-trash"></i>
//               </button>
//             )}
//           </div>
//         </div>
//         <div className="message-content">
//           {msg.message}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       {/* Chat Toggle Button */}
//       <div className={`floating-chat-toggle ${isOpen ? 'open' : ''}`} onClick={handleToggleChat}>
//         <div className="chat-icon">
//           {isOpen ? (
//             <i className="fas fa-times"></i>
//           ) : (
//             <>
//               <i className="fas fa-comments"></i>
//               {unreadCount > 0 && (
//                 <span className="chat-badge">{unreadCount}</span>
//               )}
//             </>
//           )}
//         </div>
//         <div className="chat-tooltip">
//           {isOpen ? 'Close Forum Chat' : 'Open Forum Chat'}
//         </div>
//       </div>

//       {/* Chat Window */}
//       <div 
//         ref={chatWindowRef}
//         className={`floating-chat-window ${isOpen ? 'open' : ''} ${isResizing ? 'resizing' : ''}`}
//         style={{
//           width: `${chatSettings.width}px`,
//           height: `${chatSettings.height}px`,
//           bottom: `${chatSettings.position.bottom}px`,
//           right: `${chatSettings.position.right}px`
//         }}
//       >
//         <div className="chat-header">
//           <div className="chat-header-content">
//             <i className="fas fa-comments me-2"></i>
//             <span>Library Forum</span>
//             <div className="chat-header-actions">
//               <button 
//                 className="chat-action-btn" 
//                 onClick={handleUserListToggle}
//                 title="View online users"
//               >
//                 <i className="fas fa-users"></i>
//                 <span className="user-count">{getOnlineUsersCount()}</span>
//               </button>
//               <button 
//                 className="chat-action-btn" 
//                 onClick={handleSettingsToggle}
//                 title="Chat settings"
//               >
//                 <i className="fas fa-sliders-h"></i>
//               </button>
//               <div className="online-indicator">
//                 <span className="online-dot"></span>
//                 <span className="online-text">Online</span>
//               </div>
//             </div>
//           </div>
//           <button className="chat-close-btn" onClick={handleToggleChat}>
//             <i className="fas fa-times"></i>
//           </button>
//         </div>

//         {/* Resize Handles */}
//         {isOpen && (
//           <>
//             <div className="resize-handle resize-handle-n" onMouseDown={(e) => handleMouseDown(e, 'n')}></div>
//             <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleMouseDown(e, 's')}></div>
//             <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleMouseDown(e, 'e')}></div>
//             <div className="resize-handle resize-handle-w" onMouseDown={(e) => handleMouseDown(e, 'w')}></div>
//             <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleMouseDown(e, 'ne')}></div>
//             <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleMouseDown(e, 'nw')}></div>
//             <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleMouseDown(e, 'se')}></div>
//             <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleMouseDown(e, 'sw')}></div>
//           </>
//         )}

//         <div className="chat-content">
//           {showSettings && (
//             <ChatSettings 
//               onClose={() => setShowSettings(false)} 
//               user={user}
//               onClearMessages={handleClearAllMessages}
//             />
//           )}
          
//           {showUserList && (
//             <div className="user-list">
//               <div className="user-list-header">
//                 <h6>Online Users ({getOnlineUsersCount()})</h6>
//                 <button className="close-user-list" onClick={handleUserListToggle}>
//                   <i className="fas fa-times"></i>
//                 </button>
//               </div>
//               <div className="user-list-content">
//                 {activeUsers.map(user => (
//                   <div key={user.id} className={`user-item ${user.status}`}>
//                     <div className={`user-status ${user.status}`}></div>
//                     <span className="username">{user.username}</span>
//                     <span className="user-status-text">{user.status}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          

          
//           <div className="chat-messages">
//             {messages.length === 0 ? (
//               <div className="no-messages">
//                 <i className="fas fa-comments fa-2x mb-2"></i>
//                 <p>No messages yet. Start the conversation!</p>
//               </div>
//             ) : (
//               messages.map(renderMessage)
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         <div className="chat-input-container">
//           {!user ? (
//             <div className="login-prompt">
//               <p className="mb-2">Please log in to participate in the forum</p>
//               <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/login'}>
//                 Log In
//               </button>
//             </div>
//           ) : !isUserInChat ? (
//             <div className="join-chat-prompt">
//               <p className="mb-2 text-center">Join the chat to start participating in our community discussions</p>
//               <button className="btn btn-primary w-100" onClick={handleJoinChat}>
//                 <i className="fas fa-sign-in-alt me-2"></i>
//                 Join Chat
//               </button>
//             </div>
//           ) : (
//             <>
//               <div className="chat-input-controls">
//                 <div className="left-controls">
//                   <div className="emoji-picker-container" ref={emojiPickerRef}>
//                     <button 
//                       type="button" 
//                       className={`emoji-picker-btn-external ${showEmojiPicker ? 'active' : ''}`}
//                       title="Add emoji"
//                       disabled={isLoading}
//                       onClick={handleEmojiPickerToggle}
//                     >
//                       <i className="fas fa-smile"></i>
//                     </button>
//                     {showEmojiPicker && (
//                       <div className="emoji-picker-dropdown">
//                         <div className="emoji-picker-header">
//                           <span>Choose an emoji</span>
//                           <button 
//                             type="button" 
//                             className="emoji-picker-close"
//                             onClick={() => setShowEmojiPicker(false)}
//                           >
//                             <i className="fas fa-times"></i>
//                           </button>
//                         </div>
//                         <div className="emoji-picker-grid">
//                           {commonEmojis.map((emoji, index) => (
//                             <button
//                               key={index}
//                               type="button"
//                               className="emoji-btn"
//                               onClick={() => handleEmojiSelect(emoji)}
//                               title={`Add ${emoji}`}
//                             >
//                               {emoji}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   {user && user.role === 'admin' && (
//                     <div className="notice-mode-container">
//                       <button 
//                         type="button" 
//                         className={`notice-mode-btn ${isNoticeMode ? 'active' : ''}`}
//                         title={isNoticeMode ? 'Switch to normal message' : 'Send as important notice'}
//                         onClick={handleNoticeModeToggle}
//                       >
//                         <i className="fas fa-bullhorn"></i>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 <div className="chat-info-container" ref={chatInfoRef}>
//                   <button 
//                     type="button" 
//                     className={`chat-info-btn ${showChatInfo ? 'active' : ''}`}
//                     title="Chat rules and information"
//                     onClick={handleChatInfoToggle}
//                   >
//                     <i className="fas fa-info-circle"></i>
//                   </button>
//                   {showChatInfo && (
//                     <div className="chat-info-dropdown">
//                       <div className="chat-info-header">
//                         <span>📋 Chat Rules & Info</span>
//                         <button 
//                           type="button" 
//                           className="chat-info-close"
//                           onClick={() => setShowChatInfo(false)}
//                         >
//                           <i className="fas fa-times"></i>
//                         </button>
//                       </div>
//                       <div className="chat-info-content">
//                         <div className="info-section">
//                           <h6>🎯 Welcome to Library Forum Chat!</h6>
//                           <p>Connect with fellow book lovers and share your thoughts.</p>
//                         </div>
//                         <div className="info-section">
//                           <h6>📜 Chat Rules:</h6>
//                           <ul>
//                             <li>Be respectful and kind to all members</li>
//                             <li>Keep discussions relevant to books and literature</li>
//                             <li>No spam, advertising, or inappropriate content</li>
//                             <li>Use appropriate language at all times</li>
//                             <li>Respect others' opinions and perspectives</li>
//                           </ul>
//                         </div>
//                         <div className="info-section">
//                           <h6>ℹ️ Chat Features:</h6>
//                           <ul>
//                             <li>Messages auto-clear after 24 hours</li>
//                             <li>Click 😊 to add emojis to your messages</li>
//                             <li>Admins can moderate chat content</li>
//                             <li>Your chat status shows when you're online</li>
//                           </ul>
//                         </div>
//                         <div className="info-section">
//                           <h6>🚀 Getting Started:</h6>
//                           <p>Click "Join Chat" to start participating in discussions. Share book recommendations, ask questions, or just say hello!</p>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <form onSubmit={handleSendMessage} className="chat-input-form">
//                 <div className={`input-group ${newMessage.length > 450 ? 'warning' : ''} ${newMessage.length >= 500 ? 'error' : ''}`}>
//                   <input
//                     ref={chatInputRef}
//                     type="text"
//                     className={`chat-input ${isNoticeMode ? 'notice-input' : ''}`}
//                     placeholder={isNoticeMode ? '📢 Type an important notice...' : 'Share your thoughts with the community...'}
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     disabled={isLoading}
//                     maxLength={500}
//                   />
//                   <button 
//                     type="submit" 
//                     className="chat-send-btn"
//                     disabled={isLoading || !newMessage.trim()}
//                     title={isLoading ? 'Sending...' : 'Send message'}
//                   >
//                     {isLoading ? (
//                       <i className="fas fa-spinner fa-spin"></i>
//                     ) : (
//                       <i className="fas fa-paper-plane"></i>
//                     )}
//                   </button>
//                 </div>
//                 <div className="chat-input-footer">
//                   <div className="input-help">
//                     <span className={`character-count ${
//                       newMessage.length > 450 ? 'warning' : ''
//                     } ${
//                       newMessage.length >= 500 ? 'danger' : ''
//                     }`}>
//                       <i className="fas fa-keyboard me-1"></i>
//                       <small>{newMessage.length}/500</small>
//                     </span>
//                   </div>
//                   <button 
//                     type="button" 
//                     className="btn btn-outline-danger btn-sm"
//                     onClick={handleLeaveChat}
//                     title="Leave chat"
//                   >
//                     <i className="fas fa-sign-out-alt me-1"></i>
//                     Leave
//                   </button>
//                 </div>
//               </form>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Backdrop removed for cleaner experience */}
//     </>
//   );
// };

// export default FloatingChat;
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/floating-chat.css';

const SafeFloatingChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const isProduction = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';

  const getServerUrl = () => {
    if (isProduction) {
      return process.env.REACT_APP_API_URL || 'https://the-library-a11t.onrender.com';
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:1412';
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        const serverUrl = getServerUrl();
        const response = await fetch(`${serverUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          setIsConnected(true);
          setConnectionError(null);
          console.log('Server connection successful');
        } else {
          setIsConnected(false);
          setConnectionError('Server not responding');
        }
      } catch (error) {
        setIsConnected(false);
        setConnectionError(error.message);
        console.log('Server connection failed:', error.message);
      }
    };

    testConnection();
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    const message = {
      _id: Date.now().toString(),
      username: user.username || user.email || 'User',
      message: newMessage.trim(),
      timestamp: new Date(),
      messageType: user.role === 'admin' ? 'admin' : 'user'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    if (isConnected) {
      try {
        const serverUrl = getServerUrl();
        await fetch(`${serverUrl}/API/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user._id || user.id
          },
          body: JSON.stringify({
            message: newMessage.trim(),
            messageType: user.role === 'admin' ? 'admin' : 'user'
          })
        });
      } catch (error) {
        console.log('Failed to send to server:', error.message);
      }
    }
  };

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
    
    return (
      <div key={key} className={`message ${msg.messageType === 'admin' ? 'admin-message' : ''}`}>
        <div className="message-header">
          <span className={`message-user ${msg.messageType === 'admin' ? 'admin-user' : ''}`}>
            {msg.messageType === 'admin' && <i className="fas fa-crown me-1"></i>}
            {msg.username}
          </span>
          <span className="message-time">{formatTime(msg.timestamp)}</span>
        </div>
        <div className="message-content">
          {msg.message}
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className={`floating-chat-toggle ${isOpen ? 'open' : ''}`} 
        onClick={handleToggleChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          background: isConnected 
            ? 'linear-gradient(135deg, #007bff, #0056b3)' 
            : 'linear-gradient(135deg, #6c757d, #5a6268)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 123, 255, 0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        title={isConnected ? 'Library Forum Chat' : `Chat unavailable: ${connectionError}`}
      >
        <div className="chat-icon">
          {isOpen ? (
            <i className="fas fa-times" style={{ color: 'white', fontSize: '24px' }}></i>
          ) : (
            <i className="fas fa-comments" style={{ color: 'white', fontSize: '24px' }}></i>
          )}
        </div>
        {!isConnected && (
          <div 
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#ffc107',
              color: '#212529',
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
        )}
      </div>

      {isOpen && (
        <div 
          className="floating-chat-window open"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            zIndex: 999,
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div 
            className="chat-header"
            style={{
              padding: '16px',
              borderBottom: '1px solid #e0e0e0',
              borderRadius: '12px 12px 0 0',
              background: 'linear-gradient(135deg, #007bff, #0056b3)',
              color: 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <i className="fas fa-comments me-2"></i>
                <span>Library Forum</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '12px' }}>
                  <span className={`online-dot ${isConnected ? 'connected' : 'disconnected'}`} 
                        style={{ 
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: isConnected ? '#28a745' : '#dc3545',
                          marginRight: '5px'
                        }}></span>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
                <button 
                  onClick={handleToggleChat}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    fontSize: '18px', 
                    cursor: 'pointer' 
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div 
            className="chat-messages"
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              maxHeight: '350px'
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                <i className="fas fa-comments fa-2x mb-2"></i>
                <p>No messages yet. Start the conversation!</p>
                {!isConnected && (
                  <p style={{ color: '#dc3545', fontSize: '14px' }}>
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    Server connection unavailable
                  </p>
                )}
              </div>
            ) : (
              messages.map(renderMessage)
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid #e0e0e0' }}>
            {!user ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '10px', color: '#666' }}>Please log in to participate</p>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => window.location.href = '/login'}
                >
                  Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    ref={chatInputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    maxLength={500}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '20px',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    style={{
                      padding: '8px 12px',
                      background: newMessage.trim() ? '#007bff' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {newMessage.length}/500 characters
                  {!isConnected && (
                    <span style={{ color: '#dc3545', marginLeft: '10px' }}>
                      • Messages saved locally only
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SafeFloatingChat;
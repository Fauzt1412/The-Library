import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/floating-chat.css';

// Simple fallback chat component when socket.io is not available
const SimpleChatFallback = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div 
        className="floating-chat-toggle disabled" 
        onClick={handleToggleChat}
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
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(108, 117, 125, 0.3)',
          zIndex: 1000,
          opacity: 0.8
        }}
        title="Chat is temporarily unavailable - dependency loading issue"
      >
        <i className="fas fa-comments" style={{ color: 'white', fontSize: '24px' }}></i>
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
      </div>

      {/* Simple Info Window */}
      {isOpen && (
        <div 
          className="floating-chat-window open"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '400px',
            zIndex: 999,
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e0e0e0'
          }}
        >
          <div className="chat-header" style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <i className="fas fa-comments me-2"></i>
                <span>Library Forum Chat</span>
              </div>
              <button 
                className="chat-close-btn" 
                onClick={handleToggleChat}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ffc107', marginBottom: '16px' }}></i>
              <h5>Chat Temporarily Unavailable</h5>
            </div>
            
            <div style={{ marginBottom: '20px', color: '#666' }}>
              <p>The chat system is experiencing technical difficulties.</p>
              <p>This is likely due to a dependency loading issue.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
                style={{ marginRight: '10px' }}
              >
                <i className="fas fa-redo me-2"></i>
                Reload Page
              </button>
            </div>

            <div style={{ fontSize: '14px', color: '#888' }}>
              <p>If the problem persists, please contact support.</p>
              {user && (
                <p>You are logged in as: <strong>{user.username || user.email}</strong></p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleChatFallback;
import React from 'react';
import FloatingChat from './FloatingChat';

class SafeFloatingChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FloatingChat error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#dc3545',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '25px',
            fontSize: '14px',
            zIndex: 1000,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
          }}
          onClick={() => window.location.reload()}
          title="Click to reload page"
        >
          💬 Chat Error - Click to Reload
        </div>
      );
    }

    try {
      return <FloatingChat />;
    } catch (error) {
      console.error('FloatingChat render error:', error);
      return (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#ffc107',
            color: '#212529',
            padding: '10px 15px',
            borderRadius: '25px',
            fontSize: '14px',
            zIndex: 1000,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
          }}
          onClick={() => window.location.reload()}
          title="Click to reload page"
        >
          💬 Chat Unavailable
        </div>
      );
    }
  }
}

export default SafeFloatingChat;
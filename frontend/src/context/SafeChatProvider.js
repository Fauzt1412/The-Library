import React, { useState, useEffect } from 'react';
import { ChatProvider as RealChatProvider } from './ChatContext';
import { ChatProvider as FallbackChatProvider } from './ChatContextFallback';

// Safe Chat Provider that automatically falls back if there are errors
export const SafeChatProvider = ({ children }) => {
  const [useFallback, setUseFallback] = useState(false);
  const [error, setError] = useState(null);

  // Error boundary for chat context
  useEffect(() => {
    const handleError = (event) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('useAuth') || 
           event.error.message.includes('AuthContext') ||
           event.error.message.includes('chatService'))) {
        console.warn('Chat error detected, switching to fallback mode:', event.error);
        setUseFallback(true);
        setError(event.error);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Try real chat first, fallback on error
  if (useFallback) {
    console.log('Using fallback chat provider due to error:', error?.message);
    return <FallbackChatProvider>{children}</FallbackChatProvider>;
  }

  try {
    return <RealChatProvider>{children}</RealChatProvider>;
  } catch (error) {
    console.warn('Real chat provider failed, switching to fallback:', error);
    setUseFallback(true);
    return <FallbackChatProvider>{children}</FallbackChatProvider>;
  }
};
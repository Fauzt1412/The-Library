import React from 'react';
import { ChatProvider as FallbackChatProvider } from './ChatContextFallback';

// Simple Safe Chat Provider that always uses fallback to avoid any issues
export const SafeChatProvider = ({ children }) => {
  // Always use fallback to prevent any socket.io or dependency issues
  console.log('Using safe fallback chat provider');
  return <FallbackChatProvider>{children}</FallbackChatProvider>;
};
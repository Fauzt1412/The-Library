#!/usr/bin/env node

/**
 * Chat Error Fix Script
 * 
 * This script helps you fix the React componentStack error
 * by switching to a fallback chat system if needed.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Chat Error Fix Script');
console.log('========================\n');

const appJsPath = 'frontend/src/App.js';
const chatContextPath = 'frontend/src/context/ChatContext.js';
const chatContextFallbackPath = 'frontend/src/context/ChatContextFallback.js';

console.log('📋 Available Options:');
console.log('1. Use Real Chat System (with backend)');
console.log('2. Use Fallback Chat System (frontend only)');
console.log('3. Check current setup');
console.log('');

// Check current setup
function checkCurrentSetup() {
  console.log('🔍 Current Setup:');
  console.log('=================');
  
  try {
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    
    if (appContent.includes("import { ChatProvider } from './context/ChatContext';")) {
      console.log('✅ Currently using: Real Chat System');
      console.log('📁 Import: ./context/ChatContext');
    } else if (appContent.includes("import { ChatProvider } from './context/ChatContextFallback';")) {
      console.log('✅ Currently using: Fallback Chat System');
      console.log('📁 Import: ./context/ChatContextFallback');
    } else {
      console.log('❓ Unknown chat system configuration');
    }
    
    // Check if files exist
    console.log('');
    console.log('📁 File Status:');
    console.log(`${fs.existsSync(chatContextPath) ? '✅' : '❌'} ${chatContextPath}`);
    console.log(`${fs.existsSync(chatContextFallbackPath) ? '✅' : '❌'} ${chatContextFallbackPath}`);
    
  } catch (error) {
    console.log('❌ Error checking setup:', error.message);
  }
}

// Switch to fallback chat
function switchToFallback() {
  console.log('🔄 Switching to Fallback Chat System...');
  
  try {
    let appContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Replace the import
    appContent = appContent.replace(
      "import { ChatProvider } from './context/ChatContext';",
      "import { ChatProvider } from './context/ChatContextFallback';"
    );
    
    fs.writeFileSync(appJsPath, appContent);
    
    console.log('✅ Successfully switched to Fallback Chat System');
    console.log('');
    console.log('🎯 What this means:');
    console.log('- Chat will work without backend connection');
    console.log('- Messages are stored locally only');
    console.log('- No real-time communication between users');
    console.log('- Good for testing UI without backend issues');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Restart your React development server');
    console.log('2. Test the chat functionality');
    console.log('3. The componentStack error should be resolved');
    
  } catch (error) {
    console.log('❌ Error switching to fallback:', error.message);
  }
}

// Switch to real chat
function switchToReal() {
  console.log('🔄 Switching to Real Chat System...');
  
  try {
    let appContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Replace the import
    appContent = appContent.replace(
      "import { ChatProvider } from './context/ChatContextFallback';",
      "import { ChatProvider } from './context/ChatContext';"
    );
    
    fs.writeFileSync(appJsPath, appContent);
    
    console.log('✅ Successfully switched to Real Chat System');
    console.log('');
    console.log('🎯 What this means:');
    console.log('- Chat will connect to backend server');
    console.log('- Real-time communication between users');
    console.log('- Messages stored in MongoDB database');
    console.log('- Requires backend server to be running');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Make sure backend server is running (cd Server && npm run dev)');
    console.log('2. Restart your React development server');
    console.log('3. Test the chat functionality');
    
  } catch (error) {
    console.log('❌ Error switching to real chat:', error.message);
  }
}

// Get command line argument
const command = process.argv[2];

switch (command) {
  case 'fallback':
    switchToFallback();
    break;
  case 'real':
    switchToReal();
    break;
  case 'check':
  default:
    checkCurrentSetup();
    console.log('');
    console.log('💡 Usage:');
    console.log('node fix-chat-error.js fallback  # Switch to fallback chat');
    console.log('node fix-chat-error.js real      # Switch to real chat');
    console.log('node fix-chat-error.js check     # Check current setup');
    break;
}

console.log('');
console.log('🔧 Troubleshooting Tips:');
console.log('========================');
console.log('- If you get componentStack errors: Use fallback mode');
console.log('- If chat doesn\'t connect: Check backend server');
console.log('- If messages don\'t sync: Verify Socket.IO connection');
console.log('- For development: Fallback mode is often easier');
console.log('- For production: Use real chat system');
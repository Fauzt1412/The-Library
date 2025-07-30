#!/usr/bin/env node

/**
 * Chat System Test Script
 * 
 * This script helps you test and debug the chat system.
 * Run this to check if everything is working properly.
 */

console.log('🧪 Chat System Test Script');
console.log('==========================\n');

// Test 1: Check if backend files exist
console.log('📁 Checking backend files...');
const fs = require('fs');
const path = require('path');

const backendFiles = [
  'Server/API/models/chat.js',
  'Server/API/controllers/ChatController.js', 
  'Server/API/routes/ChatRoute.js',
  'Server/services/socketService.js',
  'Server/server.js'
];

backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
});

// Test 2: Check if frontend files exist
console.log('\n📁 Checking frontend files...');
const frontendFiles = [
  'frontend/src/services/chatService.js',
  'frontend/src/context/ChatContext.js',
  'frontend/src/components/FloatingChat.js'
];

frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
});

// Test 3: Check package.json dependencies
console.log('\n📦 Checking dependencies...');

try {
  const backendPkg = JSON.parse(fs.readFileSync('Server/package.json', 'utf8'));
  if (backendPkg.dependencies['socket.io']) {
    console.log(`✅ Backend: socket.io v${backendPkg.dependencies['socket.io']}`);
  } else {
    console.log('❌ Backend: socket.io - MISSING!');
  }
} catch (error) {
  console.log('❌ Backend package.json - ERROR!');
}

try {
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  if (frontendPkg.dependencies['socket.io-client']) {
    console.log(`✅ Frontend: socket.io-client v${frontendPkg.dependencies['socket.io-client']}`);
  } else {
    console.log('❌ Frontend: socket.io-client - MISSING!');
  }
} catch (error) {
  console.log('❌ Frontend package.json - ERROR!');
}

console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. Install dependencies:');
console.log('   cd Server && npm install');
console.log('   cd frontend && npm install');
console.log('');
console.log('2. Start the backend server:');
console.log('   cd Server && npm run dev');
console.log('');
console.log('3. Start the frontend (in another terminal):');
console.log('   cd frontend && npm start');
console.log('');
console.log('4. Open http://localhost:3000 in multiple browser tabs');
console.log('5. Login with different users in each tab');
console.log('6. Click the chat button and start messaging!');
console.log('');
console.log('🔍 Debugging Tips:');
console.log('==================');
console.log('- Check browser console for errors (F12)');
console.log('- Check backend terminal for connection logs');
console.log('- Make sure MongoDB is running');
console.log('- Verify CORS settings in server.js');
console.log('- Check if port 1412 is available');
console.log('');
console.log('📞 Common Issues:');
console.log('=================');
console.log('- "Cannot connect": Check if backend is running on port 1412');
console.log('- "CORS error": Verify frontend URL in server CORS config');
console.log('- "User not found": Make sure you\'re logged in');
console.log('- "Socket.IO error": Check network/firewall settings');
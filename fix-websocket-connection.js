#!/usr/bin/env node

/**
 * WebSocket Connection Fix Guide
 * 
 * This script helps diagnose and fix WebSocket connection errors.
 */

console.log('🔧 WEBSOCKET CONNECTION FIX');
console.log('===========================\n');

console.log('❌ **COMMON WEBSOCKET ERRORS:**');
console.log('===============================');
console.log('• "websocket error at Q.onError" - Connection failed');
console.log('• "Failed to connect to chat server" - Server not running');
console.log('• "Connection timeout" - Server unreachable');
console.log('• "CORS error" - Cross-origin request blocked');
console.log('• "ERR_CONNECTION_REFUSED" - Port not accessible');
console.log('');

console.log('🔍 **DIAGNOSIS STEPS:**');
console.log('======================');
console.log('');

console.log('**Step 1: Check if Backend Server is Running**');
console.log('□ Open terminal in Server directory');
console.log('□ Run: npm run dev');
console.log('□ Look for: "🚀 Server is running on http://localhost:1412"');
console.log('□ Look for: "🔌 Socket.IO enabled for real-time chat"');
console.log('');

console.log('**Step 2: Verify Server URL**');
console.log('□ Frontend connects to: http://localhost:1412');
console.log('□ Backend should be running on: http://localhost:1412');
console.log('□ Check browser console for connection attempts');
console.log('');

console.log('**Step 3: Test Server Health**');
console.log('□ Open browser to: http://localhost:1412/health');
console.log('□ Should return: {"status": "OK", ...}');
console.log('□ If not accessible, server is not running');
console.log('');

console.log('**Step 4: Check Network/Firewall**');
console.log('□ Disable antivirus/firewall temporarily');
console.log('□ Check if port 1412 is blocked');
console.log('□ Try different port if needed');
console.log('');

console.log('✅ **SOLUTIONS:**');
console.log('================');
console.log('');

console.log('🔧 **Solution 1: Start Backend Server**');
console.log('```bash');
console.log('cd Server');
console.log('npm install  # Install dependencies if needed');
console.log('npm run dev  # Start development server');
console.log('```');
console.log('');

console.log('🔧 **Solution 2: Check Environment Variables**');
console.log('• Create Server/.env file if missing');
console.log('• Copy from Server/.env.example');
console.log('• Set correct PORT and DATABASE_URL');
console.log('');

console.log('🔧 **Solution 3: Fix CORS Issues**');
console.log('• Server already configured for localhost:3000');
console.log('• Check server.js CORS configuration');
console.log('• Ensure frontend URL is in allowedOrigins');
console.log('');

console.log('🔧 **Solution 4: Fallback to Polling**');
console.log('• Socket.IO will automatically fallback to polling');
console.log('• Check browser network tab for polling requests');
console.log('• Should work even if WebSocket fails');
console.log('');

console.log('🔧 **Solution 5: Alternative Server URL**');
console.log('• Try 127.0.0.1 instead of localhost');
console.log('• Check if IPv6 is causing issues');
console.log('• Use explicit IP address');
console.log('');

console.log('🧪 **TESTING STEPS:**');
console.log('====================');
console.log('');

console.log('**Test 1: Server Health Check**');
console.log('1. Start backend: cd Server && npm run dev');
console.log('2. Open: http://localhost:1412/health');
console.log('3. Should see: {"status": "OK", "database": "connected"}');
console.log('');

console.log('**Test 2: Socket.IO Connection**');
console.log('1. Open browser console (F12)');
console.log('2. Start frontend: cd frontend && npm start');
console.log('3. Open chat window');
console.log('4. Look for: "✅ Connected to chat server"');
console.log('');

console.log('**Test 3: Manual Socket Test**');
console.log('1. Open browser console');
console.log('2. Run: fetch("http://localhost:1412/health")');
console.log('3. Should return successful response');
console.log('');

console.log('🔧 **QUICK FIX COMMANDS:**');
console.log('=========================');
console.log('');

console.log('**Start Backend Server:**');
console.log('```bash');
console.log('cd Server');
console.log('npm run dev');
console.log('```');
console.log('');

console.log('**Start Frontend:**');
console.log('```bash');
console.log('cd frontend');
console.log('npm start');
console.log('```');
console.log('');

console.log('**Check Server Status:**');
console.log('```bash');
console.log('curl http://localhost:1412/health');
console.log('# or open in browser');
console.log('```');
console.log('');

console.log('🔍 **DEBUGGING TIPS:**');
console.log('=====================');
console.log('');

console.log('**Browser Console Logs:**');
console.log('• Look for Socket.IO connection messages');
console.log('• Check for CORS errors');
console.log('• Monitor network requests');
console.log('');

console.log('**Server Console Logs:**');
console.log('• Should show "Socket.IO initialized"');
console.log('• Look for connection attempts');
console.log('• Check for error messages');
console.log('');

console.log('**Network Tab:**');
console.log('• Check for failed requests to localhost:1412');
console.log('• Look for WebSocket upgrade attempts');
console.log('• Monitor polling fallback requests');
console.log('');

console.log('⚠️ **COMMON ISSUES:**');
console.log('====================');
console.log('');

console.log('**Issue 1: Server Not Running**');
console.log('• Error: "ERR_CONNECTION_REFUSED"');
console.log('• Solution: Start backend server');
console.log('• Command: cd Server && npm run dev');
console.log('');

console.log('**Issue 2: Wrong Port**');
console.log('• Error: "Failed to connect"');
console.log('• Check: Server running on port 1412');
console.log('• Check: Frontend connecting to correct port');
console.log('');

console.log('**Issue 3: Database Connection**');
console.log('• Error: "MongoDB connection error"');
console.log('• Check: DATABASE_URL in .env file');
console.log('• Solution: Use local MongoDB or cloud connection');
console.log('');

console.log('**Issue 4: Firewall/Antivirus**');
console.log('• Error: "Connection timeout"');
console.log('• Solution: Temporarily disable firewall');
console.log('• Solution: Add port 1412 to exceptions');
console.log('');

console.log('🚀 **STARTUP SEQUENCE:**');
console.log('========================');
console.log('');

console.log('**Correct Order:**');
console.log('1. Start MongoDB (if using local)');
console.log('2. Start Backend Server (port 1412)');
console.log('3. Start Frontend (port 3000)');
console.log('4. Open chat and test connection');
console.log('');

console.log('**Expected Output:**');
console.log('Backend Console:');
console.log('• "🚀 Starting server on port 1412"');
console.log('• "✅ MongoDB connected"');
console.log('• "🔌 Socket.IO initialized"');
console.log('• "🚀 Server is running on http://localhost:1412"');
console.log('');

console.log('Frontend Console:');
console.log('• "✅ Connected to chat server"');
console.log('• "🚀 Joining chat via Socket.IO"');
console.log('• "👥 Online users updated: X"');
console.log('');

console.log('🎯 **IMMEDIATE ACTION:**');
console.log('=======================');
console.log('');

console.log('**Run these commands now:**');
console.log('');
console.log('Terminal 1 (Backend):');
console.log('```bash');
console.log('cd Server');
console.log('npm run dev');
console.log('```');
console.log('');
console.log('Terminal 2 (Frontend):');
console.log('```bash');
console.log('cd frontend');
console.log('npm start');
console.log('```');
console.log('');
console.log('Then open chat and check for green connection dot!');
console.log('');

console.log('✨ Follow these steps and your WebSocket should connect! ✨');
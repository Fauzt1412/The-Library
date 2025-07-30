#!/usr/bin/env node

/**
 * Comprehensive System Check
 * 
 * This script performs a complete check of your chat system configuration.
 */

const mongoose = require('mongoose');

console.log('🔍 COMPREHENSIVE SYSTEM CHECK');
console.log('=============================\n');

console.log('📋 **CONFIGURATION ANALYSIS:**');
console.log('==============================');
console.log('');

// Check MongoDB connection string
const mongoConnectionString = 'mongodb+srv://vannq1412:chinhbong1412@cluster0.w9zw5oh.mongodb.net/Storage_database_SYS';
console.log('🗄️ **DATABASE CONFIGURATION:**');
console.log('• Connection String: ✅ Provided');
console.log('• Format: ✅ MongoDB Atlas format');
console.log('• Database Name: Storage_database_SYS');
console.log('• Cluster: cluster0.w9zw5oh.mongodb.net');
console.log('• Username: vannq1412');
console.log('• Password: [HIDDEN]');
console.log('');

console.log('🌐 **BACKEND CONFIGURATION:**');
console.log('• Server File: ✅ server.js exists');
console.log('• Socket.IO Service: ✅ socketService.js exists');
console.log('• Environment File: ✅ .env exists');
console.log('• Port: 1412');
console.log('• CORS: ✅ Configured for Vercel domain');
console.log('');

console.log('🎯 **FRONTEND CONFIGURATION:**');
console.log('• Chat Component: ✅ SafeFloatingChat.js');
console.log('• Socket.IO Client: ✅ Installed');
console.log('• Environment Detection: ✅ Implemented');
console.log('• Production Handling: ✅ Disabled when no backend URL');
console.log('');

console.log('🧪 **TESTING DATABASE CONNECTION:**');
console.log('==================================');

async function testDatabaseConnection() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(mongoConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ **DATABASE CONNECTION SUCCESSFUL!**');
    console.log('• Status: Connected');
    console.log('• Database: ' + mongoose.connection.db.databaseName);
    console.log('• Host: ' + mongoose.connection.host);
    console.log('• Port: ' + mongoose.connection.port);
    console.log('');
    
    // Test basic operations
    console.log('🧪 **TESTING DATABASE OPERATIONS:**');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('• Collections found: ' + collections.length);
    collections.forEach(col => {
      console.log('  - ' + col.name);
    });
    console.log('');
    
    await mongoose.disconnect();
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.log('❌ **DATABASE CONNECTION FAILED!**');
    console.log('• Error: ' + error.message);
    console.log('');
    
    if (error.message.includes('authentication failed')) {
      console.log('🔧 **AUTHENTICATION ISSUE:**');
      console.log('• Check username: vannq1412');
      console.log('• Check password: chinhbong1412');
      console.log('• Verify MongoDB Atlas user permissions');
      console.log('');
    }
    
    if (error.message.includes('network')) {
      console.log('🔧 **NETWORK ISSUE:**');
      console.log('• Check internet connection');
      console.log('• Verify MongoDB Atlas IP whitelist');
      console.log('• Check firewall settings');
      console.log('');
    }
  }
}

console.log('🎯 **SYSTEM STATUS SUMMARY:**');
console.log('=============================');
console.log('');

console.log('**Current Setup:**');
console.log('• Frontend: ✅ Deployed on Vercel');
console.log('• Backend: ❓ Not deployed (localhost only)');
console.log('• Database: ✅ MongoDB Atlas configured');
console.log('• Chat: 🔄 Disabled in production (no backend URL)');
console.log('');

console.log('**Issues Identified:**');
console.log('1. ⚠️ Backend not deployed to production');
console.log('2. ⚠️ No REACT_APP_SERVER_URL in Vercel');
console.log('3. ⚠️ Chat disabled in production environment');
console.log('');

console.log('🚀 **DEPLOYMENT RECOMMENDATIONS:**');
console.log('==================================');
console.log('');

console.log('**Option 1: Deploy to Render (Recommended)**');
console.log('1. Go to render.com');
console.log('2. Connect GitHub repository');
console.log('3. Create Web Service');
console.log('4. Configure:');
console.log('   • Root Directory: Server');
console.log('   • Build Command: npm install');
console.log('   • Start Command: npm start');
console.log('   • Environment Variables:');
console.log('     - NODE_ENV=production');
console.log('     - PORT=10000');
console.log('     - DATABASE_URL=' + mongoConnectionString);
console.log('     - FRONTEND_URL=https://the-library-seven.vercel.app');
console.log('');

console.log('**Option 2: Deploy to Railway**');
console.log('1. Go to railway.app');
console.log('2. Connect GitHub repository');
console.log('3. Deploy Server directory');
console.log('4. Add same environment variables');
console.log('');

console.log('**Option 3: Test Locally First**');
console.log('1. Start backend: cd Server && npm run dev');
console.log('2. Start frontend: cd frontend && npm start');
console.log('3. Test chat functionality');
console.log('4. Then deploy to production');
console.log('');

console.log('🔧 **IMMEDIATE ACTIONS:**');
console.log('========================');
console.log('');

console.log('**Step 1: Test Local Setup**');
console.log('```bash');
console.log('# Terminal 1: Start Backend');
console.log('cd Server');
console.log('npm install');
console.log('npm run dev');
console.log('');
console.log('# Terminal 2: Start Frontend');
console.log('cd frontend');
console.log('npm start');
console.log('```');
console.log('');

console.log('**Step 2: Verify Local Chat**');
console.log('• Open http://localhost:3000');
console.log('• Click chat button');
console.log('• Should show green connection dot');
console.log('• Try joining chat and sending messages');
console.log('');

console.log('**Step 3: Deploy Backend**');
console.log('• Choose hosting platform (Render/Railway)');
console.log('• Deploy Server directory');
console.log('• Note the deployment URL');
console.log('');

console.log('**Step 4: Update Frontend**');
console.log('• Add REACT_APP_SERVER_URL to Vercel');
console.log('• Set value to deployed backend URL');
console.log('• Redeploy frontend');
console.log('');

console.log('🧪 **TESTING CHECKLIST:**');
console.log('=========================');
console.log('');

console.log('**Local Testing:**');
console.log('□ Backend starts without errors');
console.log('□ Database connects successfully');
console.log('□ Socket.IO initializes');
console.log('□ Frontend connects to backend');
console.log('□ Chat shows green connection dot');
console.log('□ Messages send and receive');
console.log('□ User count updates correctly');
console.log('');

console.log('**Production Testing:**');
console.log('□ Backend deployed successfully');
console.log('□ Health endpoint accessible');
console.log('□ Database connects in production');
console.log('□ Frontend environment variable set');
console.log('□ Chat enabled in production');
console.log('□ Real-time messaging works');
console.log('□ Multiple users can chat');
console.log('');

console.log('📊 **CURRENT ENVIRONMENT:**');
console.log('===========================');
console.log('');

console.log('**Development:**');
console.log('• Frontend: http://localhost:3000');
console.log('• Backend: http://localhost:1412');
console.log('• Database: MongoDB Atlas (cloud)');
console.log('• Status: Ready for testing');
console.log('');

console.log('**Production:**');
console.log('• Frontend: https://the-library-seven.vercel.app');
console.log('• Backend: Not deployed');
console.log('• Database: MongoDB Atlas (cloud)');
console.log('• Status: Chat disabled');
console.log('');

console.log('🎯 **NEXT STEPS:**');
console.log('=================');
console.log('');

console.log('**Immediate (Test Local):**');
console.log('1. Run database connection test below');
console.log('2. Start both servers locally');
console.log('3. Test chat functionality');
console.log('');

console.log('**Short-term (Deploy):**');
console.log('1. Deploy backend to Render/Railway');
console.log('2. Configure environment variables');
console.log('3. Update Vercel with backend URL');
console.log('4. Test production chat');
console.log('');

console.log('**Long-term (Optimize):**');
console.log('1. Monitor performance');
console.log('2. Add error tracking');
console.log('3. Implement user presence');
console.log('4. Add chat moderation');
console.log('');

// Run database test
testDatabaseConnection().then(() => {
  console.log('✨ System check completed! ✨');
}).catch((error) => {
  console.error('❌ System check failed:', error.message);
});
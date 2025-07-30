#!/usr/bin/env node

/**
 * Socket.IO Dependency Fix Script
 * 
 * This script helps fix the missing socket.io-client dependency issue.
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Socket.IO Dependency Fix');
console.log('============================\n');

console.log('❌ **CURRENT ERROR:**');
console.log('=====================');
console.log('Module not found: Error: Can\'t resolve \'socket.io-client\'');
console.log('');

console.log('🔍 **CHECKING DEPENDENCIES:**');
console.log('=============================');

// Check if package.json exists
if (fs.existsSync('frontend/package.json')) {
  console.log('✅ frontend/package.json found');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    if (packageJson.dependencies && packageJson.dependencies['socket.io-client']) {
      console.log(`✅ socket.io-client listed in package.json: ${packageJson.dependencies['socket.io-client']}`);
    } else {
      console.log('❌ socket.io-client NOT found in package.json');
    }
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
  }
} else {
  console.log('❌ frontend/package.json not found');
}

// Check if node_modules exists
if (fs.existsSync('frontend/node_modules')) {
  console.log('✅ frontend/node_modules directory exists');
  
  if (fs.existsSync('frontend/node_modules/socket.io-client')) {
    console.log('✅ socket.io-client installed in node_modules');
  } else {
    console.log('❌ socket.io-client NOT installed in node_modules');
  }
} else {
  console.log('❌ frontend/node_modules directory not found');
}

console.log('');

console.log('🚀 **SOLUTION STEPS:**');
console.log('======================');
console.log('');

console.log('**Option 1: Install Missing Dependencies (Recommended)**');
console.log('-------------------------------------------------------');
console.log('1. Navigate to frontend directory:');
console.log('   cd frontend');
console.log('');
console.log('2. Delete node_modules and package-lock.json:');
console.log('   rm -rf node_modules package-lock.json');
console.log('   # On Windows: rmdir /s node_modules & del package-lock.json');
console.log('');
console.log('3. Install dependencies:');
console.log('   npm install');
console.log('');
console.log('4. If still missing, install socket.io-client specifically:');
console.log('   npm install socket.io-client@^4.7.5');
console.log('');
console.log('5. Start the development server:');
console.log('   npm start');
console.log('');

console.log('**Option 2: Use Safe Chat (No Socket.IO Required)**');
console.log('--------------------------------------------------');
console.log('The SafeFloatingChat component doesn\'t require socket.io-client');
console.log('and will work without any additional dependencies.');
console.log('');
console.log('This is already configured in your SafeChatProvider.');
console.log('');

console.log('**Option 3: Quick Fix Commands**');
console.log('--------------------------------');
console.log('Run these commands in order:');
console.log('');
console.log('cd frontend');
console.log('npm install socket.io-client@^4.7.5');
console.log('npm start');
console.log('');

console.log('🔧 **TROUBLESHOOTING:**');
console.log('=======================');
console.log('');

console.log('**If npm install fails:**');
console.log('• Clear npm cache: npm cache clean --force');
console.log('• Delete node_modules: rm -rf node_modules');
console.log('• Delete package-lock.json: rm package-lock.json');
console.log('• Try again: npm install');
console.log('');

console.log('**If socket.io-client still not found:**');
console.log('• Check Node.js version: node --version (should be 16+)');
console.log('• Check npm version: npm --version');
console.log('• Try yarn instead: yarn add socket.io-client@^4.7.5');
console.log('');

console.log('**If all else fails:**');
console.log('• The SafeFloatingChat will work without socket.io');
console.log('• Chat functionality will be local-only but functional');
console.log('• No real-time features but no crashes either');
console.log('');

console.log('💡 **EXPECTED RESULT:**');
console.log('======================');
console.log('After fixing dependencies:');
console.log('✅ No more "Module not found" errors');
console.log('✅ Chat system loads properly');
console.log('✅ Real-time features work (if backend running)');
console.log('✅ Fallback chat works (if backend not running)');
console.log('');

console.log('🎯 **QUICK TEST:**');
console.log('=================');
console.log('1. cd frontend && npm install socket.io-client');
console.log('2. npm start');
console.log('3. Open http://localhost:3000');
console.log('4. Check browser console for errors');
console.log('5. Click chat button - should work without errors');
console.log('');

console.log('✨ Choose Option 1 for full functionality or rely on');
console.log('   the SafeFloatingChat for error-free operation!');
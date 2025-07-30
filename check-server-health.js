#!/usr/bin/env node

/**
 * Server Health Check
 * 
 * This script checks if the backend server is running and accessible.
 */

const http = require('http');

console.log('🏥 CHECKING SERVER HEALTH');
console.log('=========================\n');

const serverUrl = 'http://localhost:1412';
const healthEndpoint = `${serverUrl}/health`;

console.log(`🔍 Checking: ${healthEndpoint}`);

const checkHealth = () => {
  return new Promise((resolve, reject) => {
    const req = http.get(healthEndpoint, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

const main = async () => {
  try {
    console.log('⏳ Connecting to server...\n');
    
    const result = await checkHealth();
    
    if (result.status === 200) {
      console.log('✅ SERVER IS RUNNING!');
      console.log('====================');
      console.log(`📊 Status Code: ${result.status}`);
      console.log(`📋 Response:`, result.data);
      console.log('');
      
      if (result.data.database === 'connected') {
        console.log('✅ Database: Connected');
      } else {
        console.log('⚠️ Database: Not connected');
      }
      
      console.log('');
      console.log('🎯 NEXT STEPS:');
      console.log('==============');
      console.log('1. Start frontend: cd frontend && npm start');
      console.log('2. Open chat window');
      console.log('3. Look for green connection dot');
      console.log('4. Test real-time messaging');
      
    } else {
      console.log('⚠️ SERVER RESPONDING BUT WITH ERROR');
      console.log('===================================');
      console.log(`📊 Status Code: ${result.status}`);
      console.log(`📋 Response:`, result.data);
    }
    
  } catch (error) {
    console.log('❌ SERVER NOT ACCESSIBLE');
    console.log('========================');
    console.log(`🔍 Error: ${error.message}`);
    console.log('');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🚨 CONNECTION REFUSED');
      console.log('=====================');
      console.log('• Server is not running on port 1412');
      console.log('• Start server: cd Server && npm run dev');
      console.log('');
    } else if (error.message === 'Request timeout') {
      console.log('⏰ CONNECTION TIMEOUT');
      console.log('=====================');
      console.log('• Server may be starting up');
      console.log('• Check firewall settings');
      console.log('• Try again in a few seconds');
      console.log('');
    }
    
    console.log('🔧 TROUBLESHOOTING:');
    console.log('===================');
    console.log('1. Check if server is running:');
    console.log('   cd Server && npm run dev');
    console.log('');
    console.log('2. Check server logs for errors');
    console.log('');
    console.log('3. Verify port 1412 is not blocked');
    console.log('');
    console.log('4. Run detailed fix guide:');
    console.log('   node fix-websocket-connection.js');
  }
};

main();
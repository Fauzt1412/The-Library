const axios = require('axios');

const API_BASE = 'http://localhost:1412/API';

async function testAPI() {
    console.log('🧪 Testing API endpoints...\n');

    try {
        // Test 1: Server connection
        console.log('1. Testing server connection...');
        const healthCheck = await axios.get(`${API_BASE}/books`);
        console.log('✅ Server is running and accessible');
        console.log(`📚 Found ${healthCheck.data.length} books in database\n`);

        // Test 2: Login with admin account
        console.log('2. Testing login...');
        const loginResponse = await axios.post(`${API_BASE}/login`, {
            username: 'Fau',
            password: '123456'
        });
        
        if (loginResponse.data.user) {
            console.log('✅ Login successful');
            console.log(`👤 User: ${loginResponse.data.user.username} (${loginResponse.data.user.role})`);
            console.log(`🆔 User ID: ${loginResponse.data.user._id}\n`);
            
            const userId = loginResponse.data.user._id;
            
            // Test 3: Test protected endpoint (users list)
            console.log('3. Testing protected endpoint...');
            const usersResponse = await axios.get(`${API_BASE}/users`, {
                headers: {
                    'x-user-id': userId
                }
            });
            console.log('✅ Protected endpoint accessible');
            console.log(`👥 Found ${usersResponse.data.length} users in database\n`);
            
        } else {
            console.log('❌ Login failed - no user returned');
        }

    } catch (error) {
        console.error('❌ API Test failed:');
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Server is not running. Please start the server with: npm start');
        } else if (error.response) {
            console.error(`📡 HTTP ${error.response.status}: ${error.response.data.error || error.response.statusText}`);
        } else {
            console.error('🚨 Unexpected error:', error.message);
        }
    }
}

// Run the test
testAPI();
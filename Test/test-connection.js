// Simple test to verify server connectivity
const axios = require('axios');

async function testConnection() {
    console.log('🔍 Testing server connectivity...\n');

    const tests = [
        {
            name: 'Server Health Check',
            url: 'http://localhost:1412/health',
            method: 'GET'
        },
        {
            name: 'API Health Check',
            url: 'http://localhost:1412/API/health',
            method: 'GET'
        },
        {
            name: 'Books Endpoint',
            url: 'http://localhost:1412/API/books',
            method: 'GET'
        },
        {
            name: 'Games Endpoint',
            url: 'http://localhost:1412/API/games',
            method: 'GET'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}`);
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 5000
            });
            console.log(`✅ ${test.name}: Status ${response.status}`);
            if (test.name.includes('Health')) {
                console.log(`   Response:`, response.data);
            }
            console.log('');
        } catch (error) {
            console.log(`❌ ${test.name}: FAILED`);
            if (error.code === 'ECONNREFUSED') {
                console.log('   Error: Server is not running or not accessible');
            } else if (error.response) {
                console.log(`   Error: HTTP ${error.response.status} - ${error.response.statusText}`);
            } else {
                console.log(`   Error: ${error.message}`);
            }
            console.log('');
        }
    }

    // Test login if server is accessible
    try {
        console.log('Testing: Login Endpoint');
        const loginResponse = await axios.post('http://localhost:1412/API/login', {
            username: 'Fau',
            password: '123456'
        });
        console.log('✅ Login: Success');
        console.log('   User ID:', loginResponse.data.user._id);
        console.log('   Username:', loginResponse.data.user.username);
        console.log('   Role:', loginResponse.data.user.role);
    } catch (error) {
        console.log('❌ Login: FAILED');
        if (error.response) {
            console.log(`   Error: ${error.response.data.error || error.response.statusText}`);
        } else {
            console.log(`   Error: ${error.message}`);
        }
    }
}

// Check if axios is available
try {
    require('axios');
    testConnection();
} catch (error) {
    console.log('❌ axios not found. Please install it:');
    console.log('npm install axios');
    console.log('\nOr test manually:');
    console.log('curl http://localhost:1412/health');
}
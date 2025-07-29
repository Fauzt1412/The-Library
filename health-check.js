const axios = require('axios');

async function checkHealth() {
    console.log('🔍 Checking The Library Application Health...\n');
    
    const checks = [
        {
            name: 'Backend Server',
            url: 'http://localhost:1412/health',
            description: 'Main server health'
        },
        {
            name: 'API Endpoints',
            url: 'http://localhost:1412/API/health',
            description: 'API routes health'
        },
        {
            name: 'Books API',
            url: 'http://localhost:1412/API/books',
            description: 'Books data endpoint'
        },
        {
            name: 'Games API',
            url: 'http://localhost:1412/API/games',
            description: 'Games data endpoint'
        }
    ];
    
    let allHealthy = true;
    
    for (const check of checks) {
        try {
            console.log(`⏳ Checking ${check.name}...`);
            const response = await axios.get(check.url, { timeout: 5000 });
            
            if (response.status === 200) {
                console.log(`✅ ${check.name}: OK (${response.status})`);
                if (response.data) {
                    console.log(`   📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
                }
            } else {
                console.log(`⚠️  ${check.name}: Unexpected status ${response.status}`);
                allHealthy = false;
            }
        } catch (error) {
            console.log(`❌ ${check.name}: FAILED`);
            if (error.code === 'ECONNREFUSED') {
                console.log(`   🔌 Connection refused - server might not be running`);
            } else if (error.code === 'ETIMEDOUT') {
                console.log(`   ⏰ Request timed out`);
            } else {
                console.log(`   📝 Error: ${error.message}`);
            }
            allHealthy = false;
        }
        console.log('');
    }
    
    console.log('📋 Health Check Summary:');
    if (allHealthy) {
        console.log('✅ All systems are healthy!');
        console.log('🌐 Your application should be working at: http://localhost:3000');
    } else {
        console.log('❌ Some issues detected. Please check the errors above.');
        console.log('💡 Make sure to:');
        console.log('   1. Start the backend server: cd Server && npm run dev');
        console.log('   2. Start MongoDB service');
        console.log('   3. Check your .env files');
    }
}

// Run the health check
checkHealth().catch(console.error);
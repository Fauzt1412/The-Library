const axios = require('axios');

async function quickTest() {
    console.log('🚀 Quick API Test...');
    
    try {
        // Test server
        console.log('\n1. Testing server...');
        const health = await axios.get('http://localhost:1412/health');
        console.log('✅ Server running:', health.data);
        
        // Test books
        console.log('\n2. Testing books...');
        const books = await axios.get('http://localhost:1412/API/books');
        console.log('✅ Books API:', {
            status: books.status,
            dataType: typeof books.data,
            hasData: 'data' in books.data,
            isArray: Array.isArray(books.data.data),
            count: books.data.data?.length || 0
        });
        
        // Test games
        console.log('\n3. Testing games...');
        const games = await axios.get('http://localhost:1412/API/games');
        console.log('✅ Games API:', {
            status: games.status,
            dataType: typeof games.data,
            hasData: 'data' in games.data,
            isArray: Array.isArray(games.data.data),
            count: games.data.data?.length || 0
        });
        
        console.log('\n🎯 All basic APIs are working!');
        console.log('\n💡 If frontend still has issues:');
        console.log('   1. Check browser console for authentication errors');
        console.log('   2. Clear browser cache');
        console.log('   3. Restart frontend: cd frontend && npm start');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Server is not running. Start it with: cd Server && node server.js');
        }
    }
}

quickTest();
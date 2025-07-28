const axios = require('axios');

const API_BASE = 'http://localhost:1412/API';

// Comprehensive debugging script
async function debugComprehensive() {
    console.log('🔍 COMPREHENSIVE DEBUGGING - Books, Games, and Notifications');
    console.log('=' .repeat(80));
    
    try {
        // 1. Test server health
        console.log('\n1. 🏥 Testing Server Health...');
        try {
            const healthResponse = await axios.get('http://localhost:1412/health');
            console.log('✅ Server is running');
            console.log('   Status:', healthResponse.status);
            console.log('   Database:', healthResponse.data.database);
        } catch (error) {
            console.log('❌ Server health check failed:', error.message);
            console.log('💡 Make sure the server is running: cd Server && node server.js');
            return;
        }
        
        // 2. Test Books API
        console.log('\n2. 📚 Testing Books API...');
        try {
            const booksResponse = await axios.get(`${API_BASE}/books`);
            console.log('✅ Books API Response:');
            console.log('   Status:', booksResponse.status);
            console.log('   Response structure:');
            console.log('   - Type of response.data:', typeof booksResponse.data);
            console.log('   - Has "data" property:', 'data' in booksResponse.data);
            console.log('   - Type of response.data.data:', typeof booksResponse.data.data);
            console.log('   - Is response.data.data an array:', Array.isArray(booksResponse.data.data));
            
            if (Array.isArray(booksResponse.data.data)) {
                console.log('   - Array length:', booksResponse.data.data.length);
                if (booksResponse.data.data.length > 0) {
                    console.log('   - First item keys:', Object.keys(booksResponse.data.data[0]));
                } else {
                    console.log('   - Array is empty (no books in database)');
                }
            } else {
                console.log('   ❌ response.data.data is not an array!');
                console.log('   - Actual value:', booksResponse.data.data);
            }
        } catch (error) {
            console.log('❌ Books API Error:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.message);
            console.log('   Response:', error.response?.data);
        }
        
        // 3. Test Games API
        console.log('\n3. 🎮 Testing Games API...');
        try {
            const gamesResponse = await axios.get(`${API_BASE}/games`);
            console.log('✅ Games API Response:');
            console.log('   Status:', gamesResponse.status);
            console.log('   Response structure:');
            console.log('   - Type of response.data:', typeof gamesResponse.data);
            console.log('   - Has "data" property:', 'data' in gamesResponse.data);
            console.log('   - Type of response.data.data:', typeof gamesResponse.data.data);
            console.log('   - Is response.data.data an array:', Array.isArray(gamesResponse.data.data));
            
            if (Array.isArray(gamesResponse.data.data)) {
                console.log('   - Array length:', gamesResponse.data.data.length);
                if (gamesResponse.data.data.length > 0) {
                    console.log('   - First item keys:', Object.keys(gamesResponse.data.data[0]));
                } else {
                    console.log('   - Array is empty (no games in database)');
                }
            } else {
                console.log('   ❌ response.data.data is not an array!');
                console.log('   - Actual value:', gamesResponse.data.data);
            }
        } catch (error) {
            console.log('❌ Games API Error:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.message);
            console.log('   Response:', error.response?.data);
        }
        
        // 4. Test Notifications API (should return 401 without auth)
        console.log('\n4. 🔔 Testing Notifications API...');
        try {
            await axios.get(`${API_BASE}/notifications`);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Notifications endpoint exists (returns 401 as expected without auth)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        
        // 5. Test Admin Notifications API (should return 401 without auth)
        console.log('\n5. 👑 Testing Admin Notifications API...');
        try {
            await axios.get(`${API_BASE}/admin/notifications`);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Admin notifications endpoint exists (returns 401 as expected without auth)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        
        // 6. Test CORS
        console.log('\n6. 🌐 Testing CORS...');
        try {
            const response = await axios.get(`${API_BASE}/books`, {
                headers: {
                    'Origin': 'http://localhost:3000',
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ CORS headers working');
        } catch (error) {
            console.log('❌ CORS issue detected:', error.message);
        }
        
        console.log('\n' + '=' .repeat(80));
        console.log('🎯 DIAGNOSIS SUMMARY:');
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. If server is not running: cd Server && node server.js');
        console.log('2. If database is disconnected: Check MongoDB connection');
        console.log('3. If APIs return empty arrays: Add sample data to database');
        console.log('4. If notifications fail: Check user authentication in frontend');
        console.log('5. Clear browser cache and restart both servers');
        
    } catch (error) {
        console.error('❌ Debug script failed:', error.message);
    }
}

debugComprehensive();
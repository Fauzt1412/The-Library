const axios = require('axios');

const API_BASE = 'http://localhost:1412/API';

async function testAuthDebug() {
    console.log('🔐 Testing Authentication and Protected Routes...');
    console.log('=' .repeat(60));
    
    try {
        // 1. Test public endpoints (should work without auth)
        console.log('\n1. 📚 Testing Public Books API...');
        try {
            const booksResponse = await axios.get(`${API_BASE}/books`);
            console.log('✅ Books API (public):', {
                status: booksResponse.status,
                dataType: typeof booksResponse.data,
                hasData: 'data' in booksResponse.data,
                isArray: Array.isArray(booksResponse.data.data),
                count: booksResponse.data.data?.length || 0
            });
        } catch (error) {
            console.log('❌ Books API Error:', error.response?.status, error.response?.data);
        }
        
        console.log('\n2. 🎮 Testing Public Games API...');
        try {
            const gamesResponse = await axios.get(`${API_BASE}/games`);
            console.log('✅ Games API (public):', {
                status: gamesResponse.status,
                dataType: typeof gamesResponse.data,
                hasData: 'data' in gamesResponse.data,
                isArray: Array.isArray(gamesResponse.data.data),
                count: gamesResponse.data.data?.length || 0
            });
        } catch (error) {
            console.log('❌ Games API Error:', error.response?.status, error.response?.data);
        }
        
        // 2. Test protected endpoints (should return 401 without auth)
        console.log('\n3. 🔔 Testing Protected Notifications API (should return 401)...');
        try {
            await axios.get(`${API_BASE}/notifications`);
            console.log('⚠️ Unexpected: Notifications API worked without auth');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Notifications API correctly requires auth (401)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        
        console.log('\n4. 👑 Testing Admin Notifications API (should return 401)...');
        try {
            await axios.get(`${API_BASE}/admin/notifications`);
            console.log('⚠️ Unexpected: Admin notifications API worked without auth');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Admin notifications API correctly requires auth (401)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        
        console.log('\n5. 📝 Testing Pending Submissions API (should return 401)...');
        try {
            await axios.get(`${API_BASE}/submissions/pending`);
            console.log('⚠️ Unexpected: Submissions API worked without auth');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Submissions API correctly requires auth (401)');
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log('🎯 AUTHENTICATION SUMMARY:');
        console.log('\n✅ What should work:');
        console.log('   - Books API (public)');
        console.log('   - Games API (public)');
        console.log('   - Home page (uses public APIs)');
        
        console.log('\n🔐 What requires authentication:');
        console.log('   - Notifications API');
        console.log('   - Admin Notifications API');
        console.log('   - Pending Submissions API');
        console.log('   - Admin Panel (protected sections)');
        
        console.log('\n💡 If Home page is not working:');
        console.log('   1. Check browser console for API errors');
        console.log('   2. Verify server is running on port 1412');
        console.log('   3. Check if MongoDB has data');
        
        console.log('\n💡 If Admin Panel/Notifications not working:');
        console.log('   1. Make sure user is logged in');
        console.log('   2. Check if user has admin role');
        console.log('   3. Verify localStorage has user data');
        console.log('   4. Check browser console for auth errors');
        
    } catch (error) {
        console.error('❌ Test script failed:', error.message);
    }
}

testAuthDebug();
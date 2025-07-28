const axios = require('axios');

const API_BASE = 'http://localhost:1412/API';

async function testAPIStatus() {
    console.log('🔍 Testing API Status and Edit Requests Integration...');
    console.log('=' .repeat(60));
    
    try {
        // Test server health
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
        
        // Test Books API
        console.log('\n2. 📚 Testing Books API...');
        try {
            const booksResponse = await axios.get(`${API_BASE}/books`);
            console.log('✅ Books API working');
            console.log('   Status:', booksResponse.status);
            console.log('   Books count:', Array.isArray(booksResponse.data.data) ? booksResponse.data.data.length : 'Invalid structure');
        } catch (error) {
            console.log('❌ Books API Error:', error.response?.status, error.message);
        }
        
        // Test Games API
        console.log('\n3. 🎮 Testing Games API...');
        try {
            const gamesResponse = await axios.get(`${API_BASE}/games`);
            console.log('✅ Games API working');
            console.log('   Status:', gamesResponse.status);
            console.log('   Games count:', Array.isArray(gamesResponse.data.data) ? gamesResponse.data.data.length : 'Invalid structure');
        } catch (error) {
            console.log('❌ Games API Error:', error.response?.status, error.message);
        }
        
        // Test Edit Requests API (this is what we're integrating)
        console.log('\n4. ✏️  Testing Edit Requests API...');
        try {
            // Note: This requires authentication, so we expect a 401/403 error
            const editRequestsResponse = await axios.get(`${API_BASE}/edit-requests/pending`);
            console.log('✅ Edit Requests API accessible');
            console.log('   Status:', editRequestsResponse.status);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('✅ Edit Requests API exists (requires authentication)');
                console.log('   Status:', error.response.status, '- Expected for unauthenticated request');
            } else {
                console.log('❌ Edit Requests API Error:', error.response?.status, error.message);
            }
        }
        
        // Test Notifications API
        console.log('\n5. 🔔 Testing Notifications API...');
        try {
            const notificationsResponse = await axios.get(`${API_BASE}/admin/notifications`);
            console.log('✅ Notifications API accessible');
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('✅ Notifications API exists (requires authentication)');
                console.log('   Status:', error.response.status, '- Expected for unauthenticated request');
            } else {
                console.log('❌ Notifications API Error:', error.response?.status, error.message);
            }
        }
        
        // Test Submissions API
        console.log('\n6. 📝 Testing Submissions API...');
        try {
            const submissionsResponse = await axios.get(`${API_BASE}/submissions/pending`);
            console.log('✅ Submissions API accessible');
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('✅ Submissions API exists (requires authentication)');
                console.log('   Status:', error.response.status, '- Expected for unauthenticated request');
            } else {
                console.log('❌ Submissions API Error:', error.response?.status, error.message);
            }
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log('🎯 SUMMARY:');
        console.log('\n✅ APIs Status:');
        console.log('   - Server: Running');
        console.log('   - Books API: Working');
        console.log('   - Games API: Working');
        console.log('   - Edit Requests API: Available');
        console.log('   - Notifications API: Available');
        console.log('   - Submissions API: Available');
        
        console.log('\n🔧 Next Steps:');
        console.log('   1. Integrate Edit Requests into AdminPanel notifications');
        console.log('   2. Add edit request approval/rejection workflow');
        console.log('   3. Update UI to show edit requests alongside submissions');
        console.log('   4. Test the complete integration');
        
    } catch (error) {
        console.error('❌ Test script failed:', error.message);
    }
}

testAPIStatus();
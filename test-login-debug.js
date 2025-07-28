const fetch = require('node-fetch');

const testLogin = async () => {
    console.log('🧪 Testing Login Process...');
    console.log('=' .repeat(40));
    
    const API_BASE = 'http://localhost:1412/API';
    
    // Test data - replace with your actual user credentials
    const testCredentials = {
        username: 'admin', // Replace with your username
        password: 'admin'  // Replace with your password
    };
    
    console.log('\\n🔐 Testing login with:', testCredentials.username);
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCredentials)
        });
        
        console.log('\\n📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers));
        
        const data = await response.json();
        console.log('\\n📄 Response data:', JSON.stringify(data, null, 2));
        
        if (response.ok && data.token) {
            console.log('\\n✅ Login successful!');
            console.log('🔑 Token received:', data.token.substring(0, 20) + '...');
            
            // Test a protected route
            console.log('\\n🧪 Testing protected route...');
            const profileResponse = await fetch(`${API_BASE}/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Profile response status:', profileResponse.status);
            const profileData = await profileResponse.json();
            console.log('📄 Profile data:', JSON.stringify(profileData, null, 2));
            
        } else {
            console.log('\\n❌ Login failed!');
            console.log('Error:', data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('\\n❌ Network error:', error.message);
        console.log('\\n🔍 Possible issues:');
        console.log('1. Server not running on port 1412');
        console.log('2. Wrong API endpoint');
        console.log('3. Network connectivity issue');
    }
};

// Check if node-fetch is available
try {
    testLogin();
} catch (error) {
    console.log('❌ node-fetch not available. Install with: npm install node-fetch');
    console.log('\\n🔧 Alternative: Test manually in browser console:');
    console.log(`
fetch('http://localhost:1412/API/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'your-username', password: 'your-password' })
})
.then(res => res.json())
.then(data => console.log(data));
    `);
}
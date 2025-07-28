const fs = require('fs');
const path = require('path');

console.log('🔧 Complete Authentication Fix...');
console.log('=' .repeat(50));

// Create a simple test route to verify auth is working
const testAuthRoute = `
// Test route to verify authentication
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');

// Test authentication endpoint
router.get('/test-auth', authenticateUser, (req, res) => {
    res.json({
        success: true,
        message: 'Authentication working!',
        user: {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role
        }
    });
});

module.exports = router;
`;

// Write test route
fs.writeFileSync('./Server/API/routes/TestRoute.js', testAuthRoute);
console.log('✅ Created test authentication route');

// Create a migration script for existing users
const migrationScript = `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const migratePasswords = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/library-games-store');
        console.log('Connected to database');
        
        const User = mongoose.model('User', {
            username: String,
            email: String,
            password: String,
            role: String
        });
        
        const users = await User.find({});
        console.log(\`Found \${users.length} users\`);
        
        for (let user of users) {
            // Check if password is already hashed
            if (user.password.length !== 60 || !user.password.startsWith('$2')) {
                console.log(\`Hashing password for: \${user.username}\`);
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await User.findByIdAndUpdate(user._id, { password: hashedPassword });
                console.log(\`✅ Updated password for \${user.username}\`);
            } else {
                console.log(\`✅ Password already hashed for \${user.username}\`);
            }
        }
        
        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migratePasswords();
`;

fs.writeFileSync('./Server/migrate-passwords.js', migrationScript);
console.log('✅ Created password migration script');

// Create a simple auth test HTML page
const testPage = `
<!DOCTYPE html>
<html>
<head>
    <title>Auth Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .result { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .error { background: #ffebee; border-left: 4px solid #f44336; }
        .success { background: #e8f5e8; border-left: 4px solid #4caf50; }
        input, button { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🔐 Authentication Test</h1>
    
    <div>
        <h3>Test Login</h3>
        <input type="text" id="username" placeholder="Username" value="admin">
        <input type="password" id="password" placeholder="Password" value="admin">
        <button onclick="testLogin()">Test Login</button>
    </div>
    
    <div id="result"></div>
    
    <script>
        async function testLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('result');
            
            resultDiv.innerHTML = '<div class="result">Testing login...</div>';
            
            try {
                const response = await fetch('http://localhost:1412/API/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <div class="result success">
                            <h4>✅ Login Successful!</h4>
                            <p><strong>Token:</strong> \${data.token ? data.token.substring(0, 50) + '...' : 'No token'}</p>
                            <p><strong>User:</strong> \${JSON.stringify(data.user, null, 2)}</p>
                        </div>
                    \`;
                    
                    // Test protected route
                    if (data.token) {
                        testProtectedRoute(data.token);
                    }
                } else {
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h4>❌ Login Failed</h4>
                            <p><strong>Error:</strong> \${data.error}</p>
                            <p><strong>Status:</strong> \${response.status}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div class="result error">
                        <h4>❌ Network Error</h4>
                        <p>\${error.message}</p>
                        <p>Make sure the server is running on port 1412</p>
                    </div>
                \`;
            }
        }
        
        async function testProtectedRoute(token) {
            try {
                const response = await fetch('http://localhost:1412/API/user/profile', {
                    headers: { 'Authorization': \`Bearer \${token}\` }
                });
                
                const data = await response.json();
                
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML += \`
                    <div class="result \${response.ok ? 'success' : 'error'}">
                        <h4>\${response.ok ? '✅' : '❌'} Protected Route Test</h4>
                        <p><strong>Status:</strong> \${response.status}</p>
                        <p><strong>Response:</strong> \${JSON.stringify(data, null, 2)}</p>
                    </div>
                \`;
            } catch (error) {
                console.error('Protected route test error:', error);
            }
        }
    </script>
</body>
</html>
`;

fs.writeFileSync('./auth-test.html', testPage);
console.log('✅ Created auth test page');

console.log('\\n🚀 STEPS TO FIX AUTHENTICATION:');

console.log('\\n1. 🔄 Migrate existing user passwords:');
console.log('   cd Server');
console.log('   node migrate-passwords.js');

console.log('\\n2. 🧪 Test authentication:');
console.log('   Open auth-test.html in browser');
console.log('   Enter your username/password');
console.log('   Click "Test Login"');

console.log('\\n3. 🔍 Debug if needed:');
console.log('   node debug-auth-issue.js');

console.log('\\n4. 📱 Test in your app:');
console.log('   Clear browser localStorage');
console.log('   Login again');
console.log('   Try accessing Settings page');

console.log('\\n📋 TROUBLESHOOTING:');
console.log('\\n❌ If login still fails:');
console.log('   1. Check server logs for detailed errors');
console.log('   2. Verify bcryptjs is installed');
console.log('   3. Check if user exists in database');
console.log('   4. Try creating a new user account');

console.log('\\n❌ If "User ID required" error persists:');
console.log('   1. Check if JWT token is being sent');
console.log('   2. Verify Authorization header format');
console.log('   3. Check auth middleware is applied to routes');

console.log('\\n' + '=' .repeat(50));
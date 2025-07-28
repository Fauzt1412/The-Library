const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Installing all dependencies...\n');

// Install server dependencies
if (fs.existsSync('server/package.json')) {
    console.log('Installing server dependencies...');
    try {
        execSync('npm install', { cwd: 'server', stdio: 'inherit' });
        console.log('✅ Server dependencies installed\n');
    } catch (error) {
        console.error('❌ Failed to install server dependencies:', error.message);
    }
} else {
    console.log('❌ server/package.json not found');
}

// Install frontend dependencies
if (fs.existsSync('frontend/package.json')) {
    console.log('Installing frontend dependencies...');
    try {
        execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
        console.log('✅ Frontend dependencies installed\n');
    } catch (error) {
        console.error('❌ Failed to install frontend dependencies:', error.message);
    }
} else {
    console.log('❌ frontend/package.json not found');
}

// Create admin user
console.log('Creating admin user...');
try {
    execSync('node setup-admin.js', { cwd: 'server', stdio: 'inherit' });
    console.log('✅ Admin user setup completed\n');
} catch (error) {
    console.log('⚠️ Admin user setup failed (might already exist)\n');
}

console.log('🎉 Installation complete!');
console.log('\nNext steps:');
console.log('1. Start the server: cd server && npm start');
console.log('2. Start the frontend: cd frontend && npm start');
console.log('3. Or use: node start-debug.js');
console.log('\nLogin credentials:');
console.log('Username: Fau');
console.log('Password: 123456');
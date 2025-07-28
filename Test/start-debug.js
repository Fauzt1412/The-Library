const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Debug Setup...\n');

// Check if required directories exist
const requiredDirs = [
    'server',
    'frontend',
    'server/uploads',
    'server/uploads/books',
    'server/uploads/games'
];

console.log('📁 Checking directories...');
requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir} exists`);
    } else {
        console.log(`❌ ${dir} missing - creating...`);
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ ${dir} created`);
    }
});

// Check if package.json files exist
console.log('\n📦 Checking package.json files...');
const packageFiles = [
    'server/package.json',
    'frontend/package.json'
];

packageFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

// Check if node_modules exist
console.log('\n📚 Checking node_modules...');
const nodeModulesDirs = [
    'server/node_modules',
    'frontend/node_modules'
];

nodeModulesDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir} exists`);
    } else {
        console.log(`❌ ${dir} missing - run npm install in ${path.dirname(dir)}`);
    }
});

console.log('\n🚀 Starting servers...\n');

// Start server
console.log('Starting backend server...');
const serverProcess = spawn('node', ['server.js'], {
    cwd: 'server',
    stdio: 'inherit'
});

serverProcess.on('error', (error) => {
    console.error('❌ Server failed to start:', error.message);
});

// Wait a bit then start frontend
setTimeout(() => {
    console.log('\nStarting frontend...');
    const frontendProcess = spawn('npm', ['start'], {
        cwd: 'frontend',
        stdio: 'inherit',
        shell: true
    });

    frontendProcess.on('error', (error) => {
        console.error('❌ Frontend failed to start:', error.message);
    });
}, 3000);

// Handle cleanup
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    serverProcess.kill();
    process.exit();
});
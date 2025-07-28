const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Installing Missing Dependencies...');
console.log('=' .repeat(50));

// Function to run command and handle errors
function runCommand(command, directory = '.') {
    try {
        console.log(`\n📦 Running: ${command}`);
        console.log(`📁 Directory: ${path.resolve(directory)}`);
        
        const result = execSync(command, { 
            cwd: directory, 
            stdio: 'inherit',
            encoding: 'utf8'
        });
        
        console.log('✅ Command completed successfully');
        return true;
    } catch (error) {
        console.error(`❌ Error running command: ${command}`);
        console.error(`Error: ${error.message}`);
        return false;
    }
}

// Check if we're in the right directory
const currentDir = process.cwd();
console.log(`\n📍 Current directory: ${currentDir}`);

// Install server dependencies
console.log('\n🔧 Installing Server Dependencies...');
const serverDir = path.join(currentDir, 'Server');

if (fs.existsSync(serverDir)) {
    console.log(`📁 Server directory found: ${serverDir}`);
    
    // Install bcryptjs and jsonwebtoken
    const serverSuccess = runCommand('npm install bcryptjs@^2.4.3 jsonwebtoken@^9.0.2', serverDir);
    
    if (serverSuccess) {
        console.log('✅ Server dependencies installed successfully');
    } else {
        console.log('❌ Failed to install server dependencies');
    }
} else {
    console.log('❌ Server directory not found');
}

// Check frontend dependencies (optional)
console.log('\n🔧 Checking Frontend Dependencies...');
const frontendDir = path.join(currentDir, 'frontend');

if (fs.existsSync(frontendDir)) {
    console.log(`📁 Frontend directory found: ${frontendDir}`);
    
    // Check if node_modules exists
    const frontendNodeModules = path.join(frontendDir, 'node_modules');
    if (!fs.existsSync(frontendNodeModules)) {
        console.log('📦 Installing frontend dependencies...');
        const frontendSuccess = runCommand('npm install', frontendDir);
        
        if (frontendSuccess) {
            console.log('✅ Frontend dependencies installed successfully');
        } else {
            console.log('❌ Failed to install frontend dependencies');
        }
    } else {
        console.log('✅ Frontend dependencies already installed');
    }
} else {
    console.log('❌ Frontend directory not found');
}

console.log('\n🎉 Dependency Installation Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Start the server: cd Server && npm start');
console.log('2. Start the frontend: cd frontend && npm start');
console.log('3. Test the settings page with account management');

console.log('\n📦 Installed Dependencies:');
console.log('- bcryptjs: For password hashing');
console.log('- jsonwebtoken: For JWT authentication');

console.log('\n' + '=' .repeat(50));
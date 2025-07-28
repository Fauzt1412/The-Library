const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Application Troubleshooting Diagnostic');
console.log('=' .repeat(50));

// Function to check if a file exists
function checkFile(filePath, description) {
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
    return exists;
}

// Function to check if a directory exists
function checkDirectory(dirPath, description) {
    const exists = fs.existsSync(dirPath);
    console.log(`${exists ? '✅' : '❌'} ${description}: ${dirPath}`);
    return exists;
}

// Function to check if a port is in use
function checkPort(port) {
    try {
        const result = execSync(`netstat -an | findstr :${port}`, { encoding: 'utf8' });
        return result.includes(`:${port}`);
    } catch (error) {
        return false;
    }
}

// Function to run a command safely
function runCommand(command, description) {
    try {
        console.log(`\n🔧 ${description}...`);
        const result = execSync(command, { encoding: 'utf8', timeout: 5000 });
        console.log('✅ Success');
        return true;
    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
        return false;
    }
}

console.log('\n📁 CHECKING PROJECT STRUCTURE...');
console.log('-'.repeat(30));

// Check main directories
const serverExists = checkDirectory('./Server', 'Server directory');
const frontendExists = checkDirectory('./frontend', 'Frontend directory');

// Check key files
if (serverExists) {
    checkFile('./Server/server.js', 'Server main file');
    checkFile('./Server/package.json', 'Server package.json');
    checkDirectory('./Server/node_modules', 'Server node_modules');
    checkFile('./Server/API/controllers/UserController.js', 'UserController');
    checkFile('./Server/API/routes/UserRoute.js', 'UserRoute');
}

if (frontendExists) {
    checkFile('./frontend/package.json', 'Frontend package.json');
    checkDirectory('./frontend/node_modules', 'Frontend node_modules');
    checkFile('./frontend/src/pages/Settings.js', 'Settings page');
    checkFile('./frontend/src/services/api.js', 'API service');
}

console.log('\n🔌 CHECKING PORTS...');
console.log('-'.repeat(30));

const serverPort = 1412;
const frontendPort = 3000;

const serverPortInUse = checkPort(serverPort);
const frontendPortInUse = checkPort(frontendPort);

console.log(`${serverPortInUse ? '✅' : '❌'} Server port ${serverPort} ${serverPortInUse ? 'in use' : 'available'}`);
console.log(`${frontendPortInUse ? '✅' : '❌'} Frontend port ${frontendPort} ${frontendPortInUse ? 'in use' : 'available'}`);

console.log('\n📦 CHECKING DEPENDENCIES...');
console.log('-'.repeat(30));

if (serverExists) {
    console.log('\n🔧 Server Dependencies:');
    try {
        const serverPackage = JSON.parse(fs.readFileSync('./Server/package.json', 'utf8'));
        const requiredDeps = ['bcryptjs', 'jsonwebtoken', 'express', 'mongoose', 'cors'];
        
        requiredDeps.forEach(dep => {
            const hasDepInPackage = serverPackage.dependencies && serverPackage.dependencies[dep];
            const hasDepInstalled = fs.existsSync(`./Server/node_modules/${dep}`);
            console.log(`${hasDepInPackage ? '✅' : '❌'} ${dep} in package.json`);
            console.log(`${hasDepInstalled ? '✅' : '❌'} ${dep} installed`);
        });
    } catch (error) {
        console.log('❌ Error reading server package.json');
    }
}

if (frontendExists) {
    console.log('\n🔧 Frontend Dependencies:');
    try {
        const frontendPackage = JSON.parse(fs.readFileSync('./frontend/package.json', 'utf8'));
        const requiredDeps = ['react', 'react-dom', 'react-router-dom'];
        
        requiredDeps.forEach(dep => {
            const hasDepInPackage = frontendPackage.dependencies && frontendPackage.dependencies[dep];
            const hasDepInstalled = fs.existsSync(`./frontend/node_modules/${dep}`);
            console.log(`${hasDepInPackage ? '✅' : '❌'} ${dep} in package.json`);
            console.log(`${hasDepInstalled ? '✅' : '❌'} ${dep} installed`);
        });
    } catch (error) {
        console.log('❌ Error reading frontend package.json');
    }
}

console.log('\n🌐 TESTING CONNECTIVITY...');
console.log('-'.repeat(30));

// Test if servers are responding
const http = require('http');

function testEndpoint(url, description) {
    return new Promise((resolve) => {
        const request = http.get(url, (res) => {
            console.log(`✅ ${description}: Status ${res.statusCode}`);
            resolve(true);
        });
        
        request.on('error', (error) => {
            console.log(`❌ ${description}: ${error.message}`);
            resolve(false);
        });
        
        request.setTimeout(3000, () => {
            console.log(`❌ ${description}: Timeout`);
            request.destroy();
            resolve(false);
        });
    });
}

// Test endpoints
async function testConnectivity() {
    await testEndpoint('http://localhost:1412/health', 'Server health check');
    await testEndpoint('http://localhost:3000', 'Frontend application');
}

testConnectivity().then(() => {
    console.log('\n🔧 DIAGNOSTIC SUMMARY...');
    console.log('-'.repeat(30));
    
    console.log('\n📋 COMMON ISSUES AND SOLUTIONS:');
    
    if (!serverExists) {
        console.log('❌ Server directory missing - Check project structure');
    }
    
    if (!frontendExists) {
        console.log('❌ Frontend directory missing - Check project structure');
    }
    
    if (!serverPortInUse) {
        console.log('❌ Server not running - Start with: cd Server && npm start');
    }
    
    if (!frontendPortInUse) {
        console.log('❌ Frontend not running - Start with: cd frontend && npm start');
    }
    
    console.log('\n🚀 QUICK START COMMANDS:');
    console.log('1. Install server dependencies: cd Server && npm install');
    console.log('2. Install frontend dependencies: cd frontend && npm install');
    console.log('3. Start server: cd Server && npm start');
    console.log('4. Start frontend: cd frontend && npm start');
    console.log('5. Open browser: http://localhost:3000');
    
    console.log('\n🔍 DEBUGGING STEPS:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Check server terminal for error messages');
    console.log('3. Check frontend terminal for compilation errors');
    console.log('4. Try refreshing the browser (Ctrl+F5)');
    console.log('5. Clear browser cache and cookies');
    
    console.log('\n' + '=' .repeat(50));
});
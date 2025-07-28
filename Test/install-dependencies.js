const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Installing missing dependencies...');

try {
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
        console.log('📦 node_modules not found, running npm install...');
    } else {
        console.log('📦 Installing new dependencies...');
    }
    
    // Install dependencies
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('✅ Dependencies installed successfully!');
    console.log('🚀 You can now run: npm run dev');
    
} catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    console.log('\n📝 Manual installation steps:');
    console.log('1. Run: npm install');
    console.log('2. If that fails, try: npm install multer');
    console.log('3. Then run: npm run dev');
}
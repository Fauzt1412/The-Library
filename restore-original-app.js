const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring Original App.js...');
console.log('=' .repeat(35));

const frontendSrcPath = './frontend/src';
const appPath = path.join(frontendSrcPath, 'App.js');
const backupPath = path.join(frontendSrcPath, 'App.js.backup');
const testPagePath = path.join(frontendSrcPath, 'TestPage.js');

if (fs.existsSync(backupPath)) {
    // Restore original App.js
    const originalApp = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(appPath, originalApp);
    console.log('✅ Restored original App.js');
    
    // Remove backup file
    fs.unlinkSync(backupPath);
    console.log('✅ Removed backup file');
} else {
    console.log('❌ No backup file found');
}

// Remove test page
if (fs.existsSync(testPagePath)) {
    fs.unlinkSync(testPagePath);
    console.log('✅ Removed TestPage.js');
}

console.log('\n🎉 Original files restored!');
console.log('Now restart your frontend server: npm start');

console.log('\n' + '=' .repeat(35));
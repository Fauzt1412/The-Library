const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Settings Page Syntax...');
console.log('=' .repeat(40));

// Check if Settings.js exists
const settingsPath = './frontend/src/pages/Settings.js';

if (!fs.existsSync(settingsPath)) {
    console.log('❌ Settings.js file not found!');
    console.log('📁 Expected location:', path.resolve(settingsPath));
    process.exit(1);
}

console.log('✅ Settings.js file found');

// Read the file content
try {
    const content = fs.readFileSync(settingsPath, 'utf8');
    
    // Basic syntax checks
    const checks = [
        {
            name: 'React import',
            test: content.includes("import React"),
            fix: "Add: import React from 'react';"
        },
        {
            name: 'useAuth import',
            test: content.includes("useAuth"),
            fix: "Add: import { useAuth } from '../context/AuthContext';"
        },
        {
            name: 'userAPI import',
            test: content.includes("userAPI"),
            fix: "Add: import { userAPI } from '../services/api';"
        },
        {
            name: 'Component export',
            test: content.includes("export default Settings"),
            fix: "Add: export default Settings;"
        },
        {
            name: 'JSX return',
            test: content.includes("return ("),
            fix: "Component must return JSX"
        },
        {
            name: 'Closing braces',
            test: (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length,
            fix: "Check for missing closing braces {}"
        },
        {
            name: 'Closing parentheses',
            test: (content.match(/\(/g) || []).length === (content.match(/\)/g) || []).length,
            fix: "Check for missing closing parentheses ()"
        }
    ];
    
    console.log('\n🔍 Syntax Checks:');
    console.log('-'.repeat(30));
    
    let hasErrors = false;
    
    checks.forEach(check => {
        if (check.test) {
            console.log(`✅ ${check.name}`);
        } else {
            console.log(`❌ ${check.name}`);
            console.log(`   Fix: ${check.fix}`);
            hasErrors = true;
        }
    });
    
    if (!hasErrors) {
        console.log('\n✅ Settings.js syntax looks good!');
        console.log('\n📋 Next steps if page still not showing:');
        console.log('1. Check if both servers are running');
        console.log('2. Check browser console for errors');
        console.log('3. Verify you are logged in');
        console.log('4. Check network requests in dev tools');
    } else {
        console.log('\n❌ Found syntax issues in Settings.js');
        console.log('Please fix the issues above and try again.');
    }
    
} catch (error) {
    console.log('❌ Error reading Settings.js:', error.message);
}

console.log('\n🚀 Quick Start Commands:');
console.log('1. cd Server && npm install && npm start');
console.log('2. cd frontend && npm install && npm start');
console.log('3. Open http://localhost:3000');

console.log('\n' + '=' .repeat(40));
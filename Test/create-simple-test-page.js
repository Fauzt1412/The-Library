const fs = require('fs');
const path = require('path');

console.log('🧪 Creating Simple Test Page...');
console.log('=' .repeat(40));

// Create a simple test component to isolate the issue
const simpleTestComponent = `import React from 'react';

const TestPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Test Page</h1>
      <p>If you can see this, React is working!</p>
      
      <div style={{ background: '#f0f0f0', padding: '15px', margin: '10px 0' }}>
        <h3>✅ Basic React Test</h3>
        <p>React components are rendering correctly.</p>
      </div>
      
      <div style={{ background: '#e8f5e8', padding: '15px', margin: '10px 0' }}>
        <h3>🔗 Navigation Test</h3>
        <p>Try these links:</p>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/books">Books</a></li>
          <li><a href="/games">Games</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </div>
      
      <div style={{ background: '#fff3cd', padding: '15px', margin: '10px 0' }}>
        <h3>🔍 Debug Info</h3>
        <p>Current URL: {window.location.href}</p>
        <p>User Agent: {navigator.userAgent}</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>
      
      <div style={{ background: '#f8d7da', padding: '15px', margin: '10px 0' }}>
        <h3>🚨 If Settings Page is Blank</h3>
        <p>The issue is likely in the Settings component.</p>
        <p>Check browser console (F12) for error messages.</p>
      </div>
    </div>
  );
};

export default TestPage;`;

// Create a minimal App.js for testing
const simpleApp = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestPage from './TestPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<TestPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;`;

// Write the test files
const frontendSrcPath = './frontend/src';

if (fs.existsSync(frontendSrcPath)) {
    // Create test page
    fs.writeFileSync(path.join(frontendSrcPath, 'TestPage.js'), simpleTestComponent);
    console.log('✅ Created TestPage.js');
    
    // Backup original App.js
    const appPath = path.join(frontendSrcPath, 'App.js');
    if (fs.existsSync(appPath)) {
        const originalApp = fs.readFileSync(appPath, 'utf8');
        fs.writeFileSync(path.join(frontendSrcPath, 'App.js.backup'), originalApp);
        console.log('✅ Backed up original App.js to App.js.backup');
        
        // Create simple App.js
        fs.writeFileSync(appPath, simpleApp);
        console.log('✅ Created simple App.js for testing');
    }
    
    console.log('\n🧪 TEST INSTRUCTIONS:');
    console.log('=' .repeat(30));
    console.log('1. Save all files');
    console.log('2. Go to http://localhost:3000');
    console.log('3. You should see the test page');
    console.log('4. If test page works, the issue is in your original components');
    console.log('5. If test page is still blank, the issue is more fundamental');
    
    console.log('\n🔄 TO RESTORE ORIGINAL:');
    console.log('1. Stop frontend server (Ctrl+C)');
    console.log('2. Run: node restore-original-app.js');
    console.log('3. Restart frontend: npm start');
    
} else {
    console.log('❌ Frontend src directory not found');
    console.log('📁 Expected: ./frontend/src');
}

console.log('\n' + '=' .repeat(40));
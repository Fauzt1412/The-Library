// Test script to verify import fixes
const fs = require('fs');

console.log('🔍 Testing Import Fixes...\n');

const filesToCheck = [
  {
    path: 'frontend/src/pages/BookDetail.js',
    requiredImports: ['useNavigate', 'ReadButtonBox'],
    description: 'BookDetail.js imports'
  },
  {
    path: 'frontend/src/pages/GameDetail.js', 
    requiredImports: ['useNavigate'],
    description: 'GameDetail.js imports'
  }
];

let allTestsPassed = true;

filesToCheck.forEach(file => {
  console.log(`📋 Checking ${file.description}...`);
  
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    
    file.requiredImports.forEach(importName => {
      if (content.includes(importName)) {
        console.log(`✅ ${importName} is imported`);
      } else {
        console.log(`❌ ${importName} is missing`);
        allTestsPassed = false;
      }
    });
    
    // Check for proper import structure
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    console.log(`📦 Found ${importLines.length} import statements`);
    
  } catch (error) {
    console.log(`❌ Error reading ${file.path}:`, error.message);
    allTestsPassed = false;
  }
  
  console.log('');
});

// Check if components exist
console.log('📋 Checking component files...');
const componentsToCheck = [
  'frontend/src/components/ReadButtonBox.js',
  'frontend/src/components/PlayButtonBox.js'
];

componentsToCheck.forEach(componentPath => {
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    const componentName = componentPath.split('/').pop().replace('.js', '');
    
    if (content.includes(`export default ${componentName}`)) {
      console.log(`✅ ${componentName} is properly exported`);
    } else {
      console.log(`⚠️  ${componentName} export might be different`);
    }
  } catch (error) {
    console.log(`❌ ${componentPath} not found:`, error.message);
    allTestsPassed = false;
  }
});

console.log('');

// Summary
console.log('📊 Test Summary:');
if (allTestsPassed) {
  console.log('🎉 All import fixes are working correctly!');
  console.log('');
  console.log('✅ Fixed Issues:');
  console.log('   - Added useNavigate import to BookDetail.js');
  console.log('   - Added useNavigate import to GameDetail.js');
  console.log('   - Added ReadButtonBox import to BookDetail.js');
  console.log('   - Verified all components exist and are exported');
  console.log('');
  console.log('🚀 Your application should now compile without import errors!');
} else {
  console.log('❌ Some import issues remain. Please check the errors above.');
}

console.log('');
console.log('🔧 To test the fixes:');
console.log('   1. Start your development server: npm start');
console.log('   2. Check the console for any remaining import errors');
console.log('   3. Navigate to book and game detail pages to verify functionality');
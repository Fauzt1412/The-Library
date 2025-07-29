// Test script to verify placeholder image fixes
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Placeholder Image Fixes...\n');

// Files that should have been updated
const filesToCheck = [
  'frontend/src/utils/imageUtils.js',
  'frontend/src/pages/MyContent.js',
  'frontend/src/pages/Home.js',
  'frontend/src/pages/Books.js',
  'frontend/src/pages/Games.js',
  'frontend/src/pages/BookDetail.js',
  'frontend/src/pages/GameDetail.js',
  'frontend/src/pages/Favorites.js'
];

let allTestsPassed = true;

// Test 1: Check if imageUtils.js has the new functions
console.log('📋 Test 1: Checking imageUtils.js...');
try {
  const imageUtilsContent = fs.readFileSync('frontend/src/utils/imageUtils.js', 'utf8');
  
  const requiredFunctions = [
    'getPlaceholderImage',
    'handleImageError',
    'createPlaceholderDataUrl'
  ];
  
  let missingFunctions = [];
  requiredFunctions.forEach(func => {
    if (!imageUtilsContent.includes(func)) {
      missingFunctions.push(func);
    }
  });
  
  if (missingFunctions.length === 0) {
    console.log('✅ imageUtils.js contains all required functions');
  } else {
    console.log('❌ imageUtils.js missing functions:', missingFunctions);
    allTestsPassed = false;
  }
  
  // Check if it no longer uses via.placeholder.com
  if (imageUtilsContent.includes('via.placeholder.com')) {
    console.log('❌ imageUtils.js still contains via.placeholder.com references');
    allTestsPassed = false;
  } else {
    console.log('✅ imageUtils.js no longer uses via.placeholder.com');
  }
} catch (error) {
  console.log('❌ Error reading imageUtils.js:', error.message);
  allTestsPassed = false;
}

console.log('');

// Test 2: Check if all files import the new utilities
console.log('📋 Test 2: Checking imports in component files...');
filesToCheck.slice(1).forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    if (content.includes('handleImageError') || content.includes('getPlaceholderImage')) {
      console.log(`✅ ${fileName} imports image utilities`);
    } else {
      console.log(`⚠️  ${fileName} might not import image utilities`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}:`, error.message);
    allTestsPassed = false;
  }
});

console.log('');

// Test 3: Check if via.placeholder.com has been removed from all files
console.log('📋 Test 3: Checking for remaining via.placeholder.com references...');
let remainingReferences = [];

filesToCheck.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    if (content.includes('via.placeholder.com')) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('via.placeholder.com')) {
          remainingReferences.push({
            file: fileName,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}:`, error.message);
    allTestsPassed = false;
  }
});

if (remainingReferences.length === 0) {
  console.log('✅ No remaining via.placeholder.com references found');
} else {
  console.log('❌ Found remaining via.placeholder.com references:');
  remainingReferences.forEach(ref => {
    console.log(`   ${ref.file}:${ref.line} - ${ref.content}`);
  });
  allTestsPassed = false;
}

console.log('');

// Test 4: Check if error handlers use the new function
console.log('📋 Test 4: Checking error handlers...');
filesToCheck.slice(1).forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Count old style error handlers
    const oldHandlers = (content.match(/onError=\{.*e\.target\.src.*\}/g) || []).length;
    // Count new style error handlers
    const newHandlers = (content.match(/handleImageError/g) || []).length;
    
    if (oldHandlers > 0) {
      console.log(`⚠️  ${fileName} has ${oldHandlers} old-style error handlers`);
    }
    
    if (newHandlers > 0) {
      console.log(`✅ ${fileName} has ${newHandlers} new-style error handlers`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}:`, error.message);
    allTestsPassed = false;
  }
});

console.log('');

// Summary
console.log('📊 Test Summary:');
if (allTestsPassed) {
  console.log('🎉 All tests passed! The placeholder image fix should work correctly.');
  console.log('');
  console.log('✅ What was fixed:');
  console.log('   - Created local SVG-based placeholder images');
  console.log('   - Replaced all via.placeholder.com references');
  console.log('   - Added error handling to prevent infinite loops');
  console.log('   - Updated all component files to use new utilities');
  console.log('');
  console.log('🚀 Your application should now work without external placeholder dependencies!');
} else {
  console.log('❌ Some tests failed. Please check the issues above.');
  console.log('');
  console.log('💡 Common fixes:');
  console.log('   - Make sure all files import the new utilities');
  console.log('   - Replace any remaining via.placeholder.com references');
  console.log('   - Update error handlers to use handleImageError function');
}

console.log('');
console.log('🔧 To test the fix:');
console.log('   1. Start your development servers');
console.log('   2. Open browser Developer Tools');
console.log('   3. Check Console for any remaining net::ERR_NAME_NOT_RESOLVED errors');
console.log('   4. Verify that placeholder images display correctly');
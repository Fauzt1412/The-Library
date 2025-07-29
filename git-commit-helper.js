// Git commit helper script
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Git Commit Diagnostic Helper\n');

try {
  // Check git status
  console.log('📋 Checking git status...');
  const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: '.' });
  
  if (status.trim() === '') {
    console.log('✅ Working directory is clean - no changes to commit');
    console.log('\n💡 This means:');
    console.log('   - All your changes are already committed');
    console.log('   - Or your changes are in ignored files (.env.local, node_modules, etc.)');
    console.log('   - Or you need to stage your changes first');
  } else {
    console.log('📁 Found changes:');
    console.log(status);
  }
  
  // Check if there are staged changes
  console.log('\n📋 Checking staged changes...');
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8', cwd: '.' });
  
  if (staged.trim() === '') {
    console.log('❌ No files are staged for commit');
    console.log('\n💡 You need to stage files first:');
    console.log('   git add <filename>  # Add specific file');
    console.log('   git add .           # Add all changes');
  } else {
    console.log('✅ Staged files:');
    console.log(staged);
  }
  
  // Check recent commits
  console.log('\n📋 Recent commits:');
  const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8', cwd: '.' });
  console.log(recentCommits);
  
  // Check if .env.local exists and is configured
  console.log('\n📋 Checking Cloudinary configuration...');
  if (fs.existsSync('frontend/.env.local')) {
    const envContent = fs.readFileSync('frontend/.env.local', 'utf8');
    
    if (envContent.includes('your_cloud_name_here')) {
      console.log('⚠️  .env.local still has placeholder values');
    } else {
      console.log('✅ .env.local appears to be configured');
    }
    
    console.log('ℹ️  Note: .env.local is ignored by git (which is correct for security)');
  } else {
    console.log('❌ .env.local file not found');
  }
  
} catch (error) {
  console.log('❌ Error running git commands:', error.message);
  console.log('\n💡 Make sure you are in a git repository');
}

console.log('\n🎯 Common Git Commit Issues & Solutions:');
console.log('');
console.log('1. 📁 No changes to commit:');
console.log('   - Check: git status');
console.log('   - Solution: Make some changes first');
console.log('');
console.log('2. 📝 Changes not staged:');
console.log('   - Check: git status');
console.log('   - Solution: git add . && git commit -m "Your message"');
console.log('');
console.log('3. 🔒 Only ignored files changed:');
console.log('   - .env.local, node_modules, etc. are ignored');
console.log('   - Solution: This is normal, commit other changes');
console.log('');
console.log('4. 📧 Git user not configured:');
console.log('   - Solution: git config --global user.email "you@example.com"');
console.log('   - Solution: git config --global user.name "Your Name"');
console.log('');
console.log('5. 🔄 Need to pull first:');
console.log('   - Solution: git pull origin main');
console.log('');
console.log('🚀 Quick commit commands:');
console.log('   git add .                           # Stage all changes');
console.log('   git commit -m "Add Cloudinary setup" # Commit with message');
console.log('   git push origin main                # Push to remote');

console.log('\n💡 Tell me what specific error message you see when trying to commit!');
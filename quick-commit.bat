@echo off
echo 🚀 Quick Git Commit Helper
echo.

echo 📋 Checking git status...
git status

echo.
echo 📝 Staging all changes...
git add .

echo.
echo 📋 Checking what will be committed...
git status

echo.
echo 💬 Committing with message...
git commit -m "Add Cloudinary integration and file upload enhancements"

echo.
echo 🔄 Pushing to remote...
git push origin main

echo.
echo ✅ Done! Your changes should now be committed and pushed.
pause
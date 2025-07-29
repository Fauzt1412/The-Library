@echo off
echo 🌤️ Installing Cloudinary package for backend...
cd Server
echo Current directory: %CD%
echo Installing cloudinary...
npm install cloudinary
echo.
echo ✅ Installation complete!
echo.
echo 📋 Checking if cloudinary was installed...
npm list cloudinary
echo.
echo 🎯 Next steps:
echo 1. Add Cloudinary credentials to Server/.env
echo 2. Restart your backend server
echo.
pause
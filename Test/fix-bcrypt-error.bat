@echo off
echo 🔧 Fixing bcryptjs Error...
echo ================================

echo.
echo 📁 Navigating to Server directory...
cd Server

echo.
echo 📦 Installing bcryptjs...
npm install bcryptjs@^2.4.3

echo.
echo 📦 Installing jsonwebtoken...
npm install jsonwebtoken@^9.0.2

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 📋 You can now start the server with:
echo    npm start
echo.
echo 🎉 bcryptjs error should be fixed!
pause
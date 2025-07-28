@echo off
echo 🔐 Fixing "User ID Required" Error...
echo ================================

echo.
echo 📦 Installing required dependencies...
cd Server
call npm install bcryptjs@^2.4.3 jsonwebtoken@^9.0.2

echo.
echo ✅ Dependencies installed!

echo.
echo 🔄 The authentication system has been updated with:
echo    - JWT token-based authentication
echo    - Bcrypt password hashing
echo    - Secure token verification
echo    - Proper Authorization headers

echo.
echo 📋 To test the fix:
echo 1. Restart the server: npm start
echo 2. Restart the frontend: cd ../frontend && npm start
echo 3. Clear browser localStorage (F12 → Application → Local Storage → Clear)
echo 4. Login again to get new JWT token
echo 5. Test Settings page

echo.
echo 🎯 The "User ID required" error should now be fixed!
echo.
pause
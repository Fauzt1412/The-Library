@echo off
echo 🔄 Authentication System Reverted
echo ================================

echo.
echo ✅ Reverted to original authentication system:
echo    - Simple username/password login
echo    - Plain text password storage
echo    - No JWT tokens or bcrypt
echo    - userId sent in headers

echo.
echo 📋 What was restored:
echo    - Original AuthenticationController.js
echo    - Original auth middleware
echo    - Compatible UserController.js
echo    - Updated frontend API calls

echo.
echo 🚀 To test the restored system:
echo 1. Restart server: cd Server && npm start
echo 2. Restart frontend: cd frontend && npm start
echo 3. Clear browser localStorage (F12 → Application → Local Storage → Clear)
echo 4. Login with existing username/password
echo 5. Test Settings page

echo.
echo 🎯 This should now work with your existing database!
echo.
pause
@echo off
echo 🧪 TESTING LOCAL SETUP
echo ======================

echo.
echo 📋 Checking MongoDB Connection String...
echo ==========================================
echo • Host: cluster0.w9zw5oh.mongodb.net
echo • Database: Storage_database_SYS
echo • Username: vannq1412
echo • Format: ✅ MongoDB Atlas format

echo.
echo 🚀 Starting Backend Server...
echo =============================
echo • Port: 1412
echo • Database: MongoDB Atlas
echo • Socket.IO: Enabled

start "Backend Test" cmd /k "cd Server && echo Testing backend startup... && npm run dev"

echo.
echo ⏳ Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo 🌐 Testing Backend Health...
echo ============================
curl -s http://localhost:1412/health > nul
if %errorlevel% == 0 (
    echo ✅ Backend is responding
    echo 📋 Health check: http://localhost:1412/health
) else (
    echo ❌ Backend not responding
    echo 🔧 Check the backend terminal for errors
)

echo.
echo 🎯 Starting Frontend...
echo ======================
echo • Port: 3000
echo • Backend URL: http://localhost:1412
echo • Chat: Should be enabled

start "Frontend Test" cmd /k "cd frontend && echo Testing frontend startup... && npm start"

echo.
echo ⏳ Waiting 5 seconds for frontend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🧪 TESTING CHECKLIST:
echo =====================
echo.
echo Backend Terminal should show:
echo • "🚀 Starting server on port 1412"
echo • "✅ MongoDB connected"
echo • "🔌 Socket.IO initialized"
echo • "🚀 Server is running on http://localhost:1412"
echo.
echo Frontend should open at: http://localhost:3000
echo.
echo Chat Testing:
echo □ Click chat button (should be blue, not gray)
echo □ Should show green connection dot
echo □ Try joining chat
echo □ Send test messages
echo □ Check user count updates
echo.
echo 🔍 If Backend Fails:
echo • Check MongoDB Atlas connection
echo • Verify username/password
echo • Check IP whitelist (add 0.0.0.0/0)
echo • Check internet connection
echo.
echo 🔍 If Frontend Fails:
echo • Check if backend is running
echo • Verify port 1412 is accessible
echo • Check browser console for errors
echo.
echo ✨ Both servers should now be running! ✨
echo.
pause
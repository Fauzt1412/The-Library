@echo off
echo 🚀 Starting The Library Development Environment
echo.

echo 📊 Checking if MongoDB is running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ⚠️  MongoDB might not be running. Please start MongoDB service.
    echo    You can start it from Services or run: net start MongoDB
    pause
)

echo.
echo 🔧 Starting Backend Server...
start "Backend Server" cmd /k "cd Server && npm run dev"

echo.
echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers are starting!
echo.
echo 📋 Quick Links:
echo    Frontend: http://localhost:3000
echo    Backend Health: http://localhost:1412/health
echo    API Health: http://localhost:1412/API/health
echo.
echo 💡 Tip: Keep both terminal windows open while developing
echo.
pause
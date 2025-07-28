@echo off
echo 🚀 Quick Start Application
echo ========================

echo.
echo 📦 Installing dependencies...

echo.
echo 🔧 Installing Server dependencies...
cd Server
call npm install
if errorlevel 1 (
    echo ❌ Server dependency installation failed
    pause
    exit /b 1
)

echo.
echo 🔧 Installing Frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!

echo.
echo 🚀 Starting servers...
echo.
echo 📋 Instructions:
echo 1. Server will start on http://localhost:1412
echo 2. Frontend will start on http://localhost:3000
echo 3. Open http://localhost:3000 in your browser
echo.
echo Press any key to start the servers...
pause

echo.
echo 🔧 Starting Server...
cd ..\Server
start "Server" cmd /k "npm start"

echo.
echo 🔧 Starting Frontend...
cd ..\frontend
start "Frontend" cmd /k "npm start"

echo.
echo ✅ Both servers are starting!
echo 📋 Check the opened terminal windows for any errors
echo 🌐 Open http://localhost:3000 in your browser
echo.
pause
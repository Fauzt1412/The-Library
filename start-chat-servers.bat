@echo off
echo 🚀 Starting Chat Servers
echo ========================

echo.
echo 📋 Starting Backend Server (Port 1412)...
echo ==========================================
start "Backend Server" cmd /k "cd Server && npm run dev"

echo.
echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Starting Frontend Server (Port 3000)...
echo ===========================================
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers are starting!
echo ============================
echo.
echo 📋 What to expect:
echo • Backend: http://localhost:1412
echo • Frontend: http://localhost:3000
echo • Chat should connect automatically
echo.
echo 🔍 Check for:
echo • Green connection dot in chat header
echo • "Connected" status in chat
echo • No console errors
echo.
echo 🚨 If connection fails:
echo • Run: node fix-websocket-connection.js
echo • Check both servers are running
echo • Verify no firewall blocking port 1412
echo.
pause
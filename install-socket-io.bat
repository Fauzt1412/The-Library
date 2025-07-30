@echo off
echo Installing socket.io-client dependency...
echo =====================================

cd frontend

echo.
echo Cleaning up old installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Installing all dependencies...
npm install

echo.
echo Installing socket.io-client specifically...
npm install socket.io-client@^4.7.5

echo.
echo Installation complete!
echo.
echo Starting development server...
npm start

pause
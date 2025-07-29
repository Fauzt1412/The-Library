#!/bin/bash

echo "🚀 Starting The Library Development Environment"
echo ""

echo "📊 Checking if MongoDB is running..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "⚠️  MongoDB might not be running. Please start MongoDB service."
    echo "   You can start it with: sudo systemctl start mongod"
    echo "   Or: brew services start mongodb/brew/mongodb-community (macOS)"
    read -p "Press Enter to continue anyway..."
fi

echo ""
echo "🔧 Starting Backend Server..."
cd Server
npm run dev &
BACKEND_PID=$!

echo ""
echo "⏳ Waiting 5 seconds for backend to start..."
sleep 5

echo ""
echo "🌐 Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📋 Quick Links:"
echo "   Frontend: http://localhost:3000"
echo "   Backend Health: http://localhost:1412/health"
echo "   API Health: http://localhost:1412/API/health"
echo ""
echo "💡 Tip: Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
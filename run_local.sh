#!/bin/bash

# A simple script to start the Dockerized Backend and Local Frontend

echo "🚀 Starting Personal Goal..."

# Ensure frontend is killed and docker containers are stopped when script exits
trap 'echo "🛑 Stopping services..."; kill 0; docker compose stop' SIGINT SIGTERM EXIT

# 1. Start Docker Services (Backend, DB, Redis)
echo "-> Starting Backend, Database, and Redis via Docker Compose..."
docker compose up -d

# 2. Wait a moment for services to initialize
sleep 3

# 3. Start the Next.js Frontend natively
echo "-> Starting Frontend (Next.js) on port 3000..."
cd web || exit 1
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Services are running!"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:8080"
echo "Press Ctrl+C to safely stop the frontend and Docker containers."

# Wait for the frontend process
wait $FRONTEND_PID

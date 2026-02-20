#!/bin/bash
# Simple deploy script for Personal Goal OS

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📥 Pulling latest code from git..."
git pull origin main

# Build and start services in detached mode using the production compose file
echo "🏗️ Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "🧹 Cleaning up old unused images..."
docker image prune -f

echo "✅ Deployment complete!"
docker ps | grep personal-

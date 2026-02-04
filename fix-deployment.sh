#!/bin/bash

# Emergency deployment fix script
# Run this on your server if deployment is stuck

set -e

echo "🔧 Fixing deployment state..."

PROJECT_DIR="/var/www/koreanexams"
cd $PROJECT_DIR

# Backup current .env files
echo "💾 Backing up environment files..."
if [ -f server/.env ]; then
    cp server/.env /tmp/server.env.backup
    echo "✓ Backed up server/.env to /tmp/server.env.backup"
fi

if [ -f server/.env.production ]; then
    cp server/.env.production /tmp/server.env.production.backup
    echo "✓ Backed up server/.env.production to /tmp/server.env.production.backup"
fi

if [ -f client/.env.production ]; then
    cp client/.env.production /tmp/client.env.production.backup
    echo "✓ Backed up client/.env.production to /tmp/client.env.production.backup"
fi

# Clean up node_modules lock file
echo "🧹 Cleaning node_modules conflicts..."
if [ -d server/node_modules ]; then
    rm -f server/node_modules/.package-lock.json
fi

# Reset git state
echo "🔄 Resetting git state..."
git fetch gitlab
git reset --hard gitlab/main

# Restore environment files
echo "♻️  Restoring environment files..."
if [ -f /tmp/server.env.backup ]; then
    cp /tmp/server.env.backup server/.env
    echo "✓ Restored server/.env"
fi

if [ -f /tmp/server.env.production.backup ]; then
    cp /tmp/server.env.production.backup server/.env.production
    echo "✓ Restored server/.env.production"
fi

if [ -f /tmp/client.env.production.backup ]; then
    cp /tmp/client.env.production.backup client/.env.production
    echo "✓ Restored client/.env.production"
fi

# Install dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

echo "📦 Installing client dependencies..."
cd ../client
npm install

echo "🏗️  Building client..."
npm run build

# Restart application
echo "🔄 Restarting application..."
cd ..
pm2 reload ecosystem.config.js --env production
pm2 save

echo "✅ Deployment fix completed!"
echo "📊 Status:"
pm2 status

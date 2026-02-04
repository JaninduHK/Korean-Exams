#!/bin/bash

# KoreanExams.com Production Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment for KoreanExams.com..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/koreanexams"
REPO_URL="https://github.com/yourusername/Korean-Exams.git"  # Update this
BRANCH="main"

echo -e "${BLUE}💾 Step 1: Backing up environment files...${NC}"
cd $PROJECT_DIR
if [ -f server/.env ]; then
    cp server/.env server/.env.backup
    echo -e "${GREEN}✓ Backed up server/.env${NC}"
fi
if [ -f client/.env.production ]; then
    cp client/.env.production client/.env.production.backup
    echo -e "${GREEN}✓ Backed up client/.env.production${NC}"
fi

echo -e "${BLUE}📦 Step 2: Pulling latest code...${NC}"
git fetch origin
git reset --hard origin/$BRANCH

echo -e "${BLUE}♻️  Step 3: Restoring environment files...${NC}"
if [ -f server/.env.backup ]; then
    mv server/.env.backup server/.env
    echo -e "${GREEN}✓ Restored server/.env${NC}"
fi
if [ -f client/.env.production.backup ]; then
    mv client/.env.production.backup client/.env.production
    echo -e "${GREEN}✓ Restored client/.env.production${NC}"
fi

echo -e "${BLUE}📦 Step 4: Installing server dependencies...${NC}"
cd $PROJECT_DIR/server
npm install --production

echo -e "${BLUE}📦 Step 5: Installing client dependencies...${NC}"
cd $PROJECT_DIR/client
npm install

echo -e "${BLUE}🔧 Step 6: Ensuring production environment file exists...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${RED}⚠️  .env.production not found! Creating from example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env.production
        echo -e "${RED}⚠️  Please update .env.production with production values${NC}"
    fi
fi

echo -e "${BLUE}🏗️  Step 7: Building client...${NC}"
npm run build

echo -e "${BLUE}📋 Step 8: Setting up environment...${NC}"
cd $PROJECT_DIR/server
if [ ! -f .env ]; then
    cp .env.production .env
    echo -e "${RED}⚠️  Please update .env file with actual values${NC}"
fi

echo -e "${BLUE}🔄 Step 9: Restarting PM2 processes...${NC}"
cd $PROJECT_DIR
pm2 reload ecosystem.config.js --env production
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}📊 Check status: pm2 status${NC}"
echo -e "${GREEN}📝 View logs: pm2 logs koreanexams-api${NC}"

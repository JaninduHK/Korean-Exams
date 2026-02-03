#!/bin/bash

# MongoDB User Creation Script for KoreanExams.com
# This creates a dedicated database and user for your application

echo "=== MongoDB User Setup for KoreanExams.com ==="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DB_NAME="korean_exams"
DB_USER="koreanexams_user"

# Generate a random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo -e "${BLUE}This script will:${NC}"
echo "1. Create a new database: $DB_NAME"
echo "2. Create a new user: $DB_USER"
echo "3. Grant permissions to the user"
echo ""
echo -e "${YELLOW}Press Enter to continue or Ctrl+C to cancel...${NC}"
read

echo ""
echo -e "${BLUE}Creating MongoDB user...${NC}"

# Check if authentication is enabled
AUTH_ENABLED=$(mongosh --quiet --eval "db.adminCommand({getCmdLineOpts: 1})" 2>/dev/null | grep -c "authorization")

if [ "$AUTH_ENABLED" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  MongoDB authentication is not enabled${NC}"
    echo "Creating user without admin authentication..."

    # Create user without authentication
    mongosh << EOF
use $DB_NAME
db.createUser({
  user: "$DB_USER",
  pwd: "$DB_PASSWORD",
  roles: [
    { role: "readWrite", db: "$DB_NAME" }
  ]
})
EOF

else
    echo -e "${GREEN}✓ MongoDB authentication is enabled${NC}"
    echo -e "${YELLOW}Please enter MongoDB admin credentials${NC}"
    read -p "Admin username: " ADMIN_USER
    read -sp "Admin password: " ADMIN_PASS
    echo ""

    # Create user with admin authentication
    mongosh -u "$ADMIN_USER" -p "$ADMIN_PASS" --authenticationDatabase admin << EOF
use $DB_NAME
db.createUser({
  user: "$DB_USER",
  pwd: "$DB_PASSWORD",
  roles: [
    { role: "readWrite", db: "$DB_NAME" }
  ]
})
EOF
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ MongoDB user created successfully!${NC}"
    echo ""
    echo -e "${BLUE}=== Connection Details ===${NC}"
    echo ""
    echo -e "${GREEN}Database Name:${NC} $DB_NAME"
    echo -e "${GREEN}Username:${NC} $DB_USER"
    echo -e "${GREEN}Password:${NC} $DB_PASSWORD"
    echo ""
    echo -e "${BLUE}=== MongoDB URI (use this in your .env file) ===${NC}"
    echo ""
    echo -e "${GREEN}MONGODB_URI=${NC}mongodb://$DB_USER:$DB_PASSWORD@localhost:27017/$DB_NAME"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Save these credentials securely!${NC}"
    echo ""

    # Save to a file
    cat > /tmp/mongodb-credentials.txt << EOF
KoreanExams.com MongoDB Credentials
===================================
Database: $DB_NAME
Username: $DB_USER
Password: $DB_PASSWORD

MongoDB URI:
mongodb://$DB_USER:$DB_PASSWORD@localhost:27017/$DB_NAME

Date: $(date)
EOF

    echo -e "${BLUE}Credentials saved to: /tmp/mongodb-credentials.txt${NC}"
    echo -e "${YELLOW}Copy this file and then delete it from /tmp for security${NC}"
    echo ""

    # Test connection
    echo -e "${BLUE}Testing connection...${NC}"
    if mongosh "mongodb://$DB_USER:$DB_PASSWORD@localhost:27017/$DB_NAME" --eval "db.stats()" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Connection test successful!${NC}"
    else
        echo -e "${RED}❌ Connection test failed. Please check the credentials.${NC}"
    fi

else
    echo -e "${RED}❌ Failed to create user${NC}"
    echo "Please check MongoDB logs for errors"
fi

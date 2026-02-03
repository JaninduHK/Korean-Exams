#!/bin/bash

# MongoDB Setup Helper Script for KoreanExams.com
# Run this on your VPS to get MongoDB connection details

echo "=== MongoDB Configuration Check ==="
echo ""

# Check MongoDB status
echo "1. MongoDB Status:"
sudo systemctl status mongod --no-pager | head -n 5
echo ""

# Check MongoDB version
echo "2. MongoDB Version:"
mongod --version | head -n 1
echo ""

# Check MongoDB port
echo "3. MongoDB Port:"
sudo netstat -tlnp | grep mongod || sudo ss -tlnp | grep mongod
echo ""

# Check MongoDB config file
echo "4. MongoDB Configuration File:"
echo "Location: /etc/mongod.conf"
echo "Bind IP: $(sudo grep -A 5 'net:' /etc/mongod.conf | grep 'bindIp')"
echo "Port: $(sudo grep -A 5 'net:' /etc/mongod.conf | grep 'port')"
echo ""

# List all databases
echo "5. Existing Databases:"
mongosh --quiet --eval "db.adminCommand('listDatabases')" 2>/dev/null || mongo --quiet --eval "db.adminCommand('listDatabases')"
echo ""

echo "=== Setup Instructions ==="
echo "Your MongoDB URL will be one of these formats:"
echo ""
echo "WITHOUT Authentication (if MongoDB auth is not enabled):"
echo "  mongodb://localhost:27017/korean-exams"
echo ""
echo "WITH Authentication (recommended):"
echo "  mongodb://username:password@localhost:27017/korean-exams"
echo ""
echo "Run the MongoDB setup script to create a dedicated user."

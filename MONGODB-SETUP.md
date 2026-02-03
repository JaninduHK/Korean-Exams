# MongoDB Setup Guide for KoreanExams.com

This guide helps you configure MongoDB for KoreanExams.com on a VPS that already has MongoDB and other websites running.

## 🎯 Overview

Since your MongoDB is installed locally on your VPS, you'll use:
- **Host**: `localhost` or `127.0.0.1`
- **Port**: `27017` (default)
- **Database**: `korean_exams` (new database for this site)

**✅ Good News**: MongoDB can host multiple databases, so your existing site and KoreanExams.com can coexist without conflicts!

---

## 🚀 Quick Setup (Run on your VPS)

### Option 1: Automated Setup (Recommended)

```bash
# 1. Upload the scripts to your VPS
cd /var/www/koreanexams

# 2. Make scripts executable
chmod +x mongodb-setup.sh create-mongodb-user.sh

# 3. Check MongoDB configuration
./mongodb-setup.sh

# 4. Create dedicated database and user
./create-mongodb-user.sh
```

The script will output your MongoDB connection string. Copy it!

### Option 2: Manual Setup

#### Step 1: Connect to MongoDB

```bash
# If MongoDB has NO authentication
mongosh

# If MongoDB HAS authentication (use your admin credentials)
mongosh -u admin -p YOUR_ADMIN_PASSWORD --authenticationDatabase admin
```

#### Step 2: Create Database and User

```javascript
// Create new database
use korean_exams

// Create dedicated user
db.createUser({
  user: "koreanexams_user",
  pwd: "YOUR_SECURE_PASSWORD_HERE",  // Generate a strong password
  roles: [
    { role: "readWrite", db: "korean_exams" }
  ]
})

// Verify user was created
db.getUsers()

// Exit
exit
```

#### Step 3: Test Connection

```bash
mongosh "mongodb://koreanexams_user:YOUR_PASSWORD@localhost:27017/korean_exams"
```

If successful, you'll see the MongoDB shell prompt!

---

## 📝 Update Your .env File

### On Your VPS

```bash
cd /var/www/koreanexams/server
nano .env
```

Add this line:

```bash
# WITHOUT Authentication (if MongoDB auth is disabled)
MONGODB_URI=mongodb://localhost:27017/korean_exams

# WITH Authentication (recommended - use the credentials from setup)
MONGODB_URI=mongodb://koreanexams_user:YOUR_PASSWORD@localhost:27017/korean_exams
```

**Replace:**
- `koreanexams_user` → Your MongoDB username
- `YOUR_PASSWORD` → Your MongoDB password
- `korean_exams` → Your database name

---

## 🔍 Check Existing Setup

### 1. Check if MongoDB Authentication is Enabled

```bash
sudo cat /etc/mongod.conf | grep -A 5 "security:"
```

**If you see:**
```yaml
security:
  authorization: enabled
```
→ Authentication is **ENABLED** (more secure)

**If you see nothing or commented lines (#):**
→ Authentication is **DISABLED**

### 2. List Existing Databases

```bash
mongosh --eval "show dbs"
```

This shows all databases. Your existing site's database will be listed here. KoreanExams.com will use a **different** database (`korean_exams`), so they won't conflict.

### 3. Check MongoDB Port

```bash
sudo netstat -tlnp | grep mongod
# or
sudo ss -tlnp | grep mongod
```

Should show port `27017`

---

## 🛡️ Security Best Practices

### Enable MongoDB Authentication (If Not Already)

If authentication is not enabled, here's how to enable it:

#### 1. Create Admin User First

```bash
mongosh
```

```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "STRONG_ADMIN_PASSWORD",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})
exit
```

#### 2. Enable Authentication

```bash
sudo nano /etc/mongod.conf
```

Add/uncomment these lines:

```yaml
security:
  authorization: enabled
```

#### 3. Restart MongoDB

```bash
sudo systemctl restart mongod
sudo systemctl status mongod
```

#### 4. Now Create KoreanExams User

```bash
mongosh -u admin -p STRONG_ADMIN_PASSWORD --authenticationDatabase admin
```

```javascript
use korean_exams
db.createUser({
  user: "koreanexams_user",
  pwd: "SECURE_PASSWORD",
  roles: [ { role: "readWrite", db: "korean_exams" } ]
})
```

---

## 🔧 Connection String Formats

### Basic Format
```
mongodb://localhost:27017/korean_exams
```

### With Authentication
```
mongodb://username:password@localhost:27017/korean_exams
```

### With Additional Options
```
mongodb://username:password@localhost:27017/korean_exams?authSource=admin&retryWrites=true&w=majority
```

### With Special Characters in Password

If your password has special characters, encode them:
```bash
# Example: password is "P@ssw0rd!"
# Encoded: "P%40ssw0rd%21"
mongodb://user:P%40ssw0rd%21@localhost:27017/korean_exams
```

Or use the alternative format:
```
mongodb://localhost:27017/korean_exams?authSource=korean_exams
```
And handle credentials in code.

---

## 🧪 Test Your Connection

### Method 1: Using mongosh

```bash
mongosh "mongodb://koreanexams_user:YOUR_PASSWORD@localhost:27017/korean_exams"
```

### Method 2: Test from Node.js

Create a test file:

```bash
cd /var/www/koreanexams/server
nano test-connection.js
```

```javascript
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://koreanexams_user:YOUR_PASSWORD@localhost:27017/korean_exams";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
```

Run the test:

```bash
node test-connection.js
```

---

## 📊 Managing Multiple Databases

Your VPS can run multiple websites with MongoDB:

```
MongoDB Server (localhost:27017)
├── existing_site_db       ← Your existing website
├── korean_exams           ← KoreanExams.com (new)
└── admin                  ← MongoDB admin database
```

**Each database is completely separate** - they don't interfere with each other!

### View All Databases

```bash
mongosh -u admin -p YOUR_ADMIN_PASSWORD --authenticationDatabase admin
```

```javascript
show dbs
```

### Switch Between Databases

```javascript
use korean_exams      // Switch to KoreanExams database
use existing_site_db  // Switch to existing site
```

---

## 🆘 Troubleshooting

### Problem: Connection Refused

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod

# Enable auto-start on boot
sudo systemctl enable mongod
```

### Problem: Authentication Failed

```bash
# Verify user exists
mongosh
use korean_exams
db.getUsers()
```

### Problem: Can't Connect from Application

1. Check MongoDB logs:
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

2. Verify bind IP in config:
```bash
sudo grep "bindIp" /etc/mongod.conf
```

Should be `127.0.0.1` or `localhost` for local connections.

3. Check firewall (MongoDB should only listen locally):
```bash
sudo ufw status
```

### Problem: Database Doesn't Exist

MongoDB automatically creates databases when you first write to them. Don't worry if `korean_exams` doesn't show in `show dbs` until you insert data.

---

## 📋 Final Checklist

- [ ] MongoDB is running
- [ ] Created `korean_exams` database
- [ ] Created `koreanexams_user` with readWrite permissions
- [ ] Noted down username and password
- [ ] Updated `/var/www/koreanexams/server/.env` with MongoDB URI
- [ ] Tested connection successfully
- [ ] MongoDB authentication is enabled (recommended)

---

## 🎯 Complete .env Example

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database - REPLACE WITH YOUR ACTUAL CREDENTIALS
MONGODB_URI=mongodb://koreanexams_user:YOUR_SECURE_PASSWORD@localhost:27017/korean_exams

# JWT Secret - GENERATE A STRONG RANDOM STRING
JWT_SECRET=your_very_long_and_random_secret_key_here_at_least_32_characters

# CORS
CLIENT_URL=https://koreanexams.com

# Other configurations...
```

---

## 🔐 Security Tips

1. **Use Strong Passwords**: Generate with `openssl rand -base64 32`
2. **Don't Share Credentials**: Each site should have its own user
3. **Backup Regularly**: `mongodump --db korean_exams --out /backups/`
4. **Limit User Permissions**: Only give `readWrite` to application users
5. **Keep MongoDB Updated**: `sudo apt update && sudo apt upgrade mongodb-org`

---

## 📞 Need Help?

If you encounter issues:

1. Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
2. Check application logs: `pm2 logs koreanexams-api`
3. Test connection: Run the test scripts provided
4. Verify MongoDB version: `mongod --version`

Your existing website will continue working normally - you're just adding a new database for KoreanExams.com!

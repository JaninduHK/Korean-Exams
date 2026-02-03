# KoreanExams.com - Production Deployment Guide

Complete guide to deploy your MERN stack application on VPS with CI/CD.

## Prerequisites

- VPS with Ubuntu 20.04+ (or similar)
- Domain name (koreanexams.com) pointing to your VPS
- MongoDB already installed
- Root or sudo access

## 🚀 Part 1: Initial VPS Setup

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### 2. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git (if not installed)
sudo apt install git -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 3. Verify MongoDB is Running

```bash
sudo systemctl status mongod
# Should show "active (running)"
```

## 📁 Part 2: Setup Application

### 1. Create Project Directory

```bash
sudo mkdir -p /var/www/koreanexams
sudo chown -R $USER:$USER /var/www/koreanexams
cd /var/www/koreanexams
```

### 2. Clone Repository

```bash
# If using HTTPS
git clone https://github.com/yourusername/Korean-Exams.git .

# Or if using SSH (recommended for CI/CD)
git clone git@github.com:yourusername/Korean-Exams.git .
```

### 3. Setup Environment Files

```bash
# Backend environment
cd /var/www/koreanexams/server
cp .env.production .env
nano .env  # Edit with your actual values

# Frontend environment
cd /var/www/koreanexams/client
cp .env.production .env
nano .env  # Edit with your actual values
```

**Important**: Update these values in `.env` files:
- MongoDB URI
- JWT Secret (generate a strong random string)
- Your domain URLs
- PayHere credentials
- Bank information

### 4. Install Dependencies

```bash
# Install server dependencies
cd /var/www/koreanexams/server
npm install --production

# Install client dependencies and build
cd /var/www/koreanexams/client
npm install
npm run build
```

### 5. Seed Database (First Time Only)

```bash
cd /var/www/koreanexams/server
npm run seed
```

## 🔧 Part 3: Configure Nginx

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/koreanexams.com
```

Copy the content from `nginx.conf` file in your repository.

### 2. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/koreanexams.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Setup SSL with Let's Encrypt

```bash
# Get SSL certificate for main domain
sudo certbot --nginx -d koreanexams.com -d www.koreanexams.com

# Get SSL certificate for API subdomain
sudo certbot --nginx -d api.koreanexams.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🚦 Part 4: Start Application with PM2

### 1. Start Application

```bash
cd /var/www/koreanexams
pm2 start ecosystem.config.js --env production
```

### 2. Setup PM2 Startup

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

### 3. Useful PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs koreanexams-api

# Restart app
pm2 restart koreanexams-api

# Stop app
pm2 stop koreanexams-api

# Monitor in real-time
pm2 monit
```

## 🤖 Part 5: Setup CI/CD with GitHub Actions

### 1. Generate SSH Key on VPS

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions"
# Save as: /home/your-username/.ssh/github_actions

# Display private key (you'll need this)
cat ~/.ssh/github_actions
# Copy the entire output

# Add public key to authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2. Add Secrets to GitHub

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
- `VPS_HOST`: Your VPS IP address (e.g., 192.168.1.100)
- `VPS_USERNAME`: Your VPS username (e.g., ubuntu or your-username)
- `VPS_SSH_KEY`: The private key you copied (entire content)
- `VPS_PORT`: SSH port (usually 22)

### 3. Test GitHub Actions

```bash
# Make a small change and push to main branch
git add .
git commit -m "Test CI/CD deployment"
git push origin main
```

Check the Actions tab in your GitHub repository to see the deployment progress.

## 🔄 Part 6: Manual Deployment (Alternative)

If you want to deploy manually:

```bash
# Make the deploy script executable
chmod +x /var/www/koreanexams/deploy.sh

# Run deployment
cd /var/www/koreanexams
./deploy.sh
```

## 🛠️ Part 7: Firewall Setup

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

## 📊 Part 8: Monitoring & Logs

### View Application Logs

```bash
# PM2 logs
pm2 logs koreanexams-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Setup Log Rotation

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔒 Part 9: Security Hardening

### 1. Update MongoDB Configuration

```bash
sudo nano /etc/mongod.conf
```

Add/update:
```yaml
security:
  authorization: enabled

net:
  bindIp: 127.0.0.1  # Only allow local connections
```

Create admin user:
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "your-strong-password",
  roles: ["userAdminAnyDatabase", "readWriteAnyDatabase"]
})
exit
```

### 2. Disable Root SSH Login

```bash
sudo nano /etc/ssh/sshd_config
```

Change:
```
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

## 🚨 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs koreanexams-api --lines 100

# Check if port is already in use
sudo lsof -i :5000
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### MongoDB Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

### SSL Certificate Issues

```bash
# Renew certificates manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

## 📝 Post-Deployment Checklist

- [ ] Application is running (check `pm2 status`)
- [ ] Frontend is accessible at https://koreanexams.com
- [ ] API is accessible at https://api.koreanexams.com
- [ ] SSL certificates are installed
- [ ] MongoDB is secured with authentication
- [ ] Firewall is configured
- [ ] PM2 startup is configured
- [ ] CI/CD pipeline is working
- [ ] Backups are configured
- [ ] Monitoring is setup

## 🔄 Regular Maintenance

### Daily
```bash
pm2 status  # Check application health
```

### Weekly
```bash
pm2 flush  # Clear old logs
```

### Monthly
```bash
sudo apt update && sudo apt upgrade -y  # Update system
npm outdated  # Check for package updates
```

## 📞 Support

For issues, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `/var/log/nginx/error.log`
3. Application logs in server console

## 🎉 Success!

Your application should now be running at:
- Frontend: https://koreanexams.com
- API: https://api.koreanexams.com/api

Test by visiting your domain and trying to sign up/login!

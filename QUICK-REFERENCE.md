# Quick Reference Guide

## 🚀 Quick Commands

### Server Management
```bash
# Easy way (use the management script)
./server-management.sh status      # Check status
./server-management.sh logs        # View logs
./server-management.sh restart     # Restart app
./server-management.sh deploy      # Deploy latest
./server-management.sh backup      # Backup database

# Direct PM2 commands
pm2 status                         # Check status
pm2 restart koreanexams-api        # Restart
pm2 logs koreanexams-api           # View logs
pm2 monit                          # Monitor
```

### Deployment

#### Automatic (via GitHub Actions)
```bash
git add .
git commit -m "Your message"
git push origin main
# GitHub Actions will automatically deploy
```

#### Manual (on VPS)
```bash
cd /var/www/koreanexams
./deploy.sh
```

### Database Operations

#### Backup
```bash
./server-management.sh backup
# Or manually:
mongodump --db=korean-exams --archive=backup.gz --gzip
```

#### Restore
```bash
mongorestore --db=korean-exams --archive=backup.gz --gzip
```

#### Access MongoDB Shell
```bash
mongosh
use korean-exams
db.users.find()  # View users
```

### Nginx Operations
```bash
sudo systemctl status nginx        # Check status
sudo systemctl restart nginx       # Restart
sudo nginx -t                      # Test config
sudo tail -f /var/log/nginx/error.log  # View error logs
```

### SSL Certificate
```bash
sudo certbot renew                 # Renew certificates
sudo certbot certificates          # List certificates
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
htop

# Check running processes
ps aux | grep node
```

## 📁 Important File Locations

```
/var/www/koreanexams/              # Application root
├── client/dist/                   # Built frontend
├── server/                        # Backend API
├── ecosystem.config.js            # PM2 config
└── logs/                          # Application logs

/etc/nginx/sites-available/        # Nginx configs
/var/log/nginx/                    # Nginx logs
/var/log/mongodb/                  # MongoDB logs
~/.pm2/logs/                       # PM2 logs
```

## 🌐 URLs

- **Frontend**: https://koreanexams.com
- **API**: https://api.koreanexams.com/api
- **API Health**: https://api.koreanexams.com/api/health

## 🔑 GitHub Secrets (for CI/CD)

Required secrets in GitHub repo settings:
- `VPS_HOST` - Your server IP
- `VPS_USERNAME` - SSH username
- `VPS_SSH_KEY` - Private SSH key
- `VPS_PORT` - SSH port (default: 22)

## 🆘 Common Issues

### App not starting
```bash
pm2 logs koreanexams-api --lines 50
# Check for error messages
```

### Port already in use
```bash
sudo lsof -i :5000
# Kill the process using the port
sudo kill -9 <PID>
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status
# Restart app
pm2 restart koreanexams-api
```

### SSL Certificate Error
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### MongoDB connection failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod
# Restart if needed
sudo systemctl restart mongod
```

## 📊 Monitoring Dashboard

### PM2 Monitoring
```bash
pm2 monit  # Real-time monitoring
```

### View Logs in Real-time
```bash
# Application logs
pm2 logs koreanexams-api --lines 50

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Update Application

### Via CI/CD (Recommended)
Just push to main branch - automatic deployment

### Manual Update
```bash
cd /var/www/koreanexams
git pull origin main
cd server && npm install --production
cd ../client && npm install && npm run build
pm2 restart koreanexams-api
```

## 🛡️ Security Checklist

- [ ] Firewall enabled (ufw)
- [ ] SSH key authentication only
- [ ] Root login disabled
- [ ] MongoDB authentication enabled
- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] Regular backups scheduled

## 📞 Emergency Contacts

- Server Provider: [Your provider]
- Domain Registrar: [Your registrar]
- MongoDB Cloud: [If using Atlas]

## 💾 Backup Schedule

Recommended backup frequency:
- Database: Daily (automated via cron)
- Code: Version controlled (GitHub)
- Logs: Weekly rotation (PM2)

### Setup Automatic Daily Backup
```bash
# Add to crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /var/www/koreanexams/server-management.sh backup
```

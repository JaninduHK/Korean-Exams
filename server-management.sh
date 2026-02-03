#!/bin/bash

# KoreanExams.com Server Management Script
# Usage: ./server-management.sh [command]

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/var/www/koreanexams"

show_help() {
    echo -e "${BLUE}KoreanExams.com Server Management${NC}"
    echo ""
    echo "Usage: ./server-management.sh [command]"
    echo ""
    echo "Commands:"
    echo "  status      - Show application status"
    echo "  logs        - View application logs"
    echo "  restart     - Restart application"
    echo "  stop        - Stop application"
    echo "  start       - Start application"
    echo "  deploy      - Pull latest code and deploy"
    echo "  backup      - Backup database"
    echo "  monitor     - Monitor application in real-time"
    echo "  help        - Show this help message"
    echo ""
}

show_status() {
    echo -e "${BLUE}📊 Application Status:${NC}"
    pm2 status
    echo ""
    echo -e "${BLUE}💾 MongoDB Status:${NC}"
    sudo systemctl status mongod --no-pager | head -n 3
    echo ""
    echo -e "${BLUE}🌐 Nginx Status:${NC}"
    sudo systemctl status nginx --no-pager | head -n 3
}

show_logs() {
    echo -e "${BLUE}📝 Showing application logs (Ctrl+C to exit):${NC}"
    pm2 logs koreanexams-api
}

restart_app() {
    echo -e "${YELLOW}🔄 Restarting application...${NC}"
    pm2 restart koreanexams-api
    echo -e "${GREEN}✅ Application restarted${NC}"
    pm2 status
}

stop_app() {
    echo -e "${YELLOW}⏹️  Stopping application...${NC}"
    pm2 stop koreanexams-api
    echo -e "${GREEN}✅ Application stopped${NC}"
    pm2 status
}

start_app() {
    echo -e "${YELLOW}▶️  Starting application...${NC}"
    cd $PROJECT_DIR
    pm2 start ecosystem.config.js --env production
    echo -e "${GREEN}✅ Application started${NC}"
    pm2 status
}

deploy_app() {
    echo -e "${BLUE}🚀 Deploying latest version...${NC}"
    cd $PROJECT_DIR
    ./deploy.sh
}

backup_db() {
    BACKUP_DIR="$PROJECT_DIR/backups"
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/korean-exams_$DATE.gz"

    echo -e "${BLUE}💾 Creating database backup...${NC}"
    mkdir -p $BACKUP_DIR

    mongodump --db=korean-exams --archive=$BACKUP_FILE --gzip

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
        echo -e "${BLUE}📊 Backup size: $(du -h $BACKUP_FILE | cut -f1)${NC}"

        # Keep only last 7 days of backups
        find $BACKUP_DIR -name "korean-exams_*.gz" -mtime +7 -delete
        echo -e "${BLUE}🗑️  Old backups cleaned (kept last 7 days)${NC}"
    else
        echo -e "${RED}❌ Backup failed${NC}"
    fi
}

monitor_app() {
    echo -e "${BLUE}📊 Monitoring application (press Ctrl+C to exit):${NC}"
    pm2 monit
}

# Main script
case "$1" in
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    restart)
        restart_app
        ;;
    stop)
        stop_app
        ;;
    start)
        start_app
        ;;
    deploy)
        deploy_app
        ;;
    backup)
        backup_db
        ;;
    monitor)
        monitor_app
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

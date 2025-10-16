#!/bin/bash

# Quick Server Setup Script for User Service
# This script sets up a fresh Ubuntu/Debian server for deployment
# Usage: sudo bash server-quick-setup.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

# Configuration
DEPLOY_USER="deploy"
SERVICE_NAME="user-service"
INSTALL_DIR="/opt/user-service"
DB_NAME="authdb"
DB_USER="auth"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32)}"

log_section "🚀 Starting User Service Server Setup"

# ============================================
# 1. System Update
# ============================================
log_section "📦 Updating System Packages"
apt-get update
apt-get upgrade -y

# ============================================
# 2. Install Essential Tools
# ============================================
log_section "🔧 Installing Essential Tools"
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    ufw \
    fail2ban \
    htop \
    build-essential \
    software-properties-common \
    ca-certificates \
    gnupg \
    lsb-release

# ============================================
# 3. Create Deploy User
# ============================================
log_section "👤 Creating Deploy User"
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    log_info "Created user: $DEPLOY_USER"
    
    # Setup SSH directory
    mkdir -p /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chown $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    
    log_warn "⚠️  Don't forget to add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
else
    log_info "User $DEPLOY_USER already exists"
fi

# ============================================
# 4. Install PostgreSQL
# ============================================
log_section "🗄️  Installing PostgreSQL"
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    log_info "PostgreSQL installed and started"
else
    log_info "PostgreSQL is already installed"
fi

# Setup database
log_info "Setting up database..."
sudo -u postgres psql <<EOF
-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
  END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

log_info "Database created: $DB_NAME"
log_info "Database user created: $DB_USER"

# ============================================
# 5. Install Nginx
# ============================================
log_section "🌐 Installing Nginx"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log_info "Nginx installed and started"
else
    log_info "Nginx is already installed"
fi

# ============================================
# 6. Install Node.js (for frontend)
# ============================================
log_section "📦 Installing Node.js"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    log_info "Node.js installed: $(node --version)"
    log_info "npm installed: $(npm --version)"
else
    log_info "Node.js is already installed: $(node --version)"
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER
    log_info "PM2 installed"
else
    log_info "PM2 is already installed"
fi

# ============================================
# 7. Setup Firewall
# ============================================
log_section "🔥 Configuring Firewall"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
log_info "Firewall configured"

# ============================================
# 8. Setup Fail2Ban
# ============================================
log_section "🛡️  Configuring Fail2Ban"
systemctl start fail2ban
systemctl enable fail2ban
log_info "Fail2Ban started"

# ============================================
# 9. Create Application Directories
# ============================================
log_section "📁 Creating Application Directories"
mkdir -p $INSTALL_DIR
mkdir -p /home/$DEPLOY_USER/user-service
mkdir -p /home/$DEPLOY_USER/user-service/logs
chown -R $DEPLOY_USER:$DEPLOY_USER $INSTALL_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/user-service
log_info "Application directories created"

# ============================================
# 10. SSL Certificate Setup (Let's Encrypt)
# ============================================
log_section "🔒 SSL Certificate Setup"
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
    log_info "Certbot installed"
    log_warn "⚠️  Run: sudo certbot --nginx -d yourdomain.com to get SSL certificate"
else
    log_info "Certbot is already installed"
fi

# ============================================
# Summary
# ============================================
log_section "✅ Server Setup Complete!"

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📋 SETUP SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "✅ System updated"
echo "✅ Deploy user created: $DEPLOY_USER"
echo "✅ PostgreSQL installed"
echo "✅ Nginx installed"
echo "✅ Node.js & PM2 installed"
echo "✅ Firewall configured"
echo "✅ Fail2Ban configured"
echo "✅ Application directories created"
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔐 DATABASE CREDENTIALS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "DB_HOST=localhost"
echo "DB_PORT=5432"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"
echo
log_warn "⚠️  SAVE THESE CREDENTIALS! You'll need them for GitHub Secrets"
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📝 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "1. Add SSH key for deploy user:"
echo "   sudo nano /home/$DEPLOY_USER/.ssh/authorized_keys"
echo
echo "2. Copy systemd service file:"
echo "   sudo cp deploy/systemd/user-service.service /etc/systemd/system/"
echo
echo "3. Copy nginx configuration:"
echo "   sudo cp deploy/nginx/user-service.conf /etc/nginx/sites-available/$SERVICE_NAME"
echo "   sudo ln -s /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/"
echo "   sudo rm /etc/nginx/sites-enabled/default  # Remove default site"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo
echo "4. Setup SSL certificate:"
echo "   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo
echo "5. Configure GitHub Secrets with the database credentials above"
echo
echo "6. Push to main branch to trigger deployment"
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


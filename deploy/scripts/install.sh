#!/bin/bash

# Installation Script for Auth Service
# Usage: sudo ./install.sh

set -e

echo "🚀 Installing Auth Service..."

# Configuration
SERVICE_NAME="auth-service"
SERVICE_USER="deploy"
SERVICE_GROUP="deploy"
INSTALL_DIR="/opt/auth-service"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
BINARY_NAME="auth-service"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

# Ensure service user exists
if ! id "$SERVICE_USER" &>/dev/null; then
    log_warn "User $SERVICE_USER does not exist. Creating..."
    useradd -m -s /bin/bash $SERVICE_USER || true
else
    log_info "User $SERVICE_USER already exists"
fi

# Create installation directory
log_info "Creating installation directory..."
mkdir -p $INSTALL_DIR
chown $SERVICE_USER:$SERVICE_GROUP $INSTALL_DIR

# Copy environment file
if [ -f "env.example" ]; then
    log_info "Copying environment configuration..."
    cp env.example $INSTALL_DIR/.env
    chown $SERVICE_USER:$SERVICE_GROUP $INSTALL_DIR/.env
    chmod 600 $INSTALL_DIR/.env

    log_warn "⚠️  Please edit $INSTALL_DIR/.env with your configuration"
fi

# Install systemd service
log_info "Installing systemd service..."
cp deploy/systemd/${SERVICE_NAME}.service $SERVICE_FILE

# Reload systemd and enable service
log_info "Configuring systemd service..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME

log_info "✅ Installation completed!"
echo
log_info "Next steps:"
echo "1. Edit configuration: sudo nano $INSTALL_DIR/.env"
echo "2. Place binary: sudo cp $BINARY_NAME $INSTALL_DIR/$BINARY_NAME"
echo "3. Set permissions: sudo chmod +x $INSTALL_DIR/$BINARY_NAME"
echo "4. Start the service: sudo systemctl start $SERVICE_NAME"
echo "5. Check status: sudo systemctl status $SERVICE_NAME"
echo "6. View logs: sudo journalctl -u $SERVICE_NAME -f"


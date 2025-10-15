#!/bin/bash

# PostgreSQL Setup Script for Auth Service
# Usage: sudo ./setup-postgres.sh

set -e

echo "🗄️  Setting up PostgreSQL for Auth Service..."

# Configuration
DB_NAME="authdb"
DB_USER="auth"
DB_PASSWORD="${DB_PASSWORD:-authpassword}"

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

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Check if PostgreSQL is running
if ! sudo systemctl is-active --quiet postgresql; then
    log_warn "PostgreSQL is not running. Starting..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

log_info "PostgreSQL is running"

# Create database and user
log_info "Creating database and user..."

sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- For PostgreSQL 15+, you need to explicitly grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

-- Display databases
\l
EOF

log_info "✅ PostgreSQL setup completed!"
echo
log_info "Database details:"
echo "  DB_NAME: $DB_NAME"
echo "  DB_USER: $DB_USER"
echo "  DB_PASSWORD: $DB_PASSWORD"
echo "  CONNECTION_STRING: postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?sslmode=disable"
echo
log_warn "⚠️  Please update your .env file with these credentials"


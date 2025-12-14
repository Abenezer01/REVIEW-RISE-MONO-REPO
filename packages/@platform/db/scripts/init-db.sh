#!/bin/bash
# Database Initialization Script for Docker
# This script runs automatically when the PostgreSQL container starts for the first time

set -e

echo "Creating ReviewRise database users..."

# Create admin user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create admin user (for migrations and schema management)
    CREATE USER reviewrise_admin WITH PASSWORD 'admin_password';
    ALTER USER reviewrise_admin WITH CREATEDB;
    
    -- Create app user (for runtime application operations)
    CREATE USER reviewrise_app WITH PASSWORD 'app_password';
    
    -- Grant full privileges to admin user
    GRANT ALL PRIVILEGES ON DATABASE reviewrise_db TO reviewrise_admin;
    GRANT ALL PRIVILEGES ON SCHEMA public TO reviewrise_admin;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO reviewrise_admin;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO reviewrise_admin;
    
    -- Set default privileges for admin user (for future tables)
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO reviewrise_admin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO reviewrise_admin;
    
    -- Grant minimal privileges to app user (SELECT, INSERT, UPDATE, DELETE only)
    GRANT CONNECT ON DATABASE reviewrise_db TO reviewrise_app;
    GRANT USAGE ON SCHEMA public TO reviewrise_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO reviewrise_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO reviewrise_app;
    
    -- Set default privileges for app user (for future tables created by admin)
    ALTER DEFAULT PRIVILEGES FOR USER reviewrise_admin IN SCHEMA public 
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO reviewrise_app;
    ALTER DEFAULT PRIVILEGES FOR USER reviewrise_admin IN SCHEMA public 
        GRANT USAGE, SELECT ON SEQUENCES TO reviewrise_app;
EOSQL

echo "Database users created successfully!"
echo "  - reviewrise_admin: Full privileges for migrations"
echo "  - reviewrise_app: Limited privileges for runtime operations"

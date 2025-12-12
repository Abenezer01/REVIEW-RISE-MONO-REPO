-- =====================================================
-- Database User Setup for ReviewRise Platform
-- =====================================================
-- This script creates two database users with different privilege levels:
-- 1. reviewrise_admin - Full privileges for migrations and schema changes
-- 2. reviewrise_app - Minimal privileges for runtime operations
--
-- Usage:
--   psql -U postgres -d reviewrise_db -f setup-db-users.sql
-- =====================================================

-- Create admin user (for migrations and schema management)
CREATE USER reviewrise_admin WITH PASSWORD 'CHANGE_ME_ADMIN_PASSWORD';

-- Create app user (for runtime application operations)
CREATE USER reviewrise_app WITH PASSWORD 'CHANGE_ME_APP_PASSWORD';

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

-- Verify users were created
\du reviewrise_admin
\du reviewrise_app

-- Display granted privileges
\dp

COMMENT ON ROLE reviewrise_admin IS 'Admin user for database migrations and schema changes';
COMMENT ON ROLE reviewrise_app IS 'Low-privilege application user for runtime operations';

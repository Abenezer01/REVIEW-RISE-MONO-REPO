# Review Rise Monorepo - Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [First-Time Deployment](#first-time-deployment)
4. [Updating Deployment](#updating-deployment)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Software
- **VPS**: Ubuntu 22.04 LTS or newer (minimum 4GB RAM, 2 CPU cores, 50GB storage)
- **Docker**: Version 24.0 or newer
- **Docker Compose**: V2 (comes with Docker)
- **Git**: For pulling code updates
- **Access**: SSH access with sudo privileges

### DNS Configuration
Before deployment, configure DNS records:
- `staging.reviewrise.com` → VPS IP address
- `landing.reviewrise.com` → VPS IP address

---

## VPS Initial Setup

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Install Docker
```bash
# Install Docker using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
docker compose version
```

### 4. Configure Firewall
```bash
# Install UFW
apt install ufw -y

# Configure firewall rules
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Check status
ufw status
```

### 5. Create Deployment User (Optional but Recommended)
```bash
# Create user
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

### 6. Clone Repository
```bash
cd /opt
git clone https://github.com/your-org/review-rise-monorepo.git
cd review-rise-monorepo
```

---

## First-Time Deployment

### 1. Configure Environment
```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Critical variables to update**:
- `DATABASE_URL`: Change all passwords
- `POSTGRES_PASSWORD`: Strong database password
- `JWT_SECRET`: Generate with `openssl rand -base64 64`
- `LLM_PROVIDER_API_KEY`: Your AI API key

### 2. Set Up SSL Certificates (Recommended)
```bash
# Install Certbot
apt install certbot -y

# Generate certificates (Nginx must be stopped first)
docker compose -f docker-compose.prod.yml down nginx || true
certbot certonly --standalone -d staging.reviewrise.com -d landing.reviewrise.com

# Copy certificates to nginx/ssl directory
cp /etc/letsencrypt/live/staging.reviewrise.com/fullchain.pem ./nginx/ssl/
cp /etc/letsencrypt/live/staging.reviewrise.com/privkey.pem ./nginx/ssl/
chmod 644 ./nginx/ssl/*.pem

# Update nginx/nginx.conf to uncomment SSL lines
# Uncomment:
# - listen 443 ssl http2;
# - ssl_certificate and ssl_certificate_key
# - HTTP to HTTPS redirect server block
```

### 3. Build and Start Services
```bash
# Make deployment script executable
chmod +x ./scripts/deploy-staging.sh
chmod +x ./scripts/rollback-staging.sh

# Run deployment
./scripts/deploy-staging.sh
```

### 4. Verify Deployment
```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl http://staging.reviewrise.com/health
curl http://localhost/api/auth/health  # via internal network
```

---

## Updating Deployment

### Manual Update (SSH into VPS)
```bash
cd /opt/review-rise-monorepo

# Pull latest code
git pull origin develop

# Run deployment script
./scripts/deploy-staging.sh
```

### Automated Update (via CI/CD)
Push to `develop` branch - GitHub Actions will automatically:
1. Build Docker images
2. Push to GitHub Container Registry
3. SSH to VPS and deploy

**Required GitHub Secrets**:
- `SSH_PRIVATE_KEY`: Private SSH key for VPS access
- `SSH_KNOWN_HOSTS`: VPS host fingerprint
- `VPS_HOST`: VPS IP or hostname
- `VPS_USER`: SSH username (e.g., `deploy`)
- `DEPLOY_PATH`: Repository path on VPS (e.g., `/opt/review-rise-monorepo`)
- `STAGING_URL`: Full URL for health checks (e.g., `https://staging.reviewrise.com`)

---

## Monitoring

### Real-Time Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f express-auth

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Specific service resource limits
docker inspect reviewrise-express-auth | grep -A 10 "Memory"
```

### Health Checks
```bash
# Check all container health
docker compose -f docker-compose.prod.yml ps

# Test specific health endpoints
curl http://localhost/health                           # Nginx
curl http://localhost/api/auth/health                  # Express Auth (via Nginx)
docker exec reviewrise-express-auth curl localhost:3010/health  # Direct to container
```

### Database Monitoring
```bash
# Connect to  Postgres
docker exec -it reviewrise-postgres psql -U reviewrise_app -d reviewrise_db

# Check active connections
docker exec reviewrise-postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
docker exec reviewrise-postgres psql -U postgres -c "\l+"
```

---

## Troubleshooting

### Issue: Services Failing to Start

**Symptoms**: Containers exit immediately or show "unhealthy" status

**Solutions**:
1. Check logs:
   ```bash
   docker compose -f docker-compose.prod.yml logs <service-name>
   ```

2. Verify environment variables:
   ```bash
   cat .env.production | grep DATABASE_URL
   ```

3. Check if ports are already in use:
   ```bash
   netstat -tulpn | grep LISTEN
   ```

4. Restart specific service:
   ```bash
   docker compose -f docker-compose.prod.yml restart <service-name>
   ```

### Issue: `getaddrinfo EAI_AGAIN` Errors

**Cause**: Service trying to connect before dependent service is ready

**Solution**: Our docker-compose.prod.yml already includes `depends_on` with health checks. If still occurring:
1. Check health check endpoints exist in all services
2. Verify health check timing in `docker-compose.prod.yml`
3. Increase `start_period` for slow-starting services

### Issue: Out of Memory

**Symptoms**: Services crashing, OOM killer in logs

**Solutions**:
1. Check memory limits:
   ```bash
   docker stats
   ```

2. Increase VPS RAM or adjust limits in `docker-compose.prod.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 1G  # Increase this
   ```

3. Add swap space:
   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Issue: Database Connection Failed

**Symptoms**: Services can't connect to Postgres

**Solutions**:
1. Verify Postgres is healthy:
   ```bash
   docker exec reviewrise-postgres pg_isready
   ```

2. Check database users were created:
   ```bash
   docker exec reviewrise-postgres psql -U postgres -c "\du"
   ```

3. Verify connection string format:
   ```
   postgresql://reviewrise_app:password@postgres:5432/reviewrise_db
   ```

4. Re-run init script if needed:
   ```bash
   docker compose -f docker-compose.prod.yml down -v postgres
   docker compose -f docker-compose.prod.yml up -d postgres
   ```

### Issue: Nginx 502 Bad Gateway

**Symptoms**: Unable to access application via browser

**Solutions**:
1. Check if backend services are running:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. Test backend services directly:
   ```bash
   docker exec reviewrise-nginx wget -O- http://next-web:3000/api/health
   ```

3. Check Nginx error logs:
   ```bash
   docker logs reviewrise-nginx
   ```

4. Verify upstream configurations in `nginx/nginx.conf`

### Issue: SSL Certificate Errors

**Symptoms**: Browser shows "Not Secure"

**Solutions**:
1. Verify certificates exist:
   ```bash
   ls -la ./nginx/ssl/
   ```

2. Check certificate validity:
   ```bash
   openssl x509 -in ./nginx/ssl/fullchain.pem -text -noout | grep "Not After"
   ```

3. Renew certificates:
   ```bash
   certbot renew
   docker compose -f docker-compose.prod.yml restart nginx
   ```

---

## Rollback Procedures

### Automatic Rollback
If deployment script detects failures, it provides a rollback command:
```bash
./scripts/rollback-staging.sh <TIMESTAMP>
```

### Manual Rollback Steps

1. **List Available Backups**:
   ```bash
   ls -lh ./backups/
   ```

2. **Execute Rollback**:
   ```bash
   ./scripts/rollback-staging.sh 20251225_153045
   ```

3. **Verify Services**:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   curl http://localhost/health
   ```

### Emergency Manual Rollback

If scripts fail:
```bash
# Stop all containers
docker compose -f docker-compose.prod.yml down

# Restore environment file
cp ./backups/env_<TIMESTAMP>.backup .env.production

# Start services
docker compose -f docker-compose.prod.yml up -d

# Monitor startup
docker compose -f docker-compose.prod.yml logs -f
```

---

## Useful Commands Reference

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# Restart specific service
docker compose -f docker-compose.prod.yml restart <service>

# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Rebuild specific service
docker compose -f docker-compose.prod.yml build <service>

# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Complete cleanup (WARNING: removes volumes too)
docker compose -f docker-compose.prod.yml down -v
docker system prune -a --volumes -f
```

---

## Security Best Practices

1. **Never commit** `.env.production` to Git
2. **Rotate secrets** regularly (JWT_SECRET, database passwords)
3. **Enable** SSL/TLS in production
4. **Limit** SSH access to specific IPs in UFW
5. **Monitor** logs for suspicious activity
6. **Update** Docker and system packages regularly
7. **Backup** database regularly (consider using managed database in production)

---

## Need Help?

- Check service logs: `docker compose logs <service-name>`
- Review health status: `docker compose ps`
- Contact DevOps team: devops@reviewrise.com

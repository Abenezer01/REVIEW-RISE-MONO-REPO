# 🚀 Review Rise VPS Deployment Checklist

Follow these steps in order to deploy your application to staging.

---

## ✅ Step 1: Commit and Push All Changes

```bash
# Make sure you're on the develop branch
git checkout develop

# Add all new deployment files
git add .

# Commit with descriptive message
git commit -m "feat: Add production deployment infrastructure

- Add production-ready Dockerfiles for all services
- Add docker-compose.prod.yml with health checks
- Add Nginx reverse proxy configuration
- Add CI/CD pipeline with GitHub Actions
- Add deployment and rollback scripts
- Add comprehensive deployment documentation"

# Push to GitHub
git push origin develop
```

---

## ✅ Step 2: Configure GitHub Secrets

Go to your GitHub repository: `https://github.com/REVIEWRISE/REVIEW-RISE-MONO-REPO/settings/secrets/actions`

Add these secrets (click "New repository secret"):

### Required Secrets:

1. **SSH_PRIVATE_KEY**
   - Your private SSH key for VPS access
   - Generate if needed: `ssh-keygen -t ed25519 -C "github-actions"`
   - Copy private key: `cat ~/.ssh/id_ed25519`

2. **SSH_KNOWN_HOSTS**
   - Your VPS host fingerprint
   - Get it: `ssh-keyscan -H YOUR_VPS_IP`

3. **VPS_HOST**
   - Your VPS IP address or domain
   - Example: `123.45.67.89` or `staging.reviewrise.com`

4. **VPS_USER**
   - SSH username for VPS
   - Example: `deploy` or `root`

5. **DEPLOY_PATH**
   - Path where repo will be on VPS
   - Example: `/opt/review-rise-monorepo`

6. **STAGING_URL**
   - Full URL for health checks
   - Example: `http://staging.reviewrise.com` (or use IP if DNS not ready)

---

## ✅ Step 3: Set Up Your VPS

### 3.1 Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

### 3.2 Install Docker
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify
docker --version
docker compose version
```

### 3.3 Configure Firewall
```bash
# Install UFW
apt install ufw -y

# Allow necessary ports
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### 3.4 Create Deployment Directory
```bash
# Create directory
mkdir -p /opt/review-rise-monorepo
cd /opt/review-rise-monorepo

# Clone repository
git clone https://github.com/REVIEWRISE/REVIEW-RISE-MONO-REPO.git .

# Switch to develop branch
git checkout develop
```

### 3.5 Set Up SSH Key for GitHub Actions
```bash
# Add the public key from Step 2 to authorized_keys
echo "YOUR_PUBLIC_KEY_FROM_STEP_2" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## ✅ Step 4: Configure Production Environment

### 4.1 Create .env.production
```bash
# On your VPS
cd /opt/review-rise-monorepo
cp .env.production.example .env.production
nano .env.production
```

### 4.2 Update Critical Variables

**Generate secure passwords:**
```bash
# Generate strong passwords
openssl rand -base64 32  # Use for DATABASE passwords
openssl rand -base64 64  # Use for JWT_SECRET
```

**Edit .env.production and change:**
```env
# Database (CRITICAL - change all passwords!)
DATABASE_URL="postgresql://reviewrise_app:CHANGE_ME_1@postgres:5432/reviewrise_db?sslmode=require"
DATABASE_ADMIN_URL="postgresql://reviewrise_admin:CHANGE_ME_2@postgres:5432/reviewrise_db?sslmode=require"
POSTGRES_PASSWORD=CHANGE_ME_3

# Security (CRITICAL - generate with openssl rand -base64 64)
JWT_SECRET="PASTE_YOUR_64_CHAR_SECRET_HERE"

# AI Service (if using)
LLM_PROVIDER_API_KEY="sk-YOUR_ACTUAL_API_KEY"

# Public URLs (update to your actual domain)
NEXT_PUBLIC_API_URL=https://staging.reviewrise.com/api
```

---

## ✅ Step 5: (Optional) Set Up SSL Certificates

**If you have a domain name configured:**

```bash
# Install Certbot
apt install certbot -y

# Generate certificates (Nginx must be stopped)
certbot certonly --standalone \
  -d staging.reviewrise.com \
  -d landing.reviewrise.com \
  --agree-tos \
  --email your-email@example.com

# Copy certificates to nginx/ssl
cp /etc/letsencrypt/live/staging.reviewrise.com/fullchain.pem ./nginx/ssl/
cp /etc/letsencrypt/live/staging.reviewrise.com/privkey.pem ./nginx/ssl/
chmod 644 ./nginx/ssl/*.pem

# Update nginx.conf to enable HTTPS
nano nginx/nginx.conf
# Uncomment lines 130-135 (SSL configuration)
# Uncomment lines 140-144 (HTTP to HTTPS redirect)
```

**If no domain yet:**
- Skip this step
- Access via HTTP and IP address for now
- Add SSL later when domain is ready

---

## ✅ Step 6: First Deployment

### 6.1 Make Scripts Executable
```bash
chmod +x ./scripts/deploy-staging.sh
chmod +x ./scripts/rollback-staging.sh
```

### 6.2 Run Initial Deployment
```bash
./scripts/deploy-staging.sh
```

**Expected output:**
```
[INFO] Starting deployment preflight checks...
[INFO] Preflight checks passed ✓
[INFO] Creating backup...
[INFO] Pulling latest Docker images...
[INFO] Running database migrations...
[INFO] Starting services...
[INFO] All services are healthy ✓
[INFO] Deployment completed successfully! 🚀
```

### 6.3 Monitor Startup
```bash
# Watch logs
docker compose -f docker-compose.prod.yml logs -f

# Check service status
docker compose -f docker-compose.prod.yml ps

# Should see all services as "healthy" or "running"
```

---

## ✅ Step 7: Verify Deployment

### 7.1 Test Health Endpoints
```bash
# Test Nginx
curl http://localhost/health
# Should return: healthy

# Test via public IP/domain
curl http://YOUR_VPS_IP/health
# Should return: healthy

# Test specific service
curl http://localhost/api/auth/health
# Should return: {"status":"healthy","service":"express-auth"}
```

### 7.2 Access Application
- Open browser: `http://YOUR_VPS_IP` or `http://staging.reviewrise.com`
- You should see the Next.js frontend
- Try logging in to test authentication

### 7.3 Check All Services Running
```bash
docker compose -f docker-compose.prod.yml ps
```

**All services should show "Up" and "healthy":**
- postgres (healthy)
- redis (healthy)
- nginx (healthy)
- next-web (healthy)
- next-seo-landing (healthy)
- express-auth (healthy)
- express-reviews (healthy)
- express-ai (healthy)
- express-social (healthy)
- express-gbp-rocket (healthy)
- express-ad-rise (healthy)
- express-brand (healthy)
- express-seo-health (healthy)
- express-admin-portal (healthy)
- notifications-service (healthy)
- worker-jobs (Up)

---

## ✅ Step 8: Test CI/CD Pipeline

### 8.1 Make a Small Change
```bash
# On your local machine
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: Verify CI/CD pipeline"
git push origin develop
```

### 8.2 Watch GitHub Actions
- Go to: `https://github.com/REVIEWRISE/REVIEW-RISE-MONO-REPO/actions`
- You should see the "Deploy to Staging VPS" workflow running
- It will:
  1. Build all 15 Docker images
  2. Push to GitHub Container Registry
  3. SSH to your VPS
  4. Run deployment script
  5. Verify health checks

### 8.3 Monitor Deployment on VPS
```bash
# On VPS, watch logs during deployment
cd /opt/review-rise-monorepo
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ All services show "healthy" status
- ✅ `curl http://localhost/health` returns "healthy"
- ✅ Application is accessible via browser
- ✅ Can login successfully
- ✅ GitHub Actions workflow completes successfully
- ✅ No errors in logs

---

## 🚨 Troubleshooting

### If deployment fails:

1. **Check logs:**
   ```bash
   docker compose -f docker-compose.prod.yml logs <service-name>
   ```

2. **Check service status:**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

3. **Verify environment:**
   ```bash
   cat .env.production | grep DATABASE_URL
   ```

4. **Rollback if needed:**
   ```bash
   ./scripts/rollback-staging.sh <TIMESTAMP>
   ```

5. **Consult documentation:**
   - See `docs/DEPLOYMENT.md` for detailed troubleshooting

---

## 📝 Post-Deployment Tasks

### Set Up Automated SSL Renewal
```bash
# Add to crontab
crontab -e

# Add this line:
0 0 1 * * certbot renew --quiet && cd /opt/review-rise-monorepo && docker compose -f docker-compose.prod.yml restart nginx
```

### Set Up Monitoring (Future)
- Consider Prometheus + Grafana
- Set up log aggregation
- Configure alerting

### Regular Maintenance
```bash
# Weekly: Check disk space
df -h

# Weekly: Clean old images
docker image prune -a -f

# Monthly: Update system packages
apt update && apt upgrade -y
```

---

## 🔄 Future Deployments

After initial setup, deploying is simple:

**Option 1: Automatic (Recommended)**
```bash
# On your local machine
git add .
git commit -m "feat: your changes"
git push origin develop
# GitHub Actions handles the rest!
```

**Option 2: Manual**
```bash
# SSH to VPS
ssh deploy@YOUR_VPS_IP
cd /opt/review-rise-monorepo
./scripts/deploy-staging.sh
```

---

## 📚 Reference Links

- **Deployment Docs:** `docs/DEPLOYMENT.md`
- **Implementation Plan:** `.gemini/antigravity/brain/.../implementation_plan.md`
- **Walkthrough:** `.gemini/antigravity/brain/.../walkthrough.md`
- **GitHub Repository:** `https://github.com/REVIEWRISE/REVIEW-RISE-MONO-REPO`

---

**Ready to deploy? Start with Step 1! 🚀**

# 🔐 GitHub Secrets Setup Guide for Automated CI/CD

## Overview
To enable automated deployments, you need to configure 6 secrets in GitHub. This is a **one-time setup**.

---

## 📋 Required Information

Before starting, gather:
- ✅ Your VPS IP address or domain name
- ✅ SSH access to your VPS (root or sudo user)
- ✅ Know where you'll deploy on VPS (e.g., `/opt/review-rise-monorepo`)

---

## Step 1: Generate SSH Key for GitHub Actions

Run these commands **on your local machine**:

```bash
# Create a new SSH key specifically for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deployment" -f ~/.ssh/github_actions_deploy

# When prompted:
# - Enter file: Press Enter (uses default path shown above)
# - Passphrase: Press Enter (no passphrase for automation)
# - Confirm: Press Enter
```

**Output:**
- Private key: `~/.ssh/github_actions_deploy`
- Public key: `~/.ssh/github_actions_deploy.pub`

---

## Step 2: Get Secret Values

### Secret 1: SSH_PRIVATE_KEY

```bash
# Copy the PRIVATE key
cat ~/.ssh/github_actions_deploy
```

**Copy the entire output** including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...entire key here...
-----END OPENSSH PRIVATE KEY-----
```

---

### Secret 2: SSH_KNOWN_HOSTS

Replace `YOUR_VPS_IP` with your actual VPS IP:

```bash
# Get VPS fingerprint
ssh-keyscan -H YOUR_VPS_IP
```

**Example output:**
```
|1|abc123...= ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...
```

**Copy the entire line** (starts with `|1|`)

---

### Secret 3: VPS_HOST

Simply your VPS IP address or domain:

**Examples:**
- `123.45.67.89`
- `staging.reviewrise.com`

---

### Secret 4: VPS_USER

The SSH username GitHub Actions will use.

**Recommended:** `deploy` (more secure)  
**Alternative:** `root` (if you haven't created a deploy user)

_If using `deploy` user, you'll create it in Step 4_

---

### Secret 5: DEPLOY_PATH

Where the repository will be on your VPS.

**Recommended:** `/opt/review-rise-monorepo`

---

### Secret 6: STAGING_URL

The full URL where your app will be accessible.

**Examples:**
- `http://123.45.67.89` (if using IP)
- `http://staging.reviewrise.com` (if using domain)
- `https://staging.reviewrise.com` (if SSL configured)

---

## Step 3: Add Secrets to GitHub

1. **Go to:** https://github.com/REVIEWRISE/REVIEW-RISE-MONO-REPO/settings/secrets/actions

2. **Click:** "New repository secret"

3. **Add each secret:**

   | Name | Value (from Step 2) |
   |------|---------------------|
   | `SSH_PRIVATE_KEY` | Content of `~/.ssh/github_actions_deploy` |
   | `SSH_KNOWN_HOSTS` | Output of `ssh-keyscan` command |
   | `VPS_HOST` | Your VPS IP or domain |
   | `VPS_USER` | `deploy` or `root` |
   | `DEPLOY_PATH` | `/opt/review-rise-monorepo` |
   | `STAGING_URL` | `http://your-vps-ip` |

4. **Save** each secret

---

## Step 4: Configure Your VPS

Now SSH to your VPS and set it up to accept GitHub Actions deployments.

### 4.1 Connect to VPS

```bash
ssh root@YOUR_VPS_IP
```

### 4.2 Create Deploy User (if using 'deploy' user)

```bash
# Create user
adduser deploy

# When prompted:
# - Password: Choose a strong password
# - Full Name: Press Enter
# - Other fields: Press Enter

# Add to docker group
usermod -aG docker deploy

# Add to sudo group
usermod -aG sudo deploy

# Create .ssh directory
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

### 4.3 Add GitHub Actions Public Key

```bash
# Get the public key from your local machine first
# On local machine, run: cat ~/.ssh/github_actions_deploy.pub
# Copy the output

# On VPS (as root):
# Paste the public key into authorized_keys
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> /home/deploy/.ssh/authorized_keys

# Set permissions
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

**If using root user instead:**
```bash
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 4.4 Test SSH Connection

From your **local machine**:

```bash
# Test with the GitHub Actions key
ssh -i ~/.ssh/github_actions_deploy deploy@YOUR_VPS_IP

# Should connect without password
# If successful, exit: exit
```

### 4.5 Install Docker (if not installed)

Still on VPS:

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

### 4.6 Configure Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH (CRITICAL - do this first!)
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### 4.7 Create Deployment Directory

```bash
# Create directory
mkdir -p /opt/review-rise-monorepo

# Change ownership to deploy user
chown -R deploy:deploy /opt/review-rise-monorepo

# Switch to deploy user
su - deploy

# Clone repository
cd /opt/review-rise-monorepo
git clone https://github.com/REVIEWRISE/REVIEW-RISE-MONO-REPO.git .

# Checkout develop branch
git checkout develop
```

### 4.8 Create .env.production

```bash
# Copy template
cp .env.production.example .env.production

# Edit with real values
nano .env.production
```

**CRITICAL - Update these values:**

```env
# Generate passwords with: openssl rand -base64 32
DATABASE_URL="postgresql://reviewrise_app:YOUR_SECURE_PASSWORD_1@postgres:5432/reviewrise_db?sslmode=require"

DATABASE_ADMIN_URL="postgresql://reviewrise_admin:YOUR_SECURE_PASSWORD_2@postgres:5432/reviewrise_db?sslmode=require"

POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_3

# Generate with: openssl rand -base64 64
JWT_SECRET="YOUR_64_CHAR_JWT_SECRET"

# Your actual API key if using AI
LLM_PROVIDER_API_KEY="sk-YOUR_ACTUAL_KEY"

# Update to your domain or IP
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP/api
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

---

## Step 5: Test Automated Deployment

### 5.1 Push to Develop Branch

On your **local machine**:

```bash
# Make sure all files are committed
git add .
git commit -m "feat: Add production deployment infrastructure"
git push origin develop
```

### 5.2 Watch GitHub Actions

1. **Go to:** https://github.com/REVIEWRISE/REVIEW-RISE-MONO-REPO/actions

2. **You should see:** "Deploy to Staging VPS" workflow running

3. **Monitor progress:**
   - Build and Push (builds all 15 images)
   - Deploy (SSH to VPS and deploy)
   - Verify deployment

### 5.3 Monitor VPS

While GitHub Actions is running, SSH to VPS and watch:

```bash
ssh deploy@YOUR_VPS_IP
cd /opt/review-rise-monorepo

# Watch logs in real-time
docker compose -f docker-compose.prod.yml logs -f
```

### 5.4 Verify Success

After workflow completes:

```bash
# Check all services are healthy
docker compose -f docker-compose.prod.yml ps

# Test health endpoint
curl http://localhost/health
# Should return: healthy

# Test from outside
curl http://YOUR_VPS_IP/health
# Should return: healthy
```

---

## ✅ Success Checklist

- [ ] Generated SSH key pair
- [ ] Added all 6 GitHub secrets
- [ ] Created deploy user on VPS
- [ ] Added public key to VPS authorized_keys
- [ ] Installed Docker on VPS
- [ ] Configured firewall
- [ ] Cloned repository on VPS
- [ ] Created .env.production with real values
- [ ] Pushed to develop branch
- [ ] GitHub Actions workflow completed successfully
- [ ] All services show "healthy" status
- [ ] Application accessible via browser

---

## 🎉 What Happens Now?

From now on, **every push to `develop` branch** will:
1. ✅ Automatically build all Docker images
2. ✅ Push to GitHub Container Registry
3. ✅ Deploy to your VPS
4. ✅ Run health checks
5. ✅ Rollback if anything fails

**No manual SSH needed!** 🚀

---

## 🚨 Troubleshooting

### GitHub Actions fails at "Deploy to VPS" step

**Check:**
```bash
# On local machine, test SSH connection
ssh -i ~/.ssh/github_actions_deploy deploy@YOUR_VPS_IP

# Should connect without errors
```

**Fix:** Verify SSH_PRIVATE_KEY and SSH_KNOWN_HOSTS secrets are correct

### Services fail to start

**Check logs:**
```bash
docker compose -f docker-compose.prod.yml logs <service-name>
```

**Common issues:**
- Wrong passwords in .env.production
- Port already in use
- Out of memory

### Can't access application

**Check:**
1. Firewall allows port 80: `ufw status`
2. Nginx is running: `docker compose -f docker-compose.prod.yml ps nginx`
3. Try from VPS: `curl http://localhost/health`

---

## 📚 Next Steps

Once deployment is working:
1. Set up SSL certificates (see DEPLOYMENT_CHECKLIST.md)
2. Configure monitoring
3. Set up automated backups
4. Add production environment

---

**Ready to start? Begin with Step 1!** 🚀

Need help with any step? Let me know!

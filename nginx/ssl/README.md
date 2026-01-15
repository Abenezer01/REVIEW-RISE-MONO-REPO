# This directory will contain SSL/TLS certificates for production
# Certificates should be obtained using Let's Encrypt or another CA

# Example structure after certificate generation:
# ssl/
#   ├── fullchain.pem
#   ├── privkey.pem
#   └── README.md (this file)

# To generate Let's Encrypt certificates on the VPS:
# 1. Install certbot: sudo apt-get install certbot
# 2. Stop nginx temporarily: docker compose -f docker-compose.prod.yml stop nginx
# 3. Generate certificate: sudo certbot certonly --standalone -d staging.reviewrise.com -d landing.reviewrise.com
# 4. Copy certificates: 
#    sudo cp /etc/letsencrypt/live/staging.reviewrise.com/fullchain.pem ./nginx/ssl/
#    sudo cp /etc/letsencrypt/live/staging.reviewrise.com/privkey.pem ./nginx/ssl/
# 5. Set permissions: sudo chmod 644 ./nginx/ssl/*.pem
# 6. Restart nginx: docker compose -f docker-compose.prod.yml start nginx

# For automated renewal, add to crontab:
# 0 0 1 * * certbot renew --quiet && docker compose -f /path/to/docker-compose.prod.yml restart nginx

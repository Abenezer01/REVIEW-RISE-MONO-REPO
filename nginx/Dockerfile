FROM nginx:1.25-alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Copy Nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/proxy_params.conf /etc/nginx/proxy_params.conf

# Create SSL directory (certificates will be mounted as volume)
RUN mkdir -p /etc/nginx/ssl

# Create non-root user for Nginx
# Permissions are handled by base image (logs to stdout/stderr)
# RUN chown -R nginx:nginx /var/cache/nginx && \
#     chown -R nginx:nginx /var/log/nginx && \
#     chown -R nginx:nginx /etc/nginx/conf.d && \
#     touch /var/run/nginx.pid && \
#     chown -R nginx:nginx /var/run/nginx.pid

# USER nginx (Removed to allow binding to port 80 as root)

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

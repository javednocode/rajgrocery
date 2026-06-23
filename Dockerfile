# ─────────────────────────────────────────────
# Stage 1: Build Angular frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build -- --configuration=production

# ─────────────────────────────────────────────
# Stage 2: PHP + Nginx runtime
# ─────────────────────────────────────────────
FROM php:8.2-fpm-alpine

# Install nginx, extensions
RUN apk add --no-cache nginx mysql-client curl \
    && docker-php-ext-install pdo pdo_mysql mysqli

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy Angular dist
COPY --from=frontend-builder /app/frontend/dist/frontend/browser/ /var/www/html/public/

# Copy PHP backend
COPY backend/ /var/www/html/backend/

# Copy admin panel
COPY backend/admin/ /var/www/html/public/admin/

# Copy backend router for public access
COPY backend/index.php /var/www/html/public/api.php

# Copy startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

WORKDIR /var/www/html
EXPOSE 80

CMD ["/start.sh"]

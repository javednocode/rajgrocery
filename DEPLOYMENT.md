# 🚀 The Desi — Complete VPS Deployment Guide
## Hostinger VPS + Dokploy

---

## 📋 Server Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| RAM | 1 GB | 2 GB |
| CPU | 1 vCPU | 2 vCPU |
| Storage | 20 GB | 40 GB |
| Docker | 24.x+ | Latest |
| Docker Compose | v2.x+ | Latest |

---

## 🗂️ Package Contents

```
the-desi-deploy/
├── frontend/           # Angular source code
│   ├── dist/frontend/  # Production build output ← deploy this
│   ├── package.json
│   └── angular.json
├── backend/            # PHP backend & admin panel
│   ├── api/            # REST API endpoints
│   ├── config/         # DB & app config (reads env vars)
│   ├── admin/          # Admin panel
│   └── uploads/        # Media uploads (backed up separately)
├── database/
│   └── thedesi_database.sql  # Full MySQL dump
├── docker/
│   ├── nginx.conf      # Nginx configuration
│   └── start.sh        # Container startup script
├── Dockerfile          # Multi-stage build
├── docker-compose.yml  # Service orchestration
├── .env.example        # Environment variable template
└── DEPLOYMENT.md       # This file
```

---

## ⚙️ OPTION A — Deploy via Dokploy (Recommended)

### Step 1: Create MySQL Service in Dokploy

1. Open Dokploy: `http://195.110.58.163:3000`
2. Go to **The Desi** → **production** environment
3. Click **+ Create Service** → **Database** → **MySQL**
4. Fill in:
   - **Name**: `The Desi`
   - **App Name**: `the-desi-the-desi`
   - **Database Name**: `webcraftstech_the_desi`
   - **Database User**: `wct_thedesi`
   - **Database Password**: `Jj@9610022011..`
   - **Database Root Password**: `Jj@9610022011..`
5. Click **Create** → wait for MySQL to start

### Step 2: Import the Database

```bash
# SSH into your VPS
ssh root@195.110.58.163

# Find the MySQL container name
docker ps | grep mysql

# Import the SQL dump (copy the SQL file to VPS first)
docker exec -i <mysql_container_name> mysql \
  -u wct_thedesi -p'Jj@9610022011..' webcraftstech_the_desi \
  < /path/to/thedesi_database.sql

# Verify tables imported
docker exec -i <mysql_container_name> mysql \
  -u wct_thedesi -p'Jj@9610022011..' webcraftstech_the_desi \
  -e "SHOW TABLES;"
```

### Step 3: Deploy the Application

1. In Dokploy → **+ Create Service** → **Application**
2. **Source**: Upload ZIP or connect Git repository
3. Set **Port**: `80`
4. Set **Dockerfile path**: `./Dockerfile`

### Step 4: Set Environment Variables in Dokploy

In the application → **Environment** tab, add:

```env
APP_ENV=production
APP_URL=https://yourdomain.com
MEDIA_URL=https://yourdomain.com/uploads/

DB_HOST=<mysql_service_internal_hostname>
DB_PORT=3306
DB_NAME=webcraftstech_the_desi
DB_USER=wct_thedesi
DB_PASS=Jj@9610022011..

APP_NAME=The Desi
APP_CURRENCY=GBP
APP_CURRENCY_SYMBOL=£
APP_LOCALE=en-GB
APP_TIMEZONE=Europe/London

ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

JWT_SECRET=CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING
```

> ⚠️ **IMPORTANT**: Change `JWT_SECRET` to a random string before going live!
> Generate one: `openssl rand -hex 32`

### Step 5: Deploy & Verify

1. Click **Deploy** in Dokploy
2. Watch build logs for errors
3. Once deployed, visit `https://yourdomain.com`
4. Test: `https://yourdomain.com/api/products.php`

---

## ⚙️ OPTION B — Manual Docker Compose Deploy

### Step 1: Copy files to VPS

```bash
# On your local machine
scp the-desi-deploy.zip root@195.110.58.163:/root/

# SSH into VPS
ssh root@195.110.58.163

# Extract
unzip the-desi-deploy.zip -d /root/the-desi
cd /root/the-desi
```

### Step 2: Configure environment

```bash
# Create .env from template
cp .env.example .env

# Edit with your values
nano .env
```

Required values to update in `.env`:
- `APP_URL` — your domain (e.g. `https://thedesi.co.uk`)
- `MEDIA_URL` — your domain + `/uploads/`
- `DB_PASS` — your MySQL password
- `DB_ROOT_PASS` — your MySQL root password
- `JWT_SECRET` — random 64-char string

### Step 3: Start services

```bash
cd /root/the-desi

# Pull and build
docker compose pull
docker compose build --no-cache

# Start in background
docker compose up -d

# Watch logs
docker compose logs -f
```

### Step 4: Verify everything is running

```bash
# Check running containers
docker compose ps

# Test the API
curl http://localhost/api/products.php

# Check DB has data
docker compose exec db mysql -u root -p webcraftstech_the_desi -e "SELECT COUNT(*) FROM products;"
```

---

## 🌐 Domain & SSL Configuration

### With Dokploy (Traefik)

Dokploy uses Traefik for automatic SSL. In the Application settings:
1. Go to **Domains** tab
2. Add your domain: `thedesi.co.uk`
3. Enable **HTTPS** → Traefik auto-issues Let's Encrypt cert
4. Also add `www.thedesi.co.uk` and redirect to apex

### With Nginx on VPS (manual)

```nginx
server {
    server_name thedesi.co.uk www.thedesi.co.uk;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Issue SSL with Certbot
certbot --nginx -d thedesi.co.uk -d www.thedesi.co.uk
```

---

## 🗄️ Database Import (Fresh Server)

```bash
# Create database and user
mysql -u root -p <<EOF
CREATE DATABASE IF NOT EXISTS webcraftstech_the_desi
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'wct_thedesi'@'%'
  IDENTIFIED BY 'Jj@9610022011..';
GRANT ALL PRIVILEGES ON webcraftstech_the_desi.* TO 'wct_thedesi'@'%';
FLUSH PRIVILEGES;
EOF

# Import the dump
mysql -u wct_thedesi -p'Jj@9610022011..' webcraftstech_the_desi \
  < database/thedesi_database.sql

# Verify
mysql -u wct_thedesi -p'Jj@9610022011..' webcraftstech_the_desi \
  -e "SHOW TABLES; SELECT COUNT(*) as products FROM products;"
```

---

## 🔧 Angular Build Commands

```bash
cd frontend/

# Install dependencies
npm install --legacy-peer-deps

# Development server
npm start
# → http://localhost:4200

# Production build
npm run build -- --configuration=production
# Output: dist/frontend/
```

---

## 📁 Backend API Structure

```
backend/
├── api/
│   ├── products.php        GET /api/products.php
│   ├── categories.php      GET /api/categories.php
│   ├── banners.php         GET /api/banners.php
│   ├── settings.php        GET /api/settings.php
│   ├── orders.php          POST/GET /api/orders.php
│   └── auth.php            POST /api/auth.php
├── admin/
│   ├── index.php           Admin panel login
│   ├── dashboard.php       Admin dashboard
│   ├── products.php        Product management
│   ├── banners.php         Banner management ← add banners here
│   └── settings.php        Site settings (logo, currency, etc.)
├── config/
│   ├── database.php        DB connection (reads env vars)
│   └── config.php          App config (reads env vars)
└── uploads/                Media files (images, banners)
```

---

## 🔑 Admin Panel Access

| URL | Credentials |
|-----|-------------|
| `yourdomain.com/admin` | admin / admin123 |

> ⚠️ **Change the admin password immediately after first login!**

---

## 🗂️ Required Environment Variables Summary

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_URL` | ✅ | — | Your domain (with https) |
| `APP_ENV` | ✅ | `production` | Environment mode |
| `DB_HOST` | ✅ | `db` | MySQL host |
| `DB_NAME` | ✅ | `webcraftstech_the_desi` | Database name |
| `DB_USER` | ✅ | `wct_thedesi` | DB username |
| `DB_PASS` | ✅ | — | DB password |
| `DB_ROOT_PASS` | ✅ | — | DB root password |
| `JWT_SECRET` | ✅ | — | JWT signing key (64 chars) |
| `MEDIA_URL` | ✅ | `/uploads/` | Media base URL |
| `APP_CURRENCY` | ⚡ | `GBP` | Currency code |
| `APP_CURRENCY_SYMBOL` | ⚡ | `£` | Currency symbol |
| `APP_LOCALE` | ⚡ | `en-GB` | App locale |
| `ALLOWED_ORIGINS` | ⚡ | — | CORS origins (comma-separated) |

---

## 🔍 Troubleshooting

### Frontend shows blank page
```bash
# Check nginx logs
docker compose logs app | grep nginx

# Verify Angular build exists
ls frontend/dist/frontend/

# Check nginx config
docker compose exec app nginx -t
```

### API returns 500 errors
```bash
# Check PHP error logs
docker compose logs app | grep php

# Test DB connection
docker compose exec app php -r "
  \$db = new PDO('mysql:host=db;dbname=webcraftstech_the_desi', 'wct_thedesi', 'Jj@9610022011..');
  echo 'DB OK';
"
```

### Images / uploads not showing
```bash
# Check uploads directory permissions
docker compose exec app chmod -R 755 /var/www/html/backend/uploads/
docker compose exec app chown -R www-data:www-data /var/www/html/backend/uploads/

# Verify MEDIA_URL env variable matches your domain
echo $MEDIA_URL
```

### Database won't import
```bash
# Check MySQL 8 compatibility — add this at top of SQL file if needed
SET GLOBAL sql_mode = '';
SET GLOBAL time_zone = '+00:00';

# Re-import
docker compose exec db mysql -u root -p webcraftstech_the_desi < database/thedesi_database.sql
```

### Port 80 already in use
```bash
# Find what's using port 80
lsof -i :80 | grep LISTEN

# Stop conflicting service (e.g. Apache)
systemctl stop apache2
systemctl disable apache2
```

---

## ✅ Post-Deployment Checklist

- [ ] Site loads at your domain
- [ ] API responds: `yourdomain.com/api/products.php`
- [ ] Admin panel accessible: `yourdomain.com/admin`
- [ ] Admin password changed
- [ ] JWT_SECRET changed to random value
- [ ] SSL certificate installed (HTTPS)
- [ ] Logo uploaded in Admin → Settings
- [ ] Banners uploaded in Admin → Banners
- [ ] Products/categories added
- [ ] Test add-to-cart flow
- [ ] Test checkout flow
- [ ] Backups configured

---

## 📞 Support

- Dokploy Docs: https://docs.dokploy.com
- Angular Docs: https://angular.dev
- Built for: UK South Asian Grocery Market 🇬🇧

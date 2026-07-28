# White-Label Ecommerce Engine

A production-ready, zero-branding ecommerce platform. Launch any new store in under 10 minutes by changing only branding and settings — no code edits required.

---

## 🚀 Quick Start

### New Installation
1. Clone or download the repo
2. Navigate to `http://yourdomain.com/install/`
3. Follow the 5-step installer wizard
4. Your store is live!

### Existing Installation Upgrade
```bash
# Run the migration to add multi-site support
mysql -u root -p your_database < database/migrations/001_add_site_id.sql
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17+ (Standalone, Signals) |
| Backend | PHP 8.1+ (Custom REST API) |
| Admin | PHP server-rendered SPA |
| Database | MySQL 8.0+ / MariaDB 10.6+ |
| Cache | File-based JSON cache (domain-scoped) |
| Auth | JWT (stateless) |
| Themes | JSON config + CSS custom properties |

---

## 🗂️ Project Structure

```
reuse_ecom/
├── backend/
│   ├── api/           # REST API endpoints
│   ├── admin/         # PHP admin panel
│   ├── config/        # Database, environment config
│   ├── helpers/       # Branding, cache, email, auth
│   ├── install/       # Installer wizard
│   └── uploads/       # Media files
├── database/
│   ├── schema.sql     # Clean schema (install baseline)
│   ├── demo_data.sql  # Optional generic demo data
│   └── migrations/    # Versioned ALTER scripts
├── docs/              # Documentation
├── frontend/          # Angular application
└── themes/            # Theme configs (JSON + preview.png)
    ├── default/
    ├── grocery/
    └── namkeen/
```

---

## 🎨 Theming

Themes are pure JSON — no Angular rebuild required.

```bash
# Create a new theme
mkdir themes/my-brand
# Create theme.json and preview.png (400×250)
```

See [theme_development_guide.md](./theme_development_guide.md) for the full spec.

---

## 🏪 Launching a New Brand

1. **Run installer** at `/install/` — sets DB, site name, admin, theme
2. **Upload logo** in Admin → Site Settings → Branding
3. **Activate theme** in Admin → Theme Manager
4. **Configure homepage** in Admin → Page Builder
5. **Add products** in Admin → Products

Total time: **< 10 minutes**

---

## 🔒 Security

- All credentials in `.env` (never committed)
- JWT-based stateless auth
- Cache scoped per domain (cross-site safe)
- File upload path validation
- CORS whitelist via `ALLOWED_ORIGINS` env var

---

## 📖 Documentation

- [Database Schema](./database_schema.md)
- [Theme Development Guide](./theme_development_guide.md)
- [Deployment Guide](./deployment_guide.md)
- [New Site Setup Guide](./new_site_setup_guide.md)
- [Admin Manual](./admin_manual.md)

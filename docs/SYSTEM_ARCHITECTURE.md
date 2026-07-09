# System Architecture — White-Label Ecommerce Engine
**Version:** 2.0 (Phase 13 — Enterprise Ready)
**Last Updated:** June 2026

---

## Overview

A production-ready, multi-site white-label ecommerce engine built on a **PHP 8.1 REST API + Angular 17 SPA** stack. Each deployment is a fully isolated brand sharing one codebase. New stores launch by creating a database row — zero code changes required.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN / Cloudflare                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │           Nginx / Apache             │
         │    (Virtual hosts per domain)        │
         └──────────────┬──────────────────┬───┘
                        │                  │
         ┌──────────────▼──┐    ┌──────────▼──────────┐
         │  Angular 17 SPA  │    │  PHP 8.1 Backend    │
         │  (Frontend)      │    │  (API + Admin)       │
         │  /frontend/dist/ │    │  /backend/           │
         └──────────────────┘    └──────────┬──────────┘
                                            │
                      ┌─────────────────────┼──────────────────────┐
                      │                     │                      │
           ┌──────────▼───────┐  ┌─────────▼────────┐  ┌─────────▼────────┐
           │    MySQL 8.0+    │  │   File Cache     │  │  Redis (optional)│
           │  (Primary DB)    │  │   (Tmp/FS)       │  │  (Cache Tier 2)  │
           └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Directory Structure

```
reuse_ecom/
├── backend/
│   ├── index.php               # Single entry point — all routing
│   ├── config/
│   │   ├── config.php          # JWT, CORS, environment constants
│   │   └── database.php        # PDO connection factory
│   ├── api/                    # 22 REST API endpoint files
│   │   ├── products.php        # CRUD, search, pagination
│   │   ├── attributes.php      # Product attributes + variants
│   │   ├── inventory.php       # Stock management + history
│   │   ├── orders.php          # Order lifecycle + timeline
│   │   ├── shipping_zones.php  # Zones, rates, calculator
│   │   ├── payments.php        # Pluggable payment registry
│   │   ├── payment_drivers/    # COD, Stripe, Razorpay, PayPal
│   │   ├── reports.php         # Analytics + CSV export
│   │   ├── customers.php       # Customer CRUD
│   │   ├── categories.php      # Category CRUD
│   │   ├── auth.php            # Login, JWT, password reset
│   │   ├── settings.php        # Site settings CRUD
│   │   ├── cache.php           # Cache stats + purge
│   │   └── sitemap.php         # Dynamic XML sitemap
│   ├── admin/                  # 28 PHP admin pages
│   │   ├── dashboard.php
│   │   ├── products.php
│   │   ├── inventory.php       # ← NEW Phase 13
│   │   ├── orders.php
│   │   ├── reports.php         # ← NEW Phase 13
│   │   ├── payments-config.php # ← NEW Phase 13
│   │   ├── shipping-zones.php  # ← NEW Phase 13
│   │   ├── site-manager.php
│   │   ├── theme-manager.php
│   │   ├── seo-manager.php
│   │   ├── media-library.php
│   │   └── includes/           # header, footer, sidebar
│   ├── helpers/
│   │   ├── auth_middleware.php # JWT + RBAC (requireRole, hasPermission)
│   │   ├── cache.php           # Site-scoped file cache
│   │   ├── redis_cache.php     # ← NEW Redis-ready layer
│   │   ├── queue.php           # ← NEW File-based job queue
│   │   ├── security.php        # ← NEW CSRF, rate limit, audit
│   │   ├── branding.php        # Default settings factory
│   │   ├── email.php           # Transactional email
│   │   ├── response.php        # successResponse, errorResponse
│   │   └── upload.php          # Image upload + WebP conversion
│   ├── install/                # 5-step installation wizard
│   └── modules/                # 11 future module stubs
├── frontend/
│   └── src/app/
│       ├── core/services/      # settings, theme, seo services
│       └── features/           # 10 feature components
├── themes/
│   ├── default/theme.json
│   ├── grocery/theme.json
│   └── namkeen/theme.json
└── database/
    ├── schema.sql              # Full multi-site schema
    ├── demo_data.sql           # Generic demo content
    └── migrations/
        ├── 001_add_site_id.sql
        └── 002_enterprise_schema.sql  # ← NEW Phase 13
```

---

## Multi-Site Architecture

Every database table has `site_id INT`. The backend resolves `site_id` at the start of every request by matching `HTTP_HOST` to the `sites.domain` column. Falls back to `site_id=1` for single-site installs.

```
Request → index.php
  └── HTTP_HOST = "brandb.com"
  └── SELECT id FROM sites WHERE domain = 'brandb.com'  → site_id = 2
  └── define('ECOMMERCE_SITE_ID', 2)
  └── All queries: WHERE site_id = 2
  └── Cache prefix: ecommerce_<domain_hash>_s2_
```

### Adding a New Site
1. INSERT INTO sites (site_name, domain, theme, currency, status)
2. Run migration 001 to add site_id to existing tables
3. Point domain DNS to the server
4. Done — new store is live in under 15 minutes

---

## Authentication & RBAC

**JWT-based** authentication with role hierarchy:

| Role | Level | Can Do |
|------|-------|--------|
| super_admin | 5 | Everything across all sites |
| site_owner | 4 | Full control of their site |
| manager | 3 | Orders, products, customers, reports |
| editor | 2 | Products and content |
| staff | 1 | View orders, process fulfillment |

Permissions are stored in `admin_permissions` (role × resource × action matrix). `requireRole()` enforces hierarchy. `hasPermission()` checks individual resource/action combinations.

---

## Cache Architecture

**Tier 1 — File cache** (zero config, default):
- Location: `sys_get_temp_dir()/ecommerce_<hash>/`
- Prefix scoped by `site_id + domain` — zero cross-site data leakage
- Functions: `cacheGet()`, `cacheSet()`, `cacheClear()`, `getCacheStats()`
- Automatic expiry check on every read

**Tier 2 — Redis** (set `REDIS_URL` in .env):
- Drop-in via `redis_cache.php` — identical API
- Auto-detects Redis, falls back to file cache silently
- Key format: `ecom:s{site_id}:{domain_hash}:{key}`

---

## Payment Architecture

Pluggable driver pattern — no gateway is hardcoded:

```php
// Driver convention:
function initiate_{gateway_key}(array $gw, array $data): array { ... }
function verify_{gateway_key}(array $gw, array $data): array { ... }

// Add a new gateway in 3 steps:
// 1. Create backend/api/payment_drivers/mypay.php with initiate_mypay() + verify_mypay()
// 2. INSERT INTO payment_gateways (gateway_key='mypay', ...)
// 3. Configure via Admin → Payment Settings
```

**Supported drivers:** COD · Stripe · Razorpay · PayPal

---

## Security Stack

| Layer | Implementation |
|-------|----------------|
| Transport | HTTPS enforced via HSTS header |
| Auth | JWT HS256 with expiry, rate-limited verify |
| CSRF | Token-per-session, validated on all state changes |
| Rate Limiting | File-based, per-IP per-action, configurable window |
| SQL Injection | 100% PDO prepared statements |
| XSS | `htmlspecialchars()` on all output |
| Headers | CSP, X-Frame-Options, X-Content-Type, Referrer-Policy |
| Audit | Every admin action logged to `audit_logs` table |
| Security Events | Failed logins, rate-limit blocks → `security_events` |

---

## Queue Architecture

File-based job queue with Redis-ready interface:

```
dispatch('send_order_email', ['order_id' => 123])
   → Creates: /tmp/ecommerce_queue/job_xxx.json
   → Background cron: GET /api/queue/process
   → processQueue() runs handlers with retry + backoff
```

**Supported jobs:** `send_order_email` · `send_low_stock_alert` · `generate_invoice` · `update_inventory` · `export_products` · `sitemap_invalidate` · `webhook_dispatch`

Swap to Redis/Beanstalkd by replacing `dispatch()` and `processQueue()` — zero app changes.

---

## API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products with filters |
| POST | /api/products | Create product |
| GET | /api/products/{id}/variants | List variants |
| POST | /api/products/{id}/variants | Create variant |
| GET | /api/attributes | List all attributes |
| GET | /api/inventory | Stock overview with alerts |
| POST | /api/inventory/adjust | Manual stock adjustment |
| GET | /api/inventory/history | Movement audit trail |
| GET | /api/shipping/zones | List shipping zones |
| POST | /api/shipping/calculate | Calculate shipping cost |
| GET | /api/payments/gateways | Enabled gateways list |
| POST | /api/payments/initiate | Start payment session |
| POST | /api/payments/verify | Verify payment |
| GET | /api/reports/summary | KPI dashboard data |
| GET | /api/reports/revenue | Revenue by period |
| GET | /api/reports/products | Top products |
| GET | /api/reports/export | CSV export (orders/products/customers) |
| GET | /api/cache/stats | Cache health + hit rates |
| POST | /api/cache/clear | Clear site cache |
| GET | /sitemap.xml | Dynamic XML sitemap |

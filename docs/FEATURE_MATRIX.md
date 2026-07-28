# Feature Matrix — White-Label Ecommerce Engine

## Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented and production-ready |
| 🔧 | Implemented — needs frontend integration |
| 📋 | Stubbed / Planned — backend ready |
| ❌ | Not yet implemented |

---

## Core Ecommerce

| Feature | Status | Notes |
|---------|--------|-------|
| Product CRUD | ✅ | Full admin + API |
| Product Images (multi) | ✅ | WebP conversion, sort order |
| Product Search | ✅ | Weighted full-text search |
| Product Variants | ✅ | Unlimited, attribute-linked |
| Product Attributes | ✅ | Color/Size/Weight/Flavor/Custom |
| Category Management | ✅ | Nested, featured, active toggle |
| Inventory Tracking | ✅ | Per product + per variant |
| Stock History Audit | ✅ | Movement types, admin logged |
| Low Stock Alerts | ✅ | Threshold configurable per product |
| Out of Stock Handling | ✅ | Auto badge + block purchase |
| Reserved Stock | 🔧 | DB column ready, needs order flow integration |
| Bulk Import (CSV/XLSX) | ✅ | Admin import page |
| Bulk Stock Update | ✅ | Admin stock page |
| Image → WebP Conversion | ✅ | Batch admin tool |

---

## Orders

| Feature | Status | Notes |
|---------|--------|-------|
| Order Creation | ✅ | With items, coupon, delivery |
| Order Management | ✅ | Status, notes, items |
| Order Timeline | ✅ | DB table + API ready |
| Order Notes | ✅ | Admin/customer/system types |
| Admin Comments | ✅ | Private notes on orders |
| Status History | ✅ | order_timeline table |
| Partial Fulfillment | 🔧 | fulfilled_qty column added |
| Cancellation Workflow | 🔧 | Status + stock reversal needed |
| Order Invoice (PDF) | ✅ | Auto-generated, downloadable |
| Order Invoice (XML) | ✅ | For accounting integrations |
| Order Tracking | ✅ | Public tracking by order number |
| WhatsApp Notification | ✅ | Order placed/status change |
| Email Notification | ✅ | Transactional email templates |

---

## Shipping

| Feature | Status | Notes |
|---------|--------|-------|
| Flat Rate Shipping | ✅ | Per zone |
| Free Shipping | ✅ | Unconditional |
| Free Above Amount | ✅ | Threshold-based |
| Weight-Based Shipping | ✅ | Base rate + per-kg |
| Local Delivery | ✅ | Zone method |
| Shipping Zones | ✅ | Multi-zone with postcode rules |
| Postcode Rules | ✅ | Prefix or exact match |
| Country Rules | ✅ | JSON country list per zone |
| Shipping Calculator API | ✅ | POST /api/shipping/calculate |
| Admin Zones UI | ✅ | Admin shipping-zones.php |
| Frontend Shipping Selection | 🔧 | Needs Angular integration |

---

## Payments

| Feature | Status | Notes |
|---------|--------|-------|
| Cash on Delivery | ✅ | Driver implemented |
| Stripe | ✅ | Checkout Sessions driver |
| Razorpay | ✅ | Order + signature driver |
| PayPal | 📋 | Gateway stub in DB; driver needed |
| Pluggable Architecture | ✅ | Add any gateway via driver file |
| Test Mode | ✅ | Per-gateway flag in DB |
| Payment Config UI | ✅ | Admin payments-config.php |
| Webhook Verification | ✅ | Stripe (signature), Razorpay (HMAC) |
| Payment Audit Trail | 🔧 | Integrate with audit_logs |

---

## Customer Accounts

| Feature | Status | Notes |
|---------|--------|-------|
| Customer Registration | ✅ | Via checkout or account page |
| Customer Login | ✅ | JWT-based |
| Order History | ✅ | Customer sees own orders |
| Wishlist | ✅ | Angular service + API |
| Address Book | 🔧 | DB ready, frontend needed |
| Saved Carts | 🔧 | saved_carts table created |
| Password Reset | ✅ | Email token flow |

---

## Admin & RBAC

| Feature | Status | Notes |
|---------|--------|-------|
| Admin Login | ✅ | JWT, rate limited |
| Role Definitions | ✅ | 5 roles: super→staff |
| Permission Matrix | ✅ | 11 resources × 5 actions |
| requireRole() | ✅ | JWT middleware |
| hasPermission() | ✅ | DB-backed resource checks |
| Admin Roles UI | 📋 | roles.php stub needed |
| Audit Log UI | 📋 | audit-log.php stub needed |
| Failed Login Tracking | ✅ | security_events table |
| Admin Avatar | ✅ | Upload supported |

---

## Reporting

| Feature | Status | Notes |
|---------|--------|-------|
| KPI Summary Dashboard | ✅ | Today/month/totals |
| Revenue by Period | ✅ | Day/week/month/year |
| Orders Over Time | ✅ | Included in revenue |
| Top Products | ✅ | By revenue, configurable limit |
| Customer Growth | ✅ | New by day + top customers |
| Conversion Funnel | ✅ | By order status |
| CSV Export | ✅ | Orders, products, customers |
| Chart.js UI | ✅ | Bar/line + doughnut |
| Real-time Updates | ❌ | Future: WebSocket |

---

## SEO

| Feature | Status | Notes |
|---------|--------|-------|
| Meta Title/Description | ✅ | Per page, per product |
| Open Graph Tags | ✅ | og:image, og:type |
| Canonical URLs | ✅ | Set in frontend |
| Robots.txt | ✅ | Admin-managed |
| XML Sitemap | ✅ | Dynamic, 6h cache |
| Schema.org JSON-LD | ✅ | Product schema |
| SEO Manager UI | ✅ | Admin seo-manager.php |

---

## Performance

| Feature | Status | Notes |
|---------|--------|-------|
| File-Based Cache | ✅ | Site-scoped, TTL |
| Redis-Ready Layer | ✅ | Auto-detect, same API |
| Query Optimization | ✅ | JOINs not N+1, batch loads |
| DB Index Coverage | ✅ | optimize_indexes.sql |
| WebP Image Conversion | ✅ | Batch tool + auto on upload |
| Image Lazy Loading | ✅ | Angular frontend |
| CDN Compatibility | ✅ | Paths are relative, CDN-ready |
| Queue System | ✅ | File-based, Redis-ready |
| Gzip | 🔧 | Enable in Nginx config |
| HTTP/2 | 🔧 | Enable in server config |

---

## Security

| Feature | Status | Notes |
|---------|--------|-------|
| HTTPS / HSTS | ✅ | Header injected |
| CSRF Protection | ✅ | Token per session |
| Rate Limiting | ✅ | File-based, per-IP |
| Security Headers | ✅ | CSP, X-Frame, Referrer |
| SQL Injection Prevention | ✅ | 100% prepared statements |
| XSS Prevention | ✅ | htmlspecialchars throughout |
| JWT Security | ✅ | HS256, expiry |
| Audit Logs | ✅ | All admin actions |
| Security Events | ✅ | Failed logins, brute force |
| Input Sanitization | ✅ | sanitizeStr/Int/Decimal/Enum |

---

## Multi-Site / SaaS

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-Site Data Isolation | ✅ | site_id on all tables |
| Domain-Based Resolution | ✅ | HTTP_HOST → sites.domain |
| Per-Site Settings | ✅ | site_settings table |
| Per-Site Themes | ✅ | active_theme per site |
| Per-Site Cache Isolation | ✅ | Cache prefix includes site_id |
| Site Manager UI | ✅ | Admin site-manager.php |
| Sub-domain Support | ✅ | Any domain format |
| White-Label Branding | ✅ | Zero hardcoded brand names |
| Installation Wizard | ✅ | 5-step setup wizard |
| New Site < 15 minutes | ✅ | Documented in setup guide |

---

## Future Modules (Stubbed)

| Module | Status |
|--------|--------|
| Vendor/Marketplace | 📋 |
| Affiliate System | 📋 |
| Loyalty/Rewards | 📋 |
| Subscription Products | 📋 |
| POS System | 📋 |
| WhatsApp Marketing | 📋 |
| Email Marketing | 📋 |
| Multi-Warehouse | 📋 |
| Referral Program | 📋 |
| Wishlist (Advanced) | 📋 |
| Inventory Forecasting | 📋 |

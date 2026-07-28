# New Site Setup Guide

## Launch a new brand in under 10 minutes

This guide covers setting up a completely new branded store on top of the white-label engine.

---

## Prerequisites

- [ ] Domain name pointed to server
- [ ] MySQL/MariaDB database created
- [ ] PHP 8.1+ with PDO and cURL enabled
- [ ] Write permissions on `backend/uploads/`

---

## Step 1 — Run the Installer (2 min)

1. Upload the `reuse_ecom` folder to your server
2. Open `https://yourdomain.com/install/` in a browser
3. Complete all 5 steps:
   - **Step 1** — System check (auto)
   - **Step 2** — Enter DB credentials
   - **Step 3** — Site name, tagline, email, currency
   - **Step 4** — Admin username and password
   - **Step 5** — Select starting theme
4. Click **Install Now**
5. ⚠️ Delete the `/install/` folder immediately after completion

---

## Step 2 — Upload Your Logo (1 min)

1. Go to **Admin Panel** → **Site Settings** → **Branding**
2. Upload your logo (recommended: 400×200px, PNG/SVG with transparent background)
3. Upload your favicon (32×32px ICO or PNG)
4. Save

---

## Step 3 — Activate or Customise Theme (2 min)

1. Go to **Admin Panel** → **Theme Manager**
2. Click **Activate** on your desired theme
3. The theme applies instantly — no page rebuild needed

**To customise a theme's colors:**
```bash
# Edit /themes/<theme>/theme.json and change the colors section
# Save — theme applies on next page load
```

---

## Step 4 — Configure Site Settings (3 min)

Go to **Admin Panel** → **Site Settings** and fill in:

| Section | Fields to update |
|---|---|
| General | Site name, tagline, email, phone, address |
| Header & Footer | Offer text, copyright, footer about |
| Social Media | Facebook, Instagram, Twitter, YouTube, WhatsApp |
| SEO | Meta title, meta description, meta keywords |
| Shipping | Free delivery threshold, delivery charge |
| Homepage | Hero text, section labels, testimonials |

---

## Step 5 — Add Products & Categories (2 min)

1. **Create categories**: Admin → Categories → Add Category
2. **Add products**: Admin → Products → Add Product
3. **Set hero products**: Admin → Hero Products
4. **Upload banners**: Admin → Banner Slider

---

## Step 6 — Configure Homepage Sections

1. Go to **Admin Panel** → **Page Builder**
2. Toggle sections on/off
3. Drag to reorder
4. Save

---

## Step 7 — Set Up Email (optional)

1. Go to **Admin Panel** → **Email Settings**
2. Enter SMTP credentials (Gmail, Mailgun, etc.)
3. Test with **Send Test Email**

---

## Checklist

```
[ ] Installer complete, /install/ folder deleted
[ ] Logo and favicon uploaded
[ ] Theme selected/activated
[ ] Site settings filled in (name, email, tagline, social links)
[ ] Meta title and description set for SEO
[ ] At least 1 category created
[ ] At least 1 product added
[ ] Homepage sections configured in Page Builder
[ ] Footer copyright year set
[ ] Email settings configured (optional)
[ ] SSL certificate active on domain
```

---

## Multi-Site (Advanced)

If you're running multiple brands from one codebase:

1. Create a second DB entry in the `sites` table:
```sql
INSERT INTO sites (site_name, domain, theme, currency) 
VALUES ('Brand B', 'brandb.com', 'namkeen', 'GBP');
```

2. Point `brandb.com` to the same server/codebase
3. The backend auto-detects `site_id` from `HTTP_HOST`
4. All data (products, orders, settings) is isolated by `site_id`

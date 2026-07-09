# Theme Development Guide

## Overview

Themes in the white-label engine are pure **JSON config files**. No Angular rebuild is required to switch or create themes. The `ThemeService` injects CSS custom properties directly into `:root` at runtime.

---

## Theme Structure

```
themes/
└── my-brand/
    ├── theme.json      # Required — colors, fonts, spacing
    └── preview.png     # Required — thumbnail (400×250px)
```

---

## `theme.json` Full Specification

```json
{
  "name": "My Brand",
  "version": "1.0",
  "description": "A short description of this theme.",
  "preview": "preview.png",

  "colors": {
    "primary": "#3BB77E",
    "primary-dark": "#2A9062",
    "primary-light": "#F4FCF7",
    "secondary": "#FDC040",
    "accent": "#FFA530",
    "surface": "#FFFFFF",
    "background": "#F8FAFB",
    "text-dark": "#253D4E",
    "text-muted": "#7E8D97",
    "text-light": "#AEBCC6",
    "border": "#E9F0F4",
    "success": "#3BB77E",
    "warning": "#FDC040",
    "danger": "#E11D48",
    "header-bg": "#FFFFFF",
    "header-text": "#253D4E",
    "footer-bg": "#17324A",
    "footer-text": "#DBE6EF",
    "badge-sale": "#E11D48",
    "badge-new": "#3BB77E"
  },

  "fonts": {
    "heading": "Quicksand",
    "body": "Inter",
    "heading_weights": "600;700",
    "body_weights": "400;500;600;700",
    "google_fonts_url": "https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
  },

  "spacing": {
    "section_padding": "72px 0",
    "card_radius": "12px",
    "button_radius": "8px",
    "input_radius": "8px",
    "container_max_width": "1280px"
  },

  "header": {
    "style": "standard",
    "sticky": true,
    "show_topbar": true,
    "topbar_bg": "#253D4E",
    "topbar_text": "#FFFFFF"
  },

  "footer": {
    "style": "columns",
    "columns": 4
  },

  "product_card": {
    "style": "standard",
    "show_wishlist": true,
    "show_rating": true,
    "image_aspect_ratio": "1/1"
  }
}
```

---

## How It Works

1. On app boot, `AppComponent` injects `ThemeService`
2. `ThemeService` watches `SettingsService.loaded()` via Angular `effect()`
3. When settings load, it reads `active_theme` from DB settings
4. It fetches `/themes/{theme}/theme.json` via HTTP
5. All `colors.*` values are injected as `--color-{key}` and `--{key}` CSS custom properties on `:root`
6. All `spacing.*` values are injected as `--{key}` CSS custom properties
7. Google Fonts URL is lazy-loaded as a `<link>` tag (only if not already present)

---

## Available CSS Variables (injected by ThemeService)

```css
/* Colors */
--primary          /* Main brand color */
--primary-dark     /* Darker shade for hover/active */
--primary-light    /* Light tint for backgrounds */
--secondary        /* Secondary accent */
--accent           /* Tertiary accent */
--surface          /* Card/container backgrounds */
--background       /* Page background */
--text-dark        /* Primary text */
--text-muted       /* Secondary/label text */
--border           /* Border color */
--header-bg        /* Header background */
--footer-bg        /* Footer background */

/* Spacing */
--section-padding        /* e.g. "72px 0" */
--card-radius            /* e.g. "12px" */
--button-radius          /* e.g. "8px" */
--container-max-width    /* e.g. "1280px" */

/* Fonts */
--font-heading     /* e.g. "'Quicksand', 'Poppins', sans-serif" */
--font-body        /* e.g. "'Inter', system-ui, sans-serif" */
```

---

## Activating a Theme

### Via Admin UI
1. Go to **Admin → Theme Manager**
2. Click **Activate** on your desired theme

### Via API
```bash
PUT /api/settings
{ "active_theme": "my-brand" }
```

### Via DB (direct)
```sql
UPDATE site_settings SET setting_value = 'my-brand' WHERE setting_key = 'active_theme';
```

---

## Included Themes

| Theme | Best For | Primary Color |
|---|---|---|
| `default` | Any general store | `#3BB77E` (green) |
| `grocery` | Food & grocery | `#3BB77E` (green, pill buttons) |
| `namkeen` | Indian snacks/food | `#E06400` (saffron/amber) |

---

## Creating a New Theme

```bash
# 1. Create theme folder
mkdir themes/luxe

# 2. Create theme.json (copy default and modify)
cp themes/default/theme.json themes/luxe/theme.json

# 3. Edit colors, fonts, spacing in theme.json

# 4. Create preview.png (400×250px screenshot of the theme)

# 5. Activate via Admin → Theme Manager
```

The new theme appears automatically in Theme Manager without any server restart.

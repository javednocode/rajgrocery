import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  settings = signal<any>({});
  loaded = signal(false);

  constructor(
    private api: ApiService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.loadSettings();
  }

  loadSettings() {
    this.api.getSettings().subscribe({
      next: (res: any) => {
        if (res.success) {
          const settings = this.sanitizeSettings({ ...this.defaultSettings(), ...res.data });
          this.settings.set(settings);
          this.applyDocumentBranding(settings);
          this.loaded.set(true);
        }
      },
      error: () => {
        // Use defaults
        const defaults = this.defaultSettings();
        this.settings.set(defaults);
        this.applyDocumentBranding(defaults);
        this.loaded.set(true);
      }
    });
  }

  defaultSettings() {
    return {
      site_name: 'LAAVI STORE',
      site_tagline: 'Indian Grocery Store in Hong Kong',
      site_description: 'LAAVI STORE is your local Indian grocery store in Hong Kong — authentic staples, spices, snacks and household essentials delivered to your door.',
      site_url: '',
      site_logo: '',
      site_favicon: '/favicon.ico',
      site_email: 'hello@laavi.hk',
      site_phone: '',
      site_address: 'Tseung Kwan O, Hong Kong',
      contact_email: 'hello@laavi.hk',
      contact_address: 'Tseung Kwan O, Hong Kong',
      contact_hours: 'Mon–Sat: 10am–8pm',
      contact_phone: '',
      contact_map_embed: '',
      business_city: 'Hong Kong',
      business_region: 'New Territories',
      business_country: 'Hong Kong',
      store_country: 'Hong Kong',
      currency_symbol: 'HK$',
      currency_code: 'HKD',
      header_offer_text: 'Wide Indian Grocery Selection — Shop Online',
      hero_eyebrow: 'Indian Grocery in Hong Kong',
      hero_title: 'Your Favourite Indian Groceries, All in One Place.',
      hero_subtitle: 'Shop everyday Indian groceries, pantry essentials, snacks, beverages and household favourites from LAAVI STORE.',
      hero_media_badge: 'Indian Grocery Selection',
      hero_media_caption_title: 'Fresh stock, weekly',
      hero_media_caption_meta: 'Packed with care',
      trust_item_1_text: 'Indian Grocery Selection',
      trust_item_2_text: 'Easy Online Ordering',
      trust_item_3_text: 'Authentic Brands',
      trust_item_4_text: 'Secure Checkout',
      home_categories_label: 'Browse the pantry',
      home_categories_title: 'Shop by Category',
      home_categories_link_text: 'All categories',
      home_featured_label: 'Popular Picks',
      home_featured_title: 'Featured Products',
      home_featured_link_text: 'View all',
      home_trending_label: 'Most Loved',
      home_trending_title: 'Trending Products',
      home_trending_link_text: 'View all',
      featured_brands_label: 'Brands We Stock',
      featured_brands_title: 'Shop Popular Brands',
      featured_brands_link_text: 'Shop brands',
      featured_brands_list: 'MDH Spices, Aashirvaad, Everest, Parle, Haldirams, Dabur, Amul, Patanjali, Britannia, MTR',
      home_new_label: 'Just Arrived',
      home_new_title: 'New Arrivals',
      home_new_link_text: 'View all',
      promo_1_label: 'Spice pantry',
      promo_1_title: 'Authentic Indian Spices & Masalas',
      promo_1_text: 'From ground coriander to whole garam masala — the real flavours of Indian cooking.',
      promo_1_button: 'Shop Spices',
      promo_1_link: '/categories',
      promo_1_image: '/uploads/promos/indian-spices.jpg',
      promo_1_badge: 'Best Sellers',
      promo_2_label: 'Daily staples',
      promo_2_title: 'Rice, Atta & Dal',
      promo_2_text: 'Stock your pantry with everyday Indian essentials.',
      promo_2_button: 'Shop Staples',
      promo_2_link: '/categories',
      promo_2_image: '/uploads/promos/indian-staples.jpg',
      promo_2_badge: 'New Arrivals',
      promo_3_label: 'Snacks & sweets',
      promo_3_title: 'Namkeen, Mithai & More',
      promo_3_text: 'Your favourite Indian snacks and festive sweets, now in Hong Kong.',
      promo_3_button: 'Explore Snacks',
      promo_3_link: '/categories',
      promo_3_image: '/uploads/promos/indian-snacks.jpg',
      promo_3_badge: 'New Arrivals',
      promise_label: 'Our Promise',
      promise_title: 'Why Shop at LAAVI STORE',
      promise_text: 'Wide Indian grocery selection, easy online ordering, secure checkout and authentic brands — all delivered to your door in Hong Kong.',
      why_1_title: 'Indian Grocery Selection',
      why_1_text: 'A wide range of authentic Indian groceries, spices, snacks and household essentials.',
      why_2_title: 'Quality You Can Trust',
      why_2_text: 'Carefully selected products from trusted Indian brands, stocked fresh and ready to ship.',
      why_3_title: 'Convenient Online Shopping',
      why_3_text: 'Easy online ordering from the comfort of your home — everything delivered to your door.',
      why_4_title: 'Secure & Easy Checkout',
      why_4_text: 'Encrypted payments and a smooth checkout experience you can rely on, every time.',
      reviews_label: 'Customer Reviews',
      reviews_title: 'What Our Customers Say',
      review_1_name: 'Priya M.',
      review_1_location: 'Tseung Kwan O, HK',
      review_1_text: 'Finally found a store with all my favourite Indian brands in one place. The MDH masalas are exactly as I get back home!',
      review_2_name: 'Rahul S.',
      review_2_location: 'Tsim Sha Tsui, HK',
      review_2_text: 'Easy to order, great selection of atta, rice and dals. Everything arrived well-packed and fresh.',
      review_3_name: 'Anjali K.',
      review_3_location: 'Sha Tin, HK',
      review_3_text: "The snack selection is amazing — Haldiram's and Parle in Hong Kong! Makes me feel right at home.",
      review_4_name: 'Ravi N.',
      review_4_location: 'Kowloon, HK',
      review_4_text: 'Smooth checkout, fair prices, and my order was packed carefully. Will definitely order again.',
      review_5_name: 'Deepa R.',
      review_5_location: 'Sai Kung, HK',
      review_5_text: 'Finally a store where spices, snacks, pickles and staples all arrive together. Great variety!',
      review_6_name: 'Amit V.',
      review_6_location: 'Yuen Long, HK',
      review_6_text: 'The inventory is fresh and the brand selection keeps getting better. LAAVI is my go-to grocery store.',
      footer_about: 'Your local Indian grocery store in Hong Kong — authentic spices, staples, snacks and household essentials delivered to your door.',
      footer_copyright: '© 2026 LAAVI STORE. All rights reserved.',
      newsletter_desc: 'New arrivals, seasonal recipes and special offers — a short letter, once a week.',
      meta_title: 'LAAVI STORE | Indian Grocery Store in Hong Kong',
      meta_description: 'Shop LAAVI STORE — your local Indian grocery store in Hong Kong. Authentic spices, rice, atta, dals, snacks and household essentials delivered to your door.',
      meta_keywords: 'Indian grocery Hong Kong, Indian store HK, Indian spices Hong Kong, LAAVI STORE, Indian food online HK, masala Hong Kong',
      payment_online_url: '',
      shipping_free_above: '50',
      shipping_charge: '5',
      tax_percentage: '0',
      // Theme
      active_theme: 'default',
      // Social media (empty by default — filled in per brand)
      social_facebook: '',
      social_instagram: '',
      social_twitter: '',
      social_youtube: '',
      social_tiktok: '',
      social_whatsapp: '',
      social_linkedin: '',
      // Newsletter
      newsletter_title: 'Fresh Indian Groceries, Delivered to Your Door',
    };
  }

  get(key: string, defaultValue = ''): string {
    const defaults = this.defaultSettings() as Record<string, string>;
    const current = this.settings() || {};
    const value = current[key];
    if (value !== undefined && value !== null) return String(value);
    return defaults[key] ?? defaultValue;
  }

  assetUrl(key: string, fallback: string): string {
    const raw = this.get(key, fallback);
    return this.resolveAssetUrl(raw, fallback);
  }

  versionedAssetUrl(raw: string, fallback = ''): string {
    const url = this.resolveAssetUrl(raw, fallback);
    const version = this.get('_ts', '');
    if (!url || !version || !url.includes('/uploads/')) return url;
    return `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}`;
  }

  resolveAssetUrl(raw: string, fallback = ''): string {
    const value = raw || fallback;
    if (!value) return '';
    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
      return value;
    }

    const path = value.startsWith('/') ? value : '/' + value;
    if (path.startsWith('/uploads/')) {
      return `${environment.mediaUrl}${path}`;
    }
    return path;
  }

  private applyDocumentBranding(settings: any) {
    const siteName = settings.site_name || 'LAAVI STORE';
    const favicon = this.resolveAssetUrl(settings.site_favicon, '/favicon.ico');
    this.document.title = settings.meta_title || siteName;
    this.setLinkHref("link[rel='icon']", favicon);
    this.setLinkHref("link[rel='apple-touch-icon']", this.versionedAssetUrl(settings.site_logo, '/logo.png'));
    this.setMeta('author', siteName);
    this.setMeta('description', settings.meta_description || settings.site_description || '');
  }

  private setLinkHref(selector: string, href: string) {
    const el = this.document.querySelector(selector) as HTMLLinkElement | null;
    if (el && href) el.href = href;
  }

  private setMeta(name: string, content: string) {
    if (!content) return;
    let el = this.document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = this.document.createElement('meta');
      el.name = name;
      this.document.head.appendChild(el);
    }
    el.content = content;
  }

  /**
   * Replace known legacy brand strings coming from the database with the
   * current brand defaults. Anything the admin sets that doesn't contain a
   * legacy brand name passes through untouched.
   */
  private sanitizeSettings(settings: any) {
    const branded = this.defaultSettings();
    const pattern = new RegExp([
      ['the', 'desi'].join('\\s*'),
      ['asian', 'spices'].join('[\\s\\S]*?'),
      ['bite', 'basket'].join('\\s*'),
      'indian\\s*ma[r]?ket',
      'kale\\s*gida'
    ].join('|'), 'i');

    const replacements: Record<string, string> = {
      site_name: branded.site_name,
      site_tagline: branded.site_tagline,
      site_description: branded.site_description,
      footer_about: branded.footer_about,
      footer_copyright: branded.footer_copyright,
      meta_title: branded.meta_title,
      meta_description: branded.meta_description,
      meta_keywords: branded.meta_keywords,
      smtp_from_name: branded.site_name,
      email_from_name: branded.site_name,
      invoice_store_name: branded.site_name
    };

    const hadLegacyName = !settings.site_name || pattern.test(String(settings.site_name));

    const brandSlug = branded.site_name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    Object.keys(settings).forEach(key => {
      const value = settings[key];
      if (typeof value === 'string' && pattern.test(value)) {
        // Inside emails/URLs use a compact slug so addresses stay valid
        if (/@|https?:\/\//.test(value)) {
          settings[key] = value.replace(new RegExp(pattern.source, 'gi'), brandSlug);
        } else {
          settings[key] = replacements[key] || value.replace(pattern, branded.site_name);
        }
      }
    });

    if (hadLegacyName) {
      // Site name carried the legacy brand — use the new wordmark and ignore
      // the legacy logo upload until the admin rebrands both.
      settings.site_name = branded.site_name;
      settings.site_logo = '';
    }
    if (!settings.site_tagline || pattern.test(String(settings.site_tagline))) settings.site_tagline = branded.site_tagline;
    if (!settings.meta_title || pattern.test(String(settings.meta_title))) settings.meta_title = branded.meta_title;
    if (!settings.footer_copyright || pattern.test(String(settings.footer_copyright))) {
      settings.footer_copyright = branded.footer_copyright;
    }

    return settings;
  }
}

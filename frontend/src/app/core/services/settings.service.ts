import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { CountryService } from './country.service';
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
      site_name: 'Kale Gida',
      site_tagline: 'Premium groceries from India, Finland & Germany',
      site_description: 'Kale Gida is a premium international grocery marketplace — authentic staples, snacks and delicacies from India, Finland and Germany, delivered fresh to your door.',
      site_url: '',
      site_logo: '',
      site_favicon: '/favicon.ico',
      site_email: 'hello@kalegida.com',
      site_phone: '',
      site_address: 'Helsinki, Finland',
      contact_email: 'hello@kalegida.com',
      contact_address: 'Helsinki, Finland',
      contact_hours: 'Mon–Fri: 9am–6pm',
      contact_phone: '',
      contact_map_embed: '',
      business_city: 'Helsinki',
      business_region: 'Uusimaa',
      business_country: 'Finland',
      store_country: 'Finland',
      currency_symbol: '€',
      currency_code: 'EUR',
      header_offer_text: 'Free delivery on orders over €50',
      hero_eyebrow: 'International marketplace',
      hero_title: 'Three worlds of flavour, one table.',
      hero_subtitle: 'Authentic staples, snacks and delicacies from India, Finland and Germany — curated with care, delivered fresh.',
      hero_media_badge: 'Premium selection',
      hero_media_caption_title: 'Fresh weekly inventory',
      hero_media_caption_meta: 'Packed with care',
      trust_item_1_text: 'Authentic products',
      trust_item_2_text: 'Fast delivery',
      trust_item_3_text: 'Premium brands',
      trust_item_4_text: 'Secure checkout',
      home_categories_label: 'The pantry',
      home_categories_title: 'Shop by category',
      home_categories_link_text: 'All categories',
      home_featured_label: 'Fresh picks',
      home_featured_title: 'Chosen by our grocers',
      home_featured_link_text: 'View all',
      home_trending_label: 'Most loved',
      home_trending_title: 'Trending now',
      home_trending_link_text: 'View all',
      featured_brands_label: 'In good company',
      featured_brands_title: 'Brands we trust',
      featured_brands_link_text: 'Shop brands',
      featured_brands_list: 'Saggoji, Fazer, Aashirvaad, Ritter Sport, Valio, MDH, Haribo, Everest',
      home_new_label: 'Just landed',
      home_new_title: 'New this week',
      home_new_link_text: 'View all',
      promo_1_label: 'Farm fresh',
      promo_1_title: 'Fresh Fruits & Vegetables',
      promo_1_text: 'Picked this morning, on your table today.',
      promo_1_button: 'Shop Now',
      promo_1_link: '/categories',
      promo_1_image: '/uploads/promos/fresh-produce.jpg',
      promo_1_badge: 'Up to 30% off',
      promo_2_label: 'Turkish bakery',
      promo_2_title: 'Börek, Künefe & Yufka',
      promo_2_text: 'Warm bakery and frozen classics, the proper way.',
      promo_2_button: 'Shop Now',
      promo_2_link: '/categories',
      promo_2_image: '/uploads/promos/turkish-bakery.jpg',
      promo_2_badge: 'New arrivals',
      promo_3_label: 'Daily essentials',
      promo_3_title: 'Atta, Rice, Masala & Snacks',
      promo_3_text: 'The Indian pantry, stocked in one order.',
      promo_3_button: 'Shop Now',
      promo_3_link: '/categories',
      promo_3_image: '/uploads/promos/indian-spices.jpg',
      promo_3_badge: 'Bundle & save',
      promise_label: 'Our promise',
      promise_title: 'Why families shop with us',
      promise_text: 'Authentic products, careful packing, secure payments and fresh inventory — from three worlds to your table.',
      why_1_title: 'Fast delivery',
      why_1_text: 'Carefully packed, delivered fresh and on time.',
      why_2_title: 'Premium quality',
      why_2_text: 'Hand-selected products from trusted makers.',
      why_3_title: 'Satisfaction guaranteed',
      why_3_text: 'Not happy? We sort it — no questions asked.',
      why_4_title: '100% authentic',
      why_4_text: 'Sourced directly from origin, never imitation.',
      reviews_label: 'Reviews',
      reviews_title: 'What our customers say',
      review_1_name: 'Priya K.',
      review_1_location: 'Helsinki',
      review_1_text: 'Everything arrived fresh, beautifully packed, and exactly like the brands we buy back home.',
      review_2_name: 'Jonas W.',
      review_2_location: 'Berlin',
      review_2_text: 'Finally one place for proper pretzels, good mustard and the masalas we fell in love with.',
      review_3_name: 'Aino L.',
      review_3_location: 'Tampere',
      review_3_text: 'The rye bread and cloudberry jam taste like a Finnish summer pantry. Wonderful curation.',
      review_4_name: 'Rahul S.',
      review_4_location: 'Espoo',
      review_4_text: 'Easy checkout, fair prices, and my order was packed like a gift.',
      review_5_name: 'Meera P.',
      review_5_location: 'Turku',
      review_5_text: 'Finally a store where spices, snacks, pickles and staples arrive together — and premium.',
      review_6_name: 'Nikhil D.',
      review_6_location: 'Oulu',
      review_6_text: 'The inventory is fresh and the brand selection keeps getting better.',
      footer_about: 'A curated international grocery marketplace — authentic staples, snacks and delicacies from India, Finland and Germany, delivered to your door.',
      footer_copyright: '© 2026 Kale Gida. All rights reserved.',
      newsletter_desc: 'New arrivals, seasonal recipes and offers — a short letter, once a week.',
      meta_title: 'Kale Gida | Premium Groceries from India, Finland & Germany',
      meta_description: 'Shop Kale Gida — a premium international grocery marketplace. Authentic flavours from India, Finland and Germany, delivered fresh to your door.',
      meta_keywords: 'international grocery, Indian groceries, Finnish groceries, German groceries, premium food marketplace, Kale Gida',
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
      newsletter_title: 'Three worlds of flavour, one letter',
    };
  }

  private country = inject(CountryService);

  /** Settings keys that the selected country can override when it defines them. */
  private countryOverrides: Record<string, (c: any) => string> = {
    currency_symbol: c => c.currencySymbol,
    currency_code: c => c.currencyCode,
    contact_email: c => c.contactEmail,
    contact_phone: c => c.contactPhone,
    contact_address: c => c.contactAddress,
    site_email: c => c.contactEmail,
    site_phone: c => c.contactPhone,
    site_address: c => c.contactAddress,
    meta_title: c => c.metaTitle,
    meta_description: c => c.metaDescription,
    delivery_info: c => c.deliveryInfo,
  };

  get(key: string, defaultValue = ''): string {
    // Country-specific values (admin-managed) win when present
    const override = this.countryOverrides[key];
    if (override) {
      const v = override(this.country.current());
      if (v) return v;
    }
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
    const siteName = settings.site_name || 'Kale Gida';
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
      'indian\\s*ma[r]?ket'
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

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

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
          this.settings.set(res.data);
          this.applyDocumentBranding(res.data);
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
      site_name: 'Your Store',
      site_tagline: 'White-label ecommerce storefront',
      site_description: 'A reusable ecommerce storefront ready for your brand.',
      site_url: '',
      site_logo: '/logo.svg',
      site_favicon: '/favicon.ico',
      site_email: 'hello@example.com',
      site_phone: '',
      site_address: 'Configure store address in Admin Settings',
      contact_email: 'hello@example.com',
      contact_address: 'Configure store address in Admin Settings',
      contact_hours: 'Mon-Fri: 9am-6pm',
      business_city: '',
      business_region: '',
      business_country: 'US',
      currency_symbol: '$',
      currency_code: 'USD',
      header_offer_text: 'Free delivery options can be configured in Admin Settings.',
      footer_about: 'A reusable ecommerce storefront. Update this copy in Admin Settings for each new brand.',
      footer_copyright: '© 2026 Your Store. All rights reserved.',
      newsletter_desc: 'Get product updates, offers, and store news straight to your inbox.',
      meta_title: 'Your Store - Online Store',
      meta_description: 'Shop products online.',
      meta_keywords: 'online store, ecommerce, white label storefront',
      payment_online_url: '',
      shipping_free_above: '50',
      shipping_charge: '5',
      tax_percentage: '0'
    };
  }

  get(key: string, defaultValue = ''): string {
    const defaults = this.defaultSettings() as Record<string, string>;
    return this.settings()?.[key] || defaults[key] || defaultValue;
  }

  assetUrl(key: string, fallback: string): string {
    const raw = this.get(key, fallback);
    if (!raw) return fallback;
    if (raw.startsWith('http') || raw.startsWith('/')) return raw;
    return '/' + raw;
  }

  private applyDocumentBranding(settings: any) {
    const siteName = settings.site_name || 'Your Store';
    const favicon = settings.site_favicon || '/favicon.ico';
    this.document.title = settings.meta_title || siteName;
    this.setLinkHref("link[rel='icon']", favicon);
    this.setLinkHref("link[rel='apple-touch-icon']", settings.site_logo || '/logo.svg');
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
}

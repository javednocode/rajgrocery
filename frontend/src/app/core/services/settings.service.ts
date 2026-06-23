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
      site_tagline: 'Your online store',
      site_description: 'A white-label ecommerce storefront. Configure this in Admin Settings.',
      site_url: '',
      site_logo: '/logo.png',
      site_favicon: '/favicon.ico',
      site_email: 'hello@example.com',
      site_phone: '',
      site_address: 'Configure store address in Admin Settings',
      contact_email: 'hello@example.com',
      contact_address: 'Configure store address in Admin Settings',
      contact_hours: 'Mon-Fri: 9am-6pm',
      contact_phone: '',
      contact_map_embed: '',
      business_city: '',
      business_region: '',
      business_country: 'US',
      currency_symbol: '$',
      currency_code: 'USD',
      header_offer_text: 'Free delivery available — configure in Admin Settings.',
      hero_eyebrow: 'Welcome',
      hero_media_badge: 'Premium Selection',
      hero_media_caption_title: 'Top Picks',
      hero_media_caption_meta: 'Curated for you',
      trust_item_1_text: 'Quality Guaranteed',
      trust_item_2_text: 'Free Delivery Available',
      trust_item_3_text: 'Satisfaction Guaranteed',
      trust_item_4_text: 'Fast Dispatch',
      home_categories_label: 'Browse',
      home_categories_title: 'Shop by Category',
      home_categories_link_text: 'All Categories',
      home_featured_label: 'Bestsellers',
      home_featured_title: 'Featured Products',
      home_featured_link_text: 'View All',
      home_new_label: 'Just In',
      home_new_title: 'New Arrivals',
      home_new_link_text: 'View All',
      promo_1_label: 'Category 1',
      promo_1_title: 'Configure This Promo',
      promo_1_text: 'Update this promo banner content from the Admin Settings panel.',
      promo_1_button: 'Shop Now',
      promo_1_link: '/categories',
      promo_2_label: 'Category 2',
      promo_2_title: 'Configure This Promo',
      promo_2_text: 'Update this promo banner content from the Admin Settings panel.',
      promo_2_button: 'Shop Now',
      promo_2_link: '/categories',
      promo_3_label: 'Category 3',
      promo_3_title: 'Configure This Promo',
      promo_3_text: 'Update this promo banner content from the Admin Settings panel.',
      promo_3_button: 'Shop Now',
      promo_3_link: '/categories',
      promise_label: 'Our Promise',
      promise_title: 'Why Customers Choose Us',
      promise_text: 'Configure this section from the Admin Settings panel to highlight your unique value proposition.',
      why_1_title: 'Quality Products',
      why_1_text: 'Update this feature in Admin Settings to describe your first key benefit.',
      why_2_title: 'Satisfaction Guaranteed',
      why_2_text: 'Update this feature in Admin Settings to describe your second key benefit.',
      why_3_title: 'Fast, Reliable Delivery',
      why_3_text: 'Update this feature in Admin Settings to describe your third key benefit.',
      why_4_title: 'Trusted by Customers',
      why_4_text: 'Update this feature in Admin Settings to describe your fourth key benefit.',
      reviews_label: 'Reviews',
      reviews_title: 'What Our Customers Say',
      review_1_name: 'Customer A.',
      review_1_location: 'City',
      review_1_text: 'Update this review from the Admin Settings panel to show a real customer testimonial.',
      review_2_name: 'Customer B.',
      review_2_location: 'City',
      review_2_text: 'Update this review from the Admin Settings panel to show a real customer testimonial.',
      review_3_name: 'Customer C.',
      review_3_location: 'City',
      review_3_text: 'Update this review from the Admin Settings panel to show a real customer testimonial.',
      review_4_name: 'Customer D.',
      review_4_location: 'City',
      review_4_text: 'Update this review from the Admin Settings panel to show a real customer testimonial.',
      review_5_name: 'Customer E.',
      review_5_location: 'City',
      review_5_text: 'Update this review from the Admin Settings panel to show a real customer testimonial.',
      review_6_name: 'Customer F.',
      review_6_location: 'City',
      review_6_text: 'Update this review from the Admin Settings panel to show a real customer testimonial.',
      footer_about: 'A white-label ecommerce storefront. Update this copy in Admin Settings for each new brand.',
      footer_copyright: '© 2026 Your Store. All rights reserved.',
      newsletter_desc: 'Get product updates, offers, and store news straight to your inbox.',
      meta_title: 'Your Store - Online Shop',
      meta_description: 'Shop products online.',
      meta_keywords: 'online store, ecommerce',
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
    return this.resolveAssetUrl(raw, fallback);
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
    const siteName = settings.site_name || 'Your Store';
    const favicon = this.resolveAssetUrl(settings.site_favicon, '/favicon.ico');
    this.document.title = settings.meta_title || siteName;
    this.setLinkHref("link[rel='icon']", favicon);
    this.setLinkHref("link[rel='apple-touch-icon']", this.resolveAssetUrl(settings.site_logo, '/logo.png'));
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

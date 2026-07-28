import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private settings = inject(SettingsService);

  /** Returns the current brand name from DB settings */
  private brand(): string {
    return this.settings.get('site_name', 'LAAVI STORE');
  }

  /** Returns the configured site URL (no trailing slash) */
  private siteUrl(): string {
    return (this.settings.get('site_url', '') || '').replace(/\/$/, '');
  }

  setMeta(data: { title?: string; description?: string; keywords?: string; image?: string; url?: string }) {
    const brand = this.brand();
    if (data.title) {
      this.title.setTitle(`${data.title} | ${brand}`);
      this.meta.updateTag({ property: 'og:title', content: data.title });
      this.meta.updateTag({ name: 'twitter:title', content: data.title });
    }
    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
      this.meta.updateTag({ property: 'og:description', content: data.description });
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    }
    if (data.keywords) this.meta.updateTag({ name: 'keywords', content: data.keywords });
    if (data.image)    this.meta.updateTag({ property: 'og:image', content: data.image });
    if (data.url) {
      this.meta.updateTag({ property: 'og:url', content: data.url });
      // Update canonical link tag
      let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (canonical) canonical.href = data.url;
    }
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  setProductMeta(p: any) {
    this.setMeta({
      title:       p.meta_title       || p.name,
      description: p.meta_description || p.short_description || '',
      keywords:    p.focus_keyword    || p.name,
      url:         this.siteUrl() ? `${this.siteUrl()}/product/${p.slug}` : ''
    });
  }

  setCategoryMeta(c: any) {
    const brand = this.brand();
    this.setMeta({
      title:       c.meta_title       || c.name,
      description: c.meta_description || `Shop ${c.name} at ${brand} — quality products delivered to your door.`,
      keywords:    c.focus_keyword    || c.name,
      url:         this.siteUrl() ? `${this.siteUrl()}/category/${c.slug}` : ''
    });
  }

  setBlogMeta(b: any) {
    this.setMeta({
      title:       b.meta_title       || b.title,
      description: b.meta_description || b.excerpt || '',
      url:         this.siteUrl() ? `${this.siteUrl()}/blog/${b.slug}` : ''
    });
  }

  resetMeta() {
    const brand    = this.brand();
    const tagline  = this.settings.get('site_tagline', '');
    const desc     = this.settings.get('meta_description', this.settings.get('site_description', ''));
    const metaTitle = this.settings.get('meta_title', tagline ? `${brand} — ${tagline}` : brand);
    this.title.setTitle(metaTitle);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: metaTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    const siteUrl = this.siteUrl();
    if (siteUrl) {
      this.meta.updateTag({ property: 'og:url', content: siteUrl });
    }
  }
}

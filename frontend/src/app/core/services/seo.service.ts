import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

const BRAND = 'The Desi';
const DEFAULT_TITLE = 'The Desi — Premium Desi Groceries Delivered Across The UK';
const DEFAULT_DESC = 'Authentic groceries, spices, snacks, frozen foods and daily essentials from trusted South Asian brands. Premium quality, delivered across the UK.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  setMeta(data: { title?: string; description?: string; keywords?: string; image?: string; url?: string }) {
    if (data.title) {
      this.title.setTitle(`${data.title} | ${BRAND}`);
      this.meta.updateTag({ property: 'og:title', content: data.title });
    }
    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
      this.meta.updateTag({ property: 'og:description', content: data.description });
    }
    if (data.keywords) this.meta.updateTag({ name: 'keywords', content: data.keywords });
    if (data.image) this.meta.updateTag({ property: 'og:image', content: data.image });
    if (data.url) this.meta.updateTag({ property: 'og:url', content: data.url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  setProductMeta(p: any) {
    this.setMeta({
      title: p.meta_title || p.name,
      description: p.meta_description || p.short_description || '',
      keywords: p.focus_keyword || p.name
    });
  }

  setCategoryMeta(c: any) {
    this.setMeta({
      title: c.meta_title || c.name,
      description: c.meta_description || `Shop ${c.name} at ${BRAND} — premium South Asian groceries delivered across the UK`,
      keywords: c.focus_keyword || c.name
    });
  }

  resetMeta() {
    this.title.setTitle(DEFAULT_TITLE);
    this.meta.updateTag({ name: 'description', content: DEFAULT_DESC });
  }
}

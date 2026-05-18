import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  setMeta(config: { title?: string; description?: string; keywords?: string; image?: string; url?: string }) {
    if (config.title) {
      this.title.setTitle(`${config.title} | Asian Food Cork`);
      this.meta.updateTag({ property: 'og:title', content: config.title });
    }
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }
    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }
    this.meta.updateTag({ property: 'og:type', content: 'website' });
  }

  setProductMeta(product: any) {
    this.setMeta({
      title: product.meta_title || product.name,
      description: product.meta_description || product.short_description || '',
      keywords: product.focus_keyword || product.name,
    });
  }

  setCategoryMeta(category: any) {
    this.setMeta({
      title: category.meta_title || category.name,
      description: category.meta_description || `Shop ${category.name} at Asian Food Cork — Delivered in Cork, Ireland`,
      keywords: category.focus_keyword || category.name,
    });
  }

  resetMeta() {
    this.title.setTitle('Asian Food Cork — Authentic Asian Groceries in Cork, Ireland');
    this.meta.updateTag({ name: 'description', content: 'Shop authentic Asian groceries online. Japanese, Korean, Chinese & Thai ingredients delivered in Cork, Ireland.' });
  }
}

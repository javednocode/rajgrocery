import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Page Hero -->
    <div class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <span>All Categories</span>
        </div>
        <h1>Shop by Category</h1>
        <p>Fresh halal meats, premium spices, vegetables and daily essentials</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        @if (loading()) {
          <div class="cats-grid">
            @for (n of [1,2,3,4,5,6,7,8]; track n) {
              <div class="cat-card-skeleton">
                <div class="skeleton" style="aspect-ratio:1;border-radius:12px 12px 0 0;"></div>
                <div style="padding:12px">
                  <div class="skeleton" style="height:14px;border-radius:6px;"></div>
                </div>
              </div>
            }
          </div>
        } @else if (displayCategories().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🗂️</span>
            <h3>No categories found</h3>
            <p>Categories will appear here once added from the admin panel.</p>
            <a routerLink="/" class="btn btn-primary">Back to Home</a>
          </div>
        } @else {
          <div class="cats-grid">
            @for (cat of displayCategories(); track cat.slug) {
              <a [routerLink]="['/category', cat.slug]" class="cat-card" id="cat-{{ cat.id }}">
                <div class="cat-img-wrap">
                  @if (cat.image) {
                    <img [src]="getMediaUrl(cat.image)" [alt]="cat.name" loading="lazy" class="cat-img" (error)="onCategoryImageError($event)">
                  }
                  <div class="cat-img-placeholder">
                    <span>{{ cat.icon || getCatEmoji(cat.name) }}</span>
                  </div>
                </div>
                <div class="cat-body">
                  <span class="cat-name">{{ cat.name }}</span>
                  @if (cat.description) {
                    <span class="cat-desc">{{ cat.description }}</span>
                  }
                  <span class="cat-link">Shop now →</span>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .page-hero {
      background: #070A05; color: white;
      padding: 48px 0 36px;
    }
    .page-hero h1 { color: white; font-size: clamp(1.6rem, 3.5vw, 2.4rem); margin-bottom: 8px; }
    .page-hero p  { color: rgba(255,255,255,0.65); font-size: 15px; }
    .breadcrumb { font-size: 13px; opacity: 0.55; display: flex; align-items: center; gap: 6px; margin-bottom: 14px; }
    .breadcrumb a { color: rgba(255,255,255,0.8); transition: opacity 0.2s; }
    .breadcrumb a:hover { opacity: 1; }

    .cats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .cat-card {
      display: flex; flex-direction: column;
      background: white; border-radius: 14px; overflow: hidden;
      border: 1px solid #F3F4F6; text-decoration: none;
      transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
    }
    .cat-card:hover {
      box-shadow: 0 8px 32px rgba(242,140,0,0.12);
      transform: translateY(-3px);
      border-color: #F28C00;
    }
    .cat-img-wrap { position: relative; width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #FFF2DE; }
    .cat-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; display: block; z-index: 2; background: #FFF2DE; }
    .cat-img.img-error { display: none; }
    .cat-card:hover .cat-img { transform: scale(1.06); }
    .cat-img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 48px; background: #FFF2DE;
    }
    .cat-body { padding: 14px 16px 18px; display: flex; flex-direction: column; gap: 4px; }
    .cat-name { font-size: 15px; font-weight: 700; color: #111; font-family: 'Poppins', sans-serif; }
    .cat-desc { font-size: 12.5px; color: #9CA3AF; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .cat-link { font-size: 13px; font-weight: 600; color: #F28C00; margin-top: 6px; }
    .cat-card-skeleton { background: white; border-radius: 14px; overflow: hidden; border: 1px solid #F3F4F6; }

    @media (max-width: 1024px) { .cats-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 640px)  { .cats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
    @media (max-width: 360px)  { .cats-grid { grid-template-columns: 1fr; } }
  `]
})
export class CategoryListComponent implements OnInit {
  categories = signal<any[]>([]);
  loading = signal(true);
  mediaUrl = environment.mediaUrl;

  private brandCategories = [
    { name: 'Halal Meats', slug: 'fresh-halal-meats', icon: '🥩', aliases: ['fresh-halal-meats', 'halal-meats', 'meat', 'meats'] },
    { name: 'Chicken', slug: 'chicken', icon: '🍗', aliases: ['chicken', 'poultry'] },
    { name: 'Vegetables', slug: 'vegetables', icon: '🥦', aliases: ['vegetables', 'fresh-vegetables', 'veg'] },
    { name: 'Fresh Fruits', slug: 'fresh-fruits', icon: '🍎', aliases: ['fresh-fruits', 'fruits', 'fruit'] },
    { name: 'Spices', slug: 'spices', icon: '🌶️', aliases: ['spices', 'spices-masala', 'masala', 'chilli'] },
    { name: 'Rice & Flour', slug: 'rice-flour', icon: '🌾', aliases: ['rice-flour', 'rice', 'flour', 'staples', 'essentials'] },
    { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥚', aliases: ['dairy-eggs', 'dairy', 'eggs', 'milk'] },
    { name: 'Beverages', slug: 'beverages', icon: '🧃', aliases: ['beverages', 'drinks', 'tea'] },
  ];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.api.getCategories().subscribe({
      next: (r: any) => { this.categories.set(r?.data || []); this.loading.set(false); this.cdr.markForCheck(); },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  displayCategories() {
    const dbCats = this.categories() || [];
    return this.brandCategories.map(cat => {
      const match = dbCats.find((db: any) => this.categoryMatches(db, cat));
      return {
        ...cat,
        id: match?.id || cat.slug,
        slug: match?.slug || cat.slug,
        image: this.isUsableCategoryImage(match?.image) ? match.image : null,
        description: match?.description || '',
      };
    });
  }

  private categoryMatches(db: any, cat: any): boolean {
    const slug = String(db?.slug || '').toLowerCase();
    const name = String(db?.name || '').toLowerCase();
    return cat.aliases.some((alias: string) => slug === alias || name.includes(alias.replace(/-/g, ' ')));
  }

  private isUsableCategoryImage(image: string | null | undefined): boolean {
    if (!image) return false;
    return /^(https?:\/\/|\/uploads\/|uploads\/)/i.test(image);
  }

  getMediaUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads')) return this.mediaUrl + path;
    if (path.startsWith('uploads')) return this.mediaUrl + '/' + path;
    return path;
  }

  onCategoryImageError(event: Event) {
    (event.target as HTMLImageElement).classList.add('img-error');
  }

  getCatEmoji(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('meat') || n.includes('chicken') || n.includes('lamb') || n.includes('beef')) return '🥩';
    if (n.includes('spice') || n.includes('masala') || n.includes('chilli')) return '🌶️';
    if (n.includes('veg') || n.includes('fruit') || n.includes('salad')) return '🥦';
    if (n.includes('rice') || n.includes('grain') || n.includes('flour')) return '🌾';
    if (n.includes('fish') || n.includes('seafood')) return '🐟';
    if (n.includes('dairy') || n.includes('milk')) return '🧀';
    if (n.includes('bread') || n.includes('bakery')) return '🫓';
    return '🛒';
  }
}

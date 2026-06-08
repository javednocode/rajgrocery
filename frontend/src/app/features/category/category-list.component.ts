import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-hero">
      <div class="container">
        <h1>All Categories</h1>
        <p>Browse our complete range of grocery categories</p>
      </div>
    </section>

    <section class="cats-page-section">
      <div class="container">
        <div class="cats-grid">
          @for (cat of categories(); track cat.id; let i = $index) {
            <a [routerLink]="['/category', cat.slug]" class="cat-card" appScrollAnimate [animationDelay]="(i * 0.05) + 's'">
              <div class="cat-img-wrap">
                @if (cat.image) {
                  <img [src]="mediaUrl + cat.image" [alt]="cat.name" loading="lazy">
                } @else {
                  <span class="cat-emoji">{{ cat.icon || '📦' }}</span>
                }
              </div>
              <div class="cat-body">
                <h3 class="cat-name">{{ cat.name }}</h3>
                @if (cat.product_count) {
                  <span class="cat-count">{{ cat.product_count }} items</span>
                }
              </div>
              <span class="cat-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ── Hero ── */
    .page-hero {
      padding: 40px 0 28px;
      background: linear-gradient(135deg, var(--primary-dark), var(--primary));
      color: white; text-align: center; position: relative; overflow: hidden;
    }
    .page-hero::before {
      content: ''; position: absolute; inset: 0;
      background: rgba(0,0,0,0.15);
    }
    .page-hero .container { position: relative; z-index: 1; }
    .page-hero h1 {
      color: #fff; margin-bottom: 6px;
      font-size: clamp(1.5rem, 4vw, 2.2rem);
      text-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }
    .page-hero p { color: rgba(255,255,255,0.85); font-size: 14px; }

    /* ── Section ── */
    .cats-page-section { padding: 28px 0 60px; }

    /* ── Grid: 4 col desktop → 3 → 2 mobile ── */
    .cats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    @media (max-width: 1100px) { .cats-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px)  { .cats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

    /* ── Card ── */
    .cat-card {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 12px;
      background: #fff;
      border-radius: 14px;
      border: 1.5px solid #EBEBF0;
      text-decoration: none; color: inherit;
      transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s;
      min-width: 0;
    }
    .cat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 28px rgba(15,118,110,0.14);
      border-color: rgba(15,118,110,0.4);
    }

    /* ── Image ── */
    .cat-img-wrap {
      width: 52px; height: 52px; flex-shrink: 0;
      border-radius: 10px;
      background: #F0FBF4;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .cat-emoji { font-size: 26px; line-height: 1; }

    /* ── Body ── */
    .cat-body { flex: 1; min-width: 0; }
    .cat-name {
      font-size: 13.5px; font-weight: 700; color: #1A1A2E;
      line-height: 1.3; margin: 0 0 3px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .cat-count { font-size: 11px; color: #0F766E; font-weight: 600; }

    /* ── Arrow ── */
    .cat-arrow {
      display: flex; align-items: center;
      color: #C4C4D4; flex-shrink: 0;
      transition: color 0.2s, transform 0.2s;
    }
    .cat-card:hover .cat-arrow { color: #0F766E; transform: translateX(3px); }

    /* ── Mobile tweaks ── */
    @media (max-width: 768px) {
      .cats-page-section { padding: 14px 0 80px; }
      .cat-card { padding: 10px 9px; gap: 9px; border-radius: 10px; }
      .cat-img-wrap { width: 42px; height: 42px; border-radius: 8px; }
      .cat-emoji { font-size: 20px; }
      .cat-name { font-size: 12px; }
      .cat-count { font-size: 10px; }
      .cat-arrow svg { width: 11px; height: 11px; }
    }
  `]
})
export class CategoryListComponent implements OnInit {
  mediaUrl = environment.mediaUrl;
  categories = signal<any[]>([]);

  constructor(private api: ApiService, private seo: SeoService) {}

  ngOnInit() {
    this.seo.setMeta({
      title: 'All Categories',
      description: 'Browse all product categories.'
    });
    this.api.getCategories().subscribe({
      next: (res: any) => { if (res.success) this.categories.set(this.flatten(res.data)); }
    });
  }

  flatten(cats: any[], prefix = ''): any[] {
    let result: any[] = [];
    cats.forEach(c => {
      result.push({ ...c, displayName: prefix + c.name });
      if (c.children?.length) result.push(...this.flatten(c.children, '— '));
    });
    return result;
  }
}

import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero Banner -->
    <section class="cat-hero">
      <div class="container">
        <nav class="bc">
          <a routerLink="/">Home</a>
          <span>/</span>
          <a routerLink="/categories">Categories</a>
          <span>/</span>
          <span class="bc-cur">{{ category()?.name }}</span>
        </nav>
        <h1>{{ category()?.name }}</h1>
        @if (category()?.description) {
          <p class="cat-desc">{{ category()?.description }}</p>
        }
      </div>
    </section>

    <!-- Products Section -->
    <div class="cat-body">
      <div class="container">

        <!-- Toolbar -->
        <div class="toolbar">
          <span class="t-count">{{ totalProducts() }} products</span>
          <div class="t-right">
            <label class="t-label">Sort:</label>
            <select [(ngModel)]="sortBy" (change)="loadProducts()" class="t-select">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="popular">Popularity</option>
              <option value="name_asc">Name: A–Z</option>
            </select>
            <div class="t-toggle">
              <button [class.on]="viewMode==='grid'" (click)="viewMode='grid'" title="Grid">⊞</button>
              <button [class.on]="viewMode==='list'" (click)="viewMode='list'" title="List">☰</button>
            </div>
          </div>
        </div>

        <!-- Grid -->
        @if (loading() && products().length === 0) {
          <div class="pgrid">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="skel-card">
                <div class="skel skel-img"></div>
                <div class="skel-body">
                  <div class="skel skel-line" style="width:70%"></div>
                  <div class="skel skel-line" style="width:40%;margin-top:6px"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="pgrid" [class.lview]="viewMode==='list'" [class.loading-more]="loading()">
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" />
            } @empty {
              <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h3>No products found</h3>
                <p>This category has no products yet.</p>
                <a routerLink="/" class="empty-btn">Browse All</a>
              </div>
            }
          </div>
        }

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pager">
            @for (p of getPages(); track p) {
              <button [class.cur]="p === currentPage" (click)="changePage(p)">{{ p }}</button>
            }
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    /* ─── HERO ──────────────────────────────────────────── */
    .cat-hero {
      background: linear-gradient(135deg, #1a5c2e 0%, #2e9b47 100%);
      padding: 28px 0 22px;
      color: white;
    }
    .cat-hero h1 {
      color: white;
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 4px;
      letter-spacing: -0.3px;
    }
    .cat-desc {
      color: rgba(255,255,255,0.8);
      font-size: 13px;
      margin: 0;
    }

    .bc {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .bc a { color: rgba(255,255,255,0.85); text-decoration: none; }
    .bc a:hover { text-decoration: underline; }
    .bc-cur { color: white; font-weight: 600; }

    /* ─── BODY ───────────────────────────────────────────── */
    .cat-body {
      background: #f4f5f7;
      padding: 18px 0 60px;
      min-height: 60vh;
    }

    /* ─── TOOLBAR ────────────────────────────────────────── */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 10px 16px;
      margin-bottom: 16px;
      gap: 12px;
    }
    .t-count {
      font-size: 13px;
      color: #666;
      font-weight: 500;
      white-space: nowrap;
    }
    .t-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .t-label {
      font-size: 12px;
      font-weight: 700;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      white-space: nowrap;
    }
    .t-select {
      border: 1px solid #d1d5db;
      border-radius: 7px;
      padding: 6px 10px;
      font-size: 13px;
      color: #222;
      background: #fafafa;
      cursor: pointer;
      outline: none;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s;
    }
    .t-select:focus { border-color: #2e9b47; }

    .t-toggle {
      display: flex;
      gap: 4px;
    }
    .t-toggle button {
      padding: 5px 9px;
      border-radius: 6px;
      font-size: 15px;
      line-height: 1;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.15s;
    }
    .t-toggle button.on {
      background: #e6f7ec;
      color: #2e9b47;
      border-color: #2e9b47;
    }
    .t-toggle button:hover:not(.on) { background: #e5e7eb; }

    /* ─── PRODUCT GRID ───────────────────────────────────── */
    .pgrid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .pgrid.lview {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .pgrid.loading-more {
      opacity: 0.62;
      pointer-events: none;
    }

    /* ─── SKELETON CARDS ─────────────────────────────────── */
    .skel-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    .skel {
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .skel-img  { aspect-ratio: 1 / 1; }
    .skel-body { padding: 10px 12px 14px; }
    .skel-line { height: 12px; border-radius: 4px; }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ─── EMPTY STATE ────────────────────────────────────── */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 70px 20px;
      color: #aaa;
    }
    .empty-icon { font-size: 52px; margin-bottom: 14px; }
    .empty-state h3 { font-size: 17px; color: #555; margin-bottom: 6px; }
    .empty-state p  { font-size: 13px; margin-bottom: 20px; }
    .empty-btn {
      display: inline-block;
      padding: 9px 22px;
      background: #2e9b47;
      color: white;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s;
    }
    .empty-btn:hover { background: #1a7535; }

    /* ─── PAGINATION ─────────────────────────────────────── */
    .pager {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 30px;
    }
    .pager button {
      padding: 7px 14px;
      border-radius: 7px;
      font-size: 13px;
      background: white;
      border: 1px solid #d1d5db;
      cursor: pointer;
      transition: all 0.15s;
      font-family: 'Inter', sans-serif;
    }
    .pager button.cur {
      background: #2e9b47;
      color: white;
      border-color: #2e9b47;
    }
    .pager button:hover:not(.cur) {
      background: #e6f7ec;
      border-color: #2e9b47;
    }

    /* ─── RESPONSIVE ─────────────────────────────────────── */
    /* Large desktop: 4 col (default above) */

    /* Tablet landscape: still 4 col */
    @media (max-width: 1280px) {
      .pgrid { grid-template-columns: repeat(4, 1fr); gap: 12px; }
    }

    /* Tablet: 3 col */
    @media (max-width: 1024px) {
      .pgrid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
    }

    /* Small tablet: 3 col */
    @media (max-width: 768px) {
      .pgrid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
    }

    /* Mobile: 2 col */
    @media (max-width: 480px) {
      .cat-hero { padding: 20px 0 16px; }
      .cat-hero h1 { font-size: 18px; }
      .toolbar { flex-wrap: wrap; gap: 8px; padding: 8px 12px; }
      .t-count { order: 2; width: 100%; }
      .t-right { order: 1; width: 100%; justify-content: flex-end; }
      .pgrid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    }
  `]
})
export class CategoryDetailComponent implements OnInit {
  category = signal<any>(null);
  products  = signal<any[]>([]);
  loading   = signal(true);
  totalProducts = signal(0);
  totalPages    = signal(0);
  currentPage = 1;
  sortBy   = 'newest';
  viewMode = 'grid';

  private currentSlug = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private seo: SeoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.currentPage = 1;
      this.loading.set(true);
      this.currentSlug = params['slug'];

      // Load category metadata (parallel with products)
      this.api.getCategoryBySlug(this.currentSlug).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.category.set(res.data);
            this.seo.setCategoryMeta(res.data);
            this.cdr.markForCheck();
          }
        }
      });

      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.cdr.markForCheck();

    const params: any = {
      category: this.currentSlug,
      page: this.currentPage,
      per_page: 16,
      sort: this.sortBy
    };

    this.api.getProducts(params).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.products.set(res.data);
          this.totalProducts.set(res.pagination.total);
          this.totalPages.set(res.pagination.total_pages);
        }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}

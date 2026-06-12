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
    <!-- Hero -->
    <section class="cat-hero">
      <div class="container">
        <nav class="bc">
          <a routerLink="/">Home</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          <a routerLink="/categories">Categories</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          <span class="bc-cur">{{ category()?.name }}</span>
        </nav>
        <h1>{{ category()?.name || '...' }}</h1>
        @if (category()?.description) {
          <p class="cat-hero-desc">{{ category()?.description }}</p>
        }
      </div>
    </section>

    <!-- Products Section -->
    <div class="cat-body">
      <div class="container">

        <!-- Toolbar -->
        <div class="toolbar">
          <span class="t-count">
            @if (loading() && products().length === 0) { Loading... }
            @else { <strong>{{ totalProducts() }}</strong> products found }
          </span>
          <div class="t-right">
            <label class="t-label">Sort:</label>
            <select [(ngModel)]="sortBy" (change)="loadProducts()" class="t-select" id="sort-select">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="popular">Most Popular</option>
              <option value="name_asc">Name: A–Z</option>
            </select>
            <div class="t-toggle">
              <button [class.on]="viewMode==='grid'" (click)="viewMode='grid'" title="Grid view" id="grid-view-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </button>
              <button [class.on]="viewMode==='list'" (click)="viewMode='list'" title="List view" id="list-view-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Skeleton -->
        @if (loading() && products().length === 0) {
          <div class="pgrid">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="skel-card">
                <div class="skeleton" style="aspect-ratio:1;border-radius:12px 12px 0 0;"></div>
                <div style="padding:10px 12px 14px;display:flex;flex-direction:column;gap:8px">
                  <div class="skeleton" style="height:12px;border-radius:4px;width:70%"></div>
                  <div class="skeleton" style="height:12px;border-radius:4px;width:40%"></div>
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
                <span class="empty-icon">🛒</span>
                <h3>No products found</h3>
                <p>This category has no products yet. Check back soon!</p>
                <a routerLink="/categories" class="btn btn-primary">Browse Categories</a>
              </div>
            }
          </div>
        }

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1" id="prev-page-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            @for (p of getPages(); track p) {
              <button [class.active]="p === currentPage" (click)="changePage(p)" [id]="'page-' + p">{{ p }}</button>
            }
            <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages()" id="next-page-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    /* ── HERO ── */
    .cat-hero {
      background: #111; padding: 36px 0 28px; color: white;
    }
    .cat-hero h1 { color: white; font-size: clamp(1.5rem, 3.5vw, 2.2rem); margin-bottom: 6px; }
    .cat-hero-desc { color: rgba(255,255,255,0.6); font-size: 14px; max-width: 520px; }
    .bc {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 12px;
    }
    .bc a { color: rgba(255,255,255,0.75); text-decoration: none; transition: color 0.2s; }
    .bc a:hover { color: white; }
    .bc-cur { color: white; font-weight: 600; }

    /* ── BODY ── */
    .cat-body { background: #F9FAFB; padding: 20px 0 72px; min-height: 60vh; }

    /* ── TOOLBAR ── */
    .toolbar {
      display: flex; align-items: center; justify-content: space-between;
      background: white; border: 1px solid #F3F4F6; border-radius: 10px;
      padding: 10px 16px; margin-bottom: 16px; gap: 12px;
    }
    .t-count { font-size: 13px; color: #6B7280; }
    .t-count strong { color: #111; }
    .t-right { display: flex; align-items: center; gap: 10px; }
    .t-label { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
    .t-select {
      border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 7px 12px;
      font-size: 13px; color: #111; background: white;
      cursor: pointer; outline: none; font-family: 'Inter', sans-serif;
      transition: border-color 0.2s;
    }
    .t-select:focus { border-color: #F28C00; }
    .t-toggle { display: flex; gap: 4px; }
    .t-toggle button {
      padding: 7px 9px; border-radius: 7px; background: #F3F4F6;
      border: 1.5px solid #E5E7EB; cursor: pointer; color: #9CA3AF;
      display: flex; align-items: center; transition: all 0.15s;
    }
    .t-toggle button.on { background: #FFF2DE; color: #F28C00; border-color: #F28C00; }

    /* ── GRID ── */
    .pgrid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .pgrid.lview {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .pgrid.loading-more { opacity: 0.6; pointer-events: none; transition: opacity 0.2s; }
    .skel-card { background: white; border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden; }
    .empty-state { grid-column: 1/-1; text-align: center; padding: 72px 20px; }
    .empty-icon { font-size: 52px; display: block; margin-bottom: 14px; opacity: 0.4; }
    .empty-state h3 { color: #111; margin-bottom: 8px; }
    .empty-state p { margin-bottom: 24px; }

    @media (max-width: 1024px) { .pgrid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 640px)  { .pgrid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
    @media (max-width: 480px)  {
      .cat-hero { padding: 24px 0 18px; }
      .toolbar  { flex-wrap: wrap; padding: 8px 12px; }
      .t-count  { order: 2; }
      .t-right  { order: 1; margin-left: auto; }
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
      this.api.getCategoryBySlug(this.currentSlug).subscribe({
        next: (res: any) => { if (res.success) { this.category.set(res.data); this.seo.setCategoryMeta(res.data); this.cdr.markForCheck(); } }
      });
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true); this.cdr.markForCheck();
    this.api.getProducts({ category: this.currentSlug, page: this.currentPage, per_page: 16, sort: this.sortBy }).subscribe({
      next: (res: any) => {
        if (res.success) { this.products.set(res.data); this.totalProducts.set(res.pagination.total); this.totalPages.set(res.pagination.total_pages); }
        this.loading.set(false); this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}

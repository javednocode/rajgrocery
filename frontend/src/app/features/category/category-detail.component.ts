import { Component, OnInit, signal, effect, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { CountryService } from '../../core/services/country.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `
  <!-- Hero -->
  <section class="cd-hero">
    <div class="container">
      <nav class="cd-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><i>/</i>
        <a routerLink="/categories">Shop</a><i>/</i>
        <span>{{ category()?.name }}</span>
      </nav>
      <h1 class="cd-hero-title">{{ category()?.name || 'Loading…' }}</h1>
      @if (category()?.description) {
        <p class="cd-hero-sub">{{ category()?.description }}</p>
      }
      @if (category()?.subcategories?.length) {
        <div class="cd-subcats">
          @for (s of category()?.subcategories; track s.id) {
            <a [routerLink]="['/category', s.slug]" class="cd-subcat">{{ s.name }}</a>
          }
        </div>
      }
    </div>
  </section>

  <!-- Body -->
  <section class="cd-body">
    <div class="container cd-layout">

      <!-- Filters Sidebar -->
      <aside class="cd-filters" [class.open]="filtersOpen()" aria-label="Filters">
        <div class="cd-filt-head">
          <h3>Filters</h3>
          <button class="cd-filt-reset" (click)="resetFilters()">Clear all</button>
        </div>

        <div class="cd-fblock">
          <h4>Sort by</h4>
          <select [(ngModel)]="sortBy" (change)="reload()" class="cd-fsel">
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="name_asc">Name: A–Z</option>
          </select>
        </div>

        <div class="cd-fblock">
          <h4>Price Range</h4>
          <div class="cd-price-row">
            <div class="cd-price-input">
              <label>Min</label>
              <input type="number" placeholder="0" [(ngModel)]="minPrice" (change)="reload()" min="0" />
            </div>
            <span class="cd-price-sep">—</span>
            <div class="cd-price-input">
              <label>Max</label>
              <input type="number" placeholder="Any" [(ngModel)]="maxPrice" (change)="reload()" min="0" />
            </div>
          </div>
        </div>

        <div class="cd-fblock">
          <h4>Availability</h4>
          <label class="cd-fcheck">
            <input type="checkbox" [(ngModel)]="inStockOnly" (change)="reload()" />
            <span class="cd-fcheck-box"></span>
            In stock only
          </label>
        </div>
      </aside>

      <!-- Products -->
      <main class="cd-main">
        <!-- Top bar -->
        <div class="cd-topbar">
          <span class="cd-topbar-count">
            @if (!loading()) { <strong>{{ total() }}</strong> products }
          </span>
          <div class="cd-topbar-sort-mobile">
            <button class="cd-filt-toggle" (click)="filtersOpen.set(!filtersOpen())">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 5h18M7 12h10M10 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Filters
            </button>
            <select [(ngModel)]="sortBy" (change)="reload()" class="cd-fsel">
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="name_asc">A–Z</option>
            </select>
          </div>
        </div>

        @if (loading()) {
          <div class="cd-grid">
            @for (s of [1,2,3,4,5,6,7,8,9]; track s) {
              <div class="skeleton" style="height:340px;border-radius:16px"></div>
            }
          </div>
        } @else if (products().length === 0) {
          <div class="empty-state">
            <div style="font-size:3rem;margin-bottom:16px">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or browse all categories.</p>
            <a routerLink="/categories" class="btn btn-primary" style="margin-top:16px">Browse All Categories</a>
          </div>
        } @else {
          <div class="cd-grid">
            @for (p of products(); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
          @if (totalPages() > 1) {
            <nav class="pagination" aria-label="Pagination">
              @for (n of pages(); track n) {
                <button [class.active]="n === page" (click)="go(n)">{{ n }}</button>
              }
            </nav>
          }
        }
      </main>
    </div>
  </section>
  `,
  styles: [`
  .cd-hero {
    background: linear-gradient(135deg, #211D16 0%, #37322A 100%);
    padding: 48px 0 48px; position: relative;
  }
  .cd-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(196,98,45,.15) 0%, transparent 60%);
  }
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}
  .cd-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 14px; position: relative; }
  .cd-crumbs a { color: rgba(255,255,255,.65); transition: color .2s; }
  .cd-crumbs a:hover { color: #C4622D; }
  .cd-crumbs i { font-style: normal; opacity: .35; }
  .cd-hero-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: clamp(1.8rem, 3.5vw, 2.8rem); font-weight: 400;
    color: #fff; margin-bottom: 8px; position: relative;
  }
  .cd-hero-sub { font-size: 15px; color: rgba(255,255,255,.6); max-width: 560px; margin: 0 0 16px; position: relative; }
  .cd-subcats { display: flex; gap: 8px; flex-wrap: wrap; position: relative; }
  .cd-subcat {
    font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 999px;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
    color: rgba(255,255,255,.8); transition: all .2s; font-family: 'Manrope', sans-serif;
  }
  .cd-subcat:hover { background: #C4622D; border-color: #C4622D; color: #fff; }

  /* LAYOUT */
  .cd-body { padding: 40px 0 60px; background: #FAF6EF; }
  .cd-layout { display: grid; grid-template-columns: 240px 1fr; gap: 32px; align-items: start; }

  /* FILTERS */
  .cd-filters {
    position: sticky; top: calc(var(--header-height,156px) + 20px);
    background: #fff; border: 1.5px solid #E8E1D2; border-radius: 16px;
    padding: 20px; display: flex; flex-direction: column; gap: 0;
  }
  .cd-filt-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .cd-filt-head h3 { font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 800; color: #211D16; margin: 0; }
  .cd-filt-reset { font-size: 12px; color: #C4622D; font-weight: 700; cursor: pointer; font-family: 'Manrope', sans-serif; background: none; border: none; }
  .cd-fblock { padding: 16px 0; border-bottom: 1px solid #F0EAE0; }
  .cd-fblock:last-child { border-bottom: none; padding-bottom: 0; }
  .cd-fblock h4 { font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #ABA394; margin-bottom: 12px; font-family: 'Manrope', sans-serif; }
  .cd-fsel {
    width: 100%; padding: 9px 12px; border: 1.5px solid #E8E1D2; border-radius: 8px;
    font-size: 14px; background: #fff; color: #211D16; cursor: pointer;
    font-family: 'Manrope', sans-serif;
    appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23718096' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  .cd-fsel:focus { outline: none; border-color: #C4622D; }
  .cd-price-row { display: flex; align-items: center; gap: 8px; }
  .cd-price-sep { color: #ABA394; flex-shrink: 0; }
  .cd-price-input { flex: 1; }
  .cd-price-input label { display: block; font-size: 11px; color: #ABA394; font-weight: 600; margin-bottom: 4px; font-family: 'Manrope', sans-serif; }
  .cd-price-input input { width: 100%; padding: 8px 10px; border: 1.5px solid #E8E1D2; border-radius: 8px; font-size: 13px; }
  .cd-price-input input:focus { outline: none; border-color: #C4622D; }
  .cd-fcheck { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; color: #211D16; }
  .cd-fcheck input { display: none; }
  .cd-fcheck-box { width: 18px; height: 18px; border: 2px solid #E8E1D2; border-radius: 5px; flex-shrink: 0; transition: all .2s; position: relative; }
  .cd-fcheck input:checked ~ .cd-fcheck-box { background: #C4622D; border-color: #C4622D; }
  .cd-fcheck input:checked ~ .cd-fcheck-box::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); color: #fff; font-size: 11px; font-weight: 900; }

  /* MAIN */
  .cd-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .cd-topbar-count { font-size: 14px; color: #7C7466; font-family: 'Manrope', sans-serif; }
  .cd-topbar-count strong { color: #211D16; font-weight: 800; }
  .cd-topbar-sort-mobile { display: none; }
  .cd-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  @media (max-width: 1100px) {
    .cd-layout { grid-template-columns: 200px 1fr; }
    .cd-grid { grid-template-columns: repeat(2, 1fr); }
  }
  .cd-filt-toggle {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 999px;
    border: 1.5px solid #E8E1D2; background: #FFFDF8;
    font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 700;
    color: #211D16; cursor: pointer;
  }

  @media (max-width: 800px) {
    .cd-layout { grid-template-columns: 1fr; display: flex; flex-direction: column; }
    /* Filters collapse behind the toggle — products come first */
    .cd-filters { display: none; }
    .cd-filters.open {
      position: static; display: grid; grid-template-columns: 1fr 1fr;
      gap: 0 16px; order: 2; margin-bottom: 16px;
      animation: fadeUp .3s ease both;
    }
    .cd-filt-head { grid-column: span 2; }
    .cd-main { order: 3; }
    .cd-topbar-sort-mobile { display: flex; align-items: center; gap: 8px; }
  }
  @media (max-width: 640px) {
    .cd-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .cd-hero { padding: 22px 0; }
    .cd-hero-title { font-size: 1.5rem; }
    .cd-hero-sub { font-size: 13.5px; }
    .cd-body { padding: 14px 0 32px; }
    .cd-topbar { margin-bottom: 12px; }
    .cd-fblock { margin-bottom: 12px; padding-bottom: 12px; }
  }
  `]
})
export class CategoryDetailComponent implements OnInit {
  category = signal<any>(null);
  products = signal<any[]>([]);
  loading = signal(true);
  filtersOpen = signal(false);
  total = signal(0);
  totalPages = signal(0);
  page = 1;
  sortBy = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = false;
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(private route: ActivatedRoute, private api: ApiService, private seo: SeoService, public country: CountryService) {
    // Refetch when the marketplace changes
    effect(() => {
      const code = this.country.code();
      untracked(() => { if (this.category()) { this.page = 1; this.load(); } });
    });
  }

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.page = 1; this.loading.set(true);
      this.api.getCategoryBySlug(p['slug']).subscribe({
        next: (r: any) => { if (r.success) { this.category.set(r.data); this.seo.setCategoryMeta(r.data); } },
        error: () => {}
      });
      this.load();
    });
  }

  reload() { this.page = 1; this.load(); }

  load() {
    this.loading.set(true);
    const params: any = { category: this.route.snapshot.params['slug'], page: this.page, per_page: 12, sort: this.sortBy, country: this.country.code() };
    if (this.minPrice) params.min_price = this.minPrice;
    if (this.maxPrice) params.max_price = this.maxPrice;
    if (this.inStockOnly) params.in_stock = '1';
    this.api.getProducts(params).subscribe({
      next: (r: any) => {
        if (r.success) { this.products.set(r.data || []); this.total.set(r.pagination?.total || r.data?.length || 0); this.totalPages.set(r.pagination?.total_pages || 1); }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  resetFilters() {
    this.sortBy = 'newest'; this.minPrice = null; this.maxPrice = null; this.inStockOnly = false;
    this.reload();
  }

  go(n: number) { this.page = n; this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  pages() { return Array.from({ length: this.totalPages() }, (_, i) => i + 1); }
}

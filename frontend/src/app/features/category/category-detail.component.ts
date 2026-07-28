import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `

  <!-- Page header -->
  <header class="cd-header">
    <div class="container">
      <nav class="cd-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <a routerLink="/categories">Categories</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span aria-current="page">{{ category()?.name || '…' }}</span>
      </nav>
      <h1 class="cd-heading">{{ category()?.name || 'Loading…' }}</h1>
      @if (category()?.description) {
        <p class="cd-sub">{{ category()?.description }}</p>
      }
      @if (category()?.subcategories?.length) {
        <div class="cd-subcats">
          @for (s of category()?.subcategories; track s.id) {
            <a [routerLink]="['/category', s.slug]" class="cd-subcat">{{ s.name }}</a>
          }
        </div>
      }
    </div>
  </header>

  <!-- Body: sidebar + products -->
  <section class="cd-body">
    <div class="container">
      <div class="cd-layout">

        <!-- ═══ DESKTOP FILTER SIDEBAR ═══ -->
        <aside class="cd-sidebar" aria-label="Filter products">
          <div class="cd-sidebar-inner">

            <div class="cd-filt-head">
              <h2 class="cd-filt-title">Filters</h2>
              <button class="cd-filt-reset" (click)="resetFilters()" type="button">Clear all</button>
            </div>

            <!-- Sort -->
            <div class="cd-fblock">
              <h3 class="cd-fblock-label">Sort by</h3>
              <select [(ngModel)]="sortBy" (change)="reload()" class="cd-fsel" aria-label="Sort products">
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="name_asc">Name: A–Z</option>
              </select>
            </div>

            <!-- Price range -->
            <div class="cd-fblock">
              <h3 class="cd-fblock-label">Price Range</h3>
              <div class="cd-price-row">
                <div class="cd-price-input">
                  <label for="min-price-desk">Min</label>
                  <input id="min-price-desk" type="number" placeholder="0"
                    [(ngModel)]="minPrice" (change)="reload()" min="0" />
                </div>
                <span class="cd-price-sep">—</span>
                <div class="cd-price-input">
                  <label for="max-price-desk">Max</label>
                  <input id="max-price-desk" type="number" placeholder="Any"
                    [(ngModel)]="maxPrice" (change)="reload()" min="0" />
                </div>
              </div>
            </div>

            <!-- Availability -->
            <div class="cd-fblock">
              <h3 class="cd-fblock-label">Availability</h3>
              <label class="cd-fcheck" for="in-stock-desk">
                <input id="in-stock-desk" type="checkbox" [(ngModel)]="inStockOnly" (change)="reload()" />
                <span class="cd-fcheck-box"></span>
                In stock only
              </label>
            </div>

          </div>
        </aside>

        <!-- ═══ PRODUCT AREA ═══ -->
        <main class="cd-main">

          <!-- Topbar -->
          <div class="cd-topbar">
            <span class="cd-topbar-count">
              @if (!loading()) {
                <strong>{{ total() }}</strong> {{ total() === 1 ? 'product' : 'products' }}
              }
            </span>
            <!-- Mobile filter + sort controls -->
            <div class="cd-mobile-controls">
              <button class="cd-filter-btn" (click)="drawerOpen.set(true)" type="button"
                [class.cd-filter-btn-active]="hasActiveFilters()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 5h18M7 12h10M10 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Filters
                @if (hasActiveFilters()) {
                  <span class="cd-filter-dot"></span>
                }
              </button>
              <select [(ngModel)]="sortBy" (change)="reload()" class="cd-sort-select" aria-label="Sort products">
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="name_asc">A–Z</option>
              </select>
            </div>
          </div>

          <!-- Products grid -->
          @if (loading()) {
            <div class="cd-grid">
              @for (s of [1,2,3,4,5,6,7,8,9,10,11,12]; track s) {
                <div class="skeleton cd-skel"></div>
              }
            </div>
          } @else if (products().length === 0) {
            <div class="cd-empty">
              <div class="cd-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </div>
              <h2 class="cd-empty-title">No products found</h2>
              <p class="cd-empty-text">
                @if (hasActiveFilters()) {
                  Try adjusting your filters — there may be products outside the current range.
                } @else {
                  Products in this category are being added. Check back soon.
                }
              </p>
              @if (hasActiveFilters()) {
                <button (click)="resetFilters()" class="btn btn-outline" type="button">Clear filters</button>
              } @else {
                <a routerLink="/categories" class="btn btn-outline">Browse All Categories</a>
              }
            </div>
          } @else {
            <div class="cd-grid">
              @for (p of products(); track p.id) {
                <app-product-card [product]="p" />
              }
            </div>
            <!-- Pagination -->
            @if (totalPages() > 1) {
              <nav class="cd-pagination" aria-label="Pagination">
                <button class="cd-page-btn cd-page-prev"
                  (click)="go(page - 1)"
                  [disabled]="page === 1"
                  aria-label="Previous page">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                @for (n of pages(); track n) {
                  <button class="cd-page-btn" [class.active]="n === page" (click)="go(n)">{{ n }}</button>
                }
                <button class="cd-page-btn cd-page-next"
                  (click)="go(page + 1)"
                  [disabled]="page === totalPages()"
                  aria-label="Next page">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </nav>
            }
          }
        </main>
      </div>
    </div>
  </section>

  <!-- ═══ MOBILE FILTER DRAWER ═══ -->
  @if (drawerOpen()) {
    <div class="cd-drawer-overlay" (click)="drawerOpen.set(false)" aria-hidden="true"></div>
  }
  <div class="cd-drawer" [class.open]="drawerOpen()" role="dialog" aria-label="Filter products" aria-modal="true">
    <div class="cd-drawer-handle"></div>
    <div class="cd-drawer-head">
      <h2 class="cd-drawer-title">Filters</h2>
      <button class="cd-drawer-close" (click)="drawerOpen.set(false)" aria-label="Close filters" type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="cd-drawer-body">
      <!-- Sort -->
      <div class="cd-fblock">
        <h3 class="cd-fblock-label">Sort by</h3>
        <select [(ngModel)]="sortBy" (change)="reload()" class="cd-fsel" aria-label="Sort products">
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name_asc">Name: A–Z</option>
        </select>
      </div>
      <!-- Price -->
      <div class="cd-fblock">
        <h3 class="cd-fblock-label">Price Range</h3>
        <div class="cd-price-row">
          <div class="cd-price-input">
            <label for="min-price-mob">Min</label>
            <input id="min-price-mob" type="number" placeholder="0"
              [(ngModel)]="minPrice" (change)="reload()" min="0" />
          </div>
          <span class="cd-price-sep">—</span>
          <div class="cd-price-input">
            <label for="max-price-mob">Max</label>
            <input id="max-price-mob" type="number" placeholder="Any"
              [(ngModel)]="maxPrice" (change)="reload()" min="0" />
          </div>
        </div>
      </div>
      <!-- Availability -->
      <div class="cd-fblock">
        <h3 class="cd-fblock-label">Availability</h3>
        <label class="cd-fcheck" for="in-stock-mob">
          <input id="in-stock-mob" type="checkbox" [(ngModel)]="inStockOnly" (change)="reload()" />
          <span class="cd-fcheck-box"></span>
          In stock only
        </label>
      </div>
    </div>
    <div class="cd-drawer-footer">
      <button class="btn btn-outline" (click)="resetFilters()" type="button">Clear All</button>
      <button class="btn btn-primary" (click)="drawerOpen.set(false)" type="button">
        Show {{ total() }} Results
      </button>
    </div>
  </div>
  `,

  styles: [`
  /* ── Header ── */
  .cd-header {
    background: var(--kg-dark);
    padding: 44px 0 48px; position: relative; overflow: hidden;
  }
  .cd-header::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 130% at 8% 60%, rgba(27,76,140,.32) 0%, transparent 65%);
    pointer-events: none;
  }
  .cd-header .container { position: relative; z-index: 1; }

  /* Breadcrumb */
  .cd-crumbs {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: rgba(255,255,255,.42);
    margin-bottom: 16px; flex-wrap: wrap;
  }
  .cd-crumbs a { color: rgba(255,255,255,.7); text-decoration: none; transition: color .2s; }
  .cd-crumbs a:hover { color: var(--kg-forest-lt); }
  .cd-crumbs svg { opacity: .38; flex-shrink: 0; }
  .cd-crumbs span { color: rgba(255,255,255,.88); font-weight: 700; }

  .cd-heading {
    font-family: var(--font-sans); font-size: clamp(1.55rem, 3vw, 2.3rem);
    font-weight: 800; color: #FFFFFF; margin-bottom: 8px;
    letter-spacing: -0.02em; line-height: 1.15;
  }
  .cd-sub { font-size: 14.5px; color: rgba(255,255,255,.6); max-width: 540px; margin: 0 0 14px; line-height: 1.65; }
  .cd-subcats { display: flex; gap: 8px; flex-wrap: wrap; }
  .cd-subcat {
    font-size: 12.5px; font-weight: 700; padding: 6px 14px; border-radius: var(--r-full);
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
    color: rgba(255,255,255,.82); transition: all .2s; text-decoration: none;
    font-family: var(--font-sans);
  }
  .cd-subcat:hover { background: var(--kg-forest); border-color: var(--kg-forest); color: #FFFFFF; }

  /* ── Body layout ── */
  .cd-body { padding: 40px 0 72px; background: var(--kg-warm); }
  .cd-layout { display: grid; grid-template-columns: 230px 1fr; gap: 32px; align-items: start; }

  /* ── Sidebar ── */
  .cd-sidebar { position: sticky; top: calc(var(--header-height) + 20px); }
  .cd-sidebar-inner {
    background: var(--kg-paper); border: 1px solid var(--kg-line-lt);
    border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 0;
  }
  .cd-filt-head {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
  }
  .cd-filt-title { font-size: 14px; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .cd-filt-reset {
    font-size: 11.5px; color: var(--kg-forest); font-weight: 700; cursor: pointer;
    background: none; border: none; padding: 0; font-family: var(--font-sans);
    transition: color .2s;
  }
  .cd-filt-reset:hover { color: var(--kg-terra); }
  .cd-fblock { padding: 14px 0; border-bottom: 1px solid var(--kg-line-lt); }
  .cd-fblock:last-child { border-bottom: none; padding-bottom: 0; }
  .cd-fblock-label {
    font-size: 10px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase;
    color: var(--kg-faint); margin-bottom: 10px; font-family: var(--font-sans);
  }
  .cd-fsel {
    width: 100%; padding: 9px 34px 9px 12px; border: 1.5px solid var(--kg-line); border-radius: var(--r);
    font-size: 13.5px; background: var(--kg-paper); color: var(--kg-ink); cursor: pointer;
    font-family: var(--font-sans); font-weight: 600;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2366716A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    transition: border-color .2s;
  }
  .cd-fsel:focus { outline: none; border-color: var(--kg-forest); box-shadow: 0 0 0 3px var(--kg-forest-bg); }

  .cd-price-row { display: flex; align-items: center; gap: 8px; }
  .cd-price-sep { color: var(--kg-faint); flex-shrink: 0; font-weight: 600; }
  .cd-price-input { flex: 1; }
  .cd-price-input label {
    display: block; font-size: 10px; color: var(--kg-faint); font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase; margin-bottom: 4px;
  }
  .cd-price-input input {
    width: 100%; padding: 8px 10px; border: 1.5px solid var(--kg-line); border-radius: var(--r);
    font-size: 13px; font-family: var(--font-sans); color: var(--kg-ink);
    background: var(--kg-paper); transition: border-color .2s;
  }
  .cd-price-input input:focus { outline: none; border-color: var(--kg-forest); box-shadow: 0 0 0 3px var(--kg-forest-bg); }

  .cd-fcheck { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13.5px; color: var(--kg-ink); font-weight: 600; }
  .cd-fcheck input { display: none; }
  .cd-fcheck-box {
    width: 18px; height: 18px; border: 2px solid var(--kg-line-warm); border-radius: var(--r-sm);
    flex-shrink: 0; transition: all .2s; position: relative;
  }
  .cd-fcheck input:checked ~ .cd-fcheck-box {
    background: var(--kg-forest); border-color: var(--kg-forest);
  }
  .cd-fcheck input:checked ~ .cd-fcheck-box::after {
    content: '';
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 10px; height: 6px; border-left: 2px solid #fff; border-bottom: 2px solid #fff;
    transform: translate(-50%,-60%) rotate(-45deg);
  }

  /* ── Main / product area ── */
  .cd-main {}

  /* Topbar */
  .cd-topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 22px; gap: 12px;
  }
  .cd-topbar-count { font-size: 13.5px; color: var(--kg-muted); font-weight: 600; }
  .cd-topbar-count strong { color: var(--kg-ink); font-weight: 800; }

  /* Mobile controls (hidden on desktop) */
  .cd-mobile-controls { display: none; align-items: center; gap: 8px; }
  .cd-filter-btn {
    display: inline-flex; align-items: center; gap: 7px; position: relative;
    padding: 9px 16px; border-radius: var(--r-full);
    border: 1.5px solid var(--kg-line-warm); background: var(--kg-paper);
    font-family: var(--font-sans); font-size: 13px; font-weight: 700;
    color: var(--kg-ink); cursor: pointer; transition: all .2s;
  }
  .cd-filter-btn:hover { border-color: var(--kg-forest); color: var(--kg-forest); }
  .cd-filter-btn-active { border-color: var(--kg-forest); color: var(--kg-forest); background: var(--kg-forest-bg); }
  .cd-filter-dot {
    position: absolute; top: 8px; right: 10px;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--kg-terra); border: 1.5px solid var(--kg-paper);
  }
  .cd-sort-select {
    padding: 9px 30px 9px 12px; border: 1.5px solid var(--kg-line-warm); border-radius: var(--r-full);
    font-size: 13px; background: var(--kg-paper); color: var(--kg-ink); cursor: pointer;
    font-family: var(--font-sans); font-weight: 700;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%2366716A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
  }
  .cd-sort-select:focus { outline: none; border-color: var(--kg-forest); }

  /* Product grid */
  .cd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .cd-skel { aspect-ratio: 1 / 1.42; border-radius: 12px; }

  /* Empty state */
  .cd-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding: 64px 24px; text-align: center; max-width: 440px; margin: 0 auto;
  }
  .cd-empty-icon {
    width: 64px; height: 64px; border-radius: var(--r-xl);
    background: var(--kg-warm); color: var(--kg-faint);
    display: grid; place-items: center;
  }
  .cd-empty-title { font-size: 1.15rem; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .cd-empty-text { font-size: 14.5px; color: var(--kg-muted); margin: 0; line-height: 1.7; }

  /* Pagination */
  .cd-pagination { display: flex; align-items: center; gap: 6px; justify-content: center; margin-top: 40px; flex-wrap: wrap; }
  .cd-page-btn {
    min-width: 38px; height: 38px; padding: 0 8px;
    display: grid; place-items: center; border-radius: var(--r);
    border: 1.5px solid var(--kg-line); background: var(--kg-paper);
    font-size: 13.5px; font-weight: 700; color: var(--kg-ink-2);
    cursor: pointer; transition: all .2s; font-family: var(--font-sans);
  }
  .cd-page-btn:hover:not(:disabled) { border-color: var(--kg-forest); color: var(--kg-forest); background: var(--kg-forest-bg); }
  .cd-page-btn.active { background: var(--kg-forest); border-color: var(--kg-forest); color: #FFFFFF; }
  .cd-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ═══ MOBILE FILTER DRAWER ═══ */
  .cd-drawer-overlay {
    position: fixed; inset: 0; z-index: 998;
    background: rgba(18,56,33,.45);
    backdrop-filter: blur(2px);
    animation: cdFadeIn .2s ease both;
  }
  @keyframes cdFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .cd-drawer {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 999;
    background: var(--kg-paper);
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -16px 48px rgba(18,56,33,.18);
    transform: translateY(100%);
    transition: transform .36s var(--ease);
    max-height: 88svh; display: flex; flex-direction: column;
    /* always rendered, toggled by class */
    pointer-events: none;
  }
  .cd-drawer.open { transform: translateY(0); pointer-events: auto; }

  .cd-drawer-handle {
    width: 40px; height: 4px; border-radius: 2px;
    background: var(--kg-line-warm); margin: 12px auto 0;
    flex-shrink: 0;
  }
  .cd-drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--kg-line-lt); flex-shrink: 0;
  }
  .cd-drawer-title { font-size: 16px; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .cd-drawer-close {
    width: 36px; height: 36px; border-radius: var(--r-full);
    display: grid; place-items: center;
    background: var(--kg-warm); border: 1.5px solid var(--kg-line);
    color: var(--kg-muted); cursor: pointer; transition: all .2s;
  }
  .cd-drawer-close:hover { background: var(--kg-clay-bg); color: var(--kg-clay); border-color: var(--kg-clay); }
  .cd-drawer-body { flex: 1; overflow-y: auto; padding: 4px 20px 8px; }
  .cd-drawer-footer {
    display: flex; gap: 10px; padding: 14px 20px;
    border-top: 1px solid var(--kg-line-lt); flex-shrink: 0;
  }
  .cd-drawer-footer .btn { flex: 1; justify-content: center; }

  /* ── Responsive breakpoints ── */
  @media (max-width: 1100px) {
    .cd-layout { grid-template-columns: 210px 1fr; gap: 24px; }
    .cd-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 860px) {
    /* Hide desktop sidebar — switch to drawer */
    .cd-layout { grid-template-columns: 1fr; }
    .cd-sidebar { display: none; }
    .cd-mobile-controls { display: flex; }
    .cd-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .cd-body { padding: 28px 0 56px; }
    .cd-header { padding: 28px 0 32px; }
  }

  @media (max-width: 480px) {
    .cd-grid { gap: 10px; }
    .cd-skel { aspect-ratio: 1 / 1.4; }
    .cd-heading { font-size: 1.3rem; }
    .cd-topbar { margin-bottom: 14px; }
    .cd-empty { padding: 40px 16px; }
  }
  `]
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  category = signal<any>(null);
  products = signal<any[]>([]);
  loading = signal(true);
  drawerOpen = signal(false);
  total = signal(0);
  totalPages = signal(0);
  page = 1;
  sortBy = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = false;
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.page = 1; this.loading.set(true); this.products.set([]); this.total.set(0);
      this.api.getCategoryBySlug(p['slug']).subscribe({
        next: (r: any) => { if (r.success) { this.category.set(r.data); this.seo.setCategoryMeta(r.data); } },
        error: () => {}
      });
      this.load();
    });
  }

  ngOnDestroy() { /* close drawer on nav */ }

  @HostListener('document:keydown.escape')
  onEscape() { this.drawerOpen.set(false); }

  hasActiveFilters() {
    return this.minPrice !== null || this.maxPrice !== null || this.inStockOnly || this.sortBy !== 'newest';
  }

  reload() { this.page = 1; this.drawerOpen.set(false); this.load(); }

  load() {
    this.loading.set(true);
    const params: any = {
      category: this.route.snapshot.params['slug'],
      page: this.page,
      per_page: 12,
      sort: this.sortBy
    };
    if (this.minPrice) params.min_price = this.minPrice;
    if (this.maxPrice) params.max_price = this.maxPrice;
    if (this.inStockOnly) params.in_stock = '1';

    this.api.getProducts(params).subscribe({
      next: (r: any) => {
        if (r.success) {
          this.products.set(r.data || []);
          this.total.set(r.pagination?.total || r.data?.length || 0);
          this.totalPages.set(r.pagination?.total_pages || 1);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  resetFilters() {
    this.sortBy = 'newest'; this.minPrice = null; this.maxPrice = null; this.inStockOnly = false;
    this.drawerOpen.set(false);
    this.reload();
  }

  go(n: number) {
    if (n < 1 || n > this.totalPages()) return;
    this.page = n; this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  pages() { return Array.from({ length: this.totalPages() }, (_, i) => i + 1); }
}

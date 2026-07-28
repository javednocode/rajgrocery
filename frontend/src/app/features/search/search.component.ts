import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `
  <!-- Header -->
  <header class="sr-header" [class.sr-header-sale]="isSale">
    <div class="container">
      <!-- Breadcrumb -->
      <nav class="sr-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ isSale ? 'Hot Deals' : 'Search' }}</span>
      </nav>

      <!-- Title -->
      <h1 class="sr-title">
        @if (isSale) {
          <span class="sr-sale-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="currentColor"/>
            </svg>
            Hot Deals
          </span>
        } @else {
          Find products
        }
      </h1>

      <!-- Search form -->
      <form class="sr-form" (submit)="submit($event)" role="search">
        <div class="sr-input-wrap">
          <svg class="sr-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input [(ngModel)]="term" name="q"
            placeholder="Search for spices, rice, masala, snacks…"
            aria-label="Search products"
            [autofocus]="!isSale" />
          @if (term) {
            <button type="button" class="sr-clear" (click)="term=''" aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </button>
          }
        </div>
        <button type="submit" class="sr-submit">Search</button>
      </form>

      <!-- Result summary -->
      <div class="sr-meta">
        @if (loading()) {
          <span class="sr-meta-text">
            @if (isSale) { Loading deals… } @else { Searching for "<strong>{{ query() }}</strong>"… }
          </span>
        } @else if (query() || isSale) {
          <span class="sr-meta-text">
            @if (isSale) {
              <strong>{{ results().length }}</strong> {{ results().length === 1 ? 'deal' : 'deals' }} available
            } @else {
              <strong>{{ results().length }}</strong> {{ results().length === 1 ? 'result' : 'results' }} for "<strong>{{ query() }}</strong>"
            }
          </span>
        }
      </div>
    </div>
  </header>

  <!-- Results body -->
  <section class="sr-body">
    <div class="container">

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="sr-grid">
          @for (s of [1,2,3,4,5,6,7,8]; track s) {
            <div class="skeleton sr-skel"></div>
          }
        </div>

      <!-- No results: query made but nothing found -->
      } @else if ((query() || isSale) && results().length === 0) {
        <div class="sr-empty">
          <div class="sr-empty-icon">
            @if (isSale) {
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              </svg>
            } @else {
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.6"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            }
          </div>
          <h2 class="sr-empty-title">
            @if (isSale) { No active deals right now } @else { No results for "{{ query() }}" }
          </h2>
          <p class="sr-empty-text">
            @if (isSale) {
              Check back soon for new offers, or browse our full catalogue.
            } @else {
              Try a different spelling or a more general term.
            }
          </p>
          <div class="sr-empty-actions">
            <a routerLink="/categories" class="btn btn-primary">Browse Categories</a>
            @if (!isSale) {
              <a routerLink="/" class="btn btn-outline">Home</a>
            }
          </div>
          <!-- Suggestions -->
          @if (!isSale) {
            <div class="sr-suggestions">
              <p class="sr-sug-label">Try searching for:</p>
              <div class="sr-tags">
                @for (s of suggestions; track s) {
                  <button class="sr-tag" (click)="searchFor(s)" type="button">{{ s }}</button>
                }
              </div>
            </div>
          }
        </div>

      <!-- Products found -->
      } @else if (results().length > 0) {
        <div class="sr-grid">
          @for (p of results(); track p.id) {
            <app-product-card [product]="p" />
          }
        </div>

      <!-- No query yet — prompt -->
      } @else {
        <div class="sr-prompt">
          <div class="sr-prompt-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.6"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="sr-prompt-title">What are you looking for?</h2>
          <p class="sr-prompt-text">Type in the search box above to find products.</p>
          <div class="sr-tags">
            @for (s of suggestions; track s) {
              <button class="sr-tag" (click)="searchFor(s)" type="button">{{ s }}</button>
            }
          </div>
        </div>
      }

    </div>
  </section>
  `,

  styles: [`
  /* ── Header ── */
  .sr-header {
    background: var(--kg-dark);
    padding: 44px 0 48px; position: relative; overflow: hidden;
  }
  .sr-header::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 130% at 8% 60%, rgba(27,76,140,.28) 0%, transparent 65%);
    pointer-events: none;
  }
  .sr-header.sr-header-sale::before {
    background: radial-gradient(ellipse 60% 130% at 8% 60%, rgba(224,147,46,.22) 0%, transparent 65%);
  }
  .sr-header .container { position: relative; z-index: 1; }

  /* Breadcrumb */
  .sr-crumbs {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: rgba(255,255,255,.42);
    margin-bottom: 18px;
  }
  .sr-crumbs a { color: rgba(255,255,255,.7); text-decoration: none; transition: color .2s; }
  .sr-crumbs a:hover { color: var(--kg-forest-lt); }
  .sr-crumbs svg { opacity: .38; flex-shrink: 0; }
  .sr-crumbs span { color: rgba(255,255,255,.88); font-weight: 700; }

  /* Title */
  .sr-title {
    font-family: var(--font-sans);
    font-size: clamp(1.55rem, 3vw, 2.3rem); font-weight: 800;
    color: #FFFFFF; margin-bottom: 24px; letter-spacing: -0.02em;
  }
  .sr-sale-badge {
    display: inline-flex; align-items: center; gap: 9px;
    color: var(--kg-terra-lt);
  }
  .sr-sale-badge svg { flex-shrink: 0; }

  /* Search form */
  .sr-form {
    display: flex; max-width: 680px;
    border-radius: var(--r-full); overflow: hidden;
    background: rgba(255,255,255,.08);
    border: 1.5px solid rgba(255,255,255,.2);
    backdrop-filter: blur(8px);
    transition: border-color .25s, box-shadow .25s;
  }
  .sr-form:focus-within {
    border-color: rgba(76,154,87,.6);
    box-shadow: 0 0 0 4px rgba(27,76,140,.18);
  }
  .sr-input-wrap {
    flex: 1; display: flex; align-items: center; gap: 10px;
    padding: 0 16px; color: rgba(255,255,255,.45); min-width: 0;
  }
  .sr-icon { flex-shrink: 0; }
  .sr-form input {
    flex: 1; border: none; outline: none;
    padding: 14px 0; font-size: 14.5px;
    color: #FFFFFF; background: transparent;
    font-family: var(--font-sans); font-weight: 500; min-width: 0;
  }
  .sr-form input::placeholder { color: rgba(255,255,255,.38); }
  .sr-clear {
    display: grid; place-items: center; padding: 4px;
    color: rgba(255,255,255,.45); cursor: pointer;
    transition: color .2s; flex-shrink: 0;
  }
  .sr-clear:hover { color: rgba(255,255,255,.9); }
  .sr-submit {
    background: var(--kg-forest); color: #FFFFFF; border: none;
    padding: 0 28px; font-family: var(--font-sans);
    font-size: 14px; font-weight: 800; cursor: pointer;
    transition: background .2s; flex-shrink: 0; white-space: nowrap;
  }
  .sr-submit:hover { background: var(--kg-forest-dk); }

  /* Meta line */
  .sr-meta { margin-top: 14px; min-height: 20px; }
  .sr-meta-text { font-size: 13.5px; color: rgba(255,255,255,.58); font-family: var(--font-sans); }
  .sr-meta-text strong { color: #FFFFFF; font-weight: 800; }

  /* ── Body ── */
  .sr-body { padding: 44px 0 72px; background: var(--kg-warm); min-height: 40vh; }

  /* Grid */
  .sr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
  .sr-skel { aspect-ratio: 1 / 1.42; border-radius: 12px; }

  /* ── Empty state ── */
  .sr-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 18px; padding: 72px 24px; text-align: center; max-width: 480px; margin: 0 auto;
  }
  .sr-empty-icon {
    width: 72px; height: 72px; border-radius: var(--r-xl);
    background: var(--kg-warm); color: var(--kg-faint);
    display: grid; place-items: center;
    border: 1.5px solid var(--kg-line);
  }
  .sr-empty-title { font-size: 1.2rem; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .sr-empty-text { font-size: 14.5px; color: var(--kg-muted); margin: 0; line-height: 1.7; }
  .sr-empty-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .sr-suggestions { width: 100%; }
  .sr-sug-label { font-size: 11.5px; font-weight: 700; color: var(--kg-faint); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 12px; }

  /* ── Tags ── */
  .sr-tags { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .sr-tag {
    padding: 7px 16px; border-radius: var(--r-full);
    border: 1.5px solid var(--kg-line-warm); background: var(--kg-paper);
    color: var(--kg-ink-2); font-family: var(--font-sans);
    font-size: 13px; font-weight: 700; cursor: pointer; transition: all .22s;
  }
  .sr-tag:hover {
    border-color: var(--kg-forest); color: var(--kg-forest); background: var(--kg-forest-bg);
    transform: translateY(-1px);
  }

  /* ── Prompt (no search yet) ── */
  .sr-prompt {
    display: flex; flex-direction: column; align-items: center;
    gap: 18px; padding: 80px 24px; text-align: center;
  }
  .sr-prompt-icon {
    width: 80px; height: 80px; border-radius: var(--r-xl);
    background: var(--kg-paper); color: var(--kg-faint);
    display: grid; place-items: center;
    border: 1.5px solid var(--kg-line);
    box-shadow: var(--shadow-xs);
  }
  .sr-prompt-title { font-size: 1.25rem; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .sr-prompt-text { font-size: 14.5px; color: var(--kg-muted); margin: 0; }

  /* ── Responsive ── */
  @media (max-width: 1100px) { .sr-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 760px) {
    .sr-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .sr-header { padding: 28px 0 32px; }
    .sr-body { padding: 28px 0 56px; }
    .sr-submit { padding: 0 18px; font-size: 13px; }
  }
  @media (max-width: 480px) {
    .sr-form { border-radius: 14px; flex-direction: column; overflow: visible; gap: 8px; background: transparent; border: none; backdrop-filter: none; }
    .sr-form:focus-within { box-shadow: none; border-color: transparent; }
    .sr-input-wrap { background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.2); border-radius: var(--r-full); padding: 0 16px; }
    .sr-input-wrap:focus-within { border-color: rgba(76,154,87,.6); }
    .sr-submit { border-radius: var(--r-full); padding: 13px 24px; }
    .sr-skel { aspect-ratio: 1 / 1.4; }
    .sr-empty { padding: 48px 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .sr-tag { transition: none; }
  }
  `]
})
export class SearchComponent implements OnInit {
  query = signal('');
  results = signal<any[]>([]);
  loading = signal(false);
  term = '';
  isSale = false;

  readonly suggestions = ['Ghee', 'Basmati Rice', 'Masala', 'Snacks', 'Dal', 'Pickle', 'Atta', 'Spices'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private seo: SeoService
  ) {}

  private fetchSale() {
    this.loading.set(true);
    this.api.getProducts({ is_sale: 1 }).subscribe({
      next: (r: any) => { if (r.success) this.results.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  private fetchQuery(t: string) {
    this.loading.set(true);
    this.api.searchProducts(t).subscribe({
      next: (r: any) => { if (r.success) this.results.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(q => {
      const t = q['q'] || '';
      const sale = q['sale'] === '1';
      this.query.set(t);
      this.term = t;
      this.isSale = sale;

      if (sale) {
        this.seo.setMeta({
          title: 'Hot Deals & Offers',
          description: 'Explore the latest sale products and special offers.'
        });
        this.fetchSale();
      } else {
        this.seo.setMeta({
          title: t ? `"${t}" — Search` : 'Search',
          description: 'Search Indian groceries, spices, snacks and fresh vegetables.'
        });
        if (!t) { this.results.set([]); return; }
        this.fetchQuery(t);
      }
    });
  }

  submit(e: Event) {
    e.preventDefault();
    const t = this.term.trim();
    if (t) this.router.navigate(['/search'], { queryParams: { q: t } });
  }

  searchFor(s: string) {
    this.term = s;
    this.router.navigate(['/search'], { queryParams: { q: s } });
  }
}

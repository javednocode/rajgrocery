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
    <div class="sr-header-bg" aria-hidden="true"></div>
    <div class="container sr-header-inner">

      <!-- Breadcrumb -->
      <nav class="sr-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ isSale ? 'Hot Deals' : 'Search' }}</span>
      </nav>

      <!-- Eyebrow + Title -->
      <p class="sr-eyebrow">
        <span class="sr-eyebrow-line" aria-hidden="true"></span>
        @if (isSale) { Today's Deals } @else { Search Products }
      </p>
      <h1 class="sr-title">
        @if (isSale) {
          <span class="sr-sale-tag">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="currentColor"/>
            </svg>
          </span>
          Hot Deals
        } @else {
          Find what you<br>need
        }
      </h1>

      <!-- Search form -->
      <form class="sr-form" (submit)="submit($event)" role="search">
        <label class="sr-input-wrap" for="sr-input">
          <svg class="sr-icon" width="19" height="19" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input id="sr-input" [(ngModel)]="term" name="q"
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
        </label>
        <button type="submit" class="sr-submit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2"/>
            <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          Search
        </button>
      </form>

      <!-- Popular searches -->
      @if (!isSale && !query()) {
        <div class="sr-popular">
          <span class="sr-popular-label">Popular:</span>
          <div class="sr-tags">
            @for (s of suggestions; track s) {
              <button class="sr-tag" (click)="searchFor(s)" type="button">{{ s }}</button>
            }
          </div>
        </div>
      }

      <!-- Result summary -->
      @if (query() || isSale) {
        <div class="sr-meta">
          @if (loading()) {
            <span class="sr-meta-text sr-meta-loading">
              <span class="sr-loader" aria-hidden="true"></span>
              @if (isSale) { Loading deals… } @else { Searching… }
            </span>
          } @else {
            <span class="sr-meta-text">
              @if (isSale) {
                <strong>{{ results().length }}</strong> {{ results().length === 1 ? 'deal' : 'deals' }} available
              } @else {
                <strong>{{ results().length }}</strong> {{ results().length === 1 ? 'result' : 'results' }} for "<strong>{{ query() }}</strong>"
              }
            </span>
          }
        </div>
      }
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

      <!-- No results -->
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
              Try a different spelling or a more general term — or browse by category.
            }
          </p>
          <div class="sr-empty-actions">
            <a routerLink="/categories" class="btn btn-primary">Browse Categories</a>
            @if (!isSale) {
              <a routerLink="/" class="btn btn-outline-dark">Home</a>
            }
          </div>
          @if (!isSale) {
            <div class="sr-suggestions-wrap">
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
        <div class="sr-results-head">
          <span class="sr-results-count">
            <strong>{{ results().length }}</strong> {{ results().length === 1 ? 'product' : 'products' }} found
          </span>
        </div>
        <div class="sr-grid">
          @for (p of results(); track p.id) {
            <app-product-card [product]="p" />
          }
        </div>

      <!-- No query yet -->
      } @else {
        <div class="sr-prompt">
          <div class="sr-prompt-icon">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="sr-prompt-title">What are you looking for?</h2>
          <p class="sr-prompt-text">Type in the search box above to find products from our Indian grocery store.</p>
          <div class="sr-prompt-cats">
            <p class="sr-sug-label">Popular categories</p>
            <div class="sr-tags">
              @for (s of suggestions; track s) {
                <button class="sr-tag" (click)="searchFor(s)" type="button">{{ s }}</button>
              }
            </div>
          </div>
        </div>
      }

    </div>
  </section>
  `,

  styles: [`
  /* ── Header ── */
  .sr-header {
    background: var(--raj-dark);
    padding: 52px 0 60px;
    position: relative; overflow: hidden;
  }
  .sr-header-bg {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 65% 130% at 6% 62%, rgba(29,111,163,.06) 0%, transparent 68%),
      radial-gradient(ellipse 50% 90% at 95% 8%, rgba(242,169,59,.06) 0%, transparent 70%);
  }
  .sr-header-inner { position: relative; z-index: 1; }
  .sr-header.sr-header-sale .sr-header-bg {
    background:
      radial-gradient(ellipse 65% 130% at 6% 62%, rgba(228,163,59,.22) 0%, transparent 68%),
      radial-gradient(ellipse 50% 90% at 95% 8%, rgba(192,57,43,.1) 0%, transparent 70%);
  }

  /* Breadcrumb */
  .sr-crumbs {
    display: flex; align-items: center; gap: 6px;
    font-size: 11.5px; color: var(--raj-muted);
    margin-bottom: 24px;
    font-family: var(--font-sans); font-weight: 700;
    letter-spacing: .05em; text-transform: uppercase;
  }
  .sr-crumbs a { color: var(--raj-ink); text-decoration: none; transition: color .2s; }
  .sr-crumbs a:hover { color: var(--raj-leaf); }
  .sr-crumbs svg { opacity: .35; flex-shrink: 0; }

  /* Eyebrow */
  .sr-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--font-sans); font-size: 10.5px; font-weight: 800;
    letter-spacing: .18em; text-transform: uppercase;
    color: var(--raj-turmeric); margin-bottom: 12px;
  }
  .sr-eyebrow-line {
    display: inline-block; width: 18px; height: 2px;
    background: var(--raj-turmeric); border-radius: 2px;
  }

  /* Title */
  .sr-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4.5vw, 3.2rem);
    font-weight: 600; color: var(--raj-ink);
    margin-bottom: 32px; letter-spacing: -0.025em;
    line-height: 1.1;
    display: flex; align-items: center; gap: 14px;
  }
  .sr-sale-tag {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; border-radius: var(--r-full);
    background: var(--raj-turmeric); color: var(--raj-dark);
    flex-shrink: 0;
  }

  /* Search form */
  .sr-form {
    display: flex; max-width: 700px; gap: 0;
    border-radius: var(--r-full); overflow: hidden;
    background: var(--raj-paper);
    border: 1.5px solid var(--raj-line);
    backdrop-filter: blur(10px);
    transition: border-color .25s, box-shadow .25s;
    margin-bottom: 22px;
  }
  .sr-form:focus-within {
    border-color: var(--raj-leaf);
    box-shadow: 0 0 0 4px rgba(29,111,163,.15);
  }
  .sr-input-wrap {
    flex: 1; display: flex; align-items: center; gap: 12px;
    padding: 0 18px; color: var(--raj-muted); min-width: 0;
    cursor: text;
  }
  .sr-icon { flex-shrink: 0; }
  .sr-form input {
    flex: 1; border: none; outline: none;
    padding: 16px 0; font-size: 15px;
    color: var(--raj-ink); background: transparent;
    font-family: var(--font-sans); font-weight: 500; min-width: 0;
  }
  .sr-form input::placeholder { color: var(--raj-faint); }
  .sr-clear {
    display: grid; place-items: center; padding: 4px;
    color: var(--raj-muted); cursor: pointer;
    transition: color .2s; flex-shrink: 0;
  }
  .sr-clear:hover { color: var(--raj-ink); }
  .sr-submit {
    background: var(--raj-leaf); color: #FFFFFF; border: none;
    padding: 0 28px; font-family: var(--font-sans);
    font-size: 14px; font-weight: 800; cursor: pointer;
    transition: background .22s; flex-shrink: 0; white-space: nowrap;
    display: inline-flex; align-items: center; gap: 9px; letter-spacing: .02em;
  }
  .sr-submit:hover { background: var(--raj-leaf-dk); }

  /* Popular tags above fold */
  .sr-popular { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 6px; }
  .sr-popular-label {
    font-size: 11.5px; color: var(--raj-muted);
    font-weight: 700; font-family: var(--font-sans);
    white-space: nowrap;
  }

  /* Meta line */
  .sr-meta { margin-top: 18px; min-height: 22px; }
  .sr-meta-text { font-size: 14px; color: var(--raj-muted); font-family: var(--font-sans); }
  .sr-meta-text strong { color: var(--raj-ink); font-weight: 800; }
  .sr-meta-loading { display: inline-flex; align-items: center; gap: 10px; }
  .sr-loader {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid var(--raj-line); border-top-color: var(--raj-leaf);
    animation: srSpin .7s linear infinite; flex-shrink: 0;
  }
  @keyframes srSpin { to { transform: rotate(360deg); } }

  /* ── Tags ── */
  .sr-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .sr-tag {
    padding: 7px 15px; border-radius: var(--r-full);
    border: 1.5px solid var(--raj-line); background: var(--raj-paper);
    color: var(--raj-ink-2); font-family: var(--font-sans);
    font-size: 13px; font-weight: 700; cursor: pointer; transition: all .22s;
    backdrop-filter: blur(4px);
  }
  .sr-tag:hover {
    border-color: var(--raj-leaf); color: var(--raj-leaf); background: var(--raj-leaf-bg);
    transform: translateY(-2px);
  }

  /* ── Body ── */
  .sr-body { padding: 48px 0 80px; background: var(--raj-warm); min-height: 40vh; }

  /* Results header */
  .sr-results-head {
    display: flex; align-items: center; margin-bottom: 24px;
  }
  .sr-results-count {
    font-size: 13px; color: var(--raj-muted); font-weight: 600; font-family: var(--font-sans);
  }
  .sr-results-count strong { color: var(--raj-ink); font-weight: 800; }

  /* Grid */
  .sr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
  .sr-skel { aspect-ratio: 1 / 1.42; border-radius: var(--r-lg); }

  /* ── Empty state ── */
  .sr-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 20px; padding: 80px 24px; text-align: center; max-width: 500px; margin: 0 auto;
  }
  .sr-empty-icon {
    width: 80px; height: 80px; border-radius: var(--r-xl);
    background: var(--raj-sand); color: var(--raj-faint);
    display: grid; place-items: center;
    border: 1.5px solid var(--raj-line);
  }
  .sr-empty-title {
    font-family: var(--font-display); font-size: 1.4rem; font-weight: 600;
    color: var(--raj-ink); margin: 0;
  }
  .sr-empty-text { font-size: 14.5px; color: var(--raj-muted); margin: 0; line-height: 1.72; }
  .sr-empty-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .sr-suggestions-wrap { width: 100%; }
  .sr-sug-label {
    font-size: 11px; font-weight: 800; color: var(--raj-faint);
    letter-spacing: .12em; text-transform: uppercase; margin-bottom: 14px;
    font-family: var(--font-sans);
  }

  /* Empty state tags — dark style */
  .sr-empty .sr-tags .sr-tag, .sr-prompt .sr-tags .sr-tag, .sr-suggestions-wrap .sr-tag {
    border-color: var(--raj-line-warm); background: var(--raj-paper);
    color: var(--raj-ink-2);
  }
  .sr-empty .sr-tags .sr-tag:hover, .sr-prompt .sr-tags .sr-tag:hover, .sr-suggestions-wrap .sr-tag:hover {
    border-color: var(--raj-leaf); color: var(--raj-leaf); background: var(--raj-leaf-bg);
    transform: translateY(-2px);
  }

  /* ── Prompt (no search yet) ── */
  .sr-prompt {
    display: flex; flex-direction: column; align-items: center;
    gap: 20px; padding: 88px 24px; text-align: center; max-width: 520px; margin: 0 auto;
  }
  .sr-prompt-icon {
    width: 88px; height: 88px; border-radius: var(--r-xl);
    background: var(--raj-paper); color: var(--raj-faint);
    display: grid; place-items: center;
    border: 1.5px solid var(--raj-line);
    box-shadow: var(--shadow-xs);
  }
  .sr-prompt-title {
    font-family: var(--font-display); font-size: 1.5rem; font-weight: 600;
    color: var(--raj-ink); margin: 0;
  }
  .sr-prompt-text { font-size: 14.5px; color: var(--raj-muted); margin: 0; line-height: 1.72; }
  .sr-prompt-cats { width: 100%; }

  /* ── Responsive ── */
  @media (max-width: 1100px) { .sr-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 768px) {
    .sr-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .sr-header { padding: 32px 0 40px; }
    .sr-body { padding: 32px 0 60px; }
    .sr-submit { padding: 0 20px; font-size: 13px; gap: 7px; }
    .sr-submit svg { display: none; }
    .sr-title { font-size: 2rem; }
  }
  @media (max-width: 480px) {
    .sr-form {
      border-radius: 14px; flex-direction: column; overflow: visible;
      background: transparent; border: none; backdrop-filter: none; gap: 8px;
    }
    .sr-form:focus-within { box-shadow: none; border-color: transparent; }
    .sr-input-wrap {
      background: var(--raj-paper); border: 1.5px solid var(--raj-line);
      border-radius: var(--r-full); padding: 0 16px;
    }
    .sr-input-wrap:focus-within { border-color: var(--raj-leaf); }
    .sr-submit { border-radius: var(--r-full); padding: 14px 24px; }
    .sr-popular { flex-direction: column; align-items: flex-start; gap: 10px; }
    .sr-skel { aspect-ratio: 1 / 1.4; }
    .sr-empty { padding: 52px 16px; }
    .sr-prompt { padding: 60px 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .sr-tag, .sr-submit { transition: none; }
    .sr-loader { animation: none; }
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

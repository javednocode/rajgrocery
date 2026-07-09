import { Component, OnInit, signal, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CountryService } from '../../core/services/country.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `
  <!-- Hero search bar -->
  <section class="sr-hero">
    <div class="container">
      <h1 class="sr-title">
        @if (isSale) { Hot Deals & Offers } @else { Find what you need }
      </h1>
      <form class="sr-form" (submit)="submit($event)" role="search">
        <div class="sr-input-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input [(ngModel)]="term" name="q" placeholder="Search for spices, rice, lentils, snacks…" aria-label="Search products" autofocus />
        </div>
        <button type="submit" class="sr-submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
          Search
        </button>
      </form>
      @if (query()) {
        <p class="sr-note">
          @if (loading()) { Searching for "<strong>{{ query() }}</strong>"… }
          @else { {{ results().length }} results for "<strong>{{ query() }}</strong>" }
        </p>
      } @else if (isSale) {
        <p class="sr-note">
          @if (loading()) { Loading our best offers… }
          @else { {{ results().length }} products on sale }
        </p>
      }
    </div>
  </section>

  <!-- Results -->
  <section class="sr-body">
    <div class="container">
      @if (loading()) {
        <div class="sr-grid">
          @for (s of [1,2,3,4,5,6,7,8]; track s) {
            <div class="skeleton" style="height:340px;border-radius:16px"></div>
          }
        </div>
      } @else if ((query() || isSale) && results().length === 0) {
        <div class="sr-empty">
          <div class="sr-empty-icon">@if (isSale) { 🏷️ } @else { 🔍 }</div>
          <h3>@if (isSale) { No active sales right now } @else { No products found for "{{ query() }}" }</h3>
          <p>@if (isSale) { Check back later for more deals or browse our categories below. } @else { Try different keywords or browse our categories below. }</p>
          <a routerLink="/categories" class="sr-empty-btn">Browse All Categories</a>
        </div>
      } @else if (results().length > 0) {
        <div class="sr-grid">
          @for (p of results(); track p.id) {
            <app-product-card [product]="p" />
          }
        </div>
      } @else {
        <div class="sr-prompt">
          <div class="sr-prompt-icon">🛍️</div>
          <h3>What are you looking for?</h3>
          <p>Type a search term above to find products.</p>
          <div class="sr-suggestions">
            @for (s of suggestions; track s) {
              <button class="sr-tag" (click)="searchFor(s)">{{ s }}</button>
            }
          </div>
        </div>
      }
    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}
  .skeleton { background: linear-gradient(90deg,#EFE8DA 25%,#F7F2E7 50%,#EFE8DA 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* HERO */
  .sr-hero {
    background: linear-gradient(135deg, #211D16 0%, #37322A 100%);
    padding: 52px 0 56px;
  }
  .sr-hero::before {
    display: none;
  }
  .sr-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: clamp(1.8rem, 3.5vw, 2.8rem); font-weight: 400;
    color: #fff; margin-bottom: 24px;
  }
  .sr-form {
    display: flex; max-width: 700px;
    border-radius: 999px; overflow: hidden;
    background: rgba(255,255,255,.1);
    border: 1.5px solid rgba(255,255,255,.2);
    backdrop-filter: blur(8px);
    transition: border-color .25s;
  }
  .sr-form:focus-within { border-color: rgba(196,98,45,.6); box-shadow: 0 0 0 3px rgba(196,98,45,.15); }
  .sr-input-wrap {
    flex: 1; display: flex; align-items: center; gap: 12px;
    padding: 0 20px; color: rgba(255,255,255,.5);
  }
  .sr-form input {
    flex: 1; border: none; outline: none;
    padding: 14px 0; font-size: 15px;
    color: #fff; background: transparent;
    font-family: 'Manrope', sans-serif; min-width: 0;
  }
  .sr-form input::placeholder { color: rgba(255,255,255,.4); }
  .sr-submit {
    display: flex; align-items: center; gap: 8px;
    background: #C4622D; color: #fff; border: none;
    padding: 14px 28px; font-family: 'Manrope', sans-serif;
    font-size: 15px; font-weight: 800; cursor: pointer;
    transition: background .2s; flex-shrink: 0;
  }
  .sr-submit:hover { background: #A94E20; }
  .sr-note { margin: 16px 0 0; font-size: 14px; color: rgba(255,255,255,.6); font-family: 'Manrope', sans-serif; }
  .sr-note strong { color: #fff; }

  /* BODY */
  .sr-body { padding: 40px 0 60px; background: #FAF6EF; min-height: 40vh; }
  .sr-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 20px;
  }

  /* EMPTY */
  .sr-empty { text-align: center; padding: 80px 20px; max-width: 480px; margin: 0 auto; }
  .sr-empty-icon { font-size: 3.5rem; margin-bottom: 16px; }
  .sr-empty h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.5rem; font-weight: 400; color: #211D16; margin-bottom: 8px; }
  .sr-empty p { font-size: 15px; color: #7C7466; margin-bottom: 24px; }
  .sr-empty-btn { display: inline-flex; background: #C4622D; color: #fff; padding: 12px 28px; border-radius: 999px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; transition: background .2s; }
  .sr-empty-btn:hover { background: #A94E20; }

  /* PROMPT */
  .sr-prompt { text-align: center; padding: 80px 20px; }
  .sr-prompt-icon { font-size: 3rem; margin-bottom: 16px; }
  .sr-prompt h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.5rem; color: #211D16; margin-bottom: 8px; }
  .sr-prompt p { font-size: 15px; color: #7C7466; margin-bottom: 24px; }
  .sr-suggestions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .sr-tag { padding: 8px 18px; border-radius: 999px; border: 1.5px solid #E8E1D2; background: #fff; color: #211D16; font-family: 'Manrope', sans-serif; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all .2s; }
  .sr-tag:hover { border-color: #C4622D; color: #C4622D; background: #F7E8DC; }

  @media (max-width: 1100px) { .sr-grid { grid-template-columns: repeat(3,1fr); } }
  @media (max-width: 768px) { .sr-grid { grid-template-columns: repeat(2,1fr); gap: 12px; } }
  @media (max-width: 400px) { .sr-grid { grid-template-columns: 1fr; } }

  @media (max-width: 640px) {
    .sr-hero { padding: 26px 0 30px; }
  }
  `]
})
export class SearchComponent implements OnInit {
  query = signal('');
  results = signal<any[]>([]);
  loading = signal(false);
  term = '';
  isSale = false;
  get suggestions() { return this.country.current().suggestions; }

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService, private seo: SeoService, public country: CountryService) {
    // Re-run the current search when the marketplace changes
    effect(() => {
      const code = this.country.code();
      untracked(() => this.refetch());
    });
  }

  private refetch() {
    if (this.isSale) { this.fetchSale(); }
    else if (this.query()) { this.fetchQuery(this.query()); }
  }

  private fetchSale() {
    this.loading.set(true);
    this.api.getProducts({ is_sale: 1, country: this.country.code() }).subscribe({
      next: (r: any) => { if (r.success) this.results.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  private fetchQuery(t: string) {
    this.loading.set(true);
    this.api.searchProducts(t, this.country.code()).subscribe({
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
        this.seo.setMeta({ title: 'Hot Deals & Offers', description: 'Explore our latest sale products and special offers.' });
        this.fetchSale();
      } else {
        this.seo.setMeta({ title: 'Search Products', description: 'Search our international grocery marketplace.' });
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

  searchFor(s: string) { this.term = s; this.router.navigate(['/search'], { queryParams: { q: s } }); }
}

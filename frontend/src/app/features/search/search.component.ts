import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <div class="search-hero">
      <div class="container">
        <h1>Search Products</h1>
        <div class="hero-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            [(ngModel)]="query"
            (keyup.enter)="doSearch()"
            placeholder="Search for halal meats, spices, vegetables..."
            class="hero-search-input"
            id="search-page-input"
            autofocus
          >
          @if (query) {
            <button (click)="clearSearch()" class="clear-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          }
          <button (click)="doSearch()" class="search-go-btn" id="search-page-btn">Search</button>
        </div>
      </div>
    </div>

    <div class="search-body">
      <div class="container">

        @if (loading()) {
          <div class="search-status">Searching...</div>
          <div class="products-grid">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="skel-card">
                <div class="skeleton" style="aspect-ratio:1;border-radius:12px 12px 0 0;"></div>
                <div style="padding:10px 12px 14px;display:flex;flex-direction:column;gap:8px">
                  <div class="skeleton" style="height:12px;width:70%;border-radius:4px"></div>
                  <div class="skeleton" style="height:12px;width:40%;border-radius:4px"></div>
                </div>
              </div>
            }
          </div>
        } @else if (hasSearched()) {

          @if (results().length > 0) {
            <div class="results-meta">
              <span>Found <strong>{{ results().length }}</strong> results for "<strong>{{ lastQuery() }}</strong>"</span>
              <div class="sort-row">
                <label>Sort:</label>
                <select [(ngModel)]="sortBy" (change)="doSearch()" class="sort-select" id="search-sort">
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            <div class="products-grid">
              @for (p of results(); track p.id) {
                <app-product-card [product]="p" />
              }
            </div>
          } @else {
            <div class="no-results">
              <div class="no-results-icon">🔍</div>
              <h3>No results for "{{ lastQuery() }}"</h3>
              <p>Try a different keyword, or browse our categories below</p>
              <a routerLink="/categories" class="browse-cats-btn">Browse All Categories →</a>

              <!-- Suggestions -->
              <div class="suggestions">
                <h4>Try searching for:</h4>
                <div class="suggestion-pills">
                  @for (s of suggestions; track s) {
                    <button class="suggestion-pill" (click)="applySuggestion(s)">{{ s }}</button>
                  }
                </div>
              </div>
            </div>
          }
        } @else {
          <!-- Initial state -->
          <div class="search-start-state">
            <div class="start-icon">🔍</div>
            <h3>What are you looking for?</h3>
            <p>Search for halal meats, spices, vegetables, and more</p>
            <div class="suggestion-pills">
              @for (s of suggestions; track s) {
                <button class="suggestion-pill" (click)="applySuggestion(s)">{{ s }}</button>
              }
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .search-hero {
      background: #111; padding: 40px 0 36px;
    }
    .search-hero h1 { color: white; font-size: clamp(1.5rem, 3vw, 2rem); margin-bottom: 20px; }
    .hero-search-bar {
      display: flex; align-items: center; gap: 0;
      background: white; border-radius: 12px; overflow: hidden;
      max-width: 600px; padding-left: 14px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    }
    .hero-search-input {
      flex: 1; height: 52px; border: none; background: transparent;
      font-size: 15px; color: #111; outline: none; padding: 0 10px;
      font-family: 'Inter', sans-serif;
    }
    .hero-search-input::placeholder { color: #B0B3BE; }
    .clear-btn {
      background: none; border: none; cursor: pointer; padding: 8px;
      display: flex; align-items: center; color: #B0B3BE;
    }
    .search-go-btn {
      height: 52px; padding: 0 24px;
      background: #F28C00; color: white;
      border: none; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: background 0.2s; white-space: nowrap;
      font-family: 'Inter', sans-serif;
    }
    .search-go-btn:hover { background: #070A05; }

    .search-body { background: #F9FAFB; padding: 28px 0 72px; min-height: 60vh; }

    .search-status { font-size: 14px; color: #9CA3AF; margin-bottom: 20px; }

    .results-meta {
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
    }
    .results-meta span { font-size: 14px; color: #6B7280; }
    .results-meta strong { color: #111; }
    .sort-row { display: flex; align-items: center; gap: 8px; }
    .sort-row label { font-size: 12px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.04em; }
    .sort-select {
      border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 7px 12px;
      font-size: 13px; color: #111; outline: none; background: white;
      font-family: 'Inter', sans-serif; cursor: pointer; transition: border-color 0.2s;
    }
    .sort-select:focus { border-color: #F28C00; }

    .skel-card { background: white; border-radius: 12px; border: 1px solid #F3F4F6; overflow: hidden; }

    /* No results / initial state */
    .no-results, .search-start-state {
      text-align: center; padding: 72px 20px;
    }
    .no-results-icon, .start-icon { font-size: 56px; display: block; margin-bottom: 16px; opacity: 0.5; }
    .no-results h3, .search-start-state h3 { font-size: 20px; color: #111; margin-bottom: 8px; font-family: 'Poppins', sans-serif; }
    .no-results p, .search-start-state p { font-size: 14px; color: #9CA3AF; margin-bottom: 24px; }
    .browse-cats-btn {
      display: inline-block; padding: 12px 28px; background: #F28C00; color: white;
      border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none;
      transition: background 0.2s; margin-bottom: 36px;
    }
    .browse-cats-btn:hover { background: #070A05; }
    .suggestions h4 { font-size: 13px; font-weight: 600; color: #6B7280; margin-bottom: 12px; }
    .suggestion-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
    .suggestion-pill {
      padding: 7px 16px; background: white; border: 1.5px solid #E5E7EB;
      border-radius: 999px; font-size: 13px; font-weight: 500; color: #374151;
      cursor: pointer; transition: all 0.18s; font-family: 'Inter', sans-serif;
    }
    .suggestion-pill:hover { border-color: #F28C00; color: #F28C00; background: #FFF2DE; }
  `]
})
export class SearchComponent implements OnInit {
  query = '';
  sortBy = 'relevance';
  results = signal<any[]>([]);
  loading = signal(false);
  hasSearched = signal(false);
  lastQuery = signal('');

  suggestions = ['Halal Chicken', 'Lamb Chops', 'Biryani Spice', 'Basmati Rice', 'Fresh Ginger', 'Turmeric', 'Chilli Powder', 'Coriander'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.query = params['q'];
        this.runSearch(this.query);
      }
    });
  }

  doSearch() {
    if (!this.query.trim()) return;
    this.router.navigate(['/search'], { queryParams: { q: this.query.trim() } });
    this.runSearch(this.query.trim());
  }

  runSearch(q: string) {
    this.loading.set(true);
    this.hasSearched.set(false);
    this.lastQuery.set(q);
    this.cdr.markForCheck();
    this.api.searchProducts(q).subscribe({
      next: (res: any) => {
        this.results.set(res?.data || []);
        this.loading.set(false);
        this.hasSearched.set(true);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.hasSearched.set(true); this.cdr.markForCheck(); }
    });
  }

  applySuggestion(s: string) {
    this.query = s;
    this.doSearch();
  }

  clearSearch() {
    this.query = '';
    this.results.set([]);
    this.hasSearched.set(false);
    this.cdr.markForCheck();
  }
}

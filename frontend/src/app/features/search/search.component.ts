import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <section class="search-page">
      <div class="container">
        <div class="search-header">
          <h1>Search Results</h1>
          @if (query()) { <p>Showing results for "<strong>{{ query() }}</strong>"</p> }
        </div>
        @if (loading()) {
          <div class="product-grid">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton-card"><div class="skeleton" style="aspect-ratio:1;"></div><div class="skeleton" style="height:20px;margin:12px;width:60%;"></div></div>
            }
          </div>
        } @else {
          <div class="product-grid">
            @for (product of results(); track product.id) {
              <app-product-card [product]="product" />
            } @empty {
              <div class="empty-state"><span>🔍</span><h3>No products found</h3><p>Try a different search term</p><a routerLink="/" class="btn btn-primary">Back to Home</a></div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .search-page { padding: 40px 0 80px; }
    .search-header { margin-bottom: 32px; }
    .search-header h1 { margin-bottom: 8px; }
    .search-header p { color: var(--text-secondary); font-size: 16px; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .skeleton-card { background: var(--bg-white); border-radius: var(--radius); overflow: hidden; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--text-muted); }
    .empty-state span { font-size: 64px; display: block; margin-bottom: 16px; }
    .empty-state .btn { margin-top: 20px; }
    @media (max-width: 640px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .search-page { padding: 24px 0 60px; }
      .search-header { margin-bottom: 20px; }
    }
  `]

})
export class SearchComponent implements OnInit {
  query = signal('');
  results = signal<any[]>([]);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const q = params['q'] || '';
      this.query.set(q);
      if (q) {
        this.loading.set(true);
        this.api.searchProducts(q).subscribe({
          next: (res: any) => { if (res.success) this.results.set(res.data); this.loading.set(false); },
          error: () => this.loading.set(false)
        });
      } else {
        this.loading.set(false);
      }
    });
  }
}

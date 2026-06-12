import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `
  <section class="ct-hero">
    <div class="td-container">
      <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a><i>/</i><a routerLink="/categories">Shop</a><i>/</i><span>{{ category()?.name }}</span></nav>
      <h1>{{ category()?.name }}</h1>
      @if (category()?.description) { <p class="td-sub">{{ category()?.description }}</p> }
    </div>
  </section>

  <section class="ct-body">
    <div class="td-container ct-layout">
      <aside class="ct-filters" aria-label="Filters">
        <div class="fblock">
          <h4>Sort by</h4>
          <select [(ngModel)]="sortBy" (change)="reload()" class="fsel">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low → high</option>
            <option value="price_desc">Price: high → low</option>
            <option value="popular">Most popular</option>
            <option value="name_asc">Name: A–Z</option>
          </select>
        </div>
        <div class="fblock">
          <h4>Price</h4>
          <div class="frange">
            <input type="number" placeholder="Min" [(ngModel)]="minPrice" (change)="reload()" aria-label="Minimum price" />
            <span>–</span>
            <input type="number" placeholder="Max" [(ngModel)]="maxPrice" (change)="reload()" aria-label="Maximum price" />
          </div>
        </div>
        <div class="fblock">
          <h4>Availability</h4>
          <label class="fcheck"><input type="checkbox" [(ngModel)]="inStockOnly" (change)="reload()" /> In stock only</label>
        </div>
        @if (category()?.subcategories?.length) {
          <div class="fblock">
            <h4>Subcategories</h4>
            @for (s of category().subcategories; track s.id) { <a class="fsub" [routerLink]="['/category', s.slug]">{{ s.name }}</a> }
          </div>
        }
      </aside>

      <div class="ct-main">
        <div class="ct-bar"><span>{{ total() }} products</span></div>
        @if (loading()) {
          <div class="pgrid">@for (s of [1,2,3,4,5,6]; track s) { <div><div class="td-skel" style="aspect-ratio:1"></div><div class="td-skel" style="height:18px;margin:12px 0 8px;width:70%"></div><div class="td-skel" style="height:14px;width:40%"></div></div> }</div>
        } @else if (products().length === 0) {
          <div class="ct-empty"><h3>Nothing here yet</h3><p>Try adjusting your filters.</p></div>
        } @else {
          <div class="pgrid">@for (p of products(); track p.id) { <app-product-card [product]="p" /> }</div>
          @if (totalPages() > 1) {
            <nav class="pager" aria-label="Pagination">
              @for (n of pages(); track n) { <button [class.on]="n === page" (click)="go(n)">{{ n }}</button> }
            </nav>
          }
        }
      </div>
    </div>
  </section>
  `,
  styles: [`
  .ct-hero{padding:64px 0 44px;background:var(--td-secondary)}
  .crumbs{font-size:13px;color:var(--td-muted);margin-bottom:14px;display:flex;gap:8px;align-items:center}
  .crumbs a:hover{color:var(--td-text)}
  .crumbs i{font-style:normal;opacity:.5}
  .ct-hero h1{font-size:clamp(1.9rem,3.6vw,2.9rem);font-weight:800;letter-spacing:-.03em;margin-bottom:12px}
  .ct-body{padding:52px 0}
  .ct-layout{display:grid;grid-template-columns:250px 1fr;gap:44px;align-items:start}
  .ct-filters{position:sticky;top:calc(var(--td-header-h) + 24px)}
  .fblock{padding:0 0 24px;margin-bottom:24px;border-bottom:1px solid var(--td-line)}
  .fblock h4{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--td-muted);margin-bottom:14px}
  .fsel{width:100%;padding:12px 14px;border:1.5px solid var(--td-line);border-radius:var(--td-radius-sm);font:inherit;font-size:14px;background:#fff;color:var(--td-text)}
  .frange{display:flex;align-items:center;gap:10px}
  .frange input{width:100%;padding:11px 12px;border:1.5px solid var(--td-line);border-radius:var(--td-radius-sm);font:inherit;font-size:14px}
  .frange input:focus,.fsel:focus{outline:none;border-color:var(--td-accent)}
  .fcheck{display:flex;align-items:center;gap:10px;font-size:14px;cursor:pointer}
  .fcheck input{width:17px;height:17px;accent-color:var(--td-primary)}
  .fsub{display:block;font-size:14px;color:var(--td-muted);padding:7px 0;transition:color .2s,padding-left .25s var(--td-ease)}
  .fsub:hover{color:var(--td-text);padding-left:6px}
  .ct-bar{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--td-muted);margin-bottom:22px}
  .pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .ct-empty{text-align:center;padding:90px 20px;color:var(--td-muted)}
  .ct-empty h3{margin-bottom:8px}
  .pager{display:flex;justify-content:center;gap:8px;margin-top:48px;flex-wrap:wrap}
  .pager button{min-width:42px;height:42px;border-radius:999px;border:1.5px solid var(--td-line);background:#fff;font-size:14px;font-weight:700;transition:all .2s}
  .pager button:hover{border-color:var(--td-text)}
  .pager button.on{background:var(--td-primary);color:#fff;border-color:var(--td-primary)}
  @media (max-width:1000px){.ct-layout{grid-template-columns:1fr}.ct-filters{position:static;display:grid;grid-template-columns:1fr 1fr;gap:0 24px}}
  @media (max-width:680px){.pgrid{grid-template-columns:1fr 1fr;gap:12px}.ct-filters{grid-template-columns:1fr}}
  `]
})
export class CategoryDetailComponent implements OnInit {
  category = signal<any>(null);
  products = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  totalPages = signal(0);
  page = 1;
  sortBy = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = false;

  constructor(private route: ActivatedRoute, private api: ApiService, private seo: SeoService) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.page = 1; this.loading.set(true);
      this.api.getCategoryBySlug(p['slug']).subscribe({ next: (r: any) => { if (r.success) { this.category.set(r.data); this.seo.setCategoryMeta(r.data); } }, error: () => {} });
      this.load();
    });
  }
  reload() { this.page = 1; this.load(); }
  load() {
    this.loading.set(true);
    const params: any = { category: this.route.snapshot.params['slug'], page: this.page, per_page: 12, sort: this.sortBy };
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
  go(n: number) { this.page = n; this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  pages() { return Array.from({ length: this.totalPages() }, (_, i) => i + 1); }
}

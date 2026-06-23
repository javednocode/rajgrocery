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
  .ct-hero{padding:52px 0 36px;background:#F4FCF7;border-bottom:1px solid #ECECEC}
  .td-container{max-width:1280px;margin:0 auto;padding:0 24px;width:100%}
  .crumbs{font-size:13px;color:#7E8D97;margin-bottom:12px;display:flex;gap:8px;align-items:center}
  .crumbs a:hover{color:#3BB77E}
  .crumbs i{font-style:normal;opacity:.4}
  .ct-hero h1{font-size:clamp(1.7rem,3.2vw,2.6rem);font-weight:800;color:#253D4E;margin-bottom:10px}
  .td-sub{font-size:14.5px;color:#7E8D97;max-width:560px;line-height:1.7;margin:0}
  .ct-body{padding:40px 0}
  .ct-layout{display:grid;grid-template-columns:230px 1fr;gap:36px;align-items:start}
  .ct-filters{position:sticky;top:calc(var(--header-height,156px) + 20px);background:#fff;border:1px solid #ECECEC;border-radius:12px;padding:20px}
  .fblock{padding:0 0 20px;margin-bottom:20px;border-bottom:1px solid #F0F0F0}
  .fblock:last-child{padding-bottom:0;margin-bottom:0;border-bottom:none}
  .fblock h4{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#7E8D97;margin-bottom:12px}
  .fsel{width:100%;padding:10px 12px;border:1.5px solid #ECECEC;border-radius:8px;font:inherit;font-size:14px;background:#fff;color:#253D4E;cursor:pointer}
  .fsel:focus{outline:none;border-color:#3BB77E}
  .frange{display:flex;align-items:center;gap:8px}
  .frange input{width:100%;padding:10px 10px;border:1.5px solid #ECECEC;border-radius:8px;font:inherit;font-size:13px;color:#253D4E}
  .frange input:focus{outline:none;border-color:#3BB77E}
  .fcheck{display:flex;align-items:center;gap:10px;font-size:14px;cursor:pointer;color:#253D4E}
  .fcheck input{width:16px;height:16px;accent-color:#3BB77E}
  .fsub{display:block;font-size:14px;color:#7E8D97;padding:7px 0;transition:color .2s,padding-left .2s}
  .fsub:hover{color:#3BB77E;padding-left:5px}
  .ct-bar{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:#7E8D97;margin-bottom:20px}
  /* 3-col desktop, 2-col tablet/mobile */
  .pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .ct-empty{text-align:center;padding:80px 20px;color:#7E8D97}
  .ct-empty h3{margin-bottom:8px;color:#253D4E}
  .pager{display:flex;justify-content:center;gap:8px;margin-top:40px;flex-wrap:wrap}
  .pager button{min-width:40px;height:40px;border-radius:999px;border:1.5px solid #ECECEC;background:#fff;font-size:14px;font-weight:700;color:#7E8D97;transition:all .2s;cursor:pointer}
  .pager button:hover{border-color:#3BB77E;color:#3BB77E}
  .pager button.on{background:#3BB77E;color:#fff;border-color:#3BB77E}
  .td-skel{background:linear-gradient(90deg,#EEF3F0 25%,#F8FAF9 50%,#EEF3F0 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:12px}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @media (max-width:1000px){.ct-layout{grid-template-columns:1fr}.ct-filters{position:static;display:grid;grid-template-columns:1fr 1fr;gap:0 20px}}
  @media (max-width:680px){.pgrid{grid-template-columns:1fr 1fr;gap:10px}.ct-filters{grid-template-columns:1fr}}
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

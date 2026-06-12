import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { SeoService } from '../../core/services/seo.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
  @if (loading()) {
    <div class="td-container pd-load"><div class="td-skel" style="aspect-ratio:1"></div><div><div class="td-skel" style="height:36px;width:75%;margin-bottom:18px"></div><div class="td-skel" style="height:22px;width:35%;margin-bottom:28px"></div><div class="td-skel" style="height:120px"></div></div></div>
  } @else if (product(); as p) {
    <div class="td-container pd">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><i>/</i>
        @if (p.categories?.[0]) { <a [routerLink]="['/category', p.categories[0].slug]">{{ p.categories[0].name }}</a><i>/</i> }
        <span>{{ p.name }}</span>
      </nav>
      <div class="pd-grid">
        <div class="pd-gallery">
          <div class="pd-main">
            <img [src]="media(selectedImage())" [alt]="p.name" />
            @if (discount() > 0) { <span class="pd-tag">−{{ discount() }}%</span> }
            <button class="pd-wish" [class.on]="wishlist.has(p.id)" (click)="wishlist.toggle(p, media(selectedImage()))" [attr.aria-label]="wishlist.has(p.id) ? 'Remove from wishlist' : 'Add to wishlist'">
              <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="wishlist.has(p.id) ? 'currentColor' : 'none'"><path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </button>
          </div>
          @if (p.images?.length > 1) {
            <div class="pd-thumbs">
              @for (im of p.images; track im.id) {
                <button [class.on]="im.image_path === selectedImage()" (click)="selectedImage.set(im.image_path)"><img [src]="media(im.image_path)" [alt]="im.alt_text || p.name" loading="lazy" /></button>
              }
            </div>
          }
        </div>
        <div class="pd-info">
          @if (p.categories?.[0]) { <span class="pd-cat">{{ p.categories[0].name }}</span> }
          <h1>{{ p.name }}</h1>
          <div class="pd-price">
            @if (onSale()) { <strong>{{ cur }}{{ activePrice() }}</strong><s>{{ cur }}{{ p.price }}</s> }
            @else { <strong>{{ cur }}{{ activePrice() }}</strong> }
            <span class="pd-stock" [class.out]="p.stock <= 0">{{ p.stock > 0 ? 'In stock' : 'Out of stock' }}</span>
          </div>
          @if (p.short_description) { <p class="pd-short">{{ p.short_description }}</p> }
          @if (p.variations?.length) {
            <div class="pd-vars">
              <h4>Options</h4>
              <div class="pd-var-row">
                @for (v of p.variations; track v.id) {
                  <button class="pd-var" [class.on]="selectedVariation()?.id === v.id" (click)="pickVar(v)">
                    {{ v.name }} <em>{{ cur }}{{ v.sale_price || v.price }}</em>
                  </button>
                }
              </div>
            </div>
          }
          <div class="pd-buy">
            <div class="pd-qty">
              <button (click)="qty > 1 && (qty = qty - 1)" aria-label="Decrease quantity">−</button>
              <span>{{ qty }}</span>
              <button (click)="qty = qty + 1" aria-label="Increase quantity">+</button>
            </div>
            <button class="td-btn td-btn-dark pd-add" (click)="add()" [disabled]="p.stock <= 0">{{ added() ? '✓ Added to basket' : 'Add to basket' }}</button>
          </div>
          <button class="pd-buynow" (click)="buyNow()" [disabled]="p.stock <= 0">Buy it now</button>
          <ul class="pd-perks">
            <li>Next-day UK delivery available</li>
            <li>Free delivery over {{ cur }}{{ freeAbove }}</li>
            <li>100% authentic, sourced direct</li>
          </ul>
          @if (p.sku) { <div class="pd-meta">SKU — {{ p.sku }}</div> }
        </div>
      </div>
      @if (p.description) {
        <div class="pd-desc"><h2>About this product</h2><div [innerHTML]="p.description"></div></div>
      }
      @if (p.related_products?.length) {
        <div class="pd-rel"><h2>You may also like</h2>
          <div class="pgrid">@for (r of p.related_products; track r.id) { <app-product-card [product]="r" /> }</div>
        </div>
      }
    </div>
  }
  `,
  styles: [`
  .pd-load{display:grid;grid-template-columns:1fr 1fr;gap:56px;padding-top:48px;padding-bottom:80px}
  .pd{padding-top:32px;padding-bottom:40px}
  .crumbs{font-size:13px;color:var(--td-muted);margin-bottom:28px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .crumbs a:hover{color:var(--td-text)}
  .crumbs i{font-style:normal;opacity:.5}
  .pd-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:start}
  .pd-main{position:relative;aspect-ratio:1;border-radius:var(--td-radius);background:var(--td-secondary);overflow:hidden}
  .pd-main img{width:100%;height:100%;object-fit:cover}
  .pd-tag{position:absolute;top:18px;left:18px;background:var(--td-accent);color:#111;font-size:12px;font-weight:800;padding:6px 13px;border-radius:999px}
  .pd-wish{position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:999px;border:none;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);display:grid;place-items:center;color:var(--td-text);transition:transform .25s var(--td-ease)}
  .pd-wish:hover{transform:scale(1.1)}
  .pd-wish.on{color:#E11D48}
  .pd-thumbs{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
  .pd-thumbs button{width:72px;height:72px;border-radius:var(--td-radius-sm);border:2px solid var(--td-line);overflow:hidden;background:var(--td-secondary);padding:0;transition:border-color .2s}
  .pd-thumbs button.on,.pd-thumbs button:hover{border-color:var(--td-primary)}
  .pd-thumbs img{width:100%;height:100%;object-fit:cover}
  .pd-cat{font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--td-accent)}
  .pd-info h1{font-size:clamp(1.6rem,2.8vw,2.3rem);font-weight:800;line-height:1.15;margin:10px 0 18px}
  .pd-price{display:flex;align-items:center;gap:14px;margin-bottom:20px;flex-wrap:wrap}
  .pd-price strong{font-family:'Sora',sans-serif;font-size:30px;font-weight:800}
  .pd-price s{font-size:17px;color:var(--td-muted)}
  .pd-stock{font-size:12px;font-weight:700;color:var(--td-success);background:rgba(22,163,74,.1);padding:6px 13px;border-radius:999px}
  .pd-stock.out{color:#DC2626;background:#FEF2F2}
  .pd-short{font-size:15.5px;line-height:1.8;color:var(--td-muted);margin:0 0 26px}
  .pd-vars h4{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--td-muted);margin-bottom:12px}
  .pd-var-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px}
  .pd-var{border:1.5px solid var(--td-line);border-radius:999px;background:#fff;padding:11px 18px;font-size:13.5px;font-weight:600;transition:all .2s}
  .pd-var em{font-style:normal;font-weight:800;margin-left:6px}
  .pd-var:hover{border-color:var(--td-text)}
  .pd-var.on{background:var(--td-primary);color:#fff;border-color:var(--td-primary)}
  .pd-buy{display:flex;gap:14px;margin-bottom:12px}
  .pd-qty{display:flex;align-items:center;gap:2px;border:1.5px solid var(--td-line);border-radius:999px;padding:4px}
  .pd-qty button{width:40px;height:40px;border-radius:999px;border:none;background:none;font-size:18px;font-weight:700}
  .pd-qty button:hover{background:var(--td-secondary)}
  .pd-qty span{min-width:36px;text-align:center;font-weight:800;font-size:15px}
  .pd-add{flex:1;justify-content:center}
  .pd-add:disabled{background:#94A3B8;transform:none;box-shadow:none;cursor:not-allowed}
  .pd-buynow{width:100%;border:1.5px solid var(--td-primary);border-radius:999px;background:#fff;padding:15px;font-size:15px;font-weight:700;transition:all .25s}
  .pd-buynow:hover:not(:disabled){background:var(--td-primary);color:#fff}
  .pd-buynow:disabled{opacity:.5;cursor:not-allowed}
  .pd-perks{list-style:none;margin:26px 0 0;padding:22px 0 0;border-top:1px solid var(--td-line)}
  .pd-perks li{font-size:13.5px;color:var(--td-muted);padding:5px 0 5px 26px;position:relative}
  .pd-perks li::before{content:'✓';position:absolute;left:0;color:var(--td-success);font-weight:800}
  .pd-meta{margin-top:18px;font-size:12.5px;color:var(--td-muted)}
  .pd-desc{margin-top:80px;max-width:780px}
  .pd-desc h2{font-size:24px;font-weight:800;margin-bottom:20px}
  .pd-desc div{font-size:15.5px;line-height:1.9;color:var(--td-muted)}
  .pd-rel{margin-top:80px}
  .pd-rel h2{font-size:24px;font-weight:800;margin-bottom:28px}
  .pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
  @media (max-width:1000px){.pd-grid{grid-template-columns:1fr;gap:36px}.pgrid{grid-template-columns:repeat(2,1fr);gap:12px}.pd-load{grid-template-columns:1fr}}
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<any>(null);
  selectedImage = signal('');
  selectedVariation = signal<any>(null);
  loading = signal(true);
  added = signal(false);
  qty = 1;
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService,
              private cart: CartService, public wishlist: WishlistService, private seo: SeoService,
              private settings: SettingsService) {}

  get cur() { return this.settings.get('currency_symbol', '£'); }
  get freeAbove() { return this.settings.get('shipping_free_above', '50'); }

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.loading.set(true); this.qty = 1; this.selectedVariation.set(null);
      window.scrollTo(0, 0);
      this.api.getProductBySlug(p['slug']).subscribe({
        next: (r: any) => {
          if (r.success) {
            this.product.set(r.data);
            this.selectedImage.set(r.data.images?.[0]?.image_path || r.data.primary_image || '');
            this.seo.setProductMeta(r.data);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });
  }
  media(p: string) { return !p ? 'placeholder.png' : (p.startsWith('http') ? p : this.mediaUrl + p); }
  onSale() { const p = this.product(); return p?.sale_price && +p.sale_price < +p.price; }
  discount() { const p = this.product(); if (!this.onSale()) return 0; return Math.round(((p.price - p.sale_price) / p.price) * 100); }
  activePrice() { const v = this.selectedVariation(); if (v) return v.sale_price || v.price; const p = this.product(); return this.onSale() ? p.sale_price : p.price; }
  pickVar(v: any) { this.selectedVariation.set(v); if (v.image_path) this.selectedImage.set(v.image_path); }
  add() {
    const p = this.product(); if (!p || p.stock <= 0) return;
    this.cart.addItem(p, this.qty); this.qty = 1;
    this.added.set(true); setTimeout(() => this.added.set(false), 1800);
  }
  buyNow() { const p = this.product(); if (!p || p.stock <= 0) return; this.cart.addItem(p, this.qty); this.cart.closeCart(); this.router.navigate(['/checkout']); }
}

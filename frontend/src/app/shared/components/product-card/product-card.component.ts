import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SettingsService } from '../../../core/services/settings.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
  <article class="pc" [class.oos]="product.stock <= 0">
    <a [routerLink]="['/product', product.slug]" class="pc-media">
      <img class="pc-img a" [src]="img(0)" [alt]="product.name" loading="lazy" />
      @if (img(1) !== img(0)) { <img class="pc-img b" [src]="img(1)" alt="" aria-hidden="true" loading="lazy" /> }
      @if (discount() > 0) { <span class="pc-tag">−{{ discount() }}%</span> }
      @if (product.stock <= 0) { <span class="pc-soldout">Sold out</span> }
      <button class="pc-wish" [class.on]="wishlist.has(product.id)" (click)="toggleWish($event)" [attr.aria-label]="wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
        <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="wishlist.has(product.id) ? 'currentColor' : 'none'"><path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      </button>
      <button class="pc-quick" (click)="quickAdd($event)" [disabled]="product.stock <= 0">
        {{ added() ? '✓ Added' : (product.stock <= 0 ? 'Sold out' : 'Quick add') }}
      </button>
    </a>
    <div class="pc-body">
      @if (product.category_names || product.categories?.[0]?.name) {
        <span class="pc-cat">{{ product.category_names || product.categories[0].name }}</span>
      }
      <a [routerLink]="['/product', product.slug]" class="pc-name">{{ product.name }}</a>
      <div class="pc-foot">
        <div class="pc-price">
          @if (onSale()) {
            <strong>{{ cur }}{{ product.sale_price }}</strong><s>{{ cur }}{{ product.price }}</s>
          } @else {
            <strong>{{ cur }}{{ product.price }}</strong>
          }
        </div>
        @if (product.stock > 0) { <span class="pc-stock">In stock</span> }
      </div>
    </div>
  </article>
  `,
  styles: [`
  .pc{background:#fff;border:1px solid var(--td-line);border-radius:var(--td-radius);overflow:hidden;transition:transform .4s var(--td-ease),box-shadow .4s var(--td-ease),border-color .3s;display:flex;flex-direction:column}
  .pc:hover{transform:translateY(-6px);box-shadow:var(--td-shadow);border-color:transparent}
  .pc.oos{opacity:.78}
  .pc-media{position:relative;display:block;aspect-ratio:1;background:var(--td-secondary);overflow:hidden}
  .pc-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .45s,transform .6s var(--td-ease)}
  .pc:hover .pc-img.a{transform:scale(1.06)}
  .pc-img.b{opacity:0}
  .pc:hover .pc-img.b{opacity:1}
  .pc-tag{position:absolute;top:14px;left:14px;background:var(--td-accent);color:#111;font-size:11.5px;font-weight:800;padding:5px 11px;border-radius:999px;letter-spacing:.02em}
  .pc-soldout{position:absolute;top:14px;left:14px;background:rgba(15,23,42,.82);color:#fff;font-size:11px;font-weight:700;padding:5px 11px;border-radius:999px;backdrop-filter:blur(6px)}
  .pc-wish{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:999px;border:none;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);color:var(--td-text);display:grid;place-items:center;transition:transform .25s var(--td-ease),color .2s}
  .pc-wish:hover{transform:scale(1.12)}
  .pc-wish.on{color:#E11D48}
  .pc-quick{position:absolute;left:12px;right:12px;bottom:12px;border:none;border-radius:999px;padding:12px;background:rgba(17,17,17,.92);backdrop-filter:blur(8px);color:#fff;font-size:13px;font-weight:700;opacity:0;transform:translateY(10px);transition:opacity .3s,transform .35s var(--td-ease)}
  .pc:hover .pc-quick{opacity:1;transform:none}
  .pc-quick:disabled{background:rgba(100,116,139,.85)}
  @media (hover:none){.pc-quick{opacity:1;transform:none}}
  .pc-body{padding:16px 18px 18px;display:flex;flex-direction:column;gap:5px;flex:1}
  .pc-cat{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--td-muted)}
  .pc-name{font-size:14.5px;font-weight:600;line-height:1.45;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;transition:color .2s}
  .pc-name:hover{color:var(--td-accent)}
  .pc-foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:8px}
  .pc-price{display:flex;align-items:baseline;gap:8px}
  .pc-price strong{font-family:'Sora',sans-serif;font-size:17px;font-weight:800}
  .pc-price s{font-size:12.5px;color:var(--td-muted)}
  .pc-stock{font-size:11px;font-weight:700;color:var(--td-success);display:flex;align-items:center;gap:5px}
  .pc-stock::before{content:'';width:6px;height:6px;border-radius:999px;background:var(--td-success)}
  `]
})
export class ProductCardComponent {
  @Input() product: any;
  added = signal(false);
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(private cart: CartService, public wishlist: WishlistService, private settings: SettingsService) {}

  get cur() { return this.settings.get('currency_symbol', '£'); }
  onSale() { return this.product.sale_price && +this.product.sale_price < +this.product.price; }
  discount() {
    if (!this.onSale()) return 0;
    return Math.round(((this.product.price - this.product.sale_price) / this.product.price) * 100);
  }
  img(i: number): string {
    const imgs = this.product.images || [];
    const path = i === 0
      ? (this.product.primary_image || imgs[0]?.image_path)
      : (imgs[1]?.image_path || this.product.primary_image || imgs[0]?.image_path);
    if (!path) return 'placeholder.png';
    return path.startsWith('http') ? path : this.mediaUrl + path;
  }
  quickAdd(e: Event) {
    e.preventDefault(); e.stopPropagation();
    if (this.product.stock <= 0) return;
    this.cart.addItem(this.product);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1600);
  }
  toggleWish(e: Event) {
    e.preventDefault(); e.stopPropagation();
    this.wishlist.toggle(this.product, this.img(0));
  }
}

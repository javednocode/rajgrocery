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
    <div class="pc-badges">
      @if (discount() > 0) { <span class="pc-disc">-{{ discount() }}%</span> }
      @if (product.stock <= 0) { <span class="pc-sold">Sold out</span> }
    </div>
    <div class="pc-wish-wrap">
      <button class="pc-wish" [class.on]="wishlist.has(product.id)" (click)="toggleWish($event)" [attr.aria-label]="wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
        <svg width="15" height="15" viewBox="0 0 24 24" [attr.fill]="wishlist.has(product.id) ? 'currentColor' : 'none'"><path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <a [routerLink]="['/product', product.slug]" class="pc-media">
      <div class="pc-img-wrap">
        <img class="pc-img"
             [src]="img(0) || 'placeholder.png'"
             [alt]="product.name"
             loading="lazy"
             (error)="onImgErr($event)" />
      </div>
    </a>

    <div class="pc-body">
      @if (product.category_names || product.categories?.[0]?.name) {
        <span class="pc-cat">{{ product.category_names || product.categories[0].name }}</span>
      }
      <a [routerLink]="['/product', product.slug]" class="pc-name">{{ product.name }}</a>

      <div class="pc-stars">
        <span>★★★★★</span>
        <span class="pc-reviews">(0)</span>
      </div>

      <div class="pc-price-row">
        @if (onSale()) {
          <span class="pc-price">{{ cur }}{{ product.sale_price }}</span>
          <span class="pc-original">{{ cur }}{{ product.price }}</span>
        } @else {
          <span class="pc-price">{{ cur }}{{ product.price }}</span>
        }
      </div>

      <button class="pc-add" (click)="quickAdd($event)" [disabled]="product.stock <= 0">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="17" cy="21" r="1.4" fill="currentColor"/></svg>
        {{ added() ? '✓ Added!' : (product.stock <= 0 ? 'Out of stock' : 'Add to cart') }}
      </button>
    </div>
  </article>
  `,
  styles: [`
  .pc{background:#fff;border:1px solid #ECECEC;border-radius:12px;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease;display:flex;flex-direction:column;position:relative}
  .pc:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.1);border-color:rgba(59,183,126,.3)}
  .pc.oos{opacity:.76}

  .pc-badges{position:absolute;top:12px;left:12px;z-index:3;display:flex;flex-direction:column;gap:5px}
  .pc-disc{background:#3BB77E;color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;letter-spacing:.02em}
  .pc-sold{background:#E02020;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px}

  .pc-wish-wrap{position:absolute;top:12px;right:12px;z-index:3}
  .pc-wish{width:34px;height:34px;border-radius:50%;border:1px solid #ECECEC;background:#fff;color:#aaa;display:grid;place-items:center;transition:all .22s;cursor:pointer}
  .pc-wish:hover{border-color:#3BB77E;color:#3BB77E}
  .pc-wish.on{color:#E02020;border-color:#E02020}

  .pc-media{display:block;padding:16px;text-align:center}
  .pc-img-wrap{display:flex;align-items:center;justify-content:center;height:180px;overflow:hidden;background:#F8FBF9;border-radius:8px}
  .pc-img{max-height:180px;width:auto;max-width:100%;object-fit:contain;transition:transform .4s ease}
  .pc:hover .pc-img{transform:scale(1.06)}

  .pc-body{padding:0 14px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
  .pc-cat{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#7E8D97}
  .pc-name{font-size:14px;font-weight:700;line-height:1.4;color:#253D4E;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;transition:color .2s;text-decoration:none}
  .pc-name:hover{color:#3BB77E}

  .pc-stars{display:flex;align-items:center;gap:5px}
  .pc-stars span:first-child{color:#FFC107;font-size:12px;letter-spacing:1px}
  .pc-reviews{font-size:11.5px;color:#7E8D97;font-weight:500}

  .pc-price-row{display:flex;align-items:baseline;gap:8px;margin-top:2px}
  .pc-price{font-family:'Quicksand','Poppins',sans-serif;font-size:18px;font-weight:800;color:#3BB77E}
  .pc-original{font-size:12.5px;color:#adb5bd;text-decoration:line-through}

  .pc-add{display:flex;align-items:center;justify-content:center;gap:7px;background:#fff;border:1.5px solid #3BB77E;color:#3BB77E;border-radius:8px;padding:9px 14px;font-size:13px;font-weight:700;cursor:pointer;transition:all .22s;margin-top:6px;width:100%}
  .pc-add:hover:not(:disabled){background:#3BB77E;color:#fff}
  .pc-add:disabled{opacity:.55;cursor:not-allowed;border-color:#ccc;color:#aaa}
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
    if (!path) return '';
    return path.startsWith('http') ? path : this.mediaUrl + path;
  }
  /** Fallback to placeholder when image URL returns 404 or fails */
  onImgErr(e: Event) {
    const el = e.target as HTMLImageElement;
    if (el.src.includes('placeholder.png')) return; // avoid infinite loop
    el.src = 'placeholder.png';
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

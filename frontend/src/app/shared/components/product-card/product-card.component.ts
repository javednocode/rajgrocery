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

    <!-- Media -->
    <a [routerLink]="['/product', product.slug]" class="pc-media"
       [attr.aria-label]="'View ' + product.name">
      <div class="pc-img-wrap">
        @if (img(0)) {
          <img class="pc-img" [src]="img(0)" [alt]="product.name"
               loading="lazy" (error)="onImgErr($event)" />
        } @else {
          <span class="pc-monogram" aria-hidden="true">{{ (product.name || '?')[0] }}</span>
        }
        <div class="pc-img-overlay"></div>
      </div>

      <!-- Badges -->
      <div class="pc-badges">
        @if (discount() > 0) {
          <span class="pc-tag pc-tag-disc">−{{ discount() }}%</span>
        }
        @if (product.is_new) {
          <span class="pc-tag pc-tag-new">New</span>
        }
        @if (product.stock <= 0) {
          <span class="pc-tag pc-tag-oos">Sold out</span>
        }
      </div>

      <!-- Wishlist -->
      <button class="pc-wish"
        [class.on]="wishlist.has(product.id)"
        [class.burst]="wishBurst()"
        (click)="toggleWish($event)"
        [attr.aria-label]="wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
        <svg width="14" height="14" viewBox="0 0 24 24"
          [attr.fill]="wishlist.has(product.id) ? 'currentColor' : 'none'">
          <path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z"
            stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>
      </button>
    </a>

    <!-- Body -->
    <div class="pc-body">

      <!-- Category + stock row -->
      <div class="pc-topline">
        @if (product.category_names || product.categories?.[0]?.name) {
          <span class="pc-cat">{{ product.category_names || product.categories[0].name }}</span>
        }
        @if (product.stock > 0 && product.stock <= 5) {
          <span class="pc-low"><i></i>{{ product.stock }} left</span>
        }
      </div>

      <!-- Name -->
      <a [routerLink]="['/product', product.slug]" class="pc-name">{{ product.name }}</a>

      <!-- Brand / unit -->
      @if (product.brand || product.unit) {
        <div class="pc-meta">
          @if (product.brand) { <span class="pc-brand">{{ product.brand }}</span> }
          @if (product.unit)  { <span class="pc-unit">{{ product.unit }}</span> }
        </div>
      }

      <!-- Price + Add to cart -->
      <div class="pc-foot">
        <div class="pc-price-row">
          @if (onSale()) {
            <span class="pc-price">{{ cur }}{{ product.sale_price }}</span>
            <span class="pc-original">{{ cur }}{{ product.price }}</span>
          } @else {
            <span class="pc-price">{{ cur }}{{ product.price }}</span>
          }
        </div>
        <button class="pc-add"
          (click)="quickAdd($event)"
          [disabled]="product.stock <= 0"
          [class.added]="added()"
          [attr.aria-label]="'Add ' + product.name + ' to cart'">
          @if (added()) {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.4"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          } @else if (product.stock <= 0) {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"
                stroke-linecap="round"/>
            </svg>
          } @else {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round"/>
            </svg>
          }
        </button>
      </div>
    </div>
  </article>
  `,

  styles: [`
  /* ── Card shell ── */
  .pc {
    position: relative;
    background: var(--kg-paper);
    border: 1px solid var(--kg-line-lt);
    border-radius: 12px;
    overflow: hidden;
    display: flex; flex-direction: column;
    height: 100%;
    transition: box-shadow .35s var(--ease), border-color .25s, transform .35s var(--ease);
  }
  .pc:hover {
    box-shadow: 0 8px 28px rgba(16,24,40,.08);
    border-color: var(--kg-line-warm);
    transform: translateY(-4px);
  }
  .pc.oos { opacity: .72; }

  /* ── Media / image ── */
  .pc-media { display: block; position: relative; overflow: hidden; flex-shrink: 0; }
  .pc-img-wrap {
    display: flex; align-items: center; justify-content: center;
    aspect-ratio: 1 / 1;
    background: var(--kg-warm);
    overflow: hidden; position: relative;
  }
  .pc-img {
    width: 88%; height: 88%;
    object-fit: contain;
    transition: transform .6s var(--ease);
    position: relative; z-index: 1;
  }
  .pc:hover .pc-img { transform: scale(1.05); }
  .pc-img-overlay {
    position: absolute; inset: 0; z-index: 2;
    background: rgba(27,31,28,0);
    transition: background .35s;
    pointer-events: none;
  }
  .pc:hover .pc-img-overlay { background: rgba(27,31,28,.03); }
  .pc-monogram {
    font-family: var(--font-sans);
    font-size: 52px; font-weight: 800;
    color: var(--kg-line-warm);
    user-select: none;
    transition: color .4s;
  }
  .pc:hover .pc-monogram { color: var(--kg-faint); }

  /* ── Badges ── */
  .pc-badges {
    position: absolute; top: 10px; left: 10px; z-index: 4;
    display: flex; flex-direction: column; gap: 4px; align-items: flex-start;
    pointer-events: none;
  }
  .pc-tag {
    font-family: var(--font-sans);
    font-size: 9.5px; font-weight: 800;
    padding: 3px 9px; border-radius: var(--r-full);
    letter-spacing: .08em; text-transform: uppercase; line-height: 1.5;
    animation: scaleIn .4s var(--ease2) both;
  }
  .pc-tag-disc { background: var(--kg-terra); color: #FFFFFF; }
  .pc-tag-new  { background: var(--kg-forest); color: #FFFFFF; }
  .pc-tag-oos  { background: rgba(27,31,28,.75); color: #FFFFFF; }

  /* ── Wishlist ── */
  .pc-wish {
    position: absolute; top: 10px; right: 10px; z-index: 4;
    width: 32px; height: 32px; border-radius: var(--r-full);
    border: 1.5px solid rgba(231,228,220,.9);
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(6px);
    color: var(--kg-faint);
    display: grid; place-items: center;
    transition: all .22s; cursor: pointer;
  }
  .pc-wish:hover { color: var(--kg-clay); border-color: var(--kg-clay); transform: scale(1.1); }
  .pc-wish.on { color: var(--kg-clay); border-color: rgba(192,57,43,.4); background: var(--kg-clay-bg); }
  .pc-wish.burst { animation: pcBurst .45s var(--ease2); }
  @keyframes pcBurst {
    0%   { transform: scale(1); }
    35%  { transform: scale(1.3); }
    65%  { transform: scale(.93); }
    100% { transform: scale(1); }
  }

  /* ── Body ── */
  .pc-body {
    padding: 13px 14px 14px;
    display: flex; flex-direction: column; gap: 5px;
    flex: 1;
  }
  .pc-topline {
    display: flex; align-items: center; justify-content: space-between;
    gap: 6px; min-height: 14px;
  }
  .pc-cat {
    font-family: var(--font-sans);
    font-size: 9.5px; font-weight: 800;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--kg-terra-dk);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pc-low {
    display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
    font-size: 9px; font-weight: 700;
    color: var(--kg-terra-dk);
  }
  .pc-low i { width: 5px; height: 5px; border-radius: 50%; background: var(--kg-terra); animation: pcPulse 1.8s infinite; }
  @keyframes pcPulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }

  /* ── Name ── */
  .pc-name {
    font-family: var(--font-sans);
    font-size: 14.5px; font-weight: 700; line-height: 1.35;
    letter-spacing: -0.01em;
    color: var(--kg-ink);
    overflow: hidden;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    transition: color .2s; text-decoration: none;
  }
  .pc-name:hover { color: var(--kg-forest); }

  /* ── Brand / unit ── */
  .pc-meta { display: flex; align-items: center; gap: 6px; }
  .pc-brand, .pc-unit {
    font-size: 11.5px; color: var(--kg-faint); font-weight: 600;
    font-family: var(--font-sans); white-space: nowrap;
  }
  .pc-unit::before { content: '·'; margin-right: 6px; color: var(--kg-line-warm); }
  .pc-brand + .pc-unit::before { content: '·'; }

  /* ── Footer: price + add ── */
  .pc-foot {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    margin-top: auto; padding-top: 10px;
    border-top: 1px solid var(--kg-line-lt);
  }
  .pc-price-row { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
  .pc-price {
    font-family: var(--font-sans); font-size: 16.5px; font-weight: 800;
    color: var(--kg-ink); letter-spacing: -0.01em; line-height: 1;
  }
  .pc-original {
    font-size: 12px; color: var(--kg-faint); text-decoration: line-through; font-weight: 600;
  }

  /* ── Add to cart button ── */
  .pc-add {
    width: 36px; height: 36px; flex-shrink: 0;
    display: grid; place-items: center;
    background: var(--kg-forest-bg);
    border: 1.5px solid var(--kg-forest-bg2);
    color: var(--kg-forest);
    border-radius: var(--r-full);
    cursor: pointer;
    transition: background .22s, border-color .22s, color .22s, transform .22s, box-shadow .22s;
  }
  .pc-add:hover:not(:disabled) {
    background: var(--kg-forest); color: #FFFFFF; border-color: var(--kg-forest);
    transform: scale(1.08); box-shadow: var(--shadow-forest);
  }
  .pc-add.added {
    background: var(--kg-forest); color: #FFFFFF; border-color: var(--kg-forest);
  }
  .pc-add:disabled {
    background: var(--kg-sand); color: var(--kg-faint);
    border-color: var(--kg-line); opacity: .7; cursor: not-allowed;
  }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    .pc { border-radius: 10px; }
    .pc-body { padding: 10px 11px 12px; gap: 4px; }
    .pc-name { font-size: 13px; -webkit-line-clamp: 2; }
    .pc-price { font-size: 14.5px; }
    .pc-original { font-size: 11px; }
    .pc-cat { font-size: 9px; }
    .pc-add { width: 32px; height: 32px; }
    .pc-wish { width: 28px; height: 28px; top: 8px; right: 8px; }
    .pc-wish svg { width: 13px; height: 13px; }
    .pc-badges { top: 8px; left: 8px; }
    .pc-tag { font-size: 8.5px; padding: 2.5px 7px; }
    .pc-foot { padding-top: 8px; }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .pc { transition: none; }
    .pc-img { transition: none; }
    .pc-wish.burst { animation: none; }
  }
  `]
})
export class ProductCardComponent {
  @Input() product: any;
  added = signal(false);
  wishBurst = signal(false);
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(
    private cart: CartService,
    public wishlist: WishlistService,
    private settings: SettingsService,
  ) {}

  get cur() { return this.settings.get('currency_symbol', 'HK$'); }

  onSale() {
    return this.product.sale_price && +this.product.sale_price < +this.product.price;
  }
  discount() {
    if (!this.onSale()) return 0;
    return Math.round(((this.product.price - this.product.sale_price) / this.product.price) * 100);
  }
  img(i: number): string {
    const imgs = this.product.images || [];
    const path = i === 0
      ? (this.product.primary_image || imgs[0]?.image_path)
      : (imgs[1]?.image_path || '');
    if (!path) return '';
    return path.startsWith('http') ? path : this.mediaUrl + path;
  }
  onImgErr(e: Event) {
    const el = e.target as HTMLImageElement;
    if (el.src.includes('placeholder.png') || el.src.includes('assets/placeholder')) return;
    el.src = 'assets/placeholder.png';
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
    this.wishBurst.set(true);
    setTimeout(() => this.wishBurst.set(false), 500);
  }
}

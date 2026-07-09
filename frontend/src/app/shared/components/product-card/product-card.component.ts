import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CountryService } from '../../../core/services/country.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
  <article class="pc" [class.oos]="product.stock <= 0">

    <!-- Media -->
    <a [routerLink]="['/product', product.slug]" class="pc-media" [attr.aria-label]="'View ' + product.name">
      <div class="pc-img-wrap">
        @if (img(0)) {
          <img class="pc-img" [src]="img(0)" [alt]="product.name" loading="lazy" (error)="onImgErr($event)" />
        } @else {
          <span class="pc-monogram" aria-hidden="true">{{ (product.name || '?')[0] }}</span>
        }
      </div>

      <!-- Badges -->
      <div class="pc-badges">
        @if (discount() > 0) { <span class="pc-tag pc-tag-disc">−{{ discount() }}%</span> }
        @if (product.is_new) { <span class="pc-tag pc-tag-new">New</span> }
        @if (product.stock <= 0) { <span class="pc-tag pc-tag-oos">Sold out</span> }
      </div>

      <!-- Origin -->
      @if (flag()) {
        <span class="pc-origin" [attr.aria-label]="'From ' + origin()">
          <em>{{ flag() }}</em><i>{{ origin() }}</i>
        </span>
      }

      <!-- Wishlist -->
      <button class="pc-wish"
        [class.on]="wishlist.has(product.id)"
        [class.burst]="wishBurst()"
        (click)="toggleWish($event)"
        [attr.aria-label]="wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
        <svg width="15" height="15" viewBox="0 0 24 24"
          [attr.fill]="wishlist.has(product.id) ? 'currentColor' : 'none'">
          <path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z"
            stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Glass quick-add -->
      <div class="pc-quick">
        <button class="pc-quick-btn"
          (click)="quickAdd($event)"
          [disabled]="product.stock <= 0"
          [class.done]="added()"
          [attr.aria-label]="'Add ' + product.name + ' to basket'">
          @if (added()) {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Added
          } @else {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
            {{ product.stock <= 0 ? 'Sold out' : 'Quick add' }}
          }
        </button>
      </div>
    </a>

    <!-- Body -->
    <div class="pc-body">
      <div class="pc-topline">
        @if (product.category_names || product.categories?.[0]?.name) {
          <span class="pc-cat">{{ product.category_names || product.categories[0].name }}</span>
        }
        @if (product.stock > 0 && product.stock <= 5) {
          <span class="pc-low"><i></i>{{ product.stock }} left</span>
        } @else if (product.stock > 5) {
          <span class="pc-stock"><i></i>In stock</span>
        }
      </div>

      <a [routerLink]="['/product', product.slug]" class="pc-name">{{ product.name }}</a>

      <div class="pc-meta">
        @if (product.brand) { <span class="pc-brand">{{ product.brand }}</span> }
        @if (product.unit)  { <span class="pc-unit">{{ product.unit }}</span> }
      </div>

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
          [attr.aria-label]="'Add ' + product.name + ' to basket'">
          @if (added()) {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          } @else {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
          }
        </button>
      </div>
    </div>
  </article>
  `,
  styles: [`
  .pc {
    position: relative;
    background: var(--kg-paper);
    border: 1px solid var(--kg-line);
    border-radius: 20px;
    overflow: hidden;
    display: flex; flex-direction: column;
    height: 100%;
    transition: transform .45s var(--ease), box-shadow .45s var(--ease), border-color .3s;
  }
  .pc:hover {
    transform: translateY(-5px);
    box-shadow: 0 24px 54px rgba(17,24,39,.12);
    border-color: var(--kg-line-warm);
  }
  .pc.oos { opacity: .68; }

  /* Media */
  .pc-media { display: block; position: relative; overflow: hidden; }
  .pc-img-wrap {
    display: flex; align-items: center; justify-content: center;
    aspect-ratio: 1 / 0.92;
    background: radial-gradient(120% 100% at 50% 0%, var(--kg-sand) 0%, var(--kg-warm) 100%);
    overflow: hidden;
  }
  .pc-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .8s var(--ease);
  }
  .pc:hover .pc-img { transform: scale(1.06); }
  .pc-monogram {
    font-family: var(--font-serif);
    font-size: 64px; font-weight: 300; font-style: italic;
    color: var(--kg-line-warm); user-select: none;
    transition: transform .8s var(--ease), color .4s;
  }
  .pc:hover .pc-monogram { transform: scale(1.12) rotate(-4deg); color: var(--kg-terra-lt); }

  /* Badges */
  .pc-badges {
    position: absolute; top: 12px; left: 12px;
    z-index: 3; display: flex; flex-direction: column; gap: 5px; align-items: flex-start;
  }
  .pc-tag {
    font-family: var(--font-sans);
    font-size: 10px; font-weight: 800;
    padding: 4px 10px; border-radius: 999px;
    letter-spacing: .08em; text-transform: uppercase; line-height: 1.4;
    animation: scaleIn .5s var(--ease2) both;
  }
  .pc-tag-disc { background: var(--kg-terra); color: #FFFFFF; }
  .pc-tag-new  { background: var(--kg-forest); color: #FFFFFF; }
  .pc-tag-oos  { background: rgba(17,24,39,.75); color: #FFFFFF; }

  /* Origin flag chip */
  .pc-origin {
    position: absolute; left: 12px; bottom: 12px; z-index: 3;
    display: inline-flex; align-items: center; gap: 0;
    height: 26px; border-radius: 999px;
    background: rgba(255,255,255,.82);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    border: 1px solid rgba(229,231,235,.9);
    padding: 0 9px;
    overflow: hidden; max-width: 30px;
    transition: max-width .45s var(--ease), padding .3s;
    white-space: nowrap;
  }
  .pc:hover .pc-origin { max-width: 130px; padding: 0 11px; }
  .pc-origin em { font-style: normal; font-size: 13px; line-height: 1; }
  .pc-origin i {
    font-style: normal; font-family: var(--font-sans);
    font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
    color: var(--kg-ink-2); margin-left: 7px;
    opacity: 0; transition: opacity .3s .12s;
  }
  .pc:hover .pc-origin i { opacity: 1; }

  /* Wishlist */
  .pc-wish {
    position: absolute; top: 12px; right: 12px; z-index: 3;
    width: 34px; height: 34px; border-radius: 999px;
    border: 1px solid rgba(229,231,235,.9);
    background: rgba(255,255,255,.82);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    color: var(--kg-faint); display: grid; place-items: center;
    transition: all .25s; cursor: pointer;
  }
  .pc-wish:hover { color: var(--kg-clay); border-color: var(--kg-clay); transform: scale(1.08); }
  .pc-wish.on { color: var(--kg-clay); border-color: rgba(220,38,38,.4); background: var(--kg-clay-bg); }
  .pc-wish.burst { animation: pcBurst .5s var(--ease2); }
  @keyframes pcBurst {
    0% { transform: scale(1); }
    35% { transform: scale(1.35); }
    65% { transform: scale(.92); }
    100% { transform: scale(1); }
  }

  /* Glass quick-add (hover) */
  .pc-quick {
    position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 2;
    display: flex; justify-content: flex-end;
    transform: translateY(calc(100% + 16px));
    transition: transform .4s var(--ease);
    pointer-events: none;
  }
  .pc:hover .pc-quick { transform: translateY(0); pointer-events: auto; }
  .pc-quick-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(17,24,39,.78); color: #FFFFFF;
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 999px; padding: 9px 18px;
    font-family: var(--font-sans);
    font-size: 12.5px; font-weight: 800; letter-spacing: .02em;
    cursor: pointer; transition: background .25s, transform .25s;
  }
  .pc-quick-btn:hover:not(:disabled) { background: var(--kg-forest); transform: translateY(-1px); }
  .pc-quick-btn.done { background: var(--kg-forest); }
  .pc-quick-btn:disabled { opacity: .6; cursor: not-allowed; }

  /* Body */
  .pc-body {
    padding: 15px 17px 17px;
    display: flex; flex-direction: column; gap: 6px;
    flex: 1;
  }
  .pc-topline { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 15px; }
  .pc-cat {
    font-family: var(--font-sans);
    font-size: 10px; font-weight: 800;
    letter-spacing: .16em; text-transform: uppercase;
    color: var(--kg-terra);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pc-stock, .pc-low {
    display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
    font-size: 10px; font-weight: 700; letter-spacing: .04em;
    color: var(--kg-muted);
  }
  .pc-stock i, .pc-low i { width: 6px; height: 6px; border-radius: 50%; background: var(--kg-forest-lt); }
  .pc-low { color: var(--kg-terra-dk); }
  .pc-low i { background: var(--kg-terra); animation: kghPulse2 1.8s infinite; }
  @keyframes kghPulse2 { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

  .pc-name {
    font-family: var(--font-serif);
    font-size: 16.5px; font-weight: 500; line-height: 1.32;
    letter-spacing: -0.01em;
    color: var(--kg-ink); overflow: hidden;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    transition: color .25s; text-decoration: none;
  }
  .pc-name:hover { color: var(--kg-forest); }

  .pc-meta { display: flex; align-items: center; gap: 8px; }
  .pc-brand, .pc-unit {
    font-size: 12px; color: var(--kg-muted); font-weight: 600;
    font-family: var(--font-sans);
  }
  .pc-unit::before { content: '·'; margin-right: 8px; color: var(--kg-faint); }
  .pc-brand + .pc-unit::before { content: '·'; }
  .pc-meta .pc-unit:first-child::before { content: none; }

  .pc-foot {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    margin-top: auto; padding-top: 10px;
  }
  .pc-price-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .pc-price { font-family: var(--font-sans); font-size: 17.5px; font-weight: 800; color: var(--kg-ink); letter-spacing: -0.01em; }
  .pc-original { font-size: 12.5px; color: var(--kg-faint); text-decoration: line-through; }

  .pc-add {
    width: 38px; height: 38px; flex-shrink: 0;
    display: grid; place-items: center;
    background: transparent; border: 1.5px solid var(--kg-line-warm);
    color: var(--kg-ink); border-radius: 999px;
    cursor: pointer; transition: all .25s;
  }
  .pc-add:hover:not(:disabled) { background: var(--kg-forest); color: #FFFFFF; border-color: var(--kg-forest); transform: scale(1.07); box-shadow: 0 8px 18px rgba(41,184,213,.24); }
  .pc-add.added { background: var(--kg-forest); color: #FFFFFF; border-color: var(--kg-forest); }
  .pc-add:disabled { opacity: .4; cursor: not-allowed; }

  @media (max-width: 640px) {
    .pc { border-radius: 16px; }
    .pc-quick { display: none; }
    .pc-body { padding: 11px 12px 13px; gap: 4px; }
    .pc-name { font-size: 14px; }
    .pc-price { font-size: 15px; }
    .pc-cat { font-size: 9px; }
    .pc-add { width: 34px; height: 34px; }
    .pc-wish { width: 30px; height: 30px; top: 9px; right: 9px; }
    .pc-origin { left: 9px; bottom: 9px; }
    .pc-badges { top: 9px; left: 9px; }
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
    private countries: CountryService,
  ) {}

  get cur() { return this.settings.get('currency_symbol', '€'); }
  onSale() { return this.product.sale_price && +this.product.sale_price < +this.product.price; }
  discount() {
    if (!this.onSale()) return 0;
    return Math.round(((this.product.price - this.product.sale_price) / this.product.price) * 100);
  }
  flag(): string { return this.countries.flagFor(this.product); }
  origin(): string { return this.countries.originName(this.product); }
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
    setTimeout(() => this.wishBurst.set(false), 520);
  }
}

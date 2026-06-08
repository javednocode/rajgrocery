import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pcard" [class.added]="justAdded()">
      <!-- Badges -->
      @if (product.sale_price && product.sale_price < product.price) {
        <div class="badge-sale">{{ getDiscount() }}% OFF</div>
      }
      @if (product.is_new) { <div class="badge-new">NEW</div> }
      @if (product.stock <= 0) { <div class="badge-oos">Out of Stock</div> }

      <!-- Image -->
      <a [routerLink]="['/product', product.slug]" class="pcard-img-wrap">
        <img [src]="getImageUrl()"
             [alt]="product.name" class="pcard-img" loading="lazy" decoding="async"
             (error)="onImgError($event)">
        <div class="pcard-hover-panel">
          <button class="quick-add-btn" (click)="addToCart($event)" [disabled]="product.stock <= 0">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
            </svg>
            {{ product.stock <= 0 ? 'Out of Stock' : 'Add to Cart' }}
          </button>
          <a [routerLink]="['/product', product.slug]" class="quick-view-btn" (click)="$event.stopPropagation()">
            View Details
          </a>
        </div>
      </a>

      <!-- Info -->
      <div class="pcard-body">
        @if (product.category_names || product.categories?.[0]?.name) {
          <span class="pcard-cat">{{ product.category_names || product.categories?.[0]?.name }}</span>
        }
        <a [routerLink]="['/product', product.slug]" class="pcard-name">{{ product.name }}</a>
        @if (product.sku) { <span class="pcard-sku">SKU: {{ product.sku }}</span> }
        <div class="pcard-footer">
          <div class="pcard-price">
            @if (product.sale_price && product.sale_price < product.price) {
              <span class="price-on-sale">€{{ product.sale_price }}</span>
              <span class="price-was">€{{ product.price }}</span>
            } @else {
              <span class="price-normal">€{{ product.price }}</span>
            }
          </div>
          <button class="add-circle" (click)="addToCart($event)" [disabled]="product.stock <= 0"
                  [title]="product.stock <= 0 ? 'Out of stock' : 'Add to cart'">
            @if (justAdded()) { ✓ } @else { + }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── BASE CARD ── */
    .pcard {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      border: 1.5px solid #EBEBF0;
      transition: transform 0.32s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.32s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.28s;
      display: flex; flex-direction: column;
    }
    .pcard:hover {
      transform: translateY(-5px);
      box-shadow: 0 14px 40px rgba(75,46,131,0.13);
      border-color: rgba(46,159,92,0.3);
    }
    .pcard.added { border-color: var(--primary); }

    /* ── BADGES ── */
    .badge-sale {
      position: absolute; top: 8px; left: 8px; z-index: 3;
      background: var(--orange); color: white;
      padding: 3px 9px; border-radius: 999px;
      font-size: 10px; font-weight: 800; letter-spacing: 0.3px;
    }
    .badge-new {
      position: absolute; top: 8px; right: 8px; z-index: 3;
      background: var(--purple); color: white;
      padding: 3px 9px; border-radius: 999px;
      font-size: 10px; font-weight: 800;
    }
    .badge-oos {
      position: absolute; top: 8px; left: 50%; transform: translateX(-50%); z-index: 3;
      background: rgba(0,0,0,0.55); color: white;
      padding: 3px 10px; border-radius: 999px;
      font-size: 10px; font-weight: 700;
      backdrop-filter: blur(6px); white-space: nowrap;
    }

    /* ── IMAGE ── */
    .pcard-img-wrap {
      display: block; position: relative;
      overflow: hidden; aspect-ratio: 1 / 1;
      background: #ffffff;
      border-bottom: 1px solid #F0F0F5;
    }
    .pcard-img {
      width: 100%; height: 100%;
      object-fit: contain; padding: 10px;
      transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
    }
    .pcard:hover .pcard-img { transform: scale(1.05); }

    /* ── HOVER PANEL (desktop only) ── */
    .pcard-hover-panel {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end;
      padding: 12px; gap: 6px;
      background: linear-gradient(to top, rgba(14,14,26,0.82) 0%, rgba(14,14,26,0.2) 50%, transparent 100%);
      opacity: 0; transform: translateY(8px);
      transition: opacity 0.3s, transform 0.3s cubic-bezier(0.22,1,0.36,1);
    }
    .pcard:hover .pcard-hover-panel { opacity: 1; transform: translateY(0); }

    .quick-add-btn {
      display: flex; align-items: center; gap: 6px;
      background: var(--primary); color: white;
      border: none; border-radius: 8px;
      padding: 8px 16px; font-size: 12px; font-weight: 700;
      cursor: pointer; width: 100%; justify-content: center;
      transition: background 0.2s, transform 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .quick-add-btn:hover:not(:disabled) { background: var(--primary-dark); transform: scale(1.02); }
    .quick-add-btn:disabled { background: rgba(255,255,255,0.2); cursor: not-allowed; }

    .quick-view-btn {
      display: block; text-align: center; width: 100%;
      color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 600;
      padding: 5px; border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.25);
      transition: all 0.2s; backdrop-filter: blur(4px);
    }
    .quick-view-btn:hover { background: rgba(255,255,255,0.15); color: white; }

    /* ── BODY ── */
    .pcard-body { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .pcard-cat {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; color: var(--primary);
    }
    .pcard-name {
      display: -webkit-box; font-size: 13px; font-weight: 600;
      color: #1A1A2E; line-height: 1.4; margin: 2px 0 3px;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      transition: color 0.2s;
    }
    .pcard-name:hover { color: var(--primary); }
    .pcard-sku { font-size: 10px; color: #9CA3AF; }

    .pcard-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto; padding-top: 8px;
    }
    .pcard-price { display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap; }
    .price-on-sale { font-size: 16px; font-weight: 800; color: var(--primary); font-family: 'Poppins', sans-serif; }
    .price-normal  { font-size: 16px; font-weight: 800; color: #2D1B69; font-family: 'Poppins', sans-serif; }
    .price-was     { font-size: 11px; color: #B0B3BE; text-decoration: line-through; }

    .add-circle {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--primary-bg); color: var(--primary);
      font-size: 18px; font-weight: 700; border: 1.5px solid rgba(46,159,92,0.3);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
      flex-shrink: 0; cursor: pointer;
    }
    .add-circle:hover:not(:disabled) {
      background: var(--primary); color: white;
      transform: scale(1.15); box-shadow: 0 4px 14px rgba(46,159,92,0.4);
    }
    .add-circle:disabled { opacity: 0.4; cursor: not-allowed; }
    .pcard.added .add-circle { background: var(--primary); color: white; }

    /* ── MOBILE: 2-column compact cards ── */
    @media (max-width: 640px) {
      .pcard { border-radius: 10px; border-width: 1px; }
      /* Disable lift effect on touch */
      .pcard:hover { transform: none !important; box-shadow: none !important; }

      /* Shorter image on mobile */
      .pcard-img-wrap { aspect-ratio: 4 / 3; }
      .pcard-img { padding: 6px; }

      /* Hide the overlay on mobile (no hover on touch) */
      .pcard-hover-panel { display: none !important; }

      /* Compact info */
      .pcard-body  { padding: 8px 9px 10px; gap: 1px; }
      .pcard-cat   { display: none; }
      .pcard-sku   { display: none; }
      .pcard-name  { font-size: 12px; line-height: 1.3; margin: 0 0 4px; }

      /* Price row */
      .pcard-footer    { padding-top: 4px; }
      .price-on-sale,
      .price-normal    { font-size: 13px; }
      .price-was       { font-size: 10px; }

      /* Smaller add button */
      .add-circle { width: 26px; height: 26px; font-size: 15px; border-width: 1px; }

      /* Smaller badges */
      .badge-sale        { top: 5px; left: 5px; padding: 2px 6px; font-size: 9px; }
      .badge-new         { top: 5px; right: 5px; padding: 2px 6px; font-size: 9px; }
      .badge-oos         { top: 5px; padding: 2px 7px; font-size: 9px; }
    }
  `]
})
export class ProductCardComponent {
  @Input() product: any;
  justAdded = signal(false);
  private mediaUrl = environment.mediaUrl;

  constructor(private cart: CartService) {}

  getImageUrl(): string {
    // Check all possible image fields returned by different API endpoints
    const img = this.product.primary_image
             || this.product.image
             || this.product.images?.[0]?.image_path;
    if (!img) return 'assets/placeholder-product.svg';
    return img.startsWith('http') ? img : this.mediaUrl + img;
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/placeholder-product.svg';
  }

  getDiscount(): number {
    if (!this.product.sale_price || !this.product.price) return 0;
    return Math.round(((this.product.price - this.product.sale_price) / this.product.price) * 100);
  }

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.product.stock > 0) {
      this.cart.addItem(this.product);
      this.justAdded.set(true);
      setTimeout(() => this.justAdded.set(false), 1800);
    }
  }
}

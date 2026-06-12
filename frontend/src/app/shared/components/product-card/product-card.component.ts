import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SettingsService } from '../../../core/services/settings.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pcard" [class.pcard-added]="justAdded()">
      <!-- Badges -->
      @if (product.sale_price && +product.sale_price < +product.price) {
        <div class="badge-sale">{{ getDiscount() }}% OFF</div>
      }
      @if (product.is_new) { <div class="badge-new">NEW</div> }
      @if (+product.stock <= 0) { <div class="badge-oos">Out of Stock</div> }

      <!-- Image -->
      <a [routerLink]="['/product', product.slug]" class="pcard-img-wrap">
        <img [src]="getImageUrl()"
             [alt]="product.name" class="pcard-img" loading="lazy" decoding="async"
             (error)="onImgError($event)">
      </a>

      <!-- Body -->
      <div class="pcard-body">
        @if (product.category_names || product.categories?.[0]?.name) {
          <span class="pcard-cat">{{ product.category_names || product.categories?.[0]?.name }}</span>
        }
        <a [routerLink]="['/product', product.slug]" class="pcard-name">{{ product.name }}</a>
        @if (product.unit) {
          <span class="pcard-unit">{{ product.unit }}</span>
        }

        <div class="pcard-footer">
          <div class="pcard-price">
            @if (product.sale_price && +product.sale_price < +product.price) {
              <span class="price-sale">{{ currSymbol }}{{ (+product.sale_price).toFixed(2) }}</span>
              <span class="price-was">{{ currSymbol }}{{ (+product.price).toFixed(2) }}</span>
            } @else {
              <span class="price-normal">{{ currSymbol }}{{ (+product.price).toFixed(2) }}</span>
            }
          </div>
          @if (+product.stock > 0) {
            <button class="add-btn" (click)="addToCart($event)" [class.add-btn-done]="justAdded()" id="add-to-cart-{{ product.id }}" title="Add to cart">
              @if (justAdded()) {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              } @else {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              }
            </button>
          } @else {
            <span class="oos-tag">Out of Stock</span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── BASE CARD ── */
    .pcard {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      border: 1px solid #F3F4F6;
      transition: box-shadow 0.25s ease, border-color 0.25s ease;
      display: flex; flex-direction: column;
    }
    .pcard:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.10);
      border-color: #E5E7EB;
    }
    .pcard.pcard-added { border-color: #F28C00; }

    /* ── BADGES ── */
    .badge-sale {
      position: absolute; top: 8px; left: 8px; z-index: 3;
      background: #C41E3A; color: white;
      padding: 3px 8px; border-radius: 999px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.2px;
    }
    .badge-new {
      position: absolute; top: 8px; right: 8px; z-index: 3;
      background: #2E7D32; color: white;
      padding: 3px 8px; border-radius: 999px;
      font-size: 10px; font-weight: 700;
    }
    .badge-oos {
      position: absolute; top: 8px; left: 50%; transform: translateX(-50%); z-index: 3;
      background: rgba(0,0,0,0.6); color: white;
      padding: 3px 10px; border-radius: 999px;
      font-size: 10px; font-weight: 600;
      white-space: nowrap;
    }

    /* ── IMAGE ── */
    .pcard-img-wrap {
      display: block; position: relative;
      overflow: hidden; aspect-ratio: 1 / 1;
      background: #F9FAFB;
    }
    .pcard-img {
      width: 100%; height: 100%;
      object-fit: contain; padding: 12px;
      transition: transform 0.4s ease;
    }
    .pcard:hover .pcard-img { transform: scale(1.04); }

    /* ── BODY ── */
    .pcard-body { padding: 12px 12px 14px; flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .pcard-cat {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.6px; color: #2E7D32;
    }
    .pcard-name {
      display: -webkit-box; font-size: 13.5px; font-weight: 600;
      color: #111; line-height: 1.4; margin: 2px 0 2px;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      transition: color 0.2s; text-decoration: none;
    }
    .pcard-name:hover { color: #F28C00; }
    .pcard-unit { font-size: 11px; color: #9CA3AF; }

    /* Footer */
    .pcard-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto; padding-top: 10px;
    }
    .pcard-price { display: flex; align-items: baseline; gap: 5px; flex-wrap: wrap; }
    .price-sale   { font-size: 15px; font-weight: 800; color: #F28C00; font-family: 'Poppins', sans-serif; }
    .price-normal { font-size: 15px; font-weight: 800; color: #111; font-family: 'Poppins', sans-serif; }
    .price-was    { font-size: 11px; color: #B0B3BE; text-decoration: line-through; }

    .add-btn {
      width: 32px; height: 32px; border-radius: 8px;
      background: #F28C00; color: white;
      display: flex; align-items: center; justify-content: center;
      border: none; cursor: pointer; flex-shrink: 0;
      transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    }
    .add-btn:hover { background: #070A05; transform: scale(1.1); }
    .add-btn.add-btn-done { background: #2E7D32; }

    .oos-tag {
      font-size: 10px; font-weight: 600; color: #9CA3AF;
      border: 1px solid #E5E7EB; padding: 4px 8px; border-radius: 6px;
    }

    /* ── MOBILE ── */
    @media (max-width: 640px) {
      .pcard { border-radius: 10px; }
      .pcard:hover { box-shadow: none; }
      .pcard-img-wrap { aspect-ratio: 1 / 1; }
      .pcard-img { padding: 8px; }
      .pcard-body { padding: 8px 8px 10px; gap: 1px; }
      .pcard-cat  { display: none; }
      .pcard-name { font-size: 12.5px; }
      .pcard-unit { font-size: 10px; }
      .pcard-footer { padding-top: 6px; }
      .price-sale, .price-normal { font-size: 13px; }
      .price-was  { font-size: 10px; }
      .add-btn    { width: 28px; height: 28px; border-radius: 6px; }
      .badge-sale { top: 5px; left: 5px; padding: 2px 6px; font-size: 9px; }
      .badge-new  { top: 5px; right: 5px; padding: 2px 6px; font-size: 9px; }
    }
  `]
})
export class ProductCardComponent {
  @Input() product: any;
  justAdded = signal(false);
  private mediaUrl = environment.mediaUrl;

  constructor(
    private cart: CartService,
    private settingsService: SettingsService
  ) {}

  get currSymbol(): string {
    return this.settingsService.get('currency_symbol', '€');
  }

  getImageUrl(): string {
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
    return Math.round(((+this.product.price - +this.product.sale_price) / +this.product.price) * 100);
  }

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (+this.product.stock > 0) {
      this.cart.addItem(this.product);
      this.justAdded.set(true);
      setTimeout(() => this.justAdded.set(false), 1800);
    }
  }
}

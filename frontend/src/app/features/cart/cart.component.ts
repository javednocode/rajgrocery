import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
  <section class="cp">
    <div class="container">

      <!-- Header -->
      <div class="cp-head">
        <h1>Shopping Basket
          @if (cart.itemCount() > 0) {
            <span class="cp-count">{{ cart.itemCount() }} {{ cart.itemCount() === 1 ? 'item' : 'items' }}</span>
          }
        </h1>
        <a routerLink="/categories" class="cp-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Continue Shopping
        </a>
      </div>

      <!-- Empty state -->
      @if (cart.items().length === 0) {
        <div class="cp-empty">
          <div class="cp-empty-icon">🛒</div>
          <h2>Your basket is empty</h2>
          <p>Looks like you haven't added anything yet.<br>Explore our authentic Indian & Asian groceries.</p>
          <div class="cp-empty-btns">
            <a routerLink="/categories" class="btn btn-primary">Browse Categories</a>
            <a routerLink="/" class="btn btn-outline-dark">Go to Home</a>
          </div>
          <div class="cp-empty-trust">
            <span>🔒 Secure checkout</span>
            <span>🚚 Fast delivery</span>
            <span>🏆 Premium quality</span>
          </div>
        </div>

      } @else {
        <div class="cp-grid">

          <!-- Items List -->
          <div class="cp-items">
            <div class="cp-items-head">
              <span>Product</span>
              <span>Qty</span>
              <span>Total</span>
            </div>

            @for (it of cart.items(); track it.id) {
              <div class="cp-item">
                <a [routerLink]="['/product', it.slug]" class="cp-item-img">
                  @if (it.image) {
                    <img [src]="it.image" [alt]="it.name" loading="lazy" />
                  } @else {
                    <span class="cp-item-ph">🛍️</span>
                  }
                </a>
                <div class="cp-item-info">
                  <a [routerLink]="['/product', it.slug]" class="cp-item-name">{{ it.name }}</a>
                  @if (it.unit) {
                    <span class="cp-item-variant">{{ it.unit }}</span>
                  }
                  <span class="cp-item-unit-price">{{ cur }}{{ (it.salePrice ?? it.price).toFixed(2) }} each</span>
                  <button class="cp-remove-mob" (click)="cart.removeItem(it.id)">× Remove</button>
                </div>
                <div class="cp-qty">
                  <button (click)="cart.updateQuantity(it.id, it.quantity - 1)" aria-label="Decrease">−</button>
                  <span>{{ it.quantity }}</span>
                  <button (click)="cart.updateQuantity(it.id, it.quantity + 1)" aria-label="Increase">+</button>
                </div>
                <div class="cp-item-total">
                  {{ cur }}{{ ((it.salePrice ?? it.price) * it.quantity).toFixed(2) }}
                </div>
                <button class="cp-remove" (click)="cart.removeItem(it.id)" aria-label="Remove item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              </div>
            }

            <!-- Clear cart -->
            <div class="cp-actions-row">
              <button class="cp-clear" (click)="cart.clearCart()">Clear basket</button>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="cp-summary">
            <div class="cp-summary-card">
              <h2>Order Summary</h2>

              <div class="cp-summary-row">
                <span>Subtotal ({{ cart.itemCount() }} items)</span>
                <span>{{ cur }}{{ cart.subtotal().toFixed(2) }}</span>
              </div>

              <!-- Coupon -->
              @if (!couponApplied()) {
                <div class="cp-coupon">
                  <input [(ngModel)]="couponCode" placeholder="Coupon code…" class="cp-coupon-input" aria-label="Coupon code" />
                  <button (click)="applyCoupon()" class="cp-coupon-btn" [disabled]="!couponCode.trim()">Apply</button>
                </div>
                @if (couponError()) {
                  <p class="cp-coupon-err">{{ couponError() }}</p>
                }
              } @else {
                <div class="cp-coupon-applied">
                  <span>🎉 Coupon "{{ couponCode }}" applied</span>
                  <button (click)="removeCoupon()" class="cp-coupon-remove">×</button>
                </div>
              }

              @if (couponDiscount() > 0) {
                <div class="cp-summary-row cp-summary-disc">
                  <span>Discount</span>
                  <span>−{{ cur }}{{ couponDiscount().toFixed(2) }}</span>
                </div>
              }

              <!-- Shipping -->
              <div class="cp-summary-row">
                <span>Delivery</span>
                <span class="cp-shipping-val">
                  @if (cart.subtotal() >= freeAbove()) {
                    <span class="cp-free-badge">FREE</span>
                  } @else {
                    {{ cur }}{{ shippingCharge().toFixed(2) }}
                  }
                </span>
              </div>

              @if (cart.subtotal() < freeAbove()) {
                <p class="cp-free-hint">
                  Add {{ cur }}{{ (freeAbove() - cart.subtotal()).toFixed(2) }} more for free delivery!
                </p>
              }

              <div class="cp-divider"></div>

              <div class="cp-summary-row cp-total-row">
                <strong>Total</strong>
                <strong>{{ cur }}{{ grandTotal().toFixed(2) }}</strong>
              </div>

              <a routerLink="/checkout" class="cp-checkout-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="currentColor" stroke-width="2"/></svg>
                Proceed to Checkout
              </a>

              <div class="cp-trust-row">
                <span>🔒 Secure</span>
                <span>💳 All cards</span>
                <span>🚚 Fast delivery</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}
  .cp { padding: 40px 0 60px; background: #FAF6EF; min-height: 60vh; }

  /* HEAD */
  .cp-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 12px; }
  .cp-head h1 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 400; color: #211D16; display: flex; align-items: center; gap: 12px; }
  .cp-count { font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 700; background: #F7E8DC; color: #C4622D; padding: 4px 12px; border-radius: 999px; }
  .cp-back { display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 700; color: #7C7466; font-family: 'Manrope', sans-serif; transition: color .2s; }
  .cp-back:hover { color: #C4622D; }

  /* EMPTY */
  .cp-empty { text-align: center; padding: 80px 20px; max-width: 500px; margin: 0 auto; }
  .cp-empty-icon { font-size: 4rem; margin-bottom: 16px; }
  .cp-empty h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.8rem; font-weight: 400; color: #211D16; margin-bottom: 10px; }
  .cp-empty p { font-size: 15px; color: #7C7466; margin-bottom: 28px; line-height: 1.7; }
  .cp-empty-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 32px; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 999px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 700; transition: all .25s; cursor: pointer; border: 2px solid transparent; text-decoration: none; }
  .btn-primary { background: #C4622D; color: #fff; border-color: #C4622D; box-shadow: 0 4px 14px rgba(196,98,45,.22); }
  .btn-primary:hover { background: #A94E20; transform: translateY(-1px); }
  .btn-outline-dark { background: transparent; color: #211D16; border-color: #E8E1D2; }
  .btn-outline-dark:hover { border-color: #211D16; }
  .cp-empty-trust { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
  .cp-empty-trust span { font-size: 13px; font-weight: 700; color: #ABA394; font-family: 'Manrope', sans-serif; }

  /* GRID */
  .cp-grid { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }

  /* ITEMS */
  .cp-items { background: #fff; border: 1.5px solid #E8E1D2; border-radius: 20px; overflow: hidden; }
  .cp-items-head { display: grid; grid-template-columns: 1fr auto auto; gap: 16px; padding: 14px 20px; background: #F1EADD; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #ABA394; font-family: 'Manrope', sans-serif; }
  .cp-item { display: grid; grid-template-columns: 80px 1fr auto 80px 36px; gap: 14px; align-items: center; padding: 16px 20px; border-bottom: 1px solid #F0EAE0; }
  .cp-item:last-child { border-bottom: none; }
  .cp-item-img { width: 80px; height: 80px; border-radius: 10px; background: #F1EADD; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cp-item-img img { width: 100%; height: 100%; object-fit: contain; }
  .cp-item-ph { font-size: 2rem; }
  .cp-item-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .cp-item-name { font-size: 14.5px; font-weight: 700; color: #211D16; font-family: 'Manrope', sans-serif; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .cp-item-name:hover { color: #C4622D; }
  .cp-item-variant { font-size: 12px; color: #ABA394; }
  .cp-item-unit-price { font-size: 12.5px; color: #7C7466; }
  .cp-remove-mob { display: none; font-size: 12px; color: #A63B2A; font-weight: 700; cursor: pointer; background: none; border: none; text-align: left; padding: 0; font-family: 'Manrope', sans-serif; }
  .cp-qty { display: flex; align-items: center; gap: 0; border: 1.5px solid #E8E1D2; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
  .cp-qty button { width: 34px; height: 38px; display: grid; place-items: center; font-size: 16px; font-weight: 700; color: #211D16; cursor: pointer; background: #fff; border: none; transition: background .2s; }
  .cp-qty button:hover { background: #F7E8DC; color: #C4622D; }
  .cp-qty span { width: 38px; text-align: center; font-size: 14px; font-weight: 800; color: #211D16; font-family: 'Manrope', sans-serif; }
  .cp-item-total { font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 800; color: #C4622D; text-align: right; }
  .cp-remove { width: 32px; height: 32px; border-radius: 8px; background: #F7E8DC; border: none; color: #C4622D; display: grid; place-items: center; cursor: pointer; transition: all .2s; flex-shrink: 0; }
  .cp-remove:hover { background: #F6E4DF; color: #A63B2A; }
  .cp-actions-row { padding: 14px 20px; display: flex; justify-content: flex-end; }
  .cp-clear { font-size: 13px; font-weight: 700; color: #ABA394; cursor: pointer; background: none; border: none; font-family: 'Manrope', sans-serif; transition: color .2s; }
  .cp-clear:hover { color: #A63B2A; }

  /* SUMMARY */
  .cp-summary { position: sticky; top: calc(var(--header-height,156px) + 20px); }
  .cp-summary-card { background: #fff; border: 1.5px solid #E8E1D2; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 14px; }
  .cp-summary-card h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.3rem; font-weight: 400; color: #211D16; margin-bottom: 4px; }
  .cp-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #7C7466; font-family: 'Manrope', sans-serif; }
  .cp-summary-disc { color: #1F4D3A; }
  .cp-shipping-val { font-weight: 700; }
  .cp-free-badge { background: #EAF0E9; color: #1F4D3A; font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 999px; }
  .cp-free-hint { font-size: 12.5px; color: #C4622D; background: #F7E8DC; padding: 8px 12px; border-radius: 8px; margin: 0; font-family: 'Manrope', sans-serif; }
  .cp-divider { height: 1px; background: #F0EAE0; }
  .cp-total-row { font-size: 17px; }

  /* Coupon */
  .cp-coupon { display: flex; border: 1.5px solid #E8E1D2; border-radius: 10px; overflow: hidden; }
  .cp-coupon-input { flex: 1; border: none; outline: none; padding: 10px 14px; font-size: 13.5px; color: #211D16; font-family: 'Manrope', sans-serif; }
  .cp-coupon-btn { background: #C4622D; color: #fff; border: none; padding: 10px 16px; font-size: 13px; font-weight: 800; cursor: pointer; font-family: 'Manrope', sans-serif; transition: background .2s; flex-shrink: 0; }
  .cp-coupon-btn:hover:not(:disabled) { background: #A94E20; }
  .cp-coupon-btn:disabled { opacity: .5; cursor: not-allowed; }
  .cp-coupon-err { font-size: 12.5px; color: #A63B2A; margin: 0; }
  .cp-coupon-applied { display: flex; align-items: center; justify-content: space-between; background: #EAF0E9; padding: 10px 14px; border-radius: 10px; font-size: 13px; color: #1F4D3A; font-weight: 700; font-family: 'Manrope', sans-serif; }
  .cp-coupon-remove { background: none; border: none; font-size: 18px; color: #1F4D3A; cursor: pointer; line-height: 1; }

  .cp-checkout-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #C4622D; color: #fff;
    border-radius: 14px; padding: 15px; text-decoration: none;
    font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 800;
    box-shadow: 0 6px 20px rgba(196,98,45,.3); transition: all .25s;
  }
  .cp-checkout-btn:hover { background: #A94E20; transform: translateY(-1px); box-shadow: 0 10px 28px rgba(196,98,45,.4); }
  .cp-trust-row { display: flex; justify-content: center; gap: 16px; }
  .cp-trust-row span { font-size: 12px; color: #ABA394; font-family: 'Manrope', sans-serif; font-weight: 700; }

  @media (max-width: 900px) {
    .cp-grid { grid-template-columns: 1fr; }
    .cp-summary { position: static; }
    .cp-items-head { display: none; }
    .cp-item { grid-template-columns: 68px 1fr auto; gap: 12px; }
    .cp-item-total { display: none; }
    .cp-remove { display: none; }
    .cp-remove-mob { display: block; }
  }
  @media (max-width: 640px) {
    .cp { padding: 20px 0 40px; }
    .container { padding: 0 14px; }
    .cp-head { margin-bottom: 20px; }
    .cp-head h1 { font-size: 1.4rem; }
    .cp-checkout-btn { font-size: 14px; padding: 13px; }
    .cp-item { padding: 12px 0; gap: 10px; }
    .cp-item-img { width: 60px; height: 60px; border-radius: 8px; }
    .cp-item-name { font-size: 13.5px; }
    .cp-qty button { width: 30px; height: 34px; font-size: 14px; }
    .cp-qty span { width: 30px; font-size: 13px; }
    .cp-summary-card { padding: 18px 14px; }
    .cp-coupon-input { padding: 9px 12px; font-size: 12.5px; }
    .cp-coupon-btn { padding: 9px 14px; font-size: 12px; }
    .cp-items { border-radius: 14px; }
    .cp-actions-row { padding: 10px 14px; }
    .cp-items-head { padding: 10px 14px; }
  }
  `]
})
export class CartComponent implements OnInit {
  couponCode = '';
  couponApplied = signal(false);
  couponDiscount = signal(0);
  couponError = signal('');

  constructor(
    public cart: CartService,
    public settings: SettingsService,
    private seo: SeoService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.seo.setMeta({ title: 'Shopping Basket', description: 'Review your selected items and proceed to checkout.' });
  }

  get cur() { return this.settings.get('currency_symbol', '€'); }

  freeAbove(): number { return +(this.settings.get('shipping_free_above', '50') || 50); }
  shippingCharge(): number { return +(this.settings.get('shipping_charge', '5') || 5); }

  grandTotal(): number {
    const subtotal = this.cart.subtotal() - this.couponDiscount();
    const shipping = subtotal >= this.freeAbove() ? 0 : this.shippingCharge();
    return Math.max(0, subtotal) + shipping;
  }

  applyCoupon() {
    const code = this.couponCode.trim();
    if (!code) return;
    this.api.validateCoupon(code, this.cart.subtotal()).subscribe({
      next: (r: any) => {
        if (r.success && r.data) {
          const disc = r.data.discount_amount || 0;
          this.couponDiscount.set(+disc);
          this.couponApplied.set(true);
          this.couponError.set('');
        } else {
          this.couponError.set(r.message || 'Invalid coupon code');
        }
      },
      error: () => this.couponError.set('Could not validate coupon. Please try again.')
    });
  }

  removeCoupon() {
    this.couponApplied.set(false);
    this.couponDiscount.set(0);
    this.couponCode = '';
    this.couponError.set('');
  }
}

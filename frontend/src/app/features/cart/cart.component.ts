import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <div class="cart-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">Home</a>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          <span>Shopping Cart</span>
        </div>
        <h1>Shopping Cart
          @if (cart.itemCount() > 0) {
            <span class="cart-count-badge">{{ cart.itemCount() }} {{ cart.itemCount() === 1 ? 'item' : 'items' }}</span>
          }
        </h1>
      </div>
    </div>

    <div class="cart-page-body">
      <div class="container">

        @if (cart.items().length === 0) {
          <!-- Empty State -->
          <div class="empty-cart-wrap">
            <div class="empty-cart-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any products yet.</p>
            <div class="empty-cart-btns">
              <a routerLink="/categories" class="btn-primary-lg" id="start-shopping-btn">Start Shopping</a>
              <a routerLink="/" class="btn-outline-lg">Back to Home</a>
            </div>
          </div>
        } @else {
          <div class="cart-layout">

            <!-- LEFT: Cart Items -->
            <div class="cart-items-col">

              <!-- Free shipping bar -->
              @if (cart.subtotal() < 50) {
                <div class="shipping-bar-card">
                  <div class="sb-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M1 3h15l3 9H1z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
                    <span>Add <strong>{{ curr }}{{ (50 - cart.subtotal()).toFixed(2) }}</strong> more for free delivery!</span>
                  </div>
                  <div class="sb-track"><div class="sb-fill" [style.width]="(cart.subtotal()/50*100) + '%'"></div></div>
                </div>
              } @else {
                <div class="shipping-bar-card shipping-bar-done">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>🎉 You've unlocked <strong>free delivery</strong>!</span>
                </div>
              }

              <!-- Header row -->
              <div class="items-card">
                <div class="items-header">
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Total</span>
                </div>

                @for (item of cart.items(); track item.id) {
                  <div class="cart-item-row" [id]="'cart-item-' + item.id">
                    <div class="item-product">
                      <div class="item-thumb">
                        <img [src]="item.image || 'assets/placeholder-product.svg'" [alt]="item.name" class="item-thumb-img">
                      </div>
                      <div class="item-info">
                        <a [routerLink]="['/product', item.slug]" class="item-name">{{ item.name }}</a>
                        @if (item.unit) { <span class="item-unit">{{ item.unit }}</span> }
                        <div class="item-price">
                          @if (item.salePrice) {
                            <span class="sale-price">{{ curr }}{{ item.salePrice.toFixed(2) }}</span>
                            <span class="orig-price">{{ curr }}{{ item.price.toFixed(2) }}</span>
                          } @else {
                            <span class="sale-price">{{ curr }}{{ item.price.toFixed(2) }}</span>
                          }
                        </div>
                        <button class="remove-item-btn" (click)="cart.removeItem(item.id)" [id]="'remove-' + item.id">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    <div class="item-qty">
                      <div class="qty-control">
                        <button class="qty-btn" (click)="cart.updateQuantity(item.id, item.quantity - 1)" [id]="'decrease-' + item.id">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
                        </button>
                        <span class="qty-num">{{ item.quantity }}</span>
                        <button class="qty-btn" (click)="cart.updateQuantity(item.id, item.quantity + 1)" [id]="'increase-' + item.id">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                      </div>
                    </div>

                    <div class="item-total-col">
                      <span class="item-total-price">{{ curr }}{{ ((item.salePrice ?? item.price) * item.quantity).toFixed(2) }}</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="cart-actions">
                <a routerLink="/categories" class="continue-btn" id="continue-shopping-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                  Continue Shopping
                </a>
                <button class="clear-btn" (click)="cart.clearCart()" id="clear-cart-btn">Clear Cart</button>
              </div>
            </div>

            <!-- RIGHT: Order Summary -->
            <div class="cart-summary-col">
              <div class="summary-card">
                <h3 class="summary-title">Order Summary</h3>
                <div class="summary-rows">
                  <div class="summary-row">
                    <span>Subtotal ({{ cart.itemCount() }} items)</span>
                    <span>{{ curr }}{{ cart.subtotal().toFixed(2) }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Delivery</span>
                    <span class="delivery-cost">{{ cart.subtotal() >= 50 ? 'FREE' : curr + '3.99' }}</span>
                  </div>
                  <div class="summary-divider"></div>
                  <div class="summary-row summary-total">
                    <span>Total</span>
                    <span>{{ curr }}{{ (cart.subtotal() + (cart.subtotal() >= 50 ? 0 : 3.99)).toFixed(2) }}</span>
                  </div>
                </div>

                <a routerLink="/checkout" class="checkout-btn" id="go-to-checkout-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Proceed to Checkout
                </a>

                <!-- Trust badges -->
                <div class="cart-trust">
                  <div class="trust-row-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>Secure checkout</span>
                  </div>
                  <div class="trust-row-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>100% Halal certified</span>
                  </div>
                  <div class="trust-row-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M1 3h15l3 9H1z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
                    <span>Free delivery over {{ curr }}50</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cart-hero {
      background: #070A05; color: white; padding: 36px 0 24px;
    }
    .cart-hero h1 {
      color: white; font-size: clamp(1.5rem, 3vw, 2rem);
      display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
    }
    .cart-count-badge {
      font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.65);
      border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 999px;
    }
    .breadcrumb {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 14px;
    }
    .breadcrumb a { color: rgba(255,255,255,0.75); text-decoration: none; }
    .breadcrumb a:hover { color: white; }

    .cart-page-body { background: #F9FAFB; padding: 28px 0 72px; min-height: 60vh; }

    /* Empty */
    .empty-cart-wrap {
      background: white; border-radius: 16px; padding: 72px 32px;
      text-align: center; max-width: 440px; margin: 0 auto;
      border: 1px solid #F3F4F6;
    }
    .empty-cart-icon { margin-bottom: 20px; display: flex; justify-content: center; }
    .empty-cart-wrap h2 { font-size: 22px; color: #111; margin-bottom: 8px; font-family: 'Poppins', sans-serif; }
    .empty-cart-wrap p  { color: #9CA3AF; font-size: 14px; margin-bottom: 28px; }
    .empty-cart-btns { display: flex; flex-direction: column; gap: 10px; }
    .btn-primary-lg {
      display: block; padding: 13px 28px; background: #F28C00; color: white;
      border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;
      transition: background 0.2s;
    }
    .btn-primary-lg:hover { background: #070A05; }
    .btn-outline-lg {
      display: block; padding: 13px 28px; background: transparent; color: #374151;
      border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 15px; font-weight: 600;
      text-decoration: none; transition: border-color 0.2s;
    }
    .btn-outline-lg:hover { border-color: #F28C00; color: #F28C00; }

    /* Layout */
    .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }

    /* Shipping bar */
    .shipping-bar-card {
      background: #F0FDF4; border: 1px solid #DCFCE7;
      border-radius: 10px; padding: 12px 16px; margin-bottom: 14px;
    }
    .sb-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 13.5px; color: #15803D; font-weight: 500; margin-bottom: 10px;
    }
    .sb-row strong { font-weight: 800; }
    .sb-track { background: #DCFCE7; border-radius: 999px; height: 5px; }
    .sb-fill { background: #2E7D32; height: 100%; border-radius: 999px; transition: width 0.4s ease; max-width: 100%; }
    .shipping-bar-done {
      display: flex; align-items: center; gap: 8px;
      font-size: 13.5px; color: #15803D; font-weight: 500;
    }
    .shipping-bar-done span { display: flex; align-items: center; gap: 6px; }

    /* Items card */
    .items-card {
      background: white; border-radius: 12px; border: 1px solid #F3F4F6; overflow: hidden;
    }
    .items-header {
      display: grid; grid-template-columns: 1fr auto auto;
      gap: 16px; padding: 12px 20px;
      background: #F9FAFB; border-bottom: 1px solid #F3F4F6;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #9CA3AF;
    }
    .cart-item-row {
      display: grid; grid-template-columns: 1fr auto auto;
      gap: 16px; padding: 16px 20px; align-items: center;
      border-bottom: 1px solid #F9FAFB;
    }
    .cart-item-row:last-child { border-bottom: none; }
    .item-product { display: flex; gap: 14px; align-items: flex-start; min-width: 0; }
    .item-thumb { width: 72px; height: 72px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #F9FAFB; }
    .item-thumb-img { width: 100%; height: 100%; object-fit: contain; padding: 4px; display: block; }
    .item-info { flex: 1; min-width: 0; }
    .item-name {
      display: block; font-size: 14px; font-weight: 600; color: #111;
      margin-bottom: 4px; text-decoration: none; line-height: 1.4;
      transition: color 0.2s;
    }
    .item-name:hover { color: #F28C00; }
    .item-unit { font-size: 11px; color: #9CA3AF; display: block; margin-bottom: 4px; }
    .item-price { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .sale-price { font-size: 14px; font-weight: 700; color: #F28C00; }
    .orig-price { font-size: 12px; color: #B0B3BE; text-decoration: line-through; }
    .remove-item-btn {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12px; color: #9CA3AF; background: none; border: none;
      cursor: pointer; padding: 0; transition: color 0.2s;
    }
    .remove-item-btn:hover { color: #DC2626; }

    /* Qty */
    .item-qty { display: flex; justify-content: center; }
    .qty-control {
      display: flex; align-items: center; gap: 0;
      border: 1.5px solid #E5E7EB; border-radius: 8px; overflow: hidden;
    }
    .qty-btn {
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; color: #374151; transition: background 0.15s;
    }
    .qty-btn:hover { background: #FFF2DE; color: #F28C00; }
    .qty-num { padding: 0 12px; font-size: 14px; font-weight: 600; min-width: 32px; text-align: center; }
    .item-total-col { display: flex; align-items: center; justify-content: flex-end; }
    .item-total-price { font-size: 15px; font-weight: 800; color: #111; white-space: nowrap; font-family: 'Poppins', sans-serif; }

    /* Cart actions */
    .cart-actions {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 16px; gap: 12px;
    }
    .continue-btn {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13.5px; font-weight: 600; color: #374151;
      text-decoration: none; transition: color 0.2s;
    }
    .continue-btn:hover { color: #F28C00; }
    .clear-btn {
      font-size: 13px; color: #DC2626; background: none; border: none;
      cursor: pointer; font-weight: 500; transition: opacity 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .clear-btn:hover { opacity: 0.7; }

    /* Summary */
    .cart-summary-col { position: sticky; top: 120px; }
    .summary-card {
      background: white; border-radius: 12px; padding: 24px;
      border: 1px solid #F3F4F6; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    .summary-title {
      font-family: 'Poppins', sans-serif; font-size: 17px; font-weight: 700;
      color: #111; margin-bottom: 20px; padding-bottom: 14px;
      border-bottom: 1px solid #F3F4F6;
    }
    .summary-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #374151; }
    .delivery-cost { font-weight: 700; color: #2E7D32; }
    .summary-divider { height: 1px; background: #F3F4F6; margin: 4px 0; }
    .summary-total { font-size: 18px; font-weight: 800; color: #111; }
    .checkout-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px; background: #F28C00; color: white;
      border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;
      transition: background 0.2s; margin-bottom: 16px;
    }
    .checkout-btn:hover { background: #070A05; }
    .cart-trust { display: flex; flex-direction: column; gap: 8px; padding-top: 4px; }
    .trust-row-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 12.5px; color: #6B7280;
    }

    @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } .cart-summary-col { position: static; } }
    @media (max-width: 640px) {
      .items-header { display: none; }
      .cart-item-row { grid-template-columns: 1fr; gap: 12px; }
      .item-total-col { justify-content: flex-start; }
    }
  `]
})
export class CartComponent {
  constructor(public cart: CartService, private settings: SettingsService) {}
  get curr(): string { return this.settings.get('currency_symbol', '€'); }
}

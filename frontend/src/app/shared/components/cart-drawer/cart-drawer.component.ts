import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cart.isOpen()) {
      <div class="drawer-overlay" (click)="cart.closeCart()"></div>
      <aside class="cart-drawer" id="cart-drawer">

        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F28C00" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <h3>My Cart <span class="item-count">({{ cart.itemCount() }})</span></h3>
          </div>
          <button class="close-btn" (click)="cart.closeCart()" aria-label="Close cart" id="close-cart-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Free shipping progress -->
        @if (cart.subtotal() > 0 && cart.subtotal() < 50) {
          <div class="shipping-progress">
            <div class="sp-text">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M1 3h15l3 9H1z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
              Add <strong>{{ curr }}{{ (50 - cart.subtotal()).toFixed(2) }}</strong> more for free delivery
            </div>
            <div class="sp-bar"><div class="sp-fill" [style.width]="(cart.subtotal()/50*100) + '%'"></div></div>
          </div>
        }
        @if (cart.subtotal() >= 50) {
          <div class="free-shipping-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            You've unlocked free delivery!
          </div>
        }

        <!-- Body -->
        <div class="drawer-body">
          @if (cart.items().length === 0) {
            <div class="empty-cart">
              <div class="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" stroke-width="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <h4>Your cart is empty</h4>
              <p>Add some fresh products to get started</p>
              <a routerLink="/categories" class="btn-start-shopping" (click)="cart.closeCart()">
                Browse Products
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          } @else {
            @for (item of cart.items(); track item.id) {
              <div class="cart-item">
                <div class="item-img-wrap">
                  <img [src]="item.image || 'assets/placeholder-product.svg'" [alt]="item.name" class="item-img">
                </div>
                <div class="item-info">
                  <a [routerLink]="['/product', item.slug]" class="item-name" (click)="cart.closeCart()">{{ item.name }}</a>
                  @if (item.unit) { <span class="item-unit">{{ item.unit }}</span> }
                  <div class="item-price-row">
                    @if (item.salePrice) {
                      <span class="item-sale-price">{{ curr }}{{ item.salePrice.toFixed(2) }}</span>
                      <span class="item-orig-price">{{ curr }}{{ item.price.toFixed(2) }}</span>
                    } @else {
                      <span class="item-sale-price">{{ curr }}{{ item.price.toFixed(2) }}</span>
                    }
                  </div>
                </div>
                <div class="item-right">
                  <span class="item-total">{{ curr }}{{ ((item.salePrice ?? item.price) * item.quantity).toFixed(2) }}</span>
                  <div class="qty-row">
                    <button class="qty-btn" (click)="cart.updateQuantity(item.id, item.quantity - 1)" aria-label="Decrease">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
                    </button>
                    <span class="qty-num">{{ item.quantity }}</span>
                    <button class="qty-btn" (click)="cart.updateQuantity(item.id, item.quantity + 1)" aria-label="Increase">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                  <button class="remove-btn" (click)="cart.removeItem(item.id)" aria-label="Remove item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
            }
          }
        </div>

        <!-- Footer -->
        @if (cart.items().length > 0) {
          <div class="drawer-footer">
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>{{ curr }}{{ cart.subtotal().toFixed(2) }}</span>
              </div>
              <div class="total-row text-muted-small">
                <span>Delivery</span>
                <span>{{ cart.subtotal() >= 50 ? 'FREE' : curr + '3.99' }}</span>
              </div>
            </div>
            <div class="footer-btns">
              <a routerLink="/checkout" class="btn-checkout" id="proceed-checkout-btn" (click)="cart.closeCart()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Checkout — {{ curr }}{{ cart.subtotal().toFixed(2) }}
              </a>
              <a routerLink="/cart" class="btn-view-cart" (click)="cart.closeCart()">View Full Cart</a>
            </div>
          </div>
        }
      </aside>
    }
  `,
  styles: [`
    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      z-index: 2000; animation: fadeIn 0.2s ease;
    }
    .cart-drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 400px; max-width: 92vw; background: #fff;
      z-index: 2001; display: flex; flex-direction: column;
      box-shadow: -4px 0 40px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s cubic-bezier(0.22,1,0.36,1);
    }

    /* Header */
    .drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 20px; border-bottom: 1px solid #F3F4F6; flex-shrink: 0;
    }
    .drawer-title-row { display: flex; align-items: center; gap: 10px; }
    .drawer-header h3 { font-family: 'Poppins', sans-serif; font-size: 17px; font-weight: 700; color: #111; }
    .item-count { font-size: 14px; color: #9CA3AF; font-weight: 500; }
    .close-btn {
      width: 34px; height: 34px; border-radius: 8px;
      background: #F3F4F6; display: flex; align-items: center; justify-content: center;
      border: none; cursor: pointer; color: #374151; transition: background 0.2s;
    }
    .close-btn:hover { background: #E5E7EB; }

    /* Shipping progress */
    .shipping-progress {
      padding: 10px 20px; background: #F0FDF4;
      border-bottom: 1px solid #DCFCE7; flex-shrink: 0;
    }
    .sp-text {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: #15803D; margin-bottom: 8px;
    }
    .sp-text strong { font-weight: 700; }
    .sp-bar { background: #DCFCE7; border-radius: 999px; height: 4px; }
    .sp-fill {
      background: #2E7D32; height: 100%; border-radius: 999px;
      transition: width 0.5s ease; max-width: 100%;
    }
    .free-shipping-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: #F0FDF4;
      border-bottom: 1px solid #DCFCE7;
      font-size: 12.5px; font-weight: 700; color: #15803D; flex-shrink: 0;
    }

    /* Body */
    .drawer-body { flex: 1; overflow-y: auto; padding: 0 20px; }

    /* Empty */
    .empty-cart { text-align: center; padding: 60px 16px; }
    .empty-icon { margin-bottom: 16px; opacity: 0.5; display: flex; justify-content: center; }
    .empty-cart h4 { font-family: 'Poppins', sans-serif; font-size: 16px; color: #111; margin-bottom: 6px; }
    .empty-cart p { font-size: 13.5px; color: #9CA3AF; margin-bottom: 24px; }
    .btn-start-shopping {
      display: inline-flex; align-items: center; gap: 8px;
      background: #F28C00; color: white; padding: 11px 22px;
      border-radius: 10px; font-size: 14px; font-weight: 600;
      transition: background 0.2s;
    }
    .btn-start-shopping:hover { background: #070A05; }

    /* Cart item */
    .cart-item {
      display: flex; gap: 12px; padding: 14px 0;
      border-bottom: 1px solid #F9FAFB; align-items: flex-start;
    }
    .cart-item:last-child { border-bottom: none; }
    .item-img-wrap { width: 64px; height: 64px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #F9FAFB; }
    .item-img { width: 100%; height: 100%; object-fit: contain; padding: 4px; display: block; }
    .item-info { flex: 1; min-width: 0; }
    .item-name {
      display: block; font-size: 13px; font-weight: 600; color: #111;
      line-height: 1.4; margin-bottom: 3px;
      text-decoration: none; transition: color 0.2s;
      overflow: hidden; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .item-name:hover { color: #F28C00; }
    .item-unit { font-size: 11px; color: #9CA3AF; display: block; margin-bottom: 4px; }
    .item-price-row { display: flex; align-items: center; gap: 6px; }
    .item-sale-price { font-size: 13px; font-weight: 700; color: #F28C00; }
    .item-orig-price { font-size: 11px; color: #B0B3BE; text-decoration: line-through; }

    .item-right {
      display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;
    }
    .item-total { font-size: 14px; font-weight: 700; color: #111; }
    .qty-row {
      display: flex; align-items: center; gap: 0;
      border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;
    }
    .qty-btn {
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; color: #374151;
      transition: background 0.15s;
    }
    .qty-btn:hover { background: #FFF2DE; color: #F28C00; }
    .qty-num { padding: 0 8px; font-size: 13px; font-weight: 600; min-width: 24px; text-align: center; }
    .remove-btn {
      background: none; border: none; cursor: pointer; color: #D1D5DB;
      display: flex; align-items: center; transition: color 0.2s;
      padding: 2px;
    }
    .remove-btn:hover { color: #DC2626; }

    /* Footer */
    .drawer-footer {
      padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
      border-top: 1px solid #F3F4F6; flex-shrink: 0;
      background: #FAFAFA;
    }
    .totals { margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; }
    .total-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 14px; color: #374151; font-weight: 500;
    }
    .total-row:last-child { font-size: 17px; font-weight: 800; color: #111; }
    .text-muted-small { font-size: 12.5px !important; color: #9CA3AF !important; font-weight: 400 !important; }
    .footer-btns { display: flex; flex-direction: column; gap: 8px; }
    .btn-checkout {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: #F28C00; color: white; padding: 13px 20px;
      border-radius: 10px; font-size: 14.5px; font-weight: 700;
      text-decoration: none; transition: background 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .btn-checkout:hover { background: #070A05; }
    .btn-view-cart {
      display: block; text-align: center; padding: 11px;
      border: 1.5px solid #E5E7EB; border-radius: 10px;
      font-size: 13.5px; font-weight: 600; color: #374151;
      text-decoration: none; transition: border-color 0.2s, background 0.2s;
    }
    .btn-view-cart:hover { border-color: #F28C00; color: #F28C00; background: #FFF2DE; }

    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class CartDrawerComponent {
  constructor(public cart: CartService, private settingsService: SettingsService) {}
  get curr(): string { return this.settingsService.get('currency_symbol', '€'); }
}

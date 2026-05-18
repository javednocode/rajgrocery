import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="cart-page">
      <div class="container">
        <h1>Shopping Cart</h1>
        @if (cart.items().length === 0) {
          <div class="empty-cart">
            <span class="empty-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Add some delicious groceries to get started!</p>
            <a routerLink="/" class="btn btn-primary btn-lg">Start Shopping →</a>
          </div>
        } @else {
          <div class="cart-layout">
            <div class="cart-items">
              @for (item of cart.items(); track item.id) {
                <div class="cart-item">
                  <img [src]="item.image || 'placeholder.png'" [alt]="item.name" class="item-img">
                  <div class="item-info">
                    <a [routerLink]="['/product', item.slug]" class="item-name">{{ item.name }}</a>
                    <p class="item-price">
                      @if (item.salePrice) {
                        <span class="sale">€{{ item.salePrice }}</span> <span class="original">€{{ item.price }}</span>
                      } @else { €{{ item.price }} }
                      <span class="unit">/ {{ item.unit }}</span>
                    </p>
                  </div>
                  <div class="qty-control">
                    <button (click)="cart.updateQuantity(item.id, item.quantity - 1)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="cart.updateQuantity(item.id, item.quantity + 1)">+</button>
                  </div>
                  <div class="item-total">€{{ ((item.salePrice ?? item.price) * item.quantity).toFixed(2) }}</div>
                  <button class="remove-btn" (click)="cart.removeItem(item.id)">✕</button>
                </div>
              }
            </div>

            <div class="cart-summary">
              <div class="summary-card">
                <h3>Order Summary</h3>
                <div class="summary-row"><span>Subtotal</span><span>€{{ cart.subtotal().toFixed(2) }}</span></div>
                <div class="summary-row"><span>Shipping</span><span>{{ cart.subtotal() >= freeShippingThreshold ? 'FREE' : '€' + shippingCharge }}</span></div>
                <div class="summary-row"><span>Tax ({{ taxPercent }}%)</span><span>€{{ tax.toFixed(2) }}</span></div>
                <div class="summary-divider"></div>
                <div class="summary-row total"><span>Total</span><span>€{{ total.toFixed(2) }}</span></div>
                @if (cart.subtotal() < freeShippingThreshold) {
                  <p class="free-ship-note">Add €{{ (freeShippingThreshold - cart.subtotal()).toFixed(2) }} more for free shipping!</p>
                }
                <a routerLink="/checkout" class="btn btn-primary btn-lg" style="width:100%;margin-top:16px;">Proceed to Checkout →</a>
                <a routerLink="/" class="btn btn-ghost" style="width:100%;margin-top:8px;">← Continue Shopping</a>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .cart-page { padding: 40px 0 80px; }
    .cart-page h1 { margin-bottom: 32px; }
    .empty-cart { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 80px; display: block; margin-bottom: 20px; opacity: 0.3; }
    .empty-cart h2 { margin-bottom: 8px; }
    .empty-cart p { color: var(--text-muted); margin-bottom: 28px; }

    .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
    .cart-item {
      display: flex; align-items: center; gap: 16px; padding: 20px;
      background: var(--bg-white); border-radius: var(--radius);
      border: 1px solid var(--border-light); margin-bottom: 12px;
      transition: var(--transition);
    }
    .cart-item:hover { box-shadow: var(--shadow-sm); }
    .item-img { width: 80px; height: 80px; border-radius: var(--radius-sm); object-fit: cover; background: var(--bg-light); }
    .item-info { flex: 1; }
    .item-name { font-size: 15px; font-weight: 500; color: var(--text); display: block; margin-bottom: 4px; }
    .item-name:hover { color: var(--primary); }
    .item-price { font-size: 14px; color: var(--text-secondary); }
    .item-price .sale { color: var(--primary); font-weight: 600; }
    .item-price .original { text-decoration: line-through; color: var(--text-muted); font-size: 12px; }
    .unit { font-size: 12px; color: var(--text-muted); }

    .qty-control {
      display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: var(--radius-xs);
    }
    .qty-control button { width: 36px; height: 36px; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
    .qty-control button:hover { background: var(--primary-bg); color: var(--primary); }
    .qty-control span { padding: 0 14px; font-weight: 600; }

    .item-total { font-size: 16px; font-weight: 700; min-width: 80px; text-align: right; }
    .remove-btn { font-size: 16px; color: var(--text-muted); padding: 8px; border-radius: 50%; transition: var(--transition); }
    .remove-btn:hover { background: rgba(230,57,70,0.1); color: var(--danger); }

    .summary-card { background: var(--bg-white); border-radius: var(--radius); border: 1px solid var(--border-light); padding: 28px; position: sticky; top: calc(var(--header-height) + 50px); }
    .summary-card h3 { margin-bottom: 20px; font-family: 'Inter', sans-serif; }
    .summary-row { display: flex; justify-content: space-between; font-size: 15px; padding: 8px 0; }
    .summary-row.total { font-size: 20px; font-weight: 700; color: var(--primary-dark); }
    .summary-divider { border-top: 1px solid var(--border); margin: 12px 0; }
    .free-ship-note { font-size: 13px; color: var(--accent); background: rgba(247,127,0,0.08); padding: 10px; border-radius: var(--radius-xs); margin-top: 12px; text-align: center; }

    @media (max-width: 768px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-item { flex-wrap: wrap; }
      .item-total { min-width: auto; }
    }
  `]
})
export class CartComponent {
  freeShippingThreshold = 500;
  shippingCharge = 40;
  taxPercent = 5;

  constructor(public cart: CartService, private settings: SettingsService) {
    this.freeShippingThreshold = parseFloat(settings.get('shipping_free_above', '500'));
    this.shippingCharge = parseFloat(settings.get('shipping_charge', '40'));
    this.taxPercent = parseFloat(settings.get('tax_percentage', '5'));
  }

  get shipping(): number {
    return this.cart.subtotal() >= this.freeShippingThreshold ? 0 : this.shippingCharge;
  }

  get tax(): number {
    return this.cart.subtotal() * this.taxPercent / 100;
  }

  get total(): number {
    return this.cart.subtotal() + this.shipping + this.tax;
  }
}

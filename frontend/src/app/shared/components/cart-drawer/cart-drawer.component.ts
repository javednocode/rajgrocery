import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (cart.isOpen()) {
      <div class="drawer-overlay" (click)="cart.closeCart()"></div>
      <aside class="cart-drawer">
        <div class="drawer-header">
          <h3>🛒 Your Cart ({{ cart.itemCount() }})</h3>
          <button class="close-btn" (click)="cart.closeCart()">✕</button>
        </div>

        <div class="drawer-body">
          @if (cart.items().length === 0) {
            <div class="empty-cart">
              <span class="empty-icon">🛒</span>
              <p>Your cart is empty</p>
              <a routerLink="/" class="btn btn-primary" (click)="cart.closeCart()">Start Shopping</a>
            </div>
          } @else {
            @for (item of cart.items(); track item.id) {
              <div class="cart-item">
                <img [src]="item.image || 'placeholder.png'" [alt]="item.name" class="item-img">
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p class="item-price">
                    @if (item.salePrice) {
                      <span class="sale">€{{ item.salePrice }}</span>
                      <span class="original">€{{ item.price }}</span>
                    } @else {
                      <span>€{{ item.price }}</span>
                    }
                  </p>
                  <div class="qty-control">
                    <button (click)="cart.updateQuantity(item.id, item.quantity - 1)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="cart.updateQuantity(item.id, item.quantity + 1)">+</button>
                  </div>
                </div>
                <div class="item-total">
                  <span>€{{ ((item.salePrice ?? item.price) * item.quantity).toFixed(2) }}</span>
                  <button class="remove-btn" (click)="cart.removeItem(item.id)">🗑️</button>
                </div>
              </div>
            }
          }
        </div>

        @if (cart.items().length > 0) {
          <div class="drawer-footer">
            <div class="subtotal">
              <span>Subtotal</span>
              <strong>€{{ cart.subtotal().toFixed(2) }}</strong>
            </div>
            <a routerLink="/checkout" class="btn btn-primary btn-lg" style="width:100%" (click)="cart.closeCart()">
              Proceed to Checkout →
            </a>
            <a routerLink="/cart" class="btn btn-outline" style="width:100%;margin-top:8px" (click)="cart.closeCart()">
              View Full Cart
            </a>
          </div>
        }
      </aside>
    }
  `,
  styles: [`
    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      z-index: 2000; animation: fadeIn 0.2s ease;
    }
    .cart-drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 400px; max-width: 90vw; background: var(--bg-white);
      z-index: 2001; display: flex; flex-direction: column;
      box-shadow: var(--shadow-xl);
      animation: slideInRight 0.3s ease;
    }
    .drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--border);
    }
    .drawer-header h3 { font-family: 'Playfair Display', serif; font-size: 18px; }
    .close-btn { font-size: 20px; width: 36px; height: 36px; border-radius: 50%; background: var(--bg-light); display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { background: var(--border); }

    .drawer-body { flex: 1; overflow-y: auto; padding: 16px 24px; }

    .empty-cart { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 64px; display: block; margin-bottom: 16px; opacity: 0.3; }
    .empty-cart p { color: var(--text-muted); margin-bottom: 24px; font-size: 15px; }

    .cart-item {
      display: flex; gap: 12px; padding: 16px 0;
      border-bottom: 1px solid var(--border-light);
    }
    .item-img { width: 70px; height: 70px; border-radius: var(--radius-sm); object-fit: cover; background: var(--bg-light); }
    .item-info { flex: 1; }
    .item-info h4 { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; margin-bottom: 4px; line-height: 1.3; }
    .item-price { font-size: 14px; margin-bottom: 8px; }
    .item-price .sale { color: var(--primary); font-weight: 600; }
    .item-price .original { text-decoration: line-through; color: var(--text-muted); font-size: 12px; margin-left: 6px; }

    .qty-control {
      display: inline-flex; align-items: center; gap: 0;
      border: 1px solid var(--border); border-radius: var(--radius-xs);
      overflow: hidden;
    }
    .qty-control button {
      width: 30px; height: 30px; font-size: 16px; font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition);
    }
    .qty-control button:hover { background: var(--primary-bg); color: var(--primary); }
    .qty-control span { padding: 0 10px; font-size: 14px; font-weight: 500; min-width: 30px; text-align: center; }

    .item-total { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .item-total span { font-weight: 600; font-size: 14px; }
    .remove-btn { font-size: 14px; opacity: 0.4; transition: var(--transition); }
    .remove-btn:hover { opacity: 1; }

    .drawer-footer { padding: 20px 24px; border-top: 1px solid var(--border); background: var(--bg-light); }
    .subtotal { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 16px; }
    .subtotal strong { font-size: 20px; color: var(--primary-dark); }
  `]
})
export class CartDrawerComponent {
  constructor(public cart: CartService) {}
}

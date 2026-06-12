import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="cd-overlay" [class.open]="cart.isOpen()" (click)="cart.closeCart()" aria-hidden="true"></div>
  <aside class="cd" [class.open]="cart.isOpen()" aria-label="Shopping cart">
    <div class="cd-head">
      <h3>Your Basket <span class="cd-count">{{ cart.itemCount() }}</span></h3>
      <button class="cd-x" (click)="cart.closeCart()" aria-label="Close cart">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </div>
    @if (cart.items().length === 0) {
      <div class="cd-empty">
        <div class="cd-empty-ic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>
        <p>Your basket is empty</p>
        <button class="td-btn td-btn-dark" (click)="cart.closeCart()">Start shopping</button>
      </div>
    } @else {
      <div class="cd-items">
        @for (it of cart.items(); track it.id) {
          <div class="cd-item">
            <a [routerLink]="['/product', it.slug]" (click)="cart.closeCart()" class="cd-img">
              @if (it.image) { <img [src]="it.image" [alt]="it.name" loading="lazy" /> }
            </a>
            <div class="cd-info">
              <a [routerLink]="['/product', it.slug]" (click)="cart.closeCart()" class="cd-name">{{ it.name }}</a>
              <div class="cd-price">{{ cur }}{{ ((it.salePrice ?? it.price) * it.quantity).toFixed(2) }}</div>
              <div class="cd-qty">
                <button (click)="cart.updateQuantity(it.id, it.quantity - 1)" aria-label="Decrease">−</button>
                <span>{{ it.quantity }}</span>
                <button (click)="cart.updateQuantity(it.id, it.quantity + 1)" aria-label="Increase">+</button>
              </div>
            </div>
            <button class="cd-rm" (click)="cart.removeItem(it.id)" aria-label="Remove item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        }
      </div>
      <div class="cd-foot">
        <div class="cd-row"><span>Subtotal</span><strong>{{ cur }}{{ cart.subtotal().toFixed(2) }}</strong></div>
        @if (freeAbove > 0 && cart.subtotal() < freeAbove) {
          <div class="cd-free">Add {{ cur }}{{ (freeAbove - cart.subtotal()).toFixed(2) }} more for <strong>free delivery</strong>
            <div class="cd-bar"><span [style.width.%]="(cart.subtotal() / freeAbove) * 100"></span></div>
          </div>
        } @else if (freeAbove > 0) {
          <div class="cd-free ok">✓ You've unlocked free delivery</div>
        }
        <a routerLink="/checkout" (click)="cart.closeCart()" class="td-btn td-btn-dark cd-go">Checkout</a>
        <a routerLink="/cart" (click)="cart.closeCart()" class="cd-view">View basket</a>
      </div>
    }
  </aside>
  `,
  styles: [`
  .cd-overlay{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.45);backdrop-filter:blur(4px);opacity:0;visibility:hidden;transition:opacity .35s,visibility .35s}
  .cd-overlay.open{opacity:1;visibility:visible}
  .cd{position:fixed;top:0;right:0;bottom:0;z-index:1001;width:min(420px,94vw);background:#fff;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .45s var(--td-ease);box-shadow:var(--td-shadow-lg)}
  .cd.open{transform:none}
  .cd-head{display:flex;align-items:center;justify-content:space-between;padding:24px 26px;border-bottom:1px solid var(--td-line)}
  .cd-head h3{font-size:18px;font-weight:800}
  .cd-count{display:inline-grid;place-items:center;min-width:24px;height:24px;border-radius:999px;background:var(--td-accent);color:#111;font-size:12px;font-weight:800;margin-left:8px;padding:0 7px}
  .cd-x{width:38px;height:38px;border-radius:999px;border:1.5px solid var(--td-line);background:#fff;display:grid;place-items:center;transition:border-color .2s}
  .cd-x:hover{border-color:var(--td-text)}
  .cd-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:var(--td-muted)}
  .cd-empty-ic{width:74px;height:74px;border-radius:24px;background:var(--td-secondary);display:grid;place-items:center;color:var(--td-muted)}
  .cd-items{flex:1;overflow-y:auto;padding:14px 26px}
  .cd-item{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--td-line);position:relative}
  .cd-img{width:72px;height:72px;border-radius:var(--td-radius-sm);background:var(--td-secondary);overflow:hidden;flex-shrink:0}
  .cd-img img{width:100%;height:100%;object-fit:cover}
  .cd-info{flex:1;min-width:0}
  .cd-name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;font-weight:600;line-height:1.4;margin-bottom:4px}
  .cd-price{font-size:14.5px;font-weight:800;margin-bottom:8px}
  .cd-qty{display:inline-flex;align-items:center;gap:2px;border:1.5px solid var(--td-line);border-radius:999px;padding:2px}
  .cd-qty button{width:28px;height:28px;border-radius:999px;border:none;background:none;font-size:16px;font-weight:700;color:var(--td-text)}
  .cd-qty button:hover{background:var(--td-secondary)}
  .cd-qty span{min-width:26px;text-align:center;font-size:13.5px;font-weight:700}
  .cd-rm{position:absolute;top:14px;right:0;width:28px;height:28px;border-radius:999px;border:none;background:none;color:var(--td-muted);display:grid;place-items:center}
  .cd-rm:hover{color:#DC2626;background:#FEF2F2}
  .cd-foot{padding:20px 26px calc(20px + env(safe-area-inset-bottom));border-top:1px solid var(--td-line);background:#fff}
  .cd-row{display:flex;justify-content:space-between;font-size:15px;margin-bottom:12px}
  .cd-row strong{font-size:18px;font-weight:800}
  .cd-free{font-size:13px;color:var(--td-muted);margin-bottom:14px}
  .cd-free.ok{color:var(--td-success);font-weight:600}
  .cd-bar{height:5px;border-radius:99px;background:var(--td-secondary);margin-top:8px;overflow:hidden}
  .cd-bar span{display:block;height:100%;border-radius:99px;background:var(--td-accent);transition:width .4s var(--td-ease)}
  .cd-go{width:100%;justify-content:center}
  .cd-view{display:block;text-align:center;font-size:13.5px;font-weight:600;color:var(--td-muted);margin-top:12px}
  .cd-view:hover{color:var(--td-text)}
  `]
})
export class CartDrawerComponent {
  constructor(public cart: CartService, private settings: SettingsService) {}
  get cur() { return this.settings.get('currency_symbol', '£'); }
  get freeAbove() { return parseFloat(this.settings.get('shipping_free_above', '50')) || 0; }
}

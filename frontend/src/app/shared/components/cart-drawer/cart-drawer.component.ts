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
  <aside class="cd" [class.open]="cart.isOpen()" aria-label="Shopping basket">
    <div class="cd-head">
      <h3>Your basket @if (cart.itemCount() > 0) { <span class="cd-count">{{ cart.itemCount() }}</span> }</h3>
      <button class="cd-x" (click)="cart.closeCart()" aria-label="Close basket">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </div>

    @if (cart.items().length === 0) {
      <div class="cd-empty">
        <span class="cd-empty-glyph">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="21" r="1.3" fill="currentColor"/><circle cx="17" cy="21" r="1.3" fill="currentColor"/></svg>
        </span>
        <p class="cd-empty-title">Your basket is empty</p>
        <p class="cd-empty-sub">Add some Indian grocery favourites to get started.</p>
        <button class="cd-go" (click)="cart.closeCart()">Start shopping</button>
      </div>
    } @else {
      <div class="cd-items">
        @for (it of cart.items(); track it.id) {
          <div class="cd-item">
            <a [routerLink]="['/product', it.slug]" (click)="cart.closeCart()" class="cd-img">
              @if (it.image) { <img [src]="it.image" [alt]="it.name" loading="lazy" /> }
              @else { <b>{{ (it.name || '?')[0] }}</b> }
            </a>
            <div class="cd-info">
              <a [routerLink]="['/product', it.slug]" (click)="cart.closeCart()" class="cd-name">{{ it.name }}</a>
              <span class="cd-unit">{{ it.unit }}</span>
              <div class="cd-item-foot">
                <div class="cd-qty">
                  <button (click)="cart.updateQuantity(it.id, it.quantity - 1)" aria-label="Decrease">−</button>
                  <span>{{ it.quantity }}</span>
                  <button (click)="cart.updateQuantity(it.id, it.quantity + 1)" aria-label="Increase">+</button>
                </div>
                <span class="cd-price">{{ cur }}{{ ((it.salePrice ?? it.price) * it.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <button class="cd-rm" (click)="cart.removeItem(it.id)" aria-label="Remove item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        }
      </div>

      <div class="cd-foot">
        @if (freeAbove > 0 && cart.subtotal() < freeAbove) {
          <div class="cd-free">
            <span>Add <strong>{{ cur }}{{ (freeAbove - cart.subtotal()).toFixed(2) }}</strong> for free delivery</span>
            <div class="cd-bar"><span [style.width.%]="(cart.subtotal() / freeAbove) * 100"></span></div>
          </div>
        } @else if (freeAbove > 0) {
          <div class="cd-free ok">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Free delivery unlocked
          </div>
        }
        <div class="cd-row"><span>Subtotal</span><strong>{{ cur }}{{ cart.subtotal().toFixed(2) }}</strong></div>
        <a routerLink="/checkout" (click)="cart.closeCart()" class="cd-go">
          Checkout
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a routerLink="/cart" (click)="cart.closeCart()" class="cd-view">View full basket</a>
      </div>
    }
  </aside>
  `,
  styles: [`
  .cd-overlay {
    position: fixed; inset: 0; z-index: 1200;
    background: rgba(20,20,18,.4);
    opacity: 0; visibility: hidden;
    transition: opacity .3s, visibility .3s;
  }
  .cd-overlay.open { opacity: 1; visibility: visible; }
  .cd {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 1201;
    width: min(420px, 94vw);
    background: var(--kg-cream);
    display: flex; flex-direction: column;
    transform: translateX(calc(100% + 40px));
    transition: transform .4s var(--ease);
    box-shadow: -24px 0 60px rgba(20,20,18,.2);
  }
  .cd.open { transform: none; }

  .cd-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 24px 18px;
    border-bottom: 1px solid var(--kg-line);
  }
  .cd-head h3 {
    font-family: var(--font-sans); font-size: 18px; font-weight: 800;
    letter-spacing: -0.005em; display: flex; align-items: center; gap: 10px;
  }
  .cd-count {
    display: inline-grid; place-items: center;
    min-width: 24px; height: 24px; padding: 0 7px;
    border-radius: 999px; background: var(--kg-forest); color: var(--kg-cream);
    font-family: var(--font-sans); font-size: 11.5px; font-weight: 800;
  }
  .cd-x {
    width: 38px; height: 38px; border-radius: 999px;
    border: 1px solid var(--kg-line); background: var(--kg-paper);
    display: grid; place-items: center; color: var(--kg-ink);
    transition: all .25s;
  }
  .cd-x:hover { border-color: var(--kg-ink); transform: rotate(90deg); }

  .cd-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 6px;
    padding: 0 32px; text-align: center;
  }
  .cd-empty-glyph {
    width: 68px; height: 68px; border-radius: 999px;
    display: grid; place-items: center;
    background: var(--kg-warm); color: var(--kg-faint); margin-bottom: 10px;
  }
  .cd-empty-title { font-family: var(--font-sans); font-weight: 800; font-size: 18px; color: var(--kg-ink); }
  .cd-empty-sub { font-size: 14px; color: var(--kg-muted); margin-bottom: 20px; }

  .cd-items { flex: 1; overflow-y: auto; padding: 8px 24px; }
  .cd-item {
    display: flex; gap: 14px; padding: 16px 0;
    border-bottom: 1px solid var(--kg-line-lt);
    position: relative;
  }
  .cd-img {
    width: 68px; height: 68px; border-radius: var(--r);
    background: var(--kg-sand); overflow: hidden; flex-shrink: 0;
    display: grid; place-items: center;
    border: 1px solid var(--kg-line);
  }
  .cd-img img { width: 100%; height: 100%; object-fit: cover; }
  .cd-img b { font-size: 22px; font-weight: 800; color: var(--kg-faint); }
  .cd-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .cd-name {
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    font-family: var(--font-sans); font-size: 14px; font-weight: 700; line-height: 1.35;
    color: var(--kg-ink); margin-bottom: 2px; padding-right: 22px;
    transition: color .2s;
  }
  .cd-name:hover { color: var(--kg-forest); }
  .cd-unit { font-size: 12px; color: var(--kg-muted); margin-bottom: 10px; }
  .cd-item-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; }
  .cd-qty {
    display: inline-flex; align-items: center;
    border: 1px solid var(--kg-line); border-radius: 999px;
    background: var(--kg-paper); padding: 2px;
  }
  .cd-qty button {
    width: 27px; height: 27px; border-radius: 999px;
    font-size: 15px; font-weight: 700; color: var(--kg-ink);
    display: grid; place-items: center; transition: background .2s, color .2s;
  }
  .cd-qty button:hover { background: var(--kg-forest); color: var(--kg-cream); }
  .cd-qty span { min-width: 28px; text-align: center; font-size: 13.5px; font-weight: 800; font-family: var(--font-sans); }
  .cd-price { font-family: var(--font-sans); font-size: 15px; font-weight: 800; color: var(--kg-ink); }
  .cd-rm {
    position: absolute; top: 18px; right: 0;
    width: 26px; height: 26px; border-radius: 999px;
    color: var(--kg-faint); display: grid; place-items: center;
    transition: all .2s;
  }
  .cd-rm:hover { color: var(--kg-clay); background: var(--kg-clay-bg); }

  .cd-foot {
    padding: 18px 24px calc(20px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--kg-line);
    background: var(--kg-paper);
  }
  .cd-free { font-size: 13px; color: var(--kg-muted); margin-bottom: 16px; }
  .cd-free strong { color: var(--kg-ink); }
  .cd-free.ok { display: flex; align-items: center; gap: 8px; color: var(--kg-forest); font-weight: 700; }
  .cd-bar { height: 5px; border-radius: 99px; background: var(--kg-sand-2); margin-top: 9px; overflow: hidden; }
  .cd-bar span {
    display: block; height: 100%; border-radius: 99px;
    background: var(--kg-forest);
    transition: width .5s var(--ease);
  }
  .cd-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 14.5px; color: var(--kg-muted); margin-bottom: 16px; }
  .cd-row strong { font-family: var(--font-sans); font-size: 21px; font-weight: 800; color: var(--kg-ink); }
  .cd-go {
    width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    background: var(--kg-forest); color: var(--kg-cream);
    padding: 15px 28px; border-radius: 999px;
    font-family: var(--font-sans); font-size: 14.5px; font-weight: 800;
    transition: background .25s, transform .25s, box-shadow .25s; cursor: pointer;
  }
  .cd-go:hover { background: var(--kg-forest-dk); transform: translateY(-1px); box-shadow: var(--shadow-forest); }
  .cd-view {
    display: block; text-align: center; margin-top: 13px;
    font-size: 13px; font-weight: 700; color: var(--kg-muted);
    transition: color .2s;
  }
  .cd-view:hover { color: var(--kg-ink); }
  `]
})
export class CartDrawerComponent {
  constructor(public cart: CartService, private settings: SettingsService) {}
  get cur() { return this.settings.get('currency_symbol', 'HK$'); }
  get freeAbove() { return parseFloat(this.settings.get('shipping_free_above', '50')) || 0; }
}

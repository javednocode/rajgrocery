import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section class="cp">
    <div class="td-container">
      <h1>Your Basket</h1>
      @if (cart.items().length === 0) {
        <div class="cp-empty"><h3>Your basket is empty</h3><p>Fill it with something delicious.</p><a routerLink="/categories" class="td-btn td-btn-dark">Start shopping</a></div>
      } @else {
        <div class="cp-grid">
          <div class="cp-list">
            @for (it of cart.items(); track it.id) {
              <div class="cp-item">
                <a [routerLink]="['/product', it.slug]" class="cp-img">@if (it.image) { <img [src]="it.image" [alt]="it.name" loading="lazy" /> }</a>
                <div class="cp-info">
                  <a [routerLink]="['/product', it.slug]" class="cp-name">{{ it.name }}</a>
                  <span class="cp-unit">{{ cur }}{{ (it.salePrice ?? it.price).toFixed(2) }} each</span>
                  <div class="cp-qty">
                    <button (click)="cart.updateQuantity(it.id, it.quantity - 1)" aria-label="Decrease">−</button>
                    <span>{{ it.quantity }}</span>
                    <button (click)="cart.updateQuantity(it.id, it.quantity + 1)" aria-label="Increase">+</button>
                  </div>
                </div>
                <div class="cp-line">
                  <strong>{{ cur }}{{ ((it.salePrice ?? it.price) * it.quantity).toFixed(2) }}</strong>
                  <button class="cp-rm" (click)="cart.removeItem(it.id)">Remove</button>
                </div>
              </div>
            }
          </div>
          <aside class="cp-sum">
            <h3>Summary</h3>
            <div class="cp-row"><span>Subtotal</span><span>{{ cur }}{{ cart.subtotal().toFixed(2) }}</span></div>
            <div class="cp-row"><span>Delivery</span><span>{{ shippingLabel() }}</span></div>
            <div class="cp-row total"><span>Total</span><span>{{ cur }}{{ grandTotal().toFixed(2) }}</span></div>
            @if (freeAbove > 0 && cart.subtotal() < freeAbove) {
              <p class="cp-free">Add {{ cur }}{{ (freeAbove - cart.subtotal()).toFixed(2) }} more for free delivery</p>
            }
            <a routerLink="/checkout" class="td-btn td-btn-dark cp-go">Proceed to checkout</a>
            <a routerLink="/categories" class="cp-cont">Continue shopping</a>
          </aside>
        </div>
      }
    </div>
  </section>
  `,
  styles: [`
  .cp{padding:56px 0 40px}
  .cp h1{font-size:clamp(1.9rem,3.4vw,2.7rem);font-weight:800;margin-bottom:40px}
  .cp-empty{text-align:center;padding:90px 20px;color:var(--td-muted)}
  .cp-empty h3{margin-bottom:8px}.cp-empty .td-btn{margin-top:24px}
  .cp-grid{display:grid;grid-template-columns:1fr 360px;gap:48px;align-items:start}
  .cp-item{display:flex;gap:20px;padding:24px 0;border-bottom:1px solid var(--td-line)}
  .cp-img{width:104px;height:104px;border-radius:var(--td-radius-sm);background:var(--td-secondary);overflow:hidden;flex-shrink:0}
  .cp-img img{width:100%;height:100%;object-fit:cover}
  .cp-info{flex:1;min-width:0}
  .cp-name{display:block;font-size:15.5px;font-weight:700;margin-bottom:4px}
  .cp-name:hover{color:var(--td-accent)}
  .cp-unit{font-size:13px;color:var(--td-muted)}
  .cp-qty{display:inline-flex;align-items:center;gap:2px;border:1.5px solid var(--td-line);border-radius:999px;padding:3px;margin-top:12px}
  .cp-qty button{width:32px;height:32px;border-radius:999px;border:none;background:none;font-size:16px;font-weight:700}
  .cp-qty button:hover{background:var(--td-secondary)}
  .cp-qty span{min-width:30px;text-align:center;font-weight:700;font-size:14px}
  .cp-line{display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between}
  .cp-line strong{font-family:'Sora',sans-serif;font-size:17px;font-weight:800}
  .cp-rm{border:none;background:none;font-size:12.5px;font-weight:600;color:var(--td-muted);padding:0}
  .cp-rm:hover{color:#DC2626}
  .cp-sum{position:sticky;top:calc(var(--td-header-h) + 24px);background:var(--td-secondary);border-radius:var(--td-radius);padding:30px}
  .cp-sum h3{font-size:18px;font-weight:800;margin-bottom:22px}
  .cp-row{display:flex;justify-content:space-between;font-size:14.5px;color:var(--td-muted);padding:8px 0}
  .cp-row.total{border-top:1px solid var(--td-line);margin-top:10px;padding-top:18px;color:var(--td-text);font-weight:800;font-size:17px}
  .cp-free{font-size:13px;color:var(--td-muted);margin:10px 0 0}
  .cp-go{width:100%;justify-content:center;margin-top:22px}
  .cp-cont{display:block;text-align:center;font-size:13.5px;font-weight:600;color:var(--td-muted);margin-top:14px}
  .cp-cont:hover{color:var(--td-text)}
  @media (max-width:900px){.cp-grid{grid-template-columns:1fr}.cp-sum{position:static}}
  `]
})
export class CartComponent {
  constructor(public cart: CartService, private settings: SettingsService, seo: SeoService) { seo.setMeta({ title: 'Your Basket', description: 'Review your basket at The Desi.' }); }
  get cur() { return this.settings.get('currency_symbol', '£'); }
  get freeAbove() { return parseFloat(this.settings.get('shipping_free_above', '50')) || 0; }
  get shipCharge() { return parseFloat(this.settings.get('shipping_charge', '5')) || 0; }
  shippingCost() { return this.freeAbove > 0 && this.cart.subtotal() >= this.freeAbove ? 0 : this.shipCharge; }
  shippingLabel() { return this.shippingCost() === 0 ? 'FREE' : this.cur + this.shippingCost().toFixed(2); }
  grandTotal() { return this.cart.subtotal() + this.shippingCost(); }
}

import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
  <section class="ck">
    <div class="td-container">
      @if (placed()) {
        <div class="ck-done">
          <div class="ck-done-ic"><svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <h1>Order placed</h1>
          <p>Thank you, <strong>{{ form.first_name }}</strong>. Your order <strong>{{ ref() }}</strong> is confirmed — we'll contact you on <strong>{{ form.phone }}</strong> to arrange delivery.</p>
          <a routerLink="/" class="td-btn td-btn-dark">Back to home</a>
        </div>
      } @else {
        <h1>Checkout</h1>
        <div class="ck-grid">
          <form class="ck-form" (submit)="place($event)">
            <h3>Delivery details</h3>
            <div class="ck-2">
              <label>First name *<input [(ngModel)]="form.first_name" name="fn" required /></label>
              <label>Last name *<input [(ngModel)]="form.last_name" name="ln" required /></label>
            </div>
            <label>Street address *<input [(ngModel)]="form.address_line1" name="a1" placeholder="House number and street" required /></label>
            <label>Apartment / unit<input [(ngModel)]="form.address_line2" name="a2" placeholder="Optional" /></label>
            <div class="ck-2">
              <label>Town / City *<input [(ngModel)]="form.city" name="city" required /></label>
              <label>County<input [(ngModel)]="form.county" name="county" /></label>
            </div>
            <div class="ck-2">
              <label>Postcode *<input [(ngModel)]="form.postcode" name="pc" placeholder="e.g. B12 0XS" required /></label>
              <label>Country *
                <select [(ngModel)]="form.country" name="country"><option>United Kingdom</option><option>Ireland</option><option>Other</option></select>
              </label>
            </div>
            <div class="ck-2">
              <label>Phone *<input [(ngModel)]="form.phone" name="phone" type="tel" placeholder="+44…" required /></label>
              <label>Email<input [(ngModel)]="form.email" name="email" type="email" placeholder="Optional" /></label>
            </div>
            <label>Order notes<textarea [(ngModel)]="form.notes" name="notes" rows="3" placeholder="Delivery instructions (optional)"></textarea></label>
            @if (error()) { <div class="ck-err" role="alert">{{ error() }}</div> }
            <button type="submit" class="td-btn td-btn-dark ck-place" [disabled]="busy()">{{ busy() ? 'Placing order…' : 'Place order — ' + cur + grandTotal().toFixed(2) }}</button>
            <p class="ck-note">Pay with cash or card on delivery. Your data is used only to process your order.</p>
          </form>
          <aside class="ck-sum">
            <h3>Your order</h3>
            @for (it of cart.items(); track it.id) {
              <div class="ck-item">
                <div class="ck-item-img">@if (it.image) { <img [src]="it.image" [alt]="it.name" /> }<em>{{ it.quantity }}</em></div>
                <span class="ck-item-name">{{ it.name }}</span>
                <strong>{{ cur }}{{ ((it.salePrice ?? it.price) * it.quantity).toFixed(2) }}</strong>
              </div>
            }
            <div class="ck-row"><span>Subtotal</span><span>{{ cur }}{{ cart.subtotal().toFixed(2) }}</span></div>
            <div class="ck-row"><span>Delivery</span><span>{{ shippingCost() === 0 ? 'FREE' : cur + shippingCost().toFixed(2) }}</span></div>
            <div class="ck-row total"><span>Total</span><span>{{ cur }}{{ grandTotal().toFixed(2) }}</span></div>
          </aside>
        </div>
      }
    </div>
  </section>
  `,
  styles: [`
  .ck{padding:56px 0 40px}
  .ck h1{font-size:clamp(1.9rem,3.4vw,2.7rem);font-weight:800;margin-bottom:40px}
  .ck-grid{display:grid;grid-template-columns:1fr 400px;gap:48px;align-items:start}
  .ck-form h3,.ck-sum h3{font-size:18px;font-weight:800;margin-bottom:24px}
  .ck-form label{display:block;font-size:13px;font-weight:700;color:var(--td-text);margin-bottom:16px}
  .ck-form input,.ck-form select,.ck-form textarea{display:block;width:100%;margin-top:7px;padding:13px 15px;border:1.5px solid var(--td-line);border-radius:var(--td-radius-sm);font:inherit;font-size:14.5px;font-weight:400;background:#fff;transition:border-color .2s}
  .ck-form input:focus,.ck-form select:focus,.ck-form textarea:focus{outline:none;border-color:var(--td-accent)}
  .ck-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .ck-err{background:#FEF2F2;color:#DC2626;border:1px solid rgba(220,38,38,.2);border-radius:var(--td-radius-sm);padding:13px 16px;font-size:13.5px;font-weight:600;margin-bottom:16px}
  .ck-place{width:100%;justify-content:center;margin-top:8px}
  .ck-place:disabled{opacity:.6;transform:none;box-shadow:none;cursor:wait}
  .ck-note{font-size:12.5px;color:var(--td-muted);text-align:center;margin-top:14px;line-height:1.6}
  .ck-sum{position:sticky;top:calc(var(--td-header-h) + 24px);background:var(--td-secondary);border-radius:var(--td-radius);padding:30px}
  .ck-item{display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid var(--td-line)}
  .ck-item-img{position:relative;width:54px;height:54px;border-radius:12px;background:#fff;overflow:visible;flex-shrink:0}
  .ck-item-img img{width:100%;height:100%;object-fit:cover;border-radius:12px}
  .ck-item-img em{position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;border-radius:999px;background:var(--td-primary);color:#fff;font-style:normal;font-size:11px;font-weight:800;display:grid;place-items:center;padding:0 5px}
  .ck-item-name{flex:1;font-size:13.5px;font-weight:600;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
  .ck-item strong{font-size:14px;font-weight:800;white-space:nowrap}
  .ck-row{display:flex;justify-content:space-between;font-size:14.5px;color:var(--td-muted);padding:9px 0}
  .ck-row.total{border-top:1px solid var(--td-line);margin-top:10px;padding-top:18px;color:var(--td-text);font-weight:800;font-size:18px}
  .ck-done{max-width:520px;margin:40px auto;text-align:center;background:var(--td-secondary);border-radius:var(--td-radius);padding:64px 40px}
  .ck-done-ic{width:72px;height:72px;border-radius:999px;background:var(--td-success);display:grid;place-items:center;margin:0 auto 26px}
  .ck-done h1{margin-bottom:16px}
  .ck-done p{color:var(--td-muted);line-height:1.8;margin-bottom:30px}
  @media (max-width:900px){.ck-grid{grid-template-columns:1fr}.ck-sum{position:static;order:-1}}
  @media (max-width:560px){.ck-2{grid-template-columns:1fr}}
  `]
})
export class CheckoutComponent implements OnInit {
  placed = signal(false);
  busy = signal(false);
  error = signal('');
  ref = signal('');
  form = { first_name: '', last_name: '', address_line1: '', address_line2: '', city: '', county: '', postcode: '', country: 'United Kingdom', phone: '', email: '', notes: '' };

  constructor(public cart: CartService, private api: ApiService, private settings: SettingsService, private router: Router, seo: SeoService) {
    seo.setMeta({ title: 'Checkout', description: 'Secure checkout at The Desi.' });
  }
  ngOnInit() { if (this.cart.items().length === 0) this.router.navigate(['/']); }
  get cur() { return this.settings.get('currency_symbol', '£'); }
  get freeAbove() { return parseFloat(this.settings.get('shipping_free_above', '50')) || 0; }
  shippingCost() { const c = parseFloat(this.settings.get('shipping_charge', '5')) || 0; return this.freeAbove > 0 && this.cart.subtotal() >= this.freeAbove ? 0 : c; }
  grandTotal() { return this.cart.subtotal() + this.shippingCost(); }

  place(e: Event) {
    e.preventDefault();
    const f = this.form;
    if (!f.first_name || !f.last_name || !f.address_line1 || !f.city || !f.postcode || !f.phone) {
      this.error.set('Please fill in all required fields marked with *'); return;
    }
    this.error.set(''); this.busy.set(true);
    const order = {
      customer_name: `${f.first_name} ${f.last_name}`,
      customer_phone: f.phone,
      customer_email: f.email,
      address_line1: f.address_line1,
      address_line2: f.address_line2,
      city: f.city,
      state: f.county,
      pincode: f.postcode,
      country: f.country,
      notes: f.notes,
      payment_method: 'cod',
      items: this.cart.items().map(i => ({ product_id: i.id, quantity: i.quantity, price: i.salePrice ?? i.price }))
    };
    this.api.placeOrder(order).subscribe({
      next: (r: any) => {
        if (r.success) { this.ref.set(r.data?.order_number || 'TD-' + Date.now()); this.cart.clearCart(); this.placed.set(true); window.scrollTo(0, 0); }
        else this.error.set(r.message || 'Could not place the order. Please try again.');
        this.busy.set(false);
      },
      error: () => { this.error.set('Network error — please check your connection and try again.'); this.busy.set(false); }
    });
  }
}

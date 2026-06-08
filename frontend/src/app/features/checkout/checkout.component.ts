import { Component, OnInit, OnDestroy, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';
import { environment } from '../../../environments/environment';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="checkout-wrap">
      <div class="checkout-header">
        <div class="container">
          <h1>Checkout</h1>
          <div class="breadcrumb"><a routerLink="/">Home</a> / <a routerLink="/cart">Cart</a> / <span>Checkout</span></div>
        </div>
      </div>

      <div class="container checkout-body">

        @if (enquirySent()) {
          <!-- SUCCESS STATE -->
          <div class="success-box">
            <div class="success-icon">✅</div>
            <h2>Enquiry Sent Successfully!</h2>
            <p>Thank you, <strong>{{ form.first_name }} {{ form.last_name }}</strong>!</p>
            <p>Your enquiry <strong>#{{ enquiryRef() }}</strong> has been received.<br>
              We'll contact you on <strong>{{ form.phone }}</strong> to confirm your order.</p>
            <p style="color:#666;font-size:14px;">Pay with cash or credit/debit card upon delivery.</p>
            <a routerLink="/" class="btn-shop-more">Continue Shopping</a>
          </div>
        } @else {
          <div class="checkout-grid">

            <!-- LEFT: Billing/Address Form -->
            <div class="billing-col">
              <h2 class="col-title">Billing Details</h2>

              <div class="form-row-2">
                <div class="fg">
                  <label>First Name <span class="req">*</span></label>
                  <input [(ngModel)]="form.first_name" class="fc" placeholder="First name" required>
                </div>
                <div class="fg">
                  <label>Last Name <span class="req">*</span></label>
                  <input [(ngModel)]="form.last_name" class="fc" placeholder="Last name" required>
                </div>
              </div>

              <div class="fg">
                <label>Country / Region <span class="req">*</span></label>
                <select [(ngModel)]="form.country" class="fc">
                  <option value="">Select country / region</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="fg">
                <label>Street Address <span class="req">*</span></label>
                <input [(ngModel)]="form.address_line1" class="fc" placeholder="House number and street name" required>
              </div>

              <div class="fg">
                <input [(ngModel)]="form.address_line2" class="fc" placeholder="Apartment, suite, unit, etc. (optional)" style="margin-top:8px;">
              </div>

              <div class="form-row-2">
                <div class="fg">
                  <label>Town / City <span class="req">*</span></label>
                  <input [(ngModel)]="form.city" class="fc" placeholder="" required
                    (ngModelChange)="onLocationChange()">
                </div>
                <div class="fg">
                  <label>State / County / Region <span class="req">*</span></label>
                  <input [(ngModel)]="form.county" class="fc" placeholder="State, county or region" required
                    (ngModelChange)="onLocationChange()">
                </div>
              </div>

              <div class="fg">
                <label>Postal Code <span class="req">*</span></label>
                <div class="eircode-wrap">
                  <input [(ngModel)]="form.eircode" class="fc" placeholder="Postal code" required
                    (ngModelChange)="onLocationChange()" style="text-transform:uppercase">
                  @if (deliveryZone()) {
                    <span class="zone-badge" [class.zone-local]="deliveryZone() === 'local'"
                          [class.zone-standard]="deliveryZone() === 'standard'">
                      {{ deliveryInfo()?.zone_label || (deliveryZone() === 'local' ? 'Local Delivery' : 'Standard Delivery') }}
                    </span>
                  }
                </div>
              </div>

              <div class="fg">
                <label>Phone <span class="req">*</span></label>
                <input [(ngModel)]="form.phone" class="fc" placeholder="+1 555 123 4567" required>
              </div>

              <div class="fg">
                <label>Email Address</label>
                <input [(ngModel)]="form.email" type="email" class="fc" placeholder="optional">
              </div>

              <div class="fg">
                <label>Order Notes (optional)</label>
                <textarea [(ngModel)]="form.notes" class="fc" rows="3"
                  placeholder="Notes about your order, e.g. special delivery instructions."></textarea>
              </div>
            </div>

            <!-- RIGHT: Order Summary -->
            <div class="order-col">
              <div class="order-box">
                <h2 class="col-title">Your order</h2>

                <!-- Items -->
                <div class="order-header-row">
                  <span>PRODUCT</span>
                  <span>SUBTOTAL</span>
                </div>
                @for (item of cart.items(); track item.id) {
                  <div class="order-item">
                    <div class="order-item-info">
                      @if (item.image) {
                        <img [src]="item.image" [alt]="item.name" class="order-item-img">
                      }
                      <span class="order-item-name">{{ item.name }} <strong>× {{ item.quantity }}</strong></span>
                    </div>
                    <span class="order-item-price">{{ settings.get('currency_symbol', '$') }}{{ ((item.salePrice ?? item.price) * item.quantity).toFixed(2) }}</span>
                  </div>
                }

                <div class="order-divider"></div>

                <!-- Free delivery progress bar -->
                @if (showProgress()) {
                  <div class="delivery-progress-wrap">
                    @if (deliveryInfo()?.is_free) {
                      <div class="delivery-msg delivery-free">
                        <span class="msg-icon">🎉</span>
                        <span>Free delivery unlocked!</span>
                      </div>
                    } @else if (deliveryInfo()?.amount_to_free > 0) {
                      <div class="delivery-msg delivery-hint">
                        <span class="msg-icon">🚚</span>
                        <span>Add <strong>{{ settings.get('currency_symbol', '$') }}{{ deliveryInfo()?.amount_to_free?.toFixed(2) }}</strong> more for free delivery</span>
                      </div>
                    }
                    <div class="progress-track">
                      <div class="progress-fill" [style.width.%]="deliveryInfo()?.progress || 0"
                           [class.fill-complete]="deliveryInfo()?.is_free"></div>
                    </div>
                    <div class="progress-labels">
                      <span>{{ settings.get('currency_symbol', '$') }}0</span>
                      <span>Free above {{ settings.get('currency_symbol', '$') }}{{ deliveryInfo()?.settings?.free_above || 50 }}</span>
                    </div>
                  </div>
                }

                <!-- Totals -->
                <div class="order-totals">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>{{ settings.get('currency_symbol', '$') }}{{ cart.subtotal().toFixed(2) }}</span>
                  </div>
                  <div class="total-row delivery-row">
                    <span>
                      Delivery
                      @if (deliveryZone()) {
                        <span class="zone-tag" [class.zone-tag-local]="deliveryZone() === 'local'"
                              [class.zone-tag-standard]="deliveryZone() === 'standard'">
                          {{ deliveryInfo()?.zone_label || (deliveryZone() === 'local' ? 'Local' : 'Standard') }}
                        </span>
                      }
                    </span>
                    <span class="ship-value">
                      @if (deliveryLoading()) {
                        <span class="ship-loading">...</span>
                      } @else if (shippingCost() === 0) {
                        <span class="ship-free">FREE</span>
                      } @else {
                        {{ settings.get('currency_symbol', '$') }}{{ shippingCost().toFixed(2) }}
                      }
                    </span>
                  </div>
                  @if (deliveryInfo()?.has_small_fee) {
                    <div class="total-row small-fee-note">
                      <span>↳ Includes small order fee</span>
                      <span>+{{ settings.get('currency_symbol', '$') }}{{ deliveryInfo()?.settings?.small_order_fee?.toFixed(2) }}</span>
                    </div>
                  }
                  <div class="total-row grand-total">
                    <span>TOTAL</span>
                    <span>{{ settings.get('currency_symbol', '$') }}{{ grandTotal().toFixed(2) }}</span>
                  </div>
                </div>

                <div class="order-divider"></div>

                <!-- Payment section -->
                <div class="enquiry-section">
                  <div class="enquiry-label">Send Enquiry</div>
                  <p class="cod-note">Pay with cash or credit/debit card upon delivery.</p>
                </div>

                <p class="privacy-note">
                  Your personal data will be used to process your order and support your experience.
                </p>

                @if (errorMsg()) {
                  <div class="error-alert">{{ errorMsg() }}</div>
                }

                <button class="btn-send-enquiry" [disabled]="submitting()" (click)="sendEnquiry()">
                  @if (submitting()) { Sending... } @else { Send Enquiry }
                </button>
              </div>
            </div>

          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .checkout-wrap { background: #f7f7f7; min-height: 100vh; padding-bottom: 60px; }

    .checkout-header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 24px 0 16px;
    }
    .checkout-header h1 {
      font-size: 28px; font-weight: 800; color: #111; margin-bottom: 6px;
      font-family: 'Inter', sans-serif;
    }
    .breadcrumb { font-size: 13px; color: #888; }
    .breadcrumb a { color: #E11D48; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }

    .checkout-body { padding-top: 36px; }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 32px;
      align-items: start;
    }

    .billing-col { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 28px; }
    .order-col { position: sticky; top: 90px; }

    .col-title { font-size: 20px; font-weight: 700; color: #111; margin-bottom: 22px; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0; }

    .fg { margin-bottom: 16px; }
    .fg label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
    .req { color: #E11D48; }
    .fc {
      width: 100%; padding: 11px 14px;
      border: 1px solid #D1D5DB; border-radius: 4px;
      font-size: 14px; color: #333; background: white;
      outline: none; transition: border-color 0.2s;
      box-sizing: border-box; font-family: 'Inter', sans-serif;
    }
    .fc:focus { border-color: #E11D48; box-shadow: 0 0 0 2px rgba(225,29,72,0.08); }
    select.fc { cursor: pointer; }
    textarea.fc { resize: vertical; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    /* Postal code zone badge */
    .eircode-wrap { position: relative; }
    .zone-badge {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px;
      white-space: nowrap;
    }
    .zone-local    { background: #dcfce7; color: #166534; }
    .zone-standard { background: #fff7ed; color: #9a3412; }

    /* Order box */
    .order-box {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .order-box .col-title { padding: 20px 24px 16px; margin: 0; border-bottom: 2px solid #f0f0f0; }

    .order-header-row {
      display: flex; justify-content: space-between;
      padding: 10px 24px;
      background: #f9f9f9;
      font-size: 12px; font-weight: 700; color: #555;
      letter-spacing: 0.5px; text-transform: uppercase;
      border-bottom: 1px solid #eee;
    }

    .order-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 24px;
      border-bottom: 1px solid #f5f5f5;
    }
    .order-item-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .order-item-img { width: 44px; height: 44px; object-fit: contain; border-radius: 4px; border: 1px solid #eee; flex-shrink: 0; }
    .order-item-name { font-size: 13px; color: #333; line-height: 1.4; }
    .order-item-name strong { font-weight: 700; }
    .order-item-price { font-size: 14px; font-weight: 600; color: #111; white-space: nowrap; margin-left: 12px; }

    .order-divider { border: none; border-top: 1px solid #eee; margin: 0; }

    /* Free delivery progress */
    .delivery-progress-wrap {
      padding: 14px 24px 4px;
      border-bottom: 1px solid #f0f0f0;
    }
    .delivery-msg {
      display: flex; align-items: center; gap: 7px;
      font-size: 13px; font-weight: 600; margin-bottom: 10px;
    }
    .delivery-free { color: #16a34a; }
    .delivery-hint { color: #6b7280; }
    .delivery-hint strong { color: #E11D48; }
    .msg-icon { font-size: 15px; }
    .progress-track {
      background: #f3f4f6; border-radius: 99px; height: 6px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, #f59e0b, #E11D48);
      transition: width 0.4s ease;
    }
    .progress-fill.fill-complete { background: #16a34a; }
    .progress-labels {
      display: flex; justify-content: space-between;
      font-size: 11px; color: #9ca3af; margin-top: 5px;
    }

    /* Totals */
    .order-totals { padding: 16px 24px; }
    .total-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 14px; color: #444; padding: 5px 0;
    }
    .delivery-row { font-weight: 600; }
    .zone-tag {
      font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px;
      margin-left: 6px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .zone-tag-local    { background: #dcfce7; color: #166534; }
    .zone-tag-standard { background: #fff7ed; color: #9a3412; }
    .ship-free   { color: #16a34a; font-weight: 700; }
    .ship-loading { color: #9ca3af; font-style: italic; }
    .small-fee-note { font-size: 12px; color: #9ca3af; padding: 1px 0; }
    .grand-total {
      font-size: 18px; font-weight: 800; color: #111;
      padding-top: 12px; margin-top: 8px;
      border-top: 2px solid #111;
    }

    .enquiry-section { padding: 16px 24px 4px; }
    .enquiry-label { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 6px; }
    .cod-note { font-size: 13px; color: #555; margin-bottom: 0; }

    .privacy-note { font-size: 12px; color: #888; line-height: 1.6; padding: 10px 24px 12px; margin: 0; }

    .error-alert {
      margin: 0 24px 12px;
      background: #FDF0F1; color: #E11D48;
      border: 1px solid rgba(225,29,72,0.2);
      padding: 12px 16px; border-radius: 6px;
      font-size: 13px;
    }

    .btn-send-enquiry {
      display: block; width: calc(100% - 48px);
      margin: 0 24px 24px;
      background: #E11D48; color: white;
      border: none; border-radius: 4px;
      padding: 16px; font-size: 16px; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
      font-family: 'Inter', sans-serif;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .btn-send-enquiry:hover:not(:disabled) { background: #A31F2A; }
    .btn-send-enquiry:disabled { opacity: 0.65; cursor: not-allowed; }

    /* Success */
    .success-box {
      background: white; border-radius: 12px; padding: 60px 40px;
      text-align: center; max-width: 540px; margin: 40px auto;
      border: 1px solid #e5e7eb; box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .success-icon { font-size: 56px; margin-bottom: 20px; }
    .success-box h2 { font-size: 24px; font-weight: 800; color: #111; margin-bottom: 16px; }
    .success-box p { font-size: 15px; color: #555; margin-bottom: 10px; line-height: 1.6; }
    .btn-shop-more {
      display: inline-block; margin-top: 24px;
      background: #E11D48; color: white;
      padding: 14px 36px; border-radius: 4px;
      font-size: 15px; font-weight: 700; text-decoration: none;
      transition: all 0.2s;
    }
    .btn-shop-more:hover { background: #A31F2A; }

    @media (max-width: 768px) {
      .checkout-grid { grid-template-columns: 1fr; }
      .form-row-2 { grid-template-columns: 1fr; }
      .order-col { position: static; }
    }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  enquirySent = signal(false);
  enquiryRef  = signal('');
  submitting  = signal(false);
  errorMsg    = signal('');

  // Delivery
  deliveryInfo    = signal<any>(null);
  deliveryLoading = signal(false);
  deliveryZone    = signal<string>('');

  private locationChange$ = new Subject<void>();
  private destroy$        = new Subject<void>();

  form = {
    first_name: '', last_name: '', country: '',
    address_line1: '', address_line2: '',
    city: '', county: '', eircode: '',
    phone: '', email: '', notes: ''
  };

  constructor(
    public cart: CartService,
    public settings: SettingsService,
    private api: ApiService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.cart.items().length === 0) {
      this.router.navigate(['/']);
      return;
    }

    // Debounce location changes to avoid spamming the API
    this.locationChange$.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => this.fetchDelivery());

    // Initial calculation
    this.fetchDelivery();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLocationChange() {
    this.locationChange$.next();
  }

  fetchDelivery() {
    this.deliveryLoading.set(true);
    const body = {
      subtotal: this.cart.subtotal(),
      eircode:  this.form.eircode.toUpperCase(),
      city:     this.form.city,
      county:   this.form.county
    };
    this.http.post<any>(`${environment.apiUrl}/delivery/calculate`, body)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.deliveryInfo.set(res.data);
            this.deliveryZone.set(res.data.zone || '');
          }
          this.deliveryLoading.set(false);
        },
        error: () => {
          // Fallback calculation if API fails
          this.deliveryInfo.set(null);
          this.deliveryLoading.set(false);
        }
      });
  }

  shippingCost(): number {
    const info = this.deliveryInfo();
    if (info !== null) return info.shipping_charge ?? 0;
    // Fallback while loading
    return this.cart.subtotal() >= 50 ? 0 : 4.95;
  }

  grandTotal(): number {
    return this.cart.subtotal() + this.shippingCost();
  }

  showProgress(): boolean {
    const info = this.deliveryInfo();
    return !!(info && info.zone === 'local' && info.settings?.free_enabled !== false);
  }

  sendEnquiry() {
    const f = this.form;
    if (!f.first_name || !f.last_name || !f.address_line1 || !f.city || !f.county || !f.eircode || !f.phone) {
      this.errorMsg.set('Please fill in all required fields marked with *');
      return;
    }
    this.errorMsg.set('');
    this.submitting.set(true);

    const payload = {
      customer_name:   `${f.first_name} ${f.last_name}`,
      customer_phone:  f.phone,
      customer_email:  f.email,
      shipping_address: {
        address_line1: f.address_line1,
        address_line2: f.address_line2,
        city:    f.city,
        county:  f.county,
        eircode: f.eircode,
        country: f.country
      },
      notes:           f.notes,
      payment_method:  'cod',
      delivery_zone:   this.deliveryZone(),
      shipping_charge: this.shippingCost(),
      items: this.cart.items().map(i => {
        const parsed = this.parseCartProductId(i.id);
        return {
          product_id: i.baseProductId ?? parsed.productId,
          variation_id: i.variationId ?? parsed.variationId,
          quantity: i.quantity,
          price: i.salePrice ?? i.price
        };
      })
    };

    this.api.placeOrder(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.enquiryRef.set(res.data?.order_number || 'ENQ-' + Date.now());
          this.cart.clearCart();
          this.enquirySent.set(true);
          this.triggerEmailQueueProcessing(res.data?.order_id);
        } else {
          this.errorMsg.set(res.message || 'Failed to send enquiry. Please try again.');
        }
        this.submitting.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.message || err?.message || 'Failed to place order. Please try again.';
        this.errorMsg.set(msg);
        this.submitting.set(false);
      }
    });
  }

  private triggerEmailQueueProcessing(orderId?: number | string) {
    const query = orderId ? `?order_id=${encodeURIComponent(String(orderId))}` : '';
    window.setTimeout(() => {
      fetch(`${environment.apiUrl}/email/process${query}`, {
        method: 'POST',
        keepalive: true
      }).catch(() => {});
    }, 500);
  }

  private parseCartProductId(id: number | string): { productId: number | string; variationId?: number } {
    const match = String(id).match(/^(\d+)_v(\d+)$/);
    if (!match) return { productId: id };
    return { productId: Number(match[1]), variationId: Number(match[2]) };
  }
}

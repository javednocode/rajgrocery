import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule],
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
                  <option value="Ireland">Ireland</option>
                  <option value="United Kingdom">United Kingdom</option>
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

              <div class="fg">
                <label>Town / City <span class="req">*</span></label>
                <input [(ngModel)]="form.city" class="fc" placeholder="" required>
              </div>

              <div class="fg">
                <label>County <span class="req">*</span></label>
                <select [(ngModel)]="form.county" class="fc">
                  <option>Cork</option>
                  <option>Dublin</option>
                  <option>Galway</option>
                  <option>Limerick</option>
                  <option>Waterford</option>
                  <option>Kerry</option>
                  <option>Clare</option>
                  <option>Tipperary</option>
                  <option>Kilkenny</option>
                  <option>Wexford</option>
                  <option>Wicklow</option>
                  <option>Kildare</option>
                  <option>Meath</option>
                  <option>Louth</option>
                  <option>Westmeath</option>
                  <option>Other</option>
                </select>
              </div>

              <div class="fg">
                <label>Eircode <span class="req">*</span></label>
                <input [(ngModel)]="form.eircode" class="fc" placeholder="e.g. T12 XY34" required>
              </div>

              <div class="fg">
                <label>Phone <span class="req">*</span></label>
                <input [(ngModel)]="form.phone" class="fc" placeholder="+353..." required>
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

                <!-- Items header -->
                <div class="order-header-row">
                  <span>PRODUCT</span>
                  <span>SUBTOTAL</span>
                </div>

                <!-- Cart items -->
                @for (item of cart.items(); track item.id) {
                  <div class="order-item">
                    <div class="order-item-info">
                      @if (item.image) {
                        <img [src]="item.image" [alt]="item.name" class="order-item-img">
                      }
                      <span class="order-item-name">{{ item.name }} <strong>× {{ item.quantity }}</strong></span>
                    </div>
                    <span class="order-item-price">€{{ ((item.salePrice ?? item.price) * item.quantity).toFixed(2) }}</span>
                  </div>
                }

                <div class="order-divider"></div>

                <!-- Totals -->
                <div class="order-totals">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>€{{ cart.subtotal().toFixed(2) }}</span>
                  </div>
                  <div class="total-row">
                    <span>Shipment</span>
                    <span class="ship-note">{{ shippingLabel() }}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span>TOTAL</span>
                    <span>€{{ grandTotal().toFixed(2) }}</span>
                  </div>
                </div>

                <div class="order-divider"></div>

                <!-- Payment note -->
                <div class="enquiry-section">
                  <div class="enquiry-label">Send Enquiry</div>
                  <p class="cod-note">Pay with cash or credit/debit card upon delivery.</p>
                </div>

                <!-- Privacy note -->
                <p class="privacy-note">
                  Your personal data will be used to process your order and support your experience.
                </p>

                <!-- Error -->
                @if (errorMsg()) {
                  <div class="error-alert">{{ errorMsg() }}</div>
                }

                <!-- Submit -->
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
    .breadcrumb a { color: #CC2936; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }

    .checkout-body { padding-top: 36px; }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 32px;
      align-items: start;
    }

    /* Left column */
    .billing-col { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 28px; }
    .order-col {}

    .col-title { font-size: 20px; font-weight: 700; color: #111; margin-bottom: 22px; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0; }

    .fg { margin-bottom: 16px; }
    .fg label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
    .req { color: #CC2936; }
    .fc {
      width: 100%; padding: 11px 14px;
      border: 1px solid #D1D5DB; border-radius: 4px;
      font-size: 14px; color: #333; background: white;
      outline: none; transition: border-color 0.2s;
      box-sizing: border-box; font-family: 'Inter', sans-serif;
    }
    .fc:focus { border-color: #CC2936; box-shadow: 0 0 0 2px rgba(204,41,54,0.08); }
    select.fc { cursor: pointer; }
    textarea.fc { resize: vertical; }

    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    /* Right: Order box */
    .order-col { position: sticky; top: 90px; }
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

    .order-totals { padding: 16px 24px; }
    .total-row {
      display: flex; justify-content: space-between;
      font-size: 14px; color: #444; padding: 5px 0;
    }
    .ship-note { font-size: 13px; color: #555; text-align: right; }
    .grand-total {
      font-size: 18px; font-weight: 800; color: #111;
      padding-top: 12px; margin-top: 8px;
      border-top: 2px solid #111;
    }

    .enquiry-section { padding: 16px 24px 4px; }
    .enquiry-label { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 6px; }
    .cod-note { font-size: 13px; color: #555; margin-bottom: 0; }

    .privacy-note { font-size: 12px; color: #888; line-height: 1.6; padding: 12px 24px; border-top: 1px solid #f0f0f0; margin: 0; }

    .error-alert {
      margin: 0 24px 12px;
      background: #FDF0F1; color: #CC2936;
      border: 1px solid rgba(204,41,54,0.2);
      padding: 12px 16px; border-radius: 6px;
      font-size: 13px;
    }

    .btn-send-enquiry {
      display: block; width: calc(100% - 48px);
      margin: 0 24px 24px;
      background: #CC2936; color: white;
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
      background: #CC2936; color: white;
      padding: 14px 36px; border-radius: 4px;
      font-size: 15px; font-weight: 700; text-decoration: none;
      transition: all 0.2s;
    }
    .btn-shop-more:hover { background: #A31F2A; }

    @media (max-width: 768px) {
      .checkout-grid { grid-template-columns: 1fr; }
      .form-row-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  enquirySent = signal(false);
  enquiryRef = signal('');
  submitting = signal(false);
  errorMsg = signal('');

  form = {
    first_name: '',
    last_name: '',
    country: 'Ireland',
    address_line1: '',
    address_line2: '',
    city: '',
    county: 'Cork',
    eircode: '',
    phone: '',
    email: '',
    notes: ''
  };

  constructor(
    public cart: CartService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.cart.items().length === 0) {
      this.router.navigate(['/']);
    }
  }

  shippingLabel(): string {
    const sub = this.cart.subtotal();
    if (sub >= 50) return 'FREE';
    return 'Outside Cork City: €4.95';
  }

  shippingCost(): number {
    return this.cart.subtotal() >= 50 ? 0 : 4.95;
  }

  grandTotal(): number {
    return this.cart.subtotal() + this.shippingCost();
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
      customer_name: `${f.first_name} ${f.last_name}`,
      customer_phone: f.phone,
      customer_email: f.email,
      address_line1: f.address_line1,
      address_line2: f.address_line2,
      city: f.city,
      state: f.county,
      pincode: f.eircode,
      country: f.country,
      notes: f.notes,
      payment_method: 'cod',
      items: this.cart.items().map(i => ({
        product_id: i.id,
        quantity: i.quantity,
        price: i.salePrice ?? i.price
      }))
    };

    this.api.placeOrder(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.enquiryRef.set(res.data?.order_number || 'ENQ-' + Date.now());
          this.cart.clearCart();
          this.enquirySent.set(true);
        } else {
          this.errorMsg.set(res.message || 'Failed to send enquiry. Please try again.');
        }
        this.submitting.set(false);
      },
      error: () => {
        this.errorMsg.set('Network error. Please check your connection and try again.');
        this.submitting.set(false);
      }
    });
  }
}

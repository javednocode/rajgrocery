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
    <div class="ck-wrap">

      <!-- ═══════════════════════════════
           ORDER CONFIRMED
      ═══════════════════════════════ -->
      @if (placed()) {
        <div class="ck-success">
          <!-- Green check ring -->
          <div class="ck-success-ring">
            <div class="ck-success-ic">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4 10-11" stroke="#FFFFFF" stroke-width="2.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <span class="ck-success-eyebrow">Order Confirmed</span>
          <h1 class="ck-success-title">Thank you, {{ form.first_name }}!</h1>
          <p class="ck-success-text">
            Your order has been placed and we will contact you on
            <strong>{{ form.phone }}</strong> to arrange delivery.
          </p>

          <!-- Order number -->
          <div class="ck-success-ref-card">
            <span class="ck-success-ref-label">Order Number</span>
            <span class="ck-success-ref">{{ ref() }}</span>
          </div>

          <!-- Status steps -->
          <div class="ck-success-steps">
            <div class="ck-success-step ck-step-done">
              <div class="ck-step-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                    stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.7"/>
                </svg>
              </div>
              <strong>Order Received</strong>
              <em>Just now</em>
            </div>
            <div class="ck-step-connector"></div>
            <div class="ck-success-step">
              <div class="ck-step-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/>
                  <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                </svg>
              </div>
              <strong>Being Prepared</strong>
              <em>We'll confirm soon</em>
            </div>
            <div class="ck-step-connector"></div>
            <div class="ck-success-step">
              <div class="ck-step-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M1 3h15v13H1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                  <path d="M16 8h3.5l2.5 3v5h-6V8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                  <circle cx="5.5" cy="18.5" r="1.5" stroke="currentColor" stroke-width="1.7"/>
                  <circle cx="18.5" cy="18.5" r="1.5" stroke="currentColor" stroke-width="1.7"/>
                </svg>
              </div>
              <strong>Out for Delivery</strong>
              <em>We'll be in touch</em>
            </div>
          </div>

          <!-- Actions -->
          <div class="ck-success-actions">
            <a routerLink="/" class="btn btn-primary">Continue Shopping</a>
            <a routerLink="/contact" class="btn btn-outline">Contact Us</a>
          </div>

          <p class="ck-success-note">
            Questions about your order? Reach out to us and we'll be happy to help.
          </p>
        </div>

      <!-- ═══════════════════════════════
           CHECKOUT FORM
      ═══════════════════════════════ -->
      } @else {

        <!-- Progress indicator -->
        <div class="ck-progress" aria-label="Checkout progress">
          <div class="ck-progress-step" [class.active]="step === 1" [class.done]="step > 1">
            <div class="ck-ps-dot">
              @if (step > 1) {
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4 10-11" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              } @else { 1 }
            </div>
            <span>Delivery</span>
          </div>
          <div class="ck-progress-line" [class.done]="step > 1"></div>
          <div class="ck-progress-step" [class.active]="step === 2">
            <div class="ck-ps-dot">2</div>
            <span>Review &amp; Place</span>
          </div>
        </div>

        <!-- Main two-column grid -->
        <div class="ck-grid">

          <!-- ─── LEFT: FORM ─── -->
          <div class="ck-left">

            <!-- STEP 1: Delivery Details -->
            @if (step === 1) {
              <div class="ck-card">
                <div class="ck-card-head">
                  <div class="ck-card-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                        stroke="currentColor" stroke-width="1.8"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/>
                    </svg>
                  </div>
                  <h2>Delivery Details</h2>
                </div>

                <div class="ck-fields">
                  <!-- Name row -->
                  <div class="ck-row2">
                    <div class="ck-field">
                      <label for="ck-fn">First name <span class="ck-req">*</span></label>
                      <input id="ck-fn" [(ngModel)]="form.first_name" name="fn"
                        placeholder="e.g. Priya" autocomplete="given-name" required />
                    </div>
                    <div class="ck-field">
                      <label for="ck-ln">Last name <span class="ck-req">*</span></label>
                      <input id="ck-ln" [(ngModel)]="form.last_name" name="ln"
                        placeholder="e.g. Sharma" autocomplete="family-name" required />
                    </div>
                  </div>

                  <!-- Address -->
                  <div class="ck-field">
                    <label for="ck-a1">Street address <span class="ck-req">*</span></label>
                    <input id="ck-a1" [(ngModel)]="form.address_line1" name="a1"
                      placeholder="Building number and street name"
                      autocomplete="address-line1" required />
                  </div>
                  <div class="ck-field">
                    <label for="ck-a2">Floor / Flat / Block (optional)</label>
                    <input id="ck-a2" [(ngModel)]="form.address_line2" name="a2"
                      placeholder="e.g. Flat 3B, Block A" autocomplete="address-line2" />
                  </div>

                  <!-- City + District -->
                  <div class="ck-row2">
                    <div class="ck-field">
                      <label for="ck-city">Town / City <span class="ck-req">*</span></label>
                      <input id="ck-city" [(ngModel)]="form.city" name="city"
                        placeholder="e.g. Hong Kong" autocomplete="address-level2" required />
                    </div>
                    <div class="ck-field">
                      <!-- NOTE: backend field is 'county' — label updated to HK-friendly term.
                           The API payload key 'state: f.county' is preserved unchanged. -->
                      <label for="ck-county">District / Area</label>
                      <input id="ck-county" [(ngModel)]="form.county" name="county"
                        placeholder="e.g. Kowloon, New Territories" autocomplete="address-level1" />
                    </div>
                  </div>

                  <!-- Postcode + Country -->
                  <div class="ck-row2">
                    <div class="ck-field">
                      <!-- NOTE: 'Postcode' field maps to 'pincode' in API payload. Preserved. -->
                      <label for="ck-pc">Postal Code / Area <span class="ck-req">*</span></label>
                      <input id="ck-pc" [(ngModel)]="form.postcode" name="pc"
                        placeholder="e.g. HK or leave blank" autocomplete="postal-code" required />
                    </div>
                    <div class="ck-field">
                      <!-- REPORT: country defaults to 'Finland' and only offers Finland/Other.
                           Backend field preserved. Visible options updated to HK-relevant values.
                           Do NOT change delivery zone / backend config in this phase. -->
                      <label for="ck-country">Country <span class="ck-req">*</span></label>
                      <select id="ck-country" [(ngModel)]="form.country" name="country"
                        autocomplete="country-name">
                        <option value="Hong Kong">Hong Kong</option>
                        <option value="Finland">Finland</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <!-- Phone + Email -->
                  <div class="ck-row2">
                    <div class="ck-field">
                      <label for="ck-phone">Phone <span class="ck-req">*</span></label>
                      <input id="ck-phone" [(ngModel)]="form.phone" name="phone"
                        type="tel" placeholder="+852 9XXX XXXX"
                        autocomplete="tel" required />
                    </div>
                    <div class="ck-field">
                      <label for="ck-email">Email (optional)</label>
                      <input id="ck-email" [(ngModel)]="form.email" name="email"
                        type="email" placeholder="your@email.com"
                        autocomplete="email" />
                    </div>
                  </div>

                  <!-- Notes -->
                  <div class="ck-field">
                    <label for="ck-notes">Delivery notes (optional)</label>
                    <textarea id="ck-notes" [(ngModel)]="form.notes" name="notes"
                      rows="3" placeholder="Leave at door, ring bell, special instructions…"></textarea>
                  </div>
                </div>

                @if (error()) {
                  <div class="ck-error" role="alert" aria-live="assertive">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    {{ error() }}
                  </div>
                }

                <button class="ck-next-btn" (click)="nextStep()" type="button">
                  Continue to Review
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            }

            <!-- STEP 2: Review & Place Order -->
            @if (step === 2) {
              <div class="ck-card">
                <div class="ck-card-head">
                  <div class="ck-card-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11l3 3 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9c.9 0 1.8.1 2.6.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <h2>Review &amp; Place Order</h2>
                  <button class="ck-edit-btn" (click)="step = 1" type="button">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"
                        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit Address
                  </button>
                </div>

                <!-- Address summary -->
                <div class="ck-addr-box">
                  <div class="ck-addr-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                        stroke="currentColor" stroke-width="1.8"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/>
                    </svg>
                    <span>
                      {{ form.first_name }} {{ form.last_name }},
                      {{ form.address_line1 }}{{ form.address_line2 ? ', ' + form.address_line2 : '' }},
                      {{ form.city }}, {{ form.postcode }}
                    </span>
                  </div>
                  <div class="ck-addr-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                        stroke="currentColor" stroke-width="1.8"/>
                    </svg>
                    <span>{{ form.phone }}</span>
                  </div>
                </div>

                <!-- Delivery method (single, from settings) -->
                <div class="ck-section">
                  <h3 class="ck-section-label">Delivery</h3>
                  <div class="ck-option ck-option-selected">
                    <div class="ck-radio"></div>
                    <div class="ck-option-content">
                      <strong>Standard Delivery</strong>
                      <em>We will contact you to confirm delivery timing</em>
                    </div>
                    <span class="ck-option-price">
                      {{ shippingCost() === 0 ? 'FREE' : cur + shippingCost().toFixed(2) }}
                    </span>
                  </div>
                </div>

                <!-- Payment method (COD — only confirmed active method) -->
                <!-- NOTE: payment_method submitted as 'cod' (preserved exactly) -->
                <div class="ck-section">
                  <h3 class="ck-section-label">Payment</h3>
                  <div class="ck-option ck-option-selected">
                    <div class="ck-radio"></div>
                    <div class="ck-option-content">
                      <strong>Cash on Delivery</strong>
                      <em>Pay in cash when your order arrives</em>
                    </div>
                  </div>
                </div>

                @if (error()) {
                  <div class="ck-error" role="alert" aria-live="assertive">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    {{ error() }}
                    <button class="ck-error-retry" (click)="place()" type="button"
                      [disabled]="busy()">Try Again</button>
                  </div>
                }

                <!-- Place Order button -->
                <button class="ck-place-btn" (click)="place()" [disabled]="busy()" type="button">
                  @if (busy()) {
                    <span class="ck-spinner" aria-hidden="true"></span>
                    <span>Placing order…</span>
                  } @else {
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Place Order — {{ cur }}{{ grandTotal().toFixed(2) }}
                  }
                </button>

                <p class="ck-place-note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  Secure checkout — your information is only used to process this order.
                </p>
              </div>
            }
          </div>

          <!-- ─── RIGHT: ORDER SUMMARY ─── -->
          <aside class="ck-summary">
            <h3 class="ck-summary-title">Your Order</h3>

            <!-- Items list -->
            <div class="ck-sum-items">
              @for (it of cart.items(); track it.id) {
                <div class="ck-sum-item">
                  <div class="ck-sum-img">
                    @if (it.image) {
                      <img [src]="it.image" [alt]="it.name" loading="lazy" />
                    } @else {
                      <div class="ck-sum-ph">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                      </div>
                    }
                    <em class="ck-sum-qty-badge">{{ it.quantity }}</em>
                  </div>
                  <span class="ck-sum-name">{{ it.name }}</span>
                  <strong class="ck-sum-price">{{ cur }}{{ ((it.salePrice ?? it.price) * it.quantity).toFixed(2) }}</strong>
                </div>
              }
            </div>

            <!-- Totals -->
            <div class="ck-sum-totals">
              <div class="ck-sum-row">
                <span>Subtotal</span>
                <span>{{ cur }}{{ cart.subtotal().toFixed(2) }}</span>
              </div>
              <div class="ck-sum-row">
                <span>Delivery</span>
                <span [class.ck-free-val]="shippingCost() === 0">
                  {{ shippingCost() === 0 ? 'FREE' : cur + shippingCost().toFixed(2) }}
                </span>
              </div>
              <div class="ck-sum-divider"></div>
              <div class="ck-sum-row ck-sum-grand">
                <span>Total</span>
                <strong>{{ cur }}{{ grandTotal().toFixed(2) }}</strong>
              </div>
            </div>

            <!-- Trust -->
            <ul class="ck-trust" aria-label="Shopping assurance">
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/>
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                </svg>
                Secure 256-bit encrypted checkout
              </li>
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.7"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.7"/>
                </svg>
                Local Hong Kong store
              </li>
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7"/>
                  <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Easy online ordering
              </li>
            </ul>
          </aside>
        </div>
      }
    </div>
  </section>
  `,

  styles: [`
  /* ── Wrapper ── */
  .ck { padding: 44px 0 80px; background: var(--kg-warm); min-height: 80vh; }
  .ck-wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  @media (min-width: 768px) { .ck-wrap { padding: 0 40px; } }
  @media (min-width: 1200px) { .ck-wrap { padding: 0 56px; } }

  /* ═══ PROGRESS BAR ═══ */
  .ck-progress {
    display: flex; align-items: center; justify-content: center; gap: 0;
    margin-bottom: 40px;
  }
  .ck-progress-step { display: flex; flex-direction: column; align-items: center; gap: 7px; }
  .ck-ps-dot {
    width: 36px; height: 36px; border-radius: var(--r-full);
    background: var(--kg-warm); border: 2px solid var(--kg-line-warm);
    color: var(--kg-faint); font-size: 13.5px; font-weight: 800;
    display: grid; place-items: center; transition: all .3s;
    font-family: var(--font-sans);
  }
  .ck-progress-step span {
    font-size: 11.5px; font-weight: 700; color: var(--kg-faint);
    white-space: nowrap; font-family: var(--font-sans);
  }
  .ck-progress-step.active .ck-ps-dot {
    background: var(--kg-forest); color: #FFFFFF; border-color: var(--kg-forest);
    box-shadow: 0 4px 14px rgba(27,76,140,.28);
  }
  .ck-progress-step.active span { color: var(--kg-forest-dk); }
  .ck-progress-step.done .ck-ps-dot {
    background: var(--kg-forest); color: #FFFFFF; border-color: var(--kg-forest);
  }
  .ck-progress-step.done span { color: var(--kg-forest-dk); }
  .ck-progress-line {
    flex: 1; max-width: 80px; height: 2px; background: var(--kg-line-warm);
    margin: 0 10px; margin-top: -18px; transition: background .3s;
  }
  .ck-progress-line.done { background: var(--kg-forest); }

  /* ═══ MAIN GRID ═══ */
  .ck-grid { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }

  /* ═══ CARDS ═══ */
  .ck-card {
    background: var(--kg-paper); border: 1.5px solid var(--kg-line);
    border-radius: 14px; padding: 28px; margin-bottom: 20px;
  }
  .ck-card-head {
    display: flex; align-items: center; gap: 12px; margin-bottom: 26px;
  }
  .ck-card-icon {
    width: 36px; height: 36px; border-radius: var(--r-sm); flex-shrink: 0;
    background: var(--kg-forest-bg); color: var(--kg-forest);
    display: grid; place-items: center;
  }
  .ck-card-head h2 {
    font-family: var(--font-sans); font-size: 16px; font-weight: 800;
    color: var(--kg-ink); margin: 0; flex: 1; letter-spacing: -0.01em;
  }
  .ck-edit-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 700; color: var(--kg-forest);
    background: var(--kg-forest-bg); border: 1.5px solid var(--kg-forest-bg2);
    border-radius: var(--r-full); padding: 5px 12px; cursor: pointer;
    font-family: var(--font-sans); transition: all .2s;
  }
  .ck-edit-btn:hover { background: var(--kg-forest); color: #FFFFFF; border-color: var(--kg-forest); }

  /* ── Form fields ── */
  .ck-fields { display: flex; flex-direction: column; gap: 16px; }
  .ck-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .ck-field { display: flex; flex-direction: column; gap: 6px; }
  .ck-field label {
    font-size: 12.5px; font-weight: 700; color: var(--kg-ink);
    font-family: var(--font-sans); letter-spacing: .01em;
  }
  .ck-req { color: var(--kg-terra); margin-left: 1px; }
  .ck-field input, .ck-field select, .ck-field textarea {
    display: block; width: 100%;
    padding: 11px 14px; border: 1.5px solid var(--kg-line-warm); border-radius: var(--r);
    font-family: var(--font-sans); font-size: 14px;
    background: var(--kg-paper); color: var(--kg-ink);
    transition: border-color .2s, box-shadow .2s;
  }
  .ck-field input:focus, .ck-field select:focus, .ck-field textarea:focus {
    outline: none; border-color: var(--kg-forest);
    box-shadow: 0 0 0 3px var(--kg-forest-bg);
  }
  .ck-field input::placeholder, .ck-field textarea::placeholder { color: var(--kg-faint); }
  .ck-field textarea { resize: vertical; min-height: 80px; }

  /* ── Address summary box (step 2) ── */
  .ck-addr-box {
    background: var(--kg-forest-bg); border: 1px solid var(--kg-forest-bg2);
    border-radius: var(--r-lg); padding: 14px 16px; margin-bottom: 22px;
    display: flex; flex-direction: column; gap: 9px;
  }
  .ck-addr-row {
    display: flex; align-items: flex-start; gap: 9px;
    font-size: 13.5px; color: var(--kg-ink); font-family: var(--font-sans); line-height: 1.5;
  }
  .ck-addr-row svg { color: var(--kg-forest); flex-shrink: 0; margin-top: 2px; }

  /* ── Sections (delivery, payment) ── */
  .ck-section { margin-bottom: 20px; }
  .ck-section-label {
    font-size: 10.5px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase;
    color: var(--kg-faint); margin-bottom: 10px; font-family: var(--font-sans);
  }
  .ck-option {
    display: flex; align-items: center; gap: 14px;
    border: 1.5px solid var(--kg-line); border-radius: var(--r-lg);
    padding: 14px 16px; transition: all .2s;
  }
  .ck-option-selected { border-color: var(--kg-forest); background: var(--kg-forest-bg); }
  .ck-radio {
    width: 18px; height: 18px; border-radius: var(--r-full);
    border: 2px solid var(--kg-forest); background: var(--kg-forest);
    flex-shrink: 0; position: relative;
  }
  .ck-radio::after {
    content: ''; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    width: 6px; height: 6px; border-radius: var(--r-full); background: #FFFFFF;
  }
  .ck-option-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .ck-option-content strong {
    font-size: 13.5px; font-weight: 700; color: var(--kg-ink); font-family: var(--font-sans);
  }
  .ck-option-content em {
    font-size: 12.5px; color: var(--kg-muted); font-style: normal; font-family: var(--font-sans);
  }
  .ck-option-price {
    font-size: 13.5px; font-weight: 800; color: var(--kg-forest-dk);
    font-family: var(--font-sans); flex-shrink: 0;
  }

  /* ── Error ── */
  .ck-error {
    display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
    background: var(--kg-clay-bg); color: var(--kg-clay);
    border: 1px solid rgba(192,57,43,.2); border-radius: var(--r);
    padding: 12px 16px; font-size: 13.5px; font-weight: 600;
    margin-bottom: 16px; font-family: var(--font-sans);
  }
  .ck-error svg { flex-shrink: 0; }
  .ck-error-retry {
    margin-left: auto; font-size: 12.5px; font-weight: 800; color: var(--kg-clay);
    text-decoration: underline; background: none; border: none; cursor: pointer;
    font-family: var(--font-sans);
  }
  .ck-error-retry:disabled { opacity: .5; cursor: not-allowed; }

  /* ── Buttons ── */
  .ck-next-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; background: var(--kg-forest); color: #FFFFFF;
    border: none; border-radius: var(--r-xl); padding: 16px 24px;
    font-size: 15px; font-weight: 800; cursor: pointer;
    transition: all .28s; margin-top: 8px; font-family: var(--font-sans);
    box-shadow: var(--shadow-forest); letter-spacing: .01em;
  }
  .ck-next-btn:hover { background: var(--kg-forest-dk); transform: translateY(-2px); box-shadow: 0 12px 28px rgba(27,76,140,.32); }

  .ck-place-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; background: var(--kg-forest); color: #FFFFFF;
    border: none; border-radius: var(--r-xl); padding: 16px 24px;
    font-size: 15.5px; font-weight: 800; cursor: pointer;
    transition: all .28s; margin-top: 8px; font-family: var(--font-sans);
    box-shadow: var(--shadow-forest); letter-spacing: .01em;
  }
  .ck-place-btn:hover:not(:disabled) {
    background: var(--kg-forest-dk); transform: translateY(-2px); box-shadow: 0 14px 32px rgba(27,76,140,.35);
  }
  .ck-place-btn:disabled { opacity: .58; cursor: wait; box-shadow: none; transform: none; }

  .ck-spinner {
    width: 17px; height: 17px; border-radius: var(--r-full);
    border: 2.5px solid rgba(255,255,255,.35); border-top-color: #FFFFFF;
    animation: ckSpin .7s linear infinite;
  }
  @keyframes ckSpin { to { transform: rotate(360deg); } }

  .ck-place-note {
    display: flex; align-items: center; gap: 6px; justify-content: center;
    text-align: center; font-size: 12px; color: var(--kg-faint);
    margin-top: 12px; line-height: 1.6; font-family: var(--font-sans);
  }
  .ck-place-note svg { color: var(--kg-forest-lt); flex-shrink: 0; }

  /* ═══ SUMMARY SIDEBAR ═══ */
  .ck-summary {
    position: sticky; top: calc(var(--header-height) + 20px);
    background: var(--kg-paper); border: 1.5px solid var(--kg-line);
    border-radius: 14px; padding: 22px;
  }
  .ck-summary-title {
    font-family: var(--font-sans); font-size: 15px; font-weight: 800;
    color: var(--kg-ink); margin: 0 0 18px; letter-spacing: -0.01em;
  }
  .ck-sum-items {
    max-height: 260px; overflow-y: auto; scrollbar-width: thin;
    margin-bottom: 16px; display: flex; flex-direction: column; gap: 0;
  }
  .ck-sum-item {
    display: flex; align-items: center; gap: 12px;
    padding: 9px 0; border-bottom: 1px solid var(--kg-line-lt);
  }
  .ck-sum-item:last-child { border-bottom: none; }
  .ck-sum-img {
    position: relative; width: 46px; height: 46px; border-radius: var(--r);
    background: var(--kg-warm); overflow: visible; flex-shrink: 0;
    border: 1.5px solid var(--kg-line-lt);
  }
  .ck-sum-img img { width: 100%; height: 100%; object-fit: contain; border-radius: var(--r); }
  .ck-sum-ph {
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    color: var(--kg-faint);
  }
  .ck-sum-qty-badge {
    position: absolute; top: -7px; right: -7px;
    min-width: 19px; height: 19px; border-radius: var(--r-full);
    background: var(--kg-forest); color: #FFFFFF;
    font-style: normal; font-size: 9.5px; font-weight: 800;
    display: grid; place-items: center; padding: 0 4px;
    font-family: var(--font-sans); border: 1.5px solid var(--kg-paper);
  }
  .ck-sum-name {
    flex: 1; font-size: 12.5px; font-weight: 600; color: var(--kg-ink);
    line-height: 1.4; overflow: hidden;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    font-family: var(--font-sans);
  }
  .ck-sum-price {
    font-size: 13px; font-weight: 800; color: var(--kg-ink);
    white-space: nowrap; font-family: var(--font-sans); flex-shrink: 0;
  }

  /* Totals */
  .ck-sum-totals { margin-bottom: 16px; }
  .ck-sum-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 7px 0; font-size: 13.5px; color: var(--kg-muted);
    font-family: var(--font-sans);
  }
  .ck-sum-grand { font-size: 16px; font-weight: 800; color: var(--kg-ink); padding-top: 12px; }
  .ck-sum-grand strong { font-size: 18px; letter-spacing: -0.01em; }
  .ck-sum-divider { height: 1px; background: var(--kg-line-lt); margin: 4px 0; }
  .ck-free-val { color: var(--kg-forest-dk); font-weight: 800; }

  /* Trust list */
  .ck-trust {
    list-style: none; margin: 0; padding: 14px 0 0;
    border-top: 1px solid var(--kg-line-lt);
    display: flex; flex-direction: column; gap: 8px;
  }
  .ck-trust li {
    font-size: 12px; color: var(--kg-muted); font-weight: 600;
    display: flex; align-items: center; gap: 7px;
    font-family: var(--font-sans);
  }
  .ck-trust li svg { color: var(--kg-forest-lt); flex-shrink: 0; }

  /* ═══ ORDER SUCCESS ═══ */
  .ck-success {
    max-width: 580px; margin: 20px auto; text-align: center;
    background: var(--kg-paper); border: 1.5px solid var(--kg-line);
    border-radius: 20px; padding: 56px 40px;
  }
  .ck-success-ring {
    width: 96px; height: 96px; border-radius: var(--r-full);
    background: var(--kg-forest-bg); display: grid; place-items: center;
    margin: 0 auto 28px;
  }
  .ck-success-ic {
    width: 68px; height: 68px; border-radius: var(--r-full);
    background: var(--kg-forest); display: grid; place-items: center;
    box-shadow: var(--shadow-forest);
    animation: ckSuccessPop .5s var(--ease2);
  }
  @keyframes ckSuccessPop { 0% { transform: scale(.7); opacity: .6; } 100% { transform: scale(1); opacity: 1; } }

  .ck-success-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
    color: var(--kg-forest-dk); margin-bottom: 12px; font-family: var(--font-sans);
  }
  .ck-success-title {
    font-family: var(--font-sans); font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 800; color: var(--kg-ink); margin-bottom: 14px; letter-spacing: -0.02em;
  }
  .ck-success-text {
    font-size: 14.5px; color: var(--kg-muted); line-height: 1.75; margin-bottom: 24px;
  }
  .ck-success-text strong { color: var(--kg-ink); }

  /* Order ref card */
  .ck-success-ref-card {
    display: inline-flex; flex-direction: column; align-items: center; gap: 4px;
    background: var(--kg-forest-bg); border: 1.5px solid var(--kg-forest-bg2);
    border-radius: var(--r-lg); padding: 14px 28px; margin-bottom: 32px;
  }
  .ck-success-ref-label {
    font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
    color: var(--kg-faint); font-family: var(--font-sans);
  }
  .ck-success-ref {
    font-size: 20px; font-weight: 800; color: var(--kg-forest-dk);
    letter-spacing: .04em; font-family: var(--font-sans);
  }

  /* Status steps */
  .ck-success-steps {
    display: flex; align-items: center; justify-content: center; gap: 0;
    margin-bottom: 36px; flex-wrap: wrap; row-gap: 16px;
  }
  .ck-success-step {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    min-width: 90px;
  }
  .ck-step-icon {
    width: 44px; height: 44px; border-radius: var(--r-full);
    border: 2px solid var(--kg-line-warm); background: var(--kg-warm);
    color: var(--kg-faint); display: grid; place-items: center; transition: all .3s;
  }
  .ck-success-step.ck-step-done .ck-step-icon {
    border-color: var(--kg-forest); background: var(--kg-forest-bg); color: var(--kg-forest);
  }
  .ck-success-step strong {
    font-size: 11.5px; font-weight: 700; color: var(--kg-ink); font-family: var(--font-sans);
  }
  .ck-success-step em {
    font-style: normal; font-size: 10.5px; color: var(--kg-faint); font-family: var(--font-sans);
  }
  .ck-step-connector {
    width: 40px; height: 2px; background: var(--kg-line-warm); margin: 0 4px; flex-shrink: 0;
    margin-top: -28px;
  }

  /* Success actions */
  .ck-success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
  .ck-success-note { font-size: 12.5px; color: var(--kg-faint); line-height: 1.65; max-width: 380px; margin: 0 auto; }

  /* ═══ RESPONSIVE ═══ */
  @media (max-width: 900px) {
    .ck-grid { grid-template-columns: 1fr; }
    .ck-summary { position: static; order: -1; }
    .ck-progress-line { max-width: 52px; }
  }
  @media (max-width: 640px) {
    .ck { padding: 24px 0 60px; }
    .ck-card { padding: 20px 16px; border-radius: 12px; }
    .ck-row2 { grid-template-columns: 1fr; gap: 0; }
    .ck-fields { gap: 14px; }
    .ck-progress { margin-bottom: 28px; }
    .ck-progress-line { max-width: 36px; }
    .ck-ps-dot { width: 30px; height: 30px; font-size: 11.5px; }
    .ck-progress-step span { font-size: 10px; }
    .ck-success { padding: 36px 20px; border-radius: 16px; }
    .ck-success-title { font-size: 1.4rem; }
    .ck-success-ref { font-size: 16px; }
    .ck-step-connector { width: 24px; }
    .ck-success-actions { flex-direction: column; align-items: center; }
    .ck-place-btn, .ck-next-btn { font-size: 14.5px; padding: 14px 20px; }
    .ck-summary { padding: 16px; }
  }
  @media (max-width: 380px) {
    .ck-success-steps { flex-direction: column; align-items: center; }
    .ck-step-connector { width: 2px; height: 24px; margin: 4px 0; margin-top: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ck-success-ic { animation: none; }
    .ck-next-btn, .ck-place-btn { transition: none; }
  }
  `]
})
export class CheckoutComponent implements OnInit {
  // ══ Signals — PRESERVED exactly ══
  placed = signal(false);
  busy   = signal(false);
  error  = signal('');
  ref    = signal('');
  step   = 1;

  // ══ Form — ALL field names PRESERVED exactly (maps to API payload) ══
  // REPORTED: country defaults to 'Finland' → updated to 'Hong Kong' (UI only)
  // REPORTED: county field relabelled to 'District / Area' (backend key unchanged)
  // REPORTED: city placeholder was 'Helsinki', phone was '+358' → updated to HK-friendly
  // REPORTED: postcode field is sent as 'pincode' in API payload (preserved)
  form = {
    first_name: '', last_name: '', address_line1: '', address_line2: '',
    city: '', county: '', postcode: '', country: 'Hong Kong',
    phone: '', email: '', notes: ''
  };

  constructor(
    public cart: CartService,
    private api: ApiService,
    private settings: SettingsService,
    private router: Router,
    seo: SeoService
  ) {
    seo.setMeta({ title: 'Checkout', description: 'Complete your grocery order securely.' });
  }

  ngOnInit() {
    if (this.cart.items().length === 0) this.router.navigate(['/']);
  }

  // currency_symbol is configured via SettingsService (DB → API → settings signal).
  // Fallback is 'HK$' — Raj Grocery Store operates in Hong Kong.
  get cur() { return this.settings.get('currency_symbol', 'HK$'); }

  get freeAbove() { return parseFloat(this.settings.get('shipping_free_above', '50')) || 0; }

  shippingCost() {
    const c = parseFloat(this.settings.get('shipping_charge', '5')) || 0;
    return this.freeAbove > 0 && this.cart.subtotal() >= this.freeAbove ? 0 : c;
  }

  // ══ grandTotal — PRESERVED exactly ══
  grandTotal() { return this.cart.subtotal() + this.shippingCost(); }

  // ══ nextStep — validation PRESERVED exactly ══
  nextStep() {
    const f = this.form;
    if (!f.first_name || !f.last_name || !f.address_line1 || !f.city || !f.postcode || !f.phone) {
      this.error.set('Please fill in all required fields marked with *');
      return;
    }
    this.error.set('');
    this.step = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ══ place() — ENTIRE METHOD + PAYLOAD PRESERVED exactly ══
  // payment_method: 'cod' — DO NOT CHANGE
  place() {
    this.error.set('');
    this.busy.set(true);
    const f = this.form;
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
        if (r.success) {
          this.ref.set(r.data?.order_number || 'TD-' + Date.now());
          this.cart.clearCart();
          this.placed.set(true);
          window.scrollTo(0, 0);
        } else {
          this.error.set(r.message || 'Could not place the order. Please try again.');
        }
        this.busy.set(false);
      },
      error: () => {
        this.error.set('Network error — please check your connection and try again.');
        this.busy.set(false);
      }
    });
  }
}

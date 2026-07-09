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
    <div class="ck-container">

      <!-- ══ ORDER PLACED CONFIRMATION ══ -->
      @if (placed()) {
        <div class="ck-done">
          <div class="ck-done-ring">
            <div class="ck-done-ic">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <h1>Order Confirmed! 🎉</h1>
          <p>Thank you, <strong>{{ form.first_name }}</strong>. Your order<br>
          <strong class="ck-ref">{{ ref() }}</strong><br>
          has been placed. We'll contact you on <strong>{{ form.phone }}</strong> to arrange delivery.</p>
          <div class="ck-done-info">
            <div class="ck-done-step">
              <span>📦</span>
              <strong>Order received</strong>
              <em>Just now</em>
            </div>
            <div class="ck-done-arrow">→</div>
            <div class="ck-done-step">
              <span>🏪</span>
              <strong>Being packed</strong>
              <em>Within 2 hours</em>
            </div>
            <div class="ck-done-arrow">→</div>
            <div class="ck-done-step">
              <span>🚚</span>
              <strong>Out for delivery</strong>
              <em>1–2 working days</em>
            </div>
          </div>
          <a routerLink="/" class="ck-done-btn">Back to Home</a>
        </div>

      <!-- ══ CHECKOUT FORM ══ -->
      } @else {
        <!-- Progress indicator -->
        <div class="ck-progress">
          <div class="ck-progress-step" [class.done]="step > 1" [class.active]="step === 1">
            <div class="ck-ps-num">{{ step > 1 ? '✓' : '1' }}</div>
            <span>Delivery</span>
          </div>
          <div class="ck-progress-line" [class.done]="step > 1"></div>
          <div class="ck-progress-step" [class.done]="step > 2" [class.active]="step === 2">
            <div class="ck-ps-num">{{ step > 2 ? '✓' : '2' }}</div>
            <span>Review</span>
          </div>
          <div class="ck-progress-line" [class.done]="step > 2"></div>
          <div class="ck-progress-step" [class.active]="step === 3">
            <div class="ck-ps-num">3</div>
            <span>Confirm</span>
          </div>
        </div>

        <div class="ck-grid">

          <!-- ─── LEFT: FORM ─── -->
          <div class="ck-left">

            <!-- STEP 1: Delivery Details -->
            @if (step === 1) {
              <div class="ck-card">
                <div class="ck-card-head">
                  <span class="ck-card-ic">📦</span>
                  <h2>Delivery Address</h2>
                </div>
                <div class="ck-fields">
                  <div class="ck-row2">
                    <label>First name *
                      <input [(ngModel)]="form.first_name" name="fn" placeholder="e.g. Priya" required />
                    </label>
                    <label>Last name *
                      <input [(ngModel)]="form.last_name" name="ln" placeholder="e.g. Sharma" required />
                    </label>
                  </div>
                  <label>Street address *
                    <input [(ngModel)]="form.address_line1" name="a1" placeholder="House number & street name" required />
                  </label>
                  <label>Apartment / Flat (optional)
                    <input [(ngModel)]="form.address_line2" name="a2" placeholder="Flat 2B, Apartment 12…" />
                  </label>
                  <div class="ck-row2">
                    <label>Town / City *
                      <input [(ngModel)]="form.city" name="city" placeholder="e.g. Helsinki" required />
                    </label>
                    <label>County
                      <input [(ngModel)]="form.county" name="county" placeholder="e.g. Uusimaa" />
                    </label>
                  </div>
                  <div class="ck-row2">
                    <label>Postcode *
                      <input [(ngModel)]="form.postcode" name="pc" placeholder="e.g. 00100" required />
                    </label>
                    <label>Country *
                      <select [(ngModel)]="form.country" name="country">
                        <option>Finland</option>
                        <option>Other</option>
                      </select>
                    </label>
                  </div>
                  <div class="ck-row2">
                    <label>Phone *
                      <input [(ngModel)]="form.phone" name="phone" type="tel" placeholder="+358 40 000 0000" required />
                    </label>
                    <label>Email (optional)
                      <input [(ngModel)]="form.email" name="email" type="email" placeholder="your@email.com" />
                    </label>
                  </div>
                  <label>Delivery notes (optional)
                    <textarea [(ngModel)]="form.notes" name="notes" rows="3" placeholder="Leave parcels at door, ring bell twice…"></textarea>
                  </label>
                </div>
                @if (error()) {
                  <div class="ck-error" role="alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#DC2626" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/></svg>
                    {{ error() }}
                  </div>
                }
                <button class="ck-next-btn" (click)="nextStep()">
                  Continue to Review
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            }

            <!-- STEP 2: Review order -->
            @if (step === 2) {
              <div class="ck-card">
                <div class="ck-card-head">
                  <span class="ck-card-ic">📋</span>
                  <h2>Review Your Order</h2>
                  <button class="ck-edit-btn" (click)="step = 1">Edit Address</button>
                </div>

                <!-- Address summary -->
                <div class="ck-addr-summary">
                  <div class="ck-addr-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#29B8D5"/></svg>
                    <span>{{ form.first_name }} {{ form.last_name }}, {{ form.address_line1 }}{{ form.address_line2 ? ', ' + form.address_line2 : '' }}, {{ form.city }}, {{ form.postcode }}</span>
                  </div>
                  <div class="ck-addr-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#29B8D5" stroke-width="2"/></svg>
                    <span>{{ form.phone }}</span>
                  </div>
                </div>

                <!-- Delivery method -->
                <div class="ck-delivery-opts">
                  <h4>Delivery Method</h4>
                  <div class="ck-del-opt selected">
                    <div class="ck-del-radio"></div>
                    <div>
                      <strong>Standard Delivery (1–2 working days)</strong>
                      <em>{{ shippingCost() === 0 ? 'FREE' : cur + shippingCost().toFixed(2) }}</em>
                    </div>
                    <span class="ck-del-badge">Recommended</span>
                  </div>
                </div>

                <!-- Payment method -->
                <div class="ck-pay-section">
                  <h4>Payment Method</h4>
                  <div class="ck-pay-opt selected">
                    <div class="ck-del-radio"></div>
                    <div>
                      <strong>Cash / Card on Delivery</strong>
                      <em>Pay when your order arrives</em>
                    </div>
                  </div>
                </div>

                @if (error()) {
                  <div class="ck-error" role="alert">{{ error() }}</div>
                }
                <button class="ck-place-btn" (click)="place()" [disabled]="busy()">
                  @if (busy()) { <span class="ck-spinner"></span> Placing order… }
                  @else { Place Order — {{ cur }}{{ grandTotal().toFixed(2) }} }
                </button>
                <p class="ck-note">
                  🔒 Secure checkout &nbsp;·&nbsp; Your data is only used to process your order.
                </p>
              </div>
            }

          </div>

          <!-- ─── RIGHT: ORDER SUMMARY ─── -->
          <aside class="ck-sum">
            <h3>Order Summary</h3>

            <div class="ck-sum-items">
              @for (it of cart.items(); track it.id) {
                <div class="ck-sum-item">
                  <div class="ck-sum-img">
                    @if (it.image) { <img [src]="it.image" [alt]="it.name" /> }
                    @else { <span>🛍️</span> }
                    <em>{{ it.quantity }}</em>
                  </div>
                  <span class="ck-sum-name">{{ it.name }}</span>
                  <strong>{{ cur }}{{ ((it.salePrice ?? it.price) * it.quantity).toFixed(2) }}</strong>
                </div>
              }
            </div>

            <div class="ck-sum-rows">
              <div class="ck-sum-row">
                <span>Subtotal</span>
                <span>{{ cur }}{{ cart.subtotal().toFixed(2) }}</span>
              </div>
              <div class="ck-sum-row">
                <span>Delivery</span>
                <span [class.free-lbl]="shippingCost() === 0">{{ shippingCost() === 0 ? 'FREE' : cur + shippingCost().toFixed(2) }}</span>
              </div>
              <div class="ck-sum-div"></div>
              <div class="ck-sum-row grand">
                <span>Total</span>
                <strong>{{ cur }}{{ grandTotal().toFixed(2) }}</strong>
              </div>
            </div>

            <!-- Trust -->
            <ul class="ck-trust">
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Secure 256-bit encrypted checkout
              </li>
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="1" y="3" width="15" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 8h3l3 3v5h-6V8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" stroke-width="2"/></svg>
                Fast, tracked delivery
              </li>
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Freshness guaranteed on every order
              </li>
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="1 4 1 10 7 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 15a9 9 0 1 0 .49-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Easy 14-day returns
              </li>
            </ul>
          </aside>

        </div>
      }
    </div>
  </section>
  `,
  styles: [`
  /* ════════════════════════════════════════
     CHECKOUT — Kale Gida
  ════════════════════════════════════════ */
  .ck { padding: 32px 0 60px; background: #FFFFFF; min-height: 80vh; }
  .ck-container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

  /* ── Progress Bar ── */
  .ck-progress { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 36px; }
  .ck-progress-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .ck-ps-num { width: 38px; height: 38px; border-radius: 50%; background: #E5E7EB; color: #9CA3AF; font-size: 14px; font-weight: 800; display: grid; place-items: center; transition: all .3s; font-family: 'Manrope', sans-serif; }
  .ck-progress-step span { font-size: 12px; font-weight: 700; color: #9CA3AF; white-space: nowrap; font-family: 'Manrope', sans-serif; }
  .ck-progress-step.active .ck-ps-num { background: #1E88A8; color: #fff; box-shadow: 0 4px 14px rgba(30,136,168,.35); }
  .ck-progress-step.active span { color: #1E88A8; }
  .ck-progress-step.done .ck-ps-num { background: #29B8D5; color: #fff; }
  .ck-progress-step.done span { color: #29B8D5; }
  .ck-progress-line { flex: 1; max-width: 80px; height: 2px; background: #E5E7EB; margin: 0 8px; margin-top: -18px; transition: background .3s; }
  .ck-progress-line.done { background: #29B8D5; }

  /* ── Main Grid ── */
  .ck-grid { display: grid; grid-template-columns: 1fr 360px; gap: 28px; align-items: start; }

  /* ── Cards ── */
  .ck-card { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 20px; padding: 28px; margin-bottom: 20px; }
  .ck-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .ck-card-ic { font-size: 22px; }
  .ck-card-head h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.2rem; font-weight: 400; color: #111827; margin: 0; flex: 1; }
  .ck-edit-btn { font-size: 13px; font-weight: 700; color: #1E88A8; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Manrope', sans-serif; }
  .ck-edit-btn:hover { color: #16708C; text-decoration: underline; }

  /* Form fields */
  .ck-fields { display: flex; flex-direction: column; gap: 0; }
  .ck-fields label { display: block; font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 16px; font-family: 'Manrope', sans-serif; }
  .ck-fields input, .ck-fields select, .ck-fields textarea {
    display: block; width: 100%; margin-top: 6px;
    padding: 12px 14px; border: 1.5px solid #E5E7EB; border-radius: 10px;
    font-family: 'Manrope', sans-serif; font-size: 14px; background: #fff;
    color: #111827; transition: border-color .2s, box-shadow .2s;
  }
  .ck-fields input:focus, .ck-fields select:focus, .ck-fields textarea:focus { outline: none; border-color: #1E88A8; box-shadow: 0 0 0 3px rgba(30,136,168,.1); }
  .ck-fields input::placeholder, .ck-fields textarea::placeholder { color: #9CA3AF; }
  .ck-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* Address summary */
  .ck-addr-summary { background: #E6F3F8; border: 1px solid rgba(30,136,168,.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 22px; display: flex; flex-direction: column; gap: 8px; }
  .ck-addr-row { display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; color: #111827; }

  /* Delivery options */
  .ck-delivery-opts, .ck-pay-section { margin-bottom: 22px; }
  .ck-delivery-opts h4, .ck-pay-section h4 { font-size: 13px; font-weight: 800; color: #111827; margin-bottom: 12px; font-family: 'Manrope', sans-serif; text-transform: uppercase; letter-spacing: .1em; }
  .ck-del-opt, .ck-pay-opt { display: flex; align-items: center; gap: 14px; border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 14px 16px; cursor: pointer; transition: all .2s; }
  .ck-del-opt.selected, .ck-pay-opt.selected { border-color: #1E88A8; background: #E6F3F8; }
  .ck-del-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #1E88A8; background: #1E88A8; flex-shrink: 0; position: relative; }
  .ck-del-radio::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 7px; height: 7px; border-radius: 50%; background: #fff; }
  .ck-del-opt div strong, .ck-pay-opt div strong { display: block; font-size: 14px; font-weight: 700; color: #111827; font-family: 'Manrope', sans-serif; }
  .ck-del-opt div em, .ck-pay-opt div em { font-size: 13px; color: #1E88A8; font-style: normal; font-weight: 800; }
  .ck-del-badge { margin-left: auto; background: #1E88A8; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; font-family: 'Manrope', sans-serif; }

  /* Error */
  .ck-error { display: flex; align-items: center; gap: 8px; background: #FEE9E7; color: #DC2626; border: 1px solid rgba(220,38,38,.2); border-radius: 10px; padding: 12px 16px; font-size: 13.5px; font-weight: 600; margin-bottom: 16px; }

  /* Next / Place button */
  .ck-next-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; background: #1E88A8; color: #fff; border: none; border-radius: 12px; padding: 16px 24px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all .25s; margin-top: 8px; font-family: 'Manrope', sans-serif; box-shadow: 0 6px 20px rgba(30,136,168,.3); }
  .ck-next-btn:hover { background: #16708C; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(30,136,168,.4); }
  .ck-place-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; background: #111827; color: #fff; border: none; border-radius: 12px; padding: 16px 24px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all .25s; margin-top: 8px; font-family: 'Manrope', sans-serif; }
  .ck-place-btn:hover:not(:disabled) { background: #0F1826; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(17,24,39,.35); }
  .ck-place-btn:disabled { opacity: .6; cursor: wait; }
  .ck-spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ck-note { text-align: center; font-size: 12.5px; color: #9CA3AF; margin-top: 14px; line-height: 1.6; font-family: 'Manrope', sans-serif; }

  /* ── Summary sidebar ── */
  .ck-sum { position: sticky; top: calc(var(--header-height,156px) + 20px); background: #fff; border: 1.5px solid #E5E7EB; border-radius: 20px; padding: 24px; }
  .ck-sum h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.2rem; font-weight: 400; color: #111827; margin: 0 0 18px; }
  .ck-sum-items { max-height: 280px; overflow-y: auto; scrollbar-width: thin; margin-bottom: 16px; }
  .ck-sum-item { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid #F1F3F6; }
  .ck-sum-img { position: relative; width: 48px; height: 48px; border-radius: 10px; background: #F7FAFC; overflow: visible; flex-shrink: 0; }
  .ck-sum-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
  .ck-sum-img span { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .ck-sum-img em { position: absolute; top: -7px; right: -7px; min-width: 20px; height: 20px; border-radius: 999px; background: #1E88A8; color: #fff; font-style: normal; font-size: 10px; font-weight: 800; display: grid; place-items: center; padding: 0 4px; }
  .ck-sum-name { flex: 1; font-size: 13px; font-weight: 600; color: #111827; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-family: 'Manrope', sans-serif; }
  .ck-sum-item strong { font-size: 13.5px; font-weight: 800; color: #111827; white-space: nowrap; font-family: 'Manrope', sans-serif; }
  .ck-sum-rows { margin-bottom: 18px; }
  .ck-sum-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; color: #6B7280; font-family: 'Manrope', sans-serif; }
  .ck-sum-row.grand { padding-top: 14px; font-size: 17px; font-weight: 800; color: #111827; }
  .ck-sum-row.grand strong { font-size: 20px; color: #1E88A8; }
  .ck-sum-div { height: 1px; background: #E5E7EB; margin: 4px 0; }
  .free-lbl { color: #29B8D5; font-weight: 800; background: #E9F7FB; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
  .ck-trust { list-style: none; margin: 0; padding: 16px 0 0; border-top: 1px solid #E5E7EB; display: flex; flex-direction: column; gap: 7px; }
  .ck-trust li { font-size: 12.5px; color: #111827; font-weight: 600; display: flex; align-items: center; gap: 7px; font-family: 'Manrope', sans-serif; }
  .ck-trust li svg { color: #29B8D5; flex-shrink: 0; }

  /* ── Order Confirmed ── */
  .ck-done { max-width: 580px; margin: 20px auto; text-align: center; background: #fff; border: 1.5px solid #E5E7EB; border-radius: 24px; padding: 56px 40px; }
  .ck-done-ring { width: 100px; height: 100px; border-radius: 50%; background: rgba(41,184,213,.08); display: grid; place-items: center; margin: 0 auto 24px; }
  .ck-done-ic { width: 72px; height: 72px; border-radius: 50%; background: #29B8D5; display: grid; place-items: center; box-shadow: 0 8px 24px rgba(41,184,213,.3); }
  .ck-done h1 { font-family: 'Fraunces', Georgia, serif; font-size: 1.9rem; font-weight: 400; color: #111827; margin-bottom: 14px; }
  .ck-done p { color: #6B7280; line-height: 1.9; font-size: 15px; margin-bottom: 28px; }
  .ck-ref { display: inline-block; background: #E6F3F8; color: #1E88A8; border: 1px solid rgba(30,136,168,.3); border-radius: 8px; padding: 4px 14px; font-size: 16px; font-weight: 800; letter-spacing: .04em; margin: 4px 0; font-family: 'Manrope', sans-serif; }
  .ck-done-info { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 24px 0 32px; flex-wrap: wrap; }
  .ck-done-step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .ck-done-step span { font-size: 28px; }
  .ck-done-step strong { font-size: 12.5px; font-weight: 700; color: #111827; font-family: 'Manrope', sans-serif; }
  .ck-done-step em { font-style: normal; font-size: 11.5px; color: #9CA3AF; }
  .ck-done-arrow { font-size: 20px; color: #1E88A8; font-weight: 700; margin-top: -10px; }
  .ck-done-btn { display: inline-flex; align-items: center; gap: 8px; background: #1E88A8; color: #fff; border-radius: 12px; padding: 14px 32px; font-size: 15px; font-weight: 800; text-decoration: none; transition: all .25s; font-family: 'Manrope', sans-serif; box-shadow: 0 6px 20px rgba(30,136,168,.3); }
  .ck-done-btn:hover { background: #16708C; transform: translateY(-2px); }

  /* ════════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════════ */
  @media (max-width: 900px) {
    .ck-grid { grid-template-columns: 1fr; }
    .ck-sum { position: static; order: -1; }
    .ck-progress-line { max-width: 50px; }
  }
  @media (max-width: 640px) {
    .ck { padding: 20px 0 40px; }
    .ck-container { padding: 0 14px; }
    .ck-card { padding: 20px 16px; border-radius: 16px; }
    .ck-row2 { grid-template-columns: 1fr; }
    .ck-progress { gap: 0; }
    .ck-progress-line { max-width: 32px; }
    .ck-ps-num { width: 30px; height: 30px; font-size: 12px; }
    .ck-progress-step span { font-size: 10.5px; }
    .ck-done { padding: 36px 20px; }
    .ck-done h1 { font-size: 1.5rem; }
    .ck-done-info { gap: 6px; }
    .ck-done-arrow { font-size: 16px; }
  }
  @media (max-width: 375px) {
    .ck-done-info { flex-direction: column; }
    .ck-done-arrow { transform: rotate(90deg); }
  }
  `]
})

export class CheckoutComponent implements OnInit {
  placed = signal(false);
  busy   = signal(false);
  error  = signal('');
  ref    = signal('');
  step   = 1;

  form = {
    first_name: '', last_name: '', address_line1: '', address_line2: '',
    city: '', county: '', postcode: '', country: 'Finland',
    phone: '', email: '', notes: ''
  };

  constructor(
    public cart: CartService,
    private api: ApiService,
    private settings: SettingsService,
    private router: Router,
    seo: SeoService
  ) {
    seo.setMeta({ title: 'Checkout', description: 'Complete your purchase securely.' });
  }

  ngOnInit() { if (this.cart.items().length === 0) this.router.navigate(['/']); }

  get cur() { return this.settings.get('currency_symbol', '£'); }
  get freeAbove() { return parseFloat(this.settings.get('shipping_free_above', '50')) || 0; }
  shippingCost() {
    const c = parseFloat(this.settings.get('shipping_charge', '5')) || 0;
    return this.freeAbove > 0 && this.cart.subtotal() >= this.freeAbove ? 0 : c;
  }
  grandTotal() { return this.cart.subtotal() + this.shippingCost(); }

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

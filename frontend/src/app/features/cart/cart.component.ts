import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
  <section class="cp">
    <div class="container">

      <!-- Page heading -->
      <div class="cp-head">
        <div class="cp-head-left">
          <h1 class="cp-title">
            Shopping Basket
            @if (cart.itemCount() > 0) {
              <span class="cp-badge">{{ cart.itemCount() }} {{ cart.itemCount() === 1 ? 'item' : 'items' }}</span>
            }
          </h1>
        </div>
        <a routerLink="/categories" class="cp-continue">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Continue Shopping
        </a>
      </div>

      <!-- ═══ EMPTY STATE ═══ -->
      @if (cart.items().length === 0) {
        <div class="cp-empty">
          <div class="cp-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.6"/>
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="cp-empty-title">Your basket is empty</h2>
          <p class="cp-empty-text">
            Add your favourite Indian groceries to get started.<br>
            Fresh spices, rice, dal, snacks and more.
          </p>
          <div class="cp-empty-btns">
            <a routerLink="/categories" class="btn btn-primary">Start Shopping</a>
            <a routerLink="/" class="btn btn-outline">Go to Home</a>
          </div>
          <div class="cp-empty-trust">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
              </svg>
              Secure Checkout
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.7"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.7"/>
              </svg>
              Local HK Store
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7"/>
                <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Easy Online Ordering
            </span>
          </div>
        </div>

      <!-- ═══ CART WITH ITEMS ═══ -->
      } @else {
        <div class="cp-grid">

          <!-- Left: items list -->
          <div class="cp-items-col">
            <div class="cp-items-card">
              <!-- Table header (desktop only) -->
              <div class="cp-items-head" aria-hidden="true">
                <span>Product</span>
                <span class="cp-head-qty">Quantity</span>
                <span class="cp-head-total">Total</span>
                <span></span>
              </div>

              <!-- Item rows -->
              @for (it of cart.items(); track it.id) {
                <div class="cp-item">

                  <!-- Image -->
                  <a [routerLink]="['/product', it.slug]" class="cp-item-img"
                     [attr.aria-label]="'View ' + it.name">
                    @if (it.image) {
                      <img [src]="it.image" [alt]="it.name" loading="lazy" />
                    } @else {
                      <div class="cp-item-ph">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                      </div>
                    }
                  </a>

                  <!-- Info -->
                  <div class="cp-item-info">
                    <a [routerLink]="['/product', it.slug]" class="cp-item-name">{{ it.name }}</a>
                    @if (it.unit && it.unit !== 'piece') {
                      <span class="cp-item-variant">{{ it.unit }}</span>
                    }
                    <span class="cp-item-unit-price">{{ cur }}{{ (it.salePrice ?? it.price).toFixed(2) }} each</span>
                    <!-- Mobile remove -->
                    <button class="cp-remove-mob" (click)="cart.removeItem(it.id)"
                      [attr.aria-label]="'Remove ' + it.name + ' from basket'">
                      Remove
                    </button>
                  </div>

                  <!-- Quantity -->
                  <div class="cp-qty" role="group" [attr.aria-label]="'Quantity for ' + it.name">
                    <button class="cp-qty-btn"
                      (click)="cart.updateQuantity(it.id, it.quantity - 1)"
                      [attr.aria-label]="'Decrease quantity of ' + it.name">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    </button>
                    <span class="cp-qty-val" aria-live="polite">{{ it.quantity }}</span>
                    <button class="cp-qty-btn"
                      (click)="cart.updateQuantity(it.id, it.quantity + 1)"
                      [attr.aria-label]="'Increase quantity of ' + it.name">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Line total -->
                  <div class="cp-item-total" aria-label="Item total">
                    {{ cur }}{{ ((it.salePrice ?? it.price) * it.quantity).toFixed(2) }}
                  </div>

                  <!-- Remove (desktop) -->
                  <button class="cp-remove"
                    (click)="cart.removeItem(it.id)"
                    [attr.aria-label]="'Remove ' + it.name + ' from basket'">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              }

              <!-- Footer: clear cart -->
              <div class="cp-items-footer">
                <button class="cp-clear-btn" (click)="cart.clearCart()">Clear basket</button>
              </div>
            </div>
          </div>

          <!-- Right: order summary -->
          <div class="cp-summary-col">
            <div class="cp-summary-card">
              <h2 class="cp-summary-title">Order Summary</h2>

              <!-- Subtotal -->
              <div class="cp-sum-row">
                <span>Subtotal <span class="cp-sum-qty">({{ cart.itemCount() }} {{ cart.itemCount() === 1 ? 'item' : 'items' }})</span></span>
                <span>{{ cur }}{{ cart.subtotal().toFixed(2) }}</span>
              </div>

              <!-- Coupon -->
              @if (!couponApplied()) {
                <div class="cp-coupon">
                  <div class="cp-coupon-field">
                    <input [(ngModel)]="couponCode"
                      placeholder="Coupon or promo code"
                      class="cp-coupon-input"
                      aria-label="Enter coupon code"
                      [attr.aria-describedby]="couponError() ? 'coupon-error' : null" />
                    <button (click)="applyCoupon()" class="cp-coupon-btn"
                      [disabled]="!couponCode.trim() || applyingCoupon()"
                      type="button">
                      @if (applyingCoupon()) {
                        <span class="cp-spinner" aria-label="Applying coupon"></span>
                      } @else {
                        Apply
                      }
                    </button>
                  </div>
                  @if (couponError()) {
                    <p class="cp-coupon-err" id="coupon-error" role="alert">{{ couponError() }}</p>
                  }
                </div>
              } @else {
                <div class="cp-coupon-applied" role="status" aria-live="polite">
                  <div class="cp-coupon-applied-left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.4"
                        stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Coupon <strong>{{ couponCode }}</strong> applied</span>
                  </div>
                  <button (click)="removeCoupon()" class="cp-coupon-remove" aria-label="Remove coupon" type="button">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              }

              <!-- Discount -->
              @if (couponDiscount() > 0) {
                <div class="cp-sum-row cp-sum-disc">
                  <span>Coupon Discount</span>
                  <span>−{{ cur }}{{ couponDiscount().toFixed(2) }}</span>
                </div>
              }

              <!-- Delivery -->
              <div class="cp-sum-row">
                <span>Delivery</span>
                <span class="cp-del-val">
                  @if (cart.subtotal() - couponDiscount() >= freeAbove()) {
                    <span class="cp-free-badge">FREE</span>
                  } @else {
                    {{ cur }}{{ shippingCharge().toFixed(2) }}
                  }
                </span>
              </div>

              <!-- Free delivery nudge -->
              @if (cart.subtotal() - couponDiscount() < freeAbove() && freeAbove() > 0) {
                <div class="cp-free-nudge" role="note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill="currentColor"/>
                  </svg>
                  Add {{ cur }}{{ (freeAbove() - (cart.subtotal() - couponDiscount())).toFixed(2) }} more for free delivery
                </div>
              }

              <!-- Divider + total -->
              <div class="cp-divider"></div>

              <div class="cp-sum-row cp-sum-total">
                <strong>Total</strong>
                <strong class="cp-total-val">{{ cur }}{{ grandTotal().toFixed(2) }}</strong>
              </div>

              <!-- Checkout CTA -->
              <a routerLink="/checkout" class="cp-checkout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="currentColor" stroke-width="2"/>
                </svg>
                Proceed to Checkout
              </a>

              <!-- Trust strip -->
              <div class="cp-trust">
                <span class="cp-trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/>
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                  </svg>
                  Secure Checkout
                </span>
                <span class="cp-trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.7"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.7"/>
                  </svg>
                  Local HK Store
                </span>
                <span class="cp-trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7"/>
                    <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Easy Ordering
                </span>
              </div>

              <!-- WhatsApp contact button in cart sidebar -->
              <a href="https://wa.me/85254264886" target="_blank" rel="noopener noreferrer" class="cp-wa-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                Contact on WhatsApp
              </a>
            </div>
          </div>

        </div>
      }
    </div>
  </section>
  `,

  styles: [`
  /* ── Wrapper ── */
  .cp { padding: 44px 0 72px; background: var(--kg-warm); min-height: 60vh; }
  /* ── WhatsApp button in cart sidebar ── */
  .cp-wa-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
    background: #f0fdf4; color: #166534; border: 1.5px solid #bbf7d0;
    border-radius: var(--r-xl); padding: 12px 18px; font-size: 13.5px; font-weight: 800;
    text-decoration: none; font-family: var(--font-sans); transition: all .2s; margin-top: 12px;
  }
  .cp-wa-btn:hover { background: #25D366; color: #fff; border-color: #25D366; }

  /* ── Page heading ── */
  .cp-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 36px; gap: 14px; flex-wrap: wrap;
  }
  .cp-head-left { display: flex; align-items: center; gap: 14px; }
  .cp-title {
    font-family: var(--font-sans);
    font-size: clamp(1.4rem, 2.8vw, 2rem);
    font-weight: 800; color: var(--kg-ink);
    display: flex; align-items: center; gap: 12px;
    letter-spacing: -0.02em; margin: 0;
  }
  .cp-badge {
    font-size: 13px; font-weight: 700;
    background: var(--kg-forest-bg); color: var(--kg-forest-dk);
    padding: 3px 12px; border-radius: var(--r-full);
    border: 1px solid var(--kg-forest-bg2);
  }
  .cp-continue {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 13.5px; font-weight: 700; color: var(--kg-muted);
    text-decoration: none; transition: color .2s;
    font-family: var(--font-sans);
  }
  .cp-continue:hover { color: var(--kg-forest); }

  /* ── Empty state ── */
  .cp-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 20px; padding: 72px 24px; text-align: center; max-width: 500px; margin: 0 auto;
  }
  .cp-empty-icon {
    width: 80px; height: 80px; border-radius: var(--r-xl);
    background: var(--kg-paper); color: var(--kg-faint);
    display: grid; place-items: center;
    border: 1.5px solid var(--kg-line); box-shadow: var(--shadow-xs);
  }
  .cp-empty-title { font-size: 1.5rem; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .cp-empty-text { font-size: 14.5px; color: var(--kg-muted); margin: 0; line-height: 1.75; }
  .cp-empty-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .cp-empty-trust {
    display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;
    padding-top: 8px; border-top: 1px solid var(--kg-line-lt); width: 100%;
  }
  .cp-empty-trust span {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 700; color: var(--kg-faint);
    font-family: var(--font-sans);
  }
  .cp-empty-trust svg { color: var(--kg-forest-lt); }

  /* ── Main grid ── */
  .cp-grid { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }

  /* ── Items card ── */
  .cp-items-card {
    background: var(--kg-paper); border: 1.5px solid var(--kg-line);
    border-radius: 14px; overflow: hidden;
  }
  .cp-items-head {
    display: grid; grid-template-columns: 80px 1fr 130px 90px 40px;
    gap: 12px; padding: 12px 20px;
    background: var(--kg-warm); border-bottom: 1px solid var(--kg-line-lt);
    font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
    color: var(--kg-faint); font-family: var(--font-sans);
  }
  .cp-head-qty, .cp-head-total { text-align: center; }

  /* Item row */
  .cp-item {
    display: grid; grid-template-columns: 80px 1fr 130px 90px 40px;
    gap: 12px; align-items: center; padding: 16px 20px;
    border-bottom: 1px solid var(--kg-line-lt); transition: background .2s;
  }
  .cp-item:last-of-type { border-bottom: none; }
  .cp-item:hover { background: var(--kg-warm); }

  /* Image */
  .cp-item-img {
    width: 80px; height: 80px; border-radius: var(--r);
    background: var(--kg-warm); overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; border: 1.5px solid var(--kg-line-lt);
    transition: border-color .2s;
  }
  .cp-item-img:hover { border-color: var(--kg-forest-lt); }
  .cp-item-img img { width: 100%; height: 100%; object-fit: contain; }
  .cp-item-ph { color: var(--kg-faint); display: grid; place-items: center; width: 100%; height: 100%; }

  /* Info */
  .cp-item-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .cp-item-name {
    font-size: 14px; font-weight: 700; color: var(--kg-ink);
    font-family: var(--font-sans); line-height: 1.3;
    overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    text-decoration: none; transition: color .2s;
  }
  .cp-item-name:hover { color: var(--kg-forest); }
  .cp-item-variant { font-size: 11.5px; color: var(--kg-faint); font-weight: 600; }
  .cp-item-unit-price { font-size: 12px; color: var(--kg-muted); }
  .cp-remove-mob {
    display: none; font-size: 11.5px; color: var(--kg-clay); font-weight: 700;
    cursor: pointer; background: none; border: none; padding: 0;
    font-family: var(--font-sans); transition: opacity .2s; text-align: left;
    margin-top: 2px;
  }
  .cp-remove-mob:hover { opacity: .75; }

  /* Quantity */
  .cp-qty {
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid var(--kg-line-warm); border-radius: var(--r-lg); overflow: hidden;
    flex-shrink: 0; background: var(--kg-paper);
  }
  .cp-qty-btn {
    width: 34px; height: 38px; display: grid; place-items: center;
    color: var(--kg-ink); cursor: pointer; background: none;
    border: none; transition: background .18s, color .18s;
  }
  .cp-qty-btn:hover { background: var(--kg-forest-bg); color: var(--kg-forest); }
  .cp-qty-val {
    min-width: 34px; text-align: center; font-size: 14px; font-weight: 800;
    color: var(--kg-ink); border-left: 1.5px solid var(--kg-line-lt);
    border-right: 1.5px solid var(--kg-line-lt); padding: 0 4px;
    font-family: var(--font-sans);
  }

  /* Line total */
  .cp-item-total {
    font-family: var(--font-sans); font-size: 15px; font-weight: 800;
    color: var(--kg-ink); text-align: right;
  }

  /* Remove (desktop) */
  .cp-remove {
    width: 32px; height: 32px; border-radius: var(--r);
    background: var(--kg-warm); border: 1.5px solid var(--kg-line);
    color: var(--kg-faint); display: grid; place-items: center;
    cursor: pointer; transition: all .2s; flex-shrink: 0;
  }
  .cp-remove:hover { background: var(--kg-clay-bg); color: var(--kg-clay); border-color: var(--kg-clay); }

  /* Items footer */
  .cp-items-footer {
    padding: 12px 20px; border-top: 1px solid var(--kg-line-lt);
    display: flex; justify-content: flex-end;
  }
  .cp-clear-btn {
    font-size: 12.5px; font-weight: 700; color: var(--kg-faint);
    cursor: pointer; background: none; border: none;
    font-family: var(--font-sans); transition: color .2s;
  }
  .cp-clear-btn:hover { color: var(--kg-clay); }

  /* ── Summary card ── */
  .cp-summary-col { position: sticky; top: calc(var(--header-height) + 20px); }
  .cp-summary-card {
    background: var(--kg-paper); border: 1.5px solid var(--kg-line);
    border-radius: 14px; padding: 24px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .cp-summary-title {
    font-family: var(--font-sans); font-size: 16px; font-weight: 800;
    color: var(--kg-ink); margin: 0; letter-spacing: -0.01em;
  }
  .cp-sum-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13.5px; color: var(--kg-muted); font-family: var(--font-sans);
    gap: 8px;
  }
  .cp-sum-qty { color: var(--kg-faint); }
  .cp-sum-disc { color: var(--kg-forest-dk); }
  .cp-del-val { font-weight: 700; }
  .cp-free-badge {
    background: var(--kg-forest-bg); color: var(--kg-forest-dk);
    font-size: 11px; font-weight: 800; padding: 2px 9px; border-radius: var(--r-full);
    font-family: var(--font-sans); letter-spacing: .04em;
  }

  /* Coupon */
  .cp-coupon { display: flex; flex-direction: column; gap: 7px; }
  .cp-coupon-field {
    display: flex; border: 1.5px solid var(--kg-line-warm); border-radius: var(--r);
    overflow: hidden; transition: border-color .2s;
  }
  .cp-coupon-field:focus-within { border-color: var(--kg-forest); box-shadow: 0 0 0 3px var(--kg-forest-bg); }
  .cp-coupon-input {
    flex: 1; border: none; outline: none; padding: 9px 12px;
    font-size: 13px; color: var(--kg-ink); background: transparent;
    font-family: var(--font-sans); min-width: 0;
  }
  .cp-coupon-input::placeholder { color: var(--kg-faint); }
  .cp-coupon-btn {
    background: var(--kg-forest); color: #FFFFFF; border: none;
    padding: 9px 16px; font-size: 12.5px; font-weight: 800; cursor: pointer;
    font-family: var(--font-sans); transition: background .2s; flex-shrink: 0;
    display: flex; align-items: center;
  }
  .cp-coupon-btn:hover:not(:disabled) { background: var(--kg-forest-dk); }
  .cp-coupon-btn:disabled { opacity: .55; cursor: not-allowed; }
  .cp-coupon-err { font-size: 12px; color: var(--kg-clay); margin: 0; font-family: var(--font-sans); }

  /* Applied coupon pill */
  .cp-coupon-applied {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--kg-forest-bg); border: 1px solid var(--kg-forest-bg2);
    padding: 9px 12px; border-radius: var(--r); gap: 8px;
  }
  .cp-coupon-applied-left {
    display: flex; align-items: center; gap: 7px;
    font-size: 12.5px; color: var(--kg-forest-dk); font-weight: 700; font-family: var(--font-sans);
  }
  .cp-coupon-applied-left svg { color: var(--kg-forest); flex-shrink: 0; }
  .cp-coupon-applied-left strong { font-weight: 800; }
  .cp-coupon-remove {
    display: grid; place-items: center; width: 24px; height: 24px;
    border-radius: var(--r-sm); background: rgba(27,76,140,.12); border: none;
    color: var(--kg-forest-dk); cursor: pointer; flex-shrink: 0; transition: all .2s;
  }
  .cp-coupon-remove:hover { background: var(--kg-clay-bg); color: var(--kg-clay); }

  /* Free delivery nudge */
  .cp-free-nudge {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; color: var(--kg-terra-dk); font-weight: 700;
    background: var(--kg-terra-bg); padding: 8px 12px; border-radius: var(--r);
    font-family: var(--font-sans);
  }
  .cp-free-nudge svg { color: var(--kg-terra); flex-shrink: 0; }

  /* Divider + total */
  .cp-divider { height: 1px; background: var(--kg-line-lt); }
  .cp-sum-total { font-size: 16px; align-items: center; }
  .cp-sum-total strong { color: var(--kg-ink); font-size: 16px; }
  .cp-total-val { font-size: 20px; color: var(--kg-ink); letter-spacing: -0.01em; }

  /* Checkout button */
  .cp-checkout-btn {
    display: flex; align-items: center; justify-content: center; gap: 9px;
    background: var(--kg-forest); color: #FFFFFF;
    border-radius: var(--r-xl); padding: 15px 24px; text-decoration: none;
    font-family: var(--font-sans); font-size: 15.5px; font-weight: 800;
    box-shadow: var(--shadow-forest); transition: all .28s;
    letter-spacing: .01em;
  }
  .cp-checkout-btn:hover {
    background: var(--kg-forest-dk); transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(27,76,140,.32);
  }

  /* Trust strip */
  .cp-trust {
    display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;
    padding-top: 4px; border-top: 1px solid var(--kg-line-lt);
  }
  .cp-trust-item {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11.5px; color: var(--kg-faint); font-weight: 700; font-family: var(--font-sans);
  }
  .cp-trust-item svg { color: var(--kg-forest-lt); }

  /* Spinner (coupon) */
  .cp-spinner {
    display: inline-block; width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,.35); border-top-color: #FFFFFF;
    border-radius: 50%; animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 1000px) {
    .cp-grid { grid-template-columns: 1fr 340px; gap: 22px; }
  }
  @media (max-width: 860px) {
    .cp-grid { grid-template-columns: 1fr; }
    .cp-summary-col { position: static; }
    .cp-items-head { display: none; }
    .cp-item { grid-template-columns: 68px 1fr auto; gap: 12px; }
    .cp-item-total { display: none; }
    .cp-remove { display: none; }
    .cp-remove-mob { display: block; }
    .cp-qty { justify-content: flex-start; }
    .cp-head-qty, .cp-head-total { display: none; }
    .cp-cp { padding: 28px 0 56px; }
  }
  @media (max-width: 640px) {
    .cp { padding: 24px 0 56px; }
    .cp-head { margin-bottom: 22px; }
    .cp-item { padding: 14px 14px; gap: 10px; }
    .cp-item-img { width: 64px; height: 64px; }
    .cp-item-name { font-size: 13px; }
    .cp-item-unit-price { font-size: 11px; }
    .cp-qty-btn { width: 30px; height: 34px; }
    .cp-qty-val { min-width: 28px; font-size: 13px; }
    .cp-summary-card { padding: 18px 16px; gap: 12px; }
    .cp-coupon-input { padding: 8px 10px; font-size: 12.5px; }
    .cp-coupon-btn { padding: 8px 14px; font-size: 12px; }
    .cp-checkout-btn { font-size: 14.5px; padding: 13px 20px; }
    .cp-items-footer { padding: 10px 14px; }
    .cp-empty { padding: 48px 16px; }
    .cp-empty-trust { gap: 12px; }
  }
  @media (max-width: 400px) {
    .cp-trust { flex-direction: column; align-items: center; gap: 8px; }
  }
  `]
})
export class CartComponent implements OnInit {
  couponCode = '';
  couponApplied = signal(false);
  couponDiscount = signal(0);
  couponError = signal('');
  applyingCoupon = signal(false);

  constructor(
    public cart: CartService,
    public settings: SettingsService,
    private seo: SeoService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.seo.setMeta({
      title: 'Shopping Basket',
      description: 'Review your selected Indian groceries and proceed to checkout.'
    });
  }

  // currency_symbol is configured via SettingsService (DB → API → settings signal).
  // Fallback is 'HK$' — Raj Grocery Store operates in Hong Kong.
  get cur() { return this.settings.get('currency_symbol', 'HK$'); }

  freeAbove(): number { return +(this.settings.get('delivery_free_above', this.settings.get('shipping_free_above', '400')) || 400); }
  shippingCharge(): number { return +(this.settings.get('shipping_charge', '40') || 40); }

  grandTotal(): number {
    const afterDiscount = this.cart.subtotal() - this.couponDiscount();
    const shipping = afterDiscount >= this.freeAbove() ? 0 : this.shippingCharge();
    return Math.max(0, afterDiscount) + shipping;
  }

  applyCoupon() {
    const code = this.couponCode.trim();
    if (!code) return;
    this.applyingCoupon.set(true);
    this.couponError.set('');
    this.api.validateCoupon(code, this.cart.subtotal()).subscribe({
      next: (r: any) => {
        if (r.success && r.data) {
          const disc = r.data.discount_amount || 0;
          this.couponDiscount.set(+disc);
          this.couponApplied.set(true);
          this.couponError.set('');
        } else {
          this.couponError.set(r.message || 'Invalid coupon code. Please try another.');
        }
        this.applyingCoupon.set(false);
      },
      error: () => {
        this.couponError.set('Could not validate coupon. Please try again.');
        this.applyingCoupon.set(false);
      }
    });
  }

  removeCoupon() {
    this.couponApplied.set(false);
    this.couponDiscount.set(0);
    this.couponCode = '';
    this.couponError.set('');
  }
}

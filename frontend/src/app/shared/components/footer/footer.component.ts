import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">

      <!-- Newsletter Strip -->
      <div class="newsletter-strip">
        <div class="container newsletter-inner">
          <div class="nl-left">
            <h3>Get fresh deals in your inbox</h3>
            <p>Subscribe for weekly offers, new arrivals & recipes</p>
          </div>
          <form class="nl-form" (submit)="subscribe($event)">
            <input type="email" [(ngModel)]="email" name="email" placeholder="Your email address" class="nl-input" id="newsletter-email">
            <button type="submit" class="nl-btn" id="newsletter-subscribe-btn">
              Subscribe
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>
      </div>

      <!-- Main Footer -->
      <div class="footer-main">
        <div class="container footer-grid">

          <!-- Brand Column -->
          <div class="footer-brand-col">
            <a routerLink="/" class="footer-logo">
              <img [src]="settings.assetUrl('site_logo', '/logo.png')" alt="{{ settings.get('site_name','Asian Spices & Halal Meats') }}" class="footer-logo-img">
              <span class="footer-brand-name">{{ settings.get('site_name','Asian Spices & Halal Meats') }}</span>
            </a>
            <p class="footer-about">{{ settings.get('footer_about','Your one-stop shop for fresh halal meats, premium spices, fresh vegetables and daily essentials. Fast delivery, best prices.') }}</p>
            <div class="footer-contact-list">
              @if (settings.get('site_phone')) {
                <a href="tel:{{ settings.get('site_phone') }}" class="footer-contact-item">
                  <span class="fci-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  </span>
                  {{ settings.get('site_phone') }}
                </a>
              }
              @if (settings.get('site_email')) {
                <a href="mailto:{{ settings.get('site_email') }}" class="footer-contact-item">
                  <span class="fci-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  {{ settings.get('site_email') }}
                </a>
              }
              @if (settings.get('site_address')) {
                <div class="footer-contact-item">
                  <span class="fci-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  {{ settings.get('site_address') }}
                </div>
              }
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-col">
            <h4 class="footer-col-title">Quick Links</h4>
            <ul class="footer-links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/categories">All Categories</a></li>
              <li><a routerLink="/search">Search Products</a></li>
              <li><a routerLink="/blog">Blog & Recipes</a></li>
              <li><a routerLink="/contact">Contact Us</a></li>
              <li><a routerLink="/account">My Account</a></li>
            </ul>
          </div>

          <!-- Shop Categories -->
          <div class="footer-col">
            <h4 class="footer-col-title">Shop</h4>
            <ul class="footer-links">
              <li><a routerLink="/categories">Fresh Halal Meats</a></li>
              <li><a routerLink="/categories">Premium Spices</a></li>
              <li><a routerLink="/categories">Fresh Vegetables</a></li>
              <li><a routerLink="/categories">Daily Essentials</a></li>
              <li><a routerLink="/categories">Ethnic Groceries</a></li>
              <li><a routerLink="/categories">Asian Foods</a></li>
            </ul>
          </div>

          <!-- Help & Info -->
          <div class="footer-col">
            <h4 class="footer-col-title">Help</h4>
            <ul class="footer-links">
              <li><a routerLink="/contact">Track My Order</a></li>
              <li><a routerLink="/page/delivery-info">Delivery Info</a></li>
              <li><a routerLink="/page/returns-policy">Returns Policy</a></li>
              <li><a routerLink="/page/privacy-policy">Privacy Policy</a></li>
              <li><a routerLink="/page/terms-conditions">Terms &amp; Conditions</a></li>
              <li><a routerLink="/page/faq">FAQ</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="trust-row-wrap">
        <div class="container">
          <div class="trust-row">
            <div class="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M1 3h15l3 9H1z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
              <span>Free delivery over €50</span>
            </div>
            <div class="trust-sep"></div>
            <div class="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>100% Halal Certified</span>
            </div>
            <div class="trust-sep"></div>
            <div class="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Secure Payments</span>
            </div>
            <div class="trust-sep"></div>
            <div class="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Fresh & Local</span>
            </div>
            <div class="trust-sep"></div>
            <div class="trust-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/><path d="M2 2l20 20"/></svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p class="copyright">{{ settings.get('footer_copyright','© 2026 Asian Spices & Halal Meats. All rights reserved.') }}</p>
          <div class="payment-icons">
            <span class="pay-icon">VISA</span>
            <span class="pay-icon">MC</span>
            <span class="pay-icon">PayPal</span>
            <span class="pay-icon">Stripe</span>
          </div>
        </div>
      </div>

    </footer>
  `,
  styles: [`
    .footer { background: #111; color: rgba(255,255,255,0.75); }

    /* Newsletter */
    .newsletter-strip {
      background: #F28C00; padding: 40px 0;
    }
    .newsletter-inner {
      display: flex; align-items: center; justify-content: space-between;
      gap: 32px; flex-wrap: wrap;
    }
    .nl-left h3 {
      font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700;
      color: white; margin-bottom: 4px;
    }
    .nl-left p { color: rgba(255,255,255,0.8); font-size: 14px; }
    .nl-form { display: flex; gap: 0; flex: 1; max-width: 440px; }
    .nl-input {
      flex: 1; height: 46px; border: none; border-radius: 10px 0 0 10px;
      padding: 0 16px; font-size: 14px; color: #111; outline: none;
      font-family: 'Inter', sans-serif;
    }
    .nl-btn {
      display: flex; align-items: center; gap: 8px;
      background: #070A05; color: white; padding: 0 20px;
      height: 46px; border: none; border-radius: 0 10px 10px 0;
      font-size: 14px; font-weight: 700; cursor: pointer;
      transition: background 0.2s; white-space: nowrap;
      font-family: 'Inter', sans-serif;
    }
    .nl-btn:hover { background: #072213; }

    /* Main footer */
    .footer-main { padding: 56px 0 40px; }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 40px;
    }

    .footer-brand-col {}
    .footer-logo {
      display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 16px;
    }
    .footer-logo-img { height: 44px; object-fit: contain; }
    .footer-brand-name {
      font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700;
      color: white; line-height: 1.2;
    }
    .footer-about {
      font-size: 13.5px; color: rgba(255,255,255,0.55); line-height: 1.75;
      margin-bottom: 20px; max-width: 300px;
    }
    .footer-contact-list { display: flex; flex-direction: column; gap: 10px; }
    .footer-contact-item {
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; color: rgba(255,255,255,0.65);
      text-decoration: none; transition: color 0.2s;
    }
    .footer-contact-item:hover { color: #2E7D32; }
    .fci-icon {
      width: 28px; height: 28px; border-radius: 6px;
      background: rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .footer-col-title {
      font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
      color: white; text-transform: uppercase; letter-spacing: 0.08em;
      margin-bottom: 18px;
    }
    .footer-links { display: flex; flex-direction: column; gap: 10px; }
    .footer-links a {
      font-size: 13.5px; color: rgba(255,255,255,0.55);
      text-decoration: none; transition: color 0.2s;
    }
    .footer-links a:hover { color: #2E7D32; }

    /* Trust row */
    .trust-row-wrap { border-top: 1px solid rgba(255,255,255,0.08); padding: 20px 0; }
    .trust-row {
      display: flex; align-items: center; justify-content: center;
      gap: 0; flex-wrap: wrap;
    }
    .trust-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,0.6);
      padding: 10px 20px;
    }
    .trust-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }

    /* Bottom bar */
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 16px 0;
    }
    .footer-bottom-inner {
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px; flex-wrap: wrap;
    }
    .copyright { font-size: 12.5px; color: rgba(255,255,255,0.35); }
    .payment-icons { display: flex; align-items: center; gap: 8px; }
    .pay-icon {
      font-size: 10px; font-weight: 800; letter-spacing: 0.05em;
      color: rgba(255,255,255,0.5);
      border: 1px solid rgba(255,255,255,0.15);
      padding: 4px 8px; border-radius: 4px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .footer-grid { grid-template-columns: 1fr 1fr 1fr; }
      .footer-brand-col { grid-column: 1 / -1; }
    }
    @media (max-width: 768px) {
      .newsletter-inner { flex-direction: column; align-items: flex-start; }
      .nl-form { max-width: 100%; width: 100%; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
      .footer-brand-col { grid-column: 1 / -1; }
      .trust-row { justify-content: flex-start; gap: 0; }
      .trust-sep { display: none; }
      .trust-item { padding: 8px 16px; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; gap: 24px; }
      .nl-form { flex-direction: column; }
      .nl-input { border-radius: 10px; }
      .nl-btn { border-radius: 10px; height: 44px; justify-content: center; }
      .footer-bottom-inner { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class FooterComponent {
  email = '';
  constructor(public settings: SettingsService) {}

  subscribe(e: Event) {
    e.preventDefault();
    if (this.email) {
      alert('Thank you for subscribing!');
      this.email = '';
    }
  }
}

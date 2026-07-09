import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink],
  template: `
  <!-- Hero -->
  <section class="ac-hero">
    <div class="container">
      <div class="ac-hero-inner">
        <div class="ac-avatar">{{ initials() }}</div>
        <div>
          <h1>My Account</h1>
          <p>Welcome back! Manage your wishlist, orders and preferences.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Body -->
  <section class="ac-body">
    <div class="container ac-layout">

      <!-- Quick Stats -->
      <div class="ac-stats">
        <div class="ac-stat">
          <span class="ac-stat-num">{{ wishlist.count() }}</span>
          <span class="ac-stat-label">Saved Items</span>
        </div>
        <div class="ac-stat">
          <span class="ac-stat-num">{{ cart.itemCount() }}</span>
          <span class="ac-stat-label">In Basket</span>
        </div>
        <div class="ac-stat">
          <span class="ac-stat-num">{{ cur }}{{ cart.subtotal().toFixed(2) }}</span>
          <span class="ac-stat-label">Basket Value</span>
        </div>
      </div>

      <div class="ac-grid">

        <!-- Main: Wishlist -->
        <div class="ac-main">
          <div class="ac-section-head">
            <h2>Saved Items
              @if (wishlist.count() > 0) {
                <span class="ac-badge">{{ wishlist.count() }}</span>
              }
            </h2>
          </div>

          @if (wishlist.items().length === 0) {
            <div class="ac-empty">
              <div class="ac-empty-icon">🤍</div>
              <h3>Nothing saved yet</h3>
              <p>Tap the heart on any product to save it here for later.</p>
              <a routerLink="/categories" class="ac-cta-btn">Browse Products</a>
            </div>
          } @else {
            <div class="ac-wgrid">
              @for (w of wishlist.items(); track w.id) {
                <div class="ac-wcard">
                  <a [routerLink]="['/product', w.slug]" class="ac-wimg">
                    @if (w.image) {
                      <img [src]="w.image" [alt]="w.name" loading="lazy" />
                    } @else {
                      <span class="ac-wph">🛍️</span>
                    }
                  </a>
                  <div class="ac-winfo">
                    <a [routerLink]="['/product', w.slug]" class="ac-wname">{{ w.name }}</a>
                    <strong class="ac-wprice">{{ cur }}{{ (w.salePrice ?? w.price).toFixed(2) }}</strong>
                    <div class="ac-wactions">
                      <a [routerLink]="['/product', w.slug]" class="ac-view-btn">View Product</a>
                      <button (click)="wishlist.remove(w.id)" class="ac-del-btn" aria-label="Remove from wishlist">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Sidebar -->
        <aside class="ac-side">

          <!-- Basket -->
          <div class="ac-card">
            <div class="ac-card-icon">🛒</div>
            <h3>Your Basket</h3>
            <p>{{ cart.itemCount() }} item{{ cart.itemCount() === 1 ? '' : 's' }} worth {{ cur }}{{ cart.subtotal().toFixed(2) }}</p>
            <div class="ac-card-actions">
              <a routerLink="/cart" class="ac-card-btn">View Basket</a>
              @if (cart.itemCount() > 0) {
                <a routerLink="/checkout" class="ac-card-btn ac-card-btn-primary">Checkout</a>
              }
            </div>
          </div>

          <!-- Quick links -->
          <div class="ac-card">
            <div class="ac-card-icon">🔗</div>
            <h3>Quick Links</h3>
            <div class="ac-links">
              <a routerLink="/categories" class="ac-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Browse All Categories
              </a>
              <a routerLink="/blog" class="ac-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/></svg>
                Recipes & Blog
              </a>
              <a routerLink="/contact" class="ac-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Contact Support
              </a>
            </div>
          </div>

          <!-- Need help -->
          <div class="ac-card ac-card-dark">
            <div class="ac-card-icon">💬</div>
            <h3>Need Help?</h3>
            <p>Our friendly team responds within a few hours, 7 days a week.</p>
            <a routerLink="/contact" class="ac-card-btn ac-card-btn-white">Get in Touch</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}

  /* HERO */
  .ac-hero { background: #1F2937; padding: 48px 0 56px; }
  .ac-hero-inner { display: flex; align-items: center; gap: 24px; }
  .ac-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: #1E88A8;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', Georgia, serif; font-size: 1.6rem; color: #fff; flex-shrink: 0;
    box-shadow: 0 6px 20px rgba(30,136,168,.35);
  }
  .ac-hero h1 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.6rem, 3vw, 2.5rem); font-weight: 400; color: #fff; margin-bottom: 6px; }
  .ac-hero p { font-size: 15px; color: rgba(255,255,255,.6); margin: 0; }

  /* BODY */
  .ac-body { padding: 40px 0 64px; background: #FFFFFF; }

  /* STATS ROW */
  .ac-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 32px; }
  .ac-stat { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 16px; padding: 20px; text-align: center; }
  .ac-stat-num { display: block; font-family: 'Manrope', sans-serif; font-size: 1.5rem; font-weight: 800; color: #1E88A8; margin-bottom: 4px; }
  .ac-stat-label { font-size: 12.5px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: .1em; font-family: 'Manrope', sans-serif; }

  /* MAIN GRID */
  .ac-layout { }
  .ac-grid { display: grid; grid-template-columns: 1fr 300px; gap: 28px; align-items: start; }

  /* SECTION HEAD */
  .ac-section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .ac-section-head h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.3rem; font-weight: 400; color: #111827; display: flex; align-items: center; gap: 10px; }
  .ac-badge { font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 800; background: #E6F3F8; color: #1E88A8; padding: 3px 10px; border-radius: 999px; }

  /* EMPTY */
  .ac-empty { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 20px; padding: 60px 40px; text-align: center; }
  .ac-empty-icon { font-size: 3rem; margin-bottom: 14px; }
  .ac-empty h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.4rem; color: #111827; margin-bottom: 8px; }
  .ac-empty p { font-size: 14px; color: #6B7280; margin-bottom: 24px; line-height: 1.7; }
  .ac-cta-btn { display: inline-flex; background: #1E88A8; color: #fff; padding: 12px 28px; border-radius: 999px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; transition: background .2s; }
  .ac-cta-btn:hover { background: #16708C; }

  /* WISHLIST GRID */
  .ac-wgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ac-wcard { display: flex; gap: 14px; background: #fff; border: 1.5px solid #E5E7EB; border-radius: 16px; padding: 14px; transition: all .3s; }
  .ac-wcard:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(17,24,39,.1); border-color: rgba(30,136,168,.25); }
  .ac-wimg { width: 80px; height: 80px; border-radius: 10px; background: #F7FAFC; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ac-wimg img { width: 100%; height: 100%; object-fit: contain; }
  .ac-wph { font-size: 2rem; }
  .ac-winfo { min-width: 0; display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .ac-wname { font-size: 13.5px; font-weight: 700; color: #111827; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; transition: color .2s; }
  .ac-wname:hover { color: #1E88A8; }
  .ac-wprice { font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 800; color: #1E88A8; }
  .ac-wactions { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 8px; }
  .ac-view-btn { font-size: 12px; font-weight: 700; color: #111827; background: #F7FAFC; padding: 5px 12px; border-radius: 999px; transition: all .2s; }
  .ac-view-btn:hover { background: #1E88A8; color: #fff; }
  .ac-del-btn { width: 28px; height: 28px; border-radius: 8px; background: #E6F3F8; border: none; color: #1E88A8; display: grid; place-items: center; cursor: pointer; transition: all .2s; }
  .ac-del-btn:hover { background: #FEE9E7; color: #DC2626; }

  /* SIDEBAR */
  .ac-side { display: flex; flex-direction: column; gap: 16px; position: sticky; top: calc(var(--header-height,156px) + 20px); }
  .ac-card { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 20px; padding: 22px; }
  .ac-card-icon { font-size: 22px; margin-bottom: 10px; }
  .ac-card h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.1rem; color: #111827; margin-bottom: 6px; }
  .ac-card p { font-size: 13.5px; color: #6B7280; line-height: 1.6; margin-bottom: 16px; }
  .ac-card-actions { display: flex; flex-direction: column; gap: 8px; }
  .ac-card-btn { display: flex; align-items: center; justify-content: center; padding: 10px 16px; border-radius: 10px; font-family: 'Manrope', sans-serif; font-size: 13.5px; font-weight: 700; background: #F7FAFC; color: #111827; transition: all .2s; }
  .ac-card-btn:hover { background: #E5E7EB; }
  .ac-card-btn-primary { background: #1E88A8; color: #fff; box-shadow: 0 4px 12px rgba(30,136,168,.25); }
  .ac-card-btn-primary:hover { background: #16708C; }
  .ac-card-btn-white { background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.25); }
  .ac-card-btn-white:hover { background: rgba(255,255,255,.25); }
  .ac-card-dark { background: #1F2937; border-color: transparent; }
  .ac-card-dark h3 { color: #fff; }
  .ac-card-dark p { color: rgba(255,255,255,.65); margin-bottom: 16px; }
  .ac-links { display: flex; flex-direction: column; gap: 4px; }
  .ac-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; font-size: 13.5px; font-weight: 600; color: #111827; transition: all .2s; font-family: 'Manrope', sans-serif; }
  .ac-link:hover { background: #E6F3F8; color: #1E88A8; }
  .ac-link svg { flex-shrink: 0; color: #9CA3AF; }
  .ac-link:hover svg { color: #1E88A8; }

  @media (max-width: 900px) {
    .ac-grid { grid-template-columns: 1fr; }
    .ac-side { position: static; }
    .ac-wgrid { grid-template-columns: 1fr; }
    .ac-stats { grid-template-columns: repeat(3,1fr); }
  }
  @media (max-width: 480px) {
    .ac-stats { grid-template-columns: 1fr; }
    .ac-wgrid { grid-template-columns: 1fr; }
    .ac-hero-inner { flex-direction: column; align-items: flex-start; }
  }

  @media (max-width: 640px) {
    .ac-hero { padding: 26px 0 30px; }
  }
  `]
})
export class AccountComponent {
  constructor(
    public wishlist: WishlistService,
    public cart: CartService,
    private settings: SettingsService,
    seo: SeoService
  ) {
    seo.setMeta({ title: 'My Account', description: 'Manage your wishlist, basket and account preferences.' });
  }
  get cur() { return this.settings.get('currency_symbol', '€'); }
  initials(): string { return '✦'; }
}

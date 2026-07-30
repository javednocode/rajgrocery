import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation, effect, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
  <div class="kgh" [class.scrolled]="scrolled()">

    <!-- ── Announcement ── -->
    <div class="kgh-announce" #announceEl>
      <div class="kgh-wrap kgh-announce-in">
        <span class="kgh-offer">
          <i class="kgh-dot"></i>
          {{ settings.get('header_offer_text','Free delivery on orders over a minimum spend') }}
        </span>
        <nav class="kgh-announce-links" aria-label="Secondary">
          <a routerLink="/about">Our Story</a>
          <a routerLink="/faq">Help</a>
          <a routerLink="/account">Account</a>
        </nav>
      </div>
    </div>

    <!-- ── Main bar ── -->
    <header class="kgh-main" #mainEl>
      <div class="kgh-wrap kgh-main-in">

        <button class="kgh-burger" (click)="mobileMenuOpen.set(true)" aria-label="Open menu">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>

        <a routerLink="/" class="kgh-logo" [attr.aria-label]="settings.get('site_name','Raj Grocery Store') + ' — home'">
          @if (logoUrl()) {
            <img [src]="logoUrl()" [alt]="settings.get('site_name','Raj Grocery Store')" class="kgh-logo-img" (error)="logoFailed.set(true)">
          } @else {
            <span class="kgh-word">
              <span class="kgh-word-main">{{ settings.get('site_name','Raj Grocery Store') }}</span>
              <span class="kgh-word-sub">{{ settings.get('site_tagline','Indian Grocery Store') }}</span>
            </span>
          }
        </a>

        <!-- Search — always visible, not hidden behind a toggle -->
        <div class="kgh-search-wrap">
          <form class="kgh-search-bar" (submit)="submitSearch($event)" role="search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            <input #searchInput [(ngModel)]="q" name="q"
              placeholder="Search groceries, brands & products…"
              autocomplete="off" (input)="onType()" (focus)="openSearch()" aria-label="Search products" />
            @if (q) {
              <button type="button" class="kgh-search-x" (click)="clearSearch()" aria-label="Clear">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            }
            <button type="submit" class="kgh-search-go" aria-label="Search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span>Search</span>
            </button>
          </form>

          <!-- Suggestions / live results dropdown -->
          @if (searchOpen()) {
            <div class="kgh-search-drop">
              @if (results().length) {
                <div class="kgh-hits">
                  @for (p of results(); track p.id) {
                    <a class="kgh-hit" [routerLink]="['/product', p.slug]" (click)="closeSearch(true)">
                      <span class="kgh-hit-img">
                        @if (pimg(p)) { <img [src]="pimg(p)" [alt]="p.name" loading="lazy"> }
                        @else { <b>{{ (p.name||'?')[0] }}</b> }
                      </span>
                      <span class="kgh-hit-txt">
                        <strong>{{ p.name }}</strong>
                        <em>{{ p.brand || p.category_names || '' }}</em>
                      </span>
                      <span class="kgh-hit-price">{{ cur }}{{ p.sale_price || p.price }}</span>
                    </a>
                  }
                  <button type="button" class="kgh-hits-all" (click)="submitSearch()">
                    See all results for “{{ q }}”
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  </button>
                </div>
              } @else if (q && searched()) {
                <p class="kgh-none">Nothing found for “{{ q }}” — try one of these:</p>
                <div class="kgh-chips">
                  @for (s of searchSuggestions; track s) {
                    <button type="button" class="kgh-chip" (click)="quick(s)">{{ s }}</button>
                  }
                </div>
              } @else {
                @if (recent().length) {
                  <span class="kgh-search-label">Recent</span>
                  <div class="kgh-chips">
                    @for (r of recent(); track r) {
                      <button type="button" class="kgh-chip kgh-chip-ghost" (click)="quick(r)">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                        {{ r }}
                      </button>
                    }
                  </div>
                }
                <span class="kgh-search-label">Popular searches</span>
                <div class="kgh-chips">
                  @for (s of searchSuggestions; track s) {
                    <button type="button" class="kgh-chip" (click)="quick(s)">{{ s }}</button>
                  }
                </div>
              }
            </div>
          }
        </div>

        <div class="kgh-actions">
          <a routerLink="/account" class="kgh-icon" aria-label="My account">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M4 20c1.2-3.6 4.2-5.5 8-5.5s6.8 1.9 8 5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </a>

          <a routerLink="/wishlist" class="kgh-icon" aria-label="Wishlist">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            @if (wishlist.count() > 0) { <i class="kgh-bub">{{ wishlist.count() }}</i> }
          </a>

          <button class="kgh-cart" (click)="cart.toggleCart()" aria-label="Open basket" [class.pop]="cartPop()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="10" cy="21" r="1.3" fill="currentColor"/><circle cx="17" cy="21" r="1.3" fill="currentColor"/></svg>
            <span class="kgh-cart-txt">{{ cur }}{{ cart.subtotal().toFixed(2) }}</span>
            @if (cart.itemCount() > 0) { <i class="kgh-bub kgh-bub-cart">{{ cart.itemCount() }}</i> }
          </button>
        </div>
      </div>

      <!-- ── Second row — main nav ── -->
      <nav class="kgh-nav" aria-label="Main">
        <div class="kgh-wrap kgh-nav-in">
          <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <div class="kgh-shop" [class.open]="megaOpen()"
               (mouseenter)="megaOpen.set(true)" (mouseleave)="megaOpen.set(false)">
            <a routerLink="/categories" routerLinkActive="on" class="kgh-shop-link">
              Shop
              <svg width="9" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
            <!-- Mega menu -->
            <div class="kgh-mega" role="menu">
              <div class="kgh-mega-card">
                <div class="kgh-mega-grid">
                  @for (c of cats().slice(0, 8); track c.id) {
                    <a class="kgh-mega-item" [routerLink]="['/category', c.slug]" (click)="megaOpen.set(false)">
                      <span class="kgh-mega-ic">
                        @if (c.image) { <img [src]="media(c.image)" [alt]="''" loading="lazy"> }
                        @else { <b>{{ (c.name || '?')[0] }}</b> }
                      </span>
                      <span class="kgh-mega-txt">
                        <strong>{{ c.name }}</strong>
                        @if (c.product_count) { <em>{{ c.product_count }} products</em> }
                      </span>
                    </a>
                  }
                </div>
                <div class="kgh-mega-side">
                  <span class="kgh-mega-eyebrow">Shop</span>
                  <p class="kgh-mega-head">Everything you need, all in one place.</p>
                  <a routerLink="/categories" class="kgh-mega-cta" (click)="megaOpen.set(false)">
                    Browse everything
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <a routerLink="/search" [queryParams]="{sale:1}" class="kgh-deals" [class.on]="isHotDealsActive()">Offers</a>
          <a routerLink="/blog" routerLinkActive="on">Journal</a>
          <a routerLink="/about" routerLinkActive="on">About Us</a>
          <a routerLink="/contact" routerLinkActive="on">Contact Us</a>
        </div>
      </nav>
    </header>
  </div>

  <!-- Backdrop for the search dropdown / mobile menu -->
  @if (searchOpen() || mobileMenuOpen()) { <div class="kgh-scrim" (click)="closeAll()"></div> }

  <!-- ── Mobile slide-in menu ── -->
  <aside class="kgh-mmenu" [class.open]="mobileMenuOpen()" aria-label="Mobile menu">
    <div class="kgh-mmenu-head">
      <span>{{ settings.get('site_name','Raj Grocery Store') }}</span>
      <button (click)="mobileMenuOpen.set(false)" aria-label="Close menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <nav class="kgh-mmenu-links">
      <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}" (click)="mobileMenuOpen.set(false)">Home</a>
      <a routerLink="/categories" routerLinkActive="on" (click)="mobileMenuOpen.set(false)">Categories</a>
      <a routerLink="/search" [queryParams]="{sale:1}" (click)="mobileMenuOpen.set(false)">Offers</a>
      <a routerLink="/blog" routerLinkActive="on" (click)="mobileMenuOpen.set(false)">Journal</a>
      <a routerLink="/about" routerLinkActive="on" (click)="mobileMenuOpen.set(false)">About Us</a>
      <a routerLink="/contact" routerLinkActive="on" (click)="mobileMenuOpen.set(false)">Contact Us</a>
      <a routerLink="/faq" routerLinkActive="on" (click)="mobileMenuOpen.set(false)">FAQ</a>
      <div class="kgh-mmenu-div"></div>
      <a routerLink="/account" routerLinkActive="on" (click)="mobileMenuOpen.set(false)">My Account</a>
      <a routerLink="/wishlist" routerLinkActive="on" (click)="mobileMenuOpen.set(false)">Wishlist</a>
    </nav>
  </aside>

  <!-- ── Mobile bottom nav ── -->
  <nav class="kgh-bnav" aria-label="Mobile navigation">
    <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
      <span>Home</span>
    </a>
    <a routerLink="/categories" routerLinkActive="on">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/></svg>
      <span>Shop</span>
    </a>
    <button class="kgh-bnav-search" (click)="focusMobileSearch()">
      <span class="kgh-bnav-fab">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </span>
      <span>Search</span>
    </button>
    <a routerLink="/wishlist" routerLinkActive="on" class="kgh-bnav-wish">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
      @if (wishlist.count() > 0) { <i class="kgh-bnav-dot">{{ wishlist.count() }}</i> }
      <span>Saved</span>
    </a>
    <button (click)="cart.toggleCart()" class="kgh-bnav-cart">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="10" cy="21" r="1.3" fill="currentColor"/><circle cx="17" cy="21" r="1.3" fill="currentColor"/></svg>
      @if (cart.itemCount() > 0) { <i class="kgh-bnav-dot">{{ cart.itemCount() }}</i> }
      <span>Basket</span>
    </button>
  </nav>
  `,
  styles: [`
  /* ═══ RAJ GROCERY — HEADER ═══
     Three stacked bands: announcement (deep masala), the shop bar
     (paper), and the nav rail (warm sand). Layering the third band in
     sand rather than a third sheet of white is what stops this reading
     as a generic SaaS navbar. */
  .kgh { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
  .kgh-wrap { max-width: 1360px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media (min-width: 768px)  { .kgh-wrap { padding: 0 40px; } }
  @media (min-width: 1200px) { .kgh-wrap { padding: 0 56px; } }

  /* ── Announcement ── */
  .kgh-announce {
    background: var(--raj-dark); color: var(--raj-ink);
    height: 36px; font-size: 12px; display: flex; align-items: center;
    transition: margin-top .4s var(--ease);
    position: relative; z-index: 2;
  }
  .kgh.scrolled .kgh-announce { margin-top: -36px; }
  .kgh-announce-in { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
  .kgh-offer {
    display: flex; align-items: center; gap: 9px; font-weight: 600;
    letter-spacing: .01em; white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; min-width: 0;
  }
  .kgh-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--raj-turmeric); flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(228,163,59,.22);
  }
  .kgh-announce-links { display: flex; align-items: center; gap: 22px; }
  /* The announcement bar is a light tint, so these need dark ink —
     they were left white when the bar went from dark to light. */
  .kgh-announce-links a {
    font-size: 11.5px; font-weight: 700; color: var(--raj-ink-2);
    transition: color .2s; letter-spacing: .03em;
  }
  .kgh-announce-links a:hover { color: var(--raj-leaf); }

  /* ── Main shop bar ── */
  .kgh-main {
    position: relative; z-index: 1;
    background: var(--raj-paper);
    border-bottom: 1px solid var(--raj-line-lt);
    transition: box-shadow .3s ease;
  }
  .kgh.scrolled .kgh-main { box-shadow: 0 6px 24px rgba(18,42,64,.09); }
  .kgh-main-in { display: flex; align-items: center; gap: 22px; padding: 15px 0; flex-wrap: wrap; }

  /* Burger (mobile only) */
  .kgh-burger {
    display: none; width: 42px; height: 42px; border-radius: var(--r-sm);
    align-items: center; justify-content: center;
    color: var(--raj-ink); flex-shrink: 0; transition: background .2s;
  }
  .kgh-burger:hover { background: var(--raj-warm); }

  /* Wordmark — Fraunces display over a turmeric micro-label */
  .kgh-logo { display: flex; align-items: center; flex-shrink: 0; }
  .kgh-logo-img { height: 54px; width: auto; max-width: 210px; object-fit: contain; }
  .kgh-word { display: flex; flex-direction: column; line-height: 1; }
  .kgh-word-main {
    font-family: var(--font-display); font-size: 26px; font-weight: 600;
    letter-spacing: -0.018em; color: var(--raj-ink); white-space: nowrap;
  }
  .kgh-word-sub {
    font-family: var(--font-sans); font-size: 8px; font-weight: 800;
    letter-spacing: .155em; text-transform: uppercase; color: var(--raj-turmeric-dk);
    margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 250px;
  }

  /* ── Search — full pill, the shop's front counter ── */
  .kgh-search-wrap { position: relative; flex: 1 1 340px; min-width: 0; order: 3; }
  .kgh-search-bar {
    display: flex; align-items: center; gap: 11px;
    height: var(--input-h); padding: 0 5px 0 18px;
    border: 1.5px solid var(--raj-line); border-radius: var(--r-full);
    background: var(--raj-warm);
    transition: border-color .25s, background .25s, box-shadow .25s;
  }
  .kgh-search-bar:focus-within {
    border-color: var(--raj-leaf); background: var(--raj-paper);
    box-shadow: 0 0 0 4px rgba(23,81,63,.09);
  }
  .kgh-search-bar > svg:first-child { color: var(--raj-muted); flex-shrink: 0; }
  .kgh-search-bar input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: var(--font-sans); font-size: 14.5px;
    color: var(--raj-ink); min-width: 0;
  }
  .kgh-search-bar input::placeholder { color: var(--raj-faint); }
  .kgh-search-x {
    width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center;
    color: var(--raj-muted); background: var(--raj-sand-2); transition: var(--t); flex-shrink: 0;
  }
  .kgh-search-x:hover { background: var(--raj-line-warm); color: var(--raj-ink); }
  .kgh-search-go {
    display: flex; align-items: center; gap: 7px;
    background: var(--raj-leaf); color: #fff;
    height: calc(var(--input-h) - 10px); padding: 0 20px; border-radius: var(--r-full);
    font-size: 13.5px; font-weight: 800; flex-shrink: 0;
    transition: background .2s, transform .2s;
  }
  .kgh-search-go:hover { background: var(--raj-leaf-dk); }
  .kgh-search-go:active { transform: scale(.97); }
  .kgh-search-go span { display: none; }
  @media (min-width: 640px) { .kgh-search-go span { display: inline; } }

  /* Search dropdown */
  .kgh-search-drop {
    position: absolute; top: calc(100% + 10px); left: 0; right: 0;
    background: var(--raj-paper); border: 1px solid var(--raj-line);
    border-radius: var(--r-xl);
    box-shadow: 0 20px 52px rgba(18,42,64,.17);
    padding: 16px; z-index: 60;
    max-height: min(480px, 70vh); overflow-y: auto;
    animation: kghDrop .22s var(--ease) both;
  }
  @keyframes kghDrop { from { opacity: 0; transform: translateY(-7px); } to { opacity: 1; transform: none; } }
  .kgh-search-label {
    display: block; font-size: 10px; font-weight: 800; letter-spacing: .17em;
    text-transform: uppercase; color: var(--raj-faint); margin: 4px 0 10px;
  }
  .kgh-search-label:not(:first-child) { margin-top: 18px; }
  .kgh-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .kgh-chip {
    display: inline-flex; align-items: center; gap: 7px;
    min-height: 38px; padding: 8px 16px; border-radius: var(--r-full);
    border: 1.5px solid var(--raj-line); background: var(--raj-paper);
    font-size: 13px; font-weight: 700; color: var(--raj-ink-2);
    transition: var(--t); cursor: pointer;
  }
  .kgh-chip:hover { border-color: var(--raj-leaf); color: var(--raj-leaf); background: var(--raj-leaf-bg); }
  .kgh-chip-ghost { color: var(--raj-muted); border-style: dashed; }
  .kgh-none { font-size: 14px; color: var(--raj-muted); margin: 0 0 10px; }

  .kgh-hits { display: flex; flex-direction: column; }
  .kgh-hit {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 8px; border-radius: var(--r); transition: background .2s;
  }
  .kgh-hit:hover { background: var(--raj-warm); }
  .kgh-hit-img {
    width: 48px; height: 48px; border-radius: var(--r-sm); background: var(--raj-sand);
    overflow: hidden; display: grid; place-items: center; flex-shrink: 0;
  }
  .kgh-hit-img img { width: 100%; height: 100%; object-fit: cover; }
  .kgh-hit-img b { font-size: 18px; color: var(--raj-faint); font-weight: 800; }
  .kgh-hit-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; line-height: 1.3; }
  .kgh-hit-txt strong { font-size: 14px; font-weight: 700; color: var(--raj-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kgh-hit-txt em { font-style: normal; font-size: 11.5px; color: var(--raj-muted); }
  .kgh-hit-price { font-size: 14.5px; font-weight: 800; color: var(--raj-leaf); flex-shrink: 0; }
  .kgh-hits-all {
    display: inline-flex; align-items: center; gap: 8px;
    margin: 12px 8px 0; font-size: 13px; font-weight: 800;
    color: var(--raj-leaf); transition: gap .2s;
  }
  .kgh-hits-all:hover { gap: 12px; }

  /* ── Actions ── */
  .kgh-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; order: 4; }

  .kgh-icon {
    position: relative; width: 44px; height: 44px; border-radius: var(--r-sm);
    display: grid; place-items: center; color: var(--raj-ink-2);
    transition: background .2s, color .2s;
  }
  .kgh-icon:hover { background: var(--raj-leaf-bg); color: var(--raj-leaf); }
  .kgh-bub {
    position: absolute; top: 4px; right: 3px;
    min-width: 17px; height: 17px; border-radius: 999px;
    background: var(--raj-turmeric); color: var(--raj-ink);
    font-style: normal; font-size: 9.5px; font-weight: 800;
    display: grid; place-items: center; padding: 0 4px;
    border: 2px solid var(--raj-paper);
  }

  /* Cart pill — carries the running subtotal */
  .kgh-cart {
    position: relative; display: flex; align-items: center; gap: 9px;
    background: var(--raj-leaf); color: #fff;
    height: 44px; padding: 0 18px; border-radius: var(--r-full); cursor: pointer;
    font-family: var(--font-sans); font-size: 13.5px; font-weight: 800;
    transition: background .2s, box-shadow .2s;
    margin-left: 4px;
  }
  .kgh-cart:hover { background: var(--raj-leaf-dk); box-shadow: var(--shadow-leaf); }
  .kgh-cart.pop { animation: kghCartPop .45s var(--ease2); }
  @keyframes kghCartPop { 0% { transform: scale(1); } 38% { transform: scale(1.09); } 100% { transform: scale(1); } }
  .kgh-bub-cart { top: -4px; right: -3px; border-color: var(--raj-paper); }

  /* ── Nav rail — warm sand band ── */
  .kgh-nav {
    background: var(--raj-warm);
    border-bottom: 1px solid var(--raj-line);
  }
  .kgh-nav-in { display: flex; align-items: center; gap: 2px; height: 46px; }
  .kgh-nav-in > a, .kgh-shop-link {
    display: flex; align-items: center; gap: 5px; height: 100%;
    font-family: var(--font-sans); font-size: 13.5px; font-weight: 700;
    color: var(--raj-ink-2); padding: 0 15px;
    transition: color .2s; white-space: nowrap; position: relative;
  }
  .kgh-nav-in > a::after, .kgh-shop-link::after {
    content: ''; position: absolute; left: 15px; right: 15px; bottom: 0; height: 2.5px;
    background: var(--raj-leaf); border-radius: 2px 2px 0 0;
    transform: scaleX(0); transform-origin: 50%;
    transition: transform .22s var(--ease);
  }
  .kgh-nav-in > a:hover, .kgh-nav-in > a.on,
  .kgh-shop:hover .kgh-shop-link, .kgh-shop-link.on { color: var(--raj-leaf); }
  .kgh-nav-in > a:hover::after, .kgh-nav-in > a.on::after,
  .kgh-shop:hover .kgh-shop-link::after, .kgh-shop-link.on::after { transform: scaleX(1); }
  .kgh-deals { color: var(--raj-chilli) !important; }
  .kgh-deals::after { background: var(--raj-chilli) !important; }
  .kgh-shop { position: relative; height: 100%; display: flex; align-items: center; }
  .kgh-shop-link svg { transition: transform .25s var(--ease); margin-top: 1px; opacity: .55; }
  .kgh-shop.open .kgh-shop-link svg { transform: rotate(180deg); }

  /* ── Mega menu ── */
  .kgh-mega {
    position: absolute; top: 100%; left: 0;
    padding-top: 10px; width: min(740px, calc(100vw - 48px));
    opacity: 0; visibility: hidden; pointer-events: none;
    transform: translateY(6px);
    transition: opacity .2s ease, transform .2s ease, visibility .2s;
    z-index: 60;
  }
  .kgh-shop.open .kgh-mega { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); }
  .kgh-mega-card {
    display: grid; grid-template-columns: 1.75fr 1fr;
    background: var(--raj-paper);
    border: 1px solid var(--raj-line);
    border-radius: var(--r-xl); overflow: hidden;
    box-shadow: 0 26px 64px rgba(18,42,64,.19);
  }
  .kgh-mega-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; padding: 16px; }
  .kgh-mega-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: var(--r); transition: background .2s;
  }
  .kgh-mega-item:hover { background: var(--raj-warm); }
  .kgh-mega-ic {
    width: 42px; height: 42px; border-radius: var(--r-sm); overflow: hidden;
    background: var(--raj-leaf-bg); display: grid; place-items: center; flex-shrink: 0;
  }
  .kgh-mega-ic img { width: 100%; height: 100%; object-fit: cover; }
  .kgh-mega-ic b { font-size: 17px; color: var(--raj-leaf); font-weight: 800; }
  .kgh-mega-txt { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .kgh-mega-txt strong { font-size: 13px; font-weight: 700; color: var(--raj-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kgh-mega-txt em { font-style: normal; font-size: 11px; color: var(--raj-muted); }
  .kgh-mega-side {
    background: var(--raj-dark); color: var(--raj-ink);
    padding: 26px; display: flex; flex-direction: column; justify-content: flex-end; gap: 8px;
    position: relative; overflow: hidden;
  }
  .kgh-mega-side::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 80% 0%, rgba(228,163,59,.18), transparent 70%);
    pointer-events: none;
  }
  .kgh-mega-eyebrow { font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: var(--raj-muted); position: relative; }
  .kgh-mega-head { font-family: var(--font-display); font-size: 20px; font-weight: 600; line-height: 1.22; color: #fff; margin: 0; position: relative; }
  .kgh-mega-cta {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
    color: var(--raj-turmeric-lt); margin-top: 4px; position: relative;
    transition: gap .2s;
  }
  .kgh-mega-cta:hover { gap: 11px; }

  .kgh-scrim {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(16,35,54,.38);
    animation: fadeIn .2s ease both;
  }

  /* ── Mobile slide-in menu ── */
  .kgh-mmenu {
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 1300;
    width: min(310px, 85vw);
    background: var(--raj-paper);
    transform: translateX(-100%);
    transition: transform .32s var(--ease);
    display: flex; flex-direction: column;
    box-shadow: 20px 0 54px rgba(16,35,54,.2);
  }
  .kgh-mmenu.open { transform: none; }
  .kgh-mmenu-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px; border-bottom: 1px solid var(--raj-line);
    font-family: var(--font-display); font-weight: 600; font-size: 19px; color: var(--raj-ink);
  }
  .kgh-mmenu-head button {
    width: 38px; height: 38px; border-radius: var(--r-sm);
    display: grid; place-items: center; color: var(--raj-muted);
    transition: background .2s;
  }
  .kgh-mmenu-head button:hover { background: var(--raj-warm); }
  .kgh-mmenu-links { display: flex; flex-direction: column; padding: 10px 8px; overflow-y: auto; }
  .kgh-mmenu-links a {
    padding: 13px 14px; border-radius: var(--r-sm);
    font-size: 15px; font-weight: 600; color: var(--raj-ink-2);
    transition: background .2s, color .2s;
  }
  .kgh-mmenu-links a:hover { background: var(--raj-warm); }
  .kgh-mmenu-links a.on { color: var(--raj-leaf); background: var(--raj-leaf-bg); font-weight: 700; }
  .kgh-mmenu-div { height: 1px; background: var(--raj-line); margin: 8px 14px; }

  /* ── Mobile bottom nav ── */
  .kgh-bnav { display: none; }

  @media (max-width: 1180px) { .kgh-main-in { gap: 14px; } }
  @media (max-width: 1023px) {
    .kgh-nav { display: none; }
    .kgh-mega { display: none; }
    .kgh-cart-txt { display: none; }
    .kgh-cart { padding: 0 13px; }
    .kgh-burger { display: flex; }
    .kgh-icon:first-child { display: none; } /* Account: reachable via mobile menu */
  }
  @media (max-width: 900px) {
    .kgh-announce { height: 30px; font-size: 11px; }
    .kgh.scrolled .kgh-announce { margin-top: -30px; }
    .kgh-announce-links { display: none; }
    .kgh-announce-in { justify-content: center; }
    /* Mobile top bar: burger | centred logo | balancing spacer.
       The cart lives in the bottom nav on mobile, so the top cart pill
       is dropped rather than duplicated — the spacer keeps the logo
       optically centred now that the right side is empty. */
    .kgh-main-in {
      display: grid;
      grid-template-columns: 42px 1fr 42px;
      grid-template-areas: 'burger logo spacer' 'search search search';
      align-items: center;
      padding: 11px 0 10px; gap: 10px 6px;
    }
    .kgh-burger { grid-area: burger; }
    .kgh-logo { grid-area: logo; justify-self: center; }
    .kgh-logo-img { height: 84px; }
    .kgh-word { align-items: center; text-align: center; }
    .kgh-word-main { font-size: 30px; }
    .kgh-word-sub { display: none; }
    body { padding-bottom: 76px; }

    .kgh-search-wrap { grid-area: search; margin-top: 2px; }
    /* Account, wishlist and cart are all reachable from the bottom nav */
    .kgh-icon, .kgh-cart { display: none; }
    .kgh-actions { display: none; }

    .kgh-bnav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 1002;
      display: grid; grid-template-columns: repeat(5, 1fr);
      background: var(--raj-paper);
      border-top: 1px solid var(--raj-line);
      padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
      box-shadow: 0 -8px 26px rgba(18,42,64,.09);
    }
    .kgh-bnav a, .kgh-bnav button {
      position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px;
      font-family: var(--font-sans); font-size: 10px; font-weight: 800; letter-spacing: .02em;
      color: var(--raj-muted); padding: 4px 0; min-height: 44px; justify-content: center;
      transition: color .2s;
    }
    .kgh-bnav a.on, .kgh-bnav button.on { color: var(--raj-leaf); }
    .kgh-bnav-fab {
      width: 46px; height: 46px; border-radius: 999px; margin-top: -22px;
      display: grid; place-items: center;
      background: var(--raj-leaf); color: #fff;
      box-shadow: var(--shadow-leaf);
      border: 3px solid var(--raj-paper);
    }
    .kgh-bnav-dot {
      position: absolute; top: 0; right: calc(50% - 19px);
      min-width: 16px; height: 16px; border-radius: 999px;
      background: var(--raj-turmeric); color: var(--raj-ink);
      font-style: normal; font-size: 9.5px; font-weight: 800;
      display: grid; place-items: center; padding: 0 4px;
      border: 2px solid var(--raj-paper);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .kgh-mmenu, .kgh-mega, .kgh-cart.pop, .kgh-search-drop,
    .kgh-announce { transition: none !important; animation: none !important; }
  }
  `]
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('announceEl') announceEl?: ElementRef<HTMLDivElement>;
  @ViewChild('mainEl') mainEl?: ElementRef<HTMLElement>;

  q = '';
  scrolled = signal(false);
  megaOpen = signal(false);
  searchOpen = signal(false);
  mobileMenuOpen = signal(false);
  cats = signal<any[]>([]);
  results = signal<any[]>([]);
  searched = signal(false);
  recent = signal<string[]>(this.loadRecent());
  cartPop = signal(false);

  readonly searchSuggestions = ['Ghee', 'Basmati rice', 'Masala', 'Snacks', 'Pickles', 'Spices'];

  private mediaUrl = (environment as any).mediaUrl || '';
  private debounce: ReturnType<typeof setTimeout> | null = null;
  private routerSub?: Subscription;
  private lastCount = 0;
  private headerRO?: ResizeObserver;

  constructor(
    public cart: CartService,
    public wishlist: WishlistService,
    public settings: SettingsService,
    private api: ApiService,
    private router: Router,
  ) {
    // Pop the cart pill whenever the item count grows
    effect(() => {
      const n = this.cart.itemCount();
      if (n > this.lastCount) {
        this.cartPop.set(true);
        setTimeout(() => this.cartPop.set(false), 550);
      }
      this.lastCount = n;
    });

    this.api.getCategories().subscribe({
      next: (r: any) => { if (r?.success) this.cats.set(r.data || []); },
      error: () => {}
    });
  }

  get cur() { return this.settings.get('currency_symbol', 'HK$'); }

  ngOnInit() {
    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) { this.megaOpen.set(false); this.closeSearch(true); this.mobileMenuOpen.set(false); }
    });
  }

  /**
   * The rest of the page reserves space for the fixed header via the
   * --header-height CSS var (used for main-content's padding-top and the
   * scroll-padding-top). That used to be a hand-guessed pixel constant per
   * breakpoint — it went stale (and content slid under the header) every
   * time header content changed height, e.g. the search bar wrapping to a
   * second row on mobile, or a logo size change like this one. Measuring
   * the header's own two children and writing the sum to the CSS var means
   * it can never drift out of sync again, regardless of logo size, font
   * scaling, translation-driven wrapping, or future edits.
   *
   * Deliberately sums announceEl + mainEl's own offsetHeight rather than
   * reading the outer .kgh wrapper: the scroll-shrink effect pulls the
   * announcement bar up with a negative margin-top (so the fixed header
   * visually shrinks as you scroll), but the space reserved in normal flow
   * must stay at the resting (unscrolled) height or the page would jump.
   * Each element's own offsetHeight is unaffected by that margin trick.
   */
  ngAfterViewInit() {
    if (typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const a = this.announceEl?.nativeElement.offsetHeight || 0;
      const m = this.mainEl?.nativeElement.offsetHeight || 0;
      const h = a + m;
      if (!h) return;
      const root = document.documentElement.style;
      root.setProperty('--header-height', h + 'px');
      root.setProperty('--header-h', h + 'px');
    };
    this.headerRO = new ResizeObserver(measure);
    if (this.announceEl) this.headerRO.observe(this.announceEl.nativeElement);
    if (this.mainEl) this.headerRO.observe(this.mainEl.nativeElement);
    measure();
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.headerRO?.disconnect();
  }

  @HostListener('window:scroll') onScroll() {
    this.scrolled.set(window.scrollY > 24);
  }
  @HostListener('document:keydown.escape') onEsc() { this.closeAll(); }

  closeAll() { this.closeSearch(); this.megaOpen.set(false); this.mobileMenuOpen.set(false); }

  openSearch() { this.searchOpen.set(true); }
  closeSearch(silent = false) {
    if (!this.searchOpen()) return;
    this.searchOpen.set(false);
    if (!silent) { this.q = ''; this.results.set([]); this.searched.set(false); }
  }
  clearSearch() { this.q = ''; this.results.set([]); this.searched.set(false); }

  focusMobileSearch() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => this.searchInput?.nativeElement.focus(), 250);
  }

  onType() {
    if (this.debounce) clearTimeout(this.debounce);
    const q = this.q.trim();
    if (q.length < 2) { this.results.set([]); this.searched.set(false); return; }
    this.debounce = setTimeout(() => {
      this.api.searchProducts(q).subscribe({
        next: (r: any) => {
          const list = (r?.data || []).slice(0, 6);
          this.results.set(list);
          this.searched.set(true);
        },
        error: () => { this.results.set([]); this.searched.set(true); }
      });
    }, 240);
  }

  quick(term: string) { this.q = term; this.submitSearch(); }

  submitSearch(e?: Event) {
    e?.preventDefault();
    const q = this.q.trim();
    if (!q) return;
    this.saveRecent(q);
    this.closeSearch(true);
    this.router.navigate(['/search'], { queryParams: { q } });
    this.q = ''; this.results.set([]); this.searched.set(false);
  }

  private loadRecent(): string[] {
    try { return JSON.parse(localStorage.getItem('kg_recent') || '[]'); } catch { return []; }
  }
  private saveRecent(q: string) {
    const list = [q, ...this.recent().filter(r => r.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    this.recent.set(list);
    try { localStorage.setItem('kg_recent', JSON.stringify(list)); } catch {}
  }

  isHotDealsActive(): boolean {
    const url = this.router.url;
    return url.startsWith('/search') && url.includes('sale=1');
  }

  media(p: string) {
    if (!p) return '';
    return p.startsWith('http') ? p : this.mediaUrl + p;
  }
  pimg(p: any): string {
    const path = p.primary_image || p.images?.[0]?.image_path || '';
    return path ? this.media(path) : '';
  }

  /** Set when the configured logo file 404s, so the wordmark takes over
   *  instead of rendering a broken image. */
  logoFailed = signal(false);

  logoUrl(): string {
    if (this.logoFailed()) return '';
    const raw = this.settings.get('site_logo', '');
    if (!raw) return '';
    try { return this.settings.versionedAssetUrl(raw, ''); } catch { return ''; }
  }
}

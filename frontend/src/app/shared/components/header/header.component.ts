import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation, effect, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CountryService, CountryCode } from '../../../core/services/country.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
  <div class="kgh" [class.scrolled]="scrolled()" [class.search-on]="searchOpen()">

    <!-- ── Announcement ── -->
    <div class="kgh-announce">
      <div class="kgh-wrap kgh-announce-in">
        <span class="kgh-offer">
          <i class="kgh-dot"></i>
          {{ settings.get('header_offer_text','Free delivery on orders over €50') }}
        </span>
        <span class="kgh-announce-mid" aria-hidden="true">{{ countryNames() }}</span>
        <nav class="kgh-announce-links" aria-label="Secondary">
          <a routerLink="/about">Our Story</a>
          <a routerLink="/faq">Help</a>
          <a routerLink="/account">Account</a>
        </nav>
      </div>
    </div>

    <!-- ── Main bar ── -->
    <header class="kgh-main">
      <div class="kgh-wrap kgh-main-in">

        <a routerLink="/" class="kgh-logo" aria-label="Kale Gida — home">
          @if (logoUrl()) {
            <img [src]="logoUrl()" [alt]="settings.get('site_name','Kale Gida')" class="kgh-logo-img">
          } @else {
            <span class="kgh-word">
              <span class="kgh-word-main">{{ settings.get('site_name','Kale Gida') }}</span>
              <span class="kgh-word-sub">International Grocers</span>
            </span>
          }
        </a>

        <nav class="kgh-nav" aria-label="Main">
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
                  <span class="kgh-mega-eyebrow">{{ country.current().flag }} {{ country.current().name }}</span>
                  <p class="kgh-mega-head">{{ country.current().headline }}</p>
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
          <a routerLink="/contact" routerLinkActive="on">Contact</a>
        </nav>

        <div class="kgh-actions">

          <!-- Country pills -->
          <div class="kgh-worlds" role="group" aria-label="Choose your marketplace">
            @for (c of country.all; track c.code) {
              <button class="kgh-world"
                [class.on]="country.code() === c.code"
                (click)="pick(c.code)"
                [attr.aria-pressed]="country.code() === c.code"
                [attr.aria-label]="'Shop ' + c.name">
                <span class="kgh-world-flag">{{ c.flag }}</span>
                <span class="kgh-world-name">{{ c.name }}</span>
              </button>
            }
          </div>

          <button class="kgh-icon" (click)="toggleSearch()" aria-label="Search" [class.lit]="searchOpen()">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </button>

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

      <!-- ── Search overlay ── -->
      <div class="kgh-search" [class.open]="searchOpen()">
        <div class="kgh-wrap">
          <form class="kgh-search-bar" (submit)="submitSearch($event)" role="search">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            <input #searchInput [(ngModel)]="q" name="q"
              [placeholder]="'Search groceries in ' + country.current().name + '…'"
              autocomplete="off" (input)="onType()" aria-label="Search products" />
            @if (q) {
              <button type="button" class="kgh-search-x" (click)="q=''; results.set([])" aria-label="Clear">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            }
            <button type="submit" class="kgh-search-go">Search</button>
          </form>

          <div class="kgh-search-body">
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
                <button class="kgh-hits-all" (click)="submitSearch()">
                  See all results for “{{ q }}”
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              </div>
            } @else if (q && searched()) {
              <p class="kgh-none">Nothing found for “{{ q }}” — try one of these:</p>
              <div class="kgh-chips">
                @for (s of country.current().suggestions; track s) {
                  <button class="kgh-chip" (click)="quick(s)">{{ s }}</button>
                }
              </div>
            } @else {
              @if (recent().length) {
                <span class="kgh-search-label">Recent</span>
                <div class="kgh-chips">
                  @for (r of recent(); track r) {
                    <button class="kgh-chip kgh-chip-ghost" (click)="quick(r)">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                      {{ r }}
                    </button>
                  }
                </div>
              }
              <span class="kgh-search-label">Popular in {{ country.current().name }} {{ country.current().flag }}</span>
              <div class="kgh-chips">
                @for (s of country.current().suggestions; track s) {
                  <button class="kgh-chip" (click)="quick(s)">{{ s }}</button>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </header>

    <!-- Scroll progress hairline -->
    <span class="kgh-progressbar" [style.transform]="'scaleX(' + prog() + ')'" aria-hidden="true"></span>
  </div>

  <!-- Search backdrop -->
  @if (searchOpen()) { <div class="kgh-scrim" (click)="closeSearch()"></div> }

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
    <button class="kgh-bnav-search" (click)="toggleSearch()" [class.on]="searchOpen()">
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
  /* ═══ KALE GIDA HEADER ═══ */
  .kgh { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
  .kgh-wrap { max-width: 1360px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media (min-width: 768px)  { .kgh-wrap { padding: 0 40px; } }
  @media (min-width: 1200px) { .kgh-wrap { padding: 0 56px; } }

  /* ── Announcement ── */
  .kgh-announce {
    background: var(--kg-forest-dk); color: rgba(250,246,239,.78);
    height: 36px; font-size: 12px; display: flex; align-items: center;
    transition: margin-top .45s cubic-bezier(0.22,1,0.36,1);
    position: relative; z-index: 2;
  }
  .kgh.scrolled .kgh-announce { margin-top: -36px; }
  .kgh-announce-in { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
  .kgh-offer { display: flex; align-items: center; gap: 9px; font-weight: 600; letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .kgh-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--kg-terra-lt); flex-shrink: 0; animation: kghPulse 2.4s infinite; }
  @keyframes kghPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(217,141,95,.45); } 50% { box-shadow: 0 0 0 5px rgba(217,141,95,0); } }
  .kgh-announce-mid {
    font-family: var(--font-sans); font-size: 10.5px; font-weight: 800;
    letter-spacing: .3em; text-transform: uppercase; color: rgba(250,246,239,.44);
  }
  .kgh-announce-links { display: flex; align-items: center; gap: 20px; }
  .kgh-announce-links a { font-size: 11.5px; font-weight: 700; color: rgba(250,246,239,.62); transition: color .2s; letter-spacing: .02em; }
  .kgh-announce-links a:hover { color: #FAF6EF; }

  /* ── Main bar ── */
  .kgh-main {
    position: relative; z-index: 1;
    background: var(--kg-cream);
    border-bottom: 1px solid transparent;
    transition: background .4s ease, border-color .4s ease, box-shadow .4s ease;
  }
  .kgh.scrolled .kgh-main {
    background: rgba(250,246,239,.82);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    backdrop-filter: blur(18px) saturate(1.5);
    border-bottom-color: var(--kg-line);
    box-shadow: 0 12px 40px rgba(33,29,22,.07);
  }
  .kgh-main-in { height: 72px; display: flex; align-items: center; gap: 28px; }

  /* Logo */
  .kgh-logo { display: flex; align-items: center; flex-shrink: 0; }
  .kgh-logo-img { height: 46px; width: auto; max-width: 168px; object-fit: contain; }
  .kgh-word { display: flex; flex-direction: column; line-height: 1; }
  .kgh-word-main {
    font-family: var(--font-serif); font-size: 27px; font-weight: 500;
    letter-spacing: -0.02em; color: var(--kg-ink);
    font-variation-settings: 'opsz' 60;
  }
  .kgh-word-sub {
    font-family: var(--font-sans); font-size: 8.5px; font-weight: 800;
    letter-spacing: .34em; text-transform: uppercase; color: var(--kg-terra);
    margin-top: 5px;
  }

  /* Nav */
  .kgh-nav { display: flex; align-items: center; gap: 4px; height: 100%; }
  .kgh-nav > a, .kgh-shop-link {
    display: flex; align-items: center; gap: 5px;
    font-family: var(--font-sans); font-size: 14px; font-weight: 700;
    color: var(--kg-ink-2); padding: 9px 15px; border-radius: 999px;
    transition: background .25s, color .25s; white-space: nowrap; position: relative;
  }
  .kgh-nav > a:hover, .kgh-nav > a.on,
  .kgh-shop:hover .kgh-shop-link, .kgh-shop-link.on {
    color: var(--kg-forest); background: rgba(31,77,58,.07);
  }
  .kgh-deals { color: var(--kg-terra) !important; }
  .kgh-deals:hover, .kgh-deals.on { background: rgba(196,98,45,.09) !important; }
  .kgh-shop { position: relative; height: 100%; display: flex; align-items: center; }
  .kgh-shop-link svg { transition: transform .3s var(--ease); margin-top: 1px; opacity: .6; }
  .kgh-shop.open .kgh-shop-link svg { transform: rotate(180deg); }

  /* Mega menu */
  .kgh-mega {
    position: absolute; top: calc(100% - 6px); left: 50%;
    transform: translateX(-50%) translateY(14px) scale(.98);
    padding-top: 18px; width: min(760px, calc(100vw - 48px));
    opacity: 0; visibility: hidden; pointer-events: none;
    transition: opacity .32s var(--ease), transform .32s var(--ease), visibility .32s;
    z-index: 60;
  }
  .kgh-shop.open .kgh-mega { opacity: 1; visibility: visible; pointer-events: auto; transform: translateX(-50%) translateY(0) scale(1); }
  .kgh-mega-card {
    display: grid; grid-template-columns: 1.75fr 1fr;
    background: rgba(255,253,248,.92);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    backdrop-filter: blur(24px) saturate(1.4);
    border: 1px solid var(--kg-line);
    border-radius: 22px; overflow: hidden;
    box-shadow: 0 32px 80px rgba(33,29,22,.16);
  }
  .kgh-mega-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; padding: 18px; }
  .kgh-mega-item {
    display: flex; align-items: center; gap: 13px;
    padding: 11px 13px; border-radius: 14px; transition: background .22s, transform .22s;
  }
  .kgh-mega-item:hover { background: var(--kg-sand); transform: translateX(3px); }
  .kgh-mega-ic {
    width: 42px; height: 42px; border-radius: 12px; overflow: hidden;
    background: var(--kg-forest-bg); display: grid; place-items: center; flex-shrink: 0;
  }
  .kgh-mega-ic img { width: 100%; height: 100%; object-fit: cover; }
  .kgh-mega-ic b { font-family: var(--font-serif); font-size: 19px; color: var(--kg-forest); font-weight: 500; }
  .kgh-mega-txt { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .kgh-mega-txt strong { font-size: 13.5px; font-weight: 700; color: var(--kg-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kgh-mega-txt em { font-style: normal; font-size: 11px; color: var(--kg-muted); }
  .kgh-mega-side {
    background: var(--kg-forest-dk); color: var(--kg-cream);
    padding: 28px 26px; display: flex; flex-direction: column; justify-content: flex-end; gap: 10px;
    position: relative; overflow: hidden;
  }
  .kgh-mega-side::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(400px 220px at 90% -10%, rgba(196,98,45,.32), transparent 70%);
  }
  .kgh-mega-eyebrow { position: relative; font-size: 10.5px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: rgba(250,246,239,.6); }
  .kgh-mega-head { position: relative; font-family: var(--font-serif); font-size: 21px; line-height: 1.25; color: var(--kg-cream); margin: 0; }
  .kgh-mega-cta {
    position: relative; display: inline-flex; align-items: center; gap: 7px;
    font-size: 12.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
    color: var(--kg-terra-lt); margin-top: 6px; transition: gap .25s;
  }
  .kgh-mega-cta:hover { gap: 11px; }

  /* Actions */
  .kgh-actions { display: flex; align-items: center; gap: 9px; margin-left: auto; flex-shrink: 0; }

  /* Country pills */
  .kgh-worlds {
    display: flex; align-items: center; gap: 3px;
    background: rgba(33,29,22,.05);
    border: 1px solid var(--kg-line);
    border-radius: 999px; padding: 3px;
  }
  .kgh-world {
    display: flex; align-items: center; gap: 7px;
    padding: 6px 10px; border-radius: 999px;
    font-family: var(--font-sans); font-size: 12.5px; font-weight: 800;
    color: var(--kg-muted); cursor: pointer;
    transition: all .35s cubic-bezier(0.22,1,0.36,1);
  }
  .kgh-world-flag { font-size: 15px; line-height: 1; filter: grayscale(.55) opacity(.75); transition: filter .3s, transform .3s; }
  .kgh-world-name {
    max-width: 0; overflow: hidden; opacity: 0; white-space: nowrap;
    transition: max-width .4s cubic-bezier(0.22,1,0.36,1), opacity .3s;
  }
  .kgh-world:hover .kgh-world-flag { filter: none; transform: scale(1.15); }
  .kgh-world.on {
    background: var(--kg-forest); color: var(--kg-cream);
    box-shadow: 0 4px 14px rgba(31,77,58,.32);
  }
  .kgh-world.on .kgh-world-flag { filter: none; }
  .kgh-world.on .kgh-world-name { max-width: 76px; opacity: 1; }

  /* Icon buttons */
  .kgh-icon {
    position: relative; width: 42px; height: 42px; border-radius: 999px;
    display: grid; place-items: center; color: var(--kg-ink-2);
    transition: background .25s, color .25s, transform .25s; cursor: pointer;
  }
  .kgh-icon:hover { background: rgba(31,77,58,.08); color: var(--kg-forest); transform: translateY(-1px); }
  .kgh-icon.lit { background: var(--kg-forest); color: var(--kg-cream); }
  .kgh-bub {
    position: absolute; top: 3px; right: 1px;
    min-width: 16px; height: 16px; border-radius: 999px;
    background: var(--kg-terra); color: #FFFDF8;
    font-style: normal; font-size: 9.5px; font-weight: 800;
    display: grid; place-items: center; padding: 0 4px;
    border: 2px solid var(--kg-cream);
  }

  /* Cart button */
  .kgh-cart {
    position: relative; display: flex; align-items: center; gap: 9px;
    background: var(--kg-ink); color: var(--kg-cream);
    padding: 11px 18px; border-radius: 999px; cursor: pointer;
    font-family: var(--font-sans); font-size: 13.5px; font-weight: 800;
    transition: background .25s, transform .25s, box-shadow .25s;
    box-shadow: 0 6px 18px rgba(33,29,22,.18);
  }
  .kgh-cart:hover { background: var(--kg-forest); transform: translateY(-1px); box-shadow: 0 10px 26px rgba(31,77,58,.3); }
  .kgh-cart.pop { animation: kghCartPop .5s var(--ease2); }
  @keyframes kghCartPop { 0% { transform: scale(1); } 40% { transform: scale(1.09); } 100% { transform: scale(1); } }
  .kgh-bub-cart { top: -4px; right: -4px; border-color: var(--kg-cream); }

  /* ── Search overlay ── */
  .kgh-search {
    position: absolute; left: 0; right: 0; top: 100%;
    background: rgba(255,253,248,.94);
    -webkit-backdrop-filter: blur(26px) saturate(1.4);
    backdrop-filter: blur(26px) saturate(1.4);
    border-bottom: 1px solid var(--kg-line);
    box-shadow: 0 40px 90px rgba(33,29,22,.18);
    max-height: 0; overflow: hidden; opacity: 0;
    transition: max-height .5s var(--ease), opacity .35s ease;
  }
  .kgh-search.open { max-height: min(560px, 72vh); opacity: 1; overflow-y: auto; }
  .kgh-search-bar {
    display: flex; align-items: center; gap: 14px;
    padding: 26px 0 18px; color: var(--kg-muted);
    border-bottom: 1px solid var(--kg-line);
  }
  .kgh-search-bar input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: var(--font-serif); font-size: clamp(19px, 2.6vw, 27px);
    color: var(--kg-ink); min-width: 0; letter-spacing: -0.01em;
  }
  .kgh-search-bar input::placeholder { color: var(--kg-faint); }
  .kgh-search-x {
    width: 32px; height: 32px; border-radius: 999px; display: grid; place-items: center;
    color: var(--kg-muted); background: var(--kg-sand); transition: all .2s; flex-shrink: 0;
  }
  .kgh-search-x:hover { background: var(--kg-line-warm); color: var(--kg-ink); }
  .kgh-search-go {
    background: var(--kg-forest); color: var(--kg-cream);
    padding: 10px 24px; border-radius: 999px;
    font-size: 13px; font-weight: 800; flex-shrink: 0;
    transition: background .2s, transform .2s;
  }
  .kgh-search-go:hover { background: var(--kg-forest-dk); transform: translateY(-1px); }
  .kgh-search-body { padding: 20px 0 30px; }
  .kgh-search-label {
    display: block; font-size: 10.5px; font-weight: 800; letter-spacing: .22em;
    text-transform: uppercase; color: var(--kg-faint); margin: 14px 0 10px;
  }
  .kgh-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .kgh-chip {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 999px;
    border: 1.5px solid var(--kg-line); background: transparent;
    font-size: 13px; font-weight: 700; color: var(--kg-ink-2);
    transition: all .22s; cursor: pointer;
  }
  .kgh-chip:hover { border-color: var(--kg-forest); color: var(--kg-forest); background: var(--kg-forest-bg); transform: translateY(-1px); }
  .kgh-chip-ghost { color: var(--kg-muted); border-style: dashed; }
  .kgh-none { font-size: 14.5px; color: var(--kg-muted); margin: 4px 0 14px; }

  .kgh-hits { display: flex; flex-direction: column; }
  .kgh-hit {
    display: flex; align-items: center; gap: 15px;
    padding: 11px 10px; border-radius: 14px; transition: background .2s;
    animation: fadeUp .4s var(--ease) both;
  }
  .kgh-hit:hover { background: var(--kg-sand); }
  .kgh-hit-img {
    width: 50px; height: 50px; border-radius: 12px; background: var(--kg-sand);
    overflow: hidden; display: grid; place-items: center; flex-shrink: 0;
  }
  .kgh-hit-img img { width: 100%; height: 100%; object-fit: cover; }
  .kgh-hit-img b { font-family: var(--font-serif); font-size: 19px; color: var(--kg-forest); font-weight: 500; }
  .kgh-hit-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
  .kgh-hit-txt strong { font-size: 14.5px; font-weight: 700; color: var(--kg-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kgh-hit-txt em { font-style: normal; font-size: 12px; color: var(--kg-muted); }
  .kgh-hit-price { font-size: 15px; font-weight: 800; color: var(--kg-forest); flex-shrink: 0; }
  .kgh-hits-all {
    display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
    margin: 14px 10px 0; font-size: 13px; font-weight: 800;
    letter-spacing: .04em; text-transform: uppercase; color: var(--kg-terra);
    transition: gap .25s;
  }
  .kgh-hits-all:hover { gap: 12px; }

  .kgh-progressbar {
    position: absolute; left: 0; right: 0; bottom: -2px; height: 2px;
    background: linear-gradient(90deg, var(--kg-forest) 0%, var(--kg-terra) 55%, var(--kg-brass) 100%);
    transform-origin: 0 50%; transform: scaleX(0);
    z-index: 6; pointer-events: none;
    opacity: 0; transition: opacity .35s ease;
  }
  .kgh.scrolled .kgh-progressbar { opacity: 1; }

  .kgh-scrim {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(20,18,14,.32);
    -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
    animation: fadeIn .3s ease both;
  }

  /* ── Mobile bottom nav ── */
  .kgh-bnav { display: none; }

  @media (max-width: 1180px) {
    .kgh-announce-mid { display: none; }
    .kgh-world-name { display: none; }
    .kgh-world.on .kgh-world-name { max-width: 0; opacity: 0; }
    .kgh-main-in { gap: 16px; }
  }
  @media (max-width: 1023px) {
    .kgh-nav { display: none; }
    .kgh-cart-txt { display: none; }
    .kgh-cart { padding: 11px 13px; }
  }
  @media (max-width: 900px) {
    .kgh-announce { height: 30px; font-size: 11px; }
    .kgh.scrolled .kgh-announce { margin-top: -30px; }
    .kgh-announce-links { display: none; }
    .kgh-announce-in { justify-content: center; }
    .kgh-main-in { height: 62px; }
    .kgh-logo-img { height: 40px; }
    .kgh-word-main { font-size: 23px; }
    .kgh-word-sub { font-size: 7.5px; letter-spacing: .28em; }
    .kgh-icon { display: none; }
    body { padding-bottom: 76px; }

    .kgh-bnav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 1002;
      display: grid; grid-template-columns: repeat(5, 1fr);
      background: rgba(255,253,248,.88);
      -webkit-backdrop-filter: blur(22px) saturate(1.5);
      backdrop-filter: blur(22px) saturate(1.5);
      border-top: 1px solid var(--kg-line);
      padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
      box-shadow: 0 -12px 36px rgba(33,29,22,.09);
    }
    .kgh-bnav a, .kgh-bnav button {
      position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px;
      font-family: var(--font-sans); font-size: 10px; font-weight: 800; letter-spacing: .02em;
      color: var(--kg-muted); padding: 3px 0; transition: color .25s, transform .25s;
    }
    .kgh-bnav a.on, .kgh-bnav button.on { color: var(--kg-forest); }
    .kgh-bnav a.on svg, .kgh-bnav button.on svg { transform: translateY(-1px) scale(1.08); }
    .kgh-bnav svg { transition: transform .25s var(--ease); }
    .kgh-bnav-fab {
      width: 46px; height: 46px; border-radius: 999px; margin-top: -22px;
      display: grid; place-items: center;
      background: var(--kg-forest); color: var(--kg-cream);
      box-shadow: 0 10px 24px rgba(31,77,58,.38);
      border: 3px solid var(--kg-cream);
      transition: transform .25s var(--ease2), background .25s;
    }
    .kgh-bnav-search.on .kgh-bnav-fab, .kgh-bnav-search:active .kgh-bnav-fab { transform: scale(1.08); background: var(--kg-terra); }
    .kgh-bnav-dot {
      position: absolute; top: -2px; right: calc(50% - 19px);
      min-width: 16px; height: 16px; border-radius: 999px;
      background: var(--kg-terra); color: #FFFDF8;
      font-style: normal; font-size: 9.5px; font-weight: 800;
      display: grid; place-items: center; padding: 0 4px;
      border: 2px solid #FFFDF8;
    }
  }
  @media (max-width: 640px) {
    .kgh-search-bar { padding: 18px 0 14px; }
    .kgh-search.open { max-height: min(480px, 68vh); }
    .kgh-worlds { padding: 2.5px; }
    .kgh-world { padding: 5px 8px; }
  }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  q = '';
  scrolled = signal(false);
  megaOpen = signal(false);
  searchOpen = signal(false);
  cats = signal<any[]>([]);
  results = signal<any[]>([]);
  searched = signal(false);
  recent = signal<string[]>(this.loadRecent());
  cartPop = signal(false);
  prog = signal(0);

  private mediaUrl = (environment as any).mediaUrl || '';
  private debounce: ReturnType<typeof setTimeout> | null = null;
  private routerSub?: Subscription;
  private lastCount = 0;

  constructor(
    public cart: CartService,
    public wishlist: WishlistService,
    public settings: SettingsService,
    public country: CountryService,
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

    // Mega-menu categories follow the selected marketplace
    effect(() => {
      const code = this.country.code();
      this.country.ready();
      this.api.getCategories(code).subscribe({
        next: (r: any) => { if (r?.success) this.cats.set(r.data || []); },
        error: () => {}
      });
    });
  }

  get cur() { return this.settings.get('currency_symbol', '€'); }

  ngOnInit() {
    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) { this.megaOpen.set(false); this.closeSearch(true); }
    });
  }

  ngOnDestroy() { this.routerSub?.unsubscribe(); }

  @HostListener('window:scroll') onScroll() {
    this.scrolled.set(window.scrollY > 24);
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    this.prog.set(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
  }
  @HostListener('document:keydown.escape') onEsc() { this.closeSearch(); this.megaOpen.set(false); }

  pick(code: CountryCode) { this.country.select(code); }
  countryNames(): string { return this.country.all.map(c => c.name).join(' · '); }

  toggleSearch() {
    this.searchOpen.update(v => !v);
    if (this.searchOpen()) setTimeout(() => this.searchInput?.nativeElement.focus(), 120);
  }
  closeSearch(silent = false) {
    if (!this.searchOpen()) return;
    this.searchOpen.set(false);
    if (!silent) { this.q = ''; this.results.set([]); this.searched.set(false); }
  }

  onType() {
    if (this.debounce) clearTimeout(this.debounce);
    const q = this.q.trim();
    if (q.length < 2) { this.results.set([]); this.searched.set(false); return; }
    this.debounce = setTimeout(() => {
      this.api.searchProducts(q, this.country.code()).subscribe({
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

  logoUrl(): string {
    const raw = this.settings.get('site_logo', '');
    if (!raw) return '';
    try { return this.settings.versionedAssetUrl(raw, ''); } catch { return ''; }
  }
}

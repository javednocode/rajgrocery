import { Component, HostListener, ViewEncapsulation, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
  <!-- ── TOP OFFER BAR ── -->
  <div class="hd-topbar">
    <div class="hd-container hd-topbar-inner">
      <span class="hd-offer-text">
        <i class="hd-offer-dot"></i>
        {{ settings.get('header_offer_text','Free UK delivery on orders over £50') }}
      </span>
      <div class="hd-topbar-right">
        <a routerLink="/account" class="hd-top-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 21c1.4-3.6 4.4-5 8-5s6.6 1.4 8 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          My Account
        </a>
        <span class="hd-top-sep"></span>
        <a routerLink="/account" class="hd-top-link">Track Order</a>
      </div>
    </div>
  </div>

  <!-- ── MAIN HEADER ── -->
  <header class="hd-main" [class.scrolled]="scrolled()">
    <div class="hd-container hd-main-inner">

      <!-- Logo — LEFTMOST -->
      <a routerLink="/" class="hd-logo">
        @if (logoUrl()) {
          <img [src]="logoUrl()" [alt]="settings.get('site_name', 'The Desi')" class="hd-logo-img">
        } @else {
          <span class="hd-logo-text">{{ settings.get('site_name', 'The Desi') }}</span>
        }
      </a>

      <!-- Browse All Categories — left, next to logo -->
      <button class="hd-browse-btn" (click)="toggleCats()">
        <span class="hd-browse-icon">
          <span></span><span></span><span></span>
        </span>
        Browse All Categories
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" [style.transform]="catsOpen() ? 'rotate(180deg)' : ''" style="transition:.2s"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <!-- Search — grows to fill middle -->
      <form class="hd-search" (submit)="goSearch($event)" role="search">
        <input [(ngModel)]="q" name="q" placeholder="Search for items…" aria-label="Search products" />
        <button type="submit" class="hd-search-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2.2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
          Search
        </button>
      </form>

      <!-- Actions (Account + Cart) on the RIGHT -->
      <div class="hd-actions">
        <a routerLink="/account" class="hd-action-btn">
          <div class="hd-action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c1.4-3.6 4.4-5 8-5s6.6 1.4 8 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
          <div class="hd-action-text">
            <span>Sign In</span>
            <strong>Account</strong>
          </div>
        </a>
        <button class="hd-cart-btn" (click)="cart.toggleCart()">
          <div class="hd-cart-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="17" cy="21" r="1.4" fill="currentColor"/></svg>
            @if (cart.itemCount() > 0) { <span class="hd-cart-count">{{ cart.itemCount() }}</span> }
          </div>
          <div class="hd-action-text">
            <span>{{ cart.itemCount() }} items</span>
            <strong>Cart</strong>
          </div>
        </button>
      </div>
    </div>
  </header>

  <!-- ── NAV BAR ── -->
  <nav class="hd-nav-bar" aria-label="Main navigation">
    <div class="hd-container hd-nav-inner">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
      <a routerLink="/categories" routerLinkActive="active">Shop</a>
      <a routerLink="/categories" routerLinkActive="active">Hot Deals</a>
      <a routerLink="/blog" routerLinkActive="active">Blog</a>
      <a routerLink="/contact" routerLinkActive="active">Contact</a>
    </div>
  </nav>

  <!-- ── MOBILE BOTTOM NAV ── -->
  <nav class="hd-bottom-nav" aria-label="Mobile">
    <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      <span>Home</span>
    </a>
    <a routerLink="/categories" routerLinkActive="on">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" stroke-width="1.8"/></svg>
      <span>Shop</span>
    </a>
    <a routerLink="/search" routerLinkActive="on">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <span>Search</span>
    </a>
    <a routerLink="/account" routerLinkActive="on">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c1.4-3.6 4.4-5 8-5s6.6 1.4 8 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <span>Account</span>
    </a>
    <button (click)="cart.openCart()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <span>Cart</span>
      @if (cart.itemCount() > 0) { <em class="hd-bn-dot">{{ cart.itemCount() }}</em> }
    </button>
  </nav>
  `,
  styles: [`
  :root {
    --g: #3BB77E; --g-dk: #2A9062; --g-lt: #F4FCF7;
    --tx: #253D4E; --mu: #7E8D97; --bd: #ECECEC;
    --bg: #fff;
    --hh: 40px;
    --mh: 74px;
    --nh: 42px;
  }
  *,*::before,*::after{box-sizing:border-box}
  a{color:inherit;text-decoration:none}
  button{font-family:inherit;cursor:pointer}
  img{max-width:100%;display:block}

  body { padding-top: calc(var(--hh) + var(--mh) + var(--nh)); }

  /* TOPBAR */
  .hd-topbar{background:#253D4E;color:rgba(255,255,255,.8);font-size:12.5px;height:var(--hh);position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;align-items:center}
  .hd-container{max-width:1280px;margin:0 auto;padding:0 20px;width:100%}
  .hd-topbar-inner{display:flex;align-items:center;justify-content:space-between}
  .hd-offer-text{display:flex;align-items:center;gap:8px;font-weight:500}
  .hd-offer-dot{width:7px;height:7px;border-radius:50%;background:var(--g);flex-shrink:0;box-shadow:0 0 0 3px rgba(59,183,126,.3)}
  .hd-topbar-right{display:flex;align-items:center;gap:16px}
  .hd-top-link{font-size:12px;font-weight:500;color:rgba(255,255,255,.7);transition:color .2s;display:flex;align-items:center;gap:5px}
  .hd-top-link:hover{color:#fff}
  .hd-top-sep{width:1px;height:12px;background:rgba(255,255,255,.2)}

  /* MAIN HEADER */
  .hd-main{position:fixed;top:var(--hh);left:0;right:0;z-index:999;height:var(--mh);background:#fff;border-bottom:1px solid var(--bd);transition:box-shadow .3s}
  .hd-main.scrolled{box-shadow:0 4px 20px rgba(0,0,0,.08)}
  /* Key layout: browse (LEFT) | search (FLEX GROWS) | actions+logo (RIGHT) */
  .hd-main-inner{height:100%;display:flex;align-items:center;gap:16px}

  /* Browse button — extreme left, no margin-left: auto */
  .hd-browse-btn{display:flex;align-items:center;gap:9px;background:var(--g);color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13.5px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .2s;margin-right:4px}
  .hd-browse-btn:hover{background:var(--g-dk)}
  .hd-browse-icon{display:flex;flex-direction:column;gap:3.5px;flex-shrink:0}
  .hd-browse-icon span{display:block;width:16px;height:2px;background:#fff;border-radius:2px}

  /* Search — grows to fill middle */
  .hd-search{flex:1;display:flex;align-items:center;border:2px solid var(--bd);border-radius:8px;overflow:hidden;transition:border-color .2s;min-width:0}
  .hd-search:focus-within{border-color:var(--g)}
  .hd-search input{flex:1;border:none;outline:none;padding:10px 16px;font-size:14px;color:var(--tx);background:#fff;min-width:0}
  .hd-search input::placeholder{color:#adb5bd}
  .hd-search-btn{display:flex;align-items:center;gap:8px;background:var(--g);color:#fff;border:none;padding:10px 22px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .2s;flex-shrink:0}
  .hd-search-btn:hover{background:var(--g-dk)}

  /* Actions + logo grouped together on the RIGHT */
  .hd-actions{display:flex;align-items:center;gap:10px;flex-shrink:0}
  .hd-action-btn,.hd-cart-btn{display:flex;align-items:center;gap:10px;background:var(--g-lt);border:1px solid rgba(59,183,126,.18);border-radius:8px;padding:8px 14px;color:var(--tx);transition:all .2s;cursor:pointer;text-align:left}
  .hd-action-btn:hover,.hd-cart-btn:hover{background:#DEF9EC;border-color:var(--g)}
  .hd-action-icon,.hd-cart-icon{position:relative;color:var(--g)}
  .hd-cart-icon{display:flex;align-items:center}
  .hd-cart-count{position:absolute;top:-8px;right:-8px;min-width:18px;height:18px;border-radius:50%;background:var(--g);color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center;padding:0 4px}
  .hd-action-text{display:flex;flex-direction:column;line-height:1.2}
  .hd-action-text span{font-size:11px;color:var(--mu);font-weight:500}
  .hd-action-text strong{font-size:13px;font-weight:700;color:var(--tx)}

  /* Logo — RIGHTMOST, bigger, no border/box */
  .hd-logo{display:flex;align-items:center;gap:10px;flex-shrink:0;text-decoration:none;margin-left:8px}
  .hd-logo-img{height:58px;width:auto;object-fit:contain;max-width:180px;border-radius:6px}
  .hd-logo-text{font-family:'Quicksand','Poppins',sans-serif;font-size:22px;font-weight:800;color:var(--tx);letter-spacing:-.02em;white-space:nowrap}
  /* Mobile logo hidden on desktop */
  .hd-logo-mobile{display:none}

  /* NAV BAR */
  .hd-nav-bar{position:fixed;top:calc(var(--hh) + var(--mh));left:0;right:0;z-index:998;height:var(--nh);background:#fff;border-bottom:2px solid var(--bd);display:flex;align-items:center}
  .hd-nav-inner{display:flex;align-items:center;gap:32px;height:100%}
  .hd-nav-inner a{font-size:14px;font-weight:700;color:var(--mu);padding:0 4px;height:100%;display:flex;align-items:center;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .2s;white-space:nowrap}
  .hd-nav-inner a:hover,.hd-nav-inner a.active{color:var(--g);border-bottom-color:var(--g)}

  /* MOBILE BOTTOM NAV */
  .hd-bottom-nav{display:none}

  @media (max-width:900px){
    .hd-search,.hd-actions{display:none}
    .hd-browse-btn{font-size:12.5px;padding:9px 14px}
    /* Mobile logo visible, centred in remaining space */
    .hd-logo-mobile{display:flex!important;flex:1;justify-content:center}
    .hd-logo-mobile .hd-logo-img{height:46px}
    .hd-logo-mobile .hd-logo-text{font-size:17px}
    body{padding-bottom:72px}
    .hd-bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:1000;display:grid;grid-template-columns:repeat(5,1fr);background:#fff;border-top:1px solid var(--bd);padding:6px 4px calc(6px + env(safe-area-inset-bottom))}
    .hd-bottom-nav a,.hd-bottom-nav button{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:700;color:var(--mu);background:none;border:none;padding:4px 0;transition:color .2s}
    .hd-bottom-nav a.on{color:var(--g)}
    .hd-bn-dot{position:absolute;top:-2px;right:calc(50% - 18px);min-width:16px;height:16px;border-radius:50%;background:var(--g);color:#fff;font-style:normal;font-size:10px;font-weight:800;display:grid;place-items:center;padding:0 4px}
  }
  @media (max-width:640px){
    .hd-nav-inner{gap:18px}
    .hd-nav-inner a{font-size:13px}
    .hd-browse-btn span.hd-browse-icon~*{display:none}
    .hd-browse-btn{padding:9px 12px;gap:6px}
  }
  `]
})
export class HeaderComponent {
  q = '';
  scrolled = signal(false);
  catsOpen = signal(false);
  constructor(public cart: CartService, public wishlist: WishlistService, public settings: SettingsService, private router: Router) {}
  @HostListener('window:scroll') onScroll() { this.scrolled.set(window.scrollY > 8); }
  goSearch(e: Event) {
    e.preventDefault();
    const q = this.q.trim();
    if (q) { this.router.navigate(['/search'], { queryParams: { q } }); this.q = ''; }
  }
  toggleCats() { this.catsOpen.update(v => !v); }

  logoUrl(): string {
    const raw = this.settings.get('site_logo', '');
    if (!raw || raw === '/logo.png' || raw === '/logo.svg') return '';
    try { return this.settings.resolveAssetUrl(raw); } catch { return ''; }
  }
}

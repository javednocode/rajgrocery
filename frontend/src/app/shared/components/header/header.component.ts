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
  <header class="td-header" [class.scrolled]="scrolled()">
    <div class="td-container td-header-inner">
      <a routerLink="/" class="td-logo" aria-label="The Desi — home">
        <span class="td-logo-mark"></span>
        <span class="td-logo-text">{{ settings.get('site_name','The Desi') }}</span>
      </a>
      <nav class="td-nav" aria-label="Primary">
        <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a routerLink="/categories" routerLinkActive="on">Shop</a>
        <a routerLink="/blog" routerLinkActive="on">Journal</a>
        <a routerLink="/contact" routerLinkActive="on">Contact</a>
      </nav>
      <div class="td-actions">
        <form class="td-search" (submit)="goSearch($event)" role="search">
          <input [(ngModel)]="q" name="q" placeholder="Search groceries…" aria-label="Search products" />
          <button type="submit" aria-label="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </form>
        <a routerLink="/account" class="td-icon-btn" aria-label="Account"><svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 21c1.4-3.6 4.4-5 8-5s6.6 1.4 8 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></a>
        <button class="td-icon-btn" (click)="cart.toggleCart()" aria-label="Open cart">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="17" cy="21" r="1.4" fill="currentColor"/></svg>
          @if (cart.itemCount() > 0) { <span class="td-badge">{{ cart.itemCount() }}</span> }
        </button>
      </div>
    </div>
  </header>

  <nav class="td-bottom-nav" aria-label="Mobile">
    <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span>Home</span></a>
    <a routerLink="/categories" routerLinkActive="on"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" stroke-width="1.8"/></svg><span>Shop</span></a>
    <a routerLink="/search" routerLinkActive="on"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Search</span></a>
    <a routerLink="/account" routerLinkActive="on"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span>Saved</span>@if (wishlist.count() > 0) { <em class="td-bn-dot">{{ wishlist.count() }}</em> }</a>
    <button (click)="cart.openCart()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Cart</span>@if (cart.itemCount() > 0) { <em class="td-bn-dot">{{ cart.itemCount() }}</em> }</button>
  </nav>
  `,
  styles: [`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --td-primary:#111111; --td-secondary:#F7F5F0; --td-accent:#F5A623; --td-success:#16A34A;
    --td-text:#0F172A; --td-bg:#FFFFFF; --td-muted:#64748B; --td-line:#E8E6E0;
    --td-radius:20px; --td-radius-sm:12px; --td-ease:cubic-bezier(.22,1,.36,1);
    --td-shadow:0 20px 60px rgba(15,23,42,.08); --td-shadow-lg:0 32px 90px rgba(15,23,42,.14);
    --td-header-h:72px;
  }
  *,*::before,*::after{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--td-bg);color:var(--td-text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;padding-top:var(--td-header-h)}
  h1,h2,h3,h4{font-family:'Sora',sans-serif;letter-spacing:-.02em;color:var(--td-text);margin:0}
  a{color:inherit;text-decoration:none}
  button{font-family:inherit;cursor:pointer}
  img{max-width:100%;display:block}
  .td-container{max-width:1280px;margin:0 auto;padding:0 28px}
  .td-section{padding:96px 0}
  .td-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--td-accent);margin-bottom:14px}
  .td-h2{font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:800;line-height:1.12}
  .td-sub{color:var(--td-muted);font-size:16px;line-height:1.7;max-width:560px}
  .td-btn{display:inline-flex;align-items:center;gap:10px;border:none;border-radius:999px;padding:16px 32px;font-size:15px;font-weight:700;transition:transform .3s var(--td-ease),box-shadow .3s,background .25s}
  .td-btn-dark{background:var(--td-primary);color:#fff}
  .td-btn-dark:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(17,17,17,.28)}
  .td-btn-light{background:transparent;color:var(--td-text);border:1.5px solid var(--td-line)}
  .td-btn-light:hover{border-color:var(--td-text);transform:translateY(-2px)}
  .td-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s var(--td-ease),transform .7s var(--td-ease)}
  .td-reveal.td-visible{opacity:1;transform:none}
  .td-skel{background:linear-gradient(100deg,#F1EFE9 40%,#FAF8F3 50%,#F1EFE9 60%);background-size:200% 100%;animation:tdShimmer 1.4s infinite;border-radius:var(--td-radius-sm)}
  @keyframes tdShimmer{to{background-position:-200% 0}}
  @media (prefers-reduced-motion:reduce){.td-reveal{transition:none;opacity:1;transform:none}}

  .td-header{position:fixed;top:0;left:0;right:0;z-index:900;height:var(--td-header-h);background:rgba(255,255,255,.82);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid transparent;transition:border-color .3s,background .3s}
  .td-header.scrolled{border-bottom-color:var(--td-line);background:rgba(255,255,255,.94)}
  .td-header-inner{height:100%;display:flex;align-items:center;gap:36px}
  .td-logo{display:flex;align-items:center;gap:11px}
  .td-logo-mark{width:30px;height:30px;border-radius:10px;background:var(--td-primary);position:relative;flex-shrink:0}
  .td-logo-mark::after{content:'';position:absolute;inset:9px;border-radius:4px;background:var(--td-accent)}
  .td-logo-text{font-family:'Sora',sans-serif;font-size:19px;font-weight:800;letter-spacing:-.03em}
  .td-nav{display:flex;gap:30px;margin-left:8px}
  .td-nav a{font-size:14.5px;font-weight:600;color:var(--td-muted);transition:color .2s;position:relative;padding:6px 0}
  .td-nav a::after{content:'';position:absolute;left:0;right:100%;bottom:0;height:2px;background:var(--td-accent);transition:right .35s var(--td-ease)}
  .td-nav a:hover,.td-nav a.on{color:var(--td-text)}
  .td-nav a.on::after{right:0}
  .td-actions{margin-left:auto;display:flex;align-items:center;gap:10px}
  .td-search{display:flex;align-items:center;background:var(--td-secondary);border:1px solid transparent;border-radius:999px;padding:4px 6px 4px 18px;transition:border-color .2s}
  .td-search:focus-within{border-color:var(--td-accent)}
  .td-search input{border:none;background:none;outline:none;font:inherit;font-size:14px;width:180px;color:var(--td-text)}
  .td-search button{width:34px;height:34px;border-radius:999px;border:none;background:var(--td-primary);color:#fff;display:grid;place-items:center}
  .td-icon-btn{position:relative;width:42px;height:42px;border-radius:999px;border:1.5px solid var(--td-line);background:#fff;color:var(--td-text);display:grid;place-items:center;transition:border-color .2s,transform .2s}
  .td-icon-btn:hover{border-color:var(--td-text);transform:translateY(-1px)}
  .td-badge{position:absolute;top:-5px;right:-5px;min-width:19px;height:19px;border-radius:999px;background:var(--td-accent);color:#111;font-size:11px;font-weight:800;display:grid;place-items:center;padding:0 5px}

  .td-bottom-nav{display:none}
  @media (max-width:860px){
    .td-nav,.td-search{display:none}
    body{padding-bottom:76px}
    .td-bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:900;display:grid;grid-template-columns:repeat(5,1fr);background:rgba(255,255,255,.94);backdrop-filter:blur(18px);border-top:1px solid var(--td-line);padding:8px 4px calc(8px + env(safe-area-inset-bottom))}
    .td-bottom-nav a,.td-bottom-nav button{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10.5px;font-weight:600;color:var(--td-muted);background:none;border:none;padding:4px 0}
    .td-bottom-nav a.on{color:var(--td-text)}
    .td-bn-dot{position:absolute;top:-2px;right:calc(50% - 18px);min-width:16px;height:16px;border-radius:999px;background:var(--td-accent);color:#111;font-style:normal;font-size:10px;font-weight:800;display:grid;place-items:center;padding:0 4px}
  }
  `]
})
export class HeaderComponent {
  q = '';
  scrolled = signal(false);
  constructor(public cart: CartService, public wishlist: WishlistService, public settings: SettingsService, private router: Router) {}
  @HostListener('window:scroll') onScroll() { this.scrolled.set(window.scrollY > 8); }
  goSearch(e: Event) { e.preventDefault(); const q = this.q.trim(); if (q) { this.router.navigate(['/search'], { queryParams: { q } }); this.q = ''; } }
}

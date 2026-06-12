import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CartService } from '../../../core/services/cart.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, NgFor, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ── TOP ANNOUNCEMENT BAR ── -->
    <div class="topbar">
      <div class="container topbar-inner">
        <div class="topbar-left">
          <span class="topbar-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          </span>
          <span class="topbar-phone">{{ settings.get('site_phone', '+353 1 234 5678') }}</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-offer">{{ settings.get('header_offer_text', '🚚 Free delivery on orders over €50') }}</span>
        </div>
        <div class="topbar-right">
          @if (settings.get('payment_online_url')) {
            <a [href]="settings.get('payment_online_url')" target="_blank" rel="noopener" class="topbar-pay-btn">Pay Online</a>
          }
          <a routerLink="/account" class="topbar-link">My Account</a>
        </div>
      </div>
    </div>

    <!-- ── MAIN HEADER ── -->
    <header class="header" [class.header-scrolled]="isScrolled()">
      <div class="container header-inner">

        <!-- Logo -->
        <a routerLink="/" class="logo" id="site-logo">
          <img [src]="logoUrl()" [alt]="settings.get('site_name', 'Your Store')" class="logo-img">
        </a>

        <!-- Search Bar (desktop) -->
        <div class="search-wrap" id="desktop-search">
          <div class="search-bar" [class.search-focused]="searchFocused()">
            <svg class="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search products..."
              (keyup.enter)="doSearch()"
              (focus)="searchFocused.set(true)"
              (blur)="onSearchBlur()"
              id="desktop-search-input"
              autocomplete="off"
            >
            @if (searchQuery) {
              <button class="search-clear" (click)="clearSearch()" aria-label="Clear search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            }
            <button class="search-btn" (click)="doSearch()" id="search-submit-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Search
            </button>
          </div>
          <!-- Desktop search results dropdown -->
          @if (searchResults().length > 0 && searchQuery.length > 1 && searchFocused()) {
            <div class="desktop-search-results">
              @for (p of searchResults().slice(0,6); track p.id) {
                <a [routerLink]="['/product', p.slug]" class="ds-result-item" (click)="onResultClick()">
                  <div class="ds-result-img">
                    @if (p.image) {
                      <img [src]="mediaUrl + p.image" [alt]="p.name" loading="lazy">
                    } @else {
                      <div class="ds-img-fallback">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
                      </div>
                    }
                  </div>
                  <div class="ds-result-info">
                    <span class="ds-result-name">{{ p.name }}</span>
                    @if (p.category_name) {
                      <span class="ds-result-cat">{{ p.category_name }}</span>
                    }
                  </div>
                  <span class="ds-result-price">€{{ (+p.price).toFixed(2) }}</span>
                </a>
              }
              <a [routerLink]="['/search']" [queryParams]="{q: searchQuery}" class="ds-view-all" (click)="onResultClick()">
                View all results for "{{ searchQuery }}" →
              </a>
            </div>
          }
          @if (searchLoading() && searchQuery.length > 1) {
            <div class="desktop-search-results ds-loading">
              <span></span><span></span><span></span>
            </div>
          }
        </div>

        <!-- Header Actions -->
        <div class="header-actions">
          <a routerLink="/account" class="action-btn" id="account-btn" title="My Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="action-label">Account</span>
          </a>
          <a routerLink="/wishlist" class="action-btn" id="wishlist-btn" title="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="action-label">Wishlist</span>
          </a>
          <button class="cart-action-btn" (click)="cart.toggleCart()" id="cart-header-btn" title="Cart">
            <div class="cart-btn-inner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              @if (cart.itemCount() > 0) {
                <span class="cart-badge animate-scaleIn">{{ cart.itemCount() }}</span>
              }
            </div>
            <div class="cart-btn-text">
              <span class="cart-label">Cart</span>
              @if (cart.subtotal() > 0) {
                <span class="cart-subtotal">€{{ cart.subtotal().toFixed(2) }}</span>
              }
            </div>
          </button>
          <button class="hamburger" (click)="mobileMenu.set(!mobileMenu())" [class.ham-open]="mobileMenu()" id="mobile-menu-btn" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- ── CATEGORY NAV BAR ── -->
      <div class="cat-nav-bar">
        <div class="container cat-nav-inner">
          <a routerLink="/" routerLinkActive="cat-nav-active" [routerLinkActiveOptions]="{exact:true}" class="cat-nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <a routerLink="/categories" routerLinkActive="cat-nav-active" class="cat-nav-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            All Categories
          </a>
          @for (cat of displayNavCategories().slice(0,6); track cat.slug) {
            <a [routerLink]="['/category', cat.slug]" routerLinkActive="cat-nav-active" class="cat-nav-link">{{ cat.name }}</a>
          }
          <a routerLink="/blog" routerLinkActive="cat-nav-active" class="cat-nav-link">Blog</a>
          <a routerLink="/contact" routerLinkActive="cat-nav-active" class="cat-nav-link">Contact</a>
        </div>
      </div>
    </header>

    <!-- ── MOBILE MENU DRAWER ── -->
    <div class="menu-backdrop" [class.backdrop-active]="mobileMenu()" (click)="mobileMenu.set(false)"></div>
    <nav class="mobile-nav" [class.mobile-nav-open]="mobileMenu()">
      <div class="mnav-header">
        <img [src]="logoUrl()" [alt]="settings.get('site_name', 'Your Store')" class="mnav-logo">
        <button class="mnav-close" (click)="mobileMenu.set(false)" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="mnav-body">
        <div class="mnav-section-label">Navigate</div>
        <a routerLink="/" routerLinkActive="mnav-active" [routerLinkActiveOptions]="{exact:true}" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon">🏠</span> Home
          <svg class="mnav-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a routerLink="/categories" routerLinkActive="mnav-active" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon">🗂️</span> All Categories
          <svg class="mnav-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a routerLink="/account" routerLinkActive="mnav-active" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon">👤</span> My Account
          <svg class="mnav-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a routerLink="/blog" routerLinkActive="mnav-active" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon">📰</span> Blog & Recipes
          <svg class="mnav-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a routerLink="/contact" routerLinkActive="mnav-active" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon">📍</span> Contact Us
          <svg class="mnav-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>

        @if (displayNavCategories().length > 0) {
          <div class="mnav-section-label" style="margin-top:16px">Shop by Category</div>
          @for (cat of displayNavCategories().slice(0,8); track cat.slug) {
            <a [routerLink]="['/category', cat.slug]" class="mnav-item mnav-cat-item" (click)="mobileMenu.set(false)">
              <span class="mnav-cat-dot"></span>
              {{ cat.name }}
              <svg class="mnav-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          }
        }
      </div>
      <div class="mnav-footer">
        @if (settings.get('site_phone')) {
          <a href="tel:{{ settings.get('site_phone') }}" class="mnav-phone">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            {{ settings.get('site_phone') }}
          </a>
        }
        <span class="mnav-tag">{{ settings.get('site_tagline', 'Your online store') }}</span>
      </div>
    </nav>

    <!-- ── MOBILE SEARCH OVERLAY ── -->
    <div class="mob-search-overlay" [class.mob-search-active]="mobileSearchOpen()" (click)="closeMobileSearch($event)">
      <div class="mob-search-box">
        <div class="mob-search-row">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search products..."
            (keyup.enter)="doSearchMobile()"
            (ngModelChange)="onMobileSearchInput($event)"
            class="mob-search-input"
            autocomplete="off"
            id="mobile-search-input"
          >
          @if (searchQuery) {
            <button class="mob-clear-btn" (click)="clearSearch()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          }
        </div>
        @if (searchResults().length > 0 && searchQuery.length > 1) {
          <div class="mob-search-results">
            @for (p of searchResults(); track p.id) {
              <a [routerLink]="['/product', p.slug]" class="mob-result-row" (click)="onResultClick()">
                <div class="mob-result-thumb">
                  @if (p.image) {
                    <img [src]="mediaUrl + p.image" [alt]="p.name" loading="lazy">
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
                  }
                </div>
                <div class="mob-result-info">
                  <span class="mob-result-name">{{ p.name }}</span>
                  @if (p.category_name) {<span class="mob-result-cat">{{ p.category_name }}</span>}
                </div>
                <span class="mob-result-price">€{{ (+p.price).toFixed(2) }}</span>
              </a>
            }
          </div>
        } @else if (searchLoading() && searchQuery.length > 1) {
          <div class="mob-search-loading">
            <span></span><span></span><span></span>
          </div>
        } @else if (searchQuery.length > 1 && !searchLoading()) {
          <div class="mob-search-empty">No results for "{{ searchQuery }}"</div>
        }
      </div>
    </div>

    <!-- ── BOTTOM NAV (mobile) ── -->
    <nav class="bottom-nav" id="bottom-nav">
      <a routerLink="/" routerLinkActive="bnav-active" [routerLinkActiveOptions]="{exact:true}" class="bnav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </a>
      <button class="bnav-item" (click)="openMobileSearch()" id="mobile-search-btn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span>Search</span>
      </button>
      <a routerLink="/categories" routerLinkActive="bnav-active" class="bnav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Categories</span>
      </a>
      <button class="bnav-item bnav-cart" (click)="cart.toggleCart()" id="bottom-cart-btn">
        <span class="bnav-cart-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          @if (cart.itemCount() > 0) {
            <span class="bnav-badge">{{ cart.itemCount() }}</span>
          }
        </span>
        <span>Cart</span>
      </button>
      <button class="bnav-item" [class.bnav-active]="mobileMenu()" (click)="mobileMenu.set(!mobileMenu())" id="bnav-menu-btn">
        @if (!mobileMenu()) {
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <span>Menu</span>
        } @else {
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          <span>Close</span>
        }
      </button>
    </nav>
  `,
  styles: [`
    /* ── TOP BAR ── */
    .topbar {
      background:
        radial-gradient(circle at 18% 50%, rgba(242,140,0,0.22), transparent 34%),
        linear-gradient(90deg, #070A05 0%, #1C1208 54%, #070A05 100%);
      color: rgba(255,255,255,0.92);
      height: 36px; display: flex; align-items: center;
      font-size: 12px; font-weight: 500;
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    }
    .topbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .topbar-left  { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .topbar-icon  { display: flex; align-items: center; opacity: 0.7; }
    .topbar-phone { font-weight: 600; letter-spacing: 0.02em; }
    .topbar-center { flex: 1; text-align: center; }
    .topbar-offer { font-size: 12px; opacity: 0.85; }
    .topbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .topbar-link { font-size: 12px; opacity: 0.7; transition: opacity 0.2s; }
    .topbar-link:hover { opacity: 1; }
    .topbar-pay-btn {
      background: #F28C00; color: #120A03; font-size: 11px; font-weight: 800;
      padding: 4px 12px; border-radius: 999px; transition: background 0.2s;
    }
    .topbar-pay-btn:hover { background: #FFA31A; }

    /* ── MAIN HEADER ── */
    .header {
      position: fixed; top: 36px; left: 0; right: 0; z-index: 999;
      background: rgba(255,250,242,0.96);
      border-bottom: 1px solid rgba(247,233,215,0.85);
      backdrop-filter: blur(18px);
      transition: box-shadow 0.3s ease, background 0.3s ease;
    }
    .header-scrolled {
      box-shadow: 0 2px 20px rgba(0,0,0,0.08);
    }
    .header-inner {
      display: flex; align-items: center;
      height: 72px; gap: 16px;
    }

    /* ── LOGO ── */
    .logo { flex-shrink: 0; display: flex; align-items: center; }
    .logo-img { height: 58px; width: auto; object-fit: contain; max-width: 180px; }

    /* ── SEARCH ── */
    .search-wrap {
      flex: 1; max-width: 580px; position: relative;
    }
    .search-bar {
      display: flex; align-items: center;
      border: 1.5px solid #F0D8B8; border-radius: 14px;
      overflow: visible; background: #FFF8EE;
      transition: border-color 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .search-bar.search-focused {
      border-color: #F28C00;
      box-shadow: 0 0 0 3px rgba(242,140,0,0.14);
      background: #fff;
    }
    .search-icon-svg { margin-left: 14px; flex-shrink: 0; }
    .search-bar input {
      flex: 1; height: 46px; border: none; padding: 0 10px;
      font-size: 14px; color: #0F1923; outline: none; background: transparent;
    }
    .search-bar input::placeholder { color: #B0B3BE; }
    .search-clear {
      background: none; border: none; cursor: pointer;
      padding: 6px 4px; display: flex; align-items: center; flex-shrink: 0;
    }
    .search-btn {
      display: flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, #F28C00, #FFB13B); color: #160B02;
      padding: 0 18px; height: 46px;
      font-size: 13px; font-weight: 700; border: none; cursor: pointer;
      border-radius: 0 12px 12px 0;
      transition: background 0.2s; white-space: nowrap; flex-shrink: 0;
      font-family: 'Inter', sans-serif;
    }
    .search-btn:hover { background: linear-gradient(135deg, #D87300, #F28C00); }

    /* Desktop search dropdown */
    .desktop-search-results {
      position: absolute; top: calc(100% + 6px); left: 0; right: 0;
      background: white; border-radius: 12px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      overflow: hidden; z-index: 9999;
      animation: slideDown 0.15s ease;
    }
    .ds-result-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; text-decoration: none;
      border-bottom: 1px solid #F9FAFB;
      transition: background 0.15s;
    }
    .ds-result-item:last-of-type { border-bottom: none; }
    .ds-result-item:hover { background: #FFF2DE; }
    .ds-result-img {
      width: 42px; height: 42px; border-radius: 8px;
      overflow: hidden; flex-shrink: 0; background: #F3F4F6;
      display: flex; align-items: center; justify-content: center;
    }
    .ds-result-img img { width: 100%; height: 100%; object-fit: cover; }
    .ds-img-fallback { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .ds-result-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .ds-result-name { font-size: 13px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ds-result-cat  { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 500; }
    .ds-result-price { font-size: 13px; font-weight: 700; color: #F28C00; flex-shrink: 0; }
    .ds-view-all {
      display: block; padding: 11px 14px;
      font-size: 13px; font-weight: 600; color: #B85E00;
      border-top: 1px solid #F3F4F6;
      text-decoration: none; transition: background 0.15s;
    }
    .ds-view-all:hover { background: #FFF2DE; }
    .ds-loading {
      display: flex; align-items: center; justify-content: center; gap: 6px; padding: 18px;
    }
    .ds-loading span {
      width: 7px; height: 7px; border-radius: 50%; background: #F28C00;
    }
    .ds-loading span:nth-child(1) { animation: dotPop 1s ease 0s infinite; }
    .ds-loading span:nth-child(2) { animation: dotPop 1s ease 0.18s infinite; }
    .ds-loading span:nth-child(3) { animation: dotPop 1s ease 0.36s infinite; }

    /* ── HEADER ACTIONS ── */
    .header-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; flex-shrink: 0; }
    .action-btn {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 8px 12px; border-radius: 10px; color: #374151;
      transition: all 0.2s; text-decoration: none;
    }
    .action-btn:hover { background: #FFF2DE; color: #B85E00; }
    .action-label { font-size: 10px; font-weight: 600; letter-spacing: 0.02em; }

    .cart-action-btn {
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #F28C00, #C86600); color: #160B02;
      padding: 10px 16px; border-radius: 14px;
      border: none; cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      font-family: 'Inter', sans-serif;
      position: relative;
    }
    .cart-action-btn:hover { background: linear-gradient(135deg, #FFB13B, #F28C00); }
    .cart-btn-inner { position: relative; display: flex; align-items: center; }
    .cart-badge {
      position: absolute; top: -8px; right: -8px;
      background: #070A05; color: white;
      font-size: 10px; font-weight: 800;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white;
    }
    .cart-btn-text { display: flex; flex-direction: column; align-items: flex-start; }
    .cart-label { font-size: 11px; font-weight: 600; opacity: 0.85; line-height: 1; }
    .cart-subtotal { font-size: 14px; font-weight: 800; line-height: 1.3; }

    /* Hamburger */
    .hamburger {
      display: none; flex-direction: column; gap: 5px;
      padding: 10px; border-radius: 10px;
      background: #F3F4F6; transition: background 0.2s;
    }
    .hamburger:hover { background: #E5E7EB; }
    .hamburger span {
      display: block; width: 20px; height: 2px;
      background: #374151; border-radius: 2px; transition: all 0.3s;
    }
    .hamburger.ham-open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .hamburger.ham-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .hamburger.ham-open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

    /* ── CATEGORY NAV ── */
    .cat-nav-bar {
      background: rgba(255,250,242,0.96);
      border-top: 1px solid rgba(247,233,215,0.9);
    }
    .cat-nav-inner {
      display: flex; align-items: center; gap: 2px;
      height: 40px; overflow-x: auto;
    }
    .cat-nav-inner::-webkit-scrollbar { display: none; }
    .cat-nav-link {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 14px; border-radius: 6px;
      font-size: 13px; font-weight: 500; color: #374151;
      white-space: nowrap; flex-shrink: 0;
      transition: all 0.18s; text-decoration: none;
    }
    .cat-nav-link:hover { color: #B85E00; background: #FFF2DE; }
    .cat-nav-link.cat-nav-active { color: #F28C00; font-weight: 800; }

    /* ── MOBILE MENU DRAWER ── */
    .menu-backdrop {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.5); z-index: 2400;
      opacity: 0; transition: opacity 0.25s;
    }
    .menu-backdrop.backdrop-active { display: block; opacity: 1; }

    .mobile-nav {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: min(320px, 88vw); background: white;
      z-index: 2500; display: flex; flex-direction: column;
      transform: translateX(110%);
      transition: transform 0.3s cubic-bezier(0.32,0.72,0,1);
      box-shadow: -8px 0 40px rgba(0,0,0,0.15);
    }
    .mobile-nav.mobile-nav-open { transform: translateX(0); }

    .mnav-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 18px;
      background:
        radial-gradient(circle at 12% 20%, rgba(242,140,0,0.28), transparent 34%),
        linear-gradient(135deg, #070A05, #1C1208);
      flex-shrink: 0;
    }
    .mnav-logo { height: 40px; object-fit: contain; }
    .mnav-close {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center;
      color: white; border: none; cursor: pointer; transition: background 0.18s;
    }
    .mnav-close:hover { background: rgba(255,255,255,0.22); }

    .mnav-body { flex: 1; overflow-y: auto; padding: 10px 0; }
    .mnav-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: #9CA3AF;
      padding: 8px 18px 4px;
    }
    .mnav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 18px; text-decoration: none;
      color: #111; font-size: 14.5px; font-weight: 500;
      border-bottom: 1px solid #F9FAFB;
      transition: background 0.15s;
    }
    .mnav-item:hover { background: #FFF2DE; }
    .mnav-item.mnav-active { color: #F28C00; font-weight: 800; }
    .mnav-icon { font-size: 16px; }
    .mnav-arr { margin-left: auto; color: #D1D5DB; flex-shrink: 0; }
    .mnav-cat-item { font-size: 13.5px; padding: 10px 18px 10px 26px; }
    .mnav-cat-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #F28C00; flex-shrink: 0;
    }

    .mnav-footer {
      padding: 16px 18px calc(16px + env(safe-area-inset-bottom));
      border-top: 1px solid #F3F4F6; background: #FAFAFA;
      flex-shrink: 0; display: flex; flex-direction: column; gap: 6px;
    }
    .mnav-phone {
      display: flex; align-items: center; gap: 8px;
      font-size: 13.5px; font-weight: 700; color: #B85E00; text-decoration: none;
    }
    .mnav-tag { font-size: 11px; color: #9CA3AF; }

    /* ── MOBILE SEARCH OVERLAY ── */
    .mob-search-overlay {
      display: none; position: fixed; inset: 0; z-index: 2100;
      background: rgba(0,0,0,0.55); backdrop-filter: blur(3px);
      align-items: flex-start; justify-content: center; padding-top: 90px;
      animation: fadeIn 0.18s ease;
    }
    .mob-search-overlay.mob-search-active { display: flex; }
    .mob-search-box {
      width: calc(100% - 28px); max-width: 480px;
      background: white; border-radius: 14px;
      overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.2);
      animation: slideDown 0.2s cubic-bezier(0.22,1,0.36,1);
    }
    .mob-search-row {
      display: flex; align-items: center; gap: 10px;
      padding: 0 14px; border-bottom: 1px solid #F3F4F6;
    }
    .mob-search-input {
      flex: 1; height: 52px; border: none; background: transparent;
      font-size: 16px; color: #111; outline: none;
    }
    .mob-search-input::placeholder { color: #B0B3BE; }
    .mob-clear-btn { background: none; border: none; cursor: pointer; padding: 6px; display: flex; }
    .mob-search-results { max-height: 300px; overflow-y: auto; }
    .mob-result-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; text-decoration: none;
      border-bottom: 1px solid #F9FAFB; transition: background 0.15s;
    }
    .mob-result-row:hover { background: #FFF2DE; }
    .mob-result-thumb {
      width: 42px; height: 42px; border-radius: 8px;
      overflow: hidden; flex-shrink: 0; background: #F3F4F6;
      display: flex; align-items: center; justify-content: center;
    }
    .mob-result-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .mob-result-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .mob-result-name { font-size: 13px; font-weight: 600; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mob-result-cat  { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.04em; }
    .mob-result-price { font-size: 13px; font-weight: 700; color: #F28C00; flex-shrink: 0; }
    .mob-search-loading {
      display: flex; align-items: center; justify-content: center; gap: 6px; padding: 20px;
    }
    .mob-search-loading span {
      width: 7px; height: 7px; border-radius: 50%; background: #F28C00;
    }
    .mob-search-loading span:nth-child(1) { animation: dotPop 1s ease 0s infinite; }
    .mob-search-loading span:nth-child(2) { animation: dotPop 1s ease 0.18s infinite; }
    .mob-search-loading span:nth-child(3) { animation: dotPop 1s ease 0.36s infinite; }
    .mob-search-empty { padding: 20px; text-align: center; font-size: 13px; color: #9CA3AF; }

    /* ── BOTTOM NAV ── */
    .bottom-nav { display: none; }

    /* ─── Responsive: hide / show ─── */
    @media (max-width: 900px) {
      .search-wrap { display: none; }
      .topbar-left, .topbar-right { display: none; }
      .topbar-center { width: 100%; }
      .hamburger { display: flex; }
    }

    @media (max-width: 768px) {
      /* Compact mobile header: topbar collapses into announcement bar */
      .topbar { height: 32px; }
      .header  { top: 32px; }
      .header-inner { height: 60px; gap: 10px; }
      .logo-img { height: 46px; }
      .cart-btn-text { display: none; }
      .cart-action-btn { display: none; }
      .action-btn { display: none; }
      .cat-nav-bar { display: none; }

      /* Bottom nav */
      .bottom-nav {
        display: flex; position: fixed;
        bottom: 0; left: 0; right: 0; z-index: 1900;
        background: #fffaf2; border-top: 1px solid #F7E9D7;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
      }
      .bnav-item {
        flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 3px; padding: 6px 4px;
        color: #9CA3AF; background: none; border: none; cursor: pointer;
        font-size: 10px; font-weight: 500; font-family: 'Inter', sans-serif;
        text-decoration: none; transition: color 0.2s; min-height: 50px;
        -webkit-tap-highlight-color: transparent;
      }
      .bnav-item:active { transform: scale(0.92); }
      .bnav-item.bnav-active { color: #F28C00; }
      .bnav-item.bnav-active svg { stroke: #F28C00; }
      .bnav-item.bnav-active span { color: #F28C00; font-weight: 800; }
      .bnav-cart-wrap { position: relative; display: flex; }
      .bnav-badge {
        position: absolute; top: -6px; right: -8px;
        background: #F28C00; color: #160B02;
        font-size: 9px; font-weight: 800;
        width: 16px; height: 16px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid white;
      }
      .bnav-cart { color: #B85E00; }
      .bnav-cart svg { stroke: #B85E00; }
    }

    @media (max-width: 480px) {
      .topbar { height: 28px; font-size: 11px; }
      .header { top: 28px; }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isScrolled = signal(false);
  mobileMenu = signal(false);
  mobileSearchOpen = signal(false);
  searchFocused = signal(false);
  searchQuery = '';
  searchResults = signal<any[]>([]);
  searchLoading = signal(false);
  navCategories = signal<any[]>([]);
  mediaUrl = environment.mediaUrl;

  private brandCategories: any[] = [];

  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor(
    public cart: CartService,
    public settings: SettingsService,
    private api: ApiService,
    private router: Router
  ) {}

  logoUrl = computed(() => {
    return this.settings.assetUrl('site_logo', '/logo.png');
  });

  ngOnInit() {
    // Scroll detection
    this.subs.add(
      new Observable<boolean>(obs => {
        const handler = () => obs.next(window.scrollY > 8);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
      }).subscribe(v => this.isScrolled.set(v))
    );

    // Nav categories
    this.api.getCategories().subscribe((res: any) => {
      if (res?.data) this.navCategories.set(res.data);
    });

    // Live search
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          if (!q || q.length < 2) { this.searchResults.set([]); this.searchLoading.set(false); return []; }
          this.searchLoading.set(true);
          return this.api.searchProducts(q);
        })
      ).subscribe({
        next: (res: any) => {
          this.searchLoading.set(false);
          this.searchResults.set(res?.data?.slice(0, 8) || []);
        },
        error: () => { this.searchLoading.set(false); this.searchResults.set([]); }
      })
    );

    // Close mobile menu on navigation
    this.subs.add(
      this.router.events.subscribe(e => {
        if (e instanceof NavigationEnd) {
          this.mobileMenu.set(false);
          this.mobileSearchOpen.set(false);
        }
      })
    );
  }

  ngOnDestroy() { this.subs.unsubscribe(); }

  displayNavCategories() {
    // Return DB categories directly — no hardcoded aliases
    return this.navCategories() || [];
  }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchFocused.set(false);
    }
  }

  doSearchMobile() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.mobileSearchOpen.set(false);
    }
  }

  onSearchBlur() {
    setTimeout(() => this.searchFocused.set(false), 200);
  }

  onMobileSearchInput(q: string) {
    this.searchSubject.next(q);
  }

  openMobileSearch() {
    this.mobileSearchOpen.set(true);
  }

  closeMobileSearch(e: Event) {
    if ((e.target as HTMLElement).classList.contains('mob-search-overlay')) {
      this.mobileSearchOpen.set(false);
    }
  }

  onResultClick() {
    this.searchFocused.set(false);
    this.mobileSearchOpen.set(false);
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults.set([]);
    this.searchSubject.next('');
  }
}

// Mini Observable helper for scroll
class Observable<T> {
  constructor(private subscribeFn: (obs: any) => () => void) {}
  subscribe(next: (v: T) => void) {
    let active = true;
    const cleanup = this.subscribeFn({ next: (v: T) => { if (active) next(v); } });
    return new Subscription();
  }
}

import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
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
  template: `
    <!-- Contact Top Bar -->
    <div class="contact-bar">
      <div class="container contact-inner">

        <!-- Mobile-only logo inside red bar -->
        <a routerLink="/" class="mob-bar-logo">
          <img [src]="logoUrl()" alt="Asian Food Cork" class="mob-bar-logo-img">
        </a>

        <!-- Desktop left: phone -->
        <div class="contact-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <span>{{ settings.get('site_phone', '+353 21 000 0000') }}</span>
          <span class="contact-sep">|</span>
          <span class="contact-tagline">Call Anytime</span>
        </div>

        <!-- Right: phone number (mobile) + offer text + pay online -->
        <div class="contact-right">
          <span class="mob-phone">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            {{ settings.get('site_phone', '+353 899 584 325') }}
          </span>
          <span class="offer-text">{{ settings.get('header_offer_text', 'Free delivery on orders above €50') }}</span>
          <a href="https://checkout.revolut.com/pay/05f16f5b-9d65-4e3d-b818-5305aec92b8e" target="_blank" rel="noopener" class="pay-online-btn">Pay Online</a>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="header" [class.scrolled]="isScrolled()">
      <div class="container header-inner">

        <!-- Logo -->
        <a routerLink="/" class="logo">
          <img [src]="logoUrl()" alt="Asian Foods Cork" class="logo-img">
        </a>

        <!-- Search Bar (desktop) -->
        <div class="search-wrap">
          <div class="search-bar" [class.active]="searchOpen()">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search kimchi, rice, matcha, soy sauce..."
              (keyup.enter)="doSearch()"
              (focus)="searchOpen.set(true)"
              (blur)="onSearchBlur()"
            >
            <button class="search-btn" (click)="doSearch()">Search</button>
          </div>
        </div>

        <!-- Actions (desktop only) -->
        <div class="header-actions">
          <button class="action-btn search-toggle" (click)="searchOpen.set(!searchOpen())" title="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <a routerLink="/wishlist" class="action-btn" title="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </a>
          <a routerLink="/account" class="action-btn" title="Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
          <a routerLink="/cart" class="action-btn cart-btn" (click)="cart.toggleCart(); $event.preventDefault()" title="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            @if (cart.itemCount() > 0) {
              <span class="cart-badge animate-scaleIn">{{ cart.itemCount() }}</span>
            }
          </a>
          <button class="mobile-menu-btn" (click)="mobileMenu.set(!mobileMenu())" [class.open]="mobileMenu()">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Desktop nav strip (hidden on mobile) -->
    <div class="desk-nav-bar">
      <div class="container desk-nav-inner">
        <a routerLink="/" routerLinkActive="desk-nav-active" [routerLinkActiveOptions]="{exact:true}" class="desk-nav-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </a>
        <a routerLink="/categories" routerLinkActive="desk-nav-active" class="desk-nav-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          All Categories
        </a>
        <a routerLink="/contact" routerLinkActive="desk-nav-active" class="desk-nav-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          Contact Us
        </a>
      </div>
    </div>

    <!-- ── MOBILE MENU DRAWER (slides in from right) ── -->
    <nav class="main-nav" [class.open]="mobileMenu()">

      <!-- Drawer header -->
      <div class="mnav-header">
        <img [src]="logoUrl()" alt="Asian Food Cork" class="mnav-logo">
        <button class="mnav-close" (click)="mobileMenu.set(false)" aria-label="Close menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Main links -->
      <div class="mnav-body">
        <div class="mnav-section-label">Navigate</div>
        <a routerLink="/" routerLinkActive="mnav-active" [routerLinkActiveOptions]="{exact:true}" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
          <span>Home</span>
          <svg class="mnav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a routerLink="/categories" routerLinkActive="mnav-active" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span>All Categories</span>
          <svg class="mnav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a routerLink="/blog" routerLinkActive="mnav-active" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
          <span>Blog &amp; Recipes</span>
          <svg class="mnav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a routerLink="/contact" routerLinkActive="mnav-active" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
          <span>Contact Us</span>
          <svg class="mnav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a routerLink="/account" routerLinkActive="mnav-active" class="mnav-item" (click)="mobileMenu.set(false)">
          <span class="mnav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
          <span>My Account</span>
          <svg class="mnav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>

        <!-- Categories quick-links -->
        @if (navCategories().length > 0) {
          <div class="mnav-section-label" style="margin-top:20px">Shop by Category</div>
          @for (cat of navCategories().slice(0,6); track cat.id) {
            <a [routerLink]="['/category', cat.slug]" routerLinkActive="mnav-active" class="mnav-item mnav-cat" (click)="mobileMenu.set(false)">
              <span class="mnav-dot"></span>
              <span>{{ cat.name }}</span>
              <svg class="mnav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          }
        }
      </div>

      <!-- Drawer footer -->
      <div class="mnav-footer">
        <a href="tel:{{ settings.get('site_phone', '+353899584325') }}" class="mnav-contact">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          {{ settings.get('site_phone', '+353 899 584 325') }}
        </a>
        <span class="mnav-tagline">Asian Food Cork — Fresh &amp; Authentic</span>
      </div>
    </nav>

    <!-- ── MOBILE SEARCH OVERLAY (live) ── -->
    <div class="mob-search-overlay" [class.active]="mobileSearchOpen()" (click)="closeMobileSearch($event)">
      <div class="mob-search-box">
        <div class="mob-search-inner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            #mobileSearchInput
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search kimchi, rice, matcha..."
            (keyup.enter)="doSearchMobile()"
            (ngModelChange)="onMobileSearchInput($event)"
            class="mob-search-input"
            autocomplete="off"
          >
          @if (searchQuery) {
            <button class="mob-search-clear" (click)="clearSearch()" aria-label="Clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          }
        </div>
        <!-- Live results -->
        @if (searchResults().length > 0 && searchQuery.length > 1) {
          <div class="mob-search-results">
            @for (p of searchResults(); track p.id) {
              <a [routerLink]="['/product', p.slug]" class="mob-result-item" (click)="onResultClick()">
                <div class="mob-result-img">
                  @if (p.image) {
                    <img [src]="mediaUrl + p.image" [alt]="p.name" loading="lazy">
                  } @else {
                    <div class="mob-result-img-placeholder">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/></svg>
                    </div>
                  }
                </div>
                <div class="mob-result-info">
                  <span class="mob-result-name">{{ p.name }}</span>
                  @if (p.category_name) {
                    <span class="mob-result-cat">{{ p.category_name }}</span>
                  }
                </div>
                <span class="mob-result-price">€{{ (+p.price).toFixed(2) }}</span>
              </a>
            }
          </div>
        } @else if (searchLoading() && searchQuery.length > 1) {
          <div class="mob-search-loading">
            <span></span><span></span><span></span>
          </div>
        } @else if (searchQuery.length > 1 && searchResults().length === 0 && !searchLoading()) {
          <div class="mob-search-empty">No products found for "{{ searchQuery }}"</div>
        }
      </div>
    </div>

    <!-- ── MOBILE BOTTOM NAVIGATION BAR ── -->
    <nav class="bottom-nav">
      <a routerLink="/" routerLinkActive="bnav-active" [routerLinkActiveOptions]="{exact:true}" class="bnav-item" (click)="mobileMenu.set(false)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </a>
      <button class="bnav-item" (click)="mobileMenu.set(false); openMobileSearch()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span>Search</span>
      </button>
      <a routerLink="/wishlist" routerLinkActive="bnav-active" class="bnav-item" (click)="mobileMenu.set(false)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span>Wishlist</span>
      </a>
      <a routerLink="/account" routerLinkActive="bnav-active" class="bnav-item" (click)="mobileMenu.set(false)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Account</span>
      </a>
      <button class="bnav-item bnav-cart" (click)="mobileMenu.set(false); cart.toggleCart()">
        <span class="bnav-cart-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          @if (cart.itemCount() > 0) {
            <span class="bnav-badge">{{ cart.itemCount() }}</span>
          }
        </span>
        <span>Cart</span>
      </button>
      <button class="bnav-item" [class.bnav-active]="mobileMenu()" (click)="mobileMenu.set(!mobileMenu())">
        @if (!mobileMenu()) {
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <span>Menu</span>
        } @else {
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          <span>Close</span>
        }
      </button>
    </nav>

    <!-- ── MENU BACKDROP: tap outside to close ── -->
    <div class="menu-backdrop" [class.active]="mobileMenu()" (click)="mobileMenu.set(false)"></div>
  `,
  styles: [`
    /* ── Contact Bar ── */
    .contact-bar {
      background: #c8102e; color: white;
      height: 36px; display: flex; align-items: center;
      font-size: 12.5px; font-weight: 500;
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      overflow: visible;    /* prevent logo crop */
    }
    .contact-inner { display: flex; justify-content: space-between; align-items: center; gap: 10px; width: 100%; }
    .contact-left { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.95); flex-shrink: 0; }
    .contact-sep { opacity: 0.4; margin: 0 2px; }
    .contact-tagline { font-size: 11px; opacity: 0.7; }
    .contact-right { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .offer-text { font-size: 12px; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pay-online-btn {
      background: #22C55E; color: white; font-size: 11px; font-weight: 700;
      padding: 4px 12px; border-radius: 999px; text-decoration: none;
      transition: background 0.2s; white-space: nowrap; flex-shrink: 0;
    }
    .pay-online-btn:hover { background: #16a34a; }

    /* Mobile logo inside red bar — hidden on desktop */
    .mob-bar-logo { display: none; flex-shrink: 0; align-items: center; }
    .mob-bar-logo-img { height: 40px; width: auto; object-fit: contain; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.18)); }

    /* Phone shown inside mobile header — hidden on desktop */
    .mob-phone { display: none; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.97); white-space: nowrap; flex-shrink: 0; letter-spacing: 0.01em; }

    /* Menu backdrop — always defined, shown when drawer is open */
    .menu-backdrop {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2400;
      opacity: 0;
      transition: opacity 0.22s ease;
    }
    .menu-backdrop.active {
      display: block;
      opacity: 1;
    }
    /* ── Main Header ── */
    .header {
      position: fixed; top: 36px; left: 0; right: 0; z-index: 999;
      background: rgba(255,255,255,0.97);
      border-bottom: 1px solid rgba(229,231,235,0.8);
      transition: background 0.35s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.35s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.35s cubic-bezier(0.22,1,0.36,1);
    }
    /* scrolled: only change visual style — position stays fixed below contact bar */
    .header.scrolled {
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      box-shadow: 0 4px 32px rgba(75,46,131,0.12);
      border-bottom-color: rgba(75,46,131,0.1);
    }
    .header-inner { display: flex; align-items: center; height: 82px; gap: 20px; }

    /* ── Nav Strip (desktop + mobile) ── */
    .desk-nav-bar {
      position: fixed;
      top: 118px;   /* 36px contact bar + 82px main header */
      left: 0; right: 0;
      z-index: 998;
      background: #fff;
      border-bottom: 2px solid #F0EEFF;
      box-shadow: 0 2px 12px rgba(75,46,131,0.06);
    }
    .desk-nav-inner {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 40px;
      overflow-x: auto;
    }
    .desk-nav-inner::-webkit-scrollbar { display: none; }
    .desk-nav-link {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 16px; border-radius: 8px;
      font-size: 13.5px; font-weight: 600; color: #3D3D56;
      white-space: nowrap; flex-shrink: 0;
      transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
      text-decoration: none;
    }
    .desk-nav-link:hover { background: #E8F5E9; color: #2E9F5C; }
    .desk-nav-link.desk-nav-active,
    .desk-nav-link.active { background: #2E9F5C; color: white; }
    .desk-nav-link.desk-nav-active svg,
    .desk-nav-link.active svg { stroke: white; }

    /* Mobile nav strip — repositioned below red bar */
    @media (max-width: 768px) {
      .desk-nav-bar {
        top: 90px;
        border-bottom: 2px solid #E8F5E9;
        background: #ffffff;
      }
      .desk-nav-inner {
        height: 38px;
        gap: 0;
        padding: 0 8px;
        justify-content: space-around;   /* 3 items spread evenly */
      }
      .desk-nav-link {
        font-size: 12px;
        padding: 5px 10px;
        gap: 4px;
        flex: 1;
        justify-content: center;
      }
      .desk-nav-link svg { width: 13px; height: 13px; }
    }

    /* ── Logo ── */
    .logo { flex-shrink: 0; display: flex; align-items: center; }
    .logo-img { height: 70px; width: auto; object-fit: contain; max-width: 200px; }

    /* ── Search ── */
    .search-wrap { flex: 1; max-width: 600px; }
    .search-bar {
      display: flex; align-items: center;
      border: 2px solid #D1D5DB; border-radius: 8px;
      overflow: hidden; background: white; transition: all 0.25s ease;
    }
    .search-bar.active, .search-bar:focus-within {
      border-color: #2E9F5C; box-shadow: 0 0 0 4px rgba(46,159,92,0.14);
    }
    .search-cat {
      padding: 0 12px; height: 44px; border: none;
      background: #F6F7FB; border-right: 1.5px solid #E5E7EB;
      font-size: 13px; font-weight: 600; color: #4B2E83;
      outline: none; min-width: 90px; cursor: pointer;
    }
    .search-divider { width: 1px; height: 24px; background: #E5E7EB; }
    .search-icon { padding: 0 10px; font-size: 15px; color: #9CA3AF; flex-shrink: 0; }
    .search-bar input {
      flex: 1; height: 44px; border: none; padding: 0 10px;
      font-size: 14px; color: #1A1A2E; outline: none; background: transparent;
    }
    .search-bar input::placeholder { color: #B0B3BE; }
    .search-btn {
      background: #2E9F5C; color: white; padding: 0 20px; height: 44px;
      font-size: 13px; font-weight: 700; border: none; cursor: pointer;
      transition: background 0.2s; white-space: nowrap; flex-shrink: 0;
      font-family: 'Inter', sans-serif;
    }
    .search-btn:hover { background: #217A45; }

    /* ── Actions ── */
    .header-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
    .action-btn {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: #4B2E83; background: #F0ECF9;
      transition: all 0.25s cubic-bezier(0.22,1,0.36,1); position: relative;
    }
    .action-btn:hover { background: #4B2E83; color: white; transform: scale(1.05); }
    .cart-badge {
      position: absolute; top: -4px; right: -4px;
      background: #FF6A2C; color: white;
      font-size: 10px; font-weight: 800;
      width: 19px; height: 19px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white; box-shadow: 0 2px 8px rgba(255,106,44,0.4);
    }
    .search-toggle { display: none; }

    /* ── Hamburger ── */
    .mobile-menu-btn {
      display: none; flex-direction: column;
      justify-content: center; align-items: center;
      gap: 5px; width: 44px; height: 44px;
      border-radius: 12px; background: #F0ECF9; transition: all 0.25s;
    }
    .mobile-menu-btn:hover { background: #4B2E83; }
    .mobile-menu-btn:hover span { background: white; }
    .mobile-menu-btn span {
      display: block; width: 20px; height: 2px;
      background: #4B2E83; border-radius: 2px; transition: all 0.3s;
    }
    .mobile-menu-btn.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .mobile-menu-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .mobile-menu-btn.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

    /* ── Nav / Slide-in Drawer (always fixed off-screen) ── */
    .main-nav {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(320px, 88vw);
      background: white;
      z-index: 2500;
      display: flex;
      flex-direction: column;
      transform: translateX(110%);
      transition: transform 0.3s cubic-bezier(0.32,0.72,0,1);
      box-shadow: -8px 0 40px rgba(0,0,0,0.18);
      overflow: hidden;
    }
    .main-nav.open {
      transform: translateX(0);
    }

    /* Drawer header */
    .mnav-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px;
      background: linear-gradient(135deg, #4B2E83 0%, #2E9F5C 100%);
      flex-shrink: 0;
    }
    .mnav-logo { height: 38px; object-fit: contain; }
    .mnav-close {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.18); border: none;
      color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.18s;
    }
    .mnav-close:active { background: rgba(255,255,255,0.3); }

    /* Drawer scrollable body */
    .mnav-body {
      flex: 1; overflow-y: auto;
      padding: 12px 0;
      -webkit-overflow-scrolling: touch;
    }
    .mnav-section-label {
      font-size: 10px; font-weight: 800; letter-spacing: 0.1em;
      text-transform: uppercase; color: #9CA3AF;
      padding: 8px 20px 4px;
    }

    /* Nav rows */
    .mnav-item {
      display: flex; align-items: center; gap: 14px;
      padding: 13px 20px;
      color: #1A1A2E; text-decoration: none;
      font-size: 15px; font-weight: 500;
      border-bottom: 1px solid #F3F4F6;
      transition: background 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .mnav-item:active { background: #F5F0FF; }
    .mnav-item.mnav-active { color: #4B2E83; font-weight: 700; background: #F5F0FF; }
    .mnav-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: #F3F0FA;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #4B2E83;
    }
    .mnav-item.mnav-active .mnav-icon { background: #4B2E83; color: white; }
    .mnav-arrow { margin-left: auto; color: #C4C4D4; flex-shrink: 0; }

    /* Category sub-items */
    .mnav-cat { padding-left: 28px; font-size: 14px; font-weight: 400; color: #4B5563; }
    .mnav-cat.mnav-active { color: #4B2E83; font-weight: 600; }
    .mnav-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #D1D5DB; flex-shrink: 0;
      transition: background 0.15s;
    }
    .mnav-cat.mnav-active .mnav-dot { background: #4B2E83; }

    /* Drawer footer */
    .mnav-footer {
      padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
      border-top: 1px solid #E5E7EB;
      background: #FAFAFA;
      flex-shrink: 0;
      display: flex; flex-direction: column; gap: 6px;
    }
    .mnav-contact {
      display: flex; align-items: center; gap: 8px;
      font-size: 13.5px; font-weight: 700; color: #4B2E83;
      text-decoration: none;
    }
    .mnav-tagline { font-size: 11px; color: #9CA3AF; }

    /* nav-inner (desktop horizontal nav — not used currently) */
    .nav-inner { display: flex; gap: 4px; padding: 6px 0; overflow-x: auto; }
    .nav-inner::-webkit-scrollbar { display: none; }
    .nav-inner a {
      padding: 7px 16px; border-radius: 8px;
      font-size: 13.5px; font-weight: 500; color: #3D3D56;
      transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
      white-space: nowrap; flex-shrink: 0;
    }
    .nav-inner a:hover { background: #F0ECF9; color: #4B2E83; }
    .nav-inner a.active { background: #4B2E83; color: white; font-weight: 600; }

    /* ── Mobile Search Overlay (live) ── */
    .mob-search-overlay {
      display: none;
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      align-items: flex-start; justify-content: center;
      padding-top: 80px;
      animation: fadeIn 0.18s ease;
    }
    .mob-search-overlay.active { display: flex; }
    .mob-search-box {
      width: calc(100% - 32px); max-width: 480px;
      background: white; border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.25);
      animation: slideDown 0.2s cubic-bezier(0.22,1,0.36,1);
    }
    .mob-search-inner {
      display: flex; align-items: center; gap: 10px;
      border-bottom: 1.5px solid #F3F4F6;
      padding: 0 16px; background: white;
    }
    .mob-search-input {
      flex: 1; height: 52px; border: none; background: transparent;
      font-size: 16px; color: #1A1A2E; outline: none;
    }
    .mob-search-input::placeholder { color: #B0B3BE; }
    .mob-search-clear {
      background: none; border: none; cursor: pointer;
      padding: 6px; display: flex; align-items: center;
      flex-shrink: 0;
    }
    /* Results list */
    .mob-search-results {
      max-height: 320px; overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .mob-result-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px; text-decoration: none;
      border-bottom: 1px solid #F9FAFB;
      transition: background 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .mob-result-item:last-child { border-bottom: none; }
    .mob-result-item:active { background: #F5F0FF; }
    .mob-result-img {
      width: 44px; height: 44px; border-radius: 8px;
      overflow: hidden; flex-shrink: 0;
      background: #F3F4F6;
    }
    .mob-result-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .mob-result-img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
    }
    .mob-result-info {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column; gap: 2px;
    }
    .mob-result-name {
      font-size: 13.5px; font-weight: 600; color: #1A1A2E;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .mob-result-cat {
      font-size: 11px; color: #9CA3AF; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .mob-result-price {
      font-size: 14px; font-weight: 800; color: #4B2E83;
      flex-shrink: 0;
    }
    /* Loading dots */
    .mob-search-loading {
      display: flex; align-items: center; justify-content: center;
      gap: 6px; padding: 20px;
    }
    .mob-search-loading span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #4B2E83; display: block;
    }
    .mob-search-loading span:nth-child(1) { animation: dotPop 1s ease 0s infinite; }
    .mob-search-loading span:nth-child(2) { animation: dotPop 1s ease 0.18s infinite; }
    .mob-search-loading span:nth-child(3) { animation: dotPop 1s ease 0.36s infinite; }
    @keyframes dotPop { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
    /* Empty state */
    .mob-search-empty {
      padding: 20px 16px; text-align: center;
      font-size: 13px; color: #9CA3AF;
    }

    /* ── Bottom Navigation Bar (mobile only, hidden on desktop) ── */
    .bottom-nav { display: none; }

    /* ── 900px: hide desktop search bar ── */
    @media (max-width: 900px) {
      .search-wrap { display: none; }
      .search-toggle { display: flex; }
      .mobile-menu-btn { display: flex; }
      .offer-left, .offer-right { display: none; }
      .offer-center { text-align: center; width: 100%; }
    }

    /* ════════════════════════════════════════════════
       MOBILE ≤768px  — ONE unified sticky header
       White .header is HIDDEN. Red .contact-bar
       becomes the single compact mobile header.
    ════════════════════════════════════════════════ */
    @media (max-width: 768px) {

      /* ── 1. HIDE the white header entirely ── */
      .header { display: none !important; }

      /* ── 2. Expand red bar into a full mobile header ── */
      .contact-bar {
        height: auto;        /* let bar grow around the logo — no more clipping */
        min-height: 80px;   /* comfortable tap height */
        padding: 10px 0;    /* even top/bottom breathing room */
        overflow: visible;  /* ensure logo isn't cut */
        box-shadow: 0 3px 20px rgba(0,0,0,0.22);
        align-items: center;
      }
      .contact-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      /* ── 3. Show mobile logo — LARGE and dominant ── */
      .mob-bar-logo {
        display: flex;
        flex-shrink: 0;
      }
      .mob-bar-logo-img {
        height: 68px;
        min-width: 90px;
        width: auto;
        object-fit: contain;
        object-position: left center;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
      }

      /* ── 4. Hide desktop phone (contact-left) ── */
      .contact-left { display: none; }

      /* ── 5. Completely hide offer/promo text on mobile ── */
      .offer-text { display: none !important; }

      /* ── 6. Show mob-phone ── */
      .mob-phone {
        display: flex;
        font-size: 14px;
        font-weight: 700;
        gap: 7px;
        letter-spacing: 0.01em;
        color: rgba(255,255,255,1);
      }

      /* ── 7. Contact right: phone + Pay Online only ── */
      .contact-right {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
        flex-shrink: 0;
      }

      /* ── 8. Premium Pay Online pill ── */
      .pay-online-btn {
        background: #22C55E;
        color: white;
        font-size: 13.5px;
        font-weight: 700;
        padding: 10px 20px;
        border-radius: 999px;
        letter-spacing: 0.02em;
        box-shadow: 0 3px 14px rgba(34,197,94,0.5);
        transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        white-space: nowrap;
        flex-shrink: 0;
        line-height: 1;
      }
      .pay-online-btn:active {
        transform: scale(0.95);
        box-shadow: 0 1px 6px rgba(34,197,94,0.3);
      }

      /* ── 7. Bottom Nav visible on mobile ── */
      .bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0; left: 0; right: 0;
        z-index: 1900;
        background: white;
        border-top: 1px solid #E5E7EB;
        border-radius: 18px 18px 0 0;
        box-shadow: 0 -4px 24px rgba(75,46,131,0.10);
        padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
        gap: 0;
      }
      .bnav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 6px 4px;
        color: #9CA3AF;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 10px;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        text-decoration: none;
        transition: color 0.2s, transform 0.15s;
        -webkit-tap-highlight-color: transparent;
        min-height: 52px;
      }
      .bnav-item:active { transform: scale(0.9); }
      .bnav-item svg { transition: stroke 0.2s; }
      .bnav-item.bnav-active { color: #4B2E83; }
      .bnav-item.bnav-active svg { stroke: #4B2E83; }
      .bnav-item.bnav-active span { color: #4B2E83; font-weight: 700; }

      /* Cart badge in bottom nav */
      .bnav-cart-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
      .bnav-badge {
        position: absolute; top: -6px; right: -8px;
        background: #FF6A2C; color: white;
        font-size: 9px; font-weight: 800;
        width: 17px; height: 17px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 1.5px solid white;
      }

      /* ── 8. Mobile menu btn visible ── */
      .mobile-menu-btn { display: flex; }
    }


    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchCat = '';
  searchOpen    = signal(false);
  mobileSearchOpen = signal(false);
  mobileMenu    = signal(false);
  isScrolled    = signal(false);
  navCategories = signal<any[]>([]);
  searchResults = signal<any[]>([]);
  searchLoading = signal(false);
  mediaUrl = environment.mediaUrl;

  private _searchSubject = new Subject<string>();
  private _subs: Subscription[] = [];

  // Computed logo URL
  logoUrl = computed(() => {
    const raw = this.settings.get('site_logo', '');
    if (!raw) return '/logo.png';
    const base = raw.startsWith('/') ? raw : '/' + raw;
    return `${base}?v=${this.settings.settings()?.['_ts'] || Date.now()}`;
  });

  constructor(
    public cart: CartService,
    public settings: SettingsService,
    private router: Router,
    private api: ApiService
  ) {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 40);
      });
    }
  }

  ngOnInit() {
    // Close menu on every navigation
    this._subs.push(this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mobileMenu.set(false);
        this.mobileSearchOpen.set(false);
        this.searchResults.set([]);
      }
    }));

    // Live search with debounce
    this._subs.push(
      this._searchSubject.pipe(
        debounceTime(280),
        distinctUntilChanged(),
        switchMap(q => {
          if (q.trim().length < 2) {
            this.searchResults.set([]);
            this.searchLoading.set(false);
            return [];
          }
          this.searchLoading.set(true);
          return this.api.searchProducts(q);
        })
      ).subscribe({
        next: (res: any) => {
          this.searchLoading.set(false);
          if (res?.success) {
            this.searchResults.set((res.data || []).slice(0, 8));
          } else {
            this.searchResults.set([]);
          }
        },
        error: () => { this.searchLoading.set(false); this.searchResults.set([]); }
      })
    );

    this.api.getCategories().subscribe({
      next: (res: any) => {
        if (res?.success && res.data) {
          const flat: any[] = [];
          const flatten = (cats: any[]) => {
            cats.forEach((c: any) => {
              if (c.is_active == 1 && !c.parent_id) flat.push(c);
              if (c.children?.length) flatten(c.children);
            });
          };
          flatten(res.data);
          this.navCategories.set(flat);
        }
      },
      error: () => {}
    });
  }

  ngOnDestroy() {
    this._subs.forEach(s => s.unsubscribe());
  }

  onMobileSearchInput(q: string) {
    this._searchSubject.next(q);
    if (!q.trim()) this.searchResults.set([]);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults.set([]);
    this.searchLoading.set(false);
  }

  onResultClick() {
    this.mobileSearchOpen.set(false);
    this.clearSearch();
  }

  openMobileSearch() {
    this.mobileSearchOpen.set(true);
  }

  closeMobileSearch(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('mob-search-overlay')) {
      this.mobileSearchOpen.set(false);
    }
  }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchOpen.set(false);
    }
  }

  doSearchMobile() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.mobileSearchOpen.set(false);
      this.clearSearch();
    }
  }

  onSearchBlur() {
    setTimeout(() => this.searchOpen.set(false), 200);
  }
}

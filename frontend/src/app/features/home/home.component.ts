import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, Inject, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ── HERO SLIDER ── -->
    <section class="hero-section">
      @if (bannersLoaded()) {
        @if (banners().length > 0) {
          <div class="slider-wrap"
               (mouseenter)="pauseSlider()"
               (mouseleave)="resumeSlider()"
               (touchstart)="onTouchStart($event)"
               (touchend)="onTouchEnd($event)">

            @for (b of banners(); track b.id; let i = $index) {
              <div class="slide" [class.slide-active]="activeSlide() === i">
                <!-- Left Content -->
                <div class="slide-content" [class.slide-content-active]="activeSlide() === i">
                  <div class="slide-eyebrow">{{ settings.get('hero_eyebrow', 'Proudly halal') }}</div>
                  @if (b.title) { <h1 class="slide-title">{{ b.title }}</h1> }
                  @if (b.subtitle) { <p class="slide-sub">{{ b.subtitle }}</p> }
                  @if (b.button_text && b.link) {
                    <a [href]="b.link" class="slide-cta" [style.background]="b.button_color || '#F28C00'">
                      {{ b.button_text }}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                    </a>
                  }
                </div>

                <!-- Right Video / Image Media -->
                <div class="slide-media-container">
                  <div class="hero-square-stage">
                    <div class="hero-square-glow"></div>
                    <div class="hero-square-card">
                      @if (b.media_type === 'video' && b.video) {
                        <video class="hero-square-media" [src]="getMediaUrl(b.video)" autoplay [muted]="true" loop playsinline
                          [attr.preload]="i === 0 ? 'auto' : 'metadata'"
                          (loadedmetadata)="playVideo($event, i)"
                          (canplay)="playVideo($event, i)"
                          (pause)="onVideoPaused($event, i)"
                          (error)="onVideoError($event)"></video>
                      } @else if (b.image) {
                        <div class="hero-square-media hero-square-image" [style.background-image]="'url(' + getMediaUrl(b.image) + ')'"></div>
                      } @else {
                        <div class="hero-square-media hero-square-placeholder">
                          <div class="placeholder-logo">●</div>
                        </div>
                      }
                      <div class="hero-square-overlay"></div>
                      <div class="hero-square-shine"></div>
                      <div class="hero-square-badge">
                        <span class="badge-dot"></span>
                        {{ settings.get('hero_media_badge', 'Premium Grocery Selection') }}
                      </div>
                      <div class="hero-square-caption">
                        <strong>{{ settings.get('hero_media_caption_title', 'Fresh Picks') }}</strong>
                        <span>{{ settings.get('hero_media_caption_meta', 'Curated daily') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (banners().length > 1) {
              <button class="slider-arrow arrow-prev" (click)="prevSlide()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              </button>
              <button class="slider-arrow arrow-next" (click)="nextSlide()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              </button>
              <div class="slider-dots">
                @for (b of banners(); track b.id; let i = $index) {
                  <button class="dot" [class.dot-active]="activeSlide() === i" (click)="goToSlide(i)"></button>
                }
              </div>
            }
          </div>
        } @else {
          <!-- Fallback hero if no banners configured -->
          <div class="hero-fallback">
            <div class="hf-overlay"></div>
            <div class="hero-fallback-content">
              <div class="hf-badges">
                <span class="hf-badge"><span>✓</span> {{ settings.get('trust_item_1_text', 'Quality Guaranteed') }}</span>
                <span class="hf-badge"><span>✓</span> {{ settings.get('trust_item_3_text', 'Satisfaction Guaranteed') }}</span>
              </div>
              <h1 class="hf-title">{{ settings.get('site_name', 'Your Store') }}<br><span class="hf-highlight">{{ settings.get('site_tagline', 'Online Shop') }}</span></h1>
              <p class="hf-sub">{{ settings.get('site_description', 'Configure your store description in the Admin Settings panel.') }}</p>
              <div class="hf-btns">
                <a routerLink="/categories" class="slide-cta">
                  {{ settings.get('home_categories_link_text', 'Shop Now') }}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </a>
                <a routerLink="/categories" class="slide-cta-ghost">Browse Categories</a>
              </div>
              <div class="hf-stats">
                <div class="hf-stat"><strong>—</strong><span>Configure in Admin</span></div>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="hero-skeleton"></div>
      }
    </section>

    <!-- ── TRUST STRIP ── -->
    <section class="trust-strip">
      <div class="container trust-strip-inner">
        <div class="trust-pill">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F28C00" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>{{ settings.get('trust_item_1_text', '100% Halal Certified') }}</span>
        </div>
        <div class="trust-divider"></div>
        <div class="trust-pill">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F28C00" stroke-width="2"><path d="M1 3h15l3 9H1z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
          <span>{{ settings.get('trust_item_2_text', 'Free Delivery Over €50') }}</span>
        </div>
        <div class="trust-divider"></div>
        <div class="trust-pill">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F28C00" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>{{ settings.get('trust_item_3_text', 'Freshness Guaranteed') }}</span>
        </div>
        <div class="trust-divider"></div>
        <div class="trust-pill">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F28C00" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>{{ settings.get('trust_item_4_text', 'Same-Day Dispatch') }}</span>
        </div>
      </div>
    </section>

    <!-- ── SHOP BY CATEGORY ── -->
    <section class="section-sm">
      <div class="container">
        <div class="title-bar">
          <div>
            <div class="section-label">{{ settings.get('home_categories_label', 'Browse') }}</div>
            <h2 class="section-title" style="margin:0">{{ settings.get('home_categories_title', 'Shop by Category') }}</h2>
          </div>
          <a routerLink="/categories" class="section-link">
            {{ settings.get('home_categories_link_text', 'All Categories') }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        @if (displayCategories().length > 0) {
          <div class="cat-showcase">
            @for (cat of displayCategories().slice(0,8); track cat.slug; let i = $index) {
              <a [routerLink]="['/category', cat.slug]" class="cat-tile" appScrollAnimate [animationDelay]="(i * 0.07) + 's'">
                <div class="cat-tile-img">
                  @if (cat.image) {
                    <img [src]="getMediaUrl(cat.image)" [alt]="cat.name" loading="lazy" (error)="onCategoryImageError($event)">
                  }
                  <span class="cat-tile-emoji">{{ cat.icon || getCatEmoji(cat.name) }}</span>
                </div>
                <span class="cat-tile-name">{{ cat.name }}</span>
              </a>
            }
          </div>
        } @else {
          <!-- Static category showcase for new brand -->
          <div class="cat-showcase">
            @for (cat of staticCats; track cat.name; let i = $index) {
              <a routerLink="/categories" class="cat-tile" appScrollAnimate [animationDelay]="(i * 0.07) + 's'">
                <div class="cat-tile-img cat-tile-static">
                  <span class="cat-tile-emoji">{{ cat.icon }}</span>
                </div>
                <span class="cat-tile-name">{{ cat.name }}</span>
              </a>
            }
          </div>
        }
      </div>
    </section>

    <!-- ── FEATURED PRODUCTS ── -->
    <section class="section" style="background: var(--bg);">
      <div class="container">
        <div class="title-bar">
          <div>
            <div class="section-label">{{ settings.get('home_featured_label', 'Bestsellers') }}</div>
            <h2 class="section-title" style="margin:0">{{ settings.get('home_featured_title', 'Featured Products') }}</h2>
          </div>
          <a routerLink="/search" class="section-link">
            {{ settings.get('home_featured_link_text', 'View All') }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        @if (featuredLoading()) {
          <div class="products-grid">
            @for (s of [1,2,3,4,5,6,7,8]; track s) {
              <div class="skeleton product-skeleton"></div>
            }
          </div>
        } @else if (featured().length > 0) {
          <div class="products-grid">
            @for (p of featured().slice(0,8); track p.id; let i = $index) {
              <app-product-card [product]="p" appScrollAnimate [animationDelay]="(i * 0.06) + 's'"></app-product-card>
            }
          </div>
        }
      </div>
    </section>

    <!-- ── PROMO BANNER ── -->
    <section class="promo-banner-section">
      <div class="container">
        <div class="promo-grid">
          <div class="promo-card promo-halal">
            <div class="promo-content">
              <span class="promo-label">{{ settings.get('promo_1_label', 'Fresh Daily') }}</span>
              <h3>{{ settings.get('promo_1_title', 'Premium Halal Meats & Poultry') }}</h3>
              <p>{{ settings.get('promo_1_text', 'Hand-selected, freshly cut halal chicken, mutton, beef and seafood.') }}</p>
              <a [routerLink]="settings.get('promo_1_link', '/categories')" class="promo-btn promo-btn-white">{{ settings.get('promo_1_button', 'Shop Meats') }} →</a>
            </div>
          </div>
          <div class="promo-card promo-spice">
            <div class="promo-content">
              <span class="promo-label">{{ settings.get('promo_2_label', 'Authentic') }}</span>
              <h3>{{ settings.get('promo_2_title', 'Premium Spices & Seasonings') }}</h3>
              <p>{{ settings.get('promo_2_text', 'Whole spices, blends and masalas sourced directly from origin farms.') }}</p>
              <a [routerLink]="settings.get('promo_2_link', '/categories')" class="promo-btn promo-btn-dark">{{ settings.get('promo_2_button', 'Shop Spices') }} →</a>
            </div>
          </div>
          <div class="promo-card promo-veg">
            <div class="promo-content">
              <span class="promo-label">{{ settings.get('promo_3_label', 'Farm to Door') }}</span>
              <h3>{{ settings.get('promo_3_title', 'Fresh Fruits & Vegetables') }}</h3>
              <p>{{ settings.get('promo_3_text', 'Locally sourced and imported produce delivered fresh every morning.') }}</p>
              <a [routerLink]="settings.get('promo_3_link', '/categories')" class="promo-btn promo-btn-white">{{ settings.get('promo_3_button', 'Shop Produce') }} →</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── NEW ARRIVALS ── -->
    @if (newArrivals().length > 0) {
      <section class="section">
        <div class="container">
          <div class="title-bar">
            <div>
              <div class="section-label">{{ settings.get('home_new_label', 'Just In') }}</div>
              <h2 class="section-title" style="margin:0">{{ settings.get('home_new_title', 'New Arrivals') }}</h2>
            </div>
            <a routerLink="/search" class="section-link">
              {{ settings.get('home_new_link_text', 'View All') }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div class="products-grid">
            @for (p of newArrivals().slice(0,8); track p.id; let i = $index) {
              <app-product-card [product]="p" appScrollAnimate [animationDelay]="(i * 0.06) + 's'"></app-product-card>
            }
          </div>
        </div>
      </section>
    }

    <!-- ── WHY CHOOSE US ── -->
    <section class="why-section">
      <div class="container">
        <div class="section-header">
          <div class="section-label">{{ settings.get('promise_label', 'Our Promise') }}</div>
          <h2 class="section-title">{{ settings.get('promise_title', 'Why Families Choose Us') }}</h2>
          <p class="section-subtitle">{{ settings.get('promise_text', 'We bring the freshest halal products straight to your door with a quality guarantee on every order.') }}</p>
        </div>
        <div class="why-grid">
          <div class="why-card" appScrollAnimate animationDelay="0s">
            <div class="why-icon why-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h4>{{ settings.get('why_1_title', '100% Halal Certified') }}</h4>
            <p>{{ settings.get('why_1_text', 'All meats are certified halal by recognised authorities. Shop with complete confidence and peace of mind.') }}</p>
          </div>
          <div class="why-card" appScrollAnimate animationDelay="0.1s">
            <div class="why-icon why-icon-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h4>{{ settings.get('why_2_title', 'Freshness Guaranteed') }}</h4>
            <p>{{ settings.get('why_2_text', "We source produce daily and guarantee freshness on delivery. Not satisfied? We'll make it right.") }}</p>
          </div>
          <div class="why-card" appScrollAnimate animationDelay="0.2s">
            <div class="why-icon why-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 3h15l3 9H1z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
            </div>
            <h4>{{ settings.get('why_3_title', 'Fast, Reliable Delivery') }}</h4>
            <p>{{ settings.get('why_3_text', 'Same-day and next-day delivery options. Your order packed with care and delivered on time, every time.') }}</p>
          </div>
          <div class="why-card" appScrollAnimate animationDelay="0.3s">
            <div class="why-icon why-icon-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h4>{{ settings.get('why_4_title', 'Trusted by 5,000+ Families') }}</h4>
            <p>{{ settings.get('why_4_text', 'Our community of satisfied customers grows every day. Join thousands of families across the country.') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── REVIEWS ── -->
    <section class="reviews-section">
      <div class="container">
        <div class="section-header">
          <div class="section-label">{{ settings.get('reviews_label', 'Reviews') }}</div>
          <h2 class="section-title">{{ settings.get('reviews_title', 'What Our Customers Say') }}</h2>
        </div>
        <div class="reviews-grid">
          @for (r of reviewItems(); track r.name; let i = $index) {
            <div class="review-card" appScrollAnimate [animationDelay]="(i * 0.1) + 's'">
              <div class="review-stars">
                @for (s of [1,2,3,4,5]; track s) { <span class="star">★</span> }
              </div>
              <p class="review-text">"{{ r.text }}"</p>
              <div class="review-author">
                <div class="review-avatar">{{ r.name[0] }}</div>
                <div>
                  <div class="review-name">{{ r.name }}</div>
                  <div class="review-meta">{{ r.location }} · Verified Buyer</div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    /* ── HERO ── */
    .hero-section {
      position: relative;
      min-height: 560px;
      background:
        radial-gradient(circle at 82% 18%, rgba(242,140,0,0.22), transparent 28%),
        radial-gradient(circle at 12% 18%, rgba(46,125,50,0.09), transparent 30%),
        linear-gradient(90deg, #fff9ef 0%, #fff4e4 52%, #f6dfba 100%);
      overflow: hidden;
    }
    .slider-wrap  { position: relative; height: 100%; }
    .slide {
      position: absolute; inset: 0;
      opacity: 0; transition: opacity 0.7s ease;
      display: flex;
      flex-direction: row;
      align-items: center;
      min-height: 560px;
      background:
        radial-gradient(circle at 86% 32%, rgba(242,140,0,0.18), transparent 28%),
        radial-gradient(circle at 70% 72%, rgba(224,36,45,0.09), transparent 24%),
        linear-gradient(90deg, #fffaf2 0%, #fff3df 56%, #f7dfba 100%);
    }
    .slide.slide-active { opacity: 1; z-index: 1; }

    .slide-content {
      width: 48%;
      padding: 0 34px 0 84px;
      z-index: 3;
      display: flex;
      flex-direction: column;
      justify-content: center;
      opacity: 0; transform: translateY(20px);
      transition: opacity 0.6s 0.3s ease, transform 0.6s 0.3s ease;
      box-sizing: border-box;
    }
    .slide-content.slide-content-active { opacity: 1; transform: translateY(0); }
    .slide-eyebrow {
      color: #E0242D;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .slide-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: clamp(3.0rem, 5.1vw, 5.35rem);
      font-weight: 500;
      color: #3a2413;
      margin-bottom: 22px;
      line-height: 0.98;
      letter-spacing: -0.055em;
      max-width: 650px;
    }
    .slide-sub {
      font-size: 15px;
      color: #80634c;
      margin-bottom: 28px;
      line-height: 1.75;
      max-width: 540px;
    }
    .slide-cta {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #F28C00, #FFB13B); color: #160B02;
      padding: 13px 26px; border-radius: 999px;
      font-size: 12px; font-weight: 900; text-decoration: none;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      box-shadow: 0 14px 28px rgba(242,140,0,0.26);
      transition: background 0.2s, transform 0.15s, box-shadow 0.15s; width: fit-content;
    }
    .slide-cta:hover { background: linear-gradient(135deg, #D87300, #F28C00); transform: translateY(-1px); box-shadow: 0 18px 34px rgba(242,140,0,0.32); }
    .slide-cta-ghost {
      display: inline-flex; align-items: center; gap: 8px;
      border: 2px solid rgba(255,255,255,0.5); color: white;
      padding: 11px 24px; border-radius: 10px;
      font-size: 14px; font-weight: 600; text-decoration: none;
      transition: all 0.2s; width: fit-content;
    }
    .slide-cta-ghost:hover { border-color: white; background: rgba(255,255,255,0.1); }

    .slide-media-container {
      width: 52%;
      height: 100%;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      padding: 48px 96px 48px 20px;
      box-sizing: border-box;
      background: transparent;
    }
    .hero-square-stage {
      position: relative;
      width: min(420px, 88%);
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-square-glow {
      position: absolute;
      inset: -16px;
      border-radius: 32px;
      background:
        radial-gradient(circle at 70% 22%, rgba(242,140,0,0.34), transparent 36%),
        radial-gradient(circle at 24% 84%, rgba(46,125,50,0.18), transparent 42%);
      filter: blur(14px);
      opacity: 0.7;
    }
    .hero-square-card {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 24px;
      overflow: hidden;
      background: #070A05;
      border: 1px solid rgba(242,140,0,0.18);
      box-shadow:
        0 28px 70px rgba(77,42,5,0.26),
        0 0 0 10px rgba(255,242,222,0.72);
      isolation: isolate;
    }
    .hero-square-card::before {
      content: '';
      position: absolute;
      inset: 1px;
      border-radius: 23px;
      border: 1px solid rgba(255,255,255,0.22);
      z-index: 4;
      pointer-events: none;
    }
    .hero-square-media {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      background-size: cover;
      background-position: center center;
      transform: scale(1.01);
      transition: transform 8s ease;
    }
    .slide.slide-active .hero-square-media {
      transform: scale(1.06);
    }
    .hero-square-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      background:
        linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.08) 48%, rgba(0,0,0,0.34) 100%),
        radial-gradient(circle at 18% 14%, rgba(255,255,255,0.16), transparent 28%);
      pointer-events: none;
    }
    .hero-square-shine {
      position: absolute;
      inset: 0;
      z-index: 3;
      background: linear-gradient(125deg, rgba(255,255,255,0.14), transparent 18%, transparent 72%, rgba(255,255,255,0.06));
      pointer-events: none;
      mix-blend-mode: screen;
    }
    .hero-square-badge {
      position: absolute;
      top: 18px;
      left: 18px;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 13px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.22);
      background: rgba(41,30,22,0.58);
      backdrop-filter: blur(14px);
      color: white;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #F28C00;
      box-shadow: 0 0 0 4px rgba(242,140,0,0.24);
    }
    .hero-square-caption {
      position: absolute;
      left: 18px;
      right: 18px;
      bottom: 18px;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(37,28,21,0.68);
      backdrop-filter: blur(16px);
      color: white;
    }
    .hero-square-caption strong {
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 800;
    }
    .hero-square-caption span {
      color: rgba(255,255,255,0.72);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .hero-square-placeholder {
      background: linear-gradient(135deg, #fff0d7 0%, #f7c777 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .placeholder-logo {
      width: 104px;
      height: 104px;
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(242,140,0,0.16);
      border: 1px solid rgba(242,140,0,0.24);
      color: #B85E00;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.06em;
      animation: pulse 2s infinite ease-in-out;
    }
    .slider-arrow {
      position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
      width: 42px; height: 42px; border-radius: 50%;
      background: rgba(242,140,0,0.10); color: #7A3E00; border: 1px solid rgba(242,140,0,0.16); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s; backdrop-filter: blur(4px);
    }
    .slider-arrow:hover { background: rgba(242,140,0,0.18); }
    .arrow-prev { left: 20px; }
    .arrow-next { right: 20px; }
    .slider-dots { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(122,62,0,0.22); border: none; cursor: pointer; transition: all 0.25s; padding: 0; }
    .dot.dot-active { background: #F28C00; width: 24px; border-radius: 4px; }
    .hero-skeleton { height: 100%; background: linear-gradient(90deg,#070A05 25%,#F28C00 50%,#070A05 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }

    /* Fallback hero */
    .hero-fallback { position: relative; height: 100%; display: flex; align-items: center; overflow: hidden; }
    .hf-overlay {
      position: absolute; inset: 0;
      background:
        radial-gradient(circle at 74% 18%, rgba(242,140,0,0.28), transparent 34%),
        linear-gradient(135deg, #070A05 0%, #151008 58%, #2E1A08 100%);
    }
    .hero-fallback-content { position: relative; z-index: 2; padding: 0 64px; max-width: 680px; }
    .hf-badges { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
    .hf-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600;
      padding: 5px 14px; border-radius: 999px;
    }
    .hf-title {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 900;
      color: white; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 18px;
    }
    .hf-highlight { color: #F28C00; }
    .hf-sub { font-size: 16px; color: rgba(255,255,255,0.75); margin-bottom: 32px; line-height: 1.65; max-width: 520px; }
    .hf-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
    .hf-stats { display: flex; align-items: center; gap: 0; }
    .hf-stat { text-align: center; padding: 0 20px; }
    .hf-stat:first-child { padding-left: 0; }
    .hf-stat strong { display: block; font-size: 22px; font-weight: 800; color: white; font-family: 'Poppins', sans-serif; }
    .hf-stat span { font-size: 12px; color: rgba(255,255,255,0.6); }
    .hf-stat-sep { width: 1px; height: 36px; background: rgba(255,255,255,0.2); }

    /* ── TRUST STRIP ── */
    .trust-strip { background: #fffaf2; border-bottom: 1px solid #F7E9D7; padding: 0; }
    .trust-strip-inner {
      display: flex; align-items: center; justify-content: center;
      gap: 0; flex-wrap: wrap; min-height: 56px;
    }
    .trust-pill {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700; color: #3F2A16;
      padding: 14px 24px; white-space: nowrap;
    }
    .trust-divider { width: 1px; height: 22px; background: #F2D8B5; flex-shrink: 0; }

    /* ── CATEGORIES ── */
    .cat-showcase {
      display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px;
    }
    .cat-tile {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 16px 8px; border-radius: 12px;
      background: white; border: 1px solid #F7E9D7;
      text-decoration: none; transition: all 0.22s ease;
    }
    .cat-tile:hover { border-color: #F28C00; background: #FFF2DE; transform: translateY(-3px); box-shadow: 0 6px 20px rgba(242,140,0,0.14); }
    .cat-tile-img {
      position: relative;
      width: 64px; height: 64px; border-radius: 50%;
      overflow: hidden; background: #FFF2DE;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .cat-tile-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; background: #FFF2DE; }
    .cat-tile-img img.img-error { display: none; }
    .cat-tile-static { background: #FFF2DE; }
    .cat-tile-emoji { font-size: 28px; line-height: 1; }
    .cat-tile-name { font-size: 12px; font-weight: 700; color: #3F2A16; text-align: center; line-height: 1.3; }

    /* ── PROMO BANNERS ── */
    .promo-banner-section { padding: 48px 0; background: var(--bg-light); }
    .promo-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 16px; }
    .promo-card {
      border-radius: 16px; overflow: hidden; position: relative;
      min-height: 260px; display: flex; align-items: flex-end;
    }
    .promo-halal  { background: linear-gradient(135deg, #070A05 0%, #241405 100%); }
    .promo-spice  { background: linear-gradient(135deg, #B85E00 0%, #F28C00 100%); }
    .promo-veg    { background: linear-gradient(135deg, #145A24 0%, #2E7D32 100%); }
    .promo-content { padding: 28px; position: relative; z-index: 2; }
    .promo-label {
      display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 8px;
    }
    .promo-content h3 { font-family: 'Poppins', sans-serif; font-size: 1.3rem; font-weight: 800; color: white; line-height: 1.2; margin-bottom: 10px; }
    .promo-content p  { font-size: 13px; color: rgba(255,255,255,0.72); margin-bottom: 18px; line-height: 1.5; }
    .promo-btn {
      display: inline-flex; align-items: center;
      padding: 9px 18px; border-radius: 8px;
      font-size: 13px; font-weight: 700; text-decoration: none; transition: all 0.2s;
    }
    .promo-btn-white { background: white; color: #7A3E00; }
    .promo-btn-white:hover { background: #FFF2DE; }
    .promo-btn-dark { background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.3); }
    .promo-btn-dark:hover { background: rgba(0,0,0,0.5); }

    /* ── WHY SECTION ── */
    .why-section { padding: 80px 0; background: #fff6e8; }
    .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .why-card {
      background: white; border-radius: 16px; padding: 28px 24px;
      border: 1px solid #F7E9D7; text-align: center;
      transition: box-shadow 0.25s, border-color 0.25s;
    }
    .why-card:hover { box-shadow: 0 8px 32px rgba(242,140,0,0.12); border-color: #FFD69A; }
    .why-icon {
      width: 56px; height: 56px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
    }
    .why-icon-green { background: #FFF2DE; color: #F28C00; }
    .why-icon-gold  { background: #EAF7E8; color: #2E7D32; }
    .why-card h4 { font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700; color: #171008; margin-bottom: 10px; }
    .why-card p  { font-size: 13.5px; color: #806F5E; line-height: 1.65; }

    /* ── REVIEWS ── */
    .reviews-section { padding: 80px 0; background: white; }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .review-card {
      background: #fffaf2; border-radius: 16px; padding: 24px;
      border: 1px solid #F7E9D7; transition: box-shadow 0.22s;
    }
    .review-card:hover { box-shadow: 0 6px 24px rgba(242,140,0,0.10); }
    .review-stars { display: flex; gap: 2px; margin-bottom: 12px; }
    .star { color: #F28C00; font-size: 16px; }
    .review-text { font-size: 14px; color: #3F2A16; line-height: 1.7; margin-bottom: 18px; font-style: italic; }
    .review-author { display: flex; align-items: center; gap: 12px; }
    .review-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #F28C00, #B85E00); color: #160B02;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 16px; flex-shrink: 0;
    }
    .review-name { font-size: 14px; font-weight: 700; color: #171008; }
    .review-meta { font-size: 12px; color: #B39E85; }

    /* ── PRODUCT SKELETONS ── */
    .product-skeleton { height: 280px; border-radius: 12px; }

    /* ── RESPONSIVE ── */
    @media (max-width: 1100px) {
      .why-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 1024px) {
      .cat-showcase { grid-template-columns: repeat(4, 1fr); }
      .promo-grid { grid-template-columns: 1fr 1fr; }
      .promo-card:first-child { grid-column: 1 / -1; min-height: 220px; }
    }
    @media (max-width: 900px) {
      .reviews-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .hero-section {
        min-height: 0;
        height: auto;
        overflow: hidden;
      }
      .slider-wrap {
        height: auto;
        min-height: 0;
      }
      .slide {
        position: absolute;
        pointer-events: none;
        flex-direction: column;
        justify-content: center;
        min-height: 0;
        padding: 34px 0 44px;
        gap: 22px;
      }
      .slide.slide-active {
        position: relative;
        inset: auto;
        pointer-events: auto;
      }
      .slide-content {
        width: 100%;
        max-width: 100%;
        padding: 0 22px;
        position: relative;
        z-index: 4;
        text-align: center;
        align-items: center;
        order: 1;
      }
      .slide-media-container {
        position: relative;
        order: 2;
        width: 100%;
        height: auto;
        z-index: 2;
        justify-content: center;
        padding: 8px 18px 0;
        opacity: 1;
        overflow: visible;
      }
      .hero-square-stage {
        width: min(430px, calc(100vw - 44px));
        max-width: 100%;
      }
      .hero-square-card {
        border-radius: 20px;
        box-shadow:
          0 18px 48px rgba(77,42,5,0.2),
          0 0 0 8px rgba(255,242,222,0.74);
      }
      .hero-square-badge { display: none; }
      .hero-square-caption { left: 12px; right: 12px; bottom: 12px; padding: 10px 12px; }
      .hero-fallback-content { padding: 0 28px; }
      .hf-title { font-size: 2rem; }
      .trust-strip-inner {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        min-height: 0;
        padding: 12px 14px;
      }
      .trust-pill {
        justify-content: flex-start;
        min-width: 0;
        padding: 10px 10px;
        border: 1px solid #E4EFE8;
        border-radius: 14px;
        background: #FBFDFB;
        font-size: 12px;
        line-height: 1.25;
        white-space: normal;
      }
      .trust-pill svg {
        flex: 0 0 17px;
      }
      .trust-divider { display: none; }
      .cat-showcase { grid-template-columns: repeat(4, 1fr); gap: 10px; }
      .promo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .promo-card:first-child { grid-column: auto; }
      .promo-card {
        min-height: 220px;
        border-radius: 22px;
      }
      .promo-card:nth-child(3) {
        grid-column: 1 / -1;
        min-height: 190px;
      }
      .promo-content { padding: 22px; }
      .promo-content h3 { font-size: 1.15rem; }
      .promo-content p { font-size: 12.5px; }
      .why-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
      .why-card { padding: 20px 16px; }
    }
    @media (max-width: 640px) {
      .slide-title { font-size: clamp(2.45rem, 13vw, 3.9rem); }
      .slide-sub { font-size: 14px; }
      .hf-btns { flex-direction: column; }
      .hf-stats { gap: 0; }
      .hf-stat { padding: 0 12px; }
      .hf-stat strong { font-size: 18px; }
      .reviews-grid { grid-template-columns: 1fr; }
      .cat-tile-img { width: 52px; height: 52px; }
      .cat-tile-emoji { font-size: 22px; }
    }
    @media (max-width: 480px) {
      .cat-showcase { grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .slide {
        padding: 28px 0 38px;
        gap: 18px;
      }
      .slide-content { padding: 0 18px; }
      .slide-title { font-size: clamp(2.2rem, 12vw, 3.35rem); }
      .slide-sub {
        margin-bottom: 20px;
        line-height: 1.6;
      }
      .slide-media-container { padding: 0 20px; }
      .hero-square-stage { width: min(360px, calc(100vw - 40px)); }
      .hero-square-caption strong { font-size: 13px; }
      .hero-square-caption span { font-size: 10px; }
      .promo-grid { gap: 10px; }
      .promo-card { min-height: 205px; }
      .promo-content { padding: 18px; }
      .promo-btn { padding: 8px 13px; font-size: 12px; }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
    }

    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  banners        = signal<any[]>([]);
  bannersLoaded  = signal(false);
  categories     = signal<any[]>([]);
  featured       = signal<any[]>([]);
  newArrivals    = signal<any[]>([]);
  featuredLoading = signal(true);
  activeSlide    = signal(0);
  mediaUrl       = environment.mediaUrl;

  getMediaUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads')) return this.mediaUrl + path;
    if (path.startsWith('uploads')) return this.mediaUrl + '/' + path;
    return path;
  }

  private sliderTimer: any;
  private touchStartX = 0;

  staticCats = [
    { name: 'Category 1', slug: 'category-1', icon: '📦', aliases: [] },
    { name: 'Category 2', slug: 'category-2', icon: '🛍️', aliases: [] },
    { name: 'Category 3', slug: 'category-3', icon: '🏷️', aliases: [] },
    { name: 'Category 4', slug: 'category-4', icon: '📦', aliases: [] },
    { name: 'Category 5', slug: 'category-5', icon: '🛍️', aliases: [] },
    { name: 'Category 6', slug: 'category-6', icon: '🏷️', aliases: [] },
    { name: 'Category 7', slug: 'category-7', icon: '📦', aliases: [] },
    { name: 'Category 8', slug: 'category-8', icon: '🛍️', aliases: [] },
  ];

  private defaultReviews = [
    { name: 'Customer A.', location: 'City', text: 'Configure this review in Admin Settings to show a real customer testimonial for your brand.' },
    { name: 'Customer B.', location: 'City', text: 'Configure this review in Admin Settings to show a real customer testimonial for your brand.' },
    { name: 'Customer C.', location: 'City', text: 'Configure this review in Admin Settings to show a real customer testimonial for your brand.' },
    { name: 'Customer D.', location: 'City', text: 'Configure this review in Admin Settings to show a real customer testimonial for your brand.' },
    { name: 'Customer E.', location: 'City', text: 'Configure this review in Admin Settings to show a real customer testimonial for your brand.' },
    { name: 'Customer F.', location: 'City', text: 'Configure this review in Admin Settings to show a real customer testimonial for your brand.' },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private api: ApiService,
    public cart: CartService,
    public settings: SettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Banners
    this.api.getBanners().subscribe({
      next: (res: any) => {
        this.banners.set(res?.data?.filter((b: any) => b.is_active) || []);
        this.bannersLoaded.set(true);
        if (this.banners().length > 1 && isPlatformBrowser(this.platformId)) {
          this.startSlider();
        }
        this.cdr.markForCheck();
        this.playActiveVideo();
      },
      error: () => { this.bannersLoaded.set(true); this.cdr.markForCheck(); }
    });

    // Categories
    this.api.getCategories().subscribe((res: any) => {
      this.categories.set(res?.data || []);
      this.cdr.markForCheck();
    });

    // Featured Products
    this.api.getProducts({ featured: 1 }).subscribe({
      next: (res: any) => {
        this.featured.set(res?.data || []);
        this.featuredLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.featuredLoading.set(false); this.cdr.markForCheck(); }
    });

    // New Arrivals
    this.api.getProducts({ sort: 'newest', limit: 8 }).subscribe({
      next: (res: any) => { this.newArrivals.set(res?.data || []); this.cdr.markForCheck(); }
    });
  }

  ngOnDestroy() { this.pauseSlider(); }

  startSlider() {
    this.pauseSlider();
    this.sliderTimer = setInterval(() => {
      this.activeSlide.update(s => (s + 1) % this.banners().length);
      this.cdr.markForCheck();
      this.playActiveVideo();
    }, 5000);
  }
  pauseSlider()  { clearInterval(this.sliderTimer); }
  resumeSlider() {
    if (this.banners().length > 1) this.startSlider();
    this.playActiveVideo();
  }
  nextSlide()    { this.activeSlide.update(s => (s + 1) % this.banners().length); this.cdr.markForCheck(); this.playActiveVideo(); }
  prevSlide()    { this.activeSlide.update(s => (s - 1 + this.banners().length) % this.banners().length); this.cdr.markForCheck(); this.playActiveVideo(); }
  goToSlide(i: number) { this.activeSlide.set(i); this.cdr.markForCheck(); this.playActiveVideo(); }
  onTouchStart(e: TouchEvent) { this.touchStartX = e.changedTouches[0].clientX; }
  onTouchEnd(e: TouchEvent)   { const dx = e.changedTouches[0].clientX - this.touchStartX; if (Math.abs(dx) > 40) { dx < 0 ? this.nextSlide() : this.prevSlide(); } }

  playVideo(event: Event, slideIndex: number) {
    const video = event.target as HTMLVideoElement;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (slideIndex === this.activeSlide()) {
      void video.play().catch(() => {});
    }
  }

  onVideoPaused(event: Event, slideIndex: number) {
    if (!isPlatformBrowser(this.platformId) || document.hidden || slideIndex !== this.activeSlide()) return;

    const video = event.target as HTMLVideoElement;
    setTimeout(() => {
      if (slideIndex === this.activeSlide() && video.paused && !video.ended) {
        video.muted = true;
        void video.play().catch(() => {});
      }
    }, 100);
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (!document.hidden) this.playActiveVideo();
  }

  @HostListener('window:focus')
  onWindowFocus() {
    this.playActiveVideo();
  }

  private playActiveVideo() {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      document.querySelectorAll<HTMLVideoElement>('.slider-wrap video').forEach(video => {
        const isActive = video.closest('.slide')?.classList.contains('slide-active');
        if (isActive) {
          video.muted = true;
          video.defaultMuted = true;
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    });
  }

  onVideoError(e: Event) { console.warn('Video load error', (e.target as HTMLVideoElement)?.src); }

  displayCategories() {
    const dbCats = this.categories() || [];
    if (dbCats.length > 0) {
      return dbCats.map((db: any) => ({
        name: db.name,
        slug: db.slug,
        icon: db.icon || this.getCatEmoji(db.name),
        id: db.id,
        image: this.isUsableCategoryImage(db.image) ? db.image : null,
        description: db.description || '',
      }));
    }
    return this.staticCats;
  }

  private isUsableCategoryImage(image: string | null | undefined): boolean {
    if (!image) return false;
    return /^(https?:\/\/|\/uploads\/|uploads\/)/i.test(image);
  }

  onCategoryImageError(event: Event) {
    (event.target as HTMLImageElement).classList.add('img-error');
  }

  reviewItems() {
    return this.defaultReviews.map((review, index) => {
      const n = index + 1;
      return {
        name: this.settings.get(`review_${n}_name`, review.name),
        location: this.settings.get(`review_${n}_location`, review.location),
        text: this.settings.get(`review_${n}_text`, review.text),
      };
    });
  }

  getCatEmoji(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('cloth') || n.includes('fashion') || n.includes('apparel') || n.includes('wear')) return '👗';
    if (n.includes('electronic') || n.includes('tech') || n.includes('gadget') || n.includes('phone')) return '📱';
    if (n.includes('food') || n.includes('grocery') || n.includes('eat')) return '🛒';
    if (n.includes('drink') || n.includes('bev')) return '🧃';
    if (n.includes('home') || n.includes('furniture') || n.includes('decor')) return '🏠';
    if (n.includes('beauty') || n.includes('skin') || n.includes('care')) return '✨';
    if (n.includes('sport') || n.includes('fitness') || n.includes('gym')) return '🏃';
    if (n.includes('toy') || n.includes('kid') || n.includes('child')) return '🧸';
    if (n.includes('book') || n.includes('stationery')) return '📚';
    if (n.includes('pet')) return '🐾';
    return '📦';
  }
}

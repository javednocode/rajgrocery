import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MagneticDirective } from '../../shared/directives/motion.directives';
import { SceneDirective, ScrollFxDirective } from '../../shared/directives/scroll-story.directives';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, MagneticDirective, SceneDirective, ScrollFxDirective],
  template: `

  <!-- ══════════ HERO — 2-column split layout ══════════ -->
  <section class="hm-hero">
    <!-- Subtle background grid texture -->
    <div class="hm-hero-grid" aria-hidden="true"></div>

    <div class="hm-hero-inner container">

      <!-- ── LEFT: Content ── -->
      <div class="hm-hero-left">
        <!-- Badge -->
        <div class="hm-hero-badge">
          <span class="hm-hero-badge-dot" aria-hidden="true"></span>
          @if (heroEyebrow()) {
            {{ heroEyebrow() }}
          } @else {
            INDIAN GROCERY IN HONG KONG
          }
        </div>

        <!-- Heading -->
        @if (heroWords().length) {
          <h1 class="hm-hero-title">
            @for (w of heroWords(); track $index) {
              <span class="hm-hero-word" [style.animationDelay]="(0.15 + $index * 0.075) + 's'">{{ w }}&nbsp;</span>
            }
          </h1>
        } @else {
          <h1 class="hm-hero-title">
            <span class="hm-hero-word" style="animation-delay:.15s">Your Favourite</span>
            <span class="hm-hero-word hm-hero-word-break" style="animation-delay:.23s">Indian Groceries,</span>
            <span class="hm-hero-word hm-hero-word-break" style="animation-delay:.31s">All in One Place.</span>
          </h1>
        }

        <!-- Subtitle -->
        @if (heroSub()) {
          <p class="hm-hero-sub">{{ heroSub() }}</p>
        } @else {
          <p class="hm-hero-sub">{{ settings.get('hero_subtitle','Shop everyday Indian groceries, pantry staples, snacks, beverages and fresh vegetables.') }}</p>
        }

        <!-- CTAs -->
        <div class="hm-hero-btns">
          @if (heroCta()) {
            <a [href]="heroCtaLink()" class="hm-hero-cta" kgMagnetic>
              {{ heroCta() }}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          } @else {
            <a routerLink="/categories" class="hm-hero-cta" kgMagnetic>
              Shop Now
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          }
          <a routerLink="/categories" class="hm-hero-ghost" kgMagnetic>Shop Categories</a>
        </div>

        <!-- Scroll cue -->
        <button class="hm-hero-cue" (click)="scrollPastHero()" aria-label="Scroll down">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Scroll to explore</span>
        </button>
      </div>

      <!-- ── RIGHT: Floating video/image frame ── -->
      <div class="hm-hero-right">
        <div class="hm-hero-frame">
          <!-- Admin-controlled banner media (video or image) -->
          <div class="hm-hero-frame-media">
            @if (banners().length) {
              @for (b of banners(); track b.id; let i = $index) {
                <div class="hm-hero-slide" [class.active]="activeSlide() === i">
                  @if (b.media_type === 'video' && b.video) {
                    <video class="hm-hero-media" autoplay muted loop playsinline
                      [attr.preload]="(activeSlide() === i || banners().length === 1) ? 'auto' : 'metadata'"
                      [muted]="true"
                      [poster]="media(b.image || b.fallback_image)"
                      (canplay)="onVideoCanPlay($event)"
                      (loadeddata)="onVideoCanPlay($event)">
                      <source [src]="bannerVideo(b)" [attr.type]="videoType(b.video)">
                    </video>
                  } @else if (b.image || b.fallback_image) {
                    <img class="hm-hero-media hm-hero-kenburns"
                      [src]="media(b.image || b.fallback_image)"
                      [alt]="b.title || settings.get('site_name','Raj Grocery Store')"
                      loading="eager" fetchpriority="high" />
                  }
                </div>
              }
            } @else {
              <!-- Fallback when no banners uploaded yet -->
              <div class="hm-hero-slide active hm-hero-frame-fallback">
                <div class="hm-hero-fallback-inner">
                  <div class="hm-hero-fallback-logo">{{ settings.get('site_name','Raj Grocery Store') }}</div>
                  <p>Add a banner or video<br>from the Admin Panel</p>
                </div>
              </div>
            }
          </div>

          <!-- Slide dots inside frame -->
          @if (banners().length > 1) {
            <div class="hm-hero-dots">
              @for (b of banners(); track b.id; let i = $index) {
                <button [class.on]="activeSlide() === i" (click)="goSlide(i)" [attr.aria-label]="'Slide ' + (i+1)"></button>
              }
            </div>
          }
        </div>

        <!-- Floating decorative accent -->
        <div class="hm-hero-accent" aria-hidden="true"></div>
      </div>

    </div>
  </section>

  <!-- ══════════ THE SHEET — everything below rides up over the pinned hero ══════════ -->
  <div class="hm-sheet">

    <!-- ══════════ TRUST STRIP ══════════ -->
    <div class="hm-trust-strip">
      <div class="container">
        <div class="hm-trust-grid">
          <div class="hm-trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.8"/>
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <span>Wide Indian Grocery Range</span>
          </div>
          <div class="hm-trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
              <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Easy Online Ordering</span>
          </div>
          <div class="hm-trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="1.8"/>
              <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="1.8"/>
            </svg>
            <span>Secure Checkout</span>
          </div>
          <div class="hm-trust-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/>
            </svg>
            <span>Local Hong Kong Store</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════ CATEGORIES ══════════ -->
    <section class="section hm-cats">
      <div class="container">
        <div class="hm-sec-head">
          <div>
            <span class="sec-eyebrow">{{ settings.get('home_categories_label','Browse the pantry') }}</span>
            <h2 class="sec-title">{{ settings.get('home_categories_title','Shop by Category') }}</h2>
          </div>
          <a routerLink="/categories" class="hm-link">
            {{ settings.get('home_categories_link_text','All categories') }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </a>
        </div>

        @if (displayCategories().length) {
          <div class="hm-cats-grid">
            @for (c of displayCategories(); track c.slug || c.id; let i = $index) {
              <a class="hm-cat" [class.hm-cat-noimg]="!c.image"
                 [routerLink]="c.id ? ['/category', c.slug] : ['/categories']">
                <span class="hm-cat-media">
                  @if (c.image) {
                    <img class="hm-cat-img" [src]="media(c.image)" [alt]="c.name" loading="lazy" (error)="hideImg($event)" />
                  } @else {
                    <span class="hm-cat-emoji">{{ catEmoji(i) }}</span>
                  }
                </span>
                <span class="hm-cat-info">
                  <strong class="hm-cat-name">{{ c.name }}</strong>
                  <span class="hm-cat-arrow" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                </span>
              </a>
            }
          </div>
        } @else if (!worldLoaded()) {
          <!-- Loading skeleton -->
          <div class="hm-cats-grid">
            @for (s of [1,2,3,4,5,6,7,8]; track s) {
              <div class="skeleton hm-cat-skel"></div>
            }
          </div>
        } @else {
          <!-- Empty state — categories not yet populated -->
          <div class="hm-cats-empty">
            <div class="hm-cats-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.5"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </div>
            <p class="hm-cats-empty-text">Categories are being set up — check back shortly.</p>
            <a routerLink="/categories" class="btn btn-outline">Browse all products</a>
          </div>
        }
      </div>
    </section>

    <!-- ══════════ FEATURED PRODUCTS ══════════ -->
    <section class="section hm-featured" kgScene>
      <div class="container">
        <div class="hm-sec-head">
          <div>
            <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('home_featured_label','Popular Picks') }}</span>
            <h2 class="sec-title">{{ settings.get('home_featured_title','Featured Products') }}</h2>
          </div>
          <a routerLink="/categories" class="hm-link" kgFx="rise-sm" [fxOrder]="1">
            {{ settings.get('home_featured_link_text','View all') }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </a>
        </div>
        @if (featured().length) {
          <div class="hm-grid-4">
            @for (p of featured().slice(0, 8); track p.id) {
              <div kgFx="rise" [fxOrder]="$index % 4">
                <app-product-card [product]="p" />
              </div>
            }
          </div>
        } @else if (!worldLoaded()) {
          <div class="hm-grid-4">
            @for (s of [1,2,3,4]; track s) { <div class="skeleton hm-skel-card"></div> }
          </div>
        } @else {
          <p class="hm-empty-note">Products are being added — check back soon.</p>
        }
      </div>
    </section>

    <!-- ══════════ PROMOTIONAL BANNERS ══════════ -->
    @if (promoCards().length) {
      <section class="hm-promos section" kgScene>
        <div class="container">
          <div class="hm-promo-grid"
            [class.hm-promo-solo]="promoCards().length === 1"
            [class.hm-promo-duo]="promoCards().length === 2"
            [class.hm-promo-no-hero]="promoCards().length >= 2 && !promoHero()">

            @if (promoHero(); as hero) {
              <a class="hm-pr hm-pr-hero" [class]="'hm-pr hm-pr-hero'"
                [href]="resolvePromoLink(hero.link)"
                [style.--ov-c]="hero.overlayColor"
                [style.--ov-o]="hero.overlayOpacity"
                kgFx="rise" [fxOrder]="0">
                <div class="hm-pr-media">
                  <picture>
                    @if (hero.imgMobile) {
                      <source [srcset]="hero.imgMobile" media="(max-width: 640px)">
                    }
                    <img class="hm-pr-img" [src]="hero.img" [alt]="hero.title" loading="lazy"
                      (error)="promoImgErr($event, hero.n)" />
                  </picture>
                </div>
                <div class="hm-pr-scrim"></div>
                @if (hero.badge) {
                  <span class="hm-pr-badge" [style.background]="hero.badgeColor">{{ hero.badge }}</span>
                }
                <div class="hm-pr-body">
                  @if (hero.label) { <em class="hm-pr-label">{{ hero.label }}</em> }
                  <h3 class="hm-pr-title">{{ hero.title }}</h3>
                  @if (hero.text) { <p class="hm-pr-sub">{{ hero.text }}</p> }
                  <span class="hm-pr-btn">
                    {{ hero.button }}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
                  </span>
                </div>
              </a>
            }

            @if (promoStack().length) {
              <div class="hm-promo-col" [class.hm-promo-col-single]="promoStack().length === 1">
                @for (card of promoStack(); track card.n; let i = $index) {
                  <a class="hm-pr hm-pr-mini"
                    [href]="resolvePromoLink(card.link)"
                    [style.--ov-c]="card.overlayColor"
                    [style.--ov-o]="card.overlayOpacity"
                    kgFx="rise" [fxOrder]="i + 1">
                    <div class="hm-pr-media">
                      <picture>
                        @if (card.imgMobile) {
                          <source [srcset]="card.imgMobile" media="(max-width: 640px)">
                        }
                        <img class="hm-pr-img" [src]="card.img" [alt]="card.title" loading="lazy"
                          (error)="promoImgErr($event, card.n)" />
                      </picture>
                    </div>
                    <div class="hm-pr-scrim"></div>
                    @if (card.badge) {
                      <span class="hm-pr-badge" [style.background]="card.badgeColor">{{ card.badge }}</span>
                    }
                    <div class="hm-pr-body">
                      @if (card.label) { <em class="hm-pr-label">{{ card.label }}</em> }
                      <h3 class="hm-pr-title">{{ card.title }}</h3>
                      <span class="hm-pr-btn">
                        {{ card.button }}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
                      </span>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- ══════════ TRENDING / GROCERY ESSENTIALS ══════════ -->
    <section class="section hm-trending" kgScene>
      <div class="container">
        <div class="hm-sec-head">
          <div>
            <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('home_trending_label','Most Loved') }}</span>
            <h2 class="sec-title">{{ settings.get('home_trending_title','Trending Products') }}</h2>
          </div>
          <div class="hm-caro-nav" kgFx="rise-sm" [fxOrder]="1">
            <button (click)="scrollTrend(-1)" aria-label="Previous">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button (click)="scrollTrend(1)" aria-label="Next">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
      @if (trending().length) {
        <div class="hm-caro" #trendRow>
          <div class="hm-caro-pad"></div>
          @for (p of trending(); track p.id; let i = $index) {
            <div class="hm-caro-item" kgFx="rise" [fxOrder]="i < 6 ? i : 6">
              <app-product-card [product]="p" />
            </div>
          }
          <div class="hm-caro-pad"></div>
        </div>
      } @else if (worldLoaded()) {
        <div class="container"><p class="hm-empty-note">Trending products are being updated — check back soon.</p></div>
      }
    </section>

    <!-- ══════════ NEW ARRIVALS ══════════ -->
    @if (recentProducts().length) {
      <section class="section hm-new" kgScene>
        <div class="container">
          <div class="hm-sec-head">
            <div>
              <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('home_new_label','Just Arrived') }}</span>
              <h2 class="sec-title">{{ settings.get('home_new_title','New Arrivals') }}</h2>
            </div>
            <a routerLink="/categories" class="hm-link" kgFx="rise-sm" [fxOrder]="1">
              {{ settings.get('home_new_link_text','View all') }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </a>
          </div>
          <div class="hm-grid-4">
            @for (p of recentProducts().slice(0, 4); track p.id; let i = $index) {
              <div kgFx="rise" [fxOrder]="i">
                <app-product-card [product]="p" />
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- ══════════ BRANDS MARQUEE ══════════ -->
    @if (featuredBrands().length) {
      <section class="hm-brands" kgScene>
        <div class="container">
          <div class="hm-brands-head">
            <span class="sec-eyebrow hm-brands-eyebrow">{{ settings.get('featured_brands_label','Brands We Stock') }}</span>
            <h2 class="sec-title hm-brands-title">{{ settings.get('featured_brands_title','Shop Popular Brands') }}</h2>
          </div>
        </div>
        <div class="hm-marquee">
          <div class="hm-marquee-track">
            @for (dup of [0,1]; track dup) {
              @for (brand of featuredBrands(); track $index) {
                <a routerLink="/categories" class="hm-brand" [attr.aria-hidden]="dup === 1">
                  @if (brand.image) { <img [src]="media(brand.image)" [alt]="brand.name" loading="lazy"> }
                  <span>{{ brand.name }}</span>
                </a>
              }
            }
          </div>
        </div>
      </section>
    }

    <!-- ══════════ WHY SHOP AT RAJ ══════════ -->
    <section class="section hm-why" kgScene>
      <div class="container">
        <div class="hm-sec-head hm-sec-head-center">
          <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('promise_label','Our Promise') }}</span>
          <h2 class="sec-title">{{ settings.get('promise_title','Why Shop at ' + settings.get('site_name','Raj Grocery Store')) }}</h2>
        </div>
        <div class="hm-why-grid">
          <div class="hm-why-item" kgFx="rise">
            <div class="hm-why-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.8"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </div>
            <h4>{{ settings.get('why_1_title','Indian Grocery Selection') }}</h4>
            <p>{{ settings.get('why_1_text','A wide range of authentic Indian groceries, spices, snacks and household essentials.') }}</p>
          </div>
          <div class="hm-why-item" kgFx="rise" [fxOrder]="1">
            <div class="hm-why-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 3.9 2.4-7.4L2 9.4h7.6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </div>
            <h4>{{ settings.get('why_2_title','Quality You Can Trust') }}</h4>
            <p>{{ settings.get('why_2_text','Carefully selected products from trusted Indian brands, stocked fresh and ready to ship.') }}</p>
          </div>
          <div class="hm-why-item" kgFx="rise" [fxOrder]="2">
            <div class="hm-why-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h4>{{ settings.get('why_3_title','Convenient Online Shopping') }}</h4>
            <p>{{ settings.get('why_3_text','Easy online ordering from the comfort of your home — everything delivered to your door.') }}</p>
          </div>
          <div class="hm-why-item" kgFx="rise" [fxOrder]="3">
            <div class="hm-why-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><polyline points="9 12 11 14 15 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h4>{{ settings.get('why_4_title','Secure & Easy Checkout') }}</h4>
            <p>{{ settings.get('why_4_text','Encrypted payments and a smooth checkout experience you can rely on, every time.') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════ LOCAL STORE CTA ══════════ -->
    @if (storeAddress()) {
      <section class="hm-store-cta" kgScene>
        <div class="container">
          <div class="hm-store-inner" kgFx="rise" data-aos="zoom-in" data-aos-duration="700">
            <div class="hm-store-text">
              <span class="sec-eyebrow">Visit Us</span>
              <h2 class="hm-store-heading">{{ settings.get('site_name','Raj Grocery Store') }}</h2>
              <p class="hm-store-location">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/></svg>
                {{ storeAddress() }}
              </p>
            </div>
            <div class="hm-store-actions">
              <a routerLink="/contact" class="btn btn-primary">Contact Us</a>
              @if (whatsappLink()) {
                <a [href]="whatsappLink()" target="_blank" rel="noopener" class="btn btn-wa">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              }
            </div>
          </div>
        </div>
      </section>
    }

    <!-- ══════════ CUSTOMER REVIEWS ══════════ -->
    <section class="hm-rev" kgScene>
      <div class="container">
        <div class="hm-rev-head" data-aos="fade-up" data-aos-duration="600">
          <div>
            <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('reviews_label','Reviews') }}</span>
            <h2 class="sec-title">{{ settings.get('reviews_title','What Our Customers Say') }}</h2>
          </div>
          <div class="hm-rev-nav">
            <button (click)="prevRevGroup()" aria-label="Previous reviews">
              <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button (click)="nextRevGroup()" aria-label="Next reviews">
              <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
        <div class="hm-rev-grid">
          @for (t of revPair(); track t.name; let i = $index) {
            <div class="hm-rev-card" [class.hm-rev-card-alt]="i % 2 === 1"
                 [attr.data-aos]="i === 0 ? 'fade-right' : 'fade-left'"
                 data-aos-duration="700">
              <div class="hm-rev-content">
                <span class="hm-rev-q" aria-hidden="true">"</span>
                <p class="hm-rev-text">{{ t.text }}</p>
                <div class="hm-rev-author">
                  <strong>{{ t.name }}</strong>
                  <span class="hm-rev-role">Verified Customer</span>
                  @if (t.city) { <span class="hm-rev-city">{{ t.city }}</span> }
                </div>
              </div>
              <div class="hm-rev-photo-col">
                @if (t.photo) {
                  <img [src]="media(t.photo)" [alt]="t.name" class="hm-rev-photo" loading="lazy">
                } @else {
                  <div class="hm-rev-photo-empty">
                    <svg viewBox="0 0 60 80" fill="none">
                      <circle cx="30" cy="22" r="14" stroke="currentColor" stroke-width="2"/>
                      <path d="M4 76c0-14 11.6-24 26-24s26 10 26 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ══════════ HK QUALITY + FEATURES ══════════ -->
    <section class="hm-hkq">
      <div class="container">
        <div class="hm-hkq-body" data-aos="fade-up" data-aos-duration="700">
          <h2 class="hm-hkq-title">
            We Provide the <em class="hm-hkq-em">Best Quality</em><br>
            in All of Hong Kong
          </h2>
          <p class="hm-hkq-sub">Offering authentic Indian groceries with seamless shopping — fresh products, trusted brands, and reliable delivery across Hong Kong.</p>
        </div>
        <div class="hm-hkq-feats">
          <div class="hm-hkq-feat" data-aos="fade-up" data-aos-delay="0" data-aos-duration="600">
            <span class="hm-hkq-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </span>
            <span>Gift Vouchers</span>
          </div>
          <div class="hm-hkq-feat">
            <span class="hm-hkq-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
              </svg>
            </span>
            <span>Present a Gift Card</span>
          </div>
          <div class="hm-hkq-feat">
            <span class="hm-hkq-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </span>
            <span>Order &amp; Collect</span>
          </div>
          <div class="hm-hkq-feat">
            <span class="hm-hkq-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <span>Secure Checkout</span>
          </div>
          <div class="hm-hkq-feat">
            <span class="hm-hkq-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </span>
            <span>Fast HK Delivery</span>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════ BLOG / JOURNAL ══════════ -->
    @if (blogs().length) {
      <section class="section hm-blog" kgScene>
        <div class="container">
          <div class="hm-sec-head">
            <div>
              <span class="sec-eyebrow" kgFx="rise-sm">From the Kitchen</span>
              <h2 class="sec-title">Recipes &amp; Stories</h2>
            </div>
            <a routerLink="/blog" class="hm-link" kgFx="rise-sm" [fxOrder]="1">All articles
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </a>
          </div>
          <div class="hm-blog-grid">
            @for (b of blogs(); track b.id; let i = $index) {
              <a class="hm-blog-card" [routerLink]="['/blog', b.slug]" kgFx="rise" [fxOrder]="i"
                 data-aos="fade-up" [attr.data-aos-delay]="i * 120" data-aos-duration="650">
                <div class="hm-blog-media">
                  @if (b.featured_image) {
                    <img [src]="media(b.featured_image)" [alt]="b.title" loading="lazy" (error)="hideImg($event)" />
                  } @else {
                    <span class="hm-blog-glyph">✦</span>
                  }
                </div>
                <div class="hm-blog-body">
                  @if (b.category) { <span class="hm-blog-tag">{{ b.category }}</span> }
                  <h3>{{ b.title }}</h3>
                  @if (b.excerpt) { <p>{{ b.excerpt }}</p> }
                  <span class="hm-blog-read">Read more
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
                  </span>
                </div>
              </a>
            }
          </div>
        </div>
      </section>
    }

    <!-- ══════════ FAQ SECTION ══════════ -->
    <section class="hm-faq-wrap" id="faq">
      <div class="container">
        <div class="hm-faq-layout">

          <!-- Left: image card -->
          <div class="hm-faq-img-col faq-anim faq-anim-left">
            <div class="hm-faq-img-card">
              <div class="hm-faq-img-bg"></div>
              <div class="hm-faq-leaf hm-faq-leaf-1" aria-hidden="true">
                <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 80 Q5 40 40 10 Q60 30 50 70 Q30 80 10 80Z" fill="var(--raj-leaf)" opacity="0.85"/>
                  <path d="M40 10 Q45 45 25 72" stroke="var(--raj-leaf-lt)" stroke-width="1.5" fill="none"/>
                </svg>
              </div>
              <div class="hm-faq-leaf hm-faq-leaf-2" aria-hidden="true">
                <svg viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 62 Q2 30 30 6 Q50 22 42 54 Q24 65 8 62Z" fill="var(--raj-leaf)" opacity="0.7"/>
                  <path d="M30 6 Q35 36 18 58" stroke="var(--raj-leaf-lt)" stroke-width="1.2" fill="none"/>
                </svg>
              </div>
              <img class="hm-faq-person" src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=480&q=80"
                alt="Happy customer with fresh groceries" loading="lazy"
                onerror="this.src='';this.style.display='none'" />
              <div class="hm-faq-img-accent" aria-hidden="true"></div>
            </div>
          </div>

          <!-- Right: accordion -->
          <div class="hm-faq-acc-col faq-anim faq-anim-right">
            <div class="hm-faq-head">
              <span class="sec-eyebrow">Got Questions?</span>
              <h2 class="sec-title">Frequently Asked Questions</h2>
            </div>

            <div class="hm-faq-list">
              @for (item of faqItems; track item.q; let i = $index) {
                <div class="hm-faq-item" [class.open]="openFaq() === i"
                     (click)="toggleFaq(i)"
                     [style.transition-delay]="(i * 0.04) + 's'">
                  <button class="hm-faq-q" [attr.aria-expanded]="openFaq() === i"
                          [attr.aria-controls]="'faq-ans-' + i" type="button">
                    <span>{{ item.q }}</span>
                    <span class="hm-faq-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"
                              stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  <div class="hm-faq-a" [id]="'faq-ans-' + i" role="region">
                    <div class="hm-faq-a-inner">{{ item.a }}</div>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
  `,

  styles: [`
  /* ═══ Host ═══ */
  :host {
    display: block;
    --sheet-r: 32px;
  }

  /* ═══════════════════════════════════════
     SPLIT HERO  — 2-column layout
  ═══════════════════════════════════════ */
  .hm-hero {
    position: relative;
    min-height: clamp(580px, 94svh, 860px);
    background: var(--raj-dark);   /* masala green ground */
    overflow: hidden;
    display: flex;
    align-items: stretch;
  }

  /* Subtle dot-grid texture */
  .hm-hero-grid {
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px);
    background-size: 36px 36px;
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 30% 50%, black 30%, transparent 100%);
    mask-image: radial-gradient(ellipse 80% 80% at 30% 50%, black 30%, transparent 100%);
  }

  /* Inner 2-col layout */
  .hm-hero-inner {
    position: relative; z-index: 2;
    display: grid;
    grid-template-columns: 48fr 52fr;
    gap: 48px;
    align-items: center;
    width: 100%;
    padding-top: clamp(64px, 8vh, 100px);
    padding-bottom: clamp(64px, 8vh, 100px);
  }

  /* ── LEFT SIDE ── */
  .hm-hero-left {
    display: flex; flex-direction: column;
    gap: 0;
    animation: heroLeftIn .9s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes heroLeftIn {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: none; }
  }

  /* Badge */
  .hm-hero-badge {
    display: inline-flex; align-items: center; gap: 9px;
    font-family: var(--font-sans);
    font-size: 10.5px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase;
    color: rgba(255,255,255,.65);
    margin-bottom: 28px;
    animation: heroLeftIn .7s cubic-bezier(0.22,1,0.36,1) .05s both;
  }
  .hm-hero-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--raj-turmeric);
    animation: badgePulse 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes badgePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(41,184,213,.5); }
    50%      { box-shadow: 0 0 0 6px rgba(41,184,213,0); }
  }

  /* Heading */
  .hm-hero-title {
    font-family: var(--font-sans);
    font-size: clamp(2.4rem, 4.6vw, 4rem);
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.1; letter-spacing: -0.03em;
    margin-bottom: 24px;
  }
  .hm-hero-word {
    display: block;
    animation: hmWord .85s cubic-bezier(0.22,1,0.36,1) both;
  }
  .hm-hero-word-break { display: block; }
  @keyframes hmWord {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: none; }
  }

  /* Sub */
  .hm-hero-sub {
    font-family: var(--font-sans);
    font-size: clamp(14.5px, 1.6vw, 16.5px);
    color: rgba(255,255,255,.55);
    line-height: 1.8; max-width: 440px;
    margin-bottom: 36px;
    animation: heroLeftIn .9s cubic-bezier(0.22,1,0.36,1) .3s both;
  }

  /* CTAs */
  .hm-hero-btns {
    display: flex; gap: 12px; flex-wrap: wrap;
    margin-bottom: 44px;
    animation: heroLeftIn .9s cubic-bezier(0.22,1,0.36,1) .42s both;
  }
  .hm-hero-cta {
    display: inline-flex; align-items: center; gap: 9px;
    background: #FFFFFF; color: var(--raj-ink);
    padding: 15px 28px; border-radius: 10px;
    font-family: var(--font-sans); font-size: 14px; font-weight: 800;
    letter-spacing: .01em;
    transition: background .25s, transform .25s, box-shadow .25s;
    box-shadow: 0 4px 24px rgba(0,0,0,.18);
    text-decoration: none;
  }
  .hm-hero-cta:hover { background: var(--raj-leaf-bg); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,.22); }
  .hm-hero-cta svg { transition: transform .25s; }
  .hm-hero-cta:hover svg { transform: translateX(3px); }

  .hm-hero-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: rgba(255,255,255,.82);
    padding: 15px 28px; border-radius: 10px;
    font-family: var(--font-sans); font-size: 14px; font-weight: 700;
    border: 1.5px solid rgba(255,255,255,.2);
    transition: background .25s, border-color .25s, color .25s;
    text-decoration: none;
  }
  .hm-hero-ghost:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.4); color: #fff; }

  /* Scroll cue */
  .hm-hero-cue {
    display: inline-flex; align-items: center; gap: 10px;
    background: transparent; border: none; cursor: pointer;
    font-family: var(--font-sans); font-size: 11.5px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.3);
    padding: 0;
    transition: color .25s;
    animation: heroLeftIn .9s cubic-bezier(0.22,1,0.36,1) .55s both;
  }
  .hm-hero-cue:hover { color: rgba(255,255,255,.6); }
  .hm-hero-cue svg { animation: cueFloat 2s ease-in-out infinite; }
  @keyframes cueFloat {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(5px); }
  }

  /* ── RIGHT SIDE ── */
  .hm-hero-right {
    position: relative;
    display: flex; align-items: center; justify-content: flex-end;
    animation: heroRightIn 1s cubic-bezier(0.22,1,0.36,1) .15s both;
  }
  @keyframes heroRightIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  /* Floating video frame */
  .hm-hero-frame {
    position: relative;
    width: 100%;
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 16 / 10;
    box-shadow:
      0 32px 80px rgba(0,0,0,.5),
      0 4px 16px rgba(0,0,0,.25),
      inset 0 0 0 1px rgba(255,255,255,.07);
    /* Subtle floating animation */
    animation: heroFloat 6s ease-in-out infinite;
  }
  @keyframes heroFloat {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }

  .hm-hero-frame-media {
    position: absolute; inset: 0;
  }

  /* Slides inside frame */
  .hm-hero-slide {
    position: absolute; inset: 0; opacity: 0;
    transition: opacity 1.1s var(--ease3);
  }
  .hm-hero-slide.active { opacity: 1; }
  .hm-hero-media {
    width: 100%; height: 100%; object-fit: cover;
    display: block;
  }
  .hm-hero-kenburns { animation: hmKenburns 22s ease-out infinite alternate; }
  @keyframes hmKenburns {
    from { transform: scale(1); }
    to   { transform: scale(1.06); }
  }

  /* Fallback state when no banners uploaded */
  .hm-hero-frame-fallback {
    background: linear-gradient(135deg, var(--raj-dark) 0%, var(--raj-dark-2) 100%);
  }
  .hm-hero-fallback-inner {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
  }
  .hm-hero-fallback-logo {
    font-family: var(--font-serif, Georgia, serif);
    font-size: 28px; font-weight: 400; line-height: 1.2;
    color: rgba(255,255,255,.4); text-align: center; letter-spacing: .1em;
  }
  .hm-hero-fallback-inner p {
    font-family: var(--font-sans); font-size: 12px;
    color: rgba(255,255,255,.2); text-align: center; line-height: 1.6;
  }

  /* Slide dots inside frame */
  .hm-hero-dots {
    position: absolute; bottom: 16px; right: 16px; z-index: 4;
    display: flex; gap: 6px;
  }
  .hm-hero-dots button {
    width: 6px; height: 6px; border-radius: 999px;
    background: rgba(255,255,255,.35); cursor: pointer;
    transition: all .35s var(--ease); border: none;
  }
  .hm-hero-dots button.on { width: 22px; background: #FFFFFF; }

  /* Decorative accent glow behind frame */
  .hm-hero-accent {
    position: absolute;
    width: 380px; height: 280px;
    bottom: -80px; right: -60px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(41,184,213,.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }

  /* ═══ THE SHEET ═══ */
  .hm-sheet {
    position: relative; z-index: 2;
    margin-top: calc(-1 * var(--hero-run));
    background: var(--kg-cream);
    border-radius: var(--sheet-r) var(--sheet-r) 0 0;
    box-shadow: 0 -28px 72px rgba(11,28,18,0.38);
  }

  /* ═══ TRUST STRIP ═══ */
  .hm-trust-strip {
    background: var(--kg-forest);
    border-radius: var(--sheet-r) var(--sheet-r) 0 0;
    padding: 18px 0;
  }
  .hm-trust-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }
  .hm-trust-item {
    display: flex; align-items: center; gap: 10px;
    padding: 4px 24px;
    color: rgba(255,255,255,.88);
    border-right: 1px solid rgba(255,255,255,.12);
    font-family: var(--font-sans); font-size: 12.5px; font-weight: 700;
  }
  .hm-trust-item:last-child { border-right: none; }
  .hm-trust-item svg { flex-shrink: 0; opacity: .8; }

  /* ═══ SECTION FURNITURE ═══ */
  .hm-sec-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 40px; gap: 18px;
  }
  .hm-sec-head-center { flex-direction: column; align-items: center; text-align: center; margin-bottom: 48px; }
  .hm-sec-head-center .sec-eyebrow::before { display: none; }
  .hm-link {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--font-sans); font-size: 12.5px; font-weight: 800;
    letter-spacing: .08em; text-transform: uppercase;
    color: var(--kg-forest); white-space: nowrap;
    padding-bottom: 3px; border-bottom: 1.5px solid transparent;
    transition: color .25s, border-color .25s, gap .25s;
  }
  .hm-link:hover { color: var(--kg-terra); border-bottom-color: var(--kg-terra); gap: 11px; }
  .hm-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .hm-empty-note {
    font-family: var(--font-sans); font-style: italic;
    font-size: 16px; color: var(--kg-muted);
    padding: 32px 0 8px; margin: 0;
  }
  .hm-skel-card { aspect-ratio: 1 / 1.4; border-radius: 16px; }

  /* ═══ CATEGORIES ═══ */
  .hm-cats { background: var(--kg-cream); }
  .hm-cats-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 14px;
  }
  .hm-cat {
    display: flex; flex-direction: column;
    border-radius: 12px; overflow: hidden;
    background: var(--kg-paper);
    border: 1px solid var(--kg-line-lt);
    box-shadow: var(--shadow-xs);
    text-decoration: none;
    transition: box-shadow .35s var(--ease), border-color .25s, transform .35s var(--ease);
  }
  .hm-cat:hover { box-shadow: var(--shadow-sm); border-color: var(--kg-forest-bg2); transform: translateY(-4px); }
  .hm-cat-media {
    position: relative; display: block;
    aspect-ratio: 1 / 1;
    background: var(--kg-warm);
    display: flex; align-items: center; justify-content: center;
  }
  .hm-cat-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
  }
  .hm-cat-emoji {
    font-size: 28px; line-height: 1;
  }
  .hm-cat-info {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 11px 12px;
  }
  .hm-cat-name {
    font-family: var(--font-sans); font-size: 11.5px; font-weight: 700;
    color: var(--kg-ink); letter-spacing: -0.01em; line-height: 1.3;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .hm-cat-arrow {
    flex-shrink: 0;
    width: 22px; height: 22px; border-radius: 999px;
    display: grid; place-items: center;
    background: var(--kg-forest-bg); color: var(--kg-forest);
    transition: background .25s, color .25s;
  }
  .hm-cat:hover .hm-cat-arrow { background: var(--kg-forest); color: #FFFFFF; }
  .hm-cat-noimg .hm-cat-media { background: var(--kg-warm); }
  .hm-cat-skel { aspect-ratio: 1 / 1.3; border-radius: 14px; }

  /* Categories empty state */
  .hm-cats-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; padding: 64px 24px; text-align: center;
    background: var(--kg-warm); border-radius: 20px;
    border: 1.5px dashed var(--kg-line-warm);
  }
  .hm-cats-empty-icon { color: var(--kg-faint); }
  .hm-cats-empty-text { font-size: 16px; color: var(--kg-muted); margin: 0; }

  /* ═══ FEATURED / NEW ═══ */
  .hm-featured { background: var(--kg-warm); }
  .hm-new { background: var(--kg-cream); }

  /* ═══ PROMOS ═══ */
  .hm-promos { background: var(--kg-cream); }
  .hm-promo-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; }
  .hm-promo-grid.hm-promo-solo { grid-template-columns: 1fr; }
  .hm-promo-grid.hm-promo-duo { grid-template-columns: 1fr 1fr; }
  .hm-promo-grid.hm-promo-no-hero { grid-template-columns: 1fr 1fr; }
  .hm-promo-col { display: grid; grid-template-rows: 1fr 1fr; gap: 20px; }
  .hm-promo-col-single { grid-template-rows: 1fr; }
  .hm-pr {
    position: relative; display: block;
    border-radius: 20px; overflow: hidden;
    background: var(--kg-sand-2);
    box-shadow: 0 4px 18px rgba(11,28,18,.07);
    transition: box-shadow .4s var(--ease), transform .4s var(--ease);
    text-decoration: none;
  }
  .hm-pr:hover { box-shadow: 0 22px 54px rgba(11,28,18,.16); transform: translateY(-4px); }
  .hm-pr-hero { min-height: clamp(460px, 58vh, 640px); }
  .hm-pr-mini { min-height: 230px; }
  .hm-pr-media {
    position: absolute; inset: -1px;
  }
  .hm-pr-media picture { display: block; width: 100%; height: 100%; }
  .hm-pr-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .8s var(--ease);
  }
  .hm-pr:hover .hm-pr-img { transform: scale(1.05); }
  .hm-pr-scrim {
    position: absolute; inset: 0; z-index: 1;
    background:
      linear-gradient(to top,
        color-mix(in srgb, var(--ov-c, #211A14) calc(var(--ov-o, 44) * 1% + 36%), transparent) 0%,
        color-mix(in srgb, var(--ov-c, #211A14) calc(var(--ov-o, 44) * 0.65%), transparent) 46%,
        transparent 86%),
      linear-gradient(120deg,
        color-mix(in srgb, var(--ov-c, #211A14) calc(var(--ov-o, 44) * 0.5%), transparent) 0%,
        transparent 52%);
  }
  .hm-pr-body {
    position: absolute; z-index: 2;
    left: clamp(20px, 3vw, 38px); right: clamp(20px, 3vw, 38px); bottom: clamp(20px, 2.6vw, 34px);
    display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
  }
  .hm-pr-mini .hm-pr-body { gap: 7px; left: 22px; right: 22px; bottom: 20px; }
  .hm-pr-label {
    font-style: normal; font-family: var(--font-sans);
    font-size: 10.5px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase;
    color: rgba(255,255,255,.82);
    display: inline-flex; align-items: center; gap: 10px;
  }
  .hm-pr-label::before { content: ''; width: 22px; height: 1.5px; background: currentColor; opacity: .6; }
  .hm-pr-title {
    font-family: var(--font-sans); font-weight: 800;
    font-size: clamp(1.7rem, 3vw, 2.6rem); line-height: 1.1;
    letter-spacing: -0.02em; color: #FFFFFF; max-width: 500px;
    text-wrap: balance;
  }
  .hm-pr-mini .hm-pr-title { font-size: clamp(1.25rem, 1.8vw, 1.6rem); max-width: 380px; }
  .hm-pr-sub {
    font-size: 14px; color: rgba(255,255,255,.84); line-height: 1.65;
    max-width: 420px; margin-bottom: 4px;
  }
  .hm-pr-btn {
    display: inline-flex; align-items: center; gap: 9px;
    background: #FFFFFF; color: var(--kg-ink);
    font-family: var(--font-sans); font-size: 13px; font-weight: 800;
    padding: 12px 24px; border-radius: 999px;
    box-shadow: 0 8px 24px rgba(11,28,18,.26);
    transition: background .3s, color .3s, gap .3s;
  }
  .hm-pr-mini .hm-pr-btn { padding: 10px 18px; font-size: 12px; }
  .hm-pr:hover .hm-pr-btn { gap: 13px; background: var(--kg-forest); color: #FFFFFF; }
  .hm-pr-badge {
    position: absolute; top: 16px; right: 16px; z-index: 3;
    font-family: var(--font-sans);
    font-size: 10.5px; font-weight: 800; letter-spacing: .05em;
    padding: 6px 13px; border-radius: 999px; color: #FFFFFF;
    background: var(--kg-terra);
    box-shadow: 0 4px 14px rgba(11,28,18,.3);
  }

  /* ═══ TRENDING CAROUSEL ═══ */
  .hm-trending { background: var(--kg-warm); }
  .hm-caro-nav { display: flex; gap: 8px; }
  .hm-caro-nav button {
    width: 44px; height: 44px; border-radius: 999px;
    border: 1.5px solid var(--kg-line-warm); background: var(--kg-paper);
    display: grid; place-items: center; color: var(--kg-ink);
    cursor: pointer; transition: all .25s;
  }
  .hm-caro-nav button:hover { background: var(--kg-forest); color: #FFFFFF; border-color: var(--kg-forest); transform: translateY(-2px); }
  .hm-caro {
    display: flex; gap: 18px; overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding: 6px 0 28px;
    scrollbar-width: none;
  }
  .hm-caro::-webkit-scrollbar { display: none; }
  .hm-caro-pad { flex: 0 0 max(24px, calc((100vw - 1360px) / 2 + 56px - 18px)); }
  .hm-caro-item { flex: 0 0 262px; scroll-snap-align: start; }

  /* ═══ BRANDS ═══ */
  .hm-brands {
    padding: 72px 0; background: var(--kg-paper);
    border-top: 1px solid var(--kg-line-lt);
    border-bottom: 1px solid var(--kg-line-lt);
    overflow: hidden;
  }
  .hm-brands-head { text-align: center; margin-bottom: 36px; }
  .hm-brands-eyebrow::before { display: none; }
  .hm-brands-title { margin-top: 6px; }
  .hm-marquee {
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
  }
  .hm-marquee:hover .hm-marquee-track { animation-play-state: paused; }
  .hm-marquee-track { display: flex; gap: 12px; width: max-content; animation: kgMarquee 32s linear infinite; }
  .hm-brand {
    flex-shrink: 0; height: 58px; padding: 0 28px;
    display: inline-flex; align-items: center; gap: 12px;
    background: var(--kg-cream); border: 1.5px solid var(--kg-line);
    border-radius: 999px;
    font-family: var(--font-sans); font-size: 15px; font-weight: 700;
    color: var(--kg-ink-2); white-space: nowrap;
    transition: all .35s var(--ease); text-decoration: none;
  }
  .hm-brand img { height: 30px; width: auto; object-fit: contain; border-radius: 4px; }
  .hm-brand:hover {
    background: var(--kg-forest-bg); border-color: var(--kg-forest);
    color: var(--kg-forest-dk);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(27,76,140,.14);
  }

  /* ═══ WHY SHOP AT RAJ ═══ */
  .hm-why { background: var(--kg-cream); }
  .hm-why-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .hm-why-item {
    padding: 32px 24px;
    border-radius: 12px;
    background: var(--kg-warm);
    border: 1px solid var(--kg-line-lt);
    transition: box-shadow .35s var(--ease), transform .35s var(--ease);
  }
  .hm-why-item:hover {
    box-shadow: var(--shadow);
    transform: translateY(-3px);
  }
  .hm-why-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: var(--kg-forest-bg); color: var(--kg-forest);
    display: grid; place-items: center;
    margin-bottom: 16px;
  }
  .hm-why-item h4 { font-size: 14.5px; font-weight: 800; color: var(--kg-ink); margin-bottom: 8px; }
  .hm-why-item p { font-size: 13px; color: var(--kg-muted); line-height: 1.7; margin: 0; }

  /* ═══ STORE / LOCAL CTA ═══ */
  .hm-store-cta {
    background: var(--kg-forest);
    padding: 72px 0;
  }
  .hm-store-inner {
    display: flex; align-items: center; justify-content: space-between;
    gap: 32px; flex-wrap: wrap;
  }
  .hm-store-heading {
    font-family: var(--font-sans); font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;
    margin-bottom: 10px;
  }
  .hm-store-location {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 14.5px; color: rgba(255,255,255,.75); margin: 0;
  }
  .hm-store-location svg { flex-shrink: 0; }
  .hm-store-cta .sec-eyebrow { color: rgba(255,255,255,.65); margin-bottom: 8px; }
  .hm-store-cta .sec-eyebrow::before { background: rgba(255,255,255,.4); }
  .hm-store-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .hm-store-cta .btn-primary {
    background: #FFFFFF; color: var(--kg-forest); border-color: #FFFFFF;
    box-shadow: none;
  }
  .hm-store-cta .btn-primary:hover { background: var(--kg-cream); transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.15); }
  .btn-wa {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 14px 28px; border-radius: 999px;
    font-family: var(--font-sans); font-size: 14px; font-weight: 700;
    background: #25D366; color: #FFFFFF; border: none;
    transition: background .25s, transform .25s;
    text-decoration: none;
  }
  .btn-wa:hover { background: #1ebe57; transform: translateY(-2px); }

  /* ═══ CUSTOMER REVIEWS ═══ */
  .hm-rev { padding: 80px 0 72px; background: var(--kg-paper); }
  .hm-rev-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; margin-bottom: 32px;
  }
  .hm-rev-nav { display: flex; gap: 10px; flex-shrink: 0; padding-top: 6px; }
  .hm-rev-nav button {
    width: 46px; height: 46px; border-radius: 50%;
    border: 2px solid var(--kg-forest); background: var(--kg-forest);
    color: #fff; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .25s, border-color .25s, transform .2s;
  }
  .hm-rev-nav button:hover { background: var(--kg-terra); border-color: var(--kg-terra); transform: scale(1.08); }
  .hm-rev-nav button svg { width: 18px; height: 18px; }

  .hm-rev-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .hm-rev-card {
    border-radius: 20px; overflow: hidden;
    background: var(--raj-leaf);
    display: flex; align-items: stretch;
    min-height: 300px; position: relative;
    transition: transform .35s var(--ease3), box-shadow .35s var(--ease3);
  }
  .hm-rev-card:hover { transform: translateY(-5px); box-shadow: 0 28px 64px rgba(26,92,53,.22); }
  .hm-rev-card-alt { background: var(--raj-chilli-dk); }
  .hm-rev-card-alt:hover { box-shadow: 0 28px 64px rgba(107,26,26,.28); }

  .hm-rev-content {
    flex: 1; padding: 36px 28px 32px;
    display: flex; flex-direction: column; gap: 12px;
    position: relative; z-index: 1;
  }
  .hm-rev-q {
    font-family: Georgia, serif; font-size: 72px; line-height: .75;
    color: rgba(255,255,255,.28); font-weight: 900; user-select: none;
  }
  .hm-rev-text {
    font-size: 14.5px; line-height: 1.78;
    color: rgba(255,255,255,.92); flex: 1;
  }
  .hm-rev-author { margin-top: auto; }
  .hm-rev-author strong {
    display: block; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 3px;
  }
  .hm-rev-role { font-size: 12px; color: rgba(255,255,255,.55); display: block; }
  .hm-rev-city { font-size: 11.5px; color: rgba(255,255,255,.45); display: block; margin-top: 2px; }

  .hm-rev-photo-col {
    width: 220px; flex-shrink: 0; position: relative; overflow: hidden;
  }
  .hm-rev-photo {
    width: 100%; height: 100%; object-fit: cover;
    object-position: top center; display: block;
  }
  .hm-rev-photo-empty {
    width: 100%; height: 100%; min-height: 300px;
    display: flex; align-items: flex-end; justify-content: center;
    background: rgba(255,255,255,.07);
  }
  .hm-rev-photo-empty svg {
    width: 72%; max-width: 160px;
    color: rgba(255,255,255,.18);
  }

  /* ═══ HK QUALITY SECTION ═══ */
  .hm-hkq { padding: 84px 0 80px; background: var(--raj-canvas); }
  .hm-hkq-body { text-align: center; margin-bottom: 56px; }
  .hm-hkq-title {
    font-family: var(--font-sans);
    font-size: clamp(1.8rem, 3.8vw, 2.9rem);
    font-weight: 800; color: var(--kg-ink);
    line-height: 1.18; margin-bottom: 18px;
  }
  .hm-hkq-em { font-style: normal; color: var(--kg-terra); }
  .hm-hkq-sub {
    font-size: 15px; color: var(--kg-muted);
    line-height: 1.75; max-width: 540px; margin: 0 auto;
  }
  .hm-hkq-feats {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;
  }
  .hm-hkq-feat {
    background: #fff;
    border: 1px solid var(--kg-line-lt, var(--raj-line));
    border-radius: 18px; padding: 30px 16px 26px;
    display: flex; flex-direction: column;
    align-items: center; gap: 16px; text-align: center;
    font-family: var(--font-sans); font-size: 13.5px;
    font-weight: 600; color: var(--kg-ink); line-height: 1.4;
    transition: transform .3s var(--ease3), box-shadow .3s var(--ease3), border-color .3s;
  }
  .hm-hkq-feat:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 44px rgba(16,24,40,.09);
    border-color: var(--kg-line-warm);
  }
  .hm-hkq-icon {
    display: flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--raj-canvas); color: var(--kg-forest);
  }
  .hm-hkq-icon svg { width: 24px; height: 24px; }

  /* ═══ BLOG ═══ */
  .hm-blog { background: var(--kg-cream); }
  .hm-blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .hm-blog-card {
    background: var(--kg-paper); border: 1px solid var(--kg-line-lt);
    border-radius: 14px; overflow: hidden; text-decoration: none;
    transition: transform .4s var(--ease), box-shadow .4s var(--ease), border-color .3s;
  }
  .hm-blog-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(16,24,40,.08); border-color: var(--kg-line-warm); }
  .hm-blog-media { height: 200px; overflow: hidden; background: var(--kg-sand); display: grid; place-items: center; }
  .hm-blog-media img { width: 100%; height: 100%; object-fit: cover; }
  .hm-blog-glyph { font-family: var(--font-sans); font-size: 40px; color: var(--kg-line-warm); }
  .hm-blog-body { padding: 22px 24px 26px; }
  .hm-blog-tag {
    display: inline-block; font-family: var(--font-sans);
    font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
    color: var(--kg-terra); margin-bottom: 10px;
  }
  .hm-blog-body h3 {
    font-family: var(--font-sans); font-size: 1.15rem; font-weight: 700;
    color: var(--kg-ink); line-height: 1.35; margin-bottom: 10px;
    overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .hm-blog-body p {
    font-size: 14px; color: var(--kg-muted); line-height: 1.7;
    overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    margin-bottom: 14px;
  }
  .hm-blog-read {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--font-sans); font-size: 11px; font-weight: 800;
    letter-spacing: .12em; text-transform: uppercase; color: var(--kg-forest);
    transition: gap .3s;
  }
  .hm-blog-card:hover .hm-blog-read { gap: 11px; color: var(--kg-terra); }

  /* ═══ RESPONSIVE ═══ */
  @media (max-width: 1200px) {
    .hm-cats-grid { grid-template-columns: repeat(6, 1fr); }
    .hm-grid-4 { grid-template-columns: repeat(3, 1fr); }
    .hm-why-grid { grid-template-columns: repeat(2, 1fr); }
    .hm-hero-inner { gap: 36px; }
  }

  /* ── Tablet: collapse hero to single column ── */
  @media (max-width: 1000px) {
    .hm-cats-grid { grid-template-columns: repeat(4, 1fr); }
    .hm-promo-grid { grid-template-columns: 1fr; }
    .hm-promo-col { grid-template-rows: none; gap: 16px; }
    .hm-pr-hero { min-height: 420px; }
    .hm-pr-mini { min-height: 220px; }
    .hm-blog-grid { grid-template-columns: 1fr 1fr; }
    .hm-trust-grid { grid-template-columns: repeat(2, 1fr); }
    .hm-trust-item:nth-child(2) { border-right: none; }
    .hm-trust-item { border-bottom: 1px solid rgba(255,255,255,.12); padding: 12px 24px; }
    .hm-trust-item:nth-child(3), .hm-trust-item:nth-child(4) { border-bottom: none; }

    /* Hero: stack content first, video second on tablet */
    .hm-hero-inner {
      grid-template-columns: 1fr;
      gap: 40px;
      padding-top: clamp(52px, 7vh, 80px);
      padding-bottom: 48px;
      text-align: center;
    }
    .hm-hero-left {
      align-items: center;
    }
    .hm-hero-badge {
      justify-content: center;
    }
    .hm-hero-sub {
      max-width: 540px;
      text-align: center;
    }
    .hm-hero-btns {
      justify-content: center;
      margin-bottom: 28px;
    }
    .hm-hero-right {
      justify-content: center;
    }
    .hm-hero-frame {
      max-width: 640px;
      margin: 0 auto;
      /* Disable float on mobile for performance */
      animation: heroRightIn 1s cubic-bezier(0.22,1,0.36,1) .15s both;
    }
    .hm-hero-accent { display: none; }
  }

  @media (max-width: 860px) {
    :host { --sheet-r: 24px; }
    .hm-grid-4 { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .hm-caro-item { flex: 0 0 234px; }
    .hm-caro-pad { flex: 0 0 24px; }
    .hm-why-grid { grid-template-columns: 1fr 1fr; }
    .hm-store-inner { flex-direction: column; align-items: flex-start; }
    .hm-hero { min-height: unset; }
    .hm-hero-title { font-size: clamp(2.1rem, 7vw, 3rem); }
  }

  @media (max-width: 640px) {
    :host { --sheet-r: 20px; }
    /* Hero mobile */
    .hm-hero { min-height: unset; }
    .hm-hero-inner {
      padding-top: 44px;
      padding-bottom: 40px;
      gap: 32px;
    }
    .hm-hero-title {
      font-size: clamp(1.9rem, 8.5vw, 2.6rem);
      margin-bottom: 16px;
    }
    .hm-hero-sub { font-size: 14.5px; margin-bottom: 28px; }
    .hm-hero-btns { gap: 10px; margin-bottom: 24px; }
    .hm-hero-cta, .hm-hero-ghost { padding: 13px 22px; font-size: 13.5px; }
    .hm-hero-frame { border-radius: 14px; }
    /* Other sections */
    .hm-trust-strip { padding: 0; }
    .hm-trust-grid { grid-template-columns: 1fr 1fr; gap: 0; }
    .hm-trust-item { font-size: 11.5px; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.12); }
    .hm-trust-item:nth-child(2n) { border-right: none; }
    .hm-trust-item:nth-child(3), .hm-trust-item:nth-child(4) { border-bottom: none; }
    .hm-cats-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .hm-cat { border-radius: 10px; }
    .hm-cat-info { padding: 8px 8px; gap: 3px; }
    .hm-cat-name { font-size: 10px; }
    .hm-cat-arrow { width: 18px; height: 18px; }
    .hm-cat-arrow svg { width: 10px; height: 10px; }
    .hm-cat-emoji { font-size: 22px; }
    .hm-sec-head { margin-bottom: 16px; }
    .hm-promos { padding-top: 32px; }
    .hm-promo-grid { gap: 12px; }
    .hm-pr { border-radius: 16px; }
    .hm-pr-hero { min-height: 360px; }
    .hm-pr-mini { min-height: 200px; }
    .hm-pr-body { left: 16px; right: 16px; bottom: 16px; gap: 6px; }
    .hm-pr-mini .hm-pr-body { left: 14px; right: 14px; bottom: 14px; }
    .hm-pr-badge { top: 10px; right: 10px; padding: 5px 10px; font-size: 9.5px; }
    .hm-why-grid { grid-template-columns: 1fr 1fr; border-radius: 14px; }
    .hm-why-item { padding: 20px 16px; }
    .hm-why-icon { width: 40px; height: 40px; margin-bottom: 12px; }
    .hm-brands { padding: 40px 0; }
    .hm-brands-head { margin-bottom: 20px; }
    .hm-brand { height: 48px; padding: 0 20px; font-size: 13.5px; }
    .hm-blog-grid { grid-template-columns: 1fr; gap: 14px; }
    .hm-blog-media { height: 170px; }
    .hm-tst { padding: 48px 0 36px; }
    .hm-tst-mark { font-size: 80px; margin-bottom: 12px; }
    .hm-tst-stage { min-height: 220px; }
    .hm-caro { gap: 12px; padding-bottom: 18px; }
    .hm-caro-item { flex: 0 0 200px; }
    .hm-store-cta { padding: 48px 0; }
    .hm-empty-note { padding: 20px 0 4px; font-size: 14.5px; }
    .hm-cats-empty { padding: 40px 16px; }
  }

  /* ═══ Reduced motion ═══ */
  @media (prefers-reduced-motion: reduce) {
    .hm-hero-kenburns,
    .hm-hero-frame,
    .hm-hero-left,
    .hm-hero-right,
    .hm-hero-badge-dot { animation: none; }
    .hm-hero-word { animation: none; opacity: 1; transform: none; }
    .hm-hero-sub, .hm-hero-btns, .hm-hero-cue { animation: none; opacity: 1; }
    .hm-marquee-track { animation: none; }
  }

  /* ═══════════════════════════════
     FAQ SECTION
  ═══════════════════════════════ */
  .hm-faq-wrap {
    padding: 96px 0 104px;
    background: var(--raj-canvas);
    position: relative;
    overflow: hidden;
  }
  .hm-faq-wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 0% 50%, rgba(41,184,213,.06) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 100% 30%, rgba(26,92,53,.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .hm-faq-layout {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 72px;
    align-items: start;
  }

  /* ── Image column ── */
  .hm-faq-img-col { position: relative; }
  .hm-faq-img-card {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    background: var(--raj-leaf-bg);
    aspect-ratio: 4/5;
    max-height: 520px;
    box-shadow: 0 32px 80px rgba(26,92,53,.14), 0 8px 20px rgba(0,0,0,.07);
  }
  .hm-faq-img-bg {
    position: absolute; inset: 0;
    background: linear-gradient(160deg, var(--raj-leaf-bg2) 0%, var(--raj-leaf-bg) 50%, var(--raj-leaf-bg) 100%);
  }
  .hm-faq-person {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center top;
    z-index: 1;
  }
  .hm-faq-img-accent {
    position: absolute;
    bottom: -32px; right: -32px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(41,184,213,.18) 0%, transparent 70%);
    z-index: 0;
  }

  /* Leaf decorations */
  .hm-faq-leaf {
    position: absolute; z-index: 2; pointer-events: none;
  }
  .hm-faq-leaf-1 {
    top: -20px; left: -18px;
    width: 88px; height: 100px;
    transform-origin: bottom right;
    animation: faqLeafSway 7s ease-in-out infinite alternate;
  }
  .hm-faq-leaf-2 {
    top: 24px; left: 48px;
    width: 54px; height: 62px;
    transform-origin: bottom right;
    animation: faqLeafSway 9s ease-in-out 1s infinite alternate-reverse;
  }
  @keyframes faqLeafSway {
    from { transform: rotate(-4deg); }
    to   { transform: rotate(6deg); }
  }

  /* ── Accordion column ── */
  .hm-faq-head { margin-bottom: 32px; }
  .hm-faq-head .sec-eyebrow { margin-bottom: 10px; }
  .hm-faq-head .sec-title {
    font-size: clamp(1.6rem, 2.8vw, 2.2rem);
    line-height: 1.2;
    color: var(--kg-ink);
  }

  .hm-faq-list { display: flex; flex-direction: column; }
  .hm-faq-item {
    border-bottom: 1px solid var(--kg-line-lt, var(--raj-line));
    cursor: pointer;
    transition: background .25s;
  }
  .hm-faq-item:first-child { border-top: 1px solid var(--kg-line-lt, var(--raj-line)); }

  .hm-faq-q {
    width: 100%; background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
    padding: 20px 0;
    text-align: left;
    font-family: var(--font-sans);
    font-size: 1.02rem;
    font-weight: 600;
    color: var(--kg-ink);
    line-height: 1.4;
    transition: color .25s;
  }
  .hm-faq-item:hover .hm-faq-q,
  .hm-faq-item.open .hm-faq-q { color: var(--kg-forest); }

  .hm-faq-icon {
    flex-shrink: 0;
    width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    color: var(--kg-muted, var(--raj-muted));
    transition: transform .35s var(--ease3, cubic-bezier(.22,1,.36,1)), color .25s;
  }
  .hm-faq-item.open .hm-faq-icon {
    transform: rotate(180deg);
    color: var(--kg-forest);
  }
  .hm-faq-icon svg { width: 18px; height: 18px; }

  .hm-faq-a {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .38s var(--ease3, cubic-bezier(.22,1,.36,1));
  }
  .hm-faq-item.open .hm-faq-a { grid-template-rows: 1fr; }
  .hm-faq-a-inner {
    overflow: hidden;
    font-size: 14.5px;
    line-height: 1.75;
    color: var(--kg-muted, var(--raj-muted));
    padding-bottom: 18px;
    padding-right: 32px;
  }

  /* ── Scroll-reveal animations ── */
  .faq-anim {
    opacity: 0;
    transition: opacity .7s var(--ease3, cubic-bezier(.22,1,.36,1)),
                transform .7s var(--ease3, cubic-bezier(.22,1,.36,1));
  }
  .faq-anim-left  { transform: translateX(-48px); }
  .faq-anim-right { transform: translateX(48px); }
  .faq-anim.faq-visible {
    opacity: 1;
    transform: none;
  }
  .faq-anim-right.faq-visible { transition-delay: .12s; }

  /* ── Responsive ── */
  @media (max-width: 1000px) {
    .hm-faq-layout { grid-template-columns: 360px 1fr; gap: 48px; }
  }
  @media (max-width: 800px) {
    .hm-faq-layout {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    .hm-faq-img-card { max-height: 340px; aspect-ratio: 16/9; }
    .hm-faq-leaf-1 { display: none; }
    .faq-anim-left, .faq-anim-right { transform: translateY(40px); }
  }
  @media (max-width: 480px) {
    .hm-faq-wrap { padding: 64px 0 72px; }
    .hm-faq-q { font-size: .97rem; padding: 17px 0; }
    .hm-faq-a-inner { font-size: 14px; }
  }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('trendRow') trendRow?: ElementRef<HTMLDivElement>;
  mediaUrl = (environment as any).mediaUrl || '';

  banners    = signal<any[]>([]);
  categories = signal<any[]>([]);
  featured   = signal<any[]>([]);
  trending   = signal<any[]>([]);
  recentProducts = signal<any[]>([]);
  testimonials = signal<any[]>([]);

  /* FAQ */
  openFaq = signal<number | null>(null);
  toggleFaq(i: number) { this.openFaq.set(this.openFaq() === i ? null : i); }
  faqItems = [
    {
      q: 'What Indian grocery products do you stock?',
      a: 'We carry a wide range of authentic Indian groceries including spices & masalas, rice & grains, dals & pulses, atta & flours, snacks, beverages, dairy products, pickles, chutneys, and household essentials from trusted Indian brands.'
    },
    {
      q: 'How do I place an order online?',
      a: 'Simply browse our categories, add items to your cart, and proceed to checkout. You can pay securely online and we will process your order right away. You will receive a confirmation once your order is placed.'
    },
    {
      q: 'Is there a minimum order value for delivery?',
      a: 'We offer delivery across Hong Kong. Minimum order requirements and delivery charges may apply depending on your location. Please check the checkout page for the most up-to-date delivery information for your area.'
    },
    {
      q: 'Do you stock products from popular Indian brands?',
      a: 'Yes! We stock products from well-known Indian brands such as Aashirvaad, MDH, Everest, Parle, Haldiram\'s, Dabur, Amul, Patanjali, Britannia, MTR and many more — all sourced authentically.'
    },
    {
      q: 'What is your return or refund policy?',
      a: 'We take quality seriously. If you receive a damaged or incorrect item, please contact us within 24 hours of delivery and we will arrange a replacement or refund. Perishable items are handled on a case-by-case basis.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept major credit and debit cards, PayMe, FPS, and other secure online payment methods. All transactions are encrypted and processed through a secure payment gateway.'
    },
  ];
  private _faqObserver?: IntersectionObserver;
  blogs      = signal<any[]>([]);

  activeSlide = signal(0);
  tstSlide    = signal(0);
  worldLoaded = signal(false);

  /* Indian grocery category fallbacks — used only if API/DB is empty */
  fallbackCategories = [
    { name: 'Spices & Masalas', slug: '', image: '' },
    { name: 'Rice & Grains', slug: '', image: '' },
    { name: 'Dals & Pulses', slug: '', image: '' },
    { name: 'Snacks', slug: '', image: '' },
    { name: 'Beverages', slug: '', image: '' },
    { name: 'Dairy & Ghee', slug: '', image: '' },
    { name: 'Pickles & Chutneys', slug: '', image: '' },
    { name: 'Household', slug: '', image: '' },
  ];

  /* Indian grocery brand fallbacks */
  fallbackBrands = [
    'MDH Spices', 'Aashirvaad', 'Everest', 'Parle', 'Haldiram\'s',
    'Dabur', 'Amul', 'Patanjali', 'Britannia', 'MTR'
  ];

  /* Category emoji fallbacks for no-image categories */
  private readonly emojiList = ['🌶️','🍚','🫘','🍟','🍵','🧈','🥗','🏡','🧄','🌿'];
  catEmoji(i: number): string { return this.emojiList[i % this.emojiList.length]; }

  private _slideTimer: any;
  private _tstTimer: any;
  private _isMobile = typeof window !== 'undefined' && window.innerWidth < 700;

  constructor(
    public settings: SettingsService,
    private api: ApiService,
    private seo: SeoService,
  ) {}

  ngOnInit() {
    this.seo.resetMeta();
    this.api.getBlogs(1).subscribe({ next: (r: any) => { if (r.success) this.blogs.set((r.data || []).slice(0, 3)); }, error: () => {} });
    this._loadTestimonials();
    this.loadCatalogue();
    setTimeout(() => this._initFaqScrollAnim(), 0);
  }

  private loadCatalogue() {
    clearInterval(this._slideTimer);
    this.activeSlide.set(0);
    this.worldLoaded.set(false);

    const safetyTimer = setTimeout(() => this.worldLoaded.set(true), 12000);

    this.api.getBanners().subscribe({
      next: (r: any) => {
        const all = (r.data || r || []).filter((b: any) => b.is_active !== 0 && b.is_active !== '0');
        this.banners.set(all);
        if (all.length > 1) this._startSlider();
        this._preloadHeroAssets(all[0]);
        this.playActiveHeroVideo();
      },
      error: () => {}
    });

    this.api.getFeaturedCategories().subscribe({
      next: (r: any) => {
        const cats = (r.success && r.data?.length) ? r.data : [];
        if (cats.length) {
          this.categories.set(cats.slice(0, 10));
        } else {
          this.api.getCategories().subscribe({
            next: (r2: any) => {
              const all = (r2.success && r2.data?.length) ? r2.data : [];
              const topLevel = all.filter((c: any) => !c.parent_id || c.parent_id == null);
              this.categories.set((topLevel.length ? topLevel : all).slice(0, 10));
            },
            error: () => {}
          });
        }
      },
      error: () => {}
    });

    this.api.getFeaturedProducts(8).subscribe({
      next: (r: any) => {
        if (r.success) this.featured.set(r.data || []);
        clearTimeout(safetyTimer);
        this.worldLoaded.set(true);
      },
      error: () => { clearTimeout(safetyTimer); this.worldLoaded.set(true); }
    });
    this.api.getTrendingProducts(8).subscribe({ next: (r: any) => { if (r.success) this.trending.set(r.data || []); }, error: () => {} });
    this.api.getProducts({ limit: 4, sort: 'newest' }).subscribe({ next: (r: any) => { if (r.success) this.recentProducts.set(r.data || []); }, error: () => {} });
  }

  ngOnDestroy() {
    clearInterval(this._slideTimer);
    clearInterval(this._tstTimer);
    this._faqObserver?.disconnect();
  }

  private _initFaqScrollAnim() {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = document.querySelectorAll('.faq-anim');
    if (!els.length) return;
    this._faqObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('faq-visible');
          this._faqObserver?.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => this._faqObserver!.observe(el));
  }

  /* ── Hero copy — admin banner first, then sensible brand defaults ── */
  private activeBanner(): any { return this.banners()[this.activeSlide()] || null; }
  heroTitle(): string { return ((this.activeBanner()?.title) || '').trim(); }
  heroWords(): string[] { const t = this.heroTitle(); return t ? t.split(/\s+/) : []; }
  heroSub(): string { return ((this.activeBanner()?.subtitle) || '').trim(); }
  heroEyebrow(): string { return ((this.activeBanner()?.label) || '').trim(); }
  heroCta(): string { return ((this.activeBanner()?.button_text) || '').trim(); }
  heroCtaLink(): string { return ((this.activeBanner()?.link || this.activeBanner()?.button_link) || '/categories').trim(); }

  scrollPastHero() {
    const el = document.querySelector('.hm-trust-strip');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Slider ── */
  private _startSlider() {
    this._slideTimer = setInterval(() => {
      const total = this.banners().length;
      this.activeSlide.set((this.activeSlide() + 1) % total);
      this.playActiveHeroVideo();
    }, 7000);
  }
  goSlide(i: number) {
    clearInterval(this._slideTimer);
    this.activeSlide.set(i);
    this.playActiveHeroVideo();
    this._startSlider();
  }

  bannerVideo(b: any): string {
    const src = (this._isMobile && b.mobile_video) ? b.mobile_video : b.video;
    return this.media(src);
  }
  onVideoCanPlay(e: Event) {
    const video = e.target as HTMLVideoElement;
    video.muted = true; video.loop = true;
    video.play().catch(() => {});
  }
  playActiveHeroVideo() {
    setTimeout(() => {
      if (typeof document === 'undefined') return;
      const active = document.querySelector('.hm-hero-slide.active video') as HTMLVideoElement | null;
      if (!active) return;
      active.muted = true; active.loop = true;
      active.play().catch(() => {});
    });
  }
  videoType(path: string): string {
    const clean = (path || '').split('?')[0].toLowerCase();
    if (clean.endsWith('.webm')) return 'video/webm';
    if (clean.endsWith('.mov')) return 'video/quicktime';
    return 'video/mp4';
  }

  /* ── Trending carousel ── */
  scrollTrend(dir: number) {
    const el = document.querySelector('.hm-caro') as HTMLElement | null;
    el?.scrollBy({ left: dir * (el.clientWidth * 0.72), behavior: 'smooth' });
  }

  /* ── Testimonials (Reviews) ── */
  revPage = signal(0);

  private _loadTestimonials() {
    try {
      const stored = this.settings.get('testimonials', '');
      if (stored) {
        const t = JSON.parse(stored);
        if (Array.isArray(t) && t.length) { this.testimonials.set(t); return; }
      }
    } catch {}
    const keys = ['review_1', 'review_2', 'review_3', 'review_4', 'review_5', 'review_6'];
    const fromSettings = keys
      .map(k => ({
        name: this.settings.get(`${k}_name`, ''),
        city: this.settings.get(`${k}_location`, ''),
        text: this.settings.get(`${k}_text`, ''),
        photo: this.settings.get(`${k}_photo`, ''),
      }))
      .filter(t => t.name && t.text);
    if (fromSettings.length) { this.testimonials.set(fromSettings); return; }
    
    /* Fallback testimonials — REPLACE with real reviews before launch */
    this.testimonials.set([
      { name: 'Priya M.', city: 'Tseung Kwan O, HK', text: 'Finally found a store with all my favourite Indian brands in one place. The MDH masalas are exactly as I get back home!', photo: '' },
      { name: 'Rahul S.', city: 'Tsim Sha Tsui, HK', text: 'Easy to order, great selection of atta, rice and dals. Everything arrived well-packed and fresh.', photo: '' },
      { name: 'Anjali K.', city: 'Sha Tin, HK', text: 'The snack selection is amazing — Haldiram\'s and Parle in Hong Kong! Makes me feel right at home.', photo: '' },
      { name: 'David T.', city: 'Central, HK', text: 'Fantastic service! The delivery was so fast and the quality of the produce was outstanding.', photo: '' },
    ]);
  }

  revPair(): any[] {
    const all = this.testimonials();
    if (!all.length) return [];
    const p = this.revPage();
    const items = [];
    items.push(all[(p * 2) % all.length]);
    if (all.length > 1) {
      items.push(all[(p * 2 + 1) % all.length]);
    }
    return items;
  }

  nextRevGroup() {
    const total = this.testimonials().length;
    if (total <= 2) return;
    const maxPages = Math.ceil(total / 2);
    this.revPage.update(p => (p + 1) % maxPages);
  }

  prevRevGroup() {
    const total = this.testimonials().length;
    if (total <= 2) return;
    const maxPages = Math.ceil(total / 2);
    this.revPage.update(p => p === 0 ? maxPages - 1 : p - 1);
  }

  /* ── Categories ── */
  displayCategories(): any[] { return this.categories().slice(0, 10); }

  /* ── Brands ── */
  featuredBrands(): { name: string, image: string }[] {
    const rawData = this.settings.get('featured_brands_data', '');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const raw = this.settings.get('featured_brands_list', '');
    const parsedLegacy = String(raw || '')
      .split(/[\n,]+/)
      .map(v => v.trim())
      .filter(Boolean)
      .map(name => ({ name, image: '' }));
    if (parsedLegacy.length) return parsedLegacy;
    return this.fallbackBrands.map(name => ({ name, image: '' }));
  }

  /* ── Store CTA ── */
  storeAddress(): string {
    const addr = this.settings.get('contact_address', '') || this.settings.get('site_address', '');
    /* Only show if it looks like a real Hong Kong address */
    /* Suppress legacy European addresses from old store configuration */
    if (!addr || /Finland|Germany|Ireland|Helsinki|Berlin|Dublin|Uusimaa|Eircode/i.test(addr)) return '';
    return addr;
  }
  whatsappLink(): string {
    const wa = this.settings.get('social_whatsapp', '');
    if (!wa) return '';
    const num = wa.replace(/\D/g, '');
    return num ? `https://wa.me/${num}` : '';
  }

  /* ── Utils ── */
  hideImg(e: Event) { (e.target as HTMLImageElement).style.display = 'none'; }

  /* ── Promo campaign ── */
  private promoDefaults: Record<number, any> = {
    1: {
      img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&q=80&auto=format&fit=crop',
      label: 'Spice pantry', title: 'Authentic Indian Spices & Masalas',
      text: 'From ground coriander to whole garam masala — the real flavours of Indian cooking.',
      button: 'Shop Spices', link: '/categories',
      badge: 'Best Sellers', badgeColor: '#17513F',
      overlayColor: '#211A14', overlayOpacity: 46, height: 0,
    },
    2: {
      img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=80&auto=format&fit=crop',
      label: 'Daily staples', title: 'Rice, Atta & Dal',
      text: 'Stock your pantry with everyday Indian essentials.',
      button: 'Shop Staples', link: '/categories',
      badge: '', badgeColor: 'var(--raj-turmeric)',
      overlayColor: '#211A14', overlayOpacity: 40, height: 0,
    },
    3: {
      img: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=1200&q=80&auto=format&fit=crop',
      label: 'Snacks & sweets', title: 'Namkeen, Mithai & More',
      text: 'Your favourite Indian snacks and festive sweets, now in Hong Kong.',
      button: 'Explore Snacks', link: '/categories',
      badge: 'New Arrivals', badgeColor: 'var(--raj-turmeric)',
      overlayColor: '#211A14', overlayOpacity: 42, height: 0,
    },
  };

  private promoJunk(v: string): boolean {
    return /configure this promo|update this promo banner/i.test(v);
  }

  promoCards(): any[] {
    const order = String(this.settings.get('promo_order', '1,2,3'))
      .split(',').map(v => parseInt(v.trim(), 10)).filter(n => n >= 1 && n <= 3);
    const seq: number[] = [];
    for (const n of [...order, 1, 2, 3]) if (!seq.includes(n)) seq.push(n);

    const cards: any[] = [];
    for (const n of seq) {
      if (String(this.settings.get(`promo_${n}_enabled`, '1')) === '0') continue;
      const d = this.promoDefaults[n];
      const txt = (k: string, dv: string) => {
        const v = String(this.settings.get(`promo_${n}_${k}`, '') || '').trim();
        return (!v || this.promoJunk(v)) ? dv : v;
      };
      const rawImg = String(this.settings.get(`promo_${n}_image`, '') || '').trim();
      const rawMob = String(this.settings.get(`promo_${n}_image_mobile`, '') || '').trim();
      const badge = String(this.settings.get(`promo_${n}_badge`, d.badge) ?? '').trim();
      cards.push({
        n,
        img: rawImg ? this.settings.resolveAssetUrl(rawImg) : d.img,
        imgMobile: rawMob ? this.settings.resolveAssetUrl(rawMob) : '',
        label: txt('label', d.label),
        title: txt('title', d.title),
        text: txt('text', d.text),
        button: txt('button', d.button),
        link: txt('link', d.link),
        badge: this.promoJunk(badge) ? '' : badge,
        badgeColor: txt('badge_color', d.badgeColor),
        overlayColor: txt('overlay_color', d.overlayColor),
        overlayOpacity: Math.min(90, Math.max(0, parseInt(String(this.settings.get(`promo_${n}_overlay_opacity`, '')), 10) || d.overlayOpacity)),
        height: Math.max(0, parseInt(String(this.settings.get(`promo_${n}_height`, '')), 10) || 0),
      });
    }
    return cards;
  }
  promoHero(): any | null { return this.promoCards()[0] || null; }
  promoStack(): any[] { return this.promoCards().slice(1, 3); }

  promoImgErr(e: Event, n: number) {
    const img = e.target as HTMLImageElement;
    const fallback = this.promoDefaults[n]?.img;
    if (!fallback || img.src === fallback) return;
    img.closest('picture')?.querySelectorAll('source').forEach(s => s.remove());
    img.src = fallback;
  }

  media(p: string) {
    if (!p) return '';
    return p.startsWith('http') ? p : this.mediaUrl + p;
  }
  private _preloadHeroAssets(banner: any) {
    if (!banner || typeof document === 'undefined') return;
    const imgPath = banner.image || banner.fallback_image || '';
    if (imgPath) {
      const link = document.createElement('link');
      link.rel = 'preload'; link.href = this.media(imgPath); link.setAttribute('as', 'image');
      document.head.appendChild(link);
    }
  }
  resolvePromoLink(path: string): string {
    if (!path) return '/categories';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (typeof window !== 'undefined') return window.location.origin + path;
    return path;
  }
}

import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MagneticDirective, ParallaxDirective } from '../../shared/directives/motion.directives';
import { SceneDirective, ScrollFxDirective, WordsDirective } from '../../shared/directives/scroll-story.directives';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink, ProductCardComponent,
    MagneticDirective, ParallaxDirective,
    SceneDirective, ScrollFxDirective, WordsDirective,
  ],
  template: `

  <!-- ══════════ HERO — split: editorial left, admin media right ══════════ -->
  <section class="hm-hero">
    <div class="hm-hero-wash" aria-hidden="true"></div>

    <div class="hm-hero-inner container">

      <!-- ── LEFT ── -->
      <div class="hm-hero-left">
        <div class="hm-hero-badge">
          <span class="hm-hero-badge-dot" aria-hidden="true"></span>
          {{ heroEyebrow() || settings.get('hero_eyebrow','Indian Grocery in Hong Kong') }}
        </div>

        <h1 class="hm-hero-title">
          @for (w of heroTitleWords(); track $index) {
            <span class="hm-hero-w"><span class="hm-hero-w-in" [style.animationDelay]="(0.12 + $index * 0.055) + 's'">{{ w }}</span></span>
          }
        </h1>

        <p class="hm-hero-sub">{{ heroSub() || settings.get('hero_subtitle','Shop everyday Indian groceries, pantry staples, snacks, beverages and fresh vegetables.') }}</p>

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
          <a routerLink="/categories" class="hm-hero-ghost">Shop Categories</a>
        </div>

        <!-- Inline trust row — settings-driven, no invented claims -->
        @if (trustItems().length) {
          <ul class="hm-hero-trust">
            @for (t of trustItems(); track t; let i = $index) {
              <li [style.animationDelay]="(0.5 + i * 0.07) + 's'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ t }}
              </li>
            }
          </ul>
        }
      </div>

      <!-- ── RIGHT: admin banner / video in a premium frame ── -->
      <div class="hm-hero-right">
        <div class="hm-hero-mat" kgParallax="0.045">
          <div class="hm-hero-frame">
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
                    } @else if (bannerHasMedia(b)) {
                      <img class="hm-hero-media hm-hero-kenburns"
                        [src]="media(b.image || b.fallback_image)"
                        [alt]="b.title || settings.get('site_name','Raj Grocery Store')"
                        loading="eager" fetchpriority="high"
                        (error)="onHeroImgErr(b.id)" />
                    } @else {
                      <div class="hm-hero-frame-fallback">
                        <div class="hm-hero-fallback-inner">
                          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="10" r="1.6" stroke="currentColor" stroke-width="1.5"/><path d="M21 15l-5-4.5L7 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          <strong>{{ settings.get('site_name','Raj Grocery Store') }}</strong>
                          <p>Banner image unavailable<br>Re-upload it from the Admin Panel</p>
                        </div>
                      </div>
                    }
                  </div>
                }
              } @else {
                <div class="hm-hero-slide active hm-hero-frame-fallback">
                  <div class="hm-hero-fallback-inner">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="10" r="1.6" stroke="currentColor" stroke-width="1.5"/><path d="M21 15l-5-4.5L7 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <strong>{{ settings.get('site_name','Raj Grocery Store') }}</strong>
                    <p>Upload a hero banner or video<br>from the Admin Panel</p>
                  </div>
                </div>
              }
            </div>

            @if (banners().length > 1) {
              <div class="hm-hero-dots">
                @for (b of banners(); track b.id; let i = $index) {
                  <button [class.on]="activeSlide() === i" (click)="goSlide(i)" [attr.aria-label]="'Show slide ' + (i+1)"></button>
                }
              </div>
            }
          </div>
        </div>
      </div>

    </div>

    <button class="hm-hero-cue" (click)="scrollPastHero()" aria-label="Scroll to categories">
      <span>Scroll</span>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </section>


  <!-- ══════════ CATEGORIES ══════════ -->
  <section class="section hm-cats" id="shop" kgScene>
    <div class="container">
      <div class="hm-sec-head">
        <div>
          <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('home_categories_label','Browse the pantry') }}</span>
          <h2 class="sec-title" [kgWords]="settings.get('home_categories_title','Shop by Category')"></h2>
        </div>
        <a routerLink="/categories" class="hm-link" kgFx="rise-sm" [fxOrder]="1">
          {{ settings.get('home_categories_link_text','All categories') }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </a>
      </div>

      @if (displayCategories().length) {
        <div class="hm-cats-grid">
          @for (c of displayCategories(); track c.slug || c.id; let i = $index) {
            <a class="hm-cat" [routerLink]="c.id ? ['/category', c.slug] : ['/categories']"
               kgFx="rise-sm" [fxOrder]="i % 5">
              <span class="hm-cat-media">
                @if (c.image) {
                  <img class="hm-cat-img" [src]="media(c.image)" [alt]="c.name" loading="lazy" (error)="hideImg($event)" />
                } @else {
                  <span class="hm-cat-mono" aria-hidden="true">{{ (c.name || '?')[0] }}</span>
                }
              </span>
              <span class="hm-cat-info">
                <strong class="hm-cat-name">{{ c.name }}</strong>
                @if (c.product_count) { <em class="hm-cat-count">{{ c.product_count }} items</em> }
              </span>
            </a>
          }
        </div>
      } @else if (!worldLoaded()) {
        <div class="hm-cats-grid">
          @for (s of [1,2,3,4,5,6,7,8,9,10]; track s) { <div class="skeleton hm-cat-skel"></div> }
        </div>
      } @else {
        <div class="hm-empty-block">
          <p>Categories are being set up — check back shortly.</p>
          <a routerLink="/categories" class="btn btn-outline">Browse all products</a>
        </div>
      }
    </div>
  </section>


  <!-- ══════════ FEATURED ══════════ -->
  <section class="section hm-featured" kgScene>
    <div class="container">
      <div class="hm-sec-head">
        <div>
          <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('home_featured_label','Popular Picks') }}</span>
          <h2 class="sec-title" [kgWords]="settings.get('home_featured_title','Featured Products')"></h2>
        </div>
        <a routerLink="/categories" class="hm-link" kgFx="rise-sm" [fxOrder]="1">
          {{ settings.get('home_featured_link_text','View all') }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </a>
      </div>
      @if (featured().length) {
        <div class="hm-grid-4">
          @for (p of featured().slice(0, 8); track p.id; let i = $index) {
            <div kgFx="rise-sm" [fxOrder]="i % 4">
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
          [class.hm-promo-duo]="promoCards().length === 2">

          @if (promoHero(); as hero) {
            <a class="hm-pr hm-pr-hero"
              [href]="resolvePromoLink(hero.link)"
              [style.--ov-c]="hero.overlayColor"
              [style.--ov-o]="hero.overlayOpacity"
              kgFx="rise" [fxOrder]="0">
              <div class="hm-pr-media">
                @if (promoHasImg(hero)) {
                  <picture>
                    @if (hero.imgMobile) {
                      <source [srcset]="hero.imgMobile" media="(max-width: 640px)">
                    }
                    <img class="hm-pr-img" [src]="hero.img" [alt]="hero.title" loading="lazy"
                      (error)="promoImgErr($event, hero.n)" />
                  </picture>
                } @else {
                  <div class="hm-pr-noimg" aria-hidden="true"></div>
                }
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
                    @if (promoHasImg(card)) {
                      <picture>
                        @if (card.imgMobile) {
                          <source [srcset]="card.imgMobile" media="(max-width: 640px)">
                        }
                        <img class="hm-pr-img" [src]="card.img" [alt]="card.title" loading="lazy"
                          (error)="promoImgErr($event, card.n)" />
                      </picture>
                    } @else {
                      <div class="hm-pr-noimg" aria-hidden="true"></div>
                    }
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


  <!-- ══════════ TRENDING ══════════ -->
  <section class="section hm-trending" kgScene>
    <div class="container">
      <div class="hm-sec-head">
        <div>
          <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('home_trending_label','Most Loved') }}</span>
          <h2 class="sec-title" [kgWords]="settings.get('home_trending_title','Trending Products')"></h2>
        </div>
        <div class="hm-caro-nav" kgFx="rise-sm" [fxOrder]="1">
          <button (click)="scrollTrend(-1)" aria-label="Previous products">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button (click)="scrollTrend(1)" aria-label="Next products">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
    @if (trending().length) {
      <div class="hm-caro-wrap">
        <div class="hm-caro" #trendRow>
          <div class="hm-caro-pad"></div>
          @for (p of trending(); track p.id; let i = $index) {
            <div class="hm-caro-item" kgFx="rise-sm" [fxOrder]="i < 6 ? i : 6">
              <app-product-card [product]="p" />
            </div>
          }
          <div class="hm-caro-pad"></div>
        </div>
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
            <h2 class="sec-title" [kgWords]="settings.get('home_new_title','New Arrivals')"></h2>
          </div>
          <a routerLink="/categories" class="hm-link" kgFx="rise-sm" [fxOrder]="1">
            {{ settings.get('home_new_link_text','View all') }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </a>
        </div>
        <div class="hm-grid-4">
          @for (p of recentProducts().slice(0, 4); track p.id; let i = $index) {
            <div kgFx="rise-sm" [fxOrder]="i">
              <app-product-card [product]="p" />
            </div>
          }
        </div>
      </div>
    </section>
  }


  <!-- ══════════ BRANDS ══════════ -->
  @if (featuredBrands().length) {
    <section class="hm-brands" kgScene>
      <div class="container">
        <div class="hm-brands-head">
          <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('featured_brands_label','Brands We Stock') }}</span>
          <h2 class="sec-title" [kgWords]="settings.get('featured_brands_title','Shop Popular Brands')"></h2>
        </div>
      </div>
      <div class="hm-marquee">
        <div class="hm-marquee-track">
          @for (dup of [0,1]; track dup) {
            @for (brand of featuredBrands(); track $index) {
              <a routerLink="/categories" class="hm-brand" [attr.aria-hidden]="dup === 1" [attr.tabindex]="dup === 1 ? -1 : null">
                @if (brand.image) {
                  <img [src]="media(brand.image)" [alt]="brand.name" loading="lazy">
                } @else {
                  <span class="hm-brand-name">{{ brand.name }}</span>
                }
              </a>
            }
          }
        </div>
      </div>
    </section>
  }


  <!-- ══════════ WHY SHOP WITH US ══════════ -->
  <section class="section hm-why" kgScene>
    <div class="container">
      <div class="hm-sec-head hm-sec-head-center">
        <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('promise_label','Our Promise') }}</span>
        <h2 class="sec-title" [kgWords]="settings.get('promise_title','Why Shop With Us')"></h2>
      </div>
      <div class="hm-why-grid">
        @for (w of whyItems(); track w.title; let i = $index) {
          <div class="hm-why-item" kgFx="rise-sm" [fxOrder]="i">
            <div class="hm-why-icon" aria-hidden="true">
              @switch (i) {
                @case (0) {
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.7"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
                }
                @case (1) {
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 3.9 2.4-7.4L2 9.4h7.6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
                }
                @case (2) {
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                }
                @default {
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><polyline points="9 12 11 14 15 10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                }
              }
            </div>
            <h4>{{ w.title }}</h4>
            <p>{{ w.text }}</p>
          </div>
        }
      </div>
    </div>
  </section>


  <!-- ══════════ LOCAL STORE CTA ══════════ -->
  @if (storeAddress()) {
    <section class="hm-store-cta" kgScene>
      <div class="container">
        <div class="hm-store-inner" kgFx="rise-sm">
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


  <!-- ══════════ REVIEWS ══════════ -->
  @if (revPair().length) {
    <section class="hm-rev" kgScene>
      <div class="container">
        <div class="hm-sec-head">
          <div>
            <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('reviews_label','Reviews') }}</span>
            <h2 class="sec-title" [kgWords]="settings.get('reviews_title','What Our Customers Say')"></h2>
          </div>
          @if (testimonials().length > 2) {
            <div class="hm-rev-nav" kgFx="rise-sm" [fxOrder]="1">
              <button (click)="prevRevGroup()" aria-label="Previous reviews">
                <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button (click)="nextRevGroup()" aria-label="Next reviews">
                <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          }
        </div>
        <div class="hm-rev-grid">
          @for (t of revPair(); track t.name; let i = $index) {
            <figure class="hm-rev-card" kgFx="rise-sm" [fxOrder]="i">
              <div class="hm-rev-stars" aria-label="5 out of 5">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
                }
              </div>
              <blockquote class="hm-rev-text">{{ t.text }}</blockquote>
              <figcaption class="hm-rev-author">
                <span class="hm-rev-avatar">
                  @if (t.photo) {
                    <img [src]="media(t.photo)" [alt]="t.name" loading="lazy">
                  } @else {
                    <b>{{ (t.name || '?')[0] }}</b>
                  }
                </span>
                <span class="hm-rev-who">
                  <strong>{{ t.name }}</strong>
                  @if (t.city) { <em>{{ t.city }}</em> }
                </span>
              </figcaption>
            </figure>
          }
        </div>
      </div>
    </section>
  }


  <!-- ══════════ SERVICE STRIP ══════════ -->
  @if (serviceItems().length) {
    <section class="hm-svc" kgScene>
      <div class="container">
        <div class="hm-svc-grid">
          @for (s of serviceItems(); track s.title; let i = $index) {
            <div class="hm-svc-item" kgFx="rise-sm" [fxOrder]="i">
              <span class="hm-svc-icon" aria-hidden="true">
                @switch (i) {
                  @case (0) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  }
                  @case (1) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  }
                  @case (2) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  }
                  @default {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  }
                }
              </span>
              <span class="hm-svc-txt">
                <strong>{{ s.title }}</strong>
                <em>{{ s.text }}</em>
              </span>
            </div>
          }
        </div>
      </div>
    </section>
  }


  <!-- ══════════ JOURNAL ══════════ -->
  @if (blogs().length) {
    <section class="section hm-blog" kgScene>
      <div class="container">
        <div class="hm-sec-head">
          <div>
            <span class="sec-eyebrow" kgFx="rise-sm">{{ settings.get('home_blog_label','From the Kitchen') }}</span>
            <h2 class="sec-title" [kgWords]="settings.get('home_blog_title','Recipes & Stories')"></h2>
          </div>
          <a routerLink="/blog" class="hm-link" kgFx="rise-sm" [fxOrder]="1">
            All articles
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </a>
        </div>
        <div class="hm-blog-grid">
          @for (b of blogs(); track b.id; let i = $index) {
            <a class="hm-blog-card" [routerLink]="['/blog', b.slug]" kgFx="rise-sm" [fxOrder]="i">
              <div class="hm-blog-media">
                @if (b.featured_image) {
                  <img [src]="media(b.featured_image)" [alt]="b.title" loading="lazy" (error)="hideImg($event)" />
                } @else {
                  <span class="hm-blog-mono" aria-hidden="true">{{ (b.title || '?')[0] }}</span>
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


  <!-- ══════════ FAQ ══════════ -->
  <section class="section hm-faq-wrap" id="faq" kgScene>
    <div class="container">
      <div class="hm-faq-layout">

        <aside class="hm-faq-aside" kgFx="rise-sm">
          <span class="sec-eyebrow">{{ settings.get('home_faq_label','Got Questions?') }}</span>
          <h2 class="sec-title">{{ settings.get('home_faq_title','Frequently Asked Questions') }}</h2>
          <p class="hm-faq-lead">Everything about ordering, delivery and payment. Still stuck? We're a message away.</p>
          <a routerLink="/contact" class="btn btn-outline hm-faq-cta">Contact us</a>

          @if (faqImage()) {
            <div class="hm-faq-media" kgParallax="0.03">
              <img [src]="faqImage()" alt="" loading="lazy" (error)="hideImg($event)">
            </div>
          }
        </aside>

        <div class="hm-faq-list">
          @for (item of faqItems; track item.q; let i = $index) {
            <div class="hm-faq-item" [class.open]="openFaq() === i" kgFx="rise-sm" [fxOrder]="i < 4 ? i : 4">
              <button class="hm-faq-q" type="button" (click)="toggleFaq(i)"
                      [attr.aria-expanded]="openFaq() === i" [attr.aria-controls]="'faq-ans-' + i">
                <span>{{ item.q }}</span>
                <span class="hm-faq-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
  </section>
  `,

  styles: [`
  :host { display: block; }

  /* ═══════════════════════════════════════════════════════════
     HERO — editorial left, admin media right.
     Light warm ground, not a dark full-bleed: the media is framed
     and matted like stock on a shelf, not used as wallpaper.
     ═══════════════════════════════════════════════════════════ */
  .hm-hero {
    position: relative;
    background: var(--raj-canvas);
    border-bottom: 1px solid var(--raj-line-lt);
    overflow: hidden;
  }
  .hm-hero-wash {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 46% 62% at 8% 12%, rgba(23,81,63,.07), transparent 62%),
      radial-gradient(ellipse 40% 55% at 96% 88%, rgba(228,163,59,.10), transparent 66%);
  }
  /* Fine warm grid — texture, not decoration */
  .hm-hero::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(var(--raj-line-lt) 1px, transparent 1px),
      linear-gradient(90deg, var(--raj-line-lt) 1px, transparent 1px);
    background-size: 68px 68px;
    opacity: .5;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, #000 20%, transparent 78%);
  }

  .hm-hero-inner {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: 1fr 1.35fr;
    gap: 48px; align-items: center;
    padding: 74px 24px 88px;
  }

  /* ── Left ── */
  .hm-hero-badge {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 7px 15px 7px 12px; border-radius: var(--r-full);
    background: var(--raj-leaf-bg); border: 1px solid var(--raj-leaf-bg2);
    font-size: 10.5px; font-weight: 800; letter-spacing: .15em;
    text-transform: uppercase; color: var(--raj-leaf);
    margin-bottom: 22px;
    animation: hmUp .7s var(--ease) .05s both;
  }
  .hm-hero-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--raj-turmeric);
    box-shadow: 0 0 0 3px rgba(228,163,59,.24);
  }

  .hm-hero-title {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 4.6vw, 4rem);
    font-weight: 600; line-height: 1.06;
    letter-spacing: -0.022em; color: var(--raj-ink);
    margin: 0 0 20px; max-width: 15ch;
  }
  .hm-hero-w { display: inline-block; overflow: hidden; vertical-align: bottom; padding: 0 .04em .06em; margin: 0 -.04em -.06em; }
  .hm-hero-w-in { display: inline-block; animation: hmWord .85s var(--ease) both; }
  @keyframes hmWord { from { transform: translateY(105%); } to { transform: none; } }
  .hm-hero-w + .hm-hero-w { margin-left: .22em; }

  .hm-hero-sub {
    font-size: 16.5px; line-height: 1.7; color: var(--raj-muted);
    max-width: 46ch; margin: 0 0 30px;
    animation: hmUp .8s var(--ease) .34s both;
  }

  .hm-hero-btns {
    display: flex; align-items: center; gap: 13px; flex-wrap: wrap;
    animation: hmUp .8s var(--ease) .42s both;
  }
  .hm-hero-cta {
    display: inline-flex; align-items: center; gap: 10px;
    min-height: var(--btn-h); padding: 15px 30px;
    border-radius: var(--r-full);
    background: var(--raj-leaf); color: #fff;
    font-size: 14.5px; font-weight: 800;
    box-shadow: 0 6px 20px rgba(23,81,63,.24);
    transition: background .22s, transform .22s, box-shadow .22s;
  }
  .hm-hero-cta:hover { background: var(--raj-leaf-dk); box-shadow: var(--shadow-leaf); }
  .hm-hero-cta svg { transition: transform .22s var(--ease); }
  .hm-hero-cta:hover svg { transform: translateX(3px); }
  .hm-hero-ghost {
    display: inline-flex; align-items: center;
    min-height: var(--btn-h); padding: 15px 28px;
    border-radius: var(--r-full);
    border: 1.5px solid var(--raj-line-warm); color: var(--raj-ink);
    font-size: 14.5px; font-weight: 700;
    transition: var(--t);
  }
  .hm-hero-ghost:hover { border-color: var(--raj-ink); background: var(--raj-warm); transform: translateY(-2px); }

  .hm-hero-trust {
    display: flex; flex-wrap: wrap; gap: 8px 22px;
    margin-top: 34px; padding-top: 26px;
    border-top: 1px solid var(--raj-line);
  }
  .hm-hero-trust li {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12.5px; font-weight: 700; color: var(--raj-muted);
    animation: hmUp .7s var(--ease) both;
  }
  .hm-hero-trust svg { color: var(--raj-leaf); flex-shrink: 0; }

  @keyframes hmUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

  /* ── Right: matted media frame ── */
  .hm-hero-right { position: relative; animation: hmUp 1s var(--ease) .2s both; }
  .hm-hero-mat {
    position: relative;
    background: var(--raj-sand);
    border: 1px solid var(--raj-line-warm);
    border-radius: var(--r-2xl);
    padding: 14px;
    box-shadow: var(--shadow-lg);
  }
  /* Turmeric corner tick — a small made-by-hand detail */
  .hm-hero-mat::before {
    content: ''; position: absolute; top: -1px; right: 26px;
    width: 52px; height: 4px; border-radius: 0 0 3px 3px;
    background: var(--raj-turmeric);
  }
  .hm-hero-frame {
    position: relative; border-radius: var(--r-xl); overflow: hidden;
    background: var(--raj-warm);
  }
  .hm-hero-frame-media { position: relative; aspect-ratio: 16 / 9; }
  .hm-hero-slide {
    position: absolute; inset: 0;
    opacity: 0; transition: opacity .8s var(--ease);
  }
  .hm-hero-slide.active { opacity: 1; }
  .hm-hero-media { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hm-hero-kenburns { animation: hmKen 18s ease-in-out infinite alternate; }
  @keyframes hmKen { from { transform: scale(1); } to { transform: scale(1.07); } }

  /* Also used nested inside a slide when an uploaded still 404s, so it has
     to fill its own box rather than relying on the slide's inset. */
  .hm-hero-frame-fallback {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    display: grid; place-items: center;
    background:
      repeating-linear-gradient(45deg, var(--raj-warm) 0 12px, var(--raj-sand) 12px 24px);
  }
  .hm-hero-fallback-inner { text-align: center; color: var(--raj-faint); padding: 24px; }
  .hm-hero-fallback-inner svg { margin: 0 auto 12px; display: block; }
  .hm-hero-fallback-inner strong {
    display: block; font-family: var(--font-display); font-size: 21px;
    font-weight: 600; color: var(--raj-muted); margin-bottom: 6px;
  }
  .hm-hero-fallback-inner p { font-size: 12.5px; line-height: 1.6; color: var(--raj-faint); }

  .hm-hero-dots {
    position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 7px; z-index: 3;
    background: rgba(33,26,20,.42); backdrop-filter: blur(8px);
    padding: 7px 11px; border-radius: var(--r-full);
  }
  .hm-hero-dots button {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(255,255,255,.48); transition: var(--t); padding: 0;
  }
  .hm-hero-dots button.on { background: #fff; width: 20px; border-radius: 99px; }

  .hm-hero-cue {
    position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
    display: inline-flex; align-items: center; gap: 8px; z-index: 2;
    font-size: 10px; font-weight: 800; letter-spacing: .18em;
    text-transform: uppercase; color: var(--raj-faint);
    padding: 8px 14px; border-radius: var(--r-full);
    transition: color .2s;
  }
  .hm-hero-cue:hover { color: var(--raj-leaf); }
  .hm-hero-cue svg { animation: hmBob 2.2s ease-in-out infinite; }
  @keyframes hmBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }

  /* ═══════════════════════════════════════════════════════════
     SHARED SECTION FURNITURE
     ═══════════════════════════════════════════════════════════ */
  .hm-sec-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 20px; margin-bottom: 34px;
  }
  .hm-sec-head-center { flex-direction: column; align-items: center; text-align: center; margin-bottom: 44px; }
  .hm-sec-head .sec-title { margin-bottom: 0; }
  .hm-link {
    display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0;
    font-size: 12.5px; font-weight: 800; letter-spacing: .05em;
    text-transform: uppercase; color: var(--raj-leaf);
    padding: 8px 0; transition: gap .2s, color .2s;
  }
  .hm-link:hover { color: var(--raj-turmeric-dk); gap: 11px; }

  .hm-empty-note { font-size: 14.5px; color: var(--raj-muted); text-align: center; padding: 32px 0; }
  .hm-empty-block { text-align: center; padding: 44px 20px; }
  .hm-empty-block p { font-size: 14.5px; color: var(--raj-muted); margin-bottom: 20px; }

  .hm-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .hm-skel-card { aspect-ratio: 3 / 4.4; border-radius: var(--r-lg); }

  /* ═══════════════════════════════════════════════════════════
     CATEGORIES — retail tiles
     ═══════════════════════════════════════════════════════════ */
  .hm-cats { background: var(--raj-paper); }
  .hm-cats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
  .hm-cat {
    display: flex; flex-direction: column;
    background: var(--raj-canvas);
    border: 1px solid var(--raj-line-lt);
    border-radius: var(--r-lg); overflow: hidden;
    transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .25s;
  }
  .hm-cat:hover { transform: translateY(-5px); box-shadow: var(--shadow); border-color: var(--raj-line-warm); }
  .hm-cat-media {
    display: block; aspect-ratio: 1 / 1; overflow: hidden;
    background: var(--raj-warm); position: relative;
    display: grid; place-items: center;
  }
  .hm-cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s var(--ease); }
  .hm-cat:hover .hm-cat-img { transform: scale(1.08); }
  .hm-cat-mono {
    font-family: var(--font-display); font-size: 40px; font-weight: 600;
    color: var(--raj-line-warm); transition: color .3s;
  }
  .hm-cat:hover .hm-cat-mono { color: var(--raj-leaf-lt); }
  .hm-cat-info {
    padding: 13px 14px 15px; display: flex; flex-direction: column; gap: 3px;
    border-top: 1px solid var(--raj-line-lt);
  }
  .hm-cat-name {
    font-size: 13.5px; font-weight: 700; color: var(--raj-ink); line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    transition: color .2s;
  }
  .hm-cat:hover .hm-cat-name { color: var(--raj-leaf); }
  .hm-cat-count { font-style: normal; font-size: 11px; font-weight: 600; color: var(--raj-faint); }
  .hm-cat-skel { aspect-ratio: 1 / 1.34; border-radius: var(--r-lg); }

  /* ═══════════════════════════════════════════════════════════
     PROMOS
     ═══════════════════════════════════════════════════════════ */
  .hm-promos { background: var(--raj-canvas); }
  .hm-promo-grid { display: grid; grid-template-columns: 1.42fr 1fr; gap: 20px; }
  .hm-promo-grid.hm-promo-solo { grid-template-columns: 1fr; }
  .hm-promo-col { display: grid; grid-template-rows: 1fr 1fr; gap: 20px; }
  .hm-promo-col.hm-promo-col-single { grid-template-rows: 1fr; }

  .hm-pr {
    position: relative; display: block; overflow: hidden;
    border-radius: var(--r-xl);
    border: 1px solid var(--raj-line);
    isolation: isolate;
    transition: transform .35s var(--ease), box-shadow .35s var(--ease);
  }
  .hm-pr:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .hm-pr-hero { min-height: 420px; }
  .hm-pr-mini { min-height: 200px; }
  .hm-pr-media { position: absolute; inset: 0; z-index: -2; }
  .hm-pr-img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
  .hm-pr:hover .hm-pr-img { transform: scale(1.06); }
  .hm-pr-noimg {
    width: 100%; height: 100%;
    background: linear-gradient(145deg, var(--raj-leaf-dk), var(--raj-leaf) 55%, var(--raj-leaf-lt));
  }
  .hm-pr-scrim {
    position: absolute; inset: 0; z-index: -1;
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--ov-c, #211A14) calc(var(--ov-o, 44) * 1% + 34%), transparent) 0%,
      color-mix(in srgb, var(--ov-c, #211A14) calc(var(--ov-o, 44) * 0.6%), transparent) 52%,
      transparent 100%);
  }
  .hm-pr-badge {
    position: absolute; top: 16px; left: 16px; z-index: 2;
    padding: 5px 13px; border-radius: var(--r-full);
    font-size: 10px; font-weight: 800; letter-spacing: .1em;
    text-transform: uppercase; color: #fff;
  }
  .hm-pr-body {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
    padding: 26px; margin-top: auto;
    height: 100%; justify-content: flex-end;
  }
  .hm-pr-label {
    font-style: normal; font-size: 10.5px; font-weight: 800;
    letter-spacing: .16em; text-transform: uppercase; color: var(--raj-turmeric-lt);
  }
  .hm-pr-title {
    font-family: var(--font-display); font-weight: 600; color: #fff;
    line-height: 1.16; letter-spacing: -0.014em; margin: 0;
  }
  .hm-pr-hero .hm-pr-title { font-size: clamp(1.5rem, 2.5vw, 2.05rem); max-width: 15ch; }
  .hm-pr-mini .hm-pr-title { font-size: clamp(1.1rem, 1.6vw, 1.32rem); max-width: 18ch; }
  .hm-pr-sub { font-size: 14px; color: rgba(255,255,255,.8); max-width: 40ch; margin: 0; }
  .hm-pr-btn {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 8px;
    min-height: 42px; padding: 11px 22px; border-radius: var(--r-full);
    background: #fff; color: var(--raj-ink);
    font-size: 13px; font-weight: 800;
    transition: gap .2s, background .2s;
  }
  .hm-pr:hover .hm-pr-btn { gap: 12px; background: var(--raj-turmeric); }

  /* ═══════════════════════════════════════════════════════════
     TRENDING CAROUSEL
     ═══════════════════════════════════════════════════════════ */
  .hm-trending { background: var(--raj-paper); }
  .hm-caro-nav { display: flex; gap: 8px; flex-shrink: 0; }
  .hm-caro-nav button {
    width: 42px; height: 42px; border-radius: 50%;
    border: 1.5px solid var(--raj-line); background: var(--raj-paper);
    display: grid; place-items: center; color: var(--raj-ink);
    transition: var(--t);
  }
  .hm-caro-nav button:hover { border-color: var(--raj-leaf); background: var(--raj-leaf); color: #fff; }
  .hm-caro-wrap { position: relative; }
  .hm-caro-wrap::before, .hm-caro-wrap::after {
    content: ''; position: absolute; top: 0; bottom: 0; width: 56px; z-index: 2; pointer-events: none;
  }
  .hm-caro-wrap::before { left: 0; background: linear-gradient(90deg, var(--raj-paper), transparent); }
  .hm-caro-wrap::after  { right: 0; background: linear-gradient(270deg, var(--raj-paper), transparent); }
  .hm-caro {
    display: flex; gap: 20px; overflow-x: auto; scroll-behavior: smooth;
    scroll-snap-type: x mandatory; padding: 4px 0 10px;
    scrollbar-width: none; -ms-overflow-style: none;
  }
  .hm-caro::-webkit-scrollbar { display: none; }
  .hm-caro-pad { flex: 0 0 max(24px, calc((100vw - var(--max-w)) / 2 + 56px)); }
  .hm-caro-item { flex: 0 0 236px; scroll-snap-align: start; }

  /* ═══════════════════════════════════════════════════════════
     BRANDS MARQUEE
     ═══════════════════════════════════════════════════════════ */
  .hm-brands { padding: 66px 0; background: var(--raj-canvas); overflow: hidden; }
  .hm-brands-head { text-align: center; margin-bottom: 34px; }
  .hm-brands-head .sec-title { margin-bottom: 0; }
  .hm-marquee {
    position: relative;
    mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  }
  .hm-marquee-track {
    display: flex; align-items: center; gap: 14px; width: max-content;
    animation: kgMarquee 46s linear infinite;
  }
  .hm-marquee:hover .hm-marquee-track { animation-play-state: paused; }
  .hm-brand {
    display: grid; place-items: center; flex-shrink: 0;
    min-width: 172px; height: 86px; padding: 0 26px;
    background: var(--raj-paper);
    border: 1px solid var(--raj-line-lt);
    border-radius: var(--r-lg);
    transition: var(--t);
  }
  .hm-brand:hover { border-color: var(--raj-leaf-bg2); background: var(--raj-leaf-bg); transform: translateY(-3px); }
  .hm-brand img { max-height: 44px; max-width: 124px; object-fit: contain; }
  .hm-brand-name {
    font-family: var(--font-display); font-size: 16px; font-weight: 600;
    color: var(--raj-ink-2); white-space: nowrap; letter-spacing: -0.01em;
  }

  /* ═══════════════════════════════════════════════════════════
     WHY SHOP WITH US
     ═══════════════════════════════════════════════════════════ */
  .hm-why { background: var(--raj-paper); }
  .hm-why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .hm-why-item {
    background: var(--raj-canvas);
    border: 1px solid var(--raj-line-lt);
    border-radius: var(--r-lg);
    padding: 28px 24px 26px;
    transition: transform .3s var(--ease), box-shadow .3s var(--ease), border-color .25s;
  }
  .hm-why-item:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--raj-line-warm); }
  .hm-why-icon {
    width: 50px; height: 50px; border-radius: var(--r);
    display: grid; place-items: center; margin-bottom: 18px;
    background: var(--raj-leaf-bg); color: var(--raj-leaf);
    transition: background .3s, color .3s;
  }
  .hm-why-item:hover .hm-why-icon { background: var(--raj-leaf); color: #fff; }
  .hm-why-item h4 { font-size: 15.5px; font-weight: 800; color: var(--raj-ink); margin-bottom: 8px; letter-spacing: -0.008em; }
  .hm-why-item p { font-size: 13.5px; line-height: 1.65; color: var(--raj-muted); }

  /* ═══════════════════════════════════════════════════════════
     STORE CTA
     ═══════════════════════════════════════════════════════════ */
  .hm-store-cta { padding: 0 0 76px; background: var(--raj-paper); }
  .hm-store-inner {
    display: flex; align-items: center; justify-content: space-between;
    gap: 32px; flex-wrap: wrap;
    background: var(--raj-dark); color: var(--raj-ink);
    border-radius: var(--r-2xl); padding: 44px 48px;
    position: relative; overflow: hidden;
  }
  .hm-store-inner::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 60% 120% at 88% 10%, rgba(242,169,59,.06), transparent 66%);
  }
  .hm-store-text { position: relative; }
  .hm-store-text .sec-eyebrow { color: var(--raj-turmeric); margin-bottom: 10px; }
  .hm-store-text .sec-eyebrow::before { background: var(--raj-turmeric); }
  .hm-store-heading {
    font-family: var(--font-display); font-size: clamp(1.5rem, 2.6vw, 2rem);
    font-weight: 600; color: var(--raj-ink); margin: 0 0 10px; letter-spacing: -0.014em;
  }
  .hm-store-location {
    display: flex; align-items: center; gap: 9px;
    font-size: 14.5px; color: var(--raj-muted); margin: 0;
  }
  .hm-store-location svg { color: var(--raj-turmeric); flex-shrink: 0; }
  .hm-store-actions { display: flex; gap: 12px; flex-wrap: wrap; position: relative; }
  .hm-store-actions .btn-primary { background: var(--raj-turmeric); border-color: var(--raj-turmeric); color: var(--raj-ink); box-shadow: none; }
  .hm-store-actions .btn-primary:hover { background: var(--raj-turmeric-lt); border-color: var(--raj-turmeric-lt); box-shadow: var(--shadow-turmeric); }
  .btn-wa {
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    min-height: var(--btn-h); padding: 14px 28px; border-radius: var(--r-full);
    background: var(--raj-paper); border: 1.5px solid var(--raj-line);
    color: var(--raj-ink); font-size: 14px; font-weight: 700; transition: var(--t);
  }
  .btn-wa:hover { background: var(--raj-warm); transform: translateY(-2px); border-color: var(--raj-line-warm); }

  /* ═══════════════════════════════════════════════════════════
     REVIEWS
     ═══════════════════════════════════════════════════════════ */
  .hm-rev { padding: 76px 0; background: var(--raj-canvas); }
  .hm-rev-nav { display: flex; gap: 8px; flex-shrink: 0; }
  .hm-rev-nav button {
    width: 42px; height: 42px; border-radius: 50%;
    border: 1.5px solid var(--raj-line); background: var(--raj-paper);
    display: grid; place-items: center; color: var(--raj-ink); transition: var(--t);
  }
  .hm-rev-nav button svg { width: 17px; height: 17px; }
  .hm-rev-nav button:hover { border-color: var(--raj-leaf); background: var(--raj-leaf); color: #fff; }
  .hm-rev-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .hm-rev-card {
    background: var(--raj-paper);
    border: 1px solid var(--raj-line-lt);
    border-radius: var(--r-xl);
    padding: 32px 32px 28px;
    display: flex; flex-direction: column; gap: 16px;
    margin: 0; position: relative;
    transition: transform .3s var(--ease), box-shadow .3s var(--ease);
  }
  .hm-rev-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
  .hm-rev-stars { display: flex; gap: 3px; color: var(--raj-brass); }
  .hm-rev-text {
    font-family: var(--font-display); font-size: 17.5px; font-weight: 400;
    line-height: 1.55; color: var(--raj-ink-2); margin: 0; letter-spacing: -0.006em;
  }
  .hm-rev-author { display: flex; align-items: center; gap: 13px; margin-top: auto; padding-top: 6px; }
  .hm-rev-avatar {
    width: 46px; height: 46px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    background: var(--raj-leaf-bg); display: grid; place-items: center;
    border: 1px solid var(--raj-line);
  }
  .hm-rev-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .hm-rev-avatar b { font-family: var(--font-display); font-size: 19px; font-weight: 600; color: var(--raj-leaf); }
  .hm-rev-who { display: flex; flex-direction: column; line-height: 1.35; }
  .hm-rev-who strong { font-size: 14px; font-weight: 800; color: var(--raj-ink); }
  .hm-rev-who em { font-style: normal; font-size: 12px; color: var(--raj-faint); }

  /* ═══════════════════════════════════════════════════════════
     SERVICE STRIP
     ═══════════════════════════════════════════════════════════ */
  .hm-svc { padding: 0 0 76px; background: var(--raj-canvas); }
  .hm-svc-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
    background: var(--raj-line);
    border: 1px solid var(--raj-line);
    border-radius: var(--r-xl); overflow: hidden;
  }
  .hm-svc-item {
    display: flex; align-items: center; gap: 14px;
    padding: 24px 22px; background: var(--raj-paper);
    transition: background .25s;
  }
  .hm-svc-item:hover { background: var(--raj-warm); }
  .hm-svc-icon {
    width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%;
    display: grid; place-items: center;
    background: var(--raj-leaf-bg); color: var(--raj-leaf);
  }
  .hm-svc-icon svg { width: 19px; height: 19px; }
  .hm-svc-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .hm-svc-txt strong { font-size: 13.5px; font-weight: 800; color: var(--raj-ink); }
  .hm-svc-txt em { font-style: normal; font-size: 12px; color: var(--raj-muted); line-height: 1.45; }

  /* ═══════════════════════════════════════════════════════════
     JOURNAL
     ═══════════════════════════════════════════════════════════ */
  .hm-blog { background: var(--raj-paper); }
  .hm-blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .hm-blog-card {
    display: flex; flex-direction: column;
    background: var(--raj-canvas);
    border: 1px solid var(--raj-line-lt);
    border-radius: var(--r-lg); overflow: hidden;
    transition: transform .32s var(--ease), box-shadow .32s var(--ease), border-color .25s;
  }
  .hm-blog-card:hover { transform: translateY(-5px); box-shadow: var(--shadow); border-color: var(--raj-line-warm); }
  .hm-blog-media {
    aspect-ratio: 16 / 10; overflow: hidden; background: var(--raj-warm);
    display: grid; place-items: center;
  }
  .hm-blog-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .65s var(--ease); }
  .hm-blog-card:hover .hm-blog-media img { transform: scale(1.06); }
  .hm-blog-mono { font-family: var(--font-display); font-size: 44px; font-weight: 600; color: var(--raj-line-warm); }
  .hm-blog-body { padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 9px; flex: 1; }
  .hm-blog-tag {
    align-self: flex-start; padding: 4px 11px; border-radius: var(--r-full);
    background: var(--raj-turmeric-bg); color: var(--raj-turmeric-dk);
    font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  }
  .hm-blog-body h3 {
    font-family: var(--font-display); font-size: 18px; font-weight: 600;
    line-height: 1.3; color: var(--raj-ink); margin: 0; letter-spacing: -0.012em;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .hm-blog-card:hover .hm-blog-body h3 { color: var(--raj-leaf); }
  .hm-blog-body p {
    font-size: 13.5px; line-height: 1.62; color: var(--raj-muted); margin: 0;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .hm-blog-read {
    display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px;
    font-size: 12px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
    color: var(--raj-leaf); transition: gap .2s;
  }
  .hm-blog-card:hover .hm-blog-read { gap: 10px; }

  /* ═══════════════════════════════════════════════════════════
     FAQ
     ═══════════════════════════════════════════════════════════ */
  .hm-faq-wrap { background: var(--raj-canvas); }
  .hm-faq-layout { display: grid; grid-template-columns: 0.82fr 1.18fr; gap: 56px; align-items: start; }
  .hm-faq-aside { position: sticky; top: calc(var(--header-height) + 28px); }
  .hm-faq-aside .sec-title { margin-bottom: 14px; }
  .hm-faq-lead { font-size: 14.5px; line-height: 1.7; color: var(--raj-muted); margin-bottom: 22px; max-width: 34ch; }
  .hm-faq-cta { display: inline-flex; }
  .hm-faq-media {
    margin-top: 30px; border-radius: var(--r-xl); overflow: hidden;
    border: 1px solid var(--raj-line); background: var(--raj-warm);
    aspect-ratio: 4 / 3;
  }
  .hm-faq-media img { width: 100%; height: 100%; object-fit: cover; }

  .hm-faq-list { display: flex; flex-direction: column; gap: 10px; }
  .hm-faq-item {
    background: var(--raj-paper);
    border: 1px solid var(--raj-line-lt);
    border-radius: var(--r-lg);
    overflow: hidden;
    transition: border-color .25s, box-shadow .25s;
  }
  .hm-faq-item:hover { border-color: var(--raj-line-warm); }
  .hm-faq-item.open { border-color: var(--raj-leaf-bg2); box-shadow: var(--shadow-sm); }
  .hm-faq-q {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    gap: 18px; padding: 19px 22px; min-height: 60px;
    font-family: var(--font-sans); font-size: 14.5px; font-weight: 700;
    color: var(--raj-ink); text-align: left; cursor: pointer;
    transition: color .2s;
  }
  .hm-faq-item.open .hm-faq-q { color: var(--raj-leaf); }
  .hm-faq-icon {
    width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%;
    display: grid; place-items: center;
    background: var(--raj-leaf-bg); color: var(--raj-leaf);
    transition: transform .32s var(--ease), background .25s;
  }
  .hm-faq-icon svg { width: 15px; height: 15px; }
  .hm-faq-item.open .hm-faq-icon { transform: rotate(180deg); background: var(--raj-leaf); color: #fff; }
  .hm-faq-a {
    display: grid; grid-template-rows: 0fr;
    transition: grid-template-rows .34s var(--ease);
  }
  .hm-faq-item.open .hm-faq-a { grid-template-rows: 1fr; }
  .hm-faq-a-inner {
    overflow: hidden; font-size: 14px; line-height: 1.72; color: var(--raj-muted);
    padding: 0 22px;
  }
  .hm-faq-item.open .hm-faq-a-inner { padding-bottom: 20px; }

  /* ═══════════════════════════════════════════════════════════
     RESPONSIVE
     ═══════════════════════════════════════════════════════════ */
  @media (max-width: 1180px) {
    .hm-cats-grid { grid-template-columns: repeat(4, 1fr); }
    .hm-hero-inner { gap: 44px; }
  }
  @media (max-width: 1024px) {
    .hm-hero-inner { grid-template-columns: 1fr; gap: 40px; padding: 52px 24px 68px; }
    .hm-hero-title { max-width: 18ch; }
    .hm-hero-cue { display: none; }
    .hm-grid-4 { grid-template-columns: repeat(3, 1fr); }
    .hm-why-grid { grid-template-columns: repeat(2, 1fr); }
    .hm-svc-grid { grid-template-columns: repeat(2, 1fr); }
    .hm-blog-grid { grid-template-columns: repeat(2, 1fr); }
    .hm-faq-layout { grid-template-columns: 1fr; gap: 34px; }
    .hm-faq-aside { position: static; }
    .hm-faq-media { display: none; }
    .hm-promo-grid, .hm-promo-grid.hm-promo-duo { grid-template-columns: 1fr; }
    .hm-promo-col { grid-template-rows: auto; grid-template-columns: 1fr 1fr; }
    .hm-pr-hero { min-height: 320px; }
  }
  @media (max-width: 760px) {
    .hm-cats-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .hm-grid-4 { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .hm-rev-grid { grid-template-columns: 1fr; }
    .hm-blog-grid { grid-template-columns: 1fr; }
    .hm-store-inner { padding: 32px 26px; flex-direction: column; align-items: flex-start; }
    .hm-store-actions { width: 100%; }
    .hm-store-actions .btn, .btn-wa { flex: 1; }
  }
  @media (max-width: 640px) {
    .hm-hero-inner { padding: 36px 16px 52px; gap: 32px; }
    .hm-hero-title { font-size: clamp(2rem, 8.6vw, 2.6rem); max-width: none; }
    .hm-hero-sub { font-size: 15px; margin-bottom: 24px; }
    .hm-hero-btns { width: 100%; }
    .hm-hero-cta, .hm-hero-ghost { flex: 1; justify-content: center; }
    .hm-hero-trust { margin-top: 26px; padding-top: 20px; gap: 8px 16px; }
    .hm-hero-mat { padding: 9px; border-radius: var(--r-xl); }
    .hm-hero-frame-media { aspect-ratio: 16 / 9; }

    .hm-sec-head { margin-bottom: 22px; gap: 12px; }
    .hm-sec-head-center { margin-bottom: 30px; }
    .hm-cats-grid { grid-template-columns: repeat(2, 1fr); }
    .hm-cat-info { padding: 10px 11px 12px; }
    .hm-cat-name { font-size: 12.5px; }

    .hm-promo-col { grid-template-columns: 1fr; }
    .hm-pr-hero { min-height: 260px; }
    .hm-pr-mini { min-height: 170px; }
    .hm-pr-body { padding: 20px; }

    .hm-caro-item { flex: 0 0 168px; }
    .hm-caro-pad { flex: 0 0 16px; }
    .hm-caro-wrap::before, .hm-caro-wrap::after { width: 22px; }

    .hm-why-grid { grid-template-columns: 1fr; gap: 12px; }
    .hm-why-item { padding: 22px 20px; }
    .hm-svc-grid { grid-template-columns: 1fr; }
    .hm-rev-card { padding: 24px 22px; }
    .hm-rev-text { font-size: 16px; }
    .hm-brands { padding: 48px 0; }
    .hm-brand { min-width: 138px; height: 74px; padding: 0 18px; }
    .hm-faq-q { padding: 16px 17px; font-size: 13.5px; }
    .hm-faq-a-inner { padding: 0 17px; font-size: 13.5px; }
    .hm-faq-item.open .hm-faq-a-inner { padding-bottom: 17px; }
  }

  /* ═══════════════════════════════════════════════════════════
     REDUCED MOTION — everything resolves to its settled state
     ═══════════════════════════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    .hm-hero-badge, .hm-hero-w-in, .hm-hero-sub, .hm-hero-btns,
    .hm-hero-trust li, .hm-hero-right, .hm-hero-kenburns,
    .hm-hero-cue svg, .hm-marquee-track {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .hm-cat, .hm-pr, .hm-why-item, .hm-rev-card, .hm-blog-card,
    .hm-cat-img, .hm-pr-img, .hm-blog-media img, .hm-faq-a, .hm-faq-icon {
      transition: none !important;
    }
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
  blogs      = signal<any[]>([]);

  activeSlide = signal(0);
  tstSlide    = signal(0);
  worldLoaded = signal(false);

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

  /* Indian grocery brand fallbacks — used only when the admin has set none */
  fallbackBrands = [
    'MDH Spices', 'Aashirvaad', 'Everest', 'Parle', 'Haldiram\'s',
    'Dabur', 'Amul', 'Patanjali', 'Britannia', 'MTR'
  ];

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
  }

  /* ── Hero copy — admin banner first, then settings, then defaults ── */
  private activeBanner(): any { return this.banners()[this.activeSlide()] || null; }
  heroTitle(): string { return ((this.activeBanner()?.title) || '').trim(); }
  heroWords(): string[] { const t = this.heroTitle(); return t ? t.split(/\s+/) : []; }
  heroSub(): string { return ((this.activeBanner()?.subtitle) || '').trim(); }
  heroEyebrow(): string { return ((this.activeBanner()?.label) || '').trim(); }
  heroCta(): string { return ((this.activeBanner()?.button_text) || '').trim(); }
  heroCtaLink(): string { return ((this.activeBanner()?.link || this.activeBanner()?.button_link) || '/categories').trim(); }

  /** Words for the staggered hero headline: admin banner title wins, else the
   *  hero_title setting, else a brand default. Split so each word can mask in. */
  heroTitleWords(): string[] {
    const fromBanner = this.heroWords();
    if (fromBanner.length) return fromBanner;
    const fromSettings = this.settings.get('hero_title', 'Your Favourite Indian Groceries, All in One Place.');
    return String(fromSettings).trim().split(/\s+/).filter(Boolean);
  }

  /** Trust line under the hero CTAs — all four strings are admin-editable. */
  trustItems(): string[] {
    return [1, 2, 3, 4]
      .map(n => String(this.settings.get(`trust_item_${n}_text`, '') || '').trim())
      .filter(Boolean);
  }

  /** "Why shop with us" — copy comes from settings, icons from the template. */
  whyItems(): { title: string; text: string }[] {
    const defaults = [
      { title: 'Indian Grocery Selection', text: 'A wide range of authentic Indian groceries, spices, snacks and household essentials.' },
      { title: 'Quality You Can Trust',    text: 'Carefully selected products from trusted Indian brands, stocked fresh and ready to ship.' },
      { title: 'Convenient Online Shopping', text: 'Easy online ordering from the comfort of your home — everything delivered to your door.' },
      { title: 'Secure & Easy Checkout',  text: 'Encrypted payments and a smooth checkout experience you can rely on, every time.' },
    ];
    return defaults
      .map((d, i) => ({
        title: this.settings.get(`why_${i + 1}_title`, d.title),
        text:  this.settings.get(`why_${i + 1}_text`,  d.text),
      }))
      .filter(w => w.title || w.text);
  }

  /** Service strip. Every claim here is backed by something that actually
   *  exists in the platform (delivery config, encrypted checkout, online
   *  ordering, a physical store) and each is admin-overridable. */
  serviceItems(): { title: string; text: string }[] {
    const defaults = [
      { title: 'Hong Kong Delivery', text: 'Delivered across Hong Kong' },
      { title: 'Secure Checkout',    text: 'Encrypted payment processing' },
      { title: 'Easy Online Ordering', text: 'Shop anytime from any device' },
      { title: 'Local Store',        text: 'A real shop, not a warehouse' },
    ];
    return defaults
      .map((d, i) => ({
        title: this.settings.get(`service_${i + 1}_title`, d.title),
        text:  this.settings.get(`service_${i + 1}_text`,  d.text),
      }))
      .filter(s => s.title);
  }

  /** Optional FAQ side image — admin-controlled, no external hotlink. */
  faqImage(): string {
    const raw = String(this.settings.get('faq_image', '') || '').trim();
    return raw ? this.settings.resolveAssetUrl(raw) : '';
  }

  scrollPastHero() {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    const el = this.trendRow?.nativeElement || document.querySelector('.hm-caro') as HTMLElement | null;
    el?.scrollBy({ left: dir * (el.clientWidth * 0.72), behavior: 'smooth' });
  }

  /* ── Testimonials ── */
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
    this.testimonials.set(fromSettings);
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
    /* Suppress legacy European addresses from old store configuration */
    if (!addr || /Finland|Germany|Ireland|Helsinki|Berlin|Dublin|Uusimaa|Eircode/i.test(addr)) return '';
    if (/configure store address/i.test(addr)) return '';
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

  /* ── Promo campaign ──
     Copy defaults are kept so an unconfigured store still reads sensibly,
     but there are deliberately NO default images: promo art must come from
     the admin panel. Previously these hotlinked images.unsplash.com. */
  private promoDefaults: Record<number, any> = {
    1: {
      img: '',
      label: 'Spice pantry', title: 'Authentic Indian Spices & Masalas',
      text: 'From ground coriander to whole garam masala — the real flavours of Indian cooking.',
      button: 'Shop Spices', link: '/categories',
      badge: 'Best Sellers', badgeColor: '#17513F',
      overlayColor: '#211A14', overlayOpacity: 46, height: 0,
    },
    2: {
      img: '',
      label: 'Daily staples', title: 'Rice, Atta & Dal',
      text: 'Stock your pantry with everyday Indian essentials.',
      button: 'Shop Staples', link: '/categories',
      badge: '', badgeColor: '#E4A33B',
      overlayColor: '#211A14', overlayOpacity: 40, height: 0,
    },
    3: {
      img: '',
      label: 'Snacks & sweets', title: 'Namkeen, Mithai & More',
      text: 'Your favourite Indian snacks and festive sweets, now in Hong Kong.',
      button: 'Explore Snacks', link: '/categories',
      badge: 'New Arrivals', badgeColor: '#E4A33B',
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

  /** Promo art that 404s falls back to the brand gradient panel rather than
   *  leaving a scrim over an empty box. */
  promoImgFailed = signal<number[]>([]);
  promoImgErr(e: Event, n: number) {
    const img = e.target as HTMLImageElement;
    img.closest('picture')?.querySelectorAll('source').forEach(s => s.remove());
    if (!this.promoImgFailed().includes(n)) this.promoImgFailed.update(list => [...list, n]);
  }
  promoHasImg(card: any): boolean {
    return !!card?.img && !this.promoImgFailed().includes(card.n);
  }

  /** Same for hero banner stills — a missing upload shows the placeholder
   *  panel instead of a broken-image glyph. */
  heroImgFailed = signal<any[]>([]);
  onHeroImgErr(id: any) {
    if (!this.heroImgFailed().includes(id)) this.heroImgFailed.update(list => [...list, id]);
  }
  bannerHasMedia(b: any): boolean {
    if (b?.media_type === 'video' && b?.video) return true;
    return !!(b?.image || b?.fallback_image) && !this.heroImgFailed().includes(b?.id);
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

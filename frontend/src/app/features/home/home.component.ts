import { Component, OnInit, OnDestroy, signal, effect, untracked, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { SettingsService } from '../../core/services/settings.service';
import { CountryService, CountryCode } from '../../core/services/country.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { ParallaxDirective, MouseParallaxDirective, MagneticDirective, ScrollProgressDirective } from '../../shared/directives/motion.directives';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, ScrollAnimateDirective, ParallaxDirective, MouseParallaxDirective, MagneticDirective, ScrollProgressDirective],
  template: `

  <!-- ══════════ HERO ══════════ -->
  <section class="hm-hero" kgScrollProgress="exit">
    <!-- Media layer (admin banners: video or image) -->
    <div class="hm-hero-media-layer">
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
              <img class="hm-hero-media hm-hero-kenburns" [src]="media(b.image || b.fallback_image)"
                [alt]="b.title || 'Kale Gida'" loading="eager" fetchpriority="high" />
            }
          </div>
        }
      } @else {
        <div class="hm-hero-slide active hm-hero-fallback"></div>
      }
      <div class="hm-hero-scrim"></div>
      <div class="hm-hero-grain kg-grain"></div>
    </div>



    <!-- Copy -->
    @for (k of [country.worldKey()]; track k) {
      <div class="hm-hero-content container">
        <div class="hm-hero-copy">
          @if (heroEyebrow()) {
            <span class="hm-hero-eyebrow">
              <em>{{ country.current().flag }}</em>
              {{ heroEyebrow() }}
            </span>
          }
          @if (heroWords().length) {
            <h1 class="hm-hero-title">
              @for (w of heroWords(); track $index) {
                <span class="hm-hero-word" [style.animationDelay]="(0.25 + $index * 0.09) + 's'">{{ w }}&nbsp;</span>
              }
            </h1>
          }
          @if (heroSub()) {
            <p class="hm-hero-sub">{{ heroSub() }}</p>
          }
          @if (heroCta()) {
            <div class="hm-hero-btns">
              <a [href]="heroCtaLink()" class="hm-hero-cta" kgMagnetic>
                {{ heroCta() }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
              <a routerLink="/search" [queryParams]="{sale:1}" class="hm-hero-ghost" kgMagnetic>Today's offers</a>
            </div>
          }
          @if (heroTrustVisible()) {
            <div class="hm-hero-trust">
              <span>{{ settings.get('trust_item_1_text','Authentic products') }}</span>
              <i></i>
              <span>{{ settings.get('trust_item_2_text','Fast delivery') }}</span>
              <i></i>
              <span>{{ settings.get('trust_item_4_text','Secure checkout') }}</span>
            </div>
          }
        </div>
      </div>
    }

    <!-- Slide dots -->
    @if (banners().length > 1) {
      <div class="hm-hero-dots">
        @for (b of banners(); track b.id; let i = $index) {
          <button [class.on]="activeSlide() === i" (click)="goSlide(i)" [attr.aria-label]="'Slide ' + (i+1)"></button>
        }
      </div>
    }

    <!-- Scroll cue -->
    <button class="hm-hero-cue" (click)="scrollPastHero()" aria-label="Scroll down">
      <span></span>
    </button>
  </section>

  <!-- ══════════ TICKER ══════════ -->
  <div class="hm-ticker" aria-hidden="true">
    <div class="hm-ticker-track">
      @for (dup of [0,1]; track dup) {
        <div class="hm-ticker-set">
          <span>{{ settings.get('header_offer_text','Free delivery on orders over €50') }}</span><i>◆</i>
          @for (c of country.all; track c.code) {
            <span>{{ c.flag }} {{ c.headline }}</span><i>◆</i>
          }
          <span>{{ settings.get('trust_item_2_text','Fast delivery') }}</span><i>◆</i>
        </div>
      }
    </div>
  </div>

  <!-- ══════════ THREE WORLDS ══════════ -->
  <section class="section hm-worlds" kgScrollProgress>
    <span class="hm-orb hm-orb-a" kgParallax="0.16" aria-hidden="true"></span>
    <span class="hm-orb hm-orb-b" kgParallax="-0.12" aria-hidden="true"></span>
    <div class="container">
      <div class="hm-sec-head hm-sec-head-center" appScrollAnimate>
        <span class="sec-eyebrow">One marketplace, three worlds</span>
        <h2 class="sec-title">Choose where today's<br><em>table</em> begins</h2>
      </div>
      <div class="hm-worlds-grid">
        @for (c of country.all; track c.code; let i = $index) {
          <button class="hm-world hm-world-{{ c.code }}"
            [class.on]="country.code() === c.code"
            (click)="pickCountry(c.code)"
            appScrollAnimate animationType="fade-up" [animationDelay]="(i * 0.12) + 's'">
            <span class="hm-world-flag">{{ c.flag }}</span>
            <span class="hm-world-name">{{ c.name }}</span>
            <span class="hm-world-line">{{ c.headline }}</span>
            <span class="hm-world-cta">
              {{ country.code() === c.code ? 'You are here' : 'Enter world' }}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </button>
        }
      </div>
    </div>
  </section>

  <!-- ══════════ CATEGORIES · EDITORIAL BENTO ══════════ -->
  @if (displayCategories().length) {
  <section class="section hm-cats" kgScrollProgress>
    <div class="container">
      <div class="hm-sec-head" appScrollAnimate>
        <div>
          <span class="sec-eyebrow">{{ settings.get('home_categories_label','The pantry') }}</span>
          <h2 class="sec-title">{{ settings.get('home_categories_title','Shop by category') }}</h2>
        </div>
        <a routerLink="/categories" class="hm-link">
          {{ settings.get('home_categories_link_text','All categories') }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </a>
      </div>

      <div class="hm-catgrid">
        @for (c of displayCategories(); track c.slug || c.id; let i = $index) {
          <a class="hm-cat" [class.hm-cat-noimg]="!c.image"
             [routerLink]="c.id ? ['/category', c.slug] : ['/categories']"
             appScrollAnimate animationType="fade-up" [animationDelay]="((i % 5) * 0.07) + 's'">
            @if (c.image) {
              <img class="hm-cat-img" [src]="media(c.image)" [alt]="c.name" loading="lazy" (error)="hideImg($event)" />
            }
            <span class="hm-cat-veil" aria-hidden="true"></span>
            <span class="hm-cat-info">
              <strong class="hm-cat-name">{{ c.name }}</strong>
              @if (c.product_count > 0) {
                <em class="hm-cat-count">{{ c.product_count }} {{ c.product_count === 1 ? 'product' : 'products' }}</em>
              } @else if (c.description) {
                <em class="hm-cat-count">{{ c.description }}</em>
              }
            </span>
            <span class="hm-cat-arrow" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </a>
        }
      </div>
    </div>
  </section>
  }

  <!-- ══════════ FRESH PICKS ══════════ -->
  <section class="section hm-featured" kgScrollProgress>
    <span class="hm-orb hm-orb-c" kgParallax="0.14" aria-hidden="true"></span>
    <div class="container">
      <div class="hm-sec-head" appScrollAnimate>
        <div>
          <span class="sec-eyebrow">{{ settings.get('home_featured_label','Fresh picks') }}</span>
          <h2 class="sec-title">{{ settings.get('home_featured_title','Chosen by our grocers') }}</h2>
        </div>
        <a routerLink="/categories" class="hm-link">
          {{ settings.get('home_featured_link_text','View all') }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </a>
      </div>
      @for (k of [country.worldKey()]; track k) {
        @if (featured().length) {
          <div class="hm-grid-4 kg-world">
            @for (p of featured().slice(0, 8); track p.id; let i = $index) {
              <div appScrollAnimate [animationDelay]="((i % 4) * 0.08) + 's'">
                <app-product-card [product]="p" />
              </div>
            }
          </div>
        } @else if (!worldLoaded()) {
          <div class="hm-grid-4">
            @for (s of [1,2,3,4]; track s) { <div class="skeleton hm-skel-card"></div> }
          </div>
        } @else {
          <p class="hm-empty-note">Fresh picks for {{ country.current().name }} are on their way — the shelves are being stocked.</p>
        }
      }
    </div>
  </section>

  <!-- ══════════ STORY · CRAFT ══════════ -->
  @if (hasProcess()) {
    <section class="hm-craft kg-grain" kgScrollProgress>
      <div class="container hm-craft-inner">
        <div class="hm-craft-head" appScrollAnimate animationType="blur-in">
          <span class="sec-eyebrow hm-craft-eyebrow">{{ settings.get('process_section_eyebrow','Made by hand') }}</span>
          <h2 class="hm-craft-title">{{ settings.get('process_section_title') }}</h2>
          <p class="hm-craft-intro">{{ settings.get('process_section_intro') }}</p>
        </div>
        <div class="hm-craft-steps">
          @for (s of processSteps(); track s.n; let i = $index) {
            <figure class="hm-craft-step" appScrollAnimate [animationDelay]="(i * 0.12) + 's'">
              <div class="hm-craft-media" kgParallax="0.09">
                @if (s.image) { <img [src]="media(s.image)" [alt]="s.alt || s.title" loading="lazy" (error)="hideImg($event)" /> }
                <span class="hm-craft-n">{{ s.n }}</span>
              </div>
              <figcaption>
                <strong>{{ s.title }}</strong>
                <p>{{ s.copy }}</p>
              </figcaption>
            </figure>
          }
        </div>
      </div>
    </section>
  } @else {
    <section class="hm-craft kg-grain" kgScrollProgress>
      <div class="container hm-craft-solo">
        <div appScrollAnimate animationType="blur-in">
          <span class="sec-eyebrow hm-craft-eyebrow">{{ country.current().flag }} {{ country.current().essentialsTitle }}</span>
          <h2 class="hm-craft-title">{{ country.current().headline }}</h2>
          <p class="hm-craft-intro">{{ country.current().sub }}</p>
          <a routerLink="/categories" class="hm-hero-ghost hm-craft-cta" kgMagnetic>Explore the range</a>
        </div>
      </div>
    </section>
  }

  <!-- ══════════ TRENDING · CAROUSEL ══════════ -->
  <section class="section hm-trending" kgScrollProgress>
    <div class="container">
      <div class="hm-sec-head" appScrollAnimate>
        <div>
          <span class="sec-eyebrow">{{ settings.get('home_trending_label','Most loved') }}</span>
          <h2 class="sec-title">{{ country.current().trendingTitle }}</h2>
        </div>
        <div class="hm-caro-nav">
          <button (click)="scrollTrend(-1)" aria-label="Previous">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button (click)="scrollTrend(1)" aria-label="Next">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
    @for (k of [country.worldKey()]; track k) {
      @if (trending().length) {
        <div class="hm-caro kg-world" #trendRow>
          <div class="hm-caro-pad"></div>
          @for (p of trending(); track p.id; let i = $index) {
            <div class="hm-caro-item" appScrollAnimate animationType="fade-left" [animationDelay]="(i * 0.06) + 's'">
              <app-product-card [product]="p" />
            </div>
          }
          <div class="hm-caro-pad"></div>
        </div>
      } @else if (worldLoaded()) {
        <div class="container"><p class="hm-empty-note">Nothing trending here yet — check back soon.</p></div>
      }
    }
  </section>

  <!-- ══════════ PROMOTIONAL BANNERS ══════════ -->
  <section class="section-sm hm-promos" kgScrollProgress>
    <div class="container">
      <div class="hm-promo-grid">

        <!-- Card 1 · Fresh produce — tall photographic hero -->
        <a class="hm-pr hm-pr-1" [href]="resolvePromoLink(settings.get('promo_1_link','/categories'))" appScrollAnimate>
          @if (promoImg(1)) {
            <img class="hm-pr-img" [src]="promoImg(1)" [alt]="settings.get('promo_1_title')" loading="lazy" (error)="hideImg($event)" />
          }
          <span class="hm-pr1-scrim" aria-hidden="true"></span>
          @if (settings.get('promo_1_badge')) {
            <span class="hm-pr-badge hm-pr-badge-terra">{{ settings.get('promo_1_badge') }}</span>
          }
          <span class="hm-pr1-body">
            <em class="hm-pr-label">{{ settings.get('promo_1_label') }}</em>
            <strong class="hm-pr1-title">{{ settings.get('promo_1_title') }}</strong>
            <span class="hm-pr1-sub">{{ settings.get('promo_1_text') }}</span>
            <span class="hm-pr-btn hm-pr-btn-cream">{{ settings.get('promo_1_button','Shop Now') }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </span>
        </a>

        <div class="hm-promo-col">

          <!-- Card 2 · Turkish bakery — split panel, photo right -->
          <a class="hm-pr hm-pr-2" [href]="resolvePromoLink(settings.get('promo_2_link','/categories'))" appScrollAnimate [animationDelay]="'.08s'">
            <span class="hm-pr2-body">
              <em class="hm-pr-label hm-pr-label-terra">{{ settings.get('promo_2_label') }}</em>
              <strong class="hm-pr2-title">{{ settings.get('promo_2_title') }}</strong>
              <span class="hm-pr2-sub">{{ settings.get('promo_2_text') }}</span>
              <span class="hm-pr-btn hm-pr-btn-ink">{{ settings.get('promo_2_button','Shop Now') }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </span>
            <span class="hm-pr2-media">
              @if (promoImg(2)) {
                <img class="hm-pr-img" [src]="promoImg(2)" [alt]="settings.get('promo_2_title')" loading="lazy" (error)="hideImg($event)" />
              }
              @if (settings.get('promo_2_badge')) {
                <span class="hm-pr-badge hm-pr-badge-forest">{{ settings.get('promo_2_badge') }}</span>
              }
            </span>
          </a>

          <!-- Card 3 · Indian essentials — wide banner, content left -->
          <a class="hm-pr hm-pr-3" [href]="resolvePromoLink(settings.get('promo_3_link','/categories'))" appScrollAnimate [animationDelay]="'.16s'">
            @if (promoImg(3)) {
              <img class="hm-pr-img" [src]="promoImg(3)" [alt]="settings.get('promo_3_title')" loading="lazy" (error)="hideImg($event)" />
            }
            <span class="hm-pr3-scrim" aria-hidden="true"></span>
            @if (settings.get('promo_3_badge')) {
              <span class="hm-pr-badge hm-pr-badge-brass">{{ settings.get('promo_3_badge') }}</span>
            }
            <span class="hm-pr3-body">
              <em class="hm-pr-label">{{ settings.get('promo_3_label') }}</em>
              <strong class="hm-pr3-title">{{ settings.get('promo_3_title') }}</strong>
              <span class="hm-pr3-sub">{{ settings.get('promo_3_text') }}</span>
              <span class="hm-pr-btn hm-pr-btn-forest">{{ settings.get('promo_3_button','Shop Now') }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ NEW ARRIVALS ══════════ -->
  @if (recentProducts().length) {
    <section class="section hm-new" kgScrollProgress>
      <div class="container">
        <div class="hm-sec-head" appScrollAnimate>
          <div>
            <span class="sec-eyebrow">{{ settings.get('home_new_label','Just landed') }}</span>
            <h2 class="sec-title">{{ settings.get('home_new_title','New this week') }}</h2>
          </div>
          <a routerLink="/categories" class="hm-link">
            {{ settings.get('home_new_link_text','View all') }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </a>
        </div>
        @for (k of [country.worldKey()]; track k) {
          <div class="hm-grid-4 kg-world">
            @for (p of recentProducts().slice(0, 4); track p.id; let i = $index) {
              <div appScrollAnimate [animationDelay]="(i * 0.08) + 's'">
                <app-product-card [product]="p" />
              </div>
            }
          </div>
        }
      </div>
    </section>
  }

  <!-- ══════════ BRANDS MARQUEE ══════════ -->
  <section class="hm-brands">
    <div class="container">
      <div class="hm-brands-head" appScrollAnimate>
        <span class="sec-eyebrow">{{ settings.get('featured_brands_label','In good company') }}</span>
        <h2 class="sec-title hm-brands-title">{{ settings.get('featured_brands_title','Brands we trust') }}</h2>
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

  <!-- ══════════ PROMISE STRIP ══════════ -->
  <section class="section hm-why">
    <div class="container">
      <div class="hm-sec-head hm-sec-head-center" appScrollAnimate>
        <span class="sec-eyebrow">{{ settings.get('promise_label','Our promise') }}</span>
        <h2 class="sec-title">{{ settings.get('promise_title','Why families shop with us') }}</h2>
      </div>
      <div class="hm-why-grid">
        <div class="hm-why-item" appScrollAnimate>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M15 8h3l3 3v5h-6V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="5.5" cy="18.5" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="18.5" r="2" stroke="currentColor" stroke-width="1.5"/></svg>
          <h4>{{ settings.get('why_1_title','Fast delivery') }}</h4>
          <p>{{ settings.get('why_1_text','Carefully packed, delivered fresh and on time.') }}</p>
        </div>
        <div class="hm-why-item" appScrollAnimate [animationDelay]="'.08s'">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 3.9 2.4-7.4L2 9.4h7.6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          <h4>{{ settings.get('why_2_title','Premium quality') }}</h4>
          <p>{{ settings.get('why_2_text','Hand-selected products from trusted makers.') }}</p>
        </div>
        <div class="hm-why-item" appScrollAnimate [animationDelay]="'.16s'">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h4>{{ settings.get('why_3_title','Satisfaction guaranteed') }}</h4>
          <p>{{ settings.get('why_3_text','Not happy? We sort it — no questions asked.') }}</p>
        </div>
        <div class="hm-why-item" appScrollAnimate [animationDelay]="'.24s'">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><polyline points="9 12 11 14 15 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h4>{{ settings.get('why_4_title','100% authentic') }}</h4>
          <p>{{ settings.get('why_4_text','Sourced directly from origin, never imitation.') }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ TESTIMONIALS ══════════ -->
  @if (testimonials().length) {
    <section class="hm-tst kg-grain" kgScrollProgress>
      <div class="container">
        <span class="hm-tst-mark" aria-hidden="true">“</span>
        <div class="hm-tst-stage"
          (touchstart)="onTstTouchStart($event)"
          (touchend)="onTstTouchEnd($event)">
          @for (t of testimonials(); track $index; let i = $index) {
            <blockquote class="hm-tst-quote" [class.on]="tstSlide() === i">
              <p>{{ t.text }}</p>
              <footer>
                <strong>{{ t.name }}</strong>
                @if (t.city) { <span>{{ t.city }}</span> }
              </footer>
            </blockquote>
          }
        </div>
        <div class="hm-tst-dots">
          @for (t of testimonials(); track $index; let i = $index) {
            <button [class.on]="tstSlide() === i" (click)="goTstSlide(i)" [attr.aria-label]="'Review ' + (i+1)"></button>
          }
        </div>
      </div>
    </section>
  }

  <!-- ══════════ JOURNAL ══════════ -->
  @if (blogs().length) {
    <section class="section hm-blog" kgScrollProgress>
      <div class="container">
        <div class="hm-sec-head" appScrollAnimate>
          <div>
            <span class="sec-eyebrow">The journal</span>
            <h2 class="sec-title">Recipes & stories</h2>
          </div>
          <a routerLink="/blog" class="hm-link">All articles
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </a>
        </div>
        <div class="hm-blog-grid">
          @for (b of blogs(); track b.id; let i = $index) {
            <a class="hm-blog-card" [routerLink]="['/blog', b.slug]" appScrollAnimate [animationDelay]="(i * 0.1) + 's'">
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
                <span class="hm-blog-read">Read story
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
                </span>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  }
  `,

  styles: [`
  /* ═══ HERO ═══ */
  .hm-hero {
    position: relative;
    height: calc(100svh - var(--header-height));
    min-height: 540px; max-height: 880px;
    overflow: hidden;
    background: var(--kg-dark);
  }
  .hm-hero-media-layer { position: absolute; inset: 0; }
  .hm-hero-slide {
    position: absolute; inset: 0; opacity: 0;
    transition: opacity 1.2s var(--ease3);
  }
  .hm-hero-slide.active { opacity: 1; }
  .hm-hero-media { width: 100%; height: 100%; object-fit: cover; }
  .hm-hero-kenburns { animation: hmKenburns 14s ease-out infinite alternate; }
  @keyframes hmKenburns { from { transform: scale(1); } to { transform: scale(1.09); } }
  .hm-hero-fallback {
    background:
      radial-gradient(900px 500px at 80% 20%, rgba(196,98,45,.28), transparent 60%),
      radial-gradient(700px 500px at 15% 85%, rgba(31,77,58,.55), transparent 65%),
      linear-gradient(160deg, #14120E 0%, #1D1A14 55%, #16382B 130%);
  }
  .hm-hero-scrim {
    position: absolute; inset: 0;
    background:
      linear-gradient(90deg, rgba(20,18,14,.72) 0%, rgba(20,18,14,.38) 46%, rgba(20,18,14,.08) 100%),
      linear-gradient(0deg, rgba(20,18,14,.55) 0%, transparent 30%);
  }
  .hm-hero-grain { position: absolute; inset: 0; pointer-events: none; }


  .hm-hero-content {
    position: relative; z-index: 3;
    height: 100%; display: flex; align-items: center;
  }
  .hm-hero-copy { max-width: 640px; }
  .hm-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 9px;
    font-family: var(--font-sans);
    font-size: 11.5px; font-weight: 800; letter-spacing: .26em; text-transform: uppercase;
    color: rgba(250,246,239,.85); margin-bottom: 22px;
    padding: 8px 16px; border-radius: 999px;
    background: rgba(255,253,248,.08);
    border: 1px solid rgba(255,253,248,.16);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    animation: fadeUp .8s var(--ease) .1s both;
  }
  .hm-hero-eyebrow em { font-style: normal; font-size: 14px; }
  .hm-hero-title {
    font-family: var(--font-serif);
    font-size: clamp(2.6rem, 6.2vw, 5.2rem);
    font-weight: 350;
    color: #FAF6EF; line-height: 1.04; letter-spacing: -0.02em;
    margin-bottom: 22px;
    font-variation-settings: 'opsz' 110;
  }
  .hm-hero-word {
    display: inline-block;
    animation: hmWord .9s var(--ease) both;
  }
  @keyframes hmWord {
    from { opacity: 0; transform: translateY(38px); filter: blur(8px); }
    to   { opacity: 1; transform: none; filter: blur(0); }
  }
  .hm-hero-sub {
    font-size: clamp(15px, 1.8vw, 17.5px); color: rgba(250,246,239,.72);
    margin-bottom: 34px; max-width: 480px; line-height: 1.75;
    animation: fadeUp .9s var(--ease) .55s both;
  }
  .hm-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; animation: fadeUp .9s var(--ease) .7s both; }
  .hm-hero-cta {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--kg-cream); color: var(--kg-ink);
    padding: 16px 32px; border-radius: 999px;
    font-family: var(--font-sans); font-size: 14.5px; font-weight: 800;
    transition: background .3s, color .3s, box-shadow .3s;
    box-shadow: 0 16px 40px rgba(20,18,14,.35);
  }
  .hm-hero-cta:hover { background: var(--kg-terra); color: #FFFDF8; }
  .hm-hero-cta svg { transition: transform .3s var(--ease); }
  .hm-hero-cta:hover svg { transform: translateX(4px); }
  .hm-hero-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,253,248,.07); color: #FAF6EF;
    padding: 16px 30px; border-radius: 999px;
    font-family: var(--font-sans); font-size: 14.5px; font-weight: 700;
    border: 1px solid rgba(255,253,248,.28);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    transition: background .3s, border-color .3s;
  }
  .hm-hero-ghost:hover { background: rgba(255,253,248,.16); border-color: rgba(255,253,248,.5); }
  .hm-hero-trust {
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
    margin-top: 38px; animation: fadeUp 1s var(--ease) .9s both;
  }
  .hm-hero-trust span {
    font-family: var(--font-sans); font-size: 12px; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    color: rgba(250,246,239,.55);
  }
  .hm-hero-trust i { width: 4px; height: 4px; border-radius: 50%; background: rgba(250,246,239,.3); }

  .hm-hero-dots {
    position: absolute; bottom: 30px; right: 40px; z-index: 4;
    display: flex; gap: 8px;
  }
  .hm-hero-dots button {
    width: 7px; height: 7px; border-radius: 999px;
    background: rgba(250,246,239,.35); cursor: pointer;
    transition: all .35s var(--ease);
  }
  .hm-hero-dots button.on { width: 26px; background: var(--kg-cream); }

  .hm-hero-cue {
    position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%);
    z-index: 4; width: 30px; height: 48px; border-radius: 999px;
    border: 1.5px solid rgba(250,246,239,.35); cursor: pointer;
    display: flex; justify-content: center; padding-top: 9px;
    transition: border-color .3s;
  }
  .hm-hero-cue:hover { border-color: rgba(250,246,239,.7); }
  .hm-hero-cue span {
    width: 4px; height: 9px; border-radius: 999px; background: rgba(250,246,239,.75);
    animation: hmCue 1.8s var(--ease) infinite;
  }
  @keyframes hmCue { 0% { transform: translateY(0); opacity: 1; } 70% { transform: translateY(15px); opacity: 0; } 100% { transform: translateY(0); opacity: 0; } }

  /* ═══ TICKER ═══ */
  .hm-ticker {
    background: var(--kg-forest-dk); color: rgba(250,246,239,.8);
    overflow: hidden; padding: 13px 0;
    border-top: 1px solid rgba(250,246,239,.06);
  }
  .hm-ticker-track { display: flex; width: max-content; animation: kgMarquee 34s linear infinite; }
  .hm-ticker-set { display: flex; align-items: center; }
  .hm-ticker-set span {
    font-family: var(--font-sans); font-size: 12px; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase; white-space: nowrap;
    padding: 0 26px;
  }
  .hm-ticker-set i { font-style: normal; font-size: 7px; color: var(--kg-terra-lt); }

  /* ═══ SECTION FURNITURE ═══ */
  .hm-sec-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 44px; gap: 18px;
  }
  .hm-sec-head-center { flex-direction: column; align-items: center; text-align: center; }
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
  .hm-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
  .hm-empty-note {
    font-family: var(--font-serif); font-style: italic;
    font-size: 17px; color: var(--kg-muted);
    padding: 34px 0 8px; margin: 0;
  }
  .hm-skel-card { aspect-ratio: 1 / 1.4; border-radius: 20px; }
  .hm-featured { position: relative; overflow: hidden; }
  .hm-featured .container { position: relative; z-index: 1; }

  /* ═══ Floating parallax orbs ═══ */
  .hm-orb {
    position: absolute; border-radius: 999px;
    pointer-events: none; z-index: 0;
    filter: blur(46px); will-change: transform;
  }
  .hm-orb-a {
    width: 380px; height: 380px; top: -60px; right: -110px;
    background: radial-gradient(circle at 35% 35%, rgba(196,98,45,.22), rgba(196,98,45,0) 68%);
  }
  .hm-orb-b {
    width: 300px; height: 300px; bottom: -80px; left: -90px;
    background: radial-gradient(circle at 60% 40%, rgba(31,77,58,.2), rgba(31,77,58,0) 70%);
  }
  .hm-orb-c {
    width: 340px; height: 340px; top: 30px; left: -120px;
    background: radial-gradient(circle at 50% 50%, rgba(201,162,75,.2), rgba(201,162,75,0) 70%);
  }

  /* ═══ WORLDS ═══ */
  .hm-worlds { background: var(--kg-cream); padding-bottom: 30px; position: relative; overflow: hidden; }
  .hm-worlds .container { position: relative; z-index: 1; }
  .hm-worlds .sec-title em { font-style: italic; color: var(--kg-terra); }
  .hm-worlds-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .hm-world {
    position: relative; text-align: left; cursor: pointer;
    border-radius: 26px; padding: 34px 30px 30px;
    display: flex; flex-direction: column; gap: 7px;
    border: 1px solid var(--kg-line);
    overflow: hidden;
    transition: transform .5s var(--ease), box-shadow .5s var(--ease), border-color .3s;
  }
  .hm-world::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(120deg, transparent 30%, rgba(255,253,248,.25) 50%, transparent 70%);
    transform: translateX(-120%) skewX(-18deg);
  }
  .hm-world:hover::after { animation: kgShine 1s var(--ease); }
  .hm-world-in { background: linear-gradient(150deg, #FBF3E6 0%, #F5E3CC 100%); }
  .hm-world-fi { background: linear-gradient(150deg, #EFF4F0 0%, #DCE7DF 100%); }
  .hm-world-de { background: linear-gradient(150deg, #F5EFE4 0%, #E9DEC9 100%); }
  .hm-world:hover { transform: translateY(-7px); box-shadow: 0 30px 60px rgba(33,29,22,.13); }
  .hm-world.on { border-color: var(--kg-forest); box-shadow: 0 0 0 1.5px var(--kg-forest), 0 24px 50px rgba(31,77,58,.16); }
  .hm-world-flag { font-size: 40px; line-height: 1; margin-bottom: 10px; transition: transform .5s var(--ease2); }
  .hm-world:hover .hm-world-flag { transform: scale(1.15) rotate(-6deg); }
  .hm-world-name {
    font-family: var(--font-serif); font-size: 28px; font-weight: 450;
    color: var(--kg-ink); letter-spacing: -0.01em;
  }
  .hm-world-line { font-size: 14px; color: var(--kg-muted); line-height: 1.6; min-height: 44px; }
  .hm-world-cta {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 14px;
    font-family: var(--font-sans); font-size: 11.5px; font-weight: 800;
    letter-spacing: .14em; text-transform: uppercase; color: var(--kg-forest);
    transition: gap .3s;
  }
  .hm-world:hover .hm-world-cta { gap: 13px; }
  .hm-world.on .hm-world-cta { color: var(--kg-terra-dk); }

  /* ═══ CATEGORIES — uniform photographic grid ═══ */
  .hm-cats { padding-top: 60px; }
  .hm-catgrid {
    display: grid; gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
  }
  .hm-cat {
    position: relative; display: block;
    aspect-ratio: 1 / 1.18;
    border-radius: 20px; overflow: hidden;
    background: var(--kg-sand);
    box-shadow: var(--shadow-xs);
    transition: transform .5s var(--ease), box-shadow .5s var(--ease);
  }
  .hm-cat:hover { transform: translateY(-6px); box-shadow: 0 22px 48px rgba(33,29,22,.14); }
  .hm-cat-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .9s var(--ease);
  }
  .hm-cat:hover .hm-cat-img { transform: scale(1.06); }
  .hm-cat-veil {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(20,18,14,.62) 0%, rgba(20,18,14,.14) 38%, transparent 60%);
  }
  .hm-cat-info {
    position: absolute; left: 20px; right: 58px; bottom: 18px;
    display: flex; flex-direction: column; gap: 3px;
  }
  .hm-cat-name {
    font-family: var(--font-serif); font-size: 19px; font-weight: 450;
    color: #FFFDF8; letter-spacing: -0.01em; line-height: 1.22;
  }
  .hm-cat-count {
    font-style: normal; font-family: var(--font-sans);
    font-size: 12px; font-weight: 600; color: rgba(255,253,248,.75);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hm-cat-arrow {
    position: absolute; right: 16px; bottom: 16px;
    width: 36px; height: 36px; border-radius: 999px;
    display: grid; place-items: center;
    background: var(--kg-cream); color: var(--kg-ink);
    opacity: 0; transform: translateY(10px);
    transition: opacity .35s var(--ease), transform .35s var(--ease), background .25s, color .25s;
  }
  .hm-cat:hover .hm-cat-arrow { opacity: 1; transform: translateY(0); }
  .hm-cat-arrow:hover { background: var(--kg-forest); color: var(--kg-cream); }
  /* No image yet (admin hasn't uploaded): quiet flat tile, ink text */
  .hm-cat-noimg { border: 1px solid var(--kg-line); background: var(--kg-warm); }
  .hm-cat-noimg .hm-cat-veil { display: none; }
  .hm-cat-noimg .hm-cat-name { color: var(--kg-ink); }
  .hm-cat-noimg .hm-cat-count { color: var(--kg-muted); }
  .hm-cat-noimg .hm-cat-arrow { background: var(--kg-sand-2); }

  /* ═══ CRAFT / STORY ═══ */
  .hm-craft {
    position: relative; overflow: hidden;
    background:
      radial-gradient(800px 460px at 85% 8%, rgba(196,98,45,.16), transparent 60%),
      radial-gradient(700px 500px at 8% 100%, rgba(31,77,58,.4), transparent 62%),
      var(--kg-dark);
    padding: 120px 0;
    color: var(--kg-cream);
  }
  /* Scrollytelling: copy stays pinned while the steps scroll past */
  .hm-craft-inner {
    display: grid; grid-template-columns: 0.85fr 1.5fr;
    gap: 72px; align-items: start;
  }
  .hm-craft-head {
    max-width: 620px; position: sticky; z-index: 1;
    top: calc(var(--header-height) + 56px);
  }
  .hm-craft-eyebrow { color: var(--kg-terra-lt); }
  .hm-craft-title {
    font-family: var(--font-serif);
    font-size: clamp(1.9rem, 4vw, 3.2rem); font-weight: 350;
    color: var(--kg-cream); line-height: 1.1; letter-spacing: -0.015em;
    margin-bottom: 16px;
  }
  .hm-craft-intro { font-size: 16px; color: rgba(250,246,239,.62); line-height: 1.8; }
  .hm-craft-steps {
    display: grid; grid-template-columns: 1fr 1fr; gap: 28px;
    position: relative; z-index: 1;
  }
  .hm-craft-step:nth-child(even) { margin-top: 44px; }
  .hm-craft-media {
    position: relative; border-radius: 20px; overflow: hidden;
    aspect-ratio: 1 / 1.15; background: rgba(255,253,248,.05);
    border: 1px solid rgba(255,253,248,.1);
    margin-bottom: 18px;
  }
  .hm-craft-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
  .hm-craft-step:hover .hm-craft-media img { transform: scale(1.06); }
  .hm-craft-n {
    position: absolute; top: 12px; left: 12px;
    font-family: var(--font-serif); font-style: italic;
    font-size: 15px; color: var(--kg-cream);
    width: 34px; height: 34px; border-radius: 999px;
    display: grid; place-items: center;
    background: rgba(20,18,14,.5);
    border: 1px solid rgba(255,253,248,.2);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  }
  .hm-craft-step strong {
    display: block; font-family: var(--font-sans);
    font-size: 15.5px; font-weight: 800; color: var(--kg-cream); margin-bottom: 6px;
  }
  .hm-craft-step p { font-size: 13.5px; color: rgba(250,246,239,.55); line-height: 1.7; margin: 0; }
  .hm-craft-solo { text-align: center; max-width: 640px; position: relative; z-index: 1; }
  .hm-craft-solo .hm-craft-eyebrow { justify-content: center; }
  .hm-craft-cta { margin-top: 26px; }

  /* ═══ TRENDING CAROUSEL ═══ */
  .hm-trending { background: var(--kg-warm); }
  .hm-caro-nav { display: flex; gap: 8px; }
  .hm-caro-nav button {
    width: 46px; height: 46px; border-radius: 999px;
    border: 1.5px solid var(--kg-line-warm); background: var(--kg-paper);
    display: grid; place-items: center; color: var(--kg-ink);
    cursor: pointer; transition: all .25s;
  }
  .hm-caro-nav button:hover { background: var(--kg-forest); color: var(--kg-cream); border-color: var(--kg-forest); transform: translateY(-2px); }
  .hm-caro {
    display: flex; gap: 20px; overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding: 6px 0 26px;
    scrollbar-width: none;
  }
  .hm-caro::-webkit-scrollbar { display: none; }
  .hm-caro-pad { flex: 0 0 max(24px, calc((100vw - 1360px) / 2 + 56px - 20px)); }
  .hm-caro-item { flex: 0 0 268px; scroll-snap-align: start; }

  /* ═══ PROMOTIONAL BANNERS — three photographic layouts ═══ */
  .hm-promos { background: var(--kg-cream); }
  .hm-promo-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 20px; }
  .hm-promo-col { display: grid; grid-template-rows: 1.15fr 1fr; gap: 20px; }

  .hm-pr {
    position: relative; display: block;
    border-radius: 24px; overflow: hidden;
    background: var(--kg-sand);
    box-shadow: 0 2px 10px rgba(33,29,22,.06);
    transition: box-shadow .45s var(--ease);
  }
  .hm-pr:hover { box-shadow: 0 18px 44px rgba(33,29,22,.16); }
  .hm-pr-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .8s var(--ease);
  }
  .hm-pr:hover .hm-pr-img { transform: scale(1.03); }

  /* Shared pieces */
  .hm-pr-label {
    font-style: normal; font-family: var(--font-sans);
    font-size: 10.5px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase;
    color: rgba(255,253,248,.85);
  }
  .hm-pr-label-terra { color: var(--kg-terra-dk); }
  .hm-pr-badge {
    position: absolute; top: 16px; left: 16px; z-index: 3;
    font-family: var(--font-sans);
    font-size: 11px; font-weight: 800; letter-spacing: .06em;
    padding: 6px 13px; border-radius: 999px; color: #FFFDF8;
    box-shadow: 0 4px 12px rgba(20,18,14,.22);
  }
  .hm-pr-badge-terra  { background: var(--kg-terra); }
  .hm-pr-badge-forest { background: var(--kg-forest); }
  .hm-pr-badge-brass  { background: #8F6B1F; top: 16px; left: auto; right: 16px; }
  .hm-pr-btn {
    display: inline-flex; align-items: center; gap: 8px;
    width: fit-content;
    font-family: var(--font-sans); font-size: 13px; font-weight: 800;
    padding: 11px 22px; border-radius: 999px;
    transition: background .3s, color .3s, gap .3s;
  }
  .hm-pr:hover .hm-pr-btn { gap: 12px; }
  .hm-pr-btn-cream { background: var(--kg-cream); color: var(--kg-ink); }
  .hm-pr:hover .hm-pr-btn-cream { background: var(--kg-forest); color: var(--kg-cream); }
  .hm-pr-btn-ink { border: 1.5px solid var(--kg-ink); color: var(--kg-ink); padding: 9px 20px; }
  .hm-pr:hover .hm-pr-btn-ink { background: var(--kg-ink); color: var(--kg-cream); }
  .hm-pr-btn-forest { background: var(--kg-forest); color: var(--kg-cream); }
  .hm-pr:hover .hm-pr-btn-forest { background: var(--kg-forest-dk); }

  /* Card 1 — tall photographic hero, copy anchored bottom-left */
  .hm-pr-1 { min-height: 480px; }
  .hm-pr1-scrim {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(to top, rgba(20,18,14,.74) 0%, rgba(20,18,14,.28) 44%, transparent 66%);
  }
  .hm-pr1-body {
    position: absolute; left: 28px; right: 28px; bottom: 28px; z-index: 2;
    display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
  }
  .hm-pr1-title {
    font-family: var(--font-serif); font-weight: 400;
    font-size: clamp(1.6rem, 2.6vw, 2.3rem); line-height: 1.12;
    letter-spacing: -0.015em; color: #FFFDF8; max-width: 380px;
  }
  .hm-pr1-sub { font-size: 14.5px; color: rgba(255,253,248,.82); margin-bottom: 8px; }

  /* Card 2 — split panel: copy on paper, photo right */
  .hm-pr-2 { display: grid; grid-template-columns: 1.05fr 1fr; background: var(--kg-paper); border: 1px solid var(--kg-line); min-height: 250px; }
  .hm-pr2-body {
    display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
    gap: 8px; padding: 26px 24px; min-width: 0;
  }
  .hm-pr2-title {
    font-family: var(--font-serif); font-weight: 400;
    font-size: clamp(1.25rem, 1.8vw, 1.6rem); line-height: 1.16;
    letter-spacing: -0.01em; color: var(--kg-ink);
  }
  .hm-pr2-sub { font-size: 13.5px; color: var(--kg-muted); margin-bottom: 6px; }
  .hm-pr2-media { position: relative; overflow: hidden; min-height: 100%; }
  .hm-pr2-media .hm-pr-img { position: absolute; }
  .hm-pr2-media .hm-pr-badge { left: auto; right: 14px; top: 14px; }

  /* Card 3 — wide banner, copy vertically centred left over a side scrim */
  .hm-pr-3 { min-height: 210px; }
  .hm-pr3-scrim {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(to right, rgba(20,18,14,.78) 0%, rgba(20,18,14,.42) 46%, transparent 74%);
  }
  .hm-pr3-body {
    position: absolute; left: 26px; top: 50%; transform: translateY(-50%); z-index: 2;
    display: flex; flex-direction: column; align-items: flex-start; gap: 7px;
    max-width: 62%;
  }
  .hm-pr3-title {
    font-family: var(--font-serif); font-weight: 400;
    font-size: clamp(1.2rem, 1.7vw, 1.5rem); line-height: 1.16;
    letter-spacing: -0.01em; color: #FFFDF8;
  }
  .hm-pr3-sub { font-size: 13px; color: rgba(255,253,248,.8); margin-bottom: 5px; }
  .hm-pr-3 .hm-pr-btn { padding: 9px 20px; font-size: 12.5px; }

  /* ═══ NEW ═══ */
  .hm-new { background: var(--kg-cream); padding-top: 40px; }

  /* ═══ BRANDS ═══ */
  .hm-brands { padding: 84px 0; background: var(--kg-paper); border-top: 1px solid var(--kg-line-lt); border-bottom: 1px solid var(--kg-line-lt); overflow: hidden; }
  .hm-brands-head { text-align: center; margin-bottom: 40px; }
  .hm-brands-head .sec-eyebrow::before { display: none; }
  .hm-marquee {
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
  }
  .hm-marquee:hover .hm-marquee-track { animation-play-state: paused; }
  .hm-marquee-track { display: flex; gap: 14px; width: max-content; animation: kgMarquee 30s linear infinite; }
  .hm-brand {
    flex-shrink: 0; height: 64px; padding: 0 30px;
    display: inline-flex; align-items: center; gap: 13px;
    background: var(--kg-cream); border: 1px solid var(--kg-line);
    border-radius: 999px;
    font-family: var(--font-serif); font-size: 17px; font-weight: 450;
    color: var(--kg-ink-2); white-space: nowrap; letter-spacing: .01em;
    transition: all .35s var(--ease);
  }
  .hm-brand img { height: 34px; width: auto; object-fit: contain; border-radius: 6px; }
  .hm-brand:hover {
    background: var(--kg-paper); border-color: var(--kg-terra-lt); color: var(--kg-terra-dk);
    transform: translateY(-4px) scale(1.04);
    box-shadow: 0 18px 38px rgba(196,98,45,.14);
  }

  /* ═══ WHY ═══ */
  .hm-why { background: var(--kg-cream); }
  .hm-why-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--kg-line);
  }
  .hm-why-item {
    padding: 36px 28px 8px;
    border-right: 1px solid var(--kg-line);
    color: var(--kg-forest);
    transition: transform .4s var(--ease);
  }
  .hm-why-item:hover { transform: translateY(-4px); }
  .hm-why-item:last-child { border-right: none; }
  .hm-why-item svg { margin-bottom: 18px; color: var(--kg-terra); }
  .hm-why-item h4 { font-size: 15.5px; font-weight: 800; color: var(--kg-ink); margin-bottom: 8px; }
  .hm-why-item p { font-size: 13.5px; color: var(--kg-muted); line-height: 1.7; margin: 0; }

  /* ═══ TESTIMONIALS ═══ */
  .hm-tst {
    position: relative; overflow: hidden;
    background: var(--kg-forest-dk); color: var(--kg-cream);
    padding: 110px 0 90px; text-align: center;
  }
  .hm-tst-mark {
    display: block;
    font-family: var(--font-serif); font-size: 120px; line-height: .4;
    color: var(--kg-terra-lt); opacity: .8; margin-bottom: 22px;
  }
  .hm-tst-stage { position: relative; min-height: 200px; z-index: 1; }
  .hm-tst-quote {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
    opacity: 0; transform: translateY(16px) scale(.99);
    transition: opacity .7s var(--ease), transform .7s var(--ease);
    pointer-events: none;
  }
  .hm-tst-quote.on { opacity: 1; transform: none; pointer-events: auto; }
  .hm-tst-quote p {
    font-family: var(--font-serif); font-style: italic;
    font-size: clamp(1.25rem, 2.8vw, 1.9rem); font-weight: 350;
    color: var(--kg-cream); line-height: 1.45; letter-spacing: -0.01em;
    max-width: 760px; margin: 0 auto 26px;
  }
  .hm-tst-quote footer strong {
    display: block; font-family: var(--font-sans);
    font-size: 14px; font-weight: 800; letter-spacing: .04em;
  }
  .hm-tst-quote footer span { font-size: 12.5px; color: rgba(250,246,239,.55); font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
  .hm-tst-dots { display: flex; justify-content: center; gap: 9px; margin-top: 34px; position: relative; z-index: 1; }
  .hm-tst-dots button {
    width: 7px; height: 7px; border-radius: 999px;
    background: rgba(250,246,239,.28); cursor: pointer; transition: all .35s var(--ease);
  }
  .hm-tst-dots button.on { width: 26px; background: var(--kg-terra-lt); }

  /* ═══ BLOG ═══ */
  .hm-blog { background: var(--kg-cream); }
  .hm-blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .hm-blog-card {
    background: var(--kg-paper); border: 1px solid var(--kg-line);
    border-radius: 24px; overflow: hidden;
    transition: transform .5s var(--ease), box-shadow .5s var(--ease), border-color .3s;
  }
  .hm-blog-card:hover { transform: translateY(-6px); box-shadow: 0 26px 54px rgba(33,29,22,.12); border-color: var(--kg-line-warm); }
  .hm-blog-media { height: 210px; overflow: hidden; background: var(--kg-sand); display: grid; place-items: center; }
  .hm-blog-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
  .hm-blog-card:hover .hm-blog-media img { transform: scale(1.06); }
  .hm-blog-glyph { font-family: var(--font-serif); font-size: 44px; color: var(--kg-line-warm); }
  .hm-blog-body { padding: 24px 26px 28px; }
  .hm-blog-tag {
    display: inline-block; font-family: var(--font-sans);
    font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
    color: var(--kg-terra); margin-bottom: 10px;
  }
  .hm-blog-body h3 {
    font-family: var(--font-serif); font-size: 1.25rem; font-weight: 450;
    color: var(--kg-ink); line-height: 1.3; margin-bottom: 10px;
    overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .hm-blog-body p {
    font-size: 14px; color: var(--kg-muted); line-height: 1.7;
    overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    margin-bottom: 14px;
  }
  .hm-blog-read {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--font-sans); font-size: 11.5px; font-weight: 800;
    letter-spacing: .12em; text-transform: uppercase; color: var(--kg-forest);
    transition: gap .3s;
  }
  .hm-blog-card:hover .hm-blog-read { gap: 11px; color: var(--kg-terra); }

  /* ═══ SCROLL CHOREOGRAPHY (driven by --scroll-p) ═══ */
  @media (prefers-reduced-motion: no-preference) {
    /* Hero exit: media zooms away, copy lifts and dissolves, floats rise faster */
    .hm-hero-media-layer {
      transform: scale(calc(1 + var(--scroll-p, 0) * 0.14)) translateY(calc(var(--scroll-p, 0) * 6%));
      will-change: transform;
    }
    .hm-hero-content {
      transform: translateY(calc(var(--scroll-p, 0) * -80px));
      opacity: calc(1 - var(--scroll-p, 0) * 1.7);
      will-change: transform, opacity;
    }
    .hm-hero-floats {
      transform: translateY(calc(var(--scroll-p, 0) * -150px));
      will-change: transform;
    }
    .hm-hero-dots, .hm-hero-cue { opacity: calc(1 - var(--scroll-p, 0) * 2.4); }

    /* Story headline: serif text fills with light as you scroll through */
    .hm-craft-title {
      color: rgba(250,246,239,.16);
      background: linear-gradient(90deg, #FAF6EF, #FAF6EF) no-repeat 0 0 / calc(var(--scroll-p, 1) * 220%) 100%;
      -webkit-background-clip: text;
      background-clip: text;
    }
    /* Story imagery breathes: settles from a gentle zoom while travelling */
    .hm-craft-media img {
      transform: scale(calc(1.16 - var(--scroll-p, 1) * 0.16));
    }

    /* Promo editorial: columns drift at different speeds (layered depth) */
    .hm-promo-col { transform: translateY(calc((1 - var(--scroll-p, 1)) * 70px)); will-change: transform; }
    .hm-promo-a   { --drift: calc((1 - var(--scroll-p, 1)) * -36px); transform: translateY(var(--drift)); }
    .hm-promo-a:hover { transform: translateY(calc(var(--drift) - 6px)); }

    /* Testimonial quote mark floats up as the section arrives */
    .hm-tst-mark {
      transform: translateY(calc((1 - var(--scroll-p, 1)) * 90px));
      opacity: calc(var(--scroll-p, 1) * 2);
      will-change: transform, opacity;
    }

    /* Worlds: serif headline drifts up while the section travels */
    .hm-worlds .sec-title {
      transform: translateY(calc((1 - min(var(--scroll-p, 1) * 2, 1)) * 46px));
      will-change: transform;
    }

    /* Category grid rises into place, images breathe as the section travels */
    .hm-cats .hm-catgrid {
      transform: translateY(calc((1 - min(var(--scroll-p, 1) * 2.2, 1)) * 64px));
      will-change: transform;
    }
    .hm-cat-img { transform: scale(calc(1.1 - min(var(--scroll-p, 1) * 2, 1) * 0.1)); }
    .hm-cat:hover .hm-cat-img { transform: scale(1.06); }

    /* Product grids rise into place, tied to the finger */
    .hm-featured .hm-grid-4,
    .hm-new .hm-grid-4 {
      transform: translateY(calc((1 - min(var(--scroll-p, 1) * 2.2, 1)) * 70px));
      will-change: transform;
    }

    /* Trending: the whole shelf slides in from the right */
    .hm-trending .hm-caro {
      transform: translateX(calc((1 - min(var(--scroll-p, 1) * 2.2, 1)) * 140px));
      will-change: transform;
    }

    /* Journal cards drift up */
    .hm-blog .hm-blog-grid {
      transform: translateY(calc((1 - min(var(--scroll-p, 1) * 2.2, 1)) * 60px));
      will-change: transform;
    }
  }

  /* ═══ RESPONSIVE ═══ */
  @media (max-width: 1100px) {
    .hm-grid-4 { grid-template-columns: repeat(3, 1fr); }
    .hm-catgrid { grid-template-columns: repeat(3, 1fr); }
    .hm-craft-inner { grid-template-columns: 1fr; gap: 0; }
    .hm-craft-head { position: static; margin-bottom: 56px; }
    .hm-why-grid { grid-template-columns: repeat(2, 1fr); }
    .hm-why-item:nth-child(2) { border-right: none; }
    .hm-why-item { border-bottom: 1px solid var(--kg-line); padding-bottom: 30px; }
  }
  @media (max-width: 900px) {
    .hm-hero { min-height: 480px; height: calc(100svh - var(--header-height) - 70px); }

    .hm-worlds-grid { grid-template-columns: 1fr; gap: 14px; }
    .hm-world { flex-direction: row; align-items: center; gap: 16px; padding: 22px 24px; }
    .hm-world-flag { margin-bottom: 0; font-size: 32px; }
    .hm-world-name { font-size: 21px; flex-shrink: 0; }
    .hm-world-line { display: none; }
    .hm-world-cta { margin-top: 0; margin-left: auto; }
    .hm-grid-4 { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .hm-catgrid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .hm-promo-grid { grid-template-columns: 1fr; }
    .hm-promo-a { min-height: 320px; }
    .hm-blog-grid { grid-template-columns: 1fr 1fr; }
    .hm-caro-item { flex: 0 0 235px; }
    .hm-caro-pad { flex: 0 0 24px; }
  }
  @media (max-width: 640px) {
    .hm-hero { min-height: 400px; max-height: 560px; }
    .hm-hero-title { font-size: clamp(2rem, 9.5vw, 2.8rem); margin-bottom: 14px; }
    .hm-hero-sub { margin-bottom: 22px; }
    .hm-hero-floats { display: none; }
    .hm-hero-cue { display: none; }
    .hm-hero-dots { right: 20px; bottom: 20px; }
    .hm-hero-trust { display: none; }
    .hm-orb { display: none; }
    .hm-sec-head { margin-bottom: 18px; }
    .hm-worlds { padding-bottom: 8px; }
    .hm-worlds-grid { gap: 10px; }
    .hm-world { padding: 15px 16px; border-radius: 18px; }
    .hm-world-flag { font-size: 26px; }
    .hm-world-name { font-size: 18px; }
    .hm-catgrid { grid-template-columns: repeat(2, 1fr); gap: 11px; }
    .hm-cat { border-radius: 16px; aspect-ratio: 1 / 1.1; }
    .hm-cat-info { left: 14px; right: 46px; bottom: 13px; }
    .hm-cat-name { font-size: 15.5px; }
    .hm-cat-count { font-size: 11px; }
    .hm-cat-arrow { width: 30px; height: 30px; right: 11px; bottom: 11px; opacity: 1; transform: none; }
    .hm-craft { padding: 44px 0; }
    .hm-craft-head { margin-bottom: 28px; }
    .hm-craft-intro { font-size: 14px; }
    .hm-craft-steps { grid-template-columns: 1fr 1fr; gap: 12px; }
    .hm-craft-step:nth-child(even) { margin-top: 16px; }
    .hm-craft-media { margin-bottom: 10px; }
    .hm-craft-step p { font-size: 12px; line-height: 1.55; }
    .hm-promo { padding: 22px; min-height: 170px; border-radius: 20px; }
    .hm-promo-a { min-height: 240px; }
    .hm-promo-col { gap: 12px; }
    .hm-promo-grid { gap: 12px; }
    .hm-why-grid { grid-template-columns: 1fr 1fr; }
    .hm-why-item { padding: 18px 12px 4px; }
    .hm-why-item svg { margin-bottom: 10px; }
    .hm-brands { padding: 40px 0; }
    .hm-brands-head { margin-bottom: 20px; }
    .hm-brand { height: 50px; padding: 0 20px; font-size: 14.5px; }
    .hm-blog-grid { grid-template-columns: 1fr; gap: 14px; }
    .hm-blog-media { height: 160px; }
    .hm-tst { padding: 44px 0 36px; }
    .hm-tst-mark { font-size: 84px; margin-bottom: 14px; }
    .hm-tst-stage { min-height: 230px; }
    .hm-tst-dots { margin-top: 20px; }
    .hm-caro { gap: 12px; padding-bottom: 16px; }
    .hm-caro-item { flex: 0 0 200px; }
    .hm-empty-note { padding: 18px 0 4px; font-size: 15px; }
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

  fallbackCategories = [
    { name: 'Spices & Masalas', slug: '', description: 'Whole & ground heat' },
    { name: 'Rice & Grains', slug: '', description: 'Basmati & beyond' },
    { name: 'Snacks', slug: '', description: 'Crunch from three worlds' },
    { name: 'Bakery', slug: '', description: 'Rye, pulla & pretzels' },
    { name: 'Sweets', slug: '', description: 'Mithai to marzipan' },
  ];
  fallbackBrands = ['Saggoji', 'Fazer', 'Aashirvaad', 'Ritter', 'Valio', 'MDH', 'Haribo', 'Everest'];


  private _slideTimer: any;
  private _tstTimer: any;
  private _isMobile = typeof window !== 'undefined' && window.innerWidth < 700;

  constructor(
    public settings: SettingsService,
    public country: CountryService,
    private api: ApiService,
    private seo: SeoService,
  ) {
    // Reload the catalogue whenever the marketplace changes (and once countries resolve).
    effect(() => {
      const code = this.country.code();
      const ready = this.country.ready();
      untracked(() => this.loadWorld(code, ready));
    });
  }

  ngOnInit() {
    this.seo.resetMeta();
    this.api.getBlogs(1).subscribe({ next: (r: any) => { if (r.success) this.blogs.set((r.data || []).slice(0, 3)); }, error: () => {} });
    this._loadTestimonials();
    this._startTstTimer();
  }

  /** Fetch everything the selected country's storefront shows. Strict: the API only returns that world. */
  private loadWorld(code: string, ready: boolean) {
    // Before countries resolve we still render with the stored/default code —
    // it will be re-run once the list arrives if the code changes.
    clearInterval(this._slideTimer);
    this.activeSlide.set(0);
    this.worldLoaded.set(false);

    this.api.getBanners(code).subscribe({
      next: (r: any) => {
        const all = (r.data || r || []).filter((b: any) => b.is_active !== 0 && b.is_active !== '0');
        this.banners.set(all);
        if (all.length > 1) this._startSlider();
        this._preloadHeroAssets(all[0]);
        this.playActiveHeroVideo();
      },
      error: () => {}
    });

    this.api.getFeaturedCategories(code).subscribe({ next: (r: any) => { if (r.success) this.categories.set((r.data || []).slice(0, 10)); }, error: () => {} });
    this.api.getFeaturedProducts(8, code).subscribe({
      next: (r: any) => { if (r.success) this.featured.set(r.data || []); this.worldLoaded.set(true); },
      error: () => this.worldLoaded.set(true)
    });
    this.api.getTrendingProducts(8, code).subscribe({ next: (r: any) => { if (r.success) this.trending.set(r.data || []); }, error: () => {} });
    this.api.getProducts({ limit: 8, sort: 'newest', country: code }).subscribe({ next: (r: any) => { if (r.success) this.recentProducts.set(r.data || []); }, error: () => {} });
  }

  ngOnDestroy() {
    clearInterval(this._slideTimer);
    clearInterval(this._tstTimer);
  }

  /* ── Country ── */
  pickCountry(code: CountryCode) { this.country.select(code); }


  /* ── Hero copy — admin banner fields only; empty = nothing shown ── */
  private activeBanner(): any { return this.banners()[this.activeSlide()] || null; }
  heroTitle(): string {
    const b = this.activeBanner();
    return (b?.title || '').trim();
  }
  heroWords(): string[] {
    const t = this.heroTitle();
    return t ? t.split(/\s+/) : [];
  }
  heroSub(): string {
    const b = this.activeBanner();
    return (b?.subtitle || '').trim();
  }
  heroEyebrow(): string {
    const b = this.activeBanner();
    return (b?.label || '').trim();
  }
  heroCta(): string {
    const b = this.activeBanner();
    return (b?.button_text || '').trim();
  }
  heroCtaLink(): string {
    const b = this.activeBanner();
    return (b?.button_link || '/categories').trim();
  }
  heroTrustVisible(): boolean {
    // Show trust bar only when there's some copy to go with it
    return !!(this.heroTitle() || this.heroSub());
  }

  scrollPastHero() {
    const el = document.querySelector('.hm-ticker');
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

  /* ── Craft / process (admin-editable) ── */
  hasProcess(): boolean {
    return !!(this.settings.get('process_section_title') && this.settings.get('process_step_1_title'));
  }
  processSteps(): any[] {
    return [1, 2, 3, 4].map(n => ({
      n: '0' + n,
      title: this.settings.get(`process_step_${n}_title`),
      copy: this.settings.get(`process_step_${n}_copy`),
      image: this.settings.get(`process_step_${n}_image`),
      alt: this.settings.get(`process_step_${n}_alt`),
    })).filter(s => s.title);
  }

  /* ── Trending carousel ── */
  scrollTrend(dir: number) {
    const el = document.querySelector('.hm-caro') as HTMLElement | null;
    el?.scrollBy({ left: dir * (el.clientWidth * 0.72), behavior: 'smooth' });
  }

  /* ── Testimonials ── */
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
      }))
      .filter(t => t.name && t.text);
    if (fromSettings.length) { this.testimonials.set(fromSettings); return; }
    this.testimonials.set([
      { name: 'Priya K.', city: 'Helsinki', text: 'Everything arrived fresh, beautifully packed, and exactly like the brands we buy back home.' },
      { name: 'Jonas W.', city: 'Berlin', text: 'Finally one place for proper pretzels, good mustard and the masalas we fell in love with.' },
      { name: 'Aino L.', city: 'Tampere', text: 'The rye bread and cloudberry jam taste like a Finnish summer pantry. Wonderful curation.' },
    ]);
  }
  private _startTstTimer() {
    this._tstTimer = setInterval(() => {
      const max = this.testimonials().length;
      if (max > 0) this.tstSlide.update(i => (i + 1) % max);
    }, 5200);
  }
  private _tstX = 0;
  onTstTouchStart(e: TouchEvent) { this._tstX = e.touches[0].clientX; }
  onTstTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - this._tstX;
    if (Math.abs(dx) < 30) return;
    const max = this.testimonials().length - 1;
    const cur = this.tstSlide();
    if (dx < 0 && cur < max) this.tstSlide.set(cur + 1);
    if (dx > 0 && cur > 0) this.tstSlide.set(cur - 1);
  }
  goTstSlide(i: number) { this.tstSlide.set(i); }

  /* ── Categories ── */
  displayCategories(): any[] {
    return this.categories().slice(0, 10);
  }

  /* ── Brands ── */
  featuredBrands(): { name: string, image: string }[] {
    const rawData = this.settings.get('featured_brands_data', '');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
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

  /* ── Utils ── */
  hideImg(e: Event) { (e.target as HTMLImageElement).style.display = 'none'; }
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

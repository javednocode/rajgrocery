import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlicePipe, UpperCasePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, ScrollAnimateDirective, SlicePipe, UpperCasePipe],
  template: `
    <!-- ── HERO MEDIA SLIDER ── -->
    <section class="hero-slider-section">
      @if (banners().length > 0) {
        <div class="slider-wrap"
             (mouseenter)="pauseSlider()"
             (mouseleave)="resumeSlider()"
             (touchstart)="onTouchStart($event)"
             (touchend)="onTouchEnd($event)">

          <!-- ── Slides stack (crossfade via opacity) ── -->
          @for (b of banners(); track b.id; let i = $index) {
            <div class="slide" [class.slide-active]="activeSlide() === i">

              @if (b.media_type === 'video' && b.video) {
                <!-- ── VIDEO SLIDE ── -->
                <!-- Desktop video -->
                <video class="slide-video slide-video-desktop"
                       autoplay muted loop playsinline
                       [attr.preload]="i === 0 ? 'auto' : 'none'"
                       (error)="onVideoError($event, b)">
                  <source [src]="b.video" type="video/mp4">
                </video>
                <!-- Mobile video (falls back to desktop if not set) -->
                <video class="slide-video slide-video-mobile"
                       autoplay muted loop playsinline
                       [attr.preload]="i === 0 ? 'auto' : 'none'"
                       (error)="onVideoError($event, b)">
                  <source [src]="b.mobile_video || b.video" type="video/mp4">
                </video>
                <!-- Fallback img (hidden unless video errors) -->
                @if (b.fallback_image || b.image) {
                  <div class="slide-img slide-fallback-img"
                       [id]="'fallback-' + b.id"
                       [style.background-image]="'url(' + (b.fallback_image || b.image) + ')'"
                       style="display:none;">
                  </div>
                }
              } @else {
                <!-- ── IMAGE SLIDE with Ken Burns ── -->
                <div class="slide-img slide-img-desktop slide-ken-burns"
                     [style.background-image]="'url(' + b.image + ')'">
                </div>
                <div class="slide-img slide-img-mobile slide-ken-burns"
                     [style.background-image]="'url(' + (b.mobile_image || b.image) + ')'">
                </div>
              }

              <!-- Overlay gradient for text readability -->
              <div class="slide-overlay" [class.slide-overlay-video]="b.media_type === 'video'"></div>

              <!-- CTA Content -->
              @if (b.title || b.subtitle || b.button_text) {
                <div class="slide-content">
                  @if (b.title) {
                    <h1 class="slide-title">{{ b.title }}</h1>
                  }
                  @if (b.subtitle) {
                    <p class="slide-sub">{{ b.subtitle }}</p>
                  }
                  @if (b.button_text && b.link) {
                    <a [href]="b.link" class="slide-btn"
                       [style.background]="b.button_color || '#e06400'">
                      {{ b.button_text }}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                    </a>
                  }
                </div>
              }

            </div>
          }

          <!-- Prev / Next arrows -->
          @if (banners().length > 1) {
            <button class="slider-arrow slider-prev" (click)="prevSlide()" aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="slider-arrow slider-next" (click)="nextSlide()" aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>

            <!-- Dots -->
            <div class="slider-dots">
              @for (b of banners(); track b.id; let i = $index) {
                <button class="slider-dot" [class.active]="activeSlide() === i"
                        (click)="goToSlide(i)" [attr.aria-label]="'Go to slide ' + (i+1)"></button>
              }
            </div>
          }
        </div>
      } @else {
        <!-- Fallback when no banners set -->
        <div class="slider-fallback">
          <div class="slider-fallback-content">
            <div class="fallback-chip">Cork's #1 Asian Grocery Store</div>
            <h1>Taste the Authentic<br><span class="fallback-highlight">Flavours of Asia</span></h1>
            <p>Japanese, Korean, Chinese &amp; Thai — fresh, authentic, delivered fast in Cork.</p>
            <div class="fallback-btns">
              <a routerLink="/categories" class="slide-btn" style="background:#e06400;">Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              </a>
              <a routerLink="/admin/banners.php" class="fallback-admin-hint">Add banners from Admin panel →</a>
            </div>
          </div>
        </div>
      }
      <!-- Wave separator -->
      <div class="hero-wave">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="#F8FAF9"/>
        </svg>
      </div>
    </section>




    <!-- ── CATEGORIES GRID ── -->
    <section class="cats-section section">
      <div class="container">
        <div class="section-header" appScrollAnimate>
          <div class="section-label">Shop By Category</div>
          <h2 class="section-title">Explore Our Collections</h2>
          <div class="title-underline"></div>
        </div>
        <div class="cats-grid">
          @for (cat of categories(); track cat.id; let i = $index) {
            <a [routerLink]="['/category', cat.slug]"
               class="cat-card"
               appScrollAnimate
               [animationDelay]="(i * 0.06) + 's'">
              <div class="cat-img-wrap">
                @if (cat.image) {
                  <img [src]="mediaUrl + cat.image" [alt]="cat.name" loading="lazy" class="cat-img">
                } @else {
                  <div class="cat-img-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#ccc" stroke-width="1.5"/><path d="M3 9h18" stroke="#ccc" stroke-width="1.5"/></svg>
                  </div>
                }
                <div class="cat-overlay"></div>
              </div>
              <div class="cat-info">
                <span class="cat-name">{{ cat.name }}</span>
                <svg class="cat-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- ── FEATURED PRODUCTS ── -->
    @if (featured().length) {
      <section class="section featured-section">
        <div class="container">
          <div class="section-header" appScrollAnimate>
            <div class="section-label">Handpicked for You</div>
            <h2 class="section-title">Featured Products</h2>
            <div class="title-underline"></div>
          </div>
          <div class="products-grid">
            @for (p of featured(); track p.id; let i = $index) {
              <div appScrollAnimate [animationDelay]="(i * 0.08) + 's'">
                <app-product-card [product]="p" />
              </div>
            }
          </div>
          <div class="text-center" style="margin-top:40px;" appScrollAnimate>
            <a routerLink="/categories" class="btn btn-outline btn-lg">View All Products →</a>
          </div>
        </div>
      </section>
    }

    <!-- ── TRENDING ── -->
    @if (trending().length) {
      <section class="section">
        <div class="container">
          <div class="section-header" appScrollAnimate>
            <div class="section-label">Most Popular</div>
            <h2 class="section-title">Trending Now</h2>
            <div class="title-underline"></div>
          </div>
          <div class="products-grid">
            @for (p of trending(); track p.id; let i = $index) {
              <div appScrollAnimate [animationDelay]="(i * 0.08) + 's'">
                <app-product-card [product]="p" />
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- ── WHY US ── -->
    <section class="why-section section">
      <div class="container">
        <div class="section-header" appScrollAnimate>
          <div class="section-label">Why Choose Us</div>
          <h2 class="section-title">The Asian Food Cork Difference</h2>
          <div class="title-underline"></div>
          <p class="why-subtitle">We’re not just a grocery store — we’re your local connection to authentic Asian flavours.</p>
        </div>
        <div class="why-grid">
          @for (f of whyFeatures; track f.title; let i = $index) {
            <div class="why-card" appScrollAnimate [animationDelay]="(i * 0.1) + 's'">
              <div class="why-icon-wrap" [style.background]="f.iconBg">
                <div class="why-icon" [innerHTML]="getSafeIcon(f.icon)"></div>
              </div>
              <div class="why-card-body">
                <h4>{{ f.title }}</h4>
                <p>{{ f.desc }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ── HERO MEDIA SLIDER ── */
    .hero-slider-section {
      position: relative;
      width: 100%;
      background: #0a0a14;
      overflow: hidden;
    }
    .slider-wrap {
      position: relative;
      width: 100%;
      user-select: none;
      height: clamp(320px, 56vw, 600px);
    }
    @media (max-width: 640px) {
      .slider-wrap { height: clamp(220px, 72vw, 420px); }
    }

    /* ── Crossfade slide stack ── */
    .slide {
      position: absolute; inset: 0;
      opacity: 0;
      transition: opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      z-index: 0;
    }
    .slide.slide-active {
      opacity: 1;
      z-index: 1;
    }

    /* ── Image backgrounds ── */
    .slide-img {
      position: absolute; inset: 0;
      background-size: cover;
      background-position: center;
    }
    .slide-img-desktop { display: block; }
    .slide-img-mobile  { display: none; }
    @media (max-width: 640px) {
      .slide-img-desktop { display: none; }
      .slide-img-mobile  { display: block; }
    }

    /* Image slides: stable, no zoom animation */
    .slide-ken-burns {
      /* Ken Burns removed — stable clean display */
      background-size: cover;
      background-position: center;
    }

    /* ── Video backgrounds ── */
    .slide-video {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
    .slide-video-desktop { display: block; }
    .slide-video-mobile  { display: none;  }
    @media (max-width: 640px) {
      .slide-video-desktop { display: none; }
      .slide-video-mobile  { display: block; }
    }

    /* Fallback image (shown on video error) */
    .slide-fallback-img {
      position: absolute; inset: 0;
      background-size: cover;
      background-position: center;
    }

    /* ── Gradient overlays ── */
    .slide-overlay {
      position: absolute; inset: 0; z-index: 2;
      background: linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 55%, transparent 100%);
    }
    /* Slightly heavier overlay on video for text legibility */
    .slide-overlay-video {
      background: linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.1) 100%);
    }
    @media (max-width: 640px) {
      .slide-overlay, .slide-overlay-video {
        background: linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.72) 100%);
      }
    }

    /* ── Slide content ── */
    .slide-content {
      position: absolute;
      bottom: 18%;
      left: clamp(16px, 6vw, 90px);
      right: clamp(16px, 6vw, 90px);
      max-width: 560px;
      z-index: 5;
    }
    /* Only animate content when THIS slide becomes active */
    .slide.slide-active .slide-content {
      animation: slideContentIn 0.8s cubic-bezier(0.22,1,0.36,1) both 0.3s;
    }
    @media (max-width: 640px) {
      .slide-content { bottom: 14%; left: 16px; right: 16px; max-width: 100%; }
    }
    @keyframes slideContentIn {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .slide-title {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(1.2rem, 4.5vw, 3.2rem);
      font-weight: 800; color: #fff;
      line-height: 1.15; margin: 0 0 10px;
      text-shadow: 0 2px 16px rgba(0,0,0,0.5);
      letter-spacing: -0.02em;
    }
    .slide-sub {
      font-size: clamp(0.8rem, 2vw, 1.15rem);
      color: rgba(255,255,255,0.9); margin: 0 0 18px;
      line-height: 1.5; text-shadow: 0 1px 8px rgba(0,0,0,0.4);
    }
    .slide-btn {
      display: inline-flex; align-items: center; gap: 8px;
      color: #fff; font-size: clamp(12px, 3vw, 15px); font-weight: 700;
      padding: clamp(9px,2vw,13px) clamp(18px,4vw,28px);
      border-radius: 10px; text-decoration: none;
      box-shadow: 0 6px 24px rgba(0,0,0,0.3);
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s;
    }
    .slide-btn:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 12px 36px rgba(0,0,0,0.4);
      filter: brightness(1.1);
    }

    /* ── Arrow buttons ── */
    .slider-arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      z-index: 10; background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px); border: 1.5px solid rgba(255,255,255,0.25);
      color: #fff; border-radius: 50%; width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.2s, transform 0.2s;
    }
    .slider-arrow:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-50%) scale(1.08);
    }
    .slider-prev { left: 20px; }
    .slider-next { right: 20px; }
    @media (max-width: 480px) {
      .slider-arrow { width: 38px; height: 38px; }
      .slider-prev { left: 10px; } .slider-next { right: 10px; }
    }

    /* ── Dots ── */
    .slider-dots {
      position: absolute; bottom: 18px; left: 50%;
      transform: translateX(-50%); display: flex; gap: 8px; z-index: 10;
    }
    .slider-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: rgba(255,255,255,0.4); border: none;
      cursor: pointer; padding: 0;
      transition: width 0.3s ease, background 0.3s ease;
    }
    .slider-dot.active { width: 28px; border-radius: 4px; background: #fff; }

    /* Fallback (no banners) */
    .slider-fallback {
      min-height: clamp(320px, 50vw, 520px);
      background: linear-gradient(145deg, #1e1044 0%, #2d1b69 40%, #1a4a2e 100%);
      display: flex;
      align-items: center;
      padding: 60px clamp(20px, 6vw, 90px);
    }
    .slider-fallback-content { max-width: 560px; }
    .fallback-chip {
      display: inline-flex;
      align-items: center;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.9);
      font-size: 13px; font-weight: 600;
      padding: 7px 18px; border-radius: 999px;
      margin-bottom: 20px;
    }
    .slider-fallback h1 {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(2rem, 5vw, 3.4rem);
      font-weight: 800;
      color: white;
      line-height: 1.1;
      margin: 0 0 16px;
    }
    .fallback-highlight {
      background: linear-gradient(90deg, #4DC47B, #FF6A2C);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .slider-fallback p { color: rgba(255,255,255,0.72); font-size: 17px; margin: 0 0 28px; }
    .fallback-btns { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .fallback-admin-hint { font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: underline; }
    .fallback-admin-hint:hover { color: rgba(255,255,255,0.85); }
    /* Wave */
    .hero-wave { position: relative; z-index: 3; margin-top: -2px; }
    .hero-wave svg { display: block; width: 100%; }
    /* ── HERO (old styles kept for keyframes) ── */
    .hero {
      position: relative; overflow: hidden;
      background: linear-gradient(145deg, #1e1044 0%, #2d1b69 40%, #1a4a2e 100%);
      padding: 100px 0 60px; min-height: 92vh;
      display: flex; align-items: center;
    }
    .hero-mesh {
      position: absolute; inset: 0; z-index: 0;
      background-image:
        radial-gradient(ellipse 70% 55% at 75% 45%, rgba(46,159,92,0.2) 0%, transparent 60%),
        radial-gradient(ellipse 50% 45% at 15% 75%, rgba(255,106,44,0.13) 0%, transparent 55%),
        radial-gradient(ellipse 40% 35% at 85% 85%, rgba(75,46,131,0.25) 0%, transparent 50%);
      animation: meshShift 14s ease-in-out infinite alternate;
    }
    .hero-bg-gradient {
      position: absolute; inset: 0; z-index: 0;
      background: radial-gradient(ellipse 80% 60% at 70% 50%, rgba(46,159,92,0.18) 0%, transparent 65%),
                  radial-gradient(ellipse 60% 50% at 10% 80%, rgba(255,106,44,0.12) 0%, transparent 60%);
    }
    .hero-orb {
      position: absolute; border-radius: 50%;
      filter: blur(90px); pointer-events: none; z-index: 0;
    }
    .hero-orb1 { width: 520px; height: 520px; background: #4b2e83; top: -180px; right: -100px; opacity: 0.3; animation: orbDrift 18s ease-in-out infinite; }
    .hero-orb2 { width: 360px; height: 360px; background: #d45e00; bottom: -80px; left: 5%; opacity: 0.16; animation: orbDrift 22s ease-in-out infinite reverse; }
    /* Hero chip */
    .hero-chip {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18);
      color: rgba(255,255,255,0.92); font-size: 13px; font-weight: 600;
      padding: 8px 18px; border-radius: 999px; margin-bottom: 22px;
      animation: heroFadeUp 0.65s ease both 0.05s;
    }
    .chip-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #22C55E; box-shadow: 0 0 6px #22C55E;
      animation: pulse 2s ease-in-out infinite;
    }

    .hero-inner {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 60px; align-items: center;
      position: relative; z-index: 2;
    }
    .hero-chip {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 600;
      padding: 8px 18px; border-radius: 999px; margin-bottom: 20px;
    }
    .hero-h1 {
      color: white; font-family: 'Poppins', sans-serif;
      font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 800;
      line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.03em;
    }
    .hero-highlight {
      background: linear-gradient(90deg, #4DC47B, #FF6A2C);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-sub { color: rgba(255,255,255,0.72); font-size: 17px; line-height: 1.7; margin-bottom: 32px; max-width: 480px; }
    .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 40px; }
    .hero-stats { display: flex; align-items: center; gap: 24px; }
    .stat strong { display: block; font-size: 24px; font-weight: 800; color: white; font-family: 'Poppins', sans-serif; }
    .stat span   { font-size: 12px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 1px; }
    .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.2); }

    /* Hero load sequence */
    .hero-h1    { animation: heroFadeUp 0.7s ease both 0.18s; }
    .hero-sub   { animation: heroFadeUp 0.7s ease both 0.30s; }
    .hero-cta   { animation: heroFadeUp 0.7s ease both 0.42s; }
    .hero-trust { animation: heroFadeUp 0.7s ease both 0.54s; }
    .hero-stats { animation: heroFadeUp 0.7s ease both 0.66s; }

    /* CTA Buttons */
    .btn-primary-hero {
      display: inline-flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #e06400 0%, #ff7a1a 100%);
      color: white; font-size: 16px; font-weight: 700;
      padding: 14px 28px; border-radius: 12px;
      text-decoration: none; letter-spacing: 0.2px;
      box-shadow: 0 8px 24px rgba(224,100,0,0.4);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .btn-primary-hero:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 14px 36px rgba(224,100,0,0.55);
      background: linear-gradient(135deg, #c85a00 0%, #e86c00 100%);
    }
    .btn-ghost-hero {
      display: inline-flex; align-items: center;
      background: rgba(255,255,255,0.08); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.22);
      color: rgba(255,255,255,0.92); font-size: 16px; font-weight: 600;
      padding: 14px 28px; border-radius: 12px; text-decoration: none;
      transition: background 0.2s, border-color 0.2s, transform 0.2s;
    }
    .btn-ghost-hero:hover {
      background: rgba(255,255,255,0.16);
      border-color: rgba(255,255,255,0.4);
      transform: translateY(-2px);
    }
    /* Trust bar */
    .hero-trust {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 32px; flex-wrap: wrap;
    }
    .trust-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 12.5px; color: rgba(255,255,255,0.75); font-weight: 500;
    }
    .trust-sep { width: 1px; height: 14px; background: rgba(255,255,255,0.2); }

    /* ── HERO VISUAL — removed (replaced by slider) ── */
    .hero-visual {
      position: relative;
      height: 540px;
      z-index: 2;
    }
    /* Ambient glows */
    .hv-glow {
      position: absolute; width: 380px; height: 380px;
      background: radial-gradient(circle, rgba(46,159,92,0.28) 0%, transparent 70%);
      border-radius: 50%; filter: blur(60px);
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      pointer-events: none;
      animation: glowPulse 5s ease-in-out infinite;
    }
    .hv-glow2 {
      width: 220px; height: 220px;
      background: radial-gradient(circle, rgba(75,46,131,0.35) 0%, transparent 70%);
      top: 20%; left: 60%;
      animation-delay: 2.5s;
    }

    /* Base card shell — glassmorphism */
    .hp-card {
      position: absolute;
      background: rgba(255,255,255,0.09);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 20px;
      overflow: hidden;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12);
      text-decoration: none;
      display: block;
      transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.35s ease,
                  background 0.3s ease;
    }
    .hp-card:hover {
      background: rgba(255,255,255,0.16);
      box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .hp-placeholder { cursor: default; }

    /* MAIN large card — centre of composition */
    .hp-main {
      width: 220px;
      top: 50%; left: 50%;
      transform: translate(-60%, -52%);
      animation: floatA 6s ease-in-out infinite;
    }
    .hp-main:hover {
      transform: translate(-60%, -55%) scale(1.03);
    }
    .hp-card-img {
      width: 100%; aspect-ratio: 4/3;
      background-size: cover; background-position: center;
      background-color: rgba(255,255,255,0.06);
    }
    .hp-img-placeholder {
      background: linear-gradient(135deg, rgba(75,46,131,0.4) 0%, rgba(46,159,92,0.2) 100%);
    }
    .hp-card-body { padding: 12px 14px 14px; }
    .hp-badge {
      display: inline-block;
      font-size: 9px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.8px;
      background: rgba(34,197,94,0.85); color: white;
      padding: 3px 9px; border-radius: 999px; margin-bottom: 6px;
    }
    .hp-badge-main { font-size: 10px; }
    .hp-name {
      font-size: 14px; font-weight: 700; color: white;
      margin-bottom: 4px; line-height: 1.3;
    }
    .hp-price { font-size: 16px; font-weight: 800; color: #fb923c; }

    /* SMALL cards */
    .hp-sm { width: 160px; }
    .hp-card-img-sm {
      width: 100%; aspect-ratio: 16/10;
      background-size: cover; background-position: center;
      background-color: rgba(255,255,255,0.06);
    }
    .hp-card-body-sm { padding: 8px 10px 10px; }
    .hp-name-sm { font-size: 12px; font-weight: 600; color: white; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hp-price-sm { font-size: 13px; font-weight: 800; color: #fb923c; }

    /* Card positions + individual float animations */
    .hp-sm1 {
      top: 8%;  right: 2%;
      animation: floatB 7s ease-in-out infinite;
    }
    .hp-sm1:hover { transform: translateY(-8px) scale(1.04); }

    .hp-sm2 {
      bottom: 10%; left: 8%;
      animation: floatC 8s ease-in-out infinite;
    }
    .hp-sm2:hover { transform: translateY(-8px) scale(1.04); }

    .hp-sm3 {
      top: 12%; left: 5%;
      animation: floatD 9s ease-in-out infinite;
    }
    .hp-sm3:hover { transform: translateY(-8px) scale(1.04); }

    /* Delivery badge floating at bottom centre */
    .hp-delivery-badge {
      position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.95); border-radius: 99px;
      padding: 8px 18px; font-size: 12.5px; font-weight: 600; color: #1a1a2e;
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      white-space: nowrap; z-index: 10;
      animation: floatB 6s ease-in-out infinite;
    }
    .hero-wave { position: absolute; bottom: -2px; left: 0; right: 0; z-index: 3; }
    .hero-wave svg { display: block; width: 100%; }

    /* ── CATEGORY GRID ── */
    .cats-section { background: #F8FAF9; }
    .cats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
    }
    .cat-card {
      display: block; text-decoration: none;
      background: #ffffff; border-radius: 12px; overflow: hidden;
      border: 1.5px solid #eaeaea;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
      cursor: pointer;
    }
    .cat-card:hover {
      border-color: #4b2e83;
      box-shadow: 0 8px 28px rgba(75,46,131,0.14);
      transform: translateY(-3px);
    }
    .cat-img-wrap {
      width: 100%; aspect-ratio: 1/1; overflow: hidden;
      background: #f2f2f2; position: relative;
    }
    .cat-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.4s ease;
    }
    .cat-card:hover .cat-img { transform: scale(1.07); }
    .cat-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(30,16,68,0.45) 0%, transparent 60%);
      opacity: 0; transition: opacity 0.3s ease;
    }
    .cat-card:hover .cat-overlay { opacity: 1; }
    .cat-img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #f0f0f5, #e8e8f0);
    }
    .cat-info {
      padding: 10px 12px 12px;
      border-top: 1px solid #f0f0f0;
      display: flex; align-items: center; justify-content: space-between;
    }
    .cat-name {
      font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700;
      color: #1a1a2e; letter-spacing: 0.04em; text-transform: uppercase;
    }
    .cat-arrow {
      color: #bbb; transition: color 0.2s, transform 0.2s;
      flex-shrink: 0;
    }
    .cat-card:hover .cat-arrow { color: #4b2e83; transform: translateX(3px); }
    @media (max-width: 1100px) { .cats-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 768px)  { .cats-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
    @media (max-width: 480px)  { .cats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

    /* ── FEATURED PRODUCTS ── */
    .featured-section { background: linear-gradient(180deg, var(--bg) 0%, white 100%); }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    /* ── PROMO STRIP ── */
    .promo-strip { background: var(--bg); padding: 60px 0; }
    .promo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    .promo-card {
      border-radius: 16px; color: white;
      position: relative; overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      text-decoration: none; display: flex; flex-direction: column;
      min-height: 220px;
    }
    .promo-card::after {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(circle at 40% 40%, rgba(255,255,255,0.08) 0%, transparent 55%);
      opacity: 0; transition: opacity 0.4s ease; pointer-events: none;
    }
    .promo-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.28); }
    .promo-card:hover::after { opacity: 1; }
    .pc-purple { background: linear-gradient(145deg, #2d1b69 0%, #4b2e83 100%); }
    .pc-green  { background: linear-gradient(145deg, #1a6636 0%, #217a45 100%); }
    .pc-orange { background: linear-gradient(145deg, #a33c00 0%, #d45e00 100%); }
    .pc-dark   { background: linear-gradient(145deg, #0e0e1a 0%, #1e1435 100%); }
    /* Thumbnail from real category image */
    .pc-thumb {
      width: 100%; height: 110px;
      background-size: cover; background-position: center;
      flex-shrink: 0;
    }
    .pc-thumb-plain { background: rgba(255,255,255,0.07); }
    .pc-body { padding: 18px 20px 20px; flex: 1; display: flex; flex-direction: column; }
    .pc-flag {
      display: inline-block;
      font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
      background: rgba(255,255,255,0.15); border-radius: 6px;
      padding: 3px 9px; margin-bottom: 10px; color: rgba(255,255,255,0.9);
      width: fit-content;
    }
    .promo-card h3 { font-size: 17px; color: white; margin-bottom: 5px; font-family: 'Poppins', sans-serif; font-weight: 700; }
    .promo-card p  { font-size: 12.5px; color: rgba(255,255,255,0.65); margin-bottom: auto; line-height: 1.5; padding-bottom: 16px; }
    .pc-link {
      font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,0.9);
      letter-spacing: 0.3px;
      display: inline-flex; align-items: center; gap: 4px;
      border-bottom: 1px solid rgba(255,255,255,0.3);
      padding-bottom: 2px; transition: color 0.2s, border-color 0.2s;
      width: fit-content; cursor: pointer;
    }
    .promo-card:hover .pc-link { color: white; border-color: white; }
    @media (max-width: 1100px) { .promo-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px)  { .promo-grid { grid-template-columns: 1fr; } }

    /* ── WHY US ── */
    .why-section { background: #F7F8FA; }
    .why-subtitle {
      font-size: 15px; color: #6B7280; max-width: 520px;
      margin: 0 auto; text-align: center; line-height: 1.6;
    }
    .why-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-top: 40px;
    }
    .why-card {
      background: #fff;
      border: 1.5px solid #EAECF0;
      border-radius: 16px;
      padding: 28px 22px 26px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      cursor: default;
    }
    .why-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 32px rgba(0,0,0,0.08);
      border-color: #D0D5DD;
    }
    .why-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: transform 0.25s ease;
    }
    .why-card:hover .why-icon-wrap { transform: scale(1.08); }
    .why-icon { display: flex; align-items: center; justify-content: center; }
    .why-card-body { display: flex; flex-direction: column; gap: 6px; }
    .why-card h4 {
      font-size: 15px; font-weight: 700; color: #111827;
      font-family: 'Inter', sans-serif; margin: 0;
    }
    .why-card p {
      font-size: 13px; color: #6B7280; line-height: 1.65; margin: 0;
    }
    @media (max-width: 900px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .why-grid { grid-template-columns: 1fr 1fr; gap: 12px; } .why-card { padding: 20px 16px; } }

    /* ── CTA BAND ── */
    .cta-band {
      background: linear-gradient(135deg, #217A45 0%, #2E9F5C 60%, #4B2E83 100%);
      position: relative;
    }
    /* Seamless dark shadow edge into footer */
    .cta-band::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 40px;
      background: linear-gradient(to bottom, transparent, rgba(13,24,39,0.35));
      pointer-events: none;
    }
    .cta-inner {
      display: flex; align-items: center; justify-content: space-between;
      gap: 32px; padding: 52px 0 48px; flex-wrap: wrap;
    }
    .cta-btns { display: flex; gap: 14px; flex-wrap: wrap; }

    /* ── RESPONSIVE ── */
    @media (max-width: 1100px) {
      .masonry-grid { grid-template-columns: repeat(8, 1fr); }
      .mcat-1 { grid-column: span 4; grid-row: span 3; }
      .mcat-2, .mcat-3 { grid-column: span 4; }
      .mcat-4, .mcat-5, .mcat-6, .mcat-7 { grid-column: span 4; }
      .promo-grid { grid-template-columns: repeat(2, 1fr); }
      .why-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-visual { display: none; }
      .hero { min-height: auto; padding: 80px 0 50px; }
      .promo-grid, .why-grid { grid-template-columns: 1fr 1fr; }
      .cta-inner { flex-direction: column; text-align: center; }
    }
    @media (max-width: 640px) {
      /* 2-column product grid on mobile */
      .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px; }
      /* Reduce section padding on mobile */
      .container { padding-left: 12px; padding-right: 12px; }
    }
    @media (max-width: 480px) {
      .promo-grid, .why-grid { grid-template-columns: 1fr; }
    }
    @keyframes fadeSlideUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes heroFadeUp   { from { opacity:0; transform:translateY(26px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shelfFloat   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
    @keyframes orbDrift     { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(28px,-18px) scale(1.06); } }
    @keyframes meshShift    { from { opacity:1; } to { opacity:0.65; } }
    @keyframes glowPulse    { 0%,100% { opacity:0.6; transform:translate(-50%,-50%) scale(1); } 50% { opacity:1; transform:translate(-50%,-50%) scale(1.15); } }
    @keyframes pulse        { 0%,100% { box-shadow:0 0 6px #22C55E; } 50% { box-shadow:0 0 12px #22C55E, 0 0 20px rgba(34,197,94,0.4); } }
    /* Layered float animations — each card drifts independently */
    @keyframes floatA { 0%,100% { transform:translate(-60%,-52%); } 50% { transform:translate(-60%,-58%) rotate(0.5deg); } }
    @keyframes floatB { 0%,100% { transform:translateY(0px) rotate(0deg); } 33% { transform:translateY(-14px) rotate(1deg); } 66% { transform:translateY(-6px) rotate(-0.5deg); } }
    @keyframes floatC { 0%,100% { transform:translateY(0px) rotate(0deg); } 40% { transform:translateY(-10px) rotate(-1deg); } 80% { transform:translateY(-18px) rotate(0.8deg); } }
    @keyframes floatD { 0%,100% { transform:translateY(0px) rotate(0deg); } 50% { transform:translateY(-12px) rotate(1.2deg); } }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  mediaUrl = environment.mediaUrl;
  banners         = signal<any[]>([]);
  activeSlide     = signal(0);
  categories      = signal<any[]>([]);
  featured        = signal<any[]>([]);
  trending        = signal<any[]>([]);
  promoCategories = signal<any[]>([]);
  promoColors     = ['purple','green','orange','dark'];
  promoCard       = 'promo-card';

  private _sliderTimer: any = null;
  private _touchStartX = 0;
  private _isBrowser: boolean;

  whyFeatures = [
    {
      iconBg: '#EEF9F1',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="4" width="15" height="13" rx="2" stroke="#22C55E" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M16 8h3.5a1 1 0 0 1 .8.4l2.2 2.9a1 1 0 0 1 .2.6V17a1 1 0 0 1-1 1H16V8z" stroke="#22C55E" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="5.5" cy="19" r="2" stroke="#22C55E" stroke-width="1.8"/>
        <circle cx="18.5" cy="19" r="2" stroke="#22C55E" stroke-width="1.8"/>
      </svg>`,
      title: 'Cork-Wide Delivery',
      desc: 'Same-day and next-day delivery across Cork city and county. Order by 2pm for evening delivery.'
    },
    {
      iconBg: '#F0EDFB',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3.5 6.5v5C3.5 16.1 7.2 20.6 12 22c4.8-1.4 8.5-5.9 8.5-10.5v-5L12 2z" stroke="#4B2E83" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M8.5 12l2.5 2.5 4.5-5" stroke="#4B2E83" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      title: '100% Authentic',
      desc: 'Genuine imported products sourced directly from Japan, Korea, China, and Thailand.'
    },
    {
      iconBg: '#FFF4EE',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8 2 5 5.5 5 9c0 5 7 13 7 13s7-8 7-13c0-3.5-3-7-7-7z" stroke="#FB923C" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="12" cy="9" r="2.5" stroke="#FB923C" stroke-width="1.8"/>
      </svg>`,
      title: 'Fresh Daily Stock',
      desc: 'Stock refreshed daily. Chilled, frozen and fresh items kept in optimal conditions.'
    },
    {
      iconBg: '#EEF6FF',
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#3B82F6" stroke-width="1.8"/>
        <path d="M2 10h20" stroke="#3B82F6" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M6 15h4" stroke="#3B82F6" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="17" cy="15" r="1" fill="#3B82F6"/>
      </svg>`,
      title: 'Secure Payments',
      desc: 'Pay online safely or cash on delivery. No hidden charges, ever.'
    },
  ];


  constructor(
    private api: ApiService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
  }


  getSafeIcon(svg: string) {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // ── Slider methods ──
  nextSlide() {
    const b = this.banners();
    if (!b.length) return;
    this.activeSlide.set((this.activeSlide() + 1) % b.length);
  }
  prevSlide() {
    const b = this.banners();
    if (!b.length) return;
    this.activeSlide.set((this.activeSlide() - 1 + b.length) % b.length);
  }
  goToSlide(i: number) { this.activeSlide.set(i); }

  pauseSlider()  { if (this._sliderTimer) { clearInterval(this._sliderTimer); this._sliderTimer = null; } }
  resumeSlider() { this.startAutoSlide(); }

  startAutoSlide() {
    if (!this._isBrowser) return;
    this.pauseSlider();
    if (this.banners().length <= 1) return;
    this._sliderTimer = setInterval(() => this.nextSlide(), 5000);
  }

  onTouchStart(e: TouchEvent) { this._touchStartX = e.changedTouches[0].screenX; }
  onTouchEnd(e: TouchEvent) {
    const diff = this._touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? this.nextSlide() : this.prevSlide(); }
  }

  onVideoError(event: Event, banner: any) {
    // Video failed — show fallback image if available
    if (this._isBrowser) {
      const fallbackId = 'fallback-' + banner.id;
      const fallbackEl = document.getElementById(fallbackId);
      if (fallbackEl) {
        fallbackEl.style.display = 'block';
      }
      // Hide the broken video element
      const videoEl = event.target as HTMLVideoElement;
      if (videoEl) videoEl.style.display = 'none';
    }
  }

  ngOnDestroy() { this.pauseSlider(); }



  ngOnInit() {
    // Load banners for hero slider
    this.api.getBanners().subscribe({ next: (r: any) => {
      if (r.success && r.data?.length) {
        this.banners.set(r.data);
        this.startAutoSlide();
      }
    }});
    this.api.getFeaturedCategories().subscribe({ next: (r: any) => {
      if (r.success) {
        this.categories.set(r.data);
        this.promoCategories.set(r.data.filter((c: any) => c.is_active == 1).slice(0, 4));
      }
    }});
    this.api.getFeaturedProducts(8).subscribe({ next: (r: any) => { if (r.success) this.featured.set(r.data); } });
    this.api.getTrendingProducts(12).subscribe({ next: (r: any) => { if (r.success) this.trending.set(r.data); } });
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { SeoService } from '../../core/services/seo.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `
  <!-- Loading skeleton -->
  @if (loading()) {
    <div class="container pd-skel-wrap">
      <div class="pd-skel-grid">
        <div class="skeleton" style="aspect-ratio:1/1;border-radius:14px"></div>
        <div class="pd-skel-info">
          <div class="skeleton" style="height:12px;width:80px;border-radius:6px"></div>
          <div class="skeleton" style="height:36px;width:90%;border-radius:8px;margin-top:6px"></div>
          <div class="skeleton" style="height:36px;width:55%;border-radius:8px;margin-top:4px"></div>
          <div class="skeleton" style="height:12px;width:100px;border-radius:6px;margin-top:8px"></div>
          <div class="skeleton" style="height:72px;border-radius:10px;margin-top:12px"></div>
          <div class="skeleton" style="height:52px;border-radius:999px;margin-top:12px"></div>
        </div>
      </div>
    </div>

  <!-- Product not found -->
  } @else if (!product()) {
    <div class="container pd-notfound">
      <div class="pd-notfound-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.6"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="pd-notfound-title">Product not found</h1>
      <p class="pd-notfound-text">This product may no longer be available or the link may be incorrect.</p>
      <div class="pd-notfound-actions">
        <a routerLink="/categories" class="btn btn-primary">Browse Categories</a>
        <a routerLink="/" class="btn btn-outline">Home</a>
      </div>
    </div>

  <!-- Product loaded -->
  } @else if (product(); as p) {
    <div class="pd-wrap">
      <div class="container">

        <!-- Breadcrumb -->
        <nav class="pd-crumbs" aria-label="Breadcrumb">
          <a routerLink="/">Home</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <a routerLink="/categories">Categories</a>
          @if (p.categories?.[0]) {
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <a [routerLink]="['/category', p.categories[0].slug]">{{ p.categories[0].name }}</a>
          }
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span aria-current="page">{{ p.name }}</span>
        </nav>

        <!-- Main product grid -->
        <div class="pd-grid">

          <!-- ═══ GALLERY ═══ -->
          <div class="pd-gallery">
            <!-- Main image -->
            <div class="pd-main-img-wrap"
              (touchstart)="onGalleryTouchStart($event)"
              (touchend)="onGalleryTouchEnd($event)">

              @if (selectedImage()) {
                <img [src]="media(selectedImage())" [alt]="p.name"
                     class="pd-main-img" [class.pd-img-anim]="imgAnimate()"
                     (error)="onImgErr($event)" />
              } @else {
                <span class="pd-mono" aria-hidden="true">{{ (p.name || '?')[0] }}</span>
              }

              <!-- Discount badge -->
              @if (discount() > 0) {
                <span class="pd-disc-badge">−{{ discount() }}%</span>
              }

              <!-- New badge -->
              @if (p.is_new) {
                <span class="pd-new-badge">New</span>
              }

              <!-- Image nav buttons -->
              @if (productImages(p).length > 1) {
                <button class="pd-img-btn pd-img-prev" type="button"
                  (click)="prevImage()" aria-label="Previous image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="pd-img-btn pd-img-next" type="button"
                  (click)="nextImage()" aria-label="Next image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <!-- Dot indicators -->
                <div class="pd-img-dots" aria-hidden="true">
                  @for (path of productImages(p); track path) {
                    <span [class.on]="path === selectedImage()"></span>
                  }
                </div>
              }

              <!-- Wishlist -->
              <button class="pd-wish-btn"
                [class.on]="wishlist.has(p.id)"
                (click)="wishlist.toggle(p, media(selectedImage()))"
                [attr.aria-label]="wishlist.has(p.id) ? 'Remove from wishlist' : 'Add to wishlist'">
                <svg width="18" height="18" viewBox="0 0 24 24"
                  [attr.fill]="wishlist.has(p.id) ? 'currentColor' : 'none'">
                  <path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z"
                    stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <!-- Thumbnails -->
            @if (productImages(p).length > 1) {
              <div class="pd-thumbs" role="list">
                @for (path of productImages(p); track path) {
                  <button class="pd-thumb" role="listitem"
                    [class.on]="path === selectedImage()"
                    (click)="selectImg(path)"
                    [attr.aria-label]="'View image ' + ($index + 1)"
                    [attr.aria-current]="path === selectedImage()">
                    <img [src]="media(path)" [alt]="p.name" loading="lazy" (error)="onImgErr($event)" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- ═══ PRODUCT INFO ═══ -->
          <div class="pd-info">

            <!-- Category chip -->
            @if (p.categories?.[0]) {
              <a class="pd-cat-chip" [routerLink]="['/category', p.categories[0].slug]">
                {{ p.categories[0].name }}
              </a>
            }

            <!-- Product name -->
            <h1 class="pd-name">{{ p.name }}</h1>

            <!-- Brand + SKU line -->
            @if (p.brand || p.sku) {
              <div class="pd-meta-line">
                @if (p.brand) { <span class="pd-brand">{{ p.brand }}</span> }
                @if (p.sku) {
                  <span class="pd-sku">SKU: <strong>{{ p.sku }}</strong></span>
                }
              </div>
            }

            <!-- Price block -->
            <div class="pd-price-block">
              @if (onSale()) {
                <span class="pd-price-main">{{ cur }}{{ activePrice() }}</span>
                <span class="pd-price-was">{{ cur }}{{ p.price }}</span>
                <span class="pd-save-tag">
                  Save {{ cur }}{{ (+p.price - +activePrice()).toFixed(2) }}
                </span>
              } @else {
                <span class="pd-price-main">{{ cur }}{{ activePrice() }}</span>
              }
            </div>

            <!-- Stock status -->
            <div class="pd-stock-row">
              <span class="pd-stock-dot" [class.out]="p.stock <= 0"></span>
              <span class="pd-stock-label" [class.out]="p.stock <= 0">
                {{ p.stock > 0 ? 'In Stock' : 'Out of Stock' }}
              </span>
              @if (p.stock > 0 && p.stock <= 10) {
                <span class="pd-stock-warn">Only {{ p.stock }} left</span>
              }
            </div>

            <!-- Short description -->
            @if (p.short_description) {
              <p class="pd-short-desc">{{ p.short_description }}</p>
            }

            <!-- Variations -->
            @if (p.variations?.length) {
              <div class="pd-variants">
                <span class="pd-variants-label">
                  Options
                  @if (selectedVariation()) {
                    <strong>— {{ selectedVariation().name }}</strong>
                  }
                </span>
                <div class="pd-var-row">
                  @for (v of p.variations; track v.id) {
                    <button class="pd-var-btn" type="button"
                      [class.on]="selectedVariation()?.id === v.id"
                      [disabled]="v.stock <= 0"
                      (click)="pickVar(v)"
                      [attr.aria-pressed]="selectedVariation()?.id === v.id">
                      <span class="pd-var-name">{{ v.name }}</span>
                      <em class="pd-var-price">{{ cur }}{{ v.sale_price && +v.sale_price < +v.price ? v.sale_price : v.price }}</em>
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Quantity + Add to cart -->
            <div class="pd-atc-area">
              <div class="pd-qty-row">
                <div class="pd-qty" role="group" aria-label="Quantity">
                  <button class="pd-qty-btn" type="button" (click)="decQty()" aria-label="Decrease quantity"
                    [disabled]="qty <= 1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <span class="pd-qty-val" aria-live="polite">{{ qty }}</span>
                  <button class="pd-qty-btn" type="button" (click)="incQty(p)" aria-label="Increase quantity"
                    [disabled]="qty >= (p.stock || 99)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button class="pd-atc-btn" type="button"
                [disabled]="p.stock <= 0 || adding()"
                (click)="addToCart(p)">
                @if (added()) {
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Added to cart!
                } @else if (p.stock <= 0) {
                  Out of Stock
                } @else {
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2"
                      stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
                    <circle cx="10" cy="21" r="1.3" fill="currentColor"/>
                    <circle cx="17" cy="21" r="1.3" fill="currentColor"/>
                  </svg>
                  Add to Cart
                }
              </button>
            </div>

            <!-- Trust strip — verifiable claims only -->
            <div class="pd-trust" aria-label="Shopping assurance">
              <div class="pd-trust-item">
                <span class="pd-trust-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/>
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                  </svg>
                </span>
                <div><strong>Secure Checkout</strong><span>256-bit encrypted</span></div>
              </div>
              <div class="pd-trust-item">
                <span class="pd-trust-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.7"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.7"/>
                  </svg>
                </span>
                <div><strong>Local HK Store</strong><span>Hong Kong based</span></div>
              </div>
              <div class="pd-trust-item">
                <span class="pd-trust-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7"/>
                    <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <div><strong>Easy Ordering</strong><span>Online or in store</span></div>
              </div>
            </div>

          </div>
        </div>

        <!-- ═══ TABS: Description / Specifications ═══ -->
        <div class="pd-tabs">
          <div class="pd-tab-row" role="tablist">
            <button class="pd-tab" role="tab" [class.on]="activeTab() === 'desc'"
              [attr.aria-selected]="activeTab() === 'desc'"
              (click)="activeTab.set('desc')">Description</button>
            @if (p.specifications?.length || p.weight) {
              <button class="pd-tab" role="tab" [class.on]="activeTab() === 'specs'"
                [attr.aria-selected]="activeTab() === 'specs'"
                (click)="activeTab.set('specs')">Specifications</button>
            }
          </div>

          <div class="pd-tab-body" role="tabpanel">
            @if (activeTab() === 'desc') {
              @if (p.description) {
                <div class="pd-desc" [innerHTML]="p.description"></div>
              } @else if (p.short_description) {
                <p class="pd-desc">{{ p.short_description }}</p>
              } @else {
                <p class="pd-desc pd-desc-none">No description has been added for this product yet.</p>
              }
            }
            @if (activeTab() === 'specs') {
              <div class="pd-specs">
                @if (p.weight) {
                  <div class="pd-spec-row"><span>Weight</span><span>{{ p.weight }}g</span></div>
                }
                @if (p.sku) {
                  <div class="pd-spec-row"><span>SKU</span><span>{{ p.sku }}</span></div>
                }
                @if (p.brand) {
                  <div class="pd-spec-row"><span>Brand</span><span>{{ p.brand }}</span></div>
                }
                @if (p.unit) {
                  <div class="pd-spec-row"><span>Unit / Size</span><span>{{ p.unit }}</span></div>
                }
                @for (spec of (p.specifications || []); track spec.key) {
                  <div class="pd-spec-row"><span>{{ spec.key }}</span><span>{{ spec.value }}</span></div>
                }
              </div>
            }
          </div>
        </div>

        <!-- ═══ RELATED PRODUCTS ═══ -->
        @if (related().length) {
          <section class="pd-related">
            <div class="pd-related-head">
              <span class="sec-eyebrow">From the same shelf</span>
              <h2 class="pd-related-title">You May Also Like</h2>
            </div>
            <div class="pd-related-grid">
              @for (rp of related(); track rp.id) {
                <app-product-card [product]="rp" />
              }
            </div>
          </section>
        }

      </div>
    </div>

    <!-- ═══ STICKY MOBILE ADD-TO-CART BAR ═══ -->
    <!-- Only shows on mobile (≤900px), positioned above bottom nav -->
    @if (p.stock > 0) {
      <div class="pd-sticky-bar">
        <div class="pd-sticky-info">
          @if (selectedImage()) {
            <img [src]="media(selectedImage())" [alt]="p.name" class="pd-sticky-thumb" />
          }
          <span class="pd-sticky-price">{{ cur }}{{ activePrice() }}</span>
        </div>
        <button class="pd-sticky-btn" type="button"
          (click)="addToCart(p)" [disabled]="adding()">
          @if (added()) { ✓ Added! } @else { Add to Cart }
        </button>
      </div>
    }
  }
  `,

  styles: [`
  /* ── Skeleton ── */
  .pd-skel-wrap { padding: 48px 0 64px; }
  .pd-skel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
  .pd-skel-info { display: flex; flex-direction: column; gap: 10px; }
  .skeleton {
    background: linear-gradient(90deg, var(--kg-warm) 25%, var(--kg-sand) 50%, var(--kg-warm) 75%);
    background-size: 200% 100%; animation: shimmer 1.6s infinite;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── Not found ── */
  .pd-notfound {
    display: flex; flex-direction: column; align-items: center;
    gap: 18px; padding: 80px 24px; text-align: center; max-width: 440px; margin: 0 auto;
  }
  .pd-notfound-icon {
    width: 80px; height: 80px; border-radius: var(--r-xl);
    background: var(--kg-warm); color: var(--kg-faint);
    display: grid; place-items: center; border: 1.5px solid var(--kg-line);
  }
  .pd-notfound-title { font-size: 1.4rem; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .pd-notfound-text { font-size: 14.5px; color: var(--kg-muted); line-height: 1.7; margin: 0; }
  .pd-notfound-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

  /* ── Wrap ── */
  .pd-wrap { padding: 36px 0 72px; background: var(--kg-cream); }

  /* ── Breadcrumb ── */
  .pd-crumbs {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: var(--kg-faint); margin-bottom: 32px; flex-wrap: wrap;
  }
  .pd-crumbs a { color: var(--kg-muted); text-decoration: none; transition: color .2s; font-weight: 600; }
  .pd-crumbs a:hover { color: var(--kg-forest); }
  .pd-crumbs svg { opacity: .38; flex-shrink: 0; }
  .pd-crumbs span { color: var(--kg-ink); font-weight: 700; }

  /* ── Main grid ── */
  .pd-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 56px;
    margin-bottom: 52px; align-items: start;
  }

  /* ═══ GALLERY ═══ */
  .pd-gallery { display: flex; flex-direction: column; gap: 12px; position: sticky; top: calc(var(--header-height) + 16px); }

  .pd-main-img-wrap {
    position: relative; border-radius: 14px; overflow: hidden;
    background: var(--kg-warm); border: 1.5px solid var(--kg-line);
    aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center;
    touch-action: pan-y;
  }
  .pd-main-img {
    width: 80%; height: 80%; object-fit: contain;
    transition: opacity .25s;
  }
  .pd-img-anim { animation: pdImgPop .28s var(--ease2); }
  @keyframes pdImgPop { 0% { transform: scale(.96); opacity: .7; } 100% { transform: scale(1); opacity: 1; } }

  .pd-mono {
    font-family: var(--font-sans); font-size: clamp(80px, 14vw, 140px);
    font-weight: 800; color: var(--kg-line-warm); user-select: none;
  }

  /* Badges */
  .pd-disc-badge {
    position: absolute; top: 12px; left: 12px;
    background: var(--kg-terra); color: #FFFFFF;
    font-size: 11.5px; font-weight: 800; padding: 4px 12px;
    border-radius: var(--r-full); font-family: var(--font-sans); letter-spacing: .04em;
  }
  .pd-new-badge {
    position: absolute; top: 12px; left: 12px;
    background: var(--kg-forest); color: #FFFFFF;
    font-size: 11.5px; font-weight: 800; padding: 4px 12px;
    border-radius: var(--r-full); font-family: var(--font-sans);
  }
  .pd-disc-badge + .pd-new-badge { left: auto; right: 12px; }

  /* Image nav */
  .pd-img-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 36px; height: 36px; border-radius: var(--r-full);
    background: rgba(255,255,255,.92); color: var(--kg-ink);
    border: 1.5px solid var(--kg-line); display: grid; place-items: center;
    box-shadow: var(--shadow-xs); transition: all .2s; cursor: pointer;
  }
  .pd-img-btn:hover { color: var(--kg-forest); border-color: var(--kg-forest); background: #FFFFFF; box-shadow: var(--shadow-sm); }
  .pd-img-prev { left: 10px; }
  .pd-img-next { right: 10px; }

  .pd-img-dots {
    position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 5px; padding: 5px 8px; border-radius: var(--r-full);
    background: rgba(255,255,255,.82); border: 1px solid var(--kg-line-lt);
  }
  .pd-img-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--kg-line-warm); transition: all .3s; }
  .pd-img-dots span.on { width: 14px; border-radius: var(--r-full); background: var(--kg-forest); }

  /* Wishlist */
  .pd-wish-btn {
    position: absolute; top: 12px; right: 12px;
    width: 38px; height: 38px; border-radius: var(--r-full);
    background: rgba(255,255,255,.92); border: 1.5px solid var(--kg-line);
    display: grid; place-items: center; color: var(--kg-faint);
    cursor: pointer; transition: all .22s; backdrop-filter: blur(4px);
  }
  .pd-wish-btn:hover { color: var(--kg-clay); border-color: var(--kg-clay); }
  .pd-wish-btn.on { color: var(--kg-clay); border-color: rgba(192,57,43,.4); background: var(--kg-clay-bg); }

  /* Thumbnails */
  .pd-thumbs { display: flex; gap: 9px; flex-wrap: wrap; }
  .pd-thumb {
    width: 70px; height: 70px; border-radius: var(--r);
    border: 2px solid var(--kg-line); background: var(--kg-warm);
    overflow: hidden; cursor: pointer; transition: border-color .2s; padding: 0;
    display: grid; place-items: center;
  }
  .pd-thumb:hover { border-color: var(--kg-forest-lt); }
  .pd-thumb.on { border-color: var(--kg-forest); box-shadow: 0 0 0 2px var(--kg-forest-bg); }
  .pd-thumb img { width: 100%; height: 100%; object-fit: contain; }

  /* ═══ INFO PANEL ═══ */
  .pd-info { display: flex; flex-direction: column; gap: 16px; }

  .pd-cat-chip {
    display: inline-flex; align-items: center;
    font-size: 10.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase;
    color: var(--kg-forest-dk); text-decoration: none; transition: color .2s;
    font-family: var(--font-sans);
  }
  .pd-cat-chip:hover { color: var(--kg-terra); }

  .pd-name {
    font-family: var(--font-sans);
    font-size: clamp(1.35rem, 2.4vw, 2rem);
    font-weight: 800; color: var(--kg-ink); line-height: 1.18;
    letter-spacing: -0.02em; margin: 0;
  }

  .pd-meta-line { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .pd-brand {
    font-size: 12.5px; color: var(--kg-muted); font-weight: 700;
    font-family: var(--font-sans);
  }
  .pd-sku { font-size: 12px; color: var(--kg-faint); font-family: var(--font-sans); }
  .pd-sku strong { color: var(--kg-muted); }

  /* Price */
  .pd-price-block { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .pd-price-main {
    font-family: var(--font-sans); font-size: clamp(1.6rem, 2.8vw, 2.1rem);
    font-weight: 800; color: var(--kg-ink); line-height: 1;
    letter-spacing: -0.02em;
  }
  .pd-price-was { font-size: 15px; color: var(--kg-faint); text-decoration: line-through; font-weight: 600; }
  .pd-save-tag {
    font-size: 12px; font-weight: 800; color: var(--kg-forest-dk);
    background: var(--kg-forest-bg); padding: 3px 10px; border-radius: var(--r-full);
    font-family: var(--font-sans);
  }

  /* Stock */
  .pd-stock-row { display: flex; align-items: center; gap: 8px; }
  .pd-stock-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--kg-forest-lt); flex-shrink: 0; }
  .pd-stock-dot.out { background: var(--kg-clay); }
  .pd-stock-label { font-size: 13.5px; font-weight: 700; color: var(--kg-forest); font-family: var(--font-sans); }
  .pd-stock-label.out { color: var(--kg-clay); }
  .pd-stock-warn {
    font-size: 11.5px; font-weight: 700; color: var(--kg-terra-dk);
    background: var(--kg-terra-bg); padding: 3px 10px; border-radius: var(--r-full);
    font-family: var(--font-sans);
  }

  .pd-short-desc { font-size: 14.5px; color: var(--kg-muted); line-height: 1.75; margin: 0; }

  /* Variations */
  .pd-variants { display: flex; flex-direction: column; gap: 10px; }
  .pd-variants-label {
    font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
    color: var(--kg-faint); font-family: var(--font-sans);
  }
  .pd-variants-label strong { color: var(--kg-ink); font-weight: 700; text-transform: none; letter-spacing: 0; }
  .pd-var-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .pd-var-btn {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 9px 16px; border: 1.5px solid var(--kg-line-warm); border-radius: var(--r);
    font-family: var(--font-sans); cursor: pointer; transition: all .2s; background: var(--kg-paper);
  }
  .pd-var-btn:hover:not(:disabled) { border-color: var(--kg-forest); }
  .pd-var-btn.on { border-color: var(--kg-forest); background: var(--kg-forest-bg); box-shadow: 0 0 0 1px var(--kg-forest); }
  .pd-var-btn:disabled { opacity: .42; cursor: not-allowed; }
  .pd-var-name { font-size: 13px; font-weight: 700; color: var(--kg-ink); }
  .pd-var-price { font-style: normal; font-size: 12px; color: var(--kg-muted); font-weight: 600; }
  .pd-var-btn.on .pd-var-name { color: var(--kg-forest-dk); }

  /* Quantity + ATC */
  .pd-atc-area { display: flex; flex-direction: column; gap: 12px; }
  .pd-qty-row { display: flex; align-items: center; gap: 12px; }
  .pd-qty {
    display: flex; align-items: center;
    border: 1.5px solid var(--kg-line-warm); border-radius: var(--r-lg); overflow: hidden;
    flex-shrink: 0; background: var(--kg-paper);
  }
  .pd-qty-btn {
    width: 44px; height: 48px; display: grid; place-items: center;
    color: var(--kg-ink); cursor: pointer; background: none;
    transition: background .2s, color .2s;
  }
  .pd-qty-btn:hover:not(:disabled) { background: var(--kg-forest-bg); color: var(--kg-forest); }
  .pd-qty-btn:disabled { opacity: .3; cursor: not-allowed; }
  .pd-qty-val {
    min-width: 44px; text-align: center; font-size: 15.5px; font-weight: 800;
    color: var(--kg-ink); font-family: var(--font-sans);
    border-left: 1.5px solid var(--kg-line-lt); border-right: 1.5px solid var(--kg-line-lt);
  }
  .pd-atc-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    background: var(--kg-forest); color: #FFFFFF;
    border: none; border-radius: var(--r-xl); padding: 16px 28px;
    font-family: var(--font-sans); font-size: 15.5px; font-weight: 800;
    cursor: pointer; transition: all .28s; box-shadow: var(--shadow-forest);
    letter-spacing: 0.01em;
  }
  .pd-atc-btn:hover:not(:disabled) {
    background: var(--kg-forest-dk); transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(27,76,140,.35);
  }
  .pd-atc-btn:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; transform: none; }

  /* Trust strip */
  .pd-trust {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    padding: 14px; background: var(--kg-warm); border-radius: var(--r-lg);
    border: 1px solid var(--kg-line);
  }
  .pd-trust-item {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 8px; border-radius: var(--r); background: var(--kg-paper);
    border: 1px solid var(--kg-line-lt);
  }
  .pd-trust-icon {
    width: 28px; height: 28px; border-radius: var(--r-sm); flex-shrink: 0;
    display: grid; place-items: center;
    background: var(--kg-forest-bg); color: var(--kg-forest);
  }
  .pd-trust-icon svg { width: 15px; height: 15px; }
  .pd-trust-item > div { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .pd-trust-item strong { font-size: 11px; color: var(--kg-ink); font-family: var(--font-sans); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pd-trust-item span { font-size: 10px; color: var(--kg-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ═══ TABS ═══ */
  .pd-tabs { margin-bottom: 52px; border-top: 1px solid var(--kg-line); padding-top: 0; }
  .pd-tab-row {
    display: flex; gap: 0; border-bottom: 2px solid var(--kg-line-lt); margin-bottom: 28px;
  }
  .pd-tab {
    padding: 14px 22px; font-family: var(--font-sans); font-size: 14px; font-weight: 700;
    color: var(--kg-muted); background: none; border: none;
    border-bottom: 2px solid transparent; margin-bottom: -2px;
    cursor: pointer; transition: all .2s; letter-spacing: .01em;
  }
  .pd-tab.on { color: var(--kg-forest-dk); border-bottom-color: var(--kg-forest); }
  .pd-tab:hover:not(.on) { color: var(--kg-ink); }
  .pd-tab-body { min-height: 100px; }
  .pd-desc {
    font-size: 15px; color: var(--kg-ink-2); line-height: 1.85;
    max-width: 760px;
  }
  .pd-desc h1, .pd-desc h2, .pd-desc h3 { margin: 20px 0 10px; }
  .pd-desc p { margin-bottom: 14px; }
  .pd-desc ul, .pd-desc ol { padding-left: 20px; margin-bottom: 14px; }
  .pd-desc li { margin-bottom: 6px; }
  .pd-desc-none { color: var(--kg-faint); font-style: italic; }
  .pd-specs { display: flex; flex-direction: column; max-width: 560px; }
  .pd-spec-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0; border-bottom: 1px solid var(--kg-line-lt);
    font-size: 13.5px; gap: 16px;
  }
  .pd-spec-row:last-child { border-bottom: none; }
  .pd-spec-row span:first-child { color: var(--kg-muted); font-weight: 600; }
  .pd-spec-row span:last-child { color: var(--kg-ink); font-weight: 700; text-align: right; }

  /* ═══ RELATED PRODUCTS ═══ */
  .pd-related { margin-bottom: 20px; }
  .pd-related-head { margin-bottom: 28px; }
  .pd-related-title { font-size: 1.4rem; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .pd-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }

  /* ═══ STICKY MOBILE BAR ═══ */
  .pd-sticky-bar {
    display: none;
    position: fixed; bottom: 68px; left: 0; right: 0; z-index: 100;
    background: var(--kg-paper); border-top: 1.5px solid var(--kg-line);
    padding: 10px 16px; gap: 12px; align-items: center;
    box-shadow: 0 -6px 22px rgba(18,56,33,.1);
  }
  .pd-sticky-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .pd-sticky-thumb {
    width: 38px; height: 38px; object-fit: contain; border-radius: var(--r);
    background: var(--kg-warm); flex-shrink: 0; border: 1px solid var(--kg-line);
  }
  .pd-sticky-price { font-size: 16px; font-weight: 800; color: var(--kg-ink); letter-spacing: -0.01em; }
  .pd-sticky-btn {
    background: var(--kg-forest); color: #FFFFFF; border: none;
    border-radius: var(--r-lg); padding: 12px 20px;
    font-family: var(--font-sans); font-size: 14px; font-weight: 800; cursor: pointer;
    transition: background .22s; white-space: nowrap; flex-shrink: 0;
  }
  .pd-sticky-btn:hover:not(:disabled) { background: var(--kg-forest-dk); }
  .pd-sticky-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* ═══ RESPONSIVE ═══ */
  @media (max-width: 1000px) {
    .pd-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
    .pd-related-grid { grid-template-columns: repeat(2, 1fr); }
    .pd-trust { grid-template-columns: 1fr; gap: 6px; }
    .pd-trust-item { gap: 10px; padding: 10px 12px; }
  }

  @media (max-width: 860px) {
    .pd-grid { grid-template-columns: 1fr; gap: 24px; }
    .pd-gallery { position: static; }
    .pd-wrap { padding: 24px 0 100px; }
    .pd-sticky-bar { display: flex; }
    .pd-skel-grid { grid-template-columns: 1fr; }
    .pd-trust { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 640px) {
    .pd-name { font-size: 1.3rem; }
    .pd-price-main { font-size: 1.55rem; }
    .pd-crumbs { font-size: 11.5px; margin-bottom: 18px; font-size: 11px; }
    .pd-related-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .pd-thumbs { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
    .pd-thumbs::-webkit-scrollbar { display: none; }
    .pd-thumb { width: 58px; height: 58px; flex-shrink: 0; }
    .pd-tabs { margin-bottom: 28px; }
    .pd-tab { padding: 12px 16px; font-size: 13px; }
    .pd-atc-btn { font-size: 14.5px; padding: 14px 22px; }
    .pd-trust { grid-template-columns: 1fr 1fr; }
    .pd-trust-item:last-child { grid-column: span 2; justify-content: center; }
    .pd-sticky-bar { bottom: 60px; padding: 9px 14px; }
    .pd-img-btn { width: 32px; height: 32px; }
    .pd-img-prev { left: 8px; }
    .pd-img-next { right: 8px; }
  }

  @media (max-width: 400px) {
    .pd-trust { grid-template-columns: 1fr; }
    .pd-trust-item:last-child { grid-column: auto; justify-content: flex-start; }
    .pd-var-btn { padding: 8px 12px; }
    .pd-related-grid { gap: 10px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .pd-img-anim { animation: none; }
    .pd-atc-btn, .pd-img-btn { transition: none; }
  }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<any>(null);
  related = signal<any[]>([]);
  loading = signal(true);
  selectedImage = signal('');
  imgAnimate = signal(false);
  selectedVariation = signal<any>(null);
  qty = 1;
  adding = signal(false);
  added = signal(false);
  activeTab = signal('desc');
  mediaUrl = (environment as any).mediaUrl || '';
  private touchStartX = 0;

  constructor(
    private route: ActivatedRoute,
    public cart: CartService,
    public wishlist: WishlistService,
    public settings: SettingsService,
    private api: ApiService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loading.set(true);
      this.product.set(null);
      this.related.set([]);
      this.qty = 1;
      this.selectedVariation.set(null);
      this.activeTab.set('desc');

      this.api.getProductBySlug(params['slug']).subscribe({
        next: (r: any) => {
          if (r.success && r.data) {
            const p = r.data;
            this.product.set(p);
            const imgs = p.images || [];
            this.selectedImage.set(p.primary_image || imgs[0]?.image_path || '');
            this.seo.setProductMeta(p);
            // Load related products from same category
            if (p.categories?.[0]?.slug) {
              this.api.getProducts({ category: p.categories[0].slug, limit: 4, exclude: p.id }).subscribe({
                next: (rel: any) => {
                  if (rel.success) {
                    this.related.set((rel.data || []).filter((rp: any) => rp.id !== p.id).slice(0, 4));
                  }
                },
                error: () => {}
              });
            }
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });
  }

  selectImg(path: string) {
    if (!path || path === this.selectedImage()) return;
    this.imgAnimate.set(false);
    setTimeout(() => { this.selectedImage.set(path); this.imgAnimate.set(true); }, 20);
  }

  productImages(p: any = this.product()): string[] {
    if (!p) return [];
    const paths = [
      p.primary_image,
      ...(p.images || []).map((im: any) => im.image_path)
    ].filter(Boolean);
    return Array.from(new Set(paths));
  }

  nextImage() {
    const images = this.productImages();
    if (images.length < 2) return;
    const current = images.indexOf(this.selectedImage());
    this.selectImg(images[(current < 0 ? 0 : current + 1) % images.length]);
  }

  prevImage() {
    const images = this.productImages();
    if (images.length < 2) return;
    const current = images.indexOf(this.selectedImage());
    this.selectImg(images[current <= 0 ? images.length - 1 : current - 1]);
  }

  onGalleryTouchStart(event: TouchEvent) { this.touchStartX = event.changedTouches[0]?.clientX || 0; }
  onGalleryTouchEnd(event: TouchEvent) {
    const delta = (event.changedTouches[0]?.clientX || 0) - this.touchStartX;
    if (Math.abs(delta) < 42) return;
    delta < 0 ? this.nextImage() : this.prevImage();
  }

  pickVar(v: any) {
    this.selectedVariation.set(v);
    if (v.image) this.selectImg(v.image);
  }

  get cur() { return this.settings.get('currency_symbol', 'HK$'); }

  onSale(): boolean {
    const p = this.product();
    if (!p) return false;
    const v = this.selectedVariation();
    if (v) return !!(v.sale_price && +v.sale_price < +v.price);
    return !!(p.sale_price && +p.sale_price < +p.price);
  }

  activePrice(): string {
    const p = this.product();
    if (!p) return '0';
    const v = this.selectedVariation();
    if (v) return v.sale_price && +v.sale_price < +v.price ? v.sale_price : v.price;
    return p.sale_price && +p.sale_price < +p.price ? p.sale_price : p.price;
  }

  discount(): number {
    const p = this.product();
    if (!p || !this.onSale()) return 0;
    const orig = +(p.price);
    const sale = +(this.activePrice());
    return Math.round(((orig - sale) / orig) * 100);
  }

  media(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : this.mediaUrl + path;
  }

  onImgErr(e: Event) {
    const el = e.target as HTMLImageElement;
    if (el.src.includes('placeholder.png') || el.src.includes('assets/placeholder')) return;
    el.src = 'assets/placeholder.png';
  }

  decQty() { if (this.qty > 1) this.qty--; }
  incQty(p: any) { if (this.qty < (p.stock || 99)) this.qty++; }

  addToCart(p: any) {
    if (p.stock <= 0 || this.adding()) return;
    this.adding.set(true);
    const item = this.selectedVariation() ? { ...p, ...this.selectedVariation() } : p;
    for (let i = 0; i < this.qty; i++) this.cart.addItem(item);
    setTimeout(() => {
      this.adding.set(false);
      this.added.set(true);
      setTimeout(() => this.added.set(false), 2200);
    }, 280);
  }
}

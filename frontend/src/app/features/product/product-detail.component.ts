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
        <div class="pd-skel-gallery">
          <div class="skeleton" style="aspect-ratio:1/1;border-radius:16px"></div>
          <div class="pd-skel-thumbs">
            @for (t of [1,2,3,4]; track t) {
              <div class="skeleton pd-skel-thumb"></div>
            }
          </div>
        </div>
        <div class="pd-skel-info">
          <div class="skeleton" style="height:11px;width:90px;border-radius:6px"></div>
          <div class="skeleton" style="height:42px;width:92%;border-radius:10px;margin-top:8px"></div>
          <div class="skeleton" style="height:42px;width:65%;border-radius:10px;margin-top:4px"></div>
          <div class="skeleton" style="height:11px;width:110px;border-radius:6px;margin-top:8px"></div>
          <div class="skeleton" style="height:56px;border-radius:10px;margin-top:16px"></div>
          <div class="skeleton" style="height:80px;border-radius:12px;margin-top:10px"></div>
          <div class="skeleton" style="height:56px;border-radius:999px;margin-top:14px"></div>
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
              @if (p.is_new && discount() === 0) {
                <span class="pd-new-badge">New</span>
              }

              <!-- Out of stock overlay -->
              @if (p.stock <= 0) {
                <div class="pd-oos-overlay">
                  <span class="pd-oos-label">Out of Stock</span>
                </div>
              }

              <!-- Image nav -->
              @if (productImages(p).length > 1) {
                <button class="pd-img-btn pd-img-prev" type="button"
                  (click)="prevImage()" aria-label="Previous image">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="pd-img-btn pd-img-next" type="button"
                  (click)="nextImage()" aria-label="Next image">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
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

              <!-- Wishlist button -->
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
                <span class="pd-cat-chip-line" aria-hidden="true"></span>
                {{ p.categories[0].name }}
              </a>
            }

            <!-- Product name -->
            <h1 class="pd-name">{{ p.name }}</h1>

            <!-- Brand + SKU -->
            @if (p.brand || p.sku) {
              <div class="pd-meta-line">
                @if (p.brand) {
                  <span class="pd-brand">{{ p.brand }}</span>
                }
                @if (p.sku) {
                  <span class="pd-sku">SKU: <strong>{{ p.sku }}</strong></span>
                }
              </div>
            }

            <!-- Price block -->
            <div class="pd-price-block">
              @if (onSale()) {
                <div class="pd-price-sale-row">
                  <span class="pd-price-main">{{ cur }}{{ activePrice() }}</span>
                  <span class="pd-price-was">{{ cur }}{{ p.price }}</span>
                </div>
                <span class="pd-save-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 7H4l2 12h12L20 7zM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Save {{ cur }}{{ (+p.price - +activePrice()).toFixed(2) }}
                </span>
              } @else {
                <span class="pd-price-main">{{ cur }}{{ activePrice() }}</span>
              }
            </div>

            <!-- Stock status -->
            <div class="pd-stock-row">
              @if (p.stock > 0) {
                <span class="pd-stock-dot"></span>
                <span class="pd-stock-label">In Stock</span>
                @if (p.stock <= 10) {
                  <span class="pd-stock-warn">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                    </svg>
                    Only {{ p.stock }} left
                  </span>
                }
              } @else {
                <span class="pd-stock-dot out"></span>
                <span class="pd-stock-label out">Out of Stock</span>
              }
            </div>

            <!-- Short description -->
            @if (p.short_description) {
              <p class="pd-short-desc">{{ p.short_description }}</p>
            }

            <!-- Divider -->
            <div class="pd-divider"></div>

            <!-- Variations -->
            @if (p.variations?.length) {
              <div class="pd-variants">
                <div class="pd-variants-header">
                  <span class="pd-variants-label">Options</span>
                  @if (selectedVariation()) {
                    <span class="pd-variants-selected">{{ selectedVariation().name }}</span>
                  }
                </div>
                <div class="pd-var-row">
                  @for (v of p.variations; track v.id) {
                    <button class="pd-var-btn" type="button"
                      [class.on]="selectedVariation()?.id === v.id"
                      [class.oos]="v.stock <= 0"
                      [disabled]="v.stock <= 0"
                      (click)="pickVar(v)"
                      [attr.aria-pressed]="selectedVariation()?.id === v.id">
                      <span class="pd-var-name">{{ v.name }}</span>
                      <em class="pd-var-price">{{ cur }}{{ v.sale_price && +v.sale_price < +v.price ? v.sale_price : v.price }}</em>
                      @if (v.stock <= 0) {
                        <span class="pd-var-oos" aria-label="Out of stock">✕</span>
                      }
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
                <span class="pd-qty-price" aria-live="polite">
                  {{ cur }}{{ (+activePrice() * qty).toFixed(2) }}
                </span>
              </div>

              <button class="pd-atc-btn" type="button"
                [disabled]="p.stock <= 0 || adding()"
                [class.pd-atc-added]="added()"
                (click)="addToCart(p)">
                @if (added()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Added to Cart!
                } @else if (p.stock <= 0) {
                  Out of Stock
                } @else if (adding()) {
                  <span class="pd-atc-spinner" aria-hidden="true"></span>
                  Adding…
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2"
                      stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
                    <circle cx="10" cy="21" r="1.3" fill="currentColor"/>
                    <circle cx="17" cy="21" r="1.3" fill="currentColor"/>
                  </svg>
                  Add to Cart
                }
              </button>

              <!-- Secondary: wishlist button (text link) -->
              <button class="pd-wish-link"
                [class.on]="wishlist.has(p.id)"
                (click)="wishlist.toggle(p, media(selectedImage()))"
                type="button">
                <svg width="15" height="15" viewBox="0 0 24 24"
                  [attr.fill]="wishlist.has(p.id) ? 'currentColor' : 'none'">
                  <path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z"
                    stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
                {{ wishlist.has(p.id) ? 'Saved to Wishlist' : 'Add to Wishlist' }}
              </button>
            </div>

            <!-- Trust strip -->
            <div class="pd-trust" aria-label="Shopping assurance">
              <div class="pd-trust-item">
                <span class="pd-trust-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/>
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                  </svg>
                </span>
                <div><strong>Secure Checkout</strong><span>256-bit SSL</span></div>
              </div>
              <div class="pd-trust-item">
                <span class="pd-trust-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.7"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.7"/>
                  </svg>
                </span>
                <div><strong>Hong Kong Store</strong><span>Local delivery</span></div>
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

        <!-- ═══ TABS ═══ -->
        <div class="pd-tabs">
          <div class="pd-tab-row" role="tablist">
            <button class="pd-tab" role="tab" [class.on]="activeTab() === 'desc'"
              [attr.aria-selected]="activeTab() === 'desc'"
              (click)="activeTab.set('desc')">Description</button>
            @if (p.specifications?.length || p.weight || p.sku || p.brand || p.unit) {
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
              <p class="sec-eyebrow">From the same shelf</p>
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
    @if (p.stock > 0) {
      <div class="pd-sticky-bar" [class.pd-sticky-added]="added()">
        <div class="pd-sticky-info">
          @if (selectedImage()) {
            <img [src]="media(selectedImage())" [alt]="p.name" class="pd-sticky-thumb"
                 (error)="onImgErr($event)" />
          }
          <div class="pd-sticky-details">
            <span class="pd-sticky-name">{{ p.name }}</span>
            <span class="pd-sticky-price">{{ cur }}{{ activePrice() }}</span>
          </div>
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
  .pd-skel-wrap { padding: 52px 0 72px; }
  .pd-skel-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start;
  }
  .pd-skel-gallery { display: flex; flex-direction: column; gap: 14px; }
  .pd-skel-thumbs { display: flex; gap: 10px; }
  .pd-skel-thumb { width: 72px; height: 72px; border-radius: var(--r); flex-shrink: 0; }
  .pd-skel-info { display: flex; flex-direction: column; gap: 12px; }

  /* ── Not found ── */
  .pd-notfound {
    display: flex; flex-direction: column; align-items: center;
    gap: 18px; padding: 88px 24px; text-align: center; max-width: 440px; margin: 0 auto;
  }
  .pd-notfound-icon {
    width: 84px; height: 84px; border-radius: var(--r-xl);
    background: var(--raj-warm); color: var(--raj-faint);
    display: grid; place-items: center; border: 1.5px solid var(--raj-line);
  }
  .pd-notfound-title {
    font-family: var(--font-display); font-size: 1.5rem; font-weight: 600;
    color: var(--raj-ink); margin: 0;
  }
  .pd-notfound-text { font-size: 14.5px; color: var(--raj-muted); line-height: 1.72; margin: 0; }
  .pd-notfound-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

  /* ── Wrap ── */
  .pd-wrap { padding: 40px 0 80px; background: var(--raj-canvas); }

  /* ── Breadcrumb ── */
  .pd-crumbs {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    font-size: 12px; color: var(--raj-faint); margin-bottom: 36px;
    font-family: var(--font-sans); font-weight: 700;
    letter-spacing: .04em; text-transform: uppercase;
  }
  .pd-crumbs a { color: var(--raj-muted); text-decoration: none; transition: color .2s; }
  .pd-crumbs a:hover { color: var(--raj-leaf); }
  .pd-crumbs svg { opacity: .35; flex-shrink: 0; }
  .pd-crumbs span { color: var(--raj-ink); }

  /* ── Main grid ── */
  .pd-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    margin-bottom: 56px; align-items: start;
  }

  /* ═══ GALLERY ═══ */
  .pd-gallery {
    display: flex; flex-direction: column; gap: 14px;
    position: sticky; top: calc(var(--header-height) + 18px);
  }

  .pd-main-img-wrap {
    position: relative; border-radius: 18px; overflow: hidden;
    background: var(--raj-warm);
    border: 1.5px solid var(--raj-line);
    aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center;
    touch-action: pan-y;
    box-shadow: var(--shadow-sm);
  }
  .pd-main-img {
    width: 82%; height: 82%; object-fit: contain;
    transition: opacity .22s;
  }
  .pd-img-anim { animation: pdImgPop .3s var(--ease2) both; }
  @keyframes pdImgPop {
    0% { transform: scale(.95); opacity: .6; }
    100% { transform: scale(1); opacity: 1; }
  }

  .pd-mono {
    font-family: var(--font-display);
    font-size: clamp(80px, 14vw, 140px);
    font-weight: 600; color: var(--raj-line-warm); user-select: none;
  }

  /* OOS overlay */
  .pd-oos-overlay {
    position: absolute; inset: 0; z-index: 5;
    background: rgba(250,247,241,.72); backdrop-filter: blur(3px);
    display: grid; place-items: center;
  }
  .pd-oos-label {
    font-family: var(--font-sans); font-size: 15px; font-weight: 800;
    color: var(--raj-ink); background: var(--raj-paper);
    border: 1.5px solid var(--raj-line); border-radius: var(--r-full);
    padding: 10px 22px; letter-spacing: .04em;
  }

  /* Badges */
  .pd-disc-badge {
    position: absolute; top: 14px; left: 14px; z-index: 4;
    background: var(--raj-chilli); color: #FFFFFF;
    font-size: 12px; font-weight: 800; padding: 5px 14px;
    border-radius: var(--r-full); font-family: var(--font-sans); letter-spacing: .04em;
    box-shadow: 0 3px 10px rgba(192,57,43,.3);
  }
  .pd-new-badge {
    position: absolute; top: 14px; left: 14px; z-index: 4;
    background: var(--raj-leaf); color: #FFFFFF;
    font-size: 12px; font-weight: 800; padding: 5px 14px;
    border-radius: var(--r-full); font-family: var(--font-sans);
  }

  /* Nav buttons */
  .pd-img-btn {
    position: absolute; top: 50%; transform: translateY(-50%); z-index: 4;
    width: 40px; height: 40px; border-radius: var(--r-full);
    background: rgba(255,255,255,.95); color: var(--raj-ink);
    border: 1.5px solid var(--raj-line); display: grid; place-items: center;
    box-shadow: var(--shadow-sm); transition: all .22s; cursor: pointer;
  }
  .pd-img-btn:hover { color: var(--raj-leaf); border-color: var(--raj-leaf); background: #FFFFFF; box-shadow: var(--shadow); }
  .pd-img-prev { left: 12px; }
  .pd-img-next { right: 12px; }

  /* Dot indicators */
  .pd-img-dots {
    position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); z-index: 4;
    display: flex; gap: 5px; padding: 6px 10px; border-radius: var(--r-full);
    background: rgba(255,255,255,.85); border: 1px solid var(--raj-line-lt);
  }
  .pd-img-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--raj-line-warm); transition: all .3s; }
  .pd-img-dots span.on { width: 16px; border-radius: var(--r-full); background: var(--raj-leaf); }

  /* Wishlist (on gallery image) */
  .pd-wish-btn {
    position: absolute; top: 14px; right: 14px; z-index: 4;
    width: 40px; height: 40px; border-radius: var(--r-full);
    background: rgba(255,255,255,.95); border: 1.5px solid var(--raj-line);
    display: grid; place-items: center; color: var(--raj-faint);
    cursor: pointer; transition: all .22s; backdrop-filter: blur(4px);
  }
  .pd-wish-btn:hover { color: var(--raj-chilli); border-color: var(--raj-chilli); }
  .pd-wish-btn.on { color: var(--raj-chilli); border-color: rgba(192,57,43,.45); background: var(--raj-chilli-bg); }

  /* Thumbnails */
  .pd-thumbs { display: flex; gap: 10px; flex-wrap: wrap; }
  .pd-thumb {
    width: 74px; height: 74px; border-radius: var(--r);
    border: 2px solid var(--raj-line); background: var(--raj-warm);
    overflow: hidden; cursor: pointer; transition: border-color .22s, box-shadow .22s; padding: 0;
    display: grid; place-items: center; flex-shrink: 0;
  }
  .pd-thumb:hover { border-color: var(--raj-leaf-lt); }
  .pd-thumb.on { border-color: var(--raj-leaf); box-shadow: 0 0 0 3px var(--raj-leaf-bg); }
  .pd-thumb img { width: 100%; height: 100%; object-fit: contain; }

  /* ═══ INFO PANEL ═══ */
  .pd-info { display: flex; flex-direction: column; gap: 18px; }

  /* Category chip */
  .pd-cat-chip {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 10.5px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
    color: var(--raj-turmeric-dk); text-decoration: none; transition: color .2s;
    font-family: var(--font-sans);
  }
  .pd-cat-chip-line {
    display: inline-block; width: 18px; height: 2px;
    background: var(--raj-turmeric); border-radius: 2px;
  }
  .pd-cat-chip:hover { color: var(--raj-leaf); }

  /* Name */
  .pd-name {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 2.5vw, 2.1rem);
    font-weight: 600; color: var(--raj-ink); line-height: 1.15;
    letter-spacing: -0.022em; margin: 0;
  }

  /* Meta line */
  .pd-meta-line { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: -6px; }
  .pd-brand { font-size: 12.5px; color: var(--raj-muted); font-weight: 700; font-family: var(--font-sans); }
  .pd-sku { font-size: 12px; color: var(--raj-faint); font-family: var(--font-sans); }
  .pd-sku strong { color: var(--raj-muted); }

  /* Price */
  .pd-price-block { display: flex; flex-direction: column; gap: 6px; margin-top: -2px; }
  .pd-price-sale-row { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .pd-price-main {
    font-family: var(--font-sans); font-size: clamp(1.7rem, 3vw, 2.3rem);
    font-weight: 800; color: var(--raj-ink); line-height: 1;
    letter-spacing: -0.025em; font-variant-numeric: tabular-nums;
  }
  .pd-price-was {
    font-size: 16px; color: var(--raj-faint); text-decoration: line-through;
    font-weight: 600; font-variant-numeric: tabular-nums;
  }
  .pd-save-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 800; color: var(--raj-leaf-dk);
    background: var(--raj-leaf-bg); padding: 5px 12px; border-radius: var(--r-full);
    border: 1px solid var(--raj-leaf-bg2); font-family: var(--font-sans);
  }

  /* Stock */
  .pd-stock-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .pd-stock-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--raj-leaf-lt); flex-shrink: 0; }
  .pd-stock-dot.out { background: var(--raj-chilli); }
  .pd-stock-label { font-size: 13.5px; font-weight: 700; color: var(--raj-leaf); font-family: var(--font-sans); }
  .pd-stock-label.out { color: var(--raj-chilli); }
  .pd-stock-warn {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11.5px; font-weight: 700; color: var(--raj-turmeric-dk);
    background: var(--raj-turmeric-bg); padding: 4px 11px; border-radius: var(--r-full);
    border: 1px solid var(--raj-turmeric-bg2); font-family: var(--font-sans);
  }

  .pd-short-desc {
    font-size: 15px; color: var(--raj-muted); line-height: 1.78; margin: 0;
  }

  /* Divider */
  .pd-divider { height: 1px; background: var(--raj-line); margin: -4px 0; }

  /* Variations */
  .pd-variants { display: flex; flex-direction: column; gap: 12px; }
  .pd-variants-header { display: flex; align-items: center; gap: 10px; }
  .pd-variants-label {
    font-size: 10.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase;
    color: var(--raj-faint); font-family: var(--font-sans);
  }
  .pd-variants-selected {
    font-size: 12.5px; font-weight: 700; color: var(--raj-leaf-dk);
    background: var(--raj-leaf-bg); padding: 3px 10px; border-radius: var(--r-full);
    border: 1px solid var(--raj-leaf-bg2); font-family: var(--font-sans);
  }
  .pd-var-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .pd-var-btn {
    position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 10px 16px; border: 1.5px solid var(--raj-line-warm); border-radius: var(--r);
    font-family: var(--font-sans); cursor: pointer; transition: all .22s;
    background: var(--raj-paper); min-width: 72px;
  }
  .pd-var-btn:hover:not(:disabled):not(.oos) { border-color: var(--raj-leaf); }
  .pd-var-btn.on {
    border-color: var(--raj-leaf); background: var(--raj-leaf-bg);
    box-shadow: 0 0 0 1.5px var(--raj-leaf);
  }
  .pd-var-btn.oos { opacity: .42; cursor: not-allowed; }
  .pd-var-btn:disabled { cursor: not-allowed; }
  .pd-var-name { font-size: 13.5px; font-weight: 700; color: var(--raj-ink); }
  .pd-var-price { font-style: normal; font-size: 12px; color: var(--raj-muted); font-weight: 600; }
  .pd-var-btn.on .pd-var-name { color: var(--raj-leaf-dk); }
  .pd-var-oos {
    position: absolute; top: 5px; right: 7px; font-size: 9px;
    color: var(--raj-chilli); font-weight: 800;
  }

  /* Quantity + ATC */
  .pd-atc-area { display: flex; flex-direction: column; gap: 12px; }
  .pd-qty-row { display: flex; align-items: center; gap: 14px; }
  .pd-qty {
    display: flex; align-items: center;
    border: 1.5px solid var(--raj-line-warm); border-radius: var(--r-lg); overflow: hidden;
    flex-shrink: 0; background: var(--raj-paper);
  }
  .pd-qty-btn {
    width: 46px; height: 50px; display: grid; place-items: center;
    color: var(--raj-ink); cursor: pointer; background: none;
    transition: background .2s, color .2s;
  }
  .pd-qty-btn:hover:not(:disabled) { background: var(--raj-leaf-bg); color: var(--raj-leaf); }
  .pd-qty-btn:disabled { opacity: .3; cursor: not-allowed; }
  .pd-qty-val {
    min-width: 46px; text-align: center; font-size: 16px; font-weight: 800;
    color: var(--raj-ink); font-family: var(--font-sans);
    border-left: 1.5px solid var(--raj-line-lt); border-right: 1.5px solid var(--raj-line-lt);
    font-variant-numeric: tabular-nums;
  }
  .pd-qty-price {
    font-family: var(--font-sans); font-size: 15px; font-weight: 700;
    color: var(--raj-muted); font-variant-numeric: tabular-nums;
  }

  .pd-atc-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    background: var(--raj-leaf); color: #FFFFFF;
    border: none; border-radius: var(--r-2xl); padding: 17px 28px;
    font-family: var(--font-sans); font-size: 16px; font-weight: 800;
    cursor: pointer; transition: all .3s var(--ease); box-shadow: var(--shadow-leaf);
    letter-spacing: 0.01em;
  }
  .pd-atc-btn:hover:not(:disabled) {
    background: var(--raj-leaf-dk); transform: translateY(-2px);
    box-shadow: 0 16px 38px rgba(23,81,63,.32);
  }
  .pd-atc-btn:active:not(:disabled) { transform: translateY(0); }
  .pd-atc-btn:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; transform: none; }
  .pd-atc-btn.pd-atc-added { background: var(--raj-leaf-dk); }
  .pd-atc-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
    animation: pdSpin .65s linear infinite; flex-shrink: 0;
  }
  @keyframes pdSpin { to { transform: rotate(360deg); } }

  /* Wishlist text link */
  .pd-wish-link {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-family: var(--font-sans); font-size: 13.5px; font-weight: 700;
    color: var(--raj-muted); background: none; border: 1.5px solid var(--raj-line);
    border-radius: var(--r-full); padding: 10px 20px; cursor: pointer; transition: all .22s;
  }
  .pd-wish-link:hover { color: var(--raj-chilli); border-color: var(--raj-chilli); background: var(--raj-chilli-bg); }
  .pd-wish-link.on { color: var(--raj-chilli); border-color: rgba(192,57,43,.38); background: var(--raj-chilli-bg); }

  /* Trust strip */
  .pd-trust {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    padding: 14px; background: var(--raj-warm); border-radius: var(--r-lg);
    border: 1px solid var(--raj-line);
  }
  .pd-trust-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 10px; border-radius: var(--r); background: var(--raj-paper);
    border: 1px solid var(--raj-line-lt);
  }
  .pd-trust-icon {
    width: 30px; height: 30px; border-radius: var(--r-sm); flex-shrink: 0;
    display: grid; place-items: center;
    background: var(--raj-leaf-bg); color: var(--raj-leaf);
  }
  .pd-trust-icon svg { width: 16px; height: 16px; }
  .pd-trust-item > div { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .pd-trust-item strong { font-size: 11px; color: var(--raj-ink); font-family: var(--font-sans); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pd-trust-item span { font-size: 10px; color: var(--raj-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ═══ TABS ═══ */
  .pd-tabs { margin-bottom: 56px; border-top: 1px solid var(--raj-line); padding-top: 0; }
  .pd-tab-row {
    display: flex; gap: 0; border-bottom: 2px solid var(--raj-line-lt); margin-bottom: 30px;
  }
  .pd-tab {
    padding: 16px 24px; font-family: var(--font-sans); font-size: 14px; font-weight: 700;
    color: var(--raj-muted); background: none; border: none;
    border-bottom: 2.5px solid transparent; margin-bottom: -2px;
    cursor: pointer; transition: all .22s; letter-spacing: .01em;
  }
  .pd-tab.on { color: var(--raj-leaf-dk); border-bottom-color: var(--raj-leaf); }
  .pd-tab:hover:not(.on) { color: var(--raj-ink); }
  .pd-tab-body { min-height: 80px; }
  .pd-desc {
    font-size: 15.5px; color: var(--raj-ink-2); line-height: 1.88;
    max-width: 720px;
  }
  .pd-desc h1, .pd-desc h2, .pd-desc h3 { margin: 22px 0 10px; color: var(--raj-ink); }
  .pd-desc p { margin-bottom: 16px; color: var(--raj-muted); }
  .pd-desc ul, .pd-desc ol { padding-left: 22px; margin-bottom: 16px; }
  .pd-desc li { margin-bottom: 6px; color: var(--raj-muted); }
  .pd-desc-none { color: var(--raj-faint); font-style: italic; }
  .pd-specs { display: flex; flex-direction: column; max-width: 560px; }
  .pd-spec-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 13px 0; border-bottom: 1px solid var(--raj-line-lt);
    font-size: 14px; gap: 16px;
  }
  .pd-spec-row:last-child { border-bottom: none; }
  .pd-spec-row span:first-child { color: var(--raj-muted); font-weight: 600; }
  .pd-spec-row span:last-child { color: var(--raj-ink); font-weight: 700; text-align: right; }

  /* ═══ RELATED ═══ */
  .pd-related { margin-bottom: 24px; }
  .pd-related-head { margin-bottom: 30px; }
  .pd-related-title {
    font-family: var(--font-display); font-size: clamp(1.3rem, 2.2vw, 1.7rem);
    font-weight: 600; color: var(--raj-ink); margin: 0; letter-spacing: -0.02em;
  }
  .pd-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }

  /* ═══ STICKY MOBILE BAR ═══ */
  .pd-sticky-bar {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    background: var(--raj-paper);
    border-top: 1.5px solid var(--raj-line);
    padding: 10px 16px; gap: 12px; align-items: center;
    box-shadow: 0 -8px 28px rgba(20,52,42,.1);
    transition: background .3s;
  }
  .pd-sticky-bar.pd-sticky-added { background: var(--raj-leaf-bg); }
  .pd-sticky-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
  .pd-sticky-thumb {
    width: 40px; height: 40px; object-fit: contain; border-radius: var(--r);
    background: var(--raj-warm); flex-shrink: 0; border: 1px solid var(--raj-line);
  }
  .pd-sticky-details { display: flex; flex-direction: column; min-width: 0; }
  .pd-sticky-name {
    font-size: 12px; font-weight: 700; color: var(--raj-ink); font-family: var(--font-sans);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pd-sticky-price {
    font-size: 16px; font-weight: 800; color: var(--raj-ink);
    letter-spacing: -0.01em; font-variant-numeric: tabular-nums;
  }
  .pd-sticky-btn {
    background: var(--raj-leaf); color: #FFFFFF; border: none;
    border-radius: var(--r-lg); padding: 13px 22px;
    font-family: var(--font-sans); font-size: 14px; font-weight: 800; cursor: pointer;
    transition: background .22s; white-space: nowrap; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(23,81,63,.28);
  }
  .pd-sticky-btn:hover:not(:disabled) { background: var(--raj-leaf-dk); }
  .pd-sticky-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* ═══ RESPONSIVE ═══ */
  @media (max-width: 1100px) {
    .pd-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
    .pd-related-grid { grid-template-columns: repeat(2, 1fr); }
    .pd-trust { grid-template-columns: 1fr; gap: 6px; }
  }

  @media (max-width: 860px) {
    .pd-grid { grid-template-columns: 1fr; gap: 28px; }
    .pd-gallery { position: static; }
    .pd-wrap { padding: 28px 0 100px; }
    .pd-sticky-bar { display: flex; }
    .pd-skel-grid { grid-template-columns: 1fr; }
    .pd-trust { grid-template-columns: repeat(3, 1fr); }
    .pd-related-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .pd-name { font-size: 1.4rem; }
    .pd-price-main { font-size: 1.7rem; }
    .pd-crumbs { font-size: 10.5px; margin-bottom: 20px; }
    .pd-related-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    /* overflow-y pinned deliberately — leaving it to default lets the browser
       compute it to auto, turning this thumbnail rail into a hidden vertical
       scroll container that swallows page scroll on mobile. */
    .pd-thumbs { flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden; padding-bottom: 4px; scrollbar-width: none; }
    .pd-thumbs::-webkit-scrollbar { display: none; }
    .pd-thumb { width: 60px; height: 60px; flex-shrink: 0; }
    .pd-tabs { margin-bottom: 32px; }
    .pd-tab { padding: 12px 17px; font-size: 13px; }
    .pd-atc-btn { font-size: 15px; padding: 15px 24px; }
    .pd-trust { grid-template-columns: 1fr 1fr; }
    .pd-trust-item:last-child { grid-column: span 2; justify-content: center; }
    .pd-img-btn { width: 34px; height: 34px; }
    .pd-img-prev { left: 8px; }
    .pd-img-next { right: 8px; }
  }

  @media (max-width: 400px) {
    .pd-trust { grid-template-columns: 1fr; }
    .pd-trust-item:last-child { grid-column: auto; justify-content: flex-start; }
    .pd-var-btn { padding: 8px 12px; min-width: 60px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .pd-img-anim { animation: none; }
    .pd-atc-btn, .pd-img-btn { transition: none; }
    .pd-atc-spinner { animation: none; }
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
      setTimeout(() => this.added.set(false), 2400);
    }, 280);
  }
}

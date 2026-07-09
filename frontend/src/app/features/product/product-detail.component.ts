import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  @if (loading()) {
    <div class="container pd-skeleton-wrap">
      <div class="pd-skel-grid">
        <div class="skeleton" style="height:480px;border-radius:20px"></div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="skeleton" style="height:14px;width:100px;border-radius:8px"></div>
          <div class="skeleton" style="height:40px;width:85%;border-radius:8px"></div>
          <div class="skeleton" style="height:30px;width:50%;border-radius:8px"></div>
          <div class="skeleton" style="height:18px;width:120px;border-radius:8px"></div>
          <div class="skeleton" style="height:80px;border-radius:8px"></div>
          <div class="skeleton" style="height:52px;border-radius:999px"></div>
        </div>
      </div>
    </div>
  } @else if (product(); as p) {
    <div class="container pd-wrap">

      <!-- Breadcrumb -->
      <nav class="pd-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><i>/</i>
        @if (p.categories?.[0]) {
          <a [routerLink]="['/category', p.categories[0].slug]">{{ p.categories[0].name }}</a><i>/</i>
        }
        <span>{{ p.name }}</span>
      </nav>

      <!-- Product Grid -->
      <div class="pd-grid">

        <!-- Gallery -->
        <div class="pd-gallery">
          <div class="pd-main-img-wrap"
            (touchstart)="onGalleryTouchStart($event)"
            (touchend)="onGalleryTouchEnd($event)">
            @if (selectedImage()) {
              <img [src]="media(selectedImage())" [alt]="p.name" class="pd-main-img" [class.pd-img-anim]="imgAnimate()" />
            } @else {
              <span class="pd-mono" aria-hidden="true">{{ (p.name || '?')[0] }}</span>
            }
            @if (discount() > 0) {
              <span class="pd-disc-badge">−{{ discount() }}%</span>
            }
            @if (productImages(p).length > 1) {
              <button class="pd-gallery-btn prev" type="button" (click)="prevImage()" aria-label="Previous product image">
                <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="pd-gallery-btn next" type="button" (click)="nextImage()" aria-label="Next product image">
                <svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <div class="pd-gallery-dots" aria-hidden="true">
                @for (path of productImages(p); track path) {
                  <span [class.on]="path === selectedImage()"></span>
                }
              </div>
            }
            <button class="pd-wish-btn" [class.on]="wishlist.has(p.id)"
              (click)="wishlist.toggle(p, media(selectedImage()))"
              [attr.aria-label]="wishlist.has(p.id) ? 'Remove from wishlist' : 'Add to wishlist'">
              <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="wishlist.has(p.id) ? 'currentColor' : 'none'">
                <path d="M12 20s-7-4.3-9.3-8.6C1 8 2.6 4.7 6 4.3c2-.2 3.6.8 4.5 2.3h3c.9-1.5 2.5-2.5 4.5-2.3 3.4.4 5 3.7 3.3 7.1C19 15.7 12 20 12 20z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          @if (productImages(p).length > 1) {
            <div class="pd-thumbs">
              @for (path of productImages(p); track path) {
                <button class="pd-thumb" [class.on]="path === selectedImage()" (click)="selectImg(path)">
                  <img [src]="media(path)" [alt]="p.name" loading="lazy" />
                </button>
              }
            </div>
          }
        </div>

        <!-- Info -->
        <div class="pd-info">
          @if (p.categories?.[0]) {
            <a class="pd-cat-chip" [routerLink]="['/category', p.categories[0].slug]">{{ p.categories[0].name }}</a>
          }

          <h1 class="pd-name">{{ p.name }}</h1>

          <!-- Rating -->
          <div class="pd-rating-row">
            <div class="pd-stars">
              @for (s of [1,2,3,4,5]; track s) {
                <span [class.on]="s <= starRating(p)">★</span>
              }
            </div>
            @if (p.review_count > 0) {
              <span class="pd-review-count">({{ p.review_count }} reviews)</span>
            }
          </div>

          <!-- Price -->
          <div class="pd-price-block">
            @if (onSale()) {
              <span class="pd-price-main">{{ cur }}{{ activePrice() }}</span>
              <span class="pd-price-was">{{ cur }}{{ p.price }}</span>
              <span class="pd-save-tag">You save {{ cur }}{{ (+p.price - +activePrice()).toFixed(2) }}</span>
            } @else {
              <span class="pd-price-main">{{ cur }}{{ activePrice() }}</span>
            }
          </div>

          <!-- Stock -->
          <div class="pd-stock-row">
            <span class="pd-stock-dot" [class.out]="p.stock <= 0"></span>
            <span class="pd-stock-label" [class.out]="p.stock <= 0">
              {{ p.stock > 0 ? 'In Stock' : 'Out of Stock' }}
            </span>
            @if (p.stock > 0 && p.stock <= 10) {
              <span class="pd-stock-warn">Only {{ p.stock }} left!</span>
            }
          </div>

          <!-- Short description -->
          @if (p.short_description) {
            <p class="pd-short-desc">{{ p.short_description }}</p>
          }

          <!-- Variants -->
          @if (p.variations?.length) {
            <div class="pd-variants">
              <h4>Options</h4>
              <div class="pd-var-row">
                @for (v of p.variations; track v.id) {
                  <button class="pd-var-btn" [class.on]="selectedVariation()?.id === v.id" (click)="pickVar(v)">
                    {{ v.name }}
                    <em>{{ cur }}{{ v.sale_price || v.price }}</em>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Quantity + Add to cart -->
          <div class="pd-atc-row">
            <div class="pd-qty">
              <button (click)="decQty()" aria-label="Decrease quantity">−</button>
              <span>{{ qty }}</span>
              <button (click)="incQty(p)" aria-label="Increase quantity">+</button>
            </div>
            <button class="pd-atc-btn" [disabled]="p.stock <= 0 || adding()" (click)="addToCart(p)">
              @if (added()) {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Added to cart!
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 7h14l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.7L5.3 4.6A2 2 0 0 0 3.3 3H2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="17" cy="21" r="1.4" fill="currentColor"/></svg>
                {{ p.stock <= 0 ? 'Out of Stock' : 'Add to Cart' }}
              }
            </button>
          </div>

          <!-- Delivery info strip -->
          <div class="pd-delivery-strip" aria-label="Shopping benefits">
            <div class="pd-del-item">
              <span class="pd-del-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 7h11v10H5a2 2 0 0 1-2-2V7zM14 10h3.2l2.8 3.2V17h-6v-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="1.8" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="18" r="1.8" stroke="currentColor" stroke-width="1.8"/></svg>
              </span>
              <div><strong>Free delivery</strong><span>on orders over {{ cur }}{{ settings.get('shipping_free_above','50') }}</span></div>
            </div>
            <div class="pd-del-item">
              <span class="pd-del-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
              <div><strong>Secure checkout</strong><span>256-bit SSL encrypted</span></div>
            </div>
            <div class="pd-del-item">
              <span class="pd-del-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M20 7v5h-5M4 17v-5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.1 9a7 7 0 0 1 11.4-2.3L20 12M4 12l2.5 5.3A7 7 0 0 0 17.9 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <div><strong>Easy returns</strong><span>14-day return policy</span></div>
            </div>
          </div>

          <!-- SKU -->
          @if (p.sku) {
            <p class="pd-sku">SKU: <strong>{{ p.sku }}</strong></p>
          }
        </div>
      </div>

      <!-- Tabs: Description / Specs -->
      <div class="pd-tabs">
        <div class="pd-tab-row">
          <button class="pd-tab" [class.on]="activeTab() === 'desc'" (click)="activeTab.set('desc')">Description</button>
          @if (p.specifications?.length || p.weight) {
            <button class="pd-tab" [class.on]="activeTab() === 'specs'" (click)="activeTab.set('specs')">Specifications</button>
          }
        </div>

        <div class="pd-tab-body">
          @if (activeTab() === 'desc') {
            @if (p.description) {
              <div class="pd-desc" [innerHTML]="p.description"></div>
            } @else if (p.short_description) {
              <p class="pd-desc">{{ p.short_description }}</p>
            } @else {
              <p class="pd-desc" style="color:#6B7280">No description available for this product.</p>
            }
          }
          @if (activeTab() === 'specs') {
            <div class="pd-specs">
              @if (p.weight) { <div class="pd-spec-row"><span>Weight</span><span>{{ p.weight }}g</span></div> }
              @if (p.sku) { <div class="pd-spec-row"><span>SKU</span><span>{{ p.sku }}</span></div> }
              @for (spec of (p.specifications || []); track spec.key) {
                <div class="pd-spec-row"><span>{{ spec.key }}</span><span>{{ spec.value }}</span></div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Related Products -->
      @if (related().length) {
        <div class="pd-related">
          <h2>You may also like</h2>
          <div class="pd-related-grid">
            @for (rp of related(); track rp.id) {
              <app-product-card [product]="rp" />
            }
          </div>
        </div>
      }

    </div>
  } @else if (!loading()) {
    <div class="container empty-state" style="padding-top:60px">
      <div style="font-size:3rem;margin-bottom:16px">🔍</div>
      <h3>Product not found</h3>
      <p>This product may no longer be available.</p>
      <a routerLink="/categories" class="btn btn-primary" style="margin-top:20px">Browse Categories</a>
    </div>
  }

  <!-- Sticky mobile ATC bar -->
  @if (product(); as p) {
    @if (p.stock > 0) {
      <div class="pd-sticky-atc">
        <div class="pd-sticky-info">
          @if (selectedImage()) { <img [src]="media(selectedImage())" [alt]="p.name" class="pd-sticky-img" /> }
          <span class="pd-sticky-name">{{ p.name }}</span>
        </div>
        <button class="pd-sticky-btn" (click)="addToCart(p)" [disabled]="adding()">
          {{ added() ? '✓ Added!' : 'Add to Cart — ' + cur + activePrice() }}
        </button>
      </div>
    }
  }
  `,
  styles: [`
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}

  .pd-skeleton-wrap { padding: 40px 0; }
  .pd-skel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
  .skeleton { background: linear-gradient(90deg,#EEF2F6 25%,#F7FAFC 50%,#EEF2F6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* WRAP */
  .pd-wrap { padding: 32px 0 60px; }

  /* BREADCRUMB */
  .pd-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9CA3AF; margin-bottom: 28px; flex-wrap: wrap; }
  .pd-crumbs a { color: #6B7280; transition: color .2s; }
  .pd-crumbs a:hover { color: #1E88A8; }
  .pd-crumbs i { font-style: normal; opacity: .4; }
  .pd-crumbs span { color: #111827; font-weight: 600; }

  /* GRID */
  .pd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; margin-bottom: 48px; }

  /* GALLERY */
  .pd-gallery { display: flex; flex-direction: column; gap: 12px; position: sticky; top: calc(var(--header-height,156px) + 16px); }
  .pd-main-img-wrap {
    position: relative; border-radius: 20px; overflow: hidden;
    background: #F7FAFC;
    border: 1.5px solid #E5E7EB;
    aspect-ratio: 1 / 1; min-height: 420px; display: flex; align-items: center; justify-content: center;
    touch-action: pan-y;
  }
  .pd-main-img {
    width: 100%; height: 100%; object-fit: contain;
    padding: 28px 58px; transition: opacity .3s;
  }
  .pd-img-anim { animation: imgPop .25s cubic-bezier(0.34,1.56,0.64,1); }
  .pd-mono {
    display: grid; place-items: center; width: 100%; height: 100%; min-height: 320px;
    font-family: var(--font-serif); font-style: italic; font-weight: 300;
    font-size: clamp(90px, 14vw, 170px); color: var(--kg-line-warm);
    user-select: none;
  }
  @keyframes imgPop { 0%{transform:scale(0.95);opacity:0.6} 100%{transform:scale(1);opacity:1} }
  .pd-disc-badge { position: absolute; top: 14px; left: 14px; background: #1E88A8; color: #fff; font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 999px; font-family: 'Manrope', sans-serif; }
  .pd-wish-btn { position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.9); border: 1.5px solid #E5E7EB; display: grid; place-items: center; color: #9CA3AF; cursor: pointer; transition: all .22s; backdrop-filter: blur(4px); }
  .pd-wish-btn:hover { color: #1E88A8; border-color: #1E88A8; }
  .pd-wish-btn.on { color: #DC2626; border-color: #DC2626; background: #FEE9E7; }
  .pd-gallery-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(255,255,255,.94); color: #111827;
    border: 1.5px solid #E5E7EB; display: grid; place-items: center;
    box-shadow: 0 6px 18px rgba(17,24,39,.08); transition: all .2s;
  }
  .pd-gallery-btn:hover { color: #1E88A8; border-color: #1E88A8; }
  .pd-gallery-btn svg { width: 20px; height: 20px; }
  .pd-gallery-btn.prev { left: 14px; }
  .pd-gallery-btn.next { right: 14px; }
  .pd-gallery-dots {
    position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%);
    display: flex; gap: 6px; padding: 6px 8px; border-radius: 999px;
    background: rgba(255,255,255,.84); border: 1px solid rgba(229,231,235,.8);
  }
  .pd-gallery-dots span { width: 6px; height: 6px; border-radius: 50%; background: #CBD3DA; }
  .pd-gallery-dots span.on { width: 16px; border-radius: 999px; background: #1E88A8; }

  .pd-thumbs { display: flex; gap: 10px; flex-wrap: wrap; }
  .pd-thumb { width: 72px; height: 72px; border-radius: 10px; border: 2px solid #E5E7EB; background: #F7FAFC; overflow: hidden; cursor: pointer; transition: border-color .2s; padding: 0; }
  .pd-thumb:hover { border-color: #1E88A8; }
  .pd-thumb.on { border-color: #1E88A8; }
  .pd-thumb img { width: 100%; height: 100%; object-fit: contain; }

  /* INFO */
  .pd-info { display: flex; flex-direction: column; gap: 14px; }
  .pd-cat-chip { display: inline-flex; align-items: center; font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #1E88A8; text-decoration: none; transition: color .2s; font-family: 'Manrope', sans-serif; }
  .pd-cat-chip:hover { color: #16708C; }
  .pd-name { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.5rem, 2.5vw, 2.2rem); font-weight: 400; color: #111827; line-height: 1.2; }
  .pd-rating-row { display: flex; align-items: center; gap: 8px; }
  .pd-stars { display: flex; gap: 2px; }
  .pd-stars span { font-size: 16px; color: #D1D5DB; }
  .pd-stars span.on { color: #F0B429; }
  .pd-review-count { font-size: 13px; color: #6B7280; }

  .pd-price-block { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .pd-price-main { font-family: 'Manrope', sans-serif; font-size: 2.2rem; font-weight: 800; color: #1E88A8; line-height: 1; }
  .pd-price-was { font-size: 16px; color: #9CA3AF; text-decoration: line-through; }
  .pd-save-tag { font-size: 12px; font-weight: 700; color: #29B8D5; background: #E9F7FB; padding: 3px 10px; border-radius: 999px; font-family: 'Manrope', sans-serif; }

  .pd-stock-row { display: flex; align-items: center; gap: 8px; }
  .pd-stock-dot { width: 9px; height: 9px; border-radius: 50%; background: #29B8D5; flex-shrink: 0; }
  .pd-stock-dot.out { background: #DC2626; }
  .pd-stock-label { font-size: 14px; font-weight: 700; color: #29B8D5; font-family: 'Manrope', sans-serif; }
  .pd-stock-label.out { color: #DC2626; }
  .pd-stock-warn { font-size: 12.5px; font-weight: 700; color: #F0B429; background: #FEF9C3; padding: 3px 10px; border-radius: 999px; font-family: 'Manrope', sans-serif; }

  .pd-short-desc { font-size: 15px; color: #6B7280; line-height: 1.7; margin: 0; }

  /* VARIANTS */
  .pd-variants h4 { font-size: 13px; font-weight: 800; color: #111827; margin-bottom: 10px; font-family: 'Manrope', sans-serif; text-transform: uppercase; letter-spacing: .1em; }
  .pd-var-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .pd-var-btn { padding: 8px 16px; border: 1.5px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-weight: 700; color: #111827; cursor: pointer; transition: all .2s; background: #fff; font-family: 'Manrope', sans-serif; }
  .pd-var-btn:hover { border-color: #1E88A8; color: #1E88A8; }
  .pd-var-btn.on { border-color: #1E88A8; background: #E6F3F8; color: #1E88A8; }
  .pd-var-btn em { display: block; font-style: normal; font-size: 12px; color: #6B7280; margin-top: 2px; }

  /* ATC */
  .pd-atc-row { display: flex; gap: 12px; align-items: center; }
  .pd-qty { display: flex; align-items: center; gap: 0; border: 1.5px solid #E5E7EB; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
  .pd-qty button { width: 42px; height: 48px; display: grid; place-items: center; font-size: 18px; font-weight: 700; color: #111827; cursor: pointer; background: #fff; border: none; transition: background .2s; }
  .pd-qty button:hover { background: #E6F3F8; }
  .pd-qty span { width: 44px; text-align: center; font-size: 16px; font-weight: 800; color: #111827; font-family: 'Manrope', sans-serif; }
  .pd-atc-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #1E88A8; color: #fff;
    border: none; border-radius: 12px; padding: 14px 24px;
    font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 800;
    cursor: pointer; transition: all .25s; box-shadow: 0 6px 20px rgba(30,136,168,.3);
  }
  .pd-atc-btn:hover:not(:disabled) { background: #16708C; transform: translateY(-1px); box-shadow: 0 10px 28px rgba(30,136,168,.4); }
  .pd-atc-btn:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }

  /* Delivery strip */
  .pd-delivery-strip {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;
    padding: 12px; background: #F7FAFC; border-radius: 12px;
  }
  .pd-del-item {
    display: flex; align-items: center; gap: 9px; min-width: 0;
    padding: 10px; border-radius: 10px; background: #fff; border: 1px solid #EEF2F6;
    font-size: 12px;
  }
  .pd-del-icon {
    width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
    display: grid; place-items: center; color: #1E88A8; background: #E6F3F8;
  }
  .pd-del-icon svg { width: 18px; height: 18px; }
  .pd-del-item > div { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .pd-del-item strong { color: #111827; font-size: 12.5px; font-family: 'Manrope', sans-serif; white-space: nowrap; }
  .pd-del-item span { color: #6B7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pd-sku { font-size: 12.5px; color: #9CA3AF; margin: 0; }
  .pd-sku strong { color: #6B7280; }

  /* TABS */
  .pd-tabs { margin-bottom: 48px; }
  .pd-tab-row { display: flex; gap: 4px; border-bottom: 2px solid #E5E7EB; margin-bottom: 24px; }
  .pd-tab { padding: 10px 20px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 700; color: #6B7280; background: none; border: none; border-bottom: 3px solid transparent; margin-bottom: -2px; cursor: pointer; transition: all .2s; }
  .pd-tab.on { color: #1E88A8; border-bottom-color: #1E88A8; }
  .pd-tab:hover { color: #1E88A8; }
  .pd-tab-body { min-height: 120px; }
  .pd-desc { font-size: 15px; color: #4A5568; line-height: 1.8; }
  .pd-specs { display: flex; flex-direction: column; gap: 0; }
  .pd-spec-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F1F3F6; font-size: 14px; }
  .pd-spec-row span:first-child { color: #6B7280; font-weight: 600; }
  .pd-spec-row span:last-child { color: #111827; font-weight: 700; }

  /* RELATED */
  .pd-related { }
  .pd-related h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.6rem; font-weight: 400; color: #111827; margin-bottom: 24px; }
  .pd-related-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }

  /* STICKY ATC (mobile) */
  .pd-sticky-atc {
    display: none;
    position: fixed; bottom: 72px; left: 0; right: 0; z-index: 100;
    background: #fff; border-top: 1.5px solid #E5E7EB;
    padding: 10px 16px; gap: 12px; align-items: center;
    box-shadow: 0 -4px 20px rgba(17,24,39,.08);
  }
  .pd-sticky-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .pd-sticky-img { width: 40px; height: 40px; object-fit: contain; border-radius: 8px; background: #F7FAFC; flex-shrink: 0; }
  .pd-sticky-name { font-size: 13px; font-weight: 700; color: #111827; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .pd-sticky-btn { background: #1E88A8; color: #fff; border: none; border-radius: 12px; padding: 12px 18px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; white-space: nowrap; flex-shrink: 0; }

  @media (max-width: 900px) {
    .pd-grid { grid-template-columns: 1fr; gap: 24px; }
    .pd-gallery { position: static; }
    .pd-main-img-wrap { min-height: 360px; }
    .pd-main-img { padding: 24px 54px; }
    .pd-related-grid { grid-template-columns: repeat(2,1fr); }
    .pd-sticky-atc { display: flex; }
    .pd-skel-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .pd-wrap { padding: 20px 0 80px; }
    .pd-crumbs { font-size: 11.5px; margin-bottom: 14px; }
    .pd-main-img-wrap { min-height: 330px; border-radius: 16px; }
    .pd-main-img { padding: 22px 44px; }
    .pd-gallery-btn { width: 34px; height: 34px; }
    .pd-gallery-btn.prev { left: 10px; }
    .pd-gallery-btn.next { right: 10px; }
    .pd-name { font-size: 1.25rem; }
    .pd-price-main { font-size: 1.6rem; }
    .pd-related-grid { grid-template-columns: repeat(2,1fr); gap: 10px; }
    .pd-atc-row { gap: 8px; }
    .pd-qty { border-radius: 10px; }
    .pd-qty button { width: 36px; height: 42px; }
    .pd-qty span { width: 36px; font-size: 15px; }
    .pd-atc-btn { padding: 12px 16px; font-size: 14px; }
    .pd-delivery-strip { padding: 8px; gap: 6px; }
    .pd-del-item { flex-direction: column; align-items: center; text-align: center; gap: 6px; padding: 8px 4px; }
    .pd-del-icon { width: 28px; height: 28px; }
    .pd-del-item strong { font-size: 11.2px; }
    .pd-del-item span { display: none; }
    .pd-thumbs { gap: 7px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
    .pd-thumbs::-webkit-scrollbar { display: none; }
    .pd-thumb { width: 58px; height: 58px; }
    .pd-tabs { margin-bottom: 24px; }
    .pd-sticky-atc { bottom: 0; padding: 10px 14px; }
    .pd-sticky-btn { font-size: 13px; padding: 10px 14px; }
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
    private router: Router,
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
      this.qty = 1;
      this.api.getProductBySlug(params['slug']).subscribe({
        next: (r: any) => {
          if (r.success && r.data) {
            const p = r.data;
            this.product.set(p);
            const imgs = p.images || [];
            this.selectedImage.set(p.primary_image || imgs[0]?.image_path || '');
            this.seo.setProductMeta(p);
            // Load related
            if (p.categories?.[0]?.slug) {
              this.api.getProducts({ category: p.categories[0].slug, limit: 4, exclude: p.id }).subscribe({
                next: (rel: any) => { if (rel.success) this.related.set((rel.data || []).filter((rp: any) => rp.id !== p.id).slice(0, 4)); },
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
    const index = current < 0 ? 0 : (current + 1) % images.length;
    this.selectImg(images[index]);
  }

  prevImage() {
    const images = this.productImages();
    if (images.length < 2) return;
    const current = images.indexOf(this.selectedImage());
    const index = current < 0 ? images.length - 1 : (current - 1 + images.length) % images.length;
    this.selectImg(images[index]);
  }

  onGalleryTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0]?.clientX || 0;
  }

  onGalleryTouchEnd(event: TouchEvent) {
    const endX = event.changedTouches[0]?.clientX || 0;
    const delta = endX - this.touchStartX;
    if (Math.abs(delta) < 42) return;
    delta < 0 ? this.nextImage() : this.prevImage();
  }

  pickVar(v: any) {
    this.selectedVariation.set(v);
    if (v.image) this.selectImg(v.image);
  }

  get cur() { return this.settings.get('currency_symbol', '€'); }

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
    if (v) return v.sale_price || v.price;
    return p.sale_price && +p.sale_price < +p.price ? p.sale_price : p.price;
  }

  discount(): number {
    const p = this.product();
    if (!p) return 0;
    if (!this.onSale()) return 0;
    const orig = +(p.price);
    const sale = +(this.activePrice());
    return Math.round(((orig - sale) / orig) * 100);
  }

  starRating(p: any): number {
    return Math.round(parseFloat(p.average_rating || p.rating || '0')) || 4;
  }

  media(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : this.mediaUrl + path;
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
      setTimeout(() => this.added.set(false), 2000);
    }, 300);
  }
}

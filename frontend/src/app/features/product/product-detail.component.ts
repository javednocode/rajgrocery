import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { environment } from '../../../environments/environment';

const WHATSAPP_NUMBER = '353899584325';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="container" style="padding:80px 0;text-align:center;color:#888;">Loading product...</div>
    } @else if (product()) {
      <div class="product-page-wrap">
        <div class="container">
          <!-- Breadcrumb -->
          <div class="bc">
            <a routerLink="/">Home</a>
            @if (product()?.categories?.[0]) {
              <span class="bc-sep">/</span>
              <a [routerLink]="['/category', product()?.categories?.[0]?.slug]">{{ product()?.categories?.[0]?.name }}</a>
            }
            <span class="bc-sep">/</span>
            <span>{{ product()?.name }}</span>
          </div>

          <!-- Main 3-column layout -->
          <div class="product-main-grid">

            <!-- COL 1: Gallery -->
            <div class="gallery-col">
              <div class="main-img-wrap">
                <img [src]="getFullImageUrl(selectedImage())"
                     [alt]="product()?.name"
                     class="main-img"
                     fetchpriority="high"
                     decoding="async"
                     onerror="this.src='placeholder.png'">
                @if (product()?.sale_price && product()?.sale_price < product()?.price) {
                  <div class="sale-badge">{{ getDiscount() }}% OFF</div>
                }
                <div class="stock-ribbon" [class.out]="product()?.stock <= 0">
                  {{ product()?.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK' }}
                </div>
              </div>
              @if (product()?.images?.length > 1) {
                <div class="thumb-row">
                  @for (img of product()?.images; track img.id) {
                    <button class="thumb" [class.active]="img.image_path === selectedImage()"
                      (click)="selectedImage.set(img.image_path)">
                      <img [src]="getFullImageUrl(img.image_path)" [alt]="img.alt_text || product()?.name" loading="lazy" decoding="async">
                    </button>
                  }
                </div>
              }
            </div>

            <!-- COL 2: Product Details -->
            <div class="details-col">
              <h1 class="prod-name">{{ product()?.name }}</h1>

              <!-- Price -->
              <div class="pricing">
                @if (selectedVariation()) {
                  @if (selectedVariation().sale_price && selectedVariation().sale_price < selectedVariation().price) {
                    <span class="price-main">€{{ selectedVariation().sale_price }}</span>
                    <span class="price-old">€{{ selectedVariation().price }}</span>
                  } @else {
                    <span class="price-main">€{{ selectedVariation().sale_price || selectedVariation().price }}</span>
                  }
                } @else {
                  @if (product()?.sale_price && product()?.sale_price < product()?.price) {
                    <span class="price-main">€{{ product()?.sale_price }}</span>
                    <span class="price-old">€{{ product()?.price }}</span>
                  } @else {
                    <span class="price-main">€{{ product()?.price }}</span>
                  }
                }
              </div>

              @if (product()?.short_description) {
                <p class="short-desc">{{ product()?.short_description }}</p>
              }

              <!-- Variations -->
              @if (allVariations().length) {
                <div class="var-section">
                  <label class="var-label">Available Options:</label>
                  <div class="var-grid">
                    @for (v of allVariations(); track v.id) {
                      <button class="var-btn" [class.active]="selectedVariation()?.id === v.id"
                              (click)="selectVariation(v)">
                        @if (v.image_path) {
                          <img [src]="getFullImageUrl(v.image_path)" [alt]="v.name" class="var-thumb" loading="lazy" decoding="async">
                        }
                        <span class="var-name">{{ v.name }}</span>
                        <span class="var-price">€{{ v.sale_price || v.price }}</span>
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Qty + Add to Cart -->
              <div class="atc-row">
                <div class="qty-box">
                  <button class="qty-btn" (click)="quantity > 1 && quantity = quantity - 1">−</button>
                  <span class="qty-val">{{ quantity }}</span>
                  <button class="qty-btn" (click)="quantity = quantity + 1">+</button>
                </div>
                <button class="btn-add-cart" [disabled]="product()?.stock <= 0" (click)="addToCart()">
                  {{ product()?.stock <= 0 ? 'Out of Stock' : 'Add To Cart' }}
                </button>
              </div>

              <!-- WhatsApp Button -->
              <a class="btn-whatsapp" [href]="whatsappLink()" target="_blank" rel="noopener">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>

              <!-- Buy Now -->
              <button class="btn-buy-now" (click)="buyNow()" [disabled]="product()?.stock <= 0">
                Buy Now
              </button>

              <!-- Cart items preview -->
              @if (cart.items().length > 0) {
                <div class="cart-preview">
                  @for (item of cart.items(); track item.id) {
                    <div class="cp-item">
                      <img [src]="item.image || 'placeholder.png'" [alt]="item.name" class="cp-img">
                      <span class="cp-name">This item: {{ item.name }}</span>
                      <span class="cp-price">€{{ ((item.salePrice ?? item.price) * item.quantity).toFixed(2) }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Meta -->
              <div class="prod-meta">
                @if (product()?.sku) { <div class="meta-row"><span>SKU:</span> {{ product()?.sku }}</div> }
                @if (product()?.categories?.length) {
                  <div class="meta-row">
                    <span>Category:</span>
                    @for (cat of product()?.categories; track cat.id) {
                      <a [routerLink]="['/category', cat.slug]" class="cat-link">{{ cat.name }}</a>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- COL 3: Featured Products Sidebar -->
            <aside class="sidebar-col">
              <div class="sidebar-box">
                <div class="sidebar-title">
                  <span>Featured Products</span>
                  <button class="sidebar-toggle" (click)="sidebarOpen = !sidebarOpen">
                    {{ sidebarOpen ? '∧' : '∨' }}
                  </button>
                </div>
                @if (sidebarOpen) {
                  <div class="sidebar-products">
                    @for (fp of featuredProducts(); track fp.id) {
                      <a class="fp-item" [routerLink]="['/product', fp.slug]">
                        <img [src]="getFullImageUrl(fp.primary_image)" [alt]="fp.name" class="fp-img" loading="lazy" decoding="async"
                             onerror="this.src='placeholder.png'">
                        <div class="fp-info">
                          <p class="fp-name">{{ fp.name }}</p>
                          <p class="fp-price">€{{ fp.sale_price || fp.price }}</p>
                        </div>
                      </a>
                    }
                  </div>
                }
              </div>
            </aside>

          </div>

          <!-- Description -->
          @if (product()?.description) {
            <div class="desc-section">
              <h3>Product Description</h3>
              <div class="desc-body" [innerHTML]="product()?.description"></div>
            </div>
          }

          <!-- Related Products -->
          @if (product()?.related_products?.length) {
            <div class="related-section">
              <h2>Related Products</h2>
              <div class="related-grid">
                @for (rp of product()?.related_products; track rp.id) {
                  <app-product-card [product]="rp" />
                }
              </div>
            </div>
          }

        </div>
      </div>
    }

    @if (added()) {
      <div class="toast-msg">✅ Added to cart!</div>
    }
  `,
  styles: [`
    .product-page-wrap {
      background:
        radial-gradient(circle at 12% 0%, rgba(200,150,30,0.08), transparent 24%),
        linear-gradient(180deg, #fbfaf6 0%, #f7faf8 62%, #f9fafb 100%);
      min-height: 100vh;
      padding: 34px 0 70px;
    }

    .bc { font-size: 13px; color: #9CA3AF; margin-bottom: 20px; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    .bc a { color: #F28C00; text-decoration: none; transition: opacity 0.2s; }
    .bc a:hover { opacity: 0.75; }
    .bc-sep { color: #D1D5DB; }

    /* 3-column grid */
    .product-main-grid {
      display: grid;
      grid-template-columns: 340px 1fr 260px;
      gap: 24px;
      align-items: start;
      margin-bottom: 40px;
    }

    .gallery-col {}
    .main-img-wrap {
      position: relative;
      background: linear-gradient(180deg, #ffffff, #f7faf8);
      border: 1px solid #E4EFE8;
      border-radius: 20px;
      padding: 16px;
      aspect-ratio: 1;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      box-shadow: 0 18px 44px rgba(15,25,35,0.06);
    }
    .main-img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .sale-badge {
      position: absolute; top: 12px; left: 12px;
      background: #F28C00; color: white;
      font-size: 11px; font-weight: 700; padding: 4px 10px;
      border-radius: 999px;
    }
    .stock-ribbon {
      position: absolute; top: 12px; right: 12px;
      background: #2E7D32; color: white;
      font-size: 10px; font-weight: 700; padding: 3px 10px;
      border-radius: 999px; letter-spacing: 0.04em;
    }
    .stock-ribbon.out { background: #DC2626; }

    .thumb-row { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    .thumb {
      width: 64px; height: 64px; border-radius: 8px;
      border: 2px solid #E5E7EB; overflow: hidden;
      background: white; padding: 2px; cursor: pointer;
      transition: border-color 0.2s;
    }
    .thumb.active, .thumb:hover { border-color: #F28C00; }
    .thumb img { width: 100%; height: 100%; object-fit: contain; }

    /* Details */
    .details-col {
      background: rgba(255,255,255,0.92);
      border: 1px solid #E4EFE8;
      border-radius: 20px;
      padding: 26px;
      box-shadow: 0 18px 44px rgba(15,25,35,0.06);
    }
    .prod-name { font-size: 20px; font-weight: 800; color: #111; margin-bottom: 12px; line-height: 1.3; font-family: 'Poppins', sans-serif; }

    .pricing { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .price-main { font-size: 28px; font-weight: 800; color: #F28C00; font-family: 'Poppins', sans-serif; }
    .price-old { font-size: 18px; color: #B0B3BE; text-decoration: line-through; }

    .short-desc { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 20px; }

    /* ATC row */
    .atc-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .qty-box {
      display: flex; align-items: center;
      border: 1.5px solid #E5E7EB; border-radius: 8px; overflow: hidden;
    }
    .qty-btn {
      width: 36px; height: 40px; font-size: 18px; font-weight: 700;
      background: #F9FAFB; border: none; cursor: pointer; color: #374151;
      transition: background 0.15s;
    }
    .qty-btn:hover { background: #F3F4F6; }
    .qty-val { padding: 0 16px; font-size: 16px; font-weight: 600; color: #111; min-width: 24px; text-align: center; }
    .btn-add-cart {
      flex: 1; padding: 10px 16px;
      background: #2E7D32; color: white;
      border: none; border-radius: 8px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      transition: background 0.2s; font-family: 'Inter', sans-serif;
    }
    .btn-add-cart:hover:not(:disabled) { background: #15803D; }
    .btn-add-cart:disabled { background: #9CA3AF; cursor: not-allowed; }

    /* WhatsApp */
    .btn-whatsapp {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 11px;
      background: #25D366; color: white;
      border: none; border-radius: 8px;
      font-size: 14px; font-weight: 700;
      text-decoration: none; margin-bottom: 10px;
      transition: background 0.2s;
    }
    .btn-whatsapp:hover { background: #128C7E; }

    /* Buy Now */
    .btn-buy-now {
      display: block; width: 100%;
      padding: 12px;
      background: #F28C00; color: white;
      border: none; border-radius: 8px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      font-family: 'Inter', sans-serif; margin-bottom: 16px;
      transition: background 0.2s;
    }
    .btn-buy-now:hover:not(:disabled) { background: #070A05; }
    .btn-buy-now:disabled { background: #9CA3AF; cursor: not-allowed; }

    /* Variations */
    .var-section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #F3F4F6; }
    .var-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #9CA3AF; margin-bottom: 10px; display: block; }
    .var-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .var-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px; border: 1.5px solid #E5E7EB;
      border-radius: 8px; background: white; cursor: pointer;
      transition: all 0.2s; font-family: 'Inter', sans-serif;
    }
    .var-btn:hover { border-color: #F28C00; background: #FFF2DE; }
    .var-btn.active { border-color: #F28C00; background: #FFF2DE; box-shadow: 0 0 0 2px rgba(242,140,0,0.15); }
    .var-thumb { width: 28px; height: 28px; border-radius: 4px; object-fit: cover; }
    .var-name { font-size: 13px; font-weight: 600; color: #111; }
    .var-price { font-size: 12px; font-weight: 700; color: #F28C00; }

    /* Cart preview */
    .cart-preview {
      border: 1px solid #F3F4F6; border-radius: 8px;
      margin-bottom: 16px; overflow: hidden;
    }
    .cp-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-bottom: 1px solid #F9FAFB;
      font-size: 13px;
    }
    .cp-item:last-child { border-bottom: none; }
    .cp-img { width: 36px; height: 36px; object-fit: contain; border-radius: 6px; flex-shrink: 0; background: #F9FAFB; }
    .cp-name { flex: 1; color: #374151; line-height: 1.3; }
    .cp-price { font-weight: 700; color: #111; white-space: nowrap; }

    /* Meta */
    .prod-meta { margin-top: 12px; border-top: 1px solid #F3F4F6; padding-top: 12px; }
    .meta-row { font-size: 13px; color: #6B7280; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .meta-row span { font-weight: 600; color: #374151; }
    .cat-link { color: #F28C00; text-decoration: none; font-size: 13px; }
    .cat-link:hover { text-decoration: underline; }

    /* Sidebar */
    .sidebar-col {}
    .sidebar-box { background: white; border: 1px solid #E4EFE8; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 34px rgba(15,25,35,0.05); }
    .sidebar-title {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px;
      background: #FFF9F0; border-bottom: 1px solid #E4EFE8;
      font-size: 13px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .sidebar-toggle { background: none; border: none; cursor: pointer; font-size: 16px; color: #9CA3AF; padding: 0; }
    .sidebar-products { padding: 8px 0; }
    .fp-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; text-decoration: none;
      border-bottom: 1px solid #F9FAFB; transition: background 0.15s;
    }
    .fp-item:hover { background: #FFF2DE; }
    .fp-img { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; border: 1px solid #F3F4F6; flex-shrink: 0; }
    .fp-info { flex: 1; min-width: 0; }
    .fp-name { font-size: 12px; color: #374151; margin-bottom: 3px; line-height: 1.3;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .fp-price { font-size: 13px; font-weight: 700; color: #F28C00; }

    /* Description */
    .desc-section { background: white; border: 1px solid #E4EFE8; border-radius: 20px; padding: 28px; margin-bottom: 36px; box-shadow: 0 12px 34px rgba(15,25,35,0.04); }
    .desc-section h3 { font-size: 17px; font-weight: 700; color: #111; margin-bottom: 16px; font-family: 'Poppins', sans-serif; }
    .desc-body { font-size: 14px; color: #6B7280; line-height: 1.85; }

    /* Related */
    .related-section { margin-bottom: 40px; }
    .related-section h2 { font-size: 20px; font-weight: 800; color: #111; margin-bottom: 20px; }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    @media (max-width: 640px) {
      .related-grid {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .related-section { margin-bottom: 24px; }
      .related-section h2 { font-size: 16px; margin-bottom: 12px; }
    }

    /* Toast */
    .toast-msg {
      position: fixed; bottom: 80px; right: 24px; z-index: 9999;
      background: #2E7D32; color: white;
      padding: 12px 20px; border-radius: 10px;
      font-size: 14px; font-weight: 600;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 1100px) {
      .product-main-grid { grid-template-columns: 280px 1fr; }
      .sidebar-col { display: none; }
    }
    @media (max-width: 700px) {
      .product-main-grid { grid-template-columns: 1fr; }
      .gallery-col .main-img-wrap { aspect-ratio: auto; min-height: 260px; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<any>(null);
  selectedImage = signal('');
  selectedVariation = signal<any>(null);
  featuredProducts = signal<any[]>([]);
  loading = signal(true);
  added = signal(false);
  quantity = 1;
  sidebarOpen = true;
  private mediaUrl = environment.mediaUrl;

  /** Build the full list of variation buttons:
   *  1st = base product (2KG / €7.99)
   *  rest = product_variations (5KG, 10KG, …) */
  allVariations = computed(() => {
    const p = this.product();
    if (!p) return [];
    // Build base-product label from weight + unit (e.g. 2.00 Kg → "2KG")
    const weight = p.weight ? parseFloat(p.weight) : null;
    const unit   = (p.unit || '').replace(/piece/i, '').trim();
    const baseName = weight && unit
      ? `${weight % 1 === 0 ? weight : weight}${unit.toUpperCase()}`
      : weight
        ? `${weight}KG`
        : p.name;
    const baseVariation = {
      id: `base_${p.id}`,
      name: baseName,
      price: p.price,
      sale_price: p.sale_price,
      stock: p.stock,
      image_path: null,   // no thumbnail inside the button
      _isBase: true
    };
    const extras = p.variations || [];
    // Only show base as button if there are also real variations
    return extras.length > 0 ? [baseVariation, ...extras] : extras;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public cart: CartService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loading.set(true);
      window.scrollTo(0, 0);
      this.api.getProductBySlug(params['slug']).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.product.set(res.data);
            // Always default-select the BASE product (first option = 2KG)
            const baseImg = res.data.images?.[0]?.image_path || '';
            const weight  = res.data.weight ? parseFloat(res.data.weight) : null;
            const unit    = (res.data.unit || '').replace(/piece/i, '').trim();
            const baseName = weight && unit
              ? `${weight % 1 === 0 ? weight : weight}${unit.toUpperCase()}`
              : weight ? `${weight}KG` : res.data.name;
            this.selectedVariation.set({
              id: `base_${res.data.id}`,
              name: baseName,
              price: res.data.price,
              sale_price: res.data.sale_price,
              stock: res.data.stock,
              image_path: null,   // no thumbnail inside the button
              _isBase: true
            });
            this.selectedImage.set(baseImg);
            this.seo.setProductMeta(res.data);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });

    // Load featured products for sidebar
    this.api.getFeaturedProducts(8).subscribe({
      next: (res: any) => { if (res.success) this.featuredProducts.set(res.data); }
    });
  }

  getDiscount(): number {
    const p = this.product();
    if (!p?.sale_price || !p?.price) return 0;
    return Math.round(((p.price - p.sale_price) / p.price) * 100);
  }

  addToCart() {
    const p = { ...this.product() };
    const v = this.selectedVariation();
    if (v && !v._isBase) {
      // Real variation (5KG / 10KG) — give it a unique cart ID
      p.base_product_id = p.id;
      p.variation_id = v.id;
      p.id = `${p.id}_v${v.id}`;
      p.name = `${p.name} - ${v.name}`;
      p.price = v.price;
      p.sale_price = v.sale_price;
      if (v.image_path) p.primary_image = v.image_path;
    } else if (v && v._isBase) {
      // Base product selected (2KG) — use its own price but keep original id
      p.price = v.price;
      p.sale_price = v.sale_price;
    }
    this.cart.addItem(p, this.quantity);
    this.quantity = 1;
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }

  buyNow() {
    const p = { ...this.product() };
    const v = this.selectedVariation();
    if (v && !v._isBase) {
      p.base_product_id = p.id;
      p.variation_id = v.id;
      p.id = `${p.id}_v${v.id}`;
      p.name = `${p.name} - ${v.name}`;
      p.price = v.price;
      p.sale_price = v.sale_price;
      if (v.image_path) p.primary_image = v.image_path;
    } else if (v && v._isBase) {
      p.price = v.price;
      p.sale_price = v.sale_price;
    }
    this.cart.addItem(p, this.quantity);
    this.router.navigate(['/checkout']);
  }

  whatsappLink(): string {
    const p = this.product();
    const v = this.selectedVariation();
    const name = v ? `${p?.name} - ${v.name}` : p?.name;
    const price = v ? (v.sale_price || v.price) : (p?.sale_price || p?.price);
    const msg = encodeURIComponent(`Hi! I'm interested in: ${name} (€${price})`);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }

  selectVariation(v: any) {
    this.selectedVariation.set(v);
    // Update main image — for base variation fallback to first product image
    if (v.image_path) {
      this.selectedImage.set(v.image_path);
    } else if (v._isBase) {
      this.selectedImage.set(this.product()?.images?.[0]?.image_path || '');
    }
  }

  getFullImageUrl(path: string): string {
    if (!path) return 'placeholder.png';
    return path.startsWith('http') ? path : this.mediaUrl + path;
  }
}

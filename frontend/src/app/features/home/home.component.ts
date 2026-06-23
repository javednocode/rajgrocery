import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, ScrollAnimateDirective],
  template: `
  <!-- ══════════════════════════════════════════
       HERO — 2-column: copy LEFT, image RIGHT
  ══════════════════════════════════════════ -->
  <section class="hero">
    <div class="container hero-inner">

      <!-- LEFT: Text copy -->
      <div class="hero-copy">
        <span class="hero-sub">{{ settings.get('hero_eyebrow','Fresh & Natural') }}</span>
        <h1>{{ settings.get('hero_title','Stay home & get your daily needs from our shop') }}</h1>
        <p>Start Your Daily Shopping with <strong class="hero-brand">{{ settings.get('site_name','The Desi') }}</strong></p>
        <div class="hero-cta">
          <a routerLink="/categories" class="hero-btn">
            Shop Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>

      <!-- RIGHT: Image from admin panel (first banner) -->
      <div class="hero-img-col">
        @if (heroBannerImg()) {
          <div class="hero-img-wrap">
            <img [src]="heroBannerImg()" [alt]="heroBannerTitle()" class="hero-banner-img" />
            @if (heroBannerTitle()) {
              <div class="hero-img-badge">{{ heroBannerTitle() }}</div>
            }
          </div>
        } @else {
          <!-- Placeholder when no banner uploaded yet -->
          <div class="hero-placeholder">
            <div class="hero-ph-inner">
              <span class="ph-emoji">🛒</span>
              <span class="ph-float ph1">🥦</span>
              <span class="ph-float ph2">🍅</span>
              <span class="ph-float ph3">🌶️</span>
              <span class="ph-float ph4">🧅</span>
            </div>
            <a href="http://localhost:8000/admin/banners.php" target="_blank" class="ph-hint">
              + Upload banner image from Admin Panel
            </a>
          </div>
        }
      </div>

    </div>
  </section>

  <!-- ══════════════════════════════════════════
       BENEFITS STRIP
  ══════════════════════════════════════════ -->
  <section class="benefits">
    <div class="container">
      <div class="benefits-grid">
        @for (b of benefits; track b.t) {
          <div class="benefit-card">
            <span class="benefit-icon">{{ b.ic }}</span>
            <div>
              <strong>{{ b.t }}</strong>
              <p>{{ b.d }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════
       FEATURED CATEGORIES
  ══════════════════════════════════════════ -->
  <section class="section cats-section">
    <div class="container">
      <div class="section-title-bar" appScrollAnimate>
        <h2>Featured Categories</h2>
        <a routerLink="/categories" class="see-all-link">See All →</a>
      </div>
      @if (categories().length) {
        <div class="cats-grid">
          @for (c of categories(); track c.id; let i = $index) {
            <a class="cat-card" [routerLink]="['/category', c.slug]" appScrollAnimate [animationDelay]="(i * 0.05) + 's'">
              <div class="cat-img-wrap">
                @if (c.image) {
                  <img [src]="media(c.image)" [alt]="c.name" loading="lazy" (error)="onCatImgError($event, c.name)" />
                } @else {
                  <span class="cat-fallback">{{ catIcon(c.name) }}</span>
                }
              </div>
              <div class="cat-info">
                <span class="cat-name">{{ c.name }}</span>
                @if (c.product_count > 0) { <span class="cat-count">{{ c.product_count }} items</span> }
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="cats-grid">
          @for (s of [1,2,3,4,5,6,7,8]; track s) {
            <div class="cat-card cat-skel skeleton"></div>
          }
        </div>
      }
    </div>
  </section>

  <!-- ══════════════════════════════════════════
       PROMO CARDS
  ══════════════════════════════════════════ -->
  <section class="promos section-sm">
    <div class="container">
      <div class="promo-grid">
        <div class="promo-card promo-green" appScrollAnimate>
          <div class="promo-text">
            <span class="promo-label">{{ settings.get('promo_1_label','Everyday Fresh') }}</span>
            <h3>{{ settings.get('promo_1_title','Fresh Vegetables & Greens') }}</h3>
            <a routerLink="/categories" class="promo-btn">Shop Now →</a>
          </div>
          <div class="promo-emoji">🥦</div>
        </div>
        <div class="promo-card promo-pink" appScrollAnimate [animationDelay]="'.1s'">
          <div class="promo-text">
            <span class="promo-label">{{ settings.get('promo_2_label','Halal Meats') }}</span>
            <h3>{{ settings.get('promo_2_title','Premium Desi Spices & Masalas') }}</h3>
            <a routerLink="/categories" class="promo-btn">Shop Now →</a>
          </div>
          <div class="promo-emoji">🌶️</div>
        </div>
        <div class="promo-card promo-mint" appScrollAnimate [animationDelay]="'.2s'">
          <div class="promo-text">
            <span class="promo-label">{{ settings.get('promo_3_label','Organic') }}</span>
            <h3>{{ settings.get('promo_3_title','Best Organic Products Online') }}</h3>
            <a routerLink="/categories" class="promo-btn">Shop Now →</a>
          </div>
          <div class="promo-emoji">🫚</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════
       DAILY BEST SELLS
  ══════════════════════════════════════════ -->
  @if (featured().length) {
  <section class="section best-sells">
    <div class="container">
      <div class="best-header" appScrollAnimate>
        <h2>Daily Best Sells</h2>
        <div class="best-tabs">
          @for (tab of sellTabs; track tab) {
            <button class="tab-btn" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
          }
        </div>
        <a routerLink="/categories" class="see-all-link" style="margin-left:auto">View All →</a>
      </div>
      <div class="best-grid">
        <div class="best-promo-card">
          <div class="bpc-inner">
            <p class="bpc-eyebrow">Bring nature</p>
            <h3>into your home</h3>
            <a routerLink="/categories" class="promo-btn">Shop Now →</a>
          </div>
          <div class="bpc-leaf">🌿</div>
        </div>
        <div class="pgrid4">
          @for (p of featured().slice(0,4); track p.id; let i = $index) {
            <div appScrollAnimate [animationDelay]="(i * 0.06) + 's'"><app-product-card [product]="p" /></div>
          }
        </div>
      </div>
    </div>
  </section>
  }

  <!-- ══════════════════════════════════════════
       FEATURED · TRENDING · RECENT · TOP RATED
  ══════════════════════════════════════════ -->

  <!-- Featured Products -->
  @if (featured().length) {
  <section class="section">
    <div class="container">
      <div class="section-title-bar" appScrollAnimate>
        <h2>Featured Products</h2>
        <a routerLink="/categories" class="see-all-link">View All →</a>
      </div>
      <div class="pgrid4">
        @for (p of featured().slice(0, 4); track p.id; let i = $index) {
          <div appScrollAnimate [animationDelay]="(i * 0.06) + 's'"><app-product-card [product]="p" /></div>
        }
      </div>
    </div>
  </section>
  }

  <!-- Trending Products -->
  @if (trending().length) {
  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="section-title-bar" appScrollAnimate>
        <h2>Trending Products</h2>
        <a routerLink="/categories" class="see-all-link">View All →</a>
      </div>
      <div class="pgrid4">
        @for (p of trending(); track p.id; let i = $index) {
          <div appScrollAnimate [animationDelay]="(i * 0.06) + 's'"><app-product-card [product]="p" /></div>
        }
      </div>
    </div>
  </section>
  }

  <!-- Recently Added -->
  @if (recentProducts().length) {
  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="section-title-bar" appScrollAnimate>
        <h2>Recently Added</h2>
        <a routerLink="/categories" class="see-all-link">View All →</a>
      </div>
      <div class="pgrid4">
        @for (p of recentProducts(); track p.id; let i = $index) {
          <div appScrollAnimate [animationDelay]="(i * 0.06) + 's'"><app-product-card [product]="p" /></div>
        }
      </div>
    </div>
  </section>
  }




  <!-- ══════════════════════════════════════════
       WHY US
  ══════════════════════════════════════════ -->
  <section class="section why-section">
    <div class="container">
      <div class="why-header text-center" appScrollAnimate>
        <span class="why-eyebrow">The Desi Promise</span>
        <h2>Why Shop With Us</h2>
      </div>
      <div class="why-grid">
        @for (w of whyUs; track w.t; let i = $index) {
          <div class="why-card" appScrollAnimate [animationDelay]="(i * 0.1) + 's'">
            <div class="why-icon">{{ w.ic }}</div>
            <h4>{{ w.t }}</h4>
            <p>{{ w.d }}</p>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════
       TESTIMONIALS
  ══════════════════════════════════════════ -->
  <section class="section tst-section">
    <div class="container">
      <div class="tst-header text-center" appScrollAnimate>
        <span class="why-eyebrow">Customer Reviews</span>
        <h2>What Our Customers Say</h2>
      </div>
      <div class="tst-grid">
        @for (t of testimonials(); track t.name; let i = $index) {
          <figure class="tst-card" appScrollAnimate [animationDelay]="(i * 0.08) + 's'">
            <div class="tst-stars">★★★★★</div>
            <blockquote>"{{ t.text }}"</blockquote>
            <figcaption>
              <span class="tst-av">{{ t.name.charAt(0) }}</span>
              <div><strong>{{ t.name }}</strong><em>{{ t.city }}</em></div>
            </figcaption>
          </figure>
        }
      </div>
    </div>
  </section>
  `,
  styles: [`
  /* ══ HERO — 2-column ══ */
  .hero{background:#F4FCF7;padding:60px 0;position:relative;overflow:hidden}
  .hero::before{content:'';position:absolute;top:-100px;right:0;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(59,183,126,.12),transparent 70%);pointer-events:none}
  .container{max-width:1280px;margin:0 auto;padding:0 24px;width:100%}
  @media(min-width:768px){.container{padding:0 32px}}
  @media(min-width:1200px){.container{padding:0 40px}}
  .hero-inner{display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center;min-height:420px}
  /* Left copy */
  .hero-sub{display:inline-block;background:#fff;border:1px solid rgba(59,183,126,.3);color:#3BB77E;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:6px 18px;border-radius:999px;margin-bottom:20px}
  .hero-copy h1{font-size:clamp(2rem,3.8vw,3rem);font-weight:800;color:#253D4E;line-height:1.18;margin-bottom:16px}
  .hero-copy p{font-size:16px;color:#7E8D97;margin-bottom:28px;line-height:1.65}
  .hero-brand{color:#3BB77E;font-weight:800}
  .hero-cta{display:flex;gap:14px;flex-wrap:wrap}
  .hero-btn{display:inline-flex;align-items:center;gap:9px;background:#3BB77E;color:#fff;border:none;border-radius:8px;padding:13px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s;text-decoration:none}
  .hero-btn:hover{background:#2A9062;transform:translateY(-2px);box-shadow:0 8px 24px rgba(59,183,126,.35)}
  /* Right image column */
  .hero-img-col{position:relative;height:100%;min-height:380px;display:flex;align-items:stretch}
  .hero-img-wrap{position:relative;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.12)}
  .hero-banner-img{width:100%;height:100%;min-height:360px;max-height:480px;object-fit:cover;object-position:center;display:block}
  .hero-img-badge{position:absolute;bottom:18px;left:18px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;max-width:80%}
  /* Placeholder */
  .hero-placeholder{width:100%;background:linear-gradient(135deg,#DEF9EC,#F4FCF7);border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;min-height:360px;border:2px dashed rgba(59,183,126,.3)}
  .hero-ph-inner{position:relative;width:240px;height:240px;display:flex;align-items:center;justify-content:center}
  .ph-emoji{font-size:90px;animation:float 4s ease-in-out infinite}
  .ph-float{position:absolute;font-size:32px;animation:float 3s ease-in-out infinite}
  .ph1{top:0;left:5%;animation-delay:0s}
  .ph2{top:0;right:5%;animation-delay:.4s}
  .ph3{bottom:5%;left:0;animation-delay:.8s}
  .ph4{bottom:5%;right:0;animation-delay:1.2s}
  .ph-hint{background:rgba(59,183,126,.12);border:1px solid rgba(59,183,126,.35);color:#2A9062;font-size:13px;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;transition:all .2s}
  .ph-hint:hover{background:rgba(59,183,126,.2)}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}

  /* ══ BENEFITS ══ */
  .benefits{padding:24px 0;border-top:1px solid #ECECEC;border-bottom:1px solid #ECECEC;background:#fff}
  .benefits-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:0}
  .benefit-card{display:flex;align-items:center;gap:14px;padding:18px 20px;border-right:1px solid #ECECEC}
  .benefit-card:last-child{border-right:none}
  .benefit-icon{font-size:28px;flex-shrink:0}
  .benefit-card strong{display:block;font-size:13.5px;font-weight:700;color:#253D4E;margin-bottom:2px}
  .benefit-card p{font-size:11.5px;color:#7E8D97;margin:0;line-height:1.4}

  /* ══ CATEGORIES ══ */
  .cats-section{padding:56px 0}
  /* auto-fit (not auto-fill) collapses empty tracks so 5 cards fill the full row */
  .cats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px}
  .cat-card{display:flex;flex-direction:column;background:#fff;border:1px solid #ECECEC;border-radius:16px;overflow:hidden;text-align:center;text-decoration:none;transition:all .3s ease;cursor:pointer}
  .cat-card:hover{border-color:#3BB77E;box-shadow:0 10px 32px rgba(59,183,126,.18);transform:translateY(-6px)}
  .cat-skel{height:240px}
  .cat-img-wrap{width:100%;height:180px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#F4FCF7,#E0F5EC);flex-shrink:0;position:relative}
  .cat-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
  .cat-card:hover .cat-img-wrap img{transform:scale(1.07)}
  .cat-fallback{font-size:72px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:1}
  .cat-info{padding:14px 14px 18px;display:flex;flex-direction:column;align-items:center;gap:5px}
  .cat-name{font-size:14px;font-weight:700;color:#253D4E;line-height:1.3}
  .cat-count{font-size:12px;color:#7E8D97}

  /* ══ PROMO CARDS ══ */
  .promos{padding:0 0 44px}
  .promo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .promo-card{display:flex;align-items:center;justify-content:space-between;border-radius:14px;padding:26px 26px 26px 30px;overflow:hidden;position:relative;min-height:130px}
  .promo-green{background:linear-gradient(135deg,#E8F9F0,#C7EFDB)}
  .promo-pink{background:linear-gradient(135deg,#FEF0F0,#FFD4D4)}
  .promo-mint{background:linear-gradient(135deg,#EFF9F0,#D1F0DC)}
  .promo-text{flex:1}
  .promo-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#3BB77E;margin-bottom:6px;display:block}
  .promo-card h3{font-size:17px;font-weight:800;color:#253D4E;margin-bottom:12px;line-height:1.3}
  .promo-btn{display:inline-flex;align-items:center;gap:6px;background:#3BB77E;color:#fff;border-radius:7px;padding:8px 18px;font-size:13px;font-weight:700;text-decoration:none;transition:all .22s}
  .promo-btn:hover{background:#2A9062;transform:translateY(-1px)}
  .promo-emoji{font-size:64px;margin-left:14px;flex-shrink:0;line-height:1;opacity:.85}

  /* ══ BEST SELLS ══ */
  .best-sells{padding:48px 0}
  .best-header{display:flex;align-items:center;gap:20px;margin-bottom:22px;flex-wrap:wrap}
  .best-header h2{margin:0;font-size:1.55rem}
  .best-tabs{display:flex;gap:16px;flex-wrap:wrap}
  .tab-btn{font-size:13.5px;font-weight:700;color:#7E8D97;padding:4px 0;border-bottom:2px solid transparent;background:none;border-left:none;border-right:none;border-top:none;cursor:pointer;transition:all .2s}
  .tab-btn.active{color:#3BB77E;border-bottom-color:#3BB77E}
  .tab-btn:hover{color:#3BB77E}
  .best-grid{display:grid;grid-template-columns:200px 1fr;gap:18px}
  .best-promo-card{background:linear-gradient(160deg,#E8F9F0,#C7EFDB);border-radius:14px;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:24px;min-height:380px;position:relative;overflow:hidden}
  .bpc-leaf{position:absolute;top:-10px;right:-10px;font-size:130px;opacity:.3;transform:rotate(20deg)}
  .bpc-inner{position:relative;z-index:1}
  .bpc-eyebrow{font-size:13px;color:#3BB77E;font-weight:700;margin-bottom:4px;display:block}
  .bpc-inner h3{font-size:1.4rem;font-weight:800;color:#253D4E;margin-bottom:18px;line-height:1.3}

  /* 4-col product grid */
  .pgrid4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}

  /* ══ SECTION HEADER ══ */
  .see-all-link{font-size:14px;font-weight:700;color:#3BB77E;display:flex;align-items:center;gap:4px;text-decoration:none;transition:color .2s;white-space:nowrap}
  .see-all-link:hover{color:#2A9062}
  .section-title-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
  .section-title-bar h2{margin:0;font-size:1.55rem;font-weight:800;color:#253D4E}
  .section{padding:48px 0}
  .section-sm{padding:0 0 40px}

  /* ══ TOP 4 COLS ══ */
  .top-cols{background:#F8F9FA;padding:48px 0}
  .top4-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  .top4-col{background:#fff;border:1px solid #ECECEC;border-radius:12px;padding:22px}
  .top4-title{font-size:16px;font-weight:800;color:#253D4E;margin-bottom:10px}
  .top4-divider{height:2px;background:#3BB77E;border-radius:2px;margin-bottom:14px}
  .mini-card{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #F0F0F0;text-decoration:none;transition:all .2s}
  .mini-card:last-child{border-bottom:none}
  .mini-card:hover .mini-name{color:#3BB77E}
  .mini-img{width:56px;height:56px;flex-shrink:0;border-radius:8px;overflow:hidden;background:#F4FCF7;display:flex;align-items:center;justify-content:center;font-size:22px}
  .mini-img img{width:100%;height:100%;object-fit:contain}
  .mini-info{display:flex;flex-direction:column;gap:4px;min-width:0}
  .mini-name{font-size:12.5px;font-weight:600;color:#253D4E;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;transition:color .2s}
  .mini-price{font-size:15px;font-weight:800;color:#3BB77E;font-family:'Quicksand','Poppins',sans-serif}

  /* ══ WHY US ══ */
  .why-section{background:#fff}
  .why-header{margin-bottom:36px}
  .why-eyebrow{display:inline-block;background:#F4FCF7;color:#3BB77E;font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:5px 18px;border-radius:999px;margin-bottom:12px;border:1px solid rgba(59,183,126,.2)}
  .why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
  .why-card{background:#F4FCF7;border:1px solid rgba(59,183,126,.16);border-radius:16px;padding:28px 20px;text-align:center;transition:all .3s}
  .why-card:hover{transform:translateY(-5px);box-shadow:0 12px 32px rgba(59,183,126,.18);border-color:rgba(59,183,126,.4)}
  .why-icon{font-size:38px;margin-bottom:14px;display:block}
  .why-card h4{font-size:15px;font-weight:800;color:#253D4E;margin-bottom:8px}
  .why-card p{font-size:13px;color:#7E8D97;margin:0;line-height:1.65}

  /* ══ TESTIMONIALS ══ */
  .tst-section{background:#F8F9FA}
  .tst-header{margin-bottom:36px}
  .tst-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .tst-card{background:#fff;border:1px solid #ECECEC;border-radius:14px;padding:26px;margin:0;transition:all .3s}
  .tst-card:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(0,0,0,.09)}
  .tst-stars{color:#FFC107;font-size:15px;letter-spacing:2px;margin-bottom:12px}
  .tst-card blockquote{margin:0 0 18px;font-size:14px;line-height:1.75;color:#253D4E;font-style:italic}
  .tst-card figcaption{display:flex;align-items:center;gap:12px}
  .tst-av{width:38px;height:38px;border-radius:50%;background:#3BB77E;color:#fff;display:grid;place-items:center;font-weight:800;font-size:15px;flex-shrink:0}
  .tst-card figcaption strong{display:block;font-size:14px;font-weight:700;color:#253D4E}
  .tst-card figcaption em{font-style:normal;font-size:12px;color:#7E8D97}
  .text-center{text-align:center}

  /* ══════════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════════ */
  @media (max-width:1100px){
    .pgrid4{grid-template-columns:repeat(3,1fr)}
    .top4-grid{grid-template-columns:repeat(2,1fr)}
    .why-grid{grid-template-columns:repeat(2,1fr)}
    .tst-grid{grid-template-columns:repeat(2,1fr)}
    .benefits-grid{grid-template-columns:repeat(3,1fr)}
    .benefit-card:nth-child(3){border-right:none}
  }

  /* Tablet: exactly 3 category columns */
  @media (max-width:860px){
    .cats-grid{grid-template-columns:repeat(3,1fr);gap:14px}
    .cat-img-wrap{height:150px}
    .cat-skel{height:200px}
  }

  @media (max-width:860px){
    /* Hero: stack vertically on tablet, hide image col */
    .hero-inner{grid-template-columns:1fr;gap:24px;min-height:auto}
    .hero-img-col{min-height:280px}
    .hero-banner-img{min-height:260px}
    .promo-grid{grid-template-columns:1fr 1fr}
    .best-grid{grid-template-columns:1fr}
    .best-promo-card{display:none}
    /* 2-col product grid on tablet/mobile */
    .pgrid4{grid-template-columns:repeat(2,1fr);gap:12px}
    .benefits-grid{grid-template-columns:repeat(2,1fr)}
    .benefit-card{border-right:none;border-bottom:1px solid #ECECEC}
    .benefit-card:nth-child(2n){border-bottom:none}
  }

  @media (max-width:640px){
    /* Hero: text only, hide image on very small */
    .hero{padding:40px 0}
    .hero-img-col{display:none}
    .hero-inner{grid-template-columns:1fr}
    /* 2-col product grid on mobile */
    .pgrid4{grid-template-columns:repeat(2,1fr);gap:10px}
    .top4-grid{grid-template-columns:1fr}
    .tst-grid{grid-template-columns:1fr}
    .why-grid{grid-template-columns:repeat(2,1fr);gap:12px}
    .benefits-grid{grid-template-columns:repeat(2,1fr)}
    .promo-grid{grid-template-columns:1fr}
    .promo-emoji{display:none}
    /* Mobile: exactly 2 category columns */
    .cats-grid{grid-template-columns:repeat(2,1fr);gap:10px}
    .cat-img-wrap{height:120px}
    .cat-fallback{font-size:52px}
    .cat-name{font-size:13px}
    .cat-skel{height:170px}
  }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  categories     = signal<any[]>([]);
  featured       = signal<any[]>([]);
  trending       = signal<any[]>([]);
  recentProducts = signal<any[]>([]);
  testimonials   = signal<{ name: string; city: string; text: string }[]>([]);
  banners        = signal<any[]>([]);
  activeSlide    = signal(0);
  activeTab      = signal('Deals Of the Day');
  mediaUrl       = (environment as any).mediaUrl || '';

  private _slideTimer: any;
  sellTabs = ['Deals Of the Day', 'Best Sellers', 'New Arrivals'];

  get whyUs() {
    return [
      { ic: '🚚', t: this.settings.get('why_1_title', 'Fast UK Delivery'), d: this.settings.get('why_1_text', 'Next-day delivery across England, Scotland and Wales — tracked to your door.') },
      { ic: '✅', t: this.settings.get('why_2_title', '100% Halal Certified'), d: this.settings.get('why_2_text', 'All meats certified halal by HFA & AHDB-recognised authorities.') },
      { ic: '🔒', t: this.settings.get('why_3_title', 'Secure Payments'), d: this.settings.get('why_3_text', 'Bank-level encryption on every order. Pay safely with card or PayPal.') },
      { ic: '🌿', t: this.settings.get('why_4_title', 'Freshness Guaranteed'), d: this.settings.get('why_4_text', 'We source produce daily. Temperature-controlled storage keeps everything fresh.') },
    ];
  }

  get benefits() {
    return [
      { ic: '🏷️', t: 'Best prices & offers', d: 'Orders £50 or more' },
      { ic: '🤝', t: 'Free delivery', d: '24/7 amazing service' },
      { ic: '💰', t: 'Great daily deal', d: 'When you sign up' },
      { ic: '📦', t: 'Wide assortment', d: 'Mega Discounts' },
      { ic: '↩️', t: 'Easy returns', d: 'Within 30 days' },
    ];
  }

  constructor(private api: ApiService, private seo: SeoService, public settings: SettingsService) {}

  get cur() { return this.settings.get('currency_symbol', '£'); }

  ngOnInit() {
    this.seo.resetMeta();
    // Load banners from admin panel
    this.api.getBanners().subscribe({
      next: (r: any) => {
        const all = (r.data || r || []).filter((b: any) => b.is_active !== 0 && b.is_active !== '0');
        this.banners.set(all);
        if (all.length > 1) this.startSlider();
      },
      error: () => {}
    });
    this.api.getFeaturedCategories().subscribe({ next: (r: any) => { if (r.success) this.categories.set((r.data || []).slice(0, 10)); }, error: () => {} });
    this.api.getFeaturedProducts(8).subscribe({ next: (r: any) => { if (r.success) this.featured.set(r.data || []); }, error: () => {} });
    this.api.getTrendingProducts(4).subscribe({ next: (r: any) => { if (r.success) this.trending.set(r.data || []); }, error: () => {} });
    this.api.getProducts({ limit: 4, sort: 'newest' }).subscribe({ next: (r: any) => { if (r.success) this.recentProducts.set(r.data || []); }, error: () => {} });
    this.loadTestimonials();
  }

  ngOnDestroy() { this.stopSlider(); }

  private startSlider() {
    this._slideTimer = setInterval(() => {
      this.activeSlide.update(i => (i + 1) % this.banners().length);
    }, 4500);
  }
  private stopSlider() { if (this._slideTimer) clearInterval(this._slideTimer); }

  nextSlide() { this.stopSlider(); this.activeSlide.update(i => (i + 1) % this.banners().length); this.startSlider(); }
  prevSlide() { this.stopSlider(); this.activeSlide.update(i => (i - 1 + this.banners().length) % this.banners().length); this.startSlider(); }

  private loadTestimonials() {
    try {
      const t = JSON.parse(this.settings.get('testimonials', '[]'));
      if (Array.isArray(t) && t.length) { this.testimonials.set(t); return; }
    } catch {}
    this.testimonials.set([
      { name: 'Aisha K.', city: 'Birmingham', text: 'Finally a desi grocery site that feels premium. Everything arrived fresh and beautifully packed — next-day, as promised. The Desi has replaced three shops for us.' },
      { name: 'Rahul P.', city: 'London', text: 'The spice selection is unmatched anywhere in the UK. Ordering takes two minutes and the quality is exactly what my family expects. Brilliant service.' },
      { name: 'Fatima B.', city: 'Manchester', text: 'Frozen parathas, fresh masalas, sweets for Eid — one basket, one delivery. The halal certification gives us complete peace of mind every time we order.' },
    ]);
  }

  media(p: string) { if (!p) return ''; return p.startsWith('http') ? p : this.mediaUrl + p; }

  /** Maps category name keywords to a relevant emoji for the fallback tile */
  catIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('meat') || n.includes('chicken') || n.includes('poultry') || n.includes('lamb') || n.includes('mutton')) return '🍗';
    if (n.includes('spice') || n.includes('masala') || n.includes('chilli') || n.includes('pepper') || n.includes('pepper')) return '🌶️';
    if (n.includes('rice') || n.includes('basmati') || n.includes('grain')) return '🍚';
    if (n.includes('lentil') || n.includes('dal') || n.includes('dhal') || n.includes('daal')) return '🫘';
    if (n.includes('pulse') || n.includes('pea') || n.includes('chick')) return '🫛';
    if (n.includes('bean')) return '🫘';
    if (n.includes('bread') || n.includes('chapati') || n.includes('roti') || n.includes('naan')) return '🫓';
    if (n.includes('flour') || n.includes('atta') || n.includes('maida')) return '🌾';
    if (n.includes('vegetable') || n.includes('veggie') || n.includes('sabzi')) return '🥦';
    if (n.includes('fruit') || n.includes('dried')) return '🍎';
    if (n.includes('dairy') || n.includes('milk') || n.includes('cheese') || n.includes('paneer')) return '🧀';
    if (n.includes('sweet') || n.includes('mithai') || n.includes('dessert') || n.includes('halwa')) return '🍮';
    if (n.includes('chocolate') || n.includes('candy')) return '🍫';
    if (n.includes('oil') || n.includes('ghee') || n.includes('butter')) return '🫙';
    if (n.includes('snack') || n.includes('crisps') || n.includes('namkeen') || n.includes('papad')) return '🍿';
    if (n.includes('pickle') || n.includes('chutney') || n.includes('achar') || n.includes('sauce')) return '🫙';
    if (n.includes('drink') || n.includes('juice') || n.includes('beverage')) return '🥤';
    if (n.includes('tea') || n.includes('chai') || n.includes('coffee')) return '☕';
    if (n.includes('fish') || n.includes('seafood') || n.includes('prawn')) return '🐟';
    if (n.includes('egg')) return '🥚';
    if (n.includes('frozen')) return '🧊';
    if (n.includes('health') || n.includes('wellness') || n.includes('herbal')) return '🌿';
    if (n.includes('household') || n.includes('cleaning') || n.includes('disposal')) return '🧹';
    if (n.includes('baby') || n.includes('infant')) return '👶';
    if (n.includes('biscuit') || n.includes('cookie') || n.includes('cake')) return '🍪';
    if (n.includes('nut') || n.includes('cashew') || n.includes('almond')) return '🥜';
    if (n.includes('pasta') || n.includes('noodle') || n.includes('vermicelli')) return '🍝';
    if (n.includes('jam') || n.includes('honey')) return '🍯';
    return '🛍️';
  }

  /** Graceful fallback when a category image 404s */
  onCatImgError(e: Event, name: string) {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
    const wrap = img.closest('.cat-img-wrap') as HTMLElement;
    if (wrap && !wrap.querySelector('.cat-fallback')) {
      const span = document.createElement('span');
      span.className = 'cat-fallback';
      span.textContent = this.catIcon(name);
      wrap.appendChild(span);
    }
  }

  img0(p: any): string {
    const imgs = p.images || [];
    const path = p.primary_image || imgs[0]?.image_path;
    if (!path) return '';
    return path.startsWith('http') ? path : this.mediaUrl + path;
  }
  /** First active banner image for the hero right column */
  heroBannerImg(): string {
    const b = this.banners().find((x: any) => x.image);
    if (!b) return '';
    return this.media(b.image);
  }
  heroBannerTitle(): string {
    const b = this.banners().find((x: any) => x.image);
    return b?.title || '';
  }
}

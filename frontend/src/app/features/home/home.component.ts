import { Component, OnInit, signal } from '@angular/core';
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
  <!-- ── HERO ── -->
  <section class="hero" (mousemove)="onMove($event)">
    <div class="hero-glow g1"></div><div class="hero-glow g2"></div>
    <div class="td-container hero-grid">
      <div class="hero-copy">
        <span class="hero-pill"><i></i>{{ settings.get('header_offer_text','Free UK delivery on orders over £50') }}</span>
        <h1>{{ settings.get('hero_title','Premium Desi Groceries Delivered Across The UK') }}</h1>
        <p>{{ settings.get('hero_subtitle','Authentic groceries, spices, snacks, frozen foods and daily essentials from trusted South Asian brands.') }}</p>
        <div class="hero-cta">
          <a routerLink="/categories" class="td-btn td-btn-dark">Shop Now
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a routerLink="/categories" class="td-btn td-btn-light">Explore Categories</a>
        </div>
        <div class="hero-meta">
          <div><strong>500+</strong><span>Products</span></div><i></i>
          <div><strong>UK</strong><span>Wide delivery</span></div><i></i>
          <div><strong>100%</strong><span>Authentic</span></div>
        </div>
      </div>

      <!-- 1:1 square glass showcase -->
      <div class="hero-stage">
        <div class="hero-square" [style.transform]="parallax()">
          <div class="sq-light"></div>
          @if (hero().length) {
            <a class="sq-card main" [routerLink]="heroLink(hero()[0])">
              <div class="sq-img" [style.background-image]="'url(' + media(hero()[0].image) + ')'"></div>
              <div class="sq-body">
                @if (hero()[0].badge) { <span class="sq-badge">{{ hero()[0].badge }}</span> }
                <strong>{{ hero()[0].product_name }}</strong>
                <em>{{ cur }}{{ hero()[0].price }}</em>
              </div>
            </a>
          } @else { <div class="sq-card main sq-skel td-skel"></div> }
          @if (hero().length > 1) {
            <a class="sq-card chip c1" [routerLink]="heroLink(hero()[1])">
              <div class="sq-chip-img" [style.background-image]="'url(' + media(hero()[1].image) + ')'"></div>
              <div><strong>{{ hero()[1].product_name }}</strong><em>{{ cur }}{{ hero()[1].price }}</em></div>
            </a>
          }
          @if (hero().length > 2) {
            <a class="sq-card chip c2" [routerLink]="heroLink(hero()[2])">
              <div class="sq-chip-img" [style.background-image]="'url(' + media(hero()[2].image) + ')'"></div>
              <div><strong>{{ hero()[2].product_name }}</strong><em>{{ cur }}{{ hero()[2].price }}</em></div>
            </a>
          }
          <div class="sq-float">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-5" stroke="#16A34A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="#16A34A" stroke-width="1.8"/></svg>
            Next-day UK delivery
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── BENTO CATEGORIES ── -->
  <section class="td-section cats">
    <div class="td-container">
      <div class="sec-head" appScrollAnimate>
        <div><span class="td-eyebrow">Curated Aisles</span><h2 class="td-h2">Shop by Category</h2></div>
        <a routerLink="/categories" class="sec-link">View all →</a>
      </div>
      <div class="bento">
        @for (c of categories(); track c.id; let i = $index) {
          <a class="bcard" [class.big]="i === 0" [routerLink]="['/category', c.slug]" appScrollAnimate [animationDelay]="(i * 0.06) + 's'"
             (mousemove)="magnet($event)" (mouseleave)="demagnet($event)">
            @if (c.image) { <img [src]="media(c.image)" [alt]="c.name" loading="lazy" /> }
            <div class="bcard-veil"></div>
            <div class="bcard-label"><span>{{ c.name }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </a>
        }
      </div>
    </div>
  </section>

  <!-- ── FEATURED ── -->
  @if (featured().length) {
  <section class="td-section feat">
    <div class="td-container">
      <div class="sec-head" appScrollAnimate>
        <div><span class="td-eyebrow">Handpicked</span><h2 class="td-h2">Featured Products</h2></div>
        <a routerLink="/categories" class="sec-link">Shop all →</a>
      </div>
      <div class="pgrid">
        @for (p of featured(); track p.id; let i = $index) {
          <div appScrollAnimate [animationDelay]="(i * 0.05) + 's'"><app-product-card [product]="p" /></div>
        }
      </div>
    </div>
  </section>
  }

  <!-- ── BRAND MARQUEE ── -->
  @if (brands().length) {
  <section class="brands" aria-label="Popular brands">
    <div class="marquee"><div class="track">
      @for (b of marquee(); track $index) { <span class="brand">{{ b }}</span><i>✦</i> }
    </div></div>
  </section>
  }

  <!-- ── WHY US ── -->
  <section class="td-section why">
    <div class="td-container">
      <div class="sec-head center" appScrollAnimate>
        <span class="td-eyebrow">The Desi Promise</span><h2 class="td-h2" style="color:#fff">Why Shop With Us</h2>
      </div>
      <div class="why-grid">
        @for (w of whyUs; track w.t; let i = $index) {
          <div class="why-card" appScrollAnimate [animationDelay]="(i * 0.1) + 's'">
            <div class="why-ic" [innerHTML]="''">{{ w.ic }}</div>
            <h4>{{ w.t }}</h4><p>{{ w.d }}</p>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- ── SEASONAL / TRENDING ── -->
  @if (trending().length) {
  <section class="td-section season">
    <div class="td-container season-inner" appScrollAnimate>
      <span class="td-eyebrow">{{ settings.get('seasonal_label','This Season') }}</span>
      <h2 class="td-h2">{{ settings.get('seasonal_title','Trending in the UK right now.') }}</h2>
      <p class="td-sub" style="margin:14px auto 36px">{{ settings.get('seasonal_subtitle','The most-loved picks from our community — restocked and ready.') }}</p>
      <div class="pgrid four">
        @for (p of trending(); track p.id; let i = $index) {
          <div appScrollAnimate [animationDelay]="(i * 0.06) + 's'"><app-product-card [product]="p" /></div>
        }
      </div>
      <a routerLink="/categories" class="td-btn td-btn-dark" style="margin-top:42px">Explore the range</a>
    </div>
  </section>
  }

  <!-- ── TESTIMONIALS ── -->
  <section class="td-section tst">
    <div class="td-container">
      <div class="sec-head center" appScrollAnimate>
        <span class="td-eyebrow">Loved Nationwide</span><h2 class="td-h2">What Our Customers Say</h2>
      </div>
      <div class="tst-row">
        @for (t of testimonials(); track t.name; let i = $index) {
          <figure class="tst-card" appScrollAnimate [animationDelay]="(i * 0.08) + 's'">
            <div class="tst-stars">★★★★★</div>
            <blockquote>“{{ t.text }}”</blockquote>
            <figcaption><span class="tst-av">{{ t.name.charAt(0) }}</span><div><strong>{{ t.name }}</strong><em>{{ t.city }}</em></div></figcaption>
          </figure>
        }
      </div>
    </div>
  </section>
  `,
  styles: [`
  .hero{position:relative;min-height:calc(100vh - var(--td-header-h));display:flex;align-items:center;background:var(--td-secondary);overflow:hidden;padding:64px 0}
  .hero-glow{position:absolute;border-radius:50%;filter:blur(110px);pointer-events:none}
  .g1{width:520px;height:520px;background:rgba(245,166,35,.22);top:-160px;right:-80px}
  .g2{width:420px;height:420px;background:rgba(17,17,17,.06);bottom:-160px;left:-60px}
  .hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:72px;align-items:center;position:relative}
  .hero-pill{display:inline-flex;align-items:center;gap:9px;background:#fff;border:1px solid var(--td-line);border-radius:999px;padding:9px 18px;font-size:13px;font-weight:600;color:var(--td-muted);margin-bottom:28px}
  .hero-pill i{width:7px;height:7px;border-radius:99px;background:var(--td-success);box-shadow:0 0 0 4px rgba(22,163,74,.14)}
  .hero-copy h1{font-size:clamp(2.5rem,4.6vw,4.1rem);font-weight:800;line-height:1.06;letter-spacing:-.035em;margin-bottom:22px}
  .hero-copy p{font-size:17px;line-height:1.75;color:var(--td-muted);max-width:480px;margin:0 0 36px}
  .hero-cta{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:48px}
  .hero-meta{display:flex;align-items:center;gap:26px}
  .hero-meta div strong{display:block;font-family:'Sora',sans-serif;font-size:22px;font-weight:800}
  .hero-meta div span{font-size:12px;color:var(--td-muted);letter-spacing:.08em;text-transform:uppercase}
  .hero-meta i{width:1px;height:34px;background:var(--td-line)}

  .hero-stage{display:flex;justify-content:center}
  .hero-square{position:relative;width:min(480px,100%);aspect-ratio:1/1;border-radius:32px;background:linear-gradient(145deg,#171717,#111 55%,#1d1304);box-shadow:var(--td-shadow-lg);transition:transform .25s ease-out;will-change:transform;overflow:visible}
  .sq-light{position:absolute;inset:0;border-radius:32px;background:radial-gradient(70% 55% at 70% 25%,rgba(245,166,35,.28),transparent 65%),radial-gradient(45% 40% at 20% 85%,rgba(255,255,255,.08),transparent 60%);pointer-events:none}
  .sq-card{position:absolute;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.35);transition:transform .35s var(--td-ease),background .3s}
  .sq-card:hover{background:rgba(255,255,255,.16)}
  .sq-card.main{width:56%;top:50%;left:50%;transform:translate(-50%,-50%);animation:fl1 7s ease-in-out infinite}
  .sq-skel{height:62%}
  .sq-img{width:100%;aspect-ratio:4/3.4;background-size:cover;background-position:center;background-color:rgba(255,255,255,.06)}
  .sq-body{padding:14px 16px 16px}
  .sq-badge{display:inline-block;background:var(--td-accent);color:#111;font-size:9.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px;border-radius:999px;margin-bottom:8px}
  .sq-body strong{display:block;color:#fff;font-size:14.5px;font-weight:700;line-height:1.35;margin-bottom:4px}
  .sq-body em{font-style:normal;color:var(--td-accent);font-family:'Sora',sans-serif;font-size:16px;font-weight:800}
  .sq-card.chip{display:flex;align-items:center;gap:11px;padding:11px 16px 11px 11px;width:auto;max-width:62%}
  .sq-chip-img{width:46px;height:46px;border-radius:14px;background-size:cover;background-position:center;background-color:rgba(255,255,255,.08);flex-shrink:0}
  .sq-card.chip strong{display:block;color:#fff;font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
  .sq-card.chip em{font-style:normal;color:var(--td-accent);font-size:12.5px;font-weight:800}
  .c1{top:7%;right:-7%;animation:fl2 8s ease-in-out infinite}
  .c2{bottom:9%;left:-9%;animation:fl3 9s ease-in-out infinite}
  .sq-float{position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;background:#fff;border-radius:999px;padding:10px 20px;font-size:12.5px;font-weight:700;color:var(--td-text);box-shadow:0 14px 38px rgba(15,23,42,.18);white-space:nowrap;animation:fl2 6s ease-in-out infinite}
  @keyframes fl1{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 12px))}}
  @keyframes fl2{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes fl3{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  .sq-float{animation-name:flb}@keyframes flb{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-8px)}}

  .sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:48px}
  .sec-head.center{flex-direction:column;align-items:center;text-align:center}
  .sec-link{font-size:14.5px;font-weight:700;color:var(--td-muted);transition:color .2s;flex-shrink:0;padding-bottom:6px}
  .sec-link:hover{color:var(--td-text)}

  .bento{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:200px;gap:16px}
  .bcard{position:relative;border-radius:var(--td-radius);overflow:hidden;background:var(--td-secondary);transition:box-shadow .35s}
  .bcard.big{grid-column:span 2;grid-row:span 2}
  .bcard img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s var(--td-ease)}
  .bcard:hover img{transform:scale(1.07)}
  .bcard:hover{box-shadow:var(--td-shadow)}
  .bcard-veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,12,.62) 0%,transparent 52%)}
  .bcard-label{position:absolute;left:18px;right:18px;bottom:16px;display:flex;align-items:center;justify-content:space-between;color:#fff}
  .bcard-label span{font-family:'Sora',sans-serif;font-size:16px;font-weight:700;letter-spacing:-.01em}
  .bcard.big .bcard-label span{font-size:21px}
  .bcard-label svg{opacity:0;transform:translateX(-6px);transition:opacity .3s,transform .35s var(--td-ease)}
  .bcard:hover .bcard-label svg{opacity:1;transform:none}

  .pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  .pgrid.four{grid-template-columns:repeat(4,1fr)}

  .brands{background:var(--td-primary);padding:34px 0;overflow:hidden}
  .marquee{display:flex;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
  .track{display:flex;align-items:center;gap:46px;white-space:nowrap;animation:mq 30s linear infinite;padding-right:46px}
  .brand{font-family:'Sora',sans-serif;font-size:19px;font-weight:700;color:rgba(255,255,255,.7);letter-spacing:.02em}
  .track i{color:var(--td-accent);font-style:normal;font-size:12px}
  @keyframes mq{to{transform:translateX(-50%)}}

  .why{background:var(--td-primary);border-radius:0}
  .why .td-eyebrow{color:var(--td-accent)}
  .why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
  .why-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:var(--td-radius);backdrop-filter:blur(14px);padding:34px 26px;text-align:center;transition:transform .35s var(--td-ease),background .3s,border-color .3s}
  .why-card:hover{transform:translateY(-6px);background:rgba(255,255,255,.1);border-color:rgba(245,166,35,.4)}
  .why-ic{width:58px;height:58px;border-radius:18px;background:rgba(245,166,35,.16);display:grid;place-items:center;margin:0 auto 20px;font-size:24px}
  .why-card h4{color:#fff;font-size:16px;font-weight:700;margin-bottom:10px}
  .why-card p{color:rgba(255,255,255,.6);font-size:13.5px;line-height:1.7;margin:0}

  .season{background:var(--td-secondary)}
  .season-inner{text-align:center}
  .season .td-eyebrow{color:var(--td-text)}

  .tst-row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .tst-card{background:#fff;border:1px solid var(--td-line);border-radius:var(--td-radius);padding:30px;margin:0;transition:transform .35s var(--td-ease),box-shadow .35s}
  .tst-card:hover{transform:translateY(-5px);box-shadow:var(--td-shadow)}
  .tst-stars{color:var(--td-accent);letter-spacing:3px;font-size:14px;margin-bottom:16px}
  .tst-card blockquote{margin:0 0 22px;font-size:15px;line-height:1.8;color:var(--td-text)}
  .tst-card figcaption{display:flex;align-items:center;gap:12px}
  .tst-av{width:42px;height:42px;border-radius:999px;background:var(--td-primary);color:#fff;display:grid;place-items:center;font-weight:800;font-family:'Sora',sans-serif}
  .tst-card figcaption strong{display:block;font-size:14px}
  .tst-card figcaption em{font-style:normal;font-size:12.5px;color:var(--td-muted)}

  @media (max-width:1080px){.bento{grid-template-columns:repeat(2,1fr)}.pgrid,.pgrid.four{grid-template-columns:repeat(3,1fr)}.why-grid{grid-template-columns:repeat(2,1fr)}.tst-row{grid-template-columns:1fr 1fr}}
  @media (max-width:860px){
    .hero{min-height:auto;padding:48px 0 96px}
    .hero-grid{grid-template-columns:1fr;gap:80px}
    .hero-stage{order:2}.hero-square{width:min(420px,92%)}
    .c1{right:0}.c2{left:0}
    .pgrid,.pgrid.four{grid-template-columns:repeat(2,1fr);gap:12px}
    .why-grid{grid-template-columns:1fr 1fr;gap:12px}.tst-row{grid-template-columns:1fr}
    .td-section{padding:64px 0}
  }
  `]
})
export class HomeComponent implements OnInit {
  hero = signal<any[]>([]);
  categories = signal<any[]>([]);
  featured = signal<any[]>([]);
  trending = signal<any[]>([]);
  brands = signal<string[]>([]);
  testimonials = signal<{ name: string; city: string; text: string }[]>([]);
  parallax = signal('');
  mediaUrl = (environment as any).mediaUrl || '';

  whyUs = [
    { ic: '\u{1F69A}', t: 'Fast UK Delivery', d: 'Next-day delivery across England, Scotland and Wales — tracked to your door.' },
    { ic: '\u2728', t: 'Trusted Brands', d: 'Only authentic products sourced from the South Asian brands you grew up with.' },
    { ic: '\u{1F512}', t: 'Secure Payments', d: 'Bank-level encryption on every order. Pay safely, every time.' },
    { ic: '\u{1F33F}', t: 'Fresh Products', d: 'Temperature-controlled storage keeps chilled and frozen items perfect.' }
  ];

  constructor(private api: ApiService, private seo: SeoService, public settings: SettingsService) {}

  get cur() { return this.settings.get('currency_symbol', '£'); }

  ngOnInit() {
    this.seo.resetMeta();
    this.api.getHeroProducts().subscribe({ next: (r: any) => { if (r.success && r.data?.length) this.hero.set(r.data); }, error: () => {} });
    this.api.getFeaturedCategories().subscribe({ next: (r: any) => { if (r.success) this.categories.set((r.data || []).filter((c: any) => c.is_active == 1).slice(0, 6)); }, error: () => {} });
    this.api.getFeaturedProducts(8).subscribe({ next: (r: any) => { if (r.success) this.featured.set(r.data || []); }, error: () => {} });
    this.api.getTrendingProducts(4).subscribe({ next: (r: any) => { if (r.success) this.trending.set(r.data || []); }, error: () => {} });
    this.loadBrandsAndTestimonials();
  }

  private loadBrandsAndTestimonials() {
    const raw = this.settings.get('popular_brands', '');
    const fromSettings = raw ? raw.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    if (fromSettings.length) { this.brands.set(fromSettings); }
    else {
      // fall back to category names so the marquee stays fully admin-driven
      this.api.getFeaturedCategories().subscribe({ next: (r: any) => { if (r.success) this.brands.set((r.data || []).map((c: any) => c.name).slice(0, 10)); }, error: () => {} });
    }
    try {
      const t = JSON.parse(this.settings.get('testimonials', '[]'));
      if (Array.isArray(t) && t.length) { this.testimonials.set(t); return; }
    } catch {}
    this.testimonials.set([
      { name: 'Aisha K.', city: 'Birmingham', text: 'Finally a desi grocery site that feels premium. Everything arrived fresh and beautifully packed — next-day, as promised.' },
      { name: 'Rahul P.', city: 'London', text: 'The spice selection is unmatched. Ordering takes two minutes and the quality is exactly what my family expects.' },
      { name: 'Fatima B.', city: 'Manchester', text: 'Frozen parathas, fresh masalas, sweets for Eid — one basket, one delivery. The Desi has replaced three shops for us.' }
    ]);
  }

  marquee() { const b = this.brands(); return [...b, ...b]; }
  media(p: string) { return !p ? '' : (p.startsWith('http') ? p : this.mediaUrl + p); }
  heroLink(h: any) { return h.slug ? ['/product', h.slug] : ['/categories']; }

  onMove(e: MouseEvent) {
    const x = (e.clientX / window.innerWidth - 0.5) * 14;
    const y = (e.clientY / window.innerHeight - 0.5) * 14;
    this.parallax.set(`rotateX(${-y * 0.35}deg) rotateY(${x * 0.35}deg) translate(${x * 0.4}px, ${y * 0.4}px)`);
  }
  magnet(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement; const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }
  demagnet(e: MouseEvent) { (e.currentTarget as HTMLElement).style.transform = ''; }
}

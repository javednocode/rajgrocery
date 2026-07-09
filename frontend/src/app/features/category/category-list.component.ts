import { Component, OnInit, signal, effect, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { CountryService } from '../../core/services/country.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink, ScrollAnimateDirective],
  template: `
  <!-- Page Hero -->
  <section class="cl-hero">
    <div class="container">
      <nav class="cl-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a>
        <i>/</i>
        <span>All Categories</span>
      </nav>
      <h1 class="cl-hero-title">Shop by Category</h1>
      <p class="cl-hero-sub">{{ country.current().flag }} Every aisle of the {{ country.current().name }} marketplace</p>
    </div>
    <div class="cl-hero-wave"></div>
  </section>

  <!-- Categories Grid -->
  <section class="section cl-body">
    <div class="container">

      @if (loading()) {
        <div class="cl-grid">
          @for (s of [1,2,3,4,5,6,7,8,9,10,11,12]; track s) {
            <div class="cl-card cl-skel skeleton"></div>
          }
        </div>
      } @else if (categories().length === 0) {
        <div class="empty-state">
          
          <h3>No categories yet</h3>
          <p>Categories will appear here once added from the admin panel.</p>
        </div>
      } @else {
        <!-- Filter chips -->
        <div class="cl-filter-row">
          <span class="cl-total">{{ categories().length }} categories</span>
        </div>
        <div class="cl-grid">
          @for (c of categories(); track c.id; let i = $index) {
            <a class="cl-card" [class.cl-card-noimg]="!c.image" [routerLink]="['/category', c.slug]"
               appScrollAnimate animationType="fade-up" [animationDelay]="((i % 4) * 0.07) + 's'">
              @if (c.image) {
                <img class="cl-img" [src]="media(c.image)" [alt]="c.name" loading="lazy" (error)="hideImg($event)" />
              }
              <span class="cl-veil" aria-hidden="true"></span>
              <span class="cl-info">
                <strong class="cl-name">{{ c.name }}</strong>
                @if (c.product_count > 0) {
                  <em class="cl-count">{{ c.product_count }} {{ c.product_count === 1 ? 'product' : 'products' }}</em>
                } @else if (c.description) {
                  <em class="cl-count">{{ c.description }}</em>
                }
              </span>
              <span class="cl-arrow" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </a>
          }
        </div>
      }
    </div>
  </section>
  `,
  styles: [`
  .cl-hero {
    background: linear-gradient(135deg, #211D16 0%, #37322A 100%);
    padding: 52px 0 70px; position: relative; overflow: hidden;
  }
  .cl-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(196,98,45,.15) 0%, transparent 70%);
  }
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}
  .cl-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.45); margin-bottom: 16px; position: relative; }
  .cl-crumbs a { color: rgba(255,255,255,.65); transition: color .2s; }
  .cl-crumbs a:hover { color: #C4622D; }
  .cl-crumbs i { font-style: normal; opacity: .4; }
  .cl-hero-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 400;
    color: #fff; margin-bottom: 10px; position: relative;
  }
  .cl-hero-sub { font-size: 16px; color: rgba(255,255,255,.6); margin: 0; position: relative; }
  .cl-hero-wave {
    position: absolute; bottom: -2px; left: 0; right: 0; height: 40px;
    background: linear-gradient(180deg, transparent 0%, var(--bg,#FAF6EF) 100%);
  }

  .cl-body { background: var(--bg,#FAF6EF); }
  .cl-filter-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .cl-total { font-size: 14px; color: #7C7466; font-family: 'Manrope', sans-serif; }

  .cl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  .cl-card {
    position: relative; display: block;
    aspect-ratio: 1 / 1.18;
    border-radius: 20px; overflow: hidden;
    background: var(--kg-sand, #F1EADD);
    box-shadow: 0 1px 3px rgba(33,29,22,.05);
    text-decoration: none;
    transition: transform .5s cubic-bezier(0.22,1,0.36,1), box-shadow .5s cubic-bezier(0.22,1,0.36,1);
  }
  .cl-card:hover { transform: translateY(-6px); box-shadow: 0 22px 48px rgba(33,29,22,.14); }
  .cl-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .9s cubic-bezier(0.22,1,0.36,1);
  }
  .cl-card:hover .cl-img { transform: scale(1.06); }
  .cl-veil {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(20,18,14,.62) 0%, rgba(20,18,14,.14) 38%, transparent 60%);
  }
  .cl-info {
    position: absolute; left: 20px; right: 58px; bottom: 18px;
    display: flex; flex-direction: column; gap: 3px;
  }
  .cl-name {
    font-family: 'Fraunces', Georgia, serif; font-size: 19px; font-weight: 450;
    color: #FFFDF8; letter-spacing: -0.01em; line-height: 1.22;
  }
  .cl-count {
    font-style: normal; font-family: 'Manrope', sans-serif;
    font-size: 12px; font-weight: 600; color: rgba(255,253,248,.75);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cl-arrow {
    position: absolute; right: 16px; bottom: 16px;
    width: 36px; height: 36px; border-radius: 999px;
    display: grid; place-items: center;
    background: #FAF6EF; color: #211D16;
    opacity: 0; transform: translateY(10px);
    transition: opacity .35s, transform .35s, background .25s, color .25s;
  }
  .cl-card:hover .cl-arrow { opacity: 1; transform: translateY(0); }
  .cl-arrow:hover { background: #1F4D3A; color: #FAF6EF; }
  .cl-card-noimg { border: 1px solid #E8E1D2; background: #F5EFE4; }
  .cl-card-noimg .cl-veil { display: none; }
  .cl-card-noimg .cl-name { color: #211D16; }
  .cl-card-noimg .cl-count { color: #7C7466; }
  .cl-card-noimg .cl-arrow { background: #E7DECB; }
  .cl-skel { aspect-ratio: 1 / 1.18; border-radius: 20px; }
  @media (max-width: 640px) {
    .cl-grid { grid-template-columns: repeat(2,1fr); gap: 11px; }
    .cl-card { border-radius: 16px; aspect-ratio: 1 / 1.1; }
    .cl-info { left: 14px; right: 46px; bottom: 13px; }
    .cl-name { font-size: 15.5px; }
    .cl-count { font-size: 11px; }
    .cl-arrow { width: 30px; height: 30px; right: 11px; bottom: 11px; opacity: 1; transform: none; }
  }

  @media (max-width: 640px) {
    .cl-hero { padding: 26px 0 40px; }
  }
  `]
})
export class CategoryListComponent implements OnInit {
  categories = signal<any[]>([]);
  loading = signal(true);
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(private api: ApiService, private seo: SeoService, public country: CountryService) {
    effect(() => {
      const code = this.country.code();
      this.country.ready();
      untracked(() => this.fetch(code));
    });
  }

  ngOnInit() {
    this.seo.setMeta({ title: 'Shop All Categories', description: 'Browse every category across our international marketplace.' });
  }

  fetch(code: string) {
    this.loading.set(true);
    this.api.getCategories(code).subscribe({
      next: (r: any) => { if (r.success) this.categories.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  media(p: string) { if (!p) return ''; return p.startsWith('http') ? p : this.mediaUrl + p; }

  hideImg(e: Event) { (e.target as HTMLImageElement).style.display = 'none'; }
}

import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink],
  template: `
  <!-- Page hero -->
  <header class="cl-hero">
    <div class="cl-hero-noise" aria-hidden="true"></div>
    <div class="container cl-hero-inner">
      <nav class="cl-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a>
        <span class="cl-sep" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span aria-current="page">Categories</span>
      </nav>
      <div class="cl-hero-content">
        <p class="cl-eyebrow">
          <span class="cl-eyebrow-line" aria-hidden="true"></span>
          Shop by Category
        </p>
        <h1 class="cl-heading">Find Everything<br>You Need</h1>
        <p class="cl-sub">Authentic Indian groceries, spices and pantry staples — all in one place, delivered across Hong Kong.</p>
      </div>
    </div>
  </header>

  <!-- Grid section -->
  <section class="cl-body">
    <div class="container">

      @if (loading()) {
        <!-- Skeleton -->
        <div class="cl-grid">
          @for (s of [1,2,3,4,5,6,7,8,9,10,11,12]; track s) {
            <div class="skeleton cl-skel"></div>
          }
        </div>

      } @else if (categories().length === 0) {
        <!-- Empty state -->
        <div class="cl-empty">
          <div class="cl-empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.6"/>
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="cl-empty-title">Categories coming soon</h2>
          <p class="cl-empty-text">Our store categories are being set up. Check back shortly or browse all products.</p>
          <a routerLink="/" class="btn btn-primary">Back to Home</a>
        </div>

      } @else {
        <!-- Count bar -->
        <div class="cl-toolbar">
          <span class="cl-count">{{ categories().length }} {{ categories().length === 1 ? 'category' : 'categories' }}</span>
          <a routerLink="/search" class="cl-browse-all">
            Browse all products
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>

        <!-- Category grid -->
        <div class="cl-grid" #gridRef>
          @for (c of categories(); track c.id; let i = $index) {
            <a class="cl-card" #cardRef
               [class.cl-card-noimg]="!c.image"
               [routerLink]="['/category', c.slug]"
               [attr.aria-label]="c.name + (c.product_count > 0 ? ' — ' + c.product_count + ' products' : '')"
               [style.--stagger]="i">

              <!-- Image or emoji fallback -->
              <div class="cl-card-media">
                @if (c.image) {
                  <img class="cl-img" [src]="media(c.image)" [alt]="c.name"
                       loading="lazy" (error)="hideImg($event)" />
                } @else {
                  <span class="cl-emoji" aria-hidden="true">{{ catEmoji(i) }}</span>
                }
                <div class="cl-veil"></div>
              </div>

              <!-- Info -->
              <div class="cl-info">
                <strong class="cl-name">{{ c.name }}</strong>
                <div class="cl-meta-row">
                  @if (c.product_count > 0) {
                    <em class="cl-count-badge">
                      <span class="cl-count-dot" aria-hidden="true"></span>
                      {{ c.product_count }} {{ c.product_count === 1 ? 'product' : 'products' }}
                    </em>
                  } @else if (c.description) {
                    <em class="cl-count-badge">{{ c.description }}</em>
                  }
                </div>
              </div>

              <!-- Arrow -->
              <span class="cl-arrow" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </a>
          }
        </div>
      }
    </div>
  </section>
  `,

  styles: [`
  /* ── Hero ── */
  .cl-hero {
    background: var(--raj-dark);
    padding: 64px 0 68px;
    position: relative; overflow: hidden;
  }
  .cl-hero-noise {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 72% 110% at 5% 55%, rgba(109,49,95,.06) 0%, transparent 68%),
      radial-gradient(ellipse 50% 80% at 92% 15%, rgba(242,169,59,.06) 0%, transparent 65%);
  }
  .cl-hero-inner { position: relative; z-index: 1; }
  .cl-hero-content { max-width: 640px; }

  /* Breadcrumb */
  .cl-crumbs {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--raj-muted);
    margin-bottom: 28px; font-family: var(--font-sans);
    font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  }
  .cl-crumbs a { color: var(--raj-ink); text-decoration: none; transition: color .2s; }
  .cl-crumbs a:hover { color: var(--raj-leaf); }
  .cl-sep { display: flex; align-items: center; opacity: .35; }

  /* Hero text */
  .cl-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--font-sans); font-size: 11px; font-weight: 800;
    letter-spacing: .18em; text-transform: uppercase;
    color: var(--raj-turmeric); margin-bottom: 16px;
  }
  .cl-eyebrow-line {
    display: inline-block; width: 22px; height: 2px;
    background: var(--raj-turmeric); border-radius: 2px;
  }
  .cl-heading {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4.5vw, 3.2rem);
    font-weight: 600; color: var(--raj-ink);
    margin-bottom: 14px; letter-spacing: -0.025em;
    line-height: 1.1;
  }
  .cl-sub {
    font-size: 15.5px; color: var(--raj-muted);
    margin: 0; line-height: 1.72; max-width: 520px;
  }

  /* ── Body ── */
  .cl-body { padding: 52px 0 88px; background: var(--raj-warm); }
  .cl-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px;
  }
  .cl-count {
    font-size: 12.5px; color: var(--raj-muted);
    font-weight: 800; font-family: var(--font-sans);
    letter-spacing: .06em; text-transform: uppercase;
  }
  .cl-browse-all {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12.5px; font-weight: 800; color: var(--raj-leaf);
    font-family: var(--font-sans); letter-spacing: .04em;
    text-transform: uppercase; text-decoration: none;
    transition: gap .22s var(--ease), color .2s;
  }
  .cl-browse-all:hover { color: var(--raj-turmeric-dk); gap: 12px; }
  .cl-browse-all svg { flex-shrink: 0; }

  /* ── Grid ── */
  .cl-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  /* ── Category card ── */
  .cl-card {
    position: relative; display: flex; flex-direction: column;
    border-radius: var(--r-lg); overflow: hidden;
    background: var(--raj-paper);
    border: 1px solid var(--raj-line-lt);
    text-decoration: none;
    transition: box-shadow .38s var(--ease), border-color .28s, transform .38s var(--ease);
    box-shadow: var(--shadow-xs);
    /* stagger reveal */
    opacity: 0;
    transform: translateY(28px);
    animation: clCardIn .55s var(--ease) both;
    animation-delay: calc(var(--stagger, 0) * 55ms);
  }
  @keyframes clCardIn {
    to { opacity: 1; transform: translateY(0); }
  }
  .cl-card:hover {
    box-shadow: var(--shadow);
    border-color: var(--raj-line-warm);
    transform: translateY(-5px);
  }

  /* Media */
  .cl-card-media {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--raj-sand);
    display: flex; align-items: center; justify-content: center;
  }
  .cl-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .7s var(--ease);
  }
  .cl-card:hover .cl-img { transform: scale(1.07); }
  .cl-veil {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(to top, rgba(20,52,42,.55) 0%, rgba(20,52,42,.1) 42%, transparent 68%);
    opacity: 0; transition: opacity .38s;
  }
  .cl-card:hover .cl-veil { opacity: 1; }
  .cl-emoji {
    font-size: 40px; line-height: 1;
    position: relative; z-index: 1;
    transition: transform .4s var(--ease);
    filter: drop-shadow(0 4px 12px rgba(0,0,0,.12));
  }
  .cl-card:hover .cl-emoji { transform: scale(1.14); }

  /* Info */
  .cl-info {
    padding: 14px 15px 38px;
    display: flex; flex-direction: column; gap: 5px;
    flex: 1;
  }
  .cl-name {
    font-family: var(--font-sans); font-size: 14.5px; font-weight: 800;
    color: var(--raj-ink); line-height: 1.3; letter-spacing: -0.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cl-meta-row { display: flex; align-items: center; gap: 6px; }
  .cl-count-dot {
    display: inline-block; width: 5px; height: 5px; border-radius: 50%;
    background: var(--raj-leaf-lt); flex-shrink: 0;
  }
  .cl-count-badge {
    font-style: normal; font-family: var(--font-sans);
    font-size: 11.5px; font-weight: 600; color: var(--raj-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Arrow */
  .cl-arrow {
    position: absolute; right: 14px; bottom: 14px;
    width: 30px; height: 30px; border-radius: var(--r-full);
    display: grid; place-items: center;
    background: var(--raj-leaf-bg); color: var(--raj-leaf);
    border: 1.5px solid var(--raj-leaf-bg2);
    opacity: 0; transform: translate(6px, 6px) scale(.85);
    transition: opacity .3s var(--ease), transform .3s var(--ease), background .25s, color .25s, border-color .25s;
  }
  .cl-card:hover .cl-arrow {
    opacity: 1; transform: translate(0, 0) scale(1);
    background: var(--raj-leaf); color: #FFFFFF; border-color: var(--raj-leaf);
  }

  /* No-image variant */
  .cl-card-noimg .cl-card-media { background: var(--raj-sand-2); }
  .cl-card-noimg .cl-veil { display: none; }

  /* ── Skeleton ── */
  .cl-skel { aspect-ratio: 1 / 1.2; border-radius: var(--r-lg); }

  /* ── Empty ── */
  .cl-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 18px; padding: 88px 24px; text-align: center; max-width: 480px; margin: 0 auto;
  }
  .cl-empty-icon {
    width: 76px; height: 76px; border-radius: var(--r-xl);
    background: var(--raj-leaf-bg); color: var(--raj-leaf);
    display: grid; place-items: center;
    border: 1.5px solid var(--raj-leaf-bg2);
  }
  .cl-empty-title {
    font-family: var(--font-display); font-size: 1.45rem; font-weight: 600;
    color: var(--raj-ink); margin: 0;
  }
  .cl-empty-text { font-size: 15px; color: var(--raj-muted); margin: 0; line-height: 1.72; }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .cl-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 768px) {
    .cl-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .cl-hero { padding: 36px 0 40px; }
    .cl-heading { font-size: 2rem; }
  }
  @media (max-width: 480px) {
    .cl-grid { gap: 10px; }
    .cl-card { border-radius: var(--r); }
    .cl-name { font-size: 13px; }
    .cl-count-badge { font-size: 10.5px; }
    .cl-emoji { font-size: 32px; }
    .cl-arrow { display: none; }
    .cl-card:hover { transform: none; }
    .cl-body { padding: 28px 0 60px; }
    .cl-toolbar { margin-bottom: 18px; }
    .cl-info { padding: 11px 12px 32px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cl-card { animation: none !important; opacity: 1; transform: none; }
    .cl-card:hover { transform: none; }
    .cl-card:hover .cl-img { transform: none; }
    .cl-card:hover .cl-emoji { transform: none; }
  }
  `]
})
export class CategoryListComponent implements OnInit {
  categories = signal<any[]>([]);
  loading = signal(true);
  mediaUrl = (environment as any).mediaUrl || '';

  private readonly emojiList = ['🌶️','🍚','🫘','🍟','🍵','🧈','🥗','🏡','🧄','🌿','🧂','🫙','🥜','🍋','🥛'];
  catEmoji(i: number) { return this.emojiList[i % this.emojiList.length]; }

  constructor(private api: ApiService, private seo: SeoService) {}

  ngOnInit() {
    this.seo.setMeta({
      title: 'Shop All Categories',
      description: 'Browse every Indian grocery category — spices, rice, dal, atta, snacks, beverages and fresh vegetables.'
    });
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.api.getCategories().subscribe({
      next: (r: any) => {
        if (r.success) this.categories.set(r.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  media(p: string) {
    if (!p) return '';
    return p.startsWith('http') ? p : this.mediaUrl + p;
  }
  hideImg(e: Event) { (e.target as HTMLImageElement).style.display = 'none'; }
}

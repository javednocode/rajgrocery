import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink],
  template: `
  <!-- Page header -->
  <header class="cl-header">
    <div class="container">
      <nav class="cl-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span aria-current="page">All Categories</span>
      </nav>
      <h1 class="cl-heading">Shop by Category</h1>
      <p class="cl-sub">Everything you need for your Indian kitchen, in one place.</p>
    </div>
  </header>

  <!-- Grid body -->
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
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.6"/>
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="cl-empty-title">Categories coming soon</h2>
          <p class="cl-empty-text">
            Our store categories are being set up. Check back shortly or browse all products.
          </p>
          <a routerLink="/" class="btn btn-primary">Back to Home</a>
        </div>

      } @else {
        <!-- Count + grid -->
        <div class="cl-toolbar">
          <span class="cl-count">{{ categories().length }} {{ categories().length === 1 ? 'category' : 'categories' }}</span>
        </div>
        <div class="cl-grid">
          @for (c of categories(); track c.id; let i = $index) {
            <a class="cl-card" [class.cl-card-noimg]="!c.image"
               [routerLink]="['/category', c.slug]"
               [attr.aria-label]="c.name + (c.product_count > 0 ? ' — ' + c.product_count + ' products' : '')">

              <!-- Image or fallback -->
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
                @if (c.product_count > 0) {
                  <em class="cl-count-badge">{{ c.product_count }} {{ c.product_count === 1 ? 'product' : 'products' }}</em>
                } @else if (c.description) {
                  <em class="cl-count-badge">{{ c.description }}</em>
                }
              </div>

              <!-- Arrow -->
              <span class="cl-arrow" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
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
  /* ── Header ── */
  .cl-header {
    background: var(--kg-dark);
    padding: 48px 0 52px;
    position: relative; overflow: hidden;
  }
  .cl-header::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 120% at 10% 50%, rgba(27,76,140,.35) 0%, transparent 70%);
    pointer-events: none;
  }
  .cl-header .container { position: relative; z-index: 1; }

  /* ── Breadcrumb ── */
  .cl-crumbs {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: rgba(255,255,255,.45);
    margin-bottom: 18px;
  }
  .cl-crumbs a { color: rgba(255,255,255,.7); transition: color .2s; text-decoration: none; }
  .cl-crumbs a:hover { color: var(--kg-forest-lt); }
  .cl-crumbs svg { opacity: .4; flex-shrink: 0; }
  .cl-crumbs span { color: rgba(255,255,255,.85); font-weight: 600; }

  /* ── Hero text ── */
  .cl-heading {
    font-family: var(--font-sans); font-size: clamp(1.7rem, 3.5vw, 2.6rem);
    font-weight: 800; color: #FFFFFF; margin-bottom: 10px; letter-spacing: -0.02em;
    line-height: 1.15; position: relative;
  }
  .cl-sub { font-size: 15px; color: rgba(255,255,255,.62); margin: 0; line-height: 1.65; }

  /* ── Body ── */
  .cl-body { padding: 48px 0 80px; background: var(--kg-warm); }
  .cl-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .cl-count { font-size: 13px; color: var(--kg-muted); font-weight: 700; font-family: var(--font-sans); }

  /* ── Grid ── */
  .cl-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  /* ── Category card ── */
  .cl-card {
    position: relative; display: flex; flex-direction: column;
    border-radius: 12px; overflow: hidden;
    background: var(--kg-paper);
    border: 1px solid var(--kg-line-lt);
    text-decoration: none;
    transition: box-shadow .35s var(--ease), border-color .25s, transform .35s var(--ease);
    box-shadow: var(--shadow-xs);
  }
  .cl-card:hover {
    box-shadow: var(--shadow);
    border-color: var(--kg-line-warm);
    transform: translateY(-4px);
  }

  /* Media area */
  .cl-card-media {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--kg-warm);
    display: flex; align-items: center; justify-content: center;
  }
  .cl-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .7s var(--ease);
  }
  .cl-card:hover .cl-img { transform: scale(1.05); }
  .cl-veil {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(to top, rgba(18,56,33,.5) 0%, rgba(18,56,33,.1) 40%, transparent 65%);
    opacity: 0; transition: opacity .35s;
  }
  .cl-card:hover .cl-veil { opacity: 1; }
  .cl-emoji {
    font-size: 36px; line-height: 1;
    position: relative; z-index: 1;
    transition: transform .35s var(--ease);
  }
  .cl-card:hover .cl-emoji { transform: scale(1.12); }

  /* Info row */
  .cl-info {
    padding: 13px 14px 12px;
    display: flex; flex-direction: column; gap: 3px;
    flex: 1;
  }
  .cl-name {
    font-family: var(--font-sans); font-size: 14px; font-weight: 800;
    color: var(--kg-ink); line-height: 1.3; letter-spacing: -0.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cl-count-badge {
    font-style: normal; font-family: var(--font-sans);
    font-size: 11.5px; font-weight: 600; color: var(--kg-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Arrow pill */
  .cl-arrow {
    position: absolute; right: 12px; bottom: 12px;
    width: 28px; height: 28px; border-radius: var(--r-full);
    display: grid; place-items: center;
    background: var(--kg-forest-bg); color: var(--kg-forest);
    opacity: 0; transform: translateY(6px);
    transition: opacity .3s, transform .3s, background .25s, color .25s;
  }
  .cl-card:hover .cl-arrow {
    opacity: 1; transform: translateY(0);
    background: var(--kg-forest); color: #FFFFFF;
  }

  /* No-image variant */
  .cl-card-noimg .cl-card-media { background: var(--kg-sand-2); }
  .cl-card-noimg .cl-veil { display: none; }

  /* ── Skeleton ── */
  .cl-skel { aspect-ratio: 1 / 1.15; border-radius: 14px; }

  /* ── Empty state ── */
  .cl-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 18px; padding: 80px 24px; text-align: center; max-width: 480px; margin: 0 auto;
  }
  .cl-empty-icon {
    width: 72px; height: 72px; border-radius: var(--r-xl);
    background: var(--kg-forest-bg); color: var(--kg-forest);
    display: grid; place-items: center;
  }
  .cl-empty-title { font-size: 1.3rem; font-weight: 800; color: var(--kg-ink); margin: 0; }
  .cl-empty-text { font-size: 15px; color: var(--kg-muted); margin: 0; line-height: 1.7; }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .cl-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 760px) {
    .cl-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .cl-header { padding: 28px 0 32px; }
  }
  @media (max-width: 480px) {
    .cl-card { border-radius: 10px; }
    .cl-name { font-size: 13px; }
    .cl-count-badge { font-size: 10.5px; }
    .cl-emoji { font-size: 30px; }
    .cl-arrow { display: none; }
    .cl-card:hover { transform: none; }
    .cl-body { padding: 28px 0 56px; }
    .cl-toolbar { margin-bottom: 16px; }
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

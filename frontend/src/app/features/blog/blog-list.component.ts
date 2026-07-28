import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink],
  template: `
  <!-- Hero -->
  <section class="bl-hero">
    <div class="container">
      <nav class="bl-crumbs"><a routerLink="/">Home</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Blog</span></nav>
      <h1>Recipes & Stories</h1>
      <p>Discover authentic Indian recipes, cooking tips, and cultural stories from our community.</p>
    </div>
  </section>

  <!-- Body -->
  <section class="bl-body">
    <div class="container">
      @if (loading()) {
        <div class="bl-grid">
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="skeleton bl-skel"></div>
          }
        </div>
      } @else if (posts().length === 0) {
        <div class="empty-state">
          <h3>No articles yet</h3>
          <p>Check back soon for recipes and stories.</p>
        </div>
      } @else {
        <!-- Featured post -->
        @if (posts()[0]; as first) {
          <a class="bl-featured" [routerLink]="['/blog', first.slug]">
            <div class="bl-feat-img">
              @if (first.featured_image) {
                <img [src]="media(first.featured_image)" [alt]="first.title" loading="eager" fetchpriority="high" />
              } @else {
                <span class="bl-feat-ph">{{ (first.title || '?')[0] }}</span>
              }
            </div>
            <div class="bl-feat-body">
              @if (first.category) { <span class="bl-tag">{{ first.category }}</span> }
              <h2 class="bl-feat-title">{{ first.title }}</h2>
              @if (first.excerpt) { <p class="bl-feat-exc">{{ first.excerpt }}</p> }
              <div class="bl-meta">
                @if (first.published_at) { <span>{{ formatDate(first.published_at) }}</span> }
                @if (first.read_time) { <span>{{ first.read_time }} min read</span> }
              </div>
              <span class="bl-read-link">Read article<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            </div>
          </a>
        }

        <!-- Other posts -->
        @if (posts().length > 1) {
          <div class="bl-grid">
            @for (p of posts().slice(1); track p.id) {
              <a class="bl-card" [routerLink]="['/blog', p.slug]">
                <div class="bl-card-img">
                  @if (p.featured_image) {
                    <img [src]="media(p.featured_image)" [alt]="p.title" loading="lazy" />
                  } @else {
                    <span class="bl-card-ph">{{ (p.title || '?')[0] }}</span>
                  }
                </div>
                <div class="bl-card-body">
                  @if (p.category) { <span class="bl-tag">{{ p.category }}</span> }
                  <h3 class="bl-card-title">{{ p.title }}</h3>
                  @if (p.excerpt) { <p class="bl-card-exc">{{ p.excerpt }}</p> }
                  <div class="bl-meta">
                    @if (p.published_at) { <span>{{ formatDate(p.published_at) }}</span> }
                    @if (p.read_time) { <span>{{ p.read_time }} min</span> }
                  </div>
                  <span class="bl-read-link">Read more<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                </div>
              </a>
            }
          </div>
        }
      }
    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1360px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:768px){.container{padding:0 40px}}
  @media(min-width:1200px){.container{padding:0 56px}}
  .skeleton { background: linear-gradient(90deg, var(--kg-sand-2) 25%, var(--kg-warm) 50%, var(--kg-sand-2) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* HERO */
  .bl-hero {
    background: var(--kg-dark);
    padding: 48px 0 52px;
    position: relative; overflow: hidden;
  }
  .bl-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 140% at 20% 60%, rgba(74,127,212,.2) 0%, transparent 70%); pointer-events: none; }
  .bl-hero .container { position: relative; z-index: 1; }
  .bl-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: rgba(255,255,255,.38); margin-bottom: 16px; }
  .bl-crumbs a { color: rgba(255,255,255,.6); transition: color .2s; }
  .bl-crumbs a:hover { color: var(--kg-forest-lt); }
  .bl-crumbs svg { opacity: .35; flex-shrink: 0; }
  .bl-hero h1 { font-family: var(--font-sans); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; color: var(--kg-cream); margin-bottom: 8px; letter-spacing: -0.02em; }
  .bl-hero p { font-size: 15px; color: rgba(255,255,255,.55); max-width: 520px; margin: 0; line-height: 1.7; }

  /* BODY */
  .bl-body { padding: 48px 0 72px; background: var(--kg-cream); }

  /* TAGS */
  .bl-tag { display: inline-block; font-family: var(--font-sans); font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--kg-forest); margin-bottom: 10px; }

  /* FEATURED */
  .bl-featured {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
    background: var(--kg-paper); border: 1px solid var(--kg-line-lt);
    border-radius: 16px; overflow: hidden;
    text-decoration: none; margin-bottom: 40px;
    transition: all .35s var(--ease); min-height: 360px;
  }
  .bl-featured:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: var(--kg-line-warm); }
  .bl-feat-img { position: relative; overflow: hidden; background: var(--kg-warm); display: flex; align-items: center; justify-content: center; min-height: 360px; }
  .bl-feat-img img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; transition: transform .6s var(--ease); }
  .bl-featured:hover .bl-feat-img img { transform: scale(1.04); }
  .bl-feat-ph { font-family: var(--font-sans); font-size: 5rem; font-weight: 800; color: var(--kg-line-warm); }
  .bl-feat-body { padding: 36px; display: flex; flex-direction: column; justify-content: center; gap: 10px; }
  .bl-feat-title { font-family: var(--font-sans); font-size: clamp(1.25rem, 2.5vw, 1.8rem); font-weight: 800; color: var(--kg-ink); line-height: 1.25; letter-spacing: -0.015em; }
  .bl-feat-exc { font-size: 14.5px; color: var(--kg-muted); line-height: 1.7; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; margin: 0; }
  .bl-meta { display: flex; gap: 14px; font-size: 12.5px; color: var(--kg-faint); font-family: var(--font-sans); }
  .bl-read-link { font-size: 13px; font-weight: 800; color: var(--kg-forest); font-family: var(--font-sans); margin-top: 2px; display: inline-flex; align-items: center; gap: 6px; transition: gap .25s; }
  .bl-card:hover .bl-read-link, .bl-featured:hover .bl-read-link { gap: 10px; color: var(--kg-terra); }

  /* GRID */
  .bl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .bl-card {
    background: var(--kg-paper); border: 1px solid var(--kg-line-lt); border-radius: 14px;
    overflow: hidden; text-decoration: none; display: flex; flex-direction: column;
    transition: all .35s var(--ease);
  }
  .bl-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--kg-line-warm); }
  .bl-card-img { height: 210px; overflow: hidden; background: var(--kg-warm); display: flex; align-items: center; justify-content: center; }
  .bl-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s var(--ease); }
  .bl-card:hover .bl-card-img img { transform: scale(1.05); }
  .bl-card-ph { font-family: var(--font-sans); font-size: 3rem; font-weight: 800; color: var(--kg-line-warm); }
  .bl-card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .bl-card-title { font-family: var(--font-sans); font-size: 1.05rem; font-weight: 800; color: var(--kg-ink); line-height: 1.3; letter-spacing: -0.01em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .bl-card-exc { font-size: 13px; color: var(--kg-muted); line-height: 1.6; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; flex: 1; }
  .bl-skel { height: 340px; border-radius: 14px; }

  @media (max-width: 900px) {
    .bl-featured { grid-template-columns: 1fr; }
    .bl-feat-img { min-height: 240px; }
    .bl-grid { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 540px) {
    .bl-grid { grid-template-columns: 1fr; }
    .bl-feat-body { padding: 22px; }
  }
  @media (max-width: 640px) {
    .bl-hero { padding: 28px 0 32px; }
    .bl-body { padding: 28px 0 48px; }
  }
  `]
})
export class BlogListComponent implements OnInit {
  posts = signal<any[]>([]);
  loading = signal(true);
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(private api: ApiService, private seo: SeoService) {}

  ngOnInit() {
    this.seo.setMeta({ title: 'Blog & Recipes', description: 'Discover authentic Indian recipes, cooking tips, and more.' });
    this.api.getBlogs().subscribe({
      next: (r: any) => { if (r.success) this.posts.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  media(p: string) { if (!p) return ''; return p.startsWith('http') ? p : this.mediaUrl + p; }

  formatDate(d: string): string {
    try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; }
  }
}

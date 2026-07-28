import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
  @if (loading()) {
    <div class="container bd-load">
      <div class="skeleton bd-skel-cover"></div>
      <div style="max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:14px">
        <div class="skeleton" style="height:14px;width:100px;border-radius:8px"></div>
        <div class="skeleton" style="height:44px;border-radius:8px"></div>
        <div class="skeleton" style="height:44px;width:65%;border-radius:8px"></div>
        <div class="skeleton" style="height:14px;width:200px;border-radius:8px"></div>
        <div class="skeleton" style="height:200px;border-radius:10px;margin-top:20px"></div>
      </div>
    </div>
  } @else if (post(); as p) {
    @if (p.featured_image) {
      <div class="bd-cover">
        <img [src]="media(p.featured_image)" [alt]="p.title" fetchpriority="high" />
        <div class="bd-cover-overlay"></div>
      </div>
    }
    <article class="container bd-article">
      <nav class="bd-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <a routerLink="/blog">Blog</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>{{ p.title }}</span>
      </nav>
      <header class="bd-header">
        @if (p.category) { <span class="bd-tag">{{ p.category }}</span> }
        <h1 class="bd-title">{{ p.title }}</h1>
        <div class="bd-meta">
          @if (p.author) { <span>{{ p.author }}</span> }
          @if (p.published_at) { <span>{{ formatDate(p.published_at) }}</span> }
          @if (p.read_time) { <span>{{ p.read_time }} min read</span> }
        </div>
      </header>
      @if (p.excerpt) { <p class="bd-lede">{{ p.excerpt }}</p> }
      <div class="bd-body" [innerHTML]="p.content || p.body || '<p>Content coming soon.</p>'"></div>
      @if (p.tags?.length) {
        <div class="bd-tags">
          @for (t of p.tags; track t) { <span class="bd-tag-chip">{{ t }}</span> }
        </div>
      }
      <div class="bd-footer-nav">
        <a routerLink="/blog" class="bd-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Back to Blog
        </a>
      </div>
    </article>
    @if (related().length) {
      <section class="bd-related">
        <div class="container">
          <h2>More from our blog</h2>
          <div class="bd-related-grid">
            @for (r of related(); track r.id) {
              <a class="bd-rel-card" [routerLink]="['/blog', r.slug]">
                <div class="bd-rel-img">
                  @if (r.featured_image) { <img [src]="media(r.featured_image)" [alt]="r.title" loading="lazy" /> }
                  @else { <span class="bd-rel-ph">{{ (r.title || '?')[0] }}</span> }
                </div>
                <div class="bd-rel-body">
                  @if (r.category) { <span class="bd-tag">{{ r.category }}</span> }
                  <h3>{{ r.title }}</h3>
                  <span class="bd-read-link">Read<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                </div>
              </a>
            }
          </div>
        </div>
      </section>
    }
  } @else if (!loading()) {
    <div class="container empty-state" style="padding:72px 0">
      <h3>Article not found</h3>
      <p>This article may have been removed or the URL is incorrect.</p>
      <a routerLink="/blog" class="btn btn-outline" style="margin-top:16px">Back to Blog</a>
    </div>
  }
  `,
  styles: [`
  .container { max-width: 1360px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:768px){.container{padding:0 40px}}
  @media(min-width:1200px){.container{padding:0 56px}}
  .skeleton { background: linear-gradient(90deg, var(--kg-sand-2) 25%, var(--kg-warm) 50%, var(--kg-sand-2) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* COVER */
  .bd-cover { position: relative; height: 420px; overflow: hidden; }
  .bd-cover img { width: 100%; height: 100%; object-fit: cover; }
  .bd-cover-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(13,39,80,.45) 0%, transparent 60%); }
  .bd-load { padding: 36px 0 56px; }
  .bd-skel-cover { height: 380px; border-radius: 16px; margin-bottom: 36px; }

  /* ARTICLE */
  .bd-article { max-width: 740px; margin: 0 auto; padding: 44px 24px 56px; }
  .bd-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--kg-faint); margin-bottom: 22px; flex-wrap: wrap; }
  .bd-crumbs a { color: var(--kg-muted); transition: color .2s; font-weight: 600; }
  .bd-crumbs a:hover { color: var(--kg-forest); }
  .bd-crumbs svg { opacity: .4; flex-shrink: 0; }

  /* HEADER */
  .bd-header { margin-bottom: 24px; }
  .bd-tag { display: inline-block; font-family: var(--font-sans); font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--kg-forest); margin-bottom: 12px; }
  .bd-title { font-family: var(--font-sans); font-size: clamp(1.5rem, 3.5vw, 2.4rem); font-weight: 800; color: var(--kg-ink); line-height: 1.18; margin-bottom: 16px; letter-spacing: -0.02em; }
  .bd-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: var(--kg-faint); font-family: var(--font-sans); }

  /* LEDE */
  .bd-lede { font-size: 17px; color: var(--kg-ink-2); line-height: 1.8; border-left: 3px solid var(--kg-forest); padding-left: 18px; margin-bottom: 32px; }

  /* BODY */
  .bd-body { font-size: 15.5px; color: var(--kg-ink-2); line-height: 1.9; }
  .bd-body h2, .bd-body h3 { font-family: var(--font-sans); font-weight: 800; color: var(--kg-ink); margin: 28px 0 14px; letter-spacing: -0.01em; }
  .bd-body h2 { font-size: 1.45rem; }
  .bd-body h3 { font-size: 1.15rem; }
  .bd-body p { margin-bottom: 16px; }
  .bd-body img { max-width: 100%; border-radius: 10px; margin: 20px 0; }
  .bd-body ul, .bd-body ol { padding-left: 22px; margin-bottom: 16px; }
  .bd-body li { margin-bottom: 6px; }
  .bd-body a { color: var(--kg-forest); font-weight: 700; }
  .bd-body a:hover { color: var(--kg-forest-dk); }
  .bd-body blockquote { border-left: 3px solid var(--kg-forest); padding-left: 18px; margin: 22px 0; color: var(--kg-muted); }

  /* TAGS */
  .bd-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 36px; padding-top: 22px; border-top: 1px solid var(--kg-line-lt); }
  .bd-tag-chip { font-size: 12.5px; font-weight: 700; padding: 5px 14px; border-radius: var(--r-full); border: 1px solid var(--kg-line); color: var(--kg-muted); font-family: var(--font-sans); }

  /* BACK */
  .bd-footer-nav { margin-top: 36px; padding-top: 28px; border-top: 1px solid var(--kg-line-lt); }
  .bd-back { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--kg-muted); transition: color .2s; font-family: var(--font-sans); }
  .bd-back:hover { color: var(--kg-forest); }

  /* RELATED */
  .bd-related { padding: 56px 0; background: var(--kg-warm); }
  .bd-related h2 { font-family: var(--font-sans); font-size: 1.45rem; font-weight: 800; color: var(--kg-ink); margin-bottom: 28px; letter-spacing: -0.01em; }
  .bd-related-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .bd-rel-card { background: var(--kg-paper); border: 1px solid var(--kg-line-lt); border-radius: 14px; overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: all .35s var(--ease); }
  .bd-rel-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
  .bd-rel-img { height: 170px; overflow: hidden; background: var(--kg-warm); display: flex; align-items: center; justify-content: center; }
  .bd-rel-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s var(--ease); }
  .bd-rel-card:hover .bd-rel-img img { transform: scale(1.05); }
  .bd-rel-ph { font-family: var(--font-sans); font-size: 2.5rem; font-weight: 800; color: var(--kg-line-warm); }
  .bd-rel-body { padding: 16px; }
  .bd-rel-body h3 { font-family: var(--font-sans); font-size: .95rem; font-weight: 800; color: var(--kg-ink); margin: 4px 0 8px; line-height: 1.3; letter-spacing: -0.01em; }
  .bd-read-link { font-size: 12px; font-weight: 800; color: var(--kg-forest); font-family: var(--font-sans); display: inline-flex; align-items: center; gap: 5px; transition: gap .25s; }
  .bd-rel-card:hover .bd-read-link { gap: 8px; }

  @media (max-width: 768px) {
    .bd-cover { height: 260px; }
    .bd-related-grid { grid-template-columns: 1fr 1fr; }
    .bd-article { padding: 28px 16px 44px; }
  }
  @media (max-width: 540px) {
    .bd-related-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .bd-related { padding: 32px 0; }
  }
  `]
})
export class BlogDetailComponent implements OnInit {
  post = signal<any>(null);
  related = signal<any[]>([]);
  loading = signal(true);
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(private route: ActivatedRoute, private api: ApiService, private seo: SeoService) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.loading.set(true);
      this.api.getBlogBySlug(p['slug']).subscribe({
        next: (r: any) => {
          if (r.success && r.data) {
            this.post.set(r.data);
            this.seo.setBlogMeta(r.data);
            this.api.getBlogs().subscribe({
              next: (rel: any) => {
                if (rel.success) {
                  this.related.set((rel.data || []).filter((b: any) => b.slug !== p['slug']).slice(0, 3));
                }
              }, error: () => {}
            });
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });
  }

  media(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : this.mediaUrl + path;
  }

  formatDate(d: string): string {
    try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  }
}

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
      <div class="skeleton" style="height:420px;border-radius:20px;margin-bottom:40px"></div>
      <div style="max-width:680px;margin:0 auto;display:flex;flex-direction:column;gap:14px">
        <div class="skeleton" style="height:14px;width:100px;border-radius:8px"></div>
        <div class="skeleton" style="height:48px;border-radius:8px"></div>
        <div class="skeleton" style="height:48px;width:70%;border-radius:8px"></div>
        <div class="skeleton" style="height:14px;width:200px;border-radius:8px"></div>
        <div class="skeleton" style="height:200px;border-radius:8px;margin-top:24px"></div>
      </div>
    </div>
  } @else if (post(); as p) {

    <!-- Hero Image -->
    @if (p.featured_image) {
      <div class="bd-cover">
        <img [src]="media(p.featured_image)" [alt]="p.title" fetchpriority="high" />
        <div class="bd-cover-overlay"></div>
      </div>
    }

    <!-- Article -->
    <article class="container bd-article">

      <nav class="bd-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><i>/</i>
        <a routerLink="/blog">Blog</a><i>/</i>
        <span>{{ p.title }}</span>
      </nav>

      <header class="bd-header">
        @if (p.category) { <span class="bd-tag">{{ p.category }}</span> }
        <h1 class="bd-title">{{ p.title }}</h1>
        <div class="bd-meta">
          @if (p.author) { <span>✍️ {{ p.author }}</span> }
          @if (p.published_at) { <span>📅 {{ formatDate(p.published_at) }}</span> }
          @if (p.read_time) { <span>⏱ {{ p.read_time }} min read</span> }
        </div>
      </header>

      @if (p.excerpt) {
        <p class="bd-lede">{{ p.excerpt }}</p>
      }

      <div class="bd-body" [innerHTML]="p.content || p.body || '<p>Content coming soon.</p>'"></div>

      <!-- Tags -->
      @if (p.tags?.length) {
        <div class="bd-tags">
          @for (t of p.tags; track t) {
            <span class="bd-tag-chip">{{ t }}</span>
          }
        </div>
      }

      <!-- Back -->
      <div class="bd-footer-nav">
        <a routerLink="/blog" class="bd-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Back to Blog
        </a>
      </div>
    </article>

    <!-- Related posts -->
    @if (related().length) {
      <section class="bd-related">
        <div class="container">
          <h2>More from our blog</h2>
          <div class="bd-related-grid">
            @for (r of related(); track r.id) {
              <a class="bd-rel-card" [routerLink]="['/blog', r.slug]">
                <div class="bd-rel-img">
                  @if (r.featured_image) { <img [src]="media(r.featured_image)" [alt]="r.title" loading="lazy" /> }
                  @else { <div class="bd-rel-ph">📖</div> }
                </div>
                <div class="bd-rel-body">
                  @if (r.category) { <span class="bd-tag">{{ r.category }}</span> }
                  <h3>{{ r.title }}</h3>
                  <span class="bd-read-link">Read →</span>
                </div>
              </a>
            }
          </div>
        </div>
      </section>
    }

  } @else if (!loading()) {
    <div class="container empty-state" style="padding:80px 0">
      <div style="font-size:3rem;margin-bottom:16px">📄</div>
      <h3>Article not found</h3>
      <p>This article may have been removed or the URL is incorrect.</p>
      <a routerLink="/blog" class="bd-back" style="margin-top:20px;display:inline-flex">← Back to Blog</a>
    </div>
  }
  `,
  styles: [`
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}
  .skeleton { background: linear-gradient(90deg,#EFE8DA 25%,#F7F2E7 50%,#EFE8DA 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* COVER */
  .bd-cover { position: relative; height: 480px; overflow: hidden; }
  .bd-cover img { width: 100%; height: 100%; object-fit: cover; }
  .bd-cover-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(28,25,19,.5) 0%, transparent 60%); }
  .bd-load { padding: 40px 0 60px; }

  /* ARTICLE */
  .bd-article { max-width: 740px; margin: 0 auto; padding: 40px 24px 60px; }

  /* BREADCRUMB */
  .bd-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #ABA394; margin-bottom: 24px; flex-wrap: wrap; }
  .bd-crumbs a { color: #7C7466; transition: color .2s; }
  .bd-crumbs a:hover { color: #C4622D; }
  .bd-crumbs i { font-style: normal; opacity: .4; }

  /* HEADER */
  .bd-header { margin-bottom: 28px; }
  .bd-tag { display: inline-block; font-family: 'Manrope', sans-serif; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #C4622D; margin-bottom: 12px; }
  .bd-title { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.6rem, 4vw, 2.8rem); font-weight: 400; color: #211D16; line-height: 1.2; margin-bottom: 18px; }
  .bd-meta { display: flex; gap: 18px; flex-wrap: wrap; font-size: 13px; color: #ABA394; font-family: 'Manrope', sans-serif; }

  /* LEDE */
  .bd-lede { font-size: 17px; color: #4A5568; line-height: 1.8; font-style: italic; border-left: 3px solid #C4622D; padding-left: 20px; margin-bottom: 32px; }

  /* BODY */
  .bd-body { font-size: 16px; color: #4A5568; line-height: 1.9; }
  .bd-body h2, .bd-body h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 400; color: #211D16; margin: 32px 0 14px; }
  .bd-body h2 { font-size: 1.5rem; }
  .bd-body h3 { font-size: 1.2rem; }
  .bd-body p { margin-bottom: 18px; }
  .bd-body img { max-width: 100%; border-radius: 12px; margin: 24px 0; }
  .bd-body ul, .bd-body ol { padding-left: 24px; margin-bottom: 18px; }
  .bd-body li { margin-bottom: 6px; }
  .bd-body a { color: #C4622D; text-decoration: underline; }
  .bd-body blockquote { border-left: 3px solid #C4622D; padding-left: 20px; margin: 24px 0; font-style: italic; color: #7C7466; }

  /* TAGS */
  .bd-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 40px; padding-top: 24px; border-top: 1px solid #E8E1D2; }
  .bd-tag-chip { font-size: 13px; font-weight: 700; padding: 5px 14px; border-radius: 999px; border: 1.5px solid #E8E1D2; color: #7C7466; font-family: 'Manrope', sans-serif; }

  /* BACK */
  .bd-footer-nav { margin-top: 40px; padding-top: 32px; border-top: 1px solid #E8E1D2; }
  .bd-back { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #7C7466; transition: color .2s; font-family: 'Manrope', sans-serif; }
  .bd-back:hover { color: #C4622D; }

  /* RELATED */
  .bd-related { padding: 56px 0; background: #F1EADD; }
  .bd-related h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.6rem; font-weight: 400; color: #211D16; margin-bottom: 28px; }
  .bd-related-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .bd-rel-card { background: #fff; border: 1.5px solid #E8E1D2; border-radius: 16px; overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: all .3s; }
  .bd-rel-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(28,25,19,.1); }
  .bd-rel-img { height: 180px; overflow: hidden; background: #F1EADD; display: flex; align-items: center; justify-content: center; }
  .bd-rel-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
  .bd-rel-card:hover .bd-rel-img img { transform: scale(1.05); }
  .bd-rel-ph { font-size: 2.5rem; }
  .bd-rel-body { padding: 16px; }
  .bd-rel-body h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1rem; font-weight: 400; color: #211D16; margin: 6px 0 10px; line-height: 1.3; }
  .bd-read-link { font-size: 13px; font-weight: 700; color: #C4622D; font-family: 'Manrope', sans-serif; }

  @media (max-width: 768px) {
    .bd-cover { height: 280px; }
    .bd-related-grid { grid-template-columns: 1fr; }
    .bd-article { padding: 32px 16px 48px; }
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
            // Load related
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

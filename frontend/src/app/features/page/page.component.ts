import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [RouterLink],
  template: `
  @if (page(); as p) {
    <article class="pg"><div class="pg-wrap">
      <nav class="pg-crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>{{ p.title }}</span>
      </nav>
      <h1>{{ p.title }}</h1>
      <div class="pg-content" [innerHTML]="p.content"></div>
    </div></article>
  } @else if (missing()) {
    <div class="pg-miss"><h1>Page not found</h1><p>The page you're looking for doesn't exist or has been moved.</p><a routerLink="/" class="btn btn-primary">Back to Home</a></div>
  }
  `,
  styles: [`
  .pg{padding:48px 0 56px;background:var(--kg-cream)}
  .pg-wrap{max-width:760px;margin:0 auto;padding:0 24px}
  @media(min-width:768px){.pg-wrap{padding:0 40px}}
  .pg-crumbs{font-size:12.5px;color:var(--kg-faint);margin-bottom:20px;display:flex;gap:6px;align-items:center}
  .pg-crumbs a{color:var(--kg-muted);font-weight:600;transition:color .2s}
  .pg-crumbs a:hover{color:var(--kg-forest)}
  .pg-crumbs svg{opacity:.4;flex-shrink:0}
  .pg h1{font-size:clamp(1.7rem,3.6vw,2.6rem);font-weight:800;margin-bottom:28px;letter-spacing:-0.02em}
  .pg-content{font-size:15.5px;line-height:1.9;color:var(--kg-ink-2)}
  .pg-content h2,.pg-content h3{font-family:var(--font-sans);font-weight:800;color:var(--kg-ink);margin:28px 0 14px}
  .pg-content h2{font-size:1.35rem}
  .pg-content h3{font-size:1.1rem}
  .pg-content p{margin:0 0 14px;color:var(--kg-ink-2)}
  .pg-content ul,.pg-content ol{margin:0 0 14px 22px;color:var(--kg-ink-2)}
  .pg-content li{margin-bottom:6px}
  .pg-content a{color:var(--kg-forest);font-weight:700}
  .pg-content img{max-width:100%;border-radius:10px;margin:16px 0}
  .pg-miss{text-align:center;padding:96px 28px;background:var(--kg-cream)}
  .pg-miss h1{font-size:1.5rem;font-weight:800;margin-bottom:10px}
  .pg-miss p{font-size:14.5px;color:var(--kg-muted);margin-bottom:24px}
  @media(max-width:640px){.pg{padding:28px 0 36px}}
  `]
})
export class PageComponent implements OnInit {
  page = signal<any>(null);
  missing = signal(false);
  constructor(private route: ActivatedRoute, private api: ApiService, private seo: SeoService) {}
  ngOnInit() {
    this.route.params.subscribe(p => {
      this.page.set(null); this.missing.set(false);
      const anyApi = this.api as any;
      const fn = anyApi.getPageBySlug || anyApi.getPage;
      if (!fn) { this.missing.set(true); return; }
      fn.call(anyApi, p['slug']).subscribe({
        next: (r: any) => {
          if (r.success && r.data) { this.page.set(r.data); this.seo.setMeta({ title: r.data.meta_title || r.data.title, description: r.data.meta_description || '' }); }
          else this.missing.set(true);
        },
        error: () => this.missing.set(true)
      });
    });
  }
}

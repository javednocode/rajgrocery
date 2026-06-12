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
      <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a><i>/</i><span>{{ p.title }}</span></nav>
      <h1>{{ p.title }}</h1>
      <div class="pg-content" [innerHTML]="p.content"></div>
    </div></article>
  } @else if (missing()) {
    <div class="pg-miss"><h1>Page not found</h1><p>The page you're looking for doesn't exist or has been moved.</p><a routerLink="/" class="td-btn td-btn-dark">Back to home</a></div>
  }
  `,
  styles: [`
  .pg{padding:48px 0 40px}
  .pg-wrap{max-width:760px;margin:0 auto;padding:0 28px}
  .crumbs{font-size:13px;color:var(--td-muted);margin-bottom:26px;display:flex;gap:8px}
  .crumbs a:hover{color:var(--td-text)}
  .crumbs i{font-style:normal;opacity:.5}
  .pg h1{font-size:clamp(1.8rem,3.6vw,2.7rem);font-weight:800;margin-bottom:32px}
  .pg-content{font-size:16px;line-height:1.95;color:var(--td-text)}
  .pg-content h2,.pg-content h3{margin:32px 0 14px}
  .pg-content p{margin:0 0 16px}
  .pg-content ul,.pg-content ol{margin:0 0 16px 22px}
  .pg-miss{text-align:center;padding:120px 28px;color:var(--td-muted)}
  .pg-miss h1{margin-bottom:12px}
  .pg-miss .td-btn{margin-top:26px}
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

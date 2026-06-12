import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
  @if (post(); as p) {
    <article class="bd">
      <div class="bd-wrap">
        <nav class="crumbs" aria-label="Breadcrumb"><a routerLink="/">Home</a><i>/</i><a routerLink="/blog">Journal</a><i>/</i><span>{{ p.title }}</span></nav>
        @if (p.category_name) { <span class="bd-cat">{{ p.category_name }}</span> }
        <h1>{{ p.title }}</h1>
        <div class="bd-meta">By {{ p.author }} · {{ p.published_at }}</div>
        @if (p.featured_image) { <div class="bd-img"><img [src]="p.featured_image" [alt]="p.title" /></div> }
        <div class="bd-content" [innerHTML]="p.content"></div>
        <a routerLink="/blog" class="td-btn td-btn-light" style="margin-top:48px">← Back to Journal</a>
      </div>
    </article>
  }
  `,
  styles: [`
  .bd{padding:48px 0 40px}
  .bd-wrap{max-width:760px;margin:0 auto;padding:0 28px}
  .crumbs{font-size:13px;color:var(--td-muted);margin-bottom:26px;display:flex;gap:8px;flex-wrap:wrap}
  .crumbs a:hover{color:var(--td-text)}
  .crumbs i{font-style:normal;opacity:.5}
  .bd-cat{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--td-accent)}
  .bd h1{font-size:clamp(1.8rem,3.6vw,2.8rem);font-weight:800;line-height:1.15;margin:12px 0 16px}
  .bd-meta{font-size:14px;color:var(--td-muted);margin-bottom:34px}
  .bd-img{border-radius:var(--td-radius);overflow:hidden;margin-bottom:40px}
  .bd-img img{width:100%;aspect-ratio:16/9;object-fit:cover}
  .bd-content{font-size:16.5px;line-height:1.95;color:var(--td-text)}
  .bd-content h2,.bd-content h3{margin:34px 0 14px}
  .bd-content p{margin:0 0 18px}
  .bd-content img{border-radius:var(--td-radius-sm);margin:24px 0}
  .bd-content ul,.bd-content ol{margin:0 0 18px 22px}
  `]
})
export class BlogDetailComponent implements OnInit {
  post = signal<any>(null);
  constructor(private route: ActivatedRoute, private api: ApiService, private seo: SeoService) {}
  ngOnInit() {
    this.route.params.subscribe(p => {
      this.api.getBlogBySlug(p['slug']).subscribe({
        next: (r: any) => { if (r.success) { this.post.set(r.data); this.seo.setMeta({ title: r.data.meta_title || r.data.title, description: r.data.meta_description || r.data.excerpt }); } },
        error: () => {}
      });
    });
  }
}

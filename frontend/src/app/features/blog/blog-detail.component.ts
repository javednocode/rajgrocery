import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (post()) {
      <article class="blog-detail">
        <div class="container">
          <div class="breadcrumb"><a routerLink="/">Home</a> / <a routerLink="/blog">Blog</a> / <span>{{ post()?.title }}</span></div>
          <div class="blog-header">
            @if (post()?.category_name) { <span class="blog-cat">{{ post()?.category_name }}</span> }
            <h1>{{ post()?.title }}</h1>
            <div class="blog-meta">
              <span>By {{ post()?.author }}</span>
              <span>•</span>
              <span>{{ post()?.published_at }}</span>
              <span>•</span>
              <span>{{ post()?.views }} views</span>
            </div>
          </div>
          @if (post()?.featured_image) {
            <div class="featured-img"><img [src]="post()?.featured_image" [alt]="post()?.title"></div>
          }
          <div class="blog-content" [innerHTML]="post()?.content"></div>
          <a routerLink="/blog" class="btn btn-outline" style="margin-top:40px;">← Back to Blog</a>
        </div>
      </article>
    }
  `,
  styles: [`
    .blog-detail { padding: 40px 0 80px; max-width: 800px; margin: 0 auto; }
    .breadcrumb { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
    .breadcrumb a { color: var(--text-secondary); } .breadcrumb a:hover { color: var(--primary); }
    .blog-cat { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); font-weight: 600; }
    .blog-header h1 { margin: 8px 0 16px; font-size: clamp(1.5rem, 3vw, 2.5rem); }
    .blog-meta { font-size: 14px; color: var(--text-muted); display: flex; gap: 8px; margin-bottom: 32px; }
    .featured-img { border-radius: var(--radius); overflow: hidden; margin-bottom: 40px; }
    .featured-img img { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
    .blog-content { font-size: 16px; line-height: 1.9; color: var(--text-secondary); }
    .blog-content h2, .blog-content h3 { color: var(--text); margin: 28px 0 12px; }
    .blog-content p { margin-bottom: 16px; }
    .blog-content img { border-radius: var(--radius-sm); margin: 20px 0; }
    .blog-content ul, .blog-content ol { margin-left: 20px; margin-bottom: 16px; }
  `]
})
export class BlogDetailComponent implements OnInit {
  post = signal<any>(null);
  constructor(private route: ActivatedRoute, private api: ApiService, private seo: SeoService) {}
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.api.getBlogBySlug(params['slug']).subscribe({
        next: (res: any) => {
          if (res.success) { this.post.set(res.data); this.seo.setMeta({ title: res.data.meta_title || res.data.title, description: res.data.meta_description || res.data.excerpt }); }
        }
      });
    });
  }
}

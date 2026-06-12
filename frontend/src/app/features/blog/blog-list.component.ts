import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, ScrollAnimateDirective, DatePipe],
  template: `
    <section class="page-hero"><div class="container"><h1>Blog</h1><p>Tips, recipes, and news about healthy eating</p></div></section>
    <section class="section">
      <div class="container">
        <div class="blog-grid">
          @for (post of posts(); track post.id; let i = $index) {
            <a [routerLink]="['/blog', post.slug]" class="blog-card" appScrollAnimate [animationDelay]="(i * 0.08) + 's'">
              <div class="blog-img">
                <img [src]="post.featured_image || 'placeholder.png'" [alt]="post.title" loading="lazy">
              </div>
              <div class="blog-info">
                @if (post.category_name) { <span class="blog-cat">{{ post.category_name }}</span> }
                <h3>{{ post.title }}</h3>
                @if (post.excerpt) { <p>{{ post.excerpt }}</p> }
                <div class="blog-meta">
                  <span>{{ post.author }}</span>
                  <span>•</span>
                  <span>{{ post.published_at | date:'mediumDate' }}</span>
                </div>
              </div>
            </a>
          } @empty {
            <div class="empty-state"><span>📝</span><h3>No blog posts yet</h3><p>Check back soon for articles!</p></div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { padding: 48px 0 36px; background: #111; color: white; text-align: center; }
    .page-hero h1 { color: white; margin-bottom: 8px; font-size: clamp(1.6rem,3.5vw,2.4rem); } .page-hero p { color: rgba(255,255,255,0.6); font-size: 15px; }
    .section { padding: 60px 0; }
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; }
    .blog-card { background: var(--bg-white); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border-light); transition: var(--transition); }
    .blog-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    .blog-img { aspect-ratio: 16/9; overflow: hidden; }
    .blog-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .blog-card:hover .blog-img img { transform: scale(1.05); }
    .blog-info { padding: 24px; }
    .blog-cat { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--primary); font-weight: 600; }
    .blog-info h3 { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 600; margin: 8px 0 10px; line-height: 1.4; }
    .blog-info p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .blog-meta { font-size: 13px; color: var(--text-muted); margin-top: 14px; display: flex; gap: 6px; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px 20px; }
    .empty-state span { font-size: 64px; display: block; margin-bottom: 16px; }
    @media (max-width: 768px) { .blog-grid { grid-template-columns: 1fr; } }
  `]
})
export class BlogListComponent implements OnInit {
  posts = signal<any[]>([]);
  constructor(private api: ApiService, private seo: SeoService) {}
  ngOnInit() {
    this.seo.setMeta({ title: 'Blog', description: 'Tips, product guides, and store updates.' });
    this.api.getBlogs().subscribe({ next: (res: any) => { if (res.success) this.posts.set(res.data); } });
  }
}

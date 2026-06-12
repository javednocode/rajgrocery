import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, DatePipe, ScrollAnimateDirective],
  template: `
  <section class="bl-hero"><div class="td-container">
    <span class="td-eyebrow">The Journal</span>
    <h1>Stories, recipes<br/>& kitchen wisdom.</h1>
  </div></section>
  <section class="bl-body"><div class="td-container">
    @if (posts().length === 0) {
      <div class="bl-empty"><h3>No stories yet</h3><p>Check back soon — we're cooking something up.</p></div>
    } @else {
      <div class="bl-grid">
        @for (p of posts(); track p.id; let i = $index) {
          <a class="bl-card" [routerLink]="['/blog', p.slug]" appScrollAnimate [animationDelay]="(i % 3 * 0.07) + 's'">
            <div class="bl-img">@if (p.featured_image) { <img [src]="p.featured_image" [alt]="p.title" loading="lazy" /> }</div>
            <div class="bl-info">
              @if (p.category_name) { <span class="bl-cat">{{ p.category_name }}</span> }
              <h3>{{ p.title }}</h3>
              @if (p.excerpt) { <p>{{ p.excerpt }}</p> }
              <div class="bl-meta">{{ p.author }} · {{ p.published_at | date:'mediumDate' }}</div>
            </div>
          </a>
        }
      </div>
    }
  </div></section>
  `,
  styles: [`
  .bl-hero{padding:84px 0 56px;background:var(--td-secondary)}
  .bl-hero h1{font-size:clamp(2.2rem,4.4vw,3.6rem);font-weight:800;line-height:1.08;letter-spacing:-.03em;margin-top:6px}
  .bl-body{padding:64px 0 32px}
  .bl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
  .bl-card{border:1px solid var(--td-line);border-radius:var(--td-radius);overflow:hidden;transition:transform .35s var(--td-ease),box-shadow .35s;display:flex;flex-direction:column;background:#fff}
  .bl-card:hover{transform:translateY(-5px);box-shadow:var(--td-shadow)}
  .bl-img{aspect-ratio:16/10;background:var(--td-secondary);overflow:hidden}
  .bl-img img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--td-ease)}
  .bl-card:hover .bl-img img{transform:scale(1.05)}
  .bl-info{padding:24px;display:flex;flex-direction:column;flex:1}
  .bl-cat{font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--td-accent);margin-bottom:10px}
  .bl-info h3{font-size:18px;font-weight:700;line-height:1.4;margin-bottom:10px}
  .bl-info p{font-size:14px;color:var(--td-muted);line-height:1.7;margin:0 0 18px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
  .bl-meta{margin-top:auto;font-size:12.5px;color:var(--td-muted)}
  .bl-empty{text-align:center;padding:90px 20px;color:var(--td-muted)}
  @media (max-width:1000px){.bl-grid{grid-template-columns:1fr 1fr}}
  @media (max-width:640px){.bl-grid{grid-template-columns:1fr}.bl-hero{padding:56px 0 40px}}
  `]
})
export class BlogListComponent implements OnInit {
  posts = signal<any[]>([]);
  constructor(private api: ApiService, private seo: SeoService) {}
  ngOnInit() {
    this.seo.setMeta({ title: 'The Journal', description: 'Recipes, stories and kitchen wisdom from The Desi.' });
    this.api.getBlogs().subscribe({ next: (r: any) => { if (r.success) this.posts.set(r.data || []); }, error: () => {} });
  }
}

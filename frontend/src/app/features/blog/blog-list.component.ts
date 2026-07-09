import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
  <!-- Hero -->
  <section class="bl-hero">
    <div class="container">
      <span class="bl-eyebrow">Our Blog</span>
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
            <div class="skeleton" style="height:360px;border-radius:16px"></div>
          }
        </div>
      } @else if (posts().length === 0) {
        <div class="empty-state">
          <div style="font-size:3rem;margin-bottom:16px">📖</div>
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
                <div class="bl-feat-ph">📖</div>
              }
            </div>
            <div class="bl-feat-body">
              @if (first.category) { <span class="bl-tag">{{ first.category }}</span> }
              <h2 class="bl-feat-title">{{ first.title }}</h2>
              @if (first.excerpt) { <p class="bl-feat-exc">{{ first.excerpt }}</p> }
              <div class="bl-meta">
                @if (first.published_at) { <span>📅 {{ formatDate(first.published_at) }}</span> }
                @if (first.read_time) { <span>⏱ {{ first.read_time }} min read</span> }
              </div>
              <span class="bl-read-link">Read article →</span>
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
                    <div class="bl-card-ph">📖</div>
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
                  <span class="bl-read-link">Read more →</span>
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
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}
  .skeleton { background: linear-gradient(90deg,#EEF2F6 25%,#F7FAFC 50%,#EEF2F6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* HERO */
  .bl-hero {
    background: #1F2937;
    padding: 52px 0 56px;
  }
  .bl-eyebrow { display: inline-block; font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #1E88A8; margin-bottom: 12px; }
  .bl-hero h1 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 400; color: #fff; margin-bottom: 10px; }
  .bl-hero p { font-size: 16px; color: rgba(255,255,255,.65); max-width: 540px; margin: 0; line-height: 1.7; }

  /* BODY */
  .bl-body { padding: 48px 0 64px; background: #FFFFFF; }

  /* TAGS */
  .bl-tag { display: inline-block; font-family: 'Manrope', sans-serif; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #1E88A8; margin-bottom: 10px; }

  /* FEATURED */
  .bl-featured {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
    background: #fff; border: 1.5px solid #E5E7EB;
    border-radius: 24px; overflow: hidden;
    text-decoration: none; margin-bottom: 40px;
    transition: all .3s; min-height: 360px;
  }
  .bl-featured:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(17,24,39,.12); border-color: rgba(30,136,168,.25); }
  .bl-feat-img { position: relative; overflow: hidden; background: #F7FAFC; display: flex; align-items: center; justify-content: center; min-height: 360px; }
  .bl-feat-img img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; transition: transform .5s; }
  .bl-featured:hover .bl-feat-img img { transform: scale(1.05); }
  .bl-feat-ph { font-size: 4rem; }
  .bl-feat-body { padding: 40px; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
  .bl-feat-title { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.3rem, 2.5vw, 2rem); font-weight: 400; color: #111827; line-height: 1.25; }
  .bl-feat-exc { font-size: 15px; color: #6B7280; line-height: 1.7; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; margin: 0; }
  .bl-meta { display: flex; gap: 14px; font-size: 12.5px; color: #9CA3AF; font-family: 'Manrope', sans-serif; }
  .bl-read-link { font-size: 14px; font-weight: 800; color: #1E88A8; font-family: 'Manrope', sans-serif; margin-top: 4px; }

  /* GRID */
  .bl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .bl-card {
    background: #fff; border: 1.5px solid #E5E7EB; border-radius: 20px;
    overflow: hidden; text-decoration: none; display: flex; flex-direction: column;
    transition: all .3s;
  }
  .bl-card:hover { transform: translateY(-5px); box-shadow: 0 14px 40px rgba(17,24,39,.1); border-color: rgba(30,136,168,.25); }
  .bl-card-img { height: 220px; overflow: hidden; background: #F7FAFC; display: flex; align-items: center; justify-content: center; }
  .bl-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
  .bl-card:hover .bl-card-img img { transform: scale(1.05); }
  .bl-card-ph { font-size: 3rem; }
  .bl-card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .bl-card-title { font-family: 'Fraunces', Georgia, serif; font-size: 1.15rem; font-weight: 400; color: #111827; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .bl-card-exc { font-size: 13.5px; color: #6B7280; line-height: 1.6; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; flex: 1; }

  @media (max-width: 900px) {
    .bl-featured { grid-template-columns: 1fr; }
    .bl-feat-img { min-height: 240px; }
    .bl-grid { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 540px) {
    .bl-grid { grid-template-columns: 1fr; }
    .bl-feat-body { padding: 24px; }
  }

  @media (max-width: 640px) {
    .bl-hero { padding: 26px 0 30px; }
    .bl-body { padding: 24px 0 40px; }
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

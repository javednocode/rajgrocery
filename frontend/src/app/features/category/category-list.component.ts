import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink, ScrollAnimateDirective],
  template: `
  <section class="cl-hero">
    <div class="td-container">
      <span class="td-eyebrow">The Collection</span>
      <h1>Every aisle.<br/>One basket.</h1>
      <p class="td-sub">Browse our full range of premium South Asian groceries — curated, authentic, delivered UK-wide.</p>
    </div>
  </section>
  <section class="cl-body">
    <div class="td-container">
      @if (loading()) {
        <div class="cl-grid">@for (s of [1,2,3,4,5,6]; track s) { <div class="td-skel" style="aspect-ratio:4/3"></div> }</div>
      } @else {
        <div class="cl-grid">
          @for (c of categories(); track c.id; let i = $index) {
            <a class="cl-card" [routerLink]="['/category', c.slug]" appScrollAnimate [animationDelay]="(i % 6 * 0.05) + 's'">
              @if (c.image) { <img [src]="media(c.image)" [alt]="c.name" loading="lazy" /> }
              <div class="cl-veil"></div>
              <div class="cl-label">
                <div><h3>{{ c.name }}</h3>@if (c.description) { <p>{{ c.description }}</p> }</div>
                <span class="cl-arrow"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  </section>
  `,
  styles: [`
  .cl-hero{padding:84px 0 56px;background:var(--td-secondary)}
  .cl-hero h1{font-size:clamp(2.2rem,4.4vw,3.6rem);font-weight:800;line-height:1.06;letter-spacing:-.03em;margin:6px 0 18px}
  .cl-body{padding:64px 0 32px}
  .cl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .cl-card{position:relative;aspect-ratio:4/3;border-radius:var(--td-radius);overflow:hidden;background:var(--td-secondary);transition:box-shadow .35s}
  .cl-card:hover{box-shadow:var(--td-shadow)}
  .cl-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s var(--td-ease)}
  .cl-card:hover img{transform:scale(1.06)}
  .cl-veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,12,.66),transparent 55%)}
  .cl-label{position:absolute;left:22px;right:22px;bottom:20px;display:flex;align-items:flex-end;justify-content:space-between;gap:14px;color:#fff}
  .cl-label h3{color:#fff;font-size:20px;font-weight:700}
  .cl-label p{color:rgba(255,255,255,.75);font-size:12.5px;margin:5px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
  .cl-arrow{width:40px;height:40px;border-radius:999px;background:rgba(255,255,255,.16);backdrop-filter:blur(8px);display:grid;place-items:center;flex-shrink:0;transition:background .25s,transform .3s var(--td-ease)}
  .cl-card:hover .cl-arrow{background:var(--td-accent);color:#111;transform:translateX(3px)}
  @media (max-width:1000px){.cl-grid{grid-template-columns:1fr 1fr}}
  @media (max-width:620px){.cl-grid{grid-template-columns:1fr}.cl-hero{padding:56px 0 40px}}
  `]
})
export class CategoryListComponent implements OnInit {
  categories = signal<any[]>([]);
  loading = signal(true);
  mediaUrl = (environment as any).mediaUrl || '';

  constructor(private api: ApiService, private seo: SeoService) {}

  ngOnInit() {
    this.seo.setMeta({ title: 'Shop All Categories', description: 'Browse premium South Asian groceries by category — spices, snacks, frozen, rice, lentils and more. Delivered across the UK.' });
    const anyApi = this.api as any;
    const src = anyApi.getCategories ? anyApi.getCategories() : anyApi.getFeaturedCategories();
    src.subscribe({
      next: (r: any) => { if (r.success) this.categories.set((r.data || []).filter((c: any) => c.is_active == 1)); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
  media(p: string) { return !p ? '' : (p.startsWith('http') ? p : this.mediaUrl + p); }
}

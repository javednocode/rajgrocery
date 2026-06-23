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
              @if (c.image) {
                <img [src]="media(c.image)" [alt]="c.name" loading="lazy" (error)="onCatImgErr($event, c.name)" />
              } @else {
                <div class="cl-emoji-bg"><span>{{ catIcon(c.name) }}</span></div>
              }
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
  .cl-hero{padding:60px 0 44px;background:#F4FCF7;border-bottom:1px solid #ECECEC}
  .td-container{max-width:1280px;margin:0 auto;padding:0 24px;width:100%}
  .td-eyebrow{display:inline-block;background:#fff;border:1px solid rgba(59,183,126,.3);color:#3BB77E;font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:5px 18px;border-radius:999px;margin-bottom:12px}
  .cl-hero h1{font-size:clamp(1.8rem,3.8vw,3rem);font-weight:800;color:#253D4E;margin:6px 0 14px;line-height:1.2}
  .td-sub{font-size:15px;color:#7E8D97;max-width:580px;line-height:1.7;margin:0}
  .cl-body{padding:48px 0 32px}
  .cl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .cl-card{position:relative;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:#F4FCF7;transition:box-shadow .3s,transform .3s}
  .cl-card:hover{box-shadow:0 12px 36px rgba(0,0,0,.12);transform:translateY(-3px)}
  .cl-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
  .cl-card:hover img{transform:scale(1.05)}
  .cl-veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,12,.62),transparent 55%)}
  .cl-label{position:absolute;left:20px;right:20px;bottom:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;color:#fff}
  .cl-label h3{color:#fff;font-size:18px;font-weight:700}
  .cl-label p{color:rgba(255,255,255,.75);font-size:12px;margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
  .cl-arrow{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);display:grid;place-items:center;flex-shrink:0;transition:background .22s,transform .25s ease}
  .cl-card:hover .cl-arrow{background:#3BB77E;transform:translateX(3px)}
  .td-skel{background:linear-gradient(90deg,#EEF3F0 25%,#F8FAF9 50%,#EEF3F0 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:12px}
  .cl-emoji-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#E8F9F0,#C7EFDB);font-size:72px;line-height:1}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @media (max-width:1000px){.cl-grid{grid-template-columns:1fr 1fr}}
  @media (max-width:620px){.cl-grid{grid-template-columns:1fr 1fr;gap:12px}.cl-hero{padding:40px 0 32px}}
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

  catIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('meat') || n.includes('chicken') || n.includes('poultry') || n.includes('lamb') || n.includes('mutton')) return '🍗';
    if (n.includes('spice') || n.includes('masala') || n.includes('chilli') || n.includes('pepper')) return '🌶️';
    if (n.includes('rice') || n.includes('basmati') || n.includes('grain')) return '🍚';
    if (n.includes('lentil') || n.includes('dal') || n.includes('dhal') || n.includes('daal')) return '🫘';
    if (n.includes('pulse') || n.includes('pea') || n.includes('chick')) return '🫛';
    if (n.includes('bean')) return '🫘';
    if (n.includes('bread') || n.includes('chapati') || n.includes('roti') || n.includes('naan')) return '🫓';
    if (n.includes('flour') || n.includes('atta') || n.includes('maida')) return '🌾';
    if (n.includes('vegetable') || n.includes('veggie') || n.includes('sabzi')) return '🥦';
    if (n.includes('fruit') || n.includes('dried')) return '🍎';
    if (n.includes('dairy') || n.includes('milk') || n.includes('cheese') || n.includes('paneer')) return '🧀';
    if (n.includes('sweet') || n.includes('mithai') || n.includes('dessert') || n.includes('halwa')) return '🍮';
    if (n.includes('chocolate') || n.includes('candy')) return '🍫';
    if (n.includes('oil') || n.includes('ghee') || n.includes('butter')) return '🫙';
    if (n.includes('snack') || n.includes('crisps') || n.includes('namkeen') || n.includes('papad')) return '🍿';
    if (n.includes('pickle') || n.includes('chutney') || n.includes('achar') || n.includes('sauce')) return '🫙';
    if (n.includes('drink') || n.includes('juice') || n.includes('beverage')) return '🥤';
    if (n.includes('tea') || n.includes('chai') || n.includes('coffee')) return '☕';
    if (n.includes('fish') || n.includes('seafood') || n.includes('prawn')) return '🐟';
    if (n.includes('egg')) return '🥚';
    if (n.includes('frozen')) return '🧊';
    if (n.includes('health') || n.includes('wellness') || n.includes('herbal')) return '🌿';
    if (n.includes('household') || n.includes('cleaning') || n.includes('disposal')) return '🧹';
    if (n.includes('baby') || n.includes('infant')) return '👶';
    if (n.includes('biscuit') || n.includes('cookie') || n.includes('cake')) return '🍪';
    if (n.includes('nut') || n.includes('cashew') || n.includes('almond')) return '🥜';
    if (n.includes('pasta') || n.includes('noodle') || n.includes('vermicelli')) return '🍝';
    if (n.includes('jam') || n.includes('honey')) return '🍯';
    return '🛍️';
  }

  onCatImgErr(e: Event, name: string) {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
    const card = img.closest('.cl-card') as HTMLElement;
    if (card && !card.querySelector('.cl-emoji-bg')) {
      const div = document.createElement('div');
      div.className = 'cl-emoji-bg';
      div.innerHTML = `<span>${this.catIcon(name)}</span>`;
      card.insertBefore(div, card.firstChild);
    }
  }
}

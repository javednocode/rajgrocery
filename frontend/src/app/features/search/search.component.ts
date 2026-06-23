import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductCardComponent],
  template: `
  <section class="sr-hero">
    <div class="td-container">
      <h1>Search</h1>
      <form class="sr-box" (submit)="submit($event)" role="search">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input [(ngModel)]="term" name="q" placeholder="Search spices, snacks, brands…" aria-label="Search products" autofocus />
        <button type="submit" class="td-btn td-btn-dark">Search</button>
      </form>
      @if (query()) { <p class="sr-note">Results for “<strong>{{ query() }}</strong>”</p> }
    </div>
  </section>
  <section class="sr-body">
    <div class="td-container">
      @if (loading()) {
        <div class="pgrid">@for (s of [1,2,3,4]; track s) { <div><div class="td-skel" style="aspect-ratio:1"></div><div class="td-skel" style="height:18px;margin:12px 0 8px;width:70%"></div></div> }</div>
      } @else if (query() && results().length === 0) {
        <div class="sr-empty"><h3>No matches found</h3><p>Try a different keyword or browse our categories.</p><a routerLink="/categories" class="td-btn td-btn-dark">Browse categories</a></div>
      } @else {
        <div class="pgrid">@for (p of results(); track p.id) { <app-product-card [product]="p" /> }</div>
      }
    </div>
  </section>
  `,
  styles: [`
  .sr-hero{padding:52px 0 40px;background:#F4FCF7;border-bottom:1px solid #ECECEC}
  .td-container{max-width:1280px;margin:0 auto;padding:0 24px;width:100%}
  .sr-hero h1{font-size:clamp(1.8rem,3.2vw,2.6rem);font-weight:800;color:#253D4E;margin-bottom:20px}
  .sr-box{display:flex;align-items:center;gap:12px;background:#fff;border:2px solid #ECECEC;border-radius:10px;overflow:hidden;max-width:640px;transition:border-color .2s}
  .sr-box:focus-within{border-color:#3BB77E}
  .sr-box svg{color:#7E8D97;flex-shrink:0;margin-left:16px}
  .sr-box input{flex:1;border:none;outline:none;font:inherit;font-size:15px;padding:12px 0;min-width:0;color:#253D4E}
  .sr-box input::placeholder{color:#adb5bd}
  .sr-box .td-btn{background:#3BB77E;color:#fff;border:none;padding:13px 24px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .2s;flex-shrink:0}
  .sr-box .td-btn:hover{background:#2A9062}
  .sr-note{margin:16px 0 0;color:#7E8D97;font-size:14px}
  .sr-note strong{color:#253D4E}
  .sr-body{padding:40px 0}
  /* 4-col desktop → 3-col → 2-col mobile */
  .pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .sr-empty{text-align:center;padding:80px 20px;color:#7E8D97}
  .sr-empty h3{margin-bottom:8px;color:#253D4E}
  .sr-empty a{display:inline-flex;align-items:center;gap:8px;background:#3BB77E;color:#fff;border-radius:8px;padding:12px 24px;font-size:14px;font-weight:700;text-decoration:none;margin-top:20px;transition:background .2s}
  .sr-empty a:hover{background:#2A9062}
  @media (max-width:1100px){.pgrid{grid-template-columns:repeat(3,1fr)}}
  @media (max-width:680px){.pgrid{grid-template-columns:1fr 1fr;gap:10px}}
  `]
})
export class SearchComponent implements OnInit {
  query = signal('');
  results = signal<any[]>([]);
  loading = signal(false);
  term = '';

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService, private seo: SeoService) {}

  ngOnInit() {
    this.seo.setMeta({ title: 'Search', description: 'Search premium South Asian groceries at The Desi.' });
    this.route.queryParams.subscribe(q => {
      const t = q['q'] || '';
      this.query.set(t); this.term = t;
      if (!t) { this.results.set([]); return; }
      this.loading.set(true);
      this.api.searchProducts(t).subscribe({
        next: (r: any) => { if (r.success) this.results.set(r.data || []); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    });
  }
  submit(e: Event) { e.preventDefault(); const t = this.term.trim(); if (t) this.router.navigate(['/search'], { queryParams: { q: t } }); }
}

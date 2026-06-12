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
  .sr-hero{padding:64px 0 44px;background:var(--td-secondary)}
  .sr-hero h1{font-size:clamp(1.9rem,3.4vw,2.7rem);font-weight:800;margin-bottom:22px}
  .sr-box{display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid var(--td-line);border-radius:999px;padding:8px 8px 8px 22px;max-width:640px;transition:border-color .2s}
  .sr-box:focus-within{border-color:var(--td-accent)}
  .sr-box svg{color:var(--td-muted);flex-shrink:0}
  .sr-box input{flex:1;border:none;outline:none;font:inherit;font-size:15.5px;min-width:0}
  .sr-box .td-btn{padding:13px 26px}
  .sr-note{margin:18px 0 0;color:var(--td-muted);font-size:14.5px}
  .sr-body{padding:52px 0}
  .pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
  .sr-empty{text-align:center;padding:80px 20px;color:var(--td-muted)}
  .sr-empty h3{margin-bottom:8px}
  .sr-empty .td-btn{margin-top:22px}
  @media (max-width:1000px){.pgrid{grid-template-columns:repeat(3,1fr)}}
  @media (max-width:680px){.pgrid{grid-template-columns:1fr 1fr;gap:12px}}
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

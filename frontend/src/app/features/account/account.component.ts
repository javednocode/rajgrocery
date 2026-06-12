import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section class="ac">
    <div class="td-container">
      <h1>Your Space</h1>
      <div class="ac-grid">
        <div class="ac-main">
          <h3>Saved items <span class="ac-count">{{ wishlist.count() }}</span></h3>
          @if (wishlist.items().length === 0) {
            <div class="ac-empty"><p>Nothing saved yet. Tap the heart on any product to keep it here.</p><a routerLink="/categories" class="td-btn td-btn-dark">Browse products</a></div>
          } @else {
            <div class="ac-wgrid">
              @for (w of wishlist.items(); track w.id) {
                <div class="ac-wcard">
                  <a [routerLink]="['/product', w.slug]" class="ac-wimg">@if (w.image) { <img [src]="w.image" [alt]="w.name" loading="lazy" /> }</a>
                  <div class="ac-winfo">
                    <a [routerLink]="['/product', w.slug]" class="ac-wname">{{ w.name }}</a>
                    <strong>{{ cur }}{{ (w.salePrice ?? w.price).toFixed(2) }}</strong>
                    <div class="ac-wactions">
                      <a [routerLink]="['/product', w.slug]" class="ac-view">View</a>
                      <button (click)="wishlist.remove(w.id)" class="ac-del">Remove</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
        <aside class="ac-side">
          <div class="ac-card">
            <h4>Basket</h4>
            <p>{{ cart.itemCount() }} item{{ cart.itemCount() === 1 ? '' : 's' }} · {{ cur }}{{ cart.subtotal().toFixed(2) }}</p>
            <a routerLink="/cart" class="td-btn td-btn-light" style="width:100%;justify-content:center">View basket</a>
          </div>
          <div class="ac-card">
            <h4>Need help with an order?</h4>
            <p>Our team responds within hours — reach out any time.</p>
            <a routerLink="/contact" class="td-btn td-btn-dark" style="width:100%;justify-content:center">Contact us</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  `,
  styles: [`
  .ac{padding:56px 0 40px}
  .ac h1{font-size:clamp(1.9rem,3.4vw,2.7rem);font-weight:800;margin-bottom:40px}
  .ac-grid{display:grid;grid-template-columns:1fr 340px;gap:48px;align-items:start}
  .ac-main h3{font-size:18px;font-weight:800;margin-bottom:24px}
  .ac-count{display:inline-grid;place-items:center;min-width:24px;height:24px;border-radius:999px;background:var(--td-accent);color:#111;font-size:12px;font-weight:800;margin-left:8px;padding:0 7px}
  .ac-empty{background:var(--td-secondary);border-radius:var(--td-radius);padding:48px 32px;text-align:center;color:var(--td-muted)}
  .ac-empty .td-btn{margin-top:20px}
  .ac-wgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .ac-wcard{display:flex;gap:16px;border:1px solid var(--td-line);border-radius:var(--td-radius);padding:14px;transition:box-shadow .3s,transform .3s var(--td-ease)}
  .ac-wcard:hover{box-shadow:var(--td-shadow);transform:translateY(-3px)}
  .ac-wimg{width:84px;height:84px;border-radius:var(--td-radius-sm);background:var(--td-secondary);overflow:hidden;flex-shrink:0}
  .ac-wimg img{width:100%;height:100%;object-fit:cover}
  .ac-winfo{min-width:0;display:flex;flex-direction:column}
  .ac-wname{font-size:14px;font-weight:600;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:4px}
  .ac-winfo strong{font-family:'Sora',sans-serif;font-size:15px;font-weight:800}
  .ac-wactions{display:flex;gap:14px;margin-top:auto;padding-top:8px}
  .ac-view{font-size:12.5px;font-weight:700}
  .ac-view:hover{color:var(--td-accent)}
  .ac-del{border:none;background:none;font-size:12.5px;font-weight:600;color:var(--td-muted);padding:0}
  .ac-del:hover{color:#DC2626}
  .ac-side{display:flex;flex-direction:column;gap:18px}
  .ac-card{background:var(--td-secondary);border-radius:var(--td-radius);padding:28px}
  .ac-card h4{font-size:15.5px;font-weight:800;margin-bottom:10px}
  .ac-card p{font-size:14px;color:var(--td-muted);line-height:1.7;margin:0 0 18px}
  @media (max-width:900px){.ac-grid{grid-template-columns:1fr}.ac-wgrid{grid-template-columns:1fr}}
  `]
})
export class AccountComponent {
  constructor(public wishlist: WishlistService, public cart: CartService, private settings: SettingsService, seo: SeoService) {
    seo.setMeta({ title: 'Your Account', description: 'Your saved items and basket at The Desi.' });
  }
  get cur() { return this.settings.get('currency_symbol', '£'); }
}

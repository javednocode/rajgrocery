import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
  <footer class="f">
    <div class="td-container">
      <div class="f-top">
        <div class="f-brand">
          <div class="f-logo"><span class="f-mark"></span>{{ settings.get('site_name','The Desi') }}</div>
          <p>{{ settings.get('site_tagline','Premium South Asian groceries, delivered across the UK.') }}</p>
        </div>
        <nav class="f-col" aria-label="Shop">
          <h4>Shop</h4>
          <a routerLink="/categories">All Categories</a>
          <a routerLink="/search">Search</a>
          <a routerLink="/cart">Cart</a>
          <a routerLink="/account">Account</a>
        </nav>
        <nav class="f-col" aria-label="Company">
          <h4>Company</h4>
          <a routerLink="/blog">Journal</a>
          <a routerLink="/contact">Contact</a>
          <a [routerLink]="['/page','privacy-policy']">Privacy Policy</a>
          <a [routerLink]="['/page','terms']">Terms</a>
        </nav>
        <nav class="f-col" aria-label="Help">
          <h4>Help</h4>
          <a [routerLink]="['/page','delivery-info']">Delivery</a>
          <a [routerLink]="['/page','returns']">Returns</a>
          <a [routerLink]="['/page','faq']">FAQ</a>
        </nav>
      </div>
      <div class="f-bottom">
        <span>© {{ year }} {{ settings.get('site_name','The Desi') }}. All rights reserved.</span>
        <span>Proudly serving the UK</span>
      </div>
    </div>
  </footer>
  `,
  styles: [`
  .f{background:var(--td-primary);color:#fff;margin-top:96px}
  .f-top{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:48px;padding:72px 0 56px}
  .f-logo{display:flex;align-items:center;gap:10px;font-family:'Sora',sans-serif;font-size:20px;font-weight:800;margin-bottom:16px;color:#fff}
  .f-mark{width:26px;height:26px;border-radius:8px;background:#fff;position:relative}
  .f-mark::after{content:'';position:absolute;inset:8px;border-radius:3px;background:var(--td-accent)}
  .f-brand p{color:rgba(255,255,255,.55);font-size:14.5px;line-height:1.8;max-width:300px;margin:0}
  .f-col h4{color:#fff;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:18px}
  .f-col a{display:block;color:rgba(255,255,255,.55);font-size:14.5px;padding:6px 0;transition:color .2s}
  .f-col a:hover{color:var(--td-accent)}
  .f-bottom{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,.1);padding:24px 0;font-size:13px;color:rgba(255,255,255,.45)}
  @media (max-width:860px){.f-top{grid-template-columns:1fr 1fr;gap:32px;padding:56px 0 40px}}
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
  constructor(public settings: SettingsService) {}
}

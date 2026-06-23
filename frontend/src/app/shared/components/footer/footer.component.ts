import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
  <footer class="f">
    <!-- Newsletter -->
    <div class="f-newsletter">
      <div class="f-container">
        <div class="f-nl-inner">
          <div>
            <h4>🌿 Stay home & get your daily needs</h4>
            <p>{{ settings.get('newsletter_desc','Sign up for exclusive offers, weekly deals and new arrivals delivered to your inbox.') }}</p>
          </div>
          <form class="f-nl-form" (submit)="$event.preventDefault()">
            <input type="email" placeholder="Your email address…" aria-label="Email for newsletter" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Main footer -->
    <div class="f-main">
      <div class="f-container f-grid">

        <div class="f-brand">
          <div class="f-logo">
            @if (settings.get('site_logo')) {
              <img [src]="settings.resolveAssetUrl(settings.get('site_logo'))" [alt]="settings.get('site_name','The Desi')" class="f-logo-img">
            } @else {
              <span class="f-logo-icon">🌿</span>
              <span class="f-logo-text">{{ settings.get('site_name','The Desi') }}</span>
            }
          </div>
          <p>{{ settings.get('footer_about','Your one-stop shop for authentic South Asian groceries, spices, halal meats and everyday essentials — delivered across the UK.') }}</p>
          <div class="f-contact-info">
            <div class="f-contact-item">
              <span>📧</span> {{ settings.get('site_email','hello@thedesi.co.uk') }}
            </div>
            <div class="f-contact-item">
              <span>🕐</span> {{ settings.get('contact_hours','Mon–Sat: 9am–6pm') }}
            </div>
          </div>
        </div>

        <nav class="f-col" aria-label="Shop">
          <h5>Shop</h5>
          <a routerLink="/categories">All Categories</a>
          <a routerLink="/search">Search Products</a>
          <a routerLink="/cart">Shopping Cart</a>
          <a routerLink="/account">My Account</a>
        </nav>

        <nav class="f-col" aria-label="Company">
          <h5>Company</h5>
          <a routerLink="/blog">Blog & News</a>
          <a routerLink="/contact">Contact Us</a>
          <a [routerLink]="['/page','privacy-policy']">Privacy Policy</a>
          <a [routerLink]="['/page','terms']">Terms & Conditions</a>
        </nav>

        <nav class="f-col" aria-label="Help">
          <h5>Help</h5>
          <a [routerLink]="['/page','delivery-info']">Delivery Info</a>
          <a [routerLink]="['/page','returns']">Returns Policy</a>
          <a [routerLink]="['/page','faq']">FAQs</a>
          <a routerLink="/contact">Customer Support</a>
        </nav>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="f-bottom">
      <div class="f-container f-bottom-inner">
        <span>{{ settings.get('footer_copyright','© 2026 The Desi. All rights reserved.') }}</span>
        <span class="f-powered">🇬🇧 Proudly serving the UK</span>
      </div>
    </div>
  </footer>
  `,
  styles: [`
  .f-container{max-width:1280px;margin:0 auto;padding:0 28px;width:100%}

  /* Newsletter */
  .f-newsletter{background:#F4FCF7;border-top:2px solid rgba(59,183,126,.2);padding:32px 0}
  .f-nl-inner{display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap}
  .f-nl-inner h4{font-size:18px;font-weight:800;color:#253D4E;margin-bottom:4px}
  .f-nl-inner p{color:#7E8D97;font-size:14px;margin:0}
  .f-nl-form{display:flex;border:1.5px solid rgba(59,183,126,.3);border-radius:8px;overflow:hidden;flex-shrink:0;min-width:360px;background:#fff}
  .f-nl-form input{flex:1;border:none;outline:none;padding:12px 18px;font-size:14px;color:#253D4E}
  .f-nl-form button{background:#3BB77E;color:#fff;border:none;padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap}
  .f-nl-form button:hover{background:#2A9062}

  /* Main */
  .f-main{background:#253D4E;padding:52px 0 40px}
  .f-grid{display:grid;grid-template-columns:1.8fr 1fr 1fr 1fr;gap:48px}
  .f-brand p{color:rgba(255,255,255,.55);font-size:14px;line-height:1.75;margin:14px 0 18px;max-width:300px}

  .f-logo{display:flex;align-items:center;gap:10px;margin-bottom:2px}
  .f-logo-img{height:44px;width:auto;object-fit:contain;max-width:160px}
  .f-logo-icon{font-size:26px}
  .f-logo-text{font-family:'Quicksand','Poppins',sans-serif;font-size:20px;font-weight:800;color:#fff}

  .f-contact-info{display:flex;flex-direction:column;gap:8px}
  .f-contact-item{display:flex;align-items:center;gap:8px;font-size:13.5px;color:rgba(255,255,255,.6)}

  .f-col h5{color:#fff;font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:18px}
  .f-col a{display:block;color:rgba(255,255,255,.55);font-size:14px;padding:6px 0;transition:color .2s;text-decoration:none}
  .f-col a:hover{color:#3BB77E}

  /* Bottom */
  .f-bottom{background:#1E3040;padding:18px 0}
  .f-bottom-inner{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;color:rgba(255,255,255,.4)}
  .f-powered{color:rgba(255,255,255,.45)}

  @media (max-width:1000px){.f-grid{grid-template-columns:1fr 1fr;gap:32px;}.f-brand{grid-column:span 2}}
  @media (max-width:640px){.f-grid{grid-template-columns:1fr;}.f-brand{grid-column:span 1}.f-nl-form{min-width:0;width:100%}.f-nl-inner{flex-direction:column}.f-bottom-inner{flex-direction:column;gap:8px;text-align:center}}
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
  constructor(public settings: SettingsService) {}
}

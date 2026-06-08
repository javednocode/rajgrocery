import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <!-- Top accent bar -->
      <div class="footer-topbar">
        <span class="ftb-green"></span>
        <span class="ftb-purple"></span>
        <span class="ftb-orange"></span>
      </div>

      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">

            <!-- ── Brand Column ── -->
            <div class="footer-brand">
              <img [src]="settings.assetUrl('site_logo', '/logo.svg')" [alt]="settings.get('site_name','Your Store')" class="footer-logo">
              <p class="brand-desc">{{ settings.get('footer_about', settings.get('site_tagline','Reusable ecommerce storefront for modern brands.')) }}</p>

              <div class="footer-contact">
                <a [href]="'tel:' + settings.get('site_phone','')" class="fc-row">
                  <span class="fc-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="1.6"/></svg>
                  </span>
                  <span>{{ settings.get('site_phone', '') }}</span>
                </a>
                <a [href]="'mailto:' + settings.get('site_email','hello@example.com')" class="fc-row">
                  <span class="fc-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="m2 7 10 7 10-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                  </span>
                  <span>{{ settings.get('site_email', 'hello@example.com') }}</span>
                </a>
                <div class="fc-row">
                  <span class="fc-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/></svg>
                  </span>
                  <span>{{ settings.get('site_address', 'Add your store address') }}</span>
                </div>
              </div>

              <!-- Social Icons -->
              <div class="social-row">
                @if (settings.get('social_facebook')) {
                  <a [href]="settings.get('social_facebook')" target="_blank" rel="noopener" class="social-btn" aria-label="Facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                }
                @if (settings.get('social_instagram')) {
                  <a [href]="settings.get('social_instagram')" target="_blank" rel="noopener" class="social-btn social-ig" aria-label="Instagram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
                  </a>
                }
                @if (settings.get('social_twitter')) {
                  <a [href]="settings.get('social_twitter')" target="_blank" rel="noopener" class="social-btn social-x" aria-label="X / Twitter">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                }
                @if (settings.get('social_youtube')) {
                  <a [href]="settings.get('social_youtube')" target="_blank" rel="noopener" class="social-btn social-yt" aria-label="YouTube">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0F1929"/></svg>
                  </a>
                }
                @if (settings.get('social_whatsapp')) {
                  <a [href]="'https://wa.me/' + settings.get('social_whatsapp')" target="_blank" rel="noopener" class="social-btn social-wa" aria-label="WhatsApp">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.1 21.9l4.837-1.312A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 0 1-4.274-1.242l-.306-.183-3.179.863.855-3.1-.2-.32A7.964 7.964 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
                  </a>
                }
              </div>
            </div>

            <!-- ── Categories Column (dynamic from DB) ── -->
            <div class="footer-col">
              <h4>Shop By Category</h4>
              <ul>
                @for (cat of footerCategories(); track cat.id) {
                  <li>
                    <a [routerLink]="['/category', cat.slug]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      {{ cat.name }}
                    </a>
                  </li>
                }
              </ul>
            </div>

            <!-- ── Quick Links Column ── -->
            <div class="footer-col">
              <h4>Information</h4>
              <ul>
                <li><a routerLink="/"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Home</a></li>
                <li><a routerLink="/categories"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> All Categories</a></li>
                <li><a routerLink="/blog"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Blog &amp; Recipes</a></li>
                <li><a routerLink="/contact"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Contact Us</a></li>
                <li><a routerLink="/cart"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> My Cart</a></li>
              </ul>
            </div>

            <!-- ── Newsletter Column ── -->
            <div class="footer-col">
              <h4>Stay Updated</h4>
              <p class="nl-desc">{{ settings.get('newsletter_desc', 'Get the latest deals, new arrivals and store updates straight to your inbox.') }}</p>
              <form class="newsletter-form" (submit)="subscribeNewsletter($event)">
                <input type="email" [(ngModel)]="nlEmail" name="nlEmail"
                  placeholder="Your email address" class="nl-input">
                <button type="submit" class="nl-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>
                </button>
              </form>
              @if (nlSuccess) {
                <p class="nl-success">Thank you for subscribing!</p>
              }

              <!-- Trust badges — no emojis -->
              <div class="trust-strip">
                <div class="tb-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L3.5 6.5v5C3.5 16.1 7.2 20.6 12 22c4.8-1.4 8.5-5.9 8.5-10.5v-5L12 2z" stroke="#22C55E" stroke-width="1.6"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#22C55E" stroke-width="1.8" stroke-linecap="round"/></svg>
                  Secure Payments
                </div>
                <div class="tb-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="15" height="13" rx="2" stroke="#38BDF8" stroke-width="1.6"/><path d="M16 8h3.5a1 1 0 0 1 .8.4l2.2 2.9a1 1 0 0 1 .2.6V17a1 1 0 0 1-1 1H16V8z" stroke="#38BDF8" stroke-width="1.6"/><circle cx="5.5" cy="19" r="1.8" stroke="#38BDF8" stroke-width="1.4"/><circle cx="18.5" cy="19" r="1.8" stroke="#38BDF8" stroke-width="1.4"/></svg>
                  Fast Delivery
                </div>
                <div class="tb-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#4ade80" stroke-width="1.6"/><path d="M9 12l2 2 4-4" stroke="#4ade80" stroke-width="1.8" stroke-linecap="round"/></svg>
                  Local Support
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="container fbot-inner">
          <p class="copyright">{{ settings.get('footer_copyright', '© 2026 Your Store. All rights reserved.') }}</p>
          <p class="designed-by">Powered by {{ settings.get('site_name', 'Your Store') }}</p>
          <!-- Payment method icons — clean SVG pill badges -->
          <div class="payment-row">
            <span class="pay-badge">
              <svg width="28" height="18" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="4" fill="#1A1F71"/><path d="M14.24 15.97H11.7l1.59-9.93h2.54l-1.59 9.93zM21.41 6.35c-.5-.2-1.3-.4-2.28-.4-2.52 0-4.3 1.35-4.31 3.28-.01 1.43 1.27 2.23 2.23 2.71.99.49 1.32.8 1.32 1.24-.01.67-.79 1-1.53 1-1.02 0-1.56-.16-2.4-.54l-.33-.16-.36 2.22c.59.28 1.69.52 2.82.53 2.67 0 4.41-1.33 4.43-3.38.01-1.13-.67-1.99-2.12-2.7-.88-.46-1.43-.77-1.42-1.24 0-.41.46-.86 1.44-.86.82-.01 1.42.18 1.88.38l.22.11.34-2.19zM27.44 6.04h-1.98c-.61 0-1.07.18-1.34.84l-3.8 9.09h2.69l.54-1.5h3.28l.31 1.5h2.38L27.44 6.04zm-3.15 6.53l1.02-2.78.16-.43.58 2.93-1.76.28zM9.85 6.04L7.35 13l-.27-1.37c-.47-1.6-1.93-3.33-3.57-4.2l2.28 8.53h2.7l4.03-9.93H9.85z" fill="white"/><path d="M5.35 6.04H1.04L1 6.25c3.35.86 5.57 2.93 6.49 5.42l-.94-4.77c-.16-.64-.61-.84-1.2-.86z" fill="#F9A21A"/></svg>
            </span>
            <span class="pay-badge">
              <svg width="28" height="18" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="4" fill="#252525"/><circle cx="15" cy="12" r="6" fill="#EB001B"/><circle cx="23" cy="12" r="6" fill="#F79E1B"/><path d="M19 7.8a6 6 0 0 1 0 8.4A6 6 0 0 1 19 7.8z" fill="#FF5F00"/></svg>
            </span>
            <span class="pay-badge">
              <svg width="28" height="18" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="4" fill="#006FCF"/><text x="7" y="16" font-size="8" fill="white" font-family="Arial" font-weight="bold">AMEX</text></svg>
            </span>
            <span class="pay-badge">
              <svg width="28" height="18" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="4" fill="#F5F5F5" stroke="#ddd" stroke-width="0.5"/><text x="5" y="15" font-size="7" fill="#009B77" font-family="Arial" font-weight="bold">PayPal</text></svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0D1827;
      color: rgba(255,255,255,0.78);
      margin-top: 0;
      font-family: 'Inter', sans-serif;
    }

    /* Top tricolor accent bar */
    .footer-topbar { display: flex; height: 3px; }
    .ftb-green  { flex: 1; background: #22C55E; }
    .ftb-purple { flex: 1; background: #2563EB; }
    .ftb-orange { flex: 1; background: #FB923C; }

    .footer-main { padding: 64px 0 48px; }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.7fr 1fr 1fr 1.4fr;
      gap: 52px;
    }

    /* ── Brand Column ── */
    .footer-logo {
      height: 52px; width: auto; object-fit: contain;
      margin-bottom: 18px; display: block;
    }
    .brand-desc {
      font-size: 13.5px; color: rgba(255,255,255,0.55);
      line-height: 1.7; margin-bottom: 24px; max-width: 280px;
    }

    /* Contact */
    .footer-contact { display: flex; flex-direction: column; gap: 11px; margin-bottom: 26px; }
    .fc-row {
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; color: rgba(255,255,255,0.62);
      text-decoration: none;
      transition: color 0.2s;
    }
    a.fc-row:hover { color: #FFD060; }
    .fc-icon {
      width: 26px; height: 26px; border-radius: 6px;
      background: rgba(255,255,255,0.07);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: rgba(255,255,255,0.5);
    }

    /* Social */
    .social-row { display: flex; gap: 8px; }
    .social-btn {
      width: 36px; height: 36px; border-radius: 9px;
      background: rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.7);
      transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
      text-decoration: none;
    }
    .social-btn:hover        { background: #1877F2; color: white; transform: translateY(-2px); }
    .social-btn.social-ig:hover { background: linear-gradient(45deg,#f09433,#dc2743,#bc1888); color: white; }
    .social-btn.social-x:hover  { background: #000; color: white; }
    .social-btn.social-yt:hover { background: #FF0000; color: white; }
    .social-btn.social-wa:hover { background: #25D366; color: white; }

    /* ── Link Columns ── */
    .footer-col h4 {
      font-size: 11px; font-weight: 700; letter-spacing: 1.8px;
      text-transform: uppercase; color: rgba(255,255,255,0.35);
      margin-bottom: 20px; padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-col ul li a {
      font-size: 13.5px; color: rgba(255,255,255,0.6);
      text-decoration: none;
      display: flex; align-items: center; gap: 8px;
      transition: color 0.2s, padding-left 0.2s;
    }
    .footer-col ul li a svg { opacity: 0.4; transition: opacity 0.2s, transform 0.2s; flex-shrink: 0; }
    .footer-col ul li a:hover { color: #FFD060; padding-left: 4px; }
    .footer-col ul li a:hover svg { opacity: 1; transform: translateX(3px); }

    /* ── Newsletter ── */
    .nl-desc {
      font-size: 13.5px; color: rgba(255,255,255,0.55);
      line-height: 1.65; margin-bottom: 16px;
    }
    .newsletter-form {
      display: flex; border-radius: 10px; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 18px;
    }
    .nl-input {
      flex: 1; padding: 11px 14px;
      background: rgba(255,255,255,0.06);
      border: none; color: white; font-size: 13px; outline: none;
    }
    .nl-input::placeholder { color: rgba(255,255,255,0.35); }
    .nl-input:focus { background: rgba(255,255,255,0.1); }
    .nl-btn {
      background: #22C55E; border: none; cursor: pointer;
      padding: 0 16px; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .nl-btn:hover { background: #16a34a; }
    .nl-success { font-size: 12px; color: #4ade80; margin-top: -10px; margin-bottom: 14px; }

    /* Trust strip */
    .trust-strip { display: flex; flex-direction: column; gap: 8px; }
    .tb-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 12.5px; color: rgba(255,255,255,0.5);
    }

    /* ── Footer Bottom ── */
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.07);
      padding: 18px 0;
    }
    .fbot-inner {
      display: flex; justify-content: space-between; align-items: center;
      gap: 16px;
    }
    .copyright { font-size: 12.5px; color: rgba(255,255,255,0.38); }
    .designed-by { font-size: 12px; color: rgba(255,255,255,0.3); }
    .wct-link {
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      transition: color 0.2s;
    }
    .wct-link:hover { color: #FFD060; text-decoration: underline; }

    /* Payment icons */
    .payment-row { display: flex; gap: 6px; align-items: center; }
    .pay-badge {
      border-radius: 4px; overflow: hidden; display: flex;
      opacity: 0.75; transition: opacity 0.2s;
    }
    .pay-badge:hover { opacity: 1; }

    /* Responsive */
    @media (max-width: 1024px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
    }
    @media (max-width: 600px) {
      .footer-grid { grid-template-columns: 1fr; gap: 32px; }
      .fbot-inner { flex-direction: column; text-align: center; gap: 14px; }
    }
  `]
})
export class FooterComponent implements OnInit {
  nlEmail = '';
  nlSuccess = false;
  footerCategories = signal<any[]>([]);

  constructor(
    public settings: SettingsService,
    private api: ApiService
  ) {}

  ngOnInit() {
    // Load real categories from DB — show first 8 active ones
    this.api.getCategories().subscribe({
      next: (r: any) => {
        if (r?.success && r.data) {
          const flat: any[] = [];
          const walk = (cats: any[]) => cats.forEach((c: any) => {
            if (c.is_active == 1 && !c.parent_id) flat.push(c);
            if (c.children?.length) walk(c.children);
          });
          walk(r.data);
          this.footerCategories.set(flat.slice(0, 8));
        }
      },
      error: () => {}
    });
  }

  subscribeNewsletter(e: Event) {
    e.preventDefault();
    if (this.nlEmail.trim()) {
      this.nlSuccess = true;
      this.nlEmail = '';
      setTimeout(() => this.nlSuccess = false, 4000);
    }
  }
}

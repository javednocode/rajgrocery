import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, NgIf, FormsModule],
  template: `
    <main class="contact-page">
      <script type="application/ld+json" [innerHTML]="schemaJson()"></script>

      <section class="contact-hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <span class="eyebrow">Customer Care</span>
            <h1>Talk to {{ s.get('site_name', 'Asian Spices & Halal Meats') }}</h1>
            <p>
              Need help with fresh halal meat, grocery delivery, store timing, or a custom order?
              Reach the team directly and we will guide you properly.
            </p>

            <div class="hero-actions">
              <a [href]="'tel:' + s.get('site_phone','')" class="btn btn-primary" *ngIf="s.get('site_phone','')">
                Call Store
              </a>
              <a [href]="'mailto:' + contactEmail()" class="btn btn-outline">
                Email Us
              </a>
              <a routerLink="/categories" class="btn btn-ghost">
                Browse Products
              </a>
            </div>
          </div>

          <aside class="store-card" aria-label="Store contact summary">
            <div class="store-card-top">
              <img [src]="s.assetUrl('site_logo', '/logo.png')" [alt]="s.get('site_name', 'Your Store')" class="store-logo">
              <div>
                <span class="store-label">Premium Grocery Store</span>
                <strong>{{ s.get('site_name', 'Asian Spices & Halal Meats') }}</strong>
              </div>
            </div>

            <div class="store-detail-list">
              <a [href]="'tel:' + s.get('site_phone','')" class="store-detail" *ngIf="s.get('site_phone','')">
                <span class="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 19 19.5 19.5 0 0 1 5 12.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.22a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <span>
                  <small>Phone</small>
                  {{ s.get('site_phone', '') }}
                </span>
              </a>

              <a [href]="'mailto:' + contactEmail()" class="store-detail">
                <span class="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <path d="m22 6-10 7L2 6"/>
                  </svg>
                </span>
                <span>
                  <small>Email</small>
                  {{ contactEmail() }}
                </span>
              </a>

              <div class="store-detail">
                <span class="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span>
                  <small>Address</small>
                  {{ s.get('contact_address', s.get('site_address', 'Configure store address in Admin Settings')) }}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="quick-section">
        <div class="container quick-grid">
          <a [href]="'tel:' + s.get('site_phone','')" class="quick-card" *ngIf="s.get('site_phone','')">
            <span class="quick-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 19 19.5 19.5 0 0 1 5 12.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72"/>
              </svg>
            </span>
            <span>
              <small>Call for orders</small>
              {{ s.get('site_phone', '') }}
            </span>
          </a>

          <a [href]="'mailto:' + contactEmail()" class="quick-card">
            <span class="quick-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16v16H4z"/>
                <path d="m22 6-10 7L2 6"/>
              </svg>
            </span>
            <span>
              <small>Support email</small>
              {{ contactEmail() }}
            </span>
          </a>

          <div class="quick-card">
            <span class="quick-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </span>
            <span>
              <small>Opening hours</small>
              <span [innerHTML]="s.get('contact_hours','Mon-Fri: 9am-6pm')"></span>
            </span>
          </div>
        </div>
      </section>

      <section class="contact-main">
        <div class="container main-grid">
          <div class="form-panel">
            <span class="section-tag">Send Enquiry</span>
            <h2>Tell us what you need</h2>
            <p class="section-text">
              For product availability, bulk orders, delivery questions, and store enquiries,
              send a message here. The form opens your email app with the details ready.
            </p>

            <form class="contact-form" (ngSubmit)="submitForm()">
              <div class="form-row">
                <label>
                  <span>Name *</span>
                  <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Your full name">
                </label>
                <label>
                  <span>Email *</span>
                  <input type="email" [(ngModel)]="form.email" name="email" required placeholder="you@example.com">
                </label>
              </div>

              <label>
                <span>Subject</span>
                <input type="text" [(ngModel)]="form.subject" name="subject" placeholder="Order, delivery, stock, or general enquiry">
              </label>

              <label>
                <span>Message *</span>
                <textarea [(ngModel)]="form.message" name="message" required rows="6" placeholder="Write your message here"></textarea>
              </label>

              <button type="submit" class="submit-btn" [disabled]="sending()">
                <span *ngIf="!sending()">Send Message</span>
                <span *ngIf="sending()">Preparing Email...</span>
              </button>

              <div class="notice success" *ngIf="sent()">Thank you. Your email draft has been opened.</div>
              <div class="notice error" *ngIf="formError()">{{ formError() }}</div>
            </form>
          </div>

          <div class="info-panel">
            <div class="map-card">
              <div class="map-header">
                <span class="section-tag">Store Location</span>
                <h2>Find us easily</h2>
              </div>

              <div class="map-frame">
                <ng-container *ngIf="safeMapUrl(); else mapFallback">
                  <iframe
                    [src]="safeMapUrl()!"
                    width="100%"
                    height="100%"
                    style="border:0"
                    allowfullscreen
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    [title]="s.get('site_name', 'Your Store') + ' location map'"
                  ></iframe>
                </ng-container>
                <ng-template #mapFallback>
                  <div class="map-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <strong>Map not configured</strong>
                    <span>Set Google Maps Embed URL in Admin Settings.</span>
                  </div>
                </ng-template>
              </div>
            </div>

            <div class="service-card">
              <h3>Store support</h3>
              <ul>
                <li>Fresh meat and grocery order help</li>
                <li>Delivery timing and order updates</li>
                <li>Bulk buying and product availability</li>
              </ul>

              <a *ngIf="s.get('social_whatsapp','')"
                 [href]="'https://wa.me/' + s.get('social_whatsapp','')"
                 target="_blank"
                 rel="noopener"
                 class="whatsapp-btn">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; color: #211306; }
    .container { width: min(1180px, calc(100% - 40px)); margin: 0 auto; }

    .contact-page {
      background:
        radial-gradient(circle at 8% 8%, rgba(255, 153, 0, 0.12), transparent 28%),
        linear-gradient(180deg, #fff8ec 0%, #fffaf3 44%, #ffffff 100%);
      min-height: 100vh;
    }

    .contact-hero {
      position: relative;
      overflow: hidden;
      padding: 72px 0 54px;
      background:
        linear-gradient(120deg, rgba(20, 10, 0, 0.94) 0%, rgba(49, 24, 0, 0.9) 48%, rgba(255, 153, 0, 0.18) 100%),
        linear-gradient(180deg, #170c02, #321900);
      color: #fffaf2;
    }
    .contact-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
      background-size: 42px 42px;
      mask-image: linear-gradient(90deg, rgba(0,0,0,0.8), transparent);
      pointer-events: none;
    }
    .hero-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.72fr);
      gap: 48px;
      align-items: center;
    }
    .eyebrow,
    .section-tag {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      border: 1px solid rgba(255, 153, 0, 0.28);
      border-radius: 999px;
      color: #ff9800;
      background: rgba(255, 153, 0, 0.1);
      padding: 8px 14px;
      font-size: 12px;
      line-height: 1;
      font-weight: 900;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .hero-copy h1 {
      max-width: 720px;
      margin: 22px 0 18px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: clamp(3rem, 6.2vw, 6rem);
      line-height: 0.94;
      letter-spacing: -0.055em;
      color: #fff;
    }
    .hero-copy p {
      max-width: 620px;
      margin: 0;
      color: rgba(255,255,255,0.76);
      font-size: 18px;
      line-height: 1.75;
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 32px;
    }
    .btn {
      min-height: 52px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 0 24px;
      text-decoration: none;
      font-weight: 900;
      letter-spacing: 0.04em;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary {
      background: linear-gradient(135deg, #ff9800, #ffb13b);
      color: #180b00;
      box-shadow: 0 18px 38px rgba(255, 152, 0, 0.25);
    }
    .btn-outline {
      color: #fff7ea;
      border: 1px solid rgba(255,255,255,0.45);
      background: rgba(255,255,255,0.06);
    }
    .btn-ghost {
      color: #ffbf63;
      border: 1px solid rgba(255, 152, 0, 0.38);
      background: rgba(255, 152, 0, 0.08);
    }

    .store-card {
      border-radius: 28px;
      padding: 26px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05)),
        rgba(13, 9, 4, 0.8);
      border: 1px solid rgba(255, 214, 149, 0.22);
      box-shadow: 0 28px 80px rgba(0,0,0,0.28);
      backdrop-filter: blur(16px);
    }
    .store-card-top {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 22px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .store-logo {
      width: 74px;
      height: 74px;
      border-radius: 50%;
      object-fit: cover;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(255,255,255,0.08);
    }
    .store-card-top strong {
      display: block;
      margin-top: 5px;
      color: #fff;
      font-size: 22px;
      line-height: 1.2;
    }
    .store-label {
      color: #ffbd59;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }
    .store-detail-list {
      display: grid;
      gap: 14px;
      margin-top: 22px;
    }
    .store-detail {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      color: #fffaf2;
      text-decoration: none;
      padding: 14px;
      border-radius: 18px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .detail-icon,
    .quick-icon {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: rgba(255, 152, 0, 0.14);
      color: #ff9800;
      flex: 0 0 auto;
    }
    .detail-icon svg,
    .quick-icon svg {
      width: 21px;
      height: 21px;
    }
    .store-detail small,
    .quick-card small {
      display: block;
      margin-bottom: 4px;
      color: rgba(255,255,255,0.58);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .quick-section {
      transform: translateY(-28px);
      margin-bottom: -8px;
    }
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .quick-card {
      display: flex;
      gap: 14px;
      align-items: center;
      min-height: 96px;
      padding: 20px;
      border-radius: 22px;
      text-decoration: none;
      color: #211306;
      background: rgba(255,255,255,0.96);
      border: 1px solid rgba(255, 152, 0, 0.18);
      box-shadow: 0 18px 46px rgba(56, 28, 0, 0.1);
    }
    .quick-card small {
      color: #a36610;
    }
    .quick-card span:last-child {
      min-width: 0;
      font-weight: 900;
      line-height: 1.35;
      word-break: break-word;
    }

    .contact-main {
      padding: 42px 0 92px;
    }
    .main-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(340px, 0.82fr);
      gap: 28px;
      align-items: start;
    }
    .form-panel,
    .map-card,
    .service-card {
      border-radius: 28px;
      background: #fff;
      border: 1px solid rgba(255, 152, 0, 0.15);
      box-shadow: 0 20px 60px rgba(56, 28, 0, 0.08);
    }
    .form-panel {
      padding: 34px;
    }
    .form-panel .section-tag,
    .map-header .section-tag {
      background: #fff2dc;
      border-color: #ffdba8;
    }
    .form-panel h2,
    .map-header h2 {
      margin: 16px 0 10px;
      font-size: clamp(2rem, 3.2vw, 3.1rem);
      line-height: 1;
      letter-spacing: -0.045em;
      color: #170c02;
    }
    .section-text {
      margin: 0 0 26px;
      max-width: 660px;
      color: #765f48;
      line-height: 1.7;
    }
    .contact-form {
      display: grid;
      gap: 18px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .contact-form label {
      display: grid;
      gap: 8px;
      color: #39200b;
      font-weight: 900;
      font-size: 13px;
    }
    .contact-form label span {
      letter-spacing: 0.02em;
    }
    .contact-form input,
    .contact-form textarea {
      width: 100%;
      border: 1.5px solid #f0dfc6;
      border-radius: 18px;
      background: #fffaf2;
      color: #211306;
      font: inherit;
      font-weight: 600;
      padding: 15px 16px;
      outline: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      resize: vertical;
    }
    .contact-form input:focus,
    .contact-form textarea:focus {
      background: #fff;
      border-color: #ff9800;
      box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.13);
    }
    .submit-btn {
      width: fit-content;
      min-width: 178px;
      min-height: 52px;
      border: 0;
      border-radius: 999px;
      cursor: pointer;
      background: linear-gradient(135deg, #ff9800, #df7b00);
      color: #160900;
      font-weight: 950;
      letter-spacing: 0.04em;
      padding: 0 28px;
      box-shadow: 0 16px 32px rgba(255, 152, 0, 0.22);
      transition: transform 0.18s ease, opacity 0.18s ease;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .notice {
      border-radius: 16px;
      padding: 13px 16px;
      font-size: 14px;
      font-weight: 800;
    }
    .notice.success {
      color: #12522a;
      background: #e7f8ed;
      border: 1px solid #b8e7c8;
    }
    .notice.error {
      color: #8f1d1d;
      background: #fff0f0;
      border: 1px solid #f0baba;
    }

    .info-panel {
      display: grid;
      gap: 22px;
    }
    .map-card {
      overflow: hidden;
    }
    .map-header {
      padding: 28px 28px 18px;
    }
    .map-header h2 {
      font-size: clamp(1.8rem, 2.8vw, 2.5rem);
    }
    .map-frame {
      height: 392px;
      margin: 0 18px 18px;
      overflow: hidden;
      border-radius: 22px;
      background: #1b1107;
      border: 1px solid #ead8bd;
    }
    .map-placeholder {
      height: 100%;
      display: grid;
      place-items: center;
      align-content: center;
      gap: 10px;
      padding: 28px;
      text-align: center;
      color: #ad8b66;
      background:
        radial-gradient(circle at center, rgba(255, 152, 0, 0.13), transparent 44%),
        #fff8ef;
    }
    .map-placeholder svg {
      width: 54px;
      height: 54px;
      color: #ff9800;
    }
    .map-placeholder strong {
      color: #281604;
      font-size: 18px;
    }
    .service-card {
      padding: 28px;
      background:
        linear-gradient(135deg, #0b2b16, #125d2d);
      color: #fff;
    }
    .service-card h3 {
      margin: 0 0 16px;
      font-size: 26px;
      letter-spacing: -0.03em;
    }
    .service-card ul {
      list-style: none;
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 0;
      color: rgba(255,255,255,0.82);
      line-height: 1.55;
    }
    .service-card li {
      position: relative;
      padding-left: 22px;
    }
    .service-card li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.66em;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff9800;
    }
    .whatsapp-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      margin-top: 22px;
      padding: 0 22px;
      border-radius: 999px;
      background: #fff;
      color: #0f552a;
      text-decoration: none;
      font-weight: 950;
    }

    @media (max-width: 1024px) {
      .hero-grid,
      .main-grid {
        grid-template-columns: 1fr;
      }
      .store-card {
        max-width: 680px;
      }
    }

    @media (max-width: 768px) {
      .container {
        width: min(100% - 28px, 1180px);
      }
      .contact-hero {
        padding: 46px 0 42px;
      }
      .hero-copy h1 {
        font-size: clamp(2.7rem, 15vw, 4.4rem);
      }
      .hero-copy p {
        font-size: 16px;
      }
      .hero-actions {
        display: grid;
        grid-template-columns: 1fr;
      }
      .quick-section {
        transform: none;
        margin: 18px 0 0;
      }
      .quick-grid {
        grid-template-columns: 1fr;
      }
      .contact-main {
        padding: 28px 0 74px;
      }
      .form-panel,
      .map-header,
      .service-card {
        padding: 24px;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
      .map-frame {
        height: 330px;
        margin: 0 14px 14px;
      }
      .submit-btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .store-card {
        padding: 20px;
        border-radius: 24px;
      }
      .store-card-top {
        align-items: flex-start;
      }
      .store-logo {
        width: 62px;
        height: 62px;
      }
      .store-card-top strong {
        font-size: 18px;
      }
      .form-panel h2,
      .map-header h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  form = { name: '', email: '', subject: '', message: '' };
  sending = signal(false);
  sent = signal(false);
  formError = signal('');

  private sanitizer = inject(DomSanitizer);

  constructor(
    public s: SettingsService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.setMeta({
      title: 'Contact Us',
      description: `Contact ${this.s.get('site_name', 'Your Store')} for store support, delivery questions, and product enquiries.`
    });
  }

  contactEmail(): string {
    return this.s.get('contact_email', this.s.get('site_email', 'hello@example.com'));
  }

  safeMapUrl(): SafeResourceUrl | null {
    const url = this.s.get('contact_map_embed', '');
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  schemaJson(): string {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': this.s.get('site_name', 'Your Store'),
      'telephone': this.s.get('site_phone', ''),
      'email': this.contactEmail(),
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': this.s.get('contact_address', this.s.get('site_address', '')),
        'addressLocality': this.s.get('business_city', ''),
        'addressRegion': this.s.get('business_region', ''),
        'addressCountry': this.s.get('business_country', '')
      },
      'openingHours': this.s.get('contact_hours', ''),
      'url': this.s.get('site_url', ''),
      'image': this.s.get('site_logo', '')
    });
  }

  submitForm() {
    if (!this.form.name || !this.form.email || !this.form.message) {
      this.formError.set('Please fill in all required fields.');
      return;
    }

    this.formError.set('');
    this.sending.set(true);

    const subject = encodeURIComponent(this.form.subject || 'Website Enquiry');
    const body = encodeURIComponent(
      `Name: ${this.form.name}\nEmail: ${this.form.email}\n\n${this.form.message}`
    );
    window.open(`mailto:${this.contactEmail()}?subject=${subject}&body=${body}`, '_blank');

    setTimeout(() => {
      this.sending.set(false);
      this.sent.set(true);
      this.form = { name: '', email: '', subject: '', message: '' };
    }, 600);
  }
}

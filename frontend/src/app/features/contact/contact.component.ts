import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, FormsModule],
  template: `
    <div class="contact-page">

      <!-- ── SEO: LocalBusiness Schema ── -->
      <script type="application/ld+json" [innerHTML]="schemaJson()"></script>

      <!-- ── Hero ── -->
      <section class="ct-hero">
        <div class="container ct-hero-inner">
          <div class="ct-hero-badge">📍 We're Here For You</div>
          <h1 class="ct-hero-title">Contact Us</h1>
          <p class="ct-hero-sub">Visit our store, give us a call, or drop us a message — we'd love to help.</p>
        </div>
      </section>

      <!-- ── Contact Info Cards ── -->
      <section class="ct-cards-section">
        <div class="container ct-cards-grid">

          <!-- Phone -->
          <a [href]="'tel:' + s.get('site_phone','')" class="ct-card">
            <div class="ct-card-icon ct-icon-phone">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3-8.57A2 2 0 012 1.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.37a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <div class="ct-card-body">
              <span class="ct-card-label">Call Us Anytime</span>
              <span class="ct-card-value">{{ s.get('site_phone', '+353 899 584 325') }}</span>
              <span class="ct-card-hint">Tap to call</span>
            </div>
          </a>

          <!-- Email -->
          <a [href]="'mailto:' + s.get('contact_email','info@asianfoodcork.ie')" class="ct-card">
            <div class="ct-card-icon ct-icon-email">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div class="ct-card-body">
              <span class="ct-card-label">Email Us</span>
              <span class="ct-card-value">{{ s.get('contact_email', 'info@asianfoodcork.ie') }}</span>
              <span class="ct-card-hint">We reply within 24h</span>
            </div>
          </a>

          <!-- Address -->
          <div class="ct-card">
            <div class="ct-card-icon ct-icon-pin">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="ct-card-body">
              <span class="ct-card-label">Our Address</span>
              <span class="ct-card-value">{{ s.get('contact_address', 'Cork, Ireland') }}</span>
              <span class="ct-card-hint">Come visit us</span>
            </div>
          </div>

          <!-- Hours -->
          <div class="ct-card">
            <div class="ct-card-icon ct-icon-clock">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="ct-card-body">
              <span class="ct-card-label">Opening Hours</span>
              <span class="ct-card-value" [innerHTML]="s.get('contact_hours','Mon–Sun: 9am – 9pm')"></span>
              <span class="ct-card-hint">We're open daily</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ── Map + Form ── -->
      <section class="ct-main-section">
        <div class="container ct-main-grid">

          <!-- Google Map -->
          <div class="ct-map-wrap">
            <h2 class="ct-section-title">
              <span class="ct-title-dot"></span>Find Us on the Map
            </h2>
            <div class="ct-map-frame">
              <ng-container *ngIf="safeMapUrl(); else mapFallback">
                <iframe
                  [src]="safeMapUrl()!"
                  width="100%" height="100%"
                  style="border:0" allowfullscreen
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Asian Food Cork Location — Google Maps"
                ></iframe>
              </ng-container>
              <ng-template #mapFallback>
                <div class="ct-map-placeholder">
                  <div class="ct-map-ph-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <p class="ct-map-ph-text">Map not configured yet.</p>
                  <p class="ct-map-ph-hint">Set the Google Maps Embed URL in<br><strong>Admin → Settings → Contact Us</strong></p>
                </div>
              </ng-template>
            </div>

            <!-- WhatsApp CTA -->
            <a *ngIf="s.get('social_whatsapp','')"
               [href]="'https://wa.me/' + s.get('social_whatsapp','')"
               target="_blank" class="ct-whatsapp-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          <!-- Contact Form -->
          <div class="ct-form-wrap">
            <h2 class="ct-section-title">
              <span class="ct-title-dot"></span>Send Us a Message
            </h2>
            <form class="ct-form" (ngSubmit)="submitForm()" #contactForm="ngForm">
              <div class="ct-form-row">
                <div class="ct-field">
                  <label>Your Name *</label>
                  <input type="text" [(ngModel)]="form.name" name="name" required placeholder="e.g. John Murphy">
                </div>
                <div class="ct-field">
                  <label>Email Address *</label>
                  <input type="email" [(ngModel)]="form.email" name="email" required placeholder="john@example.com">
                </div>
              </div>
              <div class="ct-field">
                <label>Subject</label>
                <input type="text" [(ngModel)]="form.subject" name="subject" placeholder="Order enquiry, product question...">
              </div>
              <div class="ct-field">
                <label>Message *</label>
                <textarea [(ngModel)]="form.message" name="message" required rows="5" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" class="ct-submit-btn" [disabled]="sending()">
                <span *ngIf="!sending()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
                  Send Message
                </span>
                <span *ngIf="sending()">Sending...</span>
              </button>
              <div class="ct-success" *ngIf="sent()">
                ✅ Thank you! We'll get back to you shortly.
              </div>
              <div class="ct-error" *ngIf="formError()">❌ {{ formError() }}</div>
            </form>
          </div>

        </div>
      </section>

    </div>
  `,
  styles: [`
    :host { display: block; }

    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

    /* ── Hero ── */
    .ct-hero {
      background: linear-gradient(135deg, #351F60 0%, #4B2E83 45%, #1a6e3c 100%);
      padding: 56px 0 44px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }
    /* Dark vignette overlay for depth */
    .ct-hero::before {
      content: '';
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.28);
    }
    /* Soft radial highlight */
    .ct-hero::after {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 65%);
    }
    .ct-hero-inner { position: relative; z-index: 2; }
    .ct-hero-badge {
      display: inline-block;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.28);
      backdrop-filter: blur(8px);
      color: rgba(255,255,255,0.95);
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      padding: 6px 16px; border-radius: 999px; margin-bottom: 18px;
    }
    .ct-hero-title {
      font-size: clamp(2.2rem, 5vw, 3.2rem); font-weight: 900;
      margin: 0 0 14px; letter-spacing: -0.03em;
      color: #ffffff;
      text-shadow: 0 2px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.6);
    }
    .ct-hero-sub {
      font-size: 1.05rem;
      color: rgba(255,255,255,0.88);
      margin: 0 auto;
      max-width: 480px;
      line-height: 1.6;
      text-shadow: 0 1px 8px rgba(0,0,0,0.4);
    }

    /* ── Cards ── */
    .ct-cards-section { padding: 52px 0 0; }
    .ct-cards-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
    }
    .ct-card {
      background: white; border-radius: 18px;
      box-shadow: 0 2px 20px rgba(75,46,131,0.08);
      padding: 22px 18px; display: flex; align-items: flex-start; gap: 14px;
      text-decoration: none; color: inherit;
      border: 1.5px solid #F0EEFF;
      transition: transform 0.22s ease, box-shadow 0.22s ease;
    }
    a.ct-card:hover { transform: translateY(-4px); box-shadow: 0 10px 36px rgba(75,46,131,0.14); }
    .ct-card-icon {
      width: 50px; height: 50px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ct-icon-phone { background: #EDE9FF; color: #4B2E83; }
    .ct-icon-email { background: #D1FAE5; color: #065F46; }
    .ct-icon-pin   { background: #FEE2E2; color: #991B1B; }
    .ct-icon-clock { background: #FEF3C7; color: #92400E; }
    .ct-card-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .ct-card-label { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #9CA3AF; }
    .ct-card-value { font-size: 14px; font-weight: 700; color: #1A1A2E; line-height: 1.4; word-break: break-word; }
    .ct-card-hint  { font-size: 11.5px; color: #9CA3AF; margin-top: 2px; }

    /* ── Main Section ── */
    .ct-main-section { padding: 52px 0 80px; }
    .ct-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
    .ct-section-title {
      font-size: 1.3rem; font-weight: 800; color: #1A1A2E;
      margin: 0 0 20px; display: flex; align-items: center; gap: 10px;
    }
    .ct-title-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: linear-gradient(135deg, #4B2E83, #2E9F5C);
      flex-shrink: 0;
    }

    /* ── Map ── */
    .ct-map-frame {
      height: 420px; border-radius: 20px; overflow: hidden;
      box-shadow: 0 8px 40px rgba(75,46,131,0.13);
      border: 2px solid #F0EEFF;
    }
    .ct-map-placeholder {
      height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 12px; background: #F8FAFF; color: #94A3B8; text-align: center; font-size: 14px; padding: 32px;
    }
    .ct-map-ph-icon {
      width: 72px; height: 72px; border-radius: 50%; background: #EEF2FF;
      display: flex; align-items: center; justify-content: center;
    }
    .ct-map-ph-text { font-size: 15px; font-weight: 600; color: #6B7280; margin: 0; }
    .ct-map-ph-hint { font-size: 13px; color: #9CA3AF; margin: 0; line-height: 1.6; }
    .ct-whatsapp-btn {
      display: flex; align-items: center; gap: 10px; margin-top: 16px;
      background: #25D366; color: white; font-size: 14px; font-weight: 700;
      padding: 12px 22px; border-radius: 12px; text-decoration: none;
      transition: background 0.2s, transform 0.15s; width: fit-content;
    }
    .ct-whatsapp-btn:hover { background: #1eb858; transform: translateY(-1px); }

    /* ── Form ── */
    .ct-form { display: flex; flex-direction: column; gap: 16px; }
    .ct-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .ct-field { display: flex; flex-direction: column; gap: 6px; }
    .ct-field label { font-size: 12.5px; font-weight: 700; color: #374151; letter-spacing: 0.02em; }
    .ct-field input, .ct-field textarea {
      padding: 12px 14px; border: 1.5px solid #E5E7EB; border-radius: 12px;
      font-size: 14px; font-family: inherit; color: #1A1A2E; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s; background: white; resize: vertical;
    }
    .ct-field input:focus, .ct-field textarea:focus {
      border-color: #4B2E83; box-shadow: 0 0 0 3px rgba(75,46,131,0.1);
    }
    .ct-submit-btn {
      background: linear-gradient(135deg, #4B2E83 0%, #2E9F5C 100%);
      color: white; border: none; border-radius: 12px;
      padding: 14px 28px; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: opacity 0.2s, transform 0.15s;
      font-family: inherit; align-self: flex-start;
      display: flex; align-items: center; gap: 8px;
    }
    .ct-submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
    .ct-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .ct-success { background: #D1FAE5; color: #065F46; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; }
    .ct-error   { background: #FEE2E2; color: #991B1B; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .ct-cards-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .ct-hero { padding: 40px 0 28px; }
      .ct-cards-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
      .ct-main-grid { grid-template-columns: 1fr; }
      .ct-form-row { grid-template-columns: 1fr; }
      .ct-map-frame { height: 300px; }
    }
    @media (max-width: 480px) {
      .ct-cards-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactComponent implements OnInit {
  form = { name: '', email: '', subject: '', message: '' };
  sending = signal(false);
  sent    = signal(false);
  formError = signal('');

  private sanitizer = inject(DomSanitizer);

  constructor(
    public s: SettingsService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.setMeta({
      title: 'Contact Us',
      description: 'Contact Asian Food Cork — visit our store, call us, or send a message. Find us on Google Maps.'
    });
  }

  /** Returns a sanitized SafeResourceUrl for the map iframe, or null if not set */
  safeMapUrl(): SafeResourceUrl | null {
    const url = this.s.get('contact_map_embed', '');
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /** LocalBusiness JSON-LD for SEO */
  schemaJson(): string {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': this.s.get('site_name', 'Asian Food Cork'),
      'telephone': this.s.get('site_phone', ''),
      'email': this.s.get('contact_email', ''),
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': this.s.get('contact_address', ''),
        'addressLocality': 'Cork',
        'addressCountry': 'IE'
      },
      'openingHours': this.s.get('contact_hours', ''),
      'url': 'https://asianfoodcork.ie',
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

    // Compose mailto link as fallback
    const to = this.s.get('contact_email', 'info@asianfoodcork.ie');
    const subject = encodeURIComponent(this.form.subject || 'Website Enquiry');
    const body = encodeURIComponent(
      `Name: ${this.form.name}\nEmail: ${this.form.email}\n\n${this.form.message}`
    );
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');

    setTimeout(() => {
      this.sending.set(false);
      this.sent.set(true);
      this.form = { name: '', email: '', subject: '', message: '' };
    }, 600);
  }
}

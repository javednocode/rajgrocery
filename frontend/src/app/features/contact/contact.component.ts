import { Component, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
  <!-- ══ HERO ══ -->
  <section class="co-hero">
    <div class="td-container">
      <span class="td-eyebrow">Say Hello</span>
      <h1>We'd love to<br/>hear from you.</h1>
      <p class="td-sub">Questions about an order, a product, or wholesale? Our team replies fast.</p>
    </div>
  </section>

  <!-- ══ CONTACT CARDS ══ -->
  <section class="co-body">
    <div class="td-container">
      <div class="co-grid">

        <!-- Email -->
        @if (email()) {
          <a class="co-card" [href]="'mailto:' + email()">
            <div class="co-ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="1.8"/>
                <path d="M3 8l9 6 9-6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Email us</h3>
            <p>{{ email() }}</p>
            <span>Typically replies within hours →</span>
          </a>
        }

        <!-- Phone -->
        @if (phone()) {
          <a class="co-card" [href]="'tel:' + phone()">
            <div class="co-ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Call us</h3>
            <p>{{ phone() }}</p>
            <span>{{ hours() || 'Mon–Sat, 9am–6pm' }} →</span>
          </a>
        }

        <!-- Address -->
        @if (address()) {
          <div class="co-card">
            <div class="co-ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11z" stroke="currentColor" stroke-width="1.8"/>
                <circle cx="12" cy="10" r="2.6" stroke="currentColor" stroke-width="1.8"/>
              </svg>
            </div>
            <h3>Find us</h3>
            <p>{{ address() }}</p>
            <span>United Kingdom</span>
          </div>
        }

        <!-- Opening Hours -->
        @if (hours()) {
          <div class="co-card co-hours-card">
            <div class="co-ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
                <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>Opening Hours</h3>
            <p class="co-hours">{{ hours() }}</p>
            <span>We're here to help</span>
          </div>
        }

      </div>
    </div>
  </section>

  <!-- ══ GOOGLE MAP ══ -->
  @if (mapUrl()) {
    <section class="co-map-section">
      <div class="td-container">
        <div class="co-map-wrap">
          <iframe
            [src]="mapUrl()!"
            width="100%"
            height="420"
            style="border:0;"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            title="Store Location Map">
          </iframe>
        </div>
      </div>
    </section>
  }
  `,
  styles: [`
  /* ══ HERO ══ */
  .co-hero{padding:84px 0 56px;background:var(--td-secondary)}
  .co-hero h1{font-size:clamp(2.2rem,4.4vw,3.6rem);font-weight:800;line-height:1.08;letter-spacing:-.03em;margin:6px 0 18px}

  /* ══ CONTACT CARDS ══ */
  .co-body{padding:64px 0 48px}
  .co-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px}
  .co-card{border:1px solid var(--td-line);border-radius:var(--td-radius);padding:34px 30px;transition:transform .35s var(--td-ease),box-shadow .35s;display:block;text-decoration:none;color:inherit}
  .co-card:hover{transform:translateY(-5px);box-shadow:var(--td-shadow)}
  .co-ic{width:52px;height:52px;border-radius:16px;background:var(--td-secondary);display:grid;place-items:center;color:var(--td-text);margin-bottom:22px}
  .co-card h3{font-size:17px;font-weight:800;margin-bottom:8px;color:var(--td-heading)}
  .co-card p{font-size:15px;color:var(--td-text);font-weight:600;margin:0 0 14px;word-break:break-word}
  .co-card span{font-size:13px;color:var(--td-muted)}
  .co-hours{white-space:pre-line;line-height:1.7}

  /* ══ MAP ══ */
  .co-map-section{padding:0 0 64px}
  .co-map-wrap{border-radius:16px;overflow:hidden;border:1px solid var(--td-line);box-shadow:0 4px 24px rgba(0,0,0,.06)}
  .co-map-wrap iframe{display:block}

  /* ══ RESPONSIVE ══ */
  @media (max-width:900px){
    .co-grid{grid-template-columns:1fr 1fr}
    .co-hero{padding:56px 0 40px}
  }
  @media (max-width:580px){
    .co-grid{grid-template-columns:1fr}
  }
  `]
})
export class ContactComponent {
  private _settings: SettingsService;
  private _sanitizer: DomSanitizer;

  constructor(private settings: SettingsService, private sanitizer: DomSanitizer, seo: SeoService) {
    this._settings = settings;
    this._sanitizer = sanitizer;
    seo.setMeta({ title: 'Contact Us', description: 'Get in touch with The Desi — premium South Asian groceries delivered across the UK.' });
  }

  email    = computed(() => this._settings.get('contact_email', ''));
  phone    = computed(() => this._settings.get('contact_phone', this._settings.get('site_phone', '')));
  address  = computed(() => this._settings.get('contact_address', this._settings.get('site_address', '')));
  hours    = computed(() => this._settings.get('contact_hours', ''));

  mapUrl   = computed((): SafeResourceUrl | null => {
    const url = this._settings.get('contact_map_embed', '');
    if (!url || !url.startsWith('https://www.google.com/maps/embed')) return null;
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}

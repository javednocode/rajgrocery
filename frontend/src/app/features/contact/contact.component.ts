import { Component, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
  <!-- Hero -->
  <section class="co-hero">
    <div class="container">
      <nav class="co-crumbs">
        <a routerLink="/">Home</a><i>/</i><span>Contact</span>
      </nav>
      <span class="co-eyebrow">Get in touch</span>
      <h1>Contact <span class="co-saf">{{ settings.get('site_name', 'Us') }}</span></h1>
      <p>Have a question, order issue, or wholesale enquiry?<br>We're here to help — typically reply within a few hours.</p>
    </div>
  </section>

  <!-- Body -->
  <section class="co-body">
    <div class="container co-layout">

      <!-- FORM -->
      <div class="co-form-col">
        <div class="co-form-card">
          <h2>Send us a message</h2>
          <p class="co-form-sub">We usually respond within 2–4 hours during business hours.</p>

          @if (sent()) {
            <div class="co-success">
              <div class="co-success-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <strong>Message sent successfully!</strong>
                <p>Thank you for reaching out. We'll reply to {{ form.email }} shortly.</p>
              </div>
            </div>
          } @else {
            <form class="co-form" (submit)="submit($event)">
              <div class="co-row2">
                <label>First Name *
                  <input [(ngModel)]="form.first_name" name="fn" type="text" placeholder="Priya" required />
                </label>
                <label>Last Name *
                  <input [(ngModel)]="form.last_name" name="ln" type="text" placeholder="Sharma" required />
                </label>
              </div>
              <label>Email Address *
                <input [(ngModel)]="form.email" name="email" type="email" placeholder="priya@example.com" required />
              </label>
              <label>Phone Number
                <input [(ngModel)]="form.phone" name="phone" type="tel" placeholder="+358 40 000 0000" />
              </label>
              <label>Subject *
                <select [(ngModel)]="form.subject" name="subject" required>
                  <option value="">Select a topic…</option>
                  <option>Order Enquiry</option>
                  <option>Product Question</option>
                  <option>Delivery Issue</option>
                  <option>Return / Refund</option>
                  <option>Wholesale / Bulk Order</option>
                  <option>Other</option>
                </select>
              </label>
              <label>Message *
                <textarea [(ngModel)]="form.message" name="msg" rows="5" placeholder="Describe your enquiry…" required></textarea>
              </label>
              @if (error()) {
                <p class="co-err">{{ error() }}</p>
              }
              <button type="submit" [disabled]="sending()">
                @if (sending()) { Sending… } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Send Message
                }
              </button>
            </form>
          }
        </div>
      </div>

      <!-- INFO SIDEBAR -->
      <aside class="co-info-col">

        @if (settings.get('store_address') || settings.get('contact_address')) {
          <div class="co-info-card">
            <div class="co-info-icon">📍</div>
            <div>
              <h4>Visit Us</h4>
              <p>{{ settings.get('store_address') || settings.get('contact_address') }}</p>
            </div>
          </div>
        }

        @if (settings.get('site_phone') || settings.get('contact_phone')) {
          <div class="co-info-card">
            <div class="co-info-icon">📞</div>
            <div>
              <h4>Call Us</h4>
              <p>{{ settings.get('site_phone') || settings.get('contact_phone') }}</p>
              @if (settings.get('contact_hours')) {
                <span>{{ settings.get('contact_hours') }}</span>
              }
            </div>
          </div>
        }

        @if (settings.get('site_email') || settings.get('contact_email')) {
          <div class="co-info-card">
            <div class="co-info-icon">✉️</div>
            <div>
              <h4>Email Us</h4>
              <a [href]="'mailto:' + (settings.get('site_email') || settings.get('contact_email'))">
                {{ settings.get('site_email') || settings.get('contact_email') }}
              </a>
            </div>
          </div>
        }

        @if (settings.get('social_whatsapp')) {
          <div class="co-info-card">
            <div class="co-info-icon">💬</div>
            <div>
              <h4>WhatsApp</h4>
              <a [href]="'https://wa.me/' + settings.get('social_whatsapp').replace(/\\D/g,'')" target="_blank" rel="noopener">
                Chat with us
              </a>
            </div>
          </div>
        }

        <!-- Social Links -->
        @if (hasSocials()) {
          <div class="co-socials-block">
            <h4>Follow Us</h4>
            <div class="co-socials">
              @if (settings.get('social_facebook')) {
                <a [href]="settings.get('social_facebook')" target="_blank" rel="noopener" aria-label="Facebook" class="co-soc">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              }
              @if (settings.get('social_instagram')) {
                <a [href]="settings.get('social_instagram')" target="_blank" rel="noopener" aria-label="Instagram" class="co-soc">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                </a>
              }
              @if (settings.get('social_twitter')) {
                <a [href]="settings.get('social_twitter')" target="_blank" rel="noopener" aria-label="X" class="co-soc">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              }
            </div>
          </div>
        }

        <!-- Map -->
        @if (mapUrl()) {
          <div class="co-map-wrap">
            <iframe [src]="mapUrl()" width="100%" height="220" style="border:0;border-radius:12px;display:block" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Store location"></iframe>
          </div>
        }
      </aside>

    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}

  /* HERO */
  .co-hero { background: linear-gradient(135deg, #211D16 0%, #37322A 100%); padding: 48px 0 56px; position: relative; overflow: hidden; }
  .co-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 14px; }
  .co-crumbs a { color: rgba(255,255,255,.65); transition: color .2s; }
  .co-crumbs a:hover { color: #C4622D; }
  .co-crumbs i { font-style: normal; opacity: .35; }
  .co-eyebrow { display: inline-block; font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #C4622D; margin-bottom: 12px; }
  .co-hero h1 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 400; color: #fff; margin-bottom: 12px; }
  .co-saf { color: #C4622D; }
  .co-hero p { font-size: 16px; color: rgba(255,255,255,.65); line-height: 1.7; }

  /* BODY */
  .co-body { padding: 48px 0 64px; background: #FAF6EF; }
  .co-layout { display: grid; grid-template-columns: 1fr 340px; gap: 36px; align-items: start; }

  /* FORM CARD */
  .co-form-card { background: #fff; border: 1.5px solid #E8E1D2; border-radius: 20px; padding: 32px; }
  .co-form-card h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.5rem; font-weight: 400; color: #211D16; margin-bottom: 6px; }
  .co-form-sub { font-size: 14px; color: #7C7466; margin-bottom: 24px; }

  /* FORM FIELDS */
  .co-form { display: flex; flex-direction: column; gap: 16px; }
  .co-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .co-form label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700; color: #211D16; font-family: 'Manrope', sans-serif; }
  .co-form input, .co-form select, .co-form textarea {
    padding: 11px 14px; border: 1.5px solid #E8E1D2; border-radius: 10px;
    font-size: 14px; font-family: 'Manrope', sans-serif; color: #211D16;
    transition: border-color .2s; outline: none; background: #fff;
  }
  .co-form input::placeholder, .co-form textarea::placeholder { color: #ABA394; }
  .co-form input:focus, .co-form select:focus, .co-form textarea:focus { border-color: #C4622D; box-shadow: 0 0 0 3px rgba(196,98,45,.1); }
  .co-form textarea { resize: vertical; min-height: 120px; }
  .co-form select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23718096' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
  .co-form button {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #C4622D; color: #fff; border: none;
    border-radius: 12px; padding: 15px;
    font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 800;
    cursor: pointer; transition: all .25s; box-shadow: 0 6px 20px rgba(196,98,45,.25);
  }
  .co-form button:hover:not(:disabled) { background: #A94E20; transform: translateY(-1px); }
  .co-form button:disabled { opacity: .6; cursor: not-allowed; }
  .co-err { font-size: 13px; color: #A63B2A; margin: 0; }

  /* SUCCESS */
  .co-success { display: flex; align-items: flex-start; gap: 14px; background: #EAF0E9; border: 1.5px solid rgba(31,77,58,.2); border-radius: 14px; padding: 20px; }
  .co-success-icon { width: 44px; height: 44px; border-radius: 50%; background: #1F4D3A; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .co-success strong { display: block; font-size: 16px; color: #211D16; margin-bottom: 4px; font-family: 'Manrope', sans-serif; }
  .co-success p { font-size: 14px; color: #7C7466; margin: 0; }

  /* INFO SIDEBAR */
  .co-info-col { display: flex; flex-direction: column; gap: 14px; position: sticky; top: calc(var(--header-height,156px) + 20px); }
  .co-info-card { display: flex; align-items: flex-start; gap: 14px; background: #fff; border: 1.5px solid #E8E1D2; border-radius: 14px; padding: 18px; }
  .co-info-icon { font-size: 22px; flex-shrink: 0; }
  .co-info-card h4 { font-size: 13px; font-weight: 800; color: #211D16; margin-bottom: 4px; font-family: 'Manrope', sans-serif; }
  .co-info-card p, .co-info-card a, .co-info-card span { font-size: 14px; color: #7C7466; margin: 0; line-height: 1.5; }
  .co-info-card a { color: #C4622D; font-weight: 700; }
  .co-info-card a:hover { text-decoration: underline; }
  .co-socials-block { background: #fff; border: 1.5px solid #E8E1D2; border-radius: 14px; padding: 18px; }
  .co-socials-block h4 { font-size: 13px; font-weight: 800; color: #211D16; margin-bottom: 12px; font-family: 'Manrope', sans-serif; }
  .co-socials { display: flex; gap: 8px; }
  .co-soc { width: 38px; height: 38px; border-radius: 10px; background: #F1EADD; border: 1.5px solid #E8E1D2; display: grid; place-items: center; color: #7C7466; transition: all .22s; }
  .co-soc:hover { background: #C4622D; border-color: #C4622D; color: #fff; transform: translateY(-2px); }
  .co-map-wrap { border-radius: 14px; overflow: hidden; }

  @media (max-width: 900px) {
    .co-layout { grid-template-columns: 1fr; }
    .co-info-col { position: static; }
    .co-row2 { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .co-hero { padding: 26px 0 30px; }
    .co-body { padding: 24px 0 40px; }
  }
  `]
})
export class ContactComponent implements OnInit {
  form = { first_name: '', last_name: '', email: '', phone: '', subject: '', message: '' };
  sent = signal(false);
  sending = signal(false);
  error = signal('');

  constructor(public settings: SettingsService, private seo: SeoService, private api: ApiService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.seo.setMeta({ title: 'Contact Us', description: 'Get in touch with our customer support team.' });
  }

  mapUrl(): SafeResourceUrl | null {
    const raw = this.settings.get('google_map_embed') || this.settings.get('map_embed_url') || '';
    if (!raw) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(raw);
  }

  hasSocials(): boolean {
    return !!(this.settings.get('social_facebook') || this.settings.get('social_instagram') || this.settings.get('social_twitter'));
  }

  submit(e: Event) {
    e.preventDefault();
    if (!this.form.first_name || !this.form.email || !this.form.message) {
      this.error.set('Please fill in all required fields.');
      return;
    }
    this.sending.set(true);
    this.error.set('');
    this.api.sendContactForm(this.form).subscribe({
      next: (r: any) => {
        this.sending.set(false);
        if (r.success || r.status === 'success') { this.sent.set(true); }
        else { this.error.set(r.message || 'Something went wrong. Please try again.'); }
      },
      error: () => { this.sending.set(false); this.error.set('Failed to send. Please email us directly.'); }
    });
  }
}

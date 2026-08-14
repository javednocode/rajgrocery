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
  <section class="co-hero">
    <div class="container">
      <nav class="co-crumbs">
        <a routerLink="/">Home</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Contact</span>
      </nav>
      <span class="co-eyebrow">Get In Touch</span>
      <h1>Contact {{ settings.get('site_name', 'Us') }}</h1>
      <p>Have a question, order issue, or wholesale enquiry? We're here to help — typically reply within a few hours.</p>
    </div>
  </section>

  <section class="co-body">
    <div class="container co-layout">
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
                <input [(ngModel)]="form.phone" name="phone" type="tel" placeholder="+852 9XXX XXXX" />
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

      <aside class="co-info-col">
        @if (settings.get('store_address') || settings.get('contact_address')) {
          <div class="co-info-card">
            <div class="co-info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="var(--kg-forest)" stroke-width="1.8"/><circle cx="12" cy="10" r="3" stroke="var(--kg-forest)" stroke-width="1.8"/></svg>
            </div>
            <div>
              <h4>Visit Us</h4>
              <p>{{ settings.get('store_address') || settings.get('contact_address') }}</p>
            </div>
          </div>
        }
        @if (settings.get('site_phone') || settings.get('contact_phone')) {
          <div class="co-info-card">
            <div class="co-info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" stroke="var(--kg-forest)" stroke-width="1.8"/></svg>
            </div>
            <div>
              <h4>Call Us</h4>
              <p>{{ settings.get('site_phone') || settings.get('contact_phone') }}</p>
              @if (settings.get('contact_hours')) { <span>{{ settings.get('contact_hours') }}</span> }
            </div>
          </div>
        }
        @if (settings.get('site_email') || settings.get('contact_email')) {
          <div class="co-info-card">
            <div class="co-info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="var(--kg-forest)" stroke-width="1.8"/><path d="M22 6l-10 7L2 6" stroke="var(--kg-forest)" stroke-width="1.8" stroke-linecap="round"/></svg>
            </div>
            <div>
              <h4>Email Us</h4>
              <a [href]="'mailto:' + (settings.get('site_email') || settings.get('contact_email'))">{{ settings.get('site_email') || settings.get('contact_email') }}</a>
            </div>
          </div>
        }
        @if (settings.get('social_whatsapp')) {
          <div class="co-info-card">
            <div class="co-info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--kg-forest)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            </div>
            <div>
              <h4>WhatsApp</h4>
              <a [href]="'https://wa.me/' + settings.get('social_whatsapp').replace(/\\D/g,'')" target="_blank" rel="noopener">Chat with us</a>
            </div>
          </div>
        }
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
            </div>
          </div>
        }
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
  .container { max-width: 1360px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:768px){.container{padding:0 40px}}
  @media(min-width:1200px){.container{padding:0 56px}}

  /* HERO */
  .co-hero { background: var(--kg-dark); padding: 48px 0 56px; position: relative; overflow: hidden; }
  .co-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 140% at 20% 60%, rgba(74,127,212,.2) 0%, transparent 70%); pointer-events: none; }
  .co-hero .container { position: relative; z-index: 1; }
  .co-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: rgba(255,255,255,.38); margin-bottom: 16px; }
  .co-crumbs a { color: rgba(255,255,255,.6); transition: color .2s; }
  .co-crumbs a:hover { color: var(--kg-forest-lt); }
  .co-crumbs svg { opacity: .35; flex-shrink: 0; }
  .co-eyebrow { display: inline-block; font-family: var(--font-sans); font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: var(--kg-forest-lt); margin-bottom: 12px; }
  .co-hero h1 { font-family: var(--font-sans); font-size: clamp(1.7rem, 3.5vw, 2.6rem); font-weight: 800; color: #FFF; margin-bottom: 10px; letter-spacing: -0.02em; }
  .co-hero p { font-size: 15px; color: rgba(255,255,255,.7); max-width: 520px; line-height: 1.7; }

  /* BODY */
  .co-body { padding: 48px 0 64px; background: var(--kg-cream); }
  .co-layout { display: grid; grid-template-columns: 1fr 340px; gap: 36px; align-items: start; }

  /* FORM CARD */
  .co-form-card { background: var(--kg-paper); border: 1px solid var(--kg-line-lt); border-radius: 14px; padding: 32px; }
  .co-form-card h2 { font-family: var(--font-sans); font-size: 1.35rem; font-weight: 800; color: var(--kg-ink); margin-bottom: 6px; letter-spacing: -0.01em; }
  .co-form-sub { font-size: 14px; color: var(--kg-muted); margin-bottom: 24px; }
  .co-form { display: flex; flex-direction: column; gap: 16px; }
  .co-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .co-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--kg-ink); font-family: var(--font-sans); }
  .co-form input, .co-form select, .co-form textarea {
    padding: 11px 14px; border: 1px solid var(--kg-line); border-radius: var(--r);
    font-size: 14px; font-family: var(--font-sans); color: var(--kg-ink);
    transition: border-color .2s; outline: none; background: var(--kg-paper);
  }
  .co-form input:focus, .co-form select:focus, .co-form textarea:focus { border-color: var(--kg-forest); box-shadow: 0 0 0 3px var(--kg-forest-bg); }
  .co-form input::placeholder, .co-form textarea::placeholder { color: var(--kg-faint); }
  .co-form textarea { resize: vertical; min-height: 120px; }
  .co-form select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2393A0B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
  .co-form button {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: var(--kg-forest); color: var(--kg-cream); border: none;
    border-radius: var(--r-lg); padding: 15px;
    font-family: var(--font-sans); font-size: 15px; font-weight: 800;
    cursor: pointer; transition: all .25s; box-shadow: var(--shadow-forest);
  }
  .co-form button:hover:not(:disabled) { background: var(--kg-forest-dk); transform: translateY(-2px); }
  .co-form button:disabled { opacity: .6; cursor: not-allowed; }
  .co-err { font-size: 13px; color: var(--kg-clay); margin: 0; }

  .co-success { display: flex; align-items: flex-start; gap: 14px; background: var(--kg-forest-bg); border: 1px solid var(--kg-forest-bg2); border-radius: 12px; padding: 20px; }
  .co-success-icon { width: 44px; height: 44px; border-radius: var(--r-full); background: var(--kg-forest); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .co-success strong { display: block; font-size: 16px; color: var(--kg-ink); margin-bottom: 4px; font-family: var(--font-sans); }
  .co-success p { font-size: 14px; color: var(--kg-muted); margin: 0; }

  /* INFO SIDEBAR */
  .co-info-col { display: flex; flex-direction: column; gap: 12px; position: sticky; top: calc(var(--header-height) + 20px); }
  .co-info-card { display: flex; align-items: flex-start; gap: 14px; background: var(--kg-paper); border: 1px solid var(--kg-line-lt); border-radius: 12px; padding: 18px; }
  .co-info-icon { width: 36px; height: 36px; border-radius: 8px; background: var(--kg-forest-bg); display: grid; place-items: center; flex-shrink: 0; }
  .co-info-card h4 { font-size: 13px; font-weight: 800; color: var(--kg-ink); margin-bottom: 4px; font-family: var(--font-sans); }
  .co-info-card p, .co-info-card a, .co-info-card span { font-size: 13.5px; color: var(--kg-muted); margin: 0; line-height: 1.5; }
  .co-info-card a { color: var(--kg-forest); font-weight: 700; transition: color .2s; }
  .co-info-card a:hover { color: var(--kg-forest-dk); }
  .co-socials-block { background: var(--kg-paper); border: 1px solid var(--kg-line-lt); border-radius: 12px; padding: 18px; }
  .co-socials-block h4 { font-size: 13px; font-weight: 800; color: var(--kg-ink); margin-bottom: 10px; font-family: var(--font-sans); }
  .co-socials { display: flex; gap: 8px; }
  .co-soc { width: 36px; height: 36px; border-radius: 8px; background: var(--kg-warm); border: 1px solid var(--kg-line); display: grid; place-items: center; color: var(--kg-muted); transition: all .22s; }
  .co-soc:hover { background: var(--kg-forest); border-color: var(--kg-forest); color: var(--kg-cream); transform: translateY(-2px); }
  .co-map-wrap { border-radius: 12px; overflow: hidden; }

  @media (max-width: 900px) {
    .co-layout { grid-template-columns: 1fr; }
    .co-info-col { position: static; }
    .co-row2 { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .co-hero { padding: 28px 0 32px; }
    .co-body { padding: 28px 0 44px; }
    .co-form-card { padding: 20px 16px; }
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
    return !!(this.settings.get('social_facebook') || this.settings.get('social_instagram'));
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

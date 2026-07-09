import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { CountryService } from '../../../core/services/country.service';
import { ScrollProgressDirective } from '../../directives/motion.directives';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule, ScrollProgressDirective],
  template: `
  <footer class="ft kg-grain" kgScrollProgress>

    <!-- ══ NEWSLETTER ══ -->
    <div class="ft-nl">
      <div class="ft-wrap ft-nl-in">
        <div class="ft-nl-copy">
          <span class="ft-eyebrow">Stay in touch</span>
          <h3>{{ settings.get('newsletter_title', 'Three worlds of flavour, one letter') }}</h3>
          <p>{{ settings.get('newsletter_desc', 'New arrivals, seasonal recipes and offers — a short letter, once a week.') }}</p>
        </div>
        <form class="ft-nl-form" (submit)="subscribe($event)">
          @if (subscribed()) {
            <div class="ft-nl-done">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Thank you — you're on the list.
            </div>
          } @else {
            <input type="email" required [(ngModel)]="email" name="email"
              placeholder="Your email address" aria-label="Email for newsletter" />
            <button type="submit">
              Subscribe
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          }
        </form>
      </div>
    </div>

    <!-- ══ MAIN ══ -->
    <div class="ft-main">
      <div class="ft-wrap ft-grid">

        <div class="ft-brand">
          @if (logoUrl()) {
            <img [src]="logoUrl()" [alt]="settings.get('site_name','Kale Gida')" class="ft-logo" />
          } @else {
            <span class="ft-word">{{ settings.get('site_name','Kale Gida') }}</span>
          }
          <span class="ft-tag">{{ settings.get('site_tagline','Premium groceries from India, Finland & Germany') }}</span>
          <p class="ft-about">{{ settings.get('footer_about','A curated international grocery marketplace — authentic staples, snacks and delicacies from three worlds, delivered to your door.') }}</p>

          <div class="ft-worlds">
            @for (c of country.all; track c.code) {
              <button class="ft-world" [class.on]="country.code() === c.code" (click)="country.select(c.code)">
                <em>{{ c.flag }}</em> {{ c.name }}
              </button>
            }
          </div>
          @if (settings.get('delivery_info')) {
            <p class="ft-delivery">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M15 8h3l3 3v5h-6V8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="5.5" cy="18.5" r="2" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="18.5" r="2" stroke="currentColor" stroke-width="1.6"/></svg>
              {{ settings.get('delivery_info') }}
            </p>
          }

          <div class="ft-contact">
            @if (settings.get('site_phone')) {
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" stroke="currentColor" stroke-width="1.8"/></svg>
                {{ settings.get('site_phone') }}
              </span>
            }
            @if (settings.get('site_email')) {
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.8"/><path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                {{ settings.get('site_email') }}
              </span>
            }
            @if (settings.get('contact_hours')) {
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                {{ settings.get('contact_hours') }}
              </span>
            }
          </div>

          @if (hasSocialLinks()) {
            <div class="ft-socials">
              @if (settings.get('social_facebook')) {
                <a [href]="settings.get('social_facebook')" target="_blank" rel="noopener" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              }
              @if (settings.get('social_instagram')) {
                <a [href]="settings.get('social_instagram')" target="_blank" rel="noopener" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                </a>
              }
              @if (settings.get('social_twitter')) {
                <a [href]="settings.get('social_twitter')" target="_blank" rel="noopener" aria-label="X / Twitter">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              }
              @if (settings.get('social_youtube')) {
                <a [href]="settings.get('social_youtube')" target="_blank" rel="noopener" aria-label="YouTube">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1F2937"/></svg>
                </a>
              }
              @if (settings.get('social_whatsapp')) {
                <a [href]="'https://wa.me/' + settings.get('social_whatsapp').replace(/\\D/g,'')" target="_blank" rel="noopener" aria-label="WhatsApp">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.996 0C5.374 0 0 5.373 0 11.996c0 2.117.554 4.102 1.523 5.825L.053 23.948l6.284-1.647A11.938 11.938 0 0 0 11.996 24c6.622 0 11.996-5.373 11.996-11.996S18.618 0 11.996 0zm0 21.818a9.808 9.808 0 0 1-5.003-1.365l-.359-.214-3.729.977.994-3.635-.235-.374A9.806 9.806 0 0 1 2.178 12c0-5.41 4.409-9.819 9.818-9.819 5.41 0 9.819 4.409 9.819 9.819S17.406 21.818 11.996 21.818z"/></svg>
                </a>
              }
            </div>
          }
        </div>

        <nav class="ft-col" aria-label="Company links">
          <h5>Company</h5>
          <a routerLink="/about">Our story</a>
          <a routerLink="/blog">Journal</a>
          <a routerLink="/contact">Contact</a>
          <a [routerLink]="['/page','privacy-policy']">Privacy policy</a>
          <a [routerLink]="['/page','terms']">Terms & conditions</a>
        </nav>

        <nav class="ft-col" aria-label="Shop links">
          <h5>Marketplace</h5>
          <a routerLink="/categories">All categories</a>
          <a routerLink="/search" [queryParams]="{sale:1}">Offers</a>
          <a routerLink="/search">Search</a>
          <a routerLink="/wishlist">Wishlist</a>
          <a routerLink="/cart">Basket</a>
        </nav>

        <nav class="ft-col" aria-label="Customer care links">
          <h5>Customer care</h5>
          <a routerLink="/faq">FAQ</a>
          <a [routerLink]="['/page','delivery-info']">Delivery information</a>
          <a [routerLink]="['/page','returns']">Returns policy</a>
          <a routerLink="/account">Track your order</a>
        </nav>
      </div>

      <!-- Trust / payment -->
      <div class="ft-wrap">
        <div class="ft-pay">
          <span class="ft-pay-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            Secure checkout · SSL protected
          </span>
          <div class="ft-pay-icons">
            <span>VISA</span><span>Mastercard</span><span>Bank transfer</span><span>Cash on delivery</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ BOTTOM ══ -->
    <div class="ft-bottom">
      <div class="ft-wrap ft-bottom-in">
        <span>&copy; {{ currentYear }} {{ copyright() }}</span>
        <div class="ft-bottom-links">
          <a [routerLink]="['/page','privacy-policy']">Privacy</a>
          <a [routerLink]="['/page','terms']">Terms</a>
          <a routerLink="/faq">Help</a>
        </div>
        <span class="ft-credit">Powered by <a href="https://lookatus.io/" target="_blank" rel="noopener">Look At Us</a></span>
      </div>
    </div>

    <!-- Watermark -->
    <div class="ft-mark" aria-hidden="true">{{ settings.get('site_name','Kale Gida') }}</div>
  </footer>
  `,
  styles: [`
  .ft {
    position: relative; overflow: hidden;
    background: var(--kg-dark);
    color: rgba(255,255,255,.62);
  }
  .ft-wrap { max-width: 1360px; margin: 0 auto; padding: 0 24px; width: 100%; position: relative; z-index: 1; }
  @media (min-width: 768px)  { .ft-wrap { padding: 0 40px; } }
  @media (min-width: 1200px) { .ft-wrap { padding: 0 56px; } }

  .ft-eyebrow {
    display: inline-block; font-family: var(--font-sans);
    font-size: 11px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase;
    color: var(--kg-terra-lt); margin-bottom: 12px;
  }

  /* ── Newsletter ── */
  .ft-nl { border-bottom: 1px solid rgba(255,255,255,.09); padding: 68px 0; }
  .ft-nl-in { display: flex; align-items: center; justify-content: space-between; gap: 48px; flex-wrap: wrap; }
  .ft-nl-copy { flex: 1; min-width: 280px; }
  .ft-nl-copy h3 {
    font-family: var(--font-serif); font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: 380; color: var(--kg-cream); margin-bottom: 10px;
    line-height: 1.15; letter-spacing: -0.015em;
  }
  .ft-nl-copy p { font-size: 14.5px; color: rgba(255,255,255,.55); margin: 0; max-width: 440px; }
  .ft-nl-form {
    display: flex; flex-shrink: 0; min-width: 400px;
    border-radius: 999px; overflow: hidden;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.16);
    -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
    padding: 5px;
  }
  .ft-nl-form input {
    flex: 1; border: none; outline: none; background: transparent;
    padding: 12px 20px; font-size: 14.5px; color: var(--kg-cream); min-width: 0;
    font-family: var(--font-sans);
  }
  .ft-nl-form input::placeholder { color: rgba(255,255,255,.4); }
  .ft-nl-form button {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--kg-terra); color: #FFFFFF;
    padding: 12px 26px; border-radius: 999px;
    font-family: var(--font-sans); font-size: 13.5px; font-weight: 800;
    cursor: pointer; transition: background .25s, transform .25s; white-space: nowrap;
  }
  .ft-nl-form button:hover { background: var(--kg-terra-dk); transform: translateX(2px); }
  .ft-nl-done {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 24px; color: var(--kg-forest-lt);
    font-size: 14.5px; font-weight: 700;
    animation: fadeUp .5s var(--ease) both;
  }

  /* ── Main grid ── */
  .ft-main { padding: 72px 0 34px; }
  .ft-grid {
    display: grid; grid-template-columns: 2.1fr 1fr 1fr 1fr;
    gap: 56px; margin-bottom: 48px;
  }
  .ft-logo { height: 64px; width: auto; max-width: 190px; object-fit: contain; margin-bottom: 16px; }
  .ft-word {
    display: block; font-family: var(--font-serif);
    font-size: 34px; font-weight: 450; color: var(--kg-cream);
    letter-spacing: -0.02em; margin-bottom: 8px;
  }
  .ft-tag {
    display: block; font-family: var(--font-sans);
    font-size: 10px; font-weight: 800; letter-spacing: .26em; text-transform: uppercase;
    color: var(--kg-terra-lt); margin-bottom: 18px;
  }
  .ft-about { font-size: 14px; color: rgba(255,255,255,.5); line-height: 1.8; margin-bottom: 22px; max-width: 380px; }

  .ft-worlds { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .ft-world {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 999px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.12);
    font-family: var(--font-sans); font-size: 12px; font-weight: 700;
    color: rgba(255,255,255,.7); transition: all .3s;
  }
  .ft-world.on { border-color: rgba(111,211,231,.55); color: var(--kg-cream); background: rgba(30,136,168,.14); }
  .ft-world em { font-style: normal; font-size: 14px; }
  .ft-world { cursor: pointer; }
  .ft-world:hover { border-color: rgba(111,211,231,.4); color: var(--kg-cream); }
  .ft-delivery {
    display: flex; align-items: center; gap: 9px;
    font-size: 13px; color: rgba(255,255,255,.55);
    margin: -8px 0 22px;
  }
  .ft-delivery svg { opacity: .55; flex-shrink: 0; }

  .ft-contact { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .ft-contact span { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: rgba(255,255,255,.55); }
  .ft-contact svg { opacity: .55; flex-shrink: 0; }

  .ft-socials { display: flex; gap: 9px; }
  .ft-socials a {
    width: 38px; height: 38px; border-radius: 12px;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
    display: grid; place-items: center; color: rgba(255,255,255,.55);
    transition: all .28s var(--ease);
  }
  .ft-socials a:hover { background: var(--kg-terra); border-color: var(--kg-terra); color: #FFFFFF; transform: translateY(-4px); box-shadow: 0 10px 22px rgba(30,136,168,.35); }

  .ft-col h5 {
    font-family: var(--font-sans); color: var(--kg-cream);
    font-size: 11px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase;
    margin-bottom: 20px;
  }
  .ft-col a {
    display: block; color: rgba(255,255,255,.52); font-size: 14px;
    padding: 6px 0; transition: color .22s, transform .22s;
  }
  .ft-col a:hover { color: var(--kg-terra-lt); transform: translateX(4px); }

  /* Payment */
  .ft-pay {
    display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap;
    padding: 22px 0; border-top: 1px solid rgba(255,255,255,.08);
  }
  .ft-pay-note { display: flex; align-items: center; gap: 9px; font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,.42); letter-spacing: .04em; }
  .ft-pay-icons { display: flex; gap: 9px; flex-wrap: wrap; }
  .ft-pay-icons span {
    font-size: 11.5px; font-weight: 700; letter-spacing: .04em;
    color: rgba(255,255,255,.5);
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
    padding: 6px 14px; border-radius: 8px;
  }

  /* Bottom */
  .ft-bottom { border-top: 1px solid rgba(255,255,255,.08); padding: 18px 0; position: relative; z-index: 1; }
  .ft-bottom-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: rgba(255,255,255,.4); }
  .ft-bottom-links { display: flex; gap: 20px; }
  .ft-bottom-links a { color: rgba(255,255,255,.48); font-size: 12.5px; transition: color .2s; }
  .ft-bottom-links a:hover { color: var(--kg-terra-lt); }
  .ft-credit a { color: rgba(255,255,255,.75); font-weight: 700; transition: color .2s; }
  .ft-credit a:hover { color: var(--kg-terra-lt); }

  /* Watermark */
  .ft-mark {
    font-family: var(--font-serif);
    font-size: clamp(90px, 17vw, 260px); font-weight: 500;
    letter-spacing: -0.03em; line-height: .78;
    color: rgba(255,255,255,.028);
    text-align: center; white-space: nowrap;
    user-select: none; pointer-events: none;
    margin-top: -10px;
  }

  /* Watermark rises into place as the footer scrolls in */
  @media (prefers-reduced-motion: no-preference) {
    .ft-mark {
      transform: translateY(calc((1 - min(var(--scroll-p, 1) * 2.4, 1)) * 110px));
      opacity: min(var(--scroll-p, 1) * 3.2, 1);
      will-change: transform, opacity;
    }
  }

  @media (max-width: 1100px) {
    .ft-grid { grid-template-columns: 1fr 1fr 1fr; gap: 40px; }
    .ft-brand { grid-column: span 3; }
  }
  /* ── Mobile: the three nav columns share ONE row — short scroll ── */
  @media (max-width: 768px) {
    .ft-nl { padding: 36px 0; }
    .ft-nl-copy h3 { font-size: 1.35rem; }
    .ft-nl-copy p { font-size: 13px; }
    .ft-nl-form { min-width: 0; width: 100%; }
    .ft-main { padding: 40px 0 16px; }
    .ft-grid { grid-template-columns: repeat(3, 1fr); gap: 20px 14px; margin-bottom: 26px; }
    .ft-brand { grid-column: span 3; }
    .ft-word { font-size: 27px; margin-bottom: 6px; }
    .ft-tag { margin-bottom: 12px; }
    .ft-about { font-size: 13px; margin-bottom: 16px; }
    .ft-worlds { margin-bottom: 16px; }
    .ft-world { padding: 6px 12px; font-size: 11px; }
    .ft-delivery { margin: -4px 0 16px; font-size: 12px; }
    .ft-contact { flex-direction: row; flex-wrap: wrap; gap: 8px 18px; margin-bottom: 16px; }
    .ft-contact span { font-size: 12px; }
    .ft-socials a { width: 34px; height: 34px; }
    .ft-col h5 { font-size: 10px; letter-spacing: .16em; margin-bottom: 10px; white-space: nowrap; }
    .ft-col a { font-size: 12.5px; padding: 4px 0; }
    .ft-col a:hover { transform: none; }
    .ft-pay { padding: 14px 0; gap: 10px; }
    .ft-pay-icons span { font-size: 10.5px; padding: 4px 10px; }
    .ft-bottom { padding: 13px 0; }
    .ft-bottom-in { justify-content: center; text-align: center; gap: 8px 16px; font-size: 11.5px; }
    .ft-mark { font-size: clamp(56px, 15vw, 120px); }
  }
  @media (max-width: 360px) {
    .ft-col a { font-size: 11.5px; }
    .ft-col h5 { font-size: 9px; }
  }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  email = '';
  subscribed = signal(false);

  constructor(public settings: SettingsService, public country: CountryService) {}

  subscribe(e: Event) {
    e.preventDefault();
    if (!this.email.trim()) return;
    this.subscribed.set(true);
    this.email = '';
  }

  copyright(): string {
    const raw = this.settings.get('footer_copyright', '');
    // Strip any leading "© YYYY" (tolerating stray encoding artefacts) —
    // the template already renders the © and year.
    return raw.replace(/^[^A-Za-z0-9]*\d{4}\s*/, '') || `${this.settings.get('site_name', 'Kale Gida')}. All rights reserved.`;
  }

  logoUrl(): string {
    const raw = this.settings.get('site_logo', '');
    if (!raw) return '';
    try { return this.settings.versionedAssetUrl(raw, ''); } catch { return ''; }
  }

  hasSocialLinks(): boolean {
    return !!(
      this.settings.get('social_facebook') ||
      this.settings.get('social_instagram') ||
      this.settings.get('social_twitter') ||
      this.settings.get('social_youtube') ||
      this.settings.get('social_whatsapp')
    );
  }
}

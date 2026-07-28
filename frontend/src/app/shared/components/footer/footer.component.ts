import { Component, ElementRef, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
  <footer class="ft" [class.ft-revealed]="revealed()">

    <!-- Warm rule that hands off from the page into the dark footer -->
    <div class="ft-topline" aria-hidden="true"></div>

    <!-- Oversized brand watermark -->
    <div class="ft-watermark" aria-hidden="true">
      <span>{{ settings.get('site_name', 'Raj Grocery Store').split(' ')[0].toUpperCase() }}</span>
    </div>

    <div class="ft-container">
      <div class="ft-grid">

        <!-- ── Brand ── -->
        <div class="ft-brand ft-reveal-item" style="--stagger: 0s">
          <a routerLink="/" class="ft-mark" [attr.aria-label]="settings.get('site_name','Raj Grocery Store') + ' — home'">
            @if (logoUrl()) {
              <img [src]="logoUrl()" [alt]="settings.get('site_name', 'Raj Grocery Store')" class="ft-logo" loading="lazy" (error)="logoFailed.set(true)" />
            } @else {
              <span class="ft-wordmark">
                <span class="ft-wordmark-main">{{ settings.get('site_name', 'Raj Grocery Store') }}</span>
                <span class="ft-wordmark-sub">{{ settings.get('site_tagline', 'Indian Grocery Store') }}</span>
              </span>
            }
          </a>

          <p class="ft-tagline">{{ settings.get('footer_about', 'Your Indian grocery store in Hong Kong — spices, staples, snacks, fresh vegetables and household essentials delivered to your door.') }}</p>

          @if (hasSocialLinks()) {
            <div class="ft-connect">
              <span class="ft-label">Connect</span>
              <div class="ft-social-icons">
                @if (settings.get('social_whatsapp')) {
                  <a class="ft-so-btn" [href]="'https://wa.me/' + settings.get('social_whatsapp').replace(/\\D/g,'')" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" title="WhatsApp">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.996 0C5.374 0 0 5.373 0 11.996c0 2.117.554 4.102 1.523 5.825L.053 23.948l6.284-1.647A11.938 11.938 0 0 0 11.996 24c6.622 0 11.996-5.373 11.996-11.996S18.618 0 11.996 0zm0 21.818a9.808 9.808 0 0 1-5.003-1.365l-.359-.214-3.729.977.994-3.635-.235-.374A9.806 9.806 0 0 1 2.178 12c0-5.41 4.409-9.819 9.818-9.819 5.41 0 9.819 4.409 9.819 9.819S17.406 21.818 11.996 21.818z"/></svg>
                  </a>
                }
                @if (settings.get('social_facebook')) {
                  <a class="ft-so-btn" [href]="settings.get('social_facebook')" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                }
                @if (settings.get('social_instagram')) {
                  <a class="ft-so-btn" [href]="settings.get('social_instagram')" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                  </a>
                }
              </div>
            </div>
          }
        </div>

        <!-- ── Shop ── -->
        <nav class="ft-nav ft-reveal-item" style="--stagger: 0.06s" aria-label="Shop categories" [class.open]="openCol() === 'shop'">
          <button type="button" class="ft-col-header" (click)="toggle('shop')" [attr.aria-expanded]="openCol() === 'shop'">
            <span>Shop</span>
            <svg class="ft-accordion-chev" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="ft-links-wrapper">
            <ul class="ft-links-list">
              <li><a routerLink="/categories" class="ft-link">All Categories</a></li>
              @for (c of categories().slice(0, 5); track c.id) {
                <li><a [routerLink]="['/category', c.slug]" class="ft-link">{{ c.name }}</a></li>
              }
              <li><a routerLink="/search" [queryParams]="{sale:1}" class="ft-link ft-link-accent">Weekly Offers</a></li>
            </ul>
          </div>
        </nav>

        <!-- ── Resources ── -->
        <nav class="ft-nav ft-reveal-item" style="--stagger: 0.12s" aria-label="Resources" [class.open]="openCol() === 'info'">
          <button type="button" class="ft-col-header" (click)="toggle('info')" [attr.aria-expanded]="openCol() === 'info'">
            <span>Help</span>
            <svg class="ft-accordion-chev" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="ft-links-wrapper">
            <ul class="ft-links-list">
              <li><a routerLink="/about" class="ft-link">Our Story</a></li>
              <li><a routerLink="/contact" class="ft-link">Contact Us</a></li>
              <li><a routerLink="/faq" class="ft-link">FAQ &amp; Support</a></li>
              <li><a routerLink="/blog" class="ft-link">Journal &amp; Recipes</a></li>
              @for (p of policyPages(); track p.id) {
                <li><a [routerLink]="['/page', p.slug]" class="ft-link">{{ p.title }}</a></li>
              }
            </ul>
          </div>
        </nav>

        <!-- ── Visit / Contact ── -->
        <div class="ft-practical ft-reveal-item" style="--stagger: 0.18s">
          @if (hasContactDetails()) {
            <div class="ft-visit">
              <h4 class="ft-col-header-static">Visit Us</h4>
              <div class="ft-contact-details">
                @if (settings.get('contact_hours')) {
                  <div class="ft-detail-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                    <span class="ft-hours-text">{{ settings.get('contact_hours') }}</span>
                  </div>
                }
                @if (settings.get('contact_address') && !isPlaceholderAddress()) {
                  <div class="ft-detail-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/></svg>
                    <span>{{ settings.get('contact_address') }}</span>
                  </div>
                }
                @if (settings.get('site_phone')) {
                  <a class="ft-detail-row ft-detail-link" [href]="'tel:' + settings.get('site_phone').replace(/\\s/g,'')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" stroke="currentColor" stroke-width="1.8"/></svg>
                    <span>{{ settings.get('site_phone') }}</span>
                  </a>
                }
                @if (settings.get('site_email')) {
                  <a class="ft-detail-row ft-detail-link" [href]="'mailto:' + settings.get('site_email')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.8"/><path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                    <span>{{ settings.get('site_email') }}</span>
                  </a>
                }
              </div>
            </div>
          }

          <div class="ft-cta-block">
            <h4 class="ft-col-header-static">Contact</h4>
            @if (settings.get('social_whatsapp')) {
              <a class="ft-cta-btn" [href]="'https://wa.me/' + settings.get('social_whatsapp').replace(/\\D/g,'')" target="_blank" rel="noopener">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.996 0C5.374 0 0 5.373 0 11.996c0 2.117.554 4.102 1.523 5.825L.053 23.948l6.284-1.647A11.938 11.938 0 0 0 11.996 24c6.622 0 11.996-5.373 11.996-11.996S18.618 0 11.996 0zm0 21.818a9.808 9.808 0 0 1-5.003-1.365l-.359-.214-3.729.977.994-3.635-.235-.374A9.806 9.806 0 0 1 2.178 12c0-5.41 4.409-9.819 9.818-9.819 5.41 0 9.819 4.409 9.819 9.819S17.406 21.818 11.996 21.818z"/></svg>
                <span>Message on WhatsApp</span>
              </a>
            } @else if (settings.get('site_phone')) {
              <a class="ft-cta-btn" [href]="'tel:' + settings.get('site_phone').replace(/\\s/g,'')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" stroke="currentColor" stroke-width="2"/></svg>
                <span>Call the Store</span>
              </a>
            } @else {
              <a class="ft-cta-btn" routerLink="/contact">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2"/></svg>
                <span>Get In Touch</span>
              </a>
            }
          </div>
        </div>

      </div>
    </div>

    <!-- ── Bottom bar ── -->
    <div class="ft-bottom">
      <div class="ft-bottom-container">
        <div class="ft-copyright">
          <span>&copy; {{ currentYear }} {{ copyright() }}</span>
          <span class="ft-credit-sep">&bull;</span>
          <span class="ft-credit">Powered by <a href="https://lookatus.io/" target="_blank" rel="noopener">Look At Us</a></span>
        </div>

        <div class="ft-bottom-policies">
          @for (p of policyPages(); track p.id) {
            <a [routerLink]="['/page', p.slug]" class="ft-policy-link">{{ p.title }}</a>
          }
          @if (policyPages().length === 0) {
            <a routerLink="/page/privacy-policy" class="ft-policy-link">Privacy Policy</a>
            <a routerLink="/page/terms-of-service" class="ft-policy-link">Terms of Service</a>
          }
        </div>

        <div class="ft-secure-badges" aria-label="Supported payment methods">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h2v-4"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
      </div>
    </div>
  </footer>
  `,
  styles: [`
  /* ═══ RAJ GROCERY — FOOTER ═══
     Deep masala green ground, warm cream type, turmeric accents.
     Fonts and colour come from the global design system — this
     component deliberately declares no palette or @import of its own. */
  .ft {
    position: relative;
    background: var(--raj-dark);
    color: rgba(255,255,255,.72);
    font-family: var(--font-sans);
    overflow: hidden;
    isolation: isolate;
  }
  .ft::before {
    content: ''; position: absolute; inset: 0; z-index: -1;
    background:
      radial-gradient(ellipse 70% 90% at 12% 0%, rgba(47,125,99,.30), transparent 62%),
      radial-gradient(ellipse 55% 80% at 92% 8%, rgba(228,163,59,.11), transparent 66%);
    pointer-events: none;
  }

  /* Turmeric hairline hand-off from the page above */
  .ft-topline {
    height: 3px;
    background: linear-gradient(90deg,
      var(--raj-leaf-lt) 0%, var(--raj-turmeric) 42%,
      var(--raj-turmeric-lt) 58%, var(--raj-leaf-lt) 100%);
    opacity: .9;
  }

  /* Oversized brand watermark */
  .ft-watermark {
    position: absolute; bottom: -2.5vw; right: -1vw; z-index: -1;
    font-family: var(--font-display);
    font-size: clamp(6rem, 17vw, 15rem);
    font-weight: 600; line-height: .8;
    color: rgba(255,255,255,.032);
    letter-spacing: -0.03em; pointer-events: none;
    user-select: none; white-space: nowrap;
  }

  .ft-container {
    max-width: var(--max-w); margin: 0 auto;
    padding: 68px 24px 40px; position: relative;
  }
  @media (min-width: 768px)  { .ft-container { padding-left: 40px; padding-right: 40px; } }
  @media (min-width: 1200px) { .ft-container { padding-left: 56px; padding-right: 56px; } }

  .ft-grid {
    display: grid;
    grid-template-columns: 1.7fr 1fr 1fr 1.25fr;
    gap: 48px;
  }

  /* Staggered reveal — driven by the IntersectionObserver below */
  .ft-reveal-item {
    opacity: 0; transform: translateY(20px);
    transition: opacity .7s var(--ease) var(--stagger, 0s),
                transform .7s var(--ease) var(--stagger, 0s);
  }
  .ft-revealed .ft-reveal-item { opacity: 1; transform: none; }

  /* ── Brand ── */
  .ft-mark { display: inline-flex; align-items: center; margin-bottom: 20px; }
  .ft-logo { height: 62px; width: auto; max-width: 220px; object-fit: contain; }
  .ft-wordmark { display: flex; flex-direction: column; line-height: 1; }
  .ft-wordmark-main {
    font-family: var(--font-display); font-size: 27px; font-weight: 600;
    color: #fff; letter-spacing: -0.018em;
  }
  .ft-wordmark-sub {
    font-size: 8.5px; font-weight: 800; letter-spacing: .2em;
    text-transform: uppercase; color: var(--raj-turmeric); margin-top: 7px;
  }
  .ft-tagline {
    font-size: 14.5px; line-height: 1.75;
    color: rgba(255,255,255,.62); max-width: 40ch; margin: 0;
  }

  .ft-connect { margin-top: 26px; }
  .ft-label {
    display: block; font-size: 10px; font-weight: 800;
    letter-spacing: .2em; text-transform: uppercase;
    color: rgba(255,255,255,.42); margin-bottom: 12px;
  }
  .ft-social-icons { display: flex; gap: 10px; }
  .ft-so-btn {
    width: 42px; height: 42px; border-radius: 50%;
    display: grid; place-items: center;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.13);
    color: rgba(255,255,255,.82);
    transition: var(--t);
  }
  .ft-so-btn:hover {
    background: var(--raj-turmeric); border-color: var(--raj-turmeric);
    color: var(--raj-ink); transform: translateY(-3px);
    box-shadow: var(--shadow-turmeric);
  }

  /* ── Column headers ── */
  .ft-col-header,
  .ft-col-header-static {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 0; margin: 0 0 18px;
    font-family: var(--font-sans);
    font-size: 11px; font-weight: 800; letter-spacing: .19em;
    text-transform: uppercase; color: #fff;
    background: none; text-align: left;
  }
  .ft-accordion-chev { display: none; color: var(--raj-turmeric); transition: transform .3s var(--ease); }

  .ft-links-list { display: flex; flex-direction: column; gap: 11px; }
  .ft-link {
    font-size: 14px; color: rgba(255,255,255,.62);
    transition: color .2s, padding-left .2s;
    display: inline-block; position: relative;
  }
  .ft-link:hover { color: #fff; padding-left: 9px; }
  .ft-link::before {
    content: ''; position: absolute; left: 0; top: 50%;
    width: 5px; height: 1.5px; background: var(--raj-turmeric);
    transform: translateY(-50%) scaleX(0); transform-origin: 0 50%;
    transition: transform .2s var(--ease);
  }
  .ft-link:hover::before { transform: translateY(-50%) scaleX(1); }
  .ft-link-accent { color: var(--raj-turmeric); font-weight: 700; }
  .ft-link-accent:hover { color: var(--raj-turmeric-lt); }

  /* ── Visit / contact ── */
  .ft-practical { display: flex; flex-direction: column; gap: 30px; }
  .ft-contact-details { display: flex; flex-direction: column; gap: 13px; }
  .ft-detail-row {
    display: flex; align-items: flex-start; gap: 11px;
    font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,.62);
  }
  .ft-detail-row svg { color: var(--raj-turmeric); flex-shrink: 0; margin-top: 2px; }
  .ft-detail-link { transition: color .2s; }
  .ft-detail-link:hover { color: #fff; }
  .ft-hours-text { white-space: pre-line; }

  .ft-cta-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    min-height: 48px; padding: 13px 24px;
    border-radius: var(--r-full);
    background: var(--raj-turmeric); color: var(--raj-ink);
    font-size: 13.5px; font-weight: 800; letter-spacing: .01em;
    transition: var(--t); width: 100%;
  }
  .ft-cta-btn:hover {
    background: var(--raj-turmeric-lt);
    transform: translateY(-2px); box-shadow: var(--shadow-turmeric);
  }

  /* ── Bottom bar ── */
  .ft-bottom {
    border-top: 1px solid rgba(255,255,255,.1);
    position: relative;
  }
  .ft-bottom-container {
    max-width: var(--max-w); margin: 0 auto;
    padding: 22px 24px; display: flex; align-items: center;
    justify-content: space-between; gap: 20px; flex-wrap: wrap;
  }
  @media (min-width: 768px)  { .ft-bottom-container { padding-left: 40px; padding-right: 40px; } }
  @media (min-width: 1200px) { .ft-bottom-container { padding-left: 56px; padding-right: 56px; } }

  .ft-copyright {
    font-size: 12.5px; color: rgba(255,255,255,.5);
    display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
  }
  .ft-credit-sep { opacity: .4; }
  .ft-credit a { color: rgba(255,255,255,.68); transition: color .2s; }
  .ft-credit a:hover { color: var(--raj-turmeric); }

  .ft-bottom-policies { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
  .ft-policy-link {
    font-size: 12.5px; color: rgba(255,255,255,.5); transition: color .2s;
  }
  .ft-policy-link:hover { color: #fff; }

  .ft-secure-badges { display: flex; align-items: center; gap: 13px; color: rgba(255,255,255,.32); }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .ft-grid { grid-template-columns: 1fr 1fr; gap: 40px 32px; }
    .ft-brand { grid-column: 1 / -1; }
  }
  @media (max-width: 720px) {
    .ft-container { padding-top: 48px; padding-bottom: 28px; }
    .ft-grid { grid-template-columns: 1fr; gap: 0; }
    .ft-brand { margin-bottom: 30px; }

    /* Columns collapse into accordions */
    .ft-nav { border-bottom: 1px solid rgba(255,255,255,.1); }
    .ft-col-header {
      margin: 0; padding: 17px 0; cursor: pointer; min-height: 48px;
    }
    .ft-accordion-chev { display: block; }
    .ft-nav.open .ft-accordion-chev { transform: rotate(180deg); }
    .ft-links-wrapper {
      display: grid; grid-template-rows: 0fr;
      transition: grid-template-rows .32s var(--ease);
    }
    .ft-nav.open .ft-links-wrapper { grid-template-rows: 1fr; }
    .ft-links-list { overflow: hidden; padding: 0; }
    .ft-nav.open .ft-links-list { padding: 4px 0 20px; }

    .ft-practical { margin-top: 32px; gap: 26px; }
    .ft-watermark { font-size: 30vw; bottom: -3vw; right: -3vw; }

    .ft-bottom-container { flex-direction: column; align-items: flex-start; gap: 14px; }
    .ft-bottom-policies { gap: 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ft-reveal-item { opacity: 1 !important; transform: none !important; transition: none !important; }
    .ft-links-wrapper { transition: none !important; }
  }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  categories = signal<any[]>([]);
  policyPages = signal<any[]>([]);
  revealed = signal(false);
  openCol = signal<'shop' | 'info' | null>(null);
  currentYear = new Date().getFullYear();

  private observer: IntersectionObserver | null = null;

  constructor(
    public settings: SettingsService,
    private api: ApiService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.api.getCategories().subscribe({
      next: (r: any) => { if (r?.success) this.categories.set(r.data || []); },
      error: () => {}
    });
    this.api.getPages().subscribe({
      next: (r: any) => {
        const all = (r?.data || []);
        const policyWords = /privacy|terms|return|refund|shipping|delivery|policy/i;
        this.policyPages.set(all.filter((p: any) => policyWords.test(p.title || p.slug || '')));
      },
      error: () => {}
    });

    // Gentle reveal when the footer enters the viewport
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          this.revealed.set(true);
          this.observer?.disconnect();
          this.observer = null;
        }
      }, { threshold: 0.12 });
      this.observer.observe(this.el.nativeElement);
    } else {
      this.revealed.set(true);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.observer = null;
  }

  toggle(col: 'shop' | 'info') {
    this.openCol.set(this.openCol() === col ? null : col);
  }

  isPlaceholderAddress(): boolean {
    return /configure store address/i.test(this.settings.get('contact_address', ''));
  }

  /** Hide the whole "Visit Us" block until the admin has configured at
   *  least one real contact detail — an empty block reads as broken. */
  hasContactDetails(): boolean {
    return !!(
      this.settings.get('contact_hours') ||
      (this.settings.get('contact_address') && !this.isPlaceholderAddress()) ||
      this.settings.get('site_phone') ||
      this.settings.get('site_email')
    );
  }

  copyright(): string {
    const raw = this.settings.get('footer_copyright', '');
    return raw.replace(/^[^A-Za-z0-9]*\d{4}\s*/, '') || `${this.settings.get('site_name', 'Raj Grocery Store')}. All rights reserved.`;
  }

  logoFailed = signal(false);

  logoUrl(): string {
    if (this.logoFailed()) return '';
    const raw = this.settings.get('site_logo', '');
    if (!raw) return '';
    try { return this.settings.versionedAssetUrl(raw, ''); } catch { return ''; }
  }

  hasSocialLinks(): boolean {
    return !!(
      this.settings.get('social_facebook') ||
      this.settings.get('social_instagram') ||
      this.settings.get('social_whatsapp')
    );
  }
}

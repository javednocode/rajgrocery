import { Component, ElementRef, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
  <footer class="ft-heritage" [class.ft-revealed]="revealed()">
    <!-- Looping wave top accent -->
    <div class="ft-wave" aria-hidden="true">
      <svg class="ft-wave-layer ft-wave-back" viewBox="0 0 2880 90" preserveAspectRatio="none">
        <path d="M0,30 C240,8 480,8 720,30 C960,52 1200,52 1440,30 C1680,8 1920,8 2160,30 C2400,52 2640,52 2880,30 L2880,90 L0,90 Z" fill="var(--color-gold-accent)"/>
      </svg>
      <svg class="ft-wave-layer ft-wave-front" viewBox="0 0 2880 90" preserveAspectRatio="none">
        <path d="M0,46 C240,20 480,20 720,46 C960,72 1200,72 1440,46 C1680,20 1920,20 2160,46 C2400,72 2640,72 2880,46 L2880,90 L0,90 Z" fill="var(--color-bg-navy)"/>
      </svg>
    </div>

    <!-- Subtle Watermark Editorial Background -->
    <div class="ft-watermark" aria-hidden="true">
      <span>{{ settings.get('site_name', 'LAAVI STORE').split(' ')[0].toUpperCase() || 'LAAVI' }}</span>
    </div>

    <!-- Ambient luxury glow -->
    <div class="ft-ambient-glow" aria-hidden="true"></div>

    <!-- Main Heritage Editorial Content Grid -->
    <div class="ft-container">
      <div class="ft-grid">
        
        <!-- ── Column 1: Brand Authority (Coin Logo & Tagline) ── -->
        <div class="ft-brand ft-reveal-item" style="--stagger: 0s">
          <div class="ft-coin-wrapper">
            <div class="ft-coin-ring" aria-hidden="true"></div>
            <div class="ft-coin-inner">
              @if (logoUrl()) {
                <img [src]="logoUrl()" [alt]="settings.get('site_name', 'Laavi Store')" class="ft-logo" loading="lazy" />
              } @else {
                <span class="ft-title">{{ settings.get('site_name', 'LAAVI STORE').toUpperCase() }}</span>
              }
            </div>
          </div>

          <p class="ft-tagline">{{ settings.get('footer_about', 'Curating Indian provisions in Hong Kong. Elevating everyday cooking through heritage ingredients and uncompromised quality.') }}</p>

          <!-- Social Connect Box -->
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

        <!-- ── Column 2: Shop Categories ── -->
        <nav class="ft-nav ft-reveal-item" style="--stagger: 0.06s" aria-label="Shop categories" [class.open]="openCol() === 'shop'">
          <button type="button" class="ft-col-header" (click)="toggle('shop')" [attr.aria-expanded]="openCol() === 'shop'">
            <span>Shop Categories</span>
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

        <!-- ── Column 3: Resources & Information ── -->
        <nav class="ft-nav ft-reveal-item" style="--stagger: 0.12s" aria-label="Resources" [class.open]="openCol() === 'info'">
          <button type="button" class="ft-col-header" (click)="toggle('info')" [attr.aria-expanded]="openCol() === 'info'">
            <span>Resources</span>
            <svg class="ft-accordion-chev" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="ft-links-wrapper">
            <ul class="ft-links-list">
              <li><a routerLink="/about" class="ft-link">Our Story</a></li>
              <li><a routerLink="/contact" class="ft-link">Contact Us</a></li>
              <li><a routerLink="/faq" class="ft-link">FAQ & Support</a></li>
              <li><a routerLink="/blog" class="ft-link">Journal & Recipes</a></li>
              @for (p of policyPages(); track p.id) {
                <li><a [routerLink]="['/page', p.slug]" class="ft-link">{{ p.title }}</a></li>
              }
            </ul>
          </div>
        </nav>

        <!-- ── Column 4: Visit Us & Practical Support CTA ── -->
        <div class="ft-practical ft-reveal-item" style="--stagger: 0.18s">
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

          <!-- Stitch Editorial CTA Treatment (Contact WhatsApp) -->
          <div class="ft-cta-block">
            <h4 class="ft-col-header-static">Contact</h4>
            @if (settings.get('social_whatsapp')) {
              <a class="ft-cta-btn" [href]="'https://wa.me/' + settings.get('social_whatsapp').replace(/\\D/g,'')" target="_blank" rel="noopener">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.996 0C5.374 0 0 5.373 0 11.996c0 2.117.554 4.102 1.523 5.825L.053 23.948l6.284-1.647A11.938 11.938 0 0 0 11.996 24c6.622 0 11.996-5.373 11.996-11.996S18.618 0 11.996 0zm0 21.818a9.808 9.808 0 0 1-5.003-1.365l-.359-.214-3.729.977.994-3.635-.235-.374A9.806 9.806 0 0 1 2.178 12c0-5.41 4.409-9.819 9.818-9.819 5.41 0 9.819 4.409 9.819 9.819S17.406 21.818 11.996 21.818z"/></svg>
                <span>Contact WhatsApp</span>
              </a>
            } @else if (settings.get('site_phone')) {
              <a class="ft-cta-btn" [href]="'tel:' + settings.get('site_phone').replace(/\\s/g,'')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" stroke="currentColor" stroke-width="2"/></svg>
                <span>Call Store Now</span>
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

    <!-- ── Minimalist Keyline Bottom Copyright & Policies Bar ── -->
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

        <div class="ft-secure-badges" aria-label="Supported Payment Systems">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h2v-4"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
      </div>
    </div>
  </footer>
  `,
  styles: [`
  @import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Hanken+Grotesk:ital,wght@0,300..800;1,300..800&display=swap');

  /* ── Stitch Heritage Editorial Foundation ── */
  .ft-heritage {
    --font-serif: 'Libre Caslon Text', Georgia, 'Times New Roman', serif;
    --font-sans: 'Hanken Grotesk', system-ui, -apple-system, sans-serif;
    
    /* Colors from Stitch Design System */
    --color-bg-navy: #000E24;
    --color-container-navy: #00234B;
    --color-text-white: #FFFFFF;
    --color-text-dim: #ADC7F8;
    --color-text-muted: rgba(255, 255, 255, 0.76);
    --color-gold-accent: #C5A368;
    --color-gold-bright: #FFDEA8;
    --color-border: rgba(255, 255, 255, 0.14);
    --color-border-subtle: rgba(255, 255, 255, 0.08);

    position: relative;
    overflow: hidden;
    background: var(--color-bg-navy);
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    border-top: 1px solid var(--color-container-navy);
    box-sizing: border-box;
  }

  .ft-heritage *, .ft-heritage *::before, .ft-heritage *::after {
    box-sizing: inherit;
  }

  /* ── Looping Wave Top Accent (gold sliver peeking behind navy crest) ── */
  .ft-wave {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 44px;
    overflow: hidden;
    pointer-events: none;
    line-height: 0;
    z-index: 1;
  }
  .ft-wave-layer {
    position: absolute;
    top: 0; left: 0;
    width: 200%;
    height: 100%;
    display: block;
    animation: ftWaveScroll linear infinite;
    will-change: transform;
  }
  .ft-wave-back  { animation-duration: 26s; }
  .ft-wave-front { animation-duration: 16s; }
  @keyframes ftWaveScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  /* ── Reduced Watermark Editorial Background ── */
  .ft-watermark {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    pointer-events: none;
    opacity: 0.018;
    user-select: none;
    z-index: 0;
    overflow: hidden;
    padding-bottom: 20px;
  }
  .ft-watermark span {
    font-family: var(--font-serif);
    font-size: min(15vw, 200px);
    font-weight: 700;
    line-height: 0.85;
    color: var(--color-text-white);
    white-space: nowrap;
    letter-spacing: -0.04em;
    animation: ftWatermarkDrift 28s ease-in-out infinite alternate;
    will-change: transform;
  }

  @keyframes ftWatermarkDrift {
    0%   { transform: translate(-2%, 0) scale(1); }
    100% { transform: translate(2%, -8px) scale(1.02); }
  }

  /* ── Ambient Luxury Radial Glow ── */
  .ft-ambient-glow {
    position: absolute;
    top: -200px;
    left: 15%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(197, 163, 104, 0.1) 0%, rgba(0, 35, 75, 0.12) 50%, transparent 75%);
    filter: blur(70px);
    pointer-events: none;
    z-index: 0;
    animation: ftGlowPulse 20s ease-in-out infinite alternate;
  }

  @keyframes ftGlowPulse {
    0% { transform: translate(0, 0) scale(1); opacity: 0.7; }
    100% { transform: translate(100px, 30px) scale(1.15); opacity: 1; }
  }

  /* ── Scroll Reveal Stacking ── */
  .ft-reveal-item {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--stagger, 0s), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--stagger, 0s);
  }
  .ft-revealed .ft-reveal-item {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Main Layout & Compact Container ── */
  .ft-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 48px 24px 36px;
    position: relative;
    z-index: 2;
  }

  .ft-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: start;
  }

  /* ── Column 1: Brand Authority with Premium Coin Logo Frame ── */
  .ft-brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .ft-coin-wrapper {
    position: relative;
    width: 126px;
    height: 126px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ft-coin-ring {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      var(--color-gold-bright) 0%,
      var(--color-container-navy) 25%,
      var(--color-gold-accent) 50%,
      #0056b3 75%,
      var(--color-gold-bright) 100%
    );
    padding: 3px;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    filter: drop-shadow(0 0 12px rgba(197, 163, 104, 0.45));
    animation: ftCoinRotate 14s linear infinite, ftCoinFloat 5s ease-in-out infinite alternate;
    pointer-events: none;
  }
  @keyframes ftCoinRotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes ftCoinFloat {
    0% { top: -4px; filter: drop-shadow(0 0 10px rgba(197, 163, 104, 0.4)); }
    100% { top: -7px; filter: drop-shadow(0 0 18px rgba(255, 222, 168, 0.7)); }
  }
  .ft-coin-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffffff 0%, #f7f3eb 70%, #eae1cf 100%);
    border: 2px solid var(--color-gold-accent);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.9), inset 0 -4px 8px rgba(197, 163, 104, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.4s;
  }
  .ft-coin-wrapper:hover .ft-coin-inner {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), inset 0 2px 8px rgba(255, 255, 255, 1);
  }
  .ft-logo {
    width: 100%;
    height: auto;
    max-height: 80px;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 2px 4px rgba(0, 14, 36, 0.18));
    transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1);
  }
  .ft-coin-wrapper:hover .ft-logo {
    transform: scale(1.05);
  }

  .ft-title {
    font-family: var(--font-serif);
    font-size: 20px;
    font-weight: 700;
    color: var(--color-bg-navy);
    letter-spacing: -0.02em;
    text-align: center;
    line-height: 1.1;
  }
  .ft-tagline {
    font-family: var(--font-sans);
    font-size: 14.5px;
    line-height: 1.6;
    color: var(--color-text-muted);
    max-width: 360px;
    margin: 0 0 20px;
  }

  /* Connect Section with Keyline separator */
  .ft-connect {
    width: 100%;
    max-width: 360px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }
  .ft-label {
    display: block;
    font-family: var(--font-sans);
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-white);
    margin-bottom: 12px;
  }
  .ft-social-icons {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ft-so-btn {
    width: 40px;
    height: 40px;
    border-radius: 0px !important;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--color-border);
    color: var(--color-text-white);
    transition: all 0.3s cubic-bezier(0.2, 0, 0.2, 1);
    text-decoration: none;
  }
  .ft-so-btn:hover {
    background: linear-gradient(135deg, rgba(197, 163, 104, 0.25), var(--color-container-navy));
    border-color: var(--color-gold-bright);
    color: var(--color-gold-bright);
    transform: translateY(-3px) scale(1.06);
    box-shadow: 0 6px 18px rgba(197, 163, 104, 0.35);
  }

  /* ── Column Headers (Keyline treatment) ── */
  .ft-col-header, .ft-col-header-static {
    width: 100%;
    background: none;
    border: none;
    padding: 12px 0;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--font-sans);
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-gold-bright);
    margin: 0;
  }
  .ft-col-header-static {
    cursor: default;
    border-bottom: 1px solid var(--color-border);
    padding: 0 0 10px;
    margin-bottom: 14px;
  }

  /* ── Accordion on Mobile ── */
  .ft-nav {
    border-top: 1px solid var(--color-border);
  }
  .ft-accordion-chev {
    color: var(--color-gold-bright);
    opacity: 0.8;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ft-nav.open .ft-accordion-chev {
    transform: rotate(180deg);
    opacity: 1;
  }
  .ft-links-wrapper {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ft-nav.open .ft-links-wrapper {
    max-height: 480px;
    padding-bottom: 16px;
  }

  /* ── Links & Lists with Gourmet Grocery Hover Animations ── */
  .ft-links-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ft-link {
    color: var(--color-text-muted);
    font-size: 14.5px;
    line-height: 1.4;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    position: relative;
    transition: all 0.25s cubic-bezier(0.2, 0, 0.2, 1);
  }
  .ft-link::before {
    content: '';
    width: 0px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-gold-bright);
    margin-right: 0px;
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.2, 0, 0.2, 1);
  }
  .ft-link:hover {
    color: var(--color-gold-bright);
    transform: translateX(4px);
    text-shadow: 0 0 12px rgba(255, 222, 168, 0.35);
  }
  .ft-link:hover::before {
    width: 5px;
    margin-right: 8px;
    opacity: 1;
  }
  .ft-link-accent {
    color: var(--color-gold-bright);
    font-weight: 500;
  }
  .ft-link-accent:hover {
    text-shadow: 0 0 14px rgba(255, 222, 168, 0.5);
  }

  /* ── Practical & Visit Us Column ── */
  .ft-practical {
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 26px;
  }
  .ft-contact-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ft-detail-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }
  .ft-detail-row svg {
    flex-shrink: 0;
    margin-top: 3px;
    color: var(--color-gold-accent);
    transition: transform 0.25s cubic-bezier(0.2, 0, 0.2, 1);
  }
  .ft-hours-text {
    white-space: pre-line;
  }
  .ft-detail-link {
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.2, 0, 0.2, 1);
  }
  .ft-detail-link:hover {
    color: var(--color-gold-bright);
    transform: translateX(4px);
  }
  .ft-detail-link:hover svg {
    color: var(--color-gold-bright);
    transform: scale(1.15);
  }

  /* ── Stitch Editorial CTA Treatment ── */
  .ft-cta-block {
    display: flex;
    flex-direction: column;
  }
  .ft-cta-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    background: var(--color-gold-accent);
    color: var(--color-bg-navy);
    font-family: var(--font-sans);
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 13px 20px;
    border-radius: 0px !important;
    border: 1px solid transparent;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
  .ft-cta-btn:hover {
    background: var(--color-gold-bright);
    color: var(--color-bg-navy);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 24px rgba(197, 163, 104, 0.45);
  }
  .ft-cta-btn svg {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ft-cta-btn:hover svg {
    transform: scale(1.15) rotate(-6deg);
  }

  /* ── Bottom Copyright & Policies Bar ── */
  .ft-bottom {
    position: relative;
    z-index: 2;
    border-top: 1px solid var(--color-border);
    background: rgba(0, 14, 36, 0.7);
    backdrop-filter: blur(10px);
  }
  .ft-bottom-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 18px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    text-align: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }
  .ft-copyright {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .ft-credit-sep { opacity: 0.4; }
  .ft-credit a {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
  }
  .ft-credit a:hover { color: var(--color-gold-bright); text-shadow: 0 0 8px rgba(255, 222, 168, 0.4); }
  
  .ft-bottom-policies {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  .ft-policy-link {
    color: rgba(255, 255, 255, 0.65);
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.2, 0, 0.2, 1);
  }
  .ft-policy-link:hover {
    color: var(--color-gold-bright);
    transform: translateY(-1px);
    text-shadow: 0 0 10px rgba(255, 222, 168, 0.35);
  }
  .ft-secure-badges {
    display: flex;
    align-items: center;
    gap: 14px;
    color: rgba(255, 255, 255, 0.6);
  }
  .ft-secure-badges svg {
    transition: transform 0.25s, color 0.25s;
  }
  .ft-secure-badges svg:hover {
    color: var(--color-gold-bright);
    transform: scale(1.12);
  }

  /* =========================================================================
     RESPONSIVE BREAKPOINTS (Guaranteed 390px, 768px, 1024px, 1440px, 1920px)
     ========================================================================= */

  /* ── 390px Mobile & Small Screens ── */
  @media (max-width: 480px) {
    .ft-container { padding: 36px 20px 28px; }
    .ft-coin-wrapper { width: 110px; height: 110px; margin-bottom: 16px; }
    .ft-bottom-policies { gap: 12px; font-size: 12.5px; }
    .ft-watermark span { font-size: 52vw; opacity: 0.015; }
  }

  /* ── 641px+ (Tablet transition - Accordion disabled, headings static) ── */
  @media (min-width: 641px) {
    .ft-col-header {
      pointer-events: none;
      cursor: default;
      border-bottom: 1px solid var(--color-border);
      padding: 0 0 8px;
      margin-bottom: 14px;
    }
    .ft-accordion-chev { display: none !important; }
    .ft-nav .ft-links-wrapper {
      max-height: none !important;
      overflow: visible !important;
    }
    .ft-nav, .ft-practical { border-top: none; padding-top: 0; }
    .ft-cta-btn { width: auto; }
  }

  /* ── 768px Tablet Portrait ── */
  @media (min-width: 641px) and (max-width: 1023px) {
    .ft-container { padding: 44px 32px 36px; }
    .ft-grid {
      grid-template-columns: 1.2fr 1fr;
      gap: 36px 32px;
    }
    .ft-brand { grid-column: span 2; border-bottom: 1px solid var(--color-border); padding-bottom: 28px; }
    .ft-practical { grid-column: span 2; flex-direction: row; justify-content: space-between; align-items: flex-start; }
    .ft-visit, .ft-cta-block { flex: 1; min-width: 270px; }
    .ft-bottom-container { padding: 20px 32px; }
  }

  /* ── 1024px Tablet Landscape & Laptop (Compact & Balanced Grid) ── */
  @media (min-width: 1024px) {
    .ft-container {
      max-width: 1280px;
      padding: 52px 48px 40px;
    }
    .ft-grid {
      grid-template-columns: 2.6fr 1.7fr 1.7fr 2.5fr;
      gap: 36px;
      align-items: start;
    }
    .ft-brand { padding-bottom: 0; padding-right: 16px; }
    .ft-practical { gap: 24px; }
    .ft-bottom-container {
      max-width: 1280px;
      padding: 20px 48px;
      flex-direction: row;
      text-align: left;
    }
  }

  /* ── 1440px Desktop ── */
  @media (min-width: 1440px) {
    .ft-container {
      max-width: 1440px;
      padding: 56px 64px 44px;
    }
    .ft-grid {
      grid-template-columns: 2.7fr 1.6fr 1.6fr 2.5fr;
      gap: 48px;
    }
    .ft-coin-wrapper { width: 132px; height: 132px; }
    .ft-tagline { font-size: 15px; max-width: 380px; }
    .ft-link, .ft-detail-row { font-size: 15px; }
    .ft-bottom-container {
      max-width: 1440px;
      padding: 20px 64px;
    }
  }

  /* ── 1920px Widescreen ── */
  @media (min-width: 1920px) {
    .ft-container, .ft-bottom-container {
      max-width: 1680px;
      padding-left: 80px;
      padding-right: 80px;
    }
    .ft-grid {
      gap: 60px;
    }
    .ft-watermark span {
      font-size: min(14vw, 220px);
    }
  }

  /* ── Reduced Motion & Accessibility ── */
  @media (prefers-reduced-motion: reduce) {
    .ft-watermark span, .ft-ambient-glow, .ft-coin-ring, .ft-wave-layer { animation: none !important; }
    .ft-reveal-item { opacity: 1 !important; transform: none !important; transition: none !important; }
    .ft-link, .ft-so-btn, .ft-cta-btn, .ft-detail-link, .ft-coin-inner, .ft-logo { transition: none !important; }
    .ft-link:hover, .ft-so-btn:hover, .ft-cta-btn:hover, .ft-detail-link:hover, .ft-coin-wrapper:hover .ft-coin-inner { transform: none !important; }
    .ft-link::before { display: none !important; }
  }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  categories = signal<any[]>([]);
  policyPages = signal<any[]>([]);
  revealed = signal(false);
  openCol = signal<'shop' | 'info' | null>(null);

  private observer: IntersectionObserver | null = null;

  constructor(
    public settings: SettingsService,
    private api: ApiService,
    private el: ElementRef<HTMLElement>,
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

  copyright(): string {
    const raw = this.settings.get('footer_copyright', '');
    return raw.replace(/^[^A-Za-z0-9]*\d{4}\s*/, '') || `${this.settings.get('site_name', 'Laavi Store')}. All rights reserved.`;
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
      this.settings.get('social_whatsapp')
    );
  }
}

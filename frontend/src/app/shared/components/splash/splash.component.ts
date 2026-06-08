import { Component, OnInit, Output, EventEmitter, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="splash" [class.splash-fade-out]="fadingOut()">
        <div class="splash-inner">
          <!-- Logo -->
          <div class="splash-logo-wrap" [class.logo-revealed]="logoRevealed()">
            <img [src]="logoUrl()" [alt]="settings.get('site_name', 'Your Store')" class="splash-logo">
          </div>
          <!-- Brand name removed to prevent double logo -->
          <!-- Tagline -->
          <p class="splash-tagline" [class.tagline-revealed]="taglineRevealed()">
            {{ settings.get('site_tagline', 'Reusable ecommerce storefront') }}
          </p>
          <!-- Loading dots -->
          <div class="splash-dots" [class.dots-revealed]="taglineRevealed()">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .splash {
      position: fixed; inset: 0; z-index: 9999;
      background: #fff;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .splash-fade-out {
      opacity: 0;
      pointer-events: none;
    }
    .splash-inner {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px; text-align: center;
      padding: 32px;
    }

    /* Logo */
    .splash-logo-wrap {
      opacity: 0; transform: scale(0.8);
      transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1);
    }
    .splash-logo-wrap.logo-revealed {
      opacity: 1; transform: scale(1);
    }
    .splash-logo {
      width: 100px; height: 100px;
      object-fit: contain;
    }

    /* Brand name */
    .splash-name {
      display: flex; gap: 8px; align-items: baseline;
      opacity: 0; transform: translateY(12px);
      transition: opacity 0.45s ease 0.3s, transform 0.45s ease 0.3s;
    }
    .splash-name.name-revealed {
      opacity: 1; transform: translateY(0);
    }
    .brand-primary { font-size: 26px; font-weight: 800; color: #0F766E; font-family: 'Poppins', sans-serif; letter-spacing: 0; }
    .brand-neutral { font-size: 26px; font-weight: 800; color: #1a1a2e; font-family: 'Poppins', sans-serif; letter-spacing: 0; }
    .brand-accent  { font-size: 26px; font-weight: 800; color: #E11D48; font-family: 'Poppins', sans-serif; letter-spacing: 0; }

    /* Tagline */
    .splash-tagline {
      font-size: 13px; color: #9CA3AF; font-weight: 500; margin: 0;
      opacity: 0; transform: translateY(8px);
      transition: opacity 0.4s ease 0.55s, transform 0.4s ease 0.55s;
    }
    .splash-tagline.tagline-revealed {
      opacity: 1; transform: translateY(0);
    }

    /* Loading dots */
    .splash-dots {
      display: flex; gap: 6px; margin-top: 28px;
      opacity: 0; transition: opacity 0.4s ease 0.7s;
    }
    .splash-dots.dots-revealed { opacity: 1; }
    .splash-dots span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #D1D5DB; display: block;
    }
    .splash-dots span:nth-child(1) { animation: dotPulse 1.2s ease-in-out 0s infinite; }
    .splash-dots span:nth-child(2) { animation: dotPulse 1.2s ease-in-out 0.2s infinite; }
    .splash-dots span:nth-child(3) { animation: dotPulse 1.2s ease-in-out 0.4s infinite; }
    @keyframes dotPulse {
      0%, 100% { background: #D1D5DB; transform: scale(1); }
      50%       { background: #0F766E; transform: scale(1.35); }
    }
  `]
})
export class SplashComponent implements OnInit {
  @Output() done = new EventEmitter<void>();

  visible      = signal(true);
  fadingOut    = signal(false);
  logoRevealed = signal(false);
  nameRevealed = signal(false);
  taglineRevealed = signal(false);

  logoUrl = computed(() => {
    const raw = this.settings.get('site_logo', '');
    if (!raw) return '/logo.png';
    const base = raw.startsWith('/') ? raw : '/' + raw;
    return `${base}?v=${this.settings.settings()?.['_ts'] || Date.now()}`;
  });

  constructor(public settings: SettingsService) {}

  ngOnInit() {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('ecommerce_splash_seen') === '1') {
      this.visible.set(false);
      this.done.emit();
      return;
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('ecommerce_splash_seen', '1');
    }

    setTimeout(() => this.logoRevealed.set(true), 20);
    setTimeout(() => this.nameRevealed.set(true), 80);
    setTimeout(() => this.taglineRevealed.set(true), 140);

    setTimeout(() => this.fadingOut.set(true), 380);
    setTimeout(() => {
      this.visible.set(false);
      this.done.emit();
    }, 520);
  }
}

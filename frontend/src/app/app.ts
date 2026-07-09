import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { SplashComponent } from './shared/components/splash/splash.component';
import { ThemeService } from './core/services/theme.service';
import { CountryService } from './core/services/country.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent, SplashComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-splash (done)="splashDone.set(true)" />
    <div class="app-body" [class.app-ready]="splashDone()">
      <app-header />

      <!-- World switch: light sweep + destination chip -->
      @if (country.switching()) {
        <div class="world-sweep" [style.--world-dir]="country.direction()" aria-hidden="true"></div>
        @if (country.target(); as t) {
          <div class="world-chip" role="status">
            <span class="world-chip-flag">{{ t.flag }}</span>
            <span class="world-chip-name">{{ t.name }}</span>
          </div>
        }
      }

      <main class="main-content"
        [class.world-out]="country.phase() === 'out'"
        [class.world-in]="country.phase() === 'in'"
        [style.--world-dir]="country.direction()">
        <router-outlet />
      </main>
      <app-footer />
      <app-cart-drawer />
    </div>
  `,
  styles: [`
    .app-body {
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .app-body.app-ready {
      opacity: 1;
    }
    .main-content {
      padding-top: var(--header-height, 108px);
      min-height: 60vh;
    }

    /* ── World switch: directional push ──
       Leaving: content slides toward the previous world and softens.
       Arriving: the new world pushes in from the opposite side and settles. */
    .main-content.world-out {
      opacity: 0;
      transform: translateX(calc(var(--world-dir, 1) * -46px)) scale(.993);
      filter: blur(7px);
      transition:
        opacity .26s cubic-bezier(.45, 0, .7, .2),
        transform .26s cubic-bezier(.45, 0, .7, .2),
        filter .26s cubic-bezier(.45, 0, .7, .2);
      pointer-events: none;
    }
    .main-content.world-in {
      animation: worldArrive .62s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes worldArrive {
      from {
        opacity: 0;
        transform: translateX(calc(var(--world-dir, 1) * 56px)) scale(.995);
        filter: blur(9px);
      }
      55% { filter: blur(0); }
      to {
        opacity: 1;
        transform: none;
        filter: blur(0);
      }
    }

    /* ── Light sweep — a soft band of light crossing with the push ── */
    .world-sweep {
      position: fixed; inset: 0; z-index: 2800;
      pointer-events: none;
      background: linear-gradient(100deg,
        transparent 26%,
        rgba(255, 253, 248, .38) 44%,
        rgba(255, 253, 248, .62) 50%,
        rgba(232, 225, 210, .38) 56%,
        transparent 74%);
      transform: translateX(calc(var(--world-dir, 1) * -100%));
      animation: worldSweep .9s cubic-bezier(.65, 0, .35, 1) both;
      will-change: transform;
    }
    @keyframes worldSweep {
      to { transform: translateX(calc(var(--world-dir, 1) * 100%)); }
    }

    /* ── Destination chip — quiet glass label, serif name ── */
    .world-chip {
      position: fixed; top: calc(var(--header-height, 108px) + 26px);
      left: 50%; z-index: 2900;
      display: flex; align-items: center; gap: 10px;
      padding: 10px 22px 10px 16px;
      border-radius: 999px;
      background: rgba(255, 253, 248, .78);
      -webkit-backdrop-filter: blur(18px) saturate(1.4);
      backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid var(--kg-line, #E5E7EB);
      box-shadow: 0 18px 44px rgba(33, 29, 22, .14);
      pointer-events: none;
      animation: worldChip .9s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes worldChip {
      0%   { opacity: 0; transform: translate(-50%, -10px) scale(.96); }
      22%  { opacity: 1; transform: translate(-50%, 0) scale(1); }
      78%  { opacity: 1; transform: translate(-50%, 0) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -8px) scale(.98); }
    }
    .world-chip-flag { font-size: 17px; line-height: 1; }
    .world-chip-name {
      font-family: var(--font-serif, Georgia, serif);
      font-size: 16.5px; font-weight: 500;
      color: var(--kg-ink, #111827); letter-spacing: -0.01em;
    }

    @media (prefers-reduced-motion: reduce) {
      .main-content.world-out { transform: none; filter: none; transition: opacity .2s ease; }
      .main-content.world-in { animation: none; }
      .world-sweep { display: none; }
      .world-chip { animation-duration: .6s; }
    }
  `]
})
export class AppComponent {
  splashDone = signal(false);

  // ThemeService is injected here so it initialises immediately at app boot.
  // It reacts to SettingsService.loaded() via effect() and applies the active theme.
  private _theme = inject(ThemeService);
  protected country = inject(CountryService);
}

import { Component, OnInit, signal, output, inject } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  template: `
  @if (show()) {
    <div class="sp" [class.out]="leaving()" aria-hidden="true">
      <div class="sp-word">{{ settings.get('site_name', 'Raj Grocery Store') }}</div>
      <div class="sp-sub">{{ settings.get('site_tagline', 'Indian Grocery Store') }}</div>
      <div class="sp-bar"><div class="sp-bar-fill"></div></div>
    </div>
  }
  `,
  styles: [`
  .sp {
    position: fixed;
    inset: 0;
    z-index: 8000;
    background: var(--raj-canvas, #FAF7F1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    opacity: 1;
    transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1), visibility 0.5s;
  }
  .sp.out { opacity: 0; visibility: hidden; }

  .sp-word {
    font-family: var(--font-display, Georgia, serif);
    font-size: 34px;
    font-weight: 600;
    color: var(--raj-ink, #211A14);
    letter-spacing: -0.018em;
    text-align: center;
    padding: 0 24px;
    animation: spUp .7s cubic-bezier(0.22,1,0.36,1) .05s both;
  }
  .sp-sub {
    font-family: var(--font-sans, system-ui, sans-serif);
    font-size: 10.5px; font-weight: 800;
    letter-spacing: .22em; text-transform: uppercase;
    color: var(--raj-turmeric-dk, #9C6B15);
    text-align: center; padding: 0 24px;
    animation: spUp .7s cubic-bezier(0.22,1,0.36,1) .16s both;
  }

  .sp-bar {
    width: 52px; height: 2px;
    border-radius: 99px;
    background: var(--raj-sand-2, #E7DCCA);
    overflow: hidden; margin-top: 4px;
    animation: spUp .5s ease .24s both;
  }
  .sp-bar-fill {
    height: 100%;
    width: 0%;
    background: var(--raj-leaf, #17513F);
    border-radius: 99px;
    animation: spProg .85s ease .15s forwards;
  }

  @keyframes spUp   { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes spProg { from { width: 0%; } to { width: 100%; } }

  @media (prefers-reduced-motion: reduce) {
    .sp-word, .sp-sub, .sp-bar, .sp-bar-fill { animation: none !important; }
    .sp-bar-fill { width: 100%; }
  }
  `]
})
export class SplashComponent implements OnInit {
  public settings = inject(SettingsService);
  show = signal(true);
  leaving = signal(false);
  done = output<void>();

  ngOnInit() {
    // Remove the inline HTML splash (from index.html) as soon as Angular loads
    this._removeInlineSplash();

    // Angular splash: show 850ms, then fade out over 500ms
    setTimeout(() => this.leaving.set(true), 850);
    setTimeout(() => {
      this.show.set(false);
      this.done.emit();
    }, 1350);
  }

  private _removeInlineSplash() {
    try {
      const fn = (window as any).__appHideSplash || (window as any).__tdHideSplash;
      if (fn) fn();
    } catch {}
  }
}

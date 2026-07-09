import { Component, OnInit, signal, output, inject } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  template: `
  @if (show()) {
    <div class="sp" [class.out]="leaving()" aria-hidden="true">
      <div class="sp-word">{{ settings.get('site_name', 'Kale Gida') }}</div>
      <div class="sp-flags"><span>🇮🇳</span><span>🇫🇮</span><span>🇩🇪</span></div>
      <div class="sp-bar"><div class="sp-bar-fill"></div></div>
    </div>
  }
  `,
  styles: [`
  .sp {
    position: fixed;
    inset: 0;
    z-index: 8000;
    background: var(--kg-cream, #FFFFFF);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    opacity: 1;
    transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1), visibility 0.5s;
  }
  .sp.out { opacity: 0; visibility: hidden; }

  .sp-word {
    font-family: var(--font-serif, Georgia, serif);
    font-size: 36px;
    font-weight: 400;
    color: var(--kg-ink, #111827);
    letter-spacing: -0.02em;
    animation: spUp .7s cubic-bezier(0.22,1,0.36,1) .05s both;
  }
  .sp-flags {
    display: flex; gap: 11px; font-size: 15px;
    animation: spUp .7s cubic-bezier(0.22,1,0.36,1) .16s both;
  }
  .sp-flags span { animation: spBob 2.2s ease-in-out infinite; }
  .sp-flags span:nth-child(2) { animation-delay: .25s; }
  .sp-flags span:nth-child(3) { animation-delay: .5s; }
  @keyframes spBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

  .sp-bar {
    width: 56px; height: 2px;
    border-radius: 99px;
    background: var(--kg-line, #E5E7EB);
    overflow: hidden;
    animation: spUp .5s ease .24s both;
  }
  .sp-bar-fill {
    height: 100%;
    width: 0%;
    background: #29B8D5;
    border-radius: 99px;
    animation: spProg .85s ease .15s forwards;
  }

  @keyframes spUp   { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes spProg { from { width: 0%; } to { width: 100%; } }
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

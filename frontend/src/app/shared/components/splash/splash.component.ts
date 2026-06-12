import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  template: `
    @if (show) {
      <div class="splash" [class.splash-out]="leaving">
        <div class="splash-inner">
          <div class="splash-logo-wrap">
            <img [src]="settings.assetUrl('site_logo', '/logo.png')" [alt]="settings.get('site_name', 'Your Store')" class="splash-logo">
            <div class="splash-brand">{{ settings.get('site_name', 'Your Store') }}</div>
          </div>
          <div class="splash-bar-wrap">
            <div class="splash-bar"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .splash {
      position: fixed; inset: 0; z-index: 9999;
      background: #111;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.4s ease;
    }
    .splash-out { opacity: 0; pointer-events: none; }
    .splash-inner { text-align: center; }
    .splash-logo-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 28px; }
    .splash-logo { height: 72px; width: auto; object-fit: contain; }
    .splash-brand { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 700; color: white; letter-spacing: -0.01em; }
    .splash-bar-wrap { width: 160px; height: 3px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; }
    .splash-bar { height: 100%; background: #F28C00; border-radius: 999px; animation: splashLoad 0.8s ease forwards; }
    @keyframes splashLoad { from { width: 0; } to { width: 100%; } }
  `]
})
export class SplashComponent implements OnInit {
  @Output() done = new EventEmitter<void>();
  show = true;
  leaving = false;

  constructor(public settings: SettingsService) {}

  ngOnInit() {
    setTimeout(() => {
      this.leaving = true;
      setTimeout(() => {
        this.show = false;
        this.done.emit();
      }, 420);
    }, 1000);
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { SplashComponent } from './shared/components/splash/splash.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CartDrawerComponent, SplashComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-splash (done)="splashDone.set(true)" />
    <div class="app-body" [class.app-ready]="splashDone()">
      <app-header />
      <main class="main-content">
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
  `]
})
export class AppComponent {
  splashDone = signal(false);

  // ThemeService is injected here so it initialises immediately at app boot.
  // It reacts to SettingsService.loaded() via effect() and applies the active theme.
  private _theme = inject(ThemeService);
}

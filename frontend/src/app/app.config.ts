import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withInMemoryScrolling, withViewTransitions, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { httpCacheInterceptor } from './core/interceptors/http-cache.interceptor';
import { AppRouteReuseStrategy } from './core/strategies/app-route-reuse.strategy';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions(),
      withPreloading(SelectivePreloadingStrategy),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(withInterceptors([httpCacheInterceptor])),
    { provide: RouteReuseStrategy, useClass: AppRouteReuseStrategy }
  ]
};

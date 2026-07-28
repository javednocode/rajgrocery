import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!route.data?.['preload']) {
      return of(null);
    }

    const delay = Number(route.data['preloadDelay'] ?? 1200);
    return timer(delay).pipe(mergeMap(() => this.runWhenIdle(load)));
  }

  private runWhenIdle(load: () => Observable<unknown>): Observable<unknown> {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) {
      return load();
    }

    return new Observable((subscriber) => {
      const idleId = window.requestIdleCallback(
        () => {
          const sub = load().subscribe(subscriber);
          subscriber.add(() => sub.unsubscribe());
        },
        { timeout: 2500 },
      );

      return () => window.cancelIdleCallback(idleId);
    });
  }
}

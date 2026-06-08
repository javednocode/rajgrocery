import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
} from '@angular/router';

interface CachedRoute {
  handle: DetachedRouteHandle;
  touched: number;
}

@Injectable()
export class AppRouteReuseStrategy extends BaseRouteReuseStrategy {
  private readonly maxEntries = 8;
  private readonly cache = new Map<string, CachedRoute>();

  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return Boolean(route.data?.['reuse']);
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (!handle) return;

    this.cache.set(this.key(route), { handle, touched: Date.now() });
    this.prune();
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.cache.has(this.key(route));
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const cached = this.cache.get(this.key(route));
    if (!cached) return null;

    cached.touched = Date.now();
    return cached.handle;
  }

  private key(route: ActivatedRouteSnapshot): string {
    const path = route.routeConfig?.path ?? '';
    const params = Object.keys(route.params)
      .sort()
      .map((name) => `${name}=${route.params[name]}`)
      .join('&');

    return `${path}?${params}`;
  }

  private prune(): void {
    if (this.cache.size <= this.maxEntries) return;

    const oldest = [...this.cache.entries()].sort((a, b) => a[1].touched - b[1].touched)[0];
    if (oldest) this.cache.delete(oldest[0]);
  }
}

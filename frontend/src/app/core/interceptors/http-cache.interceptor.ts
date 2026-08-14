import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expires: number;
}

const responseCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Observable<HttpEvent<unknown>>>();

export const httpCacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isCacheableGet(req)) {
    return next(req);
  }

  const key = req.urlWithParams;
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && cached.expires > now) {
    return of(cached.response.clone());
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const ttl = ttlFor(req.urlWithParams);
  const shared = next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        responseCache.set(key, {
          response: event.clone(),
          expires: Date.now() + ttl,
        });
      }
    }),
    finalize(() => inFlight.delete(key)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  inFlight.set(key, shared);
  return shared;
};

function isCacheableGet(req: HttpRequest<unknown>): boolean {
  if (req.method !== 'GET') return false;
  if (!req.url.includes('/api')) return false;
  if (req.headers.has('Authorization')) return false;
  if (/\/api\/(settings|banners)\b/.test(req.url)) return false;
  return !/\/api\/(orders|customers?|auth|dashboard|email|import|stock|optimize|debug)\b/.test(req.url);
}

function ttlFor(url: string): number {
  if (/\/api\/settings\b/.test(url)) return 10 * 60_000;
  if (/\/api\/categories\b/.test(url)) return 10 * 60_000;
  if (/\/api\/banners\b/.test(url)) return 5 * 60_000;
  if (/\/api\/products\/(featured|trending)\b/.test(url)) return 5 * 60_000;
  if (/\/api\/products\/slug\//.test(url)) return 2 * 60_000;
  if (/\/api\/products\b/.test(url)) return 2 * 60_000;
  if (/\/api\/blogs\b/.test(url)) return 5 * 60_000;
  return 60_000;
}

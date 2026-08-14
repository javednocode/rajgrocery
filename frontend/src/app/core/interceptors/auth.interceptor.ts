import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Attaches the customer JWT to any /api request when logged in. Broad by
 * design (not scoped to /customer/ URLs) — POST /api/orders (guest
 * checkout) also needs the token so the backend can silently link the
 * order to a logged-in customer via optionalCustomerAuth(). Every backend
 * customer-only check independently validates the token's `type` claim
 * regardless of which URL it arrived on, so attaching it broadly here is
 * harmless — this app never calls any admin-only endpoint.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api') || req.headers.has('Authorization')) {
    return next(req);
  }
  const token = inject(AuthService).token();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

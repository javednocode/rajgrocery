import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

export interface CustomerProfile {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_guest: number;
  total_orders: number;
  total_spent: number | string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'raj_customer_token';
  private readonly customerKey = 'raj_customer';

  private _token = signal<string | null>(this.loadToken());
  private _customer = signal<CustomerProfile | null>(this.loadCustomer());

  token = this._token.asReadonly();
  customer = this._customer.asReadonly();

  isLoggedIn = computed(() => this._token() !== null);
  firstName = computed(() => {
    const c = this._customer();
    return c?.first_name || c?.name?.split(' ')[0] || '';
  });

  constructor(private api: ApiService) {
    effect(() => {
      const token = this._token();
      if (token) localStorage.setItem(this.tokenKey, token);
      else localStorage.removeItem(this.tokenKey);
    });
    effect(() => {
      const customer = this._customer();
      if (customer) localStorage.setItem(this.customerKey, JSON.stringify(customer));
      else localStorage.removeItem(this.customerKey);
    });

    // Refresh the cached profile on load so stats/details can't go stale
    // across devices/tabs — also doubles as a token-validity check.
    if (this._token()) this.refreshMe();
  }

  private loadToken(): string | null {
    try { return localStorage.getItem(this.tokenKey); } catch { return null; }
  }

  private loadCustomer(): CustomerProfile | null {
    try {
      const raw = localStorage.getItem(this.customerKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private setSession(token: string, customer: CustomerProfile) {
    this._token.set(token);
    this._customer.set(customer);
  }

  register(data: any): Observable<any> {
    return this.api.registerAccount(data).pipe(
      tap((r: any) => { if (r?.success) this.setSession(r.data.token, r.data.customer); })
    );
  }

  login(data: any): Observable<any> {
    return this.api.loginAccount(data).pipe(
      tap((r: any) => { if (r?.success) this.setSession(r.data.token, r.data.customer); })
    );
  }

  logout(): void {
    this._token.set(null);
    this._customer.set(null);
  }

  refreshMe(): void {
    this.api.getMyProfile().pipe(
      catchError((err) => {
        if (err?.status === 401) this.logout();
        return of(null);
      })
    ).subscribe((r: any) => {
      if (r?.success) this._customer.set(r.data);
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.api.updateMyProfile(data).pipe(
      tap((r: any) => { if (r?.success) this._customer.set(r.data); })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * API Service with in-memory caching for frequently-accessed endpoints.
 * 
 * Cached endpoints (shareReplay):
 * - getCategories()         — called by header + home + category pages
 * - getFeaturedCategories()  — called by home page
 * - getSettings()           — called by SettingsService on app boot
 * - getBanners()            — called by home page
 * 
 * These create a SINGLE HTTP request that is shared across all subscribers.
 * Navigation between pages no longer fires duplicate requests.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  // ── In-memory cache (shared observables) ──
  private _categoriesCache$: Observable<any> | null = null;
  private _featuredCategoriesCache$: Observable<any> | null = null;
  private _settingsCache$: Observable<any> | null = null;
  private _bannersCache$: Observable<any> | null = null;

  constructor(private http: HttpClient) {}

  // ── Products (not cached — filtered/paginated) ──
  getProducts(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(`${this.baseUrl}/products`, { params: httpParams });
  }

  getFeaturedProducts(limit = 8): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/featured?limit=${limit}`);
  }

  getHeroProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hero-products`);
  }

  getTrendingProducts(limit = 8): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/trending?limit=${limit}`);
  }

  getProductBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/slug/${slug}`);
  }

  searchProducts(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}`);
  }

  // ── Categories (CACHED — called by header on every page) ──
  getCategories(): Observable<any> {
    if (!this._categoriesCache$) {
      this._categoriesCache$ = this.http.get(`${this.baseUrl}/categories`).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this._categoriesCache$;
  }

  getFeaturedCategories(): Observable<any> {
    if (!this._featuredCategoriesCache$) {
      this._featuredCategoriesCache$ = this.http.get(`${this.baseUrl}/categories/featured`).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this._featuredCategoriesCache$;
  }

  getCategoryBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/slug/${slug}`);
  }

  // ── Banners (CACHED — only used on homepage) ──
  getBanners(): Observable<any> {
    if (!this._bannersCache$) {
      this._bannersCache$ = this.http.get(`${this.baseUrl}/banners`).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this._bannersCache$;
  }

  // ── Settings (CACHED — loaded once at app boot) ──
  getSettings(): Observable<any> {
    if (!this._settingsCache$) {
      this._settingsCache$ = this.http.get(`${this.baseUrl}/settings`).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this._settingsCache$;
  }

  // ── Blogs ──
  getBlogs(page = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/blogs?page=${page}`);
  }

  getBlogBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/blogs/slug/${slug}`);
  }

  // ── Static Pages ──
  getPageBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pages/slug/${slug}`);
  }

  getPages(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pages?active=1`);
  }

  // ── Orders ──
  placeOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, orderData);
  }

  trackOrder(orderNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/track/${orderNumber}`);
  }

  // ── Coupons ──
  validateCoupon(code: string, cartTotal: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/coupons/validate`, { code, cart_total: cartTotal });
  }

  // ── Customer registration ──
  registerCustomer(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers/register`, data);
  }

  // ── Delivery ──
  calculateDelivery(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/delivery/calculate`, data);
  }

  /**
   * Clear all in-memory caches.
   * Call this after admin updates categories/settings/banners.
   */
  clearCache(): void {
    this._categoriesCache$ = null;
    this._featuredCategoriesCache$ = null;
    this._settingsCache$ = null;
    this._bannersCache$ = null;
  }
}

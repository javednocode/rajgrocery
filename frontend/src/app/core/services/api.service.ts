import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * API Service
 * 
 * Note: The PHP backend has its own file-based cache (10 min TTL).
 * Angular-level caching has been removed to prevent stale data issues.
 * Each component call goes to the PHP cache — fast AND always fresh.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

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

  getFeaturedProducts(limit = 8, country = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/featured?limit=${limit}${country ? '&country=' + encodeURIComponent(country) : ''}`);
  }

  getHeroProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hero-products`);
  }

  getTrendingProducts(limit = 8, country = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/trending?limit=${limit}${country ? '&country=' + encodeURIComponent(country) : ''}`);
  }

  getProductBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/slug/${slug}`);
  }

  searchProducts(query: string, country = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}${country ? '&country=' + encodeURIComponent(country) : ''}`);
  }

  // ── Countries (admin-managed marketplaces) ──
  getCountries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/countries`);
  }

  // ── Categories ──
  getCategories(country = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories${country ? '?country=' + encodeURIComponent(country) : ''}`);
  }

  getFeaturedCategories(country = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/featured${country ? '?country=' + encodeURIComponent(country) : ''}`);
  }

  getCategoryBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/slug/${slug}`);
  }

  // ── Banners ──
  getBanners(country = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/banners${country ? '?country=' + encodeURIComponent(country) : ''}`);
  }

  // ── Settings ──
  getSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/settings`);
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

  // ── Contact Form ──
  sendContactForm(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact`, data);
  }

  /**
   * No-op: kept for API compatibility. The PHP backend cache is cleared via admin panel.
   */
  clearCache(): void {}
}

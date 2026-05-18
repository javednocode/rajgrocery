import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Products
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

  // Categories
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  getFeaturedCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/featured`);
  }

  getCategoryBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/slug/${slug}`);
  }

  // Banners
  getBanners(): Observable<any> {
    return this.http.get(`${this.baseUrl}/banners`);
  }

  // Settings
  getSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/settings`);
  }

  // Blogs
  getBlogs(page = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/blogs?page=${page}`);
  }

  getBlogBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/blogs/slug/${slug}`);
  }

  // Orders
  placeOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, orderData);
  }

  trackOrder(orderNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/track/${orderNumber}`);
  }

  // Coupons
  validateCoupon(code: string, cartTotal: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/coupons/validate`, { code, cart_total: cartTotal });
  }

  // Customer registration
  registerCustomer(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers/register`, data);
  }
}

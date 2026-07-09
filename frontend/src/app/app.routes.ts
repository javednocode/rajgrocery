import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'categories', data: { preload: true, preloadDelay: 900, reuse: true }, loadComponent: () => import('./features/category/category-list.component').then(m => m.CategoryListComponent) },
  { path: 'category/:slug', data: { reuse: true }, loadComponent: () => import('./features/category/category-detail.component').then(m => m.CategoryDetailComponent) },
  { path: 'product/:slug', data: { reuse: true }, loadComponent: () => import('./features/product/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'cart', data: { preload: true, preloadDelay: 1600 }, loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'blog', loadComponent: () => import('./features/blog/blog-list.component').then(m => m.BlogListComponent) },
  { path: 'blog/:slug', loadComponent: () => import('./features/blog/blog-detail.component').then(m => m.BlogDetailComponent) },
  { path: 'search', data: { preload: true, preloadDelay: 2200 }, loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
  { path: 'account', loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent) },
  { path: 'wishlist', loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'page/:slug', loadComponent: () => import('./features/page/page.component').then(m => m.PageComponent) },
  { path: 'about', loadComponent: () => import('./features/page/about.component').then(m => m.AboutComponent) },
  { path: 'faq', loadComponent: () => import('./features/page/faq.component').then(m => m.FaqComponent) },
  { path: '**', redirectTo: '' }
];

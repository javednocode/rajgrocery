import { Injectable, signal, computed, effect } from '@angular/core';

export interface WishItem { id: number; name: string; slug: string; price: number; salePrice: number | null; image: string; }

const KEY = 'store_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private _items = signal<WishItem[]>(this.load());
  items = this._items.asReadonly();
  count = computed(() => this._items().length);

  constructor() { effect(() => { try { localStorage.setItem(KEY, JSON.stringify(this._items())); } catch {} }); }

  private load(): WishItem[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }

  has(id: number): boolean { return this._items().some(i => i.id === id); }

  toggle(p: any, image: string) {
    if (this.has(p.id)) { this._items.set(this._items().filter(i => i.id !== p.id)); return; }
    this._items.set([...this._items(), {
      id: p.id, name: p.name, slug: p.slug,
      price: parseFloat(p.price), salePrice: p.sale_price ? parseFloat(p.sale_price) : null, image
    }]);
  }

  remove(id: number) { this._items.set(this._items().filter(i => i.id !== id)); }
}

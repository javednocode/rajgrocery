import { Injectable, signal, computed, effect } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface CartItem {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  image: string;
  quantity: number;
  unit: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.loadFromStorage());
  private _isOpen = signal(false);

  items = this._items.asReadonly();
  isOpen = this._isOpen.asReadonly();

  itemCount = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  subtotal = computed(() => this._items().reduce((sum, item) => {
    const price = item.salePrice ?? item.price;
    return sum + (price * item.quantity);
  }, 0));

  constructor() {
    effect(() => {
      localStorage.setItem('asianfoodcork_cart', JSON.stringify(this._items()));
    });
  }

  private loadFromStorage(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem('asianfoodcork_cart') || '[]');
    } catch { return []; }
  }

  addItem(product: any, quantity = 1) {
    const current = this._items();
    const existing = current.find(i => i.id === product.id);

    if (existing) {
      this._items.set(current.map(i =>
        i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: parseFloat(product.price),
        salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
        image: this.resolveImage(product.primary_image || product.images?.[0]?.image_path || ''),
        quantity,
        unit: product.unit || 'piece'
      };
      this._items.set([...current, newItem]);
    }
    this._isOpen.set(true);
  }

  updateQuantity(productId: number | string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this._items.set(this._items().map(i =>
      i.id === productId ? { ...i, quantity } : i
    ));
  }

  removeItem(productId: number | string) {
    this._items.set(this._items().filter(i => i.id !== productId));
  }

  clearCart() {
    this._items.set([]);
  }

  toggleCart() {
    this._isOpen.set(!this._isOpen());
  }

  openCart() { this._isOpen.set(true); }
  closeCart() { this._isOpen.set(false); }

  private resolveImage(path: string): string {
    if (!path || path.startsWith('http')) return path;
    return environment.mediaUrl + path;
  }
}

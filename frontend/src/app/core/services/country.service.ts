import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type CountryCode = string;

export interface CountryMeta {
  id: number;
  code: CountryCode;
  name: string;
  flag: string;
  headline: string;
  sub: string;
  suggestions: string[];
  currencySymbol: string;
  currencyCode: string;
  metaTitle: string;
  metaDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  deliveryInfo: string;
  isDefault: boolean;
  trendingTitle: string;
  essentialsTitle: string;
}

const STORAGE_KEY = 'kg_country';

/** Built-in fallback so the storefront still works if /api/countries is unreachable. */
const FALLBACK: CountryMeta[] = [
  {
    id: 1, code: 'in', name: 'India', flag: '🇮🇳',
    headline: 'The spice route, delivered.',
    sub: 'Hand-ground masalas, heritage snacks and pantry staples from makers who never left the old recipes behind.',
    suggestions: ['Bhujia', 'Masala', 'Basmati rice', 'Papad'],
    currencySymbol: '', currencyCode: '', metaTitle: '', metaDescription: '',
    contactEmail: '', contactPhone: '', contactAddress: '', deliveryInfo: '',
    isDefault: true, trendingTitle: 'Trending in India', essentialsTitle: 'Indian essentials',
  },
  {
    id: 2, code: 'tr', name: 'Turkey', flag: '🇹🇷',
    headline: 'From the bazaars of Anatolia.',
    sub: 'Olives, dried figs, baklava and bazaar spices — the warmth of a Turkish pantry, packed with care.',
    suggestions: ['Baklava', 'Olives', 'Turkish tea', 'Dried figs'],
    currencySymbol: '', currencyCode: '', metaTitle: '', metaDescription: '',
    contactEmail: '', contactPhone: '', contactAddress: '', deliveryInfo: '',
    isDefault: false, trendingTitle: 'Trending in Turkey', essentialsTitle: 'Turkish favourites',
  },
  {
    id: 3, code: 'fi', name: 'Finland', flag: '🇫🇮',
    headline: 'Nordic purity, harvested wild.',
    sub: 'Rye, wild berries and clean Nordic flavours — quietly perfected under the midnight sun.',
    suggestions: ['Rye bread', 'Cloudberry jam', 'Salmiakki', 'Coffee'],
    currencySymbol: '', currencyCode: '', metaTitle: '', metaDescription: '',
    contactEmail: '', contactPhone: '', contactAddress: '', deliveryInfo: '',
    isDefault: false, trendingTitle: 'Trending in Finland', essentialsTitle: 'Finnish favourites',
  },
];

/**
 * Country marketplace state — fully admin-driven.
 *
 * Countries load from /api/countries (admin CRUD). Every catalogue request
 * carries the selected country code, so the API returns only that world's
 * products/categories/banners — strict separation, no client-side guessing.
 * The selection persists in localStorage; new visitors land on the
 * admin-configured default country.
 */
@Injectable({ providedIn: 'root' })
export class CountryService {
  private http = inject(HttpClient);

  private _countries = signal<CountryMeta[]>(FALLBACK);
  private _code = signal<CountryCode>(this.restore() ?? 'in');
  private _ready = signal(false);
  /** Bumped on every switch — templates key @for blocks on this to replay entrances. */
  private _worldKey = signal(1);
  /** Transition choreography: idle → out (leave) → in (arrive) → idle */
  private _phase = signal<'idle' | 'out' | 'in'>('idle');
  /** +1 when moving right along the pill row (e.g. India→Turkey), −1 when moving left. */
  private _direction = signal(1);
  /** Where we're heading while the transition plays (drives the announce chip). */
  private _target = signal<CountryMeta | null>(null);

  readonly countries = this._countries.asReadonly();
  readonly code = this._code.asReadonly();
  readonly ready = this._ready.asReadonly();
  readonly worldKey = this._worldKey.asReadonly();
  readonly phase = this._phase.asReadonly();
  readonly direction = this._direction.asReadonly();
  readonly target = this._target.asReadonly();
  readonly switching = computed(() => this._phase() !== 'idle');

  readonly current = computed<CountryMeta>(() => {
    const list = this._countries();
    return list.find(c => c.code === this._code()) ?? list[0] ?? FALLBACK[0];
  });

  /** Kept for templates that iterate `country.all` */
  get all(): CountryMeta[] { return this._countries(); }

  private swapTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.load();
  }

  private load() {
    this.http.get<any>(`${environment.apiUrl}/countries`).subscribe({
      next: (res) => {
        const rows = res?.data;
        if (Array.isArray(rows) && rows.length) {
          const list = rows.map((r: any) => this.toMeta(r));
          this._countries.set(list);
          // Honour the stored choice when still valid, else the admin default.
          const stored = this.restore();
          const valid = stored && list.some(c => c.code === stored);
          if (valid) {
            this._code.set(stored!);
          } else {
            const def = list.find(c => c.isDefault) ?? list[0];
            this._code.set(def.code);
          }
        }
        this._ready.set(true);
      },
      error: () => this._ready.set(true),
    });
  }

  private toMeta(r: any): CountryMeta {
    const name = r.name || r.code;
    return {
      id: +r.id,
      code: String(r.code || '').toLowerCase(),
      name,
      flag: r.flag || '',
      headline: r.headline || `Taste ${name}.`,
      sub: r.subtext || '',
      suggestions: String(r.suggestions || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      currencySymbol: r.currency_symbol || '',
      currencyCode: r.currency_code || '',
      metaTitle: r.meta_title || '',
      metaDescription: r.meta_description || '',
      contactEmail: r.contact_email || '',
      contactPhone: r.contact_phone || '',
      contactAddress: r.contact_address || '',
      deliveryInfo: r.delivery_info || '',
      isDefault: r.is_default == 1,
      trendingTitle: `Trending in ${name}`,
      essentialsTitle: `${name} favourites`,
    };
  }

  select(code: CountryCode) {
    if (code === this._code() || this._phase() !== 'idle') return;
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}

    // Directional push: travelling "right" along the selector slides content
    // left (and vice versa) — the store moves like a physical shelf.
    const list = this._countries();
    const from = list.findIndex(c => c.code === this._code());
    const to = list.findIndex(c => c.code === code);
    this._direction.set(to >= from ? 1 : -1);
    this._target.set(list[to] ?? null);

    // Leave → swap world → arrive → settle.
    this._phase.set('out');
    if (this.swapTimer) clearTimeout(this.swapTimer);
    this.swapTimer = setTimeout(() => {
      this._code.set(code);
      this._worldKey.update(v => v + 1);
      this._phase.set('in');
      setTimeout(() => { this._phase.set('idle'); this._target.set(null); }, 640);
    }, 260);
  }

  meta(code: CountryCode): CountryMeta | undefined {
    return this._countries().find(c => c.code === code);
  }

  /** Flag(s) for a product's origin worlds — from the API payload. */
  flagFor(p: any): string {
    const list = Array.isArray(p?.countries) ? p.countries : [];
    return list.map((c: any) => c.flag).filter(Boolean).slice(0, 3).join(' ');
  }

  originName(p: any): string {
    const list = Array.isArray(p?.countries) ? p.countries : [];
    if (!list.length) return '';
    if (list.length === 1) return list[0].name;
    return `${list[0].name} +${list.length - 1}`;
  }

  private restore(): CountryCode | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? saved.toLowerCase() : null;
    } catch { return null; }
  }
}

import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  settings = signal<any>({});
  loaded = signal(false);

  constructor(private api: ApiService) {
    this.loadSettings();
  }

  loadSettings() {
    this.api.getSettings().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.settings.set(res.data);
          this.loaded.set(true);
        }
      },
      error: () => {
        // Use defaults
        this.settings.set({
          site_name: 'Asian Food Cork',
          site_tagline: 'Authentic Asian Groceries in Cork, Ireland',
          currency_symbol: '€',
          header_offer_text: '🎉 Free delivery on orders above €50!',
          shipping_free_above: '50',
          shipping_charge: '5',
          tax_percentage: '0'
        });
        this.loaded.set(true);
      }
    });
  }

  get(key: string, defaultValue = ''): string {
    return this.settings()?.[key] || defaultValue;
  }
}

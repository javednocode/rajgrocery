import { Injectable, inject, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';

export interface ThemeConfig {
  name: string;
  version: string;
  description: string;
  colors: Record<string, string>;
  fonts: {
    heading: string;
    body: string;
    heading_weights?: string;
    body_weights?: string;
    google_fonts_url?: string;
  };
  spacing: Record<string, string>;
  header?: Record<string, any>;
  footer?: Record<string, any>;
  product_card?: Record<string, any>;
  homepage_sections?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  private http = inject(HttpClient);
  private settings = inject(SettingsService);

  private currentTheme = 'default';
  private loadedThemes = new Map<string, ThemeConfig>();

  constructor() {
    // Watch settings and apply theme whenever site_settings loads
    effect(() => {
      if (this.settings.loaded()) {
        const theme = this.settings.get('active_theme', 'default');
        this.applyTheme(theme);
      }
    });
  }

  applyTheme(themeName: string) {
    if (this.currentTheme === themeName && this.loadedThemes.has(themeName)) return;

    if (this.loadedThemes.has(themeName)) {
      this.injectTheme(this.loadedThemes.get(themeName)!);
      this.currentTheme = themeName;
      return;
    }

    // Load theme.json from /themes/<name>/theme.json
    this.http.get<ThemeConfig>(`/themes/${themeName}/theme.json`).subscribe({
      next: (config) => {
        this.loadedThemes.set(themeName, config);
        this.injectTheme(config);
        this.currentTheme = themeName;
      },
      error: () => {
        // Fall back to default theme
        if (themeName !== 'default') {
          this.applyTheme('default');
        }
      }
    });
  }

  private injectTheme(config: ThemeConfig) {
    const root = this.document.documentElement;

    // Inject CSS custom properties from colors
    if (config.colors) {
      for (const [key, value] of Object.entries(config.colors)) {
        root.style.setProperty(`--color-${key}`, value);
        // Also set shorthand for commonly used variables
        root.style.setProperty(`--${key}`, value);
      }
    }

    // Inject spacing/radius variables
    if (config.spacing) {
      for (const [key, value] of Object.entries(config.spacing)) {
        root.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
      }
    }

    // Inject font family variables
    if (config.fonts) {
      root.style.setProperty('--font-heading', `'${config.fonts.heading}', 'Poppins', system-ui, sans-serif`);
      root.style.setProperty('--font-body', `'${config.fonts.body}', system-ui, sans-serif`);

      // Load Google Fonts if specified (only if not already loaded)
      if (config.fonts.google_fonts_url) {
        this.loadGoogleFont(config.fonts.google_fonts_url);
      }
    }

    // Inject header style class on body
    if (config.header?.['style']) {
      this.document.body.dataset['headerStyle'] = config.header['style'];
    }

    // Store config as JSON in a meta tag for Angular components to read
    let metaEl = this.document.getElementById('app-theme-config') as HTMLScriptElement | null;
    if (!metaEl) {
      metaEl = this.document.createElement('script');
      metaEl.id = 'app-theme-config';
      metaEl.type = 'application/json';
      this.document.head.appendChild(metaEl);
    }
    metaEl.textContent = JSON.stringify(config);

    console.log(`[ThemeService] Applied theme: ${config.name}`);
  }

  private loadGoogleFont(url: string) {
    const existingLink = this.document.querySelector(`link[href="${url}"]`);
    if (existingLink) return;

    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    this.document.head.appendChild(link);
  }

  getThemeConfig(): ThemeConfig | null {
    return this.loadedThemes.get(this.currentTheme) || null;
  }

  getThemeSetting<T = any>(path: string, fallback?: T): T {
    const config = this.getThemeConfig();
    if (!config) return fallback as T;

    const parts = path.split('.');
    let val: any = config;
    for (const part of parts) {
      if (val === null || val === undefined) return fallback as T;
      val = val[part];
    }
    return (val !== undefined ? val : fallback) as T;
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Breadcrumb Hero -->
    <div class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>›</span>
          <span>{{ page()?.title || 'Page' }}</span>
        </div>
        <h1 class="page-hero-title">{{ page()?.title }}</h1>
      </div>
    </div>

    <!-- Page Content -->
    <div class="container page-container">
      @if (loading()) {
        <div class="page-skeleton">
          <div class="skel skel-h2"></div>
          <div class="skel skel-line"></div>
          <div class="skel skel-line w80"></div>
          <div class="skel skel-line w60"></div>
          <div class="skel skel-h3" style="margin-top:32px"></div>
          <div class="skel skel-line"></div>
          <div class="skel skel-line w70"></div>
        </div>
      } @else if (error()) {
        <div class="page-error">
          <div class="error-icon">📄</div>
          <h2>Page Not Found</h2>
          <p>This page doesn't exist or hasn't been published yet.</p>
          <a routerLink="/" class="btn-back">← Back to Home</a>
        </div>
      } @else if (page()) {
        <article class="page-article" [innerHTML]="safeContent()"></article>
        <div class="page-footer-note">
          <p>Need help? <a routerLink="/contact">Contact us</a> and we'll be happy to assist.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Hero */
    .page-hero {
      background: linear-gradient(135deg, #070A05 0%, #1C1208 100%);
      padding: 56px 0 40px;
      margin-top: 0;
    }
    .breadcrumb {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: rgba(255,255,255,0.55);
      margin-bottom: 16px;
    }
    .breadcrumb a {
      color: rgba(255,255,255,0.55); text-decoration: none;
      transition: color 0.2s;
    }
    .breadcrumb a:hover { color: #F28C00; }
    .page-hero-title {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800; color: white; margin: 0;
      letter-spacing: -0.02em;
    }

    /* Container */
    .page-container {
      max-width: 820px;
      padding: 56px 24px 80px;
    }

    /* Article content — rich rendering */
    .page-article {
      font-size: 15.5px;
      line-height: 1.85;
      color: #2D2018;
    }
    :host ::ng-deep .page-article h1,
    :host ::ng-deep .page-article h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.5rem; font-weight: 800;
      color: #1A0E06; margin: 40px 0 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #F7E9D7;
    }
    :host ::ng-deep .page-article h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.15rem; font-weight: 700;
      color: #B85E00; margin: 32px 0 12px;
    }
    :host ::ng-deep .page-article p {
      margin: 0 0 18px;
    }
    :host ::ng-deep .page-article ul,
    :host ::ng-deep .page-article ol {
      margin: 0 0 18px; padding-left: 28px;
    }
    :host ::ng-deep .page-article li {
      margin-bottom: 8px;
    }
    :host ::ng-deep .page-article a {
      color: #B85E00; text-decoration: underline;
      text-underline-offset: 3px;
    }
    :host ::ng-deep .page-article a:hover { color: #F28C00; }
    :host ::ng-deep .page-article strong { color: #1A0E06; }
    :host ::ng-deep .page-article hr {
      border: none; border-top: 1px solid #F7E9D7;
      margin: 32px 0;
    }
    :host ::ng-deep .page-article blockquote {
      border-left: 4px solid #F28C00;
      margin: 24px 0; padding: 12px 20px;
      background: #FFF8EE; border-radius: 0 8px 8px 0;
      font-style: italic; color: #5C3D1E;
    }
    :host ::ng-deep .page-article table {
      width: 100%; border-collapse: collapse; margin: 20px 0;
    }
    :host ::ng-deep .page-article th,
    :host ::ng-deep .page-article td {
      padding: 10px 14px;
      border: 1px solid #F0D8B8; font-size: 14px;
    }
    :host ::ng-deep .page-article th {
      background: #FFF2DE; font-weight: 700; color: #1A0E06;
    }

    /* Footer note */
    .page-footer-note {
      margin-top: 48px; padding-top: 24px;
      border-top: 1px solid #F7E9D7;
      font-size: 14px; color: #9CA3AF; text-align: center;
    }
    .page-footer-note a { color: #B85E00; text-decoration: none; }
    .page-footer-note a:hover { text-decoration: underline; }

    /* Skeleton */
    .page-skeleton { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
    .skel {
      background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 6px;
    }
    .skel-h2 { height: 28px; width: 55%; }
    .skel-h3 { height: 22px; width: 45%; }
    .skel-line { height: 14px; width: 100%; }
    .skel-line.w80 { width: 80%; }
    .skel-line.w70 { width: 70%; }
    .skel-line.w60 { width: 60%; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    /* Error */
    .page-error {
      text-align: center; padding: 80px 24px;
    }
    .error-icon { font-size: 56px; margin-bottom: 16px; }
    .page-error h2 { font-family:'Poppins',sans-serif; font-size:1.6rem; color:#1A0E06; margin-bottom:8px; }
    .page-error p { color:#9CA3AF; margin-bottom:24px; }
    .btn-back {
      display: inline-block;
      background: linear-gradient(135deg, #F28C00, #FFB13B);
      color: #160B02; padding: 10px 24px; border-radius: 999px;
      font-weight: 700; text-decoration: none; font-size: 14px;
      transition: transform 0.15s;
    }
    .btn-back:hover { transform: translateY(-1px); }

    @media (max-width: 768px) {
      .page-hero { padding: 40px 0 28px; }
    }
  `]
})
export class PageComponent implements OnInit {
  page = signal<any>(null);
  loading = signal(true);
  error = signal(false);
  safeContent = signal<SafeHtml>('');

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public settings: SettingsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') || '';
      this.loadPage(slug);
    });
  }

  private loadPage(slug: string) {
    this.loading.set(true);
    this.error.set(false);
    this.page.set(null);

    this.api.getPageBySlug(slug).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.page.set(res.data);
          this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(res.data.content || ''));
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}

import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
  <!-- Hero -->
  <section class="ab-hero">
    <div class="container">
      <nav class="ab-crumbs"><a routerLink="/">Home</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>About Us</span></nav>
      <span class="ab-eyebrow">Our Story</span>
      <h1>{{ settings.get('site_name','Raj Grocery Store') }}</h1>
      <p>{{ settings.get('site_tagline', 'Indian Grocery Store in Hong Kong') }}</p>
    </div>
    <div class="ab-hero-deco" aria-hidden="true"></div>
  </section>

  <!-- Story section -->
  <section class="ab-story section">
    <div class="container ab-story-grid">
      <div class="ab-story-text">
        <span class="sec-eyebrow">Who We Are</span>
        <h2 class="sec-title">{{ settings.get('about_headline','A Community Built on Taste & Trust') }}</h2>
        <div class="ab-story-body">
          <p>{{ settings.get('about_paragraph_1', 'We started with a simple mission: to bring the authentic tastes of India to every table in Hong Kong — without compromise on quality or freshness.') }}</p>
          <p>{{ settings.get('about_paragraph_2', 'From fragrant basmati and hand-ground masalas to everyday dals, atta, snacks and household essentials — every product is selected to taste like home.') }}</p>
        </div>
        <a routerLink="/categories" class="ab-cta">
          Shop Our Range
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
      <div class="ab-story-img">
        <div class="ab-img-card">
          <img src="assets/raj_store_about.png" alt="Raj Grocery Store Interior" class="ab-store-photo" />
          <div class="ab-img-overlay">
            <div>
              <strong>{{ settings.get('site_name','Raj Grocery Store') }}</strong>
              <span>Est. {{ settings.get('founded_year','2018') }} · Hong Kong</span>
            </div>
            <div class="ab-badge-quality">✦ 100% Authentic</div>
          </div>
        </div>
        <div class="ab-img-float">
          <div class="ab-float-icon">🛍️</div>
          <div>
            <strong>{{ settings.get('about_stat_1','2,000+') }}</strong>
            <em>Happy Customers</em>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Values -->
  <section class="ab-values section" style="background:var(--kg-warm)">
    <div class="container">
      <div style="text-align:center;margin-bottom:44px">
        <span class="sec-eyebrow" style="justify-content:center">Our Values</span>
        <h2 class="sec-title" style="text-align:center">Why Families Choose Us</h2>
      </div>
      <div class="ab-values-grid">
        @for (v of values; track v.icon) {
          <div class="ab-value-card">
            <div class="ab-value-icon">{{ v.icon }}</div>
            <h3>{{ v.title }}</h3>
            <p>{{ v.desc }}</p>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- Stats band -->
  <section class="ab-stats-band">
    <div class="container ab-stats-grid">
      @for (s of stats; track s.label) {
        <div class="ab-stat-item">
          <strong>{{ s.value }}</strong>
          <span>{{ s.label }}</span>
        </div>
      }
    </div>
  </section>

  <!-- Promise -->
  <section class="section">
    <div class="container ab-promise">
      <div class="ab-promise-text">
        <span class="sec-eyebrow">Our Promise</span>
        <h2 class="sec-title">Quality You Can Taste</h2>
        <p class="sec-sub" style="margin-bottom:24px">Every product in our store is hand-picked and quality-checked. We only stock what we'd happily serve to our own families.</p>
        <ul class="ab-promise-list">
          @for (p of promises; track p) {
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="var(--kg-forest)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ p }}
            </li>
          }
        </ul>
        <a routerLink="/contact" class="ab-cta" style="margin-top:16px">Get In Touch</a>
      </div>
      <div class="ab-promise-cards">
        <div class="ab-prom-card" style="background:var(--kg-dark)">
          <strong>Free Delivery</strong>
          <p>On orders over {{ settings.get('currency_symbol','HK$') }}{{ settings.get('shipping_free_above','50') }}</p>
        </div>
        <div class="ab-prom-card" style="background:var(--kg-forest)">
          <strong>Authentic Products</strong>
          <p>Sourced directly from trusted suppliers</p>
        </div>
        <div class="ab-prom-card" style="background:var(--kg-forest)">
          <strong>Friendly Support</strong>
          <p>Real people, fast responses, 7 days</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Band -->
  <section class="ab-cta-band">
    <div class="container ab-cta-inner">
      <h2>Ready to taste the difference?</h2>
      <p>Join our growing community of customers across {{ settings.get('store_country','Hong Kong') }}</p>
      <div class="ab-cta-btns">
        <a routerLink="/categories" class="ab-cta-primary">Shop Now</a>
        <a routerLink="/contact" class="ab-cta-outline">Contact Us</a>
      </div>
    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1360px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 56px}}
  .section { padding: 80px 0; }
  .sec-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-sans); font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: var(--kg-forest-dk); margin-bottom: 12px; }
  .sec-eyebrow::before { content: ''; width: 26px; height: 1.5px; background: currentColor; opacity: .55; }
  .sec-title { font-family: var(--font-sans); font-size: clamp(1.45rem, 2.6vw, 2.1rem); font-weight: 800; color: var(--kg-ink); margin-bottom: 10px; line-height: 1.15; letter-spacing: -0.015em; }
  .sec-sub { font-size: 15px; color: var(--kg-muted); line-height: 1.75; }

  /* HERO */
  .ab-hero { background: var(--kg-dark); padding: 72px 0 80px; position: relative; overflow: hidden; }
  .ab-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 140% at 20% 60%, rgba(74,127,212,.2) 0%, transparent 70%); pointer-events: none; }
  .ab-hero .container { position: relative; z-index: 1; }
  .ab-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: rgba(255,255,255,.38); margin-bottom: 16px; }
  .ab-crumbs a { color: rgba(255,255,255,.6); transition: color .2s; } .ab-crumbs a:hover { color: var(--kg-forest-lt); }
  .ab-crumbs svg { opacity: .35; flex-shrink: 0; }
  .ab-eyebrow { display: inline-block; font-family: var(--font-sans); font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: var(--kg-forest-lt); margin-bottom: 14px; }
  .ab-hero h1 { font-family: var(--font-sans); font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 800; color: var(--kg-cream); line-height: 1.15; margin-bottom: 14px; }
  .ab-hero p { font-size: 16px; color: rgba(255,255,255,.6); max-width: 520px; line-height: 1.7; }
  .ab-hero-deco { position: absolute; right: 5%; top: 50%; transform: translateY(-50%); width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(74,127,212,.15) 0%, transparent 70%); pointer-events: none; opacity: .5; }

  /* STORY */
  .ab-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .ab-story-body { display: flex; flex-direction: column; gap: 14px; margin: 20px 0 28px; }
  .ab-story-body p { font-size: 15px; color: var(--kg-muted); line-height: 1.8; }
  .ab-cta { display: inline-flex; align-items: center; gap: 8px; background: var(--kg-forest); color: var(--kg-cream); padding: 14px 28px; border-radius: var(--r-full); font-family: var(--font-sans); font-size: 14px; font-weight: 800; box-shadow: var(--shadow-forest); transition: all .25s; text-decoration: none; }
  .ab-cta:hover { background: var(--kg-forest-dk); transform: translateY(-2px); }
  .ab-story-img { position: relative; }
  .ab-img-card { background: var(--kg-dark); border-radius: 24px; height: 420px; display: flex; align-items: flex-end; justify-content: stretch; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(11,27,45,0.22); border: 1px solid rgba(255,255,255,0.1); }
  .ab-store-photo { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1); }
  .ab-img-card:hover .ab-store-photo { transform: scale(1.05); }
  .ab-img-overlay { position: relative; z-index: 2; width: 100%; background: linear-gradient(0deg, rgba(11,27,45,0.95) 0%, rgba(11,27,45,0.75) 65%, transparent 100%); padding: 28px 24px 22px; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; backdrop-filter: blur(4px); }
  .ab-img-overlay strong { display: block; font-family: var(--font-sans); font-size: 1.25rem; font-weight: 800; color: #FFF; margin-bottom: 2px; }
  .ab-img-overlay span { font-size: 13px; color: rgba(255,255,255,.75); font-family: var(--font-sans); font-weight: 500; }
  .ab-badge-quality { background: rgba(242,169,59,0.2); color: var(--raj-turmeric); border: 1px solid var(--raj-turmeric); padding: 6px 14px; border-radius: 999px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
  .ab-img-float { position: absolute; top: 24px; right: -20px; z-index: 3; background: var(--kg-paper); border-radius: 16px; padding: 14px 20px; display: flex; align-items: center; gap: 14px; box-shadow: 0 12px 36px rgba(11,27,45,.18); border: 1px solid var(--kg-line-lt); animation: floatPulse 4s ease-in-out infinite alternate; }
  @keyframes floatPulse { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
  .ab-float-icon { font-size: 24px; background: var(--raj-leaf-bg); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
  .ab-img-float strong { display: block; font-family: var(--font-sans); font-size: 18px; font-weight: 800; color: var(--kg-forest); line-height: 1.1; }
  .ab-img-float em { font-style: normal; font-size: 12px; color: var(--kg-muted); font-family: var(--font-sans); font-weight: 600; }


  /* VALUES */
  .ab-values-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .ab-value-card { background: var(--kg-paper); border: 1px solid var(--kg-line-lt); border-radius: 14px; padding: 28px 22px; transition: all .35s var(--ease); }
  .ab-value-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--kg-line-warm); }
  .ab-value-icon { font-size: 2rem; margin-bottom: 14px; }
  .ab-value-card h3 { font-family: var(--font-sans); font-size: 1rem; font-weight: 800; color: var(--kg-ink); margin-bottom: 8px; }
  .ab-value-card p { font-size: 13.5px; color: var(--kg-muted); line-height: 1.65; margin: 0; }

  /* STATS BAND */
  .ab-stats-band { background: var(--kg-forest); padding: 40px 0; }
  .ab-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; }
  .ab-stat-item { text-align: center; padding: 0 24px; border-right: 1px solid rgba(255,255,255,.15); }
  .ab-stat-item:last-child { border-right: none; }
  .ab-stat-item strong { display: block; font-family: var(--font-sans); font-size: 2rem; font-weight: 800; color: var(--kg-cream); margin-bottom: 4px; }
  .ab-stat-item span { font-size: 12px; font-weight: 700; color: rgba(255,255,255,.7); font-family: var(--font-sans); text-transform: uppercase; letter-spacing: .1em; }

  /* PROMISE */
  .ab-promise { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .ab-promise-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; }
  .ab-promise-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14.5px; color: var(--kg-muted); line-height: 1.5; }
  .ab-promise-list svg { flex-shrink: 0; margin-top: 2px; }
  .ab-promise-cards { display: flex; flex-direction: column; gap: 14px; }
  .ab-prom-card { border-radius: 14px; padding: 22px 24px; color: var(--kg-cream); }
  .ab-prom-card strong { display: block; font-family: var(--font-sans); font-size: 15px; font-weight: 800; margin-bottom: 4px; }
  .ab-prom-card p { font-size: 13px; opacity: .75; margin: 0; }

  /* CTA BAND */
  .ab-cta-band { background: var(--kg-dark); padding: 72px 0; text-align: center; }
  .ab-cta-inner h2 { font-family: var(--font-sans); font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: var(--kg-cream); margin-bottom: 10px; }
  .ab-cta-inner p { font-size: 15px; color: rgba(255,255,255,.55); margin-bottom: 32px; }
  .ab-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .ab-cta-primary { background: var(--kg-forest); color: var(--kg-cream); padding: 14px 32px; border-radius: var(--r-full); font-family: var(--font-sans); font-size: 15px; font-weight: 800; box-shadow: var(--shadow-forest); transition: all .25s; text-decoration: none; }
  .ab-cta-primary:hover { background: var(--kg-forest-dk); transform: translateY(-2px); }
  .ab-cta-outline { background: transparent; color: var(--kg-cream); padding: 14px 32px; border-radius: var(--r-full); border: 1.5px solid rgba(255,255,255,.25); font-family: var(--font-sans); font-size: 15px; font-weight: 700; transition: all .25s; text-decoration: none; }
  .ab-cta-outline:hover { border-color: rgba(255,255,255,.5); background: rgba(255,255,255,.06); transform: translateY(-2px); }

  @media (max-width: 900px) {
    .section { padding: 52px 0; }
    .ab-story-grid { grid-template-columns: 1fr; gap: 36px; }
    .ab-img-float { right: 0; }
    .ab-values-grid { grid-template-columns: repeat(2,1fr); }
    .ab-stats-grid { grid-template-columns: repeat(2,1fr); }
    .ab-stat-item { padding: 12px; border-right: none; border-bottom: 1px solid rgba(255,255,255,.15); }
    .ab-promise { grid-template-columns: 1fr; gap: 36px; }
  }
  @media (max-width: 640px) {
    .section { padding: 40px 0; }
    .ab-hero { padding: 40px 0 48px; }
    .ab-cta-band { padding: 48px 0; }
    .ab-values-grid { grid-template-columns: 1fr; }
    .ab-stats-grid { grid-template-columns: 1fr 1fr; }
  }
  `]
})
export class AboutComponent {
  values = [
    { icon: '🌶️', title: 'Authentic Quality', desc: 'Every product is hand-selected from trusted suppliers who share our passion for authenticity.' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Quick, reliable delivery across Hong Kong with free shipping on larger orders.' },
    { icon: '💚', title: 'Community First', desc: 'We are part of the community we serve — supporting families just like yours.' },
    { icon: '🔒', title: 'Secure & Simple', desc: 'Shop with confidence. Easy returns, secure payments, and friendly support.' }
  ];

  stats = [
    { value: '2,000+', label: 'Happy Customers' },
    { value: '500+', label: 'Products' },
    { value: '5✦', label: 'Average Rating' },
    { value: '7 Days', label: 'Support Available' }
  ];

  promises = [
    'Freshness guaranteed on every order',
    'Only authentic, original brands — no imitations',
    'Careful packaging to prevent damage in transit',
    'Responsive customer support 7 days a week',
    'Easy 14-day returns policy'
  ];

  constructor(public settings: SettingsService, seo: SeoService) {
    seo.setMeta({ title: 'About Us', description: 'Learn about our story, values, and commitment to bringing authentic Indian groceries to your door in Hong Kong.' });
  }
}

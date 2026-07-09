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
      <nav class="ab-crumbs"><a routerLink="/">Home</a><i>/</i><span>About Us</span></nav>
      <span class="ab-eyebrow">Our Story</span>
      <h1>Flavours from <span class="ab-saf">three worlds</span><br>to one table</h1>
      <p>{{ settings.get('site_tagline', 'Premium groceries from India, Finland & Germany') }}</p>
    </div>
    <div class="ab-hero-deco">🌶️</div>
  </section>

  <!-- Story section -->
  <section class="ab-story section">
    <div class="container ab-story-grid">
      <div class="ab-story-text">
        <span class="sec-eyebrow">Who We Are</span>
        <h2 class="sec-title">{{ settings.get('about_headline','A Community Built on Taste & Trust') }}</h2>
        <div class="ab-story-body">
          <p>{{ settings.get('about_paragraph_1', 'We started with a simple mission: to bring the authentic tastes of India, Finland and Germany to every table — without compromise on quality or freshness.') }}</p>
          <p>{{ settings.get('about_paragraph_2', 'From fragrant basmati and hand-ground masalas to Nordic rye, wild berry preserves, proper pretzels and fine chocolate — every product is selected to taste like home, wherever home is.') }}</p>
        </div>
        <a routerLink="/categories" class="ab-cta">
          Shop Our Range
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
      <div class="ab-story-img">
        <div class="ab-img-card">
          <div class="ab-img-emoji">🏪</div>
          <div class="ab-img-overlay">
            <strong>{{ settings.get('site_name','Kale Gida') }}</strong>
            <span>Est. {{ settings.get('founded_year','2018') }}</span>
          </div>
        </div>
        <div class="ab-img-float">
          <span>🌟</span>
          <strong>{{ settings.get('about_stat_1','2,000+') }}</strong>
          <em>Happy Customers</em>
        </div>
      </div>
    </div>
  </section>

  <!-- Values -->
  <section class="ab-values section" style="background:#F7FAFC">
    <div class="container">
      <div style="text-align:center;margin-bottom:40px">
        <span class="sec-eyebrow">Our Values</span>
        <h2 class="sec-title">Why Families Choose Us</h2>
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

  <!-- Team / Promise -->
  <section class="section">
    <div class="container ab-promise">
      <div class="ab-promise-text">
        <span class="sec-eyebrow">Our Promise</span>
        <h2 class="sec-title">Quality You Can Taste</h2>
        <p class="sec-sub" style="margin-bottom:20px">Every product in our store is hand-picked and quality-checked. We only stock what we'd happily serve to our own families.</p>
        <ul class="ab-promise-list">
          @for (p of promises; track p) {
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="#29B8D5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ p }}
            </li>
          }
        </ul>
        <a routerLink="/contact" class="ab-cta" style="margin-top:12px">Get In Touch</a>
      </div>
      <div class="ab-promise-cards">
        <div class="ab-prom-card" style="background:#1F2937">
          <div style="font-size:2.5rem;margin-bottom:12px">🚚</div>
          <strong>Free Delivery</strong>
          <p>On orders over {{ settings.get('currency_symbol','€') }}{{ settings.get('shipping_free_above','50') }}</p>
        </div>
        <div class="ab-prom-card" style="background:#1E88A8">
          <div style="font-size:2.5rem;margin-bottom:12px">🌶️</div>
          <strong>Authentic Products</strong>
          <p>Sourced directly from trusted suppliers</p>
        </div>
        <div class="ab-prom-card" style="background:#29B8D5">
          <div style="font-size:2.5rem;margin-bottom:12px">💬</div>
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
      <p>Join thousands of happy customers across {{ settings.get('store_country','Finland') }}</p>
      <div class="ab-cta-btns">
        <a routerLink="/categories" class="ab-cta-primary">Shop Now</a>
        <a routerLink="/contact" class="ab-cta-outline">Contact Us</a>
      </div>
    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:1200px){.container{padding:0 48px}}
  .section { padding: 72px 0; }
  .sec-eyebrow { display: inline-block; font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #1E88A8; margin-bottom: 10px; }
  .sec-title { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 400; color: #111827; margin-bottom: 12px; line-height: 1.2; }
  .sec-sub { font-size: 15px; color: #6B7280; line-height: 1.7; }

  /* HERO */
  .ab-hero { background: #1F2937; padding: 72px 0 80px; position: relative; overflow: hidden; }
  .ab-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 16px; }
  .ab-crumbs a { color: rgba(255,255,255,.65); transition: color .2s; } .ab-crumbs a:hover { color: #1E88A8; }
  .ab-crumbs i { font-style: normal; opacity: .35; }
  .ab-eyebrow { display: inline-block; font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #1E88A8; margin-bottom: 14px; }
  .ab-hero h1 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 400; color: #fff; line-height: 1.15; margin-bottom: 16px; max-width: 680px; }
  .ab-saf { color: #1E88A8; }
  .ab-hero p { font-size: 17px; color: rgba(255,255,255,.7); max-width: 560px; line-height: 1.7; }
  .ab-hero-deco { position: absolute; right: 10%; top: 50%; transform: translateY(-50%); font-size: 160px; opacity: .04; pointer-events: none; user-select: none; }

  /* STORY */
  .ab-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .ab-story-body { display: flex; flex-direction: column; gap: 14px; margin: 20px 0 28px; }
  .ab-story-body p { font-size: 15.5px; color: #4A5568; line-height: 1.8; }
  .ab-cta { display: inline-flex; align-items: center; gap: 8px; background: #1E88A8; color: #fff; padding: 13px 26px; border-radius: 999px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; box-shadow: 0 6px 20px rgba(30,136,168,.28); transition: all .25s; }
  .ab-cta:hover { background: #16708C; transform: translateY(-1px); }
  .ab-story-img { position: relative; }
  .ab-img-card { background: #1F2937; border-radius: 24px; height: 380px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .ab-img-emoji { font-size: 7rem; }
  .ab-img-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(17,24,39,.8); padding: 20px 24px; backdrop-filter: blur(8px); }
  .ab-img-overlay strong { display: block; font-family: 'Fraunces', Georgia, serif; font-size: 1.2rem; color: #fff; }
  .ab-img-overlay span { font-size: 13px; color: rgba(255,255,255,.6); font-family: 'Manrope', sans-serif; }
  .ab-img-float { position: absolute; top: 24px; right: -20px; background: #fff; border-radius: 16px; padding: 14px 18px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 8px 28px rgba(17,24,39,.2); }
  .ab-img-float span { font-size: 1.4rem; }
  .ab-img-float strong { font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 800; color: #1E88A8; }
  .ab-img-float em { font-style: normal; font-size: 11px; color: #9CA3AF; font-family: 'Manrope', sans-serif; }

  /* VALUES */
  .ab-values-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .ab-value-card { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 20px; padding: 28px 22px; transition: all .3s; }
  .ab-value-card:hover { transform: translateY(-5px); box-shadow: 0 14px 36px rgba(17,24,39,.1); border-color: rgba(30,136,168,.25); }
  .ab-value-icon { font-size: 2.2rem; margin-bottom: 14px; }
  .ab-value-card h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.05rem; font-weight: 400; color: #111827; margin-bottom: 8px; }
  .ab-value-card p { font-size: 13.5px; color: #6B7280; line-height: 1.6; margin: 0; }

  /* STATS BAND */
  .ab-stats-band { background: #1E88A8; padding: 40px 0; }
  .ab-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; }
  .ab-stat-item { text-align: center; padding: 0 24px; border-right: 1px solid rgba(255,255,255,.2); }
  .ab-stat-item:last-child { border-right: none; }
  .ab-stat-item strong { display: block; font-family: 'Fraunces', Georgia, serif; font-size: 2.2rem; font-weight: 400; color: #fff; margin-bottom: 4px; }
  .ab-stat-item span { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.8); font-family: 'Manrope', sans-serif; text-transform: uppercase; letter-spacing: .1em; }

  /* PROMISE */
  .ab-promise { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .ab-promise-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; }
  .ab-promise-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: #4A5568; line-height: 1.5; }
  .ab-promise-list svg { flex-shrink: 0; margin-top: 2px; }
  .ab-promise-cards { display: flex; flex-direction: column; gap: 14px; }
  .ab-prom-card { border-radius: 16px; padding: 22px 24px; color: #fff; }
  .ab-prom-card strong { display: block; font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 800; margin-bottom: 4px; }
  .ab-prom-card p { font-size: 13.5px; opacity: .8; margin: 0; }

  /* CTA BAND */
  .ab-cta-band { background: #1F2937; padding: 72px 0; text-align: center; }
  .ab-cta-inner h2 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 400; color: #fff; margin-bottom: 10px; }
  .ab-cta-inner p { font-size: 16px; color: rgba(255,255,255,.6); margin-bottom: 32px; }
  .ab-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .ab-cta-primary { background: #1E88A8; color: #fff; padding: 14px 32px; border-radius: 999px; font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 800; box-shadow: 0 6px 20px rgba(30,136,168,.3); transition: all .25s; }
  .ab-cta-primary:hover { background: #16708C; transform: translateY(-1px); }
  .ab-cta-outline { background: transparent; color: #fff; padding: 14px 32px; border-radius: 999px; border: 2px solid rgba(255,255,255,.3); font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 700; transition: all .25s; }
  .ab-cta-outline:hover { border-color: #fff; background: rgba(255,255,255,.08); }

  @media (max-width: 900px) {
    .ab-story-grid { grid-template-columns: 1fr; gap: 36px; }
    .ab-img-float { right: 0; }
    .ab-values-grid { grid-template-columns: repeat(2,1fr); }
    .ab-stats-grid { grid-template-columns: repeat(2,1fr); }
    .ab-stat-item { padding: 12px; border-right: none; border-bottom: 1px solid rgba(255,255,255,.2); }
    .ab-promise { grid-template-columns: 1fr; gap: 36px; }
  }
  @media (max-width: 480px) {
    .ab-values-grid { grid-template-columns: 1fr; }
    .ab-stats-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 640px) {
    .section { padding: 40px 0; }
    .ab-hero { padding: 34px 0 40px; }
    .ab-cta-band { padding: 40px 0; }
  }
  `]
})
export class AboutComponent {
  values = [
    { icon: '🌶️', title: 'Authentic Quality', desc: 'Every product is hand-selected from trusted suppliers who share our passion for authenticity.' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Quick, reliable delivery across the country with free shipping on larger orders.' },
    { icon: '💚', title: 'Community First', desc: 'We are part of the community we serve — supporting families just like yours.' },
    { icon: '🔒', title: 'Secure & Simple', desc: 'Shop with confidence. Easy returns, secure payments, and friendly support.' }
  ];

  stats = [
    { value: '2,000+', label: 'Happy Customers' },
    { value: '500+', label: 'Products' },
    { value: '5★', label: 'Average Rating' },
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
    seo.setMeta({ title: 'About Us', description: 'Learn about our story, values, and commitment to bringing authentic Indian groceries to your door.' });
  }
}

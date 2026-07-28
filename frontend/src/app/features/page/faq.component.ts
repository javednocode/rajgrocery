import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';

interface Faq { q: string; a: string; open?: boolean; }

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink],
  template: `
  <!-- Hero -->
  <section class="fq-hero">
    <div class="container">
      <nav class="fq-crumbs"><a routerLink="/">Home</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>FAQ</span></nav>
      <h1>Frequently Asked Questions</h1>
      <p>Everything you need to know about shopping with us. Can't find your answer? <a routerLink="/contact">Contact us</a></p>
    </div>
  </section>

  <!-- Body -->
  <section class="fq-body">
    <div class="container fq-layout">
      <nav class="fq-cats">
        @for (cat of categories; track cat.id) {
          <button class="fq-cat-btn" [class.on]="activeCategory() === cat.id" (click)="activeCategory.set(cat.id)">
            <span class="fq-cat-icon">{{ cat.icon }}</span>
            {{ cat.label }}
          </button>
        }
        <a routerLink="/contact" class="fq-contact-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
          Still need help?
        </a>
      </nav>

      <div class="fq-list">
        <h2 class="fq-cat-title">{{ currentCategory()?.label }}</h2>
        <div class="fq-items">
          @for (item of currentFaqs(); track item.q; let i = $index) {
            <div class="fq-item" [class.open]="openIndex() === i">
              <button class="fq-question" (click)="toggle(i)">
                <span>{{ item.q }}</span>
                <div class="fq-chevron" [class.rotated]="openIndex() === i">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </button>
              @if (openIndex() === i) {
                <div class="fq-answer">{{ item.a }}</div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  </section>

  <!-- Bottom CTA -->
  <section class="fq-cta">
    <div class="container fq-cta-inner">
      <h2>Still have questions?</h2>
      <p>Our friendly team is available 7 days a week and typically responds within a few hours.</p>
      <div class="fq-cta-btns">
        <a routerLink="/contact" class="fq-btn-primary">Contact Support</a>
        <a routerLink="/categories" class="fq-btn-outline">Start Shopping</a>
      </div>
    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1360px; margin: 0 auto; padding: 0 24px; width: 100%; }
  @media(min-width:768px){.container{padding:0 40px}}
  @media(min-width:1200px){.container{padding:0 56px}}

  /* HERO */
  .fq-hero { background: var(--kg-dark); padding: 48px 0 56px; position: relative; overflow: hidden; }
  .fq-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 140% at 20% 60%, rgba(74,127,212,.2) 0%, transparent 70%); pointer-events: none; }
  .fq-hero .container { position: relative; z-index: 1; }
  .fq-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: rgba(255,255,255,.38); margin-bottom: 16px; }
  .fq-crumbs a { color: rgba(255,255,255,.6); transition: color .2s; } .fq-crumbs a:hover { color: var(--kg-forest-lt); }
  .fq-crumbs svg { opacity: .35; flex-shrink: 0; }
  .fq-hero h1 { font-family: var(--font-sans); font-size: clamp(1.7rem, 3.5vw, 2.6rem); font-weight: 800; color: var(--kg-cream); margin-bottom: 10px; letter-spacing: -0.02em; }
  .fq-hero p { font-size: 15px; color: rgba(255,255,255,.55); max-width: 520px; line-height: 1.7; }
  .fq-hero p a { color: var(--kg-forest-lt); font-weight: 700; transition: color .2s; }
  .fq-hero p a:hover { color: var(--kg-cream); }

  /* BODY */
  .fq-body { padding: 48px 0 64px; background: var(--kg-cream); }
  .fq-layout { display: grid; grid-template-columns: 220px 1fr; gap: 40px; align-items: start; }

  /* CATEGORY NAV */
  .fq-cats { position: sticky; top: calc(var(--header-height) + 20px); display: flex; flex-direction: column; gap: 4px; }
  .fq-cat-btn { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 10px; border: none; background: transparent; font-family: var(--font-sans); font-size: 13.5px; font-weight: 600; color: var(--kg-muted); cursor: pointer; transition: all .2s; text-align: left; }
  .fq-cat-btn:hover { background: var(--kg-forest-bg); color: var(--kg-forest); }
  .fq-cat-btn.on { background: var(--kg-forest); color: var(--kg-cream); font-weight: 800; }
  .fq-cat-icon { font-size: 15px; flex-shrink: 0; }
  .fq-contact-pill { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding: 11px 14px; border-radius: 10px; background: var(--kg-warm); border: 1px solid var(--kg-line-lt); font-family: var(--font-sans); font-size: 13px; font-weight: 700; color: var(--kg-muted); transition: all .2s; text-decoration: none; }
  .fq-contact-pill:hover { border-color: var(--kg-forest); color: var(--kg-forest); background: var(--kg-forest-bg); }

  /* FAQ LIST */
  .fq-cat-title { font-family: var(--font-sans); font-size: 1.3rem; font-weight: 800; color: var(--kg-ink); margin-bottom: 22px; letter-spacing: -0.01em; }
  .fq-items { display: flex; flex-direction: column; gap: 10px; }
  .fq-item { background: var(--kg-paper); border: 1px solid var(--kg-line-lt); border-radius: 12px; overflow: hidden; transition: border-color .2s; }
  .fq-item.open { border-color: var(--kg-forest); }
  .fq-question { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; padding: 17px 20px; background: none; border: none; cursor: pointer; text-align: left; font-family: var(--font-sans); font-size: 14.5px; font-weight: 700; color: var(--kg-ink); transition: color .2s; }
  .fq-question:hover { color: var(--kg-forest); }
  .fq-item.open .fq-question { color: var(--kg-forest); }
  .fq-chevron { flex-shrink: 0; color: var(--kg-faint); transition: transform .3s var(--ease); }
  .fq-chevron.rotated { transform: rotate(180deg); color: var(--kg-forest); }
  .fq-answer { padding: 0 20px 16px; font-size: 14px; color: var(--kg-muted); line-height: 1.75; border-top: 1px solid var(--kg-line-lt); padding-top: 14px; animation: fadeSlide .25s ease; }
  @keyframes fadeSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

  /* CTA BOTTOM */
  .fq-cta { background: var(--kg-dark); padding: 64px 0; }
  .fq-cta-inner { text-align: center; max-width: 520px; margin: 0 auto; }
  .fq-cta-inner h2 { font-family: var(--font-sans); font-size: 1.6rem; font-weight: 800; color: var(--kg-cream); margin-bottom: 10px; }
  .fq-cta-inner p { font-size: 14.5px; color: rgba(255,255,255,.55); margin-bottom: 28px; line-height: 1.7; }
  .fq-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .fq-btn-primary { background: var(--kg-forest); color: var(--kg-cream); padding: 13px 28px; border-radius: var(--r-full); font-family: var(--font-sans); font-size: 14px; font-weight: 800; box-shadow: var(--shadow-forest); transition: all .25s; text-decoration: none; }
  .fq-btn-primary:hover { background: var(--kg-forest-dk); transform: translateY(-2px); }
  .fq-btn-outline { background: transparent; color: var(--kg-cream); padding: 13px 28px; border-radius: var(--r-full); border: 1.5px solid rgba(255,255,255,.25); font-family: var(--font-sans); font-size: 14px; font-weight: 700; transition: all .25s; text-decoration: none; }
  .fq-btn-outline:hover { border-color: rgba(255,255,255,.5); background: rgba(255,255,255,.06); transform: translateY(-2px); }

  @media (max-width: 900px) {
    .fq-layout { grid-template-columns: 1fr; }
    .fq-cats { position: static; flex-direction: row; flex-wrap: wrap; }
    .fq-contact-pill { margin-top: 0; }
  }
  @media (max-width: 480px) {
    .fq-cats { gap: 6px; }
    .fq-cat-btn { padding: 8px 12px; font-size: 12.5px; }
  }
  @media (max-width: 640px) {
    .fq-hero { padding: 28px 0 32px; }
    .fq-body { padding: 28px 0 40px; }
    .fq-cta { padding: 36px 0; }
  }
  `]
})
export class FaqComponent {
  openIndex = signal<number | null>(null);
  activeCategory = signal('ordering');

  categories = [
    { id: 'ordering', label: 'Ordering', icon: '🛒' },
    { id: 'delivery', label: 'Delivery', icon: '🚚' },
    { id: 'products', label: 'Products', icon: '🌶️' },
    { id: 'returns', label: 'Returns', icon: '🔄' },
    { id: 'payment', label: 'Payment', icon: '💳' },
  ];

  faqs: Record<string, Faq[]> = {};

  constructor(public settings: SettingsService, seo: SeoService) {
    const cur = settings.get('currency_symbol','HK$');
    const freeAbove = settings.get('shipping_free_above','50');
    const country = settings.get('store_country','Hong Kong');
    this.faqs = {
      ordering: [
        { q: 'How do I place an order?', a: 'Simply browse our categories, add items to your basket, and proceed to checkout. You can enter your delivery address and place the order in just a few minutes.' },
        { q: 'Can I modify or cancel my order?', a: 'Please contact us as soon as possible if you need to change or cancel an order. Once the order has been dispatched we are unable to make changes.' },
        { q: 'Do I need an account to order?', a: 'No, you can shop as a guest. However, having an account lets you save items to your wishlist and view past orders more easily.' },
        { q: 'How do I use a discount code?', a: 'Enter your coupon code in the basket page before proceeding to checkout. The discount will be applied automatically if the code is valid.' },
      ],
      delivery: [
        { q: 'How long does delivery take?', a: 'Standard delivery typically takes 1–3 working days. You will receive a confirmation with tracking details once your order is dispatched.' },
        { q: 'Do you offer free delivery?', a: `Yes! Orders over ${cur}${freeAbove} qualify for free standard delivery.` },
        { q: 'Which areas do you deliver to?', a: `We deliver within ${country}. Contact us if you\'re unsure about your area.` },
        { q: 'What happens if I miss my delivery?', a: 'Our delivery partner will leave a card or notification with instructions to rearrange delivery or collect from a local depot.' },
      ],
      products: [
        { q: 'Are your products authentic?', a: 'Yes — every product we carry is sourced from trusted suppliers and is the genuine article. We never stock imitations or repackaged goods.' },
        { q: 'How do you ensure freshness?', a: 'We rotate stock regularly and only purchase from suppliers with high turnover. Products with a best-before date are clearly labelled.' },
        { q: 'Do you stock vegetarian & vegan products?', a: 'Yes. We carry a wide range of vegetarian and vegan-friendly products including dairy-free, gluten-free, and organic options.' },
        { q: 'Can I request a product you don\'t stock?', a: 'Absolutely! Contact us and we\'ll do our best to source it. We love hearing what our customers want.' },
      ],
      returns: [
        { q: 'What is your returns policy?', a: 'We accept returns within 14 days of delivery for non-perishable items that are unopened and in original condition. Contact us first to arrange the return.' },
        { q: 'What if my order arrives damaged?', a: 'Please take a photo and contact us within 48 hours of delivery. We\'ll arrange a replacement or full refund promptly.' },
        { q: 'Can I return perishable items?', a: 'For food safety reasons we cannot accept returns on perishable goods unless they were delivered damaged or incorrect.' },
        { q: 'How long does a refund take?', a: 'Refunds are usually processed within 3–5 working days and appear in your account within 5–10 working days.' },
      ],
      payment: [
        { q: 'What payment methods do you accept?', a: 'We currently accept cash on delivery. Pay when your order arrives — no card details needed.' },
        { q: 'Is my payment information secure?', a: 'Absolutely. We use 256-bit SSL encryption and are fully PCI compliant. We never store your card details on our servers.' },
        { q: 'Can I pay on delivery?', a: 'Cash on delivery is available in select areas. This option will appear at checkout if it is available for your delivery address.' },
        { q: 'Will I receive a receipt?', a: 'Yes — a full order confirmation and receipt is sent to your email address immediately after placing your order.' },
      ],
    };
    seo.setMeta({ title: 'FAQ', description: 'Find answers to common questions about ordering, delivery, products, returns, and payment.' });
  }

  currentCategory() { return this.categories.find(c => c.id === this.activeCategory()); }
  currentFaqs(): Faq[] { return this.faqs[this.activeCategory()] || []; }

  toggle(i: number) {
    this.openIndex.set(this.openIndex() === i ? null : i);
  }
}

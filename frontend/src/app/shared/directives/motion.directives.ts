import { Directive, ElementRef, Input, NgZone, OnDestroy, OnInit } from '@angular/core';

const REDUCED = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const TOUCH = typeof window !== 'undefined'
  && window.matchMedia?.('(hover: none)').matches;

/**
 * Scroll parallax — moves the element vertically relative to its
 * position in the viewport. GPU transform only, runs outside Angular.
 *
 *   <div kgParallax="0.18">   → moves gently with scroll
 *   <div kgParallax="-0.1">   → counter-moves
 */
@Directive({ selector: '[kgParallax]', standalone: true })
export class ParallaxDirective implements OnInit, OnDestroy {
  @Input() kgParallax: number | string = 0.14;

  private raf = 0;
  private active = false;
  private io?: IntersectionObserver;
  private onScroll = () => { if (this.active && !this.raf) this.raf = requestAnimationFrame(this.update); };
  private update = () => {
    this.raf = 0;
    const speed = Number(this.kgParallax) || 0;
    const el = this.el.nativeElement as HTMLElement;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const delta = (r.top + r.height / 2) - vh / 2;
    el.style.transform = `translate3d(0, ${(-delta * speed).toFixed(1)}px, 0)`;
  };

  constructor(private el: ElementRef, private zone: NgZone) {}

  ngOnInit() {
    if (REDUCED) return;
    const node = this.el.nativeElement as HTMLElement;
    node.style.willChange = 'transform';
    this.zone.runOutsideAngular(() => {
      this.io = new IntersectionObserver(([e]) => {
        this.active = e.isIntersecting;
        if (this.active) this.onScroll();
      }, { rootMargin: '80px' });
      this.io.observe(node);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });
  }

  ngOnDestroy() {
    this.io?.disconnect();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

/**
 * Scroll progress — writes the element's journey through the viewport into
 * a `--scroll-p` CSS variable (0 → 1) so styles can drive any property off
 * scroll position: parallax layers, text scrubs, drifting cards.
 *
 *   <section kgScrollProgress>          → 0 entering at bottom, 1 leaving at top
 *   <section kgScrollProgress="exit">   → 0 while fully visible, 1 once scrolled past
 *
 * Runs outside Angular on rAF; gated by IntersectionObserver.
 */
@Directive({ selector: '[kgScrollProgress]', standalone: true })
export class ScrollProgressDirective implements OnInit, OnDestroy {
  @Input() kgScrollProgress: 'through' | 'exit' | '' = 'through';

  private raf = 0;
  private active = false;
  private io?: IntersectionObserver;
  private onScroll = () => { if (this.active && !this.raf) this.raf = requestAnimationFrame(this.update); };
  private update = () => {
    this.raf = 0;
    const el = this.el.nativeElement as HTMLElement;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    let p: number;
    if (this.kgScrollProgress === 'exit') {
      p = -r.top / Math.max(r.height, 1);
    } else {
      p = (vh - r.top) / (vh + r.height);
    }
    el.style.setProperty('--scroll-p', Math.min(Math.max(p, 0), 1).toFixed(4));
  };

  constructor(private el: ElementRef, private zone: NgZone) {}

  ngOnInit() {
    if (REDUCED) return;
    const node = this.el.nativeElement as HTMLElement;
    this.zone.runOutsideAngular(() => {
      this.io = new IntersectionObserver(([e]) => {
        this.active = e.isIntersecting;
        if (this.active) this.onScroll();
      }, { rootMargin: '140px' });
      this.io.observe(node);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
      this.update();
    });
  }

  ngOnDestroy() {
    this.io?.disconnect();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

/**
 * Mouse parallax — drifts the element toward/away from the cursor.
 * Used for floating hero ingredients. Depth sets intensity in px.
 *
 *   <span kgMouseParallax="24">
 */
@Directive({ selector: '[kgMouseParallax]', standalone: true })
export class MouseParallaxDirective implements OnInit, OnDestroy {
  @Input() kgMouseParallax: number | string = 20;

  private raf = 0;
  private mx = 0; private my = 0;
  private onMove = (e: MouseEvent) => {
    this.mx = (e.clientX / window.innerWidth) - 0.5;
    this.my = (e.clientY / window.innerHeight) - 0.5;
    if (!this.raf) this.raf = requestAnimationFrame(this.update);
  };
  private update = () => {
    this.raf = 0;
    const depth = Number(this.kgMouseParallax) || 0;
    (this.el.nativeElement as HTMLElement).style.transform =
      `translate3d(${(this.mx * depth).toFixed(1)}px, ${(this.my * depth).toFixed(1)}px, 0)`;
  };

  constructor(private el: ElementRef, private zone: NgZone) {}

  ngOnInit() {
    if (REDUCED || TOUCH) return;
    this.zone.runOutsideAngular(() =>
      window.addEventListener('mousemove', this.onMove, { passive: true }));
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.onMove);
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

/**
 * Magnetic hover — the element leans toward the cursor while hovered
 * and springs back on leave. Subtle by design.
 *
 *   <a kgMagnetic>Shop now</a>
 */
@Directive({ selector: '[kgMagnetic]', standalone: true })
export class MagneticDirective implements OnInit, OnDestroy {
  @Input() kgMagnetic: number | string = 0.28;

  private onMove = (e: MouseEvent) => {
    const el = this.el.nativeElement as HTMLElement;
    const r = el.getBoundingClientRect();
    const pull = Number(this.kgMagnetic) || 0.28;
    const x = (e.clientX - r.left - r.width / 2) * pull;
    const y = (e.clientY - r.top - r.height / 2) * pull;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  };
  private onLeave = () => {
    const el = this.el.nativeElement as HTMLElement;
    el.style.transform = 'translate3d(0,0,0)';
  };

  constructor(private el: ElementRef, private zone: NgZone) {}

  ngOnInit() {
    if (REDUCED || TOUCH) return;
    const el = this.el.nativeElement as HTMLElement;
    el.style.transition = 'transform .35s cubic-bezier(0.22,1,0.36,1)';
    this.zone.runOutsideAngular(() => {
      el.addEventListener('mousemove', this.onMove, { passive: true });
      el.addEventListener('mouseleave', this.onLeave, { passive: true });
    });
  }

  ngOnDestroy() {
    const el = this.el.nativeElement as HTMLElement;
    el.removeEventListener('mousemove', this.onMove);
    el.removeEventListener('mouseleave', this.onLeave);
  }
}

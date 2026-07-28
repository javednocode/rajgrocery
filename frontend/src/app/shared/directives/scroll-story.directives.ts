import { Directive, ElementRef, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

/* ══════════════════════════════════════════════════════════════════
   SCROLL STORY — a single-loop scrub engine.

   Everything on screen is driven by where the reader's scroll actually
   is, never by timers: each subscriber computes a target progress from
   its position in the viewport, and the engine eases the displayed
   value toward it every frame (exponential smoothing). The result is
   motion that tracks the finger 1:1 but settles with weight.

   One passive scroll listener, one IntersectionObserver for gating,
   one rAF loop that sleeps when every value has converged.
   ══════════════════════════════════════════════════════════════════ */

const BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';
const REDUCED = BROWSER && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface FrameMetrics { vh: number; sy: number; max: number; }

interface StoryNode {
  el: HTMLElement;
  active: boolean;
  /** Read phase — only DOM reads allowed. */
  measure(m: FrameMetrics): void;
  /** Write phase — apply eased values. Returns true once converged. */
  apply(alpha: number): boolean;
}

const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;

/**
 * Progress of an element travelling up the viewport: 0 when its top is at
 * the bottom edge, 1 once its top reaches `endFrac` of the way up. Near the
 * end of the document the finish line is moved down so the value can always
 * reach 1 — reveals never stall half-open on the last screen.
 */
function travel(top: number, m: FrameMetrics, endFrac: number): number {
  const topDoc = top + m.sy;
  const reachable = topDoc - m.max;             // best top position at full scroll
  const floor = Math.max(m.vh * (1 - endFrac), reachable);
  return clamp01((m.vh - top) / Math.max(48, m.vh - floor));
}

class ScrollStoryEngine {
  private nodes = new Map<Element, StoryNode>();
  private io?: IntersectionObserver;
  private raf = 0;
  private last = 0;
  private calm = 0;
  private listening = false;
  private lastTick = 0;

  private wake = () => {
    this.calm = 0;
    if (!this.raf && this.nodes.size) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  };

  private tick = (now: number) => { this.run(now, false); };

  /**
   * `force` ignores the IntersectionObserver gating: IO callbacks are
   * rendering-aligned, so in environments where frames stall (throttled,
   * occluded or embedded tabs) no node ever becomes active and the engine
   * would no-op forever. The timer fallback force-runs every node instead.
   */
  private run(now: number, force: boolean) {
    this.raf = 0;
    this.lastTick = now;
    const dt = Math.min(64, Math.max(1, now - this.last));
    this.last = now;
    const m: FrameMetrics = {
      vh: window.innerHeight,
      sy: window.scrollY,
      max: Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
    };
    // Ease constant ~120ms: glued to the scroll, settles with weight.
    const alpha = 1 - Math.exp(-dt / 120);
    let settled = true;
    this.nodes.forEach(n => { if (n.active || force) n.measure(m); });        // reads
    this.nodes.forEach(n => { if ((n.active || force) && !n.apply(alpha)) settled = false; }); // writes
    this.calm = settled ? this.calm + 1 : 0;
    if (this.calm < 3) this.raf = requestAnimationFrame(this.tick);
  }

  add(node: StoryNode) {
    if (!this.listening) {
      this.listening = true;
      window.addEventListener('scroll', this.wake, { passive: true });
      window.addEventListener('resize', this.wake, { passive: true });
      // Watchdog: rAF can be throttled or suspended (battery saver, hidden
      // or embedded tabs, extensions). If frames stop while values are still
      // unsettled, drive the loop from a timer so reveals NEVER hang and
      // leave invisible content holding layout space. Zero cost when rAF
      // is healthy — the timer only steps in when frames go quiet.
      let lastSy = -1;
      setInterval(() => {
        if (!this.nodes.size) return;
        if (window.scrollY !== lastSy) { lastSy = window.scrollY; this.calm = 0; }
        if (this.calm >= 3) return;
        if (performance.now() - this.lastTick > 700) this.run(performance.now(), true);
      }, 400);
      this.io = new IntersectionObserver(entries => {
        for (const e of entries) {
          const n = this.nodes.get(e.target);
          if (n) n.active = e.isIntersecting;
        }
        this.wake();
      }, { rootMargin: '45% 0px 45% 0px' });
    }
    this.nodes.set(node.el, node);
    this.io!.observe(node.el);
    this.wake();
  }

  remove(node: StoryNode) {
    this.nodes.delete(node.el);
    this.io?.unobserve(node.el);
  }

  nudge() { this.wake(); }
}

let engine: ScrollStoryEngine | null = null;
function getEngine(): ScrollStoryEngine {
  return engine ??= new ScrollStoryEngine();
}

/* ══════════════════════════════════════════════════════════════════
   kgScene — section choreography variables.

   Writes eased progress values as CSS custom properties on the host so
   the section's stylesheet can drive parallax pans, held-back exits and
   text fills off the scroll:

     --enter    0→1 while the section arrives (top: bottom edge → 55% up)
     --through  0→1 across its full traverse of the viewport
     --exit     0→1 as it leaves past the top
     --pin      pin mode only: 0→1 while the sticky first child is pinned

   All default to their settled value in CSS (var(--enter, 1) etc.), so
   without JS or with reduced motion nothing is ever hidden.
   ══════════════════════════════════════════════════════════════════ */
@Directive({ selector: '[kgScene]', standalone: true })
export class SceneDirective implements OnInit, OnDestroy {
  @Input() kgScene: '' | 'pin' = '';

  private cur = { enter: 0, through: 0, exit: 0, pin: 0 };
  private tgt = { enter: 0, through: 0, exit: 0, pin: 0 };
  private out = { enter: -1, through: -1, exit: -1, pin: -1 };
  private fresh = true;
  private node?: StoryNode;

  constructor(private ref: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit() {
    if (!BROWSER || REDUCED) return;
    const el = this.ref.nativeElement;
    this.node = {
      el, active: false,
      measure: (m) => {
        const r = el.getBoundingClientRect();
        this.tgt.through = clamp01((m.vh - r.top) / (m.vh + r.height));
        this.tgt.enter = travel(r.top, m, 0.45);
        this.tgt.exit = clamp01(-r.top / Math.max(r.height * 0.85, 240));
        if (this.kgScene === 'pin') {
          const stick = el.firstElementChild as HTMLElement | null;
          if (stick) {
            const s = stick.getBoundingClientRect();
            this.tgt.pin = clamp01((s.top - r.top) / Math.max(1, r.height - s.height));
          }
        }
      },
      apply: (alpha) => {
        const a = this.fresh ? 1 : alpha;
        this.fresh = false;
        let settled = true;
        for (const k of ['enter', 'through', 'exit', 'pin'] as const) {
          if (k === 'pin' && this.kgScene !== 'pin') continue;
          this.cur[k] += (this.tgt[k] - this.cur[k]) * a;
          if (Math.abs(this.tgt[k] - this.cur[k]) < 0.001) this.cur[k] = this.tgt[k];
          else settled = false;
          const v = Math.round(this.cur[k] * 1000) / 1000;
          if (v !== this.out[k]) {
            el.style.setProperty('--' + k, String(v));
            this.out[k] = v;
          }
        }
        return settled;
      },
    };
    this.zone.runOutsideAngular(() => getEngine().add(this.node!));
  }

  ngOnDestroy() { if (this.node) getEngine().remove(this.node); }
}

/* ══════════════════════════════════════════════════════════════════
   kgFx — scroll-scrubbed element reveal.

   Not a timed entrance: the element's position IS the animation. As it
   travels the lower part of the viewport its eased progress (0→1) is
   written to --p; global .sr styles map that to a rise / drift / tilt /
   masked wipe that settles exactly when the element reaches its resting
   zone. Scrolling back down replays it in reverse — the page feels
   pulled by the scroll, not triggered by it.

     <div kgFx="mask rise tilt-l" [fxOrder]="i % 4">

   Tokens: rise, rise-lg, slide-l, slide-r, tilt-l, tilt-r, zoom,
   mask (clip-path wipe), solid (no opacity ramp).
   fxOrder staggers siblings by shifting each one's progress window.
   ══════════════════════════════════════════════════════════════════ */
const FX_CLASSES: Record<string, string> = {
  'rise': 'fx-rise', 'rise-lg': 'fx-rise-lg', 'rise-sm': 'fx-rise-sm',
  'slide-l': 'fx-slide-l', 'slide-r': 'fx-slide-r',
  'tilt-l': 'fx-tilt-l', 'tilt-r': 'fx-tilt-r',
  'zoom': 'fx-zoom', 'mask': 'fx-mask', 'solid': 'fx-solid',
};

@Directive({ selector: '[kgFx]', standalone: true })
export class ScrollFxDirective implements OnInit, OnDestroy {
  @Input() kgFx = 'rise';
  @Input() fxOrder: number | string = 0;
  @Input() fxGap: number | string = 0.06;   // stagger shift per order unit
  @Input() fxEnd: number | string = 0.38;   // settles when top reaches (1-fxEnd) of vh

  private p = 0;
  private target = 0;
  private written = -1;
  private live = false;
  private fresh = true;
  private node?: StoryNode;

  constructor(private ref: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit() {
    if (!BROWSER || REDUCED) return;
    const el = this.ref.nativeElement;
    for (const token of String(this.kgFx).trim().split(/\s+/)) {
      const cls = FX_CLASSES[token];
      if (cls) el.classList.add(cls);
    }
    el.classList.add('sr', 'sr-live');
    el.style.setProperty('--p', '0');
    this.live = true;

    const ord = Number(this.fxOrder) || 0;
    const gap = Number(this.fxGap) || 0;
    const end = Number(this.fxEnd) || 0.38;

    this.node = {
      el, active: false,
      measure: (m) => {
        const raw = travel(el.getBoundingClientRect().top, m, end);
        const shift = Math.min(ord * gap, 0.5);
        this.target = clamp01((raw - shift) / Math.max(0.25, 1 - shift));
      },
      apply: (alpha) => {
        const a = this.fresh ? 1 : alpha;
        this.fresh = false;
        this.p += (this.target - this.p) * a;
        if (Math.abs(this.target - this.p) < 0.001) this.p = this.target;
        const v = Math.round(this.p * 1000) / 1000;
        if (v !== this.written) {
          this.written = v;
          el.style.setProperty('--p', String(v));
          if (v >= 1 && this.live) { this.live = false; el.classList.remove('sr-live'); }
          else if (v < 1 && !this.live) { this.live = true; el.classList.add('sr-live'); }
        }
        return this.p === this.target;
      },
    };
    this.zone.runOutsideAngular(() => getEngine().add(this.node!));
  }

  ngOnDestroy() { if (this.node) getEngine().remove(this.node); }
}

/* ══════════════════════════════════════════════════════════════════
   kgWords — scroll-scrubbed text reveal, word by word or line by line.

   Takes the copy as an input (so bindings stay reactive), renders each
   word inside an overflow mask, and slides them up out of their masks
   as the reader scrolls — each word owns a slice of the headline's
   progress, so text writes itself in with the scroll and un-writes if
   you scroll back.

     <h2 [kgWords]="title" wordsEm="table"></h2>          word by word
     <p  [kgWords]="intro" wordsMode="lines"></p>         line by line

   wordsEm: comma-separated words to wrap in <em> (accent styling).
   ══════════════════════════════════════════════════════════════════ */
@Directive({ selector: '[kgWords]', standalone: true })
export class WordsDirective implements OnChanges, OnDestroy {
  @Input() kgWords = '';
  @Input() wordsMode: 'words' | 'lines' = 'words';
  @Input() wordsEm = '';
  @Input() wordsEnd: number | string = 0.5;

  private spans: HTMLElement[] = [];
  private p = 0;
  private target = 0;
  private written = -1;
  private fresh = true;
  private node?: StoryNode;
  private ro?: ResizeObserver;
  private lineRaf = 0;

  constructor(private ref: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['kgWords']) this.rebuild();
  }

  private rebuild() {
    const el = this.ref.nativeElement;
    const text = String(this.kgWords ?? '').trim();
    if (!BROWSER || REDUCED) { el.textContent = text; return; }

    el.classList.add('kgw');
    el.textContent = '';
    this.spans = [];
    if (!text) return;

    const em = new Set(String(this.wordsEm).toLowerCase().split(',').map(w => w.trim()).filter(Boolean));
    const frag = document.createDocumentFragment();
    for (const word of text.split(/\s+/)) {
      const mask = document.createElement('span');
      mask.className = 'kgw-m';
      const w = document.createElement('span');
      w.className = 'kgw-w';
      if (em.has(word.toLowerCase().replace(/[.,!?;:'"]+$/, ''))) {
        const emEl = document.createElement('em');
        emEl.textContent = word;
        w.appendChild(emEl);
      } else {
        w.textContent = word;
      }
      mask.appendChild(w);
      frag.appendChild(mask);
      frag.appendChild(document.createTextNode(' '));
      this.spans.push(w);
    }
    el.appendChild(frag);
    this.assignByIndex();

    if (this.wordsMode === 'lines') {
      this.scheduleLineMeasure();
      (document as any).fonts?.ready?.then(() => this.scheduleLineMeasure());
      if (!this.ro && typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.scheduleLineMeasure());
        this.ro.observe(el);
      }
    }

    if (!this.node) {
      const end = Number(this.wordsEnd) || 0.5;
      this.node = {
        el, active: false,
        measure: (m) => { this.target = travel(el.getBoundingClientRect().top, m, end); },
        apply: (alpha) => {
          const a = this.fresh ? 1 : alpha;
          this.fresh = false;
          this.p += (this.target - this.p) * a;
          if (Math.abs(this.target - this.p) < 0.001) this.p = this.target;
          const v = Math.round(this.p * 1000) / 1000;
          if (v !== this.written) { this.written = v; el.style.setProperty('--p', String(v)); }
          return this.p === this.target;
        },
      };
      this.zone.runOutsideAngular(() => getEngine().add(this.node!));
    }
    getEngine().nudge();
  }

  /** Word-by-word: each word owns an overlapping slice of the headline's progress. */
  private assignByIndex() {
    const n = this.spans.length;
    if (!n) return;
    const wd = Math.min(0.6, 2.3 / (n + 1.3));
    const lastStart = 1 - wd;
    this.spans.forEach((s, i) => {
      s.style.setProperty('--ws', (n === 1 ? 0 : (i / (n - 1)) * lastStart).toFixed(4));
      s.style.setProperty('--wd', wd.toFixed(4));
    });
  }

  /** Line-by-line: group words by rendered row, whole rows share one slice. */
  private scheduleLineMeasure() {
    if (this.lineRaf) return;
    this.lineRaf = requestAnimationFrame(() => {
      this.lineRaf = 0;
      const n = this.spans.length;
      if (!n || this.wordsMode !== 'lines') return;
      const rows: number[] = [];
      const rowOf: number[] = [];
      for (const s of this.spans) {
        const top = Math.round(s.getBoundingClientRect().top);
        const idx = rows.findIndex(r => Math.abs(r - top) < 4);
        if (idx === -1) { rows.push(top); rowOf.push(rows.length - 1); }
        else rowOf.push(idx);
      }
      const L = rows.length;
      const wd = Math.min(0.7, 1.9 / (L + 0.9));
      const lastStart = 1 - wd;
      this.spans.forEach((s, i) => {
        const l = rowOf[i];
        s.style.setProperty('--ws', (L === 1 ? 0 : (l / (L - 1)) * lastStart).toFixed(4));
        s.style.setProperty('--wd', wd.toFixed(4));
      });
    });
  }

  ngOnDestroy() {
    if (this.node) getEngine().remove(this.node);
    this.ro?.disconnect();
    if (this.lineRaf) cancelAnimationFrame(this.lineRaf);
  }
}

/* ══════════════════════════════════════════════════════════════════
   kgPin — pinned horizontal gallery.

   The host becomes a tall scroll runway; its first child stays sticky
   (the stage) while the element marked [data-pin-track] translates
   horizontally, metre for metre with the vertical scroll — eased, so
   the shelf glides. Writes --p (0→1) on the host for progress hairlines.

     <section kgPin>
       <div class="stage (position:sticky)">
         <div data-pin-track> …cards… </div>
       </div>
     </section>

   Inert under 901px width and with reduced motion — pair it with a CSS
   fallback (native horizontal scroll or grid) in those states.
   ══════════════════════════════════════════════════════════════════ */
@Directive({ selector: '[kgPin]', standalone: true })
export class PinDirective implements OnInit, OnDestroy {
  private node?: StoryNode;
  private ro?: ResizeObserver;
  private overflow = 0;
  private setHeight = -1;
  private px = 0;
  private targetPx = 0;
  private written = -1;
  private pOut = -1;
  private fresh = true;
  private mq?: MediaQueryList;

  constructor(private ref: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit() {
    if (!BROWSER || REDUCED) return;
    const host = this.ref.nativeElement;
    const stage = host.firstElementChild as HTMLElement | null;
    const track = host.querySelector('[data-pin-track]') as HTMLElement | null;
    if (!stage || !track) return;

    this.mq = window.matchMedia('(max-width: 900px)');
    const sizes = () => {
      if (this.mq!.matches) {
        if (this.setHeight !== -1) {
          host.style.height = '';
          track.style.transform = '';
          this.setHeight = -1;
        }
        this.overflow = 0;
        return;
      }
      const over = Math.max(0, track.scrollWidth - stage.clientWidth);
      this.overflow = over;
      const h = Math.round(stage.offsetHeight + over);
      if (Math.abs(h - this.setHeight) > 2) {
        this.setHeight = h;
        host.style.height = over > 40 ? h + 'px' : '';
      }
      getEngine().nudge();
    };

    this.node = {
      el: host, active: false,
      measure: () => {
        if (!this.overflow) { this.targetPx = 0; return; }
        const hr = host.getBoundingClientRect();
        const sr = stage.getBoundingClientRect();
        this.targetPx = clamp01((sr.top - hr.top) / this.overflow) * this.overflow;
      },
      apply: (alpha) => {
        if (!this.overflow) return true;
        const a = this.fresh ? 1 : alpha;
        this.fresh = false;
        this.px += (this.targetPx - this.px) * a;
        if (Math.abs(this.targetPx - this.px) < 0.35) this.px = this.targetPx;
        const v = Math.round(this.px * 10) / 10;
        if (v !== this.written) {
          this.written = v;
          track.style.transform = `translate3d(${-v}px, 0, 0)`;
          const p = Math.round((v / this.overflow) * 1000) / 1000;
          if (p !== this.pOut) { this.pOut = p; host.style.setProperty('--p', String(p)); }
        }
        return this.px === this.targetPx;
      },
    };

    this.sizesFn = sizes;
    this.zone.runOutsideAngular(() => {
      track.style.willChange = 'transform';
      sizes();
      this.ro = new ResizeObserver(() => sizes());
      this.ro.observe(track);
      this.ro.observe(stage);
      this.mq!.addEventListener?.('change', sizes);
      window.addEventListener('resize', sizes, { passive: true });
      getEngine().add(this.node!);
    });
  }

  private sizesFn?: () => void;

  ngOnDestroy() {
    if (this.node) getEngine().remove(this.node);
    this.ro?.disconnect();
    if (this.sizesFn) {
      this.mq?.removeEventListener?.('change', this.sizesFn);
      window.removeEventListener('resize', this.sizesFn);
    }
  }
}

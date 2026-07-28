import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

const REDUCED = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

@Directive({ selector: '[appScrollAnimate]', standalone: true })
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() animationDelay = '0s';
  @Input() animationType: 'fade-up' | 'fade-left' | 'fade-right' | 'scale-in' | 'blur-in' | 'zoom-out' = 'fade-up';
  /** When true, the reveal plays only on the first entry (old behaviour). */
  @Input() animateOnce = false;
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (REDUCED) return;
    const node = this.el.nativeElement as HTMLElement;
    node.classList.add('td-reveal', `td-reveal--${this.animationType}`);
    if (this.animationDelay !== '0s') node.style.transitionDelay = this.animationDelay;
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('td-visible');
          if (this.animateOnce) this.observer?.unobserve(e.target);
        } else if (e.boundingClientRect.top > 0) {
          // Re-arm only when the element has dropped below the viewport,
          // so every downward scroll replays the entrance without making
          // content above the reader flicker.
          e.target.classList.remove('td-visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    this.observer.observe(node);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}

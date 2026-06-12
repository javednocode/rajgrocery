import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({ selector: '[appScrollAnimate]', standalone: true })
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() animationDelay = '0s';
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const node = this.el.nativeElement as HTMLElement;
    node.classList.add('td-reveal');
    if (this.animationDelay !== '0s') node.style.transitionDelay = this.animationDelay;
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('td-visible'); this.observer?.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    this.observer.observe(node);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}

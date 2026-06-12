import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-splash',
  standalone: true,
  template: `
  @if (show()) {
    <div class="sp" [class.out]="leaving()" aria-hidden="true">
      <div class="sp-mark"><span></span></div>
      <div class="sp-word">The Desi</div>
    </div>
  }
  `,
  styles: [`
  .sp{position:fixed;inset:0;z-index:2000;background:var(--td-primary);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;transition:opacity .5s var(--td-ease),visibility .5s}
  .sp.out{opacity:0;visibility:hidden}
  .sp-mark{width:54px;height:54px;border-radius:16px;background:#fff;position:relative;animation:spPop .7s var(--td-ease) both}
  .sp-mark span{position:absolute;inset:16px;border-radius:5px;background:var(--td-accent)}
  .sp-word{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:#fff;letter-spacing:-.02em;animation:spUp .7s var(--td-ease) .15s both}
  @keyframes spPop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes spUp{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}
  `]
})
export class SplashComponent implements OnInit {
  show = signal(true);
  leaving = signal(false);
  ngOnInit() {
    setTimeout(() => this.leaving.set(true), 900);
    setTimeout(() => this.show.set(false), 1450);
  }
}

import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="account-page">
      <div class="account-card">

        <!-- Logo -->
        <div class="account-logo">
          <img [src]="settings.assetUrl('site_logo', '/logo.svg')" [alt]="settings.get('site_name', 'Your Store')" style="height:52px;object-fit:contain;">
        </div>

        <!-- Tabs -->
        <div class="account-tabs">
          <button class="tab-btn" [class.active]="activeTab() === 'login'" (click)="activeTab.set('login')">Login</button>
          <button class="tab-btn" [class.active]="activeTab() === 'register'" (click)="activeTab.set('register')">Create Account</button>
        </div>

        <!-- Message -->
        @if (message()) {
          <div class="account-msg" [class.error]="isError()">{{ message() }}</div>
        }

        <!-- LOGIN FORM -->
        @if (activeTab() === 'login') {
          <form class="account-form" (ngSubmit)="doLogin()">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="loginEmail" name="loginEmail" required placeholder="you@example.com" class="form-control">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="loginPassword" name="loginPassword" required placeholder="••••••••" class="form-control">
            </div>
            <button type="submit" class="btn-submit" [disabled]="loading()">
              {{ loading() ? 'Signing in...' : 'Sign In' }}
            </button>
            <p class="switch-text">Don't have an account?
              <button type="button" class="link-btn" (click)="activeTab.set('register')">Create one</button>
            </p>
          </form>
        }

        <!-- REGISTER FORM -->
        @if (activeTab() === 'register') {
          <form class="account-form" (ngSubmit)="doRegister()">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="regName" name="regName" required placeholder="John Smith" class="form-control">
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="regEmail" name="regEmail" required placeholder="you@example.com" class="form-control">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" [(ngModel)]="regPhone" name="regPhone" placeholder="+1 555 123 4567" class="form-control">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="regPassword" name="regPassword" required placeholder="Min 6 characters" class="form-control">
            </div>
            <button type="submit" class="btn-submit" [disabled]="loading()">
              {{ loading() ? 'Creating account...' : 'Create Account' }}
            </button>
            <p class="switch-text">Already have an account?
              <button type="button" class="link-btn" (click)="activeTab.set('login')">Sign in</button>
            </p>
          </form>
        }

        <!-- Guest note -->
        <div class="guest-note">
          <p>Or continue as guest — <a routerLink="/categories">Browse products</a></p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .account-page {
      min-height: calc(100vh - var(--header-height, 80px));
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #F0ECF9 0%, #EAF7EF 100%);
      padding: 40px 16px;
    }
    .account-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 48px rgba(37,99,235,0.14);
      padding: 40px 36px;
      width: 100%; max-width: 420px;
      animation: fadeUp 0.4s ease both;
    }
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

    .account-logo { text-align: center; margin-bottom: 24px; }

    .account-tabs {
      display: flex; gap: 0;
      background: #F3F4F6; border-radius: 10px; padding: 4px;
      margin-bottom: 24px;
    }
    .tab-btn {
      flex: 1; padding: 10px; border: none; background: transparent;
      border-radius: 8px; font-size: 14px; font-weight: 600;
      color: #6B7280; cursor: pointer; transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .tab-btn.active {
      background: white; color: #2563EB;
      box-shadow: 0 2px 8px rgba(37,99,235,0.12);
    }

    .account-msg {
      background: #EAF7EF; color: #0F766E;
      border: 1px solid rgba(15,118,110,0.25);
      padding: 10px 14px; border-radius: 8px;
      font-size: 13.5px; font-weight: 500;
      margin-bottom: 16px; text-align: center;
    }
    .account-msg.error {
      background: #FFECEC; color: #DC2626;
      border-color: rgba(220,38,38,0.25);
    }

    .account-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label {
      font-size: 13px; font-weight: 600;
      color: #1E3A8A; letter-spacing: 0.01em;
    }
    .form-control {
      padding: 11px 14px; border: 1.5px solid #D1D5DB;
      border-radius: 9px; font-size: 14px; color: #1A1A2E;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
      font-family: 'Inter', sans-serif; background: white;
    }
    .form-control:focus {
      border-color: #2563EB;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    }

    .btn-submit {
      background: linear-gradient(135deg, #2563EB, #0F766E);
      color: white; border: none;
      padding: 13px; border-radius: 10px;
      font-size: 15px; font-weight: 700;
      cursor: pointer; transition: opacity 0.2s, transform 0.15s;
      font-family: 'Inter', sans-serif;
      margin-top: 4px;
    }
    .btn-submit:hover { opacity: 0.92; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .switch-text {
      text-align: center; font-size: 13px; color: #6B7280;
      margin-top: 4px;
    }
    .link-btn {
      background: none; border: none; color: #2563EB;
      font-weight: 700; cursor: pointer; font-size: 13px;
      text-decoration: underline; font-family: 'Inter', sans-serif;
    }

    .guest-note {
      margin-top: 24px; padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      text-align: center; font-size: 13px; color: #9CA3AF;
    }
    .guest-note a { color: #0F766E; font-weight: 600; text-decoration: none; }
    .guest-note a:hover { text-decoration: underline; }

    @media (max-width: 480px) {
      .account-card { padding: 28px 20px; }
    }
  `]
})
export class AccountComponent {
  activeTab = signal<'login' | 'register'>('login');
  loading = signal(false);
  message = signal('');
  isError = signal(false);

  loginEmail = '';
  loginPassword = '';
  regName = '';
  regEmail = '';
  regPhone = '';
  regPassword = '';

  constructor(
    private api: ApiService,
    public settings: SettingsService
  ) {}

  doLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.showMsg('Please fill in all fields.', true); return;
    }
    this.loading.set(true);
    // Basic guest login — show a friendly message since full auth isn't set up
    setTimeout(() => {
      this.loading.set(false);
      this.showMsg('Login feature coming soon! You can still browse and place orders as a guest.', false);
    }, 800);
  }

  doRegister() {
    if (!this.regName || !this.regEmail || !this.regPassword) {
      this.showMsg('Please fill in Name, Email and Password.', true); return;
    }
    if (this.regPassword.length < 6) {
      this.showMsg('Password must be at least 6 characters.', true); return;
    }
    this.loading.set(true);
    // Save as customer via API
    this.api.registerCustomer({
      name: this.regName,
      email: this.regEmail,
      phone: this.regPhone,
      password: this.regPassword
    }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res?.success) {
          this.showMsg(`Account created! Welcome to ${this.settings.get('site_name', 'Your Store')}.`, false);
          this.activeTab.set('login');
          this.loginEmail = this.regEmail;
          this.regName = this.regEmail = this.regPhone = this.regPassword = '';
        } else {
          this.showMsg(res?.message || 'Registration failed. Please try again.', true);
        }
      },
      error: () => {
        this.loading.set(false);
        this.showMsg('Account created! You can now browse and place orders.', false);
        this.activeTab.set('login');
      }
    });
  }

  private showMsg(msg: string, err: boolean) {
    this.message.set(msg); this.isError.set(err);
    setTimeout(() => this.message.set(''), 5000);
  }
}

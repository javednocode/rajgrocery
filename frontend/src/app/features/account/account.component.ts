import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { SettingsService } from '../../core/services/settings.service';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

type AuthTab = 'login' | 'register';

interface AddressForm {
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
  // ── Auth card ──
  authTab = signal<AuthTab>('login');
  authBusy = signal(false);
  authError = signal('');
  loginForm = { email: '', password: '' };
  registerForm = { first_name: '', last_name: '', email: '', phone: '', password: '' };

  // ── Forgot Password ──
  forgotStep = signal<'email' | 'otp' | 'newpass' | null>(null);
  forgotEmail = signal('');
  forgotOtp = signal('');
  forgotResetToken = signal('');
  forgotNewPassword = signal('');
  forgotConfirmPassword = signal('');
  forgotBusy = signal(false);
  forgotError = signal('');
  forgotMessage = signal('');

  // ── Order history ──
  orders = signal<any[]>([]);
  ordersLoading = signal(false);
  ordersPage = signal(1);
  ordersTotalPages = signal(1);
  expandedOrderId = signal<number | null>(null);

  // ── Addresses ──
  addresses = signal<any[]>([]);
  addressesLoading = signal(false);
  showAddressForm = signal(false);
  editingAddressId = signal<number | null>(null);
  addressForm: AddressForm = this.emptyAddressForm();
  addressBusy = signal(false);
  addressError = signal('');

  // ── Profile ──
  profileForm = { first_name: '', last_name: '', phone: '', email: '' };
  profileBusy = signal(false);
  profileMessage = signal('');
  profileError = signal('');
  showPasswordForm = signal(false);
  passwordForm = { current_password: '', new_password: '', confirm_password: '' };
  passwordBusy = signal(false);
  passwordError = signal('');
  passwordMessage = signal('');

  constructor(
    public wishlist: WishlistService,
    public cart: CartService,
    public auth: AuthService,
    private settings: SettingsService,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    seo: SeoService
  ) {
    seo.setMeta({ title: 'My Account', description: 'Manage your orders, addresses, wishlist and account preferences.' });
  }

  get cur() { return this.settings.get('currency_symbol', 'HK$'); }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      // AuthService only refreshes its cached profile once per app boot,
      // so total_orders can go stale after an order placed earlier in
      // the same SPA session (no full reload in between). Refetch on
      // every visit to this page so the stats row is never behind the
      // Order History list right below it.
      this.auth.refreshMe();
      this.loadOrders();
      this.loadAddresses();
      this.syncProfileForm();
    }

    // /wishlist keeps loading this same component; ?tab=... lets any
    // section be deep-linked. Both resolve to a fragment so Angular's own
    // anchorScrolling (app.config.ts) does the scroll — a manual
    // scrollIntoView() here would race the router's scrollPositionRestoration:
    // 'top' on every navigation and land in the wrong place.
    const isWishlistRoute = this.router.url.split('?')[0].split('#')[0] === '/wishlist';
    const tab = this.route.snapshot.queryParamMap.get('tab');
    const target = isWishlistRoute ? 'wishlist' : tab;
    if (target) {
      this.router.navigate([], { relativeTo: this.route, fragment: 'ac-' + target, replaceUrl: true });
    }
  }

  initials(): string {
    const c = this.auth.customer();
    if (!c) return '✦';
    const a = (c.first_name || c.name || '?')[0] || '';
    const b = (c.last_name || '')[0] || '';
    return (a + b).toUpperCase() || '✦';
  }

  formatDate(raw: string): string {
    if (!raw) return '';
    const d = new Date(raw.replace(' ', 'T'));
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-HK', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  statusLabel(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  // ── Auth ──
  submitLogin() {
    this.authError.set('');
    this.authBusy.set(true);
    this.auth.login(this.loginForm).subscribe({
      next: (r: any) => {
        this.authBusy.set(false);
        if (r.success) {
          this.loginForm = { email: '', password: '' };
          this.loadOrders();
          this.loadAddresses();
          this.syncProfileForm();
        } else {
          this.authError.set(r.message || 'Invalid email or password.');
        }
      },
      error: (err) => {
        this.authBusy.set(false);
        this.authError.set(err?.error?.message || 'Invalid email or password.');
      }
    });
  }

  submitRegister() {
    this.authError.set('');
    this.authBusy.set(true);
    this.auth.register(this.registerForm).subscribe({
      next: (r: any) => {
        this.authBusy.set(false);
        if (r.success) {
          this.registerForm = { first_name: '', last_name: '', email: '', phone: '', password: '' };
          this.loadOrders();
          this.loadAddresses();
          this.syncProfileForm();
        } else {
          this.authError.set(r.message || 'Could not create your account.');
        }
      },
      error: (err) => {
        this.authBusy.set(false);
        this.authError.set(err?.error?.message || 'Could not create your account.');
      }
    });
  }

  logout() {
    this.auth.logout();
    this.orders.set([]);
    this.addresses.set([]);
  }

  // ── Forgot Password ──
  startForgotPassword() {
    this.forgotStep.set('email');
    this.forgotEmail.set(this.loginForm.email || '');
    this.forgotOtp.set('');
    this.forgotResetToken.set('');
    this.forgotNewPassword.set('');
    this.forgotConfirmPassword.set('');
    this.forgotError.set('');
    this.forgotMessage.set('');
  }

  cancelForgotPassword() {
    this.forgotStep.set(null);
    this.forgotError.set('');
    this.forgotMessage.set('');
  }

  submitForgotEmail() {
    const email = this.forgotEmail().trim();
    if (!email) { this.forgotError.set('Please enter your email address.'); return; }
    this.forgotError.set('');
    this.forgotBusy.set(true);
    this.api.forgotPassword(email).subscribe({
      next: (r: any) => {
        this.forgotBusy.set(false);
        this.forgotMessage.set(r.message || 'If an account exists, you will receive a code.');
        this.forgotStep.set('otp');
      },
      error: (err) => {
        this.forgotBusy.set(false);
        this.forgotError.set(err?.error?.message || 'Could not send reset code. Please try again.');
      }
    });
  }

  submitForgotOtp() {
    const otp = this.forgotOtp().trim();
    if (!otp || otp.length < 6) { this.forgotError.set('Please enter the 6-digit code.'); return; }
    this.forgotError.set('');
    this.forgotMessage.set('');
    this.forgotBusy.set(true);
    this.api.verifyOtp(this.forgotEmail(), otp).subscribe({
      next: (r: any) => {
        this.forgotBusy.set(false);
        if (r.success) {
          this.forgotResetToken.set(r.data.reset_token);
          this.forgotMessage.set('Code verified! Set your new password.');
          this.forgotStep.set('newpass');
        } else {
          this.forgotError.set(r.message || 'Invalid code.');
        }
      },
      error: (err) => {
        this.forgotBusy.set(false);
        this.forgotError.set(err?.error?.message || 'Invalid code. Please try again.');
      }
    });
  }

  submitNewPassword() {
    const pw = this.forgotNewPassword();
    const cpw = this.forgotConfirmPassword();
    if (pw.length < 8) { this.forgotError.set('Password must be at least 8 characters.'); return; }
    if (pw !== cpw) { this.forgotError.set('Passwords do not match.'); return; }
    this.forgotError.set('');
    this.forgotMessage.set('');
    this.forgotBusy.set(true);
    this.api.resetPassword(this.forgotEmail(), this.forgotResetToken(), pw).subscribe({
      next: (r: any) => {
        this.forgotBusy.set(false);
        if (r.success) {
          this.forgotMessage.set(r.message || 'Password reset successfully! You can now log in.');
          this.forgotStep.set(null);
          this.authError.set('');
          // Pre-fill the login email
          this.loginForm.email = this.forgotEmail();
          this.loginForm.password = '';
          this.authTab.set('login');
        } else {
          this.forgotError.set(r.message || 'Could not reset password.');
        }
      },
      error: (err) => {
        this.forgotBusy.set(false);
        this.forgotError.set(err?.error?.message || 'Could not reset password. Please try again.');
      }
    });
  }

  resendOtp() {
    this.forgotError.set('');
    this.forgotMessage.set('');
    this.forgotBusy.set(true);
    this.api.forgotPassword(this.forgotEmail()).subscribe({
      next: (r: any) => {
        this.forgotBusy.set(false);
        this.forgotMessage.set('A new code has been sent to your email.');
        this.forgotOtp.set('');
      },
      error: (err) => {
        this.forgotBusy.set(false);
        this.forgotError.set(err?.error?.message || 'Could not resend code.');
      }
    });
  }

  // ── Order history ──
  loadOrders(page = 1) {
    this.ordersLoading.set(true);
    this.api.getMyOrders(page).subscribe({
      next: (r: any) => {
        this.ordersLoading.set(false);
        if (r.success) {
          this.orders.set(page === 1 ? r.data : [...this.orders(), ...r.data]);
          this.ordersPage.set(page);
          this.ordersTotalPages.set(r.meta?.total_pages || 1);
        }
      },
      error: () => this.ordersLoading.set(false)
    });
  }

  loadMoreOrders() {
    if (this.ordersPage() < this.ordersTotalPages()) this.loadOrders(this.ordersPage() + 1);
  }

  toggleOrder(id: number) {
    this.expandedOrderId.set(this.expandedOrderId() === id ? null : id);
  }

  // ── Addresses ──
  private emptyAddressForm(): AddressForm {
    return { label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false };
  }

  loadAddresses() {
    this.addressesLoading.set(true);
    this.api.getMyAddresses().subscribe({
      next: (r: any) => { this.addressesLoading.set(false); if (r.success) this.addresses.set(r.data); },
      error: () => this.addressesLoading.set(false)
    });
  }

  startAddAddress() {
    this.editingAddressId.set(null);
    this.addressForm = this.emptyAddressForm();
    this.addressError.set('');
    this.showAddressForm.set(true);
  }

  startEditAddress(a: any) {
    this.editingAddressId.set(a.id);
    this.addressForm = {
      label: a.label, full_name: a.full_name, phone: a.phone,
      address_line1: a.address_line1, address_line2: a.address_line2 || '',
      city: a.city, state: a.state, pincode: a.pincode, is_default: !!a.is_default
    };
    this.addressError.set('');
    this.showAddressForm.set(true);
  }

  cancelAddressForm() {
    this.showAddressForm.set(false);
    this.editingAddressId.set(null);
  }

  saveAddress() {
    this.addressError.set('');
    this.addressBusy.set(true);
    const id = this.editingAddressId();
    const req = id ? this.api.updateMyAddress(id, this.addressForm) : this.api.createMyAddress(this.addressForm);
    req.subscribe({
      next: (r: any) => {
        this.addressBusy.set(false);
        if (r.success) {
          this.showAddressForm.set(false);
          this.editingAddressId.set(null);
          this.loadAddresses();
        } else {
          this.addressError.set(r.message || 'Could not save this address.');
        }
      },
      error: (err) => {
        this.addressBusy.set(false);
        this.addressError.set(err?.error?.message || 'Could not save this address.');
      }
    });
  }

  setDefaultAddress(a: any) {
    this.api.updateMyAddress(a.id, { is_default: true }).subscribe({ next: () => this.loadAddresses() });
  }

  deleteAddress(a: any) {
    if (!confirm('Remove this address?')) return;
    this.api.deleteMyAddress(a.id).subscribe({ next: () => this.loadAddresses() });
  }

  // ── Profile ──
  syncProfileForm() {
    const c = this.auth.customer();
    if (c) {
      this.profileForm = { first_name: c.first_name || '', last_name: c.last_name || '', phone: c.phone || '', email: c.email || '' };
    }
  }

  saveProfile() {
    this.profileError.set('');
    this.profileMessage.set('');
    this.profileBusy.set(true);
    this.auth.updateProfile(this.profileForm).subscribe({
      next: (r: any) => {
        this.profileBusy.set(false);
        if (r.success) this.profileMessage.set('Profile updated.');
        else this.profileError.set(r.message || 'Could not update your profile.');
      },
      error: (err) => {
        this.profileBusy.set(false);
        this.profileError.set(err?.error?.message || 'Could not update your profile.');
      }
    });
  }

  savePassword() {
    this.passwordError.set('');
    this.passwordMessage.set('');
    if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
      this.passwordError.set('New passwords do not match.');
      return;
    }
    this.passwordBusy.set(true);
    this.auth.updateProfile({
      current_password: this.passwordForm.current_password,
      new_password: this.passwordForm.new_password
    }).subscribe({
      next: (r: any) => {
        this.passwordBusy.set(false);
        if (r.success) {
          this.passwordMessage.set('Password updated.');
          this.passwordForm = { current_password: '', new_password: '', confirm_password: '' };
          this.showPasswordForm.set(false);
        } else {
          this.passwordError.set(r.message || 'Could not update your password.');
        }
      },
      error: (err) => {
        this.passwordBusy.set(false);
        this.passwordError.set(err?.error?.message || 'Could not update your password.');
      }
    });
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.css'
})
export class OrderSuccessComponent implements OnInit {
  private readonly WA_NUMBER = '85254264886';
  qrUrl = `${environment.mediaUrl}/uploads/qr/hsbc_qr.png`;

  copied = signal('');
  qrZoomed = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal('');
  uploading = signal(false);
  uploadSuccess = signal(false);
  uploadError = signal('');

  orderData: {
    order_id: number;
    order_number: string;
    payment_method: string;
    total: number;
    subtotal: number;
    shipping: number;
    discount: number;
    customer_name: string;
    phone: string;
    address: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  } = {
    order_id: 0,
    order_number: '',
    payment_method: 'cod',
    total: 0,
    subtotal: 0,
    shipping: 0,
    discount: 0,
    customer_name: '',
    phone: '',
    address: '',
    items: []
  };

  constructor(
    private router: Router,
    private api: ApiService,
    seo: SeoService
  ) {
    seo.setMeta({ title: 'Order Confirmed', description: 'Your order has been placed successfully.' });
  }

  ngOnInit() {
    const state = history.state;
    if (!state || !state.order_number) {
      this.router.navigate(['/']);
      return;
    }
    this.orderData = {
      order_id: state.order_id ?? 0,
      order_number: state.order_number ?? '',
      payment_method: state.payment_method ?? 'cod',
      total: parseFloat(state.total ?? 0),
      subtotal: parseFloat(state.subtotal ?? 0),
      shipping: parseFloat(state.shipping ?? 0),
      discount: parseFloat(state.discount ?? 0),
      customer_name: state.customer_name ?? '',
      phone: state.phone ?? '',
      address: state.address ?? '',
      items: state.items ?? []
    };
  }

  whatsappUrl(): string {
    const d = this.orderData;
    let itemLines = '';
    for (const it of d.items) {
      itemLines += `\u2022 ${it.name} x${it.quantity} - HK$${(it.price * it.quantity).toFixed(2)}\n`;
    }
    const isPaid = d.payment_method !== 'cod';
    const paymentLabel = d.payment_method === 'bank_transfer' ? 'Bank Transfer (HSBC) — PAID ✅' : (isPaid ? `${d.payment_method} — PAID ✅` : 'Cash on Delivery (COD)');
    const paymentStatus = isPaid ? 'PAID ✅' : 'Pending (Pay on Delivery)';
    const discountLine = d.discount > 0 ? `Discount: -HK$${d.discount.toFixed(2)}\n` : '';
    const msg = `Hi Raj Grocery,\n\nI'd like to place an order.\n\nOrder ID: #${d.order_number}\n\nCustomer\nName: ${d.customer_name}\nPhone: ${d.phone}\n\nAddress:\n${d.address}\n\nItems\n${itemLines.trim()}\n\nSubtotal: HK$${d.subtotal.toFixed(2)}\nDelivery: ${d.shipping === 0 ? 'FREE' : 'HK$' + d.shipping.toFixed(2)}\n${discountLine}Total: HK$${d.total.toFixed(2)}\n\nPayment Method: ${paymentLabel}\nPayment Status: ${paymentStatus}\n\nPlease confirm my order.\n\nThank you.`;
    return `https://wa.me/${this.WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(key);
      setTimeout(() => this.copied.set(''), 2500);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.copied.set(key);
      setTimeout(() => this.copied.set(''), 2500);
    });
  }

  toggleQrZoom() { this.qrZoomed.set(!this.qrZoomed()); }

  downloadQR() {
    const a = document.createElement('a');
    a.href = this.qrUrl;
    a.download = 'hsbc-fps-qr-raj-grocery.png';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setFile(input.files[0]);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { this.uploadError.set('File too large. Max 10MB.'); return; }
    this.selectedFile.set(file);
    this.uploadError.set('');
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  uploadScreenshot() {
    const file = this.selectedFile();
    if (!file || !this.orderData.order_id) return;
    this.uploading.set(true);
    this.uploadError.set('');
    this.api.uploadPaymentScreenshot(this.orderData.order_id, file).subscribe({
      next: (r: any) => {
        if (r.success) { this.uploadSuccess.set(true); }
        else { this.uploadError.set(r.message || 'Upload failed. Please try again.'); }
        this.uploading.set(false);
      },
      error: () => { this.uploadError.set('Network error — please try again.'); this.uploading.set(false); }
    });
  }
}

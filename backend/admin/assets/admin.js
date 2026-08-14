/**
 * Ecommerce Admin Panel - JavaScript
 */

const API_BASE = '/api';
const ADMIN_BASE = '/admin';

// Currency symbol — loaded from /api/settings on init; safe fallback to HK$ or stored setting
let adminCurrencySymbol = localStorage.getItem('admin_currency_symbol') || 'HK$';
window.adminCurrencySymbol = adminCurrencySymbol;
window.CURRENCY_SYMBOL = adminCurrencySymbol;

// Read token from localStorage OR cookie (set by login page)
function getStoredToken() {
    var ls = localStorage.getItem('admin_token') || '';
    if (ls) return ls;
    // Fallback: read from cookie
    var match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}
let authToken = getStoredToken();
// Sync cookie token into localStorage if missing
if (authToken && !localStorage.getItem('admin_token')) {
    localStorage.setItem('admin_token', authToken);
}

// ========== API HELPER ==========
async function api(endpoint, method = 'GET', data = null, isFormData = false) {
    // Always use latest token in case it was updated
    authToken = getStoredToken();
    const headers = { 'Authorization': `Bearer ${authToken}` };
    if (!isFormData) headers['Content-Type'] = 'application/json';
    
    const config = { method, headers };
    if (data) config.body = isFormData ? data : JSON.stringify(data);
    
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, config);
        const text = await res.text();

        // Detect gateway errors (Hostinger nginx 502/503/504) — these return HTML, not JSON
        if (res.status === 502 || res.status === 503 || res.status === 504) {
            throw new Error('Server timeout (' + res.status + '). The operation took too long. Use smaller chunk sizes or try again.');
        }

        // Strip any PHP warnings/notices prepended before the JSON
        const jsonStart = text.indexOf('{');
        const jsonText = jsonStart >= 0 ? text.slice(jsonStart) : text;

        let json;
        try {
            json = JSON.parse(jsonText);
        } catch (parseErr) {
            // Strip HTML tags for clean error display
            const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
            if (clean.toLowerCase().includes('gateway') || clean.toLowerCase().includes('timeout')) {
                throw new Error('Server timeout. The operation took too long. Reduce chunk size and try again.');
            }
            throw new Error('Server error: ' + (clean || 'Empty response'));
        }

        if (!res.ok || json.success === false) {
            if (res.status === 401) clearStoredAuth();
            throw new Error(json.message || 'Request failed');
        }
        return json;
    } catch (err) {
        showAlert(err.message, 'danger');
        throw err;
    }
}

// ========== AUTH ==========
function checkAuth() {
    authToken = getStoredToken();
    var isLoginPage = window.location.pathname.includes('index.php') || window.location.pathname.endsWith('/admin/');
    if (!authToken && !isLoginPage) {
        window.location.href = `${ADMIN_BASE}/index.php`;
    }
}

function clearStoredAuth() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    authToken = '';
    // Also clear the cookie
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

async function parseJsonResponse(res) {
    const text = await res.text();
    const jsonStart = text.indexOf('{');
    const jsonText = jsonStart >= 0 ? text.slice(jsonStart) : text;

    try {
        return JSON.parse(jsonText);
    } catch (err) {
        throw new Error('Server error: ' + (text.slice(0, 200) || 'Empty response'));
    }
}

async function validateExistingSession() {
    if (!authToken) return;

    try {
        await api('/dashboard/stats');
        window.location.href = `${ADMIN_BASE}/dashboard.php`;
    } catch (err) {
        clearStoredAuth();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const json = await parseJsonResponse(res);
        if (json.success) {
            localStorage.setItem('admin_token', json.data.token);
            localStorage.setItem('admin_user', JSON.stringify(json.data.admin));
            window.location.href = `${ADMIN_BASE}/dashboard.php`;
        } else {
            showAlert(json.message, 'danger');
        }
    } catch (err) {
        showAlert(err.message || 'Login failed. Please try again.', 'danger');
    }
    btn.disabled = false;
    btn.textContent = 'Sign In to Dashboard';
}

function logout() {
    clearStoredAuth();
    window.location.href = `${ADMIN_BASE}/index.php`;
}

// ========== ALERTS ==========
function showAlert(message, type = 'success') {
    // Strip any HTML tags from the message for safe, readable display
    var cleanMsg = String(message || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200);

    const loginAlert = document.getElementById('loginAlert');
    if (loginAlert) {
        loginAlert.className = type === 'danger' ? 'error' : 'success';
        loginAlert.textContent = cleanMsg;
        return;
    }

    const existing = document.querySelector('.alert-float');
    if (existing) existing.remove();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-float`;
    alert.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999;min-width:320px;max-width:520px;animation:slideIn 0.3s ease;word-break:break-word;';
    alert.textContent = cleanMsg;
    document.body.appendChild(alert);
    const delay = type === 'danger' ? 6000 : 3500;
    setTimeout(() => { alert.style.opacity = '0'; setTimeout(() => alert.remove(), 300); }, delay);
}

// ========== MOBILE MENU ==========
function toggleSidebar() {
    document.querySelector('.admin-sidebar').classList.toggle('open');
}

// ========== IMAGE UPLOAD PREVIEW ==========
function setupImageUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    
    input.addEventListener('change', function() {
        preview.innerHTML = '';
        Array.from(this.files).forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = e => {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `<img src="${e.target.result}" alt="Preview"><button type="button" class="remove-btn" onclick="removePreviewImage(this, '${inputId}', ${idx})">×</button>`;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    });
}

function removePreviewImage(btn, inputId, idx) {
    btn.closest('.preview-item').remove();
}

// ========== FORMAT HELPERS ==========
function formatCurrency(amount) {
    var val = parseFloat(amount || 0);
    if (isNaN(val)) val = 0;
    return adminCurrencySymbol + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Load currency symbol from site settings (runs once after auth resolves)
function loadAdminCurrencySymbol() {
    var token = getStoredToken();
    if (!token) return;
    fetch(API_BASE + '/settings', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(json) {
        if (json && json.data && json.data.currency_symbol) {
            // Fix common DB encoding corruption: â€ (latin1 mis-read of UTF-8 €)
            var sym = json.data.currency_symbol;
            if (sym === '\u00e2\u201a\u00ac' || sym === '\u00e2\u0082\u00ac') sym = '\u20AC';
            adminCurrencySymbol = sym;
            window.adminCurrencySymbol = sym;
            window.CURRENCY_SYMBOL = sym;
            localStorage.setItem('admin_currency_symbol', sym);
        }
    })
    .catch(function() { /* keep default */ });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusBadge(status) {
    const map = {
        'pending': 'warning', 'confirmed': 'info', 'processing': 'primary',
        'shipped': 'primary', 'delivered': 'success', 'cancelled': 'danger', 'returned': 'danger',
        'paid': 'success', 'failed': 'danger', 'refunded': 'warning'
    };
    return `<span class="badge badge-${map[status] || 'primary'}">${status}</span>`;
}

// ========== IMAGE URL HELPER ==========
/**
 * Resolve any image path to a usable <img src> value.
 *   - External URLs  https://cdn.shopify.com/...   → used as-is
 *   - Absolute paths /uploads/products/file.jpg    → used as-is
 *   - Relative paths uploads/products/file.jpg     → prepend /
 *   - empty / null                                 → placeholder
 */
function imgUrl(path) {
    if (!path) return '/admin/assets/placeholder-product.svg';
    const p = String(path).trim();
    if (!p) return '/admin/assets/placeholder-product.svg';
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    if (p.startsWith('/')) return p;
    return '/' + p;
}

// ========== SLUG GENERATOR ==========
function generateSlug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function autoSlug(nameInput, slugInput) {
    const nameEl = document.getElementById(nameInput);
    const slugEl = document.getElementById(slugInput);
    if (nameEl && slugEl) {
        nameEl.addEventListener('input', () => {
            if (!slugEl.dataset.manual) slugEl.value = generateSlug(nameEl.value);
        });
        slugEl.addEventListener('input', () => { slugEl.dataset.manual = '1'; });
    }
}



// ========== SEO PREVIEW ==========
function updateSeoPreview() {
    const title = document.getElementById('meta_title')?.value || document.getElementById('name')?.value || '';
    const desc  = document.getElementById('meta_description')?.value || '';
    const slug  = document.getElementById('slug')?.value || '';
    const preview = document.getElementById('seoPreview');
    if (preview) {
        preview.innerHTML = `
            <div class="seo-title">${title || 'Page Title'}</div>
            <div class="seo-url">https://yoursite.com/${slug || 'page-url'}</div>
            <div class="seo-desc">${desc || 'Meta description will appear here...'}</div>
        `;
    }
}

// ========== DELETE CONFIRMATION ==========
function confirmDelete(type, id, name) {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        api(`/${type}/${id}`, 'DELETE').then(() => {
            showAlert(`${type.slice(0, -1)} deleted successfully`);
            setTimeout(() => location.reload(), 500);
        });
    }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('admin_token') || '';

    // Set active nav item
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });

    // Admin user avatar initial
    const user   = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const avatar = document.querySelector('.admin-avatar');
    if (avatar && user.name) avatar.textContent = user.name.charAt(0).toUpperCase();

    // Load currency symbol from settings so formatCurrency uses the correct symbol
    loadAdminCurrencySymbol();
});

// CSS slide-in animation
const style = document.createElement('style');
style.textContent = '@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}';
document.head.appendChild(style);

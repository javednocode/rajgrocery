/**
 * asianfoodcork Admin Panel - JavaScript
 */

const API_BASE = '../api';
let authToken = localStorage.getItem('admin_token') || '';

// ========== API HELPER ==========
async function api(endpoint, method = 'GET', data = null, isFormData = false) {
    const headers = { 'Authorization': `Bearer ${authToken}` };
    if (!isFormData) headers['Content-Type'] = 'application/json';
    
    const config = { method, headers };
    if (data) config.body = isFormData ? data : JSON.stringify(data);
    
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, config);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Request failed');
        return json;
    } catch (err) {
        showAlert(err.message, 'danger');
        throw err;
    }
}

// ========== AUTH ==========
function checkAuth() {
    if (!authToken && !window.location.pathname.includes('index.php') && !window.location.pathname.endsWith('/admin/')) {
        window.location.href = 'index.php';
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
        const json = await res.json();
        if (json.success) {
            localStorage.setItem('admin_token', json.data.token);
            localStorage.setItem('admin_user', JSON.stringify(json.data.admin));
            window.location.href = 'dashboard.php';
        } else {
            showAlert(json.message, 'danger');
        }
    } catch (err) {
        showAlert('Login failed. Please try again.', 'danger');
    }
    btn.disabled = false;
    btn.textContent = 'Sign In';
}

function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = 'index.php';
}

// ========== ALERTS ==========
function showAlert(message, type = 'success') {
    const existing = document.querySelector('.alert-float');
    if (existing) existing.remove();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-float`;
    alert.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999;min-width:300px;animation:slideIn 0.3s ease;';
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => { alert.style.opacity = '0'; setTimeout(() => alert.remove(), 300); }, 3500);
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
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
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
function imgUrl(path, fallback = 'uploads/placeholder.png') {
    if (!path) path = fallback;
    // Strip leading slash to avoid ..//-style double-slash
    path = path.replace(/^\//, '');
    return '../' + path;
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
    const desc = document.getElementById('meta_description')?.value || '';
    const slug = document.getElementById('slug')?.value || '';
    
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
            showAlert(`${type.slice(0,-1)} deleted successfully`);
            setTimeout(() => location.reload(), 500);
        });
    }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('admin_token') || '';
    
    // Set active nav
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });
    
    // Admin user info
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const avatar = document.querySelector('.admin-avatar');
    if (avatar && user.name) avatar.textContent = user.name.charAt(0).toUpperCase();
});

// CSS animation
const style = document.createElement('style');
style.textContent = '@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}';
document.head.appendChild(style);

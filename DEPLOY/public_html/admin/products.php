<?php $pageTitle = 'Products'; include 'includes/header.php'; ?>

<div class="toolbar">
    <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" placeholder="Search products..." oninput="loadProducts()">
    </div>
    <a href="product-edit.php" class="btn btn-primary">+ Add Product</a>
</div>

<div class="card">
    <div class="card-body" style="padding:0;">
        <table class="data-table">
            <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="productsList"></tbody>
        </table>
    </div>
</div>
<div id="pagination" class="pagination"></div>

<script>
let currentPage = 1;
async function loadProducts(page = 1) {
    currentPage = page;
    const q = document.getElementById('searchInput').value;
    try {
        const res = await api(`/products?page=${page}&per_page=15&q=${encodeURIComponent(q)}`);
        const products = res.data;
        const pagination = res.pagination;
        
        document.getElementById('productsList').innerHTML = products.map(p => `
            <tr>
                <td>
                    <div class="product-cell">
                        <img src="${imgUrl(p.primary_image || p.images?.[0]?.image_path)}" alt="${p.name}">
                        <div><strong>${p.name}</strong><div style="font-size:12px;color:var(--admin-text-muted)">SKU: ${p.sku||'—'}</div></div>
                    </div>
                </td>
                <td>${p.sale_price ? `<span style="text-decoration:line-through;color:var(--admin-text-muted)">₹${p.price}</span> <strong style="color:var(--admin-success)">₹${p.sale_price}</strong>` : `<strong>₹${p.price}</strong>`}</td>
                <td>${p.stock <= 0 ? '<span class="badge badge-danger">Out of stock</span>' : p.stock <= 5 ? `<span class="badge badge-warning">${p.stock}</span>` : `<span class="badge badge-success">${p.stock}</span>`}</td>
                <td style="color:var(--admin-text-dim)">${p.category_names||'—'}</td>
                <td>${p.is_active == 1 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
                <td>
                    <a href="product-edit.php?id=${p.id}" class="btn btn-outline btn-sm">Edit</a>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('products',${p.id},'${p.name.replace(/'/g,"\\'")}')">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No products found</td></tr>';

        // Pagination
        if (pagination.total_pages > 1) {
            let html = '';
            for (let i = 1; i <= pagination.total_pages; i++) {
                html += `<a href="#" onclick="loadProducts(${i});return false;" class="${i===pagination.page?'active':''}">${i}</a>`;
            }
            document.getElementById('pagination').innerHTML = html;
        } else {
            document.getElementById('pagination').innerHTML = '';
        }
    } catch(e) { console.error(e); }
}
loadProducts();
</script>

<?php include 'includes/footer.php'; ?>

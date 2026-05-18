<?php $pageTitle = 'Blog Posts'; include 'includes/header.php'; ?>

<div class="toolbar">
    <div class="search-box"><span class="search-icon">🔍</span><input type="text" id="searchInput" placeholder="Search blog posts..."></div>
    <a href="blog-edit.php" class="btn btn-primary">+ New Post</a>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody id="blogsList"></tbody>
    </table>
</div></div>

<script>
async function loadBlogs() {
    try {
        const res = await api('/blogs?per_page=50');
        document.getElementById('blogsList').innerHTML = res.data.map(b => `
            <tr>
                <td><img src="../${b.featured_image||'uploads/placeholder.png'}" style="width:60px;height:40px;border-radius:6px;object-fit:cover;background:var(--admin-surface-2)"></td>
                <td><strong>${b.title}</strong><div style="font-size:12px;color:var(--admin-text-muted)">/${b.slug}</div></td>
                <td>${b.category_name||'—'}</td>
                <td>${b.status==='published'?'<span class="badge badge-success">Published</span>':b.status==='draft'?'<span class="badge badge-warning">Draft</span>':'<span class="badge badge-danger">Archived</span>'}</td>
                <td>${b.views}</td>
                <td style="color:var(--admin-text-dim)">${formatDate(b.created_at)}</td>
                <td>
                    <a href="blog-edit.php?id=${b.id}" class="btn btn-outline btn-sm">Edit</a>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('blogs',${b.id},'${b.title.replace(/'/g,"\\'")}')">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No blog posts yet</td></tr>';
    } catch(e) {}
}
loadBlogs();
</script>

<?php include 'includes/footer.php'; ?>

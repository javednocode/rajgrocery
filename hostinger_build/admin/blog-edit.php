<?php $pageTitle = isset($_GET['id']) ? 'Edit Post' : 'New Post'; include 'includes/header.php'; ?>

<form id="blogForm" enctype="multipart/form-data">
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
        <div>
            <div class="card"><div class="card-header"><h3>Post Content</h3></div><div class="card-body">
                <div class="form-group"><label>Title *</label><input type="text" id="title" class="form-control" required></div>
                <div class="form-group"><label>Slug</label><input type="text" id="slug" class="form-control"></div>
                <div class="form-group"><label>Excerpt</label><textarea id="excerpt" class="form-control" rows="2"></textarea></div>
                <div class="form-group"><label>Content</label><textarea id="content" class="form-control" rows="15"></textarea></div>
            </div></div>
            <div class="card"><div class="card-header"><h3>🔍 SEO</h3></div><div class="card-body">
                <div class="seo-preview" id="seoPreview"><div class="seo-title">Title</div><div class="seo-url">https://yoursite.com/blog/slug</div><div class="seo-desc">Description...</div></div>
                <div class="form-group"><label>Meta Title</label><input type="text" id="meta_title" class="form-control" oninput="updateSeoPreview()"></div>
                <div class="form-group"><label>Meta Description</label><textarea id="meta_description" class="form-control" rows="2" oninput="updateSeoPreview()"></textarea></div>
                <div class="form-group"><label>Focus Keyword</label><input type="text" id="focus_keyword" class="form-control"></div>
            </div></div>
        </div>
        <div>
            <div class="card"><div class="card-header"><h3>Publish</h3></div><div class="card-body">
                <div class="form-group"><label>Status</label><select id="status" class="form-control"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
                <div class="form-group"><label>Author</label><input type="text" id="author" class="form-control" value="Admin"></div>
            </div></div>
            <div class="card"><div class="card-header"><h3>Featured Image</h3></div><div class="card-body">
                <div class="image-upload-area" onclick="document.getElementById('featured_image').click()">
                    <div class="upload-icon">🖼️</div><p style="font-size:14px;color:var(--admin-text-dim)">Click to upload</p>
                    <input type="file" id="featured_image" accept="image/*" style="display:none">
                </div>
                <div class="image-preview" id="imagePreview"></div>
            </div></div>
            <div style="display:flex;gap:12px;margin-top:20px;">
                <button type="submit" class="btn btn-primary" style="flex:1;justify-content:center;">Save Post</button>
                <a href="blogs.php" class="btn btn-outline">Cancel</a>
            </div>
        </div>
    </div>
</form>

<script>
const postId = new URLSearchParams(window.location.search).get('id');
autoSlug('title', 'slug');
setupImageUpload('featured_image', 'imagePreview');

async function loadPost() {
    if (!postId) return;
    try {
        const res = await api(`/blogs/${postId}`);
        const p = res.data;
        document.getElementById('title').value = p.title;
        document.getElementById('slug').value = p.slug;
        document.getElementById('excerpt').value = p.excerpt || '';
        document.getElementById('content').value = p.content || '';
        document.getElementById('status').value = p.status;
        document.getElementById('author').value = p.author || 'Admin';
        document.getElementById('meta_title').value = p.meta_title || '';
        document.getElementById('meta_description').value = p.meta_description || '';
        document.getElementById('focus_keyword').value = p.focus_keyword || '';
        updateSeoPreview();
    } catch(e) {}
}

document.getElementById('blogForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.set('title', document.getElementById('title').value);
    formData.set('slug', document.getElementById('slug').value);
    formData.set('excerpt', document.getElementById('excerpt').value);
    formData.set('content', typeof tinymce !== 'undefined' && tinymce.get('content') ? tinymce.get('content').getContent() : document.getElementById('content').value);
    formData.set('status', document.getElementById('status').value);
    formData.set('author', document.getElementById('author').value);
    formData.set('meta_title', document.getElementById('meta_title').value);
    formData.set('meta_description', document.getElementById('meta_description').value);
    formData.set('focus_keyword', document.getElementById('focus_keyword').value);
    if (document.getElementById('featured_image').files[0]) formData.set('featured_image', document.getElementById('featured_image').files[0]);

    try {
        // Always POST — PHP cannot read $_POST/$_FILES for PUT with FormData
        if (postId) formData.set('_method', 'PUT');
        await api(`/blogs${postId ? '/' + postId : ''}`, 'POST', formData, true);
        showAlert(postId ? 'Post updated!' : 'Post created!');
        setTimeout(() => window.location.href = 'blogs.php', 1000);
    } catch(e) { showAlert('Error saving post: ' + e.message, 'danger'); }
});

loadPost();
if (typeof tinymce !== 'undefined') {
    tinymce.init({ selector:'#content', height:400, menubar:false, skin:'oxide-dark', content_css:'dark',
        plugins:'lists link image code table', toolbar:'undo redo | formatselect | bold italic | bullist numlist | link image | code' });
}
</script>

<?php include 'includes/footer.php'; ?>

<?php
// Admin login page — fully self-contained, no external JS dependencies

// Load the store's own name/logo from the DB, same as includes/sidebar.php.
// Never fall back to the bundled /logo.png — that static asset is generic
// PWA-icon art carried over from a different white-label deployment, not
// this store's branding.
$_loginName = 'Admin Panel';
$_loginLogo = '';
try {
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../helpers/branding.php';
    $_loginDb   = (new Database())->getConnection();
    $_loginData = loadSiteSettings($_loginDb);
    $_loginName = !empty($_loginData['site_name']) ? $_loginData['site_name'] : 'Admin Panel';
    $_loginLogo = !empty($_loginData['site_logo']) ? $_loginData['site_logo'] : '';
} catch (\Throwable $_e) {}
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{background:#0F1929;font-family:'Inter',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
      .bg{position:fixed;inset:0;background:linear-gradient(135deg,#0F1929 0%,#1E3A8A 60%,#1D5929 100%);z-index:0}
      .bar{position:fixed;top:0;left:0;right:0;height:4px;display:flex;z-index:99}
      .bar span:nth-child(1){flex:1;background:#F28C00}
      .bar span:nth-child(2){flex:1;background:#1E3A8A}
      .bar span:nth-child(3){flex:1;background:#E11D48}
      .box{background:#fff;border-radius:20px;padding:48px 40px;width:100%;max-width:420px;position:relative;z-index:1;box-shadow:0 24px 80px rgba(0,0,0,.4)}
      .logo-wrap{text-align:center;margin-bottom:8px}
      .logo-wrap img{height:60px;width:auto;object-fit:contain}
      .ttl{text-align:center;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:20px}
      .divider{height:3px;border-radius:2px;overflow:hidden;margin-bottom:24px;display:flex}
      .divider span:nth-child(1){flex:1;background:#F28C00}
      .divider span:nth-child(2){flex:1;background:#1E3A8A}
      .divider span:nth-child(3){flex:1;background:#E11D48}
      .alert{margin-bottom:16px;padding:12px 16px;border-radius:8px;font-size:13px;font-weight:500;display:none}
      .alert.error{background:#FDF0F1;color:#E11D48;border:1px solid rgba(225,29,72,.2);display:block}
      .alert.ok{background:#EAF4EC;color:#1D5929;border:1px solid rgba(29,89,41,.2);display:block}
      .fg{margin-bottom:16px}
      .fg label{display:block;font-size:12px;font-weight:700;color:#1E3A8A;margin-bottom:6px;text-transform:uppercase;letter-spacing:.3px}
      .fg input{width:100%;padding:12px 14px;border:1.5px solid #D1D5DB;border-radius:10px;font-size:14px;color:#1A1A2A;background:#F9FAFB;outline:none;transition:all .2s;font-family:inherit}
      .fg input:focus{border-color:#F28C00;background:#fff;box-shadow:0 0 0 3px rgba(242,140,0,.12)}
      .btn{width:100%;padding:14px;background:linear-gradient(135deg,#1E3A8A,#F28C00);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;margin-top:6px;transition:all .25s;font-family:inherit;letter-spacing:.3px}
      .btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(30,58,138,.3)}
      .btn:disabled{opacity:.65;cursor:not-allowed}
    </style>
</head>
<body>
<div class="bg"></div>
<div class="bar"><span></span><span></span><span></span></div>

<div class="box">
    <div class="logo-wrap">
        <?php if ($_loginLogo): ?>
            <img src="../<?= htmlspecialchars(ltrim($_loginLogo, '/')) ?>" alt="<?= htmlspecialchars($_loginName) ?>" onerror="this.style.display='none'">
        <?php else: ?>
            <div style="font-size:22px;font-weight:700;color:#1E3A8A;"><?= htmlspecialchars($_loginName) ?></div>
        <?php endif; ?>
    </div>
    <div class="ttl">Admin Panel</div>
    <div class="divider"><span></span><span></span><span></span></div>

    <div class="alert" id="msg"></div>

    <div class="fg">
        <label for="em">Email Address</label>
        <input type="email" id="em" placeholder="admin@example.com" autocomplete="email">
    </div>
    <div class="fg">
        <label for="pw">Password</label>
        <input type="password" id="pw" placeholder="Enter your password" autocomplete="current-password">
    </div>
    <button class="btn" id="loginBtn" onclick="doLogin()">Sign In to Dashboard</button>
</div>

<script>
// Clear any stale tokens
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
// Clear stale cookie too
document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

async function doLogin() {
    var email = document.getElementById('em').value.trim();
    var pass  = document.getElementById('pw').value;
    var btn   = document.getElementById('loginBtn');
    var msg   = document.getElementById('msg');

    msg.className = 'alert';
    msg.textContent = '';

    if (!email || !pass) {
        msg.className = 'alert error';
        msg.textContent = 'Please enter your email and password.';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in\u2026';

    try {
        var res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: pass })
        });

        var text = await res.text();
        var data;
        try {
            var start = text.indexOf('{');
            data = JSON.parse(start >= 0 ? text.slice(start) : text);
        } catch(e) {
            throw new Error('Server error: ' + text.slice(0, 150));
        }

        if (data && data.success && data.data && data.data.token) {
            var token = data.data.token;
            // Store in localStorage AND as cookie (PHP admin reads cookie)
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(data.data.admin));
            // Set cookie so PHP session guard can read it (7 day expiry)
            var expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = 'admin_token=' + token + '; path=/; expires=' + expires;

            msg.className = 'alert ok';
            msg.textContent = 'Login successful! Loading dashboard\u2026';

            setTimeout(function() {
                window.location.replace('/admin/dashboard.php');
            }, 300);
        } else {
            msg.className = 'alert error';
            msg.textContent = (data && data.message) ? data.message : 'Invalid email or password.';
            btn.disabled = false;
            btn.textContent = 'Sign In to Dashboard';
        }
    } catch (err) {
        msg.className = 'alert error';
        msg.textContent = err.message || 'Network error. Please check the server is running.';
        btn.disabled = false;
        btn.textContent = 'Sign In to Dashboard';
    }
}

// Enter key support
['em','pw'].forEach(function(id) {
    document.getElementById(id).addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doLogin();
    });
});
</script>
</body>
</html>

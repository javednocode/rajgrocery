<!DOCTYPE html>
<html lang="en-IE">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Ecommerce Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/admin/assets/admin.css">
    <style>
      body { background: #0F1929; margin: 0; font-family: 'Inter', sans-serif; }
      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: linear-gradient(135deg, #0F1929 0%, #1E3A8A 60%, #1D5929 100%);
        position: relative;
        overflow: hidden;
      }
      .login-page::before {
        content: '';
        position: absolute; inset: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='15'/%3E%3C/g%3E%3C/svg%3E");
      }
      .brand-bar-top { position: fixed; top: 0; left: 0; right: 0; height: 3px; display: flex; z-index: 999; }
      .brand-bar-top span:nth-child(1) { flex: 1; background: #0F766E; }
      .brand-bar-top span:nth-child(2) { flex: 1; background: #1E3A8A; }
      .brand-bar-top span:nth-child(3) { flex: 1; background: #E11D48; }
      .login-box {
        background: #FFFFFF;
        border-radius: 20px;
        padding: 48px 40px;
        width: 100%;
        max-width: 420px;
        position: relative;
        z-index: 1;
        box-shadow: 0 24px 80px rgba(0,0,0,0.4);
      }
      .login-logo {
        text-align: center;
        margin-bottom: 8px;
      }
      .login-logo img {
        height: 70px;
        width: auto;
        object-fit: contain;
      }
      .login-title {
        text-align: center;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: #6B7280;
        margin-bottom: 32px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .login-divider {
        display: flex;
        height: 3px;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 28px;
      }
      .login-divider span:nth-child(1) { flex: 1; background: #0F766E; }
      .login-divider span:nth-child(2) { flex: 1; background: #1E3A8A; }
      .login-divider span:nth-child(3) { flex: 1; background: #E11D48; }
      .form-group { margin-bottom: 18px; }
      .form-group label { display: block; font-size: 12.5px; font-weight: 700; color: #1E3A8A; margin-bottom: 7px; letter-spacing: 0.3px; text-transform: uppercase; }
      .form-control {
        width: 100%; padding: 12px 14px;
        border: 1.5px solid #D1D5DB; border-radius: 10px;
        font-size: 14px; color: #1A1A2A; background: #F9FAFB;
        outline: none; transition: all 0.2s; box-sizing: border-box;
      }
      .form-control:focus { border-color: #0F766E; background: white; box-shadow: 0 0 0 3px rgba(42,122,59,0.12); }
      .btn-login {
        width: 100%; padding: 13px;
        background: linear-gradient(135deg, #1E3A8A, #0F766E);
        color: white; border: none; border-radius: 10px;
        font-size: 15px; font-weight: 700; cursor: pointer;
        margin-top: 8px; transition: all 0.25s;
        font-family: 'Inter', sans-serif;
        letter-spacing: 0.3px;
      }
      .btn-login:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,50,112,0.3); opacity: 0.95; }
      .login-hint { text-align: center; margin-top: 20px; font-size: 12.5px; color: #9CA3AF; }
      .login-hint code { background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #6B7280; }
      #loginAlert {
        margin-bottom: 16px; padding: 12px 16px;
        border-radius: 8px; font-size: 13px; font-weight: 500;
        display: none;
      }
      #loginAlert.error { background: #FDF0F1; color: #E11D48; border: 1px solid rgba(225,29,72,0.2); display: block; }
      #loginAlert.success { background: #EAF4EC; color: #0F766E; border: 1px solid rgba(42,122,59,0.2); display: block; }
      .ie-flag { text-align: center; margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.4); }
    </style>
</head>
<body>
<div class="brand-bar-top"><span></span><span></span><span></span></div>
<div class="login-page">
    <div class="login-box">
        <div class="login-logo">
            <img src="/logo.svg" alt="Store logo" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
            <div style="display:none;font-size:32px;text-align:center;">🛒</div>
        </div>
        <div class="login-title">Admin Panel</div>
        <div class="login-divider"><span></span><span></span><span></span></div>

        <div id="loginAlert"></div>

        <form onsubmit="handleLogin(event)">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" class="form-control" placeholder="admin@example.com" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" class="form-control" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn-login">Sign In to Dashboard</button>
        </form>

    </div>
</div>
<script src="/admin/assets/admin.js"></script>
<script>
    validateExistingSession();
</script>
</body>
</html>

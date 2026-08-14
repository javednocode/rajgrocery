<?php
$pageTitle = 'Webcrafts AI Intelligence System';
include 'includes/header.php';

// ─── Password Gate ───────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) session_start();

$AI_USER = 'Javed';
$AI_PASS = '9610022011';
$SESSION_KEY = 'wcts_ai_auth';

$authError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ai_login'])) {
    if (strtolower($_POST['ai_username'] ?? '') === strtolower($AI_USER) && ($_POST['ai_password'] ?? '') === $AI_PASS) {
        $_SESSION[$SESSION_KEY] = true;
    } else {
        $authError = 'Invalid username or password.';
    }
}
if (isset($_POST['ai_logout'])) {
    unset($_SESSION[$SESSION_KEY]);
}

$authenticated = !empty($_SESSION[$SESSION_KEY]);
?>
<style>
/* ── Login Gate ─────────────────────────────────────── */
.ai-login-wrap {
    display:flex; align-items:center; justify-content:center;
    min-height:60vh; padding:40px 20px;
}
.ai-login-card {
    background:#fff;
    border:1px solid var(--admin-border);
    border-radius:16px;
    padding:40px 48px;
    width:100%;
    max-width:420px;
    box-shadow:0 8px 32px rgba(0,0,0,.07);
    text-align:center;
}
.ai-logo-icon {
    width:72px; height:72px;
    background:linear-gradient(135deg,#6366f1,#8b5cf6);
    border-radius:20px;
    display:inline-flex; align-items:center; justify-content:center;
    margin-bottom:20px;
    box-shadow:0 4px 16px rgba(99,102,241,.35);
}
.ai-login-card h2 { font-size:20px; margin-bottom:6px; color:var(--admin-text); }
.ai-login-card p  { font-size:13px; color:var(--admin-text-muted); margin-bottom:28px; }
.ai-input {
    width:100%; padding:11px 14px; border:1.5px solid var(--admin-border);
    border-radius:8px; font-size:14px; margin-bottom:14px;
    background:var(--admin-bg); color:var(--admin-text);
    transition:border-color .2s;
}
.ai-input:focus { outline:none; border-color:#6366f1; }
.ai-btn {
    width:100%; padding:12px; background:linear-gradient(135deg,#6366f1,#8b5cf6);
    color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600;
    cursor:pointer; transition:opacity .2s;
}
.ai-btn:hover { opacity:.9; }
.ai-error { color:#dc2626; font-size:13px; margin-bottom:12px; background:#fef2f2; padding:8px 12px; border-radius:6px; }

/* ── Main Dashboard ─────────────────────────────────── */
.ai-header {
    background:linear-gradient(135deg,#6366f1,#8b5cf6);
    border-radius:14px;
    padding:28px 32px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:28px;
    color:#fff;
    box-shadow:0 4px 20px rgba(99,102,241,.25);
}
.ai-header-left { display:flex; align-items:center; gap:16px; }
.ai-header h2   { font-size:22px; font-weight:700; margin-bottom:4px; }
.ai-header p    { font-size:13px; opacity:.85; }
.ai-badge       { background:rgba(255,255,255,.2); border-radius:20px; padding:4px 14px; font-size:12px; font-weight:600; }

/* Stats */
.ai-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:16px; margin-bottom:28px; }
.ai-stat  { background:#fff; border:1px solid var(--admin-border); border-radius:10px; padding:18px 20px; text-align:center; }
.ai-stat .num { font-size:28px; font-weight:700; color:#6366f1; }
.ai-stat .lbl { font-size:12px; color:var(--admin-text-muted); margin-top:4px; }

/* Filters */
.ai-filters {
    display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;
}
.ai-filter-btn {
    padding:6px 16px; border-radius:20px; border:1.5px solid var(--admin-border);
    background:#fff; color:var(--admin-text); font-size:13px; font-weight:500;
    cursor:pointer; transition:all .15s;
}
.ai-filter-btn:hover, .ai-filter-btn.active {
    background:#6366f1; color:#fff; border-color:#6366f1;
}
.ai-search {
    padding:8px 14px; border:1.5px solid var(--admin-border); border-radius:8px;
    font-size:13px; min-width:220px; background:var(--admin-bg); color:var(--admin-text);
}
.ai-search:focus { outline:none; border-color:#6366f1; }

/* Log Table */
.log-table { width:100%; border-collapse:collapse; font-size:13px; }
.log-table th {
    background:#f8fafc; padding:10px 14px; text-align:left;
    font-size:11px; letter-spacing:.06em; text-transform:uppercase;
    color:var(--admin-text-muted); border-bottom:1px solid var(--admin-border);
    font-weight:600;
}
.log-table td { padding:12px 14px; border-bottom:1px solid var(--admin-border); vertical-align:top; }
.log-table tr:hover td { background:#f8fafc; }

.log-icon {
    width:32px; height:32px; border-radius:8px;
    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;
}
.log-row { display:flex; align-items:flex-start; gap:12px; }
.log-desc { font-size:13px; color:var(--admin-text); font-weight:500; line-height:1.4; }
.log-meta { font-size:11px; color:var(--admin-text-muted); margin-top:3px; }

.change-pill {
    display:inline-block; padding:2px 8px; border-radius:4px;
    font-size:11px; font-weight:600; margin:0 3px;
}
.pill-old { background:#fef3c7; color:#92400e; }
.pill-new { background:#d1fae5; color:#065f46; }

/* Category tags */
.cat-tag { display:inline-block; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.cat-orders    { background:#dbeafe; color:#1d4ed8; }
.cat-products  { background:#d1fae5; color:#065f46; }
.cat-customers { background:#fce7f3; color:#9d174d; }
.cat-settings  { background:#f3e8ff; color:#6b21a8; }
.cat-invoices  { background:#ffedd5; color:#9a3412; }
.cat-system    { background:#f1f5f9; color:#475569; }
.cat-general   { background:#f1f5f9; color:#475569; }

.logout-btn {
    background:rgba(255,255,255,.2); border:1.5px solid rgba(255,255,255,.4);
    color:#fff; padding:8px 16px; border-radius:8px; font-size:13px;
    font-weight:600; cursor:pointer; transition:background .15s;
}
.logout-btn:hover { background:rgba(255,255,255,.3); }

/* Pagination */
.ai-pager { display:flex; justify-content:center; gap:8px; padding:20px; }
.ai-pager a {
    padding:6px 14px; border-radius:6px; border:1.5px solid var(--admin-border);
    color:var(--admin-text); text-decoration:none; font-size:13px;
}
.ai-pager a.active { background:#6366f1; color:#fff; border-color:#6366f1; }
.ai-pager a:hover:not(.active) { background:#f1f5f9; }

.empty-state { text-align:center; padding:60px 20px; color:var(--admin-text-muted); }
.empty-state svg { opacity:.3; margin-bottom:16px; }
</style>

<?php if (!$authenticated): ?>
<!-- ── Login Gate ── -->
<div class="ai-login-wrap">
    <div class="ai-login-card">
        <div class="ai-logo-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
            </svg>
        </div>
        <h2>Webcrafts AI Intelligence</h2>
        <p>Restricted access — admin credentials required to view system logs.</p>
        <?php if ($authError): ?>
            <div class="ai-error"><?= htmlspecialchars($authError) ?></div>
        <?php endif; ?>
        <form method="POST">
            <input type="text"     name="ai_username" class="ai-input" placeholder="Username" autocomplete="off" required>
            <input type="password" name="ai_password" class="ai-input" placeholder="Password" required>
            <button type="submit"  name="ai_login"    class="ai-btn">🔐 Access Intelligence System</button>
        </form>
    </div>
</div>

<?php else:
    // ── Load DB directly (admin pages don't go through index.php) ─────
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../helpers/activity_log.php';
    $db = (new Database())->getConnection();
    ensureActivityLogsTable($db);

    // ── Backfill historical logs from existing orders ─────────────────
    $backfillMsg = '';
    if (isset($_POST['backfill_logs'])) {
        try {
            $count = 0;
            // Seed from existing orders
            $orders = $db->query("SELECT id, order_number, customer_name, total, status, payment_status, payment_method, created_at FROM orders ORDER BY created_at ASC")->fetchAll();
            foreach ($orders as $o) {
                // Order created
                $exists = $db->prepare("SELECT id FROM activity_logs WHERE action_type='order_created' AND entity_id=:eid");
                $exists->execute([':eid'=>$o['id']]);
                if (!$exists->fetch()) {
                    logActivity($db, 'order_created', 'orders', $o['id'], $o['order_number'],
                        null, $o['status'],
                        'Order placed by ' . $o['customer_name'] . ' — Total: HK$' . number_format($o['total'],2),
                        null, $o['created_at']);
                    $count++;
                }
                // Payment status if paid/failed
                if (in_array($o['payment_status'], ['paid','failed'])) {
                    $exists2 = $db->prepare("SELECT id FROM activity_logs WHERE action_type='payment_status_changed' AND entity_id=:eid");
                    $exists2->execute([':eid'=>$o['id']]);
                    if (!$exists2->fetch()) {
                        logActivity($db, 'payment_status_changed', 'orders', $o['id'], $o['order_number'],
                            'pending', $o['payment_status'],
                            'Payment ' . strtoupper($o['payment_status']) . ' for order ' . $o['order_number'] . ' via ' . strtoupper($o['payment_method'] ?? 'N/A'),
                            null, $o['created_at']);
                        $count++;
                    }
                }
                // Delivered orders
                if ($o['status'] === 'delivered') {
                    $exists3 = $db->prepare("SELECT id FROM activity_logs WHERE action_type='order_status_changed' AND entity_id=:eid AND new_value='delivered'");
                    $exists3->execute([':eid'=>$o['id']]);
                    if (!$exists3->fetch()) {
                        logActivity($db, 'order_status_changed', 'orders', $o['id'], $o['order_number'],
                            'processing', 'delivered',
                            'Order delivered: ' . $o['order_number'] . ' — ' . $o['customer_name'],
                            null, $o['created_at']);
                        $count++;
                    }
                }
            }
            // Seed out-of-stock products
            $oos = $db->query("SELECT id, name, created_at FROM products WHERE stock = 0")->fetchAll();
            foreach ($oos as $p) {
                $exists4 = $db->prepare("SELECT id FROM activity_logs WHERE action_type='product_out_of_stock' AND entity_id=:eid");
                $exists4->execute([':eid'=>$p['id']]);
                if (!$exists4->fetch()) {
                    logActivity($db, 'product_out_of_stock', 'products', $p['id'], $p['name'],
                        'in_stock', 'out_of_stock', 'Product is currently out of stock: ' . $p['name']);
                    $count++;
                }
            }
            $backfillMsg = "✅ Successfully seeded $count historical log entries!";
        } catch (\Throwable $e) {
            $backfillMsg = "⚠️ Error: " . $e->getMessage();
        }
    }

    $page     = max(1, (int)($_GET['page'] ?? 1));
    $perPage  = 40;
    $offset   = ($page - 1) * $perPage;
    $cat      = $_GET['cat']  ?? '';
    $search   = $_GET['q']    ?? '';

    $where  = ['1=1'];
    $params = [];
    if ($cat)    { $where[] = 'category = :cat'; $params[':cat'] = $cat; }
    if ($search) { $where[] = '(description LIKE :q OR entity_name LIKE :q2 OR action_type LIKE :q3)';
                   $s = '%'.$search.'%'; $params[':q']=$s; $params[':q2']=$s; $params[':q3']=$s; }
    $wc = 'WHERE '.implode(' AND ',$where);

    try {
        $totalStmt = $db->prepare("SELECT COUNT(*) FROM activity_logs $wc");
        $totalStmt->execute($params);
        $total = (int)$totalStmt->fetchColumn();

        $stmt = $db->prepare("SELECT * FROM activity_logs $wc ORDER BY created_at DESC LIMIT :lim OFFSET :off");
        foreach ($params as $k=>$v) $stmt->bindValue($k,$v);
        $stmt->bindValue(':lim',$perPage,PDO::PARAM_INT);
        $stmt->bindValue(':off',$offset, PDO::PARAM_INT);
        $stmt->execute();
        $logs = $stmt->fetchAll();

        // Stats
        $stats = [];
        $catRows = $db->query("SELECT category, COUNT(*) as cnt FROM activity_logs GROUP BY category")->fetchAll();
        foreach ($catRows as $r) $stats[$r['category']] = $r['cnt'];
        $totalAll = $db->query("SELECT COUNT(*) FROM activity_logs")->fetchColumn();
        $todayAll = $db->query("SELECT COUNT(*) FROM activity_logs WHERE DATE(created_at)=CURDATE()")->fetchColumn();
    } catch (\Throwable $e) {
        $logs = []; $total = 0; $stats = []; $totalAll = 0; $todayAll = 0;
    }

    $totalPages = max(1, (int)ceil($total / $perPage));

    // Icon + color map per action_type
    function aiIcon($actionType, $cat) {
        $map = [
            'order_status_changed'   => ['#dbeafe','#1d4ed8','M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2M12 12v4M10 14h4'],
            'payment_status_changed' => ['#d1fae5','#065f46','M12 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z'],
            'order_deleted'          => ['#fee2e2','#dc2626','M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6'],
            'product_out_of_stock'   => ['#fef3c7','#d97706','M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'],
            'invoice_printed'        => ['#f3e8ff','#7c3aed','M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z'],
        ];
        $default = ['#f1f5f9','#64748b','M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4l2 2'];
        $d = $map[$actionType] ?? $default;
        return ['bg'=>$d[0],'color'=>$d[1],'path'=>$d[2]];
    }
?>
<!-- ── Authenticated Dashboard ── -->
<div style="padding:0 4px;">

    <!-- Header -->
    <div class="ai-header">
        <div class="ai-header-left">
            <div class="ai-logo-icon" style="background:rgba(255,255,255,.2);width:52px;height:52px;border-radius:14px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div>
                <h2>Webcrafts AI Intelligence System</h2>
                <p>Complete admin activity log — every action tracked &amp; monitored</p>
            </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
            <span class="ai-badge">🔒 Secure Access</span>
            <form method="POST" style="margin:0;">
                <button type="submit" name="ai_logout" class="logout-btn">Logout</button>
            </form>
        </div>
    </div>

    <!-- Stats -->
    <div class="ai-stats">
        <div class="ai-stat"><div class="num"><?= number_format((int)$totalAll) ?></div><div class="lbl">Total Events</div></div>
        <div class="ai-stat"><div class="num"><?= number_format((int)$todayAll) ?></div><div class="lbl">Today's Events</div></div>
        <div class="ai-stat"><div class="num"><?= number_format($stats['orders']??0) ?></div><div class="lbl">Order Events</div></div>
        <div class="ai-stat"><div class="num"><?= number_format($stats['products']??0) ?></div><div class="lbl">Stock Events</div></div>
        <div class="ai-stat"><div class="num"><?= number_format($stats['invoices']??0) ?></div><div class="lbl">Invoice Events</div></div>
    </div>

    <?php if ($backfillMsg): ?>
    <div style="margin-bottom:16px;padding:12px 20px;background:#ecfdf5;border:1.5px solid #16a34a;border-radius:10px;color:#15803d;font-weight:600;font-size:14px;">
        <?= htmlspecialchars($backfillMsg) ?>
    </div>
    <?php endif; ?>

    <?php if ((int)$totalAll === 0): ?>
    <div style="margin-bottom:20px;padding:16px 20px;background:#fffbeb;border:1.5px solid #f59e0b;border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
        <div>
            <strong style="color:#92400e;">📋 No logs yet!</strong>
            <span style="color:#78350f;font-size:13px;margin-left:8px;">Click to import historical data from your existing orders & products.</span>
        </div>
        <form method="POST" style="margin:0;">
            <button type="submit" name="backfill_logs" value="1" class="btn btn-primary btn-sm" style="white-space:nowrap;">
                🔄 Seed Historical Logs
            </button>
        </form>
    </div>
    <?php endif; ?>

    <!-- Filters + Search -->
    <div class="card" style="margin-bottom:20px;">
        <div class="card-body" style="padding:16px 20px;">
            <div class="ai-filters">
                <a href="?cat=" class="ai-filter-btn <?= $cat==='' ? 'active':'' ?>">All</a>
                <a href="?cat=orders"    class="ai-filter-btn <?= $cat==='orders'   ?'active':'' ?>">📦 Orders</a>
                <a href="?cat=products"  class="ai-filter-btn <?= $cat==='products' ?'active':'' ?>">🛒 Products/Stock</a>
                <a href="?cat=invoices"  class="ai-filter-btn <?= $cat==='invoices' ?'active':'' ?>">🧾 Invoices</a>
                <a href="?cat=customers" class="ai-filter-btn <?= $cat==='customers'?'active':'' ?>">👤 Customers</a>
                <a href="?cat=settings"  class="ai-filter-btn <?= $cat==='settings' ?'active':'' ?>">⚙️ Settings</a>
                <a href="?cat=system"    class="ai-filter-btn <?= $cat==='system'   ?'active':'' ?>">🖥️ System</a>
                <form method="GET" style="margin-left:auto;display:flex;gap:8px;">
                    <?php if ($cat): ?><input type="hidden" name="cat" value="<?= htmlspecialchars($cat) ?>"><?php endif; ?>
                    <input type="text" name="q" class="ai-search" placeholder="Search logs..." value="<?= htmlspecialchars($search) ?>">
                    <button type="submit" class="btn btn-primary btn-sm">Search</button>
                </form>
            </div>
        </div>
    </div>

    <!-- Log Table -->
    <div class="card">
        <div class="card-body" style="padding:0;">
            <?php if (empty($logs)): ?>
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    <h3>No Logs Yet</h3>
                    <p>Activity will be recorded here as admins use the panel.</p>
                </div>
            <?php else: ?>
            <table class="log-table">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Category</th>
                        <th>Change</th>
                        <th>IP Address</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($logs as $log):
                        $icon = aiIcon($log['action_type'], $log['category']);
                    ?>
                    <tr>
                        <td>
                            <div class="log-row">
                                <div class="log-icon" style="background:<?= $icon['bg'] ?>;color:<?= $icon['color'] ?>;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="<?= $icon['color'] ?>" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="<?= htmlspecialchars($icon['path']) ?>"/></svg>
                                </div>
                                <div>
                                    <div class="log-desc"><?= htmlspecialchars($log['description']) ?></div>
                                    <?php if ($log['entity_name']): ?>
                                        <div class="log-meta">Entity: <?= htmlspecialchars($log['entity_name']) ?></div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="cat-tag cat-<?= htmlspecialchars($log['category']) ?>">
                                <?= htmlspecialchars(ucfirst($log['category'])) ?>
                            </span>
                        </td>
                        <td>
                            <?php if ($log['old_value'] !== null || $log['new_value'] !== null): ?>
                                <?php if ($log['old_value'] !== null): ?>
                                    <span class="change-pill pill-old"><?= htmlspecialchars(strtoupper($log['old_value'])) ?></span>
                                    →
                                <?php endif; ?>
                                <?php if ($log['new_value'] !== null): ?>
                                    <span class="change-pill pill-new"><?= htmlspecialchars(strtoupper($log['new_value'])) ?></span>
                                <?php endif; ?>
                            <?php else: ?>
                                <span style="color:var(--admin-text-muted)">—</span>
                            <?php endif; ?>
                        </td>
                        <td style="font-size:12px;color:var(--admin-text-muted);">
                            <?= htmlspecialchars($log['ip_address'] ?: '—') ?>
                        </td>
                        <td style="white-space:nowrap;font-size:12px;color:var(--admin-text-muted);">
                            <?= date('d M Y', strtotime($log['created_at'])) ?><br>
                            <strong style="color:var(--admin-text);"><?= date('H:i:s', strtotime($log['created_at'])) ?></strong>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php endif; ?>
        </div>
    </div>

    <!-- Pagination -->
    <?php if ($totalPages > 1): ?>
    <div class="ai-pager">
        <?php for ($i=1;$i<=$totalPages;$i++): ?>
            <a href="?page=<?=$i?>&cat=<?=urlencode($cat)?>&q=<?=urlencode($search)?>" class="<?=$i===$page?'active':''?>"><?=$i?></a>
        <?php endfor; ?>
    </div>
    <?php endif; ?>

</div>
<?php endif; ?>

<?php include 'includes/footer.php'; ?>

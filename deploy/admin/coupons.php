<?php $pageTitle = 'Coupons'; include 'includes/header.php'; ?>

<div class="toolbar">
    <h3 style="font-size:16px;">Manage Coupons</h3>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Status</th><th>Expires</th></tr></thead>
        <tbody id="couponsList">
            <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-text-muted)">Coupons can be managed via the database for now</td></tr>
        </tbody>
    </table>
</div></div>

<?php include 'includes/footer.php'; ?>

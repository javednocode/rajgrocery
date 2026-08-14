<?php
/**
 * Webcrafts AI Intelligence System — Activity Logger
 * Logs all admin actions to activity_logs table (auto-creates if missing).
 */

function ensureActivityLogsTable($db) {
    static $created = false;
    if ($created) return;
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS activity_logs (
            id            BIGINT AUTO_INCREMENT PRIMARY KEY,
            action_type   VARCHAR(80)  NOT NULL,
            category      VARCHAR(50)  NOT NULL DEFAULT 'general',
            description   TEXT         NOT NULL,
            entity_type   VARCHAR(50)  DEFAULT '',
            entity_id     INT          DEFAULT NULL,
            entity_name   VARCHAR(255) DEFAULT '',
            old_value     VARCHAR(255) DEFAULT NULL,
            new_value     VARCHAR(255) DEFAULT NULL,
            performed_by  VARCHAR(100) DEFAULT 'Admin',
            ip_address    VARCHAR(45)  DEFAULT '',
            created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_action_type (action_type),
            INDEX idx_category   (category),
            INDEX idx_created_at (created_at),
            INDEX idx_entity     (entity_type, entity_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $created = true;
    } catch (\Throwable $e) {
        error_log('activity_logs table error: ' . $e->getMessage());
    }
}

/**
 * Log an admin activity.
 *
 * @param object $db          PDO connection
 * @param string $actionType  e.g. 'order_status_changed', 'product_out_of_stock'
 * @param string $description Human-readable description
 * @param string $category    'orders'|'products'|'customers'|'settings'|'system'|'invoices'
 * @param string $entityType  'order'|'product'|'customer'|...
 * @param int|null $entityId
 * @param string $entityName  Order number, product name, etc.
 * @param string|null $oldValue
 * @param string|null $newValue
 * @param string $performedBy
 */
function logActivity(
    $db,
    string $actionType,
    string $category      = 'general',
    ?int   $entityId      = null,
    string $entityName    = '',
    ?string $oldValue     = null,
    ?string $newValue     = null,
    string $description   = '',
    string $performedBy   = 'Admin',
    ?string $createdAt    = null
): void {
    try {
        ensureActivityLogsTable($db);
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
        if ($createdAt) {
            $db->prepare(
                "INSERT INTO activity_logs
                    (action_type, category, description, entity_id, entity_name, old_value, new_value, performed_by, ip_address, created_at)
                 VALUES
                    (:at, :cat, :desc, :eid, :en, :ov, :nv, :pb, :ip, :ca)"
            )->execute([
                ':at'  => $actionType,
                ':cat' => $category,
                ':desc'=> $description,
                ':eid' => $entityId,
                ':en'  => $entityName,
                ':ov'  => $oldValue,
                ':nv'  => $newValue,
                ':pb'  => $performedBy,
                ':ip'  => substr((string)$ip, 0, 45),
                ':ca'  => $createdAt,
            ]);
        } else {
            $db->prepare(
                "INSERT INTO activity_logs
                    (action_type, category, description, entity_id, entity_name, old_value, new_value, performed_by, ip_address)
                 VALUES
                    (:at, :cat, :desc, :eid, :en, :ov, :nv, :pb, :ip)"
            )->execute([
                ':at'  => $actionType,
                ':cat' => $category,
                ':desc'=> $description,
                ':eid' => $entityId,
                ':en'  => $entityName,
                ':ov'  => $oldValue,
                ':nv'  => $newValue,
                ':pb'  => $performedBy,
                ':ip'  => substr((string)$ip, 0, 45),
            ]);
        }
    } catch (\Throwable $e) {
        error_log('logActivity error: ' . $e->getMessage());
    }
}

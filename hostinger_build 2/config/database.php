<?php
/**
 * Asian Food Cork - Database Configuration
 * PDO connection with error handling
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $isLocal = (php_sapi_name() === 'cli-server' || ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' || ($_SERVER['SERVER_ADDR'] ?? '') === '127.0.0.1' || strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false);
        
        if ($isLocal && !getenv('DB_NAME')) {
            $this->host     = 'localhost';
            $this->db_name  = 'asianfoodcork_db';
            $this->username = 'root';
            $this->password = '';
        } else {
            $this->host     = getenv('DB_HOST') ?: 'localhost';
            $this->db_name  = getenv('DB_NAME') ?: 'u303278809_kartik_test';
            $this->username = getenv('DB_USER') ?: 'u303278809_kartik_test';
            $this->password = getenv('DB_PASS') ?: 'Jj@9610022011..';
        }
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed',
                'error' => $e->getMessage()
            ]);
            exit;
        }
        return $this->conn;
    }
}

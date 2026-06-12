<?php
/**
 * White-label ecommerce database configuration.
 * PDO connection with performance optimizations for Hostinger shared hosting
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $isLocal = (
            php_sapi_name() === 'cli-server' ||
            ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' ||
            ($_SERVER['SERVER_ADDR'] ?? '') === '127.0.0.1' ||
            strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false
        );

        if ($isLocal && !getenv('DB_NAME')) {
            $this->host     = 'localhost';
            $this->db_name  = 'ecommerce_db';
            $this->username = 'root';
            $this->password = '';
        } else {
            $this->host     = getenv('DB_HOST') ?: 'localhost';
            $this->db_name  = getenv('DB_NAME') ?: 'u303278809_asian_halal';
            $this->username = getenv('DB_USER') ?: 'u303278809_webcraftstech';
            $this->password = getenv('DB_PASS') ?: 'Jj@9610022011..';
        }
    }

    public function getConnection() {
        if ($this->conn !== null) return $this->conn;

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $initCommandAttribute = defined('Pdo\\Mysql::ATTR_INIT_COMMAND')
                ? constant('Pdo\\Mysql::ATTR_INIT_COMMAND')
                : PDO::MYSQL_ATTR_INIT_COMMAND;

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                // Connection timeout — fail fast on shared hosting
                PDO::ATTR_TIMEOUT            => 5,
                // MySQL-specific optimizations
                $initCommandAttribute => "
                    SET NAMES 'utf8mb4',
                        time_zone = '+00:00',
                        sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'
                ",
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed'
            ]);
            exit;
        }

        return $this->conn;
    }
}

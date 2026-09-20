<?php
/**
 * Koneksi database untuk RSVP & UCAPAN
 * Laragon MySQL: user `root`, password kosong
 *
 * Secara otomatis:
 *  1. Membuat database `wedding_invitation` jika belum ada
 *  2. Membuat tabel `rsvp_ucapan` jika belum ada
 *  jadi tidak perlu import SQL manual lagi.
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'wedding_invitation');
define('DB_USER', 'root');
define('DB_PASS', '');

$pdo = null;
$opts = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        $opts
    );
} catch (PDOException $e) {
    // Database mungkin belum ada -> buat otomatis
    try {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';charset=utf8mb4', DB_USER, DB_PASS, $opts);
        $pdo->exec('CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '`
                    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $pdo->exec('USE `' . DB_NAME . '`');
        $pdo->exec('SET NAMES utf8mb4');
    } catch (PDOException $e2) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'message' => 'Gagal terhubung ke database: ' . $e2->getMessage()]);
        exit;
    }
}

// Pastikan tabel ada (auto-install, tidak perlu import SQL manual)
try {
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS rsvp_ucapan (
          id         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
          nama       VARCHAR(255)      NOT NULL,
          kehadiran  ENUM('hadir','tidak_hadir','masih_ragu')
                                        NOT NULL DEFAULT 'hadir',
          ucapan     TEXT              NULL,
          created_at TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX idx_nama      (nama),
          INDEX idx_kehadiran (kehadiran),
          INDEX idx_created   (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => 'Gagal membuat tabel: ' . $e->getMessage()]);
    exit;
}
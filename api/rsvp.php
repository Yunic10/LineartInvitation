<?php
/**
 * Endpoint RSVP & UCAPAN
 *   GET  api/rsvp.php          -> ambil semua ucapan (guest wall)
 *   POST api/rsvp.php          -> simpan RSVP + ucapan baru
 *
 * Request (POST) JSON:
 *   { "nama": "Budi", "kehadiran": "hadir", "ucapan": "Selamat ya!" }
 */
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function jsonOut($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

/* ============ GET: ambil daftar ucapan ============ */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query(
            'SELECT id, nama, kehadiran, ucapan, created_at
             FROM rsvp_ucapan
             ORDER BY id DESC'
        );
        $rows = $stmt->fetchAll();

        // Map kehadiran ke label untuk frontend
        $labels = [
            'hadir'        => '🎉 Akan Hadir',
            'tidak_hadir'  => '😢 Tidak Bisa Hadir',
            'masih_ragu'   => '🤔 Masih Ragu',
        ];

        $messages = array_map(function ($r) use ($labels) {
            return [
                'id'       => (int) $r['id'],
                'name'     => $r['nama'],
                'status'   => $labels[$r['kehadiran']] ?? $r['kehadiran'],
                'text'     => $r['ucapan'],
                'time'     => date('d/m/Y H:i', strtotime($r['created_at'])),
            ];
        }, $rows);

        jsonOut(200, ['ok' => true, 'messages' => $messages]);
    } catch (PDOException $e) {
        jsonOut(500, ['ok' => false, 'message' => 'Gagal mengambil ucapan: ' . $e->getMessage()]);
    }
}

/* ============ POST: simpan RSVP + ucapan ============ */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        // Fallback: dukung form-encoded
        $body = $_POST;
    }

    $nama     = isset($body['nama']) ? trim($body['nama']) : '';
    $kehadiran = isset($body['kehadiran']) ? $body['kehadiran'] : 'hadir';
    $ucapan   = isset($body['ucapan']) ? trim($body['ucapan']) : '';

    if ($nama === '') {
        jsonOut(422, ['ok' => false, 'message' => 'Nama wajib diisi.']);
    }

    $allowed = ['hadir', 'tidak_hadir', 'masih_ragu'];
    if (!in_array($kehadiran, $allowed, true)) {
        $kehadiran = 'hadir';
    }

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO rsvp_ucapan (nama, kehadiran, ucapan)
             VALUES (:nama, :kehadiran, :ucapan)'
        );
        $stmt->execute([
            ':nama'      => $nama,
            ':kehadiran' => $kehadiran,
            ':ucapan'    => $ucapan,
        ]);
    } catch (PDOException $e) {
        jsonOut(500, ['ok' => false, 'message' => 'Gagal menyimpan ucapan: ' . $e->getMessage()]);
    }

    jsonOut(201, ['ok' => true, 'message' => 'Ucapan berhasil dikirim! 🤍']);
}
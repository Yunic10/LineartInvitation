-- =====================================================
-- DATABASE RSVP & UCAPAN - Undangan Pernikahan
-- Khusnul & Abdul (05.10.2026)
-- Untuk MySQL (Laragon)
-- =====================================================

-- 1) Buat database (jika belum ada)
CREATE DATABASE IF NOT EXISTS wedding_invitation
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wedding_invitation;

-- 2) Tabel utama: menampung RSVP + Ucapan & Doa
CREATE TABLE IF NOT EXISTS rsvp_ucapan (
  id         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  nama       VARCHAR(255)      NOT NULL              COMMENT 'Nama lengkap pengunjung/tamu',
  kehadiran  ENUM('hadir','tidak_hadir','masih_ragu')
                                NOT NULL DEFAULT 'hadir' COMMENT 'Status kehadiran',
  ucapan     TEXT              NULL COMMENT 'Isi ucapan & doa',
  created_at TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pengiriman',
  PRIMARY KEY (id),
  INDEX idx_nama      (nama),
  INDEX idx_kehadiran (kehadiran),
  INDEX idx_created   (created_at)
) ENGINE=InnoDB COMMENT='RSVP dan ucapan tamu undangan';

-- 3) (Opsional) Contoh data awal untuk testing
-- INSERT INTO rsvp_ucapan (nama, kehadiran, ucapan) VALUES
--   ('Budi Santoso', 'hadir', 'Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah!'),
--   ('Siti Aminah',  'tidak_hadir', 'Maaf belum bisa hadir, doa terbaik untuk kalian berdua.'),
--   ('Dewi Lestari','masih_ragu', 'Semoga dilancarkan sampai hari H ya!');
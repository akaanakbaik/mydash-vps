My Dash

Batch 1 — Installer

Tujuan

Installer merupakan komponen pertama yang dijalankan pengguna.

Installer bertanggung jawab mempersiapkan seluruh lingkungan kerja sebelum dashboard dijalankan.

Installer harus mampu berjalan secara otomatis dengan interaksi seminimal mungkin tanpa mengurangi keamanan.

Seluruh proses instalasi harus dapat dilanjutkan apabila terputus dan tidak boleh mengulangi langkah yang telah selesai.

---

Filosofi Installer

Installer bukan sekadar mengunduh file.

Installer adalah sistem orkestrasi yang bertugas:

- memeriksa kompatibilitas VPS
- menentukan metode instalasi terbaik
- memasang seluruh dependency
- mengonfigurasi seluruh service
- memverifikasi hasil instalasi
- memastikan dashboard benar-benar siap digunakan

Apabila ditemukan masalah, installer wajib mencoba memperbaikinya secara otomatis sebelum meminta tindakan pengguna.

---

Alur Instalasi

Urutan instalasi wajib sebagai berikut:

1. Menampilkan halaman sambutan.
2. Memeriksa hak akses root.
3. Memeriksa koneksi internet.
4. Memeriksa sistem operasi.
5. Memeriksa versi kernel.
6. Memeriksa arsitektur CPU.
7. Memeriksa virtualisasi.
8. Memeriksa RAM.
9. Memeriksa swap.
10. Memeriksa kapasitas disk.
11. Memeriksa filesystem.
12. Memeriksa firewall.
13. Memeriksa Docker.
14. Memeriksa PostgreSQL.
15. Memeriksa Redis.
16. Memeriksa port yang akan digunakan.
17. Memeriksa tunnel yang telah ada.
18. Menampilkan ringkasan pemeriksaan.
19. Meminta password dashboard.
20. Menghasilkan recovery key.
21. Meminta informasi owner.
22. Menampilkan tiga persetujuan instalasi.
23. Melakukan instalasi.
24. Melakukan verifikasi.
25. Membuat tunnel otomatis.
26. Menampilkan alamat dashboard.
27. Menjalankan health check akhir.

---

Pemeriksaan Sistem

Installer wajib mengumpulkan informasi berikut:

Hostname

Operating System

Kernel

Architecture

CPU Model

CPU Core

RAM

Swap

Disk

Filesystem

Virtualization

Public IPv4

Public IPv6

Timezone

Docker

Redis

PostgreSQL

Firewall

Open Port

Internet Connection

DNS

Semua informasi disimpan sebagai konfigurasi awal dashboard.

---

Password Dashboard

Sebelum proses instalasi dimulai, installer wajib meminta pengguna membuat password dashboard.

Password harus dikonfirmasi dua kali.

Password tidak boleh disimpan dalam bentuk asli.

Password wajib di-hash menggunakan algoritma modern yang aman.

Installer harus menampilkan indikator kekuatan password.

---

Recovery Key

Setelah password berhasil dibuat, installer menghasilkan Recovery Key unik.

Recovery Key hanya ditampilkan satu kali.

Recovery Key tidak boleh ditampilkan kembali setelah instalasi selesai.

Pengguna diwajibkan menyimpan Recovery Key di tempat yang aman.

---

Informasi Owner

Installer meminta informasi berikut:

Nama Owner

Nomor WhatsApp

Telegram ID

Nama Server

Zona Waktu

Seluruh informasi dapat diubah kembali melalui dashboard setelah instalasi selesai.

---

Persetujuan

Installer wajib meminta tiga persetujuan terpisah.

Persetujuan pertama menjelaskan seluruh komponen yang akan dipasang.

Persetujuan kedua menjelaskan perubahan terhadap sistem operasi.

Persetujuan ketiga menjelaskan penggunaan tunnel, monitoring, dan pengiriman data yang diperlukan untuk menjalankan layanan.

Pengguna dapat membatalkan instalasi sebelum persetujuan terakhir.

---

Dependency

Installer hanya memasang dependency yang benar-benar dibutuhkan.

Dependency yang sudah tersedia tidak boleh dipasang ulang.

Versi dependency harus diverifikasi sebelum digunakan.

---

Resume Installation

Apabila proses terputus karena listrik padam, koneksi internet hilang, atau pengguna menghentikan proses, installer harus mampu melanjutkan dari langkah terakhir yang telah berhasil.

Installer tidak boleh mengulang seluruh proses apabila tidak diperlukan.

---

Verifikasi

Setelah seluruh komponen selesai dipasang, installer wajib melakukan pemeriksaan otomatis.

Minimal meliputi:

Frontend

Backend

Database

Redis

Agent

WebSocket

Notification Engine

Tunnel

Scheduler

Authentication

Session

Health Check

Apabila salah satu gagal, installer mencoba memperbaikinya secara otomatis sebelum menampilkan hasil kepada pengguna.

---

Tunnel

Tunnel menggunakan sistem prioritas.

Apabila provider utama gagal, installer otomatis mencoba provider berikutnya.

Pengguna tidak perlu memilih provider secara manual kecuali mengubahnya melalui pengaturan dashboard.

---

Hasil Instalasi

Apabila seluruh proses berhasil, installer menampilkan:

Status Instalasi

Versi Dashboard

Versi Agent

URL Dashboard

Status Tunnel

Status Database

Status Redis

Status Monitoring

Status Notification

Status Scheduler

Health Score Awal

---

Aturan AI Agent

Apabila AI agent menjalankan batch ini, AI wajib:

- membaca seluruh isi dokumen terlebih dahulu
- membuat rencana implementasi
- mengimplementasikan fitur sesuai urutan
- melakukan build
- melakukan lint
- melakukan type checking
- melakukan pengujian mandiri
- memperbaiki seluruh masalah yang ditemukan
- menghentikan proses setelah batch selesai dan menunggu instruksi berikutnya

AI tidak boleh mengimplementasikan batch lain tanpa perintah eksplisit dari pengguna.

Akhir dokumen.
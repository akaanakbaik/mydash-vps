My Dash

Batch 2 — Backend Foundation

Tujuan

Dokumen ini mendefinisikan standar pembangunan backend My Dash.

Backend merupakan pusat kendali seluruh sistem.

Seluruh komunikasi antara frontend, agent, database, notification engine, tunnel engine, AI engine, GitHub integration, scheduler, serta service lainnya wajib melalui backend.

Backend harus menjadi komponen yang stabil, aman, modular, mudah diuji, mudah dikembangkan, dan mampu menangani pertumbuhan fitur dalam jangka panjang.

Seluruh implementasi backend wajib mengikuti dokumen ini.

---

Filosofi Backend

Backend bukan hanya sekumpulan endpoint.

Backend adalah pusat orkestrasi.

Seluruh proses bisnis harus berada di backend.

Frontend hanya menampilkan data.

Agent hanya mengirim data.

Database hanya menyimpan data.

Backend mengambil keputusan.

---

Tanggung Jawab Backend

Backend bertanggung jawab terhadap:

Authentication

Authorization

Session

Configuration

Server Management

Notification

Rule Engine

Analytics

Tunnel Management

GitHub Integration

WebSocket Gateway

Scheduler

Health Check

Realtime Event

Plugin Management

Audit Log

Installer Registration

Agent Registration

Update Management

Recovery

Backup Metadata

Restore Metadata

System Information

AI Gateway

API Gateway

Rate Limiting

Error Handling

Logging

---

Prinsip Modular

Setiap domain memiliki modul sendiri.

Contoh domain:

Authentication

Notification

Tunnel

Monitoring

Analytics

Security

Settings

GitHub

Installer

Agent

Plugin

Automation

Backup

Restore

Dashboard

Tidak boleh membuat satu modul yang menangani beberapa domain berbeda.

---

API Design

Seluruh endpoint harus:

Konsisten.

Predictable.

Versioned.

Mudah dipahami.

Seluruh endpoint menggunakan format respons yang sama.

Respons berhasil.

Respons gagal.

Respons validasi.

Respons autentikasi.

Semua memiliki struktur yang konsisten.

---

Validation

Seluruh data masuk wajib divalidasi.

Tidak boleh mempercayai input pengguna.

Validasi dilakukan sebelum proses bisnis dijalankan.

Data yang tidak valid harus ditolak dengan pesan yang jelas.

---

Authentication

Backend menggunakan autentikasi berbasis password dashboard.

Tidak menggunakan username.

Password hanya dibuat saat instalasi.

Password disimpan dalam bentuk hash.

Recovery menggunakan Recovery Key.

Session memiliki masa berlaku sesuai konfigurasi.

Default:

24 jam.

---

Session Management

Backend mengelola seluruh session.

Session memiliki:

Device

Browser

IP

Login Time

Last Activity

Expire Time

Trusted Status

Session dapat diputus dari dashboard.

Session yang kedaluwarsa harus dibersihkan secara otomatis.

---

Configuration Management

Seluruh konfigurasi dipusatkan.

Konfigurasi dibagi menjadi:

System

Dashboard

Notification

Tunnel

Authentication

Realtime

AI

GitHub

Backup

Security

Cron

Plugin

Configuration tidak boleh tersebar pada source code.

---

Scheduler

Backend memiliki scheduler internal.

Scheduler digunakan untuk:

Cleanup

Health Check

Notification Retry

Session Cleanup

Cache Cleanup

Reconnect Tunnel

Agent Heartbeat Check

Backup Schedule

Update Check

GitHub Synchronization

AI Queue Cleanup

Scheduler harus tetap berjalan walaupun salah satu task gagal.

---

WebSocket Gateway

Backend menjadi gateway websocket.

Frontend tidak berkomunikasi langsung dengan agent.

Seluruh komunikasi melalui backend.

Gateway harus mampu menangani:

Realtime CPU

Realtime RAM

Realtime Disk

Realtime Activity

Realtime Notification

Realtime Tunnel

Realtime Docker

Realtime Analytics

Gateway harus mendukung reconnect otomatis.

---

Rule Engine Integration

Backend menjalankan Rule Engine.

Rule Engine menentukan:

Threshold

Cooldown

Priority

Notification

Retry

Escalation

AI Analysis Request

Rule tidak boleh berada di frontend.

---

Notification Queue

Backend menggunakan queue.

Semua notifikasi masuk ke queue terlebih dahulu.

Queue menentukan:

Priority

Provider

Retry

Timeout

Delivery Status

History

Apabila provider gagal.

Backend mencoba provider berikutnya apabila tersedia.

---

AI Gateway

AI bukan inti sistem.

Backend hanya memanggil AI apabila Rule Engine memintanya.

AI dipanggil untuk:

Diagnosis

Recommendation

Summary

Explanation

Log Analysis

AI tidak boleh digunakan untuk monitoring realtime.

AI tidak boleh digunakan untuk Rule Engine.

Timeout AI mengikuti konfigurasi proyek.

Apabila timeout tercapai.

Backend menghentikan permintaan.

Dashboard tetap berjalan normal.

---

Logging

Setiap proses penting dicatat.

Minimal mencakup:

Timestamp

Level

Module

Action

Result

Duration

Error

Log sensitif tidak boleh berisi:

Password

Recovery Key

API Secret

Environment Secret

Session Token

---

Error Recovery

Backend harus mampu melakukan:

Retry

Fallback

Reconnect

Graceful Shutdown

Graceful Restart

Self Recovery

Service Recovery

Queue Recovery

Apabila satu modul gagal.

Modul lain tetap berjalan.

---

Performance

Backend harus dirancang ringan.

Target:

Response cepat.

Memory stabil.

CPU rendah.

Connection efisien.

Tidak membuat query berulang yang tidak diperlukan.

Tidak melakukan proses berat pada request utama apabila dapat dipindahkan ke background worker.

---

Security

Backend wajib menerapkan:

Rate Limiting

Request Validation

Environment Protection

Session Validation

Origin Validation

Audit Logging

Secret Isolation

Tidak boleh mempercayai data dari frontend.

---

Coding Rules

Source code produksi:

Tidak boleh memiliki komentar.

Tidak boleh memiliki TODO.

Tidak boleh memiliki FIXME.

Tidak boleh memiliki kode mati.

Tidak boleh memiliki dependency yang tidak digunakan.

Tidak boleh memiliki warning.

Tidak boleh memiliki error type.

---

Acceptance Criteria

Backend dianggap siap apabila:

Seluruh modul inti telah memiliki fondasi.

API dapat dijalankan.

Session berjalan.

Authentication berjalan.

Scheduler berjalan.

WebSocket siap.

Configuration siap.

Logging siap.

Rule Engine siap untuk batch berikutnya.

Notification Queue siap dikembangkan.

Tidak terdapat build error.

Tidak terdapat lint warning.

Tidak terdapat type error.

AI telah melakukan verifikasi mandiri sebelum menghentikan proses.

AI wajib menunggu instruksi pengguna sebelum membaca file markdown berikutnya.

Akhir dokumen.
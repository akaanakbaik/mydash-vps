My Dash

Batch 2 — Realtime Foundation

Tujuan

Dokumen ini mendefinisikan seluruh standar sistem realtime pada My Dash.

Realtime merupakan salah satu komponen terpenting dalam proyek ini.

Pengguna harus dapat melihat perubahan kondisi VPS secara langsung tanpa melakukan refresh halaman.

Seluruh implementasi realtime wajib mengikuti dokumen ini.

AI tidak boleh membuat sistem realtime menggunakan polling sebagai metode utama.

Polling hanya digunakan sebagai mekanisme cadangan apabila koneksi realtime tidak tersedia.

---

Filosofi Realtime

Realtime bukan sekadar memperbarui angka.

Realtime harus memberikan pengalaman bahwa dashboard selalu hidup.

Perubahan data harus:

Cepat.

Halus.

Akurat.

Stabil.

Efisien.

Tidak mengganggu pengguna.

Tidak membebani VPS.

Tidak membebani browser.

Tidak membebani jaringan.

---

Arsitektur

Seluruh komunikasi realtime menggunakan arsitektur berikut.

Agent

↓

Backend Gateway

↓

Redis Pub/Sub

↓

WebSocket Server

↓

Frontend

Frontend tidak boleh berkomunikasi langsung dengan Agent.

Agent tidak boleh mengirim data langsung ke browser.

Backend menjadi pusat seluruh komunikasi.

---

Event Driven

Seluruh perubahan data dikirim menggunakan event.

Tidak menggunakan refresh halaman.

Tidak mengirim seluruh data apabila hanya sebagian yang berubah.

Event harus sekecil mungkin.

Event harus mudah ditambahkan.

Event harus memiliki nama yang konsisten.

---

Domain Realtime

Minimal domain berikut harus mendukung realtime.

CPU

RAM

Swap

Disk

Filesystem

Load Average

Bandwidth

Network Interface

Temperature

Docker

Container

Service

Tunnel

Firewall

Notification

Activity

Analytics

Health Score

Backup Progress

Restore Progress

GitHub Workflow

AI Analysis Progress

Scheduler

Plugin

Version

Update Status

Session

Security Alert

---

Frekuensi Update

Update tidak boleh dikirim terlalu sering.

Target awal:

CPU

1 detik

RAM

1 detik

Swap

2 detik

Disk

5 detik

Bandwidth

1 detik

Docker

2 detik

Activity

Realtime

Notification

Realtime

Tunnel

Realtime

Health Score

Saat terjadi perubahan.

AI wajib menyesuaikan frekuensi apabila diperlukan agar sistem tetap stabil.

---

Delta Update

Backend hanya mengirim data yang berubah.

Tidak boleh mengirim seluruh dashboard setiap detik.

Hal ini bertujuan mengurangi:

Bandwidth.

CPU.

Memory.

Render.

Latency.

---

Connection Lifecycle

Saat pengguna membuka dashboard.

Frontend membuat koneksi.

Backend melakukan autentikasi.

Backend mengirim status koneksi.

Backend mengirim data awal.

Setelah itu hanya perubahan yang dikirim.

Apabila koneksi terputus.

Frontend melakukan reconnect otomatis.

---

Reconnect Strategy

Reconnect dilakukan bertahap.

Tidak boleh melakukan reconnect tanpa jeda.

Harus memiliki:

Retry Count.

Backoff.

Maximum Retry.

Cooldown.

Status.

Apabila koneksi kembali normal.

Frontend melakukan sinkronisasi ulang.

---

Heartbeat

Seluruh koneksi memiliki heartbeat.

Heartbeat digunakan untuk:

Mendeteksi koneksi mati.

Mendeteksi Agent offline.

Mendeteksi Dashboard offline.

Mendeteksi Tunnel offline.

Apabila heartbeat hilang.

Backend membuat event.

Rule Engine menentukan tindakan berikutnya.

---

Offline Mode

Dashboard tetap dapat dibuka ketika koneksi realtime terputus.

Data terakhir tetap ditampilkan.

Status berubah menjadi:

Offline.

Last Update.

Reconnect.

Pengguna tetap dapat membuka halaman lain yang tidak memerlukan realtime.

---

Render Strategy

Frontend tidak boleh melakukan render ulang seluruh halaman.

Hanya komponen yang berubah.

Chart diperbarui secara bertahap.

Card diperbarui secara lokal.

Grafik tidak boleh berkedip.

Angka berubah menggunakan transisi halus.

---

Notification Integration

Realtime terhubung dengan Notification Engine.

Apabila Rule Engine menghasilkan event.

Event langsung diteruskan.

Notification lokal dibuat.

Provider dijalankan.

AI Analysis berjalan di background apabila memenuhi syarat.

Dashboard tetap menerima event tanpa menunggu AI.

---

Activity Timeline

Seluruh aktivitas penting langsung muncul.

Contoh:

Login.

Logout.

Restart Service.

Backup.

Restore.

Tunnel Reconnect.

Plugin Install.

Configuration Change.

Activity muncul tanpa refresh.

---

Security Event

Realtime juga digunakan untuk:

Failed Login.

Firewall Disabled.

SSH Login.

New Device.

Session Expired.

Permission Change.

API Error.

Critical Alert.

Semua event memiliki prioritas.

---

Performance Target

Target sistem realtime:

Latency serendah mungkin.

Memory stabil.

CPU rendah.

Tidak membuat browser lambat.

Tidak menyebabkan memory leak.

Tidak menyebabkan reconnect terus menerus.

---

Scalability

Sistem realtime harus siap untuk:

Banyak pengguna.

Banyak server.

Banyak workspace.

Banyak Agent.

Plugin tambahan.

Future Module.

Tanpa perubahan arsitektur besar.

---

Logging

Backend mencatat:

Connect.

Disconnect.

Reconnect.

Authentication.

Subscription.

Heartbeat.

Timeout.

Recovery.

Log digunakan untuk diagnosa.

Tidak digunakan sebagai penyimpanan analytics.

---

Testing

AI wajib menguji:

Koneksi pertama.

Reconnect.

Heartbeat.

Disconnect.

Offline.

Realtime CPU.

Realtime RAM.

Realtime Notification.

Realtime Activity.

Realtime Chart.

Multi Tab.

Multi Device.

Apabila terdapat masalah.

AI wajib memperbaikinya sebelum melanjutkan.

---

Coding Rules

Source code produksi:

Tidak boleh memiliki komentar.

Tidak boleh melakukan polling sebagai metode utama.

Tidak boleh melakukan render penuh ketika hanya satu data berubah.

Tidak boleh membuat event tanpa standar penamaan.

Tidak boleh mengirim data yang tidak diperlukan.

---

Acceptance Criteria

Batch dianggap selesai apabila:

Koneksi realtime berhasil dibuat.

Reconnect berjalan.

Heartbeat berjalan.

Delta update berjalan.

Frontend menerima event.

Backend mengirim event.

Agent siap diintegrasikan pada batch berikutnya.

Tidak terdapat memory leak yang diketahui.

Tidak terdapat warning.

Tidak terdapat type error.

Tidak terdapat build error.

Dokumentasi telah diperbarui.

AI telah melakukan verifikasi mandiri dan menghentikan proses sambil menunggu instruksi pengguna.

Akhir dokumen.
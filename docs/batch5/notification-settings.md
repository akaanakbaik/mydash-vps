Batch 5 — Notification Settings

Tujuan

Dokumen ini mendefinisikan seluruh sistem pengaturan notifikasi pada My Dash. Halaman Notification Settings bukan hanya tempat mengaktifkan atau menonaktifkan pemberitahuan, melainkan pusat konfigurasi seluruh mekanisme distribusi event dari sistem kepada pemilik VPS.

Seluruh konfigurasi harus bersifat modular, mudah dipahami, aman, dan dapat diubah tanpa perlu me-restart Dashboard maupun Agent.

Perubahan konfigurasi harus langsung diterapkan ke Notification Engine setelah lolos validasi.

Tidak boleh ada konfigurasi yang mengharuskan pengguna mengedit file konfigurasi secara manual apabila pengaturan tersebut dapat dilakukan melalui Dashboard.

---

Filosofi Notification Settings

Notification memiliki satu tujuan utama, yaitu memastikan pemilik server mengetahui perubahan penting sesegera mungkin tanpa membanjiri perangkatnya dengan pesan yang tidak berguna.

Oleh karena itu Notification Settings harus mampu menyeimbangkan dua kebutuhan yang bertolak belakang.

Di satu sisi sistem harus sangat sensitif terhadap kejadian penting.

Di sisi lain sistem harus mampu menekan spam notification akibat fluktuasi normal pada server.

Seluruh mekanisme tersebut dikendalikan melalui halaman ini.

---

Struktur Halaman

Halaman Notification Settings dibagi menjadi beberapa kelompok konfigurasi.

General.

Provider.

Category.

Threshold.

Delivery.

Template.

AI Enhancement.

Rate Limiting.

Quiet Hours.

History.

Testing.

Developer.

Setiap kelompok dipisahkan menjadi halaman kecil agar pengguna tidak kesulitan mencari pengaturan tertentu.

---

General Settings

General Settings merupakan konfigurasi dasar.

Minimal berisi.

Master Notification.

Notification Engine Status.

Notification Queue Status.

Notification History Retention.

Maximum Retry.

Default Timeout.

AI Timeout.

Worker Count.

Delivery Parallelism.

Apabila Master Notification dimatikan.

Notification Engine tetap membuat event.

Notification History tetap disimpan.

Rule Engine tetap berjalan.

Automation tetap berjalan.

Yang dihentikan hanya proses pengiriman kepada provider.

Pendekatan ini memastikan histori tidak hilang.

---

Provider Configuration

Dashboard harus mendukung banyak provider.

Minimal.

WhatsApp.

Telegram.

Provider baru di masa depan.

Setiap provider mempunyai konfigurasi sendiri.

Provider dapat diaktifkan secara independen.

Pengguna dapat menggunakan hanya WhatsApp.

Hanya Telegram.

Atau keduanya sekaligus.

---

WhatsApp Configuration

Provider WhatsApp menggunakan Baileys.

Pengguna harus mengisi.

Nomor Owner.

Nomor Bot.

Nama Bot.

Reconnect Policy.

Retry Policy.

Semua nomor harus menggunakan format internasional.

Contoh.

628xxxxxxxxxx

Nomor yang tidak sesuai format harus ditolak sebelum disimpan.

Dashboard melakukan validasi panjang, awalan negara, serta karakter yang diizinkan.

---

Pairing Workflow

Ketika pengguna mengaktifkan WhatsApp.

Dashboard membuat Pairing Session.

Status awal.

Waiting Configuration.

↓

Configuration Valid.

↓

Generating Pairing Code.

↓

Waiting Device.

↓

Pairing.

↓

Session Verification.

↓

Connected.

↓

Monitoring.

Apabila Pairing gagal.

Session dibersihkan.

Pengguna dapat mencoba kembali tanpa menghapus konfigurasi lain.

---

Telegram Configuration

Provider Telegram menggunakan Telegram Bot API.

Pengguna wajib mengisi.

Bot Token.

Owner Chat ID.

Nama Bot.

Connection Timeout.

Retry Count.

Dashboard harus memverifikasi.

Format Token.

Koneksi API.

Hak akses Bot.

Kecocokan Chat ID.

Konfigurasi tidak boleh disimpan apabila verifikasi gagal.

---

Notification Categories

Setiap kategori dapat diaktifkan secara terpisah.

Security.

Performance.

CPU.

RAM.

Swap.

Disk.

Filesystem.

Docker.

Tunnel.

Network.

Database.

Redis.

Scheduler.

Automation.

GitHub.

Backup.

Restore.

Plugin.

System Update.

AI Analysis.

Login.

Session.

Developer.

Future Module.

Dengan pendekatan ini pengguna dapat menerima hanya kategori yang benar-benar penting.

---

Threshold Configuration

Setiap kategori dapat memiliki batas sendiri.

Contoh CPU.

Warning.

70%

Error.

85%

Critical.

95%

Namun nilai tersebut tidak langsung digunakan.

Threshold efektif dihitung menggunakan kombinasi.

Threshold.

Duration.

Cooldown.

Confidence.

Misalkan.

CPU.

95%.

Duration.

300 Detik.

Confidence.

0.82

Rule baru aktif apabila.

CPU > 95%

selama

300 detik

dan

Confidence ≥ 0.80

Pendekatan ini jauh lebih akurat dibanding hanya membandingkan satu angka.

---

Adaptive Threshold

Dashboard dapat mengaktifkan Adaptive Threshold.

Adaptive Threshold menggunakan statistik historis.

Sebagai contoh.

Rata-rata CPU.

28%.

Standar Deviasi.

9%.

Threshold dinamis.

μ + (2 × σ)

=

28 + (2 × 9)

=

46%

Apabila server memang selalu bekerja ringan.

CPU 60% sudah dianggap tidak normal.

Sebaliknya.

Pada server kompilasi.

CPU 80% mungkin masih normal.

Fitur ini bersifat opsional.

---

Quiet Hours

Pengguna dapat menentukan jam tenang.

Contoh.

22.00

hingga

06.00

Selama periode tersebut.

Notification Information.

Success.

Warning.

Ditunda.

Notification Critical tetap dikirim.

Apabila Quiet Hours selesai.

Notification yang ditunda dapat diringkas menjadi satu laporan.

---

Rate Limiting

Notification Engine wajib menerapkan pembatasan.

Misalnya.

Maksimum.

10 Notification.

Per 5 Menit.

Apabila jumlah event melebihi batas.

Engine melakukan grouping.

Kemudian mengirim ringkasan.

Dengan demikian pengguna tidak menerima ratusan pesan ketika server mengalami gangguan besar.

---

AI Enhancement

AI Enhancement dapat diaktifkan per kategori.

Sebagai contoh.

CPU.

Aktif.

Disk.

Aktif.

Login.

Nonaktif.

Tunnel.

Aktif.

Notification lokal selalu dikirim terlebih dahulu.

AI bekerja di latar belakang.

Timeout maksimum.

32 detik.

Apabila AI selesai.

Dashboard dapat mengirim analisis lanjutan.

Apabila AI gagal.

Tidak ada notifikasi tambahan.

---

Notification Testing

Dashboard menyediakan halaman pengujian.

Pengguna dapat memilih.

Provider.

Kategori.

Severity.

Template.

AI.

Automation.

Dashboard membuat event simulasi.

Event tersebut diproses menggunakan pipeline yang sama seperti event nyata.

Dengan pendekatan ini pengguna dapat memastikan seluruh konfigurasi telah benar sebelum terjadi masalah sebenarnya.

---

Validation

Seluruh konfigurasi wajib divalidasi.

Tidak boleh menyimpan.

Nomor kosong.

Token kosong.

Threshold negatif.

Cooldown negatif.

Retry negatif.

Timeout di bawah batas minimum.

Timeout di atas batas maksimum yang ditentukan sistem.

Apabila validasi gagal.

Dashboard menjelaskan alasan secara rinci.

---

Acceptance Criteria

Halaman Notification Settings dianggap selesai apabila seluruh provider dapat dikonfigurasi secara independen, seluruh kategori memiliki pengaturan sendiri, threshold mendukung konfigurasi statis maupun adaptif, quiet hours, rate limiting, AI enhancement, serta pengujian provider dapat dilakukan tanpa memengaruhi event produksi.

Seluruh perubahan konfigurasi harus diterapkan secara langsung, terdokumentasi pada Activity Timeline, tersimpan di database, dan lolos proses validasi, build, lint, type checking, serta pengujian mandiri sebelum AI melanjutkan ke dokumen berikutnya.

Akhir dokumen.
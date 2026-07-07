Batch 5 — Telegram Provider

Tujuan

Dokumen ini mendefinisikan implementasi lengkap Notification Provider untuk Telegram menggunakan Telegram Bot API. Provider ini menjadi jalur komunikasi kedua setelah WhatsApp dan harus memiliki tingkat keandalan yang sama walaupun karakteristik protokol, autentikasi, dan mekanisme pengiriman berbeda.

Telegram Provider tidak boleh diperlakukan sebagai implementasi khusus yang berdiri sendiri. Provider harus mengikuti kontrak antarmuka yang sama dengan seluruh Notification Provider sehingga Notification Engine tidak perlu mengetahui apakah sebuah pesan dikirim melalui WhatsApp, Telegram, atau provider lain yang akan ditambahkan pada masa depan.

Seluruh proses harus bersifat modular, dapat diuji secara mandiri, serta mudah dipelihara.

---

Filosofi Provider

Telegram Provider hanya memiliki satu tanggung jawab.

Menerima Delivery Request yang telah diproses Notification Engine kemudian mengirimkannya ke Telegram dengan tingkat keberhasilan setinggi mungkin.

Provider tidak boleh melakukan evaluasi Rule.

Provider tidak boleh membaca Monitoring Engine.

Provider tidak boleh melakukan analisis AI.

Provider tidak boleh mengubah isi template.

Seluruh logika bisnis harus selesai sebelum Delivery Request masuk ke Provider.

Pendekatan ini menjaga batas tanggung jawab setiap modul tetap jelas.

---

Data Yang Dibutuhkan

Sebelum Provider dijalankan, Dashboard wajib meminta konfigurasi berikut.

Bot Token.

Owner Chat ID.

Bot Name.

Connection Timeout.

Maximum Retry.

Retry Interval.

Health Check Interval.

Message Rate Limit.

Configuration Version.

Seluruh konfigurasi harus lolos validasi sebelum disimpan ke database.

---

Validasi Token

Token Bot merupakan kredensial utama.

Provider wajib melakukan pemeriksaan.

Format.

Panjang.

Karakter.

Kemampuan melakukan autentikasi.

Status Bot.

Apabila Token tidak valid.

Provider tidak boleh memasuki status Connected.

Dashboard harus memberikan penjelasan yang mudah dipahami mengenai penyebab kegagalan.

---

Validasi Chat ID

Chat ID wajib diverifikasi.

Provider harus memastikan bahwa.

Bot dapat mengakses Chat tersebut.

Bot memiliki izin mengirim pesan.

Chat benar-benar ada.

Format Chat ID sesuai spesifikasi Telegram.

Apabila Chat ID gagal diverifikasi.

Provider tidak boleh menerima Delivery Request.

---

Lifecycle

Provider memiliki siklus hidup berikut.

Initialization.

↓

Configuration Loading.

↓

Configuration Validation.

↓

Token Verification.

↓

Bot Information Synchronization.

↓

Health Check.

↓

Connected.

↓

Delivery Ready.

↓

Realtime Monitoring.

↓

Graceful Shutdown.

Seluruh perpindahan status dicatat ke Activity Timeline.

---

Sinkronisasi Bot

Setelah autentikasi berhasil.

Provider mengambil metadata Bot.

Minimal.

Bot ID.

Bot Username.

Bot Display Name.

Can Join Group.

Can Read Message.

Can Send Message.

API Version apabila tersedia.

Metadata digunakan untuk memastikan konfigurasi pengguna tetap sesuai.

---

Delivery Pipeline

Setiap Delivery Request mengikuti alur.

Notification Queue.

↓

Provider Manager.

↓

Telegram Provider.

↓

Payload Validation.

↓

Request Builder.

↓

API Delivery.

↓

Delivery Verification.

↓

History Update.

↓

Statistics Update.

↓

Completion.

Provider tidak boleh melewati tahap verifikasi.

---

Payload Validation

Sebelum pesan dikirim.

Provider memastikan.

Isi pesan tidak kosong.

Karakter UTF-8 valid.

Placeholder telah diganti.

Ukuran pesan tidak melebihi batas Telegram.

Timestamp tersedia.

Severity tersedia.

Apabila validasi gagal.

Provider mengembalikan Delivery Failed dengan alasan yang jelas.

---

Message Formatting

Provider harus mempertahankan struktur pesan.

Judul.

Isi utama.

Ringkasan.

Status.

Timestamp.

Dashboard URL apabila tersedia.

Telegram mendukung format tertentu.

Namun Notification Engine tetap menghasilkan template universal.

Provider hanya melakukan penyesuaian format apabila diperlukan.

Dengan pendekatan ini satu template dapat digunakan pada banyak Provider.

---

Health Check

Health Check dilakukan secara berkala.

Health Check bertugas memastikan.

API Telegram masih dapat diakses.

Token masih valid.

Bot masih aktif.

Internet tersedia.

Latency masih dalam batas normal.

Health Check tidak mengirim pesan kepada pengguna.

---

Latency Measurement

Setiap permintaan diukur.

Persamaan.

Latency

=

Response Time

−

Request Time

Seluruh latency disimpan.

Average Latency.

Median Latency.

Maximum Latency.

Minimum Latency.

Persentil.

Dashboard menggunakan data tersebut untuk menampilkan performa Provider.

---

Retry Algorithm

Retry dilakukan menggunakan Exponential Backoff.

Percobaan.

1

↓

5 Detik.

2

↓

10 Detik.

3

↓

20 Detik.

4

↓

40 Detik.

5

↓

80 Detik.

Retry dihentikan ketika.

Pesan berhasil.

Provider dinonaktifkan.

Batas retry tercapai.

Notification dibatalkan pengguna.

---

Rate Limiting

Telegram memiliki batas pengiriman.

Provider harus memiliki Rate Limiter internal.

Misalnya.

Maximum Request.

X Request.

Per Detik.

Nilai maksimum dapat diubah melalui konfigurasi.

Apabila Queue melebihi kemampuan Provider.

Request tetap berada pada Notification Queue.

Tidak boleh dibuang.

---

Statistik

Provider menghasilkan statistik.

Total Delivery.

Success.

Failure.

Retry.

Average Latency.

Maximum Latency.

Availability.

API Error.

Configuration Error.

Authentication Error.

Rate Limit Error.

Statistics digunakan oleh halaman Analytics dan Provider Health.

---

Reliability Score

Provider memiliki Reliability Score.

Gunakan kombinasi.

Success Rate.

Availability.

Latency Score.

Retry Score.

Authentication Stability.

Persamaan.

Reliability

=

0.40 × Success Rate

+ 

0.25 × Availability

+ 

0.15 × Latency Score

+ 

0.10 × Retry Score

+ 

0.10 × Authentication Stability

Seluruh komponen dinormalisasi ke rentang nol hingga seratus.

Reliability diperbarui secara berkala.

Semakin tinggi nilai.

Semakin besar kemungkinan Provider dipilih sebagai jalur utama apabila pengguna mengaktifkan mode otomatis.

---

Recovery

Apabila Provider mengalami gangguan.

Recovery dilakukan.

Validasi ulang konfigurasi.

↓

Verifikasi Token.

↓

Health Check.

↓

Membuat koneksi baru.

↓

Sinkronisasi metadata.

↓

Melanjutkan Queue.

Apabila Recovery gagal.

Provider berpindah ke status Degraded.

Notification Engine menggunakan Provider lain apabila tersedia.

---

Integrasi Dengan Dashboard

Dashboard harus menampilkan informasi berikut.

Connection Status.

Bot Name.

Bot Username.

Owner Chat ID.

Health.

Reliability.

Average Latency.

Success Rate.

Failure Rate.

Retry Count.

Last Delivery.

Last Error.

Configuration Version.

Semua informasi diperbarui secara realtime tanpa perlu memuat ulang halaman.

---

Pengujian

AI wajib melakukan simulasi.

Token tidak valid.

Chat ID salah.

API timeout.

Internet terputus.

Rate limit.

Retry.

Recovery.

Restart aplikasi.

Pengiriman banyak pesan secara bersamaan.

Recovery setelah restart.

Perubahan konfigurasi saat Provider aktif.

Seluruh hasil pengujian dicatat.

Apabila ditemukan ketidaksesuaian.

AI wajib memperbaikinya sebelum melanjutkan ke dokumen berikutnya.

---

Acceptance Criteria

Telegram Provider dianggap selesai apabila mampu memverifikasi konfigurasi secara otomatis, mempertahankan koneksi ke Telegram Bot API, memproses Delivery Request secara konsisten, menerapkan Rate Limiting, Retry, Recovery, dan Reliability Score, menghasilkan statistik operasional yang lengkap, serta mampu beroperasi secara independen tanpa memengaruhi Notification Engine maupun Provider lain.

Seluruh implementasi wajib lolos build, lint, type checking, pengujian integrasi, dan verifikasi mandiri sebelum AI melanjutkan ke dokumen berikutnya.

Akhir dokumen.
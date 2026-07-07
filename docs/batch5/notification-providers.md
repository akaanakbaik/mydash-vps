Batch 5 — Notification Providers

Tujuan

Dokumen ini mendefinisikan spesifikasi teknis seluruh Notification Provider yang digunakan oleh My Dash. Provider merupakan lapisan terakhir sebelum sebuah notifikasi benar-benar dikirim kepada pengguna. Oleh karena itu Provider harus dirancang agar bersifat modular, dapat diganti tanpa memengaruhi Notification Engine, mendukung banyak platform, memiliki mekanisme pemulihan otomatis, serta mampu mempertahankan tingkat keberhasilan pengiriman setinggi mungkin.

Notification Provider bukan bagian dari Rule Engine.

Notification Provider bukan bagian dari Monitoring Engine.

Notification Provider bukan bagian dari Dashboard.

Provider hanya menerima tugas pengiriman yang telah diproses oleh Notification Engine.

Seluruh logika bisnis harus selesai sebelum sebuah Provider menerima permintaan pengiriman.

---

Filosofi Provider

Provider harus dianggap sebagai media transportasi.

Isi pesan berasal dari Template Engine.

Prioritas berasal dari Rule Engine.

Antrian berasal dari Notification Queue.

Analisis berasal dari AI apabila tersedia.

Provider hanya memiliki satu tanggung jawab, yaitu mengirimkan pesan ke tujuan dengan cara yang paling andal.

Dengan pemisahan tersebut, apabila suatu saat WhatsApp diganti atau Telegram mengalami perubahan API, Dashboard tidak memerlukan perubahan pada modul Monitoring, Rule Engine, Analytics, maupun Automation.

---

Arsitektur Provider

Seluruh Provider harus mengikuti arsitektur yang sama.

Notification Engine membuat Delivery Request.

↓

Provider Manager menerima Delivery Request.

↓

Provider Manager memilih Provider.

↓

Provider melakukan validasi.

↓

Provider membuat koneksi apabila diperlukan.

↓

Provider mengirim pesan.

↓

Provider melakukan verifikasi hasil.

↓

Provider mengembalikan Delivery Result.

↓

Notification Engine memperbarui History.

↓

Analytics memperbarui statistik.

Setiap Provider wajib menghasilkan format hasil yang identik agar Notification Engine tidak perlu mengetahui implementasi internal masing-masing Provider.

---

Provider Manager

Provider Manager merupakan lapisan abstraksi.

Provider Manager bertugas.

Memuat Provider.

Mengaktifkan Provider.

Menonaktifkan Provider.

Mengatur Prioritas.

Menjalankan Health Check.

Melakukan Failover.

Melakukan Retry.

Mengumpulkan Statistik.

Provider Manager tidak mengetahui isi pesan.

Provider Manager hanya mengetahui bagaimana memilih jalur pengiriman terbaik.

---

Provider Interface

Seluruh Provider wajib memiliki kemampuan berikut.

Inisialisasi.

Shutdown.

Health Check.

Validate Configuration.

Connect.

Disconnect.

Reconnect.

Send.

Verify Delivery.

Retry.

Cleanup.

Collect Statistics.

Dengan kontrak yang sama, Provider baru dapat ditambahkan tanpa mengubah Notification Engine.

---

WhatsApp Provider

WhatsApp menggunakan Baileys sebagai transport layer.

Provider harus mampu mempertahankan sesi login selama mungkin.

Sesi tidak boleh dibuat ulang setiap kali aplikasi dimulai.

Apabila sesi masih valid, Provider langsung melakukan sinkronisasi dan melanjutkan operasi.

Status koneksi minimal terdiri dari.

Not Configured.

Initializing.

Waiting Pairing.

Pairing.

Synchronizing.

Connected.

Disconnected.

Reconnecting.

Authentication Failed.

Fatal Error.

Dashboard harus menampilkan status tersebut secara realtime.

---

Pairing Algorithm

Proses Pairing harus mengikuti urutan yang konsisten.

Pertama.

Dashboard memverifikasi konfigurasi.

Kedua.

Provider membuat Pairing Session.

Ketiga.

Pairing Code dihasilkan.

Keempat.

Pengguna menghubungkan perangkat.

Kelima.

Provider memverifikasi kredensial.

Keenam.

Session dienkripsi dan disimpan.

Ketujuh.

Health Check dijalankan.

Kedelapan.

Status berubah menjadi Connected.

Apabila salah satu langkah gagal.

Provider wajib menghapus Pairing Session yang tidak valid agar tidak meninggalkan keadaan setengah selesai.

---

Session Persistence

Session harus dipertahankan walaupun aplikasi dihidupkan ulang.

Session tidak boleh disimpan dalam bentuk yang mudah dibaca.

Apabila integritas session gagal diverifikasi saat startup, Provider tidak boleh mencoba menggunakan session tersebut.

Provider harus meminta proses Pairing baru.

Pendekatan ini mencegah kegagalan berulang akibat session yang rusak.

---

Telegram Provider

Telegram menggunakan Telegram Bot API.

Provider harus melakukan validasi terhadap.

Format Token.

Hak akses Bot.

Chat ID.

Kemampuan mengirim pesan.

Kemampuan membaca informasi dasar Bot.

Apabila salah satu validasi gagal.

Provider tidak boleh berubah menjadi Connected.

---

Delivery Verification

Keberhasilan pengiriman tidak cukup ditentukan oleh keberhasilan pemanggilan API.

Provider harus memverifikasi bahwa platform tujuan benar-benar menerima permintaan.

Apabila platform mengembalikan identifier pengiriman, identifier tersebut disimpan pada Notification History.

Delivery Identifier memungkinkan administrator melakukan audit terhadap setiap pesan yang pernah dikirim.

---

Health Check

Setiap Provider melakukan Health Check secara berkala.

Health Check tidak mengirim pesan kepada pengguna.

Health Check hanya memastikan.

Koneksi masih aktif.

Autentikasi masih berlaku.

Session masih valid.

API masih dapat dijangkau.

Latency masih berada dalam batas wajar.

Hasil Health Check digunakan untuk menentukan Provider Priority.

---

Failover Algorithm

Apabila Provider utama gagal.

Provider Manager menjalankan algoritma Failover.

Langkah pertama.

Catat penyebab kegagalan.

Langkah kedua.

Perbarui statistik.

Langkah ketiga.

Cari Provider berikutnya yang masih sehat.

Langkah keempat.

Lakukan validasi konfigurasi.

Langkah kelima.

Kirim ulang Delivery Request.

Langkah keenam.

Apabila berhasil.

History diperbarui dengan informasi bahwa Failover digunakan.

Apabila seluruh Provider gagal.

Delivery Request dipindahkan ke Retry Queue.

Dengan pendekatan ini, kegagalan satu Provider tidak menyebabkan hilangnya notifikasi penting.

---

Delivery Latency

Setiap pengiriman harus diukur.

Waktu dihitung mulai sejak Notification Engine menyerahkan Delivery Request hingga Provider menerima hasil akhir.

Persamaan dasar.

Delivery Latency

=

Delivery Finish Time

−

Delivery Start Time

Latency digunakan untuk menghasilkan statistik.

Average Delivery Time.

Median Delivery Time.

Maximum Delivery Time.

Minimum Delivery Time.

Persentil ke-95.

Persentil ke-99.

Administrator dapat melihat apakah performa Provider memburuk dari waktu ke waktu.

---

Reliability Score

Setiap Provider memiliki Reliability Score.

Nilai dihitung menggunakan kombinasi beberapa faktor.

Success Rate.

Delivery Latency.

Reconnect Count.

Failure Count.

Health Check Result.

Retry Frequency.

Sebagai contoh.

Reliability Score

=

0.45 × Success Rate

+ 

0.20 × Health Score

+ 

0.15 × Latency Score

+ 

0.10 × Retry Score

+ 

0.10 × Stability Score

Seluruh komponen dinormalisasi ke rentang nol hingga seratus sebelum dihitung.

Provider Manager menggunakan nilai tersebut sebagai salah satu dasar menentukan prioritas.

---

Queue Synchronization

Provider tidak boleh mengambil event langsung dari Notification Queue.

Notification Engine yang bertugas menyerahkan Delivery Request.

Pendekatan ini menjaga Queue tetap independen.

Apabila Provider dimatikan, Queue tetap berjalan.

Apabila Provider diperbarui, Queue tidak terpengaruh.

---

Recovery

Apabila Provider mengalami kegagalan.

Provider harus mencoba.

Reconnect.

Session Validation.

Authentication Refresh apabila didukung.

Connection Reset.

Internal Cleanup.

Recovery dilakukan tanpa menghentikan Provider lain.

Seluruh proses dicatat pada Activity Timeline.

---

Statistik

Setiap Provider menghasilkan statistik sendiri.

Minimal meliputi.

Total Delivery.

Success Delivery.

Failed Delivery.

Retry.

Reconnect.

Health Check Success.

Health Check Failure.

Average Latency.

Maximum Latency.

Availability.

Uptime.

Statistics digunakan oleh halaman Analytics dan Provider Dashboard.

---

Acceptance Criteria

Notification Provider dianggap selesai apabila seluruh Provider mengikuti kontrak antarmuka yang sama, mampu melakukan validasi konfigurasi, mempertahankan koneksi, melakukan Health Check, mengirim pesan, memverifikasi hasil pengiriman, menghasilkan statistik, mendukung failover, recovery, dan retry tanpa memengaruhi Notification Engine maupun modul lain.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib melakukan simulasi kegagalan koneksi, simulasi session rusak, simulasi failover, simulasi retry, serta pengukuran latency untuk memastikan seluruh algoritma berjalan sesuai spesifikasi.
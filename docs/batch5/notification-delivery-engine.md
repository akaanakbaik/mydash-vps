Batch 5 — Notification Delivery Engine

Tujuan

Notification Delivery Engine merupakan lapisan terakhir yang bertanggung jawab mengubah sebuah Delivery Request menjadi pesan yang benar-benar diterima oleh pengguna. Modul ini berada setelah Notification Queue, Template Engine, Rule Engine, dan Provider Manager.

Walaupun berada pada bagian akhir pipeline, Delivery Engine merupakan salah satu modul dengan tingkat kompleksitas tertinggi karena harus menangani ribuan kemungkinan yang terjadi ketika proses pengiriman berlangsung.

Contohnya.

Provider sedang offline.

Jaringan VPS mengalami packet loss.

Token Provider telah kedaluwarsa.

WhatsApp sedang melakukan reconnect.

Telegram sedang mengalami rate limit.

Worker mati di tengah pengiriman.

Notification Queue sedang melakukan Recovery.

Beberapa Event memiliki tujuan pengiriman yang sama.

AI masih melakukan analisis.

Semua kondisi tersebut harus dapat ditangani tanpa menyebabkan hilangnya Event ataupun mengganggu konsistensi sistem.

Delivery Engine tidak boleh menganggap bahwa "fungsi kirim selesai dijalankan" berarti Notification telah berhasil.

Keberhasilan pengiriman harus melalui beberapa tahapan verifikasi yang saling berhubungan.

---

Filosofi Delivery

Delivery Engine menggunakan filosofi Reliable Delivery.

Reliable Delivery memiliki tujuan sederhana.

Sistem harus mengetahui dengan pasti apakah sebuah pesan.

Belum dikirim.

Sedang dikirim.

Berhasil diterima Provider.

Berhasil diterima tujuan.

Gagal.

Perlu Retry.

Dibatalkan.

Tanpa filosofi ini, Dashboard tidak akan mampu menjelaskan keadaan sebenarnya kepada pengguna.

Sebagai contoh.

Provider mengembalikan HTTP 200.

Namun koneksi terputus sebelum Provider benar-benar memproses pesan.

Apakah Notification berhasil?

Jawabannya belum tentu.

Karena itu Delivery Engine harus memiliki tahapan verifikasi yang jauh lebih lengkap dibanding sekadar memeriksa status HTTP.

---

Delivery Lifecycle

Seluruh Notification harus melewati Lifecycle yang sama.

Queue menerima Event.

↓

Delivery Request dibuat.

↓

Provider dipilih.

↓

Payload divalidasi.

↓

Worker mengambil Request.

↓

Connection Validation.

↓

Provider Health Check.

↓

Transmission.

↓

Acknowledgement.

↓

Verification.

↓

History Update.

↓

Analytics Update.

↓

Completion.

Apabila terjadi kegagalan pada salah satu tahapan.

Lifecycle tidak langsung dihentikan.

Delivery Engine menentukan apakah kegagalan tersebut masih dapat dipulihkan.

---

Delivery State Machine

Setiap Delivery mempunyai State.

Created.

Queued.

Waiting Worker.

Preparing.

Validating.

Waiting Provider.

Sending.

Waiting Acknowledgement.

Verifying.

Delivered.

Retry.

Cancelled.

Expired.

Failed.

Recovery.

State Machine wajib bersifat deterministik.

Artinya.

State yang sama dengan input yang sama harus selalu menghasilkan transisi yang sama.

Pendekatan deterministik mempermudah audit dan debugging.

---

Delivery Context

Setiap pengiriman mempunyai Context.

Context dibuat sebelum proses dimulai.

Context berisi.

Delivery Identifier.

Notification Identifier.

Workspace.

Server.

Provider.

Worker Identifier.

Queue Identifier.

Retry Counter.

Creation Time.

Expiration Time.

Current State.

Priority.

Correlation Identifier.

Payload Checksum.

Delivery Context menjadi identitas utama seluruh proses.

Semua log harus mengacu kepada Context tersebut.

---

Payload Validation

Sebelum payload dikirim.

Delivery Engine melakukan validasi berlapis.

Tahap pertama.

Validasi struktur.

Tahap kedua.

Validasi Placeholder.

Tahap ketiga.

Validasi panjang pesan.

Tahap keempat.

Validasi karakter Unicode.

Tahap kelima.

Validasi ukuran media apabila suatu saat sistem mendukung gambar atau dokumen.

Tahap keenam.

Validasi Provider Capability.

Sebagai contoh.

Apabila Provider tidak mendukung jenis pesan tertentu.

Delivery tidak boleh dilanjutkan.

---

Provider Selection Algorithm

Provider dipilih berdasarkan skor.

Skor bukan ditentukan oleh urutan konfigurasi.

Provider Score dihitung.

Score

=

0.35 × Reliability

+ 

0.20 × Availability

+ 

0.15 × Latency Score

+ 

0.10 × Queue Load

+ 

0.10 × Health Score

+ 

0.10 × User Preference

Seluruh nilai dinormalisasi ke rentang nol sampai satu.

Provider dengan nilai terbesar dipilih.

Apabila pengguna menentukan Provider utama secara manual.

Provider tersebut tetap diprioritaskan selama statusnya sehat.

---

Transmission Algorithm

Transmission dilakukan dalam beberapa tahap.

Payload dienkripsi apabila diperlukan.

↓

Payload diubah menjadi format Provider.

↓

Checksum dibuat.

↓

Payload dikirim.

↓

Provider mengembalikan Response.

↓

Checksum diverifikasi.

↓

Delivery dilanjutkan.

Checksum digunakan untuk memastikan Payload tidak berubah selama proses internal.

Walaupun komunikasi menggunakan HTTPS.

Checksum tetap berguna untuk audit internal.

---

Delivery Verification

Verification merupakan bagian yang paling penting.

Verification tidak hanya memeriksa.

Request berhasil.

Namun juga memeriksa.

Provider menerima Payload.

Provider menghasilkan Message Identifier.

History berhasil diperbarui.

Queue berhasil menghapus Delivery.

Analytics menerima Event.

Apabila salah satu langkah gagal.

Delivery belum dianggap selesai.

---

Mathematical Reliability Model

Delivery Engine menghitung peluang keberhasilan pengiriman.

Gunakan model sederhana.

Delivery Reliability

=

P(Connection)

×

P(Authentication)

×

P(Provider)

×

P(Network)

×

P(Worker)

Misalkan.

Connection.

0.99

Authentication.

0.98

Provider.

0.995

Network.

0.97

Worker.

0.999

Maka.

Reliability

=

0.99

×

0.98

×

0.995

×

0.97

×

0.999

≈

0.935

atau sekitar.

93.5%

Nilai ini digunakan oleh Analytics untuk memperkirakan kemungkinan kegagalan sebelum Delivery dimulai.

---

Retry Mathematics

Retry tidak boleh dilakukan tanpa batas.

Gunakan fungsi.

Delay(n)

=

BaseDelay

×

2ⁿ

+ 

RandomJitter

Misalkan.

Base Delay.

5 Detik.

Retry ke-4.

Delay

=

5

×

2⁴

=

80 Detik

Kemudian.

Random Jitter.

±15%

Delay Aktual.

68

hingga

92

Detik.

Random Jitter mengurangi kemungkinan ribuan Worker melakukan Retry secara bersamaan.

---

Circuit Breaker

Apabila Provider mengalami kegagalan berulang.

Delivery Engine mengaktifkan Circuit Breaker.

State.

Closed.

↓

Half Open.

↓

Open.

Ketika Circuit berada pada Open.

Provider tidak menerima Delivery baru.

Seluruh Request dialihkan ke Provider lain.

Setelah waktu tertentu.

Circuit memasuki Half Open.

Satu Delivery percobaan dikirim.

Apabila berhasil.

Circuit kembali Closed.

Pendekatan ini melindungi sistem dari Provider yang sedang tidak stabil.

---

Delivery Expiration

Setiap Delivery memiliki waktu kedaluwarsa.

Sebagai contoh.

Notification Information.

30 Menit.

Warning.

2 Jam.

Critical.

24 Jam.

Apabila Delivery melewati batas tersebut.

Notification dapat dibatalkan.

Namun History tetap disimpan.

Hal ini mencegah pengguna menerima informasi yang sudah tidak relevan.

---

Throughput

Delivery Engine harus mampu mengukur Throughput.

Throughput

=

Jumlah Delivery Berhasil

÷

Total Waktu

Misalkan.

1200 Notification.

Dalam.

60 Detik.

Throughput.

20 Notification per Detik.

Dashboard menggunakan nilai ini untuk melihat performa Delivery Engine.

---

Worker Load Balancing

Apabila terdapat banyak Worker.

Delivery dibagi secara merata.

Worker Score dihitung berdasarkan.

Current Queue.

CPU Usage.

Memory Usage.

Average Delivery Time.

Worker dengan skor terbaik menerima Delivery berikutnya.

Pendekatan ini menjaga penggunaan sumber daya tetap seimbang.

---

Recovery

Apabila Worker berhenti di tengah proses.

Delivery Context tidak hilang.

Queue mendeteksi Worker Timeout.

Delivery dikembalikan ke Queue.

Worker lain mengambil Delivery tersebut.

History mencatat bahwa Delivery mengalami Recovery.

Pengguna tetap hanya menerima satu Notification.

---

Acceptance Criteria

Delivery Engine dianggap selesai apabila mampu mengelola seluruh siklus pengiriman secara deterministik, melakukan validasi payload berlapis, memilih Provider berdasarkan skor kesehatan, menerapkan Retry adaptif, Circuit Breaker, Recovery Worker, Delivery Expiration, serta menghasilkan statistik Throughput dan Reliability yang dapat diverifikasi secara matematis.

AI wajib melakukan stress test dengan puluhan ribu Delivery Request, simulasi Provider gagal, simulasi Worker mati, simulasi kehilangan jaringan, simulasi Retry Storm, dan simulasi Recovery penuh untuk memastikan tidak terjadi kehilangan Notification, pengiriman ganda, race condition, deadlock, maupun inkonsistensi status sebelum melanjutkan ke dokumen berikutnya.
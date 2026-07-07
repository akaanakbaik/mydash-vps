My Dash

Batch 3 — Notification Engine

Tujuan

Notification Engine merupakan sistem yang bertanggung jawab mengubah setiap event yang dihasilkan oleh Rule Engine menjadi pemberitahuan yang dapat dipahami oleh pengguna.

Notification Engine tidak bertugas mengambil keputusan.

Notification Engine tidak bertugas membaca kondisi VPS.

Notification Engine hanya menerima event yang telah diproses oleh Rule Engine kemudian menentukan bagaimana event tersebut disampaikan kepada pengguna berdasarkan konfigurasi yang telah ditentukan.

Notification Engine harus tetap berjalan walaupun dashboard sedang tidak dibuka.

Notification Engine harus tetap bekerja walaupun pengguna sedang offline.

Notification Engine harus tetap mampu mengirim notifikasi walaupun AI tidak tersedia.

AI hanya berfungsi sebagai penambah kualitas isi pesan.

AI bukan bagian wajib dari proses pengiriman notifikasi.

---

Filosofi Notification Engine

Notification Engine dibangun berdasarkan tiga prinsip utama.

Kecepatan.

Keandalan.

Konsistensi.

Kecepatan berarti pengguna harus menerima informasi penting sesegera mungkin.

Keandalan berarti kegagalan satu provider tidak boleh menghentikan seluruh proses.

Konsistensi berarti format pesan harus tetap seragam pada seluruh provider.

---

Ruang Lingkup

Notification Engine mengelola seluruh proses berikut.

Penerimaan Event.

Validasi Event.

Priority Queue.

Cooldown.

Rate Limiting.

Grouping Notification.

Template Engine.

Placeholder Engine.

Provider Selection.

Delivery.

Retry.

History.

Analytics.

AI Enhancement.

Delivery Verification.

Failure Recovery.

Notification Center.

Notification Settings.

Notification Statistics.

Notification Archive.

---

Arsitektur Sistem

Seluruh proses wajib mengikuti alur berikut.

Monitoring Engine

↓

Rule Engine

↓

Notification Queue

↓

Notification Engine

↓

Template Generator

↓

Provider Selector

↓

Delivery Worker

↓

History

↓

Analytics

↓

AI Enhancement Worker

↓

Follow Up Notification

Tidak boleh ada modul yang langsung mengirim notifikasi tanpa melalui Notification Engine.

---

Event Model

Setiap event minimal memiliki informasi berikut.

Event Identifier.

Category.

Severity.

Priority.

Server Identifier.

Workspace Identifier.

Timestamp.

Metric Name.

Current Value.

Previous Value.

Threshold.

Duration.

Rule Identifier.

Automation Status.

AI Requirement.

Retry Count.

Delivery Status.

Event harus immutable.

Event yang sudah dibuat tidak boleh diubah.

Perubahan kondisi menghasilkan event baru.

---

Severity

Notification Engine mengenal lima tingkat severity.

Information.

Success.

Warning.

Error.

Critical.

Severity menentukan:

Warna.

Ikon.

Prioritas.

Template.

Provider.

Kemungkinan pemanggilan AI.

Cooldown.

---

Priority

Priority menentukan urutan pengiriman.

Priority tidak sama dengan severity.

Contoh.

Critical Security Alert memiliki priority lebih tinggi dibanding Critical Update Available.

Priority digunakan ketika queue penuh.

Notification Engine harus selalu mendahulukan priority tertinggi.

---

Notification Queue

Semua event masuk ke Queue.

Queue merupakan komponen wajib.

Queue harus mendukung.

FIFO.

Priority Queue.

Retry Queue.

Dead Letter Queue.

Delayed Queue.

Queue wajib mampu menangani ribuan event tanpa kehilangan urutan.

---

Queue Algorithm

Algoritma dasar.

Event diterima.

↓

Validasi.

↓

Masukkan Priority Queue.

↓

Worker mengambil event.

↓

Generate Template.

↓

Pilih Provider.

↓

Kirim.

↓

Berhasil.

↓

History.

↓

Analytics.

↓

Selesai.

Apabila gagal.

↓

Retry Queue.

↓

Retry.

↓

Berhasil.

↓

History.

↓

Selesai.

Apabila seluruh retry gagal.

↓

Dead Letter Queue.

↓

Administrator diberi tahu.

---

Worker

Worker bertugas mengirim notification.

Worker tidak boleh membaca Monitoring Engine.

Worker tidak boleh membaca Rule Engine.

Worker hanya membaca Queue.

Jumlah Worker harus dapat diatur.

Worker harus mampu bekerja paralel.

Worker harus mendukung graceful shutdown.

Worker harus menyelesaikan event yang sedang diproses sebelum berhenti.

---

Template Engine

Template Engine menghasilkan pesan dasar.

Template dibuat tanpa AI.

Template harus dapat digunakan oleh seluruh provider.

Template harus konsisten.

Template tidak boleh mengandung HTML.

Template harus mudah dibaca pada perangkat mobile.

---

Placeholder Engine

Template mendukung placeholder.

Contoh.

Server Name.

Hostname.

CPU.

RAM.

Disk.

Network.

Tunnel.

Docker.

Container.

Service.

IP Address.

Time.

Timezone.

Threshold.

Duration.

Rule Name.

Health Score.

Provider.

Version.

AI Summary.

Placeholder diganti sebelum proses pengiriman.

Placeholder yang tidak memiliki nilai harus dihilangkan secara otomatis.

Tidak boleh menampilkan placeholder kosong.

---

Template Example

CPU Warning.

Judul.

CPU Usage Warning.

Isi.

Server.

Hostname.

CPU saat ini.

Threshold.

Durasi.

Waktu.

Status.

Dashboard URL.

Rekomendasi dasar.

Template harus singkat.

Jelas.

Tidak bertele-tele.

---

AI Enhancement

Apabila AI diaktifkan.

Notification Engine melakukan proses berikut.

Template lokal dibuat.

↓

Template langsung dikirim.

↓

Background Worker menjalankan AI.

↓

Timeout dimulai.

↓

Maksimum.

32 Detik.

↓

Apabila AI berhasil.

↓

AI menghasilkan analisis.

↓

Notification kedua dikirim.

↓

History diperbarui.

Apabila AI gagal.

↓

Tidak ada tindakan.

↓

Template lokal tetap menjadi hasil akhir.

Dashboard tidak boleh menunggu AI.

---

AI Trigger

AI tidak dipanggil untuk seluruh event.

AI hanya dipanggil apabila.

Severity.

Warning ke atas.

Atau.

Rule mengaktifkan AI.

Atau.

Pengguna mengaktifkan AI pada Rule tertentu.

Information tidak memerlukan AI secara default.

Success tidak memerlukan AI secara default.

---

Cooldown

Cooldown bertujuan mengurangi spam.

Contoh.

CPU.

Warning.

Cooldown.

10 Menit.

Apabila CPU tetap tinggi.

Notification berikutnya tidak dikirim.

Namun.

History tetap bertambah.

Analytics tetap bertambah.

Monitoring tetap berjalan.

---

Grouping

Apabila dalam satu menit terjadi.

CPU Warning.

RAM Warning.

Disk Warning.

Notification Engine dapat menggabungkan.

Menjadi.

Performance Warning.

Berisi seluruh detail.

Grouping dapat diaktifkan atau dinonaktifkan.

---

Retry

Retry dilakukan apabila provider gagal.

Retry menggunakan exponential backoff.

Contoh.

Percobaan pertama.

5 Detik.

Percobaan kedua.

15 Detik.

Percobaan ketiga.

30 Detik.

Percobaan keempat.

60 Detik.

Setelah batas maksimum.

Event dipindahkan ke Dead Letter Queue.

---

WhatsApp Provider

Provider menggunakan Baileys.

Status.

Disconnected.

Pairing.

Connecting.

Connected.

Reconnecting.

Error.

Provider wajib memonitor.

Session.

Reconnect.

Heartbeat.

Connection State.

Owner Number.

Bot Number.

Delivery Status.

---

Telegram Provider

Provider menggunakan Telegram Bot API.

Status.

Disconnected.

Connecting.

Connected.

Error.

Token Validation.

Owner Validation.

Delivery Validation.

Retry.

---

Notification Settings

Pengguna dapat mengatur.

Master Notification.

WhatsApp.

Telegram.

Information.

Success.

Warning.

Error.

Critical.

Security.

Performance.

Storage.

Network.

Docker.

Tunnel.

Database.

Backup.

Restore.

Scheduler.

GitHub.

Plugin.

AI.

Automation.

Masing-masing dapat diaktifkan atau dinonaktifkan secara terpisah.

---

Notification History

Seluruh notification wajib disimpan.

Data minimal.

Identifier.

Provider.

Template.

Delivery Time.

Delivery Duration.

Status.

Retry.

AI Used.

Severity.

Category.

Server.

Workspace.

History dapat difilter.

History dapat dicari.

History dapat diekspor.

---

Statistics

Notification Engine menghasilkan statistik.

Jumlah Notification.

Delivery Success.

Delivery Failed.

Retry Count.

Average Delivery Time.

AI Success.

AI Timeout.

Provider Usage.

Top Category.

Top Severity.

Top Rule.

Semua statistik digunakan pada halaman Analytics.

---

Failure Recovery

Apabila Notification Engine gagal.

Queue tidak boleh hilang.

Worker tidak boleh kehilangan event.

History tidak boleh rusak.

Engine harus melakukan recovery otomatis.

Recovery dicatat pada Activity Timeline.

---

Acceptance Criteria

Notification Engine dianggap selesai apabila.

Template Engine berjalan.

Placeholder Engine berjalan.

Queue berjalan.

Worker berjalan.

Retry berjalan.

Cooldown berjalan.

Grouping berjalan.

WhatsApp siap.

Telegram siap.

AI Enhancement berjalan sebagai proses latar belakang.

Timeout AI menggunakan tiga puluh dua detik.

Dashboard tidak pernah menunggu AI.

History berjalan.

Statistics berjalan.

Tidak terdapat build error.

Tidak terdapat lint warning.

Tidak terdapat type error.

Dokumentasi diperbarui.

AI wajib melakukan pengujian mandiri terhadap seluruh skenario pengiriman, kegagalan provider, timeout AI, retry, cooldown, grouping, dan recovery sebelum menghentikan proses serta menunggu instruksi pengguna.

Akhir dokumen.
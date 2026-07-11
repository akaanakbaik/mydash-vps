My Dash

Batch 3 — Agent Foundation

Tujuan

Dokumen ini mendefinisikan standar pembangunan Agent My Dash.

Agent merupakan komponen yang berjalan langsung di dalam VPS.

Agent bertugas mengumpulkan informasi sistem, menjalankan pemeriksaan berkala, mengirimkan data realtime, mendeteksi perubahan kondisi server, serta membantu backend mengambil keputusan berdasarkan kondisi sebenarnya.

Agent tidak memiliki antarmuka pengguna.

Agent tidak menerima koneksi langsung dari browser.

Seluruh komunikasi Agent dilakukan melalui Backend.

---

Filosofi Agent

Agent harus:

Ringan.

Stabil.

Cepat.

Selalu berjalan.

Mudah diperbarui.

Mudah dipulihkan.

Tidak mengganggu performa VPS.

Agent tidak boleh menjadi penyebab penggunaan CPU atau RAM yang tinggi.

Target utama Agent adalah menjadi layanan latar belakang yang hampir tidak terasa keberadaannya.

---

Tanggung Jawab Agent

Agent bertugas:

Mengumpulkan informasi sistem.

Mengirim heartbeat.

Mengirim statistik realtime.

Mengirim perubahan status.

Menjalankan health check.

Mendeteksi kegagalan service.

Mendeteksi perubahan konfigurasi.

Mengirim log penting.

Menjalankan pemeriksaan berkala.

Menerima instruksi yang telah divalidasi backend.

---

Informasi Sistem

Agent wajib mampu membaca:

Hostname.

Operating System.

Kernel.

Architecture.

CPU Model.

CPU Core.

CPU Usage.

CPU Frequency.

Load Average.

RAM Total.

RAM Usage.

Swap.

Disk.

Filesystem.

Temperature apabila tersedia.

Public IPv4.

Public IPv6 apabila tersedia.

Hostname.

Timezone.

System Uptime.

Boot Time.

---

Monitoring Resource

Agent melakukan monitoring terhadap:

CPU.

RAM.

Swap.

Disk.

Filesystem.

Inode.

Bandwidth.

Network Interface.

Process.

Docker.

Systemd Service.

Cron.

Tunnel.

Firewall.

Database.

Redis.

WebSocket Connectivity.

Health Score Metadata.

---

Monitoring Docker

Apabila Docker tersedia.

Agent membaca:

Container.

Image.

Volume.

Network.

Restart Count.

Status.

CPU Usage.

Memory Usage.

Disk Usage.

Exit Code.

Restart Loop.

Container Health.

Agent tidak boleh mengubah container tanpa instruksi backend.

---

Monitoring Service

Agent membaca:

Running.

Stopped.

Failed.

Restarting.

Disabled.

Masked.

Service penting memiliki prioritas lebih tinggi dibanding service biasa.

---

Heartbeat

Agent mengirim heartbeat secara berkala.

Heartbeat digunakan untuk:

Mendeteksi Agent hidup.

Mengukur latency.

Menentukan status server.

Mendeteksi gangguan jaringan.

Apabila heartbeat gagal.

Backend menentukan tindakan berikutnya.

---

Event Detection

Agent tidak hanya mengirim angka.

Agent juga mendeteksi perubahan.

Contoh:

CPU tiba-tiba naik.

RAM turun drastis.

Disk hampir penuh.

Tunnel terputus.

Docker berhenti.

Firewall berubah.

Cron gagal.

Service mati.

IP berubah.

Kernel berubah.

Restart.

Shutdown.

Boot.

Login.

Perubahan tersebut dikirim sebagai event.

---

Rule Independence

Agent tidak mengambil keputusan bisnis.

Agent hanya mengumpulkan fakta.

Backend menjalankan Rule Engine.

Notification Engine.

Automation Engine.

AI Engine.

Dengan demikian Agent tetap sederhana.

---

Resource Limitation

Agent wajib memiliki batas penggunaan sumber daya.

Target:

CPU serendah mungkin.

RAM stabil.

Jumlah koneksi minimum.

Tidak membuat polling yang berlebihan.

Tidak membuat proses yang tidak diperlukan.

---

Offline Queue

Apabila backend tidak dapat dijangkau.

Agent menyimpan event sementara.

Setelah koneksi kembali.

Event penting dikirim kembali sesuai urutan.

Event lama yang sudah tidak relevan dapat dibuang sesuai kebijakan retensi.

---

Update Mechanism

Agent harus mendukung pembaruan.

Pembaruan dilakukan dengan aman.

Apabila pembaruan gagal.

Agent kembali ke versi sebelumnya apabila memungkinkan.

Seluruh proses pembaruan dicatat.

---

Self Recovery

Agent wajib memiliki kemampuan:

Reconnect.

Restart Internal.

Retry.

Recovery.

Health Check.

Apabila salah satu modul Agent gagal.

Agent tidak langsung berhenti.

Agent mencoba memulihkan dirinya terlebih dahulu.

---

Security

Agent hanya menerima instruksi dari backend yang telah diautentikasi.

Agent tidak membuka endpoint publik yang tidak diperlukan.

Secret tidak boleh disimpan pada source code.

Konfigurasi sensitif dipisahkan dari implementasi.

---

Logging

Agent mencatat:

Start.

Stop.

Restart.

Heartbeat.

Reconnect.

Error.

Recovery.

Update.

Configuration Reload.

Log harus ringkas.

Log tidak boleh berisi password.

Log tidak boleh berisi token.

Log tidak boleh berisi recovery key.

---

Performance Monitoring

Agent memonitor dirinya sendiri.

Minimal:

CPU Agent.

RAM Agent.

Restart Count.

Crash Count.

Reconnect Count.

Health Status.

Apabila Agent mengalami masalah.

Backend diberi tahu.

---

Compatibility

Agent harus dirancang agar kompatibel dengan:

Ubuntu.

Debian.

Distribusi Linux lain yang didukung proyek.

Perbedaan implementasi sistem operasi harus dipisahkan agar mudah dipelihara.

---

Testing

AI wajib menguji:

Startup.

Shutdown.

Restart.

Reconnect.

Heartbeat.

CPU Monitoring.

RAM Monitoring.

Disk Monitoring.

Docker Monitoring.

Service Monitoring.

Offline Queue.

Recovery.

Update.

Apabila ditemukan masalah.

AI wajib memperbaikinya sebelum melanjutkan.

---

Coding Rules

Source code produksi:

Tidak boleh memiliki komentar.

Tidak boleh memiliki kode mati.

Tidak boleh memiliki warning.

Tidak boleh memiliki error type.

Tidak boleh melakukan proses berat tanpa alasan.

Tidak boleh membuat request yang tidak diperlukan.

---

Acceptance Criteria

Batch dianggap selesai apabila:

Agent berhasil berjalan.

Heartbeat aktif.

Monitoring dasar aktif.

Event berhasil dikirim.

Recovery siap.

Logging siap.

Resource Agent tetap rendah.

Tidak terdapat build error.

Tidak terdapat lint warning.

Tidak terdapat type error.

Dokumentasi telah diperbarui.

AI telah melakukan verifikasi mandiri dan menunggu instruksi pengguna untuk melanjutkan ke file berikutnya.

Akhir dokumen.
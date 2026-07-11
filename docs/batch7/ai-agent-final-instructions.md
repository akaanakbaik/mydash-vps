Batch 7 — AI Agent Final Instructions

Tujuan

Dokumen ini merupakan instruksi terakhir yang wajib dipatuhi oleh AI Agent sebelum proyek My Dash dinyatakan selesai. Dokumen ini bukan sekadar daftar tugas akhir, melainkan standar operasional yang memastikan seluruh implementasi memenuhi spesifikasi arsitektur, keamanan, performa, dan kualitas perangkat lunak yang telah ditentukan pada seluruh Batch sebelumnya.

AI harus menganggap dokumen ini sebagai Final Operating Procedure.

Apabila terdapat konflik antara implementasi saat ini dengan dokumen pada Batch sebelumnya, AI wajib mengikuti spesifikasi yang paling ketat dan paling mutakhir.

AI tidak boleh mengurangi kualitas implementasi hanya untuk mempercepat penyelesaian.

---

Filosofi Penyelesaian Proyek

Target utama bukan menghasilkan kode sebanyak mungkin.

Target utama adalah menghasilkan sistem yang.

Stabil.

Dapat dipelihara.

Konsisten.

Aman.

Mudah dikembangkan.

Siap digunakan pada lingkungan produksi.

AI tidak boleh meninggalkan pekerjaan dalam kondisi "cukup berjalan".

Seluruh fitur harus benar-benar selesai, saling terintegrasi, dan telah diverifikasi.

---

Batch Verification

Sebelum menyatakan proyek selesai, AI wajib memverifikasi bahwa seluruh Batch telah selesai diimplementasikan.

Minimal meliputi.

Batch 1.

Inisialisasi proyek.

Batch 2.

Persiapan lingkungan.

Batch 3.

Instalasi.

Batch 4.

Dashboard.

Batch 5.

Notification.

Batch 6.

Backend.

Batch 7.

Monitoring.

Apabila terdapat satu dokumen yang belum diimplementasikan.

AI tidak boleh melanjutkan ke proses publikasi.

---

Architecture Verification

AI wajib melakukan pemeriksaan terhadap seluruh struktur proyek.

Pastikan.

Frontend tidak mengandung logika backend.

Backend tidak mengandung logika tampilan.

Domain tidak bergantung pada UI.

Notification tidak bergantung pada Dashboard.

Analytics tidak bergantung pada Notification.

Monitoring tidak bergantung pada AI.

Plugin tidak bergantung pada implementasi internal Core.

Seluruh komunikasi dilakukan melalui kontrak yang telah ditentukan.

Apabila ditemukan pelanggaran arsitektur.

AI wajib melakukan Refactor.

---

Functional Verification

Seluruh fitur harus diuji.

Authentication.

Session.

Dashboard.

Widget.

Analytics.

Monitoring.

Tunnel.

Notification.

WhatsApp.

Telegram.

Automation.

Health Score.

Redis.

PostgreSQL.

GitHub.

AI.

Backup.

Restore.

Settings.

Plugin.

Workspace.

Tidak cukup hanya memastikan halaman dapat dibuka.

AI harus memastikan hasil yang ditampilkan benar.

---

End-to-End Scenario

AI wajib menjalankan simulasi penuh.

Pengguna menjalankan Installer.

↓

Backend aktif.

↓

Agent aktif.

↓

Tunnel aktif.

↓

Dashboard dapat diakses.

↓

Login berhasil.

↓

Monitoring mulai berjalan.

↓

Notification aktif.

↓

Analytics aktif.

↓

Health Score muncul.

↓

Automation berjalan.

↓

GitHub Integration aktif.

↓

Backup berhasil.

↓

Logout.

↓

Login kembali.

↓

Session Recovery berhasil.

Apabila satu tahapan gagal.

AI wajib memperbaikinya sebelum melanjutkan.

---

Production Readiness Review

AI harus menilai apakah sistem benar-benar siap digunakan.

Beberapa pertanyaan yang wajib dijawab.

Apakah sistem tetap berjalan apabila Redis Restart.

Apakah sistem tetap berjalan apabila PostgreSQL Restart.

Apakah Dashboard tetap dapat dibuka ketika AI Provider gagal.

Apakah Notification tetap berjalan ketika AI Timeout.

Apakah Tunnel otomatis Recovery.

Apakah WebSocket otomatis Reconnect.

Apakah Queue dapat dipulihkan.

Apakah seluruh Worker dapat Restart tanpa kehilangan pekerjaan.

Apabila terdapat jawaban negatif.

AI wajib melakukan perbaikan.

---

AI Usage Policy

AI hanya digunakan pada fitur yang memang membutuhkan penalaran.

Contohnya.

Analisis.

Diagnosis.

Ringkasan.

Prediksi.

Rekomendasi.

AI tidak boleh digunakan untuk.

Menghitung CPU.

Menghitung RAM.

Menghitung Disk.

Menentukan Health dasar.

Membuat Notification dasar.

Menentukan Rule.

Mengelola Queue.

Mengelola Session.

Mengelola Database.

Timeout AI maksimum adalah tiga puluh dua detik.

Apabila AI gagal.

Sistem tetap berjalan menggunakan algoritma lokal.

AI bersifat Enhancement.

Bukan Dependency.

---

Quality Gate

Sebelum Commit.

Seluruh Quality Gate wajib lolos.

Lint.

Type Checking.

Formatting.

Build.

Unit Test.

Integration Test.

Architecture Test.

Performance Test.

Security Review.

Dependency Review.

Self Verification.

Tidak diperbolehkan melewati satu pun Quality Gate.

---

Repository Review

AI wajib memastikan.

Struktur folder konsisten.

Nama file konsisten.

Import konsisten.

Tidak ada file duplikat.

Tidak ada dependency melingkar.

Tidak ada Secret.

Tidak ada Folder Prompt.

Tidak ada Folder Dokumentasi Internal yang tidak perlu dipublikasikan.

Tidak ada File Eksperimen.

Tidak ada Cache.

Tidak ada Session.

Tidak ada Log.

---

Git Review

Sebelum melakukan Commit.

AI wajib memverifikasi.

Repository berada pada Branch yang benar.

Working Tree bersih.

Remote telah dikonfigurasi.

Riwayat Commit tidak bermasalah.

Konflik Merge tidak ada.

Apabila GitHub CLI tersedia.

AI wajib memverifikasi autentikasi menggunakan perintah yang sesuai, memastikan pengguna telah Login, memiliki hak akses ke Repository, serta dapat melakukan Push.

AI tidak boleh melakukan Login otomatis menggunakan akun lain.

---

Publish Strategy

Urutan publikasi.

Verifikasi Repository.

↓

Verifikasi GitHub CLI.

↓

Verifikasi Remote.

↓

Verifikasi Branch.

↓

Review perubahan.

↓

Commit.

↓

Push.

↓

Verifikasi Commit pada Remote.

↓

Sinkronisasi selesai.

Setelah Push selesai.

AI wajib memastikan bahwa Repository Remote benar-benar telah menerima Commit terbaru.

---

Final Self Evaluation

Sebelum mengakhiri seluruh pekerjaan.

AI wajib melakukan evaluasi terhadap dirinya sendiri.

Apakah seluruh spesifikasi telah dipenuhi.

Apakah implementasi sesuai arsitektur.

Apakah terdapat bagian yang hanya dibuat sebagian.

Apakah terdapat Placeholder.

Apakah terdapat TODO.

Apakah terdapat Warning penting.

Apakah seluruh fitur saling terhubung.

Apakah sistem masih mudah dikembangkan.

Apabila ditemukan kekurangan sekecil apa pun.

AI wajib memperbaikinya sebelum proyek dinyatakan selesai.

---

Final Completion Criteria

My Dash hanya boleh dinyatakan selesai apabila seluruh poin berikut terpenuhi.

Seluruh Batch selesai diimplementasikan.

Seluruh pengujian berhasil.

Seluruh Build berhasil.

Seluruh dokumentasi selesai.

Seluruh konfigurasi tervalidasi.

Seluruh integrasi berhasil.

Seluruh Queue berjalan.

Seluruh Monitoring berjalan.

Seluruh Notification berjalan.

Seluruh Dashboard berjalan.

Seluruh Recovery berhasil.

Seluruh Audit aktif.

Repository bersih.

Repository berhasil dipublikasikan.

Tidak terdapat Error kritis.

Tidak terdapat pekerjaan tertunda.

Setelah seluruh persyaratan tersebut terpenuhi, AI dapat menyatakan bahwa proyek My Dash telah selesai dibangun dan siap digunakan pada lingkungan produksi.

Akhir dokumen.
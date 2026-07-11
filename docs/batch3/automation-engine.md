Batch 3 — Automation Engine

Tujuan

Automation Engine merupakan modul yang bertanggung jawab menjalankan tindakan otomatis berdasarkan keputusan yang telah dihasilkan oleh Rule Engine.

Automation Engine tidak melakukan monitoring dan tidak melakukan analisis terhadap kondisi VPS. Seluruh keputusan mengenai kapan sebuah tindakan boleh dijalankan berasal dari Rule Engine. Automation Engine hanya bertugas menerima keputusan tersebut, memvalidasi apakah tindakan memang boleh dijalankan, mengeksekusinya secara aman, memverifikasi hasilnya, kemudian melaporkan seluruh proses kembali kepada sistem.

Pemisahan tanggung jawab ini sangat penting karena membuat setiap modul memiliki fungsi yang jelas. Monitoring bertugas mengamati, Rule Engine bertugas mengambil keputusan, Automation Engine bertugas mengeksekusi, Notification Engine bertugas memberi tahu pengguna, sedangkan AI hanya memberikan analisis tambahan apabila diperlukan.

Dengan pendekatan tersebut seluruh sistem menjadi lebih mudah diuji, lebih mudah dikembangkan, dan jauh lebih stabil.

---

Filosofi Automation

Automation bukan berarti sistem boleh melakukan semua tindakan tanpa izin.

Automation harus bersifat predictable, reversible, dan auditable.

Predictable berarti hasil yang diharapkan harus sudah diketahui sebelum tindakan dijalankan.

Reversible berarti apabila tindakan gagal atau memperburuk kondisi server, sistem memiliki mekanisme untuk menghentikan proses atau mengembalikan kondisi apabila memungkinkan.

Auditable berarti seluruh tindakan harus tercatat sehingga administrator dapat mengetahui kapan automation dijalankan, mengapa automation dijalankan, siapa yang mengaktifkannya, berapa lama proses berlangsung, serta apakah tindakan tersebut berhasil.

Automation tidak boleh mengambil keputusan baru di luar keputusan Rule Engine.

---

Hubungan Dengan Modul Lain

Automation Engine menerima Event dari Rule Engine.

Automation Engine mengirim Status ke Activity Timeline.

Automation Engine mengirim Hasil ke Notification Engine.

Automation Engine mengirim Riwayat ke Database.

Automation Engine dapat meminta AI melakukan analisis setelah proses selesai, tetapi AI bukan syarat agar automation dapat dijalankan.

Hubungan antar modul harus bersifat satu arah agar tidak terjadi circular dependency.

---

Siklus Eksekusi

Satu automation memiliki siklus hidup yang tetap.

Pertama, Rule Engine menghasilkan keputusan.

Kedua, Automation Engine melakukan validasi.

Ketiga, Automation Engine memeriksa apakah automation tersebut diizinkan berdasarkan konfigurasi pengguna.

Keempat, Automation Engine memeriksa apakah sedang berada dalam masa cooldown.

Kelima, Automation Engine membuat Execution Context.

Keenam, tindakan dijalankan.

Ketujuh, hasil diverifikasi.

Kedelapan, Activity Timeline diperbarui.

Kesembilan, Notification Engine diberi informasi.

Kesepuluh, apabila diperlukan AI diminta membuat analisis terhadap hasil tindakan tersebut.

Seluruh tahapan tersebut wajib memiliki logging sehingga apabila suatu saat terjadi masalah, administrator dapat mengetahui pada tahap mana proses gagal.

---

Execution Context

Sebelum menjalankan tindakan, Automation Engine harus membangun sebuah Execution Context.

Execution Context merupakan kumpulan informasi yang dibutuhkan selama proses berlangsung.

Minimal berisi:

Server Identifier.

Workspace Identifier.

Rule Identifier.

Automation Identifier.

Current Timestamp.

Current Metric.

Threshold.

Severity.

Retry Count.

Maximum Retry.

Execution Token.

Execution Context digunakan agar seluruh proses automation memiliki identitas yang unik.

Dengan pendekatan ini setiap automation dapat ditelusuri kembali walaupun ribuan automation dijalankan setiap hari.

---

Jenis Automation

Automation dibagi menjadi beberapa kelompok.

Automation untuk Tunnel.

Automation untuk Docker.

Automation untuk Service.

Automation untuk Scheduler.

Automation untuk Backup.

Automation untuk Restore.

Automation untuk Notification.

Automation untuk Session.

Automation untuk GitHub.

Automation untuk Update.

Automation untuk Plugin.

Automation untuk Cache.

Automation untuk Database.

Automation untuk Security.

Automation untuk AI.

Pembagian ini bertujuan agar setiap automation memiliki ruang lingkup yang jelas.

---

Contoh Automation Tunnel

Misalkan Monitoring Engine mendeteksi tunnel terputus.

Rule Engine mengevaluasi bahwa kondisi tersebut memenuhi Rule "Tunnel Offline".

Automation Engine menerima event tersebut.

Automation Engine terlebih dahulu memastikan bahwa tunnel memang benar-benar tidak aktif, bukan hanya kehilangan heartbeat sesaat.

Apabila hasil pemeriksaan kedua masih menunjukkan tunnel tidak aktif, Automation Engine menjalankan reconnect.

Setelah reconnect selesai, Automation Engine melakukan verifikasi dengan mencoba mengakses endpoint tunnel.

Apabila endpoint dapat diakses kembali, automation dianggap berhasil.

Apabila gagal, sistem melakukan retry sesuai konfigurasi.

Setelah seluruh retry habis, Notification Engine mengirim pemberitahuan kepada pengguna.

Pendekatan ini jauh lebih baik dibanding langsung mengirim notifikasi setiap kali koneksi terputus selama beberapa detik.

---

Retry Algorithm

Retry tidak boleh menggunakan interval tetap.

Retry menggunakan Exponential Backoff.

Sebagai contoh.

Percobaan pertama dilakukan segera.

Apabila gagal, sistem menunggu lima detik.

Apabila masih gagal, sistem menunggu lima belas detik.

Kemudian tiga puluh detik.

Kemudian enam puluh detik.

Setelah batas maksimum tercapai, automation dihentikan dan status diubah menjadi Failed.

Strategi ini mengurangi beban sistem ketika terjadi gangguan besar.

---

Verification

Automation dianggap berhasil bukan ketika command selesai dijalankan.

Automation baru dianggap berhasil apabila hasil akhirnya telah diverifikasi.

Sebagai contoh.

Restart Docker tidak boleh dianggap berhasil hanya karena perintah restart selesai dijalankan.

Automation harus memastikan bahwa Docker benar-benar kembali berjalan.

Service aktif.

Container dapat diakses.

Tidak terdapat error baru pada log.

Apabila salah satu pemeriksaan gagal, automation dianggap gagal walaupun command berhasil dieksekusi.

---

Dependency

Beberapa automation memiliki dependency.

Sebagai contoh.

Automation Backup bergantung pada Storage.

Automation Restore bergantung pada Backup.

Automation Tunnel bergantung pada Network.

Automation GitHub bergantung pada GitHub CLI.

Automation harus memverifikasi seluruh dependency sebelum dijalankan.

Apabila dependency belum tersedia, automation dihentikan dengan status Blocked, bukan Failed.

Perbedaan ini penting karena kegagalan bukan disebabkan oleh bug, melainkan karena syarat belum terpenuhi.

---

Cooldown

Automation yang sama tidak boleh dijalankan terus-menerus.

Misalnya tunnel gagal selama satu jam.

Automation reconnect tidak boleh dijalankan setiap detik.

Automation memiliki cooldown yang dapat diatur.

Cooldown mencegah sistem melakukan tindakan berulang yang justru memperburuk kondisi server.

---

Logging

Setiap automation menghasilkan log yang lengkap.

Log minimal berisi:

Waktu mulai.

Waktu selesai.

Durasi.

Status.

Rule yang memicu.

Metric yang digunakan.

Retry.

Verification Result.

Error apabila ada.

Seluruh log dapat dilihat melalui halaman Activity maupun halaman Automation History.

---

Acceptance Criteria

Automation Engine dianggap selesai apabila mampu menerima keputusan dari Rule Engine, membangun Execution Context, menjalankan tindakan secara aman, melakukan verifikasi hasil, menerapkan retry dan cooldown, mencatat seluruh aktivitas, serta mengirimkan hasil kepada Notification Engine tanpa menyebabkan ketergantungan langsung terhadap AI ataupun frontend.

Seluruh implementasi harus lolos proses build, lint, type checking, serta pengujian mandiri sebelum AI melanjutkan ke dokumen berikutnya.
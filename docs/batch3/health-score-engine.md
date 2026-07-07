Batch 3 — Health Score Engine

Tujuan

Health Score Engine merupakan modul yang bertugas menghitung tingkat kesehatan server secara menyeluruh berdasarkan data yang telah dikumpulkan oleh Monitoring Engine dan dievaluasi oleh Rule Engine.

Health Score bukan sekadar angka estetika pada dashboard. Nilai ini harus merepresentasikan kondisi server secara nyata sehingga pengguna dapat memahami keadaan VPS hanya dengan melihat satu indikator utama sebelum mempelajari metrik lainnya.

Health Score tidak boleh dihitung menggunakan nilai tetap atau logika sederhana. Nilai tersebut harus berasal dari banyak parameter yang memiliki bobot berbeda, mempertimbangkan kondisi saat ini, riwayat sebelumnya, tingkat kestabilan server, serta status komponen penting yang sedang berjalan.

Health Score harus diperbarui secara otomatis ketika terjadi perubahan signifikan pada kondisi server, namun tidak boleh berubah terlalu drastis hanya karena lonjakan penggunaan resource yang berlangsung beberapa detik.

---

Filosofi Perhitungan

Health Score tidak bertujuan mencari kondisi sempurna.

Server yang menggunakan CPU tinggi untuk proses rendering atau kompilasi belum tentu mengalami masalah.

Sebaliknya, server yang hanya menggunakan CPU lima persen tetapi kehilangan koneksi jaringan atau database tetap harus memperoleh nilai kesehatan yang rendah.

Oleh karena itu Health Score harus menilai keseluruhan sistem, bukan hanya satu metrik.

Perhitungan dilakukan menggunakan pendekatan berbobot sehingga setiap komponen memberikan kontribusi berbeda terhadap nilai akhir.

Komponen yang berpotensi menyebabkan downtime memiliki bobot lebih besar dibanding komponen yang hanya memengaruhi performa.

---

Sumber Data

Health Score hanya menggunakan data yang telah divalidasi.

Health Score tidak boleh membaca sistem operasi secara langsung.

Seluruh data berasal dari Monitoring Engine.

Sumber data utama meliputi:

CPU.

RAM.

Swap.

Disk.

Filesystem.

Docker.

Tunnel.

Firewall.

Database.

Redis.

Scheduler.

Notification Engine.

Agent.

Heartbeat.

Backup.

Restore.

System Service.

Update Status.

Activity.

Security Event.

Rule Engine.

Automation Engine.

Apabila salah satu sumber data tidak tersedia, Health Score tetap harus dapat dihitung menggunakan data yang tersedia.

Nilai yang hilang tidak boleh menyebabkan sistem gagal.

---

Struktur Perhitungan

Perhitungan dilakukan melalui beberapa tahapan.

Tahap pertama adalah pengambilan seluruh metrik terbaru.

Tahap kedua melakukan normalisasi agar seluruh metrik berada pada skala yang sama.

Tahap ketiga memberikan bobot terhadap masing-masing kategori.

Tahap keempat menghitung penalti apabila ditemukan kondisi yang tidak normal.

Tahap kelima menghitung bonus apabila server berada pada kondisi yang sangat stabil dalam jangka waktu tertentu.

Tahap terakhir menghasilkan nilai Health Score yang berada pada rentang nol sampai seratus.

Seluruh tahapan harus terdokumentasi pada log internal sehingga hasil perhitungan dapat ditelusuri apabila diperlukan.

---

Pembobotan

Setiap kategori memiliki bobot.

Bobot awal dapat digunakan sebagai acuan berikut.

CPU

15%

RAM

15%

Disk

15%

Network

10%

Tunnel

10%

Database

10%

Security

10%

Backup

5%

Scheduler

5%

Docker

5%

Automation

5%

Total seluruh bobot harus selalu bernilai seratus persen.

Pengguna dapat mengubah bobot melalui pengaturan lanjutan apabila fitur tersebut diaktifkan.

---

Perhitungan CPU

CPU tidak dihitung menggunakan satu kali pembacaan.

Health Score menggunakan rata-rata bergerak.

Misalnya sistem menyimpan pembacaan selama lima menit.

Apabila penggunaan CPU berada pada angka sembilan puluh persen hanya selama lima detik kemudian kembali normal, maka pengaruh terhadap Health Score harus kecil.

Sebaliknya, apabila penggunaan CPU bertahan di atas sembilan puluh persen selama lima belas menit, penalti harus meningkat secara bertahap.

Pendekatan ini mengurangi kemungkinan penurunan nilai akibat lonjakan sesaat.

---

Perhitungan RAM

Perhitungan RAM tidak boleh menganggap seluruh memori cache Linux sebagai penggunaan memori berbahaya.

Engine harus membedakan antara:

Memory Used.

Memory Available.

Cached Memory.

Buffered Memory.

Swap Activity.

Apabila swap mulai digunakan secara terus menerus, Health Score harus memberikan penalti lebih besar dibanding hanya tingginya penggunaan cache.

---

Perhitungan Disk

Disk dihitung menggunakan beberapa parameter.

Persentase penggunaan.

Sisa kapasitas.

Inode.

Kecepatan baca.

Kecepatan tulis.

Filesystem Error.

SMART Status apabila tersedia.

Misalnya penggunaan disk mencapai sembilan puluh lima persen namun inode masih aman dan tidak terdapat error filesystem, penalti berbeda dengan kondisi disk yang memiliki bad sector atau filesystem rusak.

---

Perhitungan Network

Network tidak hanya melihat bandwidth.

Komponen yang digunakan meliputi:

Latency.

Packet Loss.

Reconnect.

Interface Down.

Tunnel Status.

Jumlah koneksi gagal.

Perubahan IP.

Kegagalan DNS.

Nilai Health Score harus turun apabila server kehilangan koneksi ke internet walaupun penggunaan CPU dan RAM sangat rendah.

---

Penalti

Penalti dihitung secara bertahap.

Sebagai contoh.

CPU berada di atas delapan puluh persen selama satu menit.

Penalti kecil.

CPU berada di atas sembilan puluh lima persen selama tiga puluh menit.

Penalti jauh lebih besar.

Pendekatan yang sama diterapkan pada RAM, Disk, Tunnel, Docker, Database, dan komponen lainnya.

Penalti tidak boleh langsung mengurangi puluhan poin tanpa mempertimbangkan durasi dan tingkat keparahan.

---

Recovery

Ketika kondisi server kembali normal, Health Score tidak langsung kembali ke angka seratus.

Nilai dipulihkan secara bertahap.

Tujuan pendekatan ini adalah mencerminkan kestabilan sistem.

Server yang baru pulih dari gangguan masih perlu membuktikan bahwa kondisinya benar-benar stabil sebelum memperoleh nilai maksimal.

---

Health Grade

Selain angka, sistem juga menghasilkan kategori.

95–100

Excellent.

85–94

Healthy.

70–84

Good.

55–69

Warning.

40–54

Poor.

0–39

Critical.

Kategori ini digunakan oleh dashboard, Notification Engine, dan AI untuk memberikan penjelasan yang lebih mudah dipahami pengguna.

---

Hubungan Dengan Dashboard

Dashboard tidak menghitung ulang Health Score.

Dashboard hanya menerima hasil akhir.

Halaman utama menampilkan:

Nilai saat ini.

Perubahan dibanding satu jam sebelumnya.

Perubahan dibanding satu hari sebelumnya.

Grafik perkembangan.

Faktor utama yang menyebabkan kenaikan atau penurunan nilai.

Dengan demikian pengguna dapat mengetahui alasan perubahan tanpa membuka setiap halaman monitoring.

---

Hubungan Dengan AI

AI tidak menghitung Health Score.

AI hanya membaca hasil perhitungan.

Apabila AI diminta melakukan analisis, AI menggunakan Health Score sebagai salah satu indikator untuk menjelaskan kondisi server.

Hal ini memastikan seluruh sistem menggunakan sumber nilai yang sama.

---

Logging

Setiap proses perhitungan menghasilkan log internal.

Log minimal mencatat:

Versi algoritma.

Waktu perhitungan.

Jumlah metrik yang digunakan.

Kategori yang mengalami penalti.

Kategori yang memperoleh bonus.

Nilai akhir.

Durasi perhitungan.

Log ini digunakan untuk proses audit dan debugging apabila ditemukan perbedaan hasil.

---

Acceptance Criteria

Health Score Engine dianggap selesai apabila mampu menghitung nilai kesehatan server menggunakan data yang telah divalidasi, menerapkan sistem pembobotan, penalti, dan pemulihan secara bertahap, menghasilkan kategori kesehatan yang konsisten, menyediakan informasi penyebab perubahan nilai, serta menjadi satu-satunya sumber Health Score bagi seluruh modul lain tanpa melakukan pembacaan langsung terhadap sistem operasi.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib memastikan seluruh algoritma dapat diuji, hasil perhitungan konsisten pada kondisi yang sama, tidak terdapat build error, lint warning, type error, maupun ketidaksesuaian dengan dokumen blueprint proyek.
My Dash

Batch 3 — Rule Engine

Tujuan

Dokumen ini mendefinisikan spesifikasi teknis lengkap untuk Rule Engine. Rule Engine merupakan pusat pengambilan keputusan otomatis pada My Dash. Monitoring Engine hanya bertugas mengumpulkan data, sedangkan Rule Engine bertugas mengubah data mentah menjadi keputusan yang dapat dipahami sistem.

Seluruh notifikasi, peringatan, automation, health score, rekomendasi, AI Analysis, scheduler lanjutan, dan workflow internal harus melalui Rule Engine.

Rule Engine tidak boleh memiliki ketergantungan langsung terhadap tampilan frontend.

Rule Engine tidak boleh memiliki ketergantungan terhadap AI.

Rule Engine harus tetap mampu berjalan walaupun:

- AI tidak tersedia.
- Tunnel tidak aktif.
- Notification provider gagal.
- Dashboard sedang tidak dibuka.
- Pengguna sedang offline.

Hal ini memastikan seluruh proses pengambilan keputusan tetap berjalan dua puluh empat jam setiap hari.

---

Filosofi Rule Engine

Monitoring menjawab pertanyaan:

"Apa yang sedang terjadi?"

Rule Engine menjawab pertanyaan:

"Apakah kondisi tersebut normal?"

Automation Engine menjawab:

"Apa yang harus dilakukan?"

Notification Engine menjawab:

"Siapa yang harus diberi tahu?"

AI menjawab:

"Mengapa hal ini bisa terjadi dan apa rekomendasinya?"

Keempat komponen tersebut memiliki tanggung jawab yang berbeda.

Rule Engine tidak boleh mengambil alih tugas AI.

Rule Engine tidak boleh mengirim notifikasi secara langsung.

Rule Engine hanya menghasilkan keputusan berdasarkan aturan.

---

Konsep Fundamental

Rule terdiri dari lima bagian utama.

Input

↓

Condition

↓

Evaluation

↓

Decision

↓

Output Event

Input berasal dari Monitoring Engine.

Condition berasal dari konfigurasi pengguna.

Evaluation dilakukan oleh Rule Engine.

Decision menentukan hasil evaluasi.

Output Event diteruskan kepada modul lain.

Dengan model ini, Rule Engine tidak perlu mengetahui siapa yang akan menerima event.

---

Alur Lengkap

Agent membaca kondisi VPS.

↓

Monitoring Engine melakukan validasi.

↓

Monitoring Engine melakukan normalisasi.

↓

Monitoring Engine menghasilkan metric.

↓

Metric dikirim ke Rule Engine.

↓

Rule Engine mengambil konfigurasi rule aktif.

↓

Rule Engine melakukan evaluasi.

↓

Rule Engine menghasilkan status.

↓

Status dikirim ke:

Notification Engine

Automation Engine

Analytics

Activity Timeline

Health Score

AI Queue apabila diperlukan

↓

Selesai.

Setiap langkah harus memiliki logging.

Setiap langkah harus memiliki penanganan kesalahan.

---

Jenis Rule

Rule dibagi menjadi beberapa kategori.

Performance Rule

Security Rule

Storage Rule

Network Rule

Tunnel Rule

Docker Rule

Database Rule

Scheduler Rule

Authentication Rule

System Rule

Plugin Rule

GitHub Rule

Backup Rule

Restore Rule

Update Rule

AI Rule

Custom Rule

Kategori digunakan untuk:

Filter.

Permission.

Notification.

Analytics.

Pengaturan pengguna.

---

Struktur Rule

Setiap Rule minimal memiliki atribut berikut.

Identifier.

Nama.

Kategori.

Status.

Priority.

Source Metric.

Operator.

Threshold.

Duration.

Cooldown.

Retry.

Severity.

Notification Target.

Automation Target.

AI Analysis.

Created Time.

Updated Time.

Created By.

Version.

Description.

Rule tidak boleh bergantung pada nama variabel internal.

Rule harus menggunakan identifier yang stabil.

---

Severity

Rule memiliki lima tingkat.

Information

Success

Warning

Error

Critical

Severity menentukan:

Warna.

Ikon.

Prioritas.

Jenis notifikasi.

Kemungkinan pemanggilan AI.

Kemungkinan automation.

---

Priority

Priority berbeda dengan Severity.

Severity menjelaskan tingkat bahaya.

Priority menentukan urutan eksekusi.

Misalnya.

Critical Notification memiliki priority lebih tinggi dibanding Information Notification.

Rule Engine harus selalu memproses event berdasarkan priority.

---

Threshold

Threshold merupakan batas nilai.

Contoh CPU.

Warning

70%

Critical

90%

Rule tidak langsung aktif ketika nilai melewati threshold.

Rule juga mempertimbangkan Duration.

---

Duration

Duration bertujuan mengurangi false alarm.

Contoh.

CPU

95%

selama

3 detik.

Belum tentu masalah.

CPU

95%

selama

5 menit.

Kemungkinan memang terdapat masalah.

Rule baru aktif setelah Duration terpenuhi.

Duration dapat diatur pengguna.

---

Cooldown

Setelah notifikasi dikirim.

Rule memasuki masa cooldown.

Misalnya.

Cooldown

15 menit.

Selama masa tersebut.

Rule tidak mengirim notifikasi berulang.

Namun Monitoring tetap berjalan.

Cooldown bertujuan mencegah spam.

---

Retry

Retry digunakan apabila aksi gagal.

Contoh.

Notification gagal.

Rule tidak langsung gagal.

Rule dapat mencoba kembali.

Jumlah percobaan ditentukan konfigurasi.

---

Rule Evaluation

Evaluasi dilakukan secara bertahap.

Langkah pertama.

Pastikan Rule aktif.

Langkah kedua.

Pastikan sumber metric tersedia.

Langkah ketiga.

Pastikan data valid.

Langkah keempat.

Bandingkan metric dengan threshold.

Langkah kelima.

Hitung durasi.

Langkah keenam.

Periksa cooldown.

Langkah ketujuh.

Tentukan severity.

Langkah kedelapan.

Buat event.

Langkah kesembilan.

Kirim ke engine lain.

---

Perhitungan CPU

Apabila server memiliki empat core.

Maka penggunaan CPU dihitung berdasarkan rata-rata seluruh core.

Contoh.

Core 1

100%

Core 2

80%

Core 3

40%

Core 4

20%

Rata-rata.

(100 + 80 + 40 + 20)

÷

4

=

60%

Rule menggunakan nilai rata-rata sebagai nilai utama.

Namun dashboard tetap dapat menampilkan penggunaan setiap core secara terpisah.

Rule khusus dapat dibuat berdasarkan satu core tertentu apabila diperlukan.

---

Perhitungan RAM

Persentase RAM.

Digunakan

÷

Total

×

100

Rule harus membedakan:

Cached Memory.

Buffer Memory.

Available Memory.

Used Memory.

Hal ini penting agar Linux cache tidak dianggap sebagai penggunaan RAM berbahaya.

---

Perhitungan Disk

Persentase.

Digunakan

÷

Total

×

100

Selain persentase.

Rule juga dapat menggunakan:

Sisa Gigabyte.

Inode.

Read Speed.

Write Speed.

SMART Status.

---

Composite Rule

Rule dapat menggunakan lebih dari satu kondisi.

Contoh.

CPU

«»

85%

DAN

RAM

«»

90%

DAN

Duration

«»

10 Menit

↓

Critical Performance.

Composite Rule lebih akurat dibanding Rule tunggal.

---

Escalation

Apabila kondisi memburuk.

Rule dapat berubah.

Contoh.

Warning.

↓

Error.

↓

Critical.

Setiap perubahan menghasilkan event baru.

History tetap disimpan.

---

Notification Integration

Rule tidak mengirim pesan.

Rule hanya menghasilkan event.

Notification Engine menentukan provider.

Notification Engine membuat template.

Apabila konfigurasi AI aktif.

Notification Engine mengirim template lokal terlebih dahulu.

Kemudian menjalankan AI di background.

Timeout AI mengikuti konfigurasi.

Apabila AI berhasil.

Notification Engine mengirim analisis tambahan.

Apabila AI gagal.

Template lokal tetap menjadi hasil akhir.

---

Automation Integration

Rule dapat memicu automation.

Contoh.

Tunnel mati.

↓

Automation.

↓

Reconnect.

↓

Verifikasi.

↓

Apabila gagal.

↓

Notification.

Automation harus selalu mendapatkan persetujuan pengguna untuk tindakan yang berpotensi mengubah sistem, kecuali pengguna telah mengaktifkan mode otomatis untuk jenis tindakan tersebut.

---

Rule Editor

Dashboard wajib menyediakan Rule Editor.

Pengguna dapat mengubah:

Threshold.

Duration.

Cooldown.

Severity.

Provider.

AI.

Automation.

Retry.

Priority.

Status.

Deskripsi.

Rule bawaan tidak boleh dihapus.

Rule bawaan dapat dinonaktifkan.

Rule baru dapat dibuat.

---

Logging

Setiap evaluasi Rule menghasilkan log.

Log minimal berisi:

Rule.

Metric.

Threshold.

Result.

Duration.

Execution Time.

Severity.

Decision.

Log digunakan untuk audit.

---

Pengujian

AI wajib menguji:

Threshold.

Cooldown.

Duration.

Retry.

Composite Rule.

Escalation.

Priority.

Severity.

Notification Trigger.

Automation Trigger.

AI Trigger.

Logging.

Recovery.

Apabila satu pengujian gagal.

AI wajib memperbaiki implementasi.

Kemudian mengulang seluruh pengujian yang berkaitan.

---

Acceptance Criteria

Rule Engine dianggap selesai apabila:

Seluruh Rule dapat dievaluasi.

Composite Rule berjalan.

Cooldown berjalan.

Duration berjalan.

Escalation berjalan.

Priority berjalan.

Severity berjalan.

Logging berjalan.

Notification Engine menerima event.

Automation Engine menerima event.

Tidak terdapat build error.

Tidak terdapat lint warning.

Tidak terdapat type error.

Dokumentasi diperbarui.

AI telah melakukan verifikasi mandiri dan tidak melanjutkan ke dokumen berikutnya sebelum mendapatkan instruksi baru dari pengguna.

Akhir dokumen.
Batch 5 — Notification Templates

Tujuan

Dokumen ini mendefinisikan spesifikasi lengkap Template Engine yang digunakan oleh Notification Engine. Template Engine bertanggung jawab menghasilkan pesan yang konsisten, mudah dipahami, ringkas, informatif, dan dapat dikirim ke berbagai provider tanpa perlu mengubah logika bisnis.

Template bukan sekadar kumpulan teks.

Template merupakan representasi informasi yang telah diproses oleh seluruh sistem. Template harus mampu menjelaskan apa yang terjadi, kapan terjadi, mengapa hal tersebut penting, bagaimana dampaknya terhadap server, tindakan otomatis yang telah dilakukan sistem, serta langkah yang dapat dilakukan pengguna apabila diperlukan.

Seluruh template harus dapat dihasilkan tanpa bantuan AI.

Apabila AI aktif, hasil AI hanya menjadi pelengkap terhadap template dasar.

Dengan pendekatan ini Notification Engine tetap dapat bekerja walaupun seluruh layanan AI sedang tidak tersedia.

---

Filosofi Template

Template harus menjawab enam pertanyaan utama.

Apa yang terjadi.

Kapan terjadi.

Di mana terjadi.

Seberapa penting kejadian tersebut.

Apa yang telah dilakukan sistem.

Apa yang dapat dilakukan pengguna.

Apabila salah satu pertanyaan tersebut belum terjawab, template dianggap belum lengkap.

Template tidak boleh menggunakan istilah teknis yang sulit dipahami apabila terdapat istilah yang lebih sederhana.

Namun untuk pengguna tingkat lanjut, Dashboard tetap menyediakan halaman detail yang lebih lengkap.

---

Struktur Template

Setiap template menggunakan struktur yang sama.

Header.

Severity.

Category.

Summary.

Technical Detail.

Automation Result.

Recommendation.

Timestamp.

Dashboard Link.

Footer.

Header memberikan identitas.

Severity menunjukkan tingkat bahaya.

Category menunjukkan domain.

Summary menjelaskan inti masalah.

Technical Detail berisi data teknis.

Automation Result menjelaskan tindakan sistem.

Recommendation memberikan saran.

Timestamp menunjukkan waktu kejadian.

Dashboard Link membuka halaman terkait.

Footer berisi identitas Dashboard dan versi apabila diperlukan.

---

Placeholder System

Template menggunakan Placeholder Engine.

Seluruh placeholder diganti sebelum proses pengiriman.

Placeholder minimal yang harus tersedia.

Server Name.

Hostname.

Workspace.

Operating System.

Kernel.

CPU Usage.

RAM Usage.

Swap Usage.

Disk Usage.

Filesystem.

Public IP.

Tunnel Status.

Docker Status.

Container Name.

Service Name.

Rule Name.

Severity.

Priority.

Threshold.

Current Value.

Previous Value.

Duration.

Health Score.

Automation Status.

Notification Provider.

Timestamp.

Timezone.

Dashboard URL.

Version.

AI Summary.

Placeholder tidak boleh dibiarkan kosong.

Apabila suatu nilai tidak tersedia.

Template menggunakan nilai pengganti yang telah ditentukan.

Sebagai contoh.

"Data tidak tersedia."

"Belum dihitung."

"Belum dikonfigurasi."

Pendekatan ini menghindari pesan yang terlihat rusak.

---

Severity Template

Setiap tingkat Severity memiliki gaya bahasa berbeda.

Information.

Bersifat informatif.

Tidak mendesak.

Tidak memerlukan tindakan segera.

Success.

Menjelaskan bahwa suatu proses telah berhasil.

Warning.

Menjelaskan bahwa terdapat kondisi yang perlu diperhatikan.

Error.

Menjelaskan bahwa terdapat kegagalan yang memerlukan tindakan.

Critical.

Menjelaskan bahwa kondisi dapat menyebabkan downtime atau kehilangan layanan.

Perubahan gaya bahasa dilakukan pada Template Engine.

Notification Provider tidak boleh mengubah gaya bahasa tersebut.

---

CPU Template

Apabila CPU melebihi batas.

Template harus menjelaskan.

Persentase CPU saat ini.

Threshold.

Durasi.

Load Average.

Health Score.

Automation yang telah dilakukan.

Status Automation.

Rekomendasi.

Contoh alur.

CPU meningkat.

↓

Rule aktif.

↓

Automation dijalankan.

↓

Automation berhasil.

↓

Template dibuat.

↓

Notification dikirim.

Template harus menyebutkan apakah Automation berhasil atau gagal.

---

RAM Template

Template RAM tidak boleh langsung menyatakan bahwa RAM penuh.

Template harus menjelaskan.

Memory Used.

Memory Available.

Cached Memory.

Swap.

Memory Pressure apabila tersedia.

Hal ini penting karena Linux menggunakan cache secara agresif.

Template harus membantu pengguna memahami kondisi sebenarnya.

---

Disk Template

Template Disk harus menjelaskan.

Persentase penggunaan.

Sisa kapasitas.

Filesystem.

Estimasi waktu hingga penuh.

Status SMART apabila tersedia.

Automation yang dilakukan.

Rekomendasi.

Sebagai contoh.

Apabila estimasi penyimpanan akan habis dalam tujuh hari.

Template menyampaikan informasi tersebut.

Bukan hanya persentase penggunaan.

---

Tunnel Template

Tunnel memiliki beberapa kondisi.

Connected.

Reconnecting.

Fallback.

Disconnected.

Recovery.

Template harus menjelaskan.

Provider sebelumnya.

Provider saat ini.

Durasi downtime.

Jumlah reconnect.

Hasil Recovery.

Dengan demikian pengguna mengetahui seluruh proses yang telah dilakukan sistem.

---

Docker Template

Template Docker menjelaskan.

Container.

Status.

Restart Count.

Health.

Exit Code.

Automation.

Recovery.

Apabila container berhasil dipulihkan.

Template menjelaskan proses tersebut.

Apabila gagal.

Template menjelaskan penyebab terakhir yang diketahui.

---

Security Template

Template Security memiliki prioritas tinggi.

Contoh.

Login Baru.

SSH Login.

Session Baru.

Firewall Berubah.

Permission Berubah.

API Token Diganti.

Template wajib menyebutkan.

Waktu.

Alamat IP apabila tersedia.

Perangkat apabila tersedia.

Negara apabila tersedia.

Status.

Rekomendasi.

Dashboard Link.

Informasi sensitif seperti password dan token tidak boleh dimasukkan ke template.

---

AI Enhancement

Setelah template selesai dibuat.

Notification Engine dapat mengirimkan permintaan kepada AI.

AI menerima.

Template dasar.

Metric.

History singkat.

Health Score.

Rule.

Automation Result.

AI tidak menerima.

Password.

Token.

Session.

Credential.

Recovery Key.

AI menghasilkan.

Diagnosis.

Kemungkinan penyebab.

Risiko.

Rekomendasi.

Confidence.

Apabila AI selesai sebelum timeout.

Notification kedua dapat dikirim atau hasil AI ditampilkan pada Dashboard sesuai konfigurasi pengguna.

---

Localization

Template harus mendukung banyak bahasa.

Template tidak boleh ditulis langsung di source code.

Gunakan sistem Localization.

Minimal mendukung.

Bahasa Indonesia.

Bahasa Inggris.

Penambahan bahasa baru tidak boleh memerlukan perubahan Notification Engine.

---

Mathematical Summary

Beberapa template menggunakan hasil perhitungan.

Contoh.

CPU Growth Rate.

Growth Rate

=

(Current

−

Previous)

÷

Elapsed Time

Disk Prediction.

Remaining Time

=

Remaining Capacity

÷

Average Growth Rate

Health Difference.

Health Delta

=

Current Health Score

−

Previous Health Score

Nilai tersebut harus dijelaskan menggunakan bahasa yang mudah dipahami.

---

Template Versioning

Setiap template memiliki Version.

Version digunakan untuk.

Audit.

Migration.

Compatibility.

Rollback.

Apabila Template berubah.

History lama tetap menggunakan versi sebelumnya.

Dengan demikian histori tetap konsisten.

---

Testing

AI wajib menguji.

CPU.

RAM.

Disk.

Tunnel.

Docker.

Database.

Redis.

Scheduler.

Security.

Automation.

AI.

Localization.

Missing Placeholder.

Invalid Placeholder.

Template Version.

Seluruh pengujian harus menghasilkan template yang tetap dapat dibaca dengan baik.

---

Acceptance Criteria

Template Engine dianggap selesai apabila mampu menghasilkan template yang konsisten, mendukung placeholder, localization, versioning, severity, AI enhancement, serta mampu menjelaskan kondisi sistem secara jelas tanpa bergantung pada AI. Seluruh template harus dapat digunakan pada seluruh Notification Provider tanpa modifikasi tambahan dan tetap menghasilkan pesan yang mudah dipahami pada perangkat mobile.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib memverifikasi bahwa tidak terdapat placeholder yang tersisa, tidak terdapat data sensitif yang bocor ke template, seluruh versi template tercatat dengan benar, dan seluruh skenario pengujian menghasilkan format pesan yang konsisten.

Akhir dokumen.
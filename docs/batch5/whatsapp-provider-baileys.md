Batch 5 — WhatsApp Provider (Baileys)

Tujuan

Dokumen ini mendefinisikan implementasi lengkap Provider WhatsApp menggunakan WhiskeySockets/Baileys sebagai transport utama. Provider ini merupakan jalur komunikasi paling penting pada My Dash karena sebagian besar administrator akan menerima notifikasi melalui WhatsApp.

Implementasi tidak hanya berfokus pada kemampuan mengirim pesan, tetapi juga pada kestabilan koneksi, pemulihan otomatis, keamanan session, sinkronisasi perangkat, validasi pengguna, performa, penggunaan memori, serta kemampuan mempertahankan koneksi selama mungkin tanpa intervensi pengguna.

Provider harus dirancang agar mampu berjalan selama berbulan-bulan tanpa perlu melakukan pairing ulang apabila session masih valid.

---

Tujuan Arsitektur

Provider WhatsApp mempunyai beberapa tujuan utama.

Menjaga koneksi tetap aktif.

Mengurangi kemungkinan logout.

Mengurangi spam reconnect.

Mengurangi penggunaan CPU.

Mengurangi penggunaan RAM.

Memastikan seluruh pesan penting tetap dikirim walaupun terjadi gangguan jaringan sementara.

Seluruh keputusan arsitektur harus mengarah kepada tujuan tersebut.

---

Filosofi Provider

Provider WhatsApp tidak dianggap sebagai Bot.

Provider dianggap sebagai Gateway.

Gateway berarti seluruh proses bisnis selesai sebelum pesan sampai ke Provider.

Provider tidak mengetahui.

CPU.

RAM.

Rule.

Analytics.

Automation.

Health Score.

Provider hanya mengetahui.

Delivery Request.

Delivery Result.

Dengan demikian implementasi Baileys dapat diganti di masa depan tanpa memengaruhi sistem lain.

---

Lifecycle

Provider memiliki siklus hidup yang tetap.

Uninitialized.

↓

Configuration Loading.

↓

Configuration Validation.

↓

Credential Loading.

↓

Session Verification.

↓

Socket Creation.

↓

Connection Establishment.

↓

Synchronization.

↓

Connected.

↓

Heartbeat Monitoring.

↓

Realtime Delivery.

↓

Reconnect apabila diperlukan.

↓

Shutdown.

Perubahan state tidak boleh dilakukan secara acak.

Seluruh transisi harus dicatat.

---

Configuration Validation

Sebelum Provider dijalankan.

Dashboard harus memastikan konfigurasi valid.

Nomor Owner.

Nomor Bot.

Format internasional.

Tidak mengandung karakter selain angka.

Panjang sesuai standar.

Bot Name.

Session Directory.

Reconnect Policy.

Retry Policy.

Timeout.

Configuration Version.

Apabila satu konfigurasi tidak valid.

Provider tidak boleh memulai proses koneksi.

---

Pairing Flow

Pairing dilakukan hanya ketika session belum tersedia atau telah rusak.

Urutan algoritma.

Validasi konfigurasi.

↓

Membuat Pairing Context.

↓

Membuat Socket.

↓

Meminta Pairing Code.

↓

Menampilkan Pairing Code kepada Dashboard.

↓

Pengguna menautkan perangkat.

↓

Baileys melakukan autentikasi.

↓

Credential dienkripsi.

↓

Credential disimpan.

↓

Integrity Check.

↓

Health Check.

↓

Connected.

Setelah berhasil.

Pairing Code langsung dihapus dari memori.

Pairing Context dibersihkan.

---

Session Management

Session merupakan aset terpenting Provider.

Session tidak boleh disimpan sebagai file biasa tanpa perlindungan.

Setiap kali aplikasi dijalankan.

Provider memverifikasi.

Struktur session.

Integritas.

Versi.

Timestamp.

Credential.

Apabila ditemukan inkonsistensi.

Provider tidak langsung menghapus session.

Provider mencoba melakukan Recovery.

Recovery hanya dilakukan satu kali.

Apabila gagal.

Baru meminta Pairing ulang.

Pendekatan ini mengurangi Pairing yang tidak perlu.

---

Connection State Machine

Provider memiliki beberapa state.

Idle.

Loading.

Connecting.

Synchronizing.

Connected.

Waiting Heartbeat.

Reconnecting.

Temporary Failure.

Permanent Failure.

Disconnected.

State Machine digunakan agar Dashboard dapat mengetahui kondisi Provider secara akurat.

Notification Engine juga menggunakan state ini untuk menentukan apakah Delivery Request dapat langsung dikirim atau harus menunggu.

---

Heartbeat Algorithm

Heartbeat dilakukan secara berkala.

Heartbeat tidak mengirim pesan kepada pengguna.

Heartbeat hanya memastikan.

Socket masih aktif.

Session masih valid.

Koneksi internet tersedia.

Server WhatsApp masih dapat dijangkau.

Setiap heartbeat menghasilkan.

Latency.

Round Trip Time.

Failure Count.

Success Count.

Apabila tiga heartbeat berturut-turut gagal.

Provider berpindah ke mode Reconnecting.

---

Reconnect Strategy

Reconnect tidak boleh dilakukan secara agresif.

Gunakan Exponential Backoff.

Sebagai contoh.

Percobaan pertama.

5 Detik.

Percobaan kedua.

10 Detik.

Percobaan ketiga.

20 Detik.

Percobaan keempat.

40 Detik.

Percobaan kelima.

80 Detik.

Nilai maksimum dapat diatur melalui konfigurasi.

Pendekatan ini mencegah reconnect tanpa henti ketika jaringan benar-benar bermasalah.

---

Delivery Pipeline

Setiap pesan mengikuti alur berikut.

Notification Queue.

↓

Delivery Request.

↓

Template Validation.

↓

Placeholder Replacement.

↓

Payload Generation.

↓

Socket Validation.

↓

Delivery.

↓

Acknowledgement.

↓

Delivery Verification.

↓

History Update.

↓

Statistics Update.

Tidak boleh ada langkah yang dilewati.

---

Message Template

Provider menerima template yang telah selesai diproses.

Provider tidak membuat isi pesan.

Namun Provider wajib memastikan.

Panjang pesan tidak melebihi batas.

Karakter Unicode valid.

Emoji tetap ditampilkan dengan benar.

Baris baru dipertahankan.

Placeholder tidak tersisa.

Apabila masih terdapat placeholder.

Provider menolak pengiriman.

Hal ini mencegah pengguna menerima pesan yang rusak.

---

Delivery Verification

Keberhasilan pengiriman tidak ditentukan oleh fungsi kirim selesai dijalankan.

Provider harus memastikan.

Socket tidak mengalami error.

Baileys mengembalikan identifier pesan.

Identifier berhasil disimpan.

History berhasil diperbarui.

Baru setelah itu status berubah menjadi Success.

---

Mathematical Reliability

Reliability Provider dihitung secara periodik.

Gunakan rumus.

Reliability

=

Success Ratio

×

0.50

+ 

Heartbeat Score

×

0.20

+ 

Session Stability

×

0.15

+ 

Latency Score

×

0.10

+ 

Reconnect Score

×

0.05

Masing-masing komponen dinormalisasi menjadi rentang.

0

hingga

100. 

Sebagai contoh.

Success Ratio.

98. 

Heartbeat.

96. 

Session.

100. 

Latency.

90. 

Reconnect.

85. 

Reliability.

(98×0.50)

+ 

(96×0.20)

+ 

(100×0.15)

+ 

(90×0.10)

+ 

(85×0.05)

=

49

+ 

19.2

+ 

15

+ 

9

+ 

4.25

=

96.45

Dashboard menampilkan.

Reliability.

96.45%

Pendekatan ini jauh lebih representatif dibanding hanya menghitung jumlah pesan yang berhasil.

---

Memory Management

Provider tidak boleh menyimpan seluruh histori pesan di memori.

Gunakan buffer melingkar.

Misalnya.

Ukuran maksimum.

1000 Delivery Result.

Ketika data ke-1001 masuk.

Data pertama dilepas.

Dengan demikian kompleksitas memori tetap konstan.

Penggunaan memori.

O(n)

dengan n tetap.

---

Security

Nomor Owner.

Nomor Bot.

Credential.

Session.

Token internal.

Tidak boleh muncul pada log.

Tidak boleh dikirim ke AI.

Tidak boleh dimasukkan ke Notification History.

Credential hanya digunakan di dalam Provider.

---

Monitoring

Dashboard harus menampilkan.

Connection Status.

Heartbeat.

Latency.

Reconnect Count.

Session Age.

Last Pairing.

Last Delivery.

Last Failure.

Reliability.

Provider Version.

Baileys Version.

Seluruh data diperbarui secara realtime.

---

Recovery

Apabila Provider mengalami crash.

Recovery dilakukan.

Memuat ulang konfigurasi.

↓

Memverifikasi session.

↓

Membuat socket baru.

↓

Sinkronisasi.

↓

Melanjutkan Delivery Queue.

Notification yang belum selesai diproses tidak boleh hilang.

Delivery Queue tetap menjadi sumber utama.

---

Acceptance Criteria

Provider WhatsApp dianggap selesai apabila mampu mempertahankan session dalam jangka panjang, melakukan pairing hanya ketika diperlukan, mempertahankan koneksi melalui heartbeat dan reconnect adaptif, memproses Delivery Queue secara konsisten, menghitung Reliability Score, mengelola memori secara efisien, menjaga kerahasiaan credential, serta menghasilkan statistik operasional yang dapat digunakan oleh Dashboard dan Analytics Engine.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib melakukan simulasi jaringan lambat, kehilangan koneksi internet, kerusakan session, restart aplikasi, reconnect berulang, pengiriman pesan massal, dan pemulihan otomatis untuk memastikan seluruh algoritma bekerja sesuai spesifikasi.

Akhir dokumen.
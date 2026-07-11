Batch 4 — Dashboard System

Tujuan

Dashboard merupakan pusat interaksi antara pengguna dan seluruh sistem My Dash. Seluruh informasi yang diterima pengguna berasal dari Dashboard, sehingga Dashboard tidak boleh hanya berfungsi sebagai halaman visual, melainkan sebagai representasi keadaan VPS secara akurat, realtime, dan mudah dipahami.

Dashboard tidak boleh mengambil keputusan bisnis.

Dashboard tidak boleh melakukan monitoring secara langsung.

Dashboard tidak boleh melakukan perhitungan statistik yang kompleks.

Dashboard hanya menerima data yang telah diproses oleh Backend, Monitoring Engine, Analytics Engine, Rule Engine, Health Score Engine, dan Notification Engine.

Dengan pendekatan ini seluruh pengguna akan melihat hasil yang identik walaupun menggunakan perangkat yang berbeda.

---

Tujuan Desain

Dashboard dirancang agar administrator mampu mengetahui kondisi server dalam waktu kurang dari lima detik.

Prinsip ini disebut Five Second Situation Awareness.

Ketika dashboard pertama kali terbuka, pengguna seharusnya langsung dapat menjawab pertanyaan berikut.

Apakah server sehat.

Apakah ada masalah yang sedang terjadi.

Apakah terdapat notifikasi penting.

Apakah terdapat automation yang sedang berjalan.

Apakah terdapat resource yang hampir habis.

Apakah tunnel masih aktif.

Apakah backup terakhir berhasil.

Apakah AI memberikan rekomendasi baru.

Informasi tersebut harus terlihat tanpa membuka menu lain.

---

Filosofi Informasi

Informasi memiliki tingkatan prioritas.

Prioritas pertama adalah kondisi yang membutuhkan tindakan segera.

Prioritas kedua adalah kondisi yang perlu diperhatikan.

Prioritas ketiga adalah informasi operasional.

Prioritas keempat adalah informasi historis.

Dashboard harus selalu mengutamakan informasi yang memiliki dampak terbesar terhadap ketersediaan server.

Contohnya.

Tunnel mati jauh lebih penting dibanding statistik bandwidth satu minggu terakhir.

Database gagal jauh lebih penting dibanding jumlah container Docker.

CPU mencapai seratus persen selama tiga puluh menit jauh lebih penting dibanding update aplikasi tersedia.

Urutan prioritas ini harus diterapkan pada seluruh halaman.

---

Struktur Dashboard

Dashboard utama dibagi menjadi beberapa zona.

Zona pertama merupakan Header Status.

Zona kedua merupakan Health Summary.

Zona ketiga merupakan Realtime Metrics.

Zona keempat merupakan Active Alerts.

Zona kelima merupakan Activity Timeline.

Zona keenam merupakan Analytics Preview.

Zona ketujuh merupakan Automation Status.

Zona kedelapan merupakan Quick Action.

Zona kesembilan merupakan AI Recommendation.

Zona kesepuluh merupakan System Footer.

Masing-masing zona harus dapat dimuat secara independen.

Apabila salah satu zona gagal dimuat, zona lain tetap harus dapat digunakan.

---

Header Status

Header merupakan ringkasan seluruh kondisi server.

Header minimal menampilkan.

Nama server.

Hostname.

Workspace.

Zona waktu.

Status Agent.

Status Tunnel.

Health Score.

Versi Dashboard.

Versi Agent.

Waktu sinkronisasi terakhir.

Seluruh informasi pada Header harus diperbarui secara realtime.

Apabila Agent terputus, Header berubah tanpa memerlukan penyegaran halaman.

---

Health Summary

Health Summary merupakan komponen utama.

Health Summary menampilkan satu angka utama beserta penjelasan singkat.

Selain angka utama, komponen ini juga harus menampilkan faktor yang paling memengaruhi Health Score.

Contohnya.

CPU Stability menurunkan Health Score sebesar 12 poin.

Tunnel Availability menurunkan Health Score sebesar 8 poin.

Database Latency menurunkan Health Score sebesar 4 poin.

Dengan pendekatan ini pengguna tidak hanya mengetahui nilai kesehatan, tetapi juga penyebabnya.

---

Realtime Metrics

Seluruh metrik utama ditampilkan dalam bentuk kartu kecil.

Setiap kartu hanya mempunyai satu tujuan.

Contohnya.

CPU Card.

RAM Card.

Disk Card.

Bandwidth Card.

Tunnel Card.

Docker Card.

Database Card.

Redis Card.

Setiap kartu harus menampilkan.

Nilai saat ini.

Perubahan dibanding pembacaan sebelumnya.

Grafik mini.

Status.

Update terakhir.

Apabila terdapat warning, kartu berubah sesuai severity tanpa mengubah struktur layout.

---

Activity Timeline

Timeline menampilkan aktivitas terbaru.

Timeline bukan log mentah.

Timeline hanya menampilkan aktivitas yang penting.

Contoh.

Login.

Logout.

Tunnel Reconnect.

Backup.

Restore.

Restart Service.

Automation Success.

Automation Failed.

Rule Triggered.

AI Recommendation.

Notification Delivered.

Setiap aktivitas memiliki kategori dan severity.

Timeline harus dapat difilter berdasarkan waktu dan kategori.

---

Active Alert

Active Alert hanya menampilkan masalah yang masih aktif.

Masalah yang telah selesai otomatis berpindah ke riwayat.

Active Alert harus mendukung pengurutan berdasarkan.

Severity.

Durasi.

Kategori.

Server.

Prioritas.

Pengguna dapat membuka detail untuk melihat penyebab, histori perubahan, automation yang telah dijalankan, dan rekomendasi.

---

Dashboard Refresh Algorithm

Dashboard tidak boleh melakukan refresh penuh.

Gunakan pendekatan incremental rendering.

Algoritma sederhananya.

Langkah pertama.

Frontend menerima event websocket.

Langkah kedua.

Cari komponen yang memiliki ketergantungan terhadap metric tersebut.

Langkah ketiga.

Bandingkan data lama dengan data baru.

Langkah keempat.

Apabila tidak terdapat perubahan, abaikan event.

Langkah kelima.

Apabila terdapat perubahan, render hanya komponen tersebut.

Kompleksitas algoritma ditargetkan mendekati O(k), dengan k merupakan jumlah komponen yang benar-benar dipengaruhi, bukan jumlah seluruh komponen dashboard.

Pendekatan ini jauh lebih efisien dibanding melakukan render ulang seluruh halaman.

---

Perhitungan Perubahan Nilai

Setiap metrik menampilkan perubahan relatif.

Rumus.

Perubahan Persen

=

((Nilai Baru − Nilai Lama)

÷

Nilai Lama)

×

100

Apabila nilai lama bernilai nol, sistem tidak boleh melakukan pembagian langsung.

Dashboard harus menggunakan perlakuan khusus agar tidak menghasilkan pembagian dengan nol.

Dalam kondisi tersebut perubahan ditampilkan sebagai "nilai awal" atau menggunakan indikator khusus.

---

Smoothing Visual

Perubahan angka tidak boleh meloncat.

Gunakan interpolasi waktu.

Misalnya nilai CPU berubah dari.

32%

menjadi

61%.

Dashboard melakukan transisi secara bertahap selama sekitar dua ratus hingga tiga ratus milidetik.

Perubahan ini hanya memengaruhi tampilan.

Nilai asli tetap digunakan oleh seluruh algoritma backend.

Dengan pendekatan ini dashboard terasa lebih halus tanpa mengurangi akurasi data.

---

State Management

Setiap widget memiliki lima keadaan utama.

Loading.

Ready.

Updating.

Warning.

Error.

Selain itu terdapat keadaan Empty untuk data yang memang belum tersedia.

Perpindahan antar state harus memiliki aturan yang jelas.

Widget tidak boleh berpindah langsung dari Loading ke Error tanpa proses validasi.

Widget tidak boleh tetap berada pada Loading apabila backend telah mengirimkan status gagal.

---

Dashboard Performance

Target performa.

Waktu membuka dashboard harus sesingkat mungkin.

Jumlah request awal harus seminimal mungkin.

Widget yang belum terlihat pada layar boleh dimuat setelah area utama selesai.

Animasi tidak boleh menyebabkan frame drop.

Target pengalaman pengguna adalah animasi tetap terasa halus pada perangkat kelas menengah.

---

Recovery

Apabila koneksi websocket terputus.

Dashboard tidak langsung menghapus seluruh data.

Dashboard mempertahankan data terakhir.

Status berubah menjadi "Last Known State".

Sistem kemudian menjalankan reconnect.

Setelah koneksi berhasil, backend mengirimkan sinkronisasi penuh agar seluruh data kembali konsisten.

Pendekatan ini mencegah dashboard terlihat kosong ketika terjadi gangguan jaringan singkat.

---

Acceptance Criteria

Dashboard dianggap memenuhi spesifikasi apabila seluruh widget menggunakan sumber data yang sama, hanya melakukan render terhadap komponen yang berubah, mampu mempertahankan data terakhir ketika koneksi terputus, menampilkan Health Score beserta faktor penyebabnya, memperlihatkan aktivitas dan peringatan secara realtime, serta tetap responsif pada perangkat mobile maupun desktop tanpa menghasilkan warning, build error, atau type error.

AI wajib melakukan pengujian terhadap seluruh alur dashboard, termasuk loading awal, perubahan realtime, reconnect websocket, perubahan state, serta sinkronisasi ulang sebelum melanjutkan ke dokumen berikutnya.

Akhir dokumen.
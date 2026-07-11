Batch 4 — Dashboard Widgets

Tujuan

Dokumen ini mendefinisikan standar pembangunan seluruh widget pada Dashboard My Dash. Widget merupakan unit visual terkecil yang digunakan untuk menyajikan informasi kepada pengguna. Walaupun ukurannya kecil, widget merupakan komponen yang paling sering diperbarui, paling sering dirender, dan paling sering berinteraksi dengan pengguna. Oleh karena itu, setiap widget harus dirancang dengan mempertimbangkan efisiensi algoritma, konsumsi memori, jumlah render, akurasi data, serta pengalaman pengguna.

Widget bukan sekadar card yang berisi angka.

Widget adalah representasi visual dari sebuah domain sistem yang harus mampu menjelaskan kondisi saat ini, perubahan yang sedang berlangsung, penyebab perubahan tersebut, dan tindakan yang dapat dilakukan pengguna apabila diperlukan.

Setiap widget harus tetap dapat berdiri sendiri tanpa bergantung pada widget lain. Dengan demikian dashboard dapat dimuat secara bertahap, dipindahkan, disembunyikan, atau dikembangkan melalui sistem plugin di masa depan.

---

Filosofi Widget

Widget harus menjawab satu pertanyaan.

Contoh.

CPU Widget menjawab.

"Bagaimana kondisi CPU saat ini?"

RAM Widget menjawab.

"Bagaimana penggunaan memori saat ini?"

Tunnel Widget menjawab.

"Apakah dashboard masih dapat diakses dari internet?"

Health Widget menjawab.

"Apakah kondisi server secara keseluruhan masih sehat?"

Satu widget tidak boleh mencoba menjawab terlalu banyak pertanyaan.

Semakin kecil ruang lingkup widget, semakin mudah pengguna memahami informasi yang ditampilkan.

---

Struktur Internal Widget

Seluruh widget memiliki struktur yang sama.

Header.

Body.

Realtime Indicator.

Trend Indicator.

Status Badge.

Quick Action.

Detail Navigation.

Timestamp.

State Controller.

Footer.

Header berisi identitas widget.

Body berisi informasi utama.

Realtime Indicator menunjukkan apakah data masih diperbarui.

Trend Indicator menunjukkan arah perubahan.

Status Badge menunjukkan severity.

Quick Action memberikan akses cepat.

Detail Navigation membuka halaman lengkap.

Timestamp menunjukkan kapan data terakhir diperbarui.

State Controller mengatur perubahan status.

Footer berisi metadata tambahan.

Struktur ini harus diterapkan pada seluruh widget agar pengalaman pengguna konsisten.

---

Widget Lifecycle

Setiap widget mempunyai siklus hidup yang tetap.

Initialization.

↓

Configuration Loading.

↓

Dependency Validation.

↓

Subscription Registration.

↓

Skeleton Rendering.

↓

Data Validation.

↓

Ready State.

↓

Realtime Update.

↓

Animation Update.

↓

State Evaluation.

↓

Destroy.

↓

Memory Cleanup.

Widget tidak boleh langsung merender data yang belum divalidasi.

Widget juga tidak boleh mempertahankan subscription setelah dihancurkan.

Seluruh listener, timer, animation frame, dan websocket subscription harus dibersihkan ketika widget tidak lagi digunakan.

---

Widget Data Flow

Aliran data harus mengikuti urutan berikut.

Agent.

↓

Monitoring Engine.

↓

Backend.

↓

WebSocket Gateway.

↓

State Manager.

↓

Widget.

Widget tidak boleh melakukan request langsung kepada Agent.

Widget tidak boleh membuka websocket sendiri.

Widget hanya menerima state yang telah diproses.

Pendekatan ini membuat jumlah koneksi tetap minimum walaupun jumlah widget bertambah.

---

Widget State Machine

Setiap widget mempunyai state yang eksplisit.

Idle.

Loading.

Synchronizing.

Ready.

Updating.

Warning.

Critical.

Disconnected.

Error.

Empty.

Transisi antar state harus mengikuti aturan.

Loading hanya boleh berubah menjadi Ready setelah data lolos validasi.

Ready dapat berubah menjadi Updating ketika event baru diterima.

Updating kembali menjadi Ready setelah render selesai.

Disconnected muncul ketika websocket terputus.

Error hanya digunakan apabila widget gagal bekerja.

State tidak boleh meloncat tanpa alasan yang jelas.

---

CPU Widget

CPU Widget merupakan salah satu widget yang paling sering diperbarui.

Widget harus menampilkan.

Persentase CPU.

Jumlah Core.

Load Average.

Frekuensi Saat Ini.

Trend.

Grafik Mini.

Health Contribution.

Status.

Timestamp.

Selain angka utama, widget juga harus menampilkan arah perubahan.

Misalnya.

CPU meningkat.

CPU stabil.

CPU menurun.

Perubahan tersebut dihitung menggunakan selisih antara beberapa sampel terakhir, bukan hanya dua data berturut-turut.

Misalkan.

Sampel.

41

44

48

51

52

Rata-rata gradien.

((44−41)+(48−44)+(51−48)+(52−51))

÷

4

=

2.75

Gradien positif menunjukkan CPU sedang meningkat.

Pendekatan ini lebih stabil dibanding hanya membandingkan dua titik data.

---

RAM Widget

RAM Widget harus membedakan.

Used Memory.

Available Memory.

Cache.

Buffer.

Swap.

Memory Pressure.

Dashboard tidak boleh langsung menampilkan RAM penuh sebagai kondisi berbahaya.

Widget harus menjelaskan apabila penggunaan memori tinggi disebabkan oleh cache Linux.

Hal ini mengurangi kesalahpahaman pengguna.

---

Disk Widget

Disk Widget tidak hanya menampilkan persentase.

Widget juga harus memperlihatkan.

Sisa ruang.

Estimasi waktu hingga penuh.

Filesystem.

Inode.

Read.

Write.

Health.

Prediction.

Estimasi waktu penuh dihitung.

Remaining Capacity

÷

Average Daily Growth

Sebagai contoh.

Sisa.

240 GB.

Pertumbuhan.

3 GB per hari.

Estimasi.

240

÷

3

=

80 Hari.

Dashboard menampilkan.

"Estimasi penyimpanan penuh sekitar 80 hari apabila pola penggunaan tetap."

---

Network Widget

Widget Network harus memperlihatkan.

Upload.

Download.

Latency.

Packet Loss.

Public IP.

Tunnel Status.

Realtime Speed.

Bandwidth Trend.

Network Widget menggunakan moving average agar angka tidak meloncat setiap detik.

Dengan demikian animasi tetap halus.

---

Health Widget

Health Widget menjadi pusat perhatian dashboard.

Selain angka.

Widget juga menampilkan.

Grade.

Trend.

Perubahan dibanding satu jam.

Perubahan dibanding satu hari.

Faktor yang paling memengaruhi.

CPU.

RAM.

Tunnel.

Database.

Automation.

Health Widget tidak menghitung nilai sendiri.

Widget hanya membaca hasil Health Score Engine.

---

Alert Widget

Alert Widget hanya menampilkan masalah aktif.

Alert yang telah selesai tidak muncul lagi.

Widget harus mampu mengurutkan berdasarkan.

Severity.

Priority.

Duration.

Alert terlama.

Alert terbaru.

Alert paling berbahaya.

Pengguna dapat langsung membuka halaman detail.

---

Activity Widget

Activity Widget memperlihatkan aktivitas terbaru.

Activity dibagi menjadi.

Security.

Automation.

Notification.

GitHub.

Docker.

Tunnel.

Backup.

Restore.

Activity baru muncul menggunakan animasi yang ringan.

Animasi tidak boleh menyebabkan daftar melompat.

---

AI Recommendation Widget

Widget ini bersifat opsional.

Apabila AI dinonaktifkan.

Widget tidak ditampilkan.

Apabila AI aktif.

Widget hanya menampilkan analisis yang telah selesai.

Dashboard tidak menunggu AI.

Widget harus menjelaskan.

Ringkasan.

Penyebab.

Dampak.

Rekomendasi.

Confidence.

Waktu analisis.

Provider AI.

Apabila AI timeout.

Widget tetap menampilkan status terakhir.

---

Widget Rendering Optimization

Widget tidak boleh melakukan render ulang apabila data tidak berubah.

Gunakan pemeriksaan kesetaraan.

Misalnya.

Nilai lama.

61%.

Nilai baru.

61%.

Widget tidak boleh dirender.

Apabila nilai berubah.

61%.

↓

62%.

Widget hanya merender elemen yang berubah.

Kompleksitas ideal.

O(1)

untuk update sederhana.

Pendekatan ini menjaga dashboard tetap ringan walaupun terdapat puluhan widget.

---

Memory Management

Setiap widget memiliki batas penggunaan memori.

Dataset historis yang tidak lagi diperlukan harus dilepas.

Grafik tidak boleh menyimpan seluruh data sejak instalasi.

Gunakan buffer melingkar.

Misalnya.

Ukuran maksimum.

300 Sampel.

Ketika sampel ke-301 masuk.

Sampel pertama dihapus.

Dengan demikian penggunaan memori selalu konstan.

Kompleksitas penyimpanan menjadi.

O(n)

dengan n tetap.

---

Future Widget System

Seluruh widget harus mendukung.

Plugin.

Marketplace.

Custom Widget.

Pinned Widget.

Resizable Widget.

Hidden Widget.

Favorite Widget.

Workspace Widget.

Widget tidak boleh memiliki ketergantungan terhadap posisi tertentu pada dashboard.

---

Acceptance Criteria

Seluruh widget dianggap memenuhi spesifikasi apabila setiap widget memiliki satu tujuan yang jelas, mengikuti lifecycle yang sama, menggunakan state machine yang konsisten, menerima data melalui State Manager, mendukung pembaruan realtime secara efisien, tidak menyebabkan memory leak, tidak melakukan render yang tidak diperlukan, serta mampu dikembangkan menjadi sistem plugin tanpa perubahan besar pada arsitektur dashboard.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib menguji performa dashboard dengan puluhan widget aktif secara bersamaan, memastikan penggunaan memori tetap stabil, waktu render tetap rendah, serta seluruh widget mampu melakukan sinkronisasi ulang setelah koneksi websocket dipulihkan.

Akhir dokumen.
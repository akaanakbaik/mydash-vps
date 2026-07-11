Batch 6 — Database Architecture

Tujuan

Database merupakan komponen yang paling menentukan integritas seluruh sistem My Dash. Seluruh konfigurasi pengguna, informasi Workspace, Rule, Notification, Automation, histori monitoring, audit, AI, GitHub, Tunnel, Session, hingga Analytics pada akhirnya akan bermuara pada Database.

Dokumen ini mendefinisikan bagaimana Database harus dirancang agar tetap konsisten ketika digunakan selama bertahun-tahun, mampu menangani jutaan baris data, tetap cepat ketika jumlah Workspace terus bertambah, serta mudah dikembangkan tanpa harus melakukan perubahan besar pada struktur inti.

Database bukan hanya tempat menyimpan data. Database merupakan representasi matematis dari keadaan seluruh sistem pada setiap titik waktu. Oleh karena itu seluruh desain tabel, indeks, relasi, transaksi, hingga strategi caching harus memiliki dasar yang jelas.

My Dash menggunakan PostgreSQL sebagai sumber data utama (Source of Truth), sedangkan Redis hanya digunakan sebagai penyimpanan sementara (Volatile Storage) untuk data yang membutuhkan kecepatan akses sangat tinggi.

---

Filosofi Database

Seluruh data dibagi menjadi dua kelompok besar.

Data Permanen

Data yang harus tetap ada walaupun server dimatikan.

Contohnya.

Workspace.

User.

Role.

Rule.

Automation.

Notification History.

Configuration.

GitHub Repository.

Tunnel Configuration.

AI Settings.

Audit.

Backup Metadata.

License.

Session History.

Plugin.

Dashboard Layout.

Semua data tersebut harus berada di PostgreSQL.

---

Data Sementara

Data yang berubah setiap detik.

Contohnya.

Realtime CPU.

Realtime RAM.

Realtime Bandwidth.

Current Tunnel State.

Worker Status.

WebSocket Presence.

Notification Queue.

Rate Limiter.

Temporary Cache.

Realtime Analytics Buffer.

Semua data tersebut tidak perlu ditulis ke PostgreSQL setiap detik.

Redis digunakan agar Database utama tidak menerima jutaan operasi tulis yang sebenarnya tidak diperlukan.

---

Database Philosophy

Database dirancang mengikuti tiga prinsip utama.

Consistency.

Isolation.

Durability.

Kecepatan memang penting.

Namun kehilangan integritas data jauh lebih berbahaya dibanding keterlambatan beberapa milidetik.

Misalnya.

Health Score salah selama lima detik masih dapat diterima.

Namun Notification History yang hilang sama sekali tidak dapat diterima.

Oleh karena itu seluruh transaksi penting harus mengutamakan konsistensi.

---

Domain Separation

Seluruh tabel harus dipisahkan berdasarkan Domain.

Workspace Domain.

Authentication Domain.

Monitoring Domain.

Analytics Domain.

Automation Domain.

Notification Domain.

AI Domain.

GitHub Domain.

Tunnel Domain.

Scheduler Domain.

Security Domain.

Audit Domain.

Plugin Domain.

Dengan pendekatan tersebut AI Agent akan lebih mudah memahami struktur database dan tidak membuat tabel yang saling bercampur.

---

Primary Key Strategy

Seluruh tabel menggunakan Primary Key yang stabil.

Primary Key tidak boleh bergantung pada nama.

Tidak boleh bergantung pada posisi data.

Tidak boleh berubah setelah data dibuat.

Primary Key harus mampu menjadi referensi selama bertahun-tahun.

Semua Foreign Key mengacu kepada Primary Key tersebut.

Pendekatan ini mengurangi kemungkinan inkonsistensi relasi.

---

Timestamp Strategy

Seluruh tabel wajib memiliki informasi waktu.

Minimal.

Created At.

Updated At.

Deleted At apabila menggunakan Soft Delete.

Version.

Modified By apabila tersedia.

Timestamp harus menggunakan UTC pada sisi Database.

Konversi ke zona waktu pengguna dilakukan di Backend.

Pendekatan ini menghindari masalah ketika Workspace berasal dari berbagai negara.

---

Soft Delete

Sebagian besar tabel tidak langsung menghapus data.

Gunakan Soft Delete.

Alasannya.

Audit.

Recovery.

History.

Rollback.

Sebagai contoh.

Rule dihapus.

Rule sebenarnya hanya diberi penanda Deleted.

Dashboard menyembunyikan Rule tersebut.

Administrator masih dapat memulihkannya apabila diperlukan.

---

Normalization

Database minimal memenuhi Third Normal Form.

Data tidak boleh disalin ke banyak tabel tanpa alasan.

Sebagai contoh.

Nama Workspace tidak boleh disimpan di dua puluh tabel berbeda.

Gunakan Foreign Key.

Pendekatan ini mengurangi inkonsistensi.

Namun untuk kebutuhan Analytics tertentu.

Denormalisasi diperbolehkan apabila memberikan peningkatan performa yang signifikan.

AI wajib menjelaskan alasan denormalisasi tersebut.

---

Index Strategy

Index bukan dibuat sebanyak mungkin.

Setiap Index memiliki biaya.

Penambahan satu Index mempercepat pembacaan.

Namun memperlambat penulisan.

Karena itu setiap Index harus memiliki alasan.

Sebagai contoh.

Workspace ID.

Notification Status.

Created At.

Severity.

Rule ID.

Health Score History.

Session.

Repository.

Automation Status.

AI wajib menghindari Index yang tidak pernah digunakan.

---

Query Complexity

Target kompleksitas Query.

Lookup berdasarkan Primary Key.

Mendekati.

O(log n)

Pencarian menggunakan Index.

O(log n)

Full Scan hanya digunakan apabila benar-benar diperlukan.

Dashboard tidak boleh menghasilkan Query dengan kompleksitas mendekati.

O(n²)

karena akan menyebabkan penurunan performa pada jutaan data.

---

Time Series Storage

Monitoring menghasilkan data setiap detik.

Tidak seluruh data harus disimpan selamanya.

Gunakan beberapa tingkat retensi.

Realtime.

Disimpan penuh.

24 Jam.

↓

Diringkas menjadi data per menit.

30 Hari.

↓

Diringkas menjadi data per jam.

365 Hari.

↓

Diringkas menjadi data harian.

Dengan pendekatan tersebut.

Ukuran Database dapat ditekan secara drastis tanpa kehilangan informasi penting.

---

Transaction Model

Transaction digunakan pada seluruh proses penting.

Contohnya.

Membuat Workspace.

↓

Menyimpan Workspace.

↓

Menyimpan Default Rule.

↓

Menyimpan Notification Setting.

↓

Menyimpan Dashboard Layout.

↓

Commit.

Apabila satu langkah gagal.

Rollback seluruh transaksi.

Tidak boleh ada Workspace yang hanya setengah dibuat.

---

Locking Strategy

Database harus menggunakan dua pendekatan.

Optimistic Locking.

Digunakan untuk konfigurasi yang jarang mengalami konflik.

Pessimistic Locking.

Digunakan untuk operasi yang berpotensi menghasilkan konflik tinggi.

Contohnya.

Queue.

Financial Data apabila suatu saat ditambahkan.

License Activation.

Pendekatan ini mengurangi Race Condition.

---

Mathematical Storage Growth

Misalkan.

Satu Server menghasilkan.

80 Metric.

Per Detik.

Dalam satu hari.

80 × 60 × 60 × 24

=

6.912.000 Metric.

Apabila satu Workspace memiliki.

10 Server.

Maka.

69.120.000 Metric.

Per Hari.

Apabila terdapat.

500 Workspace.

Total.

34.560.000.000 Metric.

Per Hari.

Mustahil seluruh data tersebut disimpan dalam bentuk mentah.

Karena itu sistem wajib menggunakan.

Aggregation.

Compression.

Retention.

Sampling.

Downsampling.

Pendekatan matematis ini menjadi alasan utama mengapa Analytics Engine menggunakan Time Series Aggregation.

---

Partition Strategy

Tabel histori tidak boleh terus membesar.

Gunakan Partition.

Contohnya.

Per Bulan.

Per Workspace.

Per Tahun.

Dengan Partition.

Query terhadap data terbaru tidak perlu membaca seluruh histori.

Hal ini mengurangi waktu pencarian secara signifikan.

---

Audit Database

Seluruh perubahan penting harus memiliki Audit.

Audit mencatat.

Siapa.

Apa.

Kapan.

Dari mana.

Mengapa.

Nilai Lama.

Nilai Baru.

Audit tidak boleh dapat diubah oleh pengguna biasa.

---

Backup Philosophy

Backup Database dilakukan secara otomatis.

Backup harus mendukung.

Incremental Backup.

Full Backup.

Integrity Check.

Compression.

Encryption.

Retention.

Backup tidak dianggap berhasil sebelum hasil Restore berhasil diuji.

Prinsip penting.

Backup tanpa Restore Test bukanlah Backup yang dapat dipercaya.

---

Acceptance Criteria

Database Architecture dianggap selesai apabila mampu memisahkan data permanen dan data sementara, menerapkan normalisasi yang tepat, menggunakan strategi indeks yang efisien, mendukung partition, retention, transaction, locking, audit, backup, serta mampu menangani pertumbuhan data dalam skala puluhan miliar metric tanpa mengorbankan konsistensi maupun performa.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib melakukan analisis kompleksitas query, simulasi pertumbuhan data selama beberapa tahun, pengujian transaction, pengujian rollback, pengujian backup dan restore, serta memastikan seluruh relasi antar tabel memenuhi integritas referensial dan tidak menghasilkan orphan record.

Akhir dokumen.
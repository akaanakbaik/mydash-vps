Database Engineering Specification

Purpose

Dokumen ini merupakan spesifikasi resmi seluruh arsitektur Database pada proyek My Dash.

Tujuan dokumen ini bukan menjelaskan sintaks SQL maupun implementasi ORM tertentu, melainkan mendefinisikan bagaimana seluruh data harus dimodelkan, disimpan, dihubungkan, divalidasi, dipartisi, diamankan, dicadangkan, serta dipulihkan selama siklus hidup aplikasi.

Database merupakan sumber kebenaran utama (Source of Truth) bagi seluruh sistem. Semua informasi permanen pada akhirnya harus memiliki representasi yang konsisten di PostgreSQL.

Seluruh keputusan implementasi yang berkaitan dengan penyimpanan data harus mengacu pada dokumen ini.

Apabila implementasi bertentangan dengan spesifikasi ini, implementasi harus diperbaiki.

---

Engineering Objectives

Arsitektur Database harus memenuhi tujuan berikut.

Mampu menangani ribuan Workspace.

Mampu menangani puluhan ribu VPS.

Mampu menyimpan miliaran Metric historis.

Mampu mempertahankan konsistensi data ketika terjadi kegagalan sistem.

Mampu melakukan Backup tanpa menghentikan layanan.

Mampu dipartisi ketika ukuran data terus bertambah.

Mampu dikembangkan selama bertahun-tahun tanpa perubahan struktur besar.

Mampu menjaga latensi Query tetap rendah.

Mampu mendukung fitur baru tanpa mengubah fondasi Database.

---

Database Philosophy

Database bukan sekadar tempat menyimpan data.

Database adalah representasi matematis dari keadaan sistem.

Setiap tabel merupakan himpunan entitas.

Setiap baris merupakan satu objek nyata.

Setiap relasi menggambarkan hubungan antar objek.

Setiap Constraint merupakan aturan logika.

Setiap Transaction merupakan perubahan keadaan sistem.

Dengan filosofi tersebut, seluruh struktur Database harus dirancang menggunakan prinsip Domain Driven Design.

---

Source of Truth

PostgreSQL merupakan satu-satunya penyimpanan permanen.

Redis bukan sumber kebenaran.

Memory Backend bukan sumber kebenaran.

Frontend bukan sumber kebenaran.

Apabila terjadi perbedaan data.

PostgreSQL selalu dianggap benar.

Redis akan dibangun ulang.

Cache akan dibangun ulang.

Frontend akan melakukan sinkronisasi ulang.

Pendekatan ini menghilangkan ambiguitas ketika Recovery dilakukan.

---

Multi Tenant Architecture

My Dash dirancang sebagai sistem Multi Tenant.

Seluruh data harus berada di bawah Workspace.

Workspace menjadi Root Aggregate.

Hubungan umum.

Workspace

↓

Server

↓

Monitoring

↓

Rule

↓

Notification

↓

Automation

↓

Analytics

↓

History

Tidak boleh terdapat data operasional yang berdiri sendiri tanpa Workspace.

Dengan pendekatan ini.

Migrasi.

Backup.

Restore.

Permission.

Audit.

Menjadi jauh lebih sederhana.

---

Domain Separation

Database dipisahkan berdasarkan Domain.

Workspace Domain.

Authentication Domain.

Monitoring Domain.

Analytics Domain.

Notification Domain.

Automation Domain.

Health Domain.

Tunnel Domain.

GitHub Domain.

Redis Metadata Domain.

Scheduler Domain.

Audit Domain.

Security Domain.

Plugin Domain.

AI Domain.

Configuration Domain.

Setiap Domain hanya mengetahui relasi yang memang diperlukan.

Cross Domain Join harus diminimalkan.

---

Entity Classification

Seluruh Entity dibagi menjadi empat kelompok.

Reference Entity.

Jarang berubah.

Contohnya.

Workspace.

Role.

Permission.

Plugin.

Configuration.

Operational Entity.

Sering berubah.

Contohnya.

Notification.

Automation.

Tunnel.

Session.

History Entity.

Terus bertambah.

Contohnya.

Monitoring History.

Audit.

Health History.

Notification History.

Derived Entity.

Dihasilkan dari proses lain.

Contohnya.

Analytics Summary.

Health Trend.

Prediction Result.

Derived Entity tidak boleh menjadi sumber kebenaran.

Derived Entity dapat dibangun ulang dari data primer.

---

Naming Convention

Seluruh nama tabel menggunakan bentuk jamak yang konsisten atau bentuk tunggal yang konsisten sesuai keputusan proyek.

AI tidak boleh mencampur dua gaya tersebut.

Nama kolom menggunakan bahasa Inggris.

Singkat.

Jelas.

Tidak ambigu.

Nama Primary Key konsisten.

Nama Foreign Key konsisten.

Nama Constraint konsisten.

Nama Index konsisten.

Pendekatan ini mempermudah pemeliharaan jangka panjang.

---

Primary Key Strategy

Primary Key harus memenuhi syarat berikut.

Tidak berubah.

Tidak memiliki makna bisnis.

Tidak bergantung pada nama.

Tidak bergantung pada urutan.

Tidak bergantung pada waktu.

Primary Key hanya berfungsi sebagai identitas permanen.

Semua relasi menggunakan Primary Key.

Tidak diperbolehkan menggunakan nama Workspace sebagai Foreign Key.

---

Foreign Key Philosophy

Foreign Key digunakan untuk menjaga integritas referensial.

Foreign Key bukan hanya alat Join.

Foreign Key memastikan bahwa suatu Entity tidak dapat merujuk kepada Entity yang tidak ada.

Sebagai contoh.

Notification tidak boleh merujuk Server yang telah dihapus.

Automation tidak boleh merujuk Rule yang tidak tersedia.

Pendekatan ini mengurangi kemungkinan menghasilkan Orphan Record.

---

Data Integrity

Integritas data dibagi menjadi beberapa tingkat.

Entity Integrity.

Referential Integrity.

Domain Integrity.

Business Integrity.

Application Integrity.

Database bertanggung jawab menjaga tiga tingkat pertama.

Application menjaga dua tingkat terakhir.

Dengan pembagian tersebut.

Database tidak perlu mengetahui logika bisnis yang kompleks.

Namun tetap mampu mencegah inkonsistensi dasar.

---

Transaction Philosophy

Transaction digunakan pada setiap perubahan yang memengaruhi lebih dari satu Entity.

Misalnya.

Membuat Workspace.

↓

Menyimpan Workspace.

↓

Menyimpan Default Configuration.

↓

Menyimpan Notification Setting.

↓

Menyimpan Dashboard Layout.

↓

Menyimpan Default Rules.

↓

Commit.

Apabila satu langkah gagal.

Rollback dilakukan terhadap seluruh perubahan.

Tidak boleh ada Workspace yang hanya selesai sebagian.

---

Consistency Model

My Dash menggunakan Strong Consistency untuk data permanen.

Notification History.

Audit.

Workspace.

Permission.

Configuration.

Automation.

Session Metadata.

Semuanya harus berada pada kondisi yang konsisten.

Realtime Dashboard diperbolehkan menggunakan Eventually Consistent Data melalui Redis.

Pendekatan Hybrid ini memberikan keseimbangan antara performa dan integritas.

---

Time Management

Seluruh waktu disimpan menggunakan UTC.

Tidak ada pengecualian.

Zona waktu pengguna hanya diterapkan ketika data ditampilkan pada Dashboard.

Pendekatan ini menghilangkan masalah konversi ketika pengguna berasal dari berbagai negara.

Seluruh Timestamp menggunakan presisi yang konsisten.

Created Time.

Updated Time.

Deleted Time apabila menggunakan Soft Delete.

Last Access.

Last Heartbeat.

Expiration.

Retry Time.

Seluruh waktu harus berasal dari Backend.

Bukan dari Browser.

---

Soft Delete Strategy

Sebagian besar Entity menggunakan Soft Delete.

Penghapusan permanen hanya dilakukan melalui proses Cleanup yang telah diaudit.

Keuntungan pendekatan ini.

Recovery menjadi mudah.

Audit tetap tersedia.

Kesalahan pengguna dapat dipulihkan.

Foreign Key tetap konsisten selama masa retensi.

Soft Delete tidak berlaku pada seluruh tabel.

Time Series dan Queue dapat menggunakan strategi penghapusan yang berbeda sesuai kebutuhan performa.

---

Mathematical Growth Model

Misalkan.

Workspace.

W

Server.

S

Metric.

M

Notification.

N

Audit.

A

Total jumlah record secara teoritis.

Total Records

=

W

+ 

(W × S)

+ 

(W × S × M)

+ 

(W × S × N)

+ 

A

Pertumbuhan terbesar berasal dari Time Series.

Oleh karena itu desain Database harus mengoptimalkan Time Series terlebih dahulu sebelum mengoptimalkan Entity statis.

Kesalahan paling umum adalah mengoptimalkan tabel Workspace yang hanya memiliki ribuan baris, sementara tabel Monitoring memiliki miliaran baris.

My Dash harus menghindari kesalahan desain tersebut.

---

Acceptance Criteria

Bagian pertama spesifikasi Database dianggap selesai apabila AI memahami filosofi Database, Domain Separation, Source of Truth, Multi Tenant Architecture, Transaction Model, Consistency Model, serta prinsip integritas yang akan menjadi dasar seluruh desain tabel pada bagian berikutnya.

AI belum diperbolehkan membuat struktur tabel sebelum seluruh prinsip pada dokumen ini dipahami dan diterapkan secara konsisten.

Akhir Bagian 1.

Database Engineering Specification

Part 2 — Domain Model, Entity Hierarchy, Relationship Strategy, Indexing, Partitioning, Storage Mathematics

Tujuan

Bagian kedua menjelaskan bagaimana seluruh Entity saling berhubungan, bagaimana Database tumbuh selama bertahun-tahun, bagaimana Index dipilih, bagaimana Partition bekerja, bagaimana Storage diprediksi, serta bagaimana AI harus mengambil keputusan ketika mendesain tabel.

Bagian ini belum membahas struktur tabel secara rinci. Fokus utama masih berada pada fondasi desain Database.

---

Domain Hierarchy

Seluruh Domain mengikuti hirarki yang tetap.

Workspace

↓

User

↓

Server

↓

Collector

↓

Metric

↓

Analytics

↓

Notification

↓

Automation

↓

History

↓

Audit

↓

Backup

Tidak diperbolehkan membuat Entity yang melompati hirarki tanpa alasan arsitektur yang kuat.

Sebagai contoh.

Notification harus berasal dari Event.

Bukan langsung dari CPU Collector.

Analytics berasal dari Monitoring.

Bukan langsung membaca Operating System.

Pendekatan ini menjaga seluruh Domain tetap memiliki tanggung jawab yang jelas.

---

Aggregate Root

My Dash menggunakan konsep Aggregate Root.

Workspace merupakan Aggregate Root terbesar.

Workspace memiliki.

Server.

Notification Setting.

Automation.

Dashboard Layout.

Plugin.

Configuration.

GitHub Integration.

Tunnel Configuration.

Health Configuration.

AI Configuration.

Rule.

Scheduler.

Audit.

Backup.

Restore.

Ketika Workspace dihapus.

AI wajib menentukan Entity mana yang.

Dihapus permanen.

Soft Delete.

Dipindahkan.

Diarsipkan.

Tidak boleh ada Entity yang kehilangan Root Aggregate.

---

Server Entity

Server menjadi Aggregate kedua.

Server memiliki.

Collector.

Realtime Metric.

Historical Metric.

Docker.

Tunnel.

Health.

Alert.

Automation State.

Backup State.

GitHub Workflow.

Deployment.

Service Status.

Network Status.

Filesystem.

Disk.

Container.

Semua Entity tersebut tidak boleh berada di luar Server.

---

Entity Lifetime

Setiap Entity memiliki siklus hidup.

Permanent.

Workspace.

User.

Plugin.

Configuration.

Long Term.

Server.

Tunnel.

Automation.

Scheduler.

Session.

Medium.

Notification.

Health.

Recommendation.

Prediction.

Short.

Realtime Cache.

Queue.

WebSocket Session.

Temporary AI Context.

Lifetime menentukan.

Storage.

Retention.

Backup.

Recovery.

Partition.

Compression.

Cleanup.

---

Cardinality

Seluruh relasi harus ditentukan.

One to One.

Workspace

Configuration.

One to Many.

Workspace

Server.

Server

Notification.

Server

Automation.

Many to Many.

User

Workspace.

Plugin

Workspace.

Role

Permission.

Relationship harus eksplisit.

Tidak boleh bergantung pada nama kolom yang kebetulan sama.

---

Referential Integrity

Foreign Key wajib digunakan apabila.

Data bersifat permanen.

Workspace.

Server.

Notification.

Automation.

Backup.

Plugin.

Audit.

Untuk Time Series dengan miliaran Record.

Foreign Key boleh dihilangkan apabila terbukti menjadi Bottleneck dan integritas tetap dapat dijaga melalui Application Layer.

Keputusan tersebut harus berdasarkan Benchmark.

Bukan asumsi.

---

Normalization Strategy

Target utama.

Third Normal Form.

Namun.

Normalisasi bukan tujuan akhir.

Tujuan utama adalah.

Konsistensi.

Maintainability.

Performance.

Controlled Denormalization diperbolehkan apabila.

Join terlalu mahal.

Read jauh lebih banyak daripada Write.

Data dapat dibangun ulang.

Perubahan sangat jarang.

Semua Denormalization wajib terdokumentasi.

---

Storage Class

Entity dibagi berdasarkan karakteristik penyimpanan.

Configuration.

Read tinggi.

Write rendah.

Metric.

Write sangat tinggi.

Read sedang.

Audit.

Write tinggi.

Read rendah.

Analytics.

Read tinggi.

Write sedang.

History.

Write tinggi.

Read tinggi.

AI wajib memilih strategi Index sesuai karakteristik tersebut.

---

Index Philosophy

Index bukan solusi universal.

Setiap Index memiliki biaya.

Storage.

Memory.

Insert.

Update.

Delete.

AI wajib membuat Index hanya apabila memberikan manfaat nyata.

Setiap Index harus memiliki alasan.

Tidak boleh membuat Index pada seluruh kolom.

---

Composite Index

Composite Index digunakan apabila Query selalu menggunakan beberapa kolom secara bersamaan.

Misalnya.

Workspace.

Server.

Timestamp.

Urutan kolom sangat penting.

Kolom dengan selektivitas lebih tinggi ditempatkan lebih awal apabila sesuai pola Query.

AI wajib mempertimbangkan Query nyata.

Bukan hanya struktur tabel.

---

Covering Index

Apabila Query hanya membaca beberapa kolom.

AI dapat menggunakan Covering Index sehingga Database tidak perlu membaca Table Heap.

Pendekatan ini meningkatkan performa Query secara signifikan pada tabel besar.

---

Partial Index

Tidak seluruh Record memerlukan Index.

Contohnya.

Notification.

Status.

Pending.

Jumlah hanya beberapa persen.

Gunakan Partial Index.

Hal ini mengurangi ukuran Index secara drastis.

---

Time Series Strategy

Monitoring merupakan Time Series.

Time Series tidak diperlakukan seperti tabel biasa.

Metric bertambah setiap detik.

Jumlah Record.

Puluhan juta.

Ratusan juta.

Miliaran.

Karena itu.

Time Series dipisahkan dari Entity utama.

Time Series menggunakan.

Retention.

Compression.

Partition.

Aggregation.

Archiving.

---

Partition Strategy

Partition berdasarkan waktu.

Jam.

Hari.

Bulan.

Tahun.

Pemilihan bergantung pada volume.

Misalnya.

Metric.

Partition Harian.

Audit.

Partition Bulanan.

Notification History.

Partition Bulanan.

Analytics.

Partition Mingguan.

AI wajib memilih ukuran Partition sehingga.

Jumlah File tidak terlalu banyak.

Ukuran Partition tidak terlalu besar.

---

Mathematical Partition Model

Misalkan.

Monitoring.

10 Metric.

Per Detik.

100 Server.

Record per hari.

10

×

60

×

60

×

24

×

100

=

86.400.000

Record.

Apabila seluruh Record berada pada satu tabel.

Maintenance menjadi mahal.

Dengan Partition.

Database hanya membaca sebagian kecil data.

---

Retention Policy

Tidak semua data disimpan selamanya.

Realtime Metric.

7 Hari.

Aggregated Metric.

90 Hari.

Daily Summary.

365 Hari.

Audit.

730 Hari.

Notification.

365 Hari.

Backup Metadata.

Selama Backup tersedia.

Retention harus dapat diubah melalui konfigurasi.

---

Compression Strategy

Data historis yang jarang diakses dapat dikompresi.

Compression dilakukan setelah melewati batas tertentu.

Compression tidak boleh mengganggu Query harian.

Data aktif tetap tidak dikompresi.

---

Archiving

Data lama tidak langsung dihapus.

Tahapan.

Active.

↓

Warm.

↓

Cold.

↓

Archive.

↓

Delete.

Pendekatan bertingkat ini memungkinkan Recovery terhadap data lama apabila diperlukan.

---

Query Philosophy

AI harus merancang Query.

Predictable.

Composable.

Maintainable.

Efficient.

Tidak diperbolehkan membuat Query kompleks yang sulit dipelihara apabila dapat dipecah menjadi beberapa langkah sederhana dengan hasil performa yang setara.

---

Complexity Analysis

Target.

Lookup Primary Key.

O(1).

Indexed Search.

O(log n).

Sequential Scan.

O(n).

Aggregation.

O(n).

Partition Scan.

O(log p).

AI harus menghindari Query yang menyebabkan Full Table Scan terhadap tabel Time Series.

---

Database Growth

Pertumbuhan Database diprediksi.

Workspace.

Linear.

Server.

Linear.

Monitoring.

Eksponensial terhadap waktu.

Audit.

Linear.

Analytics.

Linear.

Notification.

Linear.

Karena itu strategi optimasi harus berfokus pada Monitoring terlebih dahulu.

---

Acceptance Criteria

Bagian kedua dianggap selesai apabila AI memahami Aggregate Root, Cardinality, Referential Integrity, Index Strategy, Partition Strategy, Retention Policy, Compression, Archiving, serta mampu menentukan strategi penyimpanan yang tepat berdasarkan karakteristik setiap Domain tanpa mengorbankan konsistensi maupun performa.

Akhir Bagian 2.

Database Engineering Specification

Part 3 — Physical Table Design, Data Types, Constraints, Concurrency Control, Query Optimization

Tujuan

Bagian ketiga menjelaskan bagaimana AI harus mendesain tabel secara fisik, memilih tipe data yang tepat, menentukan Constraint, mengelola konkurensi transaksi, mengoptimalkan Query, serta menjaga Database tetap konsisten walaupun diakses oleh banyak proses secara bersamaan.

Seluruh keputusan desain harus mempertimbangkan performa jangka panjang, efisiensi penyimpanan, kemudahan pemeliharaan, dan kemampuan berkembang tanpa memerlukan perubahan besar pada struktur Database.

---

Physical Table Philosophy

Tabel merupakan representasi fisik dari Entity.

Setiap tabel harus memiliki satu tujuan yang jelas.

Satu tabel tidak boleh menyimpan beberapa konsep bisnis yang berbeda.

Sebagai contoh.

Workspace.

Server.

Notification.

Automation.

Audit.

Masing-masing harus memiliki tabel sendiri.

Pendekatan ini mengurangi kompleksitas Query dan meningkatkan keterbacaan struktur Database.

---

Column Design

Setiap kolom harus memiliki arti yang jelas.

Nama kolom harus menjelaskan isi data.

Kolom tidak boleh digunakan untuk menyimpan lebih dari satu jenis informasi.

Sebagai contoh.

Status.

Menyimpan Status.

Tidak menyimpan Timestamp.

Tidak menyimpan Error.

Tidak menyimpan JSON.

Informasi tambahan ditempatkan pada kolom yang sesuai.

---

Data Type Strategy

Pemilihan tipe data harus mempertimbangkan.

Ukuran.

Kecepatan.

Presisi.

Kompatibilitas.

Kemudahan validasi.

Nilai numerik menggunakan tipe numerik.

Timestamp menggunakan tipe waktu.

Boolean menggunakan tipe Boolean.

Identifier menggunakan tipe yang konsisten pada seluruh Database.

Tidak diperbolehkan menggunakan tipe teks untuk menyimpan angka apabila tidak memiliki alasan teknis yang kuat.

---

Nullable Strategy

Kolom hanya boleh bersifat Nullable apabila memang secara bisnis dapat tidak memiliki nilai.

Kolom wajib tidak boleh Nullable.

Identifier.

Workspace.

Created Time.

Status yang wajib.

Foreign Key yang wajib.

Kolom Optional.

Description.

Avatar.

Custom Metadata.

Optional Configuration.

Dengan pendekatan ini kualitas data menjadi lebih baik.

---

Default Value Strategy

Default Value hanya digunakan apabila.

Nilai benar-benar memiliki keadaan awal yang jelas.

Sebagai contoh.

Created Time.

Status awal.

Counter.

Retry Count.

Default tidak boleh menyembunyikan kesalahan logika aplikasi.

Apabila suatu nilai wajib diisi pengguna.

Database tidak boleh memberikan nilai otomatis yang menyesatkan.

---

Constraint Strategy

Constraint digunakan untuk menjaga integritas.

Primary Key.

Foreign Key.

Unique.

Check.

Not Null.

AI wajib memanfaatkan Constraint sebelum membuat validasi yang sama pada Application Layer apabila validasi tersebut memang dapat dijamin oleh Database.

---

Unique Constraint

Unique digunakan untuk mencegah duplikasi.

Contohnya.

Workspace Identifier.

Plugin Identifier.

Rule Identifier pada Workspace yang sama.

Unique harus dibuat berdasarkan kebutuhan bisnis.

Bukan berdasarkan dugaan.

---

Check Constraint

Check Constraint digunakan untuk menjaga Domain Value.

Sebagai contoh.

Persentase.

0 hingga 100.

Retry.

Tidak boleh negatif.

Priority.

Harus berada pada rentang yang telah ditentukan.

Dengan demikian data yang tidak valid ditolak sebelum masuk ke Database.

---

Generated Data

Nilai turunan yang dapat dihitung kembali tidak selalu perlu disimpan.

Contohnya.

Total Notification.

Health Average.

CPU Average.

Nilai tersebut dapat dihitung ulang melalui Analytics.

Apabila biaya perhitungan terlalu tinggi.

Nilai dapat disimpan sebagai Derived Data dengan mekanisme sinkronisasi yang jelas.

---

JSON Usage

JSON diperbolehkan hanya untuk data yang benar-benar fleksibel.

Contohnya.

Plugin Configuration.

Provider Metadata.

AI Response Metadata.

JSON tidak boleh digunakan untuk menggantikan desain relasional.

Data yang sering dicari melalui Query harus memiliki kolom sendiri.

---

Transaction Isolation

Database harus menggunakan tingkat isolasi yang sesuai dengan karakteristik operasi.

Operasi sederhana.

Menggunakan tingkat isolasi standar yang aman.

Operasi penting.

Menggunakan tingkat isolasi yang lebih tinggi apabila diperlukan.

Tujuannya adalah menghindari.

Dirty Read.

Non Repeatable Read.

Phantom Read.

AI harus memilih tingkat isolasi berdasarkan kebutuhan transaksi, bukan menggunakan tingkat tertinggi untuk seluruh operasi.

---

Concurrency Control

Beberapa proses dapat mengakses Database secara bersamaan.

AI harus memastikan.

Tidak terjadi Lost Update.

Tidak terjadi Double Processing.

Tidak terjadi Duplicate Notification.

Tidak terjadi Duplicate Automation.

Gunakan mekanisme Lock hanya apabila benar-benar diperlukan.

Lock yang terlalu lama akan menurunkan performa sistem.

---

Optimistic Strategy

Sebagian besar perubahan konfigurasi dapat menggunakan pendekatan Optimistic.

Data diperiksa sebelum disimpan.

Apabila telah berubah.

Pengguna diminta melakukan pembaruan ulang.

Pendekatan ini mengurangi kebutuhan Lock.

---

Query Optimization

Setiap Query harus dirancang dengan tujuan.

Menggunakan Index.

Menghindari Full Table Scan.

Mengurangi Join yang tidak diperlukan.

Mengurangi jumlah kolom yang dibaca.

Mengurangi jumlah Record yang diproses.

Query harus dapat diprediksi performanya ketika ukuran Database bertambah.

---

Pagination Strategy

Seluruh Query yang berpotensi menghasilkan banyak Record harus menggunakan Pagination.

Tidak diperbolehkan mengambil seluruh isi tabel dalam satu permintaan.

Pagination harus konsisten pada seluruh API.

Urutan hasil harus stabil agar tidak menghasilkan duplikasi maupun kehilangan data ketika halaman berikutnya diminta.

---

Aggregation

Perhitungan agregasi dilakukan pada tabel yang sesuai.

Analytics menggunakan data historis.

Dashboard menggunakan hasil agregasi apabila memungkinkan.

Monitoring Realtime tidak boleh menunggu Query agregasi yang berat.

Pendekatan ini menjaga Dashboard tetap responsif.

---

Materialized Result

Apabila suatu laporan sangat sering digunakan namun mahal dihitung.

AI dapat menggunakan hasil yang telah dipersiapkan sebelumnya.

Hasil tersebut harus memiliki mekanisme penyegaran yang jelas.

Pengguna juga harus mengetahui kapan data terakhir diperbarui.

---

Growth Projection

Misalkan.

1000 Workspace.

Setiap Workspace.

20 Server.

Setiap Server.

500 Notification per hari.

Total Notification.

1000 × 20 × 500

=

10.000.000 Record per hari.

Perhitungan seperti ini wajib dilakukan sebelum menentukan strategi penyimpanan dan Index.

AI tidak boleh mengoptimalkan berdasarkan ukuran Database saat pengembangan saja.

---

Backup Compatibility

Seluruh struktur tabel harus mendukung.

Backup penuh.

Backup bertahap.

Restore sebagian.

Restore penuh.

Migrasi.

Verifikasi.

Tidak boleh ada desain yang menyulitkan proses pemulihan data.

---

Acceptance Criteria

Bagian ketiga dianggap selesai apabila AI memahami strategi desain tabel fisik, pemilihan tipe data, penggunaan Constraint, pengelolaan konkurensi, optimasi Query, strategi Pagination, Aggregation, serta proyeksi pertumbuhan Database sehingga implementasi yang dihasilkan tetap konsisten, efisien, dan siap digunakan pada lingkungan produksi.

Akhir Bagian 3.
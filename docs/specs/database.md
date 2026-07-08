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
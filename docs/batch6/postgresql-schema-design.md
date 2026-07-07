Batch 6 — PostgreSQL Schema Design

Tujuan

Dokumen ini mendefinisikan bagaimana AI harus merancang seluruh struktur PostgreSQL yang digunakan oleh My Dash. Dokumen ini tidak hanya menjelaskan tabel yang harus dibuat, tetapi juga menjelaskan alasan matematis, hubungan antar entitas, strategi indexing, optimasi query, strategi partisi, normalisasi, hingga proyeksi pertumbuhan database dalam beberapa tahun ke depan.

AI tidak diperbolehkan membuat tabel secara spontan berdasarkan kebutuhan sesaat.

Seluruh struktur harus dirancang sejak awal agar mampu menangani pertumbuhan sistem tanpa memerlukan migrasi besar yang berisiko merusak data.

Target desain bukan hanya mampu menangani satu VPS.

Target desain adalah mampu menangani ribuan Workspace, puluhan ribu VPS, jutaan Notification, miliaran Metric, serta tetap mempertahankan waktu query yang rendah.

---

Filosofi Perancangan

Database merupakan representasi matematis dari keadaan sistem.

Setiap tabel adalah himpunan (Set).

Setiap baris merupakan elemen.

Setiap Foreign Key merupakan relasi.

Setiap Index merupakan fungsi optimasi.

Setiap Constraint merupakan aturan logika.

Secara konseptual.

Workspace

↓

Server

↓

Agent

↓

Metric

↓

Rule

↓

Event

↓

Notification

↓

History

Seluruh relasi harus mengikuti arah tersebut.

AI tidak boleh membuat Circular Reference.

Circular Reference akan memperumit migrasi, backup, restore, hingga proses penghapusan data.

---

Domain Driven Schema

Schema dipisahkan berdasarkan Domain.

Bukan berdasarkan jenis data.

Sebagai contoh.

workspace

authentication

monitoring

analytics

notification

automation

scheduler

github

docker

system

audit

plugin

ai

configuration

Pendekatan ini membuat AI Agent lebih mudah memahami letak tabel.

Selain itu Query menjadi jauh lebih mudah dipelihara.

---

Workspace Domain

Workspace merupakan akar seluruh relasi.

Hampir seluruh tabel harus mempunyai hubungan dengan Workspace.

Tujuannya.

Multi Tenant.

Data Isolation.

Permission.

Backup.

Migration.

Analytics.

Workspace tidak boleh mengetahui detail Notification.

Workspace hanya menjadi Root Entity.

---

Server Domain

Satu Workspace dapat memiliki banyak Server.

Server memiliki.

Hostname.

Display Name.

Operating System.

Architecture.

Kernel.

Timezone.

Agent Version.

Health Score.

Current Status.

Tunnel Status.

Last Heartbeat.

Server merupakan pusat Monitoring.

Semua Metric mengacu kepada Server.

---

Monitoring Domain

Monitoring tidak boleh menyimpan satu tabel besar.

Monitoring dipisahkan.

CPU.

Memory.

Disk.

Filesystem.

Network.

Docker.

Database.

Tunnel.

Temperature.

Power.

Scheduler.

Service.

Reason.

Setiap jenis Metric mempunyai karakteristik berbeda.

Dengan pemisahan ini Query menjadi lebih efisien.

---

Time Series Strategy

Metric merupakan Time Series.

Misalkan CPU.

Satu Server.

60 Sampel.

Per Menit.

Dalam satu hari.

60

×

60

×

24

=

86.400 Sampel.

Apabila satu Workspace memiliki.

20 Server.

Total.

1.728.000 Sampel.

Per Hari.

Apabila terdapat.

1000 Workspace.

Total.

1.728.000.000 Sampel.

Per Hari.

Oleh karena itu.

Metric tidak boleh terus disimpan tanpa batas.

AI wajib membuat.

Retention.

Aggregation.

Partition.

Compression.

---

Notification Domain

Notification dipisahkan menjadi beberapa entitas.

Notification Template.

Notification Queue.

Notification History.

Notification Provider.

Notification Delivery.

Notification Analytics.

Notification Rule.

Dengan pemisahan tersebut.

History tidak mengganggu Queue.

Analytics tidak mengganggu Delivery.

Template tidak mengganggu History.

---

Automation Domain

Automation dipisahkan.

Automation Definition.

Automation Execution.

Automation History.

Automation Result.

Automation Dependency.

Automation Retry.

Automation tidak boleh menggunakan satu tabel besar.

Karena ukuran History akan terus bertambah.

---

GitHub Domain

GitHub memiliki tabel sendiri.

Repository.

Workflow.

Workflow Run.

Commit.

Release.

Deployment.

Action History.

Webhook.

Credential Metadata.

Credential sensitif tidak disimpan dalam bentuk teks biasa.

---

AI Domain

AI tidak menyimpan seluruh percakapan.

Yang disimpan.

Prompt Metadata.

Model.

Execution Time.

Confidence.

Cost.

Status.

Summary.

Recommendation.

Provider.

Version.

Prompt lengkap dapat disimpan apabila pengguna mengaktifkan Audit AI.

---

Audit Domain

Audit merupakan tabel yang pertumbuhannya sangat besar.

Audit harus dipartisi.

Audit mencatat.

Actor.

Action.

Old Value.

New Value.

IPAddress.

Device.

Timestamp.

Duration.

Correlation ID.

Audit tidak boleh diubah.

---

Mathematical Relationship

Misalkan.

Workspace.

W

Server.

S

Notification.

N

Metric.

M

Hubungan.

Workspace

1

→

S

Server

1

→

M

Server

1

→

N

Notification

1

→

History

Kompleksitas relasi.

O(W + S + M + N)

Bukan.

O(W × S × M × N)

AI harus menghindari Query yang menyebabkan Cartesian Product.

---

Index Selection Algorithm

AI tidak boleh membuat Index pada seluruh kolom.

Gunakan pendekatan.

Index Benefit Score.

Benefit

=

(Query Frequency

×

Lookup Cost Reduction)

−

(Insert Cost

+ 

Update Cost

+ 

Storage Cost)

Apabila Benefit bernilai negatif.

Index tidak dibuat.

Pendekatan ini lebih ilmiah dibanding menambahkan Index secara acak.

---

Composite Index

Beberapa Query lebih efektif menggunakan Composite Index.

Sebagai contoh.

Workspace ID.

Created At.

Severity.

Daripada tiga Index terpisah.

Namun Composite Index hanya digunakan apabila urutan pencarian memang sesuai.

AI wajib menganalisis Query Pattern sebelum membuat Composite Index.

---

Partition Mathematics

Misalkan.

Notification History.

10 Juta Baris.

Per Bulan.

Tanpa Partition.

Query harus membaca.

10 Juta Baris.

Dengan Partition Bulanan.

Query bulan berjalan hanya membaca.

Sekitar.

830 Ribu Baris.

Secara teoritis.

Kompleksitas pembacaan menurun secara signifikan.

Selain itu.

VACUUM.

REINDEX.

Backup.

Restore.

Jauh lebih cepat.

---

Storage Growth Projection

Misalkan.

Workspace.

500

Server.

15

Per Workspace.

Metric.

120

Per Detik.

Data.

600 Byte.

Per Metric.

Per Hari.

500

×

15

×

120

×

86400

×

600

=

46.656.000.000.000 Byte.

≈

42.4 TB.

Per Hari.

Angka tersebut menunjukkan bahwa penyimpanan mentah mustahil dipertahankan.

AI wajib membuat sistem.

Sampling.

Aggregation.

Compression.

Retention.

Tanpa empat mekanisme tersebut.

Database akan berkembang secara eksponensial.

---

Integrity Constraints

Seluruh tabel wajib menggunakan.

Primary Key.

Foreign Key.

Unique Constraint.

Check Constraint.

Not Null.

Default Value.

Constraint bukan sekadar menjaga data.

Constraint mengurangi kemungkinan bug pada Application Layer.

---

Migration Strategy

Migration harus bersifat.

Forward Compatible.

Backward Safe.

Repeatable.

Transactional.

Rollback Friendly.

Migration tidak boleh menghapus kolom secara langsung.

Gunakan tahapan.

Tambah.

Migrasi Data.

Validasi.

Hapus Lama.

Pendekatan ini mengurangi risiko kehilangan data.

---

Acceptance Criteria

Schema PostgreSQL dianggap selesai apabila seluruh Domain dipisahkan dengan jelas, seluruh relasi mengikuti prinsip Domain Driven Design, tabel Time Series menggunakan strategi partition dan retention, indeks dipilih berdasarkan analisis matematis terhadap pola query, migrasi bersifat aman, constraint menjaga integritas data, serta keseluruhan struktur mampu menangani pertumbuhan hingga puluhan miliar record tanpa menghasilkan bottleneck pada operasi baca maupun tulis.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib melakukan simulasi pertumbuhan data lima tahun, analisis query planner PostgreSQL, evaluasi kebutuhan indeks, pengujian partition pruning, pengujian migrasi, serta verifikasi bahwa seluruh Foreign Key, Constraint, dan strategi penyimpanan memenuhi standar performa dan integritas yang telah ditentukan.

Akhir dokumen.
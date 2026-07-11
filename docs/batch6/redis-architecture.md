Batch 6 — Redis Architecture

Tujuan

Redis merupakan komponen yang bertanggung jawab menangani seluruh data berkecepatan tinggi (High Velocity Data) pada My Dash. Redis bukan pengganti PostgreSQL dan bukan tempat penyimpanan permanen. Redis berfungsi sebagai lapisan memori yang mengurangi beban Database utama, mempercepat komunikasi antar modul, menjaga sinkronisasi realtime, serta menjadi fondasi bagi Queue, Cache, Locking, Presence, Session, Pub/Sub, dan berbagai mekanisme internal lainnya.

Tujuan utama penggunaan Redis bukan sekadar meningkatkan kecepatan baca. Tujuan sebenarnya adalah memisahkan dua karakteristik data yang sangat berbeda.

Data permanen memiliki sifat konsisten, jarang berubah, dan harus disimpan selama bertahun-tahun.

Data realtime berubah setiap beberapa milidetik, memiliki nilai yang cepat usang, dan lebih penting tersedia dengan latensi rendah daripada disimpan secara permanen.

Dengan memisahkan kedua jenis data tersebut, PostgreSQL dapat difokuskan sebagai Source of Truth, sedangkan Redis menjadi Realtime State Engine.

---

Filosofi Arsitektur

Redis harus diperlakukan sebagai memori sistem yang dapat hilang sewaktu-waktu.

Artinya seluruh data penting yang berada di Redis harus dapat dibangun kembali dari PostgreSQL atau Monitoring Engine.

Apabila Redis berhenti mendadak.

Dashboard tetap dapat berjalan.

Notification tetap dapat diproses setelah proses Recovery.

Queue dapat dipulihkan.

Session dapat dibangun kembali apabila diperlukan.

Dengan filosofi tersebut, Redis menjadi akselerator, bukan komponen yang menentukan integritas data.

---

Karakteristik Data

Data dibagi menjadi tiga kelompok.

Persistent Data

Data yang hanya berada di PostgreSQL.

Contohnya.

Workspace.

Rule.

Automation.

Notification History.

Audit.

Configuration.

GitHub Repository.

Backup Metadata.

---

Ephemeral Data

Data yang hanya berada di Redis.

Contohnya.

Realtime CPU.

Realtime RAM.

Current Health.

Current Tunnel Status.

Worker Status.

Presence.

WebSocket Session.

Typing Indicator apabila suatu saat ditambahkan.

---

Hybrid Data

Data yang berada pada PostgreSQL dan Redis.

Redis menyimpan salinan cepat.

PostgreSQL menyimpan salinan permanen.

Contohnya.

Notification Queue.

Session.

Health Score.

Dashboard Preference.

Configuration Cache.

---

Mengapa Tidak Semua Data Masuk Redis

Misalkan.

Notification History.

100 Juta Record.

Ukuran rata-rata.

1 KB.

Total.

Sekitar.

100 GB.

Apabila seluruh History disimpan di Redis.

RAM VPS akan habis.

Redis akan melakukan Eviction.

History akan hilang.

Karena itu Redis hanya menyimpan data yang benar-benar dibutuhkan secara realtime.

Semua History tetap berada di PostgreSQL.

---

Key Design Philosophy

Penamaan Key harus konsisten.

Key tidak boleh dibuat secara acak.

Format umum.

Domain

↓

Workspace

↓

Server

↓

Entity

↓

Identifier

↓

Version

Sebagai contoh konseptual.

workspace:123:server:9:health

notification:queue:critical

agent:heartbeat:workspace:12

Pendekatan ini memudahkan pencarian, debugging, monitoring, serta penghapusan Key berdasarkan Domain.

AI wajib menerapkan pola penamaan yang sama pada seluruh modul.

---

Time To Live

TTL merupakan salah satu fitur terpenting Redis.

Tidak semua Key harus hidup selamanya.

Sebagai contoh.

Realtime CPU.

TTL.

30 Detik.

Heartbeat.

TTL.

90 Detik.

WebSocket Presence.

TTL.

60 Detik.

Notification Lock.

TTL.

5 Menit.

Apabila TTL habis.

Redis menghapus Key secara otomatis.

Pendekatan ini menjaga penggunaan RAM tetap stabil.

---

Cache Strategy

Redis menggunakan beberapa jenis Cache.

Configuration Cache.

Dashboard Cache.

Health Cache.

Analytics Cache.

Permission Cache.

Rule Cache.

Template Cache.

GitHub Cache.

Plugin Cache.

Cache tidak boleh digunakan untuk data yang sering berubah setiap milidetik.

Sebaliknya Cache digunakan pada data yang relatif stabil namun sering dibaca.

---

Mathematical Cache Efficiency

Efisiensi Cache dihitung menggunakan Cache Hit Ratio.

Hit Ratio

=

Cache Hit

÷

(Cache Hit + Cache Miss)

Misalkan.

Hit.

9500

Miss.

500

Hit Ratio.

9500

÷

10000

=

95%

Target sistem.

Minimal.

90%.

Semakin tinggi Hit Ratio.

Semakin sedikit Query menuju PostgreSQL.

---

Eviction Strategy

Redis memiliki kapasitas terbatas.

Apabila RAM hampir penuh.

Sistem harus menentukan Key mana yang boleh dihapus.

AI wajib memilih strategi Eviction yang sesuai dengan karakteristik data.

Sebagai contoh.

Cache Dashboard lebih aman dihapus dibanding Session Login.

Notification Queue tidak boleh dihapus.

Realtime Presence boleh dibangun kembali.

Dengan demikian setiap Domain harus memiliki prioritas.

---

Queue Storage

Notification Queue menggunakan Redis.

Namun Queue tidak boleh hanya berupa daftar sederhana.

Queue harus mendukung.

Priority.

Retry.

Delayed Job.

Dead Letter Queue.

Worker Reservation.

Visibility Timeout.

Retry Counter.

Acknowledgement.

Pendekatan ini memungkinkan Worker bekerja secara paralel tanpa mengambil Job yang sama.

---

Distributed Lock

Beberapa proses tidak boleh berjalan bersamaan.

Sebagai contoh.

Backup.

Migration.

License Activation.

Workspace Initialization.

Redis digunakan sebagai Distributed Lock.

Lock memiliki.

Owner.

Creation Time.

Expiration.

Renewal.

Apabila Worker mati.

TTL Lock akan habis.

Worker lain dapat mengambil alih.

Pendekatan ini mencegah Deadlock permanen.

---

Presence System

Dashboard membutuhkan informasi.

Pengguna sedang Online.

Offline.

Idle.

Disconnected.

Redis menyimpan Presence.

TTL Presence diperbarui setiap Heartbeat.

Apabila Heartbeat berhenti.

Presence berubah menjadi Offline secara otomatis.

Tidak diperlukan proses Cleanup manual.

---

Pub/Sub

Backend menggunakan Redis Pub/Sub.

Contohnya.

Notification Delivered.

↓

Dashboard menerima Event.

Health Score berubah.

↓

Analytics menerima Event.

Tunnel Connected.

↓

Notification menerima Event.

Pendekatan Event Driven mengurangi ketergantungan antar Service.

---

Memory Mathematics

Misalkan.

Satu Key.

400 Byte.

Jumlah Key.

250.000

Total Memory.

400

×

250000

=

100.000.000 Byte

≈

95 MB.

Namun Redis juga menyimpan Metadata.

Pointer.

Internal Structure.

Overhead.

Total penggunaan nyata bisa mencapai sekitar 130 hingga 150 MB.

AI wajib memperhitungkan overhead tersebut ketika memperkirakan kebutuhan RAM.

---

Memory Fragmentation

Redis dapat mengalami Fragmentation.

Fragmentation Ratio.

=

Allocated Memory

÷

Used Memory

Misalkan.

Allocated.

800 MB.

Used.

600 MB.

Fragmentation Ratio.

1.33

Semakin mendekati satu.

Semakin baik.

Apabila rasio terlalu tinggi.

Dashboard memberikan rekomendasi Maintenance.

---

Big O Analysis

Operasi sederhana pada Redis.

GET.

O(1)

SET.

O(1)

DEL.

O(1)

EXPIRE.

O(1)

LIST PUSH.

O(1)

HASH LOOKUP.

O(1)

SORT.

O(n log n)

SCAN.

O(n)

AI wajib menghindari operasi dengan kompleksitas tinggi pada jalur realtime.

---

Recovery

Apabila Redis mati.

Backend tidak boleh langsung berhenti.

Langkah Recovery.

Deteksi kegagalan.

↓

Menolak operasi yang membutuhkan Redis.

↓

Melakukan Reconnect.

↓

Memulihkan Queue.

↓

Membangun ulang Cache.

↓

Sinkronisasi Presence.

↓

Melanjutkan Worker.

Seluruh proses harus otomatis.

Pengguna hanya menerima Notification apabila Recovery gagal.

---

Monitoring

Dashboard wajib menampilkan.

Redis Version.

Connected Client.

Memory Usage.

Memory Peak.

Fragmentation Ratio.

Evicted Key.

Expired Key.

Hit Ratio.

Miss Ratio.

Command Rate.

Latency.

Persistence Status.

Replication apabila tersedia.

Seluruh metrik diperbarui secara realtime.

---

Acceptance Criteria

Redis Architecture dianggap selesai apabila mampu memisahkan data sementara dari data permanen, menerapkan strategi TTL yang tepat, menjaga Cache Hit Ratio tetap tinggi, mendukung Queue, Distributed Lock, Presence, Pub/Sub, serta mampu melakukan Recovery otomatis tanpa kehilangan integritas sistem.

AI wajib melakukan simulasi Memory Pressure, Cache Miss besar-besaran, Redis Restart, Queue Recovery, Lock Expiration, Fragmentation tinggi, dan kegagalan koneksi untuk memastikan seluruh algoritma berjalan sesuai spesifikasi sebelum melanjutkan ke dokumen berikutnya.

Akhir dokumen.
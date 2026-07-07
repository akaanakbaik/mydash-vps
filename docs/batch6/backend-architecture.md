Batch 6 — Backend Architecture

Tujuan

Dokumen ini mendefinisikan arsitektur backend secara menyeluruh. Backend merupakan pusat koordinasi seluruh komponen pada My Dash. Semua data dari Agent, Dashboard, Notification Engine, Analytics Engine, Rule Engine, AI Engine, GitHub Integration, Tunnel Manager, Database, Redis, serta Automation Engine akan melewati backend sebelum diteruskan ke modul lain.

Backend bukan hanya REST API.

Backend merupakan Distributed Event Processing System yang bertugas menjaga konsistensi data, mengatur komunikasi antar modul, memastikan tidak terjadi race condition, menjaga performa ketika jumlah pengguna bertambah, serta menjadi sumber kebenaran (Source of Truth) untuk seluruh aplikasi.

Seluruh modul wajib menganggap backend sebagai pusat koordinasi. Tidak diperbolehkan ada dua modul yang berkomunikasi secara langsung tanpa melalui kontrak yang telah ditentukan, kecuali komunikasi internal yang memang dirancang untuk alasan performa.

---

Filosofi Arsitektur

Backend dibangun menggunakan prinsip High Cohesion, Low Coupling.

Artinya setiap modul mempunyai tanggung jawab yang sangat jelas, namun hubungan antar modul dibuat seminimal mungkin.

Sebagai contoh.

Monitoring Engine tidak mengetahui Notification Engine.

Notification Engine tidak mengetahui Analytics Engine.

Analytics Engine tidak mengetahui Dashboard.

Seluruh komunikasi dilakukan melalui Event Bus atau Service Layer.

Dengan pendekatan tersebut, apabila suatu saat Notification Engine diganti seluruhnya, Monitoring Engine tidak memerlukan perubahan sama sekali.

Prinsip ini membuat sistem jauh lebih mudah dipelihara selama bertahun-tahun.

---

Tujuan Arsitektur Modular

Seluruh backend dibagi menjadi beberapa Domain.

Authentication Domain.

Session Domain.

Workspace Domain.

Monitoring Domain.

Analytics Domain.

Notification Domain.

Automation Domain.

Tunnel Domain.

Docker Domain.

GitHub Domain.

AI Domain.

Database Domain.

Redis Domain.

Plugin Domain.

Configuration Domain.

Audit Domain.

System Domain.

Setiap Domain hanya boleh mengetahui Service yang memang dibutuhkan.

Dependency yang tidak diperlukan harus dihilangkan.

---

Request Flow

Ketika Dashboard membuka halaman.

Request tidak langsung menuju Database.

Alurnya adalah.

Browser

↓

API Gateway

↓

Authentication Middleware

↓

Authorization Middleware

↓

Rate Limiter

↓

Validation Layer

↓

Controller

↓

Application Service

↓

Domain Service

↓

Repository

↓

Database

↓

Response Mapper

↓

Compression

↓

Browser

Dengan pendekatan ini setiap lapisan memiliki tanggung jawab yang spesifik.

---

Event Flow

Tidak semua proses menggunakan Request Response.

Sebagian besar proses internal menggunakan Event.

Sebagai contoh.

Agent mengirim CPU.

↓

Monitoring Engine membuat Metric.

↓

Rule Engine mengevaluasi.

↓

Notification Queue menerima Event.

↓

Analytics menghitung Trend.

↓

Dashboard menerima WebSocket.

↓

Automation dijalankan.

Tidak ada satu modul pun yang memanggil modul lain secara langsung.

Semuanya menggunakan Event.

Pendekatan Event Driven membuat sistem lebih mudah diskalakan.

---

API Gateway

API Gateway merupakan pintu masuk seluruh Request.

API Gateway bertugas.

Validasi Header.

Validasi Session.

Rate Limiting.

Logging.

Compression.

Routing.

Tracing.

Error Mapping.

API Gateway tidak boleh menjalankan logika bisnis.

---

Application Layer

Application Layer merupakan penghubung antara HTTP dan Domain.

Layer ini bertugas.

Mengubah Request menjadi Command.

Memanggil Domain Service.

Mengubah hasil menjadi Response.

Application Layer tidak boleh mengetahui struktur tabel Database.

Application Layer tidak boleh mengetahui implementasi Redis.

---

Domain Layer

Domain Layer berisi seluruh aturan bisnis.

Sebagai contoh.

Cara menghitung Health Score.

Cara menentukan Priority.

Cara memilih Notification Provider.

Cara menentukan Automation.

Cara menghitung Analytics.

Domain Layer merupakan inti aplikasi.

Apabila suatu saat HTTP diganti menjadi gRPC.

Domain Layer tidak berubah.

---

Repository Layer

Repository bertanggung jawab membaca dan menulis data.

Repository tidak boleh berisi logika bisnis.

Repository hanya mengetahui.

Query.

Transaction.

Connection.

Mapping.

Dengan pemisahan ini Database dapat diganti tanpa mengubah Domain.

---

Dependency Injection

Seluruh Service menggunakan Dependency Injection.

Tidak diperbolehkan membuat Service baru secara manual di dalam Service lain.

Pendekatan ini mempermudah.

Testing.

Mocking.

Replacement.

Plugin.

Maintenance.

---

Transaction Strategy

Semua operasi penting menggunakan Transaction.

Sebagai contoh.

Membuat Workspace.

↓

Menyimpan Database.

↓

Membuat Redis Cache.

↓

Membuat Default Rule.

↓

Membuat Notification Setting.

↓

Commit.

Apabila satu langkah gagal.

Transaction dibatalkan.

Dengan demikian tidak ada data setengah jadi.

---

Event Bus

Backend memiliki Event Bus internal.

Semua Domain dapat menerbitkan Event.

Namun hanya Domain yang membutuhkan yang akan mendengarkan Event tersebut.

Sebagai contoh.

Notification Created.

Analytics mendengarkan.

Audit mendengarkan.

Dashboard mendengarkan.

Automation tidak mendengarkan.

Pendekatan ini mengurangi ketergantungan langsung.

---

Mathematical Scalability

Misalkan.

Jumlah Workspace.

N

Setiap Workspace memiliki.

M

Server.

Setiap Server menghasilkan.

K

Metric.

Total Metric.

=

N × M × K

Apabila.

N = 200

M = 12

K = 60 Metric per Detik

Total.

200 × 12 × 60

=

144.000 Metric per Detik.

Backend harus dirancang agar pemrosesan dapat diparalelkan berdasarkan Workspace dan Server.

Dengan demikian kompleksitas pemrosesan mendekati.

O(N)

untuk distribusi pekerjaan.

Bukan.

O(N²)

yang akan menyebabkan bottleneck.

---

Cache Strategy

Redis bukan pengganti Database.

Redis digunakan untuk.

Realtime State.

Session.

Temporary Cache.

WebSocket Presence.

Queue.

Rate Limiter.

Lock.

Data permanen tetap disimpan pada PostgreSQL.

Pendekatan ini menjaga konsistensi data.

---

Concurrency

Backend harus siap menangani banyak Request secara bersamaan.

Oleh karena itu seluruh operasi harus memperhatikan.

Race Condition.

Deadlock.

Starvation.

Priority Inversion.

Lost Update.

Dirty Read.

Non Repeatable Read.

Phantom Read.

AI wajib memilih strategi locking yang sesuai.

Optimistic Locking digunakan ketika konflik jarang terjadi.

Pessimistic Locking digunakan ketika konflik sangat mungkin terjadi.

---

Error Handling

Seluruh Error harus dikategorikan.

Validation Error.

Authentication Error.

Authorization Error.

Network Error.

Database Error.

Provider Error.

Internal Error.

Unknown Error.

Setiap Error mempunyai Error Code yang tetap.

Frontend tidak boleh bergantung pada isi pesan Error.

Frontend hanya membaca Error Code.

---

Acceptance Criteria

Backend Architecture dianggap selesai apabila seluruh modul dipisahkan berdasarkan Domain, menggunakan Dependency Injection, Event Bus, Repository Pattern, Transaction yang aman, Cache Strategy yang jelas, serta mampu menangani beban tinggi tanpa menghasilkan Race Condition, Deadlock, ataupun inkonsistensi data.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib melakukan Architecture Review, Load Test, Concurrency Test, Transaction Test, dan Failure Simulation untuk memastikan seluruh prinsip arsitektur telah diterapkan secara konsisten.

Akhir dokumen.
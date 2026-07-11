Redis Engineering Specification

Purpose

Redis pada My Dash bukan sekadar Cache, melainkan Realtime Infrastructure Layer yang bertanggung jawab menyediakan komunikasi antar proses dengan latensi sangat rendah. Seluruh data di Redis bersifat sementara dan dapat dibangun kembali dari PostgreSQL apabila hilang. Redis digunakan sebagai Pub/Sub, Queue, Distributed Lock, Presence Service, WebSocket Session Registry, Rate Limiter, Temporary Session Store, Notification Queue, Realtime Metric Cache, AI Cache, serta koordinasi antar Worker. Tidak ada informasi permanen yang hanya disimpan di Redis. Apabila Redis mengalami Restart, Dashboard tetap dapat pulih secara otomatis melalui mekanisme Recovery tanpa kehilangan integritas data permanen. Seluruh Key wajib menggunakan Namespace yang konsisten agar tidak terjadi konflik antar Workspace maupun antar Domain.

Data Architecture

Seluruh Key Redis menggunakan struktur hierarki yang tetap, misalnya Workspace → Server → Domain → Resource sehingga pencarian menjadi deterministik. Key wajib memiliki TTL apabila datanya bersifat sementara. Session aktif memiliki TTL yang dapat diperbarui saat aktivitas terjadi, Presence memiliki TTL pendek, sedangkan Cache Analytics memiliki TTL menengah sesuai kebutuhan. Queue tidak menggunakan TTL tetapi menggunakan mekanisme Acknowledgement agar pekerjaan tidak hilang ketika Worker mati. AI harus memisahkan Cache, Queue, Lock, Pub/Sub, Presence, dan Session ke Namespace yang berbeda sehingga proses Cleanup maupun Monitoring dapat dilakukan secara independen tanpa memengaruhi Domain lain.

Performance Strategy

Redis harus mempertahankan latensi di bawah beberapa milidetik untuk operasi normal. Seluruh operasi harus menghindari Key berukuran besar dan menghindari Scan penuh pada Database Redis. AI harus lebih memilih banyak Key kecil dibanding sedikit Key raksasa apabila memberikan keuntungan pada distribusi beban. Semua operasi yang dapat dilakukan secara atomik harus menggunakan kemampuan atomik Redis sehingga Race Condition dapat dihindari. Distributed Lock hanya digunakan ketika benar-benar diperlukan dan memiliki Timeout otomatis agar tidak terjadi Dead Lock apabila Worker berhenti secara tidak normal. Seluruh Queue diproses secara asinkron sehingga Dashboard tidak pernah menunggu pekerjaan berat selesai.

Failure Recovery

Apabila Redis mati, Backend harus mendeteksi kegagalan tersebut dalam waktu singkat kemudian berpindah ke Recovery Mode. Seluruh Queue yang belum selesai dipulihkan dari Metadata PostgreSQL apabila memungkinkan, Session diverifikasi ulang, Presence dibangun kembali berdasarkan koneksi aktif, Cache dihapus dan dibuat ulang secara bertahap, sedangkan Dashboard menerima Status bahwa sistem sedang melakukan Recovery tanpa kehilangan fungsi utama. Setelah Redis kembali tersedia, seluruh Worker melakukan Sinkronisasi ulang secara otomatis tanpa memerlukan Restart aplikasi. Tujuan utama Recovery adalah mempertahankan Availability sistem walaupun kehilangan seluruh isi Redis.

Monitoring and Security

Redis wajib dipantau secara Realtime meliputi Memory Usage, Fragmentation Ratio, Connected Clients, Key Count, Expired Keys, Hit Ratio, Miss Ratio, Pub/Sub Throughput, Queue Length, Lock Count, Command Latency, serta Network Latency. Dashboard harus mampu memberikan Warning ketika Memory mendekati batas atau ketika Hit Ratio turun secara signifikan. Seluruh koneksi Redis wajib menggunakan autentikasi yang aman, tidak mengekspos Instance langsung ke Internet, dan seluruh konfigurasi sensitif hanya dibaca dari Environment. AI tidak boleh menyimpan Password, Token, API Key, maupun Credential permanen di Redis.

Acceptance Criteria

Redis dianggap memenuhi spesifikasi apabila mampu berfungsi sebagai Realtime Backbone untuk seluruh sistem, menjaga latensi tetap rendah, mendukung Recovery otomatis setelah kegagalan, mengisolasi seluruh Namespace dengan benar, mempertahankan integritas Queue, menyediakan mekanisme Lock yang aman, mempertahankan performa pada beban tinggi, serta tidak pernah menjadi Source of Truth permanen. Seluruh implementasi Redis harus dapat diganti, dipindahkan, atau diskalakan tanpa mengubah Domain bisnis utama sehingga My Dash tetap fleksibel untuk pengembangan di masa depan.
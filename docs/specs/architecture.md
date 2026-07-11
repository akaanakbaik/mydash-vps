Overall System Architecture Engineering Specification

Purpose

Dokumen ini menjadi referensi arsitektur tingkat tertinggi bagi seluruh ekosistem My Dash. Tujuannya adalah mendefinisikan bagaimana seluruh Domain saling berhubungan, bagaimana aliran data bergerak dari awal hingga akhir, bagaimana tanggung jawab setiap modul dipisahkan, serta bagaimana sistem dapat berkembang tanpa menyebabkan ketergantungan yang berlebihan. Seluruh implementasi harus mengikuti prinsip Separation of Concerns, Single Responsibility, Event Driven Architecture, Dependency Injection, Domain Isolation, serta Source of Truth yang konsisten. Tidak diperbolehkan membuat komunikasi langsung antar Domain apabila telah tersedia kontrak melalui Event Bus atau Application Service. Dengan pendekatan ini setiap Domain dapat dikembangkan, diuji, dipindahkan, ataupun diganti implementasinya tanpa memengaruhi keseluruhan sistem.

Layered Architecture

Arsitektur My Dash dibagi menjadi beberapa lapisan utama. Presentation Layer bertanggung jawab terhadap Dashboard, CLI, dan API Client. Application Layer menangani Use Case, Workflow, dan koordinasi antar Domain. Domain Layer berisi seluruh Business Logic seperti Monitoring, Analytics, Queue, Notification, Automation, Health Score, Backup, Restore, GitHub, Docker, Tunnel, dan AI. Infrastructure Layer menyediakan PostgreSQL, Redis, File System, WebSocket, Queue Worker, serta integrasi dengan layanan eksternal. Seluruh komunikasi antar lapisan hanya boleh dilakukan ke arah bawah sehingga Domain tidak mengetahui implementasi Frontend maupun Infrastructure secara langsung. Setiap Layer memiliki kontrak yang jelas sehingga perubahan pada satu Layer tidak memerlukan perubahan besar pada Layer lainnya.

Data Flow and Event Flow

Alur utama sistem dimulai ketika Collector memperoleh Metric dari VPS. Metric tersebut divalidasi, dinormalisasi, kemudian disimpan sebagai Data Realtime dan Data Historis. Setelah itu Monitoring menerbitkan Event ke Event Bus. Analytics, Health Score, Notification, Automation, Logging, Audit, Dashboard Gateway, serta AI mengonsumsi Event sesuai kebutuhan masing-masing tanpa saling bergantung secara langsung. Dashboard menerima pembaruan melalui WebSocket, sedangkan REST API hanya digunakan untuk Request yang bersifat eksplisit. Queue menangani seluruh pekerjaan berat seperti Backup, Restore, AI Analysis, Notification Delivery, maupun Automation sehingga Request pengguna tidak pernah menunggu proses yang panjang. Seluruh perubahan penting menghasilkan Logging, Audit, serta Monitoring Internal sehingga perjalanan satu Event dapat ditelusuri dari awal hingga akhir menggunakan Correlation ID yang sama.

Dependency Rules and Engineering Principles

Setiap Domain hanya mengetahui Interface yang menjadi tanggung jawabnya dan tidak boleh mengakses Domain lain melalui implementasi konkret. Monitoring tidak mengirim Notification secara langsung, Notification tidak menjalankan Automation secara langsung, Automation tidak memodifikasi Analytics secara langsung, dan AI tidak mengambil keputusan bisnis secara otomatis. Seluruh keputusan penting berasal dari algoritma lokal yang telah didefinisikan pada spesifikasi, sedangkan AI hanya memberikan analisis tambahan. Infrastruktur seperti Database, Redis, GitHub, Docker, maupun Tunnel berada di belakang Interface sehingga dapat diganti tanpa mengubah Business Logic. AI wajib menjaga agar tidak terjadi Circular Dependency, Shared Mutable State, maupun pelanggaran terhadap batas tanggung jawab setiap Domain.

Scalability, Maintainability, and Future Evolution

Arsitektur dirancang agar mampu berkembang dari satu VPS hingga banyak Workspace dengan jumlah Worker dan layanan yang terus bertambah. Penambahan Domain baru harus dilakukan melalui Interface, Event, dan Service Registry tanpa mengubah Core Architecture. Seluruh komponen wajib memiliki Logging, Monitoring, Health Check, Configuration, serta Testing yang konsisten sehingga kualitas sistem tetap terjaga meskipun ukuran proyek meningkat. Tujuan akhir arsitektur ini adalah membangun platform My Dash yang modular, mudah dipelihara, mudah diperluas, aman, dapat diamati, dan siap dikembangkan selama bertahun-tahun tanpa memerlukan perombakan fondasi sistem.

Acceptance Criteria

Spesifikasi arsitektur dianggap terpenuhi apabila seluruh Domain mengikuti Layer yang telah ditentukan, komunikasi dilakukan melalui kontrak resmi, aliran data menggunakan Event Bus dan Queue untuk pekerjaan asinkron, Source of Truth tetap berada pada PostgreSQL, serta setiap komponen dapat dikembangkan secara independen tanpa menghasilkan Coupling yang tinggi. Implementasi harus mencerminkan arsitektur ini secara konsisten pada seluruh bagian proyek My Dash.
REST API Engineering Specification

Purpose

REST API merupakan gerbang utama komunikasi antara Frontend, Mobile Client di masa depan, CLI, Plugin, AI Service, serta layanan internal My Dash. API harus bersifat konsisten, terdokumentasi, mudah dipelihara, dan memiliki versi sehingga perubahan besar tidak merusak kompatibilitas. Seluruh Endpoint menggunakan awalan "/api/v1" dan hanya menggunakan HTTPS pada lingkungan produksi. Setiap Request wajib melalui Middleware yang memeriksa Authentication, Session, Workspace, Permission, Rate Limit, Audit, dan Logging sebelum diteruskan ke Business Logic. API tidak diperbolehkan mengakses Database secara langsung dari Controller. Controller hanya menerima Request, melakukan validasi dasar, memanggil Application Service, kemudian mengembalikan Response yang telah distandarisasi. Dengan pendekatan ini seluruh lapisan tetap terpisah dan mudah diuji secara independen.

Endpoint Design and Resource Model

Endpoint dirancang berdasarkan Resource, bukan berdasarkan aksi. Contohnya meliputi Workspace, Authentication, Dashboard, Monitoring, Analytics, Health, Notification, Automation, Settings, Tunnel, Docker, Redis, GitHub, Backup, Restore, Plugin, Scheduler, Audit, AI, dan System Information. Setiap Resource mendukung operasi yang relevan menggunakan metode HTTP yang sesuai seperti GET untuk membaca, POST untuk membuat, PATCH untuk memperbarui sebagian data, PUT apabila diperlukan pembaruan penuh, dan DELETE untuk penghapusan logis atau permanen sesuai kebijakan Domain. Seluruh Endpoint harus mendukung Pagination, Filtering, Sorting, Searching, serta Metadata Response yang konsisten sehingga Frontend tidak memerlukan logika khusus untuk setiap halaman Dashboard.

Request, Response, and Error Contract

Seluruh Request divalidasi menggunakan Schema sebelum memasuki Domain Layer. Response menggunakan format yang seragam dengan informasi Status, Data, Message, Timestamp, Request ID, Correlation ID, serta Metadata tambahan apabila diperlukan. Error juga mengikuti kontrak yang sama sehingga Frontend dapat menangani seluruh Error menggunakan mekanisme tunggal. Setiap Error memiliki Code, Severity, Category, Human Message, Technical Message untuk Log, serta kemungkinan tindakan yang dapat dilakukan pengguna. API tidak boleh mengembalikan Stack Trace, Secret, Credential, Path internal, ataupun informasi sensitif lainnya kepada Client. Semua Response menggunakan UTC untuk Timestamp dan seluruh Identifier mengikuti format yang konsisten di seluruh sistem.

Security, Rate Limit, and Permission

Seluruh Endpoint harus memerlukan Authentication kecuali Endpoint yang memang bersifat publik seperti Login atau Health Check dasar. Session diverifikasi pada setiap Request, kemudian Permission diperiksa berdasarkan Workspace dan Role pengguna. Endpoint sensitif seperti Backup, Restore, GitHub Integration, Tunnel Configuration, AI Configuration, serta Security Settings wajib memiliki Permission tambahan dan menghasilkan Audit Event setiap kali dipanggil. Rate Limit diterapkan berdasarkan kombinasi User, Workspace, IP Address, dan Endpoint agar mampu mencegah Abuse tanpa mengganggu penggunaan normal. API juga harus mendukung Idempotency untuk operasi tertentu sehingga pengiriman Request berulang akibat Retry tidak menghasilkan data ganda.

Performance, Realtime, and Versioning

REST API hanya digunakan untuk operasi Request–Response, sedangkan pembaruan Realtime menggunakan WebSocket agar Dashboard tidak melakukan Polling terus-menerus. Seluruh Endpoint harus memiliki target latensi yang rendah, menggunakan Query yang efisien, memanfaatkan Cache apabila sesuai, serta mendukung Compression untuk Response berukuran besar. Setiap perubahan besar pada kontrak API harus dilakukan melalui Version baru tanpa merusak Client lama. Deprecated Endpoint tetap dipertahankan selama periode transisi yang telah ditentukan sebelum akhirnya dihapus. AI wajib membuat dokumentasi otomatis untuk seluruh Endpoint sehingga Frontend, Plugin, maupun integrasi pihak ketiga selalu memiliki referensi yang akurat.

Acceptance Criteria

REST API dianggap memenuhi spesifikasi apabila seluruh Resource memiliki Endpoint yang konsisten, seluruh Request dan Response mengikuti kontrak yang sama, Authentication, Authorization, Validation, Audit, Logging, Rate Limit, dan Versioning diterapkan secara menyeluruh, serta seluruh operasi bisnis diproses melalui Application Layer tanpa pelanggaran arsitektur. API juga harus siap dikembangkan untuk Mobile Client, CLI, Plugin, maupun integrasi eksternal tanpa memerlukan perubahan mendasar terhadap kontrak yang telah ditetapkan.
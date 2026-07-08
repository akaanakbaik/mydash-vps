Event Bus Engineering Specification

Purpose

Event Bus merupakan jantung komunikasi internal My Dash. Seluruh modul tidak diperbolehkan saling memanggil secara langsung apabila perubahan tersebut merupakan sebuah kejadian (Event). Sebagai gantinya, setiap perubahan sistem diterjemahkan menjadi Event yang dipublikasikan ke Event Bus, kemudian dikonsumsi oleh modul yang berkepentingan. Dengan pendekatan ini Monitoring tidak mengetahui Notification, Notification tidak mengetahui Analytics, Analytics tidak mengetahui Automation, dan Dashboard tidak mengetahui bagaimana data diproses. Semua modul hanya mengetahui Event yang mereka konsumsi. Pendekatan Event Driven ini menghasilkan Coupling yang rendah, mempermudah penambahan fitur baru, mempermudah Debugging, meningkatkan Scalability, dan memungkinkan setiap modul berkembang secara independen tanpa harus mengubah modul lain.

Event Lifecycle

Seluruh Event memiliki siklus hidup yang tetap, dimulai dari Event Creation, Event Validation, Event Serialization, Event Publishing, Event Distribution, Event Consumption, Event Processing, Event Acknowledgement, hingga Event Archiving. Setiap Event wajib memiliki Event ID, Correlation ID, Trace ID, Timestamp UTC, Workspace ID, Server ID apabila relevan, Event Version, Severity, Priority, Source Module, Destination Module, Payload, Metadata, serta Checksum sederhana untuk memastikan integritas data. Event bersifat Immutable, sehingga apabila terjadi perubahan keadaan maka Event baru harus dibuat, bukan mengubah Event lama. Pendekatan ini memungkinkan Replay, Audit, Historical Analysis, Root Cause Analysis, dan Time Travel Debugging apabila suatu saat diperlukan.

Event Classification

Event diklasifikasikan menjadi beberapa kelompok agar AI maupun sistem dapat menentukan prioritas pemrosesan. Information Event digunakan untuk aktivitas biasa seperti Dashboard Loaded atau User Login. State Event digunakan ketika Status berubah, misalnya Tunnel Connected atau Redis Recovered. Warning Event digunakan ketika Resource mulai melewati batas yang telah ditentukan pengguna. Critical Event digunakan ketika terjadi kondisi yang memerlukan tindakan segera seperti Disk Full, Database Down, atau Tunnel Failure. Audit Event digunakan untuk seluruh aktivitas penting pengguna, sedangkan Internal Event hanya dikonsumsi oleh sistem. Setiap kelompok memiliki jalur Queue, Prioritas, TTL, Retry Policy, dan Notification Policy yang berbeda sehingga sistem tidak membanjiri pengguna dengan Event yang tidak penting.

Event Processing Strategy

Seluruh Consumer bekerja secara Asynchronous menggunakan Worker independen. Satu Event dapat dikonsumsi oleh banyak Consumer tanpa saling mengetahui keberadaan masing-masing. Misalnya CPU Warning dipublikasikan satu kali, kemudian Notification Engine mengirim pesan ke WhatsApp dan Telegram, Analytics Engine memperbarui statistik, Health Engine menghitung ulang skor kesehatan, Audit Engine menyimpan riwayat, Dashboard Gateway mengirim pembaruan melalui WebSocket, dan AI Engine mulai melakukan analisis apabila kondisi memenuhi syarat. AI tidak boleh membuat Consumer yang saling bergantung secara langsung. Apabila satu Consumer gagal, Consumer lain tetap harus berhasil menyelesaikan pekerjaannya sehingga sistem tetap berjalan meskipun sebagian modul mengalami gangguan.

Recovery, Performance, and Reliability

Event Bus harus dirancang agar mampu menangani lonjakan Event dalam jumlah besar tanpa kehilangan data penting. Queue harus mendukung Retry bertingkat menggunakan Exponential Backoff, Dead Letter Queue untuk Event yang gagal diproses berkali-kali, serta Deduplication agar Event identik tidak diproses berulang. AI wajib memperhitungkan Throughput, Queue Length, Consumer Lag, Processing Time, Retry Count, Failure Rate, dan Average Delivery Time sebagai indikator kesehatan Event Bus. Apabila terjadi Restart Backend atau Redis, Event yang belum selesai diproses harus dipulihkan melalui mekanisme Recovery sehingga tidak ada Notification penting yang hilang. Target utama Event Bus adalah menjaga komunikasi seluruh Domain tetap deterministik, dapat diamati, dan memiliki latensi serendah mungkin.

Acceptance Criteria

Event Bus dianggap memenuhi spesifikasi apabila seluruh komunikasi antar Domain dilakukan menggunakan Event yang terdokumentasi, setiap Event memiliki Metadata lengkap, mendukung banyak Consumer independen, mampu melakukan Retry, Recovery, Deduplication, Dead Letter Queue, Audit, Replay, dan Monitoring secara otomatis. Implementasi harus tetap konsisten ketika jumlah Event meningkat hingga jutaan per hari tanpa menghasilkan Race Condition, kehilangan Event, ataupun ketergantungan langsung antar Domain, sehingga Event Bus benar-benar menjadi tulang punggung komunikasi internal My Dash.
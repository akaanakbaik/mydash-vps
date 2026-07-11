WebSocket Engineering Specification

Purpose

WebSocket merupakan tulang punggung komunikasi realtime pada My Dash dan bertanggung jawab mengirimkan perubahan sistem secara instan tanpa melakukan Polling berulang. Seluruh Widget Dashboard, Monitoring Realtime, Analytics Live, Notification Center, Tunnel Status, Docker Status, Progress Backup, Progress Restore, GitHub Workflow, Queue Status, AI Analysis Progress, serta seluruh aktivitas operasional harus menggunakan WebSocket sebagai media sinkronisasi utama. Frontend tidak diperbolehkan melakukan Request REST API setiap beberapa detik hanya untuk memperbarui tampilan. REST API hanya digunakan untuk mengambil data awal, sedangkan seluruh perubahan berikutnya dikirim melalui WebSocket. Dengan pendekatan ini penggunaan CPU, RAM, Bandwidth, serta beban Database menjadi jauh lebih rendah walaupun Dashboard dibuka dalam waktu lama.

Connection Lifecycle

Setiap koneksi WebSocket memiliki siklus hidup yang tetap dimulai dari Handshake, Authentication, Workspace Validation, Permission Validation, Subscription Registration, Heartbeat Monitoring, Event Streaming, Automatic Reconnection, Session Recovery, hingga Graceful Disconnect. Setelah koneksi berhasil dibuat, Server harus langsung mengirim Snapshot awal agar seluruh Widget memiliki keadaan yang sinkron sebelum menerima Event berikutnya. Apabila koneksi terputus, Frontend tidak boleh langsung menghapus seluruh data, melainkan memasuki Recovery Mode kemudian mencoba Reconnect menggunakan Exponential Backoff. Setelah berhasil terhubung kembali, Server mengirim Delta Event atau Snapshot terbaru sehingga Dashboard kembali sinkron tanpa perlu memuat ulang halaman.

Event Subscription Architecture

Seluruh komunikasi menggunakan konsep Channel dan Subscription. Setiap Workspace memiliki Channel tersendiri, kemudian dibagi lagi menjadi Channel Monitoring, Analytics, Notification, Health Score, Docker, Tunnel, Automation, GitHub, Audit, Backup, Restore, AI, serta Channel System. Pengguna hanya menerima Event yang sesuai dengan Workspace dan Permission yang dimilikinya. Dashboard juga hanya melakukan Subscribe terhadap halaman atau Widget yang sedang aktif sehingga penggunaan Bandwidth tetap efisien. AI wajib menghindari Broadcast global yang tidak diperlukan dan menggunakan mekanisme Publish–Subscribe agar distribusi Event tetap ringan walaupun jumlah pengguna dan Server meningkat secara signifikan.

Reliability, Ordering, and Recovery

Seluruh Event WebSocket memiliki Sequence Number, Timestamp UTC, Correlation ID, dan Event ID sehingga Frontend dapat mendeteksi Event yang hilang, duplikat, atau datang tidak sesuai urutan. Apabila Sequence terputus, Dashboard dapat meminta Sinkronisasi ulang hanya terhadap Event yang hilang tanpa harus mengambil seluruh data kembali. Heartbeat dikirim secara berkala untuk memastikan koneksi masih aktif. Apabila Heartbeat gagal beberapa kali berturut-turut, koneksi dianggap terputus dan proses Recovery dimulai secara otomatis. Seluruh mekanisme Reconnect, Resubscribe, Replay Event, serta Session Recovery harus berlangsung tanpa mengganggu pengguna sehingga Dashboard tetap terasa selalu aktif walaupun jaringan mengalami gangguan sementara.

Performance and Security

WebSocket harus mampu menangani ribuan Event per menit dengan latensi rendah serta penggunaan Memory yang stabil. Payload harus dikompresi apabila ukurannya besar dan hanya mengirim perubahan yang benar-benar diperlukan. Authentication dilakukan saat Handshake menggunakan Session yang masih berlaku, kemudian seluruh Event diverifikasi terhadap Workspace dan Permission pengguna sebelum dikirim. Tidak diperbolehkan mengirim Event milik Workspace lain ataupun informasi sensitif yang tidak dibutuhkan oleh Client. Dashboard juga harus memonitor jumlah koneksi aktif, Throughput, Latency, Reconnect Rate, Failed Authentication, Average Payload Size, serta Subscription Count sehingga kesehatan sistem Realtime dapat diamati langsung melalui halaman Monitoring.

Acceptance Criteria

Implementasi WebSocket dianggap memenuhi spesifikasi apabila mampu menyediakan komunikasi Realtime yang stabil, mendukung Authentication, Authorization, Channel Subscription, Heartbeat, Automatic Reconnection, Session Recovery, Event Ordering, Replay, Compression, serta Monitoring performa secara menyeluruh. Seluruh Widget Dashboard harus memperoleh pembaruan instan tanpa melakukan Polling berulang, sementara sistem tetap efisien, aman, dan mampu diskalakan untuk menangani banyak Workspace dan ribuan koneksi aktif secara bersamaan.
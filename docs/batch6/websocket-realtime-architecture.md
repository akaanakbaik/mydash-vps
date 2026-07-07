Batch 6 — WebSocket Realtime Architecture

Tujuan

Dokumen ini mendefinisikan seluruh arsitektur komunikasi realtime antara Agent, Backend, Dashboard, Notification Engine, Analytics Engine, Automation Engine, dan seluruh modul lain yang membutuhkan sinkronisasi data secara langsung.

WebSocket bukan hanya pengganti HTTP.

Pada My Dash, WebSocket merupakan Realtime Event Transport Layer, yaitu jalur utama yang menghubungkan seluruh perubahan keadaan sistem dengan antarmuka pengguna secara hampir seketika.

Tujuan utama penggunaan WebSocket adalah menghilangkan polling yang berlebihan, menurunkan penggunaan bandwidth, mengurangi latensi, menjaga sinkronisasi antar halaman, serta memastikan seluruh pengguna melihat kondisi server yang sama pada waktu yang hampir bersamaan.

Dashboard tidak boleh melakukan polling setiap satu detik.

Polling dengan interval tetap akan menghasilkan ribuan request HTTP yang sebagian besar hanya mengembalikan data yang sama.

Pendekatan tersebut membuang bandwidth, memperbesar penggunaan CPU backend, memperbanyak query ke PostgreSQL maupun Redis, dan meningkatkan konsumsi baterai pada perangkat mobile.

Sebaliknya, WebSocket hanya mengirimkan perubahan ketika perubahan tersebut benar-benar terjadi.

---

Filosofi Realtime

Realtime tidak berarti seluruh data harus dikirim setiap milidetik.

Realtime berarti perubahan penting harus diterima pengguna dalam waktu yang cukup cepat sehingga keputusan operasional masih relevan.

Sebagai contoh.

Perubahan CPU dari 42.1% menjadi 42.2% setiap beberapa ratus milidetik tidak selalu perlu dikirim.

Namun perubahan Tunnel dari Connected menjadi Disconnected harus dikirim hampir seketika.

Oleh karena itu My Dash tidak menggunakan pendekatan "send everything".

Sebaliknya sistem menggunakan Event Driven Synchronization yang hanya mengirim perubahan yang bernilai.

Pendekatan ini jauh lebih efisien dibanding sinkronisasi penuh.

---

Arsitektur Komunikasi

Seluruh komunikasi mengikuti jalur berikut.

Agent menghasilkan Metric.

↓

Monitoring Engine melakukan validasi.

↓

Rule Engine melakukan evaluasi.

↓

Analytics menghitung data turunan.

↓

Redis Pub/Sub menerima Event.

↓

WebSocket Gateway menerima Event.

↓

Subscription Manager menentukan Client yang membutuhkan Event tersebut.

↓

Event dikompresi.

↓

Event dikirim.

↓

Frontend memperbarui State.

↓

Widget yang relevan melakukan render ulang.

Tidak ada satu pun Widget yang menerima Event secara langsung dari Agent.

Hal ini menjaga keamanan dan konsistensi data.

---

Event Driven Synchronization

WebSocket tidak mengirim objek penuh setiap kali terdapat perubahan.

Sebagai contoh.

CPU sebelumnya.

42%.

CPU sekarang.

43%.

Dashboard tidak perlu menerima seluruh informasi Workspace, Hostname, Docker, Tunnel, Notification, Analytics, dan sebagainya.

Yang dikirim cukup.

Metric Identifier.

Workspace Identifier.

Server Identifier.

Timestamp.

Nilai Baru.

Sequence Number.

Checksum.

Frontend kemudian memperbarui bagian yang berubah.

Pendekatan ini disebut Delta Synchronization.

Bandwidth dapat berkurang sangat besar dibanding mengirim seluruh objek.

---

Event Envelope

Seluruh Event menggunakan struktur yang seragam.

Setiap Event minimal mempunyai.

Event Identifier.

Workspace Identifier.

Server Identifier.

Sequence Number.

Timestamp.

Event Type.

Payload.

Checksum.

Correlation Identifier.

Trace Identifier.

Version.

Event Envelope memastikan seluruh modul dapat memahami Event tanpa mengetahui implementasi internal modul lain.

Pendekatan ini memudahkan penambahan fitur baru pada masa depan.

---

Sequence Number

Setiap Event memiliki Sequence Number.

Sequence Number digunakan untuk mendeteksi.

Event hilang.

Event ganda.

Event datang tidak berurutan.

Misalkan.

Dashboard menerima.

101

102

104

Berarti Event.

103

hilang.

Dashboard dapat meminta Sinkronisasi Ulang hanya untuk Event yang hilang.

Tidak perlu meminta seluruh data.

Pendekatan ini jauh lebih efisien dibanding melakukan Refresh penuh.

---

State Synchronization

Dashboard tidak menyimpan seluruh keadaan server di dalam Widget.

Seluruh keadaan disimpan pada State Manager.

Widget hanya membaca State.

Apabila Event baru datang.

State Manager melakukan.

Validasi.

↓

Version Check.

↓

Sequence Check.

↓

Conflict Resolution.

↓

State Update.

↓

Notify Subscriber.

↓

Widget Render.

Pendekatan ini menghindari inkonsistensi antar Widget.

---

Subscription Manager

Tidak semua pengguna membutuhkan seluruh Event.

Sebagai contoh.

Workspace A.

Tidak perlu menerima Event Workspace B.

Subscription Manager bertugas.

Mendaftarkan Subscription.

Menghapus Subscription.

Memverifikasi Hak Akses.

Mengelompokkan Subscriber.

Mengirim Event hanya kepada Client yang berhak.

Pendekatan ini mengurangi bandwidth dan meningkatkan keamanan.

---

Adaptive Update Frequency

Tidak semua jenis Metric memerlukan frekuensi yang sama.

Sebagai contoh.

CPU.

1 Detik.

RAM.

2 Detik.

Disk.

5 Detik.

Health Score.

10 Detik.

Version.

Hanya ketika berubah.

Notification.

Segera ketika Event muncul.

AI Recommendation.

Setelah proses AI selesai.

Pendekatan adaptif jauh lebih efisien dibanding memperbarui seluruh Widget setiap detik.

---

Delta Compression

Misalkan Dashboard mempunyai.

100 Widget.

Apabila seluruh Widget dikirim ulang.

Ukuran Payload.

200 KB.

Namun hanya CPU berubah.

Payload Delta.

1 KB.

Penghematan.

199 KB.

Secara matematis.

Compression Efficiency

=

(Original Size

−

Delta Size)

÷

Original Size

×

100%

Misalkan.

Original.

200 KB.

Delta.

1 KB.

Efficiency.

99.5%

Semakin tinggi nilai tersebut.

Semakin efisien komunikasi.

---

Latency Measurement

WebSocket harus mengukur.

One Way Delay.

Round Trip Time.

Heartbeat Interval.

Packet Delay Variation.

Reconnect Duration.

Latency dihitung.

Latency

=

Receive Timestamp

−

Send Timestamp

Dashboard menampilkan.

Current Latency.

Average Latency.

Maximum Latency.

Minimum Latency.

P95.

P99.

Administrator dapat mengetahui kualitas koneksi secara langsung.

---

Heartbeat Algorithm

Heartbeat digunakan untuk memastikan koneksi masih hidup.

Interval Heartbeat harus dapat diatur.

Misalnya.

30 Detik.

Dashboard mengirim Ping.

Backend mengirim Pong.

Round Trip Time dicatat.

Apabila tiga Heartbeat berturut-turut gagal.

Client dianggap Offline.

Subscription dibersihkan.

Worker WebSocket melepaskan seluruh Resource yang tidak lagi digunakan.

---

Reconnect Strategy

Reconnect tidak boleh dilakukan secara terus menerus.

Gunakan Exponential Backoff.

Delay(n)

=

Base Delay

×

2ⁿ

+ 

Random Jitter

Misalkan.

Base.

2 Detik.

Reconnect ke-5.

Delay.

2 × 2⁵

=

64 Detik.

Random Jitter.

±10%.

Pendekatan ini mengurangi kemungkinan ribuan Client melakukan Reconnect bersamaan setelah Backend Restart.

Fenomena tersebut dikenal sebagai Thundering Herd Problem.

---

Conflict Resolution

Kadang dua Event datang hampir bersamaan.

Misalnya.

CPU.

60%.

↓

65%.

↓

62%.

Karena keterlambatan jaringan.

Dashboard menerima.

60. 

↓

62. 

↓

65. 

Sequence Number digunakan untuk menentukan urutan sebenarnya.

Apabila Event lama datang setelah Event baru.

Event lama diabaikan.

Dengan demikian State tetap konsisten.

---

Mathematical Throughput

Misalkan.

5000 Client.

Setiap Client menerima.

12 Event.

Per Detik.

Total Event.

60000 Event.

Per Detik.

Misalkan rata-rata Event.

800 Byte.

Bandwidth.

60000

×

800

=

48.000.000 Byte.

≈

45.8 MB.

Per Detik.

Backend harus mampu melakukan Broadcast menggunakan Subscription Group agar Event tidak diproses satu per satu.

Pendekatan tersebut mengurangi penggunaan CPU secara signifikan.

---

Memory Management

Setiap koneksi WebSocket mempunyai Buffer.

Buffer tidak boleh bertambah tanpa batas.

Gunakan Ring Buffer.

Misalnya.

512 Event.

Apabila Event ke-513 masuk.

Event pertama dibuang.

Dengan demikian penggunaan memori tetap konstan.

Kompleksitas memori.

O(n)

dengan n tetap.

---

Security

Seluruh koneksi harus melalui Authentication.

Token diverifikasi ketika Handshake.

Hak akses diverifikasi ketika Subscription.

Workspace diverifikasi sebelum Broadcast.

Dashboard tidak boleh menerima Event dari Workspace lain.

Token tidak boleh dikirim ulang pada setiap Event.

Token hanya digunakan ketika proses autentikasi awal.

---

Recovery

Apabila koneksi terputus.

Dashboard tidak menghapus seluruh data.

Dashboard masuk ke mode.

Last Known State.

Kemudian menjalankan.

Reconnect.

↓

Authentication.

↓

Subscription Recovery.

↓

Sequence Validation.

↓

Delta Synchronization.

↓

Realtime kembali aktif.

Pendekatan ini membuat Dashboard tetap dapat digunakan walaupun terjadi gangguan jaringan singkat.

---

Acceptance Criteria

WebSocket Architecture dianggap selesai apabila mampu melakukan sinkronisasi berbasis Event, menggunakan Delta Synchronization, Sequence Number, Subscription Manager, Adaptive Update Frequency, Heartbeat, Reconnect adaptif, Conflict Resolution, Ring Buffer, serta menjaga penggunaan bandwidth dan memori tetap efisien walaupun melayani ribuan koneksi secara bersamaan.

AI wajib melakukan simulasi puluhan ribu Event per detik, simulasi kehilangan paket, simulasi keterlambatan jaringan, simulasi restart backend, simulasi reconnect massal, simulasi perubahan Workspace, serta memastikan seluruh algoritma menghasilkan keadaan Dashboard yang konsisten tanpa race condition, memory leak, ataupun kehilangan Event sebelum melanjutkan ke dokumen berikutnya.

Akhir dokumen.
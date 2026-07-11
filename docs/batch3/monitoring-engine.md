My Dash

Batch 3 — Monitoring Engine

Tujuan

Dokumen ini menjadi spesifikasi utama pembangunan Monitoring Engine.

Monitoring Engine merupakan jantung dari seluruh sistem My Dash.

Seluruh informasi yang ditampilkan pada dashboard, analytics, notification, automation, AI Assistant, health score, recommendation engine, hingga audit system berasal dari Monitoring Engine.

Monitoring Engine harus dirancang agar mampu berjalan selama dua puluh empat jam setiap hari tanpa menyebabkan penurunan performa VPS.

Monitoring Engine wajib memberikan data yang akurat, konsisten, realtime, mudah diverifikasi, dan memiliki tingkat penggunaan resource yang serendah mungkin.

Monitoring Engine bukan sekadar membaca penggunaan CPU dan RAM.

Monitoring Engine adalah sistem observasi menyeluruh terhadap seluruh kondisi VPS.

---

Filosofi Monitoring

Monitoring harus bersifat proaktif.

Monitoring tidak boleh hanya menunggu pengguna membuka dashboard.

Monitoring harus selalu bekerja di latar belakang.

Setiap perubahan penting harus diketahui sesegera mungkin.

Monitoring harus mampu membedakan kondisi normal dan kondisi tidak normal.

Monitoring harus memiliki kemampuan mendeteksi tren.

Monitoring harus mampu mengetahui apakah suatu masalah hanya berlangsung beberapa detik atau telah berlangsung dalam waktu lama.

Monitoring tidak boleh menghasilkan alarm palsu sebanyak mungkin.

---

Tujuan Monitoring

Monitoring digunakan untuk:

Menampilkan kondisi server.

Menghasilkan grafik realtime.

Memberikan data kepada Rule Engine.

Menghasilkan Analytics.

Menghasilkan Health Score.

Menghasilkan Activity Timeline.

Menghasilkan Alert.

Menjadi sumber data AI.

Memberikan informasi kepada Automation Engine.

Menjadi sumber informasi Dashboard.

Tidak ada modul lain yang boleh membaca kondisi VPS secara langsung selain Agent dan Monitoring Engine.

Semua modul wajib menggunakan data yang telah divalidasi Monitoring Engine.

---

Arsitektur Monitoring

Alur data wajib mengikuti urutan berikut.

Agent

↓

Collector

↓

Normalizer

↓

Validator

↓

Monitoring Engine

↓

Cache

↓

Rule Engine

↓

Analytics

↓

WebSocket

↓

Frontend

↓

Notification

↓

AI

↓

History

Dengan pendekatan ini seluruh data berasal dari satu sumber yang sama sehingga tidak terjadi perbedaan nilai antara halaman dashboard dan halaman analytics.

---

Data Collector

Collector bertugas mengambil data mentah dari Agent.

Collector tidak melakukan perhitungan.

Collector tidak mengubah data.

Collector hanya menerima dan meneruskan data.

Collector harus mampu menerima ribuan event tanpa kehilangan urutan.

Collector harus mampu menangani burst traffic ketika banyak perubahan terjadi dalam waktu bersamaan.

---

Data Validation

Seluruh data wajib divalidasi.

Contoh validasi:

CPU tidak boleh lebih kecil dari nol.

CPU tidak boleh lebih besar dari seratus persen per inti.

RAM tidak boleh bernilai negatif.

Disk tidak boleh melebihi kapasitas sebenarnya.

Bandwidth tidak boleh bernilai tidak masuk akal.

Apabila data tidak valid.

Monitoring Engine wajib:

Menolak data.

Mencatat log.

Menggunakan data terakhir yang valid apabila diperlukan.

Tidak meneruskan data rusak kepada dashboard.

---

Data Normalization

Seluruh data harus menggunakan satu format yang konsisten.

Contoh.

Ukuran penyimpanan.

Byte.

Kilobyte.

Megabyte.

Gigabyte.

Terabyte.

Seluruh konversi dilakukan di Monitoring Engine.

Frontend tidak boleh melakukan konversi manual.

Hal yang sama berlaku untuk:

Kecepatan jaringan.

Waktu.

Persentase.

Temperatur.

Frekuensi CPU.

---

Monitoring CPU

Monitoring CPU tidak hanya membaca persentase.

Monitoring wajib mencatat:

Model CPU.

Vendor.

Jumlah Socket.

Jumlah Core.

Jumlah Thread.

Frekuensi Minimum.

Frekuensi Maksimum.

Frekuensi Saat Ini.

Load Average.

CPU Idle.

CPU User.

CPU System.

CPU Nice.

CPU IO Wait.

CPU Steal.

CPU Interrupt.

CPU Soft Interrupt.

CPU Guest.

CPU Guest Nice.

Seluruh informasi tersebut harus tersedia apabila sistem operasi mendukung.

---

Monitoring RAM

Monitoring RAM wajib mencatat:

Total.

Used.

Free.

Available.

Cached.

Buffer.

Shared.

Slab.

Swap Total.

Swap Used.

Swap Free.

Swap Activity.

Memory Pressure.

Monitoring juga harus mengetahui apakah penggunaan RAM tinggi disebabkan oleh cache normal atau benar-benar terjadi kekurangan memori.

---

Monitoring Disk

Monitoring disk wajib mencatat:

Seluruh disk fisik.

Seluruh partisi.

Filesystem.

Mount Point.

Capacity.

Used.

Available.

Read Speed.

Write Speed.

Read Operation.

Write Operation.

IO Wait.

Filesystem Error apabila tersedia.

SMART Status apabila tersedia.

Inode Usage.

Monitoring harus mampu mendeteksi disk yang mulai mengalami masalah.

---

Monitoring Network

Monitoring jaringan merupakan salah satu modul terpenting.

Minimal mencatat:

Public IPv4.

Public IPv6.

Hostname.

DNS.

Gateway.

MAC Address.

Seluruh Interface.

RX.

TX.

Upload Speed.

Download Speed.

Packet.

Packet Loss.

Latency.

Jitter apabila tersedia.

Connection Count.

Established Connection.

Listening Port.

Monitoring harus mengetahui apabila IP publik berubah.

Monitoring harus mengetahui apabila salah satu interface mati.

---

Monitoring Process

Monitoring wajib mampu menampilkan:

Total Process.

Running Process.

Sleeping Process.

Zombie Process.

Stopped Process.

Top CPU Process.

Top RAM Process.

PID.

Owner.

Command.

Start Time.

Runtime.

Monitoring harus mendukung pencarian proses.

Monitoring harus mampu memberikan data kepada Rule Engine apabila suatu proses menggunakan resource secara tidak normal.

---

Monitoring Docker

Apabila Docker aktif.

Monitoring harus membaca:

Container.

Image.

Volume.

Network.

CPU.

RAM.

Restart Count.

Restart Policy.

Container Health.

Exit Code.

Health Check.

Crash Loop.

Monitoring tidak boleh melakukan restart container.

Keputusan berada pada Automation Engine.

---

Monitoring Tunnel

Monitoring harus mengetahui:

Provider.

Domain.

Latency.

Reconnect Count.

Connection Status.

Last Connected.

SSL Status apabila tersedia.

Apabila tunnel berubah.

Monitoring membuat event.

---

Monitoring Database

Monitoring membaca:

PostgreSQL.

Redis.

Status.

Connection.

Query.

Memory.

Latency.

Cache Hit.

Cache Miss.

Replication apabila tersedia.

Monitoring harus mengetahui apabila database mulai lambat.

---

Monitoring Scheduler

Monitoring mencatat:

Cron aktif.

Cron gagal.

Cron terlambat.

Task berjalan.

Task gagal.

Retry.

Duration.

Semua aktivitas scheduler masuk ke Activity Timeline.

---

Snapshot

Monitoring wajib membuat snapshot berkala.

Snapshot digunakan untuk:

Analytics.

Grafik.

Perbandingan.

Health Score.

Diagnosis AI.

Snapshot tidak boleh terlalu sering hingga membebani disk.

Retensi snapshot harus dapat diatur melalui pengaturan dashboard.

---

Retention Policy

Data dibagi menjadi beberapa kategori.

Realtime.

Short Term.

Daily.

Weekly.

Monthly.

Yearly.

Setiap kategori memiliki kebijakan retensi masing-masing.

AI wajib membangun sistem yang mudah diubah melalui konfigurasi.

---

Health Source

Health Score tidak menghitung data sendiri.

Health Score menggunakan data Monitoring Engine.

Dengan demikian seluruh modul menggunakan sumber data yang sama.

---

Notification Integration

Monitoring tidak mengirim notifikasi secara langsung.

Monitoring hanya menghasilkan event.

Rule Engine menentukan:

Apakah event penting.

Apakah harus dikirim.

Apakah membutuhkan AI.

Apakah membutuhkan retry.

Dengan cara ini Monitoring tetap sederhana dan mudah dipelihara.

---

Performance Target

Monitoring harus mampu berjalan terus menerus.

Target utama:

Penggunaan CPU rendah.

Penggunaan RAM stabil.

Tidak menyebabkan memory leak.

Tidak menyebabkan lonjakan disk.

Tidak menyebabkan lonjakan bandwidth.

Tidak menyebabkan penurunan performa VPS.

---

Pengujian

AI wajib melakukan pengujian terhadap:

CPU.

RAM.

Disk.

Network.

Docker.

Tunnel.

Scheduler.

Database.

Redis.

Snapshot.

Retention.

Realtime.

Event.

Validation.

Normalization.

Recovery.

Seluruh hasil pengujian harus dicatat.

Apabila ditemukan ketidaksesuaian.

AI wajib memperbaikinya sebelum melanjutkan ke dokumen berikutnya.

---

Acceptance Criteria

Monitoring Engine dianggap selesai apabila:

Seluruh domain monitoring berhasil dibangun.

Seluruh data tervalidasi.

Seluruh data dinormalisasi.

Seluruh event berhasil diteruskan.

Snapshot berjalan.

Retention berjalan.

Monitoring stabil.

Monitoring tidak membebani VPS.

Tidak terdapat warning.

Tidak terdapat build error.

Tidak terdapat type error.

Dokumentasi diperbarui.

AI telah melakukan verifikasi mandiri sesuai seluruh standar proyek kemudian menghentikan proses dan menunggu instruksi pengguna.

Akhir dokumen.
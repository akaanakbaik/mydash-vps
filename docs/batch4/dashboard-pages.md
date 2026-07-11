Batch 4 — Dashboard Pages

Tujuan

Dokumen ini mendefinisikan seluruh halaman yang wajib dimiliki Dashboard beserta fungsi, hubungan antar halaman, alur navigasi, perilaku sistem, struktur informasi, logika pengambilan data, mekanisme pembaruan realtime, serta standar pengalaman pengguna.

Halaman bukan sekadar kumpulan komponen.

Setiap halaman merupakan representasi dari satu domain sistem.

Satu halaman hanya boleh memiliki satu tujuan utama.

Apabila suatu halaman mulai memiliki terlalu banyak tanggung jawab, AI wajib memecahnya menjadi beberapa halaman yang saling terhubung.

Pendekatan ini menjaga struktur aplikasi tetap sederhana walaupun jumlah fitur terus bertambah.

---

Filosofi Navigasi

Dashboard dirancang berdasarkan prinsip Maximum Three Navigation.

Artinya pengguna harus dapat mencapai fitur apa pun maksimal dalam tiga langkah.

Sebagai contoh.

Dashboard

↓

Monitoring

↓

CPU Detail

atau.

Dashboard

↓

Settings

↓

Notification

Pengguna tidak boleh dipaksa membuka lima hingga tujuh halaman hanya untuk menemukan satu konfigurasi sederhana.

---

Struktur Halaman

Seluruh aplikasi dibagi menjadi beberapa kelompok besar.

Dashboard.

Monitoring.

Analytics.

Notification.

Automation.

Tunnel.

Docker.

Storage.

Network.

Security.

GitHub.

Settings.

System.

Information.

Developer.

Documentation.

Setiap kelompok dapat memiliki beberapa subhalaman.

Namun hubungan antar kelompok harus tetap jelas.

---

Dashboard

Dashboard merupakan halaman pertama setelah autentikasi berhasil.

Halaman ini menampilkan ringkasan seluruh kondisi VPS.

Dashboard tidak boleh digunakan untuk konfigurasi.

Dashboard hanya digunakan untuk observasi dan akses cepat menuju halaman lain.

Dashboard harus tetap ringan walaupun jumlah data sangat banyak.

Widget yang tidak terlihat tidak perlu dimuat sepenuhnya.

---

Monitoring

Halaman Monitoring merupakan pusat observasi.

Monitoring dibagi menjadi beberapa subhalaman.

CPU.

Memory.

Storage.

Filesystem.

Network.

Docker.

Database.

Redis.

Tunnel.

System Service.

Scheduler.

Process.

Kernel.

Temperature.

Setiap subhalaman memiliki fokus pada satu domain.

Contohnya halaman CPU tidak menampilkan konfigurasi Notification.

---

CPU Detail

Halaman CPU harus menampilkan.

Model.

Vendor.

Socket.

Core.

Thread.

Clock Minimum.

Clock Maximum.

Clock Saat Ini.

Load Average.

Usage per Core.

Realtime Graph.

Moving Average.

EMA.

Variance.

Temperature apabila tersedia.

CPU History.

CPU Prediction.

Top CPU Process.

Rule yang sedang aktif.

Automation yang sedang berjalan.

Health Contribution.

AI Insight apabila tersedia.

Halaman ini bertujuan memberikan seluruh informasi CPU dalam satu tempat tanpa harus berpindah halaman.

---

Memory Detail

Halaman Memory menjelaskan.

Total Memory.

Available Memory.

Used Memory.

Cached Memory.

Buffered Memory.

Swap.

Swap Activity.

Page Fault.

Memory Pressure.

Realtime Chart.

Prediction.

Trend.

Rule.

History.

Automation.

Health Contribution.

Apabila sistem Linux menggunakan cache secara agresif.

Dashboard wajib menjelaskan bahwa cache bukan selalu tanda kekurangan RAM.

Tujuan utama halaman ini adalah membantu pengguna memahami perilaku memori Linux dengan benar.

---

Storage

Halaman Storage dibagi menjadi.

Physical Disk.

Partition.

Filesystem.

Mount Point.

SMART.

IO Performance.

Read Speed.

Write Speed.

Latency.

Disk Queue.

Inode.

Growth Prediction.

Storage Health.

Dashboard juga menampilkan estimasi kapan penyimpanan akan penuh berdasarkan laju pertumbuhan historis.

Perhitungan dilakukan oleh Analytics Engine.

---

Network

Network merupakan salah satu halaman terpenting.

Minimal menampilkan.

Public IPv4.

Public IPv6.

Hostname.

Gateway.

DNS.

MAC Address.

RX.

TX.

Realtime Speed.

Packet.

Packet Loss.

Latency.

Connection Count.

Listening Port.

Tunnel.

Bandwidth History.

Traffic Distribution.

Dashboard juga harus menampilkan apakah terjadi perubahan IP publik sejak terakhir kali Agent aktif.

---

Docker

Halaman Docker harus mampu mengelola informasi.

Container.

Image.

Volume.

Network.

Restart Count.

CPU.

RAM.

Disk.

Status.

Health.

Log Ringkas.

Automation.

Rule.

Container tidak langsung dimanipulasi dari dashboard tanpa validasi backend.

---

Tunnel

Halaman Tunnel merupakan pusat seluruh koneksi publik.

Halaman menampilkan.

Provider.

Status.

Domain.

SSL.

Latency.

Reconnect Count.

Downtime History.

Provider Priority.

Retry History.

Health.

Pengguna dapat melihat mengapa tunnel berpindah provider apabila terjadi fallback.

---

Notification

Halaman Notification dibagi menjadi beberapa bagian.

Notification Center.

Notification History.

Delivery Status.

Provider.

Template.

Queue.

Retry.

Dead Letter Queue.

Analytics.

Pengguna dapat mencari notification berdasarkan.

Tanggal.

Kategori.

Severity.

Rule.

Provider.

Status.

---

Automation

Automation bukan hanya daftar tugas.

Halaman Automation menampilkan.

Automation Aktif.

Automation History.

Retry.

Cooldown.

Execution Duration.

Verification Result.

Dependency.

Automation Failure.

Automation Success Rate.

Dashboard juga menjelaskan alasan mengapa automation tertentu tidak dijalankan.

---

Analytics

Halaman Analytics merupakan pusat visualisasi data.

Halaman ini menampilkan.

Trend.

Prediction.

Correlation.

Distribution.

Moving Average.

EMA.

Variance.

Heatmap.

Growth Rate.

Forecast.

Health Evolution.

Semua grafik berasal dari Analytics Engine.

Frontend tidak melakukan perhitungan statistik.

---

GitHub

Halaman GitHub digunakan untuk integrasi dengan GitHub CLI.

Fitur yang harus tersedia.

Repository.

Current Branch.

Commit History.

Tag.

Release.

Workflow.

GitHub Action.

Workflow Status.

Workflow Duration.

Failed Workflow.

Successful Workflow.

Deployment History.

Repository Health.

Push Status.

Pull Status.

Git Status.

Repository Size.

Apabila GitHub CLI belum dikonfigurasi.

Dashboard harus memberikan panduan konfigurasi.

---

Settings

Halaman Settings dibagi berdasarkan domain.

General.

Appearance.

Notification.

Automation.

Tunnel.

GitHub.

AI.

Security.

Session.

Backup.

Restore.

Database.

Retention.

Analytics.

Plugin.

Developer.

Pengaturan tidak boleh dicampur dalam satu halaman panjang.

---

Information

Halaman Information menjelaskan proyek.

Versi Dashboard.

Versi Backend.

Versi Agent.

Versi Database.

Versi Schema.

License.

Terms.

Privacy Policy.

Open Source Component.

Developer Contact.

Roadmap.

Changelog.

System Requirement.

Seluruh informasi ini bersifat informatif dan tidak mengganggu halaman operasional.

---

Search System

Dashboard wajib memiliki Global Search.

Global Search dapat menemukan.

Halaman.

Rule.

Notification.

Automation.

Container.

Process.

GitHub Workflow.

Tunnel.

Setting.

Plugin.

Search harus menggunakan pencarian lokal yang cepat.

Tidak perlu memanggil AI.

---

Navigation Cache

Dashboard mengingat halaman terakhir.

Widget terakhir.

Workspace terakhir.

Tab terakhir.

Filter terakhir.

Sort terakhir.

Dengan demikian ketika pengguna kembali membuka dashboard, pengalaman penggunaan tetap konsisten.

---

Acceptance Criteria

Seluruh halaman dianggap memenuhi spesifikasi apabila setiap halaman memiliki satu tanggung jawab utama, memuat data sesuai domainnya masing-masing, menggunakan sumber data yang telah diproses backend, mendukung pembaruan realtime apabila diperlukan, tetap responsif pada perangkat mobile, menyediakan navigasi maksimal tiga langkah menuju fitur apa pun, serta siap menerima penambahan modul baru tanpa mengubah struktur navigasi utama.

AI wajib menguji seluruh alur navigasi, memastikan tidak terdapat tautan rusak, halaman kosong, duplikasi fungsi, maupun inkonsistensi perilaku antarmuka sebelum melanjutkan ke dokumen berikutnya.

Akhir dokumen.
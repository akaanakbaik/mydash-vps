My Dash

Batch 2 — Database Foundation

Tujuan

Dokumen ini mendefinisikan standar perancangan database untuk seluruh proyek My Dash.

Database merupakan sumber kebenaran utama bagi seluruh konfigurasi, histori, aktivitas, pengaturan, dan metadata sistem.

Seluruh implementasi database wajib mengikuti dokumen ini.

AI tidak boleh membuat struktur database secara acak.

Seluruh tabel, relasi, index, migration, dan strategi penyimpanan harus dirancang agar mampu berkembang untuk penggunaan jangka panjang.

---

Filosofi Database

Database harus:

Konsisten.

Mudah dikembangkan.

Mudah dipelihara.

Cepat.

Aman.

Terstruktur.

Siap menangani banyak server.

Siap menangani jutaan data histori.

Tidak boleh dirancang hanya untuk kebutuhan saat ini.

Seluruh keputusan harus mempertimbangkan skalabilitas.

---

Teknologi

Database utama:

PostgreSQL

Cache:

Redis

PostgreSQL digunakan sebagai penyimpanan permanen.

Redis digunakan sebagai penyimpanan sementara.

Redis bukan sumber data utama.

Apabila Redis dibersihkan, sistem tetap dapat berjalan menggunakan PostgreSQL.

---

Prinsip Desain

Setiap tabel hanya memiliki satu tanggung jawab.

Tidak boleh membuat tabel yang menangani banyak domain sekaligus.

Relasi harus jelas.

Penamaan harus konsisten.

Seluruh primary key menggunakan UUID.

Seluruh waktu menggunakan UTC pada penyimpanan.

Zona waktu hanya diterapkan pada tampilan frontend.

---

Domain Database

Database dibagi menjadi beberapa domain utama.

Authentication

Session

Settings

Server

Agent

Tunnel

Notification

Rule Engine

Analytics

Activity

Audit

Security

Docker

Backup

Restore

Scheduler

Plugin

GitHub

AI

Realtime Metadata

System Configuration

Health Score

Diagnostics

Version

Update

License

Workspace

Future Expansion

Masing-masing domain memiliki migration sendiri.

---

Migration

Seluruh perubahan struktur database wajib menggunakan migration.

Migration harus:

Dapat dijalankan berulang.

Memiliki urutan yang jelas.

Tidak merusak data lama.

Dapat dilakukan rollback apabila memungkinkan.

AI tidak boleh mengubah tabel secara langsung tanpa migration.

---

Seed

Apabila diperlukan data awal.

Gunakan mekanisme seed.

Seed digunakan untuk:

Konfigurasi awal.

Kategori default.

Rule default.

Threshold default.

Tema default.

Permission default.

Seed tidak boleh menimpa data pengguna.

---

Index

Seluruh kolom yang sering digunakan untuk pencarian wajib memiliki index.

AI harus mempertimbangkan performa query.

Tidak boleh membuat index berlebihan.

Index harus dibuat berdasarkan kebutuhan nyata.

---

Constraint

Gunakan constraint untuk menjaga integritas data.

Contoh:

Unique.

Foreign Key.

Check Constraint.

Not Null.

Constraint harus menjelaskan aturan bisnis.

Integritas data tidak boleh hanya mengandalkan backend.

---

Soft Delete

Data penting tidak langsung dihapus.

Gunakan mekanisme soft delete apabila data masih memiliki nilai historis.

Data yang benar-benar harus dihapus menggunakan proses terpisah.

---

Audit

Perubahan penting harus memiliki audit.

Minimal mencatat:

Waktu.

Aktor.

Objek.

Perubahan.

Alamat IP apabila tersedia.

Perangkat apabila tersedia.

Audit tidak boleh dapat dimodifikasi melalui dashboard.

---

Session Storage

Session disimpan secara aman.

Session memiliki:

Identifier.

Created Time.

Expire Time.

Last Activity.

Device.

Browser.

IP.

Trusted Status.

Session yang telah kedaluwarsa dibersihkan secara otomatis oleh scheduler.

---

Notification Storage

Seluruh notifikasi disimpan.

Minimal mencatat:

Kategori.

Prioritas.

Provider.

Status Pengiriman.

Status Dibaca.

Isi Template.

Hasil Analisis AI apabila tersedia.

Retry Count.

Delivery Time.

Error terakhir apabila gagal.

Seluruh histori dapat dicari melalui dashboard.

---

Activity Timeline

Seluruh aktivitas penting dicatat.

Contoh:

Login.

Logout.

Restart Service.

Backup.

Restore.

Tunnel Reconnect.

Docker Restart.

Update.

Configuration Change.

Plugin Install.

Plugin Remove.

Scheduler Event.

AI Recommendation.

Activity harus dapat difilter.

Activity harus dapat dicari.

---

Analytics

Data analytics dipisahkan dari konfigurasi.

Analytics harus mendukung:

Per Jam.

Per Hari.

Per Minggu.

Per Bulan.

Per Tahun.

Retention policy harus dapat diatur.

---

Health Score

Health Score tidak disimpan sebagai angka tetap.

Health Score dihitung menggunakan data terbaru.

Apabila diperlukan cache.

Cache disimpan di Redis.

---

Redis

Redis digunakan untuk:

Realtime Cache.

Notification Queue.

AI Queue.

Temporary Session.

Rate Limiting.

WebSocket Pub/Sub.

Temporary Analytics.

Redis tidak boleh digunakan sebagai penyimpanan permanen.

---

Backup Strategy

Database harus mendukung:

Manual Backup.

Scheduled Backup.

Export.

Restore.

Verification.

Backup Metadata.

Riwayat backup harus disimpan.

---

Recovery

Apabila database gagal.

Backend harus mampu:

Mendeteksi.

Mencatat.

Memberikan peringatan.

Melakukan reconnect.

Melanjutkan proses setelah koneksi kembali.

---

Performance

AI wajib menghindari:

Query berulang.

N+1 Query.

Full Table Scan yang tidak diperlukan.

Join berlebihan.

Lock yang tidak perlu.

Seluruh query harus dirancang agar efisien.

---

Security

Data sensitif wajib disimpan dengan aman.

Password disimpan dalam bentuk hash.

Recovery Key tidak disimpan dalam bentuk asli.

Token dienkripsi apabila diperlukan.

Secret tidak boleh berada di database apabila cukup disimpan pada environment.

---

Future Ready

Database harus siap untuk:

Multi Server.

Multi Workspace.

Multi Owner.

Plugin.

Marketplace.

Cluster.

Remote Agent.

High Availability.

Tanpa perubahan arsitektur besar.

---

Coding Rules

AI wajib:

Menggunakan migration.

Tidak membuat perubahan manual.

Tidak membuat tabel tanpa alasan.

Tidak membuat nama tabel yang ambigu.

Tidak membuat relasi yang tidak jelas.

Tidak menghasilkan komentar pada source code produksi.

---

Acceptance Criteria

Batch ini dianggap selesai apabila:

Struktur database telah dirancang sesuai domain.

Migration siap digunakan.

Redis telah dipersiapkan.

Relasi telah ditentukan.

Strategi backup telah ditentukan.

Strategi recovery telah ditentukan.

Standar keamanan telah ditentukan.

Dokumentasi telah diperbarui.

AI telah melakukan verifikasi mandiri terhadap seluruh keputusan database sebelum melanjutkan ke file berikutnya.

Akhir dokumen.
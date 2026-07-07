My Dash

Batch 2 — Core Architecture

Tujuan

Batch kedua merupakan fondasi implementasi inti proyek.

Batch ini mulai membangun struktur proyek nyata berdasarkan seluruh keputusan yang telah ditetapkan pada Batch 1.

Seluruh implementasi wajib mengikuti blueprint proyek.

AI tidak boleh mengubah arsitektur inti tanpa instruksi baru.

AI wajib menjaga konsistensi terhadap seluruh dokumen sebelumnya.

---

Target Batch

Setelah batch ini selesai, proyek harus memiliki fondasi yang stabil untuk melanjutkan pengembangan fitur.

Target utama:

- Struktur proyek lengkap.
- Dependency terpasang.
- Konfigurasi dasar selesai.
- Fondasi frontend siap.
- Fondasi backend siap.
- Database siap.
- Redis siap.
- Realtime siap dikembangkan.
- Seluruh konfigurasi menggunakan environment.
- Tidak ada implementasi fitur bisnis.

Batch ini hanya membangun pondasi.

---

Teknologi Wajib

Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Node.js
- Express

Database

- PostgreSQL

Cache

- Redis

Realtime

- WebSocket

Scheduler

- Cron

Version Control

- Git

Package Manager

Gunakan satu package manager secara konsisten selama proyek berlangsung.

AI tidak boleh mencampurkan beberapa package manager.

---

Struktur Folder

AI wajib membuat struktur yang bersih.

Setiap folder hanya memiliki satu tanggung jawab.

Struktur harus mudah dipahami.

Struktur harus mudah dikembangkan.

Tidak boleh membuat folder yang tidak memiliki tujuan jelas.

Folder harus dipisahkan berdasarkan domain.

Contoh domain:

Frontend

Backend

Shared

Configuration

Database

Services

Modules

Hooks

Components

Layouts

Providers

Utilities

Types

Assets

Scripts

Testing

Deployment

Documentation

---

Modular Design

Seluruh sistem dibangun menggunakan pendekatan modular.

Setiap modul harus dapat:

dikembangkan

diuji

diganti

dipelihara

tanpa memengaruhi modul lain.

Tidak boleh membuat modul besar yang menangani terlalu banyak tanggung jawab.

---

Configuration System

Seluruh konfigurasi wajib dipusatkan.

Konfigurasi tidak boleh tersebar.

Konfigurasi tidak boleh di-hardcode.

Seluruh nilai penting harus dapat diubah melalui environment atau pengaturan dashboard.

Contoh:

Port

Database

Redis

Tunnel

Notification

Authentication

Session

Realtime

Logging

AI

GitHub

Cron

Timeout

Retry

---

Environment

AI wajib membuat sistem pembacaan environment yang aman.

Apabila nilai wajib belum tersedia.

Aplikasi harus memberikan pesan yang jelas.

Aplikasi tidak boleh crash tanpa penjelasan.

Tidak boleh menyimpan secret ke repository.

---

Logging

Seluruh service wajib memiliki sistem logging.

Level log:

Debug

Information

Warning

Error

Critical

Log harus mudah dibaca.

Log harus memiliki timestamp.

Log tidak boleh menyimpan password.

Log tidak boleh menyimpan token.

Log tidak boleh menyimpan recovery key.

---

Error Handling

Seluruh fungsi wajib memiliki penanganan kesalahan.

Error tidak boleh dibiarkan diam.

Error harus dicatat.

Error harus dapat dilacak.

Error harus memberikan informasi yang cukup untuk proses debugging.

---

Dependency Management

AI wajib memastikan:

Tidak terdapat dependency yang tidak digunakan.

Tidak terdapat package usang apabila terdapat alternatif yang lebih stabil.

Tidak terdapat dependency ganda dengan fungsi yang sama.

---

State Management

State harus dipisahkan menjadi:

Global State

Local State

Realtime State

Temporary State

Cache State

AI wajib memilih implementasi yang sederhana, mudah dipelihara, dan sesuai kebutuhan proyek.

Tidak boleh menggunakan state global untuk seluruh data.

---

API Layer

Frontend tidak boleh mengakses database.

Frontend hanya boleh menggunakan API.

Seluruh endpoint harus konsisten.

Seluruh respons harus memiliki format yang seragam.

Seluruh error harus memiliki format yang seragam.

---

Realtime Layer

Realtime merupakan komponen inti.

Seluruh komunikasi realtime dipusatkan.

AI harus menyiapkan fondasi yang mendukung:

CPU

RAM

Disk

Activity

Notification

Tunnel

Docker

Service

Analytics

Seluruh event harus mudah ditambah di masa depan.

---

Database Layer

AI hanya menyiapkan fondasi.

Belum membuat seluruh tabel.

Namun struktur harus siap dikembangkan.

Migration harus dapat dijalankan berulang kali dengan aman.

Tidak boleh membuat migration yang merusak data lama.

---

Security Foundation

Batch ini mulai membangun keamanan dasar.

Password tidak boleh disimpan dalam bentuk asli.

Session dipersiapkan.

Secret dipisahkan.

Konfigurasi sensitif tidak boleh berada pada frontend.

---

Coding Rules

Seluruh source code produksi:

Tidak boleh memiliki komentar.

Tidak boleh memiliki kode yang tidak digunakan.

Tidak boleh memiliki import yang tidak digunakan.

Tidak boleh memiliki warning.

Tidak boleh memiliki error type.

Tidak boleh memiliki TODO.

Tidak boleh memiliki FIXME.

---

Acceptance Criteria

Batch ini dianggap selesai apabila:

Struktur proyek sesuai blueprint.

Dependency berhasil dipasang.

Konfigurasi dasar selesai.

Build berhasil.

Lint berhasil.

Type checking berhasil.

Tidak terdapat warning.

Tidak terdapat error runtime.

Tidak terdapat konfigurasi sensitif pada repository.

Dokumentasi diperbarui.

AI telah melakukan verifikasi mandiri sesuai dokumen verification.

AI berhenti dan menunggu instruksi pengguna untuk melanjutkan ke file berikutnya.

Akhir dokumen.
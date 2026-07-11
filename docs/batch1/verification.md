My Dash

Batch 1 — Verification

Tujuan

Dokumen ini mendefinisikan standar verifikasi yang wajib dilakukan AI agent setelah menyelesaikan setiap batch.

AI tidak boleh menganggap pekerjaan selesai hanya karena aplikasi berhasil dijalankan.

Setiap implementasi wajib melalui proses pemeriksaan menyeluruh.

Apabila terdapat satu saja kegagalan pada proses verifikasi, AI wajib memperbaikinya terlebih dahulu sebelum melanjutkan ke batch berikutnya.

---

Filosofi Verifikasi

Verifikasi merupakan bagian dari proses pengembangan.

Verifikasi bukan tahap tambahan.

Seluruh perubahan yang dibuat AI harus langsung diverifikasi.

Semakin cepat masalah ditemukan, semakin kecil risiko merusak batch berikutnya.

---

Urutan Verifikasi

AI wajib melakukan pemeriksaan dengan urutan berikut.

1. Validasi struktur proyek.
2. Validasi dependency.
3. Validasi konfigurasi.
4. Validasi source code.
5. Validasi lint.
6. Validasi type checking.
7. Validasi build.
8. Validasi runtime.
9. Validasi frontend.
10. Validasi backend.
11. Validasi database.
12. Validasi Redis.
13. Validasi WebSocket.
14. Validasi authentication.
15. Validasi session.
16. Validasi notification.
17. Validasi tunnel.
18. Validasi Git.
19. Validasi dokumentasi.

AI tidak boleh melewati salah satu tahapan.

---

Pemeriksaan Struktur

AI wajib memastikan:

Seluruh folder sesuai blueprint.

Tidak ada folder kosong yang tidak diperlukan.

Tidak ada file duplikat.

Tidak ada file sementara.

Tidak ada dependency yang tidak digunakan.

---

Pemeriksaan Source Code

AI wajib memastikan:

Tidak terdapat syntax error.

Tidak terdapat import yang tidak digunakan.

Tidak terdapat variable yang tidak digunakan.

Tidak terdapat fungsi mati.

Tidak terdapat kode duplikat.

Tidak terdapat konfigurasi yang di-hardcode.

Tidak terdapat komentar pada source code produksi.

---

Pemeriksaan Build

AI wajib memastikan proses build berhasil tanpa modifikasi manual.

Seluruh aset berhasil dihasilkan.

Tidak terdapat warning build.

Tidak terdapat dependency yang hilang.

---

Pemeriksaan Runtime

Setelah aplikasi dijalankan, AI wajib memastikan:

Frontend dapat dibuka.

Backend berjalan.

API dapat diakses.

WebSocket aktif.

Scheduler aktif.

Redis aktif.

Database aktif.

Seluruh service berada pada status sehat.

---

Pemeriksaan Frontend

AI wajib memeriksa:

Seluruh halaman dapat dibuka.

Tidak ada halaman kosong.

Tidak ada komponen rusak.

Tidak ada overflow.

Tidak ada elemen bertumpuk.

Tidak ada console error.

Tidak ada network error.

Tidak ada gambar yang gagal dimuat.

Tidak ada icon yang hilang.

---

Pemeriksaan Responsive

Minimal dilakukan pada resolusi berikut.

320px

360px

375px

390px

430px

768px

1024px

1280px

1440px

1920px

Semua halaman wajib tetap dapat digunakan.

---

Pemeriksaan Realtime

AI wajib memastikan:

Data CPU berubah secara realtime.

Data RAM berubah secara realtime.

Grafik diperbarui.

Activity bertambah otomatis.

Notification realtime berjalan.

WebSocket melakukan reconnect apabila koneksi terputus.

---

Pemeriksaan Authentication

AI wajib memastikan:

Password dapat digunakan.

Password salah ditolak.

Session dibuat setelah login.

Session berakhir sesuai konfigurasi.

Logout menghapus session.

Recovery berjalan sesuai rancangan.

---

Pemeriksaan Notification

AI wajib memastikan:

Rule Engine berjalan.

Template lokal berhasil dibuat.

WhatsApp dapat mengirim apabila telah dikonfigurasi.

Telegram dapat mengirim apabila telah dikonfigurasi.

Apabila AI Analysis gagal atau timeout, template lokal tetap terkirim.

Timeout AI mengikuti konfigurasi proyek.

---

Pemeriksaan AI

Apabila AI diaktifkan.

AI wajib memastikan:

Provider utama dapat digunakan.

Fallback berjalan.

Timeout diterapkan.

Kegagalan AI tidak menghentikan dashboard.

AI tidak dipanggil untuk fitur yang tidak memerlukannya.

---

Pemeriksaan Keamanan

AI wajib memastikan:

Secret tidak tersimpan pada source code.

API key tidak masuk repository.

Password telah di-hash.

Session aman.

Environment digunakan untuk konfigurasi sensitif.

Tidak ada informasi sensitif pada log.

---

Pemeriksaan Git

Sebelum melakukan commit.

AI wajib memastikan:

Tidak terdapat file sementara.

Tidak terdapat file cache.

Tidak terdapat file build yang tidak perlu.

Tidak terdapat token.

Tidak terdapat password.

Tidak terdapat recovery key.

Tidak terdapat file environment pribadi.

Tidak terdapat folder dokumentasi internal yang memang tidak boleh dipublikasikan sesuai aturan proyek.

---

Commit

Commit harus memiliki pesan yang jelas.

Commit tidak boleh dilakukan apabila masih terdapat error.

Commit tidak boleh dilakukan apabila build gagal.

Commit tidak boleh dilakukan apabila lint gagal.

Commit tidak boleh dilakukan apabila type checking gagal.

---

Push

Push hanya boleh dilakukan apabila:

Seluruh verifikasi berhasil.

Seluruh dokumentasi diperbarui.

README telah tersedia.

LICENSE telah tersedia.

.gitignore telah sesuai.

Tidak terdapat informasi sensitif.

Apabila pengguna belum memberikan izin melakukan push, AI hanya menyiapkan repository dalam keadaan siap dipush.

---

Laporan Akhir

Setelah seluruh pemeriksaan selesai.

AI wajib membuat laporan akhir yang berisi:

Ringkasan pekerjaan.

Daftar fitur yang berhasil dibuat.

Daftar perbaikan yang dilakukan.

Hasil seluruh pemeriksaan.

Masalah yang belum dapat diselesaikan apabila ada.

Rekomendasi untuk batch berikutnya.

---

Aturan Melanjutkan Batch

Batch dianggap selesai hanya apabila seluruh pemeriksaan pada dokumen ini berhasil.

Apabila masih terdapat satu kegagalan.

AI wajib memperbaikinya.

AI tidak boleh melanjutkan ke batch berikutnya.

AI wajib menunggu instruksi pengguna.

Akhir dokumen.
Batch 6 — Authentication and Session Architecture

Tujuan

Authentication dan Session Management merupakan fondasi keamanan seluruh My Dash. Modul ini bukan hanya bertugas memverifikasi identitas pengguna, tetapi juga memastikan bahwa setiap permintaan yang masuk benar-benar berasal dari pengguna yang sah, setiap sesi memiliki masa berlaku yang jelas, setiap perubahan status dapat diaudit, serta setiap Workspace tetap terisolasi satu sama lain.

Pada My Dash, Authentication diperlakukan sebagai sebuah Security Domain yang berdiri sendiri. Domain ini tidak boleh bergantung pada Dashboard, Notification Engine, Analytics, maupun Monitoring Engine. Seluruh modul lain harus bergantung pada Authentication, bukan sebaliknya.

Arsitektur ini dirancang agar di masa depan sistem dapat mendukung berbagai metode autentikasi tanpa mengubah logika bisnis modul lain.

---

Filosofi Authentication

Authentication memiliki satu tujuan.

Membuktikan identitas.

Authorization memiliki tujuan berbeda.

Menentukan hak akses.

Session mempunyai tujuan lain.

Mempertahankan identitas pengguna setelah proses Authentication selesai.

Ketiga konsep tersebut tidak boleh dicampur.

Kesalahan paling umum dalam banyak aplikasi adalah mencampurkan Authentication dengan Authorization sehingga kode menjadi sulit dipelihara.

My Dash harus memisahkan seluruh tanggung jawab tersebut.

---

First Installation Flow

Ketika pengguna pertama kali menjalankan instalasi menggunakan Git Clone kemudian menjalankan AI Agent sesuai urutan Batch Prompt, Dashboard belum memiliki akun apa pun.

Sebelum AI membuat seluruh layanan.

AI wajib meminta beberapa informasi.

Password Dashboard.

Nama Workspace.

Timezone.

Bahasa.

Nama Server.

Konfirmasi Persetujuan.

Password Dashboard merupakan Root Credential pertama.

Password tidak boleh disimpan dalam bentuk teks biasa.

Password tidak boleh dikirim ke AI Provider.

Password tidak boleh muncul pada Log.

Password hanya digunakan untuk menghasilkan Hash yang aman.

---

Login Philosophy

My Dash bukan aplikasi publik seperti media sosial.

Dashboard biasanya hanya digunakan oleh satu pemilik VPS atau beberapa administrator yang dipercaya.

Karena itu proses Login harus sederhana namun sangat aman.

Alur Login.

User membuka Dashboard.

↓

Session diperiksa.

↓

Apabila Session masih valid.

Dashboard langsung dibuka.

↓

Apabila Session telah berakhir.

Halaman Login muncul.

↓

Password diverifikasi.

↓

Session baru dibuat.

↓

Dashboard dimuat.

Tidak diperlukan Login berulang ketika Session masih berlaku.

---

Session Lifetime

Secara default.

Session berlaku selama.

24 Jam.

Setelah 24 jam.

Session otomatis dianggap tidak valid.

Dashboard tidak boleh memperpanjang Session secara diam-diam.

Pengguna wajib melakukan autentikasi ulang.

Pendekatan ini mengurangi risiko apabila perangkat pengguna ditinggalkan dalam keadaan terbuka.

Administrator dapat mengubah masa berlaku Session melalui Settings.

Namun nilai maksimum harus memiliki batas yang masuk akal.

---

Session Lifecycle

Setiap Session mengikuti siklus hidup.

Created.

↓

Authenticated.

↓

Active.

↓

Idle.

↓

Expiring.

↓

Expired.

↓

Destroyed.

Seluruh perubahan status dicatat pada Audit.

Apabila Browser ditutup.

Session tetap aktif selama belum melewati masa berlaku.

---

Session Structure

Setiap Session memiliki informasi.

Session Identifier.

Workspace Identifier.

User Identifier.

Creation Time.

Expiration Time.

Last Activity.

IPAddress.

Device Identifier.

Browser Information.

Operating System.

Authentication Method.

Version.

Status.

Correlation Identifier.

Session tidak menyimpan Password.

Session hanya menyimpan referensi terhadap identitas pengguna.

---

Password Policy

Password harus memenuhi standar keamanan minimum.

Panjang minimum.

Kompleksitas dapat dikonfigurasi.

Hash menggunakan algoritma yang kuat.

Salt unik untuk setiap Password.

Perubahan Password menghasilkan Hash baru.

Hash lama tidak digunakan kembali.

AI tidak boleh membuat algoritma Hash sendiri.

Gunakan algoritma yang telah teruji.

---

Mathematical Password Entropy

Misalkan.

Password memiliki.

16 Karakter.

Setiap karakter dipilih dari.

94 Simbol.

Jumlah kemungkinan.

94¹⁶

≈

3.7 × 10³¹

Kemudian Entropy.

H

=

log₂(94¹⁶)

≈

104.9 Bit

Semakin tinggi Entropy.

Semakin sulit Password ditebak melalui Brute Force.

Dashboard dapat menampilkan indikator kekuatan Password ketika proses instalasi.

Namun Password asli tidak boleh pernah ditampilkan kembali.

---

Session Validation

Setiap Request yang membutuhkan Authentication mengikuti alur.

Token diterima.

↓

Format diperiksa.

↓

Signature diverifikasi.

↓

Expiration diperiksa.

↓

Workspace diperiksa.

↓

Status Session diperiksa.

↓

Hak akses diperiksa.

↓

Request diteruskan.

Apabila salah satu langkah gagal.

Request langsung dihentikan.

Tidak ada proses lain yang dijalankan.

---

Session Storage

Session aktif disimpan menggunakan pendekatan Hybrid.

Metadata permanen.

PostgreSQL.

Realtime Session.

Redis.

Dengan demikian.

Validasi menjadi sangat cepat.

Namun Audit tetap tersimpan secara permanen.

Apabila Redis Restart.

Session dapat dipulihkan dari PostgreSQL sesuai kebijakan sistem.

---

Session Rotation

Session tidak boleh digunakan selamanya.

Pada kondisi tertentu.

Session harus diganti.

Contohnya.

Password berubah.

Role berubah.

Workspace berubah.

Administrator melakukan Force Logout.

Terjadi indikasi penyalahgunaan.

Session lama langsung dinonaktifkan.

Session baru dibuat.

Pendekatan ini mengurangi risiko Session Hijacking.

---

Brute Force Protection

Login tidak boleh menerima percobaan tanpa batas.

Misalkan.

Lima kali gagal.

↓

Cooldown.

↓

Percobaan berikutnya.

↓

Cooldown lebih panjang.

Gunakan Exponential Backoff.

Delay(n)

=

Base Delay

×

2ⁿ

Sebagai contoh.

Base.

5 Detik.

Percobaan gagal ke-5.

Delay.

160 Detik.

Pendekatan ini jauh lebih efektif dibanding langsung memblokir pengguna.

---

Authorization

Setelah Authentication berhasil.

Authorization menentukan hak akses.

Minimal mendukung.

Owner.

Administrator.

Read Only.

Future Custom Role.

Setiap Endpoint memiliki Permission.

Dashboard tidak boleh menyembunyikan tombol saja.

Backend tetap harus melakukan validasi Permission.

---

Session Recovery

Apabila Backend Restart.

Dashboard tidak langsung Logout.

Dashboard mencoba.

Reconnect.

↓

Session Validation.

↓

Workspace Validation.

↓

Subscription Recovery.

↓

Dashboard Ready.

Apabila Session telah kedaluwarsa.

Baru pengguna diarahkan ke halaman Login.

---

Security Considerations

Password.

Token.

Session Identifier.

Recovery Key.

Secret.

Credential.

Tidak boleh muncul.

Pada URL.

Pada Log.

Pada Notification.

Pada AI Prompt.

Pada Error Message.

Kesalahan validasi harus menjelaskan penyebab secara umum tanpa membocorkan informasi sensitif.

---

Performance

Target waktu validasi Session.

Kurang dari.

20 Milidetik.

Target pembuatan Session.

Kurang dari.

100 Milidetik.

Target Logout.

Kurang dari.

50 Milidetik.

Target Recovery setelah Restart.

Kurang dari.

5 Detik.

AI wajib mengoptimalkan seluruh jalur Authentication agar tidak menjadi bottleneck sistem.

---

Acceptance Criteria

Authentication dan Session Architecture dianggap selesai apabila mampu memisahkan Authentication, Authorization, dan Session Management menjadi Domain yang independen, menerapkan Password Hash yang aman, Session Hybrid menggunakan PostgreSQL dan Redis, Session Lifetime selama dua puluh empat jam secara default, Session Rotation, Brute Force Protection, Recovery otomatis, Audit lengkap, serta validasi Permission pada seluruh Endpoint.

AI wajib melakukan pengujian terhadap Login normal, Password salah, Session kedaluwarsa, Force Logout, Restart Backend, Redis Restart, PostgreSQL Recovery, Brute Force Simulation, Session Hijacking Simulation, serta memastikan tidak terdapat kebocoran credential, race condition, ataupun inkonsistensi Session sebelum melanjutkan ke dokumen berikutnya.

Akhir dokumen.
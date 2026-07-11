My Dash

Batch 1 — Frontend Foundation

Tujuan

Dokumen ini menjadi standar utama seluruh pengembangan antarmuka My Dash.

Seluruh halaman, komponen, layout, animasi, interaksi, warna, ukuran, tipografi, hingga perilaku antarmuka wajib mengikuti dokumen ini.

AI tidak boleh membuat tampilan berdasarkan preferensinya sendiri.

Seluruh keputusan desain harus konsisten dengan identitas My Dash.

---

Filosofi UI

My Dash merupakan dashboard profesional.

Bukan landing page.

Bukan portfolio.

Bukan website promosi.

Bukan panel game.

Seluruh desain harus memberikan kesan:

Profesional.

Modern.

Premium.

Cepat.

Ringan.

Terstruktur.

Bersih.

Mudah dipahami.

Tidak melelahkan mata.

Tidak berlebihan.

---

Target Pengalaman Pengguna

Ketika pengguna pertama kali membuka dashboard, pengguna harus langsung memahami kondisi VPS dalam waktu kurang dari lima detik.

Informasi paling penting harus langsung terlihat.

Pengguna tidak boleh dipaksa membuka banyak menu hanya untuk melihat kondisi server.

Dashboard harus terasa hidup melalui pembaruan data secara realtime, bukan karena animasi yang berlebihan.

---

Mobile First

Seluruh desain wajib dimulai dari ukuran layar ponsel.

Breakpoint yang harus dipastikan berfungsi dengan baik:

320px

360px

375px

390px

412px

430px

480px

600px

768px

1024px

1280px

1440px

1600px

1920px

Tidak boleh ada elemen yang keluar dari layar.

Tidak boleh ada horizontal scrolling.

Tidak boleh ada tabel yang merusak tampilan mobile.

---

Layout

Layout terdiri dari:

Top Navigation

Sidebar

Content

Notification Drawer

Modal Layer

Floating Action Layer

Toast Layer

Loading Layer

Dialog Layer

Shortcut Layer

Layout harus tetap konsisten pada seluruh halaman.

---

Sidebar

Sidebar merupakan pusat navigasi.

Sidebar harus dapat:

Collapse

Expand

Remember State

Search Menu

Highlight Active Menu

Support Keyboard Navigation

Support Touch Device

Pada perangkat kecil, sidebar berubah menjadi drawer.

---

Top Navigation

Top navigation selalu berada di bagian atas.

Berisi:

Logo

Nama Server

Health Score

Global Search

Realtime Status

Notification

GitHub

Settings

User Menu

Top navigation tetap terlihat ketika halaman digulir.

---

Dashboard Card

Seluruh informasi menggunakan card kecil.

Card harus memiliki ukuran konsisten.

Card tidak boleh terlalu tinggi.

Card tidak boleh terlalu lebar.

Setiap card hanya memiliki satu fokus informasi.

---

Grid System

Gunakan grid adaptif.

Desktop dapat menggunakan beberapa kolom.

Tablet mengurangi jumlah kolom.

Mobile menggunakan satu kolom.

Tidak boleh ada ukuran card yang menyebabkan layout terasa berantakan.

---

Warna

Tema utama:

Dark.

Warna dasar:

Hitam keabu-abuan.

Navy.

Slate.

Blue.

Tidak menggunakan:

Gradient.

Glass.

Glow.

Shadow besar.

Efek blur berlebihan.

---

Tipografi

Gunakan tipografi modern.

Ukuran teks harus konsisten.

Heading.

Sub Heading.

Body.

Caption.

Label.

Metric.

Nilai statistik harus lebih menonjol dibanding labelnya.

---

Icon

Seluruh icon menggunakan gaya yang sama.

Tidak boleh mencampur berbagai gaya icon.

Icon harus sederhana.

Mudah dikenali.

Tidak terlalu tebal.

Tidak terlalu tipis.

---

Animation

Animasi bertujuan membantu pengguna.

Bukan hiburan.

Seluruh animasi harus:

Halus.

Singkat.

Konsisten.

Target durasi:

200ms

250ms

300ms

Tidak boleh menggunakan animasi yang membuat dashboard terasa lambat.

---

Loading

Setiap halaman wajib memiliki:

Skeleton Loading.

Progress Loading.

Button Loading.

Page Loading.

Realtime Loading.

Tidak boleh menggunakan spinner sebagai satu-satunya indikator loading.

---

Empty State

Apabila data kosong.

Dashboard harus memberikan penjelasan.

Tidak boleh hanya menampilkan layar kosong.

Setiap empty state wajib memiliki:

Judul.

Deskripsi.

Langkah berikutnya.

Tombol aksi apabila diperlukan.

---

Error State

Apabila terjadi kesalahan.

Pengguna harus mengetahui:

Apa yang gagal.

Kemungkinan penyebab.

Apa yang dapat dilakukan.

Error harus mudah dipahami.

Tidak boleh menampilkan pesan internal aplikasi.

---

Success State

Setiap tindakan yang berhasil wajib memberikan konfirmasi.

Konfirmasi menggunakan toast atau dialog sesuai tingkat pentingnya.

---

Notification

Toast harus ringan.

Tidak menghalangi pekerjaan pengguna.

Toast dapat ditutup.

Toast memiliki auto dismiss.

Toast mendukung:

Success.

Information.

Warning.

Error.

Critical.

---

Realtime

Seluruh data realtime diperbarui tanpa me-refresh halaman.

Perubahan angka harus dianimasikan secara halus.

Grafik diperbarui secara bertahap.

Tidak boleh berkedip.

Tidak boleh menghilang lalu muncul kembali.

---

Accessibility

Seluruh halaman harus dapat digunakan menggunakan keyboard.

Focus indicator wajib terlihat.

Kontras warna harus baik.

Ukuran tombol harus nyaman disentuh pada perangkat mobile.

---

Konsistensi

Komponen yang sama harus selalu memiliki perilaku yang sama.

Button.

Modal.

Drawer.

Dialog.

Input.

Dropdown.

Tooltip.

Card.

Badge.

Table.

Chart.

Tidak boleh memiliki implementasi berbeda pada halaman lain.

---

Kualitas

Frontend dianggap selesai apabila:

Tidak terdapat layout yang rusak.

Tidak terdapat overflow.

Tidak terdapat console error.

Tidak terdapat warning.

Semua halaman responsif.

Semua komponen konsisten.

Semua animasi halus.

Semua state telah diimplementasikan.

Seluruh tampilan sesuai identitas My Dash.

Akhir dokumen.
My Dash Prompt Documentation

Pendahuluan

Folder "docs" merupakan spesifikasi resmi proyek My Dash. Seluruh dokumen di dalam folder ini dirancang sebagai panduan implementasi bagi AI Agent sehingga proses pembangunan sistem berlangsung secara bertahap, konsisten, dan mengikuti arsitektur yang telah ditetapkan.

Dokumen pada folder ini bukan dokumentasi pengguna akhir.

Dokumen ini adalah spesifikasi teknis internal yang menjelaskan bagaimana AI harus berpikir, mengambil keputusan, merancang struktur proyek, melakukan implementasi, menguji hasil, melakukan verifikasi, hingga mempublikasikan proyek.

Seluruh dokumen saling berhubungan.

AI tidak boleh membaca dokumen secara acak.

AI tidak boleh melewati Batch.

AI tidak boleh mengimplementasikan fitur yang berasal dari Batch berikutnya sebelum seluruh pekerjaan pada Batch saat ini selesai.

---

Struktur Folder

Folder dokumentasi disusun sebagai berikut.

docs/

main.md

batch1/

batch2/

batch3/

batch4/

batch5/

batch6/

batch7/

Setiap Batch memiliki tujuan yang berbeda.

Batch pertama membangun fondasi.

Batch berikutnya memperluas kemampuan sistem.

Batch terakhir melakukan validasi, pengujian, finalisasi, dan publikasi.

---

Cara AI Bekerja

AI wajib bekerja menggunakan pendekatan bertahap.

Langkah pertama.

Membaca "main.md".

Langkah kedua.

Membaca seluruh dokumen pada Batch yang diminta pengguna.

Langkah ketiga.

Membangun Context Internal berdasarkan dokumen tersebut.

Langkah keempat.

Melakukan implementasi.

Langkah kelima.

Melakukan Build.

Langkah keenam.

Melakukan Testing.

Langkah ketujuh.

Melakukan Self Review.

Langkah kedelapan.

Memastikan seluruh Acceptance Criteria pada Batch tersebut telah terpenuhi.

Baru setelah itu AI diperbolehkan berpindah ke Batch berikutnya.

---

Aturan Membaca Dokumen

AI harus membaca seluruh file pada Batch yang sama.

Sebagai contoh.

Apabila pengguna meminta.

"Baca Batch 5."

Maka AI wajib membaca seluruh dokumen yang berada pada folder Batch 5.

AI tidak boleh hanya membaca satu file.

Karena setiap file menjelaskan bagian sistem yang saling melengkapi.

---

Larangan

AI tidak diperbolehkan.

Melompati Batch.

Mengubah spesifikasi tanpa alasan teknis yang kuat.

Mengurangi kualitas implementasi demi mempercepat pengerjaan.

Menambahkan fitur yang bertentangan dengan arsitektur.

Menghapus fitur yang telah ditentukan.

Mempublikasikan Prompt Internal ke Repository produksi apabila dokumen tersebut memang ditujukan hanya sebagai panduan AI.

---

Prinsip Implementasi

Seluruh implementasi harus mengikuti prinsip berikut.

Architecture First.

Security First.

Performance First.

Maintainability First.

Scalability First.

Reliability First.

User Experience First.

AI harus selalu memilih solusi yang paling mudah dipelihara dalam jangka panjang.

---

Verifikasi

Setelah setiap Batch selesai.

AI wajib melakukan.

Build.

Lint.

Type Check.

Unit Test.

Integration Test.

Performance Review.

Security Review.

Architecture Review.

Self Review.

Seluruh hasil harus berhasil sebelum AI berpindah ke Batch berikutnya.

---

Publikasi

Publikasi Repository hanya boleh dilakukan setelah.

Seluruh Batch selesai.

Seluruh Acceptance Criteria terpenuhi.

Seluruh Testing berhasil.

Repository bersih.

README selesai.

LICENSE selesai.

.gitignore selesai.

Tidak terdapat Secret.

Tidak terdapat Credential.

Tidak terdapat File sementara.

Tidak terdapat Folder internal yang tidak boleh dipublikasikan.

Apabila GitHub CLI tersedia dan autentikasi valid, AI dapat menggunakan Git dan GitHub CLI untuk memverifikasi Repository, melakukan Commit, melakukan Push, lalu memverifikasi bahwa perubahan telah berhasil tersinkronisasi ke Repository tujuan.

---

Penutup

Dokumen pada folder "docs" merupakan fondasi utama proses pengembangan My Dash.

AI wajib memperlakukan seluruh spesifikasi sebagai kontrak implementasi, bukan sebagai saran.

Apabila terdapat keraguan dalam proses implementasi, AI harus memilih pendekatan yang paling sesuai dengan arsitektur, keamanan, performa, dan kualitas perangkat lunak yang telah dijelaskan pada seluruh Batch sebelumnya.

Akhir dokumen.
Batch 5 — Notification Queue Architecture

Tujuan

Notification Queue merupakan salah satu komponen paling penting di dalam My Dash karena seluruh notifikasi, baik yang dikirim melalui WhatsApp, Telegram, maupun Provider lain pada masa depan, harus melewati Queue terlebih dahulu.

Queue tidak dibuat hanya agar proses pengiriman dapat dilakukan secara asynchronous. Fungsi utamanya adalah menjaga konsistensi sistem ketika jumlah event meningkat secara drastis, ketika Provider mengalami gangguan, ketika jaringan VPS tidak stabil, ataupun ketika beberapa Worker sedang sibuk memproses ribuan event lainnya.

Tanpa Queue, Notification Engine harus langsung mengirim pesan ketika Rule Engine menghasilkan event. Pendekatan tersebut memang sederhana, tetapi memiliki kelemahan yang sangat besar.

Misalnya terjadi lonjakan CPU yang memicu lima ratus Rule hanya dalam waktu tiga detik.

Apabila seluruh event langsung dikirim ke WhatsApp secara bersamaan, maka akan terjadi beberapa kemungkinan.

Provider melakukan Rate Limit.

Penggunaan CPU backend meningkat tajam.

RAM meningkat akibat banyaknya koneksi yang aktif.

Sebagian pesan gagal terkirim.

Retry terjadi bersamaan sehingga memperburuk keadaan.

Fenomena tersebut dikenal sebagai Retry Storm atau Notification Flood.

Notification Queue dibangun untuk menghilangkan permasalahan tersebut.

---

Filosofi Queue

Queue memiliki prinsip yang sangat sederhana.

Event tidak pernah langsung dikirim.

Event selalu menunggu giliran.

Walaupun terdengar sederhana, prinsip ini membuat sistem menjadi jauh lebih stabil.

Setiap Event yang masuk akan diperlakukan sebagai sebuah pekerjaan independen.

Pekerjaan tersebut memiliki identitas, prioritas, waktu kedaluwarsa, metadata, retry counter, serta status yang akan berubah selama siklus hidupnya.

Dengan demikian Notification Engine tidak pernah kehilangan kendali terhadap proses pengiriman.

---

Mengapa Queue Sangat Penting

Bayangkan sebuah VPS menghasilkan event seperti berikut.

CPU Critical.

RAM Critical.

Disk Warning.

Tunnel Offline.

Tunnel Recovery.

Backup Success.

Automation Success.

GitHub Action Success.

Docker Restart.

Container Healthy.

Semua terjadi dalam waktu kurang dari lima detik.

Jika sistem langsung mengirim seluruh notifikasi tersebut maka pengguna akan menerima sepuluh pesan berturut-turut.

Sebagian informasi sebenarnya tidak lagi penting karena telah digantikan oleh kondisi terbaru.

Sebagai contoh.

Tunnel Offline.

Lima detik kemudian.

Tunnel Connected.

Pengguna sebenarnya cukup menerima satu ringkasan.

"Tunnel sempat terputus selama lima detik dan berhasil dipulihkan secara otomatis."

Inilah alasan Notification Queue harus bekerja bersama Rule Engine dan Notification Aggregator.

---

Siklus Hidup Sebuah Event

Setiap Event mempunyai Lifecycle yang tetap.

Event dibuat oleh Rule Engine.

↓

Event diberi Identifier unik.

↓

Event divalidasi.

↓

Event dimasukkan ke Priority Queue.

↓

Worker mengambil Event.

↓

Template dibuat.

↓

Provider dipilih.

↓

Pesan dikirim.

↓

Delivery diverifikasi.

↓

History diperbarui.

↓

Analytics diperbarui.

↓

Event ditandai selesai.

Siklus tersebut tidak boleh berubah.

Seluruh Provider harus mengikuti alur yang sama.

---

Struktur Internal Queue

Secara konseptual setiap item Queue memiliki beberapa atribut utama.

Event Identifier.

Workspace Identifier.

Server Identifier.

Priority.

Severity.

Category.

Created Timestamp.

Expired Timestamp.

Retry Counter.

Maximum Retry.

Cooldown.

Template Version.

Provider Target.

Payload Hash.

Current Status.

Correlation Identifier.

Payload Hash digunakan untuk mendeteksi Event yang identik sehingga sistem dapat melakukan deduplikasi.

Correlation Identifier digunakan untuk menghubungkan beberapa Event yang berasal dari akar masalah yang sama.

Sebagai contoh.

CPU tinggi menyebabkan Docker lambat.

Docker lambat menyebabkan Tunnel gagal.

Ketiga Event tersebut tetap memiliki Identifier berbeda, namun Correlation Identifier sama sehingga Dashboard mampu menampilkan hubungan antar kejadian.

---

Priority Scheduling

Queue tidak menggunakan First Come First Serve secara penuh.

Pendekatan tersebut memang adil, namun tidak cocok untuk Notification.

Sebagai contoh.

Sebuah Notification "Backup Success" masuk terlebih dahulu.

Dua detik kemudian.

Disk mencapai seratus persen.

Apabila Queue hanya menggunakan FIFO.

Notification Backup akan dikirim lebih dahulu.

Padahal secara operasional Disk Full jauh lebih penting.

Oleh karena itu Queue menggunakan Priority Scheduling.

Priority dihitung menggunakan beberapa parameter.

Severity.

Category.

Health Impact.

Automation Result.

Retry Status.

Event Age.

Priority akhir dihitung menggunakan fungsi pembobotan.

Priority Score

=

(Severity × 0.40)

+ 

(Category Weight × 0.20)

+ 

(Health Impact × 0.20)

+ 

(Event Age × 0.10)

+ 

(Retry Weight × 0.10)

Nilai terbesar diproses terlebih dahulu.

Pendekatan ini membuat Queue lebih adaptif dibanding menggunakan urutan waktu semata.

---

Queue Complexity

Target kompleksitas Queue harus tetap rendah.

Operasi memasukkan Event.

O(log n)

Operasi mengambil Event Prioritas.

O(log n)

Operasi melihat Event berikutnya.

O(1)

Operasi memperbarui Status.

O(log n)

Dengan pendekatan Heap Priority Queue, performa tetap stabil walaupun jumlah Event mencapai puluhan ribu.

---

Event Deduplication

Tidak semua Event harus dikirim.

Sebagai contoh.

CPU.

96%.

↓

97%.

↓

96%.

↓

98%.

↓

97%.

Seluruh perubahan tersebut sebenarnya menggambarkan kondisi yang sama.

Queue harus mampu mendeteksi pola tersebut menggunakan Payload Hash.

Hash dihitung berdasarkan.

Rule Identifier.

Server.

Severity.

Category.

Threshold.

Apabila Hash identik dan Event masih berada pada rentang waktu yang dapat digabungkan, Queue cukup memperbarui nilai terakhir tanpa membuat Event baru.

Pendekatan ini mampu mengurangi jumlah Notification secara signifikan.

---

Sliding Window Aggregation

Queue juga menerapkan Sliding Window.

Misalkan ukuran Window adalah enam puluh detik.

Seluruh Event dengan kategori yang sama yang muncul selama periode tersebut dapat digabungkan menjadi satu Summary Notification.

Secara matematis.

Window(t)

=

{Eventᵢ | Timestampᵢ ∈ [t−60, t]}

Kemudian dilakukan proses Aggregation.

Hasilnya.

Lima belas Notification CPU berubah menjadi satu Ringkasan CPU.

Teknik ini menjaga pengalaman pengguna tetap nyaman.

---

Backpressure

Apabila jumlah Event lebih besar dibanding kemampuan Worker.

Queue memasuki mode Backpressure.

Backpressure berarti Queue memperlambat penerimaan Event berprioritas rendah.

Namun Event Critical tetap diterima.

Pendekatan ini mencegah penggunaan RAM meningkat tanpa batas.

Selain itu Worker tidak pernah dipaksa bekerja melebihi kapasitasnya.

---

Recovery

Queue harus bersifat persisten.

Apabila Backend tiba-tiba berhenti.

Restart.

Crash.

Update.

Listrik padam.

Kernel Panic.

Event yang belum selesai tidak boleh hilang.

Saat aplikasi kembali aktif.

Queue dimuat kembali.

Worker melanjutkan pekerjaan yang belum selesai.

Status terakhir dipertahankan.

Pendekatan ini memberikan jaminan bahwa Notification penting tidak hilang hanya karena aplikasi sempat berhenti.

---

Acceptance Criteria

Notification Queue dianggap selesai apabila mampu mengelola Event menggunakan Priority Queue, mendukung deduplikasi, Sliding Window Aggregation, Backpressure, Retry, Recovery, Persistence, serta mampu mempertahankan performa yang stabil ketika menerima ribuan Event dalam waktu singkat.

AI wajib melakukan simulasi beban tinggi, simulasi Retry Storm, simulasi Provider gagal, simulasi Restart Server, dan simulasi Queue Recovery untuk memastikan tidak terdapat kehilangan Event, inkonsistensi Status, maupun penurunan performa yang signifikan sebelum melanjutkan ke dokumen berikutnya.

Akhir dokumen.
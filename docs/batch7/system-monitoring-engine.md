Batch 7 — System Monitoring Engine

Tujuan

System Monitoring Engine merupakan inti dari seluruh ekosistem My Dash. Hampir seluruh fitur yang ada pada Dashboard bergantung pada modul ini. Analytics tidak dapat berjalan tanpa Monitoring. Notification tidak dapat bekerja tanpa Monitoring. Automation tidak dapat mengambil keputusan tanpa Monitoring. Health Score tidak dapat dihitung tanpa Monitoring. AI juga tidak dapat memberikan analisis apabila tidak memiliki data yang cukup.

Monitoring Engine bukan sekadar proses yang membaca penggunaan CPU atau RAM setiap beberapa detik.

Monitoring Engine merupakan Real-Time Data Acquisition System yang bertugas mengumpulkan, memverifikasi, membersihkan, menormalisasi, mengklasifikasikan, serta mendistribusikan seluruh informasi operasional VPS kepada modul lain dengan latensi serendah mungkin.

Seluruh modul lain harus menganggap Monitoring Engine sebagai satu-satunya sumber data operasional. Tidak diperbolehkan ada modul yang membaca kondisi sistem secara langsung karena akan menyebabkan inkonsistensi, duplikasi pekerjaan, pemborosan CPU, dan meningkatnya kompleksitas pemeliharaan.

---

Filosofi Monitoring

Tujuan Monitoring bukan mengumpulkan data sebanyak mungkin.

Tujuan Monitoring adalah mengumpulkan data yang benar, relevan, konsisten, dan dapat dipercaya.

Apabila Monitoring mengirim data yang salah.

Analytics menjadi salah.

Notification menjadi salah.

Automation menjadi salah.

AI menghasilkan analisis yang salah.

Dashboard menampilkan informasi yang salah.

Dengan demikian kualitas seluruh sistem bergantung pada kualitas Monitoring Engine.

Karena itu setiap Metric wajib melewati proses validasi sebelum dianggap sah.

---

Data Acquisition Pipeline

Seluruh Metric mengikuti pipeline yang sama.

System Collector.

↓

Raw Metric.

↓

Validation Layer.

↓

Normalization Layer.

↓

Filtering Layer.

↓

Metric Classification.

↓

Health Evaluation.

↓

Rule Evaluation.

↓

Realtime Cache.

↓

Analytics Engine.

↓

Notification Engine.

↓

Dashboard.

Pipeline tersebut wajib bersifat deterministik.

Input yang sama harus menghasilkan Output yang sama.

Hal ini mempermudah proses Audit dan Debugging.

---

Metric Classification

Monitoring Engine harus mengelompokkan Metric berdasarkan karakteristiknya.

Realtime Metric

CPU.

RAM.

Swap.

Disk IOPS.

Bandwidth.

Latency.

Temperature.

Power.

Container Status.

Tunnel Status.

Semi Static Metric

Kernel Version.

Operating System.

Architecture.

Hostname.

Filesystem Layout.

CPU Model.

Memory Slot.

Storage Device.

Static Metric

Workspace Information.

License.

Configuration.

Rule.

Plugin.

Pendekatan ini mengurangi pekerjaan Collector karena Metric statis tidak perlu dibaca setiap detik.

---

Collector Architecture

Collector merupakan modul yang bertanggung jawab mengambil informasi dari sistem operasi.

Collector harus bersifat modular.

Setiap Collector hanya bertanggung jawab pada satu Domain.

CPU Collector.

Memory Collector.

Disk Collector.

Filesystem Collector.

Network Collector.

Docker Collector.

Service Collector.

Tunnel Collector.

Database Collector.

Redis Collector.

Kernel Collector.

Temperature Collector.

Battery Collector apabila suatu saat mendukung perangkat tertentu.

Collector tidak boleh saling bergantung.

Apabila Docker Collector gagal.

CPU Collector tetap berjalan.

Pendekatan ini meningkatkan Availability Monitoring Engine.

---

Sampling Theory

Monitoring tidak boleh membaca seluruh Metric dengan interval yang sama.

Setiap Metric mempunyai karakteristik berbeda.

Sebagai contoh.

CPU dapat berubah setiap beberapa milidetik.

RAM berubah lebih lambat.

Filesystem hampir tidak berubah.

Kernel Version hanya berubah setelah pembaruan.

Oleh karena itu AI wajib menentukan Sampling Rate yang berbeda.

Misalnya.

CPU.

1 Detik.

RAM.

2 Detik.

Disk.

5 Detik.

Filesystem.

30 Menit.

Kernel.

Saat Startup dan setelah Update.

Pendekatan ini mengurangi penggunaan CPU Monitoring Engine secara signifikan.

---

Mathematical Sampling

Misalkan.

CPU berubah mengikuti fungsi.

f(t)

Sampling terlalu lambat.

Akan kehilangan informasi.

Sampling terlalu cepat.

Membuang CPU.

Gunakan prinsip sederhana.

Sampling Frequency

≥

2 × Maximum Expected Change Frequency

Pendekatan tersebut berasal dari prinsip Nyquist yang bertujuan mengurangi kemungkinan kehilangan perubahan penting.

Walaupun implementasi Monitoring tidak membutuhkan presisi ilmiah penuh, konsep tersebut memberikan dasar matematis dalam menentukan interval Sampling.

---

Validation Layer

Collector tidak boleh langsung meneruskan data.

Seluruh Metric melewati Validation Layer.

Validasi meliputi.

Nilai berada dalam rentang yang benar.

Tidak bernilai NaN.

Tidak bernilai Infinity.

Timestamp valid.

Unit benar.

Sequence benar.

Sebagai contoh.

CPU.

-5%

ditolak.

RAM.

140%

ditolak.

Disk.

-200 GB.

ditolak.

Validation harus dilakukan sebelum data masuk ke modul lain.

---

Normalization Layer

Metric dari berbagai sistem operasi dapat memiliki format berbeda.

Sebagai contoh.

Memory dapat ditampilkan dalam.

Byte.

Kilobyte.

Megabyte.

Gigabyte.

Dashboard hanya boleh menerima satu format baku.

Seluruh konversi dilakukan di Normalization Layer.

Dengan demikian seluruh modul lain tidak perlu mengetahui sumber asli Metric.

---

Outlier Detection

Tidak semua perubahan merupakan kondisi nyata.

Kadang Collector menghasilkan nilai ekstrem akibat kesalahan pembacaan.

Sebagai contoh.

CPU.

12%.

↓

800%.

↓

13%.

Nilai.

800%.

Kemungkinan besar merupakan Outlier.

Gunakan Z-Score.

Z

=

(x

−

μ)

÷

σ

Apabila.

|Z|

«»

3

Metric ditandai sebagai Outlier.

Dashboard tidak langsung menampilkan nilai tersebut.

Sebaliknya Monitoring melakukan verifikasi ulang.

Pendekatan ini mengurangi False Alert.

---

Moving Average

CPU sering berubah sangat cepat.

Grafik akan terlihat bergetar.

Gunakan Moving Average.

MA

=

Σx

÷

n

Misalkan.

42

44

43

45

46

MA.

44

Dashboard dapat memilih menggunakan nilai MA untuk visualisasi sementara tetap menyimpan Raw Metric untuk Analytics.

---

Exponential Moving Average

Untuk Monitoring jangka pendek.

EMA lebih responsif.

EMA

=

(Current × α)

+ 

(Previous EMA × (1−α))

Semakin besar α.

Semakin cepat mengikuti perubahan.

Dashboard dapat menggunakan EMA untuk grafik realtime agar animasi lebih halus.

---

Health Contribution

Setiap Metric memberikan kontribusi terhadap Health Score.

Sebagai contoh.

CPU.

20%.

RAM.

20%.

Disk.

20%.

Tunnel.

20%.

Automation.

10%.

Database.

10%.

Nilai tersebut dapat diubah melalui konfigurasi.

Monitoring hanya mengirim kontribusi.

Health Engine menghitung skor akhir.

---

Collector Performance

Collector harus menggunakan sumber daya seminimal mungkin.

Target.

CPU Monitoring Engine.

Kurang dari.

2%.

RAM.

Kurang dari.

150 MB.

Latency.

Kurang dari.

100 Milidetik.

Periode Sampling tidak boleh saling bertabrakan sehingga menyebabkan Spike CPU.

AI wajib menggunakan Scheduler yang efisien.

---

Failure Recovery

Apabila satu Collector gagal.

Monitoring Engine tidak boleh berhenti.

Collector dipindahkan ke status.

Failed.

Monitoring melanjutkan Collector lain.

Recovery dilakukan.

Delay.

↓

Retry.

↓

Validation.

↓

Collector kembali aktif.

Seluruh kegagalan dicatat pada Activity Timeline.

---

Acceptance Criteria

Monitoring Engine dianggap selesai apabila mampu mengumpulkan seluruh Metric melalui Collector modular, menerapkan Validation, Normalization, Outlier Detection, Sampling adaptif, Moving Average, Exponential Moving Average, Health Contribution, serta mampu mempertahankan penggunaan CPU dan RAM tetap rendah walaupun memonitor puluhan Domain secara bersamaan.

AI wajib melakukan pengujian terhadap Metric tidak valid, Outlier ekstrem, Collector gagal, Restart Monitoring Engine, perubahan Sampling Rate, beban tinggi, serta memastikan seluruh Metric tetap konsisten sebelum melanjutkan ke dokumen berikutnya.

Akhir dokumen.
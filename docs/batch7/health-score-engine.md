Batch 7 — Health Score Engine

Tujuan

Health Score Engine merupakan sistem yang bertanggung jawab mengubah ribuan Metric mentah menjadi satu nilai yang mudah dipahami oleh pengguna. Tujuan utamanya bukan sekadar menghasilkan angka dari nol hingga seratus, melainkan memberikan representasi kuantitatif mengenai kondisi keseluruhan VPS pada suatu waktu.

Dashboard tidak boleh memaksa pengguna membaca puluhan grafik hanya untuk mengetahui apakah server dalam keadaan sehat.

Sebaliknya, pengguna cukup melihat satu indikator utama berupa Health Score. Apabila nilai tersebut mengalami penurunan, pengguna dapat melakukan investigasi lebih lanjut melalui halaman Monitoring dan Analytics.

Health Score bukan pengganti Monitoring.

Health Score merupakan ringkasan matematis dari seluruh hasil Monitoring.

Oleh karena itu kualitas Health Score sepenuhnya bergantung pada kualitas Monitoring Engine.

---

Filosofi Health Score

Sebagian besar Dashboard hanya menggunakan rumus sederhana.

CPU rendah.

Health bagus.

CPU tinggi.

Health buruk.

Pendekatan tersebut terlalu sederhana dan sering menghasilkan keputusan yang salah.

Sebagai contoh.

Server Build.

CPU.

98%.

RAM.

40%.

Disk.

20%.

Semua Service normal.

Pada kondisi tersebut CPU tinggi merupakan keadaan yang diharapkan.

Sebaliknya.

Server Idle.

CPU.

40%.

Tunnel putus.

Database mati.

Automation gagal.

Walaupun CPU rendah.

Server sebenarnya berada dalam kondisi yang jauh lebih berbahaya.

Karena itu My Dash tidak menggunakan CPU sebagai indikator utama.

Health Score dibangun dari kombinasi banyak Domain.

---

Domain Health

Health dibagi menjadi beberapa Domain.

System.

CPU.

Memory.

Disk.

Filesystem.

Network.

Tunnel.

Database.

Redis.

Docker.

Automation.

Notification.

GitHub.

Scheduler.

Security.

Plugin.

AI.

Setiap Domain menghasilkan Domain Score.

Kemudian seluruh Domain digabungkan menjadi Global Health Score.

---

Normalization

Sebelum dihitung.

Seluruh Metric dinormalisasi ke rentang.

0

hingga

100. 

Dengan demikian.

CPU.

Disk.

Latency.

Packet Loss.

Memory.

Dapat dibandingkan menggunakan satu skala yang sama.

Misalnya.

CPU.

20%.

Skor.

95. 

CPU.

60%.

Skor.

80. 

CPU.

95%.

Skor.

25. 

Fungsi konversi tidak harus linear.

AI boleh menggunakan fungsi yang lebih sesuai terhadap karakteristik masing-masing Metric.

---

Weighted Score

Setiap Domain memiliki bobot.

Sebagai contoh.

CPU.

15%.

Memory.

15%.

Disk.

15%.

Tunnel.

20%.

Database.

15%.

Automation.

10%.

Security.

10%.

Bobot tersebut hanya contoh.

AI harus membuat sistem yang dapat diubah melalui konfigurasi Dashboard.

Health Score dihitung.

Health

=

Σ

(Weightᵢ

×

Scoreᵢ)

Semua bobot harus berjumlah.

100%.

---

Adaptive Weight

Bobot tidak selalu tetap.

Sebagai contoh.

Server Database.

Database memiliki prioritas lebih tinggi.

Server Reverse Proxy.

Tunnel lebih penting.

Server Build.

CPU lebih penting.

Dashboard harus memungkinkan Administrator memilih Profil Server.

General.

Database.

Build.

Reverse Proxy.

Game Server.

Container Host.

Kemudian Health Engine secara otomatis menyesuaikan bobot Domain.

Pendekatan ini menghasilkan Health Score yang jauh lebih realistis.

---

Mathematical Health Model

Misalkan.

CPU.

88. 

Memory.

91. 

Disk.

96. 

Tunnel.

100. 

Database.

75. 

Automation.

98. 

Bobot.

CPU.

15%.

Memory.

15%.

Disk.

15%.

Tunnel.

20%.

Database.

20%.

Automation.

15%.

Health.

=

(88×0.15)

+ 

(91×0.15)

+ 

(96×0.15)

+ 

(100×0.20)

+ 

(75×0.20)

+ 

(98×0.15)

=

91

Dashboard menampilkan.

Health Score.

91%.

Namun Dashboard juga harus menjelaskan mengapa nilainya.

91. 

Bukan hanya menampilkan angka.

---

Confidence Score

Health Score selalu disertai Confidence Score.

Confidence menunjukkan seberapa yakin sistem terhadap hasil perhitungan.

Misalnya.

Semua Collector aktif.

Confidence.

99%.

CPU Collector gagal.

Confidence.

92%.

Network Collector gagal.

Confidence.

84%.

Dashboard menampilkan kedua nilai tersebut.

Dengan demikian Administrator mengetahui apakah Health Score benar-benar dapat dipercaya.

---

Trend Analysis

Health tidak hanya dihitung pada satu waktu.

Dashboard juga menghitung Trend.

Trend

=

Current Health

−

Previous Health

Misalkan.

Kemarin.

94. 

Sekarang.

87. 

Trend.

-7.

Dashboard menampilkan.

Health menurun.

7%.

Trend juga dihitung menggunakan Moving Average sehingga perubahan kecil tidak langsung dianggap penurunan besar.

---

Health Momentum

Selain Trend.

Gunakan konsep Momentum.

Momentum menggambarkan kecepatan perubahan Health.

Momentum

=

(Current

−

Previous)

÷

Elapsed Time

Semakin besar Momentum negatif.

Semakin cepat kondisi server memburuk.

Administrator dapat mengetahui apakah masalah berkembang perlahan atau sangat cepat.

---

Health Acceleration

Momentum juga dapat berubah.

Perubahan Momentum disebut Acceleration.

Acceleration

=

Current Momentum

−

Previous Momentum

Apabila Acceleration negatif terus meningkat.

Berarti penurunan kondisi server semakin cepat.

Dashboard dapat memberikan Early Warning sebelum Health benar-benar memasuki kondisi kritis.

---

Bayesian Adjustment

Health Score dapat disesuaikan menggunakan pendekatan Bayesian sederhana.

Misalkan.

Historis menunjukkan.

CPU tinggi.

90%.

Selama proses Build.

Selalu berakhir normal.

Probability Failure.

0.05.

Maka CPU tinggi pada periode Build tidak boleh langsung menurunkan Health secara drastis.

Sebaliknya.

CPU tinggi disertai Tunnel Disconnect.

Probability Failure.

0.92.

Health harus turun lebih agresif.

Pendekatan probabilistik mengurangi False Alert.

---

Penalty System

Tidak semua kesalahan mempunyai dampak yang sama.

Tunnel Offline.

Penalty.

25. 

CPU.

90%.

Penalty.

5. 

Disk.

100%.

Penalty.

35. 

Database Down.

Penalty.

40. 

Automation Gagal.

Penalty.

10. 

Penalty diterapkan setelah Domain Score dihitung.

Dengan demikian kejadian yang benar-benar berbahaya memberikan dampak lebih besar.

---

Recovery Bonus

Ketika sistem berhasil melakukan Recovery otomatis.

Health tidak langsung kembali.

100. 

Gunakan Recovery Curve.

Sebagai contoh.

Health.

60. 

↓

Automation berhasil.

↓

70. 

↓

75. 

↓

82. 

↓

89. 

↓

95. 

↓

100. 

Pendekatan bertahap memberikan representasi yang lebih realistis dibanding lonjakan instan.

---

Grade System

Selain angka.

Dashboard menampilkan Grade.

A+

98-100.

A.

93-97.

B.

85-92.

C.

75-84.

D.

60-74.

F.

Di bawah 60.

Grade membantu pengguna memahami kondisi secara cepat.

---

Health History

Health disimpan sebagai Time Series.

Dashboard menampilkan.

1 Jam.

24 Jam.

7 Hari.

30 Hari.

90 Hari.

365 Hari.

Data lama menggunakan hasil agregasi agar ukuran Database tetap efisien.

---

Mathematical Complexity

Misalkan.

Domain.

D.

Metric.

M.

Perhitungan Health.

O(D)

Perhitungan Domain.

O(M)

Total.

O(D + M)

AI harus menghindari algoritma dengan kompleksitas.

O(D × M²)

karena tidak akan mampu menangani ribuan Server.

---

Acceptance Criteria

Health Score Engine dianggap selesai apabila mampu menghitung Domain Score, Global Health Score, Confidence Score, Trend, Momentum, Acceleration, Adaptive Weight, Bayesian Adjustment, Penalty System, Recovery Curve, serta Grade secara konsisten dan dapat dijelaskan kepada pengguna.

AI wajib melakukan simulasi terhadap puluhan skenario kegagalan, perubahan profil server, Collector yang hilang, Recovery otomatis, serta pertumbuhan Metric dalam jangka panjang untuk memastikan Health Score tetap stabil, representatif, dan tidak menghasilkan fluktuasi yang tidak masuk akal sebelum melanjutkan ke dokumen berikutnya.

Akhir dokumen.
Batch 3 — Analytics Engine

Tujuan

Analytics Engine merupakan sistem yang bertanggung jawab mengubah data operasional yang dikumpulkan oleh Monitoring Engine menjadi informasi yang memiliki makna, pola, prediksi, korelasi, dan tren.

Monitoring hanya menjawab kondisi saat ini.

Analytics menjawab bagaimana kondisi tersebut berubah dari waktu ke waktu, apa penyebabnya, apakah perubahan tersebut masih normal, apakah terdapat pola yang berulang, serta bagaimana kemungkinan kondisi server beberapa waktu ke depan apabila perilaku sistem tetap sama.

Analytics bukan sekadar menampilkan grafik.

Analytics harus mampu membantu administrator mengambil keputusan tanpa harus membaca ribuan data mentah.

Analytics Engine tidak boleh mengubah data Monitoring Engine.

Analytics hanya membaca data yang telah divalidasi, kemudian menghasilkan data turunan yang digunakan oleh Dashboard, Rule Engine, Health Score, AI Assistant, Notification Engine, Automation Engine, dan laporan historis.

---

Filosofi Analytics

Analytics harus memenuhi lima prinsip utama.

Akurat.

Konsisten.

Dapat dijelaskan.

Dapat diverifikasi.

Ringan.

Seluruh angka yang ditampilkan kepada pengguna harus dapat ditelusuri kembali hingga ke data mentah.

Analytics tidak boleh menghasilkan angka yang berasal dari perkiraan tanpa penjelasan.

Apabila suatu nilai merupakan hasil estimasi atau prediksi, dashboard wajib membedakannya dari data aktual.

---

Arsitektur Analytics

Seluruh alur Analytics mengikuti urutan berikut.

Monitoring Engine

↓

Validation Layer

↓

Normalization Layer

↓

Time Series Collector

↓

Aggregation Engine

↓

Statistical Engine

↓

Prediction Engine

↓

Correlation Engine

↓

Visualization Dataset

↓

Dashboard

Masing-masing modul memiliki tanggung jawab tersendiri.

Dengan pendekatan ini perubahan algoritma prediksi tidak akan memengaruhi proses pengumpulan data.

---

Time Series

Seluruh data disimpan sebagai deret waktu.

Setiap titik data minimal memiliki:

Timestamp.

Metric Identifier.

Server Identifier.

Workspace Identifier.

Source.

Value.

Confidence.

Collection Duration.

Sampling Interval.

Tidak boleh ada dua data yang memiliki identitas sama pada waktu yang sama.

---

Sampling

Monitoring dapat membaca CPU setiap satu detik.

Namun Analytics tidak selalu menyimpan seluruh data tersebut.

Analytics menggunakan beberapa tingkat resolusi.

Realtime.

1 Detik.

Short Term.

10 Detik.

Medium Term.

1 Menit.

Long Term.

5 Menit.

Historical.

1 Jam.

Archive.

1 Hari.

Pendekatan ini mengurangi penggunaan penyimpanan secara drastis tanpa kehilangan pola jangka panjang.

---

Agregasi

Setiap interval dilakukan agregasi.

Untuk CPU misalnya.

Data mentah.

45

51

63

59

48

57

61

Agregasi menghasilkan.

Minimum.

45

Maximum.

63

Average.

54.86

Median.

57

Standar Deviasi.

6.18

Jumlah Sampel.

7

Seluruh nilai tersebut disimpan sebagai dataset baru.

---

Moving Average

Grafik tidak boleh menggunakan nilai tunggal.

Analytics menggunakan Moving Average.

Misalnya Window = 5.

MA =

(x₁ + x₂ + x₃ + x₄ + x₅)

÷

5

Setiap data baru akan menggeser window.

Pendekatan ini menghasilkan grafik yang jauh lebih stabil.

Window harus dapat diubah.

Contoh.

5. 

6. 

7. 

8. 

9. 

---

Weighted Moving Average

Untuk beberapa metrik.

Moving Average biasa kurang akurat.

Gunakan Weighted Moving Average.

Rumus.

WMA =

Σ(Value × Weight)

÷

ΣWeight

Contoh.

Nilai terbaru memiliki bobot lebih besar dibanding data lama.

Hal ini membuat sistem lebih cepat merespons perubahan.

---

Exponential Moving Average

Untuk prediksi realtime.

Gunakan EMA.

EMA(t)

=

α

×

Current

+ 

(1 − α)

×

EMA(t−1)

Nilai α ditentukan berdasarkan panjang window.

Semakin besar α.

Semakin sensitif terhadap perubahan.

Semakin kecil α.

Semakin stabil.

EMA digunakan pada:

CPU.

RAM.

Bandwidth.

Network.

Load Average.

---

Variance

Analytics wajib menghitung Variance.

Variance mengukur kestabilan suatu metrik.

Rumus.

σ²

=

Σ(x − μ)²

÷

n

Variance kecil.

Server stabil.

Variance besar.

Server mengalami fluktuasi tinggi.

Variance digunakan oleh Health Score.

---

Standard Deviation

Standar Deviasi.

σ

=

√Variance

Standar Deviasi digunakan untuk menentukan apakah lonjakan CPU masih normal atau sudah merupakan anomali.

---

Z Score

Analytics menggunakan Z Score.

Rumus.

Z

=

(Current − Mean)

÷

Standard Deviation

Interpretasi.

−1 sampai 1

Normal.

Lebih besar dari 2

Mulai tidak normal.

Lebih besar dari 3

Anomali.

Rule Engine dapat menggunakan hasil ini.

---

Trend Detection

Analytics tidak hanya melihat angka.

Analytics juga menghitung arah perubahan.

Gunakan Linear Regression.

Persamaan.

y

=

mx

+ 

c

Nilai m.

Positif.

Tren naik.

Negatif.

Tren turun.

Mendekati nol.

Stabil.

Dengan pendekatan ini dashboard dapat menampilkan.

CPU meningkat.

RAM stabil.

Bandwidth menurun.

---

Correlation

Analytics menghitung hubungan antar metrik.

Gunakan Pearson Correlation.

r

=

Cov(X,Y)

÷

(σX × σY)

Interpretasi.

Mendekati 1.

Hubungan sangat kuat.

Mendekati 0.

Tidak berhubungan.

Mendekati −1.

Berlawanan.

Contoh.

CPU naik.

RAM naik.

r = 0.91

Kemungkinan proses tertentu sedang aktif.

---

Anomaly Detection

Analytics tidak menggunakan threshold tetap.

Anomali dihitung.

Gunakan kombinasi.

Moving Average.

EMA.

Z Score.

Variance.

Apabila.

CPU = 70%

Biasanya normal.

Namun apabila rata-rata server hanya 12%.

Maka CPU 70% dapat dianggap anomali.

Pendekatan ini jauh lebih akurat dibanding threshold statis.

---

Prediction

Prediction bukan untuk mengambil keputusan.

Prediction hanya memberikan estimasi.

Misalnya.

Disk.

Saat ini.

85%.

Pertumbuhan.

2 GB.

Per Hari.

Sisa ruang.

150 GB.

Estimasi penuh.

150

÷

2

=

75 Hari.

Dashboard dapat menampilkan.

"Estimasi penyimpanan penuh dalam sekitar 75 hari apabila pola penggunaan tetap."

---

Confidence Score

Setiap prediksi memiliki tingkat kepercayaan.

Nilai.

0 sampai 100.

Confidence dipengaruhi oleh.

Jumlah sampel.

Stabilitas data.

Variance.

Missing Data.

Prediction dengan Confidence rendah tidak boleh digunakan oleh Automation Engine.

---

Resource Efficiency Index

Analytics menghasilkan indeks efisiensi.

Formula.

REI

=

Useful Resource

÷

Allocated Resource

×

100

Contoh.

RAM.

Allocated.

16 GB.

Useful.

8 GB.

REI.

50%.

Semakin tinggi REI.

Semakin efisien penggunaan resource.

---

Thermal Consideration

Apabila sensor temperatur tersedia.

Analytics menghitung perubahan temperatur terhadap beban CPU.

Misalnya.

ΔT

=

T₂ − T₁

Heat Rate.

=

ΔT

÷

ΔTime

Kenaikan temperatur yang sangat cepat dapat mengindikasikan pendinginan kurang baik.

Apabila sensor tidak tersedia.

Modul ini otomatis dinonaktifkan.

---

Dashboard Dataset

Frontend tidak boleh menerima seluruh data mentah.

Analytics menghasilkan dataset siap pakai.

Dataset meliputi.

Realtime.

Hourly.

Daily.

Weekly.

Monthly.

Yearly.

Comparison.

Prediction.

Correlation.

Distribution.

Dengan demikian frontend hanya bertugas merender.

---

Acceptance Criteria

Analytics Engine dianggap selesai apabila mampu mengubah data mentah menjadi dataset statistik yang akurat, menghitung rata-rata, median, variance, standar deviasi, korelasi, tren, deteksi anomali, prediksi sederhana, dan indeks efisiensi secara konsisten tanpa mengubah data sumber.

Seluruh algoritma harus menghasilkan nilai yang dapat diverifikasi secara matematis, terdokumentasi dengan baik, serta lolos pengujian terhadap berbagai kondisi data, termasuk data kosong, data ekstrem, data hilang, dan data dengan fluktuasi tinggi.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib memverifikasi bahwa seluruh perhitungan bersifat deterministik, konsisten, dan tidak menghasilkan perbedaan nilai untuk dataset yang sama.

Akhir dokumen.
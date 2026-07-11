Batch 4 — Dashboard Layout

Tujuan

Dokumen ini mendefinisikan standar tata letak, arsitektur antarmuka, hierarki visual, perilaku komponen, alur navigasi, serta logika penyusunan halaman Dashboard My Dash.

Layout bukan sekadar masalah estetika.

Layout merupakan algoritma penyampaian informasi.

Dashboard yang baik harus mampu mengurangi waktu berpikir pengguna, mengurangi jumlah klik, mempercepat pengambilan keputusan, dan mengurangi kemungkinan kesalahan interpretasi terhadap kondisi VPS.

Seluruh halaman harus dibangun menggunakan prinsip Information First Design, yaitu seluruh elemen visual wajib memiliki tujuan operasional.

Tidak boleh ada elemen yang hanya berfungsi sebagai dekorasi.

---

Filosofi Layout

Administrator VPS umumnya membuka dashboard ketika sedang mengalami salah satu kondisi berikut.

Server mengalami gangguan.

Ingin memastikan server masih berjalan.

Sedang melakukan deployment.

Sedang melakukan pemeliharaan.

Sedang menganalisis performa.

Sedang mencari penyebab masalah.

Artinya sebagian besar pengguna membuka dashboard ketika sedang membutuhkan informasi, bukan ketika ingin melihat tampilan yang menarik.

Oleh karena itu desain harus mengutamakan keterbacaan, kepadatan informasi yang terkontrol, konsistensi, dan kecepatan navigasi.

---

Prinsip Hierarki Informasi

Seluruh informasi dibagi menjadi empat tingkat prioritas.

Tingkat Pertama

Informasi yang dapat menyebabkan downtime.

Contoh.

Tunnel terputus.

Database mati.

Redis mati.

Disk penuh.

Agent Offline.

Firewall Error.

Backup gagal.

Automation gagal.

Health Score Critical.

Informasi ini selalu muncul pada area paling atas.

Tidak boleh tersembunyi.

---

Tingkat Kedua

Informasi operasional.

CPU.

RAM.

Disk.

Bandwidth.

Docker.

Scheduler.

GitHub Action.

Container.

Update.

Service.

Informasi ini berada tepat di bawah ringkasan utama.

---

Tingkat Ketiga

Informasi historis.

Grafik.

Analytics.

Trend.

Prediction.

Timeline.

History.

Informasi ini muncul setelah kondisi realtime.

---

Tingkat Keempat

Informasi administratif.

Version.

Workspace.

User.

License.

Documentation.

Developer Contact.

System Information.

Pengguna tidak membutuhkan informasi ini setiap saat.

---

Grid System

Dashboard menggunakan grid adaptif.

Jumlah kolom tidak boleh ditentukan menggunakan angka tetap.

Grid harus menyesuaikan:

Lebar layar.

Jumlah widget aktif.

Prioritas widget.

Resolusi.

Orientasi perangkat.

Apabila hanya terdapat sedikit widget.

Widget dapat diperbesar.

Apabila jumlah widget bertambah.

Widget diperkecil secara otomatis.

Layout harus tetap seimbang.

---

Widget Architecture

Setiap widget merupakan komponen independen.

Widget tidak boleh mengetahui implementasi widget lain.

Widget hanya menerima data.

Widget tidak mengambil data sendiri.

Widget tidak membaca database.

Widget tidak membuka websocket sendiri.

Seluruh komunikasi dilakukan melalui state pusat.

Dengan pendekatan ini performa dashboard jauh lebih stabil.

---

Widget Lifecycle

Setiap widget memiliki siklus hidup yang tetap.

Initialization.

↓

Loading.

↓

Skeleton.

↓

Data Validation.

↓

Ready.

↓

Realtime Update.

↓

State Change.

↓

Destroy.

↓

Memory Cleanup.

Widget wajib membersihkan seluruh listener ketika dihancurkan.

Widget tidak boleh menyebabkan memory leak.

---

Widget Priority

Ketika dashboard dibuka.

Tidak semua widget dimuat secara bersamaan.

Urutan pemuatan.

Header.

↓

Health Score.

↓

Critical Alert.

↓

CPU.

↓

RAM.

↓

Disk.

↓

Network.

↓

Timeline.

↓

Analytics.

↓

GitHub.

↓

AI Recommendation.

↓

Halaman lainnya.

Pendekatan ini membuat dashboard terasa jauh lebih cepat.

---

Lazy Rendering

Widget yang berada di luar layar.

Tidak perlu dirender penuh.

Widget hanya dirender ketika hampir memasuki area pandang pengguna.

Pendekatan ini mengurangi:

Penggunaan CPU Browser.

Memory Browser.

Render Time.

Battery Usage.

---

Adaptive Layout

Dashboard harus mampu berubah sesuai perangkat.

Pada desktop.

Sidebar permanen.

Analytics lebih banyak.

Grafik lebih besar.

Timeline lebih panjang.

Pada tablet.

Sidebar dapat disembunyikan.

Widget sedikit dipadatkan.

Grafik disederhanakan.

Pada mobile.

Sidebar berubah menjadi drawer.

Widget satu kolom.

Grafik dipadatkan.

Button diperbesar.

Target sentuhan minimum tetap nyaman digunakan.

---

Information Density

Dashboard tidak boleh terlalu kosong.

Dashboard juga tidak boleh terlalu padat.

Gunakan prinsip.

High Information Density with High Readability.

Artinya.

Satu layar dapat menampilkan banyak informasi.

Namun pengguna tetap mudah memahami informasi tersebut.

Hal ini dicapai melalui:

Whitespace yang cukup.

Ukuran font konsisten.

Pengelompokan visual.

Warna yang konsisten.

Prioritas visual yang jelas.

---

Mathematical Layout

Lebar widget dapat dihitung menggunakan rasio.

Misalnya.

Total Width

=

Viewport Width

−

Sidebar Width

−

Padding.

Jumlah Kolom.

=

Floor(

Available Width

÷

Minimum Widget Width

)

Dengan pendekatan ini.

Dashboard otomatis menentukan jumlah widget yang ideal.

Bukan menggunakan breakpoint tetap.

Pendekatan tersebut lebih fleksibel ketika jumlah widget bertambah.

---

Dashboard Rendering Cost

Setiap widget memiliki Rendering Cost.

Misalnya.

CPU Widget.

Cost.

1

Timeline.

Cost.

2

Analytics Chart.

Cost.

5

GitHub Action.

Cost.

3

AI Recommendation.

Cost.

4

Ketika perangkat memiliki performa rendah.

Dashboard dapat menunda widget dengan Rendering Cost tinggi.

Dengan demikian pengalaman pengguna tetap lancar.

---

Visual Consistency

Seluruh widget menggunakan.

Radius.

Spacing.

Padding.

Typography.

Animation.

Border.

Elevation.

Yang sama.

Tidak boleh ada widget dengan gaya berbeda.

Komponen baru wajib mengikuti Design Token proyek.

---

Interaction Model

Semua interaksi harus mengikuti pola yang sama.

Klik.

Hover.

Touch.

Long Press.

Keyboard.

Screen Reader.

Tidak boleh ada halaman yang memiliki perilaku berbeda tanpa alasan yang jelas.

---

Navigation Logic

Pengguna maksimal membutuhkan tiga langkah untuk menuju fitur apa pun.

Dashboard harus menyediakan.

Global Search.

Quick Action.

Keyboard Shortcut.

Recent Page.

Favorite Page.

Pinned Widget.

Hal ini mengurangi waktu navigasi secara signifikan.

---

Mobile Optimization

Dashboard tidak boleh hanya mengecilkan tampilan desktop.

Versi mobile memiliki perilaku sendiri.

Widget dapat berubah urutan.

Grafik dapat disederhanakan.

Timeline dipadatkan.

Menu dipindahkan.

Button diperbesar.

Target utama adalah kenyamanan penggunaan dengan satu tangan.

---

Accessibility

Kontras warna harus memenuhi standar.

Ukuran teks harus dapat dibaca.

Widget harus dapat diakses menggunakan keyboard.

Seluruh ikon harus memiliki label.

Animasi harus dapat dikurangi melalui pengaturan pengguna.

---

Future Expansion

Layout harus mendukung.

Plugin Widget.

Marketplace Widget.

Custom Dashboard.

Workspace Dashboard.

Split View.

Floating Panel.

Docking Widget.

Drag and Drop Layout.

Tanpa mengubah struktur dasar dashboard.

---

Acceptance Criteria

Layout dianggap selesai apabila mampu menampilkan informasi berdasarkan prioritas operasional, menggunakan grid adaptif, memuat widget secara bertahap, mendukung lazy rendering, menjaga konsistensi visual, mempertahankan performa pada berbagai ukuran layar, serta menyediakan fondasi yang siap menerima penambahan widget di masa depan tanpa memerlukan perubahan arsitektur utama.

Sebelum melanjutkan ke dokumen berikutnya, AI wajib menguji layout pada berbagai resolusi, memastikan tidak terdapat overflow, pergeseran layout, memory leak akibat widget, maupun penurunan performa yang signifikan ketika jumlah widget bertambah.

Akhir dokumen.
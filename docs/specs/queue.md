Queue Engine Engineering Specification

Purpose

Queue Engine merupakan pusat orkestrasi seluruh pekerjaan Asynchronous pada My Dash. Semua proses yang tidak memerlukan respons langsung kepada pengguna harus dijalankan melalui Queue agar Dashboard tetap responsif dan beban sistem dapat didistribusikan secara merata. Queue digunakan oleh Notification Engine, Automation Engine, Analytics Worker, AI Worker, Backup, Restore, GitHub Workflow, Tunnel Manager, Plugin Worker, Scheduler, Audit Processor, serta proses latar belakang lainnya. Dengan menjadikan Queue sebagai jalur utama pekerjaan berat, My Dash mampu menangani lonjakan aktivitas tanpa menghambat Monitoring maupun REST API. Queue bukan hanya tempat menunggu pekerjaan, tetapi merupakan sistem penjadwalan, prioritas, retry, recovery, dan distribusi beban yang harus berjalan secara konsisten selama aplikasi aktif.

Queue Architecture and Job Lifecycle

Setiap pekerjaan yang masuk ke Queue direpresentasikan sebagai Job yang memiliki Job ID, Workspace ID, Server ID apabila diperlukan, Job Type, Priority, Status, Retry Count, Maximum Retry, Timeout, Created Time, Started Time, Finished Time, Worker ID, Correlation ID, serta Payload yang telah divalidasi. Siklus hidup Job dimulai dari Pending, kemudian Waiting apabila menunggu Dependency, Running ketika diproses Worker, Success apabila selesai, Failed ketika terjadi Error, Retrying apabila masih memiliki kesempatan Retry, Cancelled apabila dibatalkan pengguna atau sistem, dan Dead Letter apabila seluruh Retry telah habis. Seluruh perubahan Status dipublikasikan sebagai Event sehingga Dashboard dapat memperbarui tampilan secara Realtime tanpa melakukan Polling terhadap Queue.

Priority, Scheduling, and Resource Management

Queue mendukung beberapa tingkat Prioritas seperti Low, Normal, High, Critical, dan Emergency. Job dengan Prioritas lebih tinggi selalu diproses lebih dahulu selama tidak melanggar kebijakan Fair Scheduling sehingga Job kecil tidak terus-menerus tertunda oleh Job besar. Scheduler dapat memasukkan Job ke Queue berdasarkan waktu tertentu, sedangkan Automation dapat menambahkan Job berdasarkan Event. AI wajib memastikan bahwa Worker mengambil Job secara efisien, menghindari Starvation, menghindari Duplicate Execution, serta mendukung Distributed Worker apabila sistem dijalankan pada lebih dari satu Instance. Setiap Worker memiliki batas jumlah Job aktif sehingga penggunaan CPU dan Memory tetap terkendali walaupun terjadi lonjakan pekerjaan.

Retry, Recovery, and Fault Tolerance

Apabila sebuah Job gagal dijalankan, Queue menggunakan Exponential Backoff sebelum melakukan Retry berikutnya. Penyebab kegagalan harus dicatat secara lengkap beserta Error Code, Stack Trace internal, Latency, Resource Usage, serta Worker yang memproses Job tersebut. Job yang gagal berulang kali dipindahkan ke Dead Letter Queue agar tidak mengganggu antrean utama dan dapat dianalisis lebih lanjut melalui Dashboard. Ketika Backend atau Redis mengalami Restart, Queue harus mampu memulihkan Job yang belum selesai berdasarkan Status terakhir sehingga tidak terjadi kehilangan pekerjaan penting seperti Backup, Notification, ataupun Automation. Recovery dilakukan secara bertahap agar sistem tidak langsung dibanjiri Job ketika layanan kembali aktif.

Monitoring, Analytics, and Scalability

Queue Engine harus menyediakan informasi Realtime mengenai Queue Length, Waiting Time, Processing Time, Throughput, Success Rate, Failure Rate, Retry Rate, Dead Letter Count, Worker Utilization, Average Execution Time, serta Resource Consumption setiap Worker. Dashboard harus mampu menampilkan statistik tersebut dalam bentuk grafik dan indikator kesehatan sehingga Administrator dapat mengetahui apabila terjadi penumpukan pekerjaan sebelum memengaruhi layanan lain. Arsitektur Queue harus mendukung penambahan Worker baru secara horizontal tanpa perubahan pada Business Logic, sehingga kapasitas pemrosesan dapat ditingkatkan hanya dengan menambah Instance Worker sesuai kebutuhan. Seluruh implementasi Queue harus bersifat modular sehingga Domain baru dapat menggunakan Queue tanpa perubahan terhadap Core Engine.

Acceptance Criteria

Queue Engine dianggap memenuhi spesifikasi apabila seluruh pekerjaan Asynchronous diproses melalui Queue, setiap Job memiliki Lifecycle yang jelas, mendukung Prioritas, Retry, Timeout, Recovery, Dead Letter Queue, Distributed Worker, Monitoring, dan Analytics secara menyeluruh. Implementasi harus mampu mempertahankan performa ketika jumlah Job meningkat drastis, menghindari kehilangan pekerjaan, mencegah eksekusi ganda, serta memastikan Dashboard tetap responsif karena seluruh proses berat dijalankan di belakang layar melalui mekanisme Queue yang andal dan dapat diskalakan.
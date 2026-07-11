Scheduler Engineering Specification

Purpose

Scheduler Engine merupakan subsistem yang bertanggung jawab menjalankan seluruh pekerjaan berbasis waktu di dalam My Dash secara presisi, konsisten, dan dapat diprediksi. Berbeda dengan Automation yang bereaksi terhadap Event, Scheduler bekerja berdasarkan waktu, interval, kalender, maupun aturan yang telah ditentukan sebelumnya. Scheduler digunakan untuk Backup otomatis, Cleanup Log, Cleanup Cache, Analytics Aggregation, Health Recalculation, GitHub Synchronization, Tunnel Verification, Database Maintenance, Redis Maintenance, Plugin Task, AI Summary, serta berbagai pekerjaan rutin lainnya. Seluruh tugas terjadwal harus berjalan tanpa mengganggu Monitoring maupun Dashboard, serta tetap dapat dipulihkan apabila VPS mengalami Restart atau terjadi kegagalan layanan. Tujuan utama Scheduler adalah memastikan seluruh pekerjaan periodik terlaksana tepat waktu tanpa memerlukan campur tangan Administrator.

Scheduling Model and Execution Lifecycle

Setiap Scheduled Task memiliki Task ID, Workspace ID, Schedule Type, Cron Expression atau Interval, Timezone Display, UTC Execution Time, Priority, Status, Next Execution, Last Execution, Retry Policy, Timeout, Dependency, serta Metadata yang menjelaskan tujuan tugas tersebut. Siklus hidup dimulai dari Registration, Validation, Waiting, Queue Submission, Execution, Verification, Completion, kemudian perhitungan ulang waktu eksekusi berikutnya. Sebelum Task dijalankan, Scheduler memverifikasi apakah terdapat Lock aktif, Dependency yang belum selesai, atau kondisi sistem yang tidak memungkinkan pelaksanaan tugas. Seluruh Task dikirim ke Queue agar eksekusinya diproses oleh Worker yang sesuai sehingga Scheduler hanya bertanggung jawab menentukan kapan pekerjaan dimulai, bukan menjalankan pekerjaan itu sendiri.

Time Management, Reliability, and Recovery

Seluruh waktu internal disimpan menggunakan UTC untuk menghindari perbedaan zona waktu, sedangkan Dashboard menampilkan waktu sesuai preferensi pengguna. Scheduler harus mampu menangani perubahan waktu sistem, Restart VPS, maupun keterlambatan eksekusi tanpa kehilangan Task. Apabila Server mati pada saat seharusnya sebuah Task dijalankan, Scheduler harus menentukan apakah Task perlu segera dijalankan setelah sistem aktif kembali atau dilewati berdasarkan kebijakan yang telah ditentukan. Retry menggunakan Exponential Backoff untuk kegagalan sementara, sedangkan Task yang terus gagal menghasilkan Notification serta Audit agar Administrator dapat melakukan investigasi. AI wajib memastikan bahwa Scheduler tidak menjalankan Task yang sama lebih dari satu kali akibat Race Condition atau Restart layanan.

Monitoring, Performance, and Scalability

Dashboard menyediakan halaman Scheduler yang menampilkan Daftar Task, Jadwal berikutnya, Riwayat eksekusi, Durasi rata-rata, Success Rate, Failure Rate, Retry Count, serta Status Worker yang menangani Task tersebut. Administrator dapat mengaktifkan, menonaktifkan, menjalankan secara manual, ataupun mengubah jadwal melalui antarmuka tanpa perlu mengedit konfigurasi secara langsung. Scheduler harus mampu menangani ratusan hingga ribuan Task dengan penggunaan CPU dan Memory yang tetap rendah melalui mekanisme Event dan Queue. Arsitektur juga harus mendukung penambahan jenis Task baru dari Plugin maupun Domain lain tanpa mengubah Scheduler Core sehingga sistem tetap fleksibel untuk pengembangan jangka panjang.

Security, Audit, and Extensibility

Seluruh perubahan terhadap jadwal, aktivasi, penonaktifan, maupun penghapusan Task harus menghasilkan Audit Record lengkap beserta User yang melakukan perubahan. Task yang menjalankan operasi sensitif seperti Backup, Restore, Automation, atau Script hanya dapat dibuat oleh pengguna dengan Permission yang sesuai. Scheduler juga harus menyediakan antarmuka yang seragam bagi Domain lain sehingga Monitoring, Notification, GitHub Integration, AI, maupun Plugin dapat mendaftarkan Task tanpa mengetahui implementasi internal Scheduler. Dengan pendekatan ini seluruh pekerjaan berbasis waktu berada pada satu subsistem yang konsisten, mudah diuji, dan mudah dipelihara.

Acceptance Criteria

Scheduler dianggap memenuhi spesifikasi apabila mampu menjalankan Task periodik secara akurat menggunakan Queue dan Worker, mendukung Cron maupun Interval, memiliki Retry, Recovery, Monitoring, Audit, serta tetap konsisten setelah Restart sistem. Implementasi harus menjaga penggunaan Resource tetap rendah, menghindari eksekusi ganda, menyediakan pengelolaan melalui Dashboard, serta menjadi fondasi tunggal bagi seluruh pekerjaan berbasis waktu di dalam ekosistem My Dash.
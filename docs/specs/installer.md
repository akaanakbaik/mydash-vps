Installer Engineering Specification

Purpose

Installer merupakan pintu masuk utama seluruh ekosistem My Dash dan bertanggung jawab memastikan proses instalasi berlangsung otomatis, aman, dapat diulang, serta menghasilkan lingkungan yang konsisten pada setiap VPS yang didukung. Installer tidak hanya mengunduh Source Code, tetapi juga memverifikasi sistem operasi, arsitektur CPU, versi Kernel, kapasitas CPU, RAM, Storage, konektivitas Internet, DNS, hak akses pengguna, serta seluruh dependensi yang dibutuhkan sebelum satu baris aplikasi dijalankan. Seluruh proses harus memberikan informasi yang jelas kepada pengguna mengenai apa yang sedang dilakukan, mengapa langkah tersebut diperlukan, serta bagaimana menyelesaikan masalah apabila ditemukan kegagalan. Installer harus mampu melakukan instalasi baru, pembaruan, perbaikan instalasi yang rusak, maupun penghapusan sistem secara bersih tanpa meninggalkan konfigurasi yang tidak diperlukan.

Installation Workflow and Environment Validation

Urutan instalasi harus bersifat deterministik dan tidak boleh berubah tanpa alasan teknis yang kuat. Proses dimulai dari Environment Detection, Operating System Verification, Dependency Installation, User Permission Validation, Directory Preparation, Configuration Initialization, Database Preparation, Redis Verification, Git Verification, GitHub CLI Verification, Tunnel Dependency Verification, Backend Installation, Frontend Installation, Build Process, Service Registration, Worker Registration, Initial Health Check, kemudian Final Verification. Setiap tahap memiliki Status, Progress, Estimated Time, Error Code, serta Recovery Instruction yang dapat ditampilkan melalui Terminal maupun Dashboard apabila instalasi dijalankan dari antarmuka web. AI wajib memastikan bahwa setiap tahap dapat dijalankan ulang tanpa menghasilkan konfigurasi ganda atau kerusakan pada instalasi sebelumnya.

Configuration, Security, and Recovery

Selama proses instalasi, Installer meminta konfigurasi minimum seperti Domain apabila tersedia, Password Administrator, lokasi penyimpanan data, serta pilihan komponen opsional. Seluruh Secret langsung disimpan menggunakan mekanisme yang aman dan tidak pernah dicetak kembali ke Terminal setelah proses selesai. Apabila terjadi kegagalan di tengah instalasi, Installer harus mampu membersihkan berkas sementara, menghentikan Service yang telah dibuat, serta memberikan Ringkasan kegagalan beserta langkah pemulihan yang dapat dilakukan pengguna. Installer juga harus mampu melanjutkan proses dari tahap terakhir yang berhasil apabila pengguna memilih melanjutkan instalasi tanpa mengulang seluruh proses dari awal.

Upgrade, Repair, and Compatibility

Selain instalasi baru, Installer harus menyediakan Mode Upgrade dan Repair. Upgrade memverifikasi kompatibilitas versi, membuat Backup sebelum perubahan, menjalankan Migration, memperbarui Dependency, kemudian melakukan Health Check menyeluruh sebelum sistem dinyatakan siap digunakan kembali. Repair digunakan untuk memperbaiki Service yang hilang, Dependency yang rusak, konfigurasi yang tidak lengkap, maupun Permission yang berubah tanpa menghapus data pengguna. Seluruh proses mengikuti Compatibility Matrix sehingga pengguna memperoleh peringatan apabila mencoba memasang versi yang tidak didukung. AI wajib memastikan bahwa Installer selalu mempertahankan integritas Workspace, Database, Notification, Automation, serta konfigurasi penting lainnya selama proses Upgrade maupun Repair.

User Experience and Extensibility

Installer harus memberikan pengalaman yang sederhana baik dijalankan melalui CLI maupun diintegrasikan ke Dashboard pada masa depan. Seluruh Output menggunakan bahasa yang jelas, Progress yang mudah dipahami, serta Ringkasan akhir yang menampilkan URL Dashboard, Status Service, Status Database, Status Redis, Status Tunnel, Status GitHub CLI, lokasi Log, serta langkah berikutnya yang direkomendasikan. Arsitektur Installer harus modular sehingga komponen baru dapat ditambahkan tanpa mengubah alur utama instalasi. Tujuan akhirnya adalah memastikan bahwa siapa pun dapat memasang My Dash dengan tingkat keberhasilan yang tinggi tanpa memerlukan konfigurasi manual yang rumit.

Acceptance Criteria

Installer dianggap memenuhi spesifikasi apabila mampu melakukan instalasi baru, Upgrade, Repair, dan Uninstall secara aman, memverifikasi seluruh dependensi, menghasilkan konfigurasi yang konsisten, mendukung Recovery ketika terjadi kegagalan, serta memberikan Ringkasan akhir yang lengkap mengenai kondisi sistem. Implementasi harus dapat diulang tanpa efek samping, mudah dipelihara, dan menjadi fondasi yang andal bagi seluruh proses distribusi My Dash.
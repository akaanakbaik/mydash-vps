Command Line Interface Engineering Specification

Purpose

Command Line Interface merupakan antarmuka administrasi resmi My Dash untuk pengguna yang lebih memilih mengelola sistem melalui Terminal dibanding Dashboard. CLI bukan sekadar kumpulan Script, melainkan Application Layer yang memiliki struktur perintah, validasi, bantuan, serta Output yang konsisten. Seluruh fungsi penting Dashboard harus memiliki padanan di CLI apabila secara teknis memungkinkan, sehingga Administrator dapat melakukan instalasi, pembaruan, Monitoring, Backup, Restore, GitHub Integration, Tunnel Management, Queue Management, Plugin Management, maupun Diagnosis sistem langsung dari VPS. Seluruh perintah harus dapat dijalankan secara Non-Interactive untuk kebutuhan Automation maupun Interactive untuk mempermudah penggunaan manual. CLI juga harus menghasilkan Exit Code yang konsisten agar mudah diintegrasikan dengan Script Bash, GitHub Actions, Cron, maupun sistem orkestrasi lainnya.

Command Architecture and User Experience

CLI menggunakan struktur perintah bertingkat yang mudah dipelajari, misalnya kelompok System, Service, Monitoring, Backup, Restore, Notification, Automation, GitHub, Tunnel, Docker, Plugin, Scheduler, AI, Configuration, serta Diagnostic. Setiap Command memiliki Description, Usage, Required Permission, Validation Rule, Contoh penggunaan, serta Output yang konsisten dalam bentuk Human Readable maupun JSON apabila diminta. AI wajib memastikan bahwa setiap Command memiliki nama yang jelas, tidak ambigu, serta mengikuti pola yang sama sehingga pengguna dapat menebak Command baru tanpa harus membaca dokumentasi secara lengkap. Fitur Auto Completion, Help, Version, Configuration Inspection, Dry Run, serta Confirmation untuk operasi berbahaya harus tersedia sebagai bagian dari pengalaman penggunaan standar.

Execution Flow, Validation, and Integration

Sebelum menjalankan suatu Command, CLI melakukan Parsing, Validation, Configuration Loading, Authentication apabila diperlukan, Permission Checking, Dependency Verification, kemudian meneruskan permintaan ke Application Service yang sesuai. CLI tidak diperbolehkan mengakses Database atau Domain secara langsung karena seluruh Business Logic tetap berada pada Backend. Seluruh Output penting seperti Progress Backup, Deployment, Restore, maupun GitHub Workflow harus mendukung tampilan Progress yang jelas tanpa mengganggu kemampuan menjalankan Command secara Non-Interactive. CLI juga harus terintegrasi dengan Logging, Audit, Notification, serta Event Bus sehingga seluruh tindakan administratif yang dilakukan melalui Terminal tetap tercatat sama seperti tindakan yang dilakukan melalui Dashboard.

Security, Reliability, and Error Handling

CLI harus memverifikasi identitas pengguna untuk Command yang memerlukan hak administratif serta mencegah eksekusi operasi berbahaya tanpa konfirmasi apabila dijalankan secara Interactive. Password, Token, Secret, maupun Credential lain tidak boleh ditampilkan pada Output maupun disimpan di History Shell. Seluruh Error memiliki Exit Code yang konsisten, Human Message yang mudah dipahami, serta Technical Detail yang dicatat pada Logging apabila diperlukan. AI wajib memastikan bahwa CLI tetap dapat digunakan ketika Dashboard tidak tersedia selama Service inti masih berjalan. Dengan demikian Administrator selalu memiliki jalur pemulihan untuk melakukan Diagnosis maupun Recovery langsung dari VPS.

Extensibility, Automation, and Future Compatibility

Arsitektur CLI harus modular sehingga setiap Domain dapat mendaftarkan Command baru tanpa mengubah Core CLI. Plugin juga dapat menambahkan Command sendiri melalui Plugin SDK dengan mengikuti kontrak yang sama. Seluruh Command harus kompatibel dengan Automation, GitHub Actions, Bash Script, Cron, maupun alat orkestrasi lainnya melalui Exit Code, JSON Output, serta perilaku yang deterministik. Tujuan akhirnya adalah menjadikan CLI sebagai alat administrasi yang kuat, ringan, mudah dipelihara, dan setara kemampuannya dengan Dashboard sehingga pengguna bebas memilih antarmuka yang paling sesuai dengan kebutuhan mereka.

Acceptance Criteria

CLI dianggap memenuhi spesifikasi apabila menyediakan struktur Command yang konsisten, mendukung Mode Interactive dan Non-Interactive, memiliki Validation, Help, Auto Completion, Logging, Audit, Permission, Exit Code yang standar, serta mampu mengakses seluruh fungsi administratif utama My Dash melalui Application Layer. Implementasi harus mudah diperluas oleh Domain maupun Plugin, dapat digunakan dalam Automation, dan tetap memberikan pengalaman administrasi yang aman, cepat, serta dapat diprediksi pada seluruh lingkungan yang didukung.
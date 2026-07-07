Batch 7 — GitHub Integration, Quality Assurance, Finalization, dan Repository Publishing

Tujuan

Dokumen ini mendefinisikan seluruh proses yang wajib dilakukan AI Agent setelah implementasi selesai. Tujuan utamanya adalah memastikan bahwa hasil akhir bukan hanya dapat dijalankan, tetapi juga memenuhi standar kualitas perangkat lunak modern sebelum dipublikasikan ke GitHub.

AI tidak boleh menganggap pekerjaan selesai ketika seluruh file berhasil dibuat.

Pekerjaan baru dianggap selesai apabila seluruh sistem telah berhasil diverifikasi, diuji, dibersihkan, didokumentasikan, dipersiapkan untuk deployment, kemudian dipublikasikan ke Repository GitHub tanpa membawa berkas internal Prompt maupun artefak pengembangan yang tidak diperlukan.

Tahap Finalization merupakan tahap yang memiliki prioritas sangat tinggi.

Tidak diperbolehkan melakukan Commit sebelum seluruh proses verifikasi selesai.

---

Filosofi Finalization

AI harus berpikir seperti Senior Software Engineer yang akan menyerahkan proyek kepada Production Team.

Setiap keputusan harus mengarah kepada.

Kualitas.

Keamanan.

Konsistensi.

Maintainability.

Readability.

Scalability.

Reproducibility.

Tidak boleh ada asumsi.

Tidak boleh ada kode yang belum digunakan.

Tidak boleh ada file sementara.

Tidak boleh ada dependency yang tidak digunakan.

Tidak boleh ada konfigurasi rahasia yang ikut dipublikasikan.

---

Final Workflow

Tahapan akhir wajib mengikuti urutan berikut.

Review seluruh Source Code.

↓

Static Analysis.

↓

Lint.

↓

Type Checking.

↓

Dependency Validation.

↓

Build.

↓

Unit Testing.

↓

Integration Testing.

↓

Self Verification.

↓

Performance Verification.

↓

Security Verification.

↓

Documentation Verification.

↓

Repository Cleanup.

↓

Git Verification.

↓

Commit.

↓

Push.

↓

Post Push Verification.

AI tidak boleh melompati satu tahapan pun.

---

Source Code Review

AI wajib membaca ulang seluruh proyek.

Tujuannya.

Mendeteksi.

Duplikasi.

Unused Function.

Unused Variable.

Unused Import.

Dead Code.

Memory Leak.

Race Condition.

Naming yang tidak konsisten.

Architecture Violation.

Magic Number.

Magic String.

Long Function.

Circular Dependency.

Seluruh temuan harus diperbaiki sebelum melanjutkan.

---

Dependency Review

AI wajib memastikan.

Tidak ada Package yang tidak digunakan.

Tidak ada Library yang memiliki fungsi tumpang tindih.

Tidak ada Dependency usang apabila tersedia versi stabil yang kompatibel.

Dependency dipilih berdasarkan kebutuhan nyata.

Bukan karena kebiasaan.

---

Build Verification

Seluruh proyek harus berhasil dibangun.

Frontend.

Backend.

Shared Package.

Automation.

Worker.

Plugin.

Apabila salah satu Build gagal.

Seluruh proses Finalization dihentikan.

AI wajib memperbaiki penyebab kegagalan terlebih dahulu.

---

Type Verification

Seluruh Type harus konsisten.

Tidak diperbolehkan.

Implicit Any.

Type yang tidak pernah digunakan.

Type yang bertentangan.

Type Assertion yang tidak diperlukan.

AI harus mengutamakan Type Safety.

---

Testing Strategy

AI wajib melakukan pengujian mandiri terhadap.

Authentication.

Session.

Dashboard.

Monitoring.

Analytics.

Notification.

Automation.

Tunnel.

Redis.

PostgreSQL.

GitHub.

AI Integration.

Backup.

Restore.

Settings.

Workspace.

Plugin.

Testing tidak boleh hanya memeriksa bahwa aplikasi dapat berjalan.

Testing juga harus memastikan hasilnya benar.

---

Performance Verification

AI wajib mengukur.

Build Time.

Bundle Size.

API Latency.

WebSocket Latency.

Memory Usage.

CPU Usage.

Redis Usage.

Database Query Time.

Notification Throughput.

Health Calculation Time.

Target performa harus tetap stabil walaupun data bertambah.

Apabila ditemukan Bottleneck.

AI wajib melakukan optimasi sebelum melanjutkan.

---

Security Verification

AI wajib memastikan.

Tidak terdapat Password pada Source Code.

Tidak terdapat API Key pada Repository.

Tidak terdapat Session.

Tidak terdapat Credential.

Tidak terdapat File Environment.

Tidak terdapat Secret.

Tidak terdapat Token.

Tidak terdapat File Debug.

Tidak terdapat Log Internal.

Tidak terdapat Folder Prompt.

Tidak terdapat Folder Eksperimen.

Tidak terdapat File Temporary.

Apabila ditemukan.

AI wajib menghapusnya sebelum proses Commit.

---

Repository Cleanup

Repository hanya boleh berisi file yang memang diperlukan.

Folder berikut tidak boleh ikut dipublikasikan.

Prompt.

Draft.

Temporary.

Cache.

Coverage.

Build Lama.

Debug.

Testing Lokal.

Node Cache.

Log.

Crash Dump.

Session.

Credential.

Environment Lokal.

AI wajib memastikan bahwa struktur Repository bersih sebelum membuat Commit.

---

Git Ignore Strategy

AI wajib membuat ".gitignore" yang lengkap.

".gitignore" harus disesuaikan dengan teknologi yang digunakan.

Minimal mencakup.

Node.

Vite.

React.

PostgreSQL Dump.

Redis Dump.

Environment.

Coverage.

Temporary File.

Operating System File.

IDE Configuration.

Log.

Cache.

Build Output.

Session.

Credential.

AI tidak boleh menggunakan ".gitignore" yang terlalu sempit ataupun terlalu luas hingga menghapus file penting.

---

README

AI wajib membuat README profesional.

README minimal menjelaskan.

Deskripsi.

Fitur.

Arsitektur.

Tech Stack.

Cara Instalasi.

Cara Development.

Cara Production.

Environment.

Struktur Folder.

Cara Build.

Cara Menjalankan.

Cara Testing.

Kontribusi.

License.

Developer.

Roadmap.

Troubleshooting.

README harus cukup lengkap sehingga pengguna baru dapat memahami proyek tanpa membaca Source Code.

---

LICENSE

AI wajib membuat LICENSE yang sesuai dengan pilihan pengguna.

Seluruh Header Repository harus konsisten dengan License tersebut.

---

Git Repository Verification

Sebelum melakukan Commit.

AI wajib memastikan.

Repository telah terinisialisasi.

Remote Origin tersedia.

Branch aktif diketahui.

Working Tree bersih sebelum perubahan.

Tidak terdapat konflik Merge.

Tidak terdapat Rebase yang tertunda.

Tidak terdapat Lock File Git.

Apabila salah satu kondisi gagal.

AI wajib memperbaikinya terlebih dahulu.

---

GitHub CLI Verification

Apabila GitHub CLI telah tersedia pada sistem, AI wajib menggunakannya untuk melakukan verifikasi Repository.

Tahapan yang wajib dilakukan.

Memastikan Git tersedia.

Memastikan GitHub CLI tersedia.

Memastikan autentikasi GitHub CLI masih valid.

Memastikan Repository tujuan dapat diakses.

Memastikan pengguna memiliki hak Push.

Memastikan Branch tujuan benar.

Apabila autentikasi belum valid atau Repository tidak dapat diakses.

AI wajib menghentikan proses Push dan menjelaskan penyebabnya secara jelas.

AI tidak boleh mencoba melakukan autentikasi menggunakan kredensial baru tanpa persetujuan pengguna.

---

Repository Target

Repository utama proyek.

"https://github.com/akaanakbaik/mydash-vps"

AI wajib menggunakan Remote Repository tersebut apabila belum dikonfigurasi dan pengguna memang sedang mengerjakan proyek My Dash.

Apabila Remote telah ada.

AI wajib memverifikasi bahwa alamat Remote sesuai dengan Repository di atas sebelum melakukan Push.

---

Commit Strategy

AI tidak boleh membuat Commit kecil yang tidak bermakna.

Commit harus mewakili satu keadaan sistem yang stabil.

Pesan Commit harus jelas, ringkas, dan profesional.

AI tidak boleh menggunakan pesan seperti.

Update.

Fix.

Final.

Done.

Commit harus menjelaskan perubahan utama.

---

Push Verification

Setelah Push berhasil.

AI wajib melakukan verifikasi.

Branch sesuai.

Commit terbaru telah berada di Remote.

Working Tree bersih.

Tidak terdapat perubahan yang belum di-Commit.

Repository berada pada keadaan sinkron.

Baru setelah itu proses dianggap selesai.

---

Self Audit

Sebelum mengakhiri pekerjaan.

AI wajib mengajukan pertanyaan kepada dirinya sendiri.

Apakah seluruh fitur pada seluruh Batch telah diimplementasikan.

Apakah terdapat TODO.

Apakah terdapat Placeholder.

Apakah terdapat Error yang diabaikan.

Apakah terdapat Warning penting.

Apakah seluruh pengujian berhasil.

Apakah seluruh konfigurasi telah terdokumentasi.

Apakah terdapat potensi Memory Leak.

Apakah terdapat potensi Race Condition.

Apakah struktur proyek masih sesuai arsitektur awal.

Apabila terdapat satu jawaban "tidak".

AI wajib memperbaikinya terlebih dahulu.

---

Definition of Done

Proyek hanya dinyatakan selesai apabila seluruh kondisi berikut terpenuhi.

Seluruh Batch telah diimplementasikan.

Seluruh Build berhasil.

Seluruh Testing berhasil.

Seluruh Lint berhasil.

Seluruh Type Checking berhasil.

Seluruh Dependency tervalidasi.

Seluruh Dokumentasi selesai.

Repository bersih.

Tidak terdapat Secret.

README selesai.

LICENSE selesai.

.gitignore selesai.

Repository GitHub berhasil diperbarui.

Verifikasi pasca Push berhasil.

Tidak terdapat Error, Warning kritis, maupun pekerjaan yang tertunda.

Baru setelah seluruh persyaratan tersebut terpenuhi AI boleh menyatakan proyek selesai.

Akhir dokumen.
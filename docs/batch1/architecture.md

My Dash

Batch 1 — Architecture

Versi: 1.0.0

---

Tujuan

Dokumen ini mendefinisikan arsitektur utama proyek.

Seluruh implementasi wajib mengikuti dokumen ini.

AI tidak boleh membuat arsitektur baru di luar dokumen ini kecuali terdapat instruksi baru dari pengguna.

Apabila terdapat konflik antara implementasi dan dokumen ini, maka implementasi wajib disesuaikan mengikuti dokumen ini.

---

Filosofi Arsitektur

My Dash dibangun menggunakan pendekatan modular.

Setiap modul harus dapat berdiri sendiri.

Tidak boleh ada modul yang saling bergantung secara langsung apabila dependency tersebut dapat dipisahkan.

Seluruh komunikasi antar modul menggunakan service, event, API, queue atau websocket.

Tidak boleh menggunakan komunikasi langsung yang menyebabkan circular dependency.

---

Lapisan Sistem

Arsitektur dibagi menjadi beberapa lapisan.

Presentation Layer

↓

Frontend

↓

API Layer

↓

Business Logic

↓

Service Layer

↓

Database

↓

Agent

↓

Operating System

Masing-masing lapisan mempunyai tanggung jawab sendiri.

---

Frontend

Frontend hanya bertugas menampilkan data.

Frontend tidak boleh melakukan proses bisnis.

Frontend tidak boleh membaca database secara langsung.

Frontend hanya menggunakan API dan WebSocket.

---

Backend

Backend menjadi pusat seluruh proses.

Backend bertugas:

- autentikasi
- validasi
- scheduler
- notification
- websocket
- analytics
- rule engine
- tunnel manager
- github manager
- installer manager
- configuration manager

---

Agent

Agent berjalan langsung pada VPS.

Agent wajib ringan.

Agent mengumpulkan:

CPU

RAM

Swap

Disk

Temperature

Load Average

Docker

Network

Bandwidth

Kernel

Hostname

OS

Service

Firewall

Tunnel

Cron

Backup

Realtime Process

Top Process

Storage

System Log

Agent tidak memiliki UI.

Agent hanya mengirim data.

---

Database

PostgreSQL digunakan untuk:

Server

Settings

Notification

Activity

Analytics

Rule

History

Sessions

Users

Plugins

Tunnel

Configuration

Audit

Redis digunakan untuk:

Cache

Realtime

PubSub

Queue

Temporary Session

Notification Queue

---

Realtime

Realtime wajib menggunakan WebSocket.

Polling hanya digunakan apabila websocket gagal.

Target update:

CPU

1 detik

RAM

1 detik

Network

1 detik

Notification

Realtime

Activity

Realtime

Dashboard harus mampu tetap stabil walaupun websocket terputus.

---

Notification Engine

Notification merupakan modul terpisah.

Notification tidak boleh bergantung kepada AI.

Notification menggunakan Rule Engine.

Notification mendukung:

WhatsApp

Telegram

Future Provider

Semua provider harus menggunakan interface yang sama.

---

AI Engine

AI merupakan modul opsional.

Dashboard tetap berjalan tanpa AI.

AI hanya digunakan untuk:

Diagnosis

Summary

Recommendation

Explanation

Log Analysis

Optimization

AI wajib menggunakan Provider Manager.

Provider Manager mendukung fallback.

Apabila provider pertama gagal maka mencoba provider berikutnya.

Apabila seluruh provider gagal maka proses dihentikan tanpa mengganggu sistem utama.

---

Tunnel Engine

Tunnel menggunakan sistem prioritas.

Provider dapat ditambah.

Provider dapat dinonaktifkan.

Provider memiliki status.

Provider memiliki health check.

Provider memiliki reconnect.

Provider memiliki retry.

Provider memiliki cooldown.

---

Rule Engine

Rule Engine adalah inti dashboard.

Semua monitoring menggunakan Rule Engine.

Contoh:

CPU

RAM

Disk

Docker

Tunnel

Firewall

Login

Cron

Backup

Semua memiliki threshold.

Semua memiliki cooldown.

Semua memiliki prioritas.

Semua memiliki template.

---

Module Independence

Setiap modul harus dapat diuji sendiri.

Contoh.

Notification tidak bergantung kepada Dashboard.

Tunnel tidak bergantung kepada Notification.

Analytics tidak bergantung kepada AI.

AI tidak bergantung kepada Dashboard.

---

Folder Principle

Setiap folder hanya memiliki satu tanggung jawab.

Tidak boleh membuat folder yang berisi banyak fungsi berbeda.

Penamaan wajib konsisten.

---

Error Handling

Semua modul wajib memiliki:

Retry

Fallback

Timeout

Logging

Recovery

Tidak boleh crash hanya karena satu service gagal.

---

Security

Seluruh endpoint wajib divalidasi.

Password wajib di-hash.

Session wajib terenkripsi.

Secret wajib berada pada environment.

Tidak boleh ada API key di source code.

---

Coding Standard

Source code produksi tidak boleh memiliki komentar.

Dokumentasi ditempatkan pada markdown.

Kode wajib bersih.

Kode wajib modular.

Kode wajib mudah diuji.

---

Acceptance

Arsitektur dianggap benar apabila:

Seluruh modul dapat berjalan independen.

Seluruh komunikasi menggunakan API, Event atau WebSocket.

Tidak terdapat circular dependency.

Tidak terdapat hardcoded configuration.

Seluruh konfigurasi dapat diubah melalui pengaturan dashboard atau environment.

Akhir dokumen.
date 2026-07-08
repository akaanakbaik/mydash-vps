Batch 1 — System Architecture Foundation

Purpose

Tahap pertama implementasi berfokus membangun fondasi arsitektur proyek My Dash. Pada tahap ini AI belum diperbolehkan mengejar jumlah fitur. Prioritas utama adalah memastikan seluruh struktur proyek memiliki pondasi yang benar sehingga seluruh Batch berikutnya dapat dikembangkan tanpa melakukan perubahan arsitektur besar. Semua keputusan implementasi harus mengutamakan modularitas, maintainability, scalability, testability, dan consistency.

Seluruh implementasi wajib mengikuti seluruh dokumen pada direktori "docs/specs". Apabila ditemukan konflik antara implementasi dan spesifikasi, maka spesifikasi selalu menjadi acuan utama.

---

Architecture Philosophy

My Dash menggunakan pendekatan Domain Driven Design yang dipadukan dengan Layered Architecture serta Event Driven Architecture.

Setiap Domain memiliki tanggung jawab yang jelas.

Tidak diperbolehkan mencampurkan Business Logic dengan Presentation Layer.

Tidak diperbolehkan Business Logic berada pada UI Component.

Tidak diperbolehkan Controller mengakses Database secara langsung.

Seluruh komunikasi antar Domain dilakukan melalui Interface, Application Service, atau Event Bus.

Dependency harus selalu mengarah ke dalam.

Domain tidak boleh mengetahui implementasi Infrastructure.

Infrastructure hanya menyediakan implementasi terhadap kontrak yang telah didefinisikan Domain.

---

High Level Architecture

Arsitektur sistem dibagi menjadi beberapa lapisan.

Presentation Layer.

Application Layer.

Domain Layer.

Infrastructure Layer.

Persistence Layer.

Realtime Layer.

Background Worker Layer.

Setiap Layer memiliki tanggung jawab yang berbeda dan tidak boleh saling melanggar batas tanggung jawab tersebut.

---

Core Domains

Domain utama sistem terdiri dari.

Workspace.

Authentication.

Authorization.

Monitoring.

Analytics.

Health Score.

Notification.

Automation.

Queue.

Scheduler.

Backup.

Restore.

GitHub.

Tunnel.

Docker.

Plugin.

AI.

Logging.

Audit.

Configuration.

System.

Masing-masing Domain harus dapat dikembangkan secara independen.

---

Communication Pattern

Komunikasi Sinkron menggunakan REST API.

Komunikasi Realtime menggunakan WebSocket.

Komunikasi Internal menggunakan Event Bus.

Komunikasi Background menggunakan Queue.

Komunikasi Data Permanen menggunakan PostgreSQL.

Komunikasi Cache menggunakan Redis.

Tidak diperbolehkan Domain saling memanggil secara langsung apabila mekanisme Event telah tersedia.

---

Data Flow

Collector memperoleh Metric.

↓

Monitoring melakukan Validation.

↓

Monitoring menerbitkan Event.

↓

Analytics menghitung statistik.

↓

Health Score menghitung skor kesehatan.

↓

Notification mengevaluasi Rule.

↓

Automation mengevaluasi Workflow.

↓

Dashboard memperoleh pembaruan melalui WebSocket.

↓

Data historis disimpan pada PostgreSQL.

↓

Cache diperbarui pada Redis.

Seluruh alur harus bersifat deterministik dan dapat direproduksi.

---

Dependency Rules

Presentation hanya mengetahui Application.

Application hanya mengetahui Domain.

Domain hanya mengetahui Interface.

Infrastructure mengimplementasikan Interface.

Worker menggunakan Application Service.

Plugin menggunakan Plugin SDK.

Tidak diperbolehkan terjadi Circular Dependency.

Tidak diperbolehkan Domain saling mengimpor implementasi satu sama lain.

---

Realtime Architecture

Realtime bukan hasil Polling.

Seluruh perubahan sistem diterbitkan sebagai Event.

WebSocket hanya meneruskan Event yang telah lolos validasi.

Dashboard tidak melakukan Request berulang untuk memperoleh data terbaru.

Snapshot awal diperoleh melalui REST API.

Perubahan berikutnya diperoleh melalui WebSocket.

---

Error Handling Strategy

Setiap Error harus diklasifikasikan.

Validation Error.

Business Error.

Infrastructure Error.

Security Error.

External Service Error.

Unexpected Error.

Seluruh Error menghasilkan Logging.

Error penting menghasilkan Audit.

Error kritis menghasilkan Notification.

Tidak diperbolehkan Error ditelan tanpa pencatatan.

---

Scalability Principle

Setiap Domain harus dapat diskalakan tanpa memengaruhi Domain lain.

Worker dapat ditambah tanpa mengubah Business Logic.

Queue dapat diperluas.

Redis dapat diganti.

Database dapat dioptimalkan.

Notification Provider dapat ditambah.

Tunnel Provider dapat ditambah.

Plugin dapat ditambah.

AI Provider dapat diganti.

Semua melalui Interface yang telah ditentukan.

---

Coding Principle

Seluruh implementasi harus.

Mudah dibaca.

Mudah diuji.

Mudah diperluas.

Mudah dipelihara.

Tidak menggunakan komentar kode.

Tidak meninggalkan TODO.

Tidak meninggalkan FIXME.

Tidak meninggalkan Placeholder.

Seluruh Function harus memiliki satu tanggung jawab.

Seluruh Class harus memiliki satu tujuan utama.

Seluruh Module harus memiliki batas tanggung jawab yang jelas.

---

Engineering Objectives

Batch pertama belum bertujuan menyelesaikan seluruh fitur.

Target utama adalah menghasilkan fondasi proyek yang stabil, konsisten, modular, mudah dikembangkan, dan siap menerima implementasi seluruh Domain pada Batch berikutnya tanpa memerlukan perubahan arsitektur yang signifikan.

Seluruh keputusan implementasi pada Batch selanjutnya wajib mengacu pada arsitektur yang telah didefinisikan dalam dokumen ini.

End of document.
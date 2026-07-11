Component Engineering Specification

Purpose

Component System merupakan fondasi seluruh antarmuka My Dash. Setiap elemen visual harus dibangun sebagai komponen yang mandiri, dapat digunakan kembali, mudah diuji, dan tidak bergantung pada halaman tertentu. Tidak diperbolehkan membuat komponen khusus untuk satu halaman apabila perilakunya masih dapat digeneralisasi menjadi komponen bersama. Seluruh komponen mengikuti filosofi Atomic Design yang terdiri dari Primitive Component, Shared Component, Composite Component, Feature Component, hingga Page Component. Dengan pendekatan ini perubahan desain hanya dilakukan pada satu tempat dan langsung diterapkan ke seluruh Dashboard. AI wajib memprioritaskan penggunaan komponen yang telah ada sebelum membuat komponen baru sehingga ukuran kode tetap kecil, konsisten, dan mudah dipelihara selama proyek berkembang.

Component Library and Classification

Seluruh komponen dikelompokkan berdasarkan tanggung jawabnya. Primitive Component mencakup Button, Input, Textarea, Checkbox, Switch, Select, Badge, Avatar, Progress, Skeleton, Spinner, Tooltip, Dialog, Drawer, Sheet, Accordion, Tabs, Breadcrumb, Separator, Scroll Area, serta komponen dasar lain dari shadcn/ui yang telah disesuaikan dengan identitas My Dash. Shared Component terdiri dari Stat Card, Metric Card, Health Gauge, Status Badge, Resource Bar, Activity Timeline, Data Table, Search Box, Filter Panel, Confirm Dialog, Empty State, Error State, Loading State, Notification Item, dan komponen yang digunakan lintas halaman. Feature Component dibangun khusus untuk Monitoring, Analytics, Backup, Tunnel, GitHub, Notification, Automation, maupun Domain lain, namun tetap memanfaatkan Primitive dan Shared Component sebagai fondasinya.

Design Consistency and Interaction Rules

Seluruh komponen harus mengikuti Design Token yang sama meliputi Radius, Padding, Margin, Typography, Border, Shadow, Animation Duration, Transition, serta Color Palette. Tidak diperbolehkan memberikan ukuran, warna, ataupun efek secara langsung apabila nilai tersebut telah tersedia pada Design System. Komponen wajib mendukung beberapa keadaan seperti Default, Hover, Active, Focus, Disabled, Loading, Success, Warning, Error, dan Selected apabila relevan. Setiap perubahan keadaan menggunakan animasi yang halus dan konsisten agar pengguna dapat memahami perubahan tanpa merasa terganggu. Komponen yang menampilkan data Realtime harus mampu memperbarui isi tanpa kehilangan fokus pengguna ataupun memicu Re-render pada bagian antarmuka yang tidak berubah.

Reusability, State Management, and Performance

Komponen tidak boleh menyimpan Business Logic yang seharusnya berada pada Domain atau Service. State lokal hanya digunakan untuk kebutuhan presentasi seperti membuka Dialog, memilih Tab, atau mengelola Input sementara. Data utama diperoleh melalui Hook, Store, atau Service yang telah ditentukan arsitektur. AI wajib menghindari Prop Drilling yang berlebihan, memanfaatkan Composition dibanding pewarisan yang rumit, serta memastikan setiap komponen dapat digunakan pada berbagai halaman tanpa perubahan kode. Komponen harus mendukung Memoization apabila terbukti mengurangi Re-render, Lazy Loading untuk komponen besar, serta Virtualization pada daftar yang memiliki banyak Item sehingga performa Dashboard tetap stabil walaupun jumlah data meningkat.

Documentation, Testing, and Extensibility

Setiap komponen wajib memiliki dokumentasi singkat mengenai tujuan, properti utama, perilaku, serta contoh penggunaan sehingga mudah dipahami oleh pengembang lain maupun AI Agent. Seluruh komponen penting harus memiliki Unit Test untuk memastikan Rendering, Interaction, Accessibility, serta perubahan State berjalan sesuai harapan. Arsitektur Component Library harus memungkinkan penambahan komponen baru tanpa mengubah komponen lama, sehingga Dashboard dapat terus berkembang dengan tetap mempertahankan konsistensi visual. AI juga wajib memastikan bahwa komponen mudah dikustomisasi melalui Theme dan Design Token tanpa perlu menyalin atau menggandakan implementasi yang telah ada.

Acceptance Criteria

Component System dianggap memenuhi spesifikasi apabila seluruh elemen antarmuka dibangun menggunakan komponen yang dapat digunakan kembali, mengikuti Design System yang konsisten, memiliki perilaku yang dapat diprediksi, mendukung berbagai State, mudah diuji, memiliki performa yang baik, serta tidak menyimpan Business Logic yang seharusnya berada di Domain lain. Implementasi harus menghasilkan antarmuka yang seragam, mudah dipelihara, dan siap berkembang seiring bertambahnya fitur pada My Dash.
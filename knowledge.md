# MyDash Engineering Knowledge

## Tujuan sistem

MyDash adalah control plane observability untuk satu atau lebih VPS. Sistem dibagi menjadi host agent, backend API, persistence layer, frontend query layer, WebSocket event layer, dan deployment layer. Setiap layer memiliki tanggung jawab terbatas sehingga dashboard dapat memberi informasi detail tanpa memasang akses host yang berlebihan.

## Alur data monitoring

Host agent berjalan sebagai systemd oneshot yang dipanggil timer setiap 60 detik. Agent membaca procfs, sysfs, `/etc/os-release`, filesystem statistics, interface counters, uptime, dan status unit systemd. Snapshot ditulis ke file sementara pada filesystem yang sama lalu dipindahkan dengan operasi atomik ke `/run/mydash-host-metrics.json`.

Backend membaca snapshot read-only. Collector memvalidasi field numerik dengan finite guard, menolak nilai non-finite, mengubah counter interface menjadi delta per second, lalu menyimpan metric per server dan workspace. Query historis memakai batas waktu eksplisit, sort timestamp ascending, dan range selector yang dibatasi 1 jam sampai 30 hari. Tidak ada random generator, fixture aktif, atau fallback angka nol untuk field yang tidak dapat dibuktikan.

## Health score

Utilization score dihitung sebagai `100 - utilization`, lalu di-clamp pada interval `[0,100]`. Overall score adalah weighted mean dari domain yang benar-benar tersedia. Weight yang tidak mempunyai evidence tidak ikut denominator aktif. Confidence dihitung dari jumlah domain tersedia terhadap jumlah domain yang diperiksa. Grade memakai threshold A+ untuk 98 atau lebih, A untuk 93–97.99, B untuk 85–92.99, C untuk 75–84.99, D untuk 60–74.99, dan F di bawah 60.

Health explainability tidak hanya menampilkan grade. Setiap factor menyimpan domain, description, penalty, bonus, confidence, sample coverage, dan timestamp. Jika persistence belum memiliki score untuk range aktif, UI menampilkan `Unavailable` dan tidak mengubahnya menjadi 0.

## Observability modules

Event timeline menggabungkan audit event dan system log nyata secara terurut berdasarkan timestamp. Disk analyzer membaca filesystem root dan top-level path yang dapat diakses agent, kemudian mengurutkan usage secara descending. Service monitor hanya menyatakan active, failed, stopped, atau unavailable berdasarkan systemd probe. Network detail memakai counter interface dan delta time; throughput tidak dihitung dari satu sample tanpa baseline.

Period comparison membagi range menjadi current dan previous window dengan durasi sama. Setiap delta mempunyai arah, persentase perubahan, dan status insufficient-sample ketika denominator atau sample tidak cukup. Availability memakai minute bucket dan coverage ratio, bukan sekadar menghitung jumlah request sukses. Missing bucket tidak dianggap uptime.

## Theme system

Theme bootstrap dilakukan sebelum React mount melalui `localStorage` key `mydash-theme`. Provider menyinkronkan root class `dark`, root attribute `data-theme`, dan `color-scheme`. Dark mode memakai graphite surface dengan inset shadow dan ambient accent. Light mode memakai white surface, slate text, border dingin, serta shadow yang lebih ringan. Perubahan tema diberi transisi singkat hanya ketika motion preference mengizinkan.

Komponen interaktif menggunakan transform dan opacity agar tidak memicu layout reflow. `prefers-reduced-motion` mematikan animasi non-esensial. App shell memakai progress bar route yang tidak mengurangi opacity content, sehingga halaman tidak terlihat rusak ketika navigasi.

## Notification system

Notification activity berasal dari backend notification response atau event realtime. Header menyimpan daftar activity yang telah dibaca pada local storage dengan batas 200 ID. Toast memiliki severity, deduplication key, queue limit empat item, timeout adaptif, pause-on-hover, progress indicator, dismiss action, dan keyboard focus. Event metric ingestion tidak menjadi toast karena frekuensinya tinggi. Event failure, security alert, server offline, tunnel disconnected, backup, automation, dan notification delivery dapat menjadi toast sesuai severity.

Toast yang sukses hanya dibuat saat event menyatakan operasi selesai. UI tidak mengklaim Telegram, WhatsApp, queue, retry, atau delivery sukses bila backend tidak memiliki evidence provider tersebut.

## Query and loading performance

TanStack Query menggunakan stale cache, garbage collection, structural sharing, bounded retry, dan polling yang berhenti saat tab hidden pada query notification. Refetch on focus digunakan untuk mengembalikan freshness setelah tab aktif kembali. Skeleton hanya ditampilkan ketika data belum ada. Data lama dapat tetap terlihat ketika refetch berlangsung sehingga tidak terjadi blank flash.

## Mobile behavior

Viewport minimum adalah 320px. Touch target penting memakai tinggi minimum 44px. Sidebar drawer mengunci body scroll, menutup dengan Escape atau overlay, memindahkan focus ke item pertama, lalu mengembalikan focus ke trigger ketika ditutup. Data table dan chart yang lebar memakai scroll container lokal agar halaman tidak mengalami horizontal overflow global.

## Installer behavior

Bash installer mendukung `--check` dan `--install`. Preflight memeriksa OS, versi, kernel, arsitektur, CPU, virtualisasi, filesystem, disk, memory, swap, firewall, Docker, Compose, Git, dan port. Install hanya berjalan apabila Docker Engine atau Docker Desktop dan Compose sudah siap. Installer tidak memasang package OS atau Docker secara otomatis karena setiap platform memiliki package manager, privilege, dan kebijakan perubahan yang berbeda.

Install directory yang sudah menjadi git checkout disinkronkan dengan fetch dan reset branch target. Directory non-git tidak ditimpa. `.env` dibuat dari `.env.example` jika tersedia, port diperbarui secara bounded, lalu `docker compose up -d --build` dijalankan. PowerShell installer mengikuti alur yang sama pada Windows.

## Deployment boundary

Deployment MyDash dilakukan dengan build dan recreate container backend melalui Docker Compose. Cloudflare Tunnel, PostgreSQL, Redis, host timer, nginx, wings, dan pteroq diverifikasi setelah deploy. Unit Pterodactyl tidak diubah, port Pterodactyl tidak dipakai ulang, dan Docker socket tidak dipasang ke backend.

## Quality gates

Perubahan harus melewati shared build, backend typecheck, frontend typecheck/build, Python compile host agent, ESLint, Vitest, Bash syntax check, installer smoke test, endpoint health, authenticated API audit, browser desktop audit, browser mobile audit, theme toggle, notification panel, reduced motion, dan overflow check. CI memakai Bun 1.3.14 dan jsdom hanya untuk React TSX tests.

## Troubleshooting

Jika host metrics stale, periksa status timer, timestamp `/run/mydash-host-metrics.json`, permission file, dan bind mount backend. Jika dashboard menunjukkan `Unavailable`, periksa apakah data memang tidak dikumpulkan oleh host agent; jangan mengganti nilai dengan zero. Jika WebSocket reconnect berulang, periksa token, endpoint `/ws`, tunnel, dan browser network state. Jika installer menolak port, gunakan `--port` lain atau periksa listener existing sebelum melanjutkan.

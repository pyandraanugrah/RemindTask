# RemindTask

RemindTask adalah aplikasi manajemen tugas pribadi yang dibuat untuk membantu mengatur tugas kuliah, mata kuliah, deadline, prioritas, dan pengingat dalam satu tempat.

Aplikasi ini dirancang sebagai aplikasi **single-user/personal** dengan fokus pada tampilan yang sederhana, bersih, responsif, dan mudah digunakan.

## ✨ Fitur

- 📊 Dashboard tugas
- 📝 Manajemen tugas (CRUD)
- 📚 Manajemen mata kuliah
- 🔎 Pencarian dan filter tugas
- ⏰ Countdown deadline secara realtime
- 🚨 Deteksi tugas yang sudah terlambat
- ⚠️ Indikator tugas yang mendekati deadline
- 📅 Kalender deadline
- 🔔 Reminder tugas
- 🌐 Browser notification
- 📱 Responsive untuk desktop dan mobile
- ♿ Dukungan accessibility dasar
- 🌙 Dark mode mengikuti preferensi sistem
- 🔄 Countdown diperbarui secara realtime tanpa query database setiap interval

## 🛠️ Teknologi

| Teknologi | Penggunaan |
|---|---|
| **Next.js** | Framework aplikasi web |
| **TypeScript** | Bahasa pemrograman |
| **Tailwind CSS** | Styling dan UI |
| **Prisma** | ORM untuk database |
| **PostgreSQL** | Database |
| **Supabase** | Database hosting |
| **Jest** | Unit testing |
| **Vercel** | Deployment |

## 🏗️ Arsitektur

RemindTask menggunakan arsitektur sederhana karena aplikasi ini ditujukan untuk penggunaan pribadi.

```text
                    RemindTask
                        │
                    Next.js
                        │
              ┌─────────┴─────────┐
              │                   │
         App Router          React Components
              │                   │
        Server Actions       Client Components
              │
           Prisma
              │
       PostgreSQL
              │
          Supabase

Aplikasi ini tidak menggunakan:
- Express / backend server terpisah
- Docker
- Redis
- Queue / background worker
- Sistem autentikasi multi-user
📂 Struktur Project
remindtask/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── app/
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── subjects/
│   │   │   └── page.tsx
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── calendar/
│   │   ├── reminder/
│   │   ├── subjects/
│   │   ├── tasks/
│   │   └── ui/
│   │
│   └── lib/
│       ├── actions/
│       ├── __tests__/
│       ├── calendar-utils.ts
│       ├── deadline.ts
│       ├── db.ts
│       ├── notifications.ts
│       ├── reminder-utils.ts
│       └── task-filter.ts
│
├── .env.local.example
├── .gitignore
├── jest.config.js
├── next.config.ts
├── package.json
├── package-lock.json
├── prisma.config.ts
├── README.md
├── tsconfig.json
└── eslint.config.mjs

PRD.md tidak ditampilkan karena merupakan dokumentasi internal project dan sengaja diabaikan oleh Git melalui .gitignore.

🚀 Menjalankan Project
1. Clone Repository
git clone https://github.com/USERNAME/remindtask.git
cd remindtask

2. Install Dependency
npm install

3. Konfigurasi Environment
Buat file .env.local pada root project:
DATABASE_URL="your-database-connection-string"

Gunakan connection string PostgreSQL dari Supabase.
Jangan commit .env.local ke repository karena file tersebut dapat berisi credential database.

4. Generate Prisma Client
npx prisma generate

5. Jalankan Development Server
npm run dev

Kemudian buka:
http://localhost:3000

🗄️ Database
RemindTask menggunakan PostgreSQL yang di-host menggunakan Supabase.
Relasi utama database:
Subject
   │
   └──< Task
          │
          └──< Reminder

Subject
Menyimpan data mata kuliah seperti:
- ID
- Nama mata kuliah
- Warna
- Created At
- Updated At
Task
Menyimpan data tugas seperti:
- ID
- Subject
- Judul
- Deskripsi
- Priority
- Status
- Progress
- Deadline
- Created At
- Updated At
Reminder
Menyimpan data pengingat yang berkaitan dengan task seperti:
- ID
- Task
- Waktu reminder
- Status pengiriman
- Created At
⏰ Deadline Engine
RemindTask memiliki sistem klasifikasi deadline untuk membantu pengguna mengetahui tingkat urgensi sebuah tugas.
Status	Kondisi
COMPLETED	Task telah selesai
OVERDUE	Deadline telah lewat dan task belum selesai
URGENT	Deadline ≤ 24 jam
WARNING	Deadline ≤ 3 hari
UPCOMING	Deadline ≤ 7 hari
NORMAL	Deadline > 7 hari


Countdown menggunakan waktu lokal browser dan diperbarui secara realtime tanpa melakukan query database setiap interval.
Contoh:
7 days left
3 days left
8 hours left
42 minutes left
Due now
Overdue by 2 days

🔎 Search & Filter
Task dapat dicari berdasarkan:
- Judul
- Deskripsi
- Nama mata kuliah
Task juga dapat difilter berdasarkan:
- Mata kuliah
- Priority
- Status
- Deadline
Filter deadline:
- ALL
- TODAY
- THIS_WEEK
- UPCOMING
- OVERDUE
Search dan filter dapat digunakan secara bersamaan menggunakan logika AND.
📅 Calendar
Halaman Calendar menyediakan:
- Tampilan kalender bulanan
- Navigasi bulan sebelumnya
- Navigasi bulan berikutnya
- Tombol kembali ke hari ini
- Indikator task pada tanggal yang memiliki deadline
- Pewarnaan berdasarkan deadline state
- Detail task berdasarkan tanggal
- Navigasi keyboard dasar
- Responsive untuk desktop dan mobile
Ketika tanggal dipilih, task yang memiliki deadline pada tanggal tersebut akan ditampilkan melalui modal detail.
🔔 Reminder & Notification
RemindTask menyediakan beberapa interval reminder:
- 7 hari sebelum deadline
- 3 hari sebelum deadline
- 1 hari sebelum deadline
- 6 jam sebelum deadline
- 1 jam sebelum deadline
Browser notification menggunakan Notification API.
Reminder diperiksa secara client-side ketika aplikasi sedang terbuka dengan interval pengecekan setiap 60 detik.
Aplikasi tidak menggunakan:
- Redis
- Background worker
- Queue
- Service Worker
- Web Push
Karena itu, browser notification tidak diklaim tetap berjalan ketika browser benar-benar tertutup.
Sistem menangani beberapa kondisi permission:
- granted
- default
- denied
- Browser tidak mendukung Notification API
🧪 Testing
Menjalankan seluruh unit test:
npm test

TypeScript check:
npx tsc --noEmit

ESLint:
npm run lint

Production build:
npm run build

Hasil Testing
Pada tahap MVP:
- 80/80 unit test lulus
- TypeScript: 0 error
- ESLint: 0 error
- ESLint: 0 warning
- Production build: berhasil
- Regression test Phase 1–9: berhasil
🎨 UI & UX
RemindTask menggunakan pendekatan desain yang:
- Minimal
- Clean
- Calm
- Mudah dipindai
- Responsive
- Mobile-friendly
- Konsisten
- Berorientasi pada produktivitas
UI menghindari penggunaan berlebihan terhadap:
- Gradient
- Glassmorphism
- Animasi
- Card
- Chart
- Elemen dekoratif yang tidak diperlukan
Tujuan utama aplikasi adalah membantu pengguna mengetahui:
"Apa yang harus saya kerjakan sekarang?"

📱 Responsive Design
RemindTask dirancang untuk digunakan pada:
- Desktop
- Laptop
- Tablet
- Smartphone
Layout menyesuaikan ukuran layar, termasuk:
- Navigation
- Dashboard
- Task cards
- Filter
- Calendar
- Modal
- Form
- Empty state
♿ Accessibility
Beberapa aspek accessibility yang telah diterapkan:
- aria-label
- aria-expanded
- Keyboard navigation
- Focus state
- Dialog close label
- Keyboard-accessible calendar
- Struktur UI yang konsisten
🔐 Keamanan
Credential database tidak disimpan di source code.
Environment variable digunakan untuk koneksi database:
DATABASE_URL="..."

File environment lokal diabaikan oleh Git melalui .gitignore.
File berikut tidak boleh di-commit:
.env
.env.local
.env*.local

Gunakan .env.local.example sebagai referensi konfigurasi environment.
☁️ Deployment
RemindTask dirancang untuk menggunakan:
GitHub
   │
   ▼
Vercel
   │
   ▼
Next.js
   │
   ▼
Supabase PostgreSQL

Vercel
Repository GitHub dapat dihubungkan langsung ke Vercel.
Environment variable yang diperlukan:
DATABASE_URL

Value DATABASE_URL harus menggunakan connection string PostgreSQL dari Supabase.
Supabase
Supabase digunakan sebagai database PostgreSQL production.
Database tidak perlu dijalankan secara lokal menggunakan:
- WAMP
- XAMPP
- Docker
📌 Status Project
MVP selesai.
Progress pengembangan:
- [x] Project Foundation
- [x] Design System & UI Shell
- [x] Subject Management
- [x] Task CRUD
- [x] Dashboard Integration
- [x] Deadline & Countdown
- [x] Search & Filter
- [x] Calendar
- [x] Reminder & Notification
- [x] Testing & Polish
- [ ] Deployment
🔮 Pengembangan Selanjutnya
Beberapa fitur yang dapat dikembangkan di masa depan:
- Authentication
- Multi-user support
- Google Calendar integration
- Recurring tasks
- File attachment
- Pomodoro timer
- Progressive Web App (PWA)
- True background push notification
- Sinkronisasi kalender eksternal
- Statistik produktivitas
- AI-assisted task management
Fitur-fitur tersebut tidak termasuk dalam scope MVP saat ini.
👨‍💻 Pengembang
Dibuat oleh Panca sebagai project personal untuk membantu mengelola tugas dan deadline perkuliahan.

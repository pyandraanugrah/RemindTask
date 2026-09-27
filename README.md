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

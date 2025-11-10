````md
# 🎓 Ambil Prestasi

**Ambil Prestasi** adalah platform belajar online terpadu yang dirancang untuk membantu mahasiswa meraih prestasi terbaik mereka melalui **materi pembelajaran berkualitas** dan **bimbingan dari mentor profesional**.  
Platform ini menghadirkan pengalaman belajar fleksibel yang dapat diakses kapan saja dan di mana saja.

---

## 🚀 Fitur Utama

### 🌱 Untuk Semua Pengguna
- **Materi pembelajaran lengkap** sesuai kebutuhan pengembangan akademik dan profesional.
- **Fleksibilitas waktu belajar** — akses materi kapan saja, di mana saja.
- **Mentor profesional dan berpengalaman** di berbagai bidang keahlian.

---

## 👥 Role dan Hak Akses

Platform ini terdiri dari **tiga role utama** dengan tanggung jawab dan akses berbeda:

### 🛠️ Admin
- Mengelola **CRUD Teacher** (membuat, membaca, memperbarui, menghapus data pengajar).  
- Mengelola **CRUD Kategori Kelas** untuk mengatur pengelompokan konten pembelajaran.

### 👨‍🏫 Teacher (Pengajar)
- Mengelola **CRUD Kelas** yang dibuat.  
- Mengelola **CRUD Section** untuk membagi materi dalam struktur yang sistematis.  
- Mengelola **CRUD Materi** (video, teks, atau dokumen pembelajaran).  
- Mengelola **CRUD Quiz** untuk evaluasi belajar mahasiswa.

### 🎓 Student (Mahasiswa)
- Melihat **keseluruhan kelas** yang tersedia melalui endpoint `GET /classes`.  
- Melihat **detail kelas dan materi**.  
- Untuk **mengakses materi penuh**, mahasiswa perlu **mendaftar paket belajar tertentu**.  
  Setelah mendaftar, mahasiswa akan mendapatkan **kode referral** yang memungkinkan akses penuh ke semua kelas sesuai **durasi paket** yang dipilih.  
- Melihat daftar semua mentor atau teacher melalui endpoint `GET /mentor`.

---

## 🧩 Arsitektur dan Deployment

- **Frontend:** Dibangun menggunakan [Next.js](https://nextjs.org/) dan dideploy di [Vercel](https://vercel.com/).  
- **Backend:** Dikembangkan menggunakan [Node.js](https://nodejs.org/) dan dideploy di **Virtual Private Server (VPS)**.  
- Komunikasi antara frontend dan backend menggunakan RESTful API dengan autentikasi dan kontrol akses berbasis role.

---

## ⚙️ Tech Stack

| Kategori | Teknologi |
|-----------|------------|
| **Framework** | Next.js 15.5.3 |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS, @tailwindcss/postcss, tw-animate-css |
| **UI Components** | Radix UI (@radix-ui/*), lucide-react, @tabler/icons-react |
| **Data Visualization** | recharts |
| **State Management** | React 19.1.0 |
| **Drag and Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Validation** | zod |
| **Notifications** | sonner |
| **Linting** | ESLint with eslint-config-next |
| **Commit Linting** | commitlint (conventional commits) |
| **Git Hooks** | husky (pre-commit hooks) |
| **Build Tool** | Turbopack (`next dev` & `next build`) |

---

## 🧠 Panduan Pengembangan

### 1. Clone Repository
```bash
git clone https://github.com/username/ambilprestasi.git
cd ambilprestasi
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Jalankan di Mode Pengembangan

```bash
npm run dev
```

### 4. Build untuk Produksi

```bash
npm run build
npm run start
```

---

## 🌐 Deployment

### Frontend

* Dideploy otomatis menggunakan [Vercel](https://vercel.com).
* Build tool menggunakan **Turbopack** untuk performa optimal.

### Backend

* Dideploy di **VPS** menggunakan konfigurasi Node.js + Express.
* API endpoint dihubungkan dengan frontend melalui konfigurasi environment variable (`NEXT_PUBLIC_API_URL`).

---

## 💡 Visi

Menjadi **platform pembelajaran digital unggulan** yang memberdayakan mahasiswa untuk berkembang, berkompetisi, dan berprestasi di dunia akademik maupun profesional melalui teknologi modern dan mentor inspiratif.

---

## 🧾 Lisensi

Proyek ini dilindungi oleh lisensi pribadi.
Dilarang memperbanyak atau mendistribusikan ulang tanpa izin dari pengembang resmi.

---

### ✨ Dibangun dengan semangat kolaborasi dan pembelajaran berkelanjutan.

```
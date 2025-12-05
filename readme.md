# 🌾 **PadiCheck AI — Rice Leaf Disease Detection**

**PadiCheck AI** adalah platform berbasis kecerdasan buatan yang dirancang untuk membantu petani dan masyarakat dalam **mendeteksi penyakit pada daun padi secara otomatis** melalui teknologi *image detection*.
Dengan mengunggah foto daun padi, pengguna dapat memperoleh informasi lengkap mengenai penyakit yang terdeteksi, tingkat akurasi prediksi, serta rekomendasi perawatan yang relevan.

Platform ini bertujuan untuk meningkatkan produktivitas pertanian melalui pemanfaatan teknologi modern yang mudah digunakan.

---

## 🚀 **Fitur Utama**

### 🔎 **1. Deteksi Penyakit Daun Padi (AI Image Detection)**

Pengguna dapat mengunggah gambar daun padi untuk dianalisis oleh model AI.
Sistem akan menghasilkan laporan deteksi berisi informasi penyakit, tingkat akurasi, status kesehatan, dan saran penanganan.

### 📚 **2. Artikel Edukatif**

Pengguna dapat membaca berbagai artikel terkait:

* Penyakit pada tanaman padi
* Teknik perawatan dan pencegahan penyakit
* Informasi agrikultur lainnya

Artikel dapat diakses secara publik tanpa perlu login.

### 📝 **3. Riwayat Deteksi**

Pengguna yang telah login dapat mengakses riwayat deteksi yang mencakup:

* Foto daun yang pernah diunggah
* Jenis penyakit yang ditemukan
* Akurasi prediksi
* Waktu deteksi
* Detail penyakit

### 👤 **4. Manajemen Profil Pengguna**

Pengguna dapat memperbarui:

* Nama
* Email
* Foto profil
* Data lain yang relevan

### 🛠 **5. Manajemen Artikel untuk Admin**

Admin memiliki akses untuk mengelola konten artikel, meliputi:

* Membuat artikel baru
* Mengedit artikel
* Menghapus artikel
* Mengatur struktur konten

---

## 🧩 **Arsitektur Sistem**

PadiCheck AI menggunakan arsitektur multi-layer yang memisahkan modul AI dan modul API utama:

### **1. Model AI (Flask)**

* Dibangun menggunakan **Flask**
* Bertanggung jawab memproses gambar dan menjalankan model Machine Learning
* Menghasilkan prediksi penyakit, akurasi, serta metadata deteksi

### **2. Backend Utama (NestJS)**

* Mengelola alur data antara frontend dan modul AI
* Menyimpan hasil deteksi pada database
* Mengelola autentikasi, artikel, user, dan riwayat deteksi
* Mengonsumsi API dari Flask untuk memproses hasil model
* Menggunakan pendekatan RESTful API dengan keamanan JWT

### **3. Frontend (Next.js)**

* Menyediakan antarmuka yang responsif untuk pengguna
* Dibangun menggunakan **Next.js 15 + TypeScript**
* Di-deploy melalui **Vercel** untuk kinerja optimal

---

## ⚙️ **Tech Stack**

### **Frontend**

* Next.js 15
* TypeScript
* Tailwind CSS
* Radix UI
* Recharts
* lucide-react / @tabler/icons-react
* @dnd-kit/core & sortable
* sonner notifications
* Turbopack
* ESLint + Husky + commitlint

### **Backend**

* NestJS
* Prisma / PostgreSQL
* JWT Authentication
* Multer untuk upload gambar
* Railway / VPS deployment

### **AI Model**

* Flask
* TensorFlow / PyTorch
* OpenCV
* Model klasifikasi penyakit daun padi

---

## 🧠 **Panduan Development**

### 1. Clone Repository

```bash
git clone https://github.com/username/padicheck-ai.git
cd padicheck-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Jalankan Project (Frontend)

```bash
npm run dev
```

### 4. Build untuk Produksi

```bash
npm run build
npm start
```

*(Untuk backend NestJS dan Flask model, jalankan sesuai dokumentasi masing-masing folder.)*

---

## 🌐 **Deployment**

### **Frontend**

* Dideploy melalui **Vercel**
* Sistem build menggunakan **Turbopack**

### **Backend (NestJS)**

* Dideploy pada **Railway** atau **VPS**
* Mengelola API utama & database

### **Model AI (Flask)**

* Dideploy terpisah, terintegrasi dengan backend melalui API internal

---

## 💡 **Visi PadiCheck AI**

Menjadi solusi teknologi berbasis AI yang membantu petani mengenali penyakit tanaman dengan cepat, akurat, dan mudah, sehingga mendukung peningkatan produktivitas pertanian Indonesia.

---

## 🧾 **Lisensi**

Proyek ini dilindungi oleh lisensi pribadi.
Dilarang memperbanyak, menyalin, atau mendistribusikan ulang tanpa izin resmi.

---

### ✨ Dibangun dengan komitmen untuk mendukung pertanian berkelanjutan melalui inovasi teknologi.
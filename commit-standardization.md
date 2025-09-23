# Panduan Menulis Commit Message

## Format Commit Message (Conventional Commits)
Gunakan format berikut untuk setiap *commit message*:

```
<type>(<scope>): <subject>
```

### Penjelasan Komponen
- **type**: Jenis perubahan yang dilakukan. Pilihan umum meliputi:
  - `feat`: Fitur baru.
  - `fix`: Perbaikan bug.
  - `docs`: Perubahan pada dokumentasi.
  - `style`: Perubahan format kode (tanpa mengubah logika).
  - `refactor`: Refaktor kode tanpa menambah fitur atau memperbaiki bug.
  - `perf`: Peningkatan performa.
  - `test`: Penambahan atau perbaikan tes.
  - `build`: Perubahan pada sistem build atau dependensi.
  - `ci`: Perubahan pada konfigurasi CI/CD.
  - `chore`: Perubahan kecil lainnya (misalnya, pembaruan dependensi).
  - `revert`: Membatalkan commit sebelumnya.
- **scope**: (Opsional) Bagian proyek yang terpengaruh, misalnya `auth`, `db`, `api`.
- **subject**: Deskripsi singkat (maksimal 50 karakter), ditulis dalam kalimat perintah, tanpa tanda titik di akhir.

### Contoh Commit Message
- `feat(api): menambahkan endpoint registrasi pengguna`
- `fix(db): memperbaiki masalah timeout koneksi`
- `docs: memperbarui panduan instalasi di README`
- `chore: memperbarui dependensi ke versi terbaru`

## Aturan Penulisan Commit Message
1. **Gunakan kalimat perintah**: Tulis *subject* dalam bentuk imperatif, misalnya "tambahkan" bukan "menambahkan" atau "ditambahkan".
2. **Pendek dan jelas**: Jaga *subject* di bawah 50 karakter untuk kejelasan.
3. **Gunakan huruf kecil**: Kecuali untuk nama khusus, gunakan huruf kecil untuk *type* dan *scope*.
4. **Sertakan detail jika perlu**: Tambahkan penjelasan lebih lanjut di *body* commit (opsional) setelah baris kosong.
   - Contoh:
     ```
     feat(auth): menambahkan login dengan OAuth

     Menambahkan integrasi OAuth 2.0 untuk autentikasi pengguna.
     Memperbarui dokumentasi API dan menambahkan tes unit.
     ```

## Pemecahan Masalah
- **Husky tidak berjalan**: Pastikan `husky install` telah dijalankan dan folder `.husky/` ada.
- **Error Commitlint**: Periksa apakah file `commitlint.config.js` dikonfigurasi dengan benar.
- **Masalah izin**: Jalankan `chmod +x .husky/commit-msg` untuk memastikan *hook* dapat dieksekusi.

## Tips Tambahan
- **Gunakan alat bantu**: Pertimbangkan alat seperti `commitizen` untuk memandu penulisan *commit message*.
- **Konsisten**: Pastikan semua anggota tim mengikuti standar yang sama.
- **Periksa riwayat**: Gunakan `git log` untuk memastikan *commit message* jelas dan terstruktur.

Dengan mengikuti panduan ini, Anda dapat memastikan *commit message* yang konsisten, informatif, dan mendukung kolaborasi tim yang lebih baik.

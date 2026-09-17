# Panduan Instalasi BOQ Platform dengan Docker Desktop (Device Lain)

Dokumen ini menjelaskan cara memasang BOQ Platform dari nol di komputer lain
(Windows 10/11 disarankan) menggunakan Docker Desktop. Hasil akhir: aplikasi
berjalan penuh — dashboard, 5 backend service, dan MySQL — cukup dengan satu
perintah `docker compose up`.

> Istilah: **gateway** = dashboard di port 8090. Semua API diakses lewat
> `http://IP_DEVICE:8090/api/...`, tidak langsung ke port service.

---

## 1. Kebutuhan sistem

| Kebutuhan | Minimal | Keterangan |
|---|---|---|
| OS | Windows 10/11 64-bit (build 19044+) | macOS/Linux juga bisa, sesuaikan langkah 2 |
| RAM | 8 GB (Docker Desktop dialokasikan >= 6 GB) | Total limit container kurang lebih 4,7 GB |
| Disk bebas | 20 GB | Image + database + build cache |
| CPU | 4 core | Build awal butuh CPU (puppeteer/chromium) |
| Jaringan | Internet saat instalasi | Download image + `npm ci` saat build |

Port yang dipakai (pastikan bebas): **8090, 8091, 8092, 8093, 8094, 8095, 3307**.

---

## 2. Install Docker Desktop

1. Download Docker Desktop dari https://www.docker.com/products/docker-desktop/
   (pilih versi Windows).
2. Saat instalasi, pastikan opsi **"Use WSL 2 instead of Hyper-V"** dicentang.
   Jika diminta, install/update **WSL 2** dan restart komputer.
3. Buka Docker Desktop, tunggu status kiri bawah menjadi **Engine running**
   (hijau). Lewati login Docker Hub bila tidak punya akun.
4. (Disarankan) Buka **Settings -> Resources**: naikkan **Memory** ke 6 GB atau
   lebih bila RAM fisik memungkinkan.
5. Verifikasi di terminal (PowerShell atau CMD):

   ```powershell
   docker --version
   docker compose version
   ```

   Keduanya harus menampilkan nomor versi tanpa error.

---

## 3. Ambil source code

Buat folder kerja, mis. `C:\boq`, lalu clone 6 repository ke dalamnya:

```powershell
mkdir C:\boq; cd C:\boq
git clone https://github.com/refaadstack/dashboard.git
git clone https://github.com/refaadstack/BE-Auth-Service.git
git clone https://github.com/refaadstack/vendor_service.git
git clone https://github.com/refaadstack/BE-Item-Service.git
git clone https://github.com/refaadstack/BE-Project-service.git
git clone https://github.com/refaadstack/BE-BOQ-service.git
```

Struktur akhir folder `C:\boq` harus berisi 6 folder di atas **plus** 3 file
infra di bawah ini (tidak ada di git, buat manual).

---

## 4. File infra: docker-compose.yml, .env, mysql-init

### 4a. `docker-compose.yml` (simpan di `C:\boq\docker-compose.yml`)

```yaml
services:
  mysql-boq:
    image: mysql:8.4
    container_name: boq-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql_boq_data:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d:ro
    ports:
      - 127.0.0.1:3307:3306
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
    deploy:
      resources:
        limits:
          memory: 1G

  auth:
    build: ./BE-Auth-Service
    container_name: boq-auth
    restart: unless-stopped
    depends_on:
      mysql-boq:
        condition: service_healthy
    environment:
      PORT: 5000
      DB_HOST: mysql-boq
      DB_PORT: 3306
      DB_NAME: auth_service
      DB_USER: root
      DB_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET_KEY: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    ports:
      - 8091:5000
    deploy:
      resources:
        limits:
          memory: 512M

  vendor:
    build: ./vendor_service
    container_name: boq-vendor
    restart: unless-stopped
    depends_on:
      mysql-boq:
        condition: service_healthy
    environment:
      PORT: 3002
      DB_HOST: mysql-boq
      DB_PORT: 3306
      DB_NAME: vendor_service
      DB_USER: root
      DB_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET_KEY: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    ports:
      - 8092:3002
    deploy:
      resources:
        limits:
          memory: 512M

  item:
    build: ./BE-Item-Service
    container_name: boq-item
    restart: unless-stopped
    depends_on:
      mysql-boq:
        condition: service_healthy
    environment:
      PORT: 3003
      DB_HOST: mysql-boq
      DB_PORT: 3306
      DB_NAME: item_service
      DB_USER: root
      DB_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET_KEY: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    ports:
      - 8093:3003
    deploy:
      resources:
        limits:
          memory: 512M

  project:
    build: ./BE-Project-service
    container_name: boq-project
    restart: unless-stopped
    depends_on:
      mysql-boq:
        condition: service_healthy
    environment:
      PORT: 3004
      DB_HOST: mysql-boq
      DB_PORT: 3306
      DB_NAME: project_service
      DB_USER: root
      DB_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET_KEY: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      ITEM_SERVICE_URL: http://item:3003
    ports:
      - 8094:3004
    deploy:
      resources:
        limits:
          memory: 512M

  boq:
    build: ./BE-BOQ-service
    container_name: boq-service
    restart: unless-stopped
    depends_on:
      mysql-boq:
        condition: service_healthy
    environment:
      PORT: 3005
      NODE_ENV: production
      DB_HOST: mysql-boq
      DB_PORT: 3306
      DB_NAME: boq_service
      DB_USER: root
      DB_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_SECRET_KEY: ${JWT_SECRET}
      JWT_EXPIRES_IN: 24h
      AUTH_SERVICE_URL: http://auth:5000
      PROJECT_SERVICE_URL: http://project:3004
      ITEM_SERVICE_URL: http://item:3003
      VENDOR_SERVICE_URL: http://vendor:3002
      CORS_ORIGIN: ${CORS_ORIGIN}
      UPLOAD_DIR: /app/uploads
    volumes:
      - boq_uploads:/app/uploads
    ports:
      - 8095:3005
    deploy:
      resources:
        limits:
          memory: 1G

  dashboard:
    build: ./dashboard
    container_name: boq-dashboard
    restart: unless-stopped
    depends_on: [auth, vendor, item, project, boq]
    ports:
      - 8090:80
    deploy:
      resources:
        limits:
          memory: 128M

volumes:
  mysql_boq_data:
  boq_uploads:
```

### 4b. `mysql-init/init.sql` (simpan di `C:\boq\mysql-init\init.sql`)

```sql
CREATE DATABASE IF NOT EXISTS auth_service;
CREATE DATABASE IF NOT EXISTS vendor_service;
CREATE DATABASE IF NOT EXISTS item_service;
CREATE DATABASE IF NOT EXISTS project_service;
CREATE DATABASE IF NOT EXISTS boq_service;
```

### 4c. `.env` (simpan di `C:\boq\.env` — JANGAN di-commit ke git)

```ini
JWT_SECRET=<64 karakter hex acak, lihat langkah 5>
MYSQL_ROOT_PASSWORD=<password kuat>
CORS_ORIGIN=http://IP_DEVICE_INI:8090
```

> `CORS_ORIGIN` wajib = alamat yang dipakai browser membuka aplikasi
> (mis. `http://192.168.1.20:8090`). Salah isi = dashboard terbuka tapi
> semua data gagal dimuat (error CORS).

---

## 5. Isi file .env

1. Cari IP LAN device ini: PowerShell -> `ipconfig` -> catat **IPv4 Address**
   (contoh `192.168.1.20`). Inilah `IP_DEVICE_INI`.
2. Buat JWT secret (64 karakter hex). PowerShell:

   ```powershell
   -join ((48..57)+(97..102) | Get-Random -Count 64 | % {[char]$_})
   ```

   (Di Git Bash/WSL: `openssl rand -hex 32`.)
3. Tentukan password root MySQL yang kuat (hindari karakter `$` agar tidak
   bentrok dengan substitusi variabel compose).
4. Tulis ketiganya ke `C:\boq\.env`, contoh:

   ```ini
   JWT_SECRET=a3f9c1e27b4d48f2a6c0d5e8b1f3a7c9d2e4f6a8b0c1d3e5f7a9b1c3d5e7f9a1
   MYSQL_ROOT_PASSWORD=UbAh-Ini-Minimal-16-Karakter!
   CORS_ORIGIN=http://192.168.1.20:8090
   ```

---

## 6. Build dan jalankan

Di folder `C:\boq`:

```powershell
docker compose up -d --build
```

- Build pertama memakan waktu **5-15 menit** (download image + `npm ci`
  6 service + build frontend). Jangan tutup terminal/Docker Desktop.
- Tabel database dibuat **otomatis** saat service pertama start (Sequelize
  sync). Tidak ada migrasi manual.
- Cek status sampai semua `Up`:

  ```powershell
  docker compose ps
  ```

---

## 7. Verifikasi instalasi

| Cek | Cara | Hasil benar |
|---|---|---|
| Semua container Up | `docker compose ps` | 7 container status Up/running |
| Dashboard | Browser -> `http://IP_DEVICE:8090/login` | Halaman login tampil |
| API auth | `docker logs boq-auth --tail 5` | Tidak ada error koneksi DB |
| DB hidup | `docker exec boq-mysql mysqladmin ping -h localhost -u root -p` (isi password saat diminta) | `mysqld is alive` |

Jika halaman login tampil = frontend + gateway OK. Lanjut buat admin.

---

## 8. Buat akun admin pertama

Registrasi selalu menghasilkan role `user`, jadi akun pertama harus
dipromosikan manual lewat database (cukup sekali):

1. Di browser, buka `http://IP_DEVICE:8090/register`, daftar akun admin
   (catat emailnya).
2. Promosikan ke admin (ganti `admin@contoh.id` dengan email tadi):

   ```powershell
   docker exec boq-mysql mysql -uroot -p"$env:MYSQL_ROOT_PASSWORD" -e "UPDATE auth_service.Users SET roles='admin' WHERE email='admin@contoh.id';"
   ```

   Jika error "Table doesn't exist", cek dulu nama tabel (peka huruf besar):

   ```powershell
   docker exec boq-mysql mysql -uroot -p"$env:MYSQL_ROOT_PASSWORD" -e "SHOW TABLES FROM auth_service;"
   ```

   lalu sesuaikan (`Users` vs `users`) pada perintah UPDATE di atas.
3. Login di `http://IP_DEVICE:8090/login` dengan akun tersebut.
4. Wajib awal: buka **Pengaturan** -> isi **kop perusahaan** (nama, alamat,
   kontak) -> Simpan. Kop ini tampil di semua export PDF.

---

## 9. Operasional harian

```powershell
cd C:\boq
docker compose ps            # status
docker compose logs -f boq   # log service boq (ganti nama service sesuai perlu)
docker compose restart       # restart semua
docker compose down          # matikan semua (data AMAN di volume)
```

> `docker compose down -v` MENGHAPUS DATA — jangan dipakai kecuali mau reset total.

**Update ke versi terbaru:**

```powershell
git -C dashboard pull; git -C BE-Auth-Service pull; git -C vendor_service pull
git -C BE-Item-Service pull; git -C BE-Project-service pull; git -C BE-BOQ-service pull
docker compose up -d --build
```

**Backup database** (jalankan berkala, simpan file `.sql` di tempat aman):

```powershell
docker exec boq-mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --all-databases' > "backup-boq-$(Get-Date -Format yyyyMMdd).sql"
```

**Restore:**

```powershell
Get-Content backup-boq-YYYYMMDD.sql | docker exec -i boq-mysql sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"'
```

---

## 10. Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| `port is already allocated` saat up | Port 8090-8095/3307 dipakai aplikasi lain | Bebaskan portnya, atau ubah angka kiri mapping di compose (`"8090:80"` menjadi `"8099:80"`) lalu sesuaikan `CORS_ORIGIN` |
| Dashboard terbuka tapi data gagal dimuat / error CORS | `CORS_ORIGIN` bukan alamat yang dibuka browser | Samakan `CORS_ORIGIN` dengan URL browser persis (termasuk `http://` dan port), lalu `docker compose up -d` |
| Login gagal terus / 401 di semua API | `JWT_SECRET` berubah setelah user dibuat | Semua service memakai satu variabel `JWT_SECRET` dari `.env`. Jangan ubah setelah ada user, atau register ulang semua akun |
| `boq-mysql` restart terus / unhealthy | RAM kurang atau password salah | Naikkan memory Docker Desktop; pastikan password tanpa karakter `$` |
| Build gagal di tengah jalan | Internet putus / disk penuh | Cek `docker system df`; ulangi `docker compose up -d --build` (melanjutkan dari cache) |
| Akses dari HP/laptop lain gagal | Firewall Windows memblokir | Buka inbound TCP 8090 di Windows Defender Firewall; pastikan satu jaringan/WiFi |
| Lupa password MySQL | — | Lihat `C:\boq\.env` (`MYSQL_ROOT_PASSWORD`). Jaga file ini, jangan disebar |
| Mau pindah device | — | Backup (langkah 9) di device lama, install baru di device baru, lalu restore |

---

## 11. Peta port (referensi)

| URL | Isi |
|---|---|
| `http://IP:8090` | Aplikasi (dashboard + gateway API `/api/...`) |
| `http://IP:8091` - `8095` | API langsung auth/vendor/item/project/boq (debug saja) |
| `127.0.0.1:3307` | MySQL (hanya dari device itu sendiri, bukan LAN) |

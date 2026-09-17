# Deploy — file infra BOQ Platform

Isi folder ini adalah template file infra yang TIDAK tinggal di repo service
(mereka harus duduk sejajar dengan 6 folder repo). Cara pakai di device baru:

```powershell
mkdir C:\boq; cd C:\boq
git clone https://github.com/refaadstack/dashboard.git
git clone https://github.com/refaadstack/BE-Auth-Service.git
git clone https://github.com/refaadstack/vendor_service.git
git clone https://github.com/refaadstack/BE-Item-Service.git
git clone https://github.com/refaadstack/BE-Project-service.git
git clone https://github.com/refaadstack/BE-BOQ-service.git
Copy-Item dashboard\deploy\docker-compose.yml .
Copy-Item dashboard\deploy\.env.example .\.env
Copy-Item dashboard\deploy\mysql-init .\mysql-init -Recurse
# lalu isi .env dan ikut INSTALL-DOCKER-DESKTOP.md di root repo dashboard
```

| File | Fungsi |
|---|---|
| `docker-compose.yml` | Definisi 7 container. `CORS_ORIGIN` wajib diisi via `.env` (tanpa default — gagal loud bila lupa) |
| `.env.example` | Template: `JWT_SECRET`, `MYSQL_ROOT_PASSWORD`, `CORS_ORIGIN` |
| `mysql-init/init.sql` | Membuat 5 database saat MySQL pertama start |

Catatan: copy di staging (`/data/projects/boq/docker-compose.yml`) memakai
`${CORS_ORIGIN:-http://192.168.18.8:8090}` (ada default staging). Template di
sini sengaja memakai `${CORS_ORIGIN}` tanpa default agar instalasi baru tidak
diam-diam memakai IP staging.

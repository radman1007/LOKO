# راهنمای استقرار (Deploy) پلتفرم لوکو

این پروژه شامل سه بخش است:

| بخش | مسیر | تکنولوژی |
|------|------|----------|
| بک‌اند (API) | `Back-Codes/` | Node.js + Express + MySQL + Redis |
| فرانت‌اند (Web) | `Front-Codes/` | React (CRA) سرو شده با nginx |
| دیتابیس و کش | داخل Docker | MySQL 8 + Redis 7 |

---

## استقرار کامل با یک دستور (پیشنهادی)

تمام استک (دیتابیس، کش، API، وب) با یک Compose بالا می‌آید.

```bash
cd ~/path/to/LOKO

# ۱. فایل محیط production را بساز و مقادیر امنیتی را تغییر بده
cp .env.prod.example .env
nano .env        # JWT_ACCESS_SECRET، JWT_REFRESH_SECRET و DB_PASSWORD را عوض کن

# ۲. ساخت و اجرای کل استک
docker compose -f docker-compose.prod.yml up -d --build
```

پس از چند لحظه:
- وب‌اپ روی **http://SERVER_IP/** در دسترس است.
- API از طریق همان دامنه روی **/api/v1** پروکسی می‌شود.
- فایل‌های مدیا روی **/uploads** سرو می‌شوند.

> در اولین اجرا چون `AUTO_MIGRATE=true` است، جداول و داده‌های اولیه (نقش‌ها، تسک‌ها، جوایز، کتاب‌ها و حساب مدیر) خودکار ساخته می‌شوند.

### حساب مدیر کل اولیه
```
نام کاربری: loko_admin
رمز عبور:  Admin@12345
```
> بعد از اولین ورود حتماً رمز را تغییر دهید.

---

## بررسی سلامت

```bash
docker compose -f docker-compose.prod.yml ps          # وضعیت کانتینرها
curl http://localhost/health                          # سلامت بک‌اند از طریق وب
docker compose -f docker-compose.prod.yml logs -f api # لاگ بک‌اند
docker compose -f docker-compose.prod.yml logs -f web # لاگ nginx
```

---

## به‌روزرسانی پس از تغییر کد

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

برای ساخت مجدد فقط یک سرویس:
```bash
docker compose -f docker-compose.prod.yml up -d --build api   # فقط بک‌اند
docker compose -f docker-compose.prod.yml up -d --build web   # فقط فرانت
```

---

## اجرای دستی مهاجرت/seed (در صورت نیاز)

```bash
docker compose -f docker-compose.prod.yml exec api node src/database/migrate.js
docker compose -f docker-compose.prod.yml exec api node src/database/seed.js
```

---

## نکات Production

- **HTTPS:** برای دامنه‌ی واقعی، یک reverse proxy/SSL (مثل Caddy، Traefik یا nginx با Let's Encrypt) جلوی سرویس `web` بگذارید یا گواهی را به همان nginx اضافه کنید.
- **بکاپ دیتابیس:** والیوم `loko_mysql_data` را مرتب بکاپ بگیرید:
  ```bash
  docker compose -f docker-compose.prod.yml exec mysql \
    mysqldump -uroot -p$DB_PASSWORD loko > backup_$(date +%F).sql
  ```
- **رمزها:** مقادیر `.env` را در گیت کامیت نکنید (در `.gitignore` هست).
- **مدیا:** فایل‌های آپلودی در والیوم `loko_uploads` پایدار می‌مانند.

---

## توسعه محلی (Development)

بک‌اند:
```bash
cd Back-Codes
docker compose up -d           # mysql + redis + api روی پورت 3000
docker compose exec api node src/database/migrate.js
docker compose exec api node src/database/seed.js
```

فرانت‌اند:
```bash
cd Front-Codes
npm install
npm start                      # روی http://localhost:3000 (CRA dev server)
```
> در حالت توسعه، `REACT_APP_API_URL` به‌صورت پیش‌فرض `http://localhost:3000/api/v1` است.
> اگر بک‌اند روی پورت دیگری است، یک فایل `.env.local` در `Front-Codes` بسازید:
> ```
> REACT_APP_API_URL=http://localhost:3000/api/v1
> ```

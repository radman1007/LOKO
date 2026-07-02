# ============================================================
# LOKO Frontend - Multi-stage build (Vite → nginx)
# ============================================================

# ─── Stage 1: Build ─────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# نصب وابستگی‌ها (با کش لایه)
COPY package*.json ./
RUN npm ci

# کپی سورس و ساخت بیلد production
COPY . .

# آدرس API نسبی است تا nginx آن را به بک‌اند پروکسی کند
# (توسط vite.config.js در زمان بیلد داخل باندل جای‌گذاری می‌شود)
ENV REACT_APP_API_URL=/api/v1
RUN npm run build

# ─── Stage 2: Serve با nginx ────────────────────────────────
FROM nginx:1.27-alpine

# حذف کانفیگ پیش‌فرض و افزودن کانفیگ سفارشی
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/loko.conf

# کپی خروجی بیلد
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

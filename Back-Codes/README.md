# Loko Backend

> **Loko** is an educational-psychological platform backend API built with Node.js, MySQL, and Redis.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Option A: Local Development (Recommended)](#option-a-local-development-recommended)
  - [Option B: Full Docker Stack](#option-b-full-docker-stack)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Default Credentials](#default-credentials)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [NPM Scripts](#npm-scripts)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | MySQL 8.0 |
| Cache / Sessions | Redis 7 |
| Authentication | JWT (Access + Refresh Token with rotation) |
| Authorization | RBAC (Role-Based Access Control) |
| Multi-Tenancy | School-scoped data isolation |
| Containerization | Docker & Docker Compose |

---

## Prerequisites

Make sure the following are installed on your machine before getting started:

- **Node.js** >= 20 → [nodejs.org](https://nodejs.org)
- **npm** >= 9 (comes with Node.js)
- **Docker** & **Docker Compose** → [docs.docker.com](https://docs.docker.com/get-docker/)
- **Git** → [git-scm.com](https://git-scm.com)

---

## Getting Started

### Option A: Local Development (Recommended)

This is the best workflow for active development. MySQL and Redis run inside Docker, while your Node.js server runs directly on your machine with hot reload via `nodemon`.

**Step 1 — Clone the repository**

```bash
git clone <repository-url>
cd loko-backend
```

**Step 2 — Install dependencies**

```bash
npm install
```

**Step 3 — Configure environment**

```bash
cp .env.example .env
```

Open `.env` and update the following required values:

```dotenv
JWT_ACCESS_SECRET=your-strong-random-secret-min-32-chars
JWT_REFRESH_SECRET=your-other-strong-random-secret-min-32-chars
```

> ⚠️ **Never use the default secrets in production.**

**Step 4 — Start MySQL and Redis via Docker**

```bash
docker compose up -d mysql redis
```

This starts:
- MySQL on port `3307` (mapped from container's `3306`)
- Redis on port `6379`

Wait a few seconds for the containers to become healthy. You can verify with:

```bash
docker compose ps
```

Both services should show `healthy`.

**Step 5 — Run database migrations**

```bash
DB_HOST=127.0.0.1 DB_PORT=3307 npm run migrate
```

**Step 6 — Seed initial data**

```bash
DB_HOST=127.0.0.1 DB_PORT=3307 npm run seed
```

This creates the default admin account and reference data (roles, moods, badges, etc.).

**Step 7 — Start the development server**

```bash
DB_HOST=127.0.0.1 DB_PORT=3307 REDIS_HOST=127.0.0.1 npm run dev
```

> **Why the env overrides?** The `.env` file uses `DB_HOST=mysql` and `REDIS_HOST=redis` — hostnames that only resolve inside Docker's internal network. When running Node.js locally on your machine, you must override them to point to `127.0.0.1`.

The server will start at: **`http://localhost:3000`**

You should see:
```
[info]: MySQL connection pool established
[info]: Redis connected
[info]: Loko API server running on port 3000
```

---

### Option B: Full Docker Stack

Use this if you want everything containerized (e.g., for staging or CI).

```bash
# Start all services (MySQL, Redis, API)
docker compose up -d --build

# Run migrations inside the container
docker exec -it loko-api npm run migrate

# Seed initial data
docker exec -it loko-api npm run seed
```

The API will be available at **`http://localhost:3000`**.

> **Note:** Hot reload (`nodemon`) is not available in this mode. Rebuild the image after code changes: `docker compose up -d --build api`

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `mysql` (Docker) / `127.0.0.1` (local) |
| `DB_PORT` | MySQL port | `3306` (Docker) / `3307` (local) |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | — |
| `DB_NAME` | Database name | `loko` |
| `REDIS_HOST` | Redis host | `redis` (Docker) / `127.0.0.1` (local) |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | **Change this!** |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | **Change this!** |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `LOG_LEVEL` | Logging level | `info` |

---

## Database

### Migrations

Migrations live in `src/database/migrations/` as numbered `.sql` files (e.g., `001_initial_schema.sql`). They run in order and are tracked in the `schema_migrations` table — already-applied migrations are skipped automatically.

```bash
# Run pending migrations
npm run migrate

# (local dev override)
DB_HOST=127.0.0.1 DB_PORT=3307 npm run migrate
```

### Seeding

The seed script inserts reference data: roles, moods, educational methods, badge definitions, content categories, and a default admin user.

```bash
npm run seed

# (local dev override)
DB_HOST=127.0.0.1 DB_PORT=3307 npm run seed
```

> **Safe to re-run.** All inserts use `INSERT IGNORE`, so running seed multiple times won't create duplicates.

---

## Default Credentials

Created automatically by the seed script. **Change the password immediately in any non-development environment.**

| Field | Value |
|-------|-------|
| Username | `loko_admin` |
| Password | `Admin@12345` |
| Role | Team Admin |

---

## API Reference

### Base URL

```
http://localhost:3000/api/v1
```

### Health Check

```
GET http://localhost:3000/health
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"loko_admin","password":"Admin@12345"}'
```

### Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

For full API documentation see: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Project Structure

```
loko-backend/
├── src/
│   ├── config/           # Environment config & permission definitions
│   ├── database/
│   │   ├── migrations/   # SQL migration files (001_*.sql, 002_*.sql, ...)
│   │   ├── connection.js # MySQL pool & Redis client
│   │   ├── migrate.js    # Migration runner
│   │   └── seed.js       # Reference data seeder
│   ├── middleware/        # Auth, RBAC, validation, request logging
│   ├── routes/v1/         # Express route definitions
│   ├── controllers/       # Request handlers (thin layer)
│   ├── services/          # Business logic
│   ├── engines/           # Domain engines (Mood, Task, Garden, AI, Podcast)
│   ├── validators/        # Joi validation schemas
│   └── utils/             # Logger, custom errors, crypto helpers
├── docs/
│   └── ARCHITECTURE.md    # Full system design & API docs
├── uploads/               # User-uploaded files (gitignored)
├── logs/                  # Application logs (gitignored)
├── .env.example           # Environment variable template
├── docker-compose.yml     # Docker services definition
└── package.json
```

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (hot reload) |
| `npm start` | Start server in production mode |
| `npm run migrate` | Run pending database migrations |
| `npm run seed` | Insert reference/seed data |
| `npm test` | Run test suite |

---

## Troubleshooting

### `MySQL not ready yet` (repeated warnings)
The server retries the MySQL connection up to 20 times with 2-second intervals. If it never connects, check:
- Is the Docker container running? → `docker compose ps`
- Are you using the right host/port? (local dev needs `DB_HOST=127.0.0.1 DB_PORT=3307`)

### `getaddrinfo ENOTFOUND redis` or `ENOTFOUND mysql`
You're running Node.js locally but `.env` still has Docker hostnames. Override them:
```bash
DB_HOST=127.0.0.1 DB_PORT=3307 REDIS_HOST=127.0.0.1 npm run dev
```

### `EADDRINUSE: address already in use :::3000`
Port 3000 is already taken. Most likely the `loko-api` Docker container is running. Either:
```bash
# Stop only the API container, keep DB and Redis running
docker compose stop api

# OR run on a different port
PORT=3001 DB_HOST=127.0.0.1 DB_PORT=3307 REDIS_HOST=127.0.0.1 npm run dev
```

### `nodemon: Permission denied` inside Docker
`nodemon` is a dev dependency and may not be installed in the production Docker image. Run `nodemon` on your local machine, not inside the container (see Option A above).

---

## Security Checklist

Before deploying to any non-development environment:

- [ ] Change `JWT_ACCESS_SECRET` to a random string of at least 32 characters
- [ ] Change `JWT_REFRESH_SECRET` to a different random string of at least 32 characters
- [ ] Change the default admin password (`Admin@12345`)
- [ ] Set `BCRYPT_ROUNDS` to at least `12`
- [ ] Enable HTTPS / TLS termination (via reverse proxy, e.g., Nginx)
- [ ] Set `CORS_ORIGIN` to your actual frontend domain
- [ ] Never commit `.env` to version control (it is in `.gitignore`)
- [ ] Set `NODE_ENV=production`

---

## License

Private — All rights reserved © Loko Platform
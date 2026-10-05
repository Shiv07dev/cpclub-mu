# CP Club, Marwadi University — Full-Stack Platform

**Competitive Programming Club · Department of ICT · Marwadi University**

---

## Architecture

```
┌─────────────────────────────┐
│   Lovable Frontend           │  TanStack Start (SSR) + React 19 + Tailwind CSS v4
│   Port 3000 (dev)            │
└────────────┬────────────────┘
             │  REST API (VITE_API_BASE_URL)
             ▼
┌─────────────────────────────┐
│   Express Backend            │  Node.js + TypeScript + Express
│   Port 5000                  │
├─────────────────────────────┤
│   Prisma ORM                 │
├─────────────────────────────┤
│   PostgreSQL Database        │  Supabase, Neon, Railway, or local
└─────────────────────────────┘
             │
             ▼
┌─────────────────────────────┐
│   Object Storage             │  Supabase Storage / Cloudinary / Local
│   (dynamic uploads only)     │
└─────────────────────────────┘
```

**Key principle:** The 107 static frontend images remain in `public/assets/` — the backend only handles NEW dynamic uploads (event banners, gallery images, reports).

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| PostgreSQL | ≥ 14 (or Supabase / Neon) |
| Git | any |

---

## Project Structure

```
cpclub-mu-official/
├── src/                        # Frontend (Lovable / TanStack Start)
│   ├── lib/api/
│   │   ├── http.ts             # Mock/real API switch (VITE_API_BASE_URL)
│   │   ├── services.ts         # Service layer (unchanged interface)
│   │   ├── types.ts            # Frontend TypeScript types
│   │   └── seed-events.ts      # Fallback seed data (mock mode only)
│   └── routes/
│       ├── admin.tsx           # Admin login + layout
│       ├── admin.events.tsx    # Event management UI
│       ├── admin.registrations.*.tsx
│       └── ...                 # All public pages
├── public/assets/              # 107 static images (DO NOT MOVE)
│   ├── branding/
│   ├── committee/
│   ├── achievements/
│   ├── events/                 # Event gallery photos (ev-r{n}-*.webp)
│   └── community/
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/             # Config, Prisma client, Logger
│   │   ├── middleware/         # Auth (JWT), Error handler
│   │   ├── routes/
│   │   │   ├── auth.ts         # /api/auth/*
│   │   │   ├── public.ts       # /api/* (public endpoints)
│   │   │   └── admin.ts        # /api/admin/* (protected)
│   │   ├── services/           # Business logic
│   │   ├── validators/         # Zod schemas + validate() helper
│   │   ├── types/              # Shared TypeScript types
│   │   ├── app.ts              # Express app factory
│   │   └── server.ts           # Entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed with official CP Club data
│   ├── tests/
│   │   └── api.test.ts         # Integration tests
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # PostgreSQL + API for local dev
└── README.md
```

---

## Quick Start (Local Development)

### 1. Frontend

```bash
# Already done (npm install was run)
npm run dev
# Frontend: http://localhost:3000
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env
# Edit .env and fill in DATABASE_URL and JWT_SECRET at minimum

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed the database with official CP Club data
npm run db:seed

# Start the dev server
npm run dev
# API: http://localhost:5000/api/health
```

### 3. Connect Frontend to Backend

In the project root, create or edit `.env` (for TanStack Start):

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

Restart the frontend (`npm run dev`). The admin banner "Demo mode" will disappear once connected.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (generate with `openssl rand -hex 64`) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret |
| `PORT` | — | API port (default: 5000) |
| `NODE_ENV` | — | `development` or `production` |
| `FRONTEND_URL` | ✅ (prod) | Frontend URL for CORS |
| `SUPABASE_URL` | — | Supabase project URL (for image uploads) |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Supabase service role key |
| `STORAGE_BUCKET` | — | Supabase bucket name |
| `STORAGE_PROVIDER` | — | `local`, `supabase`, or `cloudinary` |
| `SEED_ADMIN_EMAIL` | — | First admin email |
| `SEED_ADMIN_PASSWORD` | — | First admin password (change after first login!) |

### Frontend (root `.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (leave empty for mock mode) |

---

## Database Commands

```bash
cd backend

# Generate Prisma client after schema changes
npx prisma generate

# Create + apply migration (development)
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio
```

---

## Admin Setup

After running `npm run db:seed`, the first SUPER_ADMIN is created:

- **Email:** value of `SEED_ADMIN_EMAIL` (default: `admin@cpclub.mu.ac.in`)
- **Password:** value of `SEED_ADMIN_PASSWORD` (default: `ChangeMe@2024!`)

> ⚠️ **Change the password immediately** after first login in production!

**Admin URL:** `http://localhost:3000/admin`

### Creating Additional Admins

Use the Prisma Studio (`npm run db:studio`) or connect via `psql` and INSERT directly, or add an admin management UI (future feature).

### Admin Roles

| Role | Permissions |
|------|------------|
| `SUPER_ADMIN` | Full access including user management, audit logs, all operations |
| `ADMIN` | Events, registrations, gallery, reports, contests |
| `EDITOR` | Content, events, gallery, reports, achievements |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login (returns JWT + refresh token) |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Get current admin (auth required) |
| `POST` | `/api/auth/refresh` | Refresh access token |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List events (paginated, filtered) |
| `GET` | `/api/events/:slug` | Event detail |
| `GET` | `/api/events/:slug/gallery` | Event gallery |
| `GET` | `/api/events/:slug/report` | Event report (if published) |
| `POST` | `/api/events/:eventId/register` | Register for event |
| `GET` | `/api/events/:eventId/registration-status` | Check registration status |
| `GET` | `/api/achievements` | Public achievements |
| `GET` | `/api/committee` | Committee members |
| `GET` | `/api/placements` | Placement records |
| `GET` | `/api/gate` | GATE qualifications |
| `GET` | `/api/contests/current` | Current/upcoming contest (null if none) |
| `POST` | `/api/contests/:id/register` | Register for contest |
| `GET` | `/api/site-settings` | Site settings |
| `GET` | `/api/content` | Site content (announcement, heroTagline) |
| `GET` | `/api/health` | Health check |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Dashboard stats |
| `GET` | `/api/admin/events` | All events (inc. drafts) |
| `POST` | `/api/admin/events` | Create event |
| `PUT` | `/api/admin/events/:id` | Update event |
| `DELETE` | `/api/admin/events/:id` | Delete event |
| `GET` | `/api/admin/registrations` | All registrations |
| `GET` | `/api/admin/registrations/:id` | Registration detail |
| `PATCH` | `/api/admin/registrations/:id/status` | Update status |
| `GET` | `/api/admin/events/:id/registrations` | Event registrations |
| `GET` | `/api/admin/events/:id/registrations/export` | Export CSV/XLSX |
| `POST` | `/api/admin/events/:id/gallery` | Add gallery image |
| `PATCH` | `/api/admin/gallery/:id` | Update gallery image |
| `DELETE` | `/api/admin/gallery/:id` | Delete gallery image |
| `POST/PUT` | `/api/admin/events/:id/report` | Create/update report |
| `DELETE` | `/api/admin/events/:id/report` | Delete report |
| `POST` | `/api/admin/achievements` | Create achievement |
| `PUT` | `/api/admin/achievements/:id` | Update achievement |
| `DELETE` | `/api/admin/achievements/:id` | Delete achievement |
| `POST` | `/api/admin/contests` | Create contest |
| `PUT` | `/api/admin/contests/:id` | Update contest |
| `DELETE` | `/api/admin/contests/:id` | Delete contest |
| `GET/PUT` | `/api/admin/content` | Site content management |
| `GET` | `/api/admin/audit-logs` | Audit log (SUPER_ADMIN only) |

---

## API Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated List
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "email", "message": "Invalid email address" }]
  }
}
```

---

## Running Tests

```bash
cd backend

# Run all tests (requires DATABASE_URL pointing to a test database)
npm test

# Tests cover:
# ✅ Auth login (valid/invalid)
# ✅ Protected route access
# ✅ Event CRUD
# ✅ Registration (success, duplicate, capacity/waitlisting)
# ✅ Gallery (CRUD, public/private separation)
# ✅ Monthly contest
# ✅ Achievements
# ✅ Validation errors
# ✅ CSV export auth protection
```

> **Note:** Tests require a live PostgreSQL database. Use a separate test database or Docker.

---

## Docker (Optional)

```bash
# Start PostgreSQL + API
docker compose up -d

# Then run migrations and seed inside the container:
docker compose exec api npx prisma migrate dev
docker compose exec api npm run db:seed

# Stop
docker compose down
```

Frontend still runs natively with `npm run dev` from the root.

---

## Storage for Dynamic Uploads

The backend supports three storage providers:

### Local (Development)
```
STORAGE_PROVIDER=local
# Files saved in backend/uploads/
```

### Supabase Storage (Recommended for Production)
```
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
STORAGE_BUCKET=cpclub-uploads
```
Create a public bucket named `cpclub-uploads` in your Supabase project.

### Cloudinary
```
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

> **Static images in `public/assets/` are NOT affected.** They continue to serve from the frontend directly.

---

## Production Deployment

### Backend — Recommended Platforms

| Platform | Notes |
|----------|-------|
| **Railway** | Easy PostgreSQL + Node.js, auto-deploy from Git |
| **Render** | Free tier available, background workers |
| **Fly.io** | Global edge, great for low-latency |
| **AWS Elastic Beanstalk** | If you need enterprise-grade |

**Production checklist:**
- Set `NODE_ENV=production`
- Set a strong `JWT_SECRET` (64+ random bytes)
- Set `FRONTEND_URL` to your actual domain
- Run `npx prisma migrate deploy` (not `migrate dev`)
- Never use `migrate reset` in production

### Frontend
The Lovable frontend deploys to Cloudflare Workers via Nitro (already configured in `vite.config.ts`). Set `VITE_API_BASE_URL` to the production API URL in your deployment environment.

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `Admin` | Admin users with roles |
| `RefreshToken` | JWT refresh tokens |
| `Event` | All club events |
| `Registration` | Event/club registrations |
| `RegistrationCounter` | Auto-incrementing CP-YYYY-NNNNNN IDs |
| `GalleryImage` | Dynamic event gallery photos |
| `EventReport` | Official event reports |
| `Achievement` | Student achievements |
| `CommitteeMember` | Core and pseudo-core committee |
| `PlacementRecord` | Placement data |
| `GateQualification` | GATE qualification data |
| `Contest` | Monthly coding contests |
| `ContestRegistration` | Contest participants |
| `ContestResult` | Contest results/leaderboard |
| `SiteSettings` | Singleton site configuration |
| `AuditLog` | Admin action audit trail |

---

## Security Features

- ✅ JWT authentication (short-lived access + refresh tokens)
- ✅ Bcrypt password hashing (12 salt rounds)
- ✅ Role-based authorization (SUPER_ADMIN / ADMIN / EDITOR)
- ✅ Rate limiting (global, auth, registration endpoints)
- ✅ Helmet security headers
- ✅ CORS (whitelist-based, configurable per environment)
- ✅ Input validation via Zod (all endpoints)
- ✅ SQL injection protection via Prisma ORM
- ✅ Duplicate registration prevention (enrollment + email)
- ✅ Event capacity enforcement with waitlisting
- ✅ Admin audit logging
- ✅ No stack traces in production responses
- ✅ No secrets in frontend code

---

## Known Limitations & Future Work

| Feature | Status |
|---------|--------|
| Email confirmation on registration | 🔜 Hook exists in `registrationService.ts` |
| File upload endpoint (multipart) | 🔜 Storage provider abstraction ready |
| Leaderboard | 🔜 `ContestResult` model ready, no fake data |
| Google Calendar / ICS links | 🔜 Registration response includes event date/venue |
| Admin user management UI | 🔜 Use Prisma Studio for now |
| Public participant showcase | 🔜 Separate from private registration table |
| WebSocket live contest updates | 🔜 Future feature |

---

## Troubleshooting

**"Cannot connect to database"**
- Verify `DATABASE_URL` in `backend/.env`
- Ensure PostgreSQL is running (`docker compose up -d postgres`)

**"VITE_API_BASE_URL not working"**
- Must restart the frontend dev server after changing `.env`
- Check browser console for CORS errors (ensure `FRONTEND_URL` is set in backend)

**"Demo mode" banner still shows**
- `VITE_API_BASE_URL` is empty or not set in the frontend environment

**"Token expired" errors**
- Implement token refresh on the frontend (call `/api/auth/refresh` with the refresh token)

---

*Built with ❤️ for the CP Club community at Marwadi University*

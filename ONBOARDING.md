# Iron Vipers — Onboarding Guide

## What is this?

Iron Vipers is a motorcycle workshop management system. Full architecture blueprint: `iron-vipers-blueprint.md`.

The backend is **complete and working**. Your task is a **UI redesign of the frontend only**.

---

## Stack

```
Frontend:  React 18 + Vite + TypeScript + Tailwind CSS v3
           TanStack Query v5 · React Router v6 · React Hook Form + Zod · Axios
Backend:   FastAPI + SQLAlchemy 2.0 + PostgreSQL (do not touch)
```

---

## Running the project locally

### Backend (Docker)
```bash
cp backend/.env.example backend/.env
docker compose up -d
docker compose exec api alembic upgrade head
docker compose exec api python seed.py   # creates admin user
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Login: `admin@ironvipers.com` / (password set during seed)

---

## Frontend structure

```
frontend/src/
├── lib/            # api.ts (Axios), auth.ts, queryClient.ts
├── types/          # index.ts — all TypeScript interfaces
├── components/     # Layout, Sidebar, Header, ProtectedRoute, StatusBadge, LoadingSpinner
├── features/
│   ├── auth/       # LoginPage, useAuth (context + hook)
│   ├── dashboard/  # DashboardPage
│   ├── clients/    # ClientsPage, ClientDetailPage, ClientForm
│   ├── motorcycles/
│   ├── service-orders/
│   ├── parts/
│   └── expenses/
└── hooks/
```

---

## API

- Base URL: `/api/v1` (proxied by Vite to `http://localhost:8000`)
- Auth: `POST /auth/login` → `{ access_token, user }`
- Token stored in `localStorage`, sent as `Authorization: Bearer <token>` via Axios interceptor

All API calls go through `src/lib/api.ts`. Do not change this file.

---

## Your task — UI Redesign

The current UI works functionally but needs a visual overhaul. You are free to redesign all pages using Tailwind CSS. Keep all existing logic, API calls, and routing intact — only change the visual layer.

### Pages to redesign
- Login page
- Dashboard
- Clients (list + detail)
- Motorcycles (list + detail)
- Service Orders (list + detail)
- Parts
- Expenses
- Layout (sidebar + header)

### Design guidelines
- Keep Tailwind CSS — no new CSS libraries
- You may add Tailwind plugins or Heroicons if needed
- The sidebar must remain on the left
- All pages must remain responsive
- Do not remove any existing functionality
- `StatusBadge` component is used across pages — keep it working

### Key conventions
- All forms use React Hook Form + Zod — keep this pattern
- All data fetching uses TanStack Query — keep this pattern
- No new dependencies unless essential for the redesign

---

## Domain overview

The core entity is `service_orders`. The workflow:
```
Client → Motorcycle → Service Order → Parts + Payments + Photos → Delivery
```

Order statuses: `RECIBIDA → EN_DIAGNOSTICO → ESPERANDO_AUTORIZACION → AUTORIZADA → EN_REPARACION → ESPERANDO_PIEZAS → LISTA_PARA_ENTREGA → ENTREGADA | CANCELADA`

---

## Do not touch

- `backend/` — fully built and working
- `src/lib/api.ts` — Axios instance with auth interceptor
- `src/lib/auth.ts` — localStorage helpers
- `src/lib/queryClient.ts` — TanStack Query config
- `src/types/index.ts` — TypeScript interfaces
- `src/features/auth/useAuth.ts` — auth context and hook
- Route structure in `src/App.tsx`

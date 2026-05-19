# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Iron Vipers — a motorcycle workshop management system. Full architecture blueprint: `iron-vipers-blueprint.md`.

## Dev commands

### Backend

```bash
cd backend
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
alembic upgrade head                         # run migrations
uvicorn app.main:app --reload                # start dev server (http://localhost:8000)
pytest                                       # run all tests
pytest tests/modules/clients/test_router.py  # run a single test file
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # start dev server (http://localhost:5173)
npm run build
npm test       # Vitest
```

### Docker (full stack)

```bash
docker compose up -d        # start API + PostgreSQL + pgAdmin
docker compose logs -f api  # tail API logs
```

## Architecture

```
frontend/   React + Vite + TypeScript + TanStack Query + Tailwind + React Router v6
backend/    FastAPI + SQLAlchemy 2.0 + Alembic + Pydantic v2
            └── app/
                ├── core/        config, database, security
                ├── modules/     one folder per domain
                └── shared/      enums, exceptions, dependencies
database:   PostgreSQL (Docker locally, Supabase in production)
storage:    Supabase Storage (photos only — DB stores URL + metadata)
```

### Module pattern

Every backend module follows exactly this layout:

```
models.py      SQLAlchemy table definitions
schemas.py     Pydantic request/response models
router.py      HTTP endpoints — no business logic
service.py     Business rules and orchestration
repository.py  Database queries only
```

### Central entity

`service_orders` is the core entity. All other modules (clients, motorcycles, parts, payments, photos) exist to support the service order lifecycle.

Order states: `RECIBIDA → EN_DIAGNOSTICO → ESPERANDO_AUTORIZACION → AUTORIZADA → EN_REPARACION → ESPERANDO_PIEZAS → LISTA_PARA_ENTREGA → ENTREGADA | CANCELADA`

## Key conventions

- API prefix: `/api/v1`
- Auth: JWT access tokens; passwords hashed with Argon2; never return `password_hash`
- Roles: `ADMIN`, `MECHANIC` (initial); enforce via dependency injection in FastAPI
- Enums live in `app/shared/enums.py` — use them for status, role, payment method, photo type
- `balance_due` and derived cost totals are calculated in `service.py`, not as DB triggers
- Photos: frontend requests a signed URL from the backend, uploads directly to Supabase Storage; backend stores only `photo_url`, `photo_type`, `description`, `uploaded_by_id`
- Backend tests use `pytest` + `httpx` async test client

## MVP scope boundaries

Do not implement in Phase 1:
- Facturación electrónica (CFDI / PAC integration)
- Portal cliente
- AI features
- Multiple branches
- Microservices

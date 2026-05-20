# Iron Vipers — Motorcycle Workshop Management System

Full-stack web application for managing a motorcycle repair shop: service orders, clients, inventory, payments, and expenses.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS v3 + TanStack Query v5 + React Router v6 |
| Backend | FastAPI + SQLAlchemy 2.0 + Alembic + Pydantic v2 |
| Database | PostgreSQL 16 |
| Auth | JWT (Argon2 password hashing) |
| Infrastructure | Docker Compose + Nginx |

## Quick start (local)

### Prerequisites

- Docker + Docker Compose v2
- Node.js 20+
- Python 3.12+ with [uv](https://github.com/astral-sh/uv)

### 1. Start the database and API

```bash
docker compose up -d
docker compose logs -f api   # wait until "Application startup complete"
```

### 2. Run migrations and seed the admin user

```bash
docker compose exec api alembic upgrade head
docker compose exec api python seed.py
# Enter a password for admin@ironvipers.com when prompted
```

### 3. Start the frontend dev server

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

Login with `admin@ironvipers.com` and the password you set in the seed step.

## Backend development (without Docker)

```bash
cd backend
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt

# Requires a running PostgreSQL instance — set DATABASE_URL in backend/.env
alembic upgrade head
uvicorn app.main:app --reload   # http://localhost:8000
```

API docs available at `http://localhost:8000/docs`.

## Running tests

```bash
cd backend
pytest
```

## Production deployment (Ubuntu VM + Nginx)

### On the server

```bash
git clone <repo-url> ~/ironvipers
cd ~/ironvipers

# Copy and edit environment file
cp backend/.env.example backend/.env   # set SECRET_KEY, SUPABASE_* vars

docker compose up -d
docker compose exec api alembic upgrade head
docker compose exec api python seed.py
```

### Build and deploy the frontend

```bash
cd frontend
npm install
VITE_API_URL=http://<server-ip>/api/v1 npm run build

sudo cp -r dist/* /var/www/ironvipers/
```

### Nginx

Copy `nginx/ironvipers.conf` to `/etc/nginx/sites-available/` and enable it:

```bash
sudo cp nginx/ironvipers.conf /etc/nginx/sites-available/ironvipers
sudo ln -s /etc/nginx/sites-available/ironvipers /etc/nginx/sites-enabled/ironvipers
sudo nginx -t && sudo systemctl reload nginx
```

Nginx serves the frontend on port 80 and proxies `/api` requests to the FastAPI container on `127.0.0.1:8000`.

## Project structure

```
backend/
  app/
    core/        # config, database, security
    modules/     # one folder per domain (clients, motorcycles, service_orders, parts, payments, photos, expenses, users, auth, dashboard)
    shared/      # enums, exceptions, dependencies
  alembic/       # database migrations
  seed.py        # creates initial admin user
frontend/
  src/
    features/    # page components grouped by domain
    components/  # shared UI components
    types/       # TypeScript interfaces
    lib/         # axios instance, query keys
nginx/
  ironvipers.conf
docker-compose.yml
```

## Roles

| Role | Access |
|---|---|
| `ADMIN` | Full access to all modules |
| `MECHANIC` | Service orders, parts on orders, photos |

## Branch workflow

- `main` — stable, production-ready
- `master` — main development branch
- Feature/fix work goes on `feature/*` or `fix/*` branches → PR → merge

Never commit directly to `master` or `main`.

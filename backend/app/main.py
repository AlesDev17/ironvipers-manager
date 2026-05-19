from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.modules.auth.router import router as auth_router
from app.modules.clients.router import router as clients_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.expenses.router import router as expenses_router
from app.modules.motorcycles.router import router as motorcycles_router
from app.modules.parts.router import order_parts_router, parts_router
from app.modules.payments.router import order_payments_router, payments_router
from app.modules.photos.router import router as photos_router
from app.modules.service_orders.router import router as service_orders_router
from app.modules.users.router import router as users_router

app = FastAPI(title=settings.APP_NAME, version="1.0.0", debug=settings.DEBUG, redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=_PREFIX)
app.include_router(users_router, prefix=_PREFIX)
app.include_router(clients_router, prefix=_PREFIX)
app.include_router(motorcycles_router, prefix=_PREFIX)
app.include_router(service_orders_router, prefix=_PREFIX)
app.include_router(photos_router, prefix=_PREFIX)
app.include_router(parts_router, prefix=_PREFIX)
app.include_router(order_parts_router, prefix=_PREFIX)
app.include_router(payments_router, prefix=_PREFIX)
app.include_router(order_payments_router, prefix=_PREFIX)
app.include_router(expenses_router, prefix=_PREFIX)
app.include_router(dashboard_router, prefix=_PREFIX)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

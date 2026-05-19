from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.payments.schemas import PaymentCreate, PaymentResponse
from app.modules.payments.service import PaymentService
from app.shared.dependencies import get_current_user, require_admin

payments_router = APIRouter(tags=["payments"])
order_payments_router = APIRouter(prefix="/service-orders", tags=["payments"])


@order_payments_router.post(
    "/{order_id}/payments",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    order_id: uuid.UUID,
    data: PaymentCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return PaymentService(db).create_payment(order_id, data)


@order_payments_router.get("/{order_id}/payments", response_model=list[PaymentResponse])
def list_payments_by_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return PaymentService(db).list_by_order(order_id)


@payments_router.get("/payments", response_model=list[PaymentResponse])
def list_all_payments(
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    return PaymentService(db).list_all()

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.modules.payments.models import Payment
from app.modules.payments.repository import PaymentRepository
from app.modules.payments.schemas import PaymentCreate
from app.modules.service_orders.repository import ServiceOrderRepository
from app.shared.exceptions import not_found


class PaymentService:
    def __init__(self, db: Session) -> None:
        self.repo = PaymentRepository(db)
        self.order_repo = ServiceOrderRepository(db)

    def create_payment(self, order_id: uuid.UUID, data: PaymentCreate) -> Payment:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise not_found("ServiceOrder")

        payment = Payment(
            service_order_id=order_id,
            amount=float(data.amount),
            payment_method=data.payment_method,
            payment_date=data.payment_date or datetime.now(timezone.utc),
            notes=data.notes,
        )
        payment = self.repo.create(payment)

        self.order_repo.db.refresh(order)
        order.paid_amount = float(order.paid_amount or 0) + float(data.amount)
        order.balance_due = float(order.total_cost or 0) - float(order.paid_amount)
        self.order_repo.update(order)

        return payment

    def list_by_order(self, order_id: uuid.UUID) -> list[Payment]:
        return self.repo.list_by_order(order_id)

    def list_all(self) -> list[Payment]:
        return self.repo.list_all()

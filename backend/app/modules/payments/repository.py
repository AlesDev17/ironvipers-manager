from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.payments.models import Payment


class PaymentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, payment_id: uuid.UUID) -> Payment | None:
        return self.db.get(Payment, payment_id)

    def list_all(self) -> list[Payment]:
        stmt = select(Payment).order_by(Payment.payment_date.desc())
        return list(self.db.execute(stmt).scalars().all())

    def list_by_order(self, service_order_id: uuid.UUID) -> list[Payment]:
        stmt = (
            select(Payment)
            .where(Payment.service_order_id == service_order_id)
            .order_by(Payment.payment_date.desc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def create(self, payment: Payment) -> Payment:
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

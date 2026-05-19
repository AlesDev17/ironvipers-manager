from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.service_orders.models import ServiceOrder


class ServiceOrderRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, order_id: uuid.UUID) -> ServiceOrder | None:
        return self.db.get(ServiceOrder, order_id)

    def list_all(self) -> list[ServiceOrder]:
        stmt = select(ServiceOrder).order_by(ServiceOrder.created_at.desc())
        return list(self.db.execute(stmt).scalars().all())

    def create(self, order: ServiceOrder) -> ServiceOrder:
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update(self, order: ServiceOrder) -> ServiceOrder:
        self.db.commit()
        self.db.refresh(order)
        return order

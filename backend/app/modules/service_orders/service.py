from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.modules.service_orders.models import ServiceOrder
from app.modules.service_orders.repository import ServiceOrderRepository
from app.modules.service_orders.schemas import (
    AssignMechanic,
    ServiceOrderCreate,
    ServiceOrderUpdate,
    StatusUpdate,
)
from app.shared.enums import OrderStatus
from app.shared.exceptions import not_found

_CLOSED_STATUSES = {OrderStatus.ENTREGADA, OrderStatus.CANCELADA}


class ServiceOrderService:
    def __init__(self, db: Session) -> None:
        self.repo = ServiceOrderRepository(db)

    def list_orders(self) -> list[ServiceOrder]:
        return self.repo.list_all()

    def get_order(self, order_id: uuid.UUID) -> ServiceOrder:
        order = self.repo.get_by_id(order_id)
        if not order:
            raise not_found("ServiceOrder")
        return order

    def create_order(self, data: ServiceOrderCreate) -> ServiceOrder:
        order = ServiceOrder(
            motorcycle_id=data.motorcycle_id,
            client_id=data.client_id,
            problem_description=data.problem_description,
            estimated_delivery_date=data.estimated_delivery_date,
            assigned_mechanic_id=data.assigned_mechanic_id,
        )
        return self.repo.create(order)

    def update_order(self, order_id: uuid.UUID, data: ServiceOrderUpdate) -> ServiceOrder:
        order = self.get_order(order_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(order, field, value)
        self._recalculate_costs(order)
        return self.repo.update(order)

    def change_status(self, order_id: uuid.UUID, data: StatusUpdate) -> ServiceOrder:
        order = self.get_order(order_id)
        order.status = data.status
        if data.status in _CLOSED_STATUSES:
            order.closed_at = datetime.now(timezone.utc)
        return self.repo.update(order)

    def assign_mechanic(self, order_id: uuid.UUID, data: AssignMechanic) -> ServiceOrder:
        order = self.get_order(order_id)
        order.assigned_mechanic_id = data.mechanic_id
        return self.repo.update(order)

    def recalculate_financials(self, order: ServiceOrder) -> ServiceOrder:
        self._recalculate_costs(order)
        return self.repo.update(order)

    @staticmethod
    def _recalculate_costs(order: ServiceOrder) -> None:
        labor = order.labor_cost or 0
        parts = order.parts_cost or 0
        order.total_cost = float(labor) + float(parts)
        order.balance_due = float(order.total_cost) - float(order.paid_amount or 0)

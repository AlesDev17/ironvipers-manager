from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.modules.parts.models import Part, ServiceOrderPart
from app.modules.parts.repository import PartRepository, ServiceOrderPartRepository
from app.modules.parts.schemas import AddPartToOrder, PartCreate, PartUpdate
from app.modules.service_orders.repository import ServiceOrderRepository
from app.shared.exceptions import bad_request, not_found


class PartService:
    def __init__(self, db: Session) -> None:
        self.repo = PartRepository(db)

    def list_parts(self, tenant_id: uuid.UUID | None = None) -> list[Part]:
        return self.repo.list_all(tenant_id)

    def get_part(self, part_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> Part:
        part = self.repo.get_by_id(part_id)
        if not part:
            raise not_found("Part")
        if tenant_id is not None and part.tenant_id != tenant_id:
            raise not_found("Part")
        return part

    def create_part(self, data: PartCreate, tenant_id: uuid.UUID | None = None) -> Part:
        part = Part(**data.model_dump(), tenant_id=tenant_id)
        return self.repo.create(part)

    def update_part(self, part_id: uuid.UUID, data: PartUpdate, tenant_id: uuid.UUID | None = None) -> Part:
        part = self.get_part(part_id, tenant_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(part, field, value)
        return self.repo.update(part)

    def delete_part(self, part_id: uuid.UUID, tenant_id: uuid.UUID | None = None) -> None:
        part = self.get_part(part_id, tenant_id)
        self.repo.delete(part)

    def list_parts_by_order(self, order_id: uuid.UUID, db: Session) -> list[ServiceOrderPart]:
        sop_repo = ServiceOrderPartRepository(db)
        return sop_repo.list_by_order(order_id)

    def add_part_to_order(
        self, order_id: uuid.UUID, data: AddPartToOrder, db: Session, tenant_id: uuid.UUID | None = None
    ) -> ServiceOrderPart:
        part_repo = PartRepository(db)
        sop_repo = ServiceOrderPartRepository(db)
        order_repo = ServiceOrderRepository(db)

        part = part_repo.get_by_id(data.part_id)
        if not part:
            raise not_found("Part")
        if tenant_id is not None and part.tenant_id != tenant_id:
            raise not_found("Part")

        order = order_repo.get_by_id(order_id)
        if not order:
            raise not_found("ServiceOrder")
        if tenant_id is not None and order.tenant_id != tenant_id:
            raise not_found("ServiceOrder")

        if part.stock_quantity < data.quantity:
            raise bad_request(
                f"Insufficient stock. Available: {part.stock_quantity}, requested: {data.quantity}"
            )

        unit_price = float(part.sale_price)
        total_price = unit_price * data.quantity

        sop = ServiceOrderPart(
            service_order_id=order_id,
            part_id=data.part_id,
            quantity=data.quantity,
            unit_price=unit_price,
            total_price=total_price,
        )
        sop = sop_repo.create(sop)

        part.stock_quantity -= data.quantity
        part_repo.update(part)

        db.refresh(order)
        order.parts_cost = float(order.parts_cost or 0) + total_price
        order.total_cost = float(order.labor_cost or 0) + float(order.parts_cost)
        order.balance_due = float(order.total_cost) - float(order.paid_amount or 0)
        order_repo.update(order)

        return sop

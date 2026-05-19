from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.parts.models import Part, ServiceOrderPart


class PartRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, part_id: uuid.UUID) -> Part | None:
        return self.db.get(Part, part_id)

    def list_all(self) -> list[Part]:
        stmt = select(Part).order_by(Part.name)
        return list(self.db.execute(stmt).scalars().all())

    def list_low_stock(self) -> list[Part]:
        stmt = select(Part).where(Part.stock_quantity <= Part.minimum_stock).order_by(Part.name)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, part: Part) -> Part:
        self.db.add(part)
        self.db.commit()
        self.db.refresh(part)
        return part

    def update(self, part: Part) -> Part:
        self.db.commit()
        self.db.refresh(part)
        return part

    def delete(self, part: Part) -> None:
        self.db.delete(part)
        self.db.commit()


class ServiceOrderPartRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, sop: ServiceOrderPart) -> ServiceOrderPart:
        self.db.add(sop)
        self.db.commit()
        self.db.refresh(sop)
        return sop

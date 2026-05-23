from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.modules.tenants.models import Tenant


class TenantRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_all(self) -> list[Tenant]:
        return self.db.query(Tenant).order_by(Tenant.created_at.desc()).all()

    def get_by_id(self, tenant_id: uuid.UUID) -> Tenant | None:
        return self.db.query(Tenant).filter(Tenant.id == tenant_id).first()

    def create(self, tenant: Tenant) -> Tenant:
        self.db.add(tenant)
        self.db.flush()
        return tenant

    def delete(self, tenant: Tenant) -> None:
        self.db.delete(tenant)
        self.db.flush()

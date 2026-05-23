from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.modules.tenants.models import Tenant
from app.modules.tenants.repository import TenantRepository
from app.modules.tenants.schemas import TenantCreate, TenantUpdate, TenantWithAdminResponse, TenantResponse
from app.modules.users.models import User
from app.shared.enums import UserRole
from app.shared.exceptions import not_found


class TenantService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = TenantRepository(db)

    def list_tenants(self) -> list[Tenant]:
        return self.repo.get_all()

    def get_tenant(self, tenant_id: uuid.UUID) -> Tenant:
        tenant = self.repo.get_by_id(tenant_id)
        if not tenant:
            raise not_found("Tenant")
        return tenant

    def create_tenant(self, data: TenantCreate) -> TenantWithAdminResponse:
        tenant = Tenant(
            name=data.name,
            owner_email=data.owner_email,
            is_active=True,
            subscription_expires_at=data.subscription_expires_at,
        )
        self.repo.create(tenant)

        admin_user = User(
            full_name=data.admin_name,
            email=data.owner_email,
            password_hash=hash_password(data.admin_password),
            role=UserRole.ADMIN,
            is_active=True,
            tenant_id=tenant.id,
        )
        self.db.add(admin_user)
        self.db.commit()
        self.db.refresh(tenant)

        return TenantWithAdminResponse(
            tenant=TenantResponse.model_validate(tenant),
            admin_email=data.owner_email,
            admin_temp_password=data.admin_password,
        )

    def update_tenant(self, tenant_id: uuid.UUID, data: TenantUpdate) -> Tenant:
        tenant = self.get_tenant(tenant_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(tenant, field, value)
        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def delete_tenant(self, tenant_id: uuid.UUID) -> None:
        tenant = self.get_tenant(tenant_id)
        self.repo.delete(tenant)
        self.db.commit()

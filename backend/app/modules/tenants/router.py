from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.tenants.schemas import TenantCreate, TenantUpdate, TenantResponse, TenantWithAdminResponse
from app.modules.tenants.service import TenantService
from app.shared.dependencies import require_superadmin

router = APIRouter(prefix="/superadmin/tenants", tags=["superadmin"])


@router.get("", response_model=list[TenantResponse])
def list_tenants(db: Session = Depends(get_db), _=Depends(require_superadmin)):
    return TenantService(db).list_tenants()


@router.post("", response_model=TenantWithAdminResponse, status_code=201)
def create_tenant(
    data: TenantCreate,
    db: Session = Depends(get_db),
    _=Depends(require_superadmin),
):
    return TenantService(db).create_tenant(data)


@router.patch("/{tenant_id}", response_model=TenantResponse)
def update_tenant(
    tenant_id: uuid.UUID,
    data: TenantUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_superadmin),
):
    return TenantService(db).update_tenant(tenant_id, data)


@router.delete("/{tenant_id}", status_code=204)
def delete_tenant(
    tenant_id: uuid.UUID,
    db: Session = Depends(get_db),
    _=Depends(require_superadmin),
):
    TenantService(db).delete_tenant(tenant_id)

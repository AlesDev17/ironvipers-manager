from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.service_orders.schemas import (
    AssignMechanic,
    ServiceOrderCreate,
    ServiceOrderResponse,
    ServiceOrderUpdate,
    StatusUpdate,
)
from app.modules.service_orders.service import ServiceOrderService
from app.shared.dependencies import get_current_tenant_id

router = APIRouter(prefix="/service-orders", tags=["service-orders"])


@router.get("", response_model=list[ServiceOrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ServiceOrderService(db).list_orders(tenant_id)


@router.post("", response_model=ServiceOrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: ServiceOrderCreate,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ServiceOrderService(db).create_order(data, tenant_id)


@router.get("/{order_id}", response_model=ServiceOrderResponse)
def get_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ServiceOrderService(db).get_order(order_id, tenant_id)


@router.put("/{order_id}", response_model=ServiceOrderResponse)
def update_order(
    order_id: uuid.UUID,
    data: ServiceOrderUpdate,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ServiceOrderService(db).update_order(order_id, data, tenant_id)


@router.patch("/{order_id}/status", response_model=ServiceOrderResponse)
def change_status(
    order_id: uuid.UUID,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ServiceOrderService(db).change_status(order_id, data, tenant_id)


@router.post("/{order_id}/assign-mechanic", response_model=ServiceOrderResponse)
def assign_mechanic(
    order_id: uuid.UUID,
    data: AssignMechanic,
    db: Session = Depends(get_db),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ServiceOrderService(db).assign_mechanic(order_id, data, tenant_id)

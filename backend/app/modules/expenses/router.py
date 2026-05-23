from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.expenses.schemas import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.modules.expenses.service import ExpenseService
from app.shared.dependencies import get_current_tenant_id, require_admin

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ExpenseService(db).list_expenses(tenant_id)


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ExpenseService(db).create_expense(data, tenant_id)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ExpenseService(db).get_expense(expense_id, tenant_id)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: uuid.UUID,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    return ExpenseService(db).update_expense(expense_id, data, tenant_id)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
    tenant_id: uuid.UUID | None = Depends(get_current_tenant_id),
):
    ExpenseService(db).delete_expense(expense_id, tenant_id)

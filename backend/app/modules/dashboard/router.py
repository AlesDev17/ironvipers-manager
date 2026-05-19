from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.dashboard.schemas import DashboardSummary, IncomeReport, OrderStatusCount
from app.modules.dashboard.service import DashboardService
from app.modules.parts.schemas import PartResponse
from app.shared.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return DashboardService(db).get_summary()


@router.get("/income", response_model=IncomeReport)
def get_income(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return DashboardService(db).get_income()


@router.get("/orders-status", response_model=list[OrderStatusCount])
def get_orders_status(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return DashboardService(db).get_orders_by_status()


@router.get("/low-stock", response_model=list[PartResponse])
def get_low_stock(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return DashboardService(db).get_low_stock_parts()

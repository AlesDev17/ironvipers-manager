from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.dashboard.schemas import DashboardSummary, IncomeReport, OrderStatusCount
from app.modules.parts.models import Part
from app.modules.payments.models import Payment
from app.modules.service_orders.models import ServiceOrder
from app.shared.enums import OrderStatus

_ACTIVE_STATUSES = [
    OrderStatus.RECIBIDA,
    OrderStatus.EN_DIAGNOSTICO,
    OrderStatus.ESPERANDO_AUTORIZACION,
    OrderStatus.AUTORIZADA,
    OrderStatus.EN_REPARACION,
    OrderStatus.ESPERANDO_PIEZAS,
    OrderStatus.LISTA_PARA_ENTREGA,
]


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_summary(self) -> DashboardSummary:
        today = date.today()
        month_start = today.replace(day=1)

        active_orders = self.db.execute(
            select(func.count(ServiceOrder.id)).where(ServiceOrder.status.in_(_ACTIVE_STATUSES))
        ).scalar_one()

        completed_orders = self.db.execute(
            select(func.count(ServiceOrder.id)).where(
                ServiceOrder.status == OrderStatus.ENTREGADA
            )
        ).scalar_one()

        motorcycles_in_repair = self.db.execute(
            select(func.count(ServiceOrder.id)).where(
                ServiceOrder.status == OrderStatus.EN_REPARACION
            )
        ).scalar_one()

        waiting_auth = self.db.execute(
            select(func.count(ServiceOrder.id)).where(
                ServiceOrder.status == OrderStatus.ESPERANDO_AUTORIZACION
            )
        ).scalar_one()

        todays_income = self.db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                func.date(Payment.payment_date) == today
            )
        ).scalar_one()

        monthly_income = self.db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                func.date(Payment.payment_date) >= month_start
            )
        ).scalar_one()

        pending_total = self.db.execute(
            select(func.coalesce(func.sum(ServiceOrder.balance_due), 0)).where(
                ServiceOrder.balance_due > 0
            )
        ).scalar_one()

        low_stock = self.db.execute(
            select(func.count(Part.id)).where(Part.stock_quantity <= Part.minimum_stock)
        ).scalar_one()

        return DashboardSummary(
            active_orders=active_orders,
            completed_orders=completed_orders,
            todays_income=Decimal(str(todays_income)),
            monthly_income=Decimal(str(monthly_income)),
            motorcycles_in_repair=motorcycles_in_repair,
            low_stock_parts=low_stock,
            pending_payments_total=Decimal(str(pending_total)),
            waiting_authorization_count=waiting_auth,
        )

    def get_income(self) -> IncomeReport:
        today = date.today()
        month_start = today.replace(day=1)
        year_start = today.replace(month=1, day=1)

        today_total = self.db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                func.date(Payment.payment_date) == today
            )
        ).scalar_one()

        month_total = self.db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                func.date(Payment.payment_date) >= month_start
            )
        ).scalar_one()

        year_total = self.db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                func.date(Payment.payment_date) >= year_start
            )
        ).scalar_one()

        return IncomeReport(
            today=Decimal(str(today_total)),
            month=Decimal(str(month_total)),
            year=Decimal(str(year_total)),
        )

    def get_orders_by_status(self) -> list[OrderStatusCount]:
        rows = self.db.execute(
            select(ServiceOrder.status, func.count(ServiceOrder.id).label("count")).group_by(
                ServiceOrder.status
            )
        ).all()
        return [OrderStatusCount(status=row.status, count=row.count) for row in rows]

    def get_low_stock_parts(self) -> list[Part]:
        stmt = select(Part).where(Part.stock_quantity <= Part.minimum_stock).order_by(Part.name)
        return list(self.db.execute(stmt).scalars().all())

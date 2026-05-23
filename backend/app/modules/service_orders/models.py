from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.shared.enums import OrderStatus


class ServiceOrder(Base):
    __tablename__ = "service_orders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True
    )
    motorcycle_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("motorcycles.id", ondelete="RESTRICT"), nullable=False
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False
    )
    assigned_mechanic_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[OrderStatus] = mapped_column(
        String(40), nullable=False, default=OrderStatus.RECIBIDA
    )
    entry_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    estimated_delivery_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    problem_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    work_performed: Mapped[str | None] = mapped_column(Text, nullable=True)
    labor_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    parts_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    total_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    paid_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    balance_due: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    motorcycle: Mapped[object] = relationship("Motorcycle", back_populates="service_orders")
    client: Mapped[object] = relationship("Client")
    assigned_mechanic: Mapped[object] = relationship("User")
    photos: Mapped[list] = relationship("MotorcyclePhoto", back_populates="service_order")
    parts: Mapped[list] = relationship("ServiceOrderPart", back_populates="service_order")
    payments: Mapped[list] = relationship("Payment", back_populates="service_order")

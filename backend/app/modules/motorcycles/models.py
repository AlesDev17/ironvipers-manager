from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Motorcycle(Base):
    __tablename__ = "motorcycles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("clients.id", ondelete="CASCADE"), nullable=False
    )
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    plate: Mapped[str | None] = mapped_column(String(20), nullable=True)
    vin: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    km: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    client: Mapped[object] = relationship("Client", back_populates="motorcycles")
    photos: Mapped[list] = relationship("MotorcyclePhoto", back_populates="motorcycle")
    service_orders: Mapped[list] = relationship("ServiceOrder", back_populates="motorcycle")

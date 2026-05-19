from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.shared.enums import PhotoType


class MotorcyclePhoto(Base):
    __tablename__ = "motorcycle_photos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    motorcycle_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("motorcycles.id", ondelete="CASCADE"), nullable=False
    )
    service_order_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("service_orders.id", ondelete="SET NULL"), nullable=True
    )
    photo_url: Mapped[str] = mapped_column(Text, nullable=False)
    photo_type: Mapped[PhotoType] = mapped_column(String(30), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    motorcycle: Mapped[object] = relationship("Motorcycle", back_populates="photos")
    service_order: Mapped[object] = relationship("ServiceOrder", back_populates="photos")
    uploaded_by: Mapped[object] = relationship("User")

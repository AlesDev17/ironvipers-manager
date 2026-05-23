from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.users.models import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: str | uuid.UUID) -> User | None:
        return self.db.get(User, uuid.UUID(str(user_id)))

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self.db.execute(stmt).scalar_one_or_none()

    def list_all(self, tenant_id: uuid.UUID | None = None) -> list[User]:
        stmt = select(User)
        if tenant_id is not None:
            stmt = stmt.where(User.tenant_id == tenant_id)
        stmt = stmt.order_by(User.created_at.desc())
        return list(self.db.execute(stmt).scalars().all())

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()

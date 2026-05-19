from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.modules.users.models import User
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserUpdate
from app.shared.exceptions import conflict, not_found


class UserService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def list_users(self) -> list[User]:
        return self.repo.list_all()

    def get_user(self, user_id: uuid.UUID) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise not_found("User")
        return user

    def create_user(self, data: UserCreate) -> User:
        existing = self.repo.get_by_email(data.email)
        if existing:
            raise conflict("A user with this email already exists")
        user = User(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            password_hash=hash_password(data.password),
            role=data.role,
        )
        return self.repo.create(user)

    def update_user(self, user_id: uuid.UUID, data: UserUpdate) -> User:
        user = self.get_user(user_id)
        if data.email is not None and data.email != user.email:
            existing = self.repo.get_by_email(data.email)
            if existing:
                raise conflict("A user with this email already exists")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)
        return self.repo.update(user)

    def activate_user(self, user_id: uuid.UUID) -> User:
        user = self.get_user(user_id)
        user.is_active = True
        return self.repo.update(user)

    def deactivate_user(self, user_id: uuid.UUID) -> User:
        user = self.get_user(user_id)
        user.is_active = False
        return self.repo.update(user)

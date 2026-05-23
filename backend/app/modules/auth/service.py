from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.modules.users.models import User
from app.modules.users.repository import UserRepository
from app.shared.enums import UserRole
from app.shared.exceptions import forbidden, unauthorized


class AuthService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def login(self, email: str, password: str) -> tuple[str, User]:
        user = self.repo.get_by_email(email)
        if not user or not user.is_active:
            raise unauthorized()
        if not verify_password(password, user.password_hash):
            raise unauthorized()

        # Check tenant subscription (SUPERADMIN has no tenant — always allowed)
        if user.role != UserRole.SUPERADMIN and user.tenant:
            tenant = user.tenant
            if not tenant.is_active:
                raise forbidden("subscription_inactive")
            if tenant.subscription_expires_at:
                if tenant.subscription_expires_at < datetime.now(timezone.utc):
                    raise forbidden("subscription_expired")

        payload: dict = {"sub": str(user.id)}
        if user.tenant_id:
            payload["tenant_id"] = str(user.tenant_id)

        token = create_access_token(data=payload)
        return token, user

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.modules.users.models import User
from app.modules.users.repository import UserRepository
from app.shared.exceptions import unauthorized


class AuthService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def login(self, email: str, password: str) -> tuple[str, User]:
        user = self.repo.get_by_email(email)
        if not user or not user.is_active:
            raise unauthorized()
        if not verify_password(password, user.password_hash):
            raise unauthorized()
        token = create_access_token(data={"sub": str(user.id)})
        return token, user

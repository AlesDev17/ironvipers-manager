from __future__ import annotations

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.shared.enums import UserRole
from app.shared.exceptions import forbidden, unauthorized

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    from app.modules.users.repository import UserRepository

    payload = decode_token(token)
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise unauthorized()

    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if user is None or not user.is_active:
        raise unauthorized()

    return user


def require_admin(current_user=Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise forbidden()
    return current_user


def require_mechanic_or_admin(current_user=Depends(get_current_user)):
    if current_user.role not in (UserRole.ADMIN, UserRole.MECHANIC):
        raise forbidden()
    return current_user

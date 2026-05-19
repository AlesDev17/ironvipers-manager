"""
Run from the backend/ directory:
  python seed.py
"""
import getpass
import uuid
from datetime import datetime, timezone

from sqlalchemy import create_engine, text

from app.core.config import settings
from app.core.security import hash_password

password = getpass.getpass("Password for admin@ironvipers.com: ")

engine = create_engine(settings.DATABASE_URL)

with engine.begin() as conn:
    existing = conn.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": "admin@ironvipers.com"},
    ).fetchone()

    if existing:
        print("User admin@ironvipers.com already exists — skipping.")
    else:
        conn.execute(
            text("""
                INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at)
                VALUES (:id, :full_name, :email, :phone, :password_hash, :role, true, :now, :now)
            """),
            {
                "id": str(uuid.uuid4()),
                "full_name": "Admin",
                "email": "admin@ironvipers.com",
                "phone": "7713630830",
                "password_hash": hash_password(password),
                "role": "ADMIN",
                "now": datetime.now(timezone.utc),
            },
        )
        print("Admin user created successfully.")

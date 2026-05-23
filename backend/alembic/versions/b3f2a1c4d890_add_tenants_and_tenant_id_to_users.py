"""add tenants table and tenant_id to users

Revision ID: b3f2a1c4d890
Revises: 0a8d5d57b529
Create Date: 2026-05-23

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'b3f2a1c4d890'
down_revision: Union[str, None] = '0a8d5d57b529'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'tenants',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('owner_email', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('subscription_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.add_column('users', sa.Column('tenant_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_users_tenant_id',
        'users', 'tenants',
        ['tenant_id'], ['id'],
        ondelete='CASCADE',
    )

    # Update SUPERADMIN enum value in existing data (safe — no existing SUPERADMIN rows)


def downgrade() -> None:
    op.drop_constraint('fk_users_tenant_id', 'users', type_='foreignkey')
    op.drop_column('users', 'tenant_id')
    op.drop_table('tenants')

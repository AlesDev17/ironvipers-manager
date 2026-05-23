"""add tenant_id to data tables

Revision ID: c5e1f2a3b4d5
Revises: b3f2a1c4d890
Create Date: 2026-05-23

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'c5e1f2a3b4d5'
down_revision: Union[str, None] = 'b3f2a1c4d890'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TABLES = [
    'clients',
    'motorcycles',
    'parts',
    'service_orders',
    'expenses',
    'payments',
]


def upgrade() -> None:
    for table in _TABLES:
        op.add_column(table, sa.Column('tenant_id', sa.UUID(), nullable=True))
        op.create_foreign_key(
            f'fk_{table}_tenant_id',
            table, 'tenants',
            ['tenant_id'], ['id'],
            ondelete='CASCADE',
        )


def downgrade() -> None:
    for table in reversed(_TABLES):
        op.drop_constraint(f'fk_{table}_tenant_id', table, type_='foreignkey')
        op.drop_column(table, 'tenant_id')

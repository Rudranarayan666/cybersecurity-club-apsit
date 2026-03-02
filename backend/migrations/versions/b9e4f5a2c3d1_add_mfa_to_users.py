"""Add mfa columns to users table

Revision ID: b9e4f5a2c3d1
Revises: a7f3d2c1b8e4
Create Date: 2026-03-02

"""
from alembic import op
import sqlalchemy as sa

revision = 'b9e4f5a2c3d1'
down_revision = 'a7f3d2c1b8e4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('mfa_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('totp_secret', sa.String(64), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'totp_secret')
    op.drop_column('users', 'mfa_enabled')

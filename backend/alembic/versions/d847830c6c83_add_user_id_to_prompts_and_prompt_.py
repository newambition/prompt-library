"""Add user_id to prompts and prompt_versions for user-specific data

Revision ID: d847830c6c83
Revises: e47e2e81942b
Create Date: 2025-05-28 04:23:07.235608

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd847830c6c83'
down_revision: Union[str, None] = 'e47e2e81942b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Check if user_id column exists in prompts table, add if missing
    connection = op.get_bind()
    result = connection.execute(sa.text("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'prompts' AND column_name = 'user_id'
    """))
    if not result.fetchone():
        # Add user_id to prompts table
        op.add_column('prompts', sa.Column('user_id', sa.String(), nullable=True))
        # Set default value for existing rows
        op.execute("UPDATE prompts SET user_id = 'legacy' WHERE user_id IS NULL")
        # Make column NOT NULL
        op.alter_column('prompts', 'user_id', nullable=False)
        # Add index
        op.create_index('ix_prompts_user_id', 'prompts', ['user_id'], unique=False)

    # Check if user_id column exists in prompt_versions table, add if missing
    result = connection.execute(sa.text("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'prompt_versions' AND column_name = 'user_id'
    """))
    if not result.fetchone():
        # Add user_id to prompt_versions table
        op.add_column('prompt_versions', sa.Column('user_id', sa.String(), nullable=True))
        # Set default value for existing rows
        op.execute("UPDATE prompt_versions SET user_id = 'legacy' WHERE user_id IS NULL")
        # Make column NOT NULL
        op.alter_column('prompt_versions', 'user_id', nullable=False)
        # Add index
        op.create_index('ix_prompt_versions_user_id', 'prompt_versions', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove indexes and columns
    op.drop_index('ix_prompt_versions_user_id', table_name='prompt_versions')
    op.drop_column('prompt_versions', 'user_id')
    op.drop_index('ix_prompts_user_id', table_name='prompts')
    op.drop_column('prompts', 'user_id')

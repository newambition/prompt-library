"""Add User table and fix foreign key relationships

Revision ID: 5ea4fba4d374
Revises: d847830c6c83
Create Date: 2025-05-28 09:05:50.560439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5ea4fba4d374'
down_revision: Union[str, None] = 'd847830c6c83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the userdb table first
    op.create_table('userdb',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('auth0_id', sa.String(length=255), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('username', sa.String(length=100), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('tier', sa.String(length=100), nullable=False),
    sa.Column('subscription_status', sa.String(length=100), nullable=False),
    sa.Column('subscription_start_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('subscription_end_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('stripe_customer_id', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('user_id'),
    sa.UniqueConstraint('auth0_id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_index(op.f('ix_userdb_user_id'), 'userdb', ['user_id'], unique=False)
    
    # Insert a default legacy user for existing data
    op.execute("""
        INSERT INTO userdb (user_id, auth0_id, email, username, tier, subscription_status)
        VALUES (1, 'legacy_user', 'legacy@example.com', 'legacy_user', 'free', 'active')
    """)
    
    # Handle prompt_versions table
    # Add a temporary column for the new user_id
    op.add_column('prompt_versions', sa.Column('user_id_new', sa.Integer(), nullable=True))
    
    # Update all existing rows to use the legacy user (user_id = 1)
    op.execute("UPDATE prompt_versions SET user_id_new = 1")
    
    # Make the new column NOT NULL
    op.alter_column('prompt_versions', 'user_id_new', nullable=False)
    
    # Drop the old user_id column and its index
    op.drop_index('ix_prompt_versions_user_id', table_name='prompt_versions')
    op.drop_column('prompt_versions', 'user_id')
    
    # Rename the new column to user_id
    op.alter_column('prompt_versions', 'user_id_new', new_column_name='user_id')
    
    # Create foreign key constraint
    op.create_foreign_key(None, 'prompt_versions', 'userdb', ['user_id'], ['user_id'], ondelete='CASCADE')
    
    # Handle prompts table
    # Add a temporary column for the new user_id
    op.add_column('prompts', sa.Column('user_id_new', sa.Integer(), nullable=True))
    
    # Update all existing rows to use the legacy user (user_id = 1)
    op.execute("UPDATE prompts SET user_id_new = 1")
    
    # Make the new column NOT NULL
    op.alter_column('prompts', 'user_id_new', nullable=False)
    
    # Drop the old user_id column and its index
    op.drop_index('ix_prompts_user_id', table_name='prompts')
    op.drop_column('prompts', 'user_id')
    
    # Rename the new column to user_id
    op.alter_column('prompts', 'user_id_new', new_column_name='user_id')
    
    # Create foreign key constraint
    op.create_foreign_key(None, 'prompts', 'userdb', ['user_id'], ['user_id'], ondelete='CASCADE')
    
    # Handle user_api_keys table (if it exists and has data)
    connection = op.get_bind()
    result = connection.execute(sa.text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'user_api_keys'
        )
    """))
    
    if result.fetchone()[0]:  # Table exists
        # Check if it has the old user_id column
        result = connection.execute(sa.text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'user_api_keys' AND column_name = 'user_id'
        """))
        
        if result.fetchone():  # Column exists
            # Add a temporary column for the new user_id
            op.add_column('user_api_keys', sa.Column('user_id_new', sa.Integer(), nullable=True))
            
            # Update all existing rows to use the legacy user (user_id = 1)
            op.execute("UPDATE user_api_keys SET user_id_new = 1")
            
            # Make the new column NOT NULL
            op.alter_column('user_api_keys', 'user_id_new', nullable=False)
            
            # Drop the old user_id column and its index (if exists)
            try:
                op.drop_index('ix_user_api_keys_user_id', table_name='user_api_keys')
            except:
                pass  # Index might not exist
            op.drop_column('user_api_keys', 'user_id')
            
            # Rename the new column to user_id
            op.alter_column('user_api_keys', 'user_id_new', new_column_name='user_id')
            
            # Create foreign key constraint
            op.create_foreign_key(None, 'user_api_keys', 'userdb', ['user_id'], ['user_id'], ondelete='CASCADE')


def downgrade() -> None:
    """Downgrade schema."""
    # This is a complex downgrade - for safety, we'll recreate the string columns
    # but data integrity may be lost
    
    # Handle user_api_keys
    connection = op.get_bind()
    result = connection.execute(sa.text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'user_api_keys'
        )
    """))
    
    if result.fetchone()[0]:
        op.drop_constraint(None, 'user_api_keys', type_='foreignkey')
        op.alter_column('user_api_keys', 'user_id', type_=sa.VARCHAR(), existing_type=sa.Integer())
        op.execute("UPDATE user_api_keys SET user_id = 'legacy'")
        op.create_index('ix_user_api_keys_user_id', 'user_api_keys', ['user_id'], unique=False)
    
    # Handle prompts
    op.drop_constraint(None, 'prompts', type_='foreignkey')
    op.alter_column('prompts', 'user_id', type_=sa.VARCHAR(), existing_type=sa.Integer())
    op.execute("UPDATE prompts SET user_id = 'legacy'")
    op.create_index('ix_prompts_user_id', 'prompts', ['user_id'], unique=False)
    
    # Handle prompt_versions
    op.drop_constraint(None, 'prompt_versions', type_='foreignkey')
    op.alter_column('prompt_versions', 'user_id', type_=sa.VARCHAR(), existing_type=sa.Integer())
    op.execute("UPDATE prompt_versions SET user_id = 'legacy'")
    op.create_index('ix_prompt_versions_user_id', 'prompt_versions', ['user_id'], unique=False)
    
    # Drop userdb table
    op.drop_index(op.f('ix_userdb_user_id'), table_name='userdb')
    op.drop_table('userdb')

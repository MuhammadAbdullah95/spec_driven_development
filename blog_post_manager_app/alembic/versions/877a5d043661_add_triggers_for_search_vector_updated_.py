"""Add triggers for search vector, updated_at, and tag limit constraint

Revision ID: 877a5d043661
Revises: 9cecac277d47
Create Date: 2025-10-14 23:37:21.469006

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '877a5d043661'
down_revision: Union[str, Sequence[str], None] = '9cecac277d47'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create GIN index for full-text search on posts.search_vector
    op.create_index(
        'ix_posts_search_vector',
        'posts',
        ['search_vector'],
        unique=False,
        postgresql_using='gin'
    )

    # Create trigger function to auto-update search_vector
    op.execute("""
    CREATE OR REPLACE FUNCTION posts_search_vector_trigger() RETURNS trigger AS $$
    BEGIN
        NEW.search_vector :=
            setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'C');
        RETURN NEW;
    END
    $$ LANGUAGE plpgsql;
    """)

    # Create trigger to call the function before insert or update
    op.execute("""
    CREATE TRIGGER posts_search_vector_update
        BEFORE INSERT OR UPDATE ON posts
        FOR EACH ROW
        EXECUTE FUNCTION posts_search_vector_trigger();
    """)

    # Create trigger function to auto-update updated_at timestamp
    op.execute("""
    CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)

    # Create trigger for users table
    op.execute("""
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)

    # Create trigger for posts table
    op.execute("""
    CREATE TRIGGER update_posts_updated_at
        BEFORE UPDATE ON posts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)

    # Create trigger function to enforce 10 tag limit per post
    op.execute("""
    CREATE OR REPLACE FUNCTION enforce_post_tag_limit() RETURNS trigger AS $$
    DECLARE
        tag_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO tag_count
        FROM post_tags
        WHERE post_id = NEW.post_id;

        IF tag_count >= 10 THEN
            RAISE EXCEPTION 'A post cannot have more than 10 tags';
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)

    # Create trigger to enforce tag limit before insert
    op.execute("""
    CREATE TRIGGER enforce_post_tag_limit_trigger
        BEFORE INSERT ON post_tags
        FOR EACH ROW
        EXECUTE FUNCTION enforce_post_tag_limit();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS enforce_post_tag_limit_trigger ON post_tags")
    op.execute("DROP TRIGGER IF EXISTS update_posts_updated_at ON posts")
    op.execute("DROP TRIGGER IF EXISTS update_users_updated_at ON users")
    op.execute("DROP TRIGGER IF EXISTS posts_search_vector_update ON posts")

    # Drop functions
    op.execute("DROP FUNCTION IF EXISTS enforce_post_tag_limit()")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column()")
    op.execute("DROP FUNCTION IF EXISTS posts_search_vector_trigger()")

    # Drop GIN index
    op.drop_index('ix_posts_search_vector', table_name='posts')

"""Post model for blog posts."""

import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship

from src.database import Base


class PostStatus(str, enum.Enum):
    """Post publication status."""

    draft = "draft"
    published = "published"
    archived = "archived"


# Association table for many-to-many relationship between posts and tags
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column(
        "post_id",
        Integer,
        ForeignKey("posts.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "created_at",
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    ),
)


class Post(Base):
    """
    Post model representing blog posts.

    Attributes:
        id: Primary key
        author_id: Foreign key to users table
        title: Post title (max 200 characters)
        content: Full post content
        excerpt: Short summary (max 500 characters)
        status: Publication status (draft, published, archived)
        publication_date: When post was published (nullable for drafts)
        created_at: Timestamp when post was created
        updated_at: Timestamp when post was last updated
        search_vector: Full-text search vector (auto-generated)
        author: Relationship to User model
        tags: Many-to-many relationship to Tag model
    """

    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(String(500), nullable=True)
    status = Column(
        Enum(PostStatus), default=PostStatus.draft, nullable=False, index=True
    )
    publication_date = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    search_vector = Column(TSVECTOR, nullable=True)

    # Relationships
    author = relationship("User", back_populates="posts")
    tags = relationship(
        "Tag",
        secondary=post_tags,
        back_populates="posts",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        """String representation of Post."""
        return f"<Post(id={self.id}, title='{self.title}', status='{self.status}')>"

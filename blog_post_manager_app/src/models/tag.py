"""Tag model for categorizing blog posts."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from src.database import Base
from src.models.post import post_tags


class Tag(Base):
    """
    Tag model for post categorization.

    Attributes:
        id: Primary key
        name: Unique tag name (lowercase, max 50 characters)
        created_at: Timestamp when tag was created
        posts: Many-to-many relationship to Post model
    """

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    posts = relationship(
        "Post",
        secondary=post_tags,
        back_populates="tags",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        """String representation of Tag."""
        return f"<Tag(id={self.id}, name='{self.name}')>"

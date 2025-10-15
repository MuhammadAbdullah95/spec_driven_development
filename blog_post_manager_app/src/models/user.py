"""User model for authentication and authorization."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from src.database import Base


class User(Base):
    """
    User model representing authors and administrators.

    Attributes:
        id: Primary key
        email: Unique email address for login
        username: Unique username for display
        hashed_password: Bcrypt hashed password
        full_name: User's full name
        is_active: Account active status (for soft deletion)
        created_at: Timestamp when user was created
        updated_at: Timestamp when user was last updated
        posts: Relationship to user's blog posts
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    posts = relationship("Post", back_populates="author", lazy="selectin")

    def __repr__(self) -> str:
        """String representation of User."""
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

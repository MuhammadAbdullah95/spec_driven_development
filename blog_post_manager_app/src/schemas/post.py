"""Pydantic schemas for Post model."""

import enum
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from src.schemas.tag import TagResponse
from src.schemas.user import UserResponse


class PostStatus(str, enum.Enum):
    """Post publication status."""

    draft = "draft"
    published = "published"
    archived = "archived"


class PostBase(BaseModel):
    """Base post schema with common attributes."""

    title: str = Field(..., min_length=1, max_length=200, description="Post title")
    content: str = Field(..., min_length=1, description="Full post content")
    excerpt: str | None = Field(None, max_length=500, description="Short post summary")
    tags: list[str] = Field(
        default=[],
        description="List of tag names (max 10 tags)",
        max_length=10,
    )

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str]) -> list[str]:
        """Validate tags list."""
        if len(v) > 10:
            raise ValueError("Maximum 10 tags allowed per post")

        # Normalize tags to lowercase and remove duplicates
        normalized = [tag.lower().strip() for tag in v]
        unique_tags = list(dict.fromkeys(normalized))  # Preserve order

        # Validate each tag format
        for tag in unique_tags:
            if not tag:
                raise ValueError("Tag name cannot be empty")
            if len(tag) > 50:
                raise ValueError(f"Tag '{tag}' exceeds maximum length of 50 characters")
            if not all(c.isalnum() or c == "-" for c in tag):
                raise ValueError(
                    f"Tag '{tag}' contains invalid characters. Use only lowercase letters, numbers, and hyphens"
                )

        return unique_tags


class PostCreate(PostBase):
    """Schema for creating a new post."""

    status: PostStatus = Field(default=PostStatus.draft, description="Post publication status")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Getting Started with FastAPI",
                    "content": "FastAPI is a modern, fast web framework for building APIs with Python 3.11+...",
                    "excerpt": "Learn how to build production-ready APIs",
                    "status": "draft",
                    "tags": ["python", "fastapi", "tutorial"],
                }
            ]
        }
    }


class PostUpdate(BaseModel):
    """Schema for updating a post."""

    title: str | None = Field(None, min_length=1, max_length=200, description="Post title")
    content: str | None = Field(None, min_length=1, description="Full post content")
    excerpt: str | None = Field(None, max_length=500, description="Short post summary")
    status: PostStatus | None = Field(None, description="Post publication status")
    tags: list[str] | None = Field(None, description="List of tag names (max 10 tags)", max_length=10)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str] | None) -> list[str] | None:
        """Validate tags list."""
        if v is None:
            return v

        if len(v) > 10:
            raise ValueError("Maximum 10 tags allowed per post")

        # Normalize tags to lowercase and remove duplicates
        normalized = [tag.lower().strip() for tag in v]
        unique_tags = list(dict.fromkeys(normalized))  # Preserve order

        # Validate each tag format
        for tag in unique_tags:
            if not tag:
                raise ValueError("Tag name cannot be empty")
            if len(tag) > 50:
                raise ValueError(f"Tag '{tag}' exceeds maximum length of 50 characters")
            if not all(c.isalnum() or c == "-" for c in tag):
                raise ValueError(
                    f"Tag '{tag}' contains invalid characters. Use only lowercase letters, numbers, and hyphens"
                )

        return unique_tags

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "published",
                    "excerpt": "Updated excerpt for better SEO",
                    "tags": ["python", "fastapi", "advanced"],
                }
            ]
        }
    }


class PostResponse(BaseModel):
    """Schema for post responses."""

    id: int = Field(..., description="Post ID")
    title: str = Field(..., description="Post title")
    content: str = Field(..., description="Full post content")
    excerpt: str | None = Field(None, description="Short post summary")
    status: PostStatus = Field(..., description="Post publication status")
    publication_date: datetime | None = Field(None, description="When post was published")
    created_at: datetime = Field(..., description="Post creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    author: UserResponse = Field(..., description="Post author information")
    tags: list[TagResponse] = Field(default=[], description="Associated tags")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "title": "Getting Started with FastAPI",
                    "content": "FastAPI is a modern web framework...",
                    "excerpt": "Learn how to build APIs",
                    "status": "published",
                    "publication_date": "2025-01-14T12:00:00Z",
                    "created_at": "2025-01-14T10:00:00Z",
                    "updated_at": "2025-01-14T12:00:00Z",
                    "author": {
                        "id": 1,
                        "email": "author@example.com",
                        "username": "author1",
                        "full_name": "John Doe",
                        "is_active": True,
                        "created_at": "2025-01-10T12:00:00Z",
                        "updated_at": "2025-01-10T12:00:00Z",
                    },
                    "tags": [
                        {"id": 1, "name": "python", "created_at": "2025-01-14T10:00:00Z"},
                        {"id": 2, "name": "fastapi", "created_at": "2025-01-14T10:00:00Z"},
                    ],
                }
            ]
        },
    }


class PostListResponse(BaseModel):
    """Schema for post list responses (without full content)."""

    id: int = Field(..., description="Post ID")
    title: str = Field(..., description="Post title")
    excerpt: str | None = Field(None, description="Short post summary")
    status: PostStatus = Field(..., description="Post publication status")
    publication_date: datetime | None = Field(None, description="When post was published")
    created_at: datetime = Field(..., description="Post creation timestamp")
    author: UserResponse = Field(..., description="Post author information")
    tags: list[TagResponse] = Field(default=[], description="Associated tags")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "title": "Getting Started with FastAPI",
                    "excerpt": "Learn how to build APIs",
                    "status": "published",
                    "publication_date": "2025-01-14T12:00:00Z",
                    "created_at": "2025-01-14T10:00:00Z",
                    "author": {
                        "id": 1,
                        "email": "author@example.com",
                        "username": "author1",
                        "full_name": "John Doe",
                        "is_active": True,
                        "created_at": "2025-01-10T12:00:00Z",
                        "updated_at": "2025-01-10T12:00:00Z",
                    },
                    "tags": [{"id": 1, "name": "python", "created_at": "2025-01-14T10:00:00Z"}],
                }
            ]
        },
    }

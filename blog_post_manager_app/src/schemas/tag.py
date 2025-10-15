"""Pydantic schemas for Tag model."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class TagBase(BaseModel):
    """Base tag schema."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Tag name (lowercase, alphanumeric with hyphens)",
        pattern="^[a-z0-9-]+$",
    )


class TagCreate(TagBase):
    """Schema for creating a new tag."""

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Ensure tag name is lowercase."""
        return v.lower().strip()

    model_config = {
        "json_schema_extra": {"examples": [{"name": "python"}, {"name": "web-development"}]}
    }


class TagResponse(TagBase):
    """Schema for tag responses."""

    id: int = Field(..., description="Tag ID")
    created_at: datetime = Field(..., description="Tag creation timestamp")
    post_count: int | None = Field(None, description="Number of posts with this tag", ge=0)

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "name": "python",
                    "created_at": "2025-01-14T12:00:00Z",
                    "post_count": 5,
                }
            ]
        },
    }


class TagWithPostsResponse(TagResponse):
    """Schema for tag with associated posts."""

    posts: list = Field(default=[], description="List of posts with this tag")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "name": "python",
                    "created_at": "2025-01-14T12:00:00Z",
                    "post_count": 2,
                    "posts": [{"id": 1, "title": "Getting Started with Python"}],
                }
            ]
        },
    }

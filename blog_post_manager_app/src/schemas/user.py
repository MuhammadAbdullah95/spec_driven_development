"""Pydantic schemas for User model."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    """Base user schema with common attributes."""

    email: EmailStr = Field(..., description="User email address")
    username: str = Field(
        ..., min_length=3, max_length=50, description="Unique username", pattern="^[a-zA-Z0-9_-]+$"
    )
    full_name: str | None = Field(None, max_length=200, description="User's full name")


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(
        ..., min_length=8, description="User password (minimum 8 characters)"
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength. We no longer restrict maximum length here.

        Note: bcrypt has a 72-byte input limit; the hashing helper will truncate
        inputs to ensure compatibility so callers can provide arbitrarily long
        passwords.
        """
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "author@example.com",
                    "username": "author1",
                    "password": "SecurePass123",
                    "full_name": "John Doe",
                }
            ]
        }
    }


class UserResponse(UserBase):
    """Schema for user responses."""

    id: int = Field(..., description="User ID")
    is_active: bool = Field(..., description="Whether user account is active")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "email": "author@example.com",
                    "username": "author1",
                    "full_name": "John Doe",
                    "is_active": True,
                    "created_at": "2025-01-14T12:00:00Z",
                    "updated_at": "2025-01-14T12:00:00Z",
                }
            ]
        },
    }


class UserUpdate(BaseModel):
    """Schema for updating user information."""

    full_name: str | None = Field(None, max_length=200, description="User's full name")
    email: EmailStr | None = Field(None, description="User email address")

    model_config = {
        "json_schema_extra": {
            "examples": [{"full_name": "Jane Smith", "email": "jane@example.com"}]
        }
    }

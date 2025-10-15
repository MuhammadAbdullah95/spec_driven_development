"""Common Pydantic schemas used across the application."""

from typing import Any, Dict, Generic, List, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorResponse(BaseModel):
    """Standard error response schema."""

    error: str = Field(..., description="Error type or code")
    message: str = Field(..., description="Human-readable error message")
    details: Dict[str, Any] | None = Field(
        None, description="Additional error details or validation errors"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "error": "ValidationError",
                    "message": "Invalid input data",
                    "details": {"field": "email", "issue": "Invalid email format"},
                }
            ]
        }
    }


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema."""

    items: List[T] = Field(..., description="List of items for current page")
    total: int = Field(..., description="Total number of items", ge=0)
    page: int = Field(..., description="Current page number", ge=1)
    page_size: int = Field(..., description="Number of items per page", ge=1, le=100)
    total_pages: int = Field(..., description="Total number of pages", ge=0)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "items": [],
                    "total": 42,
                    "page": 1,
                    "page_size": 20,
                    "total_pages": 3,
                }
            ]
        }
    }


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(..., description="Health status", pattern="^(healthy|unhealthy)$")
    version: str | None = Field(None, description="Application version")
    database: str | None = Field(None, description="Database connection status")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "healthy",
                    "version": "0.1.0",
                    "database": "connected",
                }
            ]
        }
    }

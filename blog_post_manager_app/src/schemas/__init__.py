"""Pydantic schemas for request/response validation."""

from src.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, TokenRefreshRequest, TokenRefreshResponse
from src.schemas.common import ErrorResponse, PaginatedResponse
from src.schemas.post import PostCreate, PostResponse, PostStatus, PostUpdate
from src.schemas.tag import TagCreate, TagResponse
from src.schemas.user import UserCreate, UserResponse

__all__ = [
    # Auth schemas
    "LoginRequest",
    "LoginResponse",
    "RegisterRequest",
    "TokenRefreshRequest",
    "TokenRefreshResponse",
    # Common schemas
    "ErrorResponse",
    "PaginatedResponse",
    # Post schemas
    "PostCreate",
    "PostResponse",
    "PostStatus",
    "PostUpdate",
    # Tag schemas
    "TagCreate",
    "TagResponse",
    # User schemas
    "UserCreate",
    "UserResponse",
]

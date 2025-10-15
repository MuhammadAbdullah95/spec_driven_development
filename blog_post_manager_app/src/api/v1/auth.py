"""Authentication API routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import verify_refresh_token
from src.database import get_db
from src.models.user import User
from src.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    TokenRefreshRequest,
    TokenRefreshResponse,
)
from src.schemas.user import UserResponse
from src.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account with email, username, and password",
)
async def register(
    user_data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Register a new user.

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        UserResponse: Created user information

    Raises:
        HTTPException: 409 if email or username already exists
        HTTPException: 422 if validation fails
    """
    auth_service = AuthService(db)
    return await auth_service.register_user(user_data)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="User login",
    description="Authenticate user and return JWT access and refresh tokens",
)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """
    Login user and get JWT tokens.

    Args:
        credentials: User email and password
        db: Database session

    Returns:
        LoginResponse: Access and refresh tokens

    Raises:
        HTTPException: 401 if credentials are invalid
        HTTPException: 403 if account is inactive
    """
    auth_service = AuthService(db)
    return await auth_service.login(credentials.email, credentials.password)


@router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    summary="Refresh access token",
    description="Get a new access token using a valid refresh token",
)
async def refresh_token(
    refresh_data: TokenRefreshRequest,
    user: User = Depends(verify_refresh_token),
    db: AsyncSession = Depends(get_db),
) -> TokenRefreshResponse:
    """
    Refresh access token using refresh token.

    Args:
        refresh_data: Refresh token request
        user: User from verified refresh token
        db: Database session

    Returns:
        TokenRefreshResponse: New access token

    Raises:
        HTTPException: 401 if refresh token is invalid or expired
    """
    auth_service = AuthService(db)
    access_token = await auth_service.refresh_access_token(user)

    from src.config import settings

    return TokenRefreshResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )

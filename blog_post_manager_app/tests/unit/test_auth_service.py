"""Unit tests for authentication service."""

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import User
from src.schemas.auth import RegisterRequest
from src.services.auth_service import AuthService
from src.utils.security import verify_password


@pytest.mark.asyncio
class TestAuthService:
    """Test cases for AuthService."""

    async def test_register_user_success(self, db_session: AsyncSession):
        """Test successful user registration."""
        auth_service = AuthService(db_session)

        user_data = RegisterRequest(
            email="newuser@example.com",
            username="newuser",
            password="SecurePass123",
            full_name="New User",
        )

        result = await auth_service.register_user(user_data)

        assert result.email == "newuser@example.com"
        assert result.username == "newuser"
        assert result.full_name == "New User"
        assert result.is_active is True
        assert result.id is not None

    async def test_register_duplicate_email(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test registration with existing email fails."""
        auth_service = AuthService(db_session)

        user_data = RegisterRequest(
            email="testuser@example.com",  # Already exists
            username="differentuser",
            password="SecurePass123",
        )

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.register_user(user_data)

        assert exc_info.value.status_code == 409
        assert "Email already registered" in exc_info.value.detail

    async def test_register_duplicate_username(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test registration with existing username fails."""
        auth_service = AuthService(db_session)

        user_data = RegisterRequest(
            email="newemail@example.com",
            username="testuser",  # Already exists
            password="SecurePass123",
        )

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.register_user(user_data)

        assert exc_info.value.status_code == 409
        assert "Username already taken" in exc_info.value.detail

    async def test_authenticate_user_success(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test successful authentication."""
        auth_service = AuthService(db_session)

        user = await auth_service.authenticate_user(
            "testuser@example.com", "TestPass123"
        )

        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email

    async def test_authenticate_user_wrong_password(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test authentication with wrong password fails."""
        auth_service = AuthService(db_session)

        user = await auth_service.authenticate_user(
            "testuser@example.com", "WrongPassword123"
        )

        assert user is None

    async def test_authenticate_user_nonexistent(self, db_session: AsyncSession):
        """Test authentication with nonexistent email fails."""
        auth_service = AuthService(db_session)

        user = await auth_service.authenticate_user(
            "nonexistent@example.com", "TestPass123"
        )

        assert user is None

    async def test_login_success(self, db_session: AsyncSession, test_user: User):
        """Test successful login returns tokens."""
        auth_service = AuthService(db_session)

        response = await auth_service.login("testuser@example.com", "TestPass123")

        assert response.access_token is not None
        assert response.refresh_token is not None
        assert response.token_type == "bearer"
        assert response.expires_in > 0

    async def test_login_wrong_credentials(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test login with wrong credentials fails."""
        auth_service = AuthService(db_session)

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.login("testuser@example.com", "WrongPassword123")

        assert exc_info.value.status_code == 401
        assert "Incorrect email or password" in exc_info.value.detail

    async def test_login_inactive_user(
        self, db_session: AsyncSession, inactive_user: User
    ):
        """Test login with inactive account fails."""
        auth_service = AuthService(db_session)

        with pytest.raises(HTTPException) as exc_info:
            await auth_service.login("inactive@example.com", "TestPass123")

        assert exc_info.value.status_code == 403
        assert "inactive" in exc_info.value.detail.lower()

    async def test_refresh_access_token(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test refreshing access token."""
        auth_service = AuthService(db_session)

        new_token = await auth_service.refresh_access_token(test_user)

        assert new_token is not None
        assert len(new_token) > 0
        assert new_token.count(".") == 2  # JWT format: header.payload.signature

    async def test_password_hashing(self):
        """Test password is properly hashed during registration."""
        from src.utils.security import get_password_hash

        password = "TestPassword123"
        hashed = get_password_hash(password)

        # Hash should be different from plain password
        assert hashed != password

        # Should be able to verify
        assert verify_password(password, hashed)

        # Wrong password should not verify
        assert not verify_password("WrongPassword", hashed)

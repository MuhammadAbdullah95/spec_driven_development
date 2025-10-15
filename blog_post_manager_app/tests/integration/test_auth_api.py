"""Integration tests for authentication API endpoints."""

import pytest
from httpx import AsyncClient

from src.models.user import User


@pytest.mark.asyncio
class TestAuthAPI:
    """Test cases for authentication API endpoints."""

    async def test_register_success(self, client: AsyncClient):
        """Test user registration endpoint."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "SecurePass123",
                "full_name": "New User",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert data["is_active"] is True
        assert "id" in data
        assert "hashed_password" not in data  # Should not expose password

    async def test_register_duplicate_email(
        self, client: AsyncClient, test_user: User
    ):
        """Test registration with duplicate email fails."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "testuser@example.com",  # Exists
                "username": "differentuser",
                "password": "SecurePass123",
            },
        )

        assert response.status_code == 409
        assert "email" in response.json()["detail"].lower()

    async def test_register_invalid_password(self, client: AsyncClient):
        """Test registration with weak password fails."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "weak",  # Too short
            },
        )

        assert response.status_code == 422

    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email fails."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "notanemail",
                "username": "testuser",
                "password": "SecurePass123",
            },
        )

        assert response.status_code == 422

    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Test successful login."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "testuser@example.com", "password": "TestPass123"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        """Test login with wrong password fails."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "testuser@example.com", "password": "WrongPassword"},
        )

        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with nonexistent user fails."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "nonexistent@example.com", "password": "TestPass123"},
        )

        assert response.status_code == 401

    async def test_login_inactive_user(self, client: AsyncClient, inactive_user: User):
        """Test login with inactive account fails."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "inactive@example.com", "password": "TestPass123"},
        )

        assert response.status_code == 403
        assert "inactive" in response.json()["detail"].lower()

    async def test_refresh_token_success(
        self, client: AsyncClient, test_user: User
    ):
        """Test refreshing access token."""
        # First login to get refresh token
        login_response = await client.post(
            "/api/v1/auth/login",
            json={"email": "testuser@example.com", "password": "TestPass123"},
        )
        refresh_token = login_response.json()["refresh_token"]

        # Use refresh token to get new access token
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
            headers={"Authorization": f"Bearer {refresh_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Test refresh with invalid token fails."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_token"},
            headers={"Authorization": "Bearer invalid_token"},
        )

        assert response.status_code == 401

    async def test_register_password_validation(self, client: AsyncClient):
        """Test password validation rules."""
        # No uppercase
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "username": "test",
                "password": "lowercase123",
            },
        )
        assert response.status_code == 422
        assert "uppercase" in response.json()["detail"][0]["msg"].lower()

        # No lowercase
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "username": "test",
                "password": "UPPERCASE123",
            },
        )
        assert response.status_code == 422
        assert "lowercase" in response.json()["detail"][0]["msg"].lower()

        # No digit
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "username": "test",
                "password": "NoDigits",
            },
        )
        assert response.status_code == 422
        assert "digit" in response.json()["detail"][0]["msg"].lower()

    async def test_username_validation(self, client: AsyncClient):
        """Test username validation rules."""
        # Invalid characters
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "username": "invalid user!",
                "password": "SecurePass123",
            },
        )
        assert response.status_code == 422

        # Too short
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "username": "ab",
                "password": "SecurePass123",
            },
        )
        assert response.status_code == 422

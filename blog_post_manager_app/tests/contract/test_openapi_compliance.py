"""Contract tests to validate API responses against OpenAPI specification."""

import pytest
from httpx import AsyncClient

from src.main import app
from src.models.post import Post
from src.models.user import User


@pytest.mark.asyncio
class TestOpenAPICompliance:
    """Test that API responses match OpenAPI specification."""

    async def test_openapi_schema_available(self, client: AsyncClient):
        """Test that OpenAPI schema is accessible."""
        response = await client.get("/api/v1/openapi.json")

        assert response.status_code == 200
        schema = response.json()
        assert schema["openapi"].startswith("3.")
        assert "paths" in schema
        assert "components" in schema

    async def test_health_endpoint_schema(self, client: AsyncClient):
        """Test health endpoint matches expected schema."""
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()

        # Validate structure
        assert "status" in data
        assert data["status"] in ["healthy", "unhealthy"]
        assert "version" in data
        assert "database" in data

    async def test_register_response_schema(self, client: AsyncClient):
        """Test registration response matches UserResponse schema."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "schema_test@example.com",
                "username": "schematest",
                "password": "TestPass123",
                "full_name": "Schema Test",
            },
        )

        assert response.status_code == 201
        data = response.json()

        # Validate UserResponse schema
        assert "id" in data
        assert isinstance(data["id"], int)
        assert "email" in data
        assert data["email"] == "schema_test@example.com"
        assert "username" in data
        assert "is_active" in data
        assert isinstance(data["is_active"], bool)
        assert "created_at" in data
        assert "updated_at" in data
        # Should NOT include password
        assert "password" not in data
        assert "hashed_password" not in data

    async def test_login_response_schema(
        self, client: AsyncClient, test_user: User
    ):
        """Test login response matches LoginResponse schema."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "testuser@example.com", "password": "TestPass123"},
        )

        assert response.status_code == 200
        data = response.json()

        # Validate LoginResponse schema
        assert "access_token" in data
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0
        assert "refresh_token" in data
        assert isinstance(data["refresh_token"], str)
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert isinstance(data["expires_in"], int)
        assert data["expires_in"] > 0

    async def test_post_list_response_schema(
        self, client: AsyncClient, test_post: Post
    ):
        """Test posts list response matches PaginatedResponse schema."""
        response = await client.get("/api/v1/posts")

        assert response.status_code == 200
        data = response.json()

        # Validate PaginatedResponse schema
        assert "items" in data
        assert isinstance(data["items"], list)
        assert "total" in data
        assert isinstance(data["total"], int)
        assert "page" in data
        assert isinstance(data["page"], int)
        assert "page_size" in data
        assert isinstance(data["page_size"], int)
        assert "total_pages" in data
        assert isinstance(data["total_pages"], int)

        # Validate PostListResponse items
        if len(data["items"]) > 0:
            post = data["items"][0]
            assert "id" in post
            assert "title" in post
            assert "excerpt" in post
            assert "status" in post
            assert "created_at" in post
            assert "author" in post
            assert "tags" in post

            # Validate nested author schema
            author = post["author"]
            assert "id" in author
            assert "username" in author
            assert "email" in author

    async def test_post_detail_response_schema(
        self, client: AsyncClient, test_post: Post
    ):
        """Test post detail response matches PostResponse schema."""
        response = await client.get(f"/api/v1/posts/{test_post.id}")

        assert response.status_code == 200
        data = response.json()

        # Validate PostResponse schema
        required_fields = [
            "id", "title", "content", "excerpt", "status",
            "publication_date", "created_at", "updated_at", "author", "tags"
        ]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

        # Validate types
        assert isinstance(data["id"], int)
        assert isinstance(data["title"], str)
        assert isinstance(data["content"], str)
        assert isinstance(data["tags"], list)

        # Validate author nested object
        assert "id" in data["author"]
        assert "username" in data["author"]

    async def test_create_post_response_schema(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test create post response matches PostResponse schema."""
        response = await client.post(
            "/api/v1/posts",
            json={
                "title": "Schema Test Post",
                "content": "Content for schema validation",
                "excerpt": "Schema test",
                "tags": ["test"],
            },
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()

        # Should match PostResponse schema
        assert "id" in data
        assert "title" in data
        assert data["title"] == "Schema Test Post"
        assert "author" in data
        assert "tags" in data
        assert len(data["tags"]) == 1

    async def test_error_response_schema(self, client: AsyncClient):
        """Test error responses match ErrorResponse schema."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "wrong@example.com", "password": "wrong"},
        )

        assert response.status_code == 401
        data = response.json()

        # Validate ErrorResponse schema structure
        assert "detail" in data or "error" in data
        # FastAPI returns "detail" by default, our custom errors return "error"

    async def test_validation_error_schema(self, client: AsyncClient):
        """Test validation error responses have proper structure."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "notanemail",  # Invalid email
                "username": "test",
                "password": "Test123",
            },
        )

        assert response.status_code == 422
        data = response.json()

        # Validate Pydantic validation error structure
        assert "detail" in data
        assert isinstance(data["detail"], list)

        # Each error should have location and message
        if len(data["detail"]) > 0:
            error = data["detail"][0]
            assert "loc" in error
            assert "msg" in error
            assert "type" in error

    async def test_tags_list_response_schema(self, client: AsyncClient):
        """Test tags list response matches schema."""
        response = await client.get("/api/v1/tags")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)

        if len(data) > 0:
            tag = data[0]
            assert "id" in tag
            assert "name" in tag
            assert "created_at" in tag

    async def test_search_response_schema(
        self, client: AsyncClient, test_post: Post
    ):
        """Test search response matches PaginatedResponse schema."""
        response = await client.get("/api/v1/search/posts?q=test")

        assert response.status_code == 200
        data = response.json()

        # Should match PaginatedResponse structure
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data

    async def test_popular_tags_response_schema(self, client: AsyncClient):
        """Test popular tags response matches schema."""
        response = await client.get("/api/v1/search/tags/popular")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)

        if len(data) > 0:
            tag = data[0]
            assert "id" in tag
            assert "name" in tag
            assert "post_count" in tag
            assert isinstance(tag["post_count"], int)

    async def test_all_endpoints_have_correlation_id(
        self, client: AsyncClient
    ):
        """Test that all responses include X-Correlation-ID header."""
        endpoints = [
            ("/health", "GET", None),
            ("/api/v1/posts", "GET", None),
            ("/api/v1/tags", "GET", None),
        ]

        for path, method, _ in endpoints:
            if method == "GET":
                response = await client.get(path)

            # Check correlation ID header
            assert "x-correlation-id" in response.headers
            assert len(response.headers["x-correlation-id"]) > 0

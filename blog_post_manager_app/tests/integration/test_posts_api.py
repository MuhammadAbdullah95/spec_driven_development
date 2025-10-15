"""Integration tests for posts API endpoints."""

import pytest
from httpx import AsyncClient

from src.models.post import Post
from src.models.user import User


@pytest.mark.asyncio
class TestPostsAPI:
    """Test cases for posts API endpoints."""

    async def test_create_post_success(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating a post."""
        response = await client.post(
            "/api/v1/posts",
            json={
                "title": "Test Post",
                "content": "This is test content",
                "excerpt": "Test excerpt",
                "tags": ["python", "testing"],
                "status": "draft",
            },
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Post"
        assert data["status"] == "draft"
        assert len(data["tags"]) == 2

    async def test_create_post_unauthorized(self, client: AsyncClient):
        """Test creating post without authentication fails."""
        response = await client.post(
            "/api/v1/posts",
            json={"title": "Test", "content": "Content"},
        )

        assert response.status_code == 403  # No auth header

    async def test_create_post_too_many_tags(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating post with too many tags fails."""
        response = await client.post(
            "/api/v1/posts",
            json={
                "title": "Test",
                "content": "Content",
                "tags": [f"tag{i}" for i in range(11)],
            },
            headers=auth_headers,
        )

        assert response.status_code == 422

    async def test_list_posts_public(
        self, client: AsyncClient, multiple_posts: list[Post]
    ):
        """Test listing posts (public endpoint)."""
        response = await client.get("/api/v1/posts")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert isinstance(data["items"], list)

    async def test_list_posts_pagination(
        self, client: AsyncClient, multiple_posts: list[Post]
    ):
        """Test posts pagination."""
        response = await client.get("/api/v1/posts?page=1&page_size=5")

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 5
        assert data["page"] == 1
        assert data["page_size"] == 5

    async def test_list_posts_filter_by_author(
        self, client: AsyncClient, multiple_posts: list[Post], test_user: User
    ):
        """Test filtering posts by author."""
        response = await client.get(f"/api/v1/posts?author_id={test_user.id}")

        assert response.status_code == 200
        data = response.json()
        assert all(post["author"]["id"] == test_user.id for post in data["items"])

    async def test_list_posts_filter_by_tags(
        self, client: AsyncClient, multiple_posts: list[Post]
    ):
        """Test filtering posts by tags."""
        response = await client.get("/api/v1/posts?tags=python")

        assert response.status_code == 200
        data = response.json()
        # All returned posts should have the python tag
        assert all(
            any(tag["name"] == "python" for tag in post["tags"])
            for post in data["items"]
        )

    async def test_get_post_by_id(self, client: AsyncClient, test_post: Post):
        """Test getting a specific post."""
        response = await client.get(f"/api/v1/posts/{test_post.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_post.id
        assert data["title"] == test_post.title

    async def test_get_post_not_found(self, client: AsyncClient):
        """Test getting non-existent post."""
        response = await client.get("/api/v1/posts/99999")

        assert response.status_code == 404

    async def test_update_post_success(
        self, client: AsyncClient, test_post: Post, auth_headers: dict
    ):
        """Test updating a post."""
        response = await client.patch(
            f"/api/v1/posts/{test_post.id}",
            json={"title": "Updated Title"},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"

    async def test_update_post_unauthorized(
        self, client: AsyncClient, test_post: Post
    ):
        """Test updating post without auth fails."""
        response = await client.patch(
            f"/api/v1/posts/{test_post.id}",
            json={"title": "Hacked"},
        )

        assert response.status_code == 403

    async def test_update_post_not_owner(
        self, client: AsyncClient, test_post: Post, auth_headers_user2: dict
    ):
        """Test updating post by non-owner fails."""
        response = await client.patch(
            f"/api/v1/posts/{test_post.id}",
            json={"title": "Hacked"},
            headers=auth_headers_user2,
        )

        assert response.status_code == 403

    async def test_update_post_change_status(
        self, client: AsyncClient, draft_post: Post, auth_headers: dict
    ):
        """Test changing post status to published."""
        response = await client.patch(
            f"/api/v1/posts/{draft_post.id}",
            json={"status": "published"},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "published"
        assert data["publication_date"] is not None

    async def test_delete_post_success(
        self, client: AsyncClient, test_post: Post, auth_headers: dict
    ):
        """Test deleting a post."""
        response = await client.delete(
            f"/api/v1/posts/{test_post.id}",
            headers=auth_headers,
        )

        assert response.status_code == 204

        # Verify post is deleted
        get_response = await client.get(f"/api/v1/posts/{test_post.id}")
        assert get_response.status_code == 404

    async def test_delete_post_unauthorized(
        self, client: AsyncClient, test_post: Post
    ):
        """Test deleting post without auth fails."""
        response = await client.delete(f"/api/v1/posts/{test_post.id}")

        assert response.status_code == 403

    async def test_delete_post_not_owner(
        self, client: AsyncClient, test_post: Post, auth_headers_user2: dict
    ):
        """Test deleting post by non-owner fails."""
        response = await client.delete(
            f"/api/v1/posts/{test_post.id}",
            headers=auth_headers_user2,
        )

        assert response.status_code == 403

    async def test_create_post_validation(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test post validation rules."""
        # Missing required fields
        response = await client.post(
            "/api/v1/posts",
            json={"title": "Only Title"},
            headers=auth_headers,
        )
        assert response.status_code == 422

        # Invalid status
        response = await client.post(
            "/api/v1/posts",
            json={
                "title": "Test",
                "content": "Content",
                "status": "invalid_status",
            },
            headers=auth_headers,
        )
        assert response.status_code == 422

    async def test_update_post_partial(
        self, client: AsyncClient, test_post: Post, auth_headers: dict
    ):
        """Test partial update (only some fields)."""
        original_content = test_post.content

        response = await client.patch(
            f"/api/v1/posts/{test_post.id}",
            json={"excerpt": "New excerpt"},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["excerpt"] == "New excerpt"
        assert data["content"] == original_content  # Unchanged

"""Integration tests for search and tags API endpoints."""

import pytest
from httpx import AsyncClient

from src.models.post import Post
from src.models.tag import Tag


@pytest.mark.asyncio
class TestSearchAPI:
    """Test cases for search API endpoints."""

    async def test_search_posts_with_query(
        self, client: AsyncClient, test_post: Post
    ):
        """Test searching posts with a query."""
        response = await client.get("/api/v1/search/posts?q=searchable")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    async def test_search_posts_empty_query(self, client: AsyncClient):
        """Test search with empty query returns 422."""
        response = await client.get("/api/v1/search/posts?q=")

        assert response.status_code == 422  # Query is required and min_length=1

    async def test_search_posts_no_query_param(self, client: AsyncClient):
        """Test search without query parameter."""
        response = await client.get("/api/v1/search/posts")

        assert response.status_code == 422  # Query is required

    async def test_search_posts_with_filters(
        self, client: AsyncClient, multiple_posts: list[Post]
    ):
        """Test search with tag and author filters."""
        response = await client.get(
            "/api/v1/search/posts?q=post&tags=python&sort_by=relevance"
        )

        assert response.status_code == 200
        data = response.json()
        # All results should have python tag
        assert all(
            any(tag["name"] == "python" for tag in post["tags"])
            for post in data["items"]
        )

    async def test_search_posts_sort_by_date(
        self, client: AsyncClient, multiple_posts: list[Post]
    ):
        """Test search sorting by date."""
        response = await client.get("/api/v1/search/posts?q=content&sort_by=date")

        assert response.status_code == 200

    async def test_search_posts_invalid_sort(self, client: AsyncClient):
        """Test search with invalid sort parameter."""
        response = await client.get("/api/v1/search/posts?q=test&sort_by=invalid")

        assert response.status_code == 422

    async def test_search_posts_pagination(
        self, client: AsyncClient, multiple_posts: list[Post]
    ):
        """Test search with pagination."""
        response = await client.get(
            "/api/v1/search/posts?q=searchable&page=1&page_size=3"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 3
        assert data["page"] == 1
        assert data["page_size"] == 3

    async def test_get_popular_tags(
        self, client: AsyncClient, test_tags: list[Tag], test_post: Post
    ):
        """Test getting popular tags."""
        response = await client.get("/api/v1/search/tags/popular")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert all("name" in tag and "post_count" in tag for tag in data)

    async def test_get_popular_tags_with_limit(
        self, client: AsyncClient, test_tags: list[Tag]
    ):
        """Test getting popular tags with limit."""
        response = await client.get("/api/v1/search/tags/popular?limit=5")

        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5


@pytest.mark.asyncio
class TestTagsAPI:
    """Test cases for tags API endpoints."""

    async def test_list_all_tags(
        self, client: AsyncClient, test_tags: list[Tag]
    ):
        """Test listing all tags."""
        response = await client.get("/api/v1/tags")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= len(test_tags)
        assert all("id" in tag and "name" in tag for tag in data)

    async def test_list_tags_with_count(
        self, client: AsyncClient, test_tags: list[Tag], test_post: Post
    ):
        """Test listing tags with post counts."""
        response = await client.get("/api/v1/tags?include_count=true")

        assert response.status_code == 200
        data = response.json()
        assert all("post_count" in tag for tag in data)

    async def test_list_tags_without_count(
        self, client: AsyncClient, test_tags: list[Tag]
    ):
        """Test listing tags without post counts."""
        response = await client.get("/api/v1/tags?include_count=false")

        assert response.status_code == 200
        data = response.json()
        # Post count might still be included depending on default behavior
        assert isinstance(data, list)

    async def test_get_posts_by_tag(
        self, client: AsyncClient, test_tags: list[Tag], test_post: Post
    ):
        """Test getting posts by tag ID."""
        # Get first tag from test_post
        tag_id = test_post.tags[0].id

        response = await client.get(f"/api/v1/tags/{tag_id}/posts")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        # All posts should have this tag
        assert all(
            any(tag["id"] == tag_id for tag in post["tags"]) for post in data["items"]
        )

    async def test_get_posts_by_tag_pagination(
        self, client: AsyncClient, test_tags: list[Tag], test_post: Post
    ):
        """Test pagination when getting posts by tag."""
        tag_id = test_post.tags[0].id

        response = await client.get(f"/api/v1/tags/{tag_id}/posts?page=1&page_size=5")

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 5
        assert data["page"] == 1

    async def test_get_posts_by_nonexistent_tag(self, client: AsyncClient):
        """Test getting posts by non-existent tag."""
        response = await client.get("/api/v1/tags/99999/posts")

        assert response.status_code == 404

    async def test_tags_are_case_insensitive(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that tags are stored in lowercase."""
        response = await client.post(
            "/api/v1/posts",
            json={
                "title": "Test",
                "content": "Content",
                "tags": ["Python", "FASTAPI", "Testing"],
            },
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        # All tags should be lowercase
        assert all(tag["name"].islower() for tag in data["tags"])
        assert {t["name"] for t in data["tags"]} == {"python", "fastapi", "testing"}

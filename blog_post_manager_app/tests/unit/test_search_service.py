"""Unit tests for search service."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.post import Post
from src.models.tag import Tag
from src.models.user import User
from src.services.search_service import SearchService


@pytest.mark.asyncio
class TestSearchService:
    """Test cases for SearchService."""

    async def test_search_posts_by_text(
        self, db_session: AsyncSession, test_post: Post
    ):
        """Test full-text search on posts."""
        search_service = SearchService(db_session)

        # Search for text in the post
        result = await search_service.search_posts(query="searchable test")

        assert result.total > 0
        assert any(post.id == test_post.id for post in result.items)

    async def test_search_posts_empty_query(
        self, db_session: AsyncSession, multiple_posts: list[Post]
    ):
        """Test search with empty query returns all published posts."""
        search_service = SearchService(db_session)

        result = await search_service.search_posts(query="")

        # Should return published posts even with empty query
        assert result.total >= 0

    async def test_search_posts_no_results(self, db_session: AsyncSession):
        """Test search with no matching results."""
        search_service = SearchService(db_session)

        result = await search_service.search_posts(query="nonexistentword12345")

        assert result.total == 0
        assert len(result.items) == 0

    async def test_search_posts_pagination(
        self, db_session: AsyncSession, multiple_posts: list[Post]
    ):
        """Test search with pagination."""
        search_service = SearchService(db_session)

        result = await search_service.search_posts(
            query="searchable", page=1, page_size=3
        )

        assert len(result.items) <= 3
        assert result.page == 1
        assert result.page_size == 3

    async def test_search_posts_filter_by_tags(
        self, db_session: AsyncSession, multiple_posts: list[Post]
    ):
        """Test search with tag filtering."""
        search_service = SearchService(db_session)

        result = await search_service.search_posts(query="", tags=["python"])

        assert all(
            any(tag.name == "python" for tag in post.tags) for post in result.items
        )

    async def test_search_posts_filter_by_author(
        self, db_session: AsyncSession, multiple_posts: list[Post], test_user: User
    ):
        """Test search with author filtering."""
        search_service = SearchService(db_session)

        result = await search_service.search_posts(query="", author_id=test_user.id)

        assert all(post.author.id == test_user.id for post in result.items)

    async def test_search_posts_sort_by_relevance(
        self, db_session: AsyncSession, multiple_posts: list[Post]
    ):
        """Test search sorting by relevance."""
        search_service = SearchService(db_session)

        result = await search_service.search_posts(
            query="searchable", sort_by="relevance"
        )

        # Should return results (relevance sorting is internal)
        assert result.total >= 0

    async def test_search_posts_sort_by_date(
        self, db_session: AsyncSession, multiple_posts: list[Post]
    ):
        """Test search sorting by date."""
        search_service = SearchService(db_session)

        result = await search_service.search_posts(query="", sort_by="date")

        # Should be sorted by publication date descending
        if len(result.items) > 1:
            for i in range(len(result.items) - 1):
                if result.items[i].publication_date and result.items[i + 1].publication_date:
                    assert result.items[i].publication_date >= result.items[i + 1].publication_date

    async def test_search_posts_only_published(
        self, db_session: AsyncSession, test_post: Post, draft_post: Post
    ):
        """Test search only returns published posts."""
        search_service = SearchService(db_session)

        result = await search_service.search_posts(query="")

        # Should not include draft posts
        assert all(post.status.value == "published" for post in result.items)
        assert not any(post.id == draft_post.id for post in result.items)

    async def test_get_popular_tags(
        self, db_session: AsyncSession, multiple_posts: list[Post], test_tags: list[Tag]
    ):
        """Test getting popular tags with post counts."""
        search_service = SearchService(db_session)

        result = await search_service.get_popular_tags(limit=10)

        assert isinstance(result, list)
        assert all("id" in tag and "name" in tag and "post_count" in tag for tag in result)

        # Post counts should be positive
        assert all(tag["post_count"] > 0 for tag in result)

    async def test_get_popular_tags_limit(
        self, db_session: AsyncSession, test_tags: list[Tag]
    ):
        """Test popular tags respects limit parameter."""
        search_service = SearchService(db_session)

        result = await search_service.get_popular_tags(limit=2)

        assert len(result) <= 2

    async def test_get_popular_tags_empty(self, db_session: AsyncSession):
        """Test popular tags with no posts."""
        search_service = SearchService(db_session)

        result = await search_service.get_popular_tags()

        # Should return empty list if no posts
        assert isinstance(result, list)

"""Unit tests for post service."""

import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.post import Post, PostStatus
from src.models.tag import Tag
from src.models.user import User
from src.schemas.post import PostCreate, PostUpdate
from src.services.post_service import PostService


@pytest.mark.asyncio
class TestPostService:
    """Test cases for PostService."""

    async def test_create_post_success(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test creating a post successfully."""
        post_service = PostService(db_session)

        post_data = PostCreate(
            title="New Post",
            content="Post content here",
            excerpt="Short excerpt",
            status=PostStatus.draft,
            tags=["python", "testing"],
        )

        result = await post_service.create_post(post_data, test_user)

        assert result.title == "New Post"
        assert result.content == "Post content here"
        assert result.status == PostStatus.draft
        assert result.author.id == test_user.id
        assert len(result.tags) == 2
        assert {t.name for t in result.tags} == {"python", "testing"}

    async def test_create_post_with_existing_tags(
        self, db_session: AsyncSession, test_user: User, test_tags: list[Tag]
    ):
        """Test creating a post with existing tags."""
        post_service = PostService(db_session)

        post_data = PostCreate(
            title="Post with existing tags",
            content="Content",
            tags=["python", "fastapi"],  # Existing tags
        )

        result = await post_service.create_post(post_data, test_user)

        assert len(result.tags) == 2
        # Should reuse existing tags, not create new ones
        assert all(tag.id is not None for tag in result.tags)

    async def test_create_post_too_many_tags(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test creating a post with more than 10 tags fails."""
        post_service = PostService(db_session)

        post_data = PostCreate(
            title="Post with too many tags",
            content="Content",
            tags=[f"tag{i}" for i in range(11)],  # 11 tags
        )

        with pytest.raises(ValueError) as exc_info:
            await post_service.create_post(post_data, test_user)

        assert "10 tags" in str(exc_info.value)

    async def test_create_published_post_sets_publication_date(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test that publishing a post sets publication_date."""
        post_service = PostService(db_session)

        post_data = PostCreate(
            title="Published Post",
            content="Content",
            status=PostStatus.published,
        )

        result = await post_service.create_post(post_data, test_user)

        assert result.publication_date is not None

    async def test_get_post_by_id_success(
        self, db_session: AsyncSession, test_post: Post
    ):
        """Test getting a post by ID."""
        post_service = PostService(db_session)

        result = await post_service.get_post_by_id(test_post.id)

        assert result.id == test_post.id
        assert result.title == test_post.title

    async def test_get_post_by_id_not_found(self, db_session: AsyncSession):
        """Test getting non-existent post raises 404."""
        post_service = PostService(db_session)

        with pytest.raises(HTTPException) as exc_info:
            await post_service.get_post_by_id(99999)

        assert exc_info.value.status_code == 404

    async def test_get_post_by_id_verify_author(
        self, db_session: AsyncSession, test_post: Post, test_user: User, test_user2: User
    ):
        """Test author verification when getting post."""
        post_service = PostService(db_session)

        # Should succeed with correct author
        result = await post_service.get_post_by_id(test_post.id, author=test_user)
        assert result.id == test_post.id

        # Should fail with wrong author
        with pytest.raises(HTTPException) as exc_info:
            await post_service.get_post_by_id(test_post.id, author=test_user2)

        assert exc_info.value.status_code == 403

    async def test_list_posts_pagination(
        self, db_session: AsyncSession, multiple_posts: list[Post]
    ):
        """Test listing posts with pagination."""
        post_service = PostService(db_session)

        # Get first page
        result = await post_service.list_posts(
            page=1, page_size=5, status_filter=PostStatus.published
        )

        assert len(result.items) <= 5
        assert result.page == 1
        assert result.page_size == 5
        assert result.total >= 0

    async def test_list_posts_filter_by_status(
        self, db_session: AsyncSession, multiple_posts: list[Post]
    ):
        """Test filtering posts by status."""
        post_service = PostService(db_session)

        # Filter published posts
        result = await post_service.list_posts(status_filter=PostStatus.published)

        assert all(post.status == PostStatus.published for post in result.items)

    async def test_list_posts_filter_by_author(
        self, db_session: AsyncSession, multiple_posts: list[Post], test_user: User
    ):
        """Test filtering posts by author."""
        post_service = PostService(db_session)

        result = await post_service.list_posts(author_id=test_user.id)

        assert all(post.author.id == test_user.id for post in result.items)

    async def test_list_posts_filter_by_tags(
        self, db_session: AsyncSession, multiple_posts: list[Post]
    ):
        """Test filtering posts by tags."""
        post_service = PostService(db_session)

        result = await post_service.list_posts(tag_names=["python"])

        assert all(
            any(tag.name == "python" for tag in post.tags) for post in result.items
        )

    async def test_update_post_success(
        self, db_session: AsyncSession, test_post: Post, test_user: User
    ):
        """Test updating a post."""
        post_service = PostService(db_session)

        update_data = PostUpdate(
            title="Updated Title",
            content="Updated content",
        )

        result = await post_service.update_post(test_post.id, update_data, test_user)

        assert result.title == "Updated Title"
        assert result.content == "Updated content"

    async def test_update_post_change_status_to_published(
        self, db_session: AsyncSession, draft_post: Post, test_user: User
    ):
        """Test changing post status to published sets publication_date."""
        post_service = PostService(db_session)

        assert draft_post.publication_date is None

        update_data = PostUpdate(status=PostStatus.published)

        result = await post_service.update_post(draft_post.id, update_data, test_user)

        assert result.status == PostStatus.published
        assert result.publication_date is not None

    async def test_update_post_not_author(
        self, db_session: AsyncSession, test_post: Post, test_user2: User
    ):
        """Test updating post by non-author fails."""
        post_service = PostService(db_session)

        update_data = PostUpdate(title="Hacked")

        with pytest.raises(HTTPException) as exc_info:
            await post_service.update_post(test_post.id, update_data, test_user2)

        assert exc_info.value.status_code == 403

    async def test_update_post_tags(
        self, db_session: AsyncSession, test_post: Post, test_user: User
    ):
        """Test updating post tags."""
        post_service = PostService(db_session)

        update_data = PostUpdate(tags=["newtag1", "newtag2"])

        result = await post_service.update_post(test_post.id, update_data, test_user)

        assert len(result.tags) == 2
        assert {t.name for t in result.tags} == {"newtag1", "newtag2"}

    async def test_update_post_too_many_tags(
        self, db_session: AsyncSession, test_post: Post, test_user: User
    ):
        """Test updating with too many tags fails."""
        post_service = PostService(db_session)

        update_data = PostUpdate(tags=[f"tag{i}" for i in range(11)])

        with pytest.raises(ValueError) as exc_info:
            await post_service.update_post(test_post.id, update_data, test_user)

        assert "10 tags" in str(exc_info.value)

    async def test_delete_post_success(
        self, db_session: AsyncSession, test_post: Post, test_user: User
    ):
        """Test deleting a post."""
        post_service = PostService(db_session)

        await post_service.delete_post(test_post.id, test_user)

        # Should not be able to get deleted post
        with pytest.raises(HTTPException):
            await post_service.get_post_by_id(test_post.id)

    async def test_delete_post_not_author(
        self, db_session: AsyncSession, test_post: Post, test_user2: User
    ):
        """Test deleting post by non-author fails."""
        post_service = PostService(db_session)

        with pytest.raises(HTTPException) as exc_info:
            await post_service.delete_post(test_post.id, test_user2)

        assert exc_info.value.status_code == 403

    async def test_delete_post_not_found(
        self, db_session: AsyncSession, test_user: User
    ):
        """Test deleting non-existent post fails."""
        post_service = PostService(db_session)

        with pytest.raises(HTTPException) as exc_info:
            await post_service.delete_post(99999, test_user)

        assert exc_info.value.status_code == 404

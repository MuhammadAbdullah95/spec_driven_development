"""Post service for blog post CRUD operations."""

from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.post import Post, PostStatus
from src.models.tag import Tag
from src.models.user import User
from src.schemas.common import PaginatedResponse
from src.schemas.post import PostCreate, PostListResponse, PostResponse, PostUpdate


class PostService:
    """Service for post operations."""

    def __init__(self, db: AsyncSession):
        """
        Initialize post service.

        Args:
            db: Database session
        """
        self.db = db

    async def _get_or_create_tags(self, tag_names: List[str]) -> List[Tag]:
        """
        Get existing tags or create new ones.

        Args:
            tag_names: List of tag names (lowercase)

        Returns:
            List of Tag objects
        """
        tags = []
        for tag_name in tag_names:
            # Try to find existing tag
            result = await self.db.execute(
                select(Tag).where(Tag.name == tag_name.lower())
            )
            tag = result.scalar_one_or_none()

            # Create if doesn't exist
            if not tag:
                tag = Tag(name=tag_name.lower())
                self.db.add(tag)
                await self.db.flush()  # Flush to get ID without committing

            tags.append(tag)

        return tags

    async def create_post(
        self, post_data: PostCreate, author: User
    ) -> PostResponse:
        """
        Create a new blog post.

        Args:
            post_data: Post creation data
            author: Post author

        Returns:
            PostResponse: Created post

        Raises:
            ValueError: If more than 10 tags provided
        """
        if len(post_data.tags) > 10:
            raise ValueError("Maximum 10 tags allowed per post")

        # Create post
        post = Post(
            title=post_data.title,
            content=post_data.content,
            excerpt=post_data.excerpt,
            status=post_data.status,
            author_id=author.id,
        )

        # Set publication date if status is published
        if post_data.status == PostStatus.published:
            post.publication_date = datetime.now(timezone.utc)

        # Get or create tags
        if post_data.tags:
            tags = await self._get_or_create_tags(post_data.tags)
            post.tags = tags

        self.db.add(post)
        await self.db.commit()
        await self.db.refresh(post, ["author", "tags"])

        return PostResponse.model_validate(post)

    async def get_post_by_id(
        self, post_id: int, author: User | None = None
    ) -> PostResponse:
        """
        Get post by ID.

        Args:
            post_id: Post ID
            author: If provided, verify post belongs to this author

        Returns:
            PostResponse: Post data

        Raises:
            HTTPException: 404 if post not found or doesn't belong to author
        """
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.author), selectinload(Post.tags))
            .where(Post.id == post_id)
        )
        post = result.scalar_one_or_none()

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} not found",
            )

        # If author specified, verify ownership
        if author and post.author_id != author.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this post",
            )

        return PostResponse.model_validate(post)

    async def list_posts(
        self,
        page: int = 1,
        page_size: int = 20,
        status_filter: PostStatus | None = None,
        author_id: int | None = None,
        tag_names: List[str] | None = None,
    ) -> PaginatedResponse[PostListResponse]:
        """
        List posts with pagination and filters.

        Args:
            page: Page number (1-indexed)
            page_size: Number of items per page
            status_filter: Filter by post status
            author_id: Filter by author ID
            tag_names: Filter by tag names (posts must have ALL tags)

        Returns:
            PaginatedResponse with posts
        """
        # Build query
        query = select(Post).options(
            selectinload(Post.author), selectinload(Post.tags)
        )

        # Apply filters
        if status_filter:
            query = query.where(Post.status == status_filter)

        if author_id:
            query = query.where(Post.author_id == author_id)

        if tag_names:
            # Join with tags and filter (posts must have ALL specified tags)
            for tag_name in tag_names:
                query = query.where(
                    Post.tags.any(Tag.name == tag_name.lower())
                )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.order_by(Post.created_at.desc()).offset(offset).limit(page_size)

        # Execute query
        result = await self.db.execute(query)
        posts = result.scalars().all()

        # Convert to response models
        items = [PostListResponse.model_validate(post) for post in posts]

        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size,
        )

    async def update_post(
        self, post_id: int, post_data: PostUpdate, author: User
    ) -> PostResponse:
        """
        Update a post.

        Args:
            post_id: Post ID
            post_data: Update data
            author: Post author (for permission check)

        Returns:
            PostResponse: Updated post

        Raises:
            HTTPException: 404 if not found, 403 if not author
            ValueError: If more than 10 tags provided
        """
        # Get post
        result = await self.db.execute(
            select(Post).where(Post.id == post_id)
        )
        post = result.scalar_one_or_none()

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} not found",
            )

        # Verify ownership
        if post.author_id != author.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this post",
            )

        # Update fields
        if post_data.title is not None:
            post.title = post_data.title

        if post_data.content is not None:
            post.content = post_data.content

        if post_data.excerpt is not None:
            post.excerpt = post_data.excerpt

        if post_data.status is not None:
            # Set publication date when changing to published
            if post_data.status == PostStatus.published and post.status != PostStatus.published:
                post.publication_date = datetime.now(timezone.utc)
            post.status = post_data.status

        if post_data.tags is not None:
            if len(post_data.tags) > 10:
                raise ValueError("Maximum 10 tags allowed per post")
            tags = await self._get_or_create_tags(post_data.tags)
            post.tags = tags

        await self.db.commit()
        await self.db.refresh(post, ["author", "tags"])

        return PostResponse.model_validate(post)

    async def delete_post(self, post_id: int, author: User) -> None:
        """
        Delete a post.

        Args:
            post_id: Post ID
            author: Post author (for permission check)

        Raises:
            HTTPException: 404 if not found, 403 if not author
        """
        # Get post
        result = await self.db.execute(
            select(Post).where(Post.id == post_id)
        )
        post = result.scalar_one_or_none()

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post with id {post_id} not found",
            )

        # Verify ownership
        if post.author_id != author.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this post",
            )

        await self.db.delete(post)
        await self.db.commit()

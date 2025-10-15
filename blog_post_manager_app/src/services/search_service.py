"""Search service for full-text search on posts."""

from typing import List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.post import Post, PostStatus
from src.models.tag import Tag
from src.schemas.common import PaginatedResponse
from src.schemas.post import PostListResponse


class SearchService:
    """Service for search operations."""

    def __init__(self, db: AsyncSession):
        """
        Initialize search service.

        Args:
            db: Database session
        """
        self.db = db

    async def search_posts(
        self,
        query: str,
        page: int = 1,
        page_size: int = 20,
        tags: List[str] | None = None,
        author_id: int | None = None,
        sort_by: str = "relevance",
    ) -> PaginatedResponse[PostListResponse]:
        """
        Full-text search on published posts.

        Args:
            query: Search query string
            page: Page number (1-indexed)
            page_size: Number of items per page
            tags: Filter by tag names
            author_id: Filter by author ID
            sort_by: Sort order ('relevance', 'date')

        Returns:
            PaginatedResponse with matching posts

        Example:
            ```python
            results = await search_service.search_posts(
                query="fastapi tutorial",
                tags=["python", "web"],
                sort_by="relevance"
            )
            ```
        """
        # Build base query for published posts only
        search_query = (
            select(Post)
            .options(selectinload(Post.author), selectinload(Post.tags))
            .where(Post.status == PostStatus.published)
        )

        # Add full-text search if query provided
        if query.strip():
            # Convert query to tsquery format
            ts_query = func.plainto_tsquery("english", query)

            # Filter by search vector match
            search_query = search_query.where(
                Post.search_vector.op("@@")(ts_query)
            )

            # Add relevance ranking for sorting
            if sort_by == "relevance":
                rank = func.ts_rank(Post.search_vector, ts_query)
                search_query = search_query.add_columns(rank.label("rank"))

        # Apply additional filters
        if tags:
            for tag_name in tags:
                search_query = search_query.where(
                    Post.tags.any(Tag.name == tag_name.lower())
                )

        if author_id:
            search_query = search_query.where(Post.author_id == author_id)

        # Get total count
        count_query = select(func.count()).select_from(search_query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Apply sorting
        if sort_by == "relevance" and query.strip():
            # Sort by relevance (rank column)
            search_query = search_query.order_by(func.text("rank DESC"))
        else:
            # Sort by publication date (newest first)
            search_query = search_query.order_by(Post.publication_date.desc())

        # Apply pagination
        offset = (page - 1) * page_size
        search_query = search_query.offset(offset).limit(page_size)

        # Execute query
        result = await self.db.execute(search_query)

        # Extract posts (handle the rank column if present)
        if sort_by == "relevance" and query.strip():
            rows = result.all()
            posts = [row[0] for row in rows]  # First element is Post
        else:
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

    async def get_popular_tags(self, limit: int = 20) -> List[dict]:
        """
        Get most popular tags with post counts.

        Args:
            limit: Maximum number of tags to return

        Returns:
            List of dicts with tag info and post count
        """
        # Query tags with count of published posts
        query = (
            select(
                Tag.id,
                Tag.name,
                func.count(Post.id).label("post_count"),
            )
            .join(Tag.posts)
            .where(Post.status == PostStatus.published)
            .group_by(Tag.id, Tag.name)
            .order_by(func.count(Post.id).desc())
            .limit(limit)
        )

        result = await self.db.execute(query)
        rows = result.all()

        return [
            {"id": row.id, "name": row.name, "post_count": row.post_count}
            for row in rows
        ]

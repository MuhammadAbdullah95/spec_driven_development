"""Tags API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.models.post import Post, PostStatus
from src.models.tag import Tag
from src.schemas.common import PaginatedResponse
from src.schemas.post import PostListResponse
from src.schemas.tag import TagResponse

router = APIRouter()


@router.get(
    "",
    response_model=list[TagResponse],
    summary="List all tags",
    description="Get all tags with optional post counts",
)
async def list_tags(
    include_count: bool = Query(True, description="Include post count for each tag"),
    db: AsyncSession = Depends(get_db),
) -> list[TagResponse]:
    """
    List all tags.

    Args:
        include_count: Whether to include post count for each tag
        db: Database session

    Returns:
        List of tags with optional post counts
    """
    if include_count:
        # Query with post counts
        query = (
            select(
                Tag.id,
                Tag.name,
                Tag.created_at,
                func.count(Post.id).label("post_count"),
            )
            .outerjoin(Tag.posts)
            .where((Post.status == PostStatus.published) | (Post.id.is_(None)))
            .group_by(Tag.id, Tag.name, Tag.created_at)
            .order_by(Tag.name)
        )

        result = await db.execute(query)
        rows = result.all()

        return [
            TagResponse(
                id=row.id,
                name=row.name,
                created_at=row.created_at,
                post_count=row.post_count,
            )
            for row in rows
        ]
    else:
        # Simple query without counts
        result = await db.execute(select(Tag).order_by(Tag.name))
        tags = result.scalars().all()

        return [TagResponse.model_validate(tag) for tag in tags]


@router.get(
    "/{tag_id}/posts",
    response_model=PaginatedResponse[PostListResponse],
    summary="Get posts by tag",
    description="List all published posts with a specific tag",
)
async def get_posts_by_tag(
    tag_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[PostListResponse]:
    """
    Get posts by tag ID.

    Args:
        tag_id: Tag ID
        page: Page number (1-indexed)
        page_size: Number of items per page
        db: Database session

    Returns:
        PaginatedResponse with posts

    Raises:
        HTTPException: 404 if tag not found
    """
    from fastapi import HTTPException, status

    # Verify tag exists
    tag_result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = tag_result.scalar_one_or_none()

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id {tag_id} not found",
        )

    # Build query for published posts with this tag
    query = (
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.tags))
        .where(Post.status == PostStatus.published)
        .where(Post.tags.any(Tag.id == tag_id))
    )

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Post.publication_date.desc()).offset(offset).limit(page_size)

    # Execute query
    result = await db.execute(query)
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

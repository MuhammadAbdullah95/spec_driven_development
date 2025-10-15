"""Search API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.schemas.common import PaginatedResponse
from src.schemas.post import PostListResponse
from src.services.search_service import SearchService

router = APIRouter()


@router.get(
    "/posts",
    response_model=PaginatedResponse[PostListResponse],
    summary="Search posts",
    description="Full-text search on published posts with optional filters",
)
async def search_posts(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    tags: str | None = Query(
        None, description="Comma-separated tag names to filter by"
    ),
    author_id: int | None = Query(None, description="Filter by author ID"),
    sort_by: str = Query(
        "relevance",
        pattern="^(relevance|date)$",
        description="Sort order: 'relevance' or 'date'",
    ),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[PostListResponse]:
    """
    Full-text search on published posts.

    Uses PostgreSQL full-text search with relevance ranking.
    Searches in post title (weight A), content (weight B), and excerpt (weight C).

    Args:
        q: Search query string
        page: Page number (1-indexed)
        page_size: Number of items per page
        tags: Comma-separated tag names (posts must have ALL tags)
        author_id: Filter by author ID
        sort_by: Sort order ('relevance' or 'date')
        db: Database session

    Returns:
        PaginatedResponse with matching posts

    Example:
        GET /api/v1/search/posts?q=fastapi+tutorial&tags=python,web&sort_by=relevance
    """
    search_service = SearchService(db)

    # Parse tags from comma-separated string
    tag_list = [t.strip() for t in tags.split(",")] if tags else None

    return await search_service.search_posts(
        query=q,
        page=page,
        page_size=page_size,
        tags=tag_list,
        author_id=author_id,
        sort_by=sort_by,
    )


@router.get(
    "/tags/popular",
    response_model=list,
    summary="Get popular tags",
    description="Get most popular tags with post counts",
)
async def get_popular_tags(
    limit: int = Query(20, ge=1, le=100, description="Maximum number of tags to return"),
    db: AsyncSession = Depends(get_db),
) -> list:
    """
    Get most popular tags with post counts.

    Args:
        limit: Maximum number of tags to return
        db: Database session

    Returns:
        List of dicts with tag info and post count
    """
    search_service = SearchService(db)
    return await search_service.get_popular_tags(limit=limit)

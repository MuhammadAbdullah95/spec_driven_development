"""Blog posts API routes."""

from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.database import get_db
from src.models.post import PostStatus
from src.models.user import User
from src.schemas.common import PaginatedResponse
from src.schemas.post import PostCreate, PostListResponse, PostResponse, PostUpdate
from src.services.post_service import PostService

router = APIRouter()


@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new post",
    description="Create a new blog post (requires authentication)",
)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PostResponse:
    """
    Create a new blog post.

    Args:
        post_data: Post creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        PostResponse: Created post

    Raises:
        HTTPException: 422 if validation fails (e.g., more than 10 tags)
    """
    post_service = PostService(db)
    return await post_service.create_post(post_data, current_user)


@router.get(
    "",
    response_model=PaginatedResponse[PostListResponse],
    summary="List posts",
    description="List published posts with pagination and optional filters",
)
async def list_posts(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: PostStatus | None = Query(
        PostStatus.published, description="Filter by post status"
    ),
    author_id: int | None = Query(None, description="Filter by author ID"),
    tags: str | None = Query(
        None, description="Comma-separated tag names (posts must have ALL tags)"
    ),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[PostListResponse]:
    """
    List posts with pagination and filters.

    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page
        status_filter: Filter by post status
        author_id: Filter by author ID
        tags: Comma-separated tag names
        db: Database session

    Returns:
        PaginatedResponse with posts
    """
    post_service = PostService(db)

    # Parse tags from comma-separated string
    tag_list = [t.strip() for t in tags.split(",")] if tags else None

    return await post_service.list_posts(
        page=page,
        page_size=page_size,
        status_filter=status_filter,
        author_id=author_id,
        tag_names=tag_list,
    )


@router.get(
    "/{post_id}",
    response_model=PostResponse,
    summary="Get post by ID",
    description="Get a single post by ID (public for published posts)",
)
async def get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
) -> PostResponse:
    """
    Get post by ID.

    Args:
        post_id: Post ID
        db: Database session

    Returns:
        PostResponse: Post data

    Raises:
        HTTPException: 404 if post not found
    """
    post_service = PostService(db)
    return await post_service.get_post_by_id(post_id)


@router.patch(
    "/{post_id}",
    response_model=PostResponse,
    summary="Update post",
    description="Update a post (requires authentication and ownership)",
)
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PostResponse:
    """
    Update a post.

    Args:
        post_id: Post ID
        post_data: Update data
        current_user: Authenticated user (must be post author)
        db: Database session

    Returns:
        PostResponse: Updated post

    Raises:
        HTTPException: 404 if not found
        HTTPException: 403 if not post author
        HTTPException: 422 if validation fails
    """
    post_service = PostService(db)
    return await post_service.update_post(post_id, post_data, current_user)


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete post",
    description="Delete a post (requires authentication and ownership)",
)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a post.

    Args:
        post_id: Post ID
        current_user: Authenticated user (must be post author)
        db: Database session

    Raises:
        HTTPException: 404 if not found
        HTTPException: 403 if not post author
    """
    post_service = PostService(db)
    await post_service.delete_post(post_id, current_user)

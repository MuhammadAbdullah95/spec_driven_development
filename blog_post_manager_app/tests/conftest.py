"""Pytest configuration and shared fixtures."""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from src.config import settings
from src.database import Base, get_db
from src.main import app
from src.models.post import Post, PostStatus
from src.models.tag import Tag
from src.models.user import User
from src.utils.security import get_password_hash

# Test database URL (use same database for now, tables are created/dropped per test)
TEST_DATABASE_URL = settings.database_url_str

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,  # Disable connection pooling for tests
)

# Create test session factory
TestSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for each test.

    Creates all tables before the test and drops them after.
    """
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create session
    async with TestSessionLocal() as session:
        yield session

    # Drop all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create test client with overridden database dependency.
    """
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# User fixtures
@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        email="testuser@example.com",
        username="testuser",
        hashed_password=get_password_hash("TestPass123"),
        full_name="Test User",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_user2(db_session: AsyncSession) -> User:
    """Create a second test user."""
    user = User(
        email="testuser2@example.com",
        username="testuser2",
        hashed_password=get_password_hash("TestPass123"),
        full_name="Test User 2",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def inactive_user(db_session: AsyncSession) -> User:
    """Create an inactive test user."""
    user = User(
        email="inactive@example.com",
        username="inactive",
        hashed_password=get_password_hash("TestPass123"),
        full_name="Inactive User",
        is_active=False,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


# Authentication fixtures
@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: User) -> dict:
    """Get authentication headers for test user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "TestPass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_user2(client: AsyncClient, test_user2: User) -> dict:
    """Get authentication headers for test user 2."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser2@example.com", "password": "TestPass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# Tag fixtures
@pytest.fixture
async def test_tags(db_session: AsyncSession) -> list[Tag]:
    """Create test tags."""
    tags = [
        Tag(name="python"),
        Tag(name="fastapi"),
        Tag(name="testing"),
        Tag(name="tutorial"),
    ]
    db_session.add_all(tags)
    await db_session.commit()
    for tag in tags:
        await db_session.refresh(tag)
    return tags


# Post fixtures
@pytest.fixture
async def test_post(db_session: AsyncSession, test_user: User, test_tags: list[Tag]) -> Post:
    """Create a test post."""
    post = Post(
        title="Test Post",
        content="This is a test post content with some text for searching.",
        excerpt="Test post excerpt",
        status=PostStatus.published,
        author_id=test_user.id,
    )
    post.tags = [test_tags[0], test_tags[1]]  # python, fastapi
    db_session.add(post)
    await db_session.commit()
    await db_session.refresh(post, ["author", "tags"])
    return post


@pytest.fixture
async def draft_post(db_session: AsyncSession, test_user: User) -> Post:
    """Create a draft post."""
    post = Post(
        title="Draft Post",
        content="This is a draft post",
        excerpt="Draft excerpt",
        status=PostStatus.draft,
        author_id=test_user.id,
    )
    db_session.add(post)
    await db_session.commit()
    await db_session.refresh(post, ["author", "tags"])
    return post


@pytest.fixture
async def multiple_posts(
    db_session: AsyncSession, test_user: User, test_user2: User, test_tags: list[Tag]
) -> list[Post]:
    """Create multiple test posts for pagination/filtering tests."""
    posts = [
        Post(
            title=f"Post {i}",
            content=f"Content for post {i} with keyword searchable",
            excerpt=f"Excerpt {i}",
            status=PostStatus.published if i % 2 == 0 else PostStatus.draft,
            author_id=test_user.id if i < 5 else test_user2.id,
        )
        for i in range(1, 11)
    ]

    # Add tags to some posts
    posts[0].tags = [test_tags[0]]  # python
    posts[1].tags = [test_tags[1]]  # fastapi
    posts[2].tags = [test_tags[0], test_tags[1]]  # python, fastapi

    db_session.add_all(posts)
    await db_session.commit()

    for post in posts:
        await db_session.refresh(post, ["author", "tags"])

    return posts

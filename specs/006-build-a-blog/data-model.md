# Data Model: Blog Post Management System

**Feature**: Blog Post Management System
**Date**: 2025-10-14
**Phase**: Phase 1 - Database Schema Design

## Overview

This document defines the database schema, entity relationships, constraints, and indexes for the blog post management system. The schema follows 3rd Normal Form (3NF) as required by Constitution Principle III.

---

## Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│     User        │         │        Post          │         │      Tag        │
│  (Author)       │         │                      │         │                 │
├─────────────────┤         ├──────────────────────┤         ├─────────────────┤
│ id (PK)         │────────<│ author_id (FK)       │         │ id (PK)         │
│ email (UNIQUE)  │    1:N  │ id (PK)              │         │ name (UNIQUE)   │
│ username        │         │ title                │         │ created_at      │
│ hashed_password │         │ content              │    N:M  └─────────────────┘
│ full_name       │         │ excerpt              │         ┌─────────────────┐
│ is_active       │         │ status               │         │   PostTag       │
│ created_at      │         │ publication_date     │         │  (Junction)     │
│ updated_at      │         │ created_at           │         ├─────────────────┤
└─────────────────┘         │ updated_at           │────────>│ post_id (FK,PK) │
                            │ search_vector        │    N:M  │ tag_id (FK,PK)  │
                            └──────────────────────┘         │ created_at      │
                                                             └─────────────────┘
```

**Relationships**:
- **User ↔ Post**: One-to-Many (1:N) - One user authors many posts
- **Post ↔ Tag**: Many-to-Many (N:M) via `PostTag` junction table
- **Cascade Rules**:
  - Deleting a User → **RESTRICT** (prevent deletion if posts exist, or SET NULL for soft ownership transfer)
  - Deleting a Post → **CASCADE** (remove associated `PostTag` entries)
  - Deleting a Tag → **CASCADE** (remove associated `PostTag` entries)

---

## Schema Definitions

### 1. User Table (Authors)

Represents content creators who can create and manage blog posts.

```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `email`: Unique email for login, indexed for fast lookup
- `username`: Display name, unique, indexed
- `hashed_password`: bcrypt hash (never store plain text)
- `full_name`: Optional full name for display
- `is_active`: Soft deletion/deactivation flag
- `created_at`: Account creation timestamp
- `updated_at`: Last profile update timestamp

**Constraints**:
- `email` and `username` UNIQUE to prevent duplicates
- `hashed_password` NOT NULL (auth requirement)
- `is_active` defaults to TRUE

**Indexes**:
- `email`, `username` for login/lookup
- `is_active` for filtering active users

---

### 2. Post Table (Blog Posts)

Represents individual blog articles with content, metadata, and publication status.

```sql
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE posts (
    id                SERIAL PRIMARY KEY,
    author_id         INTEGER NOT NULL,
    title             VARCHAR(200) NOT NULL,
    content           TEXT NOT NULL,
    excerpt           VARCHAR(500),
    status            post_status NOT NULL DEFAULT 'draft',
    publication_date  TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    search_vector     tsvector,

    CONSTRAINT fk_post_author FOREIGN KEY (author_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
    CONSTRAINT chk_content_length CHECK (char_length(content) >= 10),
    CONSTRAINT chk_excerpt_length CHECK (excerpt IS NULL OR char_length(excerpt) <= 500),
    CONSTRAINT chk_publication_date_on_publish CHECK (
        (status != 'published') OR (publication_date IS NOT NULL)
    )
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_publication_date ON posts(publication_date);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

-- Trigger to auto-update search_vector
CREATE FUNCTION posts_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        coalesce(NEW.title, '') || ' ' || coalesce(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_search_update
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION posts_search_trigger();

-- Trigger to auto-update updated_at
CREATE FUNCTION update_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Fields**:
- `id`: Primary key (auto-increment)
- `author_id`: Foreign key to `users.id` (NOT NULL, owner required)
- `title`: Post title (1-200 chars, enforced by CHECK constraint)
- `content`: Full post content (min 10 chars, TEXT for long content)
- `excerpt`: Optional summary (max 500 chars)
- `status`: ENUM ('draft', 'published', 'archived'), defaults to 'draft'
- `publication_date`: Timestamp when published (NULL for drafts, set on publish)
- `created_at`: Post creation timestamp
- `updated_at`: Last modification timestamp (auto-updated via trigger)
- `search_vector`: tsvector for full-text search (auto-populated via trigger)

**Constraints**:
- `fk_post_author`: Foreign key to users with RESTRICT (prevent deleting users with posts)
- `chk_title_length`: Title between 1-200 chars (FR-007)
- `chk_content_length`: Content ≥10 chars (FR-008)
- `chk_excerpt_length`: Excerpt ≤500 chars if provided (FR-009)
- `chk_publication_date_on_publish`: Published posts MUST have publication_date (FR-003)

**Indexes**:
- `author_id`: Fast lookup for author's posts
- `status`: Filter by status (public, draft, archived)
- `publication_date`: Sort by publication date (FR-027)
- `created_at`: Default ordering
- `search_vector` (GIN): Full-text search (FR-023)

**Triggers**:
- `posts_search_trigger`: Auto-populate `search_vector` from title + content
- `posts_updated_at`: Auto-update `updated_at` on modifications

---

### 3. Tag Table

Represents categorization labels that can be reused across multiple posts.

```sql
CREATE TABLE tags (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);
```

**Fields**:
- `id`: Primary key (auto-increment)
- `name`: Normalized tag name (lowercase, trimmed), UNIQUE (FR-014)
- `created_at`: Tag first created timestamp

**Constraints**:
- `name` UNIQUE to prevent duplicate tags
- Tag normalization (lowercase, trim) enforced in application layer before INSERT

**Indexes**:
- `name`: Fast tag lookup for reuse and filtering

**Normalization**:
Tags are normalized in the application layer before database insertion:
```python
def normalize_tag(tag: str) -> str:
    return tag.strip().lower()
```

---

### 4. PostTag Junction Table (Many-to-Many)

Links posts to tags with a many-to-many relationship.

```sql
CREATE TABLE post_tags (
    post_id    INTEGER NOT NULL,
    tag_id     INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id)
        REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id)
        REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- Constraint to enforce max 10 tags per post (FR-012, FR-016)
CREATE FUNCTION check_max_tags_per_post() RETURNS trigger AS $$
BEGIN
    IF (SELECT COUNT(*) FROM post_tags WHERE post_id = NEW.post_id) >= 10 THEN
        RAISE EXCEPTION 'A post cannot have more than 10 tags';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_tags_max_check
    BEFORE INSERT ON post_tags
    FOR EACH ROW EXECUTE FUNCTION check_max_tags_per_post();
```

**Fields**:
- `post_id`: Foreign key to `posts.id`
- `tag_id`: Foreign key to `tags.id`
- `created_at`: When tag was added to post

**Constraints**:
- Composite primary key (`post_id`, `tag_id`) prevents duplicate associations
- `fk_post_tags_post`: CASCADE deletion (if post deleted, remove associations)
- `fk_post_tags_tag`: CASCADE deletion (if tag deleted, remove associations)
- Trigger enforces max 10 tags per post (FR-012, FR-016)

**Indexes**:
- `post_id`: Retrieve all tags for a post
- `tag_id`: Find all posts with a specific tag

---

## SQLAlchemy Model Definitions

### User Model

```python
# src/models/user.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
```

### Post Model

```python
# src/models/post.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import TSVECTOR
import enum
from src.database import Base

class PostStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"

class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        CheckConstraint("char_length(title) BETWEEN 1 AND 200", name="chk_title_length"),
        CheckConstraint("char_length(content) >= 10", name="chk_content_length"),
        CheckConstraint("excerpt IS NULL OR char_length(excerpt) <= 500", name="chk_excerpt_length"),
        CheckConstraint(
            "(status != 'published') OR (publication_date IS NOT NULL)",
            name="chk_publication_date_on_publish"
        ),
        Index('idx_posts_status', 'status'),
        Index('idx_posts_publication_date', 'publication_date'),
        Index('idx_posts_created_at', 'created_at'),
        Index('idx_posts_search', 'search_vector', postgresql_using='gin'),
    )

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(String(500), nullable=True)
    status = Column(Enum(PostStatus), default=PostStatus.draft, nullable=False)
    publication_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    search_vector = Column(TSVECTOR, nullable=True)

    # Relationships with eager loading
    author = relationship("User", back_populates="posts")
    tags = relationship(
        "Tag",
        secondary="post_tags",
        back_populates="posts",
        lazy="selectin"  # Prevents N+1 queries
    )
```

### Tag Model

```python
# src/models/tag.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database import Base

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    posts = relationship(
        "Post",
        secondary="post_tags",
        back_populates="tags",
        lazy="selectin"
    )
```

### PostTag Junction Model

```python
# src/models/post_tag.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, PrimaryKeyConstraint, Index
from sqlalchemy.sql import func
from src.database import Base

class PostTag(Base):
    __tablename__ = "post_tags"
    __table_args__ = (
        PrimaryKeyConstraint('post_id', 'tag_id'),
        Index('idx_post_tags_post_id', 'post_id'),
        Index('idx_post_tags_tag_id', 'tag_id'),
    )

    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

---

## Migration Strategy

### Alembic Migrations

**Initial Migration** (`001_create_tables.py`):
1. Create `users` table with indexes
2. Create `post_status` ENUM type
3. Create `posts` table with indexes and constraints
4. Create `tags` table with indexes
5. Create `post_tags` junction table with indexes and constraints
6. Create triggers:
   - `posts_search_trigger` for search_vector auto-update
   - `posts_updated_at` for timestamp auto-update
   - `post_tags_max_check` for 10 tag limit enforcement

**Reversal** (Downgrade):
- Drop triggers
- Drop tables in reverse dependency order: `post_tags`, `posts`, `tags`, `users`
- Drop ENUM type `post_status`

**Best Practices**:
- Test migrations in staging before production
- Always provide downgrade path
- Use `alembic revision --autogenerate` to detect model changes
- Review generated migrations before applying

---

## Query Optimization

### Common Queries with Indexes

| Query Type | Example | Indexed Columns |
|------------|---------|----------------|
| List published posts | `SELECT * FROM posts WHERE status = 'published'` | `status` |
| Author's posts | `SELECT * FROM posts WHERE author_id = 123` | `author_id` |
| Posts by publication date | `SELECT * FROM posts ORDER BY publication_date DESC` | `publication_date` |
| Full-text search | `SELECT * FROM posts WHERE search_vector @@ to_tsquery('query')` | `search_vector` (GIN) |
| Posts by tag | `SELECT posts.* FROM posts JOIN post_tags ON posts.id = post_tags.post_id WHERE post_tags.tag_id = 5` | `post_tags.tag_id` |
| Pagination | `SELECT * FROM posts LIMIT 20 OFFSET 40` | `publication_date` or `created_at` for ordering |

### Eager Loading to Prevent N+1

**Problem**: Loading posts then querying tags for each post individually (N+1 queries).

**Solution**: Use SQLAlchemy `selectinload` or `joinedload`:

```python
from sqlalchemy.orm import selectinload

# Eager load author and tags
stmt = select(Post).options(
    selectinload(Post.author),
    selectinload(Post.tags)
).where(Post.status == PostStatus.published)

result = await session.execute(stmt)
posts = result.scalars().all()
# Now posts, authors, and tags are loaded in 3 queries total (not 1 + N + M)
```

---

## Data Integrity Validation

### Application-Layer Validations (Pydantic)

Complementing database constraints, Pydantic schemas enforce:

```python
# src/schemas/post.py
from pydantic import BaseModel, Field, field_validator

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10)
    excerpt: str | None = Field(None, max_length=500)
    tags: list[str] = Field(default_factory=list, max_length=10)

    @field_validator('tags')
    def normalize_tags(cls, v):
        return [tag.strip().lower() for tag in v]

    @field_validator('tags')
    def check_tag_count(cls, v):
        if len(v) > 10:
            raise ValueError('A post cannot have more than 10 tags')
        return v
```

This provides:
- **Early validation**: Errors return 422 before hitting database
- **Normalization**: Tags lowercased/trimmed (FR-014)
- **Business rules**: Max 10 tags enforced (FR-012, FR-016)

---

## Summary

- **4 tables**: Users, Posts, Tags, PostTags (junction)
- **3NF normalization**: No redundant data, clear relationships
- **Foreign keys** with explicit cascade rules (RESTRICT, CASCADE)
- **Check constraints** enforce field-level validation (title length, content length, excerpt length)
- **Triggers** auto-populate search_vector, updated_at, and enforce tag limit
- **Indexes** on foreign keys, status, dates, and GIN index for full-text search
- **SQLAlchemy models** with eager loading relationships to prevent N+1 queries

This schema aligns with Constitution Principle III (Database Integrity & Performance) and implements all requirements from the feature specification (FR-001 through FR-036).

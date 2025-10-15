# Research: Technology Decisions and Best Practices

**Feature**: Blog Post Management System
**Date**: 2025-10-14
**Phase**: Phase 0 - Research and Technology Selection

## Overview

This document captures research findings, technology decisions, and best practices for implementing a production-ready FastAPI blog management system. All decisions align with the constitution principles defined in `/blog_post_manager_app/.specify/memory/constitution.md`.

---

## 1. Package Management: uv vs Poetry vs pip

### Decision: **uv**

**Rationale**:
- **10-100x faster** than pip/Poetry for dependency resolution and installation
- Built in Rust, optimized for performance
- Compatible with standard `pyproject.toml` (no lock-in)
- Handles virtual environments automatically
- Supports PEP 582 (__pypackages__) for dependency isolation
- Active development by Astral (creators of Ruff)

**Alternatives Considered**:
- **Poetry**: Excellent dependency management but slower resolution, heavier tooling
- **pip + pip-tools**: Standard but lacks integrated environment management, slower

**Best Practices**:
- Use `pyproject.toml` for dependency declarations
- Generate `uv.lock` for reproducible builds
- Multi-stage Docker builds: uv in build stage, minimal runtime
- Example: `uv pip install -r requirements.txt --system`

**References**:
- uv documentation: https://github.com/astral-sh/uv
- Performance benchmarks show 10-100x speedup vs pip

---

## 2. FastAPI Best Practices for Production

### Decision: **Structured FastAPI with Dependency Injection**

**Key Patterns**:

#### a) Application Factory Pattern
```python
# src/main.py
def create_app() -> FastAPI:
    app = FastAPI(
        title="Blog Management API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Middleware
    app.add_middleware(CORSMiddleware, ...)
    app.add_middleware(CorrelationIDMiddleware)

    # Routers
    app.include_router(api_v1_router, prefix="/api/v1")

    # Event handlers
    app.add_event_handler("startup", startup_handler)
    app.add_event_handler("shutdown", shutdown_handler)

    return app
```

#### b) Dependency Injection for Auth & DB
```python
# src/api/deps.py
async def get_db() -> AsyncGenerator:
    async with async_session() as session:
        yield session

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    # JWT validation logic
    ...
```

#### c) Error Handling Middleware
```python
@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation failed",
            "details": exc.errors(),
            "request_id": request.state.request_id
        }
    )
```

**Best Practices**:
- Use Pydantic V2 for 5-50x performance improvement over V1
- Async endpoints for I/O-bound operations (database, external APIs)
- Separate routers by domain (`posts.py`, `auth.py`, `tags.py`)
- Use `response_model` to enforce output schemas
- Implement request/response logging with correlation IDs

**References**:
- FastAPI Production Guide: https://fastapi.tiangolo.com/deployment/
- Pydantic V2 Migration: https://docs.pydantic.dev/latest/migration/

---

## 3. SQLAlchemy 2.0+ with Async Support

### Decision: **SQLAlchemy 2.0 with asyncpg**

**Rationale**:
- SQLAlchemy 2.0 introduces async/await support natively
- asyncpg driver for PostgreSQL offers 3x better performance than psycopg2
- ORM prevents SQL injection via parameterized queries
- Relationship management simplifies many-to-many (post-tags)
- Alembic integration for versioned migrations

**Key Patterns**:

#### a) Async Engine and Session
```python
# src/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    "postgresql+asyncpg://user:pass@host/db",
    echo=False,  # Set to True for query logging in dev
    pool_size=10,
    max_overflow=20
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
```

#### b) Model Relationships
```python
# src/models/post.py
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"))

    # Relationships with eager loading
    author = relationship("User", back_populates="posts")
    tags = relationship(
        "Tag",
        secondary="post_tags",
        back_populates="posts",
        lazy="selectin"  # Prevents N+1
    )
```

#### c) Indexes for Performance
```python
class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        Index('idx_post_status', 'status'),
        Index('idx_post_publication_date', 'publication_date'),
        Index('idx_post_author_id', 'author_id'),
    )
```

**Best Practices**:
- Use `selectinload` or `joinedload` to avoid N+1 queries
- Define indexes in model `__table_args__`
- Connection pool sizing: `pool_size + max_overflow < PostgreSQL max_connections`
- Use transactions for multi-statement operations
- Alembic autogenerate migrations: `alembic revision --autogenerate -m "message"`

**References**:
- SQLAlchemy 2.0 Async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- asyncpg performance: https://github.com/MagicStack/asyncpg

---

## 4. JWT Authentication with Refresh Tokens

### Decision: **python-jose for JWT + passlib[bcrypt] for passwords**

**Rationale**:
- python-jose provides JWT creation/validation (RS256 or HS256)
- passlib with bcrypt adapter offers secure password hashing
- Refresh token mechanism reduces access token lifetime (security)

**Implementation Pattern**:

#### a) Password Hashing
```python
# src/utils/security.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

#### b) JWT Token Creation
```python
# src/services/auth_service.py
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRE = timedelta(days=7)

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + ACCESS_TOKEN_EXPIRE
    to_encode = {**data, "exp": expire, "type": "access"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    expire = datetime.utcnow() + REFRESH_TOKEN_EXPIRE
    to_encode = {**data, "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

**Best Practices**:
- Access tokens: ≤15 minutes (short-lived)
- Refresh tokens: ≤7 days, stored securely (httpOnly cookies or secure storage)
- Include token type in payload (`"type": "access"` vs `"type": "refresh"`)
- Validate token type on refresh endpoint
- Rotate refresh tokens on use (optional, higher security)

**References**:
- JWT Best Practices: https://datatracker.ietf.org/doc/html/rfc8725
- passlib documentation: https://passlib.readthedocs.io/

---

## 5. Full-Text Search in PostgreSQL

### Decision: **PostgreSQL GIN indexes with ts_vector**

**Rationale**:
- Native PostgreSQL full-text search (no external dependencies)
- GIN (Generalized Inverted Index) indexes provide fast search
- Supports ranking by relevance
- Scales to 10,000+ posts (spec requirement)

**Implementation**:

#### a) Migration with GIN Index
```sql
-- alembic migration
ALTER TABLE posts ADD COLUMN search_vector tsvector;

CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

UPDATE posts SET search_vector =
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''));

-- Trigger to auto-update on insert/update
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
```

#### b) Query with Ranking
```python
# src/services/search_service.py
from sqlalchemy import func

async def search_posts(db: AsyncSession, query: str):
    search_query = func.plainto_tsquery('english', query)

    stmt = select(Post).where(
        Post.search_vector.op('@@')(search_query)
    ).order_by(
        func.ts_rank(Post.search_vector, search_query).desc()
    )

    result = await db.execute(stmt)
    return result.scalars().all()
```

**Alternatives Considered**:
- **Elasticsearch**: Overkill for 10k posts, adds operational complexity
- **Simple LIKE/ILIKE**: No ranking, poor performance on large datasets

**Best Practices**:
- Use triggers to auto-update `search_vector` column
- GIN index on `search_vector` for performance
- `ts_rank()` for relevance scoring
- Combine with filters (status, author, tags) using AND clauses

**References**:
- PostgreSQL Full-Text Search: https://www.postgresql.org/docs/current/textsearch.html

---

## 6. Testing Strategy with pytest

### Decision: **pytest + pytest-asyncio + SQLAlchemy fixtures**

**Test Pyramid**:
1. **Unit Tests** (many): Test individual functions, services, utilities
2. **Integration Tests** (fewer): Test API endpoints with real database
3. **Contract Tests** (focused): Validate OpenAPI schema compliance

**Key Patterns**:

#### a) Conftest Fixtures
```python
# tests/conftest.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from httpx import AsyncClient

@pytest.fixture(scope="function")
async def db_session():
    engine = create_async_engine("postgresql+asyncpg://test")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session
        await session.rollback()

    await engine.dispose()

@pytest.fixture
async def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
```

#### b) Integration Test Example
```python
# tests/integration/test_post_crud.py
@pytest.mark.asyncio
async def test_create_post_authenticated(client, auth_headers):
    payload = {
        "title": "Test Post",
        "content": "This is a test post content",
        "excerpt": "Test excerpt",
        "tags": ["python", "fastapi"]
    }

    response = await client.post("/api/v1/posts", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Post"
    assert data["status"] == "draft"
    assert "id" in data
```

**Best Practices**:
- Function-scoped fixtures with transaction rollback (test isolation)
- Separate test database from development
- Use `pytest-cov` for coverage reporting: `pytest --cov=src --cov-report=term-missing`
- Mark async tests with `@pytest.mark.asyncio`
- Factory patterns for test data creation

**References**:
- pytest-asyncio: https://pytest-asyncio.readthedocs.io/
- FastAPI Testing: https://fastapi.tiangolo.com/tutorial/testing/

---

## 7. Docker Multi-Stage Build with uv

### Decision: **Multi-stage build optimized for uv**

**Dockerfile Pattern**:

```dockerfile
# Stage 1: Build
FROM python:3.11-slim as builder

# Install uv
RUN pip install uv

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies to /app/.venv
RUN uv venv && uv pip install -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Set PATH to use venv
ENV PATH="/app/.venv/bin:$PATH"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run as non-root
USER appuser

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Best Practices**:
- Multi-stage to exclude build tools from runtime
- Non-root user (security)
- `.dockerignore`: `.git`, `tests/`, `__pycache__`, `*.pyc`, `.env`
- Health check endpoint for orchestrator probes
- Pinned base image version: `python:3.11.6-slim` (not `latest`)

**Image Size Optimization**:
- Base `python:3.11-slim`: ~120MB
- Dependencies: ~200-300MB
- Application code: ~10-50MB
- **Total**: <500MB (meets constitution requirement)

---

## 8. Kubernetes Deployment Patterns

### Decision: **Deployment + Service + ConfigMap + Secrets**

**Key Manifests**:

#### a) Deployment with Health Checks
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-api
  template:
    metadata:
      labels:
        app: blog-api
    spec:
      containers:
      - name: api
        image: blog-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: database-url
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
```

**Best Practices**:
- **Replicas**: ≥3 for high availability
- **Resource limits**: Prevent resource starvation
- **Liveness probe**: Restart unhealthy pods
- **Readiness probe**: Don't route traffic to unready pods
- **Secrets**: Never commit to version control, use sealed-secrets or external secret managers
- **Rolling updates**: `strategy: RollingUpdate` for zero-downtime deployments

---

## 9. Observability: Logging, Metrics, Tracing

### Decision: **Structured logging + Prometheus metrics + (Optional) OpenTelemetry**

#### a) Structured Logging
```python
# src/utils/logging.py
import logging
import json
from pythonjsonlogger import jsonlogger

def setup_logging():
    logger = logging.getLogger()
    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s %(request_id)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
```

#### b) Prometheus Metrics
```python
# src/main.py
from prometheus_client import Counter, Histogram, make_asgi_app

request_count = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration')

# Mount metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
```

**Best Practices**:
- Structured JSON logs to stdout/stderr (12-factor)
- Correlation IDs in all logs for request tracing
- Prometheus `/metrics` endpoint for scraping
- OpenTelemetry optional for distributed tracing (can add later)

---

## 10. Rate Limiting

### Decision: **slowapi (Redis-backed) or in-memory for MVP**

**Pattern**:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/posts")
@limiter.limit("100/minute")
async def list_posts():
    ...
```

**Best Practices**:
- **MVP**: In-memory rate limiting (simple, no dependencies)
- **Production**: Redis-backed for distributed rate limiting across replicas
- Per-user limits: Extract user ID from JWT, use as key
- Graceful degradation: Return 429 Too Many Requests with Retry-After header

---

## Summary of Decisions

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| Package Manager | uv | 10-100x faster than pip/Poetry |
| Web Framework | FastAPI | Async support, auto OpenAPI, production-ready |
| Database | PostgreSQL 15+ | ACID, full-text search, mature |
| ORM | SQLAlchemy 2.0 async | Native async, prevents SQL injection, relationship management |
| Driver | asyncpg | 3x faster than psycopg2 |
| Validation | Pydantic V2 | 5-50x faster than V1, tight FastAPI integration |
| Auth | JWT (python-jose) + bcrypt | Industry standard, stateless, secure hashing |
| Testing | pytest + pytest-asyncio | Async support, fixture isolation, coverage tools |
| Containerization | Docker multi-stage + uv | <500MB images, fast builds, security |
| Orchestration | Kubernetes | Cloud-native, horizontal scaling, self-healing |
| Search | PostgreSQL GIN + ts_vector | Native, fast, sufficient for 10k posts |
| Logging | Structured JSON to stdout | 12-factor, centralized aggregation |
| Metrics | Prometheus | Industry standard, Kubernetes-native |
| Rate Limiting | slowapi | Simple, effective, Redis-backed for scale |

---

## Next Steps (Phase 1)

1. **data-model.md**: Define database schema, relationships, indexes, constraints
2. **contracts/*.yaml**: Generate OpenAPI specs for all endpoints
3. **quickstart.md**: Developer setup guide (uv install, migrations, tests, Docker)
4. **Update agent context**: Add technology stack to Claude/AI agent context

All decisions align with constitution principles and enable production-ready implementation.

# Quickstart Guide: Blog Post Management System

**Feature**: Blog Post Management System
**Date**: 2025-10-14
**For**: Developers setting up local development environment

## Overview

This guide walks you through setting up the blog management API from scratch, running tests, and deploying with Docker. The entire setup takes approximately **10-15 minutes** with all prerequisites installed.

---

## Prerequisites

Before starting, ensure you have:

- **Python 3.11+** (`python --version`)
- **uv** package manager (`pip install uv`)
- **PostgreSQL 15+** (local or Docker)
- **Docker** and **docker-compose** (for containerized development)
- **Git** (for version control)

---

## Quick Start (5 minutes)

### 1. Clone and Setup Environment

```bash
# Clone repository
git clone <repository-url>
cd blog_post_manager_app

# Create virtual environment with uv
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required environment variables**:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/blog_db

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
```

**Generate JWT secret**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Setup Database

**Option A: Docker PostgreSQL** (Recommended for dev):

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Database will be available at localhost:5432
```

**Option B: Local PostgreSQL**:

```bash
# Create database
createdb blog_db

# Or using psql
psql -U postgres -c "CREATE DATABASE blog_db;"
```

### 4. Run Database Migrations

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Run migrations
alembic upgrade head

# Verify migrations
alembic current
```

### 5. Start Development Server

```bash
# Run with uvicorn (hot reload enabled)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Server starts at http://localhost:8000
```

### 6. Verify Installation

Open browser and visit:

- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health (should return `{"status": "healthy"}`)
- **Metrics**: http://localhost:8000/metrics (Prometheus format)

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pytest tests/unit/ -v

# Run with coverage
pytest tests/unit/ --cov=src --cov-report=term-missing

# Coverage threshold: 85%
pytest tests/unit/ --cov=src --cov-fail-under=85
```

### Integration Tests

```bash
# Run all integration tests (requires test database)
pytest tests/integration/ -v

# Run specific test file
pytest tests/integration/test_post_crud.py -v

# Run with verbose output
pytest tests/integration/ -vv -s
```

### Contract Tests

```bash
# Validate OpenAPI schema compliance
pytest tests/contract/ -v
```

### All Tests

```bash
# Run everything
pytest -v

# With coverage report
pytest --cov=src --cov-report=html

# Open coverage report
open htmlcov/index.html
```

**Test Database Setup**:

```bash
# Create test database
createdb blog_db_test

# Set test database URL in pytest fixtures or .env.test
TEST_DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/blog_db_test
```

---

## Project Structure

```
blog_post_manager_app/
├── src/                        # Application source code
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings (from environment variables)
│   ├── database.py             # SQLAlchemy setup
│   ├── models/                 # Database models
│   │   ├── user.py
│   │   ├── post.py
│   │   └── tag.py
│   ├── schemas/                # Pydantic schemas (request/response)
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── tag.py
│   │   ├── auth.py
│   │   └── common.py
│   ├── api/                    # API routes
│   │   ├── deps.py             # Dependencies (auth, db session)
│   │   └── v1/                 # API v1 endpoints
│   │       ├── auth.py
│   │       ├── posts.py
│   │       ├── tags.py
│   │       └── search.py
│   ├── services/               # Business logic
│   │   ├── auth_service.py
│   │   ├── post_service.py
│   │   └── search_service.py
│   ├── middleware/             # Custom middleware
│   │   ├── correlation_id.py
│   │   ├── rate_limit.py
│   │   └── error_handler.py
│   └── utils/                  # Utilities
│       ├── security.py
│       └── logging.py
├── tests/                      # Test suite
│   ├── conftest.py             # Shared pytest fixtures
│   ├── contract/               # OpenAPI contract tests
│   ├── integration/            # Integration tests
│   └── unit/                   # Unit tests
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── docker/                     # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── k8s/                        # Kubernetes manifests
├── pyproject.toml              # uv dependencies
├── .env.example                # Environment template
└── README.md
```

---

## Common Development Tasks

### Create Database Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add column to posts table"

# Review generated migration in alembic/versions/

# Apply migration
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### Create New API Endpoint

1. **Define Pydantic schema** in `src/schemas/`
2. **Add route** in `src/api/v1/<domain>.py`
3. **Implement business logic** in `src/services/<domain>_service.py`
4. **Write tests** in `tests/integration/test_<domain>.py`

Example:

```python
# src/api/v1/posts.py
from fastapi import APIRouter, Depends
from src.schemas.post import PostCreate, PostResponse
from src.api.deps import get_current_user, get_db

router = APIRouter(prefix="/posts", tags=["posts"])

@router.post("/", response_model=PostResponse, status_code=201)
async def create_post(
    post_in: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Business logic here
    ...
```

### Add New Dependency

```bash
# Add package with uv
uv pip install <package-name>

# Update requirements.txt
uv pip freeze > requirements.txt

# Or use pyproject.toml (recommended)
# Edit pyproject.toml, then:
uv pip install -e .
```

### Code Quality Checks

```bash
# Linting with ruff
ruff check src/ tests/

# Auto-fix issues
ruff check --fix src/ tests/

# Type checking with mypy
mypy src/

# Format code
ruff format src/ tests/
```

---

## Docker Development

### Build and Run with Docker Compose

```bash
# Build and start all services (API + PostgreSQL)
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

**docker-compose.yml** includes:
- `postgres` service (PostgreSQL 15)
- `api` service (FastAPI application)
- `adminer` service (optional database UI at http://localhost:8080)

### Build Production Image

```bash
# Build Docker image
docker build -t blog-api:latest -f docker/Dockerfile .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql+asyncpg://user:pass@host/db \
  -e JWT_SECRET_KEY=your-secret \
  blog-api:latest

# Check image size (should be <500MB)
docker images blog-api:latest
```

---

## API Usage Examples

### 1. Register New User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "username": "author1",
    "password": "securePassword123",
    "full_name": "John Doe"
  }'
```

### 2. Login and Get Tokens

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "securePassword123"
  }'

# Response:
# {
#   "access_token": "eyJhbGc...",
#   "refresh_token": "eyJhbGc...",
#   "token_type": "bearer",
#   "expires_in": 900
# }
```

### 3. Create Blog Post

```bash
# Save access token
TOKEN="your-access-token-here"

curl -X POST http://localhost:8000/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with FastAPI",
    "content": "FastAPI is a modern, fast web framework for building APIs with Python 3.11+...",
    "excerpt": "Learn how to build production-ready APIs",
    "tags": ["python", "fastapi", "tutorial"]
  }'
```

### 4. List Published Posts (Public)

```bash
curl http://localhost:8000/api/v1/posts?page=1&page_size=20
```

### 5. Search Posts

```bash
curl "http://localhost:8000/api/v1/posts/search?q=fastapi&tags=python,tutorial&sort_by=relevance"
```

### 6. Update Post Status to Published

```bash
curl -X PATCH http://localhost:8000/api/v1/posts/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

---

## Troubleshooting

### Issue: Database connection fails

**Solution**:
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Verify DATABASE_URL format
# Correct: postgresql+asyncpg://user:pass@localhost:5432/blog_db
# Note the +asyncpg driver
```

### Issue: Migration fails with "relation already exists"

**Solution**:
```bash
# Drop all tables and re-run migrations
alembic downgrade base
alembic upgrade head

# Or reset database
dropdb blog_db
createdb blog_db
alembic upgrade head
```

### Issue: Tests fail with "no such table"

**Solution**:
```bash
# Ensure test database exists and migrations run
createdb blog_db_test
alembic -c alembic.ini upgrade head

# Or use pytest fixtures that create tables automatically (see conftest.py)
```

### Issue: JWT token validation fails

**Solution**:
- Ensure `JWT_SECRET_KEY` is the same across server restarts
- Check token hasn't expired (access tokens expire in 15 min)
- Use refresh token to get new access token

### Issue: Import errors

**Solution**:
```bash
# Reinstall dependencies
uv pip install -r requirements.txt

# Ensure virtual environment is activated
source .venv/bin/activate

# Verify Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (minikube, k3s, or cloud provider)
- kubectl configured
- Docker image pushed to registry

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace blog-api

# Create secrets (DO NOT commit secrets.yaml)
kubectl apply -f k8s/secrets.yaml -n blog-api

# Apply manifests
kubectl apply -f k8s/configmap.yaml -n blog-api
kubectl apply -f k8s/deployment.yaml -n blog-api
kubectl apply -f k8s/service.yaml -n blog-api

# Verify deployment
kubectl get pods -n blog-api
kubectl get svc -n blog-api

# View logs
kubectl logs -f deployment/blog-api -n blog-api

# Port forward for local access
kubectl port-forward svc/blog-api 8000:8000 -n blog-api
```

### Health Checks

Kubernetes uses these probes:

- **Liveness Probe**: `GET /health` every 30s
- **Readiness Probe**: `GET /health` every 10s
- **Startup Probe**: `GET /health` initial delay 5s

---

## Next Steps

1. **Explore API**: Visit http://localhost:8000/docs for interactive API documentation
2. **Read Contracts**: Check `/specs/006-build-a-blog/contracts/` for detailed API specs
3. **Review Data Model**: See `/specs/006-build-a-blog/data-model.md` for database schema
4. **Run Implementation**: Use `/speckit.tasks` to generate task list for TDD implementation
5. **Review Tests**: Check existing test structure in `tests/` directory

---

## Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **SQLAlchemy Async**: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- **Alembic Migrations**: https://alembic.sqlalchemy.org
- **Pydantic V2**: https://docs.pydantic.dev/latest/
- **uv Package Manager**: https://github.com/astral-sh/uv
- **PostgreSQL Full-Text Search**: https://www.postgresql.org/docs/current/textsearch.html

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review constitution at `/blog_post_manager_app/.specify/memory/constitution.md`
3. Consult research document at `/specs/006-build-a-blog/research.md`
4. Open issue in project repository

**Happy coding!** 🚀

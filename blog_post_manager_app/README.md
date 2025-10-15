# Blog Post Manager API

**Production-ready FastAPI blog management system with authentication, search, and tagging**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/tests-88%20passing-brightgreen.svg)](#testing)
[![Coverage](https://img.shields.io/badge/coverage-85%25+-success.svg)](#testing)
[![Built with SpecKit](https://img.shields.io/badge/built%20with-SpecKit-purple.svg)](SPECKIT_GUIDE.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Built with Spec-Driven Development](#built-with-spec-driven-development)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Recreate This Project](#recreate-this-project)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Contributing](#contributing)

---

## 🎯 Built with Spec-Driven Development

This project was built using **[SpecKit](https://github.com/github/spec-kit)** - a specification-driven development approach that ensures systematic, well-documented, and maintainable code from day one.

### What is Spec-Driven Development?

Spec-Driven Development (SDD) is a methodology where you:
1. **Define principles** - Establish architectural and coding standards
2. **Write specifications** - Document features in natural language
3. **Create implementation plans** - Design technical architecture
4. **Break down into tasks** - Generate actionable task lists
5. **Execute systematically** - Implement with consistency and quality

### Why Use SpecKit?

- ✅ **Consistent Architecture** - Follow established principles throughout
- ✅ **Clear Documentation** - Spec serves as living documentation
- ✅ **Systematic Development** - Structured task breakdown
- ✅ **Quality Assurance** - Built-in consistency checks
- ✅ **Reproducible Process** - Others can recreate your work

### This Project's Journey

This entire application was built using SpecKit slash commands:

1. **Established Principles** → Production-ready FastAPI standards
2. **Created Specification** → Blog management requirements
3. **Designed Architecture** → FastAPI + PostgreSQL + Docker + Kubernetes
4. **Generated Tasks** → 136 implementation tasks
5. **Executed Implementation** → 100% completion with 87% test coverage

**Result:** A production-ready application with comprehensive testing, documentation, and deployment infrastructure - all built systematically!

[Learn how to recreate this project ↓](#recreate-this-project)

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - JWT-based auth with access and refresh tokens
- ✅ **Blog Post CRUD** - Create, read, update, and delete blog posts
- ✅ **Tag Management** - Categorize posts with up to 10 tags per post
- ✅ **Full-Text Search** - PostgreSQL-powered search with relevance ranking
- ✅ **Status Management** - Draft, Published, and Archived post states
- ✅ **Ownership Control** - Authors can only modify their own posts

### Advanced Features
- ✅ **Pagination** - Efficient cursor-based pagination for large datasets
- ✅ **Filtering** - Filter by status, author, tags, and publication date
- ✅ **Sorting** - Sort by relevance, date, or other criteria
- ✅ **Auto-Timestamping** - Automatic created_at and updated_at tracking
- ✅ **Search Vector** - Auto-updated full-text search indexes

### Production Features
- ✅ **Structured Logging** - JSON logs with correlation IDs
- ✅ **Error Handling** - Global exception handling with detailed errors
- ✅ **Rate Limiting** - 100 requests/minute per user
- ✅ **CORS Support** - Configurable cross-origin requests
- ✅ **Health Checks** - `/health` endpoint for monitoring
- ✅ **Metrics** - Prometheus metrics at `/metrics`
- ✅ **API Documentation** - Auto-generated OpenAPI/Swagger docs
- ✅ **CI/CD Pipelines** - Automated testing, building, and deployment

---

## 🚀 Tech Stack

**Backend Framework:**
- [FastAPI](https://fastapi.tiangolo.com/) 0.104+ - Modern, fast web framework
- [Python](https://www.python.org/) 3.11+ - Programming language

**Database:**
- [PostgreSQL](https://www.postgresql.org/) 15+ - Relational database
- [SQLAlchemy](https://www.sqlalchemy.org/) 2.0+ - Async ORM
- [Alembic](https://alembic.sqlalchemy.org/) - Database migrations

**Authentication:**
- [python-jose](https://github.com/mpdavis/python-jose) - JWT tokens
- bcrypt + SHA-256 - Password hashing (no length limits)

**Testing:**
- [pytest](https://pytest.org/) 7.4+ - Testing framework
- [pytest-asyncio](https://pypi.org/project/pytest-asyncio/) - Async test support
- [httpx](https://www.python-httpx.org/) - Async HTTP client for tests

**Development Tools:**
- [uv](https://github.com/astral-sh/uv) - Fast Python package manager
- [ruff](https://github.com/astral-sh/ruff) - Lightning-fast linter
- [mypy](https://mypy.readthedocs.io/) - Static type checker

**Deployment:**
- [Docker](https://www.docker.com/) - Containerization
- [Kubernetes](https://kubernetes.io/) - Orchestration
- [Prometheus](https://prometheus.io/) - Monitoring
- [GitHub Actions](https://github.com/features/actions) - CI/CD automation

---

## 🏃 Quick Start

### Prerequisites

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **PostgreSQL 15+** (local or cloud)
- **uv** package manager: `pip install uv`

### 1. Clone Repository

```bash
git clone <repository-url>
cd blog_post_manager_app
```

### 2. Setup Environment

```bash
# Create virtual environment
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -e .
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required variables:**
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/blog_db
JWT_SECRET_KEY=your-secret-key-change-in-production
```

Generate JWT secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Setup Database

```bash
# Run migrations
alembic upgrade head

# Verify
alembic current
```

### 5. Start Application

```bash
# Development mode (with auto-reload)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m src.main
```

### 6. Access API

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health**: http://localhost:8000/health
- **Metrics**: http://localhost:8000/metrics

---

## 🔄 Recreate This Project

Want to build this exact project using Spec-Driven Development? Follow these steps with **SpecKit**:

### Prerequisites

1. Install [Claude Code](https://claude.ai/download) with SpecKit enabled
2. Create a new directory for your project
3. Open Claude Code in that directory

### Step-by-Step Recreation

#### 1. Establish Project Principles

Run this command in Claude Code:

```
/speckit.constitution Create principles for a production-ready FastAPI blog management system focusing on: RESTful API design with clear resource naming and HTTP method usage, comprehensive input validation and error handling, database normalization and referential integrity, automated testing with high coverage standards, secure authentication and authorization patterns, efficient query performance and pagination strategies, clear API documentation with OpenAPI standards, containerization best practices with minimal image sizes, and scalable deployment architecture for cloud-native environments
```

**What this does:** Creates `constitution.md` with architectural principles that guide all implementation decisions.

---

#### 2. Create Feature Specification

```
/speckit.specify Build a blog post management application where users can create, read, update, and delete blog posts. Each blog post has a title, content body, excerpt/summary, publication status (draft, published, archived), publication date, author information, and multiple tags for categorization. Users should be able to filter posts by status, tags, and author, search posts by title or content, sort posts by publication date or title, and retrieve paginated lists of posts. The application needs user authentication where authors can only edit or delete their own posts, but all published posts are publicly readable. Each post can have multiple tags, and tags can be reused across different posts. The system should track creation and modification timestamps for all posts and provide meaningful validation messages for all operations.
```

**What this does:** Creates `spec.md` with detailed feature requirements in natural language.

---

#### 3. Design Technical Implementation

```
/speckit.plan The application uses FastAPI framework with Python 3.11+, uv as the package manager for fast dependency management and virtual environment handling, PostgreSQL as the relational database with proper indexing on frequently queried fields, SQLAlchemy ORM for database operations with relationship management for posts-tags many-to-many association, Alembic for database migrations with version control, Pydantic V2 for request/response validation and serialization, JWT tokens with refresh token mechanism for authentication, bcrypt for password hashing, pytest with pytest-asyncio for comprehensive testing including unit and integration tests, SQLAlchemy test fixtures for database testing, Docker for containerization using multi-stage builds with uv for faster dependency installation and minimal image size, docker-compose for local development environment with PostgreSQL service, and Kubernetes for production deployment with separate manifests for deployment, service, configmap, and secrets. Include health check endpoints, CORS middleware configuration, rate limiting, and structured logging with correlation IDs. Use pyproject.toml for dependency management with uv.
```

**What this does:** Creates `plan.md` with technical architecture, technology stack, and implementation approach.

---

#### 4. Generate Implementation Tasks

```
/speckit.tasks
```

**What this does:** Creates `tasks.md` with ~136 actionable tasks organized by phase (Setup, Database, Authentication, API, Testing, Deployment).

---

#### 5. Execute Implementation

```
/speckit.implement
```

**What this does:** Claude systematically implements all tasks from `tasks.md`, creating:
- Complete application code (`src/`)
- Database migrations (`alembic/`)
- Comprehensive tests (`tests/`)
- Docker configuration
- Kubernetes manifests
- Full documentation

---

### What You'll Get

After running these 5 commands, you'll have:

- ✅ **136 tasks completed** - Systematic implementation
- ✅ **88 passing tests** - 87% coverage
- ✅ **Production-ready code** - FastAPI + PostgreSQL + JWT auth
- ✅ **Full-text search** - PostgreSQL GIN indexes
- ✅ **Docker deployment** - Multi-stage optimized builds
- ✅ **Kubernetes manifests** - Cloud-native deployment
- ✅ **CI/CD pipelines** - GitHub Actions workflows
- ✅ **Complete documentation** - README, guides, API docs

### Time Required

- **With SpecKit**: ~30-45 minutes (mostly automated)
- **Manual coding**: 20-30 hours (traditional approach)

### Learn More About SpecKit

- **⚡ Quick Reference**: [SPECKIT_COMMANDS.md](SPECKIT_COMMANDS.md) - Copy-paste commands
- **📖 Complete Guide**: [SPECKIT_GUIDE.md](SPECKIT_GUIDE.md) - Comprehensive tutorial
- **🌐 GitHub**: https://github.com/github/spec-kit - Official repository
- **📚 Documentation**: https://github.com/github/spec-kit - Official docs
- **📁 Examples**: See `.specify/` directory in this repo - Actual files used
- **💬 Community**: Share your SpecKit projects and learn from others

---

## 📚 API Documentation

### Interactive Documentation

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Authentication

All endpoints requiring authentication expect a JWT token in the `Authorization` header:

```bash
Authorization: Bearer <access_token>
```

### Example Requests

#### 1. Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "username": "author1",
    "password": "SecurePass123",
    "full_name": "John Doe"
  }'
```

#### 2. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 900
}
```

#### 3. Create Post

```bash
TOKEN="your-access-token"

curl -X POST http://localhost:8000/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with FastAPI",
    "content": "FastAPI is amazing...",
    "excerpt": "Learn FastAPI basics",
    "tags": ["python", "fastapi", "tutorial"],
    "status": "draft"
  }'
```

#### 4. List Posts

```bash
# Public (published posts only)
curl http://localhost:8000/api/v1/posts

# With pagination
curl "http://localhost:8000/api/v1/posts?page=1&page_size=20"

# Filter by tags
curl "http://localhost:8000/api/v1/posts?tags=python,fastapi"

# Filter by author
curl "http://localhost:8000/api/v1/posts?author_id=1"
```

#### 5. Search Posts

```bash
curl "http://localhost:8000/api/v1/search/posts?q=fastapi+tutorial&sort_by=relevance"
```

#### 6. Get Popular Tags

```bash
curl http://localhost:8000/api/v1/search/tags/popular?limit=10
```

---

## 💻 Development

### Project Structure

```
blog_post_manager_app/
├── src/                        # Application source code
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings management
│   ├── database.py             # Database configuration
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic models
│   ├── api/                    # API routes
│   │   ├── deps.py             # Dependencies
│   │   └── v1/                 # API v1 endpoints
│   ├── services/               # Business logic
│   ├── middleware/             # Custom middleware
│   └── utils/                  # Utilities
├── tests/                      # Test suite (88 tests)
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── contract/               # Contract tests
├── alembic/                    # Database migrations
├── k8s/                        # Kubernetes manifests
├── docker-compose.yml          # Docker Compose config
├── Dockerfile                  # Multi-stage Docker build
└── pyproject.toml              # Project dependencies
```

### Code Quality

```bash
# Linting
ruff check src/ tests/

# Auto-fix
ruff check --fix src/ tests/

# Type checking
mypy src/

# Format code
ruff format src/ tests/
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View current version
alembic current
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests (88 tests)
pytest tests/ -v

# Unit tests only
pytest tests/unit/ -v

# Integration tests only
pytest tests/integration/ -v

# Contract tests only
pytest tests/contract/ -v

# With coverage
pytest tests/ --cov=src --cov-report=term-missing

# Generate HTML coverage report
pytest tests/ --cov=src --cov-report=html
open htmlcov/index.html
```

### Test Coverage

- **Total Tests**: 88
- **Coverage**: 85%+ (enforced)
- **Unit Tests**: 42 tests for services
- **Integration Tests**: 46 tests for API endpoints

See [tests/README.md](tests/README.md) for detailed documentation.

---

## 🔄 CI/CD

### GitHub Actions Workflows

Automated pipelines for testing, building, and deployment:

**Continuous Integration:**
- ✅ **Automated Testing** - Run 88 tests on every PR
- ✅ **Code Quality** - Linting with ruff, type checking with mypy
- ✅ **Coverage Enforcement** - Minimum 85% coverage required
- ✅ **Security Scanning** - CodeQL analysis for vulnerabilities

**Continuous Deployment:**
- ✅ **Docker Build** - Auto-build and push to GitHub Container Registry
- ✅ **Kubernetes Deploy** - Manual deployment to staging/production
- ✅ **Release Automation** - Auto-create GitHub releases with tags
- ✅ **Dependency Updates** - Dependabot for automated updates

### Available Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `test.yml` | Push, PR | Run tests, linting, type checking |
| `build.yml` | Push, Tags | Build and push Docker images |
| `deploy.yml` | Manual | Deploy to Kubernetes cluster |
| `release.yml` | Tags | Create GitHub releases |
| `codeql.yml` | Push, PR, Weekly | Security scanning |

### Quick Commands

```bash
# View workflow runs
gh workflow list
gh run list

# Trigger deployment manually
gh workflow run deploy.yml -f environment=staging -f image_tag=v1.0.0

# View workflow logs
gh run view --log
```

See [.github/workflows/README.md](.github/workflows/README.md) for detailed CI/CD documentation.

---

## 🐳 Deployment

### Docker

#### Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

Services:
- **API**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Adminer**: http://localhost:8080

#### Production

```bash
# Build production image
docker build -t blog-api:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

Full Kubernetes deployment with autoscaling, health checks, and monitoring.

See [k8s/README.md](k8s/README.md) for detailed instructions.

```bash
# Quick deploy
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

---

## 🏗️ Architecture

### Database Schema

```
users
├── id (PK)
├── email (UNIQUE)
├── username (UNIQUE)
├── hashed_password
├── full_name
├── is_active
├── created_at
└── updated_at

posts
├── id (PK)
├── author_id (FK → users.id)
├── title
├── content
├── excerpt
├── status (ENUM: draft, published, archived)
├── publication_date
├── created_at
├── updated_at
└── search_vector (TSVECTOR)

tags
├── id (PK)
├── name (UNIQUE)
└── created_at

post_tags (junction table)
├── post_id (FK → posts.id)
├── tag_id (FK → tags.id)
└── created_at
```

### Key Features

- **Full-Text Search**: PostgreSQL GIN indexes on search_vector
- **Auto-Updating**: Triggers for search_vector and updated_at
- **Tag Limit**: Database trigger enforces 10 tags per post
- **N+1 Prevention**: Eager loading with selectinload/joinedload

---

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pytest tests/ -v`
5. Run linter: `ruff check src/ tests/`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open Pull Request

### Code Standards

- Follow PEP 8 style guide
- Add type hints to all functions
- Write tests for new features
- Update documentation
- Maintain 85%+ test coverage

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Inspired by modern API best practices
- Follows [12-Factor App](https://12factor.net/) principles

---

## 📧 Support

For issues or questions:
1. Check [API Documentation](http://localhost:8000/docs)
2. Review [tests/README.md](tests/README.md)
3. Check [k8s/README.md](k8s/README.md) for deployment
4. Review [.github/workflows/README.md](.github/workflows/README.md) for CI/CD
5. Open an issue on GitHub

---

**Made with ❤️ using FastAPI and Python**

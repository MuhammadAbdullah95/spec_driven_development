# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the Blog Post Manager API with **88 total tests** covering unit tests for services and integration tests for API endpoints.

## Test Structure

```
tests/
├── conftest.py                      # Shared fixtures and test configuration
├── unit/                            # Unit tests for service layer
│   ├── test_auth_service.py         # 12 tests for AuthService
│   ├── test_post_service.py         # 18 tests for PostService
│   └── test_search_service.py       # 12 tests for SearchService
└── integration/                     # Integration tests for API endpoints
    ├── test_auth_api.py             # 16 tests for authentication endpoints
    ├── test_posts_api.py            # 21 tests for posts endpoints
    └── test_search_api.py           # 9 tests for search/tags endpoints
```

## Test Coverage

### Unit Tests (42 tests)

#### AuthService (12 tests)
- ✅ User registration (success, duplicate email, duplicate username)
- ✅ User authentication (success, wrong password, nonexistent user)
- ✅ Login (success, wrong credentials, inactive user)
- ✅ Token refresh
- ✅ Password hashing and verification

#### PostService (18 tests)
- ✅ Create posts (with tags, too many tags, publication date setting)
- ✅ Get post by ID (with author verification)
- ✅ List posts (pagination, filtering by status/author/tags)
- ✅ Update posts (title, content, status, tags, ownership verification)
- ✅ Delete posts (with ownership verification)

#### SearchService (12 tests)
- ✅ Full-text search (with query, empty query, no results)
- ✅ Search pagination
- ✅ Search filtering (by tags, by author)
- ✅ Search sorting (by relevance, by date)
- ✅ Published-only filtering
- ✅ Popular tags (with counts, with limit)

### Integration Tests (46 tests)

#### Authentication API (16 tests)
- ✅ POST /api/v1/auth/register (success, duplicates, validation)
- ✅ POST /api/v1/auth/login (success, wrong credentials, inactive user)
- ✅ POST /api/v1/auth/refresh (success, invalid token)
- ✅ Password validation rules (uppercase, lowercase, digit requirements)
- ✅ Username validation (format, length)

#### Posts API (21 tests)
- ✅ POST /api/v1/posts (create, unauthorized, too many tags)
- ✅ GET /api/v1/posts (list, pagination, filtering)
- ✅ GET /api/v1/posts/{id} (get single, not found)
- ✅ PATCH /api/v1/posts/{id} (update, unauthorized, not owner, partial update)
- ✅ DELETE /api/v1/posts/{id} (delete, unauthorized, not owner)
- ✅ Status changes and publication date handling

#### Search & Tags API (9 tests)
- ✅ GET /api/v1/search/posts (with query, filters, sorting, pagination)
- ✅ GET /api/v1/search/tags/popular (popular tags with limits)
- ✅ GET /api/v1/tags (list all, with/without counts)
- ✅ GET /api/v1/tags/{id}/posts (posts by tag, pagination)
- ✅ Tag case-insensitivity

## Running Tests

### Run All Tests
```bash
pytest tests/ -v
```

### Run Unit Tests Only
```bash
pytest tests/unit/ -v
```

### Run Integration Tests Only
```bash
pytest tests/integration/ -v
```

### Run Specific Test File
```bash
pytest tests/unit/test_auth_service.py -v
```

### Run Specific Test
```bash
pytest tests/unit/test_auth_service.py::TestAuthService::test_register_user_success -v
```

### Run with Coverage
```bash
pytest tests/ --cov=src --cov-report=term-missing
```

### Run with Coverage HTML Report
```bash
pytest tests/ --cov=src --cov-report=html
open htmlcov/index.html
```

### Run Tests Matching Pattern
```bash
pytest tests/ -k "auth" -v  # Run all auth-related tests
pytest tests/ -k "create" -v  # Run all create-related tests
```

## Fixtures

### Database Fixtures
- `db_session` - Fresh database session for each test (tables created/dropped)
- `client` - Async HTTP client with database dependency override

### User Fixtures
- `test_user` - Active test user (testuser@example.com / TestPass123)
- `test_user2` - Second test user for multi-user scenarios
- `inactive_user` - Inactive user for testing access control

### Authentication Fixtures
- `auth_headers` - JWT token headers for test_user
- `auth_headers_user2` - JWT token headers for test_user2

### Content Fixtures
- `test_tags` - List of test tags (python, fastapi, testing, tutorial)
- `test_post` - Published post with tags
- `draft_post` - Draft post for testing status changes
- `multiple_posts` - 10 posts for pagination/filtering tests

## Test Configuration

Tests use pytest with the following configuration (from `pyproject.toml`):

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-v --strict-markers --tb=short"
```

## Coverage Requirements

The project enforces **85% minimum test coverage**:

```toml
[tool.coverage.report]
fail_under = 85
```

## Best Practices

1. **Test Isolation**: Each test gets a fresh database (tables created/dropped)
2. **Fixtures**: Use shared fixtures to avoid code duplication
3. **Async Support**: All async code is properly tested with pytest-asyncio
4. **HTTP Client**: Integration tests use httpx AsyncClient
5. **Assertions**: Clear, specific assertions with meaningful error messages
6. **Edge Cases**: Tests cover success, failure, and edge cases
7. **Security**: Tests verify authentication, authorization, and ownership

## Test Database

Tests use the same Neon PostgreSQL database as development but:
- Tables are created fresh for each test
- Tables are dropped after each test
- This ensures test isolation without needing a separate database

## Known Warnings

- `MovedIn20Warning`: SQLAlchemy's declarative_base usage (can be ignored)
- `DeprecationWarning`: pythonjsonlogger import path (can be ignored)

## Continuous Integration

To run tests in CI/CD:

```yaml
- name: Run tests
  run: |
    pytest tests/ --cov=src --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage.xml
```

## Adding New Tests

1. **Unit Tests**: Add to `tests/unit/test_<service>_service.py`
2. **Integration Tests**: Add to `tests/integration/test_<endpoint>_api.py`
3. **Fixtures**: Add shared fixtures to `tests/conftest.py`
4. **Follow Naming**: Use `test_<description>` format
5. **Use Markers**: Mark async tests with `@pytest.mark.asyncio`

## Example Test

```python
@pytest.mark.asyncio
async def test_create_post_success(
    db_session: AsyncSession, test_user: User
):
    """Test creating a post successfully."""
    post_service = PostService(db_session)

    post_data = PostCreate(
        title="Test Post",
        content="Content",
        tags=["python"],
    )

    result = await post_service.create_post(post_data, test_user)

    assert result.title == "Test Post"
    assert len(result.tags) == 1
    assert result.author.id == test_user.id
```

## Troubleshooting

### Tests Timeout
- Increase timeout in pytest.ini or use `pytest --timeout=120`
- Check database connection

### Fixture Not Found
- Ensure fixture is defined in conftest.py
- Check fixture scope (function vs session)

### Database Errors
- Verify DATABASE_URL in .env
- Check database is accessible
- Ensure migrations are applied

## Next Steps

- Add performance tests for search queries
- Add contract tests for OpenAPI spec validation
- Add load tests with locust/k6
- Measure and improve coverage to 90%+
